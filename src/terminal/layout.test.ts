import { describe, expect, it } from "vitest";

import type { TerminalRuntime } from "./runtime.js";
import {
  alignLine,
  divider,
  fitScreenLines,
  padLine,
  renderFixedScreenLayout,
  resolveLayoutSize,
  truncateLine,
} from "./layout.js";

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

  it("aligns left and right header content within a fixed width", () => {
    expect(alignLine("KEYQUEST", "HP 18/20", 24)).toBe("KEYQUEST        HP 18/20");
    expect(alignLine("Very Long Screen Title", "XP 42", 16)).toBe("Very Lo... XP 42");
  });

  it("renders fixed-screen sections with header, divider, hints, and footer", () => {
    expect(
      renderFixedScreenLayout({
        runtime: createRuntime({ columns: 32, rows: 12 }),
        title: "KEYQUEST",
        subtitle: "Terminal typing adventure",
        status: ["Day 12", "XP 820"],
        body: ["Quest", "  Waystone Trail", "", "Menu", "> Start Daily Quest"],
        hints: ["[j/k] move", "[enter] select"],
        footer: "Ready.",
      }),
    ).toEqual([
      "KEYQUEST          Day 12  XP 820",
      "Terminal typing adventure",
      "--------------------------------",
      "Quest",
      "  Waystone Trail",
      "",
      "Menu",
      "> Start Daily Quest",
      "--------------------------------",
      "[j/k] move  [enter] select",
      "Ready.",
    ]);
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
