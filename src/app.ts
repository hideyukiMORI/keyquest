import type { TextInput } from "./cli/text-input.js";
import type { TextOutput } from "./cli/text-output.js";
import { createTranslator, localeDisplayName } from "./i18n/messages.js";
import {
  getDefaultLessonPathForDay,
  loadLessonFromFile,
  selectPracticePrompts,
} from "./lessons/loader.js";
import { getLessonPackLessonPath, loadLessonPackManifest } from "./lessons/pack.js";
import type { Lesson } from "./lessons/schema.js";
import {
  createMenuTranslator,
  getLanguageMenuItems,
  getTitleMenuItems,
  type LanguageMenuAction,
  type TitleMenuAction,
  parseLocaleChoice,
  parseTitleMenuAction,
  renderAchievementRecords,
  renderInGameHelp,
  renderJourneyProgress,
  renderLanguageOptions,
  renderResourceRecords,
  renderTitleRecords,
  renderTitleMenu,
} from "./menu/title-menu.js";
import { confirmWithScreenKeys, waitForScreenKey } from "./menu/key-screen.js";
import { runInteractiveMenu } from "./menu/interactive-menu.js";
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
import { renderFixedScreenLayout } from "./terminal/layout.js";
import type { TerminalRuntime } from "./terminal/runtime.js";
import { createScreenRenderer, type ScreenRenderer } from "./terminal/screen.js";
import type { RealtimeTypingInput } from "./realtime/input.js";
import { isRawModeUnavailableError } from "./realtime/raw-mode.js";
import {
  isPracticeOptionsRequestedError,
  runRealtimeTypingPrompt,
} from "./realtime/typing-screen.js";

export type RunAppOptions = {
  readonly mode: SaveMode;
  readonly saveDirectory: string | undefined;
  readonly textInput: TextInput;
  readonly textOutput: TextOutput;
  readonly lesson: Lesson | undefined;
  readonly lessonPath: string | undefined;
  readonly lessonPackPath?: string;
  readonly terminalRuntime?: TerminalRuntime;
  readonly realtimeInput?: RealtimeTypingInput;
  readonly now?: Date;
  readonly completedAt?: Date;
};

const DAILY_SESSION_PROMPT_COUNT = 3;

