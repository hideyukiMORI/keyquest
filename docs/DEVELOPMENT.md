# Development Policy

## Operating Model

KeyQuest is developed Issue-first. Each meaningful change should start from a
GitHub Issue, produce a focused branch, pass local verification, and land through
a Pull Request unless the change is a small repository-maintenance update.

## Philosophy

- Practice value comes first. Game mechanics should reinforce accuracy, rhythm,
  recall, and review.
- The target first journey is 90 days of 10-minute daily practice, ending with a
  satisfying fantasy finale.
- Use roguelite and incremental systems to make practice motivating, but never
  let rewards hide the player's real weaknesses.
- Keep the terminal experience fast and calm. Avoid visual noise that makes
  typing harder.
- Prefer portable Node.js APIs before adding native dependencies.
- Treat lesson data as product content. It should be reviewed as carefully as
  code.
- Localize UI and story messages, but keep typing prompts in English across all
  locales.
- Optimize after measurement. A typing game is usually limited by terminal I/O
  and interaction design, not raw JavaScript speed.

## Git Workflow

- `main` should stay releasable.
- Use short-lived feature branches named `issue-N-short-name`.
- Commit when a coherent slice is complete and verified.
- Push branches and open PRs for reviewable work.
- Squash or merge according to what preserves the clearest history for that PR.

## Definition of Done

- The linked Issue has clear acceptance criteria.
- `npm run verify` passes locally.
- User-facing behavior is documented in `README.md` or `docs/` when relevant.
- New behavior has focused tests where the risk justifies it.
- Follow-up work is tracked in Issues or `docs/TODO.md`.

## Raw-Key TTY Workflow

Supported TTY flows should use raw key events and fixed-screen redraws. `readLine`
is reserved for non-TTY fallback, raw-mode-unavailable fallback, CLI-only prompts,
and tests that intentionally exercise line input.

Current `readLine` boundaries:

- Title and options selection fallback when raw-mode menus are unavailable.
- Practice input fallback when raw-mode typing is unavailable.
- New Game confirmation fallback outside supported TTY mode.
- Test helpers that simulate queued line input.

Do not add new `readLine` calls to supported TTY screen paths. Add a raw-key
state transition first, then keep line input only as the fallback.

## Manual TTY Smoke

Before a public release or substantial TUI change, run `npm run dev` in a real
terminal and verify:

- Start from the title menu with `j`/`k`, arrows, number shortcuts, Enter, and
  Space.
- Open Help, Journey, Resources, Achievements, and Titles, then return with
  Enter, Space, Escape, or `q` without a printed prompt line.
- Open Options from the title menu, change language with the fixed-screen menu,
  and return to Start.
- Try New Game with an existing save, cancel with `n` or Escape, then confirm
  with `y` or Enter.
- Complete a practice session using real-time typing, continue through segment
  results with Enter, and return from the final result with Enter.
- During practice, press `Ctrl+O` or Escape to open options, then continue.
- Press Ctrl+C from a menu, confirmation, and typing screen; the terminal should
  leave raw mode cleanly.
- Repeat with `--no-color` and a narrow terminal close to 80x24.
