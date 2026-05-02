import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type LessonPackManifestEntry = {
  readonly day: number;
  readonly path: string;
};

export type LessonPackManifest = {
  readonly version: 1;
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly LessonPackManifestEntry[];
};

export async function loadLessonPackManifest(path: string): Promise<LessonPackManifest> {
  const content = await readFile(path, "utf8");
  return validateLessonPackManifest(JSON.parse(content) as unknown);
}

export function getLessonPackLessonPath(
  manifest: LessonPackManifest,
  manifestPath: string,
  day: number,
): string {
  if (!Number.isInteger(day) || day < 1) {
    throw new Error(`Lesson pack day must be a positive integer: ${day}`);
  }

  const entry = manifest.lessons.find((lesson) => lesson.day === day);
  if (entry === undefined) {
    throw new Error(`Lesson pack ${manifest.id} does not include day ${day}`);
  }

  return resolve(dirname(manifestPath), entry.path);
}

export function validateLessonPackManifest(value: unknown): LessonPackManifest {
  if (typeof value !== "object" || value === null) {
    throw new Error("Lesson pack manifest must be an object");
  }

  const manifest = value as Partial<LessonPackManifest>;
  if (manifest.version !== 1) {
    throw new Error("Lesson pack manifest version must be 1");
  }
  if (typeof manifest.id !== "string" || manifest.id.length === 0) {
    throw new Error("Lesson pack manifest requires an id");
  }
  if (typeof manifest.title !== "string" || manifest.title.length === 0) {
    throw new Error("Lesson pack manifest requires a title");
  }
  if (!Array.isArray(manifest.lessons) || manifest.lessons.length === 0) {
    throw new Error("Lesson pack manifest requires at least one lesson");
  }

  return {
    version: 1,
    id: manifest.id,
    title: manifest.title,
    lessons: manifest.lessons.map(validateLessonPackManifestEntry),
  };
}

function validateLessonPackManifestEntry(value: unknown): LessonPackManifestEntry {
  if (typeof value !== "object" || value === null) {
    throw new Error("Lesson pack lesson entries must be objects");
  }

  const entry = value as Partial<LessonPackManifestEntry>;
  const day = entry.day;
  const path = entry.path;
  if (typeof day !== "number" || !Number.isInteger(day) || day < 1) {
    throw new Error("Lesson pack lesson entries require a positive integer day");
  }
  if (typeof path !== "string" || path.length === 0) {
    throw new Error("Lesson pack lesson entries require a path");
  }

  return {
    day,
    path,
  };
}
