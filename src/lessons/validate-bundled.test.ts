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
      "11: meadow-road-day-11",
      "12: meadow-road-day-12",
      "13: meadow-road-day-13",
      "14: meadow-road-day-14",
      "15: river-gate-day-15",
      "16: river-gate-day-16",
      "17: river-gate-day-17",
      "18: river-gate-day-18",
      "19: river-gate-day-19",
      "20: river-gate-day-20",
      "21: river-gate-day-21",
      "22: lantern-keep-day-22",
      "23: lantern-keep-day-23",
      "24: lantern-keep-day-24",
      "25: lantern-keep-day-25",
      "26: lantern-keep-day-26",
      "27: lantern-keep-day-27",
      "28: lantern-keep-day-28",
    ]);
  });
});
