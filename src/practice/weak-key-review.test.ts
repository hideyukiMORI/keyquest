import { describe, expect, it } from "vitest";

import { createNewSave, type CharacterMistakeRecord } from "../save/model.js";
import { analyzeWeakKeys, createWeakKeyReviewPrompt } from "./weak-key-review.js";

describe("weak-key review", () => {
  it("ranks expected mistake keys by frequency with stable tie ordering", () => {
    const save = createSaveWithMistakes([
      { promptId: "p1", index: 0, expected: "j", actual: "f" },
      { promptId: "p1", index: 1, expected: "f", actual: "j" },
      { promptId: "p1", index: 2, expected: "J", actual: "f" },
      { promptId: "p1", index: 3, expected: "d", actual: "s" },
      { promptId: "p1", index: 4, expected: null, actual: "x" },
      { promptId: "p1", index: 5, expected: " ", actual: null },
    ]);

    expect(analyzeWeakKeys(save)).toEqual([
      { key: "j", mistakes: 2 },
      { key: "d", mistakes: 1 },
      { key: "f", mistakes: 1 },
    ]);
  });

  it("creates a deterministic review prompt from weak keys", () => {
    const save = createSaveWithMistakes([
      { promptId: "p1", index: 0, expected: "j", actual: "f" },
      { promptId: "p1", index: 1, expected: "j", actual: "f" },
      { promptId: "p1", index: 2, expected: "f", actual: "j" },
      { promptId: "p1", index: 3, expected: "d", actual: "s" },
      { promptId: "p1", index: 4, expected: "s", actual: "d" },
      { promptId: "p1", index: 5, expected: "a", actual: "s" },
    ]);

    expect(createWeakKeyReviewPrompt(save)).toEqual({
      id: "weak-key-review-j-a-d-f",
      text: "j j j a a a d d d f f f ja aj ad da df fd fj jf",
      targetKeys: ["j", "a", "d", "f"],
      skillIds: ["fingerResponsibility", "accuracy"],
      fingerHints: ["rightIndex", "leftPinky", "leftMiddle", "leftIndex"],
    });
  });

  it("returns no prompt when there are no reviewable mistakes", () => {
    expect(
      createWeakKeyReviewPrompt(createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal")),
    ).toBeUndefined();
  });
});

function createSaveWithMistakes(mistakes: readonly CharacterMistakeRecord[]) {
  const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");

  return {
    ...save,
    progress: {
      ...save.progress,
      sessions: [
        {
          id: "session-1",
          mode: "normal" as const,
          startedAt: "2026-01-01T00:00:00.000Z",
          completedAt: "2026-01-01T00:10:00.000Z",
          promptCount: 1,
          accuracy: 0.5,
          wordsPerMinute: 20,
          xpGained: 5,
          mistakes,
        },
      ],
    },
  };
}
