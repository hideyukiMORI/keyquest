import type { Score } from "../core/scoring.js";
import type { MaterialId } from "../save/model.js";

export type QuestModifierId = "steadyTorch" | "mistVeil" | "shiftingBridge";

export type QuestModifier = {
  readonly id: QuestModifierId;
};

export type QuestModifierRewardResult = {
  readonly modifier: QuestModifier;
  readonly mpGained: number;
  readonly materialsGained: Readonly<Record<MaterialId, number>>;
};

export const QUEST_MODIFIERS: readonly QuestModifier[] = [
  {
    id: "steadyTorch",
  },
  {
    id: "mistVeil",
  },
  {
    id: "shiftingBridge",
  },
];

export function getQuestModifierForDay(day: number): QuestModifier {
  if (!Number.isInteger(day) || day < 1) {
    throw new Error(`Quest modifier day must be a positive integer: ${day}`);
  }

  const modifier = QUEST_MODIFIERS[(day - 1) % QUEST_MODIFIERS.length];
  if (modifier === undefined) {
    throw new Error(`No quest modifier is available for day ${day}`);
  }

  return modifier;
}

export function resolveQuestModifierRewards(options: {
  readonly day: number;
  readonly score: Score;
}): QuestModifierRewardResult {
  const modifier = getQuestModifierForDay(options.day);

  if (modifier.id === "steadyTorch") {
    return {
      modifier,
      mpGained: 0,
      materialsGained: {
        focusCrystal: options.score.accuracy >= 0.98 ? 1 : 0,
        repairShard: 0,
      },
    };
  }

  if (modifier.id === "mistVeil") {
    return {
      modifier,
      mpGained: 0,
      materialsGained: {
        focusCrystal: 0,
        repairShard: options.score.mistakes > 0 && options.score.accuracy >= 0.9 ? 1 : 0,
      },
    };
  }

  return {
    modifier,
    mpGained: options.score.mistakes === 0 ? 1 : 0,
    materialsGained: {
      focusCrystal: 0,
      repairShard: 0,
    },
  };
}
