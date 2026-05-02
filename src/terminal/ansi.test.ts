import { describe, expect, it } from "vitest";

import { styleText } from "./ansi.js";
import type { TerminalRuntime } from "./runtime.js";

describe("ANSI styling", () => {
  it("wraps text when color is enabled", () => {
    expect(styleText("KeyQuest", "accent", createRuntime(true))).toBe(
      "\u001b[93mKeyQuest\u001b[0m",
    );
  });

  it("returns plain text when color is disabled or default", () => {
    expect(styleText("KeyQuest", "accent", createRuntime(false))).toBe("KeyQuest");
    expect(styleText("KeyQuest", "accent", undefined)).toBe("KeyQuest");
  });
});

function createRuntime(colorEnabled: boolean): TerminalRuntime {
  return {
    colorMode: colorEnabled ? "always" : "never",
    colorEnabled,
    theme: "classic",
    reducedMotion: false,
    size: {
      columns: 100,
      rows: 30,
      isBelowMinimum: false,
    },
  };
}
