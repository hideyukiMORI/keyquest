import { describe, expect, it } from "vitest";

import { createTranslator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
import type { ScreenRenderer } from "../terminal/screen.js";
import type { RealtimeTypingInput } from "./input.js";
import { renderRealtimeTypingScreen, runRealtimeTypingPrompt } from "./typing-screen.js";
import { createTypingState } from "./typing-state.js";

describe("realtime typing screen", () => {
  it("renders prompt progress", () => {
    const translator = createTranslator("en");

    expect(
      renderRealtimeTypingScreen(createTypingState("f j"), createPrompt("f j"), translator),
    ).toEqual([
      "Real-time Practice",
      "",
      "Target: f j",
      "Input:  _",
      "",
      "...",
      "",
      "Enter to submit. Backspace edits. Ctrl+O opens options. Ctrl+C cancels.",
    ]);
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
    expect(screen.renders.join("\n")).toContain("Input:  fx");
    expect(screen.renders.at(-1)).toContain("Input:  f j");
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
