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
  type TitleMenuAction,
  parseLocaleChoice,
  parseTitleMenuAction,
  renderLanguageOptions,
  renderTitleMenu,
} from "./menu/title-menu.js";
import {
  completePracticeRun,
  type PracticeAttempt,
  type PracticePrompt,
} from "./practice/session.js";
import { createWeakKeyReviewQuest } from "./quest/review-quest.js";
import { createNewSave, updateLocale, type KeyQuestSave, type SaveMode } from "./save/model.js";
import { createSaveStore } from "./save/store.js";
import { formatSceneSequence, renderSceneSequence } from "./scenes/manager.js";
import {
  defaultScenes,
  practiceIntroScene,
  renderPracticeAchievements,
  renderPracticeEndingProgress,
  renderPracticeJourneyProgress,
  renderPracticeReviewResult,
  renderPracticeRunResult,
  renderPracticeRewards,
  renderPracticeSegmentResult,
  renderPracticeStreakProgress,
  renderPracticeTitleRewards,
} from "./scenes/scenes.js";
import type { SceneContext } from "./scenes/types.js";
import { styleText } from "./terminal/ansi.js";
import type { TerminalRuntime } from "./terminal/runtime.js";
import { createScreenRenderer, type ScreenRenderer } from "./terminal/screen.js";
import type { RealtimeTypingInput } from "./realtime/input.js";
import { isRawModeUnavailableError } from "./realtime/raw-mode.js";
import { runRealtimeTypingPrompt } from "./realtime/typing-screen.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly textInput: TextInput;
  readonly textOutput: TextOutput;
  readonly lesson: Lesson | undefined;
  readonly lessonPath: string | undefined;
  readonly terminalRuntime?: TerminalRuntime;
  readonly realtimeInput?: RealtimeTypingInput;
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
  const screen = createScreenRenderer({
    textOutput: options.textOutput,
    runtime: options.terminalRuntime,
  });
  const initialTranslator = createTranslator(save.settings.locale);
  const terminalWarnings = renderTerminalWarnings(options.terminalRuntime, initialTranslator);
  if (terminalWarnings.length > 0) {
    options.textOutput.writeLine(terminalWarnings.join("\n"));
    options.textOutput.writeLine("");
  }

  const menuSelection = await runTitleMenu({
    save,
    mode: options.mode,
    now,
    textInput: options.textInput,
    screen,
    writeSave: saveStore.write,
  });
  const menuSave = menuSelection.save;
  const reviewQuest =
    menuSelection.action === "review" ? createWeakKeyReviewQuest({ save: menuSave }) : undefined;
  const defaultLessonPath = getDefaultLessonPathForDay(menuSave.journey.day);
  const lesson =
    reviewQuest === undefined
      ? (options.lesson ?? (await loadLessonFromFile(options.lessonPath ?? defaultLessonPath)))
      : createReviewLesson(menuSave.journey.day, reviewQuest.title, reviewQuest.prompt);
  const practicePrompts =
    reviewQuest === undefined
      ? selectPracticePrompts(lesson, lesson.sessionPromptCount ?? DAILY_SESSION_PROMPT_COUNT)
      : [reviewQuest.prompt];
  const advancesJourney = reviewQuest?.advancesJourney ?? true;
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
    screen.render(introOutput);
    const actual = await readPracticeInput({
      practicePrompt,
      textInput: options.textInput,
      realtimeInput: options.realtimeInput,
      screen,
      translator,
      terminalRuntime: options.terminalRuntime,
    });
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
      advancesJourney: false,
    }).attempts[0];
    if (segmentResult === undefined) {
      throw new Error("Practice segment did not produce a result");
    }

    attempts.push(attempt);
    promptStartedAt = completedAt;
    screen.render(
      renderPracticeSegmentResult(
        {
          ...segmentResult,
          mode: options.mode,
          current: index + 1,
          total: practicePrompts.length,
        },
        translator,
      ),
    );
  }

  const result = completePracticeRun({
    save: menuSave,
    mode: options.mode,
    attempts,
    advancesJourney,
  });

  await saveStore.write(result.updatedSave);

  const finalScreenSections = [
    renderPracticeRunResult(
      {
        promptCount: result.attempts.length,
        score: result.score,
        xpGained: result.xpGained,
        mode: options.mode,
      },
      translator,
    ),
    ...(reviewQuest === undefined
      ? []
      : [
          renderPracticeReviewResult(
            {
              targetKeys: reviewQuest.targetKeys,
            },
            translator,
          ),
        ]),
    renderPracticeRewards(
      {
        beforeSave: menuSave,
        afterSave: result.updatedSave,
      },
      translator,
    ),
  ];
  const streakProgressLines = renderPracticeStreakProgress(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (streakProgressLines.length > 0) {
    finalScreenSections.push(streakProgressLines);
  }
  const achievementLines = renderPracticeAchievements(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (achievementLines.length > 0) {
    finalScreenSections.push(achievementLines);
  }
  const titleRewardLines = renderPracticeTitleRewards(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (titleRewardLines.length > 0) {
    finalScreenSections.push(titleRewardLines);
  }
  const journeyProgressLines = renderPracticeJourneyProgress(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (journeyProgressLines.length > 0) {
    finalScreenSections.push(journeyProgressLines);
  }
  const endingProgressLines = renderPracticeEndingProgress(
    {
      beforeSave: menuSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (endingProgressLines.length > 0) {
    finalScreenSections.push(endingProgressLines);
  }
  screen.render(joinScreenSections(finalScreenSections));
}

async function readPracticeInput(options: {
  readonly practicePrompt: PracticePrompt;
  readonly textInput: TextInput;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly screen: ScreenRenderer;
  readonly translator: ReturnType<typeof createTranslator>;
  readonly terminalRuntime: TerminalRuntime | undefined;
}): Promise<string> {
  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      return await runRealtimeTypingPrompt({
        prompt: options.practicePrompt,
        input: options.realtimeInput,
        screen: options.screen,
        translator: options.translator,
      });
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  return options.textInput.readLine("> ");
}

async function runTitleMenu(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly now: Date;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly writeSave: (save: KeyQuestSave) => Promise<void>;
}): Promise<{
  readonly save: KeyQuestSave;
  readonly action: Extract<TitleMenuAction, "start" | "review">;
}> {
  let save = options.save;
  let notice: string | undefined;

  for (;;) {
    const translator = createMenuTranslator(save);
    const titleLines = [
      ...renderTitleMenu(save, translator),
      ...(options.mode === "development" ? [translator.t("dev.banner")] : []),
      ...(notice === undefined ? [] : ["", notice]),
    ];
    notice = undefined;
    options.screen.render(titleLines);

    const action = parseTitleMenuAction(
      await options.textInput.readLine(translator.t("title.menu.prompt")),
    );
    if (action === "start") {
      return { save, action };
    }

    if (action === "review") {
      if (createWeakKeyReviewQuest({ save }) === undefined) {
        notice = translator.t("review.noMistakes");
        continue;
      }

      return { save, action };
    }

    if (action === "newGame") {
      const newSave = createNewSave(options.now, options.mode);
      await options.writeSave(newSave);
      return { save: newSave, action: "start" };
    }

    if (action === "loadGame") {
      notice = translator.t("title.menu.loadUnavailable");
      continue;
    }

    const selectedLocale = await runLanguageOptions({
      save,
      textInput: options.textInput,
      screen: options.screen,
    });
    save = updateLocale(save, selectedLocale, options.now);
    await options.writeSave(save);
  }
}

function createReviewLesson(day: number, title: string, practicePrompt: PracticePrompt): Lesson {
  return {
    schemaVersion: 1,
    id: "weak-key-review",
    title,
    day,
    locale: "en",
    focus: ["weak-key review", "accuracy"],
    prompts: [
      {
        id: practicePrompt.id,
        text: practicePrompt.text,
        targetKeys: practicePrompt.targetKeys,
        skillIds: practicePrompt.skillIds,
        fingerHints: practicePrompt.fingerHints,
      },
    ],
  };
}

function joinScreenSections(sections: readonly (readonly string[])[]): readonly string[] {
  return sections.flatMap((section, index) => (index === 0 ? section : ["", ...section]));
}

async function runLanguageOptions(options: {
  readonly save: KeyQuestSave;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
}): Promise<KeyQuestSave["settings"]["locale"]> {
  const translator = createMenuTranslator(options.save);
  options.screen.render(renderLanguageOptions(options.save.settings.locale, translator));
  const selectedLocale = parseLocaleChoice(
    await options.textInput.readLine(translator.t("options.prompt")),
    options.save.settings.locale,
  );
  const nextTranslator = createTranslator(selectedLocale);
  options.screen.render([
    nextTranslator.t("options.saved", { language: localeDisplayName(selectedLocale) }),
  ]);

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
