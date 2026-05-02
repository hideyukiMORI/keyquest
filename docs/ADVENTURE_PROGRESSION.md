# Adventure Progression

## Purpose

Adventure progression should make daily typing feel like a journey without
letting fantasy systems hide weak fundamentals. The player advances by completing
daily practice, but the game should keep pointing them back toward accuracy,
finger responsibility, and weak-key recovery.

This document resolves the first adventure progression design pass. It is a
product and implementation guide, not a promise that every system is already
built.

## Progression Layers

KeyQuest uses four nested layers:

- Prompt: one typed string and its immediate score.
- Segment: one prompt inside a daily session, with quick feedback.
- Daily quest: the saved unit of progress, XP, streak, achievements, and story.
- Weekly arc: seven daily quests around one training theme, ending in a trial.

The save model should treat the daily quest as the durable progression boundary.
Prompts and segments can evolve, but one completed daily quest should remain the
clear unit for journey advancement, streaks, rewards, and story gates.

## 90-Day Map

The first journey lasts 90 days. It is divided into 12 full weekly arcs plus a
6-day finale.

| Days  | Arc             | Training Theme                     | Story Role                   |
| ----- | --------------- | ---------------------------------- | ---------------------------- |
| 1-7   | Novice Hall     | home position and finger ownership | learn the stance             |
| 8-14  | Meadow Road     | top-row reach                      | leave the training hall      |
| 15-21 | River Gate      | bottom row and punctuation         | cross into the wider kingdom |
| 22-28 | Lantern Keep    | number row                         | restore the first beacon     |
| 29-35 | Glass Library   | Shift and capital letters          | read sealed records          |
| 36-42 | Bracket Forge   | common symbols                     | forge the first key          |
| 43-49 | Clockwork Vault | programmer pairs                   | open mechanical locks        |
| 50-56 | Mistwood Review | weak-key recovery                  | cleanse old curses           |
| 57-63 | Dragon Road     | longer phrases                     | travel under pressure        |
| 64-70 | Silent Tower    | mixed punctuation                  | climb the final region       |
| 71-77 | Starfall Gate   | accuracy under speed pressure      | break the outer seal         |
| 78-84 | Lord's Approach | adaptive review and endurance      | prepare for the ending       |
| 85-90 | Lord of Silence | final mixed mastery                | ending sequence              |

The exact names can change, but the theme order should remain conservative:
fundamentals, nearby rows, numbers, Shift, symbols, programmer pairs, adaptive
review, then longer and higher-pressure prompts.

## Weekly Rhythm

Each seven-day arc follows the same pattern:

- Days 1-2: introduce or isolate the new key group.
- Days 3-4: combine the new key group with previous fundamentals.
- Day 5: use short readable English prompts with the new skill.
- Day 6: review weak keys and old mistakes related to the arc.
- Day 7: trial quest with four prompts and a title or story reward.

Weekly trials should be checkpoints, not traps. They test what the week taught
and should not introduce new keys or mechanics.

## Advancement Rules

The current implementation advances after session completion. Future gates can
add quality checks without breaking the daily promise:

- Completing the daily quest advances the journey by default.
- If accuracy is below a future threshold, the next screen should recommend a
  review quest before new content.
- A review quest should not advance the main journey unless it is explicitly the
  daily quest.
- Weekly trial rewards should unlock once and be stored in save progress.
- The latest bundled lesson caps advancement until new content exists.

Early thresholds should be gentle. A player who struggles should receive a
clear recovery path, not a hard wall.

## Weak-Key Review

Weak-key review is part of adventure progression, not a separate mini-game.

- Mistakes become "curses" attached to keys.
- Review quests target the most frequent recent weak keys.
- Review results should explain which keys were trained.
- Weekly Day 6 lessons can eventually be replaced or augmented by dynamic review
  when enough history exists.
- Clearing review should reward accuracy and recovery, not speed.

This lets the roguelite layer create personalized friction while preserving the
trainer's core purpose.

## Quest Map Model

The first implemented quest map is represented as data for the current bundled
arcs:

- `arcId`: stable weekly arc identifier.
- `dayRange`: inclusive start and end day.
- `theme`: training focus shown to the player.
- `lessonIds`: bundled lessons for the arc.
- `trialDay`: final day of the arc.
- `rewardIds`: titles, achievements, materials, or story flags.
- `recommendedReview`: optional weak-key category to prioritize.

The map should reference lessons and rewards by ID rather than embedding lesson
content. Lesson files stay focused on typing prompts.

The implemented weekly trial rule currently uses four prompts for Day 7, Day 14,
Day 21, and Day 28. Normal days can still use the lesson default or the daily
session default.

## Follow-Up Implementation Issues

The next implementation work should be split:

- Add future arcs to the typed quest map as content reaches those days.
- Render a compact "today's quest" and "current arc" status view.
- Add weekly boss quest rules on top of `sessionPromptCount`.
- Add dynamic Day 6 review selection when mistake history is available.
- Add quality-gate recommendations for low accuracy without blocking play.
- Add story flags for arc clear events beyond title rewards.

These should be separate PRs so the core daily loop remains easy to test.
