import { describe, expect, it } from "vitest";

import type { TerminalRuntime } from "./runtime.js";
import { divider, fitScreenLines, padLine, resolveLayoutSize, truncateLine } from "./layout.js";

describe("terminal layout helpers", () => {
  it("resolves an 80x24-friendly renderable size by default", () => {
    expect(resolveLayoutSize(undefined)).toEqual({
      columns: 80,
      rows: 23,
    });
  });

  it("uses runtime size while reserving a prompt row", () => {
    expect(resolveLayoutSize(createRuntime({ columns: 100, rows: 30 }))).toEqual({
      columns: 100,
      rows: 29,
    });
  });

  it("truncates long lines with an ASCII marker", () => {
    expect(truncateLine("keep a calm rhythm", 12)).toBe("keep a ca...");
    expect(truncateLine("abcdef", 3)).toBe("...");
    expect(truncateLine("abcdef", 2)).toBe("..");
  });

  it("pads lines after truncating them", () => {
    expect(padLine("HP", 5)).toBe("HP   ");
    expect(padLine("accuracy", 6)).toBe("acc...");
  });

  it("creates ASCII dividers", () => {
    expect(divider(5)).toBe("-----");
    expect(divider(4, "=")).toBe("====");
    expect(divider(3, "")).toBe("---");
  });

  it("fits lines to the current screen height and width", () => {
    expect(
      fitScreenLines(["123456789012345678901", "b", "c", "d"], {
        runtime: createRuntime({ columns: 20, rows: 3 }),
      }),
    ).toEqual(["12345678901234567...", "... 3 more lines"]);
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
