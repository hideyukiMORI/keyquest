import {
  LANTERN_KEEP_FINAL_DAY,
  MEADOW_ROAD_FINAL_DAY,
  NOVICE_HALL_FINAL_DAY,
  RIVER_GATE_FINAL_DAY,
} from "../lessons/manifest.js";
import type { TitleRewardId } from "../save/model.js";

export type QuestArcId =
  | "noviceHall"
  | "meadowRoad"
  | "riverGate"
  | "lanternKeep"
  | "ashenForge"
  | "windspire"
  | "clockworkCitadel"
  | "starfallLibrary"
  | "dragonSpine"
  | "moonlitLabyrinth"
  | "obsidianThrone"
  | "dawnCitadel"
  | "finalGate";

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
  readonly rewardTitleId?: TitleRewardId;
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
  {
    id: "ashenForge",
    title: "Ashen Forge",
    startDay: LANTERN_KEEP_FINAL_DAY + 1,
    endDay: 35,
    theme: "Shift keys and capital letters",
    trial: {
      day: 35,
      title: "Anvil Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "windspire",
    title: "Windspire",
    startDay: 36,
    endDay: 42,
    theme: "speed control and rhythm",
    trial: {
      day: 42,
      title: "Gale Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "clockworkCitadel",
    title: "Clockwork Citadel",
    startDay: 43,
    endDay: 49,
    theme: "programmer pairs and brackets",
    trial: {
      day: 49,
      title: "Gearheart Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "starfallLibrary",
    title: "Starfall Library",
    startDay: 50,
    endDay: 56,
    theme: "symbols, operators, and code-like flow",
    trial: {
      day: 56,
      title: "Archivist Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "dragonSpine",
    title: "Dragon Spine",
    startDay: 57,
    endDay: 63,
    theme: "accuracy under speed pressure",
    trial: {
      day: 63,
      title: "Wyrm Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "moonlitLabyrinth",
    title: "Moonlit Labyrinth",
    startDay: 64,
    endDay: 70,
    theme: "weak-key recovery and calm correction",
    trial: {
      day: 70,
      title: "Minotaur Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "obsidianThrone",
    title: "Obsidian Throne",
    startDay: 71,
    endDay: 77,
    theme: "mixed punctuation and long-form focus",
    trial: {
      day: 77,
      title: "Crown Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "dawnCitadel",
    title: "Dawn Citadel",
    startDay: 78,
    endDay: 84,
    theme: "full-keyboard mastery review",
    trial: {
      day: 84,
      title: "Dawn Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    },
  },
  {
    id: "finalGate",
    title: "Final Gate",
    startDay: 85,
    endDay: 90,
    theme: "final integrated typing quest",
    trial: {
      day: 90,
      title: "Last Spell Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
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

export function getDisplayQuestArcForDay(day: number): QuestArc {
  if (day < 1) {
    return getQuestArcForDay(day);
  }

  const arc = QUEST_ARCS.find((candidate) => day >= candidate.startDay && day <= candidate.endDay);
  if (arc !== undefined) {
    return arc;
  }

  const finalArc = QUEST_ARCS[QUEST_ARCS.length - 1];
  if (finalArc === undefined) {
    throw new Error("At least one quest arc is required");
  }

  return finalArc;
}

export function getWeeklyTrialRuleForDay(day: number): WeeklyTrialRule | undefined {
  return getQuestArcForDay(day).trial.day === day ? getQuestArcForDay(day).trial : undefined;
}

export function isWeeklyTrialDay(day: number): boolean {
  return getWeeklyTrialRuleForDay(day) !== undefined;
}
