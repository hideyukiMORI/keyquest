# Coding Standards

## TypeScript

- Use strict TypeScript. Do not weaken strictness for convenience.
- Prefer `type` aliases for object shapes and unions. Use `interface` only when
  declaration merging or class implementation is specifically useful.
- Export explicit types at module boundaries. Internal helpers may rely on
  inference when the inferred type is obvious.
- Use `readonly` for data structures that should not be mutated.
- Avoid `any`. Model unknown data with `unknown` and narrow it deliberately.
- Prefer discriminated unions over boolean flag combinations when behavior
  branches by mode or state.
- Prefer pure functions for scoring, lesson validation, scene transitions,
  progression, and save transformations.
- Keep terminal I/O, filesystem access, clocks, randomness, and process arguments
  at the edges of the application.
- Use `Date` values or injected clocks for timing so tests stay deterministic.
- Keep imports type-only when importing only types.
- Keep path imports explicit with `.js` extensions for NodeNext output.

## Module Boundaries

- `src/core/`: pure typing, scoring, validation, and progression logic.
- `src/save/`: save model, encoding, decoding, and persistence.
- `src/scenes/`: scene state, scene rendering, and scene transitions.
- `src/cli/`: argument parsing and CLI option normalization.
- `src/index.ts`: executable entrypoint only; keep it thin.
- New side effects should be wrapped behind small modules and injected into pure
  logic where practical.
- Do not reach across modules for convenience if a small exported function or
  type would express the boundary better.

## Naming

- Files use kebab-case only when a name has multiple words; current short module
  names may stay singular, such as `store.ts` or `model.ts`.
- Types and classes use PascalCase.
- Functions, variables, and module constants use camelCase.
- Compile-time constants use SCREAMING_SNAKE_CASE only when they are true global
  constants, not ordinary local values.
- Boolean names should read as predicates, such as `isReady`, `hasSave`, or
  `shouldRender`.
- Avoid abbreviations except common CLI terms such as `id`, `xp`, `hp`, and `mp`.

## Errors

- Throw `Error` or a focused custom error. Do not throw strings.
- Error messages should be actionable and safe to show in a CLI.
- Catch errors only when adding context, converting to user-facing output, or
  recovering intentionally.
- Preserve unknown errors at boundaries by converting with
  `error instanceof Error ? error.message : String(error)`.
- Do not silently ignore errors. If an error is intentionally non-fatal, document
  the reason in the code path or test.

## Async and State

- Prefer `async`/`await` over raw promise chains.
- Keep async effects at the boundary and return plain data from core logic.
- Avoid shared mutable module state. Pass state through function arguments or
  explicit context objects.
- Do not mutate save data in place. Return updated copies.
- Avoid timers in tests unless using fake clocks or injected timing.

## CLI Design

- The CLI must remain keyboard-first.
- Favor readable terminal output over dense dashboards.
- Keep cross-platform behavior in mind before using terminal-specific features.
- Follow `docs/UI_SPEC.md` for terminal size, color mode, and theme behavior.
- Raw-mode input, ANSI escape sequences, and file paths should be wrapped behind
  small modules.
- Do not rely on color alone to communicate important state.
- Keep typing screens visually stable; place most animation before or after
  typing segments.

## Tests

- Follow `docs/TESTING_STRATEGY.md`.
- Add tests next to the module under test with `*.test.ts`.
- Test public behavior and contracts, not private implementation details.
- Use deterministic dates, temporary directories, and injected dependencies.
- For save and CLI code, test both normal and development modes.
- Add regression tests when fixing bugs unless the test would be more brittle
  than useful.
- Do not use broad snapshots for ANSI-heavy output, animation frames, or save
  files with timestamps.
- Run `npm run verify` before pushing.

## Formatting

- Run `npm run format` before committing broad formatting changes.
- Run `npm run verify` before pushing.
