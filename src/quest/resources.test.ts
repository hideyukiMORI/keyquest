import { describe, expect, it } from "vitest";

import { createInitialQuestResources } from "../save/model.js";
import { resolveQuestResources } from "./resources.js";

describe("quest resources", () => {
  it("grants focus crystals and MP for perfect sessions", () => {
    const result = resolveQuestResources({
      resources: createInitialQuestResources(),
      score: {
        totalCharacters: 40,
        correctCharacters: 40,
        mistakes: 0,
        accuracy: 1,
        wordsPerMinute: 30,
        elapsedSeconds: 20,
      },
      xpGained: 120,
    });

    expect(result.hpLost).toBe(0);
    expect(result.mpGained).toBe(3);
    expect(result.materialsGained).toEqual({
      focusCrystal: 2,
      repairShard: 0,
    });
    expect(result.resources.hp).toBe(20);
    expect(result.resources.mp).toBe(3);
    expect(result.resources.materials.focusCrystal).toBe(2);
  });

  it("turns mistakes into HP loss and repair shards", () => {
    const result = resolveQuestResources({
      resources: {
        ...createInitialQuestResources(),
        hp: 2,
        mp: 9,
      },
      score: {
        totalCharacters: 20,
        correctCharacters: 15,
        mistakes: 5,
        accuracy: 0.75,
        wordsPerMinute: 20,
        elapsedSeconds: 18,
      },
      xpGained: 25,
    });

    expect(result.hpLost).toBe(5);
    expect(result.mpGained).toBe(0);
    expect(result.materialsGained).toEqual({
      focusCrystal: 0,
      repairShard: 5,
    });
    expect(result.resources.hp).toBe(15);
    expect(result.resources.mp).toBe(9);
    expect(result.resources.materials.repairShard).toBe(5);
  });

  it("adds small MP for accurate imperfect sessions", () => {
    const result = resolveQuestResources({
      resources: undefined,
      score: {
        totalCharacters: 100,
        correctCharacters: 96,
        mistakes: 4,
        accuracy: 0.96,
        wordsPerMinute: 40,
        elapsedSeconds: 30,
      },
      xpGained: 50,
    });

    expect(result.mpGained).toBe(1);
    expect(result.resources.mp).toBe(1);
  });
});
