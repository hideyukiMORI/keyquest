import { describe, expect, it } from "vitest";

import { createTranslator } from "../i18n/messages.js";
import { createNewSave } from "../save/model.js";
import { renderPracticeJourneyProgress, renderPracticeRewards } from "./scenes.js";

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
});
