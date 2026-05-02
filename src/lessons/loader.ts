import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { PracticePrompt } from "../practice/session.js";
import { getBundledLessonForDay } from "./manifest.js";
import { validateLesson, type Lesson, type LessonPrompt } from "./schema.js";

export const DEFAULT_LESSON_DIRECTORY = join(process.cwd(), "lessons");
export const DEFAULT_LESSON_PATH = getDefaultLessonPathForDay(1);

export function getDefaultLessonPathForDay(day: number): string {
  return join(DEFAULT_LESSON_DIRECTORY, getBundledLessonForDay(day).filename);
}

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

export function selectPracticePrompts(lesson: Lesson, count: number): readonly PracticePrompt[] {
  if (lesson.prompts.length === 0) {
    throw new Error(`Lesson has no prompts: ${lesson.id}`);
  }

  return lesson.prompts.slice(0, Math.max(1, count)).map(toPracticePrompt);
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
