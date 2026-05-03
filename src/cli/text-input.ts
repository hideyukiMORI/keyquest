import { createInterface, type Interface } from "node:readline";
import type { Readable, Writable } from "node:stream";

export type TextInput = {
  readonly readLine: (prompt: string) => Promise<string>;
  readonly close: () => void;
};

export function createNodeTextInput(options: {
  readonly input: Readable;
  readonly output: Writable;
}): TextInput {
  const queuedLines: string[] = [];
  let pendingRead: ((line: string) => void) | undefined;
  let pendingReject: ((error: Error) => void) | undefined;
  let isClosed = false;
  let readline: Interface | undefined;

  const ensureReadline = (): Interface => {
    if (readline !== undefined) {
      return readline;
    }

    readline = createInterface({
      input: options.input,
      output: options.output,
      terminal: false,
    });

    readline.on("line", (line) => {
      if (pendingRead !== undefined) {
        const resolve = pendingRead;
        pendingRead = undefined;
        pendingReject = undefined;
        resolve(line);
        return;
      }

      queuedLines.push(line);
    });
    readline.on("close", () => {
      isClosed = true;
      if (pendingReject !== undefined) {
        const reject = pendingReject;
        pendingRead = undefined;
        pendingReject = undefined;
        reject(new Error("No input received"));
      }
    });
    readline.on("error", (error) => {
      if (pendingReject !== undefined) {
        const reject = pendingReject;
        pendingRead = undefined;
        pendingReject = undefined;
        reject(error);
      }
    });

    return readline;
  };

  return {
    readLine(prompt: string): Promise<string> {
      ensureReadline();
      options.output.write(prompt);
      const queuedLine = queuedLines.shift();
      if (queuedLine !== undefined) {
        return Promise.resolve(queuedLine);
      }

      if (isClosed) {
        return Promise.reject(new Error("No input received"));
      }

      return new Promise((resolve, reject) => {
        pendingRead = resolve;
        pendingReject = reject;
      });
    },
    close(): void {
      readline?.close();
    },
  };
}
