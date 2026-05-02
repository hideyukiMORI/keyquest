import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";

export type TextInput = {
  readonly readLine: (prompt: string) => Promise<string>;
  readonly close: () => void;
};

export function createNodeTextInput(options: {
  readonly input: Readable;
  readonly output: Writable;
}): TextInput {
  const readline = createInterface({
    input: options.input,
    output: options.output,
  });

  return {
    readLine(prompt: string): Promise<string> {
      return readline.question(prompt);
    },
    close(): void {
      readline.close();
    },
  };
}
