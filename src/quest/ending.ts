import type { KeyQuestSave } from "../save/model.js";

export const JOURNEY_ENDING_DAY = 90;

export type PostGameGoalId = "sevenDayStreak" | "perfectTen" | "focusCrystalCache";

export type PostGameGoal = {
  readonly id: PostGameGoalId;
  readonly current: number;
  readonly target: number;
  readonly completed: boolean;
};

export type JourneyEndingState =
  | {
      readonly status: "inProgress";
      readonly daysRemaining: number;
    }
  | {
      readonly status: "endingReady";
    }
  | {
      readonly status: "postGame";
      readonly goals: readonly PostGameGoal[];
    };

export function getJourneyEndingState(save: KeyQuestSave): JourneyEndingState {
  if (save.journey.day < JOURNEY_ENDING_DAY) {
    return {
      status: "inProgress",
      daysRemaining: JOURNEY_ENDING_DAY - save.journey.day,
    };
  }

  if (save.journey.day === JOURNEY_ENDING_DAY) {
    return {
      status: "endingReady",
    };
  }

  return {
    status: "postGame",
    goals: getPostGameGoals(save),
  };
}

export function getPostGameGoals(save: KeyQuestSave): readonly PostGameGoal[] {
  const perfectSessions = save.progress.sessions.filter((session) => session.accuracy === 1).length;
  const focusCrystals = save.progress.resources?.materials.focusCrystal ?? 0;

  return [
    createGoal("sevenDayStreak", save.progress.streakDays, 7),
    createGoal("perfectTen", perfectSessions, 10),
    createGoal("focusCrystalCache", focusCrystals, 25),
  ];
}

function createGoal(id: PostGameGoalId, current: number, target: number): PostGameGoal {
  return {
    id,
    current: Math.min(current, target),
    target,
    completed: current >= target,
  };
}
