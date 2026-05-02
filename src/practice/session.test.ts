import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import {
  advanceJourneyDay,
  calculatePracticeXp,
  collectCharacterMistakes,
  completePracticeRun,
  completePracticeSession,
} from "./session.js";

describe("completePracticeSession", () => {
  it("scores input and appends a session record", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    const completedAt = new Date("2026-01-01T00:00:10.000Z");
    const result = completePracticeSession({
      save: createNewSave(startedAt, "normal"),
      mode: "normal",
      prompt: {
        id: "home-row-1",
        text: "f j f j",
        skillIds: ["homePosition", "fingerResponsibility", "homeRow"],
        targetKeys: ["f", "j"],
        fingerHints: ["leftIndex", "rightIndex"],
      },
      actual: "f j f j",
      startedAt,
      completedAt,
    });

    expect(result.score.accuracy).toBe(1);
    expect(result.xpGained).toBeGreaterThan(0);
    expect(result.updatedSave.progress.sessions).toHaveLength(1);
    expect(result.updatedSave.progress.totalXp).toBe(result.xpGained);
    expect(result.updatedSave.journey.storyFlag).toBe("noviceHallStarted");
    expect(result.updatedSave.journey.day).toBe(2);
    expect(result.updatedSave.progress.sessions[0]?.mistakes).toEqual([]);
  });

  it("marks development sessions separately", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    const completedAt = new Date("2026-01-01T00:00:10.000Z");
    const result = completePracticeSession({
      save: createNewSave(startedAt, "development"),
      mode: "development",
      prompt: {
        id: "home-row-1",
        text: "f j f j",
        skillIds: ["homePosition"],
        targetKeys: ["f", "j"],
        fingerHints: ["leftIndex", "rightIndex"],
      },
      actual: "f j f j",
      startedAt,
      completedAt,
    });

    expect(result.updatedSave.development.everUsedDevMode).toBe(true);
    expect(result.updatedSave.development.devSessions).toBe(1);
    expect(result.updatedSave.progress.sessions[0]?.mode).toBe("development");
  });
});

describe("completePracticeRun", () => {
  it("aggregates multiple attempts into one saved session", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    const secondStartedAt = new Date("2026-01-01T00:00:10.000Z");
    const completedAt = new Date("2026-01-01T00:00:20.000Z");
    const prompt = {
      id: "home-row-1",
      text: "f j",
      skillIds: ["homePosition", "fingerResponsibility", "homeRow"] as const,
      targetKeys: ["f", "j"],
      fingerHints: ["leftIndex", "rightIndex"] as const,
    };
    const result = completePracticeRun({
      save: createNewSave(startedAt, "normal"),
      mode: "normal",
      attempts: [
        {
          prompt,
          actual: "f j",
          startedAt,
          completedAt: secondStartedAt,
        },
        {
          prompt: {
            ...prompt,
            id: "home-row-2",
            text: "ff jj",
          },
          actual: "ff jj",
          startedAt: secondStartedAt,
          completedAt,
        },
      ],
    });

    expect(result.attempts).toHaveLength(2);
    expect(result.score.accuracy).toBe(1);
    expect(result.updatedSave.progress.sessions).toHaveLength(1);
    expect(result.updatedSave.progress.sessions[0]?.promptCount).toBe(2);
    expect(result.updatedSave.progress.totalXp).toBe(result.xpGained);
    expect(result.updatedSave.progress.sessions[0]?.mistakes).toEqual([]);
  });

  it("aggregates mistake details across prompts", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    const secondStartedAt = new Date("2026-01-01T00:00:10.000Z");
    const completedAt = new Date("2026-01-01T00:00:20.000Z");
    const prompt = {
      id: "home-row-1",
      text: "f j",
      skillIds: ["homePosition"] as const,
      targetKeys: ["f", "j"],
      fingerHints: ["leftIndex", "rightIndex"] as const,
    };
    const result = completePracticeRun({
      save: createNewSave(startedAt, "normal"),
      mode: "normal",
      attempts: [
        {
          prompt,
          actual: "f k",
          startedAt,
          completedAt: secondStartedAt,
        },
        {
          prompt: {
            ...prompt,
            id: "home-row-2",
            text: "ff",
          },
          actual: "f",
          startedAt: secondStartedAt,
          completedAt,
        },
      ],
    });

    expect(result.updatedSave.progress.sessions[0]?.mistakes).toEqual([
      {
        promptId: "home-row-1",
        index: 2,
        expected: "j",
        actual: "k",
      },
      {
        promptId: "home-row-2",
        index: 1,
        expected: "f",
        actual: null,
      },
    ]);
  });
});

describe("advanceJourneyDay", () => {
  it("advances through bundled lessons and caps at the latest available day", () => {
    expect(advanceJourneyDay(1)).toBe(2);
    expect(advanceJourneyDay(3)).toBe(4);
    expect(advanceJourneyDay(4)).toBe(5);
    expect(advanceJourneyDay(5)).toBe(5);
  });
});

describe("collectCharacterMistakes", () => {
  const prompt = {
    id: "home-row-1",
    text: "f j",
    skillIds: ["homePosition"] as const,
    targetKeys: ["f", "j"],
    fingerHints: ["leftIndex", "rightIndex"] as const,
  };

  it("records wrong, missing, and extra characters", () => {
    expect(collectCharacterMistakes(prompt, "f kx")).toEqual([
      {
        promptId: "home-row-1",
        index: 2,
        expected: "j",
        actual: "k",
      },
      {
        promptId: "home-row-1",
        index: 3,
        expected: null,
        actual: "x",
      },
    ]);

    expect(collectCharacterMistakes(prompt, "f ")).toEqual([
      {
        promptId: "home-row-1",
        index: 2,
        expected: "j",
        actual: null,
      },
    ]);
  });
});

describe("calculatePracticeXp", () => {
  it("rewards perfect practice with a bonus", () => {
    expect(
      calculatePracticeXp({
        totalCharacters: 5,
        correctCharacters: 5,
        mistakes: 0,
        accuracy: 1,
        wordsPerMinute: 10,
        elapsedSeconds: 6,
      }),
    ).toBe(35);
  });
});
