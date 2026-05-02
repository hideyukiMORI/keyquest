# Roadmap

## Short Term: Foundation to First Fun

Goal: make the core loop playable and measurable.

- Interactive terminal input loop.
- Home-position and finger-usage onboarding.
- Prompt scoring with WPM, accuracy, mistakes, and elapsed time.
- First lesson format and sample English prompts.
- Session result screen with XP and simple rewards.
- Normal save file for local progress with tamper friction.
- Development save mode using readable JSON and visible `DEV MODE` markers.
- Terminal size handling, no-color mode, and initial color themes.
- Minimal modern CLI presentation with subtle loading, progress, and reward motion.
- Basic localization infrastructure.
- Real-time practice spike after the line-based daily loop has clear boundaries.

Exit criteria:

- A player can complete a 10-minute session.
- The game records progress locally.
- The result screen makes improvement understandable.
- Small or no-color terminals fail gracefully.
- The real-time typing path has a tested state model before it becomes the main
  practice screen.

## Mid Term: 90-Day Training Structure

Goal: turn the playable loop into a training journey.

- 7-day weekly training rhythm.
- 90-day journey map with classic fantasy chapters.
- Planned typed quest arcs through Day 90.
- Skill tracks for rows, Shift, numbers, symbols, and accuracy.
- Weak-key detection and review quests.
- Achievement engine and first achievement set.
- Achievement trigger policy that rewards consistency without masking weakness.
- Equipment, items, HP, MP, and magic as training metaphors.
- Documented quest-map rules that keep adventure rewards tied to training value.

Exit criteria:

- A player can see today's quest, this week's boss, and long-term progress.
- The title menu exposes current journey progress without starting a session.
- Weaknesses create targeted practice instead of generic repetition.
- Achievements reward meaningful improvement.

## Long Term: Depth and Retention

Goal: make the game satisfying beyond the first month.

- Roguelite quest modifiers.
- Incremental upgrade curves and crafting materials.
- Boss quests with fair pressure.
- TTY-friendly menu navigation and mid-session options.
- Post-ending practice and optional new-game-plus.
- Title-menu records for resources, achievements, titles, and post-game goals.
- Importable or shareable lesson packs.
- More polished localization and accessibility options.

Exit criteria:

- The player has reasons to return after finishing the main story.
- Extra play feels rewarding without breaking the 10-minute daily promise.
- Content can grow without rewriting the engine.

## Public Release

Goal: make KeyQuest easy to try and trustworthy as an open-source CLI.

- `npx keyquest` works cleanly.
- README explains the 90-day premise and shows the CLI flow.
- Release checklist exists.
- A single release check command verifies the package before publishing.
- Package metadata is ready for npm.
- Supported locales pass catalog validation.
- Smoke tests cover install, start, and a minimal session path.

Exit criteria:

- A new user can install, run, and understand the game in under five minutes.
- The repository clearly communicates how development is managed.
