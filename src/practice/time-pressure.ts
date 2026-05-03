import type { PracticePrompt } from "./session.js";
import type { KeyQuestSave, SkillTrack } from "../save/model.js";

export type TimePressureKind = "soft" | "strict";

export type TimePressure = {
  readonly limitSeconds: number;
  readonly kind: TimePressureKind;
};

export type TimePressureResult = TimePressure & {
  readonly expired: boolean;
  readonly completedWithinLimit: boolean;
};

export function resolveTimePressure(options: {
  readonly save: KeyQuestSave;
  readonly prompt: PracticePrompt;
  readonly isReview: boolean;
}): TimePressure {
  const averageLevel = averagePromptSkillLevel(
    options.save.progress.skills,
    options.prompt.skillIds,
  );
  const day = options.save.journey.day;
  const targetCharactersPerSecond = 1.6 + Math.min(1.4, day * 0.035 + averageLevel * 0.12);
  const baseSeconds = Math.ceil(options.prompt.text.length / targetCharactersPerSecond) + 6;
  const reviewBonusSeconds = options.isReview ? 3 : 0;
  const limitSeconds = Math.max(8, baseSeconds + reviewBonusSeconds);
  const kind =
    options.isReview || day >= 14 || averageLevel >= 4 || options.prompt.text.length >= 42
      ? "strict"
      : "soft";

  return {
    limitSeconds,
    kind,
  };
}

export function resolveTimePressureResult(options: {
  readonly pressure: TimePressure | undefined;
  readonly elapsedSeconds: number;
}): TimePressureResult | undefined {
  if (options.pressure === undefined) {
    return undefined;
  }

  const expired = options.elapsedSeconds > options.pressure.limitSeconds;

  return {
    ...options.pressure,
    expired,
    completedWithinLimit: !expired,
  };
}

export function applyTimePressureXp(xp: number, result: TimePressureResult | undefined): number {
  if (result === undefined || !result.expired) {
    return xp;
  }

  const multiplier = result.kind === "strict" ? 0.8 : 0.9;

  return Math.max(1, Math.round(xp * multiplier));
}

function averagePromptSkillLevel(
  skills: readonly SkillTrack[],
  skillIds: readonly SkillTrack["id"][],
): number {
  const matchingLevels = skillIds
    .map((skillId) => skills.find((skill) => skill.id === skillId)?.level)
    .filter((level): level is number => level !== undefined);

  if (matchingLevels.length === 0) {
    return 1;
  }

  return matchingLevels.reduce((total, level) => total + level, 0) / matchingLevels.length;
}
