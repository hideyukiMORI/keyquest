import { describe, expect, it } from "vitest";

import type { PracticePrompt } from "./session.js";
import {
  applyTimePressureXp,
  resolveTimePressure,
  resolveTimePressureResult,
} from "./time-pressure.js";
import { createNewSave } from "../save/model.js";

describe("time pressure", () => {
  it("uses soft pressure for early normal practice", () => {
    const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");

    expect(
      resolveTimePressure({
        save,
        prompt: createPrompt("f j"),
        isReview: false,
      }).kind,
    ).toBe("soft");
  });

  it("uses strict pressure for weak-key review and later days", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 14,
        chapter: 2,
        storyFlag: "noviceHallStarted" as const,
      },
    };

    expect(resolveTimePressure({ save, prompt: createPrompt("f j"), isReview: false }).kind).toBe(
      "strict",
    );
    expect(resolveTimePressure({ save, prompt: createPrompt("f j"), isReview: true }).kind).toBe(
      "strict",
    );
  });

  it("marks overtime and tempers XP", () => {
    const result = resolveTimePressureResult({
      pressure: { limitSeconds: 10, kind: "strict" },
      elapsedSeconds: 12,
    });

    expect(result?.expired).toBe(true);
    expect(applyTimePressureXp(10, result)).toBe(8);
  });
});

function createPrompt(text: string): PracticePrompt {
  return {
    id: "prompt-1",
    text,
    skillIds: ["homePosition"],
    targetKeys: ["f", "j"],
    fingerHints: ["leftIndex", "rightIndex"],
  };
}
