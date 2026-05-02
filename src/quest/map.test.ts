import { describe, expect, it } from "vitest";

import {
  getQuestArcForDay,
  getWeeklyTrialRuleForDay,
  isWeeklyTrialDay,
  QUEST_ARCS,
  WEEKLY_TRIAL_PROMPT_COUNT,
} from "./map.js";

describe("quest map", () => {
  it("maps implemented days to weekly arcs", () => {
    expect(QUEST_ARCS.map((arc) => arc.id)).toEqual([
      "noviceHall",
      "meadowRoad",
      "riverGate",
      "lanternKeep",
    ]);
    expect(getQuestArcForDay(1).id).toBe("noviceHall");
    expect(getQuestArcForDay(8).id).toBe("meadowRoad");
    expect(getQuestArcForDay(15).id).toBe("riverGate");
    expect(getQuestArcForDay(28).id).toBe("lanternKeep");
  });

  it("identifies weekly trial days and prompt counts", () => {
    expect([7, 14, 21, 28].map((day) => getWeeklyTrialRuleForDay(day))).toEqual([
      {
        day: 7,
        title: "Gatekeeper Trial",
        sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
        rewardTitleId: "noviceHallGraduate",
      },
      {
        day: 14,
        title: "Waystone Trial",
        sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
        rewardTitleId: "meadowRoadPathfinder",
      },
      {
        day: 21,
        title: "Ferryman Trial",
        sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
        rewardTitleId: "riverGateFerryman",
      },
      {
        day: 28,
        title: "Beacon Trial",
        sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
        rewardTitleId: "lanternKeepBeacon",
      },
    ]);
    expect(isWeeklyTrialDay(7)).toBe(true);
    expect(isWeeklyTrialDay(22)).toBe(false);
  });

  it("rejects days without implemented quest arcs", () => {
    expect(() => getQuestArcForDay(0)).toThrow("No quest arc");
    expect(() => getQuestArcForDay(29)).toThrow("No quest arc");
  });
});
