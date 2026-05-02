import { scoreTypingResult, type Score } from "../core/scoring.js";
import type { KeyQuestSave, SaveMode, SessionRecord, SkillTrack } from "../save/model.js";
import type { FingerId } from "../lessons/schema.js";

export type PracticePrompt = {
  readonly id: string;
  readonly text: string;
  readonly skillIds: readonly SkillTrack["id"][];
  readonly targetKeys: readonly string[];
  readonly fingerHints: readonly FingerId[];
};

export type PracticeSessionResult = {
  readonly prompt: PracticePrompt;
  readonly actual: string;
  readonly score: Score;
  readonly xpGained: number;
  readonly updatedSave: KeyQuestSave;
};

export function completePracticeSession(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly prompt: PracticePrompt;
  readonly actual: string;
  readonly startedAt: Date;
  readonly completedAt: Date;
}): PracticeSessionResult {
  const score = scoreTypingResult({
    expected: options.prompt.text,
    actual: options.actual,
    startedAt: options.startedAt,
    completedAt: options.completedAt,
  });
  const xpGained = calculatePracticeXp(score);
  const session: SessionRecord = {
    id: createSessionId(options.completedAt),
    mode: options.mode,
    startedAt: options.startedAt.toISOString(),
    completedAt: options.completedAt.toISOString(),
    promptCount: 1,
    accuracy: score.accuracy,
    wordsPerMinute: score.wordsPerMinute,
    xpGained,
  };

  return {
    prompt: options.prompt,
    actual: options.actual,
    score,
    xpGained,
    updatedSave: applyPracticeResult({
      save: options.save,
      mode: options.mode,
      session,
      prompt: options.prompt,
      completedAt: options.completedAt,
    }),
  };
}

export function calculatePracticeXp(score: Score): number {
  const accuracyBonus = Math.round(score.accuracy * 20);
  const characterXp = score.correctCharacters;
  const perfectBonus = score.mistakes === 0 && score.totalCharacters > 0 ? 10 : 0;

  return characterXp + accuracyBonus + perfectBonus;
}

function applyPracticeResult(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly session: SessionRecord;
  readonly prompt: PracticePrompt;
  readonly completedAt: Date;
}): KeyQuestSave {
  return {
    ...options.save,
    profile: {
      ...options.save.profile,
      updatedAt: options.completedAt.toISOString(),
    },
    journey: {
      ...options.save.journey,
      storyFlag: "noviceHallStarted",
    },
    progress: {
      ...options.save.progress,
      totalXp: options.save.progress.totalXp + options.session.xpGained,
      streakDays: Math.max(1, options.save.progress.streakDays),
      sessions: [...options.save.progress.sessions, options.session],
      skills: updateSkillTracks(
        options.save.progress.skills,
        options.prompt.skillIds,
        options.session.xpGained,
      ),
    },
    development: {
      everUsedDevMode: options.save.development.everUsedDevMode || options.mode === "development",
      devSessions:
        options.mode === "development"
          ? options.save.development.devSessions + 1
          : options.save.development.devSessions,
    },
  };
}

function updateSkillTracks(
  skills: readonly SkillTrack[],
  trainedSkillIds: readonly SkillTrack["id"][],
  xpGained: number,
): readonly SkillTrack[] {
  const skillXp = Math.max(1, Math.floor(xpGained / Math.max(1, trainedSkillIds.length)));

  return skills.map((skill) => {
    if (!trainedSkillIds.includes(skill.id)) {
      return skill;
    }

    const nextXp = skill.xp + skillXp;

    return {
      ...skill,
      xp: nextXp,
      level: calculateLevel(nextXp),
    };
  });
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function createSessionId(completedAt: Date): string {
  return `session-${completedAt.toISOString()}`;
}
