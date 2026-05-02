export const TERMINAL_THEME_IDS = ["classic", "forest", "arcane", "ember", "mono"] as const;

export const TERMINAL_COLOR_TOKENS = [
  "background",
  "foreground",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
  "hp",
  "mp",
  "xp",
  "prompt",
  "typedCorrect",
  "typedWrong",
  "cursor",
] as const;

export type TerminalThemeId = (typeof TERMINAL_THEME_IDS)[number];

export type TerminalColorToken = (typeof TERMINAL_COLOR_TOKENS)[number];

export type TerminalColorName =
  | "black"
  | "blue"
  | "cyan"
  | "green"
  | "magenta"
  | "red"
  | "white"
  | "yellow"
  | "brightBlack"
  | "brightBlue"
  | "brightCyan"
  | "brightGreen"
  | "brightMagenta"
  | "brightRed"
  | "brightWhite"
  | "brightYellow"
  | "default";

export type TerminalTheme = {
  readonly id: TerminalThemeId;
  readonly colors: Readonly<Record<TerminalColorToken, TerminalColorName>>;
};

export const TERMINAL_THEMES: Readonly<Record<TerminalThemeId, TerminalTheme>> = {
  classic: {
    id: "classic",
    colors: {
      background: "default",
      foreground: "white",
      muted: "brightBlack",
      accent: "brightYellow",
      success: "green",
      warning: "yellow",
      danger: "red",
      hp: "brightRed",
      mp: "brightBlue",
      xp: "brightYellow",
      prompt: "brightWhite",
      typedCorrect: "green",
      typedWrong: "red",
      cursor: "brightWhite",
    },
  },
  forest: {
    id: "forest",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "yellow",
      success: "brightGreen",
      warning: "brightYellow",
      danger: "red",
      hp: "red",
      mp: "cyan",
      xp: "yellow",
      prompt: "green",
      typedCorrect: "brightGreen",
      typedWrong: "brightRed",
      cursor: "brightYellow",
    },
  },
  arcane: {
    id: "arcane",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "brightMagenta",
      success: "brightCyan",
      warning: "brightYellow",
      danger: "brightRed",
      hp: "magenta",
      mp: "brightCyan",
      xp: "brightMagenta",
      prompt: "brightBlue",
      typedCorrect: "cyan",
      typedWrong: "brightRed",
      cursor: "brightCyan",
    },
  },
  ember: {
    id: "ember",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "brightRed",
      success: "brightGreen",
      warning: "brightYellow",
      danger: "red",
      hp: "brightRed",
      mp: "brightYellow",
      xp: "yellow",
      prompt: "brightYellow",
      typedCorrect: "brightGreen",
      typedWrong: "red",
      cursor: "brightRed",
    },
  },
  mono: {
    id: "mono",
    colors: {
      background: "default",
      foreground: "white",
      muted: "brightBlack",
      accent: "brightWhite",
      success: "white",
      warning: "brightWhite",
      danger: "white",
      hp: "white",
      mp: "white",
      xp: "brightWhite",
      prompt: "brightWhite",
      typedCorrect: "white",
      typedWrong: "brightWhite",
      cursor: "brightWhite",
    },
  },
};

export function resolveTerminalTheme(themeId: string | undefined): TerminalTheme {
  if (themeId !== undefined && isTerminalThemeId(themeId)) {
    return TERMINAL_THEMES[themeId];
  }

  return TERMINAL_THEMES.classic;
}

export function isTerminalThemeId(themeId: string): themeId is TerminalThemeId {
  return TERMINAL_THEME_IDS.includes(themeId as TerminalThemeId);
}
