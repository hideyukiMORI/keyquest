import type { TextInput } from "./cli/text-input.js";
import type { TextOutput } from "./cli/text-output.js";
import { createTranslator, localeDisplayName } from "./i18n/messages.js";
import {
  getDefaultLessonPathForDay,
  loadLessonFromFile,
  selectPracticePrompts,
} from "./lessons/loader.js";
import type { Lesson } from "./lessons/schema.js";
import {
  createMenuTranslator,
  parseLocaleChoice,
  parseTitleMenuAction,
  renderLanguageOptions,
  renderTitleMenu,
} from "./menu/title-menu.js";
import { completePracticeRun, type PracticeAttempt } from "./practice/session.js";
import { createNewSave, updateLocale, type KeyQuestSave, type SaveMode } from "./save/model.js";
import { createSaveStore } from "./save/store.js";
import { formatSceneSequence, renderSceneSequence } from "./scenes/manager.js";
import {
  defaultScenes,
  practiceIntroScene,
  renderPracticeAchievements,
  renderPracticeJourneyProgress,
  renderPracticeRunResult,
  renderPracticeRewards,
  renderPracticeSegmentResult,
  renderPracticeTitleRewards,
} from "./scenes/scenes.js";
import type { SceneContext } from "./scenes/types.js";
import { styleText } from "./terminal/ansi.js";
import type { TerminalRuntime } from "./terminal/runtime.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly textInput: TextInput;
  readonly textOutput: TextOutput;
  readonly lesson: Lesson | undefined;
  readonly lessonPath: string | undefined;
  readonly terminalRuntime?: TerminalRuntime;
  readonly now?: Date;
  readonly completedAt?: Date;
};

const DAILY_SESSION_PROMPT_COUNT = 3;

