export type CliOptions = {
  readonly devMode: boolean;
  readonly saveDirectory: string | undefined;
};

export function parseCliArgs(args: readonly string[]): CliOptions {
  let devMode = false;
  let saveDirectory: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) {
      break;
    }

    if (arg === "--dev" || arg === "-dev") {
      devMode = true;
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

    throw new Error(`Unknown option: ${arg}`);
  }

  return { devMode, saveDirectory };
}
