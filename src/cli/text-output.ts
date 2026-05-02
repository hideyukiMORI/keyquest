import type { Writable } from "node:stream";

export type TextOutput = {
  readonly write: (text: string) => void;
  readonly writeLine: (text: string) => void;
};

export function createNodeTextOutput(output: Writable): TextOutput {
  return {
    write(text: string): void {
      output.write(text);
    },
    writeLine(text: string): void {
      output.write(`${text}\n`);
    },
  };
}
