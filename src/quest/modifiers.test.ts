import { describe, expect, it } from "vitest";

import { getQuestModifierForDay, resolveQuestModifierRewards } from "./modifiers.js";

const PERFECT_SCORE = {
  totalCharacters: 20,
  correctCharacters: 20,
  mistakes: 0,
  accuracy: 1,
  wordsPerMinute: 30,
  elapsedSeconds: 10,
};

describe("quest modifiers", () => {
  it("rotates modifiers deterministically by day", () => {
    expect(getQuestModifierForDay(1).id).toBe("steadyTorch");
    expect(getQuestModifierForDay(2).id).toBe("mistVeil");
    expect(getQuestModifierForDay(3).id).toBe("shiftingBridge");
    expect(getQuestModifierForDay(4).id).toBe("steadyTorch");
  });

  it("rewards high accuracy with the steady torch", () => {
    expect(resolveQuestModifierRewards({ day: 1, score: PERFECT_SCORE })).toEqual({
      modifier: {
        id: "steadyTorch",
      },
      mpGained: 0,
      materialsGained: {
        focusCrystal: 1,
        repairShard: 0,
      },
    });
  });

  it("rewards clean recovery through mist veil", () => {
    expect(
      resolveQuestModifierRewards({
        day: 2,
        score: {
          ...PERFECT_SCORE,
          correctCharacters: 19,
          mistakes: 1,
          accuracy: 0.95,
        },
      }),
    ).toEqual({
      modifier: {
        id: "mistVeil",
      },
      mpGained: 0,
      materialsGained: {
        focusCrystal: 0,
        repairShard: 1,
      },
    });
  });

  it("rewards perfect shifting bridge sessions with MP", () => {
    expect(resolveQuestModifierRewards({ day: 3, score: PERFECT_SCORE })).toEqual({
      modifier: {
        id: "shiftingBridge",
      },
      mpGained: 1,
      materialsGained: {
        focusCrystal: 0,
        repairShard: 0,
      },
    });
  });
});
