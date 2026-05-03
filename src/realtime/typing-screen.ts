import type { Translator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
import type { TimePressure, TimePressureResult } from "../practice/time-pressure.js";
import { styleText } from "../terminal/ansi.js";
import { renderFixedScreenLayout, resolveLayoutSize } from "../terminal/layout.js";
import { renderAsciiMeter, renderThresholdMeter } from "../terminal/meter.js";
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

export type RealtimeTypingPromptResult = {
  readonly actual: string;
  readonly timePressure?: TimePressureResult;
};

export async function runRealtimeTypingPrompt(options: {
  readonly prompt: PracticePrompt;
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly translator: Translator;
  readonly runtime?: TerminalRuntime | undefined;
  readonly timePressure?: TimePressure;
  readonly now?: () => number;
  readonly tickMs?: number;
}): Promise<RealtimeTypingPromptResult> {
  return options.input.withRawMode(async () => {
    let state = createTypingState(options.prompt.text);
    const now = options.now ?? Date.now;
    const tickMs = options.tickMs ?? 250;
    const startedAtMs = now();
    let lastRenderedSecond = -1;
    const getTiming = (): RealtimeTypingTiming | undefined =>
      resolveRealtimeTypingTiming({
        pressure: options.timePressure,
        elapsedMs: now() - startedAtMs,
      });
    const render = (): void => {
      const timing = getTiming();
      options.screen.render(
        renderRealtimeTypingScreen(
          state,
          options.prompt,
          options.translator,
          options.runtime,
          timing === undefined ? {} : { timing },
        ),
      );
    };

    render();

    while (state.status === "active") {
      const timing = getTiming();
      if (timing !== undefined && timing.remainingSeconds !== lastRenderedSecond) {
        lastRenderedSecond = timing.remainingSeconds;
        render();
      }

      const rawKey = await options.input.readKeyWithin(tickMs);
      if (rawKey === undefined) {
        continue;
      }
      if (rawKey === "\u000f" || rawKey === "\u001b") {
        throw new PracticeOptionsRequestedError();
      }

      const typingInput = toTypingInputFromKey(rawKey);
      if (typingInput === undefined) {
        continue;
      }

      state = applyTypingInput(state, typingInput);
      render();
    }

    if (state.status === "cancelled") {
      throw new Error("Practice cancelled");
    }

    const finalTiming = getTiming();

    return {
      actual: state.actual,
      ...(finalTiming === undefined
        ? {}
        : {
            timePressure: {
              limitSeconds: finalTiming.limitSeconds,
              kind: finalTiming.kind,
              expired: finalTiming.expired,
              completedWithinLimit: !finalTiming.expired,
            },
          }),
    };
  });
}

export function renderRealtimeTypingScreen(
  state: TypingState,
  prompt: PracticePrompt,
  translator: Translator,
  runtime?: TerminalRuntime,
  options: { readonly timing?: RealtimeTypingTiming } = {},
): readonly string[] {
  const views = deriveTypingCharacterViews(state);
  const viewport = resolveTypingViewport(state, runtime);
  return renderFixedScreenLayout({
    runtime,
    title: translator.t("realtime.heading"),
    status: [
      `Keys ${prompt.targetKeys.join(" ")}`,
      `Typed ${state.actual.length}/${prompt.text.length}`,
      ...(options.timing === undefined ? [] : [formatTimeStatus(options.timing, runtime)]),
    ],
    body: [
      "Target",
      `  ${formatTargetText(views, state, viewport, runtime)}`,
      `  ${formatTargetCursor(state, viewport)}`,
      "",
      "Typed",
      `  ${formatTypedText(state, viewport, runtime)}`,
      "",
      "Progress",
      `  ${formatTypingMeter(state, prompt, runtime)}`,
      `  ${formatCharacterProgress(views, viewport, runtime)}`,
    ],
    hints: [translator.t("realtime.controls")],
  });
}

type RealtimeTypingTiming = TimePressure & {
  readonly remainingSeconds: number;
  readonly elapsedSeconds: number;
  readonly expired: boolean;
};

function resolveRealtimeTypingTiming(options: {
  readonly pressure: TimePressure | undefined;
  readonly elapsedMs: number;
}): RealtimeTypingTiming | undefined {
  if (options.pressure === undefined) {
    return undefined;
  }

  const elapsedSeconds = Math.max(0, Math.floor(options.elapsedMs / 1000));
  const remainingSeconds = Math.max(0, options.pressure.limitSeconds - elapsedSeconds);

  return {
    ...options.pressure,
    elapsedSeconds,
    remainingSeconds,
    expired: elapsedSeconds > options.pressure.limitSeconds,
  };
}

function formatTimeStatus(
  timing: RealtimeTypingTiming,
  runtime: TerminalRuntime | undefined,
): string {
  const meter = renderThresholdMeter({
    current: timing.remainingSeconds,
    max: timing.limitSeconds,
    width: 8,
    runtime,
  });
  const label = timing.expired ? `Overtime ${meter}` : `Time ${meter} ${timing.remainingSeconds}s`;
  if (timing.expired) {
    return styleText(label, "danger", runtime);
  }
  if (timing.remainingSeconds <= 5) {
    return styleText(label, "warning", runtime);
  }

  return label;
}

function formatTypingMeter(
  state: TypingState,
  prompt: PracticePrompt,
  runtime: TerminalRuntime | undefined,
): string {
  return `${renderAsciiMeter({
    current: Math.min(state.actual.length, prompt.text.length),
    max: prompt.text.length,
    width: 18,
    fillToken: "xp",
    runtime,
  })} ${state.actual.length}/${prompt.text.length}`;
}

function formatTargetText(
  views: readonly TypingCharacterView[],
  state: TypingState,
  viewport: TypingViewport,
  runtime: TerminalRuntime | undefined,
): string {
  return views
    .filter((view) => view.index >= viewport.start && view.index < viewport.end)
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

function formatTargetCursor(state: TypingState, viewport: TypingViewport): string {
  if (state.status !== "active" || state.actual.length >= state.expected.length) {
    return "";
  }

  return `${" ".repeat(Math.max(0, state.actual.length - viewport.start))}^`;
}

function formatTypedText(
  state: TypingState,
  viewport: TypingViewport,
  runtime: TerminalRuntime | undefined,
): string {
  if (state.actual.length === 0) {
    return styleText("_", "cursor", runtime);
  }

  return state.actual.slice(viewport.start, viewport.end);
}

function formatCharacterProgress(
  views: readonly TypingCharacterView[],
  viewport: TypingViewport,
  runtime: TerminalRuntime | undefined,
): string {
  return views
    .filter((view) => view.index >= viewport.start && view.index < viewport.end)
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

type TypingViewport = {
  readonly start: number;
  readonly end: number;
};

function resolveTypingViewport(
  state: TypingState,
  runtime: TerminalRuntime | undefined,
): TypingViewport {
  const contentWidth = Math.max(1, resolveLayoutSize(runtime).columns - 2);
  const contentLength = Math.max(state.expected.length, state.actual.length);
  if (contentLength <= contentWidth) {
    return {
      start: 0,
      end: contentLength,
    };
  }

  const cursor = Math.min(state.actual.length, Math.max(0, contentLength - 1));
  const preferredStart = cursor - Math.floor(contentWidth * 0.65);
  const start = Math.min(Math.max(0, preferredStart), contentLength - contentWidth);

  return {
    start,
    end: start + contentWidth,
  };
}
