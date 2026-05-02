# Changelog

All notable changes to KeyQuest will be documented here.

This project uses a lightweight manual changelog plus generated release-note
drafts from git history.

## Unreleased

- Added interactive menu navigation with `j`/`k`, arrow keys, Enter, and Space in TTY screen mode.
- Added an in-practice options shortcut so players can change language during a run.
- Fixed New Game so it preserves option settings such as the selected language.
- Added New Game confirmation before replacing an existing saved journey.
- Added a minimal Load Game action for the current saved journey.
- Added a README terminal transcript preview for the public CLI flow.
- Strengthened `npm run package:smoke` to install the packed tarball and run the CLI.
- Added an in-game Help screen from the title menu.
- Added `--help` and `--version` CLI output for non-interactive discovery.
- Added final Day 90 ending scene copy for the main journey completion state.
- Added `npm run release:notes` to draft release notes from commits since the
  latest tag.
- Added publishing docs that connect changelog updates, package smoke checks, and
  GitHub releases.

## Release Workflow

Before a release, run:

```sh
npm run release:notes
```

Use the draft to update this changelog, then link the final changelog section
from the GitHub release.
