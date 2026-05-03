import { describe, expect, it } from "vitest";

import { renderAsciiMeter, renderPercentMeter, renderThresholdMeter } from "./meter.js";
import type { TerminalRuntime } from "./runtime.js";

describe("terminal meters", () => {
  it("renders plain ASCII progress bars", () => {
    expect(renderAsciiMeter({ current: 3, max: 6, width: 10 })).toBe("[#####-----]");
    expect(renderPercentMeter({ ratio: 0.25, width: 8 })).toBe("[##------]");
  });

  it("clamps out-of-range values", () => {
    expect(renderAsciiMeter({ current: 20, max: 10, width: 4 })).toBe("[####]");
    expect(renderAsciiMeter({ current: -2, max: 10, width: 4 })).toBe("[----]");
  });

  it("colors filled and empty meter segments when color is enabled", () => {
    expect(
      renderThresholdMeter({
        current: 1,
        max: 4,
        width: 4,
        runtime: createRuntime(),
      }),
    ).toBe("[\u001b[31m#\u001b[0m\u001b[90m---\u001b[0m]");
  });
});

function createRuntime(): TerminalRuntime {
  return {
    colorMode: "always",
    colorEnabled: true,
    screenEnabled: true,
    theme: "classic",
    reducedMotion: false,
    size: {
      columns: 80,
      rows: 24,
      isBelowMinimum: false,
    },
  };
}
