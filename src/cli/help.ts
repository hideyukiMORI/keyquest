export function renderCliHelp(): string {
  return [
    "KeyQuest",
    "",
    "Usage:",
    "  keyquest [options]",
    "",
    "Options:",
    "  --help, -h                 Show this help message.",
    "  --version, -v              Show the package version.",
    "  --dev, -dev                Use readable development-mode save data.",
    "  --save-dir <path>          Store saves in a custom directory.",
    "  --lesson <path>            Run a single lesson file.",
    "  --lesson-pack <path>       Resolve journey lessons from a pack manifest.",
    "  --color <mode>             Use auto, always, or never.",
    "  --no-color                 Disable ANSI color.",
    "  --reduced-motion           Reduce terminal motion effects.",
    "",
    "Examples:",
    "  keyquest",
    "  keyquest --dev",
    "  keyquest --lesson ./lessons/novice-hall-day-1.json",
    "  keyquest --lesson-pack ./packs/home-row-extra/keyquest-pack.json",
  ].join("\n");
}

export function renderCliVersion(version: string): string {
  return `keyquest ${version}`;
}
