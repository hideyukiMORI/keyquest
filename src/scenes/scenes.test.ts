import { describe, expect, it } from "vitest";

import { createTranslator } from "../i18n/messages.js";
import { createNewSave } from "../save/model.js";
import {
  renderPracticeAchievements,
  renderPracticeJourneyProgress,
  renderPracticeRewards,
  renderPracticeStreakProgress,
  renderPracticeTitleRewards,
} from "./scenes.js";

describe("scene rendering", () => {
  it("renders skill XP and level-up rewards", () => {
    const beforeSave = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const afterSave = {
      ...beforeSave,
      progress: {
        ...beforeSave.progress,
        skills: beforeSave.progress.skills.map((skill) =>
          skill.id === "homePosition"
            ? {
                ...skill,
                xp: 100,
                level: 2,
              }
            : skill,
        ),
      },
    };

    expect(
      renderPracticeRewards(
        {
          beforeSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Rewards", "homePosition: +100 XP (Lv.2)", "Level up: homePosition Lv.2"]);
  });

  it("renders newly unlocked achievements", () => {
    const beforeSave = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const afterSave = {
      ...beforeSave,
      progress: {
        ...beforeSave.progress,
        achievements: [
          {
            id: "firstSession" as const,
            unlockedAt: "2026-01-01T00:00:10.000Z",
          },
        ],
      },
    };

    expect(
      renderPracticeAchievements(
        {
          beforeSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Achievements", "Unlocked: First Steps"]);
  });

  it("renders newly unlocked title rewards", () => {
    const beforeSave = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const afterSave = {
      ...beforeSave,
      progress: {
        ...beforeSave.progress,
        titles: [
          {
            id: "noviceHallGraduate" as const,
            unlockedAt: "2026-01-01T00:00:10.000Z",
          },
        ],
      },
    };

    expect(
      renderPracticeTitleRewards(
        {
          beforeSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Titles", "Earned title: Novice Hall Graduate"]);
  });

  it("renders the Meadow Road clear message on the Waystone Trial day", () => {
    const beforeSave = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 14,
        chapter: 2,
        storyFlag: "noviceHallStarted" as const,
      },
    };

    expect(
      renderPracticeJourneyProgress(
        {
          beforeSave,
          afterSave: beforeSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Journey", "Waystone Trial cleared. The Meadow Road opens into wider lands."]);
  });

  it("renders the River Gate clear message on the Ferryman Trial day", () => {
    const beforeSave = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 21,
        chapter: 3,
        storyFlag: "noviceHallStarted" as const,
      },
    };

    expect(
      renderPracticeJourneyProgress(
        {
          beforeSave,
          afterSave: beforeSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Journey", "Ferryman Trial cleared. The River Gate yields to your steady hands."]);
  });

  it("renders streak milestone progress", () => {
    const beforeSave = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      progress: {
        ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal").progress,
        streakDays: 2,
      },
    };
    const afterSave = {
      ...beforeSave,
      progress: {
        ...beforeSave.progress,
        streakDays: 3,
      },
    };

    expect(
      renderPracticeStreakProgress(
        {
          beforeSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Streak", "3 days in a row.", "Three days steady. The habit is taking root."]);
    expect(
      renderPracticeStreakProgress(
        {
          beforeSave: afterSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual([]);
  });

  it("renders journey progress only when the day advances", () => {
    const beforeSave = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const afterSave = {
      ...beforeSave,
      journey: {
        ...beforeSave.journey,
        day: 2,
      },
    };

    expect(
      renderPracticeJourneyProgress(
        {
          beforeSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Journey", "Next lesson: Day 2 is ready for next time."]);
    expect(
      renderPracticeJourneyProgress(
        {
          beforeSave: afterSave,
          afterSave,
        },
        createTranslator("en"),
      ),
    ).toEqual([]);
  });

  it("renders a Novice Hall clear message on the Gatekeeper Trial day", () => {
    const beforeSave = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 7,
        chapter: 1,
        storyFlag: "noviceHallStarted" as const,
      },
    };

    expect(
      renderPracticeJourneyProgress(
        {
          beforeSave,
          afterSave: beforeSave,
        },
        createTranslator("en"),
      ),
    ).toEqual(["Journey", "Gatekeeper Trial cleared. The Novice Hall opens the road ahead."]);
  });
});
