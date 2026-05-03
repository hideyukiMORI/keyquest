import type { Readable } from "node:stream";

import { withRawMode, type RawModeStream } from "./raw-mode.js";

export type RealtimeTypingInput = {
  readonly readKey: () => Promise<string>;
  readonly withRawMode: <T>(run: () => Promise<T> | T) => Promise<T>;
};

export type RealtimeInputStream = Readable & RawModeStream;

export function createNodeRealtimeTypingInput(
  stream: RealtimeInputStream,
  options: { readonly forceRawMode?: boolean } = {},
): RealtimeTypingInput {
  return {
    readKey(): Promise<string> {
      return new Promise((resolve, reject) => {
        const onData = (chunk: Buffer | string): void => {
          cleanup();
          resolve(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
        };
        const onError = (error: Error): void => {
          cleanup();
          reject(error);
        };
        const cleanup = (): void => {
          stream.off("data", onData);
          stream.off("error", onError);
        };

        stream.on("data", onData);
        stream.on("error", onError);
      });
    },
    withRawMode<T>(run: () => Promise<T> | T): Promise<T> {
      return withRawMode(
        stream,
        run,
        options.forceRawMode === undefined ? {} : { force: options.forceRawMode },
      );
    },
  };
}
