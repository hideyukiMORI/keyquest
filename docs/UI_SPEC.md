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

## Fixed-Screen TUI Direction

The long-term interface target is a fixed-screen terminal UI, closer to `gtypist`
than to a conversational command transcript.

The player should feel that they are inside a small terminal application:

- Major screens redraw in place within a stable 80x24-friendly layout.
- The typing prompt, current input, stats, and controls stay in predictable
  regions.
- Story and rewards appear as short panels, not as a chat-style log.
- ASCII decoration is used sparingly for mood: dividers, simple frames, progress
  glyphs, small reward flashes, and compact quest motifs.
- Color themes create the fantasy and developer-tool atmosphere without hiding
  the plain text structure.
- The overall style should feel text-only, geeky, and modern, similar in
  restraint to recent Python terminal tooling and Claude Code-style CLIs.

This is still a terminal UI, not a desktop GUI. It should remain keyboard-first,
portable across Linux, macOS, and Windows terminals, and readable in no-color
mode.

## Visual North Star

The desired look is a rich text interface: minimal like a modern developer tool,
but clearly designed like a game.

Reference qualities:

- `gtypist`: fixed practice area, stable prompt/input regions, no chat log feel.
- Recent Python, Rust, and Node CLIs: clean spacing, restrained color, readable
  labels, and useful symbols.
- Claude Code-style terminals: calm hierarchy, short copy, obvious next action,
  and very little ornament while work is in progress.
- Classic roguelite RPG terminals: compact status, resources, quest names, and
  reward reveals.

This should not look like:

- A desktop GUI recreated with boxes everywhere.
- A scrolling chatbot transcript.
- A wall of stats that competes with the typing prompt.
- Large ASCII art that pushes useful state offscreen.
- Colorful output that becomes meaningless in no-color mode.

## Screen Composition

Every major TTY screen should fit one of a few stable compositions:

- Header: product name, current quest, day, arc, or screen title.
- Primary panel: the thing the player is doing now.
- Status strip: HP, MP, XP, streak, accuracy, WPM, or progress when relevant.
- Hint row: available keys and escape routes.
- Footer message: one short confirmation, warning, or next-step line.

The layout should favor one strong primary panel over many equal panels. Avoid
showing all RPG systems at once during typing. Records and result screens can
show more detail because they are not competing with active input.

## Screen Sketches

These sketches are direction, not exact copy. They show density, hierarchy, and
stable regions.

### Title

```text
KEYQUEST                                  Day 12 / Meadow Road
Terminal typing adventure                 Streak 3  XP 820

Quest
  Waystone Trail: Common words and clean rhythm
  Modifier: Mist Veil - clean recovery adds a Repair Shard

Menu
> Start Daily Quest
  Review Weak Keys
  Journey
  Resources
  Achievements
  Titles
  Options

[j/k] move  [enter] select  [?] help  [q] quit
```

### Practice

```text
KEYQUEST  Day 12  Meadow Road             HP 18/20  MP 4/10
Progress  [##########----------]  2/3     Accuracy 96%  WPM 32

Type
  keep a calm rhythm through common words

Input
  keep a calm rhythm through common wor_

Mistakes
  d: 1

[ctrl+o] options  [esc] pause  [ctrl+c] quit safely
```

### Segment Result

```text
Segment Clear                              Prompt 2/3

Accuracy  96%     WPM 32.0     Mistakes 1
Weak key  d       Combo 18      XP +14

Next
  The road narrows. Keep the rhythm steady.

[enter] continue
```

### Final Result

```text
Quest Complete                             Day 12

Score
  Prompts 3    Accuracy 97%    WPM 31.4    XP +42

Rewards
  Rhythm +18 XP
  Repair Shard +1
  Title progress: Meadow Road Pathfinder

Journey
  Day 13 is ready for next time.

[enter] return to title
```

## ASCII Style

ASCII decoration should make the terminal feel crafted without stealing focus.

Prefer:

- Single-line dividers, short frames, and compact progress bars.
- Repeated glyphs with semantic meaning, such as `#` for progress and `!` for
  danger.
- Small quest motifs that fit one line, such as `Gatekeeper Trial` or
  `Lantern Keep`.
- Reward flashes that last briefly or collapse into static text in
  reduced-motion mode.

Avoid:

- Multi-line art on active typing screens.
- Dense borders around every section.
- Unicode-only symbols as the sole state indicator.
- Animation that changes line height or moves the typing prompt.

Unicode box drawing can be a future enhancement, but ASCII must remain the base
style so the UI is portable and easy to test.

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

## Non-Scrolling Screen Rendering

Interactive terminal screens should redraw in place instead of appending every
state change to scrollback.

Current policy:

- Use the screen renderer for title, options, practice intro, segment result,
  and final result screens.
- In TTY output, practice prompts may switch to a raw-mode real-time screen that
  redraws target text, current input, character progress, and controls on each
  keypress.
- In TTY output, clear the screen and move the cursor home before drawing the
  next major screen.
- In non-TTY output, keep append-only plain text so logs, tests, and piped runs
  stay readable.
- Cap redraw output to the known terminal height, reserving one row for the input
  prompt, so a screen body does not force scrolling.
- Keep raw ANSI control inside terminal modules; scene and game logic should
  continue to return semantic text.
- Keep the real-time typing state pure and testable; raw terminal input should
  be an adapter around that state machine.

## Input Model

Fixed-screen TUI behavior requires key events, not conversational line prompts.

In TTY mode:

- Screens should run on raw key events and redraw in place after state changes.
- Menus should use `j`/`k`, arrow keys, Enter, Space, and number shortcuts.
- Informational screens should return on Enter, Space, Escape, `q`, or the
  documented back key without printing a new prompt line.
- Confirmations should be modal screen states with explicit keys such as `y`,
  `n`, Enter, or Escape, not free-form text prompts.
- Practice should remain in one screen loop for typing, pause, options,
  confirmation, segment results, and final results where practical.
- Ctrl+C and Escape paths must restore terminal state before exiting or falling
  back.

In non-TTY mode:

- Keep append-only text and `readLine` prompts so tests, logs, redirected output,
  and unsupported terminals remain readable.
- The fallback should be intentional and visible in code. Avoid adding new
  `readLine` interactions to the TTY path.

The implementation direction is to make `readLine` a fallback boundary, not the
normal interaction model for supported terminals.

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
- frame
- divider
- panelTitle
- success
- warning
- danger
- hp
- mp
- xp
- prompt
- input
- typedCorrect
- typedWrong
- cursor
- hint
- story
- reward

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
