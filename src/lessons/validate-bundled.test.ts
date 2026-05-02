import { describe, expect, it } from "vitest";

import { validateBundledLessons } from "./validate-bundled.js";

describe("bundled lesson validation command", () => {
  it("validates all bundled lesson files", async () => {
    await expect(validateBundledLessons()).resolves.toEqual([
      "1: novice-hall-day-1",
      "2: novice-hall-day-2",
      "3: novice-hall-day-3",
      "4: novice-hall-day-4",
      "5: novice-hall-day-5",
      "6: novice-hall-day-6",
      "7: novice-hall-day-7",
      "8: meadow-road-day-8",
      "9: meadow-road-day-9",
      "10: meadow-road-day-10",
    ]);
  });
});
