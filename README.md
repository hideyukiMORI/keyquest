# keyquest

A terminal typing adventure game for fun and effective practice.

## Usage

Run locally from the repository:

```bash
npm run dev
```

After the package is published, the intended quick start is:

```bash
npx keyquest
```

Useful CLI flags:

```bash
keyquest --dev
keyquest --help
keyquest --version
keyquest --lesson ./lessons/novice-hall-day-1.json
keyquest --lesson-pack ./packs/home-row-extra/keyquest-pack.json
keyquest --no-color
keyquest --reduced-motion
```

Inside the title menu, choose `Help` for a short explanation of the daily loop,
weak-key review, progression rewards, and language options. In an interactive
terminal, menus support `j`/`k` or arrow keys, with Enter or Space to confirm.
During real-time practice, press `Ctrl+O` to open options without ending the run.
The title menu also exposes Journey, Resources, Achievements, and Titles record
screens so progress is visible outside a practice session.

## Terminal Preview

```text
KeyQuest
A terminal typing adventure for steady hands.

Title
1. Start
2. Review Weak Keys
3. Options
4. New Game
5. Load Game
6. Help
7. Journey
8. Resources
9. Achievements
10. Titles

Story
Day 1: Novice Hall: Home Position
The old instructor points to the home row.
"Before the blade, learn the stance."

Status
Hero: Apprentice
XP: 0
Streak: 0 days
Arc: Novice Hall
Modifier: Steady Torch - High accuracy adds a Focus Crystal.
HP: 20/20  MP: 0/10
Training: homePosition Lv.1 / fingerResponsibility Lv.1 / homeRow Lv.1

Practice
Lesson: Novice Hall: Home Position
Keep your fingers on the home position.
Keys: f j
Type: f j f j

Session Result
Prompts: 3
Accuracy: 100%
WPM: 24.0
XP gained: 42

Rewards
homePosition: +14 XP (Lv.1)
Unlocked: First Steps
Next lesson: Day 2 is ready for next time.
```

## Vision

KeyQuest is a terminal-first typing adventure game. It should make daily typing
practice feel like a small quest while still improving accuracy, rhythm, and the
symbols programmers actually type.

## Development

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Run the development CLI:

```bash
npm run dev
```

Run with readable development-mode save data:

```bash
npm run dev -- --dev
```

Run the full local verification suite:

```bash
npm run verify
```

Check the package contents before publishing:

```bash
npm run package:smoke
```

## Project Management

This project is managed with GitHub Issues and local Markdown planning docs.

- Product direction: `docs/PRODUCT_DIRECTION.md`
- Roadmap: `docs/ROADMAP.md`
- Milestones: `docs/MILESTONES.md`
- Active TODOs: `docs/TODO.md`
- Lesson packs: `docs/LESSON_PACKS.md`
- Onboarding training: `docs/ONBOARDING_TRAINING.md`
- UI specification: `docs/UI_SPEC.md`
- Progression design: `docs/PROGRESSION_DESIGN.md`
- Achievements: `docs/ACHIEVEMENTS.md`
- Localization: `docs/LOCALIZATION.md`
- Save data: `docs/SAVE_DATA.md`
- Publishing: `docs/PUBLISHING.md`
- Testing strategy: `docs/TESTING_STRATEGY.md`
- Development philosophy and policy: `docs/DEVELOPMENT.md`
- Coding standards: `docs/CODING_STANDARDS.md`
