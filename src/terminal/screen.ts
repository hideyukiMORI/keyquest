import type { TextOutput } from "../cli/text-output.js";
import type { TerminalRuntime } from "./runtime.js";

export type ScreenRenderer = {
  readonly render: (lines: readonly string[] | string) => void;
};

const CLEAR_SCREEN_AND_HOME = "\u001b[2J\u001b[H";
const DEFAULT_SCREEN_ROWS = 24;
const RESERVED_PROMPT_ROWS = 1;

export function createScreenRenderer(options: {
  readonly textOutput: TextOutput;
  readonly runtime: TerminalRuntime | undefined;
}): ScreenRenderer {
  return {
    render(lines: readonly string[] | string): void {
      const renderedLines = normalizeLines(lines);
      const body =
        options.runtime?.screenEnabled === true
          ? formatRedrawBody(renderedLines, options.runtime)
          : renderedLines.join("\n");

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
  const maxRows = Math.max(1, (runtime?.size.rows ?? DEFAULT_SCREEN_ROWS) - RESERVED_PROMPT_ROWS);

  if (lines.length <= maxRows) {
    return lines.join("\n");
  }

  return [...lines.slice(0, maxRows - 1), `... ${lines.length - maxRows + 1} more lines`].join(
    "\n",
  );
}

function normalizeLines(lines: readonly string[] | string): readonly string[] {
  if (typeof lines === "string") {
    return lines.split("\n");
  }

  return lines;
}
