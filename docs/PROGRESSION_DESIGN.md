# Progression Design

## Design Goal

KeyQuest should feel like a roguelite and incremental RPG while remaining a
typing trainer. The player should get stronger by practicing well, not by
avoiding difficult prompts.

## Typing-to-RPG Mapping

- Experience: earned from completed prompts, accuracy, consistency, and review.
- Level: long-term mastery across general typing and specific skill tracks.
- HP: mistake tolerance during a quest.
- MP: focus resource gained by accurate streaks.
- Attack: effective typing output, combining speed and accuracy.
- Defense: ability to absorb mistakes without losing the run.
- Magic: practice modifiers that help review, focus, or recovery.
- Weapons: typing styles or training tools that shape scoring bonuses.
- Items: consumable or passive rewards that support the next practice segment.
- Curses: weak keys, awkward symbols, or accuracy penalties discovered by play.

## Skill Tracks

Progress should be visible in multiple areas:

- Home Position
- Finger Responsibility
- Home Row
- Top Row
- Bottom Row
- Shift
- Numbers
- Symbols
- Programmer Pairs, such as `()`, `{}`, `[]`, `=>`, `&&`, `||`
- Accuracy
- Rhythm
- Recovery after mistakes

Home Position and Finger Responsibility are special early tracks. They should
gate the first layer of adventure progression so players cannot rush into speed
training with unstable form.

## Daily Power Curve

The daily session should create a small emotional arc:

1. Familiar warm-up makes the player feel competent.
2. Focused challenge introduces friction.
3. Weak-key review creates productive irritation.
4. Reward phase gives a visible power jump.

This supports the desired feeling: "I want to get stronger faster" followed by
periodic jumps in power when the player clears a bottleneck.

## Weekly Rhythm

Use a 7-day training cycle.

- Days 1-3: learn or reinforce a theme.
- Days 4-5: pressure and mixed prompts.
- Day 6: review, crafting, and weak-key cleanup.
- Day 7: boss quest and larger reward.

Boss quests should test the week's skills, not surprise the player with unrelated
difficulty.

## Implemented 90-Day Map Skeleton

The typed quest map now covers the full 90-day promise. Days 1-28 are backed by
bundled lessons, while Days 29-90 are planned arcs that give future content stable
destinations:

- Ashen Forge: Shift keys and capital letters.
- Windspire: speed control and rhythm.
- Clockwork Citadel: programmer pairs and brackets.
- Starfall Library: symbols, operators, and code-like flow.
- Dragon Spine: accuracy under speed pressure.
- Moonlit Labyrinth: weak-key recovery and calm correction.
- Obsidian Throne: mixed punctuation and long-form focus.
- Dawn Citadel: full-keyboard mastery review.
- Final Gate: final integrated typing quest.

## Incremental Systems

Incremental growth should be steady, legible, and mostly deterministic.

- Skill XP: increases by practicing a matching theme.
- Mastery thresholds: unlock lessons, story gates, and equipment upgrades.
- Materials: earned from quests and used for upgrades.
- Rested focus: small comeback bonus after a break.
- Streak bonus: helpful but not so strong that a broken streak feels fatal.

Avoid predatory loops. No random rewards should be required for core progress.

## Roguelite Run Structure

A quest can behave like a small run:

- Start with HP, MP, equipment, and one quest modifier.
- Prompts act as rooms.
- Mistakes reduce HP or break combo.
- Accurate streaks generate MP.
- A boss prompt resolves the quest.
- Rewards improve the next run.

Runs should be short enough for the 10-minute daily promise.

## Implemented Modifier Slice

The first roguelite modifier implementation is deterministic rather than random.
The active modifier rotates by journey day:

- Steady Torch rewards very high accuracy with an extra Focus Crystal.
- Mist Veil rewards clean recovery from mistakes with an extra Repair Shard.
- Shifting Bridge rewards perfect sessions with extra MP.

Modifiers change rewards, not the measured typing score. WPM, accuracy, and
mistakes must remain honest training feedback.

## Implemented Ending Slice

The first ending implementation defines a stable Day 90 boundary:

- Before Day 90, the journey reports remaining days.
- On Day 90, the ending becomes ready for a future final scene.
- After Day 90, post-game goals track a 7-day streak, 10 perfect sessions, and
  25 Focus Crystals.

This keeps the 90-day promise explicit while allowing the lesson curriculum and
final story scene to be filled in later.

## Implemented Resource Slice

The first resource implementation is intentionally small and deterministic:

- HP represents mistake tolerance inside the just-finished daily quest.
- MP is stored focus gained from perfect or highly accurate sessions.
- Focus Crystals are earned from XP and can later power upgrades or magic.
- Repair Shards are earned from mistakes and can later support weak-key recovery.
- The initial inventory includes a training weapon and a basic focus magic ID so
  future UI can render equipment without changing the save shape again.
- Training Blade Grip is the first deterministic equipment upgrade. It spends
  Focus Crystals and Repair Shards, then increases `maxHp` by a small amount so
  practice creates visible durability without changing typing scores.

HP is saved as the post-quest result, but each quest resolves damage from
`maxHp`; it should not become a punishment that carries forward forever. MP and
materials are the early long-term resources.
