import type { TerminalRuntime } from "./runtime.js";

export type TerminalLayoutSize = {
  readonly columns: number;
  readonly rows: number;
};

export type FitScreenLinesOptions = {
  readonly runtime: TerminalRuntime | undefined;
  readonly reservedRows?: number;
};

export type FixedScreenLayoutOptions = {
  readonly runtime: TerminalRuntime | undefined;
  readonly title: string;
  readonly subtitle?: string;
  readonly status?: readonly string[];
  readonly body: readonly string[];
  readonly hints?: readonly string[];
  readonly footer?: string;
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

export function alignLine(left: string, right: string, columns: number): string {
  const width = Math.max(0, columns);

  if (right.length === 0) {
    return truncateLine(left, width);
  }

  const truncatedRight = truncateLine(right, width);
  const gapWidth = width - left.length - truncatedRight.length;

  if (gapWidth < 1) {
    return truncateLine(left, Math.max(0, width - truncatedRight.length - 1))
      .concat(" ")
      .concat(truncatedRight)
      .slice(0, width);
  }

  return `${left}${" ".repeat(gapWidth)}${truncatedRight}`;
}

export function renderFixedScreenLayout(options: FixedScreenLayoutOptions): readonly string[] {
  const reservedRowOptions =
    options.reservedRows === undefined ? {} : { reservedRows: options.reservedRows };
  const size = resolveLayoutSize(options.runtime, reservedRowOptions);
  const lines: string[] = [
    alignLine(options.title, options.status?.join("  ") ?? "", size.columns),
  ];

  if (options.subtitle !== undefined && options.subtitle.length > 0) {
    lines.push(truncateLine(options.subtitle, size.columns));
  }

  lines.push(divider(size.columns));
  lines.push(...options.body.map((line) => truncateLine(line, size.columns)));

  if ((options.hints?.length ?? 0) > 0 || options.footer !== undefined) {
    lines.push(divider(size.columns));
  }

  if ((options.hints?.length ?? 0) > 0) {
    lines.push(truncateLine(options.hints?.join("  ") ?? "", size.columns));
  }

  if (options.footer !== undefined && options.footer.length > 0) {
    lines.push(truncateLine(options.footer, size.columns));
  }

  return fitScreenLines(lines, {
    runtime: options.runtime,
    ...reservedRowOptions,
  });
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
