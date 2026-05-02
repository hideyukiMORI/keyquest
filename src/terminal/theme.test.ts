import { describe, expect, it } from "vitest";

import {
  TERMINAL_COLOR_TOKENS,
  TERMINAL_THEME_IDS,
  TERMINAL_THEMES,
  resolveTerminalTheme,
} from "./theme.js";

describe("terminal themes", () => {
  it("defines the initial theme set", () => {
    expect(TERMINAL_THEME_IDS).toEqual(["classic", "forest", "arcane", "ember", "mono"]);
  });

  it("keeps every theme on the same semantic token set", () => {
    for (const themeId of TERMINAL_THEME_IDS) {
      expect(Object.keys(TERMINAL_THEMES[themeId].colors).sort()).toEqual(
        [...TERMINAL_COLOR_TOKENS].sort(),
      );
    }
  });

  it("falls back to classic for unknown theme ids", () => {
    expect(resolveTerminalTheme("unknown").id).toBe("classic");
    expect(resolveTerminalTheme("arcane").id).toBe("arcane");
  });
});
