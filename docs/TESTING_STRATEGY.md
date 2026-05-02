# Testing Strategy

## Goals

Tests should make KeyQuest safe to change quickly. The project should favor
small, deterministic tests around behavior and contracts over broad snapshots or
fragile terminal recordings.

Every meaningful change should answer: what behavior could break, and where is
that protected?

## Test Layers

### Unit Tests

Use unit tests for pure or nearly pure modules:

- scoring
- lesson parsing and validation
- progression rules
- achievement triggers
- scene transitions
- theme and color-mode resolution
- save encoding and migration transforms

Unit tests should be fast, deterministic, and colocated next to the module under
test as `*.test.ts`.

### Boundary Tests

Use boundary tests where KeyQuest touches the outside world:

- CLI argument parsing
- save store filesystem behavior
- normal vs development save modes
- corrupted or tampered saves
- locale catalog validation
- terminal capability detection

Boundary tests may use temporary directories and injected dependencies. They must
clean up after themselves.

### Integration Tests

Use integration tests for multi-module behavior that represents a real user
path:

- app startup
- title to story to status to practice scene flow
- a practice session producing a result
- save-load-resume behavior
- locale selection and fallback

Integration tests should still avoid real user input until the interactive
terminal layer stabilizes.

### Smoke Tests

Smoke tests are lightweight command-level checks. They should prove the package
starts and key modes do not crash.

Current manual smoke checks:

```bash
npm run dev -- --save-dir /tmp/keyquest-smoke-normal
npm run dev -- --dev --save-dir /tmp/keyquest-smoke-dev
```

Automate smoke tests once the CLI output stabilizes enough to avoid noisy churn.

### Regression Tests

Every bug fix should add a regression test unless the bug is purely cosmetic or
the test would be more brittle than useful. The regression test should fail
without the fix.

## Required Tests by Change Type

- Scoring, progression, achievements: unit tests for normal, edge, and failure
  cases.
- Save data: round-trip tests, tamper/corruption tests, migration tests, and
  normal/development mode tests.
- CLI options: parsing tests for valid aliases, invalid options, and defaults.
- Scenes: transition order and user-visible essential text.
- Terminal UI: semantic output, no-color behavior, reduced-motion behavior, and
  size handling.
- Localization: required key coverage and fallback behavior.
- Lessons: schema validation and representative valid/invalid fixtures.

Documentation-only changes do not need new tests, but `npm run verify` should
still pass.

## Determinism Rules

- Use fixed `Date` values or injected clocks.
- Use temporary directories for filesystem tests.
- Avoid shared mutable module state.
- Avoid real randomness in tests. Inject deterministic values.
- Do not depend on the user's home directory, locale, terminal size, or color
  support unless explicitly testing detection logic.
- Do not sleep in tests. Use fake timers or pure functions.

## Snapshot Policy

Snapshots are allowed only for stable, user-facing text where a snapshot improves
reviewability. Prefer direct assertions for important fields and messages.

Do not snapshot:

- ANSI escape-heavy output
- animation frames
- full save files with timestamps
- large scene output when a few assertions would be clearer

## Interactive Terminal Policy

Interactive raw-mode input should be wrapped behind small modules. Test the
state machine and rendering helpers directly before testing real terminal input.

When browser-like or pseudo-terminal automation is introduced, keep those tests
small and separate from fast unit tests.

## Coverage Expectations

Do not chase percentage coverage blindly. KeyQuest should instead keep strong
coverage on high-risk contracts:

- save compatibility and integrity
- scoring and progression math
- lesson validation
- achievement triggers
- CLI option behavior
- terminal fallback behavior

Coverage tooling can be added after the first playable loop, when the code shape
is stable enough for the metric to be useful.

## Test Commands

- `npm test`: run the full test suite once.
- `npm run test:watch`: run tests in watch mode while developing.
- `npm run verify`: typecheck, lint, format-check, and tests.

Run `npm run verify` before pushing or opening a PR.
