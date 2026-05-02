import type { LocaleId } from "../i18n/messages.js";

export const SAVE_VERSION = 1;

export type SaveMode = "normal" | "development";

export type SkillTrackId =
  | "homePosition"
  | "fingerResponsibility"
  | "homeRow"
  | "accuracy"
  | "rhythm";

export type SkillTrack = {
  readonly id: SkillTrackId;
  readonly level: number;
  readonly xp: number;
};

export type AchievementId =
  | "firstSession"
  | "perfectSession"
  | "threeDaysPact"
  | "unbrokenSeven"
  | "moonCycle"
  | "longWatch"
  | "deepDive"
  | "dungeonMarathon";

export type AchievementRecord = {
  readonly id: AchievementId;
  readonly unlockedAt: string;
};

export type TitleRewardId =
  | "noviceHallGraduate"
  | "meadowRoadPathfinder"
  | "riverGateFerryman"
  | "lanternKeepBeacon";

export type TitleRewardRecord = {
  readonly id: TitleRewardId;
  readonly unlockedAt: string;
};

export type MaterialId = "focusCrystal" | "repairShard";

export type ItemId = "minorFocusPotion";

export type MagicId = "steadyBreath";

export type WeaponId = "trainingBlade";

export type CurseId = "rushedHands";

export type QuestResources = {
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
  readonly materials: Readonly<Record<MaterialId, number>>;
  readonly items: readonly ItemId[];
  readonly magic: readonly MagicId[];
  readonly weapons: readonly WeaponId[];
  readonly curses: readonly CurseId[];
};

export type SessionRecord = {
  readonly id: string;
  readonly mode: SaveMode;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly promptCount: number;
  readonly accuracy: number;
  readonly wordsPerMinute: number;
  readonly xpGained: number;
  readonly mistakes: readonly CharacterMistakeRecord[];
};

export type CharacterMistakeRecord = {
  readonly promptId: string;
  readonly index: number;
  readonly expected: string | null;
  readonly actual: string | null;
};

export type KeyQuestSave = {
  readonly version: typeof SAVE_VERSION;
  readonly profile: {
    readonly heroName: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly settings: {
    readonly locale: LocaleId;
    readonly colorMode: "auto" | "always" | "never";
    readonly theme: "classic" | "forest" | "arcane" | "ember" | "mono";
    readonly reducedMotion: boolean;
  };
  readonly journey: {
    readonly day: number;
    readonly chapter: number;
    readonly storyFlag: "newGame" | "noviceHallStarted";
  };
  readonly progress: {
    readonly totalXp: number;
    readonly streakDays: number;
    readonly sessions: readonly SessionRecord[];
    readonly skills: readonly SkillTrack[];
    readonly resources?: QuestResources;
    readonly achievements?: readonly AchievementRecord[];
    readonly titles?: readonly TitleRewardRecord[];
  };
  readonly development: {
    readonly everUsedDevMode: boolean;
    readonly devSessions: number;
  };
};

export function createNewSave(now: Date, mode: SaveMode): KeyQuestSave {
  const timestamp = now.toISOString();

  return {
    version: SAVE_VERSION,
    profile: {
      heroName: "Apprentice",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    settings: {
      locale: "en",
      colorMode: "auto",
      theme: "classic",
      reducedMotion: false,
    },
    journey: {
      day: 1,
      chapter: 1,
      storyFlag: "newGame",
    },
    progress: {
      totalXp: 0,
      streakDays: 0,
      sessions: [],
      achievements: [],
      titles: [],
      resources: createInitialQuestResources(),
      skills: [
        { id: "homePosition", level: 1, xp: 0 },
        { id: "fingerResponsibility", level: 1, xp: 0 },
        { id: "homeRow", level: 1, xp: 0 },
        { id: "accuracy", level: 1, xp: 0 },
        { id: "rhythm", level: 1, xp: 0 },
      ],
    },
    development: {
      everUsedDevMode: mode === "development",
      devSessions: 0,
    },
  };
}

export function createInitialQuestResources(): QuestResources {
  return {
    hp: 20,
    maxHp: 20,
    mp: 0,
    maxMp: 10,
    materials: {
      focusCrystal: 0,
      repairShard: 0,
    },
    items: [],
    magic: ["steadyBreath"],
    weapons: ["trainingBlade"],
    curses: [],
  };
}

export function touchSave(save: KeyQuestSave, now: Date, mode: SaveMode): KeyQuestSave {
  return {
    ...save,
    profile: {
      ...save.profile,
      updatedAt: now.toISOString(),
    },
    development: {
      everUsedDevMode: save.development.everUsedDevMode || mode === "development",
      devSessions: save.development.devSessions,
    },
  };
}

export function updateLocale(save: KeyQuestSave, locale: LocaleId, now: Date): KeyQuestSave {
  return {
    ...save,
    profile: {
      ...save.profile,
      updatedAt: now.toISOString(),
    },
    settings: {
      ...save.settings,
      locale,
    },
  };
}
