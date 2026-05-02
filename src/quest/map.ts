import {
  LANTERN_KEEP_FINAL_DAY,
  MEADOW_ROAD_FINAL_DAY,
  NOVICE_HALL_FINAL_DAY,
  RIVER_GATE_FINAL_DAY,
} from "../lessons/manifest.js";
import type { TitleRewardId } from "../save/model.js";

export type QuestArcId = "noviceHall" | "meadowRoad" | "riverGate" | "lanternKeep";

export type QuestArc = {
  readonly id: QuestArcId;
  readonly title: string;
  readonly startDay: number;
  readonly endDay: number;
  readonly theme: string;
  readonly trial: WeeklyTrialRule;
};

export type WeeklyTrialRule = {
  readonly day: number;
  readonly title: string;
  readonly sessionPromptCount: number;
  readonly rewardTitleId: TitleRewardId;
};

export const WEEKLY_TRIAL_PROMPT_COUNT = 4;

export const QUEST_ARCS: readonly QuestArc[] = [
  {
    id: "noviceHall",
    title: "Novice Hall",
    startDay: 1,
    endDay: NOVICE_HALL_FINAL_DAY,
    theme: "home position and finger ownership",
    trial: {
      day: NOVICE_HALL_FINAL_DAY,
      title: "Gatekeeper Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
      rewardTitleId: "noviceHallGraduate",
    },
  },
  {
    id: "meadowRoad",
    title: "Meadow Road",
    startDay: NOVICE_HALL_FINAL_DAY + 1,
    endDay: MEADOW_ROAD_FINAL_DAY,
    theme: "top-row reach",
    trial: {
      day: MEADOW_ROAD_FINAL_DAY,
      title: "Waystone Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
      rewardTitleId: "meadowRoadPathfinder",
    },
  },
  {
    id: "riverGate",
    title: "River Gate",
    startDay: MEADOW_ROAD_FINAL_DAY + 1,
    endDay: RIVER_GATE_FINAL_DAY,
    theme: "bottom row and punctuation",
    trial: {
      day: RIVER_GATE_FINAL_DAY,
      title: "Ferryman Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
      rewardTitleId: "riverGateFerryman",
    },
  },
  {
    id: "lanternKeep",
    title: "Lantern Keep",
    startDay: RIVER_GATE_FINAL_DAY + 1,
    endDay: LANTERN_KEEP_FINAL_DAY,
    theme: "number row",
    trial: {
      day: LANTERN_KEEP_FINAL_DAY,
      title: "Beacon Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
      rewardTitleId: "lanternKeepBeacon",
    },
  },
];

export function getQuestArcForDay(day: number): QuestArc {
  const arc = QUEST_ARCS.find((candidate) => day >= candidate.startDay && day <= candidate.endDay);
  if (arc === undefined) {
    throw new Error(`No quest arc is available for day ${day}`);
  }

  return arc;
}

export function getWeeklyTrialRuleForDay(day: number): WeeklyTrialRule | undefined {
  return getQuestArcForDay(day).trial.day === day ? getQuestArcForDay(day).trial : undefined;
}

export function isWeeklyTrialDay(day: number): boolean {
  return getWeeklyTrialRuleForDay(day) !== undefined;
}
