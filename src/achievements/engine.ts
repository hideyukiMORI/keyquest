import type {
  AchievementId,
  AchievementRecord,
  KeyQuestSave,
  SessionRecord,
} from "../save/model.js";

export type AchievementDefinition = {
  readonly id: AchievementId;
  readonly title: string;
};

export const ACHIEVEMENTS: Readonly<Record<AchievementId, AchievementDefinition>> = {
  firstSession: {
    id: "firstSession",
    title: "First Steps",
  },
  perfectSession: {
    id: "perfectSession",
    title: "Flawless Focus",
  },
};

export function unlockSessionAchievements(options: {
  readonly save: KeyQuestSave;
  readonly session: SessionRecord;
  readonly unlockedAt: Date;
}): readonly AchievementRecord[] {
  const candidates: AchievementId[] = [
    options.save.progress.sessions.length === 0 ? "firstSession" : undefined,
    options.session.mistakes.length === 0 ? "perfectSession" : undefined,
  ].filter((id): id is AchievementId => id !== undefined);
  const existingAchievementIds = new Set(
    (options.save.progress.achievements ?? []).map((achievement) => achievement.id),
  );

  return candidates
    .filter((id) => !existingAchievementIds.has(id))
    .map((id) => ({
      id,
      unlockedAt: options.unlockedAt.toISOString(),
    }));
}
