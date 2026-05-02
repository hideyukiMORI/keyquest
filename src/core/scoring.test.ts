import { describe, expect, it } from "vitest";

import { scoreTypingResult } from "./scoring.js";

describe("scoreTypingResult", () => {
  it("scores perfect input", () => {
    const score = scoreTypingResult({
      expected: "hello world",
      actual: "hello world",
      startedAt: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:06.000Z"),
    });

    expect(score.correctCharacters).toBe(11);
    expect(score.mistakes).toBe(0);
    expect(score.accuracy).toBe(1);
    expect(score.wordsPerMinute).toBeCloseTo(22);
  });

  it("counts incorrect and missing characters as mistakes", () => {
    const score = scoreTypingResult({
      expected: "quest",
      actual: "qux",
      startedAt: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:10.000Z"),
    });

    expect(score.correctCharacters).toBe(2);
    expect(score.mistakes).toBe(3);
    expect(score.accuracy).toBe(0.4);
  });

  it("uses a one second minimum elapsed time", () => {
    const score = scoreTypingResult({
      expected: "hello",
      actual: "hello",
      startedAt: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:00.010Z"),
    });

    expect(score.elapsedSeconds).toBe(1);
    expect(score.wordsPerMinute).toBe(60);
  });
});
