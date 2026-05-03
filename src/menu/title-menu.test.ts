import { describe, expect, it } from "vitest";

import { createInitialQuestResources, createNewSave } from "../save/model.js";
import { createTranslator } from "../i18n/messages.js";
import type { TerminalRuntime } from "../terminal/runtime.js";
import {
  parseLocaleChoice,
  parseTitleMenuAction,
  renderAchievementRecords,
  renderInGameHelp,
  renderJourneyProgress,
  renderLanguageOptions,
  renderResourceRecords,
  renderTitleRecords,
  renderTitleMenu,
} from "./title-menu.js";

describe("title menu", () => {
  it("renders planned menu slots for future new/load flows", () => {
    const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const lines = renderTitleMenu(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Start");
    expect(lines.join("\n")).toContain("Review Weak Keys");
    expect(lines.join("\n")).toContain("New Game");
    expect(lines.join("\n")).toContain("Load Game");
    expect(lines.join("\n")).not.toContain("Load Game (planned)");
    expect(lines.join("\n")).toContain("Help");
    expect(lines.join("\n")).toContain("Journey");
    expect(lines.join("\n")).toContain("Resources");
    expect(lines.join("\n")).toContain("Achievements");
    expect(lines.join("\n")).toContain("Titles");
  });

  it("renders a fixed-screen title summary with quest and controls", () => {
    const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const lines = renderTitleMenu(save, createTranslator("en"), {
      runtime: createRuntime({ columns: 80, rows: 24 }),
      selectedIndex: 0,
    });

    expect(lines[0]).toContain("KeyQuest");
    expect(lines[0]).toContain("Day 1");
    expect(lines.join("\n")).toContain("Quest");
    expect(lines.join("\n")).toContain("Novice Hall");
    expect(lines.join("\n")).toContain("> Start");
    expect(lines.join("\n")).toContain("j/k or arrows");
    expect(lines.length).toBeLessThanOrEqual(23);
  });

  it("parses title actions", () => {
    expect(parseTitleMenuAction("")).toBe("start");
    expect(parseTitleMenuAction("1")).toBe("start");
    expect(parseTitleMenuAction("2")).toBe("review");
    expect(parseTitleMenuAction("3")).toBe("options");
    expect(parseTitleMenuAction("4")).toBe("newGame");
    expect(parseTitleMenuAction("5")).toBe("loadGame");
    expect(parseTitleMenuAction("6")).toBe("help");
    expect(parseTitleMenuAction("help")).toBe("help");
    expect(parseTitleMenuAction("7")).toBe("journey");
    expect(parseTitleMenuAction("journey")).toBe("journey");
    expect(parseTitleMenuAction("8")).toBe("resources");
    expect(parseTitleMenuAction("9")).toBe("achievements");
    expect(parseTitleMenuAction("10")).toBe("titles");
  });

  it("renders in-game help", () => {
    const lines = renderInGameHelp(createTranslator("en"));

    expect(lines.join("\n")).toContain("How to Play");
    expect(lines.join("\n")).toContain("90-day journey");
    expect(lines.join("\n")).toContain("Press Enter to return to the title.");
  });

  it("renders journey progress", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 14,
        chapter: 2,
        storyFlag: "noviceHallStarted" as const,
      },
    };
    const lines = renderJourneyProgress(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Journey Progress");
    expect(lines.join("\n")).toContain("Day: 14/90");
    expect(lines.join("\n")).toContain("Arc: Meadow Road");
    expect(lines.join("\n")).toContain("Weekly Trial: Waystone Trial on Day 14");
    expect(lines.join("\n")).toContain("76 days remain");
  });

  it("renders final journey arc progress", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 90,
        chapter: 13,
        storyFlag: "noviceHallStarted" as const,
      },
    };
    const lines = renderJourneyProgress(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Arc: Final Gate");
    expect(lines.join("\n")).toContain("Weekly Trial: Last Spell Trial on Day 90");
    expect(lines.join("\n")).toContain("The final gate is open");
  });

  it("renders post-game goals in journey progress", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      journey: {
        day: 91,
        chapter: 14,
        storyFlag: "noviceHallStarted" as const,
      },
    };
    const lines = renderJourneyProgress(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Post-game roads are open.");
    expect(lines.join("\n")).toContain("Keep a 7-day streak: 0/7");
  });

  it("renders resource records", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      progress: {
        ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal").progress,
        resources: {
          ...createInitialQuestResources(),
          materials: {
            focusCrystal: 3,
            repairShard: 2,
          },
        },
      },
    };
    const lines = renderResourceRecords(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Resources");
    expect(lines.join("\n")).toContain("Focus Crystals 3");
    expect(lines.join("\n")).toContain("Equipment: Training Blade Grip Lv.0");
  });

  it("renders achievement and title records", () => {
    const save = {
      ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal"),
      progress: {
        ...createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal").progress,
        achievements: [{ id: "firstSession" as const, unlockedAt: "2026-01-01T00:00:00.000Z" }],
        titles: [
          {
            id: "noviceHallGraduate" as const,
            unlockedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    };

    expect(renderAchievementRecords(save, createTranslator("en")).join("\n")).toContain(
      "[x] First Steps",
    );
    expect(renderAchievementRecords(save, createTranslator("en")).join("\n")).toContain(
      "[ ] Flawless Focus",
    );
    expect(renderTitleRecords(save, createTranslator("en")).join("\n")).toContain(
      "[x] Novice Hall Graduate",
    );
  });

  it("renders and parses language choices", () => {
    const lines = renderLanguageOptions("en", createTranslator("en"));

    expect(lines.join("\n")).toContain("日本語");
    expect(parseLocaleChoice("2", "en")).toBe("ja");
    expect(parseLocaleChoice("ja", "en")).toBe("ja");
    expect(parseLocaleChoice("0", "ja")).toBe("ja");
  });
});

function createRuntime(options: {
  readonly columns: number;
  readonly rows: number;
}): TerminalRuntime {
  return {
    colorMode: "never",
    colorEnabled: false,
    screenEnabled: true,
    theme: "classic",
    reducedMotion: false,
    size: {
      columns: options.columns,
      rows: options.rows,
      isBelowMinimum: false,
    },
  };
}
