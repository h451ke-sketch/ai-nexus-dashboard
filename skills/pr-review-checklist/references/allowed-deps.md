# Dependency allow-list (excerpt)

Adding a dependency from outside this list requires a one-paragraph justification in the PR description.

## Backend (Node.js / TypeScript)

- `zod` — runtime validation
- `pino` — structured logging
- `drizzle-orm` — DB access
- `hono` — HTTP framework

## Frontend

- `react`, `react-dom`
- `next`
- `@tanstack/react-query`
- `lucide-react` — icons

## Forbidden

- `moment`, `lodash` (use date-fns and stdlib equivalents)
- Anything unmaintained (no commits in 18+ months)
