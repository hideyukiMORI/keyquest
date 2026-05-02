import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import { unlockSessionTitles } from "./titles.js";

describe("title rewards", () => {
  it("unlocks Novice Hall graduation title after Day 7 only once", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const save = {
      ...createNewSave(now, "normal"),
      journey: {
        day: 7,
        chapter: 1,
        storyFlag: "noviceHallStarted" as const,
      },
    };
    const unlocks = unlockSessionTitles({ save, unlockedAt: now });

    expect(unlocks).toEqual([
      {
        id: "noviceHallGraduate",
        unlockedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect(
      unlockSessionTitles({
        save: {
          ...save,
          progress: {
            ...save.progress,
            titles: unlocks,
          },
        },
        unlockedAt: now,
      }),
    ).toEqual([]);
  });

  it("does not unlock titles before Gatekeeper Trial", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(unlockSessionTitles({ save: createNewSave(now, "normal"), unlockedAt: now })).toEqual(
      [],
    );
  });
});
