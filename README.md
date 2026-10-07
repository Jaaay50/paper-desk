# paper-desk

AI-assisted academic writing desk. A student submits a brief; the system assesses it, and after the student confirms it generates an outline, a first draft, revision suggestions and a citation/format checklist. A human reviewer approves or sends it back before delivery.

## Scope

- Writing assistance only. The output is a draft and revision aid for the student to work from, not a finished paper for submission.
- No payments in v1. The assessment returns an estimated price only.
- Reviewer access is a single shared password (`ADMIN_TOKEN`), not per-user accounts. Client access to an order is by its unguessable URL.

## Order flow

submit → assess (`needs_info` if the brief is thin) → client confirms → AI draft → human review → delivered → closed.
Review can send a draft back (`revising` → `in_review`), and the client can also reopen a delivered order with change notes. The state machine is in `src/lib/order-status.ts`.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000, embedded database in .data/
pnpm test
pnpm build
```

Copy `.env.example` to `.env.local` to configure Postgres (`DATABASE_URL`), the model key (`ANTHROPIC_API_KEY`) and the reviewer password (`ADMIN_TOKEN`). Without a key, drafts are placeholders. Migrations in `drizzle/` run automatically on first connection.

## Layout

- `src/lib/assess.ts` brief completeness check and price estimate
- `src/lib/orders.ts` order operations on top of the state machine
- `src/lib/ai.ts` draft generation
- `src/app/` home page, order page `/orders/[id]`, reviewer page `/admin`
