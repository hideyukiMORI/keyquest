import { describe, expect, it } from "vitest";

import { createTranslator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
import type { ScreenRenderer } from "../terminal/screen.js";
import type { TerminalRuntime } from "../terminal/runtime.js";
import type { RealtimeTypingInput } from "./input.js";
import { renderRealtimeTypingScreen, runRealtimeTypingPrompt } from "./typing-screen.js";
import { createTypingState } from "./typing-state.js";

describe("realtime typing screen", () => {
  it("renders prompt progress", () => {
    const translator = createTranslator("en");

    expect(
      renderRealtimeTypingScreen(createTypingState("f j"), createPrompt("f j"), translator),
    ).toEqual([
      "Real-time Practice                                           Keys f j  Typed 0/3",
      "--------------------------------------------------------------------------------",
      "Type",
      "  f j",
      "",
      "Input",
      "  _",
      "",
      "Progress",
      "  ...",
      "--------------------------------------------------------------------------------",
      "Enter to submit. Backspace edits. Ctrl+O opens options. Ctrl+C cancels.",
    ]);
  });

  it("keeps the realtime screen within fixed terminal bounds", () => {
    const translator = createTranslator("en");
    const lines = renderRealtimeTypingScreen(
      createTypingState("long prompt text"),
      createPrompt("long prompt text"),
      translator,
      createRuntime({ columns: 40, rows: 10 }),
    );

    expect(lines).toHaveLength(9);
    expect(lines.every((line) => line.length <= 40)).toBe(true);
    expect(lines.at(-1)).toBe("... 4 more lines");
  });

  it("collects character input until submit", async () => {
    const screen = createMemoryScreen();
    const input = createQueuedRealtimeInput(["f", "x", "\u007f", " ", "j", "\r"]);

    const actual = await runRealtimeTypingPrompt({
      prompt: createPrompt("f j"),
      input,
      screen,
      translator: createTranslator("en"),
    });

    expect(actual).toBe("f j");
    expect(input.rawCalls).toEqual(["start", "end"]);
    expect(screen.renders.join("\n")).toContain("Input\n  fx");
    expect(screen.renders.at(-1)).toContain("Input\n  f j");
  });

  it("throws when cancelled", async () => {
    const input = createQueuedRealtimeInput(["\u0003"]);

    await expect(
      runRealtimeTypingPrompt({
        prompt: createPrompt("f j"),
        input,
        screen: createMemoryScreen(),
        translator: createTranslator("en"),
      }),
    ).rejects.toThrow("Practice cancelled");
    expect(input.rawCalls).toEqual(["start", "end"]);
  });

  it("requests options from the realtime prompt", async () => {
    const input = createQueuedRealtimeInput(["\u000f"]);

    await expect(
      runRealtimeTypingPrompt({
        prompt: createPrompt("f j"),
        input,
        screen: createMemoryScreen(),
        translator: createTranslator("en"),
      }),
    ).rejects.toThrow("Practice options requested");
    expect(input.rawCalls).toEqual(["start", "end"]);
  });

  it("requests options from escape", async () => {
    const input = createQueuedRealtimeInput(["\u001b"]);

    await expect(
      runRealtimeTypingPrompt({
        prompt: createPrompt("f j"),
        input,
        screen: createMemoryScreen(),
        translator: createTranslator("en"),
      }),
    ).rejects.toThrow("Practice options requested");
    expect(input.rawCalls).toEqual(["start", "end"]);
  });
});

function createPrompt(text: string): PracticePrompt {
  return {
    id: "prompt-1",
    text,
    targetKeys: ["f", "j"],
    skillIds: ["homePosition"],
    fingerHints: ["leftIndex", "rightIndex"],
  };
}

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

function createQueuedRealtimeInput(
  keys: readonly string[],
): RealtimeTypingInput & { readonly rawCalls: readonly string[] } {
  const queue = [...keys];
  const rawCalls: string[] = [];

  return {
    rawCalls,
    readKey(): Promise<string> {
      const key = queue.shift();
      if (key === undefined) {
        return Promise.reject(new Error("No queued realtime key"));
      }

      return Promise.resolve(key);
    },
    async withRawMode<T>(run: () => Promise<T> | T): Promise<T> {
      rawCalls.push("start");
      try {
        return await run();
      } finally {
        rawCalls.push("end");
      }
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
