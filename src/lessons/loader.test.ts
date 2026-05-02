import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadLessonFromFile, selectPracticePrompt, selectPracticePrompts } from "./loader.js";

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
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-lesson-"));
  tempDirectories.push(directory);
  return directory;
}
