import type { Score } from "../core/scoring.js";
import type { Translator } from "../i18n/messages.js";
import type { Lesson } from "../lessons/schema.js";
import type { PracticePrompt } from "../practice/session.js";
import type { KeyQuestSave, SaveMode } from "../save/model.js";
import type { TerminalRuntime } from "../terminal/runtime.js";

export type SceneId = "title" | "story" | "status" | "practiceIntro" | "exit";

export type SceneContext = {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly now: Date;
  readonly translator: Translator;
  readonly terminalRuntime: TerminalRuntime | undefined;
  readonly lesson: Lesson;
  readonly practicePrompt: PracticePrompt;
};

export type SceneOutput = {
  readonly id: SceneId;
  readonly lines: readonly string[];
  readonly next: SceneId;
};

export type Scene = {
  readonly id: SceneId;
  readonly render: (context: SceneContext) => SceneOutput;
};

export type PracticeResultView = {
  readonly prompt: PracticePrompt;
  readonly actual: string;
  readonly score: Score;
  readonly xpGained: number;
  readonly mode: SaveMode;
};

export type PracticeRunResultView = {
  readonly promptCount: number;
  readonly score: Score;
  readonly xpGained: number;
  readonly mode: SaveMode;
};

export type PracticeRewardsView = {
  readonly beforeSave: KeyQuestSave;
  readonly afterSave: KeyQuestSave;
};

export type PracticeStreakProgressView = {
  readonly beforeSave: KeyQuestSave;
  readonly afterSave: KeyQuestSave;
};

export type PracticeAchievementsView = {
  readonly beforeSave: KeyQuestSave;
  readonly afterSave: KeyQuestSave;
};

export type PracticeTitleRewardsView = {
  readonly beforeSave: KeyQuestSave;
  readonly afterSave: KeyQuestSave;
};

export type PracticeJourneyProgressView = {
  readonly beforeSave: KeyQuestSave;
  readonly afterSave: KeyQuestSave;
};
