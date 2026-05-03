import type { Translator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
import { styleText } from "../terminal/ansi.js";
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
  const views = deriveTypingCharacterViews(state);
  return renderFixedScreenLayout({
    runtime,
    title: translator.t("realtime.heading"),
    status: [
      `Keys ${prompt.targetKeys.join(" ")}`,
      `Typed ${state.actual.length}/${prompt.text.length}`,
    ],
    body: [
      "Target",
      `  ${formatTargetText(views, state, runtime)}`,
      `  ${formatTargetCursor(state)}`,
      "",
      "Typed",
      `  ${formatTypedText(state, runtime)}`,
      "",
      "Progress",
      `  ${formatCharacterProgress(views, runtime)}`,
    ],
    hints: [translator.t("realtime.controls")],
  });
}

function formatTargetText(
  views: readonly TypingCharacterView[],
  state: TypingState,
  runtime: TerminalRuntime | undefined,
): string {
  return views
    .filter((view) => view.expected !== null)
    .map((view) => {
      const expected = view.expected ?? "";
      if (view.index === state.actual.length && state.status === "active") {
        return styleText(expected, "cursor", runtime);
      }
      if (view.state === "correct") {
        return styleText(expected, "typedCorrect", runtime);
      }
      if (view.state === "wrong") {
        return styleText(expected, "typedWrong", runtime);
      }

      return expected;
    })
    .join("");
}

function formatTargetCursor(state: TypingState): string {
  if (state.status !== "active" || state.actual.length >= state.expected.length) {
    return "";
  }

  return `${" ".repeat(state.actual.length)}^`;
}

function formatTypedText(state: TypingState, runtime: TerminalRuntime | undefined): string {
  if (state.actual.length === 0) {
    return styleText("_", "cursor", runtime);
  }

  return state.actual;
}

function formatCharacterProgress(
  views: readonly TypingCharacterView[],
  runtime: TerminalRuntime | undefined,
): string {
  return views
    .map((view) => {
      const shown = view.actual ?? view.expected ?? " ";
      if (view.state === "correct") {
        return styleText(shown, "typedCorrect", runtime);
      }
      if (view.state === "wrong") {
        return styleText("^", "typedWrong", runtime);
      }
      if (view.state === "extra") {
        return styleText("+", "warning", runtime);
      }

      return styleText(".", "muted", runtime);
    })
    .join("");
}
