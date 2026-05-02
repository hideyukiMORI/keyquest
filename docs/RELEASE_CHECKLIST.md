# Release Checklist

Use this checklist before publishing a public KeyQuest release.

## Automated Checks

Run the full release check:

```sh
npm run release:check
```

This runs type checking, linting, formatting checks, bundled lesson validation,
unit tests, release-note draft generation, package build, tarball inspection, and
installed CLI smoke checks for `--version` and `--help`.

## Manual Checks

- Confirm `main` is synced with `origin/main`.
- Confirm the version in `package.json` is the intended release version.
- Review the `npm run release:notes` draft against `CHANGELOG.md`.
- Run the CLI manually in a real terminal and complete a short session.
- Check the title-menu flows: Help, Journey, Resources, Achievements, Titles,
  Options, Load Game, and New Game confirmation.
- Confirm `--no-color` and `--reduced-motion` remain readable.
- Confirm no local save data, development scripts, source files, tests, or docs
  are included in the npm tarball.

## Publish

1. Publish to npm with the intended access level.
2. Create a GitHub release for the same version.
3. Paste the reviewed release notes into the GitHub release.
4. Verify the published package with `npx keyquest --version`.
