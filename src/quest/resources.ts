import type { Score } from "../core/scoring.js";
import { resolveQuestModifierRewards, type QuestModifierRewardResult } from "./modifiers.js";
import {
  createInitialQuestResources,
  type MaterialId,
  type QuestResources,
} from "../save/model.js";

export type QuestResourceResult = {
  readonly resources: QuestResources;
  readonly hpLost: number;
  readonly mpGained: number;
  readonly materialsGained: Readonly<Record<MaterialId, number>>;
  readonly modifierRewards?: QuestModifierRewardResult;
};

const PERFECT_MP_GAIN = 3;
const ACCURATE_MP_GAIN = 1;
const ACCURATE_THRESHOLD = 0.95;
const XP_PER_FOCUS_CRYSTAL = 50;

export function resolveQuestResources(options: {
  readonly resources: QuestResources | undefined;
  readonly score: Score;
  readonly xpGained: number;
  readonly questDay?: number;
}): QuestResourceResult {
  const previous = options.resources ?? createInitialQuestResources();
  const hpLost = Math.min(previous.maxHp, options.score.mistakes);
  const modifierRewards =
    options.questDay === undefined
      ? undefined
      : resolveQuestModifierRewards({
          day: options.questDay,
          score: options.score,
        });
  const mpGained = calculateMpGain(options.score) + (modifierRewards?.mpGained ?? 0);
  const focusCrystalGain =
    Math.floor(options.xpGained / XP_PER_FOCUS_CRYSTAL) +
    (modifierRewards?.materialsGained.focusCrystal ?? 0);
  const repairShardGain =
    options.score.mistakes + (modifierRewards?.materialsGained.repairShard ?? 0);

  return {
    hpLost,
    mpGained,
    ...(modifierRewards === undefined ? {} : { modifierRewards }),
    materialsGained: {
      focusCrystal: focusCrystalGain,
      repairShard: repairShardGain,
    },
    resources: {
      ...previous,
      hp: previous.maxHp - hpLost,
      mp: Math.min(previous.maxMp, previous.mp + mpGained),
      materials: {
        focusCrystal: previous.materials.focusCrystal + focusCrystalGain,
        repairShard: previous.materials.repairShard + repairShardGain,
      },
    },
  };
}

function calculateMpGain(score: Score): number {
  if (score.totalCharacters === 0) {
    return 0;
  }

  if (score.mistakes === 0) {
    return PERFECT_MP_GAIN;
  }

  return score.accuracy >= ACCURATE_THRESHOLD ? ACCURATE_MP_GAIN : 0;
}
