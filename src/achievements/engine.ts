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
  threeDaysPact: {
    id: "threeDaysPact",
    title: "Three Days Pact",
  },
  unbrokenSeven: {
    id: "unbrokenSeven",
    title: "Unbroken 7",
  },
  moonCycle: {
    id: "moonCycle",
    title: "Moon Cycle",
  },
  longWatch: {
    id: "longWatch",
    title: "Long Watch",
  },
  deepDive: {
    id: "deepDive",
    title: "Deep Dive",
  },
  dungeonMarathon: {
    id: "dungeonMarathon",
    title: "Dungeon Marathon",
  },
};

const LONG_WATCH_SECONDS = 30 * 60;
const DEEP_DIVE_SECONDS = 60 * 60;
const DUNGEON_MARATHON_SECONDS = 3 * 60 * 60;

export function unlockSessionAchievements(options: {
  readonly save: KeyQuestSave;
  readonly session: SessionRecord;
  readonly unlockedAt: Date;
}): readonly AchievementRecord[] {
  const candidates: AchievementId[] = [
    options.save.progress.sessions.length === 0 ? "firstSession" : undefined,
    options.session.mistakes.length === 0 ? "perfectSession" : undefined,
    sessionElapsedSeconds(options.session) >= LONG_WATCH_SECONDS ? "longWatch" : undefined,
    sessionElapsedSeconds(options.session) >= DEEP_DIVE_SECONDS ? "deepDive" : undefined,
    sessionElapsedSeconds(options.session) >= DUNGEON_MARATHON_SECONDS
      ? "dungeonMarathon"
      : undefined,
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

function sessionElapsedSeconds(session: SessionRecord): number {
  return Math.max(
    0,
    (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000,
  );
}
