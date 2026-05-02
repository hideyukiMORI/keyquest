# UI Specification

## Goals

KeyQuest should look pleasant in modern terminals while remaining usable in
plain, low-feature, or accessibility-sensitive environments.

The UI should be readable before it is decorative. Color and layout must support
typing practice instead of distracting from it.

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

## Implementation Direction

Keep terminal rendering behind small modules:

- Terminal size detection
- Color capability detection
- Theme resolution
- ANSI output
- Plain-text fallback

The core game should request semantic output and never write raw ANSI escape
codes directly.
