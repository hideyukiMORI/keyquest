import { describe, expect, it } from "vitest";

import { applyTypingInput, createTypingState, deriveTypingCharacterViews } from "./typing-state.js";

describe("typing state", () => {
  it("appends characters and derives correct/wrong/pending views", () => {
    const state = applyTypingInput(
      applyTypingInput(createTypingState("f j"), { kind: "character", value: "f" }),
      { kind: "character", value: "x" },
    );

    expect(state.actual).toBe("fx");
    expect(deriveTypingCharacterViews(state)).toEqual([
      {
        index: 0,
        expected: "f",
        actual: "f",
        state: "correct",
      },
      {
        index: 1,
        expected: " ",
        actual: "x",
        state: "wrong",
      },
      {
        index: 2,
        expected: "j",
        actual: null,
        state: "pending",
      },
    ]);
  });

  it("handles backspace without leaving active state", () => {
    const typed = applyTypingInput(createTypingState("ff"), { kind: "character", value: "f" });
    const backed = applyTypingInput(typed, { kind: "backspace" });

    expect(backed).toEqual({
      expected: "ff",
      actual: "",
      status: "active",
    });
  });

  it("marks extra typed characters", () => {
    const state = applyTypingInput(createTypingState("f"), { kind: "character", value: "x" });
    const extra = applyTypingInput(state, { kind: "character", value: "x" });

    expect(deriveTypingCharacterViews(extra)).toEqual([
      {
        index: 0,
        expected: "f",
        actual: "x",
        state: "wrong",
      },
      {
        index: 1,
        expected: null,
        actual: "x",
        state: "extra",
      },
    ]);
  });

  it("handles submit and cancel as terminal states", () => {
    const completed = applyTypingInput(createTypingState("f"), { kind: "submit" });
    const ignoredAfterComplete = applyTypingInput(completed, { kind: "character", value: "f" });
    const cancelled = applyTypingInput(createTypingState("f"), { kind: "cancel" });

    expect(completed.status).toBe("completed");
    expect(ignoredAfterComplete.actual).toBe("");
    expect(cancelled.status).toBe("cancelled");
  });

  it("rejects multi-character input events", () => {
    expect(() =>
      applyTypingInput(createTypingState("f"), { kind: "character", value: "ff" }),
    ).toThrow("exactly one character");
  });
});
