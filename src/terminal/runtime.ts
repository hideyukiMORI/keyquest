import { resolveTerminalTheme, type TerminalThemeId } from "./theme.js";

export type TerminalColorMode = "auto" | "always" | "never";

export type TerminalSize = {
  readonly columns: number | undefined;
  readonly rows: number | undefined;
  readonly isBelowMinimum: boolean;
};

export type TerminalRuntime = {
  readonly colorMode: TerminalColorMode;
  readonly colorEnabled: boolean;
  readonly screenEnabled: boolean;
  readonly theme: TerminalThemeId;
  readonly reducedMotion: boolean;
  readonly size: TerminalSize;
};

export type TerminalRuntimeOptions = {
  readonly colorMode: TerminalColorMode | undefined;
  readonly theme: TerminalThemeId | undefined;
  readonly reducedMotion: boolean;
  readonly columns: number | undefined;
  readonly rows: number | undefined;
  readonly isTty: boolean;
  readonly env: Readonly<Record<string, string | undefined>>;
};

const MINIMUM_COLUMNS = 80;
const MINIMUM_ROWS = 24;

export function resolveTerminalRuntime(options: TerminalRuntimeOptions): TerminalRuntime {
  const colorMode = options.colorMode ?? "auto";
  const theme = resolveTerminalTheme(options.theme);

  return {
    colorMode,
    colorEnabled: resolveColorEnabled(colorMode, options),
    screenEnabled: options.isTty,
    theme: theme.id,
    reducedMotion: options.reducedMotion || options.env["KEYQUEST_REDUCED_MOTION"] === "1",
    size: {
      columns: options.columns,
      rows: options.rows,
      isBelowMinimum: isBelowMinimumSize(options.columns, options.rows),
    },
  };
}

export function parseTerminalColorMode(value: string): TerminalColorMode {
  if (value === "auto" || value === "always" || value === "never") {
    return value;
  }

  throw new Error(`Unsupported color mode: ${value}`);
}

function resolveColorEnabled(
  colorMode: TerminalColorMode,
  options: TerminalRuntimeOptions,
): boolean {
  if (colorMode === "never") {
    return false;
  }

  if (colorMode === "always") {
    return true;
  }

  if (options.env["NO_COLOR"] !== undefined) {
    return false;
  }

  if (options.env["FORCE_COLOR"] !== undefined) {
    return true;
  }

  return options.isTty;
}

function isBelowMinimumSize(columns: number | undefined, rows: number | undefined): boolean {
  if (columns === undefined || rows === undefined) {
    return false;
  }

  return columns < MINIMUM_COLUMNS || rows < MINIMUM_ROWS;
}
