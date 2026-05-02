import { describe, expect, it } from "vitest";

import {
  getDisplayQuestArcForDay,
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
      "ashenForge",
      "windspire",
      "clockworkCitadel",
      "starfallLibrary",
      "dragonSpine",
      "moonlitLabyrinth",
      "obsidianThrone",
      "dawnCitadel",
      "finalGate",
    ]);
    expect(getQuestArcForDay(1).id).toBe("noviceHall");
    expect(getQuestArcForDay(8).id).toBe("meadowRoad");
    expect(getQuestArcForDay(15).id).toBe("riverGate");
    expect(getQuestArcForDay(28).id).toBe("lanternKeep");
    expect(getQuestArcForDay(29).id).toBe("ashenForge");
    expect(getQuestArcForDay(49).id).toBe("clockworkCitadel");
    expect(getQuestArcForDay(90).id).toBe("finalGate");
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
    expect(isWeeklyTrialDay(90)).toBe(true);
    expect(isWeeklyTrialDay(22)).toBe(false);
  });

  it("identifies planned future weekly trials", () => {
    expect(getWeeklyTrialRuleForDay(35)).toEqual({
      day: 35,
      title: "Anvil Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    });
    expect(getWeeklyTrialRuleForDay(90)).toEqual({
      day: 90,
      title: "Last Spell Trial",
      sessionPromptCount: WEEKLY_TRIAL_PROMPT_COUNT,
    });
  });

  it("keeps post-game display anchored to the final arc", () => {
    expect(getDisplayQuestArcForDay(91).id).toBe("finalGate");
  });

  it("rejects days outside the 90-day quest map", () => {
    expect(() => getQuestArcForDay(0)).toThrow("No quest arc");
    expect(() => getQuestArcForDay(91)).toThrow("No quest arc");
  });
});
