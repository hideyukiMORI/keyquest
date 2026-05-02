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
- [x] Keep `main` green with `npm run verify`.
- [x] Add Novice Hall lessons for Day 2 through Day 7.
- [x] Add the first post-Novice-Hall Day 8 lesson.
- [x] Add Meadow Road Day 9 and Day 10 lessons.
- [x] Add Day 11 through Day 14 Meadow Road lessons.
- [x] Add Day 15 through Day 21 lessons.
- [x] Resolve the default lesson from the saved journey day.
- [x] Advance journey day after completed sessions, capped at bundled lessons.

## Next

- [x] Design the terminal UI runtime boundary for screen rendering, color, size,
      and motion.
- [x] Add terminal capability detection for size and color support.
- [x] Add `--color`, `--no-color`, and reduced-motion option handling.
- [x] Add five semantic color themes: classic, forest, arcane, ember, and mono.
- [x] Connect semantic theme tokens to ANSI heading and warning rendering.
- [x] Build a one-prompt raw-mode typing spike behind a testable state machine.
- [x] Add safe terminal cleanup for Ctrl+C and interrupted raw-mode sessions.
- [x] Add a first reward screen with skill XP and a simple level-up message.
- [x] Draft the first 7-day training cycle.
- [x] Add Novice Hall Day 6 weak-finger review lesson.
- [x] Add Novice Hall Day 7 gatekeeper trial lesson.
- [x] Replace the bundled lesson cap with a lesson manifest.
- [x] Add a small screen message when the journey advances to the next day.
- [x] Validate bundled lesson files against the lesson manifest.
- [x] Design post-Novice-Hall progression after Day 7.
- [x] Add a dedicated first-week completion or gatekeeper clear message.
- [x] Decide whether boss lessons can override the default three-prompt session
      length.
- [x] Add the first achievement unlock path.
- [x] Add achievement definitions for streaks and long-session play.
- [x] Add first title reward or item reward after Gatekeeper Trial.
- [x] Add a lesson manifest validation command for CI and release checks.
- [x] Track daily streaks and unlock continuity achievements.
- [x] Add a visible streak milestone message after session rewards.
- [x] Add weak-key review quest generation from mistake history.
- [x] Wire weak-key review prompts into a selectable review quest.
- [x] Add Meadow Road clear message and first second-week title reward.
- [x] Add non-scrolling terminal screen rendering for major screens.
- [x] Add River Gate clear message and third-week title reward.
- [x] Add Day 22 through Day 28 lessons.
- [x] Add review quest result messaging that explains the targeted weak keys.
- [x] Add raw-mode real-time typing screen on top of the screen renderer.

## Mid Term

- [x] Design [#4](https://github.com/hideyukiMORI/keyquest/issues/4): adventure progression.
- [x] Design [#9](https://github.com/hideyukiMORI/keyquest/issues/9): achievement engine and first achievement set.
- [x] Add HP, MP, XP, item, magic, weapon, and curse models.
- [x] Add weekly boss quest rules.
- [x] Add weak-key review quests.
- [x] Add Chinese, Korean, Spanish, and Portuguese UI catalogs.

## Long Term

- [x] Add roguelite quest modifiers.
- [x] Add incremental equipment upgrades and crafting materials.
- [x] Add 90-day ending state and post-game practice goal model.
- [x] Add final Day 90 ending scene content.
- [x] Add importable lesson packs.
- [x] Prepare npm publishing.
- [x] Add release notes and changelog automation.

## Release Readiness

- [x] Add CLI help and version output.
- [x] Add in-game help menu.
- [x] Strengthen npm package tarball smoke test.
- [x] Add README terminal transcript.
- [x] Implement minimal Load Game current-slot action.
