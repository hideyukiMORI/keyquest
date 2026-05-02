import { describe, expect, it } from "vitest";

import { createInitialQuestResources, createNewSave } from "../save/model.js";
import { getJourneyEndingState, getPostGameGoals, JOURNEY_ENDING_DAY } from "./ending.js";

describe("journey ending", () => {
  it("reports remaining days before Day 90", () => {
    const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");

    expect(getJourneyEndingState(save)).toEqual({
      status: "inProgress",
      daysRemaining: JOURNEY_ENDING_DAY - 1,
    });
  });

  it("marks Day 90 as ending ready", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: JOURNEY_ENDING_DAY,
        chapter: 12,
        storyFlag: "noviceHallStarted" as const,
      },
    };

    expect(getJourneyEndingState(save)).toEqual({
      status: "endingReady",
    });
  });

  it("builds deterministic post-game goals after the ending", () => {
    const resources = createInitialQuestResources();
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: JOURNEY_ENDING_DAY + 1,
        chapter: 13,
        storyFlag: "noviceHallStarted" as const,
      },
      progress: {
        ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal").progress,
        streakDays: 8,
        resources: {
          ...resources,
          materials: {
            ...resources.materials,
            focusCrystal: 12,
          },
        },
        sessions: [
          {
            id: "session-perfect",
            mode: "normal" as const,
            startedAt: "2026-01-01T00:00:00.000Z",
            completedAt: "2026-01-01T00:10:00.000Z",
            promptCount: 3,
            accuracy: 1,
            wordsPerMinute: 30,
            xpGained: 50,
            mistakes: [],
          },
        ],
      },
    };

    expect(getJourneyEndingState(save).status).toBe("postGame");
    expect(getPostGameGoals(save)).toEqual([
      {
        id: "sevenDayStreak",
        current: 7,
        target: 7,
        completed: true,
      },
      {
        id: "perfectTen",
        current: 1,
        target: 10,
        completed: false,
      },
      {
        id: "focusCrystalCache",
        current: 12,
        target: 25,
        completed: false,
      },
    ]);
  });
});
