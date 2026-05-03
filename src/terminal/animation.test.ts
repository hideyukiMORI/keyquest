import { describe, expect, it } from "vitest";

import type { TerminalRuntime } from "./runtime.js";
import type { ScreenRenderer } from "./screen.js";
import { renderLoadingFrame, runLoadingTextAnimation } from "./animation.js";

describe("terminal loading animations", () => {
  it("renders a compact loading frame", () => {
    expect(
      renderLoadingFrame({
        runtime: createRuntime({ reducedMotion: false }),
        title: "Preparing",
        message: "Calibrating rhythm",
        detail: "Prompt 1/3",
        frame: "*",
      }),
    ).toContain("  * Calibrating rhythm");
  });

  it("reduces animation to one frame when reduced motion is enabled", async () => {
    const screen = createMemoryScreen();
    await runLoadingTextAnimation({
      screen,
      runtime: createRuntime({ reducedMotion: true }),
      title: "Preparing",
      message: "Calibrating rhythm",
      frames: [".", "o"],
      sleep: async () => {},
    });

    expect(screen.renders).toHaveLength(1);
  });
});

function createRuntime(options: { readonly reducedMotion: boolean }): TerminalRuntime {
  return {
    colorMode: "never",
    colorEnabled: false,
    screenEnabled: true,
    theme: "classic",
    reducedMotion: options.reducedMotion,
    size: {
      columns: 80,
      rows: 24,
      isBelowMinimum: false,
    },
  };
}

function createMemoryScreen(): ScreenRenderer & { readonly renders: readonly string[] } {
  const renders: string[] = [];

  return {
    renders,
    render(lines: readonly string[] | string): void {
      renders.push(typeof lines === "string" ? lines : lines.join("\n"));
    },
  };
}
