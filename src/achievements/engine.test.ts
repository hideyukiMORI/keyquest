import { describe, expect, it } from "vitest";

import { createNewSave, type SessionRecord } from "../save/model.js";
import { unlockSessionAchievements } from "./engine.js";

describe("achievement engine", () => {
  it("unlocks first-session and perfect-session achievements once", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = createSession({ mistakes: [] });
    const unlocks = unlockSessionAchievements({
      save: createNewSave(now, "normal"),
      session,
      unlockedAt: now,
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
      }).map((unlock) => unlock.id),
    ).toEqual(["firstSession"]);
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