type PracticeInputResult =
  | {
      readonly kind: "attempt";
      readonly actual: string;
    }
  | {
      readonly kind: "options";
    };

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
    terminalRuntime: options.terminalRuntime,
    realtimeInput: options.realtimeInput,
  });
  let activeSave = menuSelection.save;
  const reviewQuest =
    menuSelection.action === "review" ? createWeakKeyReviewQuest({ save: activeSave }) : undefined;
  const resolvedLessonPath = await resolveLessonPath({
    day: activeSave.journey.day,
    lessonPath: options.lessonPath,
    lessonPackPath: options.lessonPackPath,
  });
  const lesson =
    reviewQuest === undefined
      ? (options.lesson ?? (await loadLessonFromFile(resolvedLessonPath)))
      : createReviewLesson(activeSave.journey.day, reviewQuest.title, reviewQuest.prompt);
  const practicePrompts =
    reviewQuest === undefined
      ? selectPracticePrompts(lesson, lesson.sessionPromptCount ?? DAILY_SESSION_PROMPT_COUNT)
      : [reviewQuest.prompt];
  const advancesJourney = reviewQuest?.advancesJourney ?? true;
  let translator = createTranslator(activeSave.settings.locale);
  const attempts: PracticeAttempt[] = [];
  let promptStartedAt = now;

  for (let index = 0; index < practicePrompts.length; ) {
    const practicePrompt = practicePrompts[index];
    if (practicePrompt === undefined) {
      throw new Error(`Practice prompt ${index} is unavailable`);
    }
    const context: SceneContext = {
      save: activeSave,
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
    const inputResult = await readPracticeInput({
      practicePrompt,
      textInput: options.textInput,
      realtimeInput: options.realtimeInput,
      screen,
      translator,
      terminalRuntime: options.terminalRuntime,
    });
    if (inputResult.kind === "options") {
      const selectedLocale = await runLanguageOptions({
        save: activeSave,
        textInput: options.textInput,
        screen,
        terminalRuntime: options.terminalRuntime,
        realtimeInput: options.realtimeInput,
      });
      activeSave = updateLocale(activeSave, selectedLocale, now);
      await saveStore.write(activeSave);
      translator = createTranslator(activeSave.settings.locale);
      continue;
    }

    const completedAt = options.completedAt ?? new Date();
    const attempt = {
      prompt: practicePrompt,
      actual: inputResult.actual,
      startedAt: promptStartedAt,
      completedAt,
    };
    const segmentResult = completePracticeRun({
      save: activeSave,
      mode: options.mode,
      attempts: [attempt],
      advancesJourney: false,
    }).attempts[0];
    if (segmentResult === undefined) {
      throw new Error("Practice segment did not produce a result");
    }

    attempts.push(attempt);
    promptStartedAt = completedAt;
    await renderSegmentResultScreen({
      result: {
        ...segmentResult,
        mode: options.mode,
        current: index + 1,
        total: practicePrompts.length,
      },
      translator,
      screen,
      realtimeInput: options.realtimeInput,
      terminalRuntime: options.terminalRuntime,
    });
    index += 1;
  }

  const result = completePracticeRun({
    save: activeSave,
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
      options.terminalRuntime,
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
        beforeSave: activeSave,
        afterSave: result.updatedSave,
      },
      translator,
    ),
  ];
  const streakProgressLines = renderPracticeStreakProgress(
    {
      beforeSave: activeSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (streakProgressLines.length > 0) {
    finalScreenSections.push(streakProgressLines);
  }
  const achievementLines = renderPracticeAchievements(
    {
      beforeSave: activeSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (achievementLines.length > 0) {
    finalScreenSections.push(achievementLines);
  }
  const titleRewardLines = renderPracticeTitleRewards(
    {
      beforeSave: activeSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (titleRewardLines.length > 0) {
    finalScreenSections.push(titleRewardLines);
  }
  const journeyProgressLines = renderPracticeJourneyProgress(
    {
      beforeSave: activeSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (journeyProgressLines.length > 0) {
    finalScreenSections.push(journeyProgressLines);
  }
  const endingProgressLines = renderPracticeEndingProgress(
    {
      beforeSave: activeSave,
      afterSave: result.updatedSave,
    },
    translator,
  );
  if (endingProgressLines.length > 0) {
    finalScreenSections.push(endingProgressLines);
  }
  await renderFinalResultScreen({
    lines: joinScreenSections(finalScreenSections),
    screen,
    realtimeInput: options.realtimeInput,
    terminalRuntime: options.terminalRuntime,
  });
}

async function readPracticeInput(options: {
  readonly practicePrompt: PracticePrompt;
  readonly textInput: TextInput;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly screen: ScreenRenderer;
  readonly translator: ReturnType<typeof createTranslator>;
  readonly terminalRuntime: TerminalRuntime | undefined;
}): Promise<PracticeInputResult> {
  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      return {
        kind: "attempt",
        actual: await runRealtimeTypingPrompt({
          prompt: options.practicePrompt,
          input: options.realtimeInput,
          screen: options.screen,
          translator: options.translator,
          runtime: options.terminalRuntime,
        }),
      };
    } catch (error) {
      if (isPracticeOptionsRequestedError(error)) {
        return { kind: "options" };
      }
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  const actual = await options.textInput.readLine("> ");
  if (actual.trim().toLowerCase() === "options" || actual.trim().toLowerCase() === ":options") {
    return { kind: "options" };
  }

  return {
    kind: "attempt",
    actual,
  };
}

async function renderSegmentResultScreen(options: {
  readonly result: Parameters<typeof renderPracticeSegmentResult>[0];
  readonly translator: ReturnType<typeof createTranslator>;
  readonly screen: ScreenRenderer;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly terminalRuntime: TerminalRuntime | undefined;
}): Promise<void> {
  const render = (): readonly string[] =>
    renderPracticeSegmentResult(options.result, options.translator, options.terminalRuntime);

  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      const result = await waitForScreenKey({
        input: options.realtimeInput,
        screen: options.screen,
        render,
      });
      if (result === "quit") {
        throw new Error("Practice segment cancelled");
      }
      return;
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  options.screen.render(render());
}

async function renderFinalResultScreen(options: {
  readonly lines: readonly string[];
  readonly screen: ScreenRenderer;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly terminalRuntime: TerminalRuntime | undefined;
}): Promise<void> {
  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      const result = await waitForScreenKey({
        input: options.realtimeInput,
        screen: options.screen,
        render: () => options.lines,
      });
      if (result === "quit") {
        throw new Error("Practice result cancelled");
      }
      return;
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  options.screen.render(options.lines);
}

async function readTitleMenuAction(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly notice: string | undefined;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly translator: ReturnType<typeof createTranslator>;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly realtimeInput: RealtimeTypingInput | undefined;
}): Promise<TitleMenuAction> {
  const items = getTitleMenuItems(options.save, options.translator);
  const renderMenu = (selectedIndex: number | undefined): readonly string[] => {
    return renderTitleMenu(options.save, options.translator, {
      runtime: options.terminalRuntime,
      selectedIndex,
      mode: options.mode,
      notice: options.notice,
    });
  };

  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      return await runInteractiveMenu({
        input: options.realtimeInput,
        screen: options.screen,
        items,
        render: renderMenu,
      });
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  options.screen.render(renderMenu(undefined));
  return parseTitleMenuAction(
    await options.textInput.readLine(options.translator.t("title.menu.prompt")),
  );
}

async function readLanguageMenuAction(options: {
  readonly save: KeyQuestSave;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly realtimeInput: RealtimeTypingInput | undefined;
}): Promise<LanguageMenuAction> {
  const translator = createMenuTranslator(options.save);
  const items = getLanguageMenuItems(translator);
  const selectedLocaleIndex = items.findIndex(
    (item) => item.value === options.save.settings.locale,
  );
  const renderMenu = (selectedIndex: number | undefined): readonly string[] => {
    return renderLanguageOptions(
      options.save.settings.locale,
      translator,
      options.terminalRuntime,
      selectedIndex,
    );
  };

  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      return await runInteractiveMenu({
        input: options.realtimeInput,
        screen: options.screen,
        items,
        initialIndex: selectedLocaleIndex < 0 ? 0 : selectedLocaleIndex,
        render: renderMenu,
      });
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  options.screen.render(renderMenu(undefined));
  return parseLocaleChoice(
    await options.textInput.readLine(translator.t("options.prompt")),
    options.save.settings.locale,
  );
}

async function waitForReturnScreen(options: {
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly render: () => readonly string[];
  readonly fallbackPrompt: string;
}): Promise<void> {
  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      const result = await waitForScreenKey({
        input: options.realtimeInput,
        screen: options.screen,
        render: options.render,
      });
      if (result === "quit") {
        throw new Error("Screen cancelled");
      }
      return;
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  options.screen.render(options.render());
  await options.textInput.readLine(options.fallbackPrompt);
}

async function runTitleMenu(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly now: Date;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly writeSave: (save: KeyQuestSave) => Promise<void>;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly realtimeInput: RealtimeTypingInput | undefined;
}): Promise<{
  readonly save: KeyQuestSave;
  readonly action: Extract<TitleMenuAction, "start" | "review">;
}> {
  let save = options.save;
  let notice: string | undefined;

  for (;;) {
    const translator = createMenuTranslator(save);
    const action = await readTitleMenuAction({
      save,
      mode: options.mode,
      notice,
      textInput: options.textInput,
      screen: options.screen,
      translator,
      terminalRuntime: options.terminalRuntime,
      realtimeInput: options.realtimeInput,
    });
    notice = undefined;
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
      if (save.progress.sessions.length > 0) {
        const confirmed = await confirmNewGameReplacement({
          save,
          translator,
          textInput: options.textInput,
          screen: options.screen,
          realtimeInput: options.realtimeInput,
          terminalRuntime: options.terminalRuntime,
        });
        if (!confirmed) {
          notice = translator.t("title.menu.newGameCancelled");
          continue;
        }
      }

      const newSave = {
        ...createNewSave(options.now, options.mode),
        settings: save.settings,
      };
      await options.writeSave(newSave);
      return { save: newSave, action: "start" };
    }

    if (action === "loadGame") {
      if (save.progress.sessions.length === 0) {
        notice = translator.t("title.menu.loadUnavailable");
        continue;
      }

      return { save, action: "start" };
    }

    if (action === "help") {
      await waitForReturnScreen({
        textInput: options.textInput,
        screen: options.screen,
        realtimeInput: options.realtimeInput,
        terminalRuntime: options.terminalRuntime,
        render: () => renderInGameHelp(translator, options.terminalRuntime),
        fallbackPrompt: translator.t("help.prompt"),
      });
      continue;
    }

    if (action === "journey") {
      await waitForReturnScreen({
        textInput: options.textInput,
        screen: options.screen,
        realtimeInput: options.realtimeInput,
        terminalRuntime: options.terminalRuntime,
        render: () => renderJourneyProgress(save, translator, options.terminalRuntime),
        fallbackPrompt: translator.t("journeyProgress.prompt"),
      });
      continue;
    }

    if (action === "resources") {
      await waitForReturnScreen({
        textInput: options.textInput,
        screen: options.screen,
        realtimeInput: options.realtimeInput,
        terminalRuntime: options.terminalRuntime,
        render: () => renderResourceRecords(save, translator, options.terminalRuntime),
        fallbackPrompt: translator.t("records.prompt"),
      });
      continue;
    }

    if (action === "achievements") {
      await waitForReturnScreen({
        textInput: options.textInput,
        screen: options.screen,
        realtimeInput: options.realtimeInput,
        terminalRuntime: options.terminalRuntime,
        render: () => renderAchievementRecords(save, translator, options.terminalRuntime),
        fallbackPrompt: translator.t("records.prompt"),
      });
      continue;
    }

    if (action === "titles") {
      await waitForReturnScreen({
        textInput: options.textInput,
        screen: options.screen,
        realtimeInput: options.realtimeInput,
        terminalRuntime: options.terminalRuntime,
        render: () => renderTitleRecords(save, translator, options.terminalRuntime),
        fallbackPrompt: translator.t("records.prompt"),
      });
      continue;
    }

    const selectedLocale = await runLanguageOptions({
      save,
      textInput: options.textInput,
      screen: options.screen,
      terminalRuntime: options.terminalRuntime,
      realtimeInput: options.realtimeInput,
    });
    save = updateLocale(save, selectedLocale, options.now);
    await options.writeSave(save);
  }
}

async function runLanguageOptions(options: {
  readonly save: KeyQuestSave;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly realtimeInput: RealtimeTypingInput | undefined;
}): Promise<KeyQuestSave["settings"]["locale"]> {
  const selectedAction = await readLanguageMenuAction(options);
  const selectedLocale = selectedAction === "back" ? options.save.settings.locale : selectedAction;
  const nextTranslator = createTranslator(selectedLocale);
  options.screen.render([
    nextTranslator.t("options.saved", { language: localeDisplayName(selectedLocale) }),
  ]);

  return selectedLocale;
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

async function confirmNewGameReplacement(options: {
  readonly save: KeyQuestSave;
  readonly translator: ReturnType<typeof createTranslator>;
  readonly textInput: TextInput;
  readonly screen: ScreenRenderer;
  readonly realtimeInput: RealtimeTypingInput | undefined;
  readonly terminalRuntime: TerminalRuntime | undefined;
}): Promise<boolean> {
  if (options.terminalRuntime?.screenEnabled === true && options.realtimeInput !== undefined) {
    try {
      const result = await confirmWithScreenKeys({
        input: options.realtimeInput,
        screen: options.screen,
        render: () =>
          renderFixedScreenLayout({
            runtime: options.terminalRuntime,
            title: options.translator.t("title.menu.newGame"),
            status: [`Day ${options.save.journey.day}`, `XP ${options.save.progress.totalXp}`],
            body: [options.translator.t("title.menu.newGameConfirm").trim()],
            hints: ["[y/enter] confirm  [n/esc] cancel"],
          }),
      });

      if (result === "quit") {
        throw new Error("New Game confirmation cancelled");
      }

      return result === "confirm";
    } catch (error) {
      if (!isRawModeUnavailableError(error)) {
        throw error;
      }
    }
  }

  const confirmation = await options.textInput.readLine(
    options.translator.t("title.menu.newGameConfirm"),
  );
  return confirmation.trim().toLowerCase() === "yes";
}

function joinScreenSections(sections: readonly (readonly string[])[]): readonly string[] {
  return sections.flatMap((section, index) => (index === 0 ? section : ["", ...section]));
}

async function resolveLessonPath(options: {
  readonly day: number;
  readonly lessonPath: string | undefined;
  readonly lessonPackPath: string | undefined;
}): Promise<string> {
  if (options.lessonPath !== undefined) {
    return options.lessonPath;
  }

  if (options.lessonPackPath !== undefined) {
    const manifest = await loadLessonPackManifest(options.lessonPackPath);
    return getLessonPackLessonPath(manifest, options.lessonPackPath, options.day);
  }

  return getDefaultLessonPathForDay(options.day);
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
