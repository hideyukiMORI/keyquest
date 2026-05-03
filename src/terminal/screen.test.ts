import { describe, expect, it } from "vitest";

import type { TextOutput } from "../cli/text-output.js";
import { createScreenRenderer, formatRedrawBody } from "./screen.js";
import type { TerminalRuntime } from "./runtime.js";

describe("screen renderer", () => {
  it("redraws the screen when terminal screen rendering is enabled", () => {
    const output = createMemoryOutput();
    createScreenRenderer({
      textOutput: output,
      runtime: createRuntime({ screenEnabled: true, rows: 24 }),
    }).render(["Title", "1. Start"]);

    expect(output.text()).toBe("\u001b[2J\u001b[HTitle\n1. Start\n");
  });

  it("falls back to plain output when screen rendering is disabled", () => {
    const output = createMemoryOutput();
    createScreenRenderer({
      textOutput: output,
      runtime: createRuntime({ screenEnabled: false, rows: 24 }),
    }).render(["Title", "1. Start"]);

    expect(output.text()).toBe("Title\n1. Start\n");
  });

  it("truncates redraw bodies to avoid terminal scrolling", () => {
    expect(
      formatRedrawBody(["a", "b", "c", "d"], createRuntime({ screenEnabled: true, rows: 3 })),
    ).toBe("a\n... 3 more lines");
  });

  it("resets terminal styles at every rendered line when color is enabled", () => {
    const output = createMemoryOutput();
    createScreenRenderer({
      textOutput: output,
      runtime: createRuntime({ screenEnabled: true, rows: 24, colorEnabled: true }),
    }).render(["\u001b[32mGreen", "Plain"]);

    expect(output.text()).toBe("\u001b[2J\u001b[H\u001b[32mGreen\u001b[0m\nPlain\u001b[0m\n");
  });
});

function createRuntime(options: {
  readonly screenEnabled: boolean;
  readonly rows: number;
  readonly colorEnabled?: boolean;
}): TerminalRuntime {
  return {
    colorMode: options.colorEnabled === true ? "always" : "never",
    colorEnabled: options.colorEnabled === true,
    screenEnabled: options.screenEnabled,
    theme: "classic",
    reducedMotion: false,
    size: {
      columns: 80,
      rows: options.rows,
      isBelowMinimum: false,
    },
  };
}

function createMemoryOutput(): TextOutput & { readonly text: () => string } {
  const chunks: string[] = [];

  return {
    write(text: string): void {
      chunks.push(text);
    },
    writeLine(text: string): void {
      chunks.push(`${text}\n`);
    },
    text(): string {
      return chunks.join("");
    },
  };
}
