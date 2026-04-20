---
name: pr-review-checklist
description: Review a pull request against the company's engineering standards. Use when the user asks to review a PR, check a diff, prepare review comments, or confirm a PR is ready to merge.
version: 2.0.0
license: Internal
tags:
  - process
  - code-review
  - quality
---

# pr-review-checklist

A structured walk-through to apply when reviewing any PR in our monorepo.

## When to use

- User says "review this PR", "look at this diff", or shares a GitHub PR URL.
- User asks "is this ready to merge?" or "what would you flag in this change?".

## Procedure

Walk through the checklist in order. Skip a section only if it is clearly not applicable, and **note in your review which sections you skipped and why**.

### 1. Scope and intent

- Is the PR title in the form `<area>: <imperative summary>` (e.g. `billing: handle annual prorations`)?
- Does the description state **what** changed and **why**?
- Is the diff under ~400 lines? If not, suggest splitting unless there is a justified reason.

### 2. Tests

- New behaviour has at least one test that would fail without the production change.
- Bug fixes include a regression test.
- No tests were deleted or weakened without a comment in the description explaining why.

### 3. Public API surface

- Any new exported function/type has a doc comment.
- Breaking changes are flagged in the PR description with a `BREAKING:` line.
- HTTP endpoints follow `kebab-case` URLs and `snake_case` JSON keys (see `references/api-style.md`).

### 4. Data and migrations

- Migrations are append-only (no destructive in-place changes).
- New columns are nullable or have a default.
- Backfills are explicitly described or scheduled — not silently embedded in the migration.

### 5. Observability

- New code paths log structured fields, not free-form strings.
- New metrics use the project's existing naming convention (`<service>_<noun>_<verb>_total`).
- Error paths are not swallowed silently.

### 6. Security

- No secrets in the diff (run `git diff | grep -iE 'secret|token|key|password'`).
- Inputs from outside the trust boundary are validated.
- New dependencies were checked against the allow-list in `references/allowed-deps.md`.

## How to write the review

Group comments under three headings:

- **Blocking** — must fix before merge.
- **Recommended** — should fix, but won't block.
- **Nit** — style or preference; author can ignore.

End the review with one of:

- `Approve ✅ — ready to merge`
- `Comment 📝 — non-blocking feedback only`
- `Request changes ⛔ — blocking issues above`

## Validation

You are done when every applicable section is checked and the review concludes with one of the three verdicts above.
