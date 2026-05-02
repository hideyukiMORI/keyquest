import { describe, expect, it } from "vitest";

import { getDefaultLessonPathForDay, loadLessonFromFile, selectPracticePrompts } from "./loader.js";
import {
  BUNDLED_LESSON_MANIFEST,
  getBundledLessonForDay,
  getLatestBundledLessonDay,
} from "./manifest.js";

describe("bundled lesson manifest", () => {
  it("lists bundled lessons in day order", () => {
    expect(BUNDLED_LESSON_MANIFEST.map((lesson) => lesson.day)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(getLatestBundledLessonDay()).toBe(10);
  });

  it("resolves lessons by day and rejects unavailable days", () => {
    expect(getBundledLessonForDay(7)).toEqual({
      day: 7,
      id: "novice-hall-day-7",
      filename: "novice-hall-day-7.json",
      title: "Novice Hall: Gatekeeper Trial",
    });
    expect(getBundledLessonForDay(8)).toEqual({
      day: 8,
      id: "meadow-road-day-8",
      filename: "meadow-road-day-8.json",
      title: "Meadow Road: First Steps Beyond Home",
    });
    expect(getBundledLessonForDay(10)).toEqual({
      day: 10,
      id: "meadow-road-day-10",
      filename: "meadow-road-day-10.json",
      title: "Meadow Road: Index Reach",
    });
    expect(() => getBundledLessonForDay(0)).toThrow("positive integer");
    expect(() => getBundledLessonForDay(11)).toThrow("No bundled lesson");
  });

  it("matches bundled lesson files to manifest metadata", async () => {
    for (const entry of BUNDLED_LESSON_MANIFEST) {
      const lesson = await loadLessonFromFile(getDefaultLessonPathForDay(entry.day));

      expect(lesson.id).toBe(entry.id);
      expect(lesson.title).toBe(entry.title);
      expect(lesson.day).toBe(entry.day);
    }
  });

  it("selects the gatekeeper boss prompt in the current Day 7 session", async () => {
    const lesson = await loadLessonFromFile(getDefaultLessonPathForDay(7));
    const sessionPromptCount = lesson.sessionPromptCount;
    if (sessionPromptCount === undefined) {
      throw new Error("Day 7 must define a session prompt count");
    }

    expect(lesson.sessionPromptCount).toBe(4);
    expect(selectPracticePrompts(lesson, sessionPromptCount).map((prompt) => prompt.id)).toEqual([
      "gatekeeper-trial-1",
      "gatekeeper-trial-2",
      "gatekeeper-trial-3",
      "gatekeeper-trial-boss",
    ]);
  });
});