export async function runApp(options: RunAppOptions): Promise<void> {
  const now = options.now ?? new Date();
  const saveStore = createSaveStore({
    mode: options.mode,
    ...(options.saveDirectory === undefined ? {} : { directory: options.saveDirectory }),
  });
  const save = await saveStore.loadOrCreate(now);
  const initialTranslator = createTranslator(save.settings.locale);
  const terminalWarnings = renderTerminalWarnings(options.terminalRuntime, initialTranslator);
  if (terminalWarnings.length > 0) {
    options.textOutput.writeLine(terminalWarnings.join("\n"));
    options.textOutput.writeLine("");
  }

  const menuSave = await runTitleMenu({
    save,
    mode: options.mode,
    now,
    textInput: options.textInput,
    textOutput: options.textOutput,
    writeSave: saveStore.write,
  });
  const defaultLessonPath = getDefaultLessonPathForDay(menuSave.journey.day);
  const lesson =
    options.lesson ?? (await loadLessonFromFile(options.lessonPath ?? defaultLessonPath));
  const practicePrompts = selectPracticePrompts(
    lesson,
    lesson.sessionPromptCount ?? DAILY_SESSION_PROMPT_COUNT,
  );
  const translator = createTranslator(menuSave.settings.locale);
  const attempts: PracticeAttempt[] = [];
  let promptStartedAt = now;

  for (const [index, practicePrompt] of practicePrompts.entries()) {
    const context: SceneContext = {
      save: menuSave,
      mode: options.mode,
      now,
      translator,
      terminalRuntime: options.terminalRuntime,
      lesson,
      practicePrompt,
    };
    const outputs = renderSceneSequence({
      scenes: index === 0 ? defaultScenes : [practiceIntroScene],
      startAt: index === 0 ? "story" : "practiceIntro",
      context,
    });
    const introOutput = formatSceneSequence(outputs);
    options.textOutput.writeLine(introOutput);
    options.textOutput.writeLine("");
    const actual = await options.textInput.readLine("> ");
    const completedAt = options.completedAt ?? new Date();
    const attempt = {
      prompt: practicePrompt,
      actual,
      startedAt: promptStartedAt,
      completedAt,
    };
    const segmentResult = completePracticeRun({
      save: menuSave,
      mode: options.mode,
      attempts: [attempt],
    }).attempts[0];
    if (segmentResult === undefined) {
      throw new Error("Practice segment did not produce a result");
    }

    attempts.push(attempt);
    promptStartedAt = completedAt;
    options.textOutput.writeLine("");
    options.textOutput.writeLine(
      renderPracticeSegmentResult(
        {
          ...segmentResult,
          mode: options.mode,
          current: index + 1,
          total: practicePrompts.length,
        },
        translator,
      ).join("\n"),
    );
    options.textOutput.writeLine("");
  }

  const result = completePracticeRun({
    save: menuSave,
    mode: options.mode,
    attempts,
  });

  await saveStore.write(result.updatedSave);

  options.textOutput.writeLine(
    renderPracticeRunResult(
      {
        promptCount: result.attempts.length,
        score: result.score,
        xpGained: result.xpGained,
        mode: options.mode,
      },
      translator,
    ).join("\n"),
  );
  options.textOutput.writeLine("");
  options.textOutput.writeLine(
    renderPracticeRewards(
      {
        beforeSave: menuSave,
        afterSave: result.updatedSave,
      },
      translator,
    ).join("\n"),
  );
  const achievementLines = renderPracticeAchievements(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (achievementLines.length > 0) {
    options.textOutput.writeLine("");
    options.textOutput.writeLine(achievementLines.join("\n"));
  }
  const titleRewardLines = renderPracticeTitleRewards(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (titleRewardLines.length > 0) {
    options.textOutput.writeLine("");
    options.textOutput.writeLine(titleRewardLines.join("\n"));
  }
  const journeyProgressLines = renderPracticeJourneyProgress(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (journeyProgressLines.length > 0) {
    options.textOutput.writeLine("");
    options.textOutput.writeLine(journeyProgressLines.join("\n"));
  }
}

async function runTitleMenu(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly now: Date;
  readonly textInput: TextInput;
  readonly textOutput: TextOutput;
  readonly writeSave: (save: KeyQuestSave) => Promise<void>;
}): Promise<KeyQuestSave> {
  let save = options.save;

  for (;;) {
    const translator = createMenuTranslator(save);
    options.textOutput.writeLine(renderTitleMenu(save, translator).join("\n"));
    if (options.mode === "development") {
      options.textOutput.writeLine(translator.t("dev.banner"));
    }

    const action = parseTitleMenuAction(
      await options.textInput.readLine(translator.t("title.menu.prompt")),
    );
    if (action === "start") {
      options.textOutput.writeLine("");
      return save;
    }

    if (action === "newGame") {
      const newSave = createNewSave(options.now, options.mode);
      await options.writeSave(newSave);
      options.textOutput.writeLine("");
      return newSave;
    }

    if (action === "loadGame") {
      options.textOutput.writeLine(translator.t("title.menu.loadUnavailable"));
      options.textOutput.writeLine("");
      continue;
    }

    const selectedLocale = await runLanguageOptions({
      save,
      textInput: options.textInput,
      textOutput: options.textOutput,
    });
    save = updateLocale(save, selectedLocale, options.now);
    await options.writeSave(save);
  }
}

async function runLanguageOptions(options: {
  readonly save: KeyQuestSave;
  readonly textInput: TextInput;
  readonly textOutput: TextOutput;
}): Promise<KeyQuestSave["settings"]["locale"]> {
  const translator = createMenuTranslator(options.save);
  options.textOutput.writeLine("");
  options.textOutput.writeLine(
    renderLanguageOptions(options.save.settings.locale, translator).join("\n"),
  );
  const selectedLocale = parseLocaleChoice(
    await options.textInput.readLine(translator.t("options.prompt")),
    options.save.settings.locale,
  );
  const nextTranslator = createTranslator(selectedLocale);
  options.textOutput.writeLine(
    nextTranslator.t("options.saved", { language: localeDisplayName(selectedLocale) }),
  );
  options.textOutput.writeLine("");

  return selectedLocale;
}

function renderTerminalWarnings(
  terminalRuntime: TerminalRuntime | undefined,
  translator: ReturnType<typeof createTranslator>,
): readonly string[] {
  if (terminalRuntime?.size.isBelowMinimum !== true) {
    return [];
  }

  return [
    styleText(
      translator.t("terminal.sizeWarning", {
        columns: terminalRuntime.size.columns ?? "?",
        rows: terminalRuntime.size.rows ?? "?",
      }),
      "warning",
      terminalRuntime,
    ),
  ];
}
