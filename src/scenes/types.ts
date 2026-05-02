import type { Score } from "../core/scoring.js";
import type { KeyQuestSave, SaveMode } from "../save/model.js";

export type SceneId = "title" | "story" | "status" | "practicePreview" | "exit";

export type SceneContext = {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly now: Date;
  readonly practicePreview: {
    readonly prompt: string;
    readonly score: Score;
  };
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
