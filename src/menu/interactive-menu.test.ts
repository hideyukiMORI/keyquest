import { describe, expect, it } from "vitest";

import type { RealtimeTypingInput } from "../realtime/input.js";
import type { ScreenRenderer } from "../terminal/screen.js";
import { renderSelectableItems, runInteractiveMenu } from "./interactive-menu.js";

describe("interactive menu", () => {
  it("moves with j/k and selects with enter", async () => {
    const screen = createMemoryScreen();
    const input = createQueuedRealtimeInput(["j", "j", "k", "\r"]);

    const selected = await runInteractiveMenu({
      input,
      screen,
      items: [
        { value: "start", label: "Start" },
        { value: "options", label: "Options" },
        { value: "help", label: "Help" },
      ],
      render(selectedIndex) {
        return renderSelectableItems({
          items: [
            { value: "start", label: "Start" },
            { value: "options", label: "Options" },
            { value: "help", label: "Help" },
          ],
          selectedIndex,
        });
      },
    });

    expect(selected).toBe("options");
    expect(input.rawCalls).toEqual(["start", "end"]);
    expect(screen.renders.at(-1)).toContain("> Options");
  });

  it("selects by number for continuity with old menus", async () => {
    const selected = await runInteractiveMenu({
      input: createQueuedRealtimeInput(["2"]),
      screen: createMemoryScreen(),
      items: [
        { value: "start", label: "Start" },
        { value: "options", label: "Options" },
      ],
      render: () => ["menu"],
    });

    expect(selected).toBe("options");
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
        return Promise.reject(new Error("No queued realtime key"));
      }

      return Promise.resolve(key);
    },
    readKeyWithin(): Promise<string | undefined> {
      return Promise.resolve(queue.shift());
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
