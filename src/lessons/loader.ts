import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { PracticePrompt } from "../practice/session.js";
import { validateLesson, type Lesson, type LessonPrompt } from "./schema.js";

export const DEFAULT_LESSON_PATH = join(process.cwd(), "lessons", "novice-hall-day-1.json");

export async function loadLessonFromFile(path: string): Promise<Lesson> {
  const content = await readFile(path, "utf8");
  return validateLesson(JSON.parse(content) as unknown);
}

export function selectPracticePrompt(lesson: Lesson): PracticePrompt {
  const firstPrompt = lesson.prompts[0];
  if (firstPrompt === undefined) {
    throw new Error(`Lesson has no prompts: ${lesson.id}`);
  }

  return toPracticePrompt(firstPrompt);
}

export function toPracticePrompt(prompt: LessonPrompt): PracticePrompt {
  return {
    id: prompt.id,
    text: prompt.text,
    skillIds: prompt.skillIds,
    targetKeys: prompt.targetKeys,
    fingerHints: prompt.fingerHints,
  };
}
