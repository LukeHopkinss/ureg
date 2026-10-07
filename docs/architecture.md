# Architecture

See `plan.md` §7 for the full picture.

```text
React dashboard (static assets) ─┐
                                 ├─ Cloudflare Worker (/v1 API, auth, cron) ─ Hyperdrive ─ PostgreSQL (Neon)
CLI / Python SDK ────────────────┘
```

## Three separate states

- **Desired** — what should exist (`automations.yaml`, CLI, dashboard).
- **Observed** — what UReg can see exists (GitHub integration, SDK registration).
- **Execution** — what UReg has seen run (SDK events, provider APIs).

These are stored separately on each automation and combined only by the reconciler
(`apps/worker/src/reconciliation`), which is pure and deterministic.

## Boundaries

- Cloudflare-specific code stays in `apps/worker/src/index.ts`, `env.ts`, and `wrangler.jsonc`.
- Database access goes through `apps/worker/src/repositories`; every method takes `organizationId`.
- `db/` uses standard PostgreSQL only, so Neon can be swapped for self-hosted Postgres.
