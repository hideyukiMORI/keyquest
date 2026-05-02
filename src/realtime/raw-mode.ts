import type { TypingInput } from "./typing-state.js";

export type RawModeStream = {
  readonly isTTY?: boolean;
  readonly setRawMode?: (enabled: boolean) => void;
  readonly resume?: () => void;
  readonly pause?: () => void;
};

export async function withRawMode<T>(stream: RawModeStream, run: () => Promise<T> | T): Promise<T> {
  const setRawMode = stream.setRawMode;
  const shouldUseRawMode = stream.isTTY === true && setRawMode !== undefined;

  if (!shouldUseRawMode) {
    return run();
  }

  setRawMode(true);
  stream.resume?.();

  try {
    return await run();
  } finally {
    setRawMode(false);
    stream.pause?.();
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
