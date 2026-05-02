# Localization

## Policy

KeyQuest localizes UI messages, story text, help, achievements, and documentation
snippets where practical. Typing prompts are English in every locale.

This keeps the training target consistent while making the game approachable for
players who prefer another UI language.

## Initial Locales

- English: primary source language.
- Japanese: important for the original development context.
- Simplified Chinese: large developer and CLI user base.
- Korean: strong developer and gaming audience.
- Spanish: broad international reach.
- Portuguese: broad international reach, including Brazil.

Traditional Chinese can be added later if community demand appears.

## Message Design

- Keep messages short enough for terminal layouts.
- Avoid jokes that are hard to translate in core flows.
- Keep achievement names translatable but allow locale-specific flavor.
- Separate typing prompt content from UI strings.
- Store locale keys in a structure that can be validated.

## Implementation Direction

Start with a simple in-repo message catalog. Add a heavier i18n library only
after the message format proves insufficient.

Suggested shape:

```json
{
  "quest.start": "Begin quest",
  "quest.complete": "Quest complete",
  "score.accuracy": "Accuracy"
}
```

The source locale should be English. Tests should verify that required keys exist
for every supported locale before release.

## Current Foundation

- `src/i18n/messages.ts` owns supported locale IDs, display names, and the
  message catalog.
- Title and options UI use saved locale settings before the practice session
  starts.
- Language changes are persisted in the local save file.
- English typing prompts stay in lesson files and are not localized.
- `NEW GAME` and `LOAD GAME` are visible as planned title menu slots so the menu
  can grow without changing the basic navigation shape.
