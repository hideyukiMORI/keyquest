# Achievements

## Purpose

Achievements turn practice into visible proof of growth. They should reward
consistency, accuracy, recovery, and meaningful milestones, not only raw speed.

Achievements may grant titles, small resources, cosmetic story text, or minor
practice bonuses. They should never replace skill.

## Categories

## Engine Model

Achievements should be deterministic checks over save data and the just-finished
session. The engine should not read terminal state, random values, wall-clock
time outside the supplied completion timestamp, or localized strings.

Achievement checks can use these inputs:

- Previous save progress: sessions, titles, achievements, total XP, skill tracks,
  streak days, and journey day.
- Current session record: started time, completed time, prompt count, accuracy,
  WPM, XP, and per-character mistakes.
- Derived session summary: elapsed seconds, perfect-session flag, weak-key stats,
  and next streak count.
- Future quest result data: HP remaining, MP state, modifiers, items used, and
  boss prompt outcome.

Unlocking rules:

- Achievements unlock at most once per save.
- Unlock order should be stable and testable.
- A single session may unlock multiple achievements.
- Hidden achievements may exist, but they must not block the 90-day ending.
- Achievements should be displayed after rewards and before journey progress.

## Reward Policy

Rewards should be small and motivating:

- Titles
- Story flavor
- Materials
- Cosmetic equipment names
- Minor temporary practice assists

Avoid rewards that make practice easier in a way that hides weakness. The game
should help players face weaknesses, not bypass them.

Good achievement rewards:

- Celebrate consistency and recovery.
- Point the player toward the next useful practice behavior.
- Unlock cosmetic identity or story flavor.

Avoid achievement rewards that:

- Auto-correct mistakes.
- Reduce weak-key frequency by hiding weak keys.
- Give large speed bonuses unrelated to accuracy.
- Make broken streaks feel unrecoverable.

## Implemented First Slice

The first implementation deliberately keeps achievements small:

- First Steps: complete the first session.
- Flawless Focus: complete a session with no mistakes.
- Three Days Pact: reach a 3-day practice streak.
- Unbroken 7: reach a 7-day practice streak.
- Moon Cycle: reach a 30-day practice streak.
- Long Watch: practice for 30 minutes in one session.
- Deep Dive: practice for 1 hour in one session.
- Dungeon Marathon: practice for 3 hours in one session.

Achievement unlocks are stored in save progress and rendered after the reward
screen. Future achievements should reuse this path rather than adding separate
session-end UI.

Streak achievements also have a small visible milestone message after the reward
screen. This keeps continuity feeling special even when the achievement list is
not the player's main focus.

## First Full Achievement Set

The first complete set should cover six categories. It can be implemented in
small batches, but the categories should stay stable so save data remains easy to
understand.

### Continuity

- First Quest: complete the first session.
- Three Days Pact: practice 3 days in a row.
- Unbroken 7: practice 7 days in a row.
- Moon Cycle: practice 30 days in a row.
- Seasoned Adventurer: complete the 90-day journey.
- Return of the Hero: return after missing at least one day.

### Session Length

- Long Watch: practice 30 minutes in one day.
- Deep Dive: practice 1 hour in one day.
- Dungeon Marathon: practice 3 hours in one day.
- Rest, Hero: receive a rest reminder after an unusually long day.

Long-session achievements should celebrate effort while encouraging breaks.

### Accuracy

- Clean Strike: clear one prompt with no mistakes.
- Perfect Chain: clear 10 prompts in a row with no mistakes.
- Crystal Hands: finish a session with 100% accuracy.
- Steady Blade: keep 98%+ accuracy for 5 practice days.
- No Panic: clear a difficult prompt with no mistakes.

### Speed With Control

- Swift Step: reach 30 WPM with 95%+ accuracy.
- Wind Runner: reach 50 WPM with 96%+ accuracy.
- Lightning Scribe: reach 70 WPM with 97%+ accuracy.
- True Speed: beat a personal WPM record without lowering accuracy.

### Weakness Recovery

- Uncursed Finger: cut a weak-key mistake rate in half.
- Symbol Breaker: clear a symbols quest with 95%+ accuracy.
- Shift Master: clear a Shift-focused quest line.
- Left Hand Oath: improve left-hand weak keys.
- Right Hand Oath: improve right-hand weak keys.

### Roguelite Moments

- One HP Victory: clear a quest with 1 HP remaining.
- Mana Overflow: enter a boss prompt with full MP.
- No Potion Needed: clear a quest without using items.
- Cursed Run: clear a quest weighted toward weak keys.
- Flawless Boss: clear a boss prompt with no mistakes.

### Hidden Achievements

Hidden achievements can add charm, but they should not block core completion.

- Practice late at night.
- Practice at the same time for 13 days.
- Perfectly type a prompt containing `qwerty`.
- Perfectly type prompts containing `;`, `{}`, and `=>`.
- Return after a broken streak.

## Implementation Slices

Achievement implementation should remain incremental:

1. Keep the current session-completion achievements green.
2. Add accuracy and speed-with-control achievements from session summaries.
3. Add weak-key recovery achievements after review quest stats are persisted.
4. Add roguelite achievements after HP, MP, items, and modifiers exist.
5. Add 90-day journey achievements after the ending path is implemented.

Every new achievement should include:

- A stable ID in the save model.
- A definition in the achievement catalog.
- Localized display text.
- Unit tests for unlock and "does not unlock twice".
- A rendering path that reuses the existing achievement result screen.

Implemented title rewards:

- Novice Hall Graduate: clear the Day 7 Gatekeeper Trial.
- Meadow Road Pathfinder: clear the Day 14 Waystone Trial.
- River Gate Ferryman: clear the Day 21 Ferryman Trial.
- Lantern Keep Beacon: clear the Day 28 Beacon Trial.
