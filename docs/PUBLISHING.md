# Publishing

## Goal

KeyQuest should be easy to try with `npx keyquest` once the first public release
is ready.

## Package Checks

Before publishing:

```sh
npm run release:check
```

`release:check` runs verification, release-note draft generation, and the package
smoke test.
`package:smoke` builds `dist/`, creates a local npm tarball, checks package file
boundaries, installs it into a temporary directory, and runs `keyquest --version`
plus `keyquest --help` from the installed package.
`release:notes` prints a draft from git history so `CHANGELOG.md` and the GitHub
release can stay aligned.

## Package Boundaries

The npm package includes:

- `dist/`: compiled CLI entrypoint and runtime modules.
- `lessons/`: bundled English typing lessons.
- `README.md`: quick start and project overview.
- `LICENSE`: license text.

Development-only sources, tests, docs, and local save data should stay out of the
published package unless they become part of the public user experience.

## Release Steps

1. Confirm `main` is green and synced with `origin/main`.
2. Update package version.
3. Run `npm run release:notes`.
4. Update `CHANGELOG.md` from the generated draft.
5. Run `npm run release:check` and confirm the installed CLI smoke passes.
6. Publish with npm using the intended access level.
7. Create a GitHub release that links the changelog entry.

For the final manual pass, use `docs/RELEASE_CHECKLIST.md`.
