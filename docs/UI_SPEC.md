# UI Specification

## Goals

KeyQuest should look pleasant in modern terminals while remaining usable in
plain, low-feature, or accessibility-sensitive environments.

The UI should be readable before it is decorative. Color and layout must support
typing practice instead of distracting from it.

## Interface Personality

KeyQuest should feel like a modern developer CLI: sparse, calm, and direct. The
interface can be cool, but it should not become noisy.

Use a Claude Code-like level of simplicity as the baseline:

- Short headings
- Clear status lines
- Minimal borders
- Strong whitespace
- Few simultaneous UI regions
- Text-first interactions

The fantasy layer should appear through names, short messages, colors, and timing
rather than heavy ASCII art or crowded dashboards.

## Motion and Feedback

Subtle terminal animation is allowed when it improves clarity or mood.

Good uses:

- Loading spinners for save/load, lesson validation, or quest preparation.
- Progress bars for daily session time, boss HP, XP gain, and chapter progress.
- Short reveal animations for rewards, achievements, and level ups.
- Gentle pulse or symbol changes for active focus states.

Avoid:

- Constant animation while the user is typing.
- Long unskippable sequences.
- Effects that make the prompt move unexpectedly.
- Flicker-heavy rendering.
- Animation that is required to understand the state.

Typing screens should stay especially stable. Most animation belongs before a
prompt starts or after a segment ends.

## Progressive Disclosure

Show only what the player needs now.

- During typing: prompt, current input, minimal status, and essential hints.
- Between prompts: quick accuracy and mistake feedback.
- After a segment: rewards, XP, items, achievements, and story.
- In menus: deeper stats and configuration.

This keeps the interface clean while still allowing satisfying RPG and
incremental feedback.

## Terminal Size

Recommended minimum terminal size:

- Width: 80 columns
- Height: 24 rows

This matches the common terminal baseline and leaves enough room for prompts,
status, hints, and results without forcing dense layouts.

Preferred size:

- Width: 100 columns or more
- Height: 30 rows or more

The game should detect terminal size at startup and before major screens.

## Size Handling

If the terminal is smaller than 80x24:

- Show a clear warning with the detected size and required size.
- Avoid starting a typing segment if the layout would be broken.
- Allow a compact help/error screen that fits smaller terminals.
- Do not crash when size data is unavailable.

If the terminal is wide:

- Keep typing prompts readable instead of stretching every element.
- Prefer a centered or bounded content column.
- Avoid relying on exact pixel or font behavior.

## Color Modes

KeyQuest should support three color modes:

- `auto`: use color when the terminal appears to support it.
- `always`: force color output.
- `never`: disable color output.

`never` is required for accessibility, log capture, unusual terminals, and users
who simply prefer plain text.

Suggested CLI options:

```text
--color auto
--color always
--color never
--no-color
```

Respect common environment conventions where practical:

- `NO_COLOR` disables color.
- `FORCE_COLOR` enables color unless `--no-color` is given.

## Theme Policy

Themes should be cosmetic. They must not change game mechanics, scoring, or
lesson content.

Each theme should define semantic colors, not hard-coded screen roles:

- background
- foreground
- muted
- accent
- success
- warning
- danger
- hp
- mp
- xp
- prompt
- typedCorrect
- typedWrong
- cursor

Use semantic names in rendering code so themes can change without rewriting UI
logic.

## Initial Themes

### Classic

Simple terminal fantasy theme. Good default.

- Neutral foreground
- Green success
- Red danger
- Blue MP
- Gold XP/accent

### Forest

Warm, calm training theme for the early game.

- Greens and soft yellows
- Low visual noise
- Good for home-position onboarding

### Arcane

Magic-focused theme.

- Purple accents
- Cyan MP
- Bright spell highlights

### Ember

High-energy battle theme.

- Orange and red accents
- Strong warning and danger contrast
- Useful for boss quests

### Mono

Low-color theme that still uses limited emphasis when color is allowed.

- Mostly foreground/muted/accent
- Designed to degrade cleanly into no-color output

## No-Color Rendering

No-color mode should still communicate state through text and symbols:

- Correct input: plain text or `[ok]`
- Wrong input: `!` marker or `[miss]`
- HP/MP/XP: labels and numbers
- Warnings: `WARNING:`
- Dev mode: `DEV MODE`

Do not rely on color alone to communicate mistakes, low HP, active dev mode, or
important state changes.

## Reduced Motion

Support a reduced-motion direction for users or environments where animation is
unwanted.

Suggested CLI option:

```text
--reduced-motion
```

In reduced-motion mode:

- Replace spinners with static status text.
- Render progress bars as final or periodically updated text.
- Skip reward reveal animation.
- Keep all information available.

## Implementation Direction

Keep terminal rendering behind small modules:

- Terminal size detection
- Color capability detection
- Theme resolution
- Motion policy
- Spinner and progress rendering
- ANSI output
- Plain-text fallback

The core game should request semantic output and never write raw ANSI escape
codes directly.
