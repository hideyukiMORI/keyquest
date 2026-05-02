import { describe, expect, it } from "vitest";

import { parseTerminalColorMode, resolveTerminalRuntime } from "./runtime.js";

describe("terminal runtime", () => {
  it("detects small terminals only when size is known", () => {
    expect(
      resolveTerminalRuntime({
        colorMode: undefined,
        theme: undefined,
        reducedMotion: false,
        columns: 79,
        rows: 24,
        isTty: true,
        env: {},
      }).size.isBelowMinimum,
    ).toBe(true);
    expect(
      resolveTerminalRuntime({
        colorMode: undefined,
        theme: undefined,
        reducedMotion: false,
        columns: undefined,
        rows: undefined,
        isTty: true,
        env: {},
      }).size.isBelowMinimum,
    ).toBe(false);
  });

  it("resolves color mode from CLI and environment", () => {
    expect(
      resolveTerminalRuntime({
        colorMode: "never",
        theme: undefined,
        reducedMotion: false,
        columns: 100,
        rows: 30,
        isTty: true,
        env: { FORCE_COLOR: "1" },
      }).colorEnabled,
    ).toBe(false);
    expect(
      resolveTerminalRuntime({
        colorMode: "auto",
        theme: undefined,
        reducedMotion: false,
        columns: 100,
        rows: 30,
        isTty: true,
        env: { NO_COLOR: "1" },
      }).colorEnabled,
    ).toBe(false);
    expect(
      resolveTerminalRuntime({
        colorMode: "auto",
        theme: undefined,
        reducedMotion: false,
        columns: 100,
        rows: 30,
        isTty: false,
        env: { FORCE_COLOR: "1" },
      }).colorEnabled,
    ).toBe(true);
  });

  it("parses supported color modes", () => {
    expect(parseTerminalColorMode("auto")).toBe("auto");
    expect(parseTerminalColorMode("always")).toBe("always");
    expect(parseTerminalColorMode("never")).toBe("never");
    expect(() => parseTerminalColorMode("sometimes")).toThrow("Unsupported color mode");
  });
});
