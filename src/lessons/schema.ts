import type { SkillTrackId } from "../save/model.js";

export const LESSON_SCHEMA_VERSION = 1;

const SKILL_TRACK_IDS = [
  "homePosition",
  "fingerResponsibility",
  "homeRow",
  "accuracy",
  "rhythm",
] as const satisfies readonly SkillTrackId[];

export type FingerId =
  | "leftPinky"
  | "leftRing"
  | "leftMiddle"
  | "leftIndex"
  | "rightIndex"
  | "rightMiddle"
  | "rightRing"
  | "rightPinky";

export type LessonPrompt = {
  readonly id: string;
  readonly text: string;
  readonly targetKeys: readonly string[];
  readonly skillIds: readonly SkillTrackId[];
  readonly fingerHints: readonly FingerId[];
};

export type Lesson = {
  readonly schemaVersion: typeof LESSON_SCHEMA_VERSION;
  readonly id: string;
  readonly title: string;
  readonly day: number;
  readonly locale: "en";
  readonly focus: readonly string[];
  readonly sessionPromptCount?: number;
  readonly prompts: readonly LessonPrompt[];
};

export function validateLesson(raw: unknown): Lesson {
  const value = asRecord(raw, "lesson");
  const schemaVersion = requireNumber(value, "schemaVersion");
  if (schemaVersion !== LESSON_SCHEMA_VERSION) {
    throw new Error(`Unsupported lesson schema version: ${schemaVersion}`);
  }

  const prompts = requireArray(value, "prompts").map((prompt, index) =>
    validateLessonPrompt(prompt, `prompts[${index}]`),
  );
  if (prompts.length === 0) {
    throw new Error("Lesson must include at least one prompt");
  }

  const sessionPromptCount = optionalPositiveInteger(value, "sessionPromptCount");

  return {
    schemaVersion: LESSON_SCHEMA_VERSION,
    id: requireString(value, "id"),
    title: requireString(value, "title"),
    day: requirePositiveInteger(value, "day"),
    locale: requireLiteral(value, "locale", "en"),
    focus: requireStringArray(value, "focus"),
    ...(sessionPromptCount === undefined ? {} : { sessionPromptCount }),
    prompts,
  };
}

function validateLessonPrompt(raw: unknown, path: string): LessonPrompt {
  const value = asRecord(raw, path);
  const text = requireString(value, "text");
  if (text.trim().length === 0) {
    throw new Error(`${path}.text must not be empty`);
  }

  const skillIds = requireStringArray(value, "skillIds").map((id) =>
    validateSkillTrackId(id, `${path}.skillIds`),
  );
  if (skillIds.length === 0) {
    throw new Error(`${path}.skillIds must include at least one skill`);
  }

  return {
    id: requireString(value, "id"),
    text,
    targetKeys: requireStringArray(value, "targetKeys"),
    skillIds,
    fingerHints: requireStringArray(value, "fingerHints").map((finger) =>
      validateFingerId(finger, `${path}.fingerHints`),
    ),
  };
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }

  return value as Record<string, unknown>;
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new Error(`${key} must be a string`);
  }

  return value;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number") {
    throw new Error(`${key} must be a number`);
  }

  return value;
}

function requirePositiveInteger(record: Record<string, unknown>, key: string): number {
  const value = requireNumber(record, key);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
}

function optionalPositiveInteger(record: Record<string, unknown>, key: string): number | undefined {
  if (record[key] === undefined) {
    return undefined;
  }

  return requirePositiveInteger(record, key);
}

function requireArray(record: Record<string, unknown>, key: string): readonly unknown[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new Error(`${key} must be an array`);
  }

  return value;
}

function requireStringArray(record: Record<string, unknown>, key: string): readonly string[] {
  return requireArray(record, key).map((value, index) => {
    if (typeof value !== "string") {
      throw new Error(`${key}[${index}] must be a string`);
    }

    return value;
  });
}

function requireLiteral<T extends string>(
  record: Record<string, unknown>,
  key: string,
  expected: T,
): T {
  const value = requireString(record, key);
  if (value !== expected) {
    throw new Error(`${key} must be ${expected}`);
  }

  return expected;
}

function validateSkillTrackId(value: string, path: string): SkillTrackId {
  if (!SKILL_TRACK_IDS.includes(value as SkillTrackId)) {
    throw new Error(`${path} contains unknown skill: ${value}`);
  }

  return value as SkillTrackId;
}

function validateFingerId(value: string, path: string): FingerId {
  const fingerIds = [
    "leftPinky",
    "leftRing",
    "leftMiddle",
    "leftIndex",
    "rightIndex",
    "rightMiddle",
    "rightRing",
    "rightPinky",
  ] as const satisfies readonly FingerId[];

  if (!fingerIds.includes(value as FingerId)) {
    throw new Error(`${path} contains unknown finger: ${value}`);
  }

  return value as FingerId;
}
