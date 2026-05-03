# TODO

## Now: Fixed-Screen Terminal Interface Polish

### Discovery

- [ ] Audit current interactive screens against `docs/UI_SPEC.md`: title,
      practice intro, raw-mode practice, segment result, final result, help,
      options, Journey, Resources, Achievements, Titles, warnings, New Game, and
      Load Game.
- [ ] Capture where the current flow still feels like a scrolling conversation:
      appended output, repeated headings, unstable input placement, or overly
      verbose story/status text.
- [ ] Identify shared rendering gaps: line width handling, truncation, padding,
      panel composition, hint rows, progress bars, and no-color symbols.

### Layout Foundation

- [ ] Define reusable fixed-screen layout primitives for 80x24 terminals:
      header, primary panel, status strip, hint row, footer message, and compact
      warning panel.
- [x] Add rendering helpers for bounded content width, stable row counts,
      truncation, alignment, and plain ASCII dividers.
- [ ] Make the layout contract explicit in tests so major screens do not exceed
      terminal height or rely on color to communicate state.

### Main Flow Screens

- [ ] Redesign the title screen with a compact quest summary, saved progress,
      menu, and keyboard hints.
- [ ] Redesign the practice screen with stable regions for quest status, prompt,
      typed input, progress, mistakes, and controls.
- [ ] Redesign segment and final result screens so score, weak keys, rewards,
      achievements, titles, and next-day messaging read as panels instead of log
      lines.
- [ ] Redesign Help, Options, Journey, Resources, Achievements, and Titles using
      the same fixed-screen composition and concise copy.
- [ ] Add compact handling for small or unsupported terminals without crashing or
      producing unreadable output.

### Style Pass

- [ ] Apply semantic theme colors consistently to menus, story panels, stats,
      resources, achievements, titles, HP, MP, XP, warnings, and typed character
      states.
- [ ] Add restrained ASCII mood elements for quest preparation, boss/trial
      screens, reward reveals, achievement unlocks, level ups, and journey
      advancement.
- [ ] Verify no-color equivalents for every color-coded state: selected menu
      item, warning, danger, success, typed correct, typed wrong, HP, MP, XP, and
      reward unlocks.
- [ ] Verify reduced-motion equivalents for spinners, progress changes, reward
      reveals, and achievement flashes.

### Verification and Public Preview

- [ ] Add or update focused tests for screen layout, no-color rendering,
      reduced-motion rendering, and raw-mode typing screen state.
- [ ] Add manual TTY smoke instructions for Linux, macOS, Windows Terminal,
      narrow terminals, and no-color output.
- [ ] Update README terminal preview after the fixed-screen TUI pass lands.
- [ ] Add a terminal recording or screenshot set before the first public release.

## Completed: Daily Loop and Lesson Content

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

## Completed: Terminal Runtime and Rewards

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
- [x] Confirm New Game before replacing existing progress.
- [x] Preserve options when starting New Game.
- [x] Add interactive `j`/`k` menu navigation for TTY mode.
- [x] Allow options changes during practice.
- [x] Add a Journey progress screen with current day, arc, weekly trial, and ending progress.
- [x] Extend the typed quest arc map with planned arcs through Day 90.
- [x] Add a Resources record screen from the title menu.
- [x] Add an Achievements record screen from the title menu.
- [x] Add a Titles record screen from the title menu.
- [x] Show post-game goal details from the Journey screen.
- [x] Integrate progress record screens into title navigation.
- [x] Add a single `npm run release:check` command.
- [x] Add final release checklist documentation.
- [x] Validate npm tarball file boundaries in package smoke.
