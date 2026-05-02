# Lesson Packs

## Goal

Lesson packs let external lesson collections plug into KeyQuest without editing
the bundled lesson manifest.

Typing prompts remain English. Pack metadata can be local to the pack, while the
core UI continues to use the selected KeyQuest locale.

## Manifest

Create a `keyquest-pack.json` file:

```json
{
  "version": 1,
  "id": "home-row-extra",
  "title": "Home Row Extra",
  "lessons": [
    {
      "day": 1,
      "path": "lessons/day-1.json"
    }
  ]
}
```

Lesson paths are resolved relative to the manifest file. Each lesson file uses
the normal KeyQuest lesson schema.

## Running

Use `--lesson-pack` to select a pack for journey-based lesson lookup:

```sh
npm run dev -- --lesson-pack ./packs/home-row-extra/keyquest-pack.json
```

`--lesson` still has priority for one-off lesson debugging. With no lesson flags,
KeyQuest uses the bundled lesson manifest.
