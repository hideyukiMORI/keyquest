import { getDefaultLessonPathForDay, loadLessonFromFile } from "./loader.js";
import { BUNDLED_LESSON_MANIFEST } from "./manifest.js";

export async function validateBundledLessons(): Promise<readonly string[]> {
  const validatedLessons: string[] = [];

  for (const entry of BUNDLED_LESSON_MANIFEST) {
    const lesson = await loadLessonFromFile(getDefaultLessonPathForDay(entry.day));
    if (lesson.id !== entry.id) {
      throw new Error(`Lesson day ${entry.day} id mismatch: ${lesson.id} !== ${entry.id}`);
    }

    if (lesson.title !== entry.title) {
      throw new Error(`Lesson day ${entry.day} title mismatch: ${lesson.title} !== ${entry.title}`);
    }

    if (lesson.day !== entry.day) {
      throw new Error(`Lesson day mismatch for ${entry.id}: ${lesson.day} !== ${entry.day}`);
    }

    validatedLessons.push(`${entry.day}: ${entry.id}`);
  }

  return validatedLessons;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const lessons = await validateBundledLessons();
    for (const lesson of lessons) {
      console.log(`validated ${lesson}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Lesson validation failed: ${message}`);
    process.exitCode = 1;
  }
}
