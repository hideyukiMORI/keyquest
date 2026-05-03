import type { TypingInput } from "./typing-state.js";

export type RawModeStream = {
  readonly isTTY?: boolean;
  readonly setRawMode?: (enabled: boolean) => void;
  readonly resume?: () => void;
  readonly pause?: () => void;
};

export type RawModeController = {
  readonly enable: () => void;
  readonly disable: () => void;
  readonly resume?: () => void;
  readonly pause?: () => void;
};

export class RawModeUnavailableError extends Error {
  constructor(cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Raw mode is unavailable: ${message}`);
    this.name = "RawModeUnavailableError";
  }
}

export function isRawModeUnavailableError(error: unknown): error is RawModeUnavailableError {
  return error instanceof RawModeUnavailableError;
}

export async function withRawMode<T>(
  stream: RawModeStream,
  run: () => Promise<T> | T,
  options: { readonly force?: boolean; readonly controller?: RawModeController } = {},
): Promise<T> {
  if (options.controller !== undefined) {
    return withRawModeController(options.controller, run);
  }

  const setRawMode = stream.setRawMode;
  const shouldUseRawMode =
    (stream.isTTY === true || options.force === true) && setRawMode !== undefined;

  if (!shouldUseRawMode) {
    throw new RawModeUnavailableError("stream is not a TTY");
  }

  try {
    setRawMode(true);
  } catch (error) {
    throw new RawModeUnavailableError(error);
  }
  stream.resume?.();

  try {
    return await run();
  } finally {
    setRawMode(false);
    stream.pause?.();
  }
}

async function withRawModeController<T>(
  controller: RawModeController,
  run: () => Promise<T> | T,
): Promise<T> {
  try {
    controller.enable();
  } catch (error) {
    throw new RawModeUnavailableError(error);
  }
  controller.resume?.();

  try {
    return await run();
  } finally {
    controller.disable();
    controller.pause?.();
  }
}

export function toTypingInputFromKey(key: string): TypingInput | undefined {
  if (key === "\u0003") {
    return { kind: "cancel" };
  }

  if (key === "\r" || key === "\n") {
    return { kind: "submit" };
  }

  if (key === "\u007f" || key === "\b") {
    return { kind: "backspace" };
  }

  if (key.length === 1) {
    return {
      kind: "character",
      value: key,
    };
  }

  return undefined;
}
