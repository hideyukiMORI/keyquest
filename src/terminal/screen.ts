import type { TextOutput } from "../cli/text-output.js";
import { ANSI_RESET } from "./ansi.js";
import { fitScreenLines } from "./layout.js";
import type { TerminalRuntime } from "./runtime.js";

export type ScreenRenderer = {
  readonly render: (lines: readonly string[] | string) => void;
};

const CLEAR_SCREEN_AND_HOME = "\u001b[2J\u001b[H";

export function createScreenRenderer(options: {
  readonly textOutput: TextOutput;
  readonly runtime: TerminalRuntime | undefined;
}): ScreenRenderer {
  return {
    render(lines: readonly string[] | string): void {
      const renderedLines = normalizeLines(lines);
      const formattedBody =
        options.runtime?.screenEnabled === true
          ? formatRedrawBody(renderedLines, options.runtime)
          : renderedLines.join("\n");
      const body =
        options.runtime?.colorEnabled === true
          ? appendAnsiResetToLines(formattedBody)
          : formattedBody;

      if (options.runtime?.screenEnabled === true) {
        options.textOutput.write(`${CLEAR_SCREEN_AND_HOME}${body}\n`);
        return;
      }

      options.textOutput.writeLine(body);
    },
  };
}

export function formatRedrawBody(
  lines: readonly string[],
  runtime: TerminalRuntime | undefined,
): string {
  return fitScreenLines(lines, { runtime }).join("\n");
}

function appendAnsiResetToLines(text: string): string {
  return text
    .split("\n")
    .map((line) => `${line}${ANSI_RESET}`)
    .join("\n");
}

function normalizeLines(lines: readonly string[] | string): readonly string[] {
  if (typeof lines === "string") {
    return lines.split("\n");
  }

  return lines;
}
