import type { Translator } from "../i18n/messages.js";
import type { PracticePrompt } from "../practice/session.js";
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

export async function runRealtimeTypingPrompt(options: {
  readonly prompt: PracticePrompt;
  readonly input: RealtimeTypingInput;
  readonly screen: ScreenRenderer;
  readonly translator: Translator;
}): Promise<string> {
  return options.input.withRawMode(async () => {
    let state = createTypingState(options.prompt.text);
    options.screen.render(renderRealtimeTypingScreen(state, options.prompt, options.translator));

    while (state.status === "active") {
      const rawKey = await options.input.readKey();
      const typingInput = toTypingInputFromKey(rawKey);
      if (typingInput === undefined) {
        continue;
      }

      state = applyTypingInput(state, typingInput);
      options.screen.render(renderRealtimeTypingScreen(state, options.prompt, options.translator));
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
): readonly string[] {
  return [
    translator.t("realtime.heading"),
    "",
    translator.t("realtime.expected", { text: prompt.text }),
    translator.t("realtime.typed", { text: state.actual.length === 0 ? "_" : state.actual }),
    "",
    formatCharacterProgress(deriveTypingCharacterViews(state)),
    "",
    translator.t("realtime.controls"),
  ];
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
