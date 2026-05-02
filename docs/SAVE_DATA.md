# Save Data

## Goal

KeyQuest should store local progress in a way that is not casually editable, but
still remains practical for development and debugging.

This is not security against a determined local attacker. The goal is honest
friction: normal players should not be tempted to edit a plain JSON file, while
developers can inspect state when needed.

## Modes

### Normal Mode

Normal mode should store progress in an encoded and integrity-checked format.

Recommended direction:

- Serialize save data as canonical JSON.
- Compress it.
- Encode it as binary or base64url text.
- Add an HMAC or checksum over the payload.
- Store metadata such as save version and created/updated timestamps.

This prevents accidental edits and makes casual tampering inconvenient. It also
lets the game detect corrupted or modified saves and respond clearly.

### Development Mode

Development mode is enabled with `--dev` or `-dev`.

Development mode should:

- Write save data as readable JSON.
- Display a visible `DEV MODE` marker in the terminal.
- Mark sessions, achievements, and endings as development-mode results.
- Make dev-mode clears feel intentionally less special than normal-mode clears.
- Avoid uploading, exporting, or presenting dev-mode results as normal progress.

Example tone:

```text
DEV MODE CLEAR
The spell worked, but the bards refuse to sing about debug magic.
```

## Save Locations

Use platform-appropriate user data locations instead of the project directory.
The exact path should be wrapped behind a small module so tests can inject a
temporary directory.

Development mode may use a separate file name or directory to avoid mixing
normal and dev progress.

## Data Shape

The save model should support:

- Save format version
- Player profile
- Locale and settings
- Session history
- Daily streaks and missed days
- 90-day journey progress
- XP and skill tracks
- HP, MP, materials, items, weapons, magic, and curses
- Per-character mistake records for later weak-key statistics
- Achievement unlocks
- Title reward unlocks
- Dev-mode marker for sessions generated in development mode

Implemented resource state currently stores:

- `hp` / `maxHp`: quest-local mistake tolerance result.
- `mp` / `maxMp`: accumulated focus resource.
- `materials.focusCrystal`: earned from XP.
- `materials.repairShard`: earned from mistakes for future recovery systems.
- `items`, `weapons`, `magic`, and `curses`: stable inventory slots for future
  systems.

## Migration Policy

Every save file should include a version. When the shape changes, add explicit
migrations instead of silently guessing.

During early development, incompatible save resets are acceptable if clearly
documented. Before public release, save migration should become part of the
definition of done for persistence changes.

## Failure Policy

If a normal save fails integrity checks:

- Do not crash with a stack trace.
- Explain that the save is corrupted or modified.
- Offer to back up the invalid save and start fresh.
- In development mode, show more detailed diagnostics.
