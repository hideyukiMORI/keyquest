# Issue Workflow

## Operating Model

Development should be Issue-first. For meaningful work, create or link a GitHub
Issue, keep the change small enough to review, and connect the Issue to the PR.

When an Issue or release task has been clearly delegated, the agent is expected
to move the work forward without unnecessary confirmation pauses:

1. Confirm or create the Issue scope.
2. Update `docs/MILESTONES.md` and `docs/TODO.md` when the planned work changes.
3. Implement the smallest coherent slice.
4. Run the appropriate verification, using `npm run verify` before push or merge.
5. Commit with a message that reflects the Issue outcome.
6. Push the branch and open a PR with summary, linked Issue, and test plan.
7. Track review and CI feedback, then keep the PR merge-ready.
8. Merge when checks, review requirements, and release-readiness expectations are
   satisfied.

Stop and ask before proceeding only when scope is ambiguous, checks fail in a way
that changes the plan, a destructive action is required, credentials or secrets
are involved, or the change would conflict with product direction.

Completed work should not be left as loose local changes. When a requested
code, docs, or project-configuration task is finished, end with an appropriate
git commit so the repository state is clear and later work does not inherit
uncertain uncommitted updates.

## Issue Shape

Every implementation Issue should include:

- Problem or opportunity
- Proposed user-facing outcome
- Acceptance criteria
- Verification plan
- Links to related docs or PRs

## Labels

Suggested labels:

- `type:feature`
- `type:bug`
- `type:docs`
- `type:maintenance`
- `area:cli`
- `area:lessons`
- `area:devex`
- `priority:high`
- `priority:normal`

## Pull Requests

PR descriptions should include:

- Summary
- Linked Issue
- Test plan
- Follow-up work, if any

Prefer small PRs. A PR should be easy to review, have a clear acceptance target,
and leave `main` releasable after merge.
