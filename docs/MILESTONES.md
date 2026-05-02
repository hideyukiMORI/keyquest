# Milestones

## Completed: Development Foundation

Goal: make the repository ready for Issue-based development.

- TypeScript CLI scaffold
- Type checking, linting, formatting, and test commands
- Project policy docs and Cursor rules
- GitHub Issue templates

## Short Term: Playable Daily Loop

Goal: make `keyquest` playable as a focused daily terminal practice session
without overbuilding the final real-time UI too early.

### ST-1: First Playable Shell

Status: mostly complete.

- Title menu with start/options flow
- Saved language setting and localized UI message catalog
- Home-position and finger-usage onboarding
- Lesson loading from structured data
- Accuracy, WPM, mistake, elapsed-time, and XP summary
- Normal save file for session history and basic progress with tamper friction
- Development save mode with readable JSON and visible `DEV MODE` markers
- Keyboard-only flow that works on Linux, macOS, and Windows terminals

Exit criteria:

- A player can launch the game, choose a UI language, complete one prompt, and
  see saved progress.
- `npm run verify` passes on `main`.

### ST-2: Daily Session Shape

Goal: turn the one-prompt loop into a small but coherent daily practice run.

- Session plan for the first 10-minute daily loop
- Multiple prompts per session
- Segment-level summary between prompts
- Session-level result screen
- Per-character mistake records for weak-key review
- Clear distinction between `Start`, future `Continue`, future `New Game`, and
  future `Load Game`

Exit criteria:

- A player can complete a short multi-prompt session without restarting the app.
- The save file records enough data to explain accuracy, WPM, streak, XP, and
  weak keys.

### ST-3: Terminal UI Runtime Foundation

Goal: prepare for real-time typing screens while keeping the current text flow
stable.

- Terminal size detection with an 80x24 warning path
- Color mode support with no-color fallback
- Five initial color themes using semantic color names
- Reduced-motion setting and policy
- Screen rendering boundary that keeps ANSI control away from core game logic
- Input boundary that can support both line input and raw key input

Exit criteria:

- Plain text, no-color, and small-terminal flows stay usable.
- Core scoring, save, lesson, and progression code do not depend on raw terminal
  APIs.

### ST-4: Real-Time Practice Spike

Goal: prove the real-time typing experience in the smallest useful slice before
rewriting the main practice flow.

- One-prompt raw-mode typing prototype
- Per-keystroke correct/wrong state
- Backspace handling
- Ctrl+C and escape-safe terminal cleanup
- Deterministic tests for real-time typing state transitions
- Manual smoke test instructions for Linux, macOS, and Windows terminals

Exit criteria:

- The prototype can render typed progress without corrupting the terminal.
- The state machine can be tested without an actual TTY.

### ST-5: First Fun Reward Loop

Goal: make the end of a session feel rewarding without locking in the full RPG
system too early.

- First reward screen with XP gain
- Simple level-up display for skill tracks
- First item or title reward
- First achievement unlock path (complete for `firstSession` and
  `perfectSession`)
- Save data for rewards that can evolve into equipment, magic, and items

Exit criteria:

- A player has a clear reason to play again tomorrow.
- Rewards are data-driven enough to extend without rewriting the session result
  screen.

## Short Term: Lesson Design System

Goal: make lessons easy to write, review, and improve.

- Versioned lesson schema
- Beginner home-row lessons through the first Novice Hall week
- First post-Novice-Hall lesson entry
- Lesson-specific session prompt counts for boss-style lessons
- Bundled lesson manifest for default progression
- Programmer symbol lessons
- Lesson validation command
- English-only typing prompts separated from localized UI strings

## Mid Term: 90-Day Adventure Layer

Goal: shape daily practice into a 90-day fantasy journey.

- 7-day training cycle with weekly boss quests
- 90-day story map and ending
- Quest map and progression
- Short story beats
- Achievements based on accuracy and consistency
- Review mode for weak keys
- HP, MP, weapons, magic, items, and curses mapped to typing behavior
- Incremental upgrade curves that reward practice without hiding weaknesses

## Long Term: Depth and Retention

Goal: make KeyQuest rewarding beyond the first month and after the ending.

- Roguelite quest modifiers
- Crafting materials and equipment upgrades
- Post-ending practice goals
- Optional new-game-plus style progression
- Importable lesson packs
- Accessibility and localization polish

## Release: Public CLI

Goal: publish a useful open-source CLI.

- `npx keyquest` smoke test
- README with screenshots or terminal recording
- npm package metadata
- Supported locales validated
- Release checklist and changelog
- First public release notes
