import { parseTerminalColorMode, type TerminalColorMode } from "../terminal/runtime.js";

export type CliOptions = {
  readonly action: "run" | "help" | "version";
  readonly devMode: boolean;
  readonly saveDirectory: string | undefined;
  readonly lessonPath: string | undefined;
  readonly lessonPackPath: string | undefined;
  readonly colorMode: TerminalColorMode | undefined;
  readonly reducedMotion: boolean;
};

export function parseCliArgs(args: readonly string[]): CliOptions {
  let action: CliOptions["action"] = "run";
  let devMode = false;
  let saveDirectory: string | undefined;
  let lessonPath: string | undefined;
  let lessonPackPath: string | undefined;
  let colorMode: TerminalColorMode | undefined;
  let reducedMotion = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) {
      break;
    }

    if (arg === "--dev" || arg === "-dev") {
      devMode = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      action = "help";
      continue;
    }

    if (arg === "--version" || arg === "-v") {
      action = "version";
      continue;
    }

    if (arg === "--reduced-motion") {
      reducedMotion = true;
      continue;
    }

    if (arg === "--no-color") {
      colorMode = "never";
      continue;
    }

    if (arg === "--save-dir") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error("--save-dir requires a directory path");
      }

      saveDirectory = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--save-dir=")) {
      saveDirectory = arg.slice("--save-dir=".length);
      continue;
    }

    if (arg === "--lesson") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error("--lesson requires a file path");
      }

      lessonPath = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lesson=")) {
      lessonPath = arg.slice("--lesson=".length);
      continue;
    }

    if (arg === "--lesson-pack") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error("--lesson-pack requires a manifest file path");
      }

      lessonPackPath = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--lesson-pack=")) {
      lessonPackPath = arg.slice("--lesson-pack=".length);
      continue;
    }

    if (arg === "--color") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error("--color requires auto, always, or never");
      }

      colorMode = parseTerminalColorMode(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--color=")) {
      colorMode = parseTerminalColorMode(arg.slice("--color=".length));
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return {
    action,
    devMode,
    saveDirectory,
    lessonPath,
    lessonPackPath,
    colorMode,
    reducedMotion,
  };
}
