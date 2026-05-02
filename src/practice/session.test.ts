import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import { calculatePracticeXp, completePracticeRun, completePracticeSession } from "./session.js";

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
