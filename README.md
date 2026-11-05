# UReg — Universal Automation Registry

> A universal registry for everything your organization runs automatically.

**Declare → Discover → Observe → Reconcile → Visualize.**

UReg answers one question: _what does our company run automatically, and is it actually running?_
The full MVP plan lives in [`docs/plan.md`](docs/plan.md).

## Repository layout

```text
apps/
  web/            React + Vite + Tailwind dashboard (served as Worker static assets)
  worker/         Cloudflare Worker: API, auth, reconciliation cron, integrations
packages/
  shared/         Status model, reason codes, automations.yaml schema, shared types
  cli/            `ureg` CLI (TypeScript / Node)
  sdk-python/     Optional Python runtime instrumentation
db/
  schema/         Drizzle schema (standard PostgreSQL)
  migrations/     Generated SQL migrations (committed)
docs/             Architecture, CLI, SDK, security notes
```

## Local development

Requirements: Node 22+, Docker (for local Postgres), Python 3.10+ (SDK only).

Create a gitignored `.env` in the repo root with a development connection string.
No env file is committed, so write one of these yourself:

```bash
# Docker Postgres (docker-compose.yml)
echo 'DATABASE_URL=postgres://ureg:ureg@localhost:5432/ureg' > .env

# or a Neon *dev* branch — never the production branch
echo 'DATABASE_URL=postgres://<user>:<password>@<dev-host>.neon.tech/neondb?sslmode=require' > .env
```

```bash
npm install

npm run db:up          # start local Postgres (skip if using Neon)
npm run db:migrate     # apply migrations to DATABASE_URL

npm run dev:worker     # API on http://localhost:8787
npm run dev:web        # dashboard on http://localhost:5173 (proxies /v1 to the Worker)

npm test               # unit tests
npm run lint
npm run typecheck
```

Smoke-check the Worker's database binding:

```bash
curl localhost:8787/v1/health      # {"ok":true} — Worker is up
curl localhost:8787/v1/health/db   # {"ok":true} — Worker reached Postgres
```

`/v1/health/db` returns `503 {"ok":false}` when Postgres is unreachable. It is
unauthenticated, so the body is deliberately opaque; the real error is logged by
the Worker only.

CLI (development):

```bash
npm run ureg -- init
npm run ureg -- validate -f automations.example.yaml
```

Python SDK:

```bash
cd packages/sdk-python
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]" && pytest
```

## Database

The app depends on PostgreSQL, not Neon. All access goes through org-scoped repositories in
`apps/worker/src/repositories`, which receive a request-scoped client from the `withDb` middleware
(`apps/worker/src/db.ts`) as `c.var.db`. Handlers must never construct their own client.

Neon is reached through Cloudflare Hyperdrive in production. Locally, `wrangler dev` uses the
`localConnectionString` in `apps/worker/wrangler.jsonc` (Docker Postgres). To point local
`wrangler dev` at a Neon dev branch instead, export the binding override from the same dev URL in
the shell that starts it:

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="$DATABASE_URL"
npm run dev:worker
```

### Migrations

All commands run from the repo root.

```bash
npm run db:generate    # generate SQL from db/schema — works offline, no DATABASE_URL needed
npm run db:migrate     # apply to the dev database (.env, or DATABASE_URL from the shell)
npm run db:studio      # browse the dev database
```

`db:migrate` prints the host and database it is about to change before changing it, and fails with
an explicit error when no `DATABASE_URL` is set — it never falls back to localhost.

Commit the generated migration. Never edit a migration that has already been applied; add a new one.

### Production migrations

The Worker does not read an env file in production — Hyperdrive holds the runtime credential. Only
operator-run migrations need one:

```bash
echo 'DATABASE_URL=<production url>' > .env.production   # gitignored
npm run db:migrate:prod
```

`db:migrate:prod` reads `.env.production` only, and refuses to run until you retype the target host
(or set `UREG_DB_CONFIRM=<host>` in a non-interactive context).

## Deploying

```bash
npx wrangler hyperdrive create ureg-db --connection-string="$NEON_DATABASE_URL"
# put the returned id in apps/worker/wrangler.jsonc
npm run deploy -w @ureg/worker
```

The Hyperdrive id in `wrangler.jsonc` is not a secret; the connection string behind it is held by
Cloudflare and must never be committed.

## Status

Phase 0 (project foundation). Schema, migration workflow, and the Worker's request-scoped
database client are in place and verified against Postgres. The API routes, dashboard, scheduled
reconciler, and SDK are still scaffolds. See `docs/plan.md` §38–39 for the build order.
