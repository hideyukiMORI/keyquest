import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import { createWeakKeyReviewQuest } from "./review-quest.js";

describe("weak-key review quest", () => {
  it("creates quest metadata from weak-key history", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const save = {
      ...createNewSave(now, "normal"),
      progress: {
        ...createNewSave(now, "normal").progress,
        sessions: [
          {
            id: "session-previous",
            mode: "normal" as const,
            startedAt: "2026-01-01T00:00:00.000Z",
            completedAt: "2026-01-01T00:10:00.000Z",
            promptCount: 1,
            accuracy: 0.5,
            wordsPerMinute: 20,
            xpGained: 5,
            mistakes: [
              { promptId: "p1", index: 0, expected: "j", actual: "f" },
              { promptId: "p1", index: 1, expected: "j", actual: "f" },
              { promptId: "p1", index: 2, expected: "f", actual: "j" },
            ],
          },
        ],
      },
    };

    expect(createWeakKeyReviewQuest({ save })).toMatchObject({
      id: "weak-key-review",
      title: "Weak-Key Review",
      targetKeys: ["j", "f"],
      advancesJourney: false,
      prompt: {
        id: "weak-key-review-j-f",
        targetKeys: ["j", "f"],
      },
    });
  });

  it("returns undefined when no review prompt is available", () => {
    expect(createWeakKeyReviewQuest({ save: createNewSave(new Date(), "normal") })).toBeUndefined();
  });
});
