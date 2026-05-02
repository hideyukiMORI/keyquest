import { describe, expect, it } from "vitest";

import { validateLesson } from "./schema.js";

describe("validateLesson", () => {
  it("accepts a valid home-position lesson", () => {
    const lesson = validateLesson({
      schemaVersion: 1,
      id: "novice-hall-day-1",
      title: "Novice Hall: Home Position",
      day: 1,
      locale: "en",
      focus: ["home position"],
      prompts: [
        {
          id: "home-position-1",
          text: "f j",
          targetKeys: ["f", "j"],
          skillIds: ["homePosition", "fingerResponsibility"],
          fingerHints: ["leftIndex", "rightIndex"],
        },
      ],
    });

    expect(lesson.id).toBe("novice-hall-day-1");
    expect(lesson.prompts[0]?.text).toBe("f j");
  });

  it("rejects empty prompt lists", () => {
    expect(() =>
      validateLesson({
        schemaVersion: 1,
        id: "empty",
        title: "Empty",
        day: 1,
        locale: "en",
        focus: [],
        prompts: [],
      }),
    ).toThrow("at least one prompt");
  });

  it("rejects unknown skill ids", () => {
    expect(() =>
      validateLesson({
        schemaVersion: 1,
        id: "bad-skill",
        title: "Bad Skill",
        day: 1,
        locale: "en",
        focus: ["bad"],
        prompts: [
          {
            id: "bad",
            text: "f j",
            targetKeys: ["f", "j"],
            skillIds: ["speedOnly"],
            fingerHints: ["leftIndex", "rightIndex"],
          },
        ],
      }),
    ).toThrow("unknown skill");
  });
});
