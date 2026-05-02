# Coding Standards

## TypeScript

- Use strict TypeScript and explicit exported types.
- Prefer pure functions for scoring, lesson validation, and state transitions.
- Keep terminal I/O at the edges of the application.
- Avoid `any`; model unknown data with schemas or explicit validation.
- Use `Date` or injected clocks for timing so tests stay deterministic.

## CLI Design

- The CLI must remain keyboard-first.
- Favor readable terminal output over dense dashboards.
- Keep cross-platform behavior in mind before using terminal-specific features.
- Raw-mode input, ANSI escape sequences, and file paths should be wrapped behind
  small modules.

## Tests

- Unit test scoring, parsing, validation, and progression rules.
- Add integration or smoke tests for CLI behavior once the loop stabilizes.
- Do not over-test throwaway prototypes; convert useful prototypes into tested
  modules before they become foundation code.

## Formatting

- Run `npm run format` before committing broad formatting changes.
- Run `npm run verify` before pushing.
