import { describe, expect, it } from "vitest";

import { scoreTypingResult } from "../core/scoring.js";
import { createNewSave } from "../save/model.js";
import { formatSceneSequence, renderSceneSequence } from "./manager.js";
import { defaultScenes } from "./scenes.js";

describe("scene manager", () => {
  it("renders the initial scene sequence", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const prompt = "fj jf";
    const outputs = renderSceneSequence({
      scenes: defaultScenes,
      context: {
        save: createNewSave(now, "normal"),
        mode: "normal",
        now,
        practicePreview: {
          prompt,
          score: scoreTypingResult({
            expected: prompt,
            actual: prompt,
            startedAt: now,
            completedAt: new Date(now.getTime() + 5_000),
          }),
        },
      },
    });

    expect(outputs.map((output) => output.id)).toEqual([
      "title",
      "story",
      "status",
      "practicePreview",
    ]);
    expect(formatSceneSequence(outputs)).toContain("Novice Hall");
  });
});
