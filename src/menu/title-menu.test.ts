import { describe, expect, it } from "vitest";

import { createNewSave } from "../save/model.js";
import { createTranslator } from "../i18n/messages.js";
import {
  parseLocaleChoice,
  parseTitleMenuAction,
  renderLanguageOptions,
  renderTitleMenu,
} from "./title-menu.js";

describe("title menu", () => {
  it("renders planned menu slots for future new/load flows", () => {
    const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");
    const lines = renderTitleMenu(save, createTranslator("en"));

    expect(lines.join("\n")).toContain("Start");
    expect(lines.join("\n")).toContain("New Game");
    expect(lines.join("\n")).toContain("Load Game");
  });

  it("parses start and options actions", () => {
    expect(parseTitleMenuAction("")).toBe("start");
    expect(parseTitleMenuAction("1")).toBe("start");
    expect(parseTitleMenuAction("2")).toBe("options");
  });

  it("renders and parses language choices", () => {
    const lines = renderLanguageOptions("en", createTranslator("en"));

    expect(lines.join("\n")).toContain("日本語");
    expect(parseLocaleChoice("2", "en")).toBe("ja");
    expect(parseLocaleChoice("ja", "en")).toBe("ja");
    expect(parseLocaleChoice("0", "ja")).toBe("ja");
  });
});
