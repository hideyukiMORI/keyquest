import type { Translator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
import { renderFixedScreenLayout } from "../terminal/layout.js";
import type { TerminalRuntime } from "../terminal/runtime.js";
import type { ScreenRenderer } from "../terminal/screen.js";
import type { RealtimeTypingInput } from "./input.js";
import { toTypingInputFromKey } from "./raw-mode.js";
import {
  applyTypingInput,
  createTypingState,
  deriveTypingCharacterViews,
  type TypingCharacterView,
  type TypingState,
} from "./typing-state.js";

export class PracticeOptionsRequestedError extends Error {
  constructor() {
    super("Practice options requested");
    this.name = "PracticeOptionsRequestedError";
  }
}

export function isPracticeOptionsRequestedError(
  error: unknown,
): error is PracticeOptionsRequestedError {
  return error instanceof PracticeOptionsRequestedError;
}

export async function runRealtimeTypingPrompt(options: {
  readonly prompt: PracticePrompt;
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly translator: Translator;
  readonly runtime?: TerminalRuntime | undefined;
}): Promise<string> {
  return options.input.withRawMode(async () => {
    let state = createTypingState(options.prompt.text);
    options.screen.render(
      renderRealtimeTypingScreen(state, options.prompt, options.translator, options.runtime),
    );

    while (state.status === "active") {
      const rawKey = await options.input.readKey();
      if (rawKey === "\u000f" || rawKey === "\u001b") {
        throw new PracticeOptionsRequestedError();
      }

      const typingInput = toTypingInputFromKey(rawKey);
      if (typingInput === undefined) {
        continue;
      }

      state = applyTypingInput(state, typingInput);
      options.screen.render(
        renderRealtimeTypingScreen(state, options.prompt, options.translator, options.runtime),
      );
    }

    if (state.status === "cancelled") {
      throw new Error("Practice cancelled");
    }

    return state.actual;
  });
}

export function renderRealtimeTypingScreen(
  state: TypingState,
  prompt: PracticePrompt,
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  return renderFixedScreenLayout({
    runtime,
    title: translator.t("realtime.heading"),
    status: [
      `Keys ${prompt.targetKeys.join(" ")}`,
      `Typed ${state.actual.length}/${prompt.text.length}`,
    ],
    body: [
      "Type",
      `  ${prompt.text}`,
      "",
      "Input",
      `  ${state.actual.length === 0 ? "_" : state.actual}`,
      "",
      "Progress",
      `  ${formatCharacterProgress(deriveTypingCharacterViews(state))}`,
    ],
    hints: [translator.t("realtime.controls")],
  });
}

function formatCharacterProgress(views: readonly TypingCharacterView[]): string {
  return views
    .map((view) => {
      const shown = view.actual ?? view.expected ?? " ";
      if (view.state === "correct") {
        return shown;
      }
      if (view.state === "wrong") {
        return "^";
      }
      if (view.state === "extra") {
        return "+";
      }

      return ".";
    })
    .join("");
}
