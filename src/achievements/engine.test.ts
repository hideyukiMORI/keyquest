import { describe, expect, it } from "vitest";

import { createNewSave, type SessionRecord } from "../save/model.js";
import { ACHIEVEMENTS, unlockSessionAchievements } from "./engine.js";

describe("achievement engine", () => {
  it("unlocks first-session and perfect-session achievements once", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = createSession({ mistakes: [] });
    const unlocks = unlockSessionAchievements({
      save: createNewSave(now, "normal"),
      session,
      unlockedAt: now,
      nextStreakDays: 1,
    });

    expect(unlocks).toEqual([
      {
        id: "firstSession",
        unlockedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "perfectSession",
        unlockedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect(
      unlockSessionAchievements({
        save: {
          ...createNewSave(now, "normal"),
          progress: {
            ...createNewSave(now, "normal").progress,
            sessions: [session],
            achievements: unlocks,
          },
        },
        session,
        unlockedAt: now,
        nextStreakDays: 1,
      }),
    ).toEqual([]);
  });

  it("does not unlock perfect-session achievement when mistakes exist", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(
      unlockSessionAchievements({
        save: createNewSave(now, "normal"),
        session: createSession({
          mistakes: [{ promptId: "p1", index: 0, expected: "f", actual: "j" }],
        }),
        unlockedAt: now,
        nextStreakDays: 1,
      }).map((unlock) => unlock.id),
    ).toEqual(["firstSession"]);
  });

  it("unlocks long-session achievements from elapsed time", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(
      unlockSessionAchievements({
        save: createNewSave(now, "normal"),
        session: {
          ...createSession({ mistakes: [] }),
          startedAt: "2026-01-01T00:00:00.000Z",
          completedAt: "2026-01-01T03:00:00.000Z",
        },
        unlockedAt: now,
        nextStreakDays: 1,
      }).map((unlock) => unlock.id),
    ).toEqual(["firstSession", "perfectSession", "longWatch", "deepDive", "dungeonMarathon"]);
  });

  it("defines continuity achievements for future streak logic", () => {
    expect(Object.keys(ACHIEVEMENTS)).toEqual([
      "firstSession",
      "perfectSession",
      "threeDaysPact",
      "unbrokenSeven",
      "moonCycle",
      "longWatch",
      "deepDive",
      "dungeonMarathon",
    ]);
  });

  it("unlocks continuity achievements from streak length", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(
      unlockSessionAchievements({
        save: createNewSave(now, "normal"),
        session: createSession({ mistakes: [] }),
        unlockedAt: now,
        nextStreakDays: 30,
      }).map((unlock) => unlock.id),
    ).toEqual(["firstSession", "perfectSession", "threeDaysPact", "unbrokenSeven", "moonCycle"]);
  });
});

function createSession(options: Pick<SessionRecord, "mistakes">): SessionRecord {
  return {
    id: "session-1",
    mode: "normal",
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:10.000Z",
    promptCount: 1,
    accuracy: 1,
    wordsPerMinute: 30,
    xpGained: 10,
    mistakes: options.mistakes,
  };
}
