import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LESSON_PATH,
  getDefaultLessonPathForDay,
  loadLessonFromFile,
  selectPracticePrompt,
  selectPracticePrompts,
} from "./loader.js";

const tempDirectories: string[] = [];

describe("lesson loader", () => {
  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true })));
  });

  it("loads and selects the first practice prompt", async () => {
    const directory = await createTempDirectory();
    const lessonPath = join(directory, "lesson.json");
    await writeFile(
      lessonPath,
      JSON.stringify({
        schemaVersion: 1,
        id: "novice-hall-day-1",
        title: "Novice Hall: Home Position",
        day: 1,
        locale: "en",
        focus: ["home position"],
        prompts: [
          {
            id: "home-position-1",
            text: "f j",
            targetKeys: ["f", "j"],
            skillIds: ["homePosition", "fingerResponsibility"],
            fingerHints: ["leftIndex", "rightIndex"],
          },
        ],
      }),
      "utf8",
    );

    const lesson = await loadLessonFromFile(lessonPath);
    expect(selectPracticePrompt(lesson)).toEqual({
      id: "home-position-1",
      text: "f j",
      targetKeys: ["f", "j"],
      skillIds: ["homePosition", "fingerResponsibility"],
      fingerHints: ["leftIndex", "rightIndex"],
    });
    expect(selectPracticePrompts(lesson, 3)).toHaveLength(1);
  });

  it("resolves default lesson paths from journey days", () => {
    expect(DEFAULT_LESSON_PATH).toBe(getDefaultLessonPathForDay(1));
    expect(getDefaultLessonPathForDay(2)).toMatch(/lessons\/novice-hall-day-2\.json$/);
    expect(getDefaultLessonPathForDay(3)).toMatch(/lessons\/novice-hall-day-3\.json$/);
    expect(getDefaultLessonPathForDay(5)).toMatch(/lessons\/novice-hall-day-5\.json$/);
    expect(getDefaultLessonPathForDay(6)).toMatch(/lessons\/novice-hall-day-6\.json$/);
    expect(getDefaultLessonPathForDay(7)).toMatch(/lessons\/novice-hall-day-7\.json$/);
    expect(getDefaultLessonPathForDay(8)).toMatch(/lessons\/meadow-road-day-8\.json$/);
    expect(getDefaultLessonPathForDay(9)).toMatch(/lessons\/meadow-road-day-9\.json$/);
    expect(getDefaultLessonPathForDay(10)).toMatch(/lessons\/meadow-road-day-10\.json$/);
    expect(() => getDefaultLessonPathForDay(0)).toThrow("positive integer");
    expect(() => getDefaultLessonPathForDay(11)).toThrow("No bundled lesson");
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-lesson-"));
  tempDirectories.push(directory);
  return directory;
}
