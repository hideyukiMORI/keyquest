import type { TerminalRuntime } from "./runtime.js";
import { resolveTerminalTheme, type TerminalColorName, type TerminalColorToken } from "./theme.js";

export const ANSI_RESET = "\u001b[0m";

const ANSI_CODES: Readonly<Record<TerminalColorName, number | undefined>> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97,
  default: undefined,
};

export function styleText(
  text: string,
  token: TerminalColorToken,
  runtime: TerminalRuntime | undefined,
): string {
  if (runtime?.colorEnabled !== true) {
    return text;
  }

  const theme = resolveTerminalTheme(runtime.theme);
  const colorName = theme.colors[token];
  const code = ANSI_CODES[colorName];
  if (code === undefined) {
    return text;
  }

  return `\u001b[${code}m${text}${ANSI_RESET}`;
}
