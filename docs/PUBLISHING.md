# Publishing

## Goal

KeyQuest should be easy to try with `npx keyquest` once the first public release
is ready.

## Package Checks

Before publishing:

```sh
npm run verify
npm run package:smoke
```

`package:smoke` builds `dist/` and runs `npm pack --dry-run` so the package
contents can be inspected without publishing.

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
2. Update release notes and package version.
3. Run `npm run verify`.
4. Run `npm run package:smoke` and inspect the file list.
5. Publish with npm using the intended access level.
6. Create a GitHub release that links the changelog entry.
