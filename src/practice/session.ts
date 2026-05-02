import { unlockSessionAchievements } from "../achievements/engine.js";
import { scoreTypingResult, type Score } from "../core/scoring.js";
import { getLatestBundledLessonDay } from "../lessons/manifest.js";
import type {
  CharacterMistakeRecord,
  KeyQuestSave,
  SaveMode,
  SessionRecord,
  SkillTrack,
} from "../save/model.js";
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
  readonly mistakes: readonly CharacterMistakeRecord[];
  readonly xpGained: number;
  readonly updatedSave: KeyQuestSave;
};

export type PracticeAttempt = {
  readonly prompt: PracticePrompt;
  readonly actual: string;
  readonly startedAt: Date;
  readonly completedAt: Date;
};

export type PracticeAttemptResult = {
  readonly prompt: PracticePrompt;
  readonly actual: string;
  readonly score: Score;
  readonly mistakes: readonly CharacterMistakeRecord[];
  readonly xpGained: number;
};

export type PracticeRunResult = {
  readonly attempts: readonly PracticeAttemptResult[];
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
  const mistakes = collectCharacterMistakes(options.prompt, options.actual);
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
    mistakes,
  };

  return {
    prompt: options.prompt,
    actual: options.actual,
    score,
    mistakes,
    xpGained,
    updatedSave: applyPracticeResult({
      save: options.save,
      mode: options.mode,
      session,
      prompts: [options.prompt],
      completedAt: options.completedAt,
    }),
  };
}

export function completePracticeRun(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly attempts: readonly PracticeAttempt[];
}): PracticeRunResult {
  if (options.attempts.length === 0) {
    throw new Error("Practice run requires at least one attempt");
  }

  const attemptResults = options.attempts.map((attempt) => {
    const score = scoreTypingResult({
      expected: attempt.prompt.text,
      actual: attempt.actual,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    });

    return {
      prompt: attempt.prompt,
      actual: attempt.actual,
      score,
      mistakes: collectCharacterMistakes(attempt.prompt, attempt.actual),
      xpGained: calculatePracticeXp(score),
    };
  });
  const score = aggregateScores(attemptResults.map((result) => result.score));
  const xpGained = attemptResults.reduce((total, result) => total + result.xpGained, 0);
  const firstAttempt = options.attempts[0];
  const lastAttempt = options.attempts[options.attempts.length - 1];
  if (firstAttempt === undefined || lastAttempt === undefined) {
    throw new Error("Practice run requires at least one attempt");
  }

  const session: SessionRecord = {
    id: createSessionId(lastAttempt.completedAt),
    mode: options.mode,
    startedAt: firstAttempt.startedAt.toISOString(),
    completedAt: lastAttempt.completedAt.toISOString(),
    promptCount: options.attempts.length,
    accuracy: score.accuracy,
    wordsPerMinute: score.wordsPerMinute,
    xpGained,
    mistakes: attemptResults.flatMap((result) => result.mistakes),
  };

  return {
    attempts: attemptResults,
    score,
    xpGained,
    updatedSave: applyPracticeResult({
      save: options.save,
      mode: options.mode,
      session,
      prompts: options.attempts.map((attempt) => attempt.prompt),
      completedAt: lastAttempt.completedAt,
    }),
  };
}

export function calculatePracticeXp(score: Score): number {
  const accuracyBonus = Math.round(score.accuracy * 20);
  const characterXp = score.correctCharacters;
  const perfectBonus = score.mistakes === 0 && score.totalCharacters > 0 ? 10 : 0;

  return characterXp + accuracyBonus + perfectBonus;
}

export function collectCharacterMistakes(
  prompt: PracticePrompt,
  actual: string,
): readonly CharacterMistakeRecord[] {
  const mistakes: CharacterMistakeRecord[] = [];
  const comparableLength = Math.max(prompt.text.length, actual.length);

  for (let index = 0; index < comparableLength; index += 1) {
    const expected = prompt.text[index];
    const actualCharacter = actual[index];

    if (expected === actualCharacter) {
      continue;
    }

    mistakes.push({
      promptId: prompt.id,
      index,
      expected: expected ?? null,
      actual: actualCharacter ?? null,
    });
  }

  return mistakes;
}

function applyPracticeResult(options: {
  readonly save: KeyQuestSave;
  readonly mode: SaveMode;
  readonly session: SessionRecord;
  readonly prompts: readonly PracticePrompt[];
  readonly completedAt: Date;
}): KeyQuestSave {
  const trainedSkillIds = uniqueSkillIds(options.prompts.flatMap((prompt) => prompt.skillIds));
  const achievementUnlocks = unlockSessionAchievements({
    save: options.save,
    session: options.session,
    unlockedAt: options.completedAt,
  });
  const previousAchievements = options.save.progress.achievements ?? [];

  return {
    ...options.save,
    profile: {
      ...options.save.profile,
      updatedAt: options.completedAt.toISOString(),
    },
    journey: {
      ...options.save.journey,
      day: advanceJourneyDay(options.save.journey.day),
      storyFlag: "noviceHallStarted",
    },
    progress: {
      ...options.save.progress,
      totalXp: options.save.progress.totalXp + options.session.xpGained,
      streakDays: Math.max(1, options.save.progress.streakDays),
      sessions: [...options.save.progress.sessions, options.session],
      achievements: [...previousAchievements, ...achievementUnlocks],
      skills: updateSkillTracks(
        options.save.progress.skills,
        trainedSkillIds,
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

function aggregateScores(scores: readonly Score[]): Score {
  const totalCharacters = scores.reduce((total, score) => total + score.totalCharacters, 0);
  const correctCharacters = scores.reduce((total, score) => total + score.correctCharacters, 0);
  const mistakes = scores.reduce((total, score) => total + score.mistakes, 0);
  const elapsedSeconds = scores.reduce((total, score) => total + score.elapsedSeconds, 0);
  const accuracy = totalCharacters === 0 ? 1 : correctCharacters / totalCharacters;
  const wordsPerMinute = elapsedSeconds === 0 ? 0 : (correctCharacters / 5 / elapsedSeconds) * 60;

  return {
    totalCharacters,
    correctCharacters,
    mistakes,
    accuracy,
    wordsPerMinute,
    elapsedSeconds,
  };
}

export function advanceJourneyDay(currentDay: number): number {
  return Math.min(currentDay + 1, getLatestBundledLessonDay());
}

function uniqueSkillIds(skillIds: readonly SkillTrack["id"][]): readonly SkillTrack["id"][] {
  return [...new Set(skillIds)];
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
