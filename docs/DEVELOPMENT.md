# Development Policy

## Operating Model

KeyQuest is developed Issue-first. Each meaningful change should start from a
GitHub Issue, produce a focused branch, pass local verification, and land through
a Pull Request unless the change is a small repository-maintenance update.

## Philosophy

- Practice value comes first. Game mechanics should reinforce accuracy, rhythm,
  recall, and review.
- Keep the terminal experience fast and calm. Avoid visual noise that makes
  typing harder.
- Prefer portable Node.js APIs before adding native dependencies.
- Treat lesson data as product content. It should be reviewed as carefully as
  code.
- Optimize after measurement. A typing game is usually limited by terminal I/O
  and interaction design, not raw JavaScript speed.

## Git Workflow

- `main` should stay releasable.
- Use short-lived feature branches named `issue-N-short-name`.
- Commit when a coherent slice is complete and verified.
- Push branches and open PRs for reviewable work.
- Squash or merge according to what preserves the clearest history for that PR.

## Definition of Done

- The linked Issue has clear acceptance criteria.
- `npm run verify` passes locally.
- User-facing behavior is documented in `README.md` or `docs/` when relevant.
- New behavior has focused tests where the risk justifies it.
- Follow-up work is tracked in Issues or `docs/TODO.md`.
