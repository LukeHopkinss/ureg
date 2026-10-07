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

```bash
npm install
cp .env.example .env

npm run db:up          # start local Postgres
npm run db:migrate     # apply migrations

npm run dev:worker     # API on http://localhost:8787
npm run dev:web        # dashboard on http://localhost:5173 (proxies /v1 to the Worker)

npm test               # unit tests
npm run lint
npm run typecheck
```

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
`apps/worker/src/repositories`. Neon is reached through Cloudflare Hyperdrive in production; locally
`wrangler dev` uses the `localConnectionString` in `apps/worker/wrangler.jsonc`.

After changing `db/schema`, run `npm run db:generate` and commit the new migration.

## Deploying

```bash
npx wrangler hyperdrive create ureg-db --connection-string="$NEON_DATABASE_URL"
# put the returned id in apps/worker/wrangler.jsonc
npm run deploy -w @ureg/worker
```

## Status

Phase 0 (project foundation) scaffold. See `docs/plan.md` §38–39 for the build order.
