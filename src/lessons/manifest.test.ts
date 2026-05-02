import { describe, expect, it } from "vitest";

import {
  BUNDLED_LESSON_MANIFEST,
  getBundledLessonForDay,
  getLatestBundledLessonDay,
} from "./manifest.js";

describe("bundled lesson manifest", () => {
  it("lists bundled lessons in day order", () => {
    expect(BUNDLED_LESSON_MANIFEST.map((lesson) => lesson.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getLatestBundledLessonDay()).toBe(7);
  });

  it("resolves lessons by day and rejects unavailable days", () => {
    expect(getBundledLessonForDay(7)).toEqual({
      day: 7,
      id: "novice-hall-day-7",
      filename: "novice-hall-day-7.json",
      title: "Novice Hall: Gatekeeper Trial",
    });
    expect(() => getBundledLessonForDay(0)).toThrow("positive integer");
    expect(() => getBundledLessonForDay(8)).toThrow("No bundled lesson");
  });
});
