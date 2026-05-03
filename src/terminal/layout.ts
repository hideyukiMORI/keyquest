import type { TerminalRuntime } from "./runtime.js";

export type TerminalLayoutSize = {
  readonly columns: number;
  readonly rows: number;
};

export type FitScreenLinesOptions = {
  readonly runtime: TerminalRuntime | undefined;
  readonly reservedRows?: number;
};

const DEFAULT_COLUMNS = 80;
const DEFAULT_ROWS = 24;
const DEFAULT_RESERVED_ROWS = 1;
const TRUNCATION_MARKER = "...";

export function resolveLayoutSize(
  runtime: TerminalRuntime | undefined,
  options: { readonly reservedRows?: number } = {},
): TerminalLayoutSize {
  const reservedRows = options.reservedRows ?? DEFAULT_RESERVED_ROWS;

  return {
    columns: Math.max(1, runtime?.size.columns ?? DEFAULT_COLUMNS),
    rows: Math.max(1, (runtime?.size.rows ?? DEFAULT_ROWS) - reservedRows),
  };
}

export function truncateLine(line: string, columns: number): string {
  const width = Math.max(0, columns);

  if (line.length <= width) {
    return line;
  }

  if (width <= TRUNCATION_MARKER.length) {
    return TRUNCATION_MARKER.slice(0, width);
  }

  return `${line.slice(0, width - TRUNCATION_MARKER.length)}${TRUNCATION_MARKER}`;
}

export function padLine(line: string, columns: number): string {
  const truncated = truncateLine(line, columns);

  return truncated.padEnd(Math.max(0, columns), " ");
}

export function divider(columns: number, glyph = "-"): string {
  const safeGlyph = glyph.length === 0 ? "-" : (glyph[0] ?? "-");

  return safeGlyph.repeat(Math.max(0, columns));
}

export function fitScreenLines(
  lines: readonly string[],
  options: FitScreenLinesOptions,
): readonly string[] {
  const size = resolveLayoutSize(
    options.runtime,
    options.reservedRows === undefined ? {} : { reservedRows: options.reservedRows },
  );
  const fittedLines = lines.map((line) => truncateLine(line, size.columns));

  if (fittedLines.length <= size.rows) {
    return fittedLines;
  }

  const hiddenLineCount = fittedLines.length - size.rows + 1;
  const overflowLine = truncateLine(`... ${hiddenLineCount} more lines`, size.columns);

  return [...fittedLines.slice(0, size.rows - 1), overflowLine];
}
