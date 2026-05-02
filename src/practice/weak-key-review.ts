import type { PracticePrompt } from "./session.js";
import type { FingerId } from "../lessons/schema.js";
import type { KeyQuestSave } from "../save/model.js";

export type WeakKeyStat = {
  readonly key: string;
  readonly mistakes: number;
};

const REVIEW_PROMPT_KEY_COUNT = 4;
const KEY_TO_FINGER: Readonly<Partial<Record<string, FingerId>>> = {
  q: "leftPinky",
  a: "leftPinky",
  z: "leftPinky",
  w: "leftRing",
  s: "leftRing",
  x: "leftRing",
  e: "leftMiddle",
  d: "leftMiddle",
  c: "leftMiddle",
  r: "leftIndex",
  t: "leftIndex",
  f: "leftIndex",
  g: "leftIndex",
  v: "leftIndex",
  b: "leftIndex",
  y: "rightIndex",
  u: "rightIndex",
  h: "rightIndex",
  j: "rightIndex",
  n: "rightIndex",
  m: "rightIndex",
  i: "rightMiddle",
  k: "rightMiddle",
  ",": "rightMiddle",
  o: "rightRing",
  l: "rightRing",
  ".": "rightRing",
  p: "rightPinky",
  ";": "rightPinky",
  "/": "rightPinky",
};

export function analyzeWeakKeys(save: KeyQuestSave): readonly WeakKeyStat[] {
  const counts = new Map<string, number>();

  for (const session of save.progress.sessions) {
    for (const mistake of session.mistakes) {
      const key = normalizeExpectedKey(mistake.expected);
      if (key === undefined) {
        continue;
      }

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([key, mistakes]) => ({ key, mistakes }))
    .sort((left, right) => right.mistakes - left.mistakes || left.key.localeCompare(right.key));
}

export function createWeakKeyReviewPrompt(save: KeyQuestSave): PracticePrompt | undefined {
  const weakKeys = analyzeWeakKeys(save)
    .filter((stat) => KEY_TO_FINGER[stat.key] !== undefined)
    .slice(0, REVIEW_PROMPT_KEY_COUNT);

  if (weakKeys.length === 0) {
    return undefined;
  }

  const targetKeys = weakKeys.map((stat) => stat.key);

  return {
    id: `weak-key-review-${targetKeys.join("-")}`,
    text: buildReviewText(targetKeys),
    targetKeys,
    skillIds: ["fingerResponsibility", "accuracy"],
    fingerHints: targetKeys.map((key) => KEY_TO_FINGER[key] ?? "leftIndex"),
  };
}

function normalizeExpectedKey(expected: string | null): string | undefined {
  if (expected === null || expected.trim().length === 0 || expected.length !== 1) {
    return undefined;
  }

  return expected.toLowerCase();
}

function buildReviewText(targetKeys: readonly string[]): string {
  const steadyRepeats = targetKeys.flatMap((key) => [key, key, key]);
  const alternatingPairs = targetKeys.flatMap((key, index) => {
    const nextKey = targetKeys[(index + 1) % targetKeys.length];

    return nextKey === undefined ? [] : [`${key}${nextKey}`, `${nextKey}${key}`];
  });

  return [...steadyRepeats, ...alternatingPairs].join(" ");
}
