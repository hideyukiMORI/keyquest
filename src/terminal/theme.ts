export const TERMINAL_THEME_IDS = ["classic", "forest", "arcane", "ember", "mono"] as const;

export const TERMINAL_COLOR_TOKENS = [
  "background",
  "foreground",
  "muted",
  "accent",
  "frame",
  "divider",
  "panelTitle",
  "success",
  "warning",
  "danger",
  "hp",
  "mp",
  "xp",
  "prompt",
  "input",
  "typedCorrect",
  "typedWrong",
  "cursor",
  "hint",
  "story",
  "reward",
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
      frame: "brightBlack",
      divider: "brightBlack",
      panelTitle: "brightYellow",
      success: "green",
      warning: "yellow",
      danger: "red",
      hp: "brightRed",
      mp: "brightBlue",
      xp: "brightYellow",
      prompt: "brightWhite",
      input: "white",
      typedCorrect: "green",
      typedWrong: "red",
      cursor: "brightWhite",
      hint: "brightBlack",
      story: "white",
      reward: "brightYellow",
    },
  },
  forest: {
    id: "forest",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "yellow",
      frame: "green",
      divider: "brightBlack",
      panelTitle: "yellow",
      success: "brightGreen",
      warning: "brightYellow",
      danger: "red",
      hp: "red",
      mp: "cyan",
      xp: "yellow",
      prompt: "green",
      input: "brightWhite",
      typedCorrect: "brightGreen",
      typedWrong: "brightRed",
      cursor: "brightYellow",
      hint: "brightBlack",
      story: "green",
      reward: "yellow",
    },
  },
  arcane: {
    id: "arcane",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "brightMagenta",
      frame: "magenta",
      divider: "brightBlack",
      panelTitle: "brightMagenta",
      success: "brightCyan",
      warning: "brightYellow",
      danger: "brightRed",
      hp: "magenta",
      mp: "brightCyan",
      xp: "brightMagenta",
      prompt: "brightBlue",
      input: "brightWhite",
      typedCorrect: "cyan",
      typedWrong: "brightRed",
      cursor: "brightCyan",
      hint: "brightBlack",
      story: "brightBlue",
      reward: "brightMagenta",
    },
  },
  ember: {
    id: "ember",
    colors: {
      background: "default",
      foreground: "brightWhite",
      muted: "brightBlack",
      accent: "brightRed",
      frame: "red",
      divider: "brightBlack",
      panelTitle: "brightRed",
      success: "brightGreen",
      warning: "brightYellow",
      danger: "red",
      hp: "brightRed",
      mp: "brightYellow",
      xp: "yellow",
      prompt: "brightYellow",
      input: "brightWhite",
      typedCorrect: "brightGreen",
      typedWrong: "red",
      cursor: "brightRed",
      hint: "brightBlack",
      story: "yellow",
      reward: "brightYellow",
    },
  },
  mono: {
    id: "mono",
    colors: {
      background: "default",
      foreground: "white",
      muted: "brightBlack",
      accent: "brightWhite",
      frame: "white",
      divider: "brightBlack",
      panelTitle: "brightWhite",
      success: "white",
      warning: "brightWhite",
      danger: "white",
      hp: "white",
      mp: "white",
      xp: "brightWhite",
      prompt: "brightWhite",
      input: "white",
      typedCorrect: "white",
      typedWrong: "brightWhite",
      cursor: "brightWhite",
      hint: "brightBlack",
      story: "white",
      reward: "brightWhite",
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
