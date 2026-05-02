import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import { createTranslator } from "../i18n/messages.js";
import {
  parseLocaleChoice,
  parseTitleMenuAction,
  renderInGameHelp,
  renderJourneyProgress,
  renderLanguageOptions,
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

  it("renders and parses language choices", () => {
    const lines = renderLanguageOptions("en", createTranslator("en"));

    expect(lines.join("\n")).toContain("日本語");
    expect(parseLocaleChoice("2", "en")).toBe("ja");
    expect(parseLocaleChoice("ja", "en")).toBe("ja");
    expect(parseLocaleChoice("0", "ja")).toBe("ja");
  });
});
