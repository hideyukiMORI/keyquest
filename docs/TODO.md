# TODO

## Now

- [x] Define the short multi-prompt session model: session length, prompt count,
      breakpoints, and result timing.
- [x] Add a session runner that can process multiple prompts before the final
      result screen.
- [x] Record per-character mistakes in session results for future weak-key
      review.
- [x] Clarify title menu semantics for current `Start` and future `Continue`,
      `New Game`, and `Load Game`.
- [ ] Keep `main` green with `npm run verify`.

## Next

- [x] Design the terminal UI runtime boundary for screen rendering, color, size,
      and motion.
- [x] Add terminal capability detection for size and color support.
- [x] Add `--color`, `--no-color`, and reduced-motion option handling.
- [x] Add five semantic color themes: classic, forest, arcane, ember, and mono.
- [x] Build a one-prompt raw-mode typing spike behind a testable state machine.
- [x] Add safe terminal cleanup for Ctrl+C and interrupted raw-mode sessions.
- [ ] Add a first reward screen with skill XP and a simple level-up message.
- [ ] Draft the first 7-day training cycle.

## Mid Term

- [ ] Design [#4](https://github.com/hideyukiMORI/keyquest/issues/4): adventure progression.
- [ ] Design [#9](https://github.com/hideyukiMORI/keyquest/issues/9): achievement engine and first achievement set.
- [ ] Add HP, MP, XP, item, magic, weapon, and curse models.
- [ ] Add weekly boss quest rules.
- [ ] Add weak-key review quests.
- [ ] Add Chinese, Korean, Spanish, and Portuguese UI catalogs.

## Long Term

- [ ] Add roguelite quest modifiers.
- [ ] Add incremental equipment upgrades and crafting materials.
- [ ] Add 90-day ending and post-game practice goals.
- [ ] Add importable lesson packs.
- [ ] Prepare npm publishing.
- [ ] Add release notes and changelog automation.
