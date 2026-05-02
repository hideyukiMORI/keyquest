import {
  LANTERN_KEEP_FINAL_DAY,
  MEADOW_ROAD_FINAL_DAY,
  NOVICE_HALL_FINAL_DAY,
  RIVER_GATE_FINAL_DAY,
} from "../lessons/manifest.js";
import type { KeyQuestSave, TitleRewardId, TitleRewardRecord } from "../save/model.js";

export type TitleRewardDefinition = {
  readonly id: TitleRewardId;
  readonly title: string;
};

export const TITLE_REWARDS: Readonly<Record<TitleRewardId, TitleRewardDefinition>> = {
  noviceHallGraduate: {
    id: "noviceHallGraduate",
    title: "Novice Hall Graduate",
  },
  meadowRoadPathfinder: {
    id: "meadowRoadPathfinder",
    title: "Meadow Road Pathfinder",
  },
  riverGateFerryman: {
    id: "riverGateFerryman",
    title: "River Gate Ferryman",
  },
  lanternKeepBeacon: {
    id: "lanternKeepBeacon",
    title: "Lantern Keep Beacon",
  },
};

export function unlockSessionTitles(options: {
  readonly save: KeyQuestSave;
  readonly unlockedAt: Date;
}): readonly TitleRewardRecord[] {
  const candidates: TitleRewardId[] = [
    options.save.journey.day === NOVICE_HALL_FINAL_DAY ? "noviceHallGraduate" : undefined,
    options.save.journey.day === MEADOW_ROAD_FINAL_DAY ? "meadowRoadPathfinder" : undefined,
    options.save.journey.day === RIVER_GATE_FINAL_DAY ? "riverGateFerryman" : undefined,
    options.save.journey.day === LANTERN_KEEP_FINAL_DAY ? "lanternKeepBeacon" : undefined,
  ].filter((id): id is TitleRewardId => id !== undefined);
  const existingTitleIds = new Set((options.save.progress.titles ?? []).map((title) => title.id));

  return candidates
    .filter((id) => !existingTitleIds.has(id))
    .map((id) => ({
      id,
      unlockedAt: options.unlockedAt.toISOString(),
    }));
}
