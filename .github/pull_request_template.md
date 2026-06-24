## Summary

<!-- What does this PR do, and why? One or two sentences. -->

## Related issue

<!-- Link to issue, e.g. Closes #123. Delete if none. -->

## Changes

-

## Verification

- [ ] `bun run lint` is clean
- [ ] `bunx tsc --noEmit` is clean
- [ ] `bun run build` succeeds
- [ ] No regressions — manually smoked the routes/flows I touched
- [ ] Prisma schema changes: ran `bun run db:generate` (and `db:push`/`db:migrate`)

## Screenshots / video

<!-- If this PR changes the UI, attach before/after screenshots or a short screen recording. -->

## Checklist

- [ ] PR is small and focused (one concern)
- [ ] New business logic lives in `src/lib/`, components stay presentational
- [ ] No copy-pasted logic — shared code extracted to `src/lib`
