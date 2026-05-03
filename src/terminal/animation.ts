import { styleText } from "./ansi.js";
import { renderFixedScreenLayout } from "./layout.js";
import type { TerminalRuntime } from "./runtime.js";
import type { ScreenRenderer } from "./screen.js";

export type LoadingAnimationOptions = {
  readonly screen: ScreenRenderer;
  readonly runtime: TerminalRuntime | undefined;
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly frames?: readonly string[];
  readonly intervalMs?: number;
  readonly cycleCount?: number;
  readonly sleep?: (ms: number) => Promise<void>;
};

const DEFAULT_FRAMES = ["|", "/", "-", "\\"];

export async function runLoadingTextAnimation(options: LoadingAnimationOptions): Promise<void> {
  const frames = options.frames ?? DEFAULT_FRAMES;
  const intervalMs = options.intervalMs ?? 90;
  const cycleCount = options.runtime?.reducedMotion === true ? 1 : (options.cycleCount ?? 2);
  const sleep = options.sleep ?? defaultSleep;
  const totalFrames =
    options.runtime?.reducedMotion === true ? 1 : Math.max(1, frames.length * cycleCount);

  for (let index = 0; index < totalFrames; index += 1) {
    const frame = frames[index % frames.length] ?? ".";
    options.screen.render(renderLoadingFrame({ ...options, frame }));
    if (index < totalFrames - 1) {
      await sleep(intervalMs);
    }
  }
}

export function renderLoadingFrame(options: {
  readonly runtime: TerminalRuntime | undefined;
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly frame: string;
}): readonly string[] {
  return renderFixedScreenLayout({
    runtime: options.runtime,
    title: options.title,
    body: [
      "Signal",
      `  ${styleText(options.frame, "accent", options.runtime)} ${options.message}`,
      ...(options.detail === undefined ? [] : ["", "Detail", `  ${options.detail}`]),
    ],
  });
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
