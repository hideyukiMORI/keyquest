import type { RealtimeTypingInput } from "../realtime/input.js";
import type { ScreenRenderer } from "../terminal/screen.js";

export type ScreenLoopResult = "continue" | "back" | "confirm" | "cancel" | "options" | "quit";

export async function waitForScreenKey(options: {
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly render: () => readonly string[];
}): Promise<Extract<ScreenLoopResult, "continue" | "back" | "quit">> {
  return options.input.withRawMode(async () => {
    options.screen.render(options.render());

    for (;;) {
      const key = await options.input.readKey();
      const result = toWaitResult(key);
      if (result !== undefined) {
        return result;
      }
    }
  });
}

export async function confirmWithScreenKeys(options: {
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly render: () => readonly string[];
}): Promise<Extract<ScreenLoopResult, "confirm" | "cancel" | "quit">> {
  return options.input.withRawMode(async () => {
    options.screen.render(options.render());

    for (;;) {
      const key = await options.input.readKey();
      const result = toConfirmResult(key);
      if (result !== undefined) {
        return result;
      }
    }
  });
}

function toWaitResult(
  key: string,
): Extract<ScreenLoopResult, "continue" | "back" | "quit"> | undefined {
  if (key === "\u0003") {
    return "quit";
  }
  if (key === "\r" || key === "\n" || key === " ") {
    return "continue";
  }
  if (key === "\u001b" || key === "q" || key === "Q") {
    return "back";
  }

  return undefined;
}

function toConfirmResult(
  key: string,
): Extract<ScreenLoopResult, "confirm" | "cancel" | "quit"> | undefined {
  if (key === "\u0003") {
    return "quit";
  }
  if (key === "y" || key === "Y" || key === "\r" || key === "\n") {
    return "confirm";
  }
  if (key === "n" || key === "N" || key === "\u001b" || key === "q" || key === "Q") {
    return "cancel";
  }

  return undefined;
}
