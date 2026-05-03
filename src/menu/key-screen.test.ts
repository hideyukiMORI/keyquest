import { describe, expect, it } from "vitest";

import type { RealtimeTypingInput } from "../realtime/input.js";
import type { ScreenRenderer } from "../terminal/screen.js";
import { confirmWithScreenKeys, waitForScreenKey } from "./key-screen.js";

describe("raw-key screen helpers", () => {
  it("waits for enter-like keys on informational screens", async () => {
    const input = createQueuedRealtimeInput(["x", "\r"]);
    const screen = createMemoryScreen();

    await expect(
      waitForScreenKey({
        input,
        screen,
        render: () => ["Help", "[enter] return"],
      }),
    ).resolves.toBe("continue");
    expect(input.rawCalls).toEqual(["start", "end"]);
    expect(screen.renders).toEqual(["Help\n[enter] return"]);
  });

  it("maps escape and q to back", async () => {
    await expect(
      waitForScreenKey({
        input: createQueuedRealtimeInput(["q"]),
        screen: createMemoryScreen(),
        render: () => ["Records"],
      }),
    ).resolves.toBe("back");
  });

  it("confirms and cancels modal screens", async () => {
    await expect(
      confirmWithScreenKeys({
        input: createQueuedRealtimeInput(["y"]),
        screen: createMemoryScreen(),
        render: () => ["New Game?"],
      }),
    ).resolves.toBe("confirm");
    await expect(
      confirmWithScreenKeys({
        input: createQueuedRealtimeInput(["\u001b"]),
        screen: createMemoryScreen(),
        render: () => ["New Game?"],
      }),
    ).resolves.toBe("cancel");
  });
});

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
        return Promise.reject(new Error("No queued key"));
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
