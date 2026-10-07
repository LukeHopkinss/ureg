# UReg — Universal Automation Registry

## MVP Product + Engineering Plan

> **Core idea:** A universal registry for everything an organization runs automatically.
>
> **Core loop:** Declare what should exist → discover what does exist → observe what runs → reconcile the difference → visualize it clearly.
>
> **Primary MVP principle:** Keep the scope narrow. UReg is not an incident platform, log platform, workflow orchestrator, observability suite, or AI product.

---

# 1. Product Definition

UReg gives teams one place to see recurring and background automations across their organization.

Examples:

- GitHub Actions scheduled workflows
- Vercel cron jobs
- AWS EventBridge schedules
- internal Python workers
- internal TypeScript workers
- shell/cron jobs
- automation scripts registered through the CLI
- manually tracked business automations

The MVP should answer:

1. What automations exist?
2. Where do they run?
3. Who owns them?
4. How often should they run?
5. When did they last run?
6. Are they healthy, missing, stale, removed, or unregistered?
7. How was each automation discovered?
8. What has changed recently?

---

# 2. Target Users

## Technical users

Developers and infrastructure engineers should be able to:

- declare automations in code/config
- sync desired state through a CLI
- register runtime executions through an SDK
- inspect technical metadata
- identify drift between declared and observed state
- see execution history
- discover unmanaged automations

## Non-technical users

Operations, finance, support, or business users should be able to:

- open the dashboard
- see every automation
- understand whether it is working
- see who owns it
- understand what it does
- identify automations needing attention
- assign an owner or update business-facing metadata

Non-technical users should never need to understand cron syntax unless they intentionally open technical details.

---

# 3. Scope

## MVP includes

- organization/workspace support
- user authentication
- automation registry
- CLI
- declarative `automations.yaml`
- desired-state reconciliation
- manual automation creation
- GitHub Actions integration
- execution ingestion API
- Python SDK
- dashboard overview
- automation detail page
- simple roles
- status calculation
- historical executions
- soft deletion
- security controls around tenant isolation and credentials

## Explicitly out of scope for MVP

Do **not** build:

- AI features
- dependency graphs
- cost tracking
- incident management
- workflow editing/execution
- log aggregation
- arbitrary remote command execution
- deep business-process modeling
- Slack integration
- dozens of integrations
- enterprise RBAC
- SSO/SAML
- graph database
- Kubernetes
- Kafka
- full observability stack
- long-term analytics warehouse
- automatic remediation

---

# 4. Core Product Mental Model

UReg tracks three distinct concepts.

## Desired state

What the organization says **should exist**.

Sources:

- `automations.yaml`
- CLI
- dashboard manual creation

## Observed state

What UReg can independently see **does exist**.

Sources:

- GitHub integration
- future integrations
- SDK registration/lease
- runtime heartbeat

## Execution state

What UReg has seen **actually run**.

Sources:

- SDK execution events
- provider execution APIs

These states must remain separate.

Example:

```text
Desired:  yes
Observed: yes
Execution: current

=> HEALTHY
```

```text
Desired:  yes
Observed: yes
Execution: late

=> MISSED
```

```text
Desired:  yes
Observed: no

=> MISSING
```

```text
Desired:  no
Observed: yes

=> UNREGISTERED
```

```text
Desired:  no
Observed: no
Historical record exists

=> REMOVED
```

---

# 5. Status Model

Use a small, deterministic status enum.

```text
HEALTHY
MISSED
MISSING
STALE
UNREGISTERED
FAILING
REMOVED
UNKNOWN
```

## Status definitions

### HEALTHY

Automation is behaving as expected.

### MISSED

Automation exists, but an expected execution was not observed within its allowed grace window.

### MISSING

Automation is declared but cannot currently be observed through its declared source.

### STALE

UReg previously observed the automation but has not received enough evidence recently to confirm it still exists.

This is especially useful for SDK/manual registrations.

### UNREGISTERED

An integration discovered an automation that is not present in desired state.

### FAILING

Recent execution evidence shows the automation is running but failing.

### REMOVED

The source of truth explicitly says the automation was intentionally removed.

Historical data must remain available.

### UNKNOWN

UReg does not have enough evidence to determine health.

Do not incorrectly show UNKNOWN automations as healthy.

---

# 6. Schedule and Grace-Period Logic

Do not use a global rule such as:

```text
last_seen > 24 hours => stale
```

Statuses must depend on the expected schedule.

Examples:

```text
Every 5 minutes
Grace window: approximately 2 expected intervals
```

```text
Every month
No alert after 10 days
```

MVP behavior:

1. Parse cron expressions.
2. Calculate previous expected run.
3. Calculate next expected run.
4. Apply a configurable grace multiplier.
5. Determine whether an expected run was missed.

Default:

```text
grace_intervals = 2
```

Allow this to become configurable later.

---

# 7. High-Level Architecture

```text
                       ┌───────────────────────┐
                       │   React Dashboard     │
                       │  Cloudflare Workers   │
                       └───────────┬───────────┘
                                   │
                                   │ HTTPS
                                   ▼
                         ┌──────────────────┐
                         │ Cloudflare Worker │
                         │ API + auth layer  │
                         └─────────┬────────┘
                                   │
                              Hyperdrive
                                   │
                                   ▼
                            ┌─────────────┐
                            │    Neon     │
                            │ PostgreSQL  │
                            └──────┬──────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              ▼                    ▼                     ▼
      Reconciliation        GitHub Sync           Execution Data
      Cron Trigger          Cron/Webhooks         CLI / SDK
```

---

# 8. Technology Choices

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router or equivalent lightweight routing

## Hosting and backend

- Cloudflare Workers
- Cloudflare Static Assets
- Cloudflare Cron Triggers
- Cloudflare Hyperdrive
- Cloudflare Queues later if needed

## Database

- Neon PostgreSQL
- standard Postgres features wherever possible
- Drizzle ORM
- migrations committed to repository

## Authentication

Use a lightweight authentication provider or self-contained auth library compatible with Cloudflare.

Requirements:

- organizations/workspaces
- sessions
- simple membership roles
- secure cookies/tokens
- no dependency on Supabase-specific auth

## CLI

Recommended:

- TypeScript
- Node.js
- packaged through npm initially
- optional standalone binary later

## SDK

MVP:

- Python SDK first

Later:

- TypeScript SDK

---

# 9. Portability Rule

The application must depend on **PostgreSQL**, not Neon-specific database behavior.

All database access should pass through an application repository/data layer.

Example:

```text
automationRepository.list(...)
automationRepository.get(...)
automationRepository.upsert(...)
executionRepository.create(...)
```

Avoid scattering provider-specific code across the application.

This allows:

```text
Neon PostgreSQL
      ↓
Self-hosted PostgreSQL
```

later with minimal application changes.

---

# 10. Proposed Repository Structure

```text
ureg/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   └── lib/
│   │   └── ...
│   │
│   └── worker/
│       ├── src/
│       │   ├── api/
│       │   ├── auth/
│       │   ├── integrations/
│       │   ├── reconciliation/
│       │   ├── repositories/
│       │   └── services/
│       └── ...
│
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   ├── schemas/
│   │   └── validation/
│   │
│   ├── cli/
│   │
│   └── sdk-python/
│
├── db/
│   ├── schema/
│   └── migrations/
│
├── docs/
│   ├── architecture.md
│   ├── cli.md
│   ├── sdk.md
│   └── security.md
│
├── automations.example.yaml
├── package.json
└── README.md
```

Prefer a monorepo.

---

# 11. Core Database Schema

## organizations

```text
id
name
slug
created_at
updated_at
```

## users

```text
id
email
name
created_at
updated_at
```

## organization_members

```text
organization_id
user_id
role
created_at
```

Roles for MVP:

```text
admin
member
viewer
```

## automations

```text
id
organization_id

stable_key
name
description

owner_type
owner_value

environment

source_type
source_external_id

schedule_type
schedule_expression
schedule_human

desired_state
observed_state
status

last_seen_at
last_run_at
next_expected_run_at

managed_by
management_source_id

created_at
updated_at
removed_at
```

### Notes

`stable_key` should be unique inside an organization.

Example:

```text
stripe-customer-sync
```

Use `stable_key` rather than the display name as the durable identifier.

## executions

```text
id
organization_id
automation_id

external_execution_id

started_at
finished_at

status
duration_ms

created_at
```

Statuses:

```text
started
success
failed
cancelled
unknown
```

## integration_connections

```text
id
organization_id

provider
external_account_id

encrypted_credentials

status

created_at
updated_at
last_synced_at
```

## integration_sync_runs

```text
id
integration_connection_id

started_at
finished_at

status
records_discovered
error_code

created_at
```

## automation_observations

Optional but recommended.

```text
id
automation_id

source_type
source_external_id

observed_at

exists
metadata_json
```

This provides an audit trail for observed state without overwriting history.

---

# 12. Declarative Configuration

Default file:

```text
automations.yaml
```

Example:

```yaml
version: 1

automations:
  - id: stripe-sync
    name: Stripe Customer Sync
    description: Syncs Stripe customers into the production database.
    owner: payments
    schedule: "*/5 * * * *"
    environment: production

  - id: nightly-backup
    name: Nightly Database Backup
    owner: infrastructure
    schedule: "0 2 * * *"
    environment: production
```

## Rules

- `id` is the stable automation key.
- IDs are immutable once created.
- display names can change.
- configuration must validate locally before being sent.
- invalid cron syntax must fail before apply.
- duplicate IDs must fail.
- destructive differences must be surfaced before apply.

---

# 13. CLI

CLI name placeholder:

```bash
ureg
```

## MVP commands

```bash
ureg login
ureg logout

ureg init

ureg diff -f automations.yaml
ureg apply -f automations.yaml

ureg list
ureg get <automation-id>
ureg status

ureg remove <automation-id>
```

## `ureg init`

Creates:

```text
automations.yaml
```

and optionally project metadata.

## `ureg diff`

Compare local desired state with registry desired state.

Example:

```text
Plan:

  + stripe-sync
  ~ nightly-backup
  - weekly-report

1 to add
1 to change
1 to remove
```

## `ureg apply`

Rules:

1. Validate config.
2. Fetch current desired state.
3. Generate diff.
4. Display destructive changes.
5. Require confirmation interactively.
6. Apply as one logical change.
7. Return deterministic result.

CI:

```bash
ureg apply --yes
```

## Safety

If a change removes many automations, require elevated confirmation.

Example:

```text
WARNING: 12 automations will be removed.
```

Potential future option:

```bash
ureg apply --allow-large-delete
```

---

# 14. CLI Authentication

Do not store a permanent organization-wide admin token in plaintext.

Requirements:

- login through browser/device flow or one-time code
- store credentials in OS keychain where possible
- use short-lived access tokens
- revocable refresh/session credential
- `ureg logout` revokes the session

CI should use scoped machine credentials.

Example permission set:

```text
automation:read
automation:write
```

Do not give CI credentials permission to:

```text
manage_users
manage_integrations
change_billing
```

---

# 15. Python SDK

The SDK is optional.

The registry must provide value without installing the SDK.

## Primary API

```python
from ureg import track

with track("stripe-sync"):
    sync_customers()
```

SDK behavior:

```text
execution started
↓
application code runs
↓
execution success/failure
↓
duration recorded
```

## Decorator form

Optional:

```python
from ureg import automation

@automation("stripe-sync")
def sync_customers():
    ...
```

## Heartbeats

For long-running workers:

```python
from ureg import heartbeat

heartbeat("event-consumer")
```

Do not require constant heartbeats for ordinary scheduled jobs.

---

# 16. SDK Credentials

SDK credentials should be scoped service tokens.

Example:

```text
Service:
billing-worker

Allowed:
execution:create
heartbeat:create

Denied:
automation:list
organization:read
user:read
integration:manage
```

A compromised worker should not expose the full organization.

---

# 17. API Surface

Initial API:

```text
GET    /v1/automations
GET    /v1/automations/:id
POST   /v1/automations
PATCH  /v1/automations/:id

POST   /v1/registry/diff
POST   /v1/registry/apply

GET    /v1/automations/:id/executions
POST   /v1/automations/:id/executions/start
POST   /v1/automations/:id/executions/finish

POST   /v1/automations/:id/heartbeat

GET    /v1/integrations
POST   /v1/integrations/github/connect

POST   /v1/internal/reconcile
POST   /v1/internal/integrations/github/sync
```

Exact routes may change, but keep the conceptual boundaries.

---

# 18. API Design Rules

## Idempotency

Registry apply must be idempotent.

Running:

```bash
ureg apply
```

100 times against the same file should produce the same state.

Execution APIs should support an idempotency key or unique execution ID.

## Tenant isolation

Every data access must be scoped by organization.

Never write repository code equivalent to:

```sql
SELECT *
FROM automations
WHERE id = $1;
```

without organization scope.

Use:

```sql
SELECT *
FROM automations
WHERE id = $1
AND organization_id = $2;
```

Prefer repository helpers that require `organization_id`.

---

# 19. Reconciliation Engine

The reconciler is the core backend component.

Input:

```text
desired state
observed state
execution state
schedule
grace period
removal state
```

Output:

```text
status
reason
next_expected_run
last_evaluated_at
```

## Reconciliation example

```text
Automation: stripe-sync

Desired:
yes

Observed:
yes

Schedule:
every 5 minutes

Last successful run:
3 minutes ago

Result:
HEALTHY
```

## Another example

```text
Automation: weekly-report

Desired:
yes

Observed:
yes

Expected:
Monday 09:00

Last run:
previous Monday

Result:
MISSED
```

Store a machine-readable reason code.

Example:

```text
MISSED_EXPECTED_EXECUTION
SOURCE_NOT_OBSERVED
DISCOVERED_NOT_DECLARED
SDK_LEASE_EXPIRED
RECENT_EXECUTION_FAILED
```

---

# 20. Reconciliation Scheduling

MVP:

- Cloudflare Cron Trigger
- run every few minutes
- select automations requiring evaluation
- calculate updated status
- persist only changes

Avoid evaluating every historical automation on every cycle.

Later:

- shard reconciliation work
- use Cloudflare Queues
- event-driven reconciliation

Do not add Queues until needed.

---

# 21. GitHub Actions Integration

GitHub is the first external integration.

## MVP goals

- connect a GitHub organization/account through a GitHub App
- read accessible repositories
- identify workflow files
- identify scheduled workflows
- identify recent runs when available
- normalize them into UReg automations
- mark them observed
- detect automations not present in desired state

## Example

GitHub:

```yaml
on:
  schedule:
    - cron: "0 2 * * *"
```

UReg:

```text
Name: nightly-backup
Source: GitHub Actions
Observed: yes
Schedule: 0 2 * * *
```

If it is not declared:

```text
UNREGISTERED
```

## Permissions

Request the minimum GitHub permissions needed.

Prefer read-only permissions.

Do not request repository write access for MVP.

---

# 22. Polling vs Webhooks

For MVP:

**Prefer polling.**

Benefits:

- easier to implement
- easier to reason about
- fewer webhook lifecycle edge cases
- simpler retry behavior

Tradeoff:

- state is not instant

Later:

- GitHub webhooks can trigger fast syncs
- periodic polling remains as reconciliation backup

---

# 23. Dashboard UX

The dashboard is a first-class product, not an afterthought.

The same data should work for both technical and non-technical users.

---

# 24. Dashboard Screen 1 — Overview

Route:

```text
/automations
```

Example:

```text
Automations

18 total     15 healthy     2 missed     1 stale

Search...

NAME                   OWNER          SOURCE          LAST RUN      STATUS
Stripe Customer Sync   Payments       Python SDK      2m ago        Healthy
Nightly Backup         Infra          GitHub Actions  14h ago       Healthy
Invoice Report         Finance        GitHub Actions  2d ago        Missed
Cleanup Worker         Backend        CLI             19d ago       Stale
```

## Features

- text search
- filter by status
- filter by owner
- filter by source
- filter by environment
- sort by last run
- click into automation

Do not overload this page with graphs.

---

# 25. Dashboard Screen 2 — Automation Detail

Route:

```text
/automations/:id
```

Top section:

```text
Stripe Customer Sync

HEALTHY

Syncs Stripe customer and subscription data
into the production database.

Owner
Payments

Runs
Every 5 minutes

Environment
Production

Source
Python SDK
```

Activity:

```text
Last run
2 minutes ago

Next expected
in 3 minutes
```

Recent executions:

```text
5:20 PM    Success     841 ms
5:15 PM    Success     792 ms
5:10 PM    Failed      4.2 s
```

Registry state:

```text
Declared    yes
Observed    yes
Executing   yes
```

Technical details:

```text
Stable ID
stripe-sync

Cron
*/5 * * * *

Source
python-sdk

Last heartbeat
...
```

Non-technical information belongs above technical details.

---

# 26. Dashboard Screen 3 — Setup / Integrations

Route:

```text
/settings
```

MVP sections:

- organization
- team members
- GitHub connection
- CLI setup
- API/service credentials
- SDK quickstart

Keep this small.

---

# 27. Manual Automations

Manual creation is allowed but should not behave like a permanent unchecked database row.

When creating manually, ask:

```text
How should UReg know this automation still exists?
```

Options:

```text
Track expected schedule
Developer will instrument it
Connect it to a supported integration
Manual record only
```

For manual-only records, clearly label:

```text
Verification: Manual
Health confidence: Limited
```

Do not pretend UReg can verify what it cannot observe.

---

# 28. Desired-State Ownership

Important tradeoff:

CLI-managed infrastructure fields should not be silently overwritten from the dashboard.

For an automation managed by `automations.yaml`:

```text
name            controlled by config
schedule        controlled by config
environment     controlled by config
stable ID       controlled by config
```

Allow dashboard editing of business metadata:

```text
description
owner
business notes
```

Show:

```text
Managed by automations.yaml
```

in the UI.

---

# 29. Deletion Semantics

Never hard-delete an automation as part of normal product behavior.

Use:

```text
removed_at
```

and preserve:

- execution history
- previous source
- previous owner
- creation/removal timestamps

Distinguish:

```text
REMOVED
```

from:

```text
MISSING
```

Removed means intentional.

Missing means expected but not found.

---

# 30. Security Model

Security is important because UReg becomes a map of how a company operates.

## Security principle

Collect **metadata about automations**, not the data processed by automations.

---

# 31. Security Requirements

## Secrets

Do not collect:

- environment variables
- API keys
- DB connection strings
- raw credentials
- arbitrary request bodies

Redact obvious secret patterns from error metadata if error capture is added.

## Raw logs

Do not build log ingestion in MVP.

Store:

```text
success
failure
duration
timestamps
provider execution ID
```

Do not store:

```text
stdout
stderr
request bodies
customer payloads
```

## Integration credentials

- encrypt at rest
- never display after creation
- allow revocation
- use least privilege

## API credentials

- scoped tokens
- revocable
- no master organization token in applications
- separate human and service credentials

## Tenant isolation

Mandatory organization scoping at repository layer.

## Webhooks

When added:

- verify signatures
- enforce replay protection
- validate provider
- do not trust payload identity blindly

## SSRF

Do not design the MVP around UReg calling arbitrary customer-provided heartbeat URLs.

Use:

```text
customer automation -> UReg
```

not:

```text
UReg -> arbitrary customer URL
```

## CLI safety

CLI must parse structured config only.

Do not support config fields that execute shell commands.

Bad:

```yaml
healthcheck:
  command: curl ...
```

Avoid this in MVP.

## SDK / CLI supply chain

Eventually:

- protected package publishing
- signed releases
- dependency scanning
- restricted CI release credentials

---

# 32. Data Retention

Execution records can grow quickly.

Example:

```text
1 job running every minute
= 43,200 executions/month
```

MVP:

- store executions normally in Postgres
- index carefully
- do not prematurely optimize

Later:

```text
0–30 days:
full execution history

30–365 days:
aggregated summaries

older:
incidents/statistics only
```

Retention policy should eventually be configurable by plan.

---

# 33. Database Indexes

At minimum:

```text
automations(organization_id)
automations(organization_id, status)
automations(organization_id, stable_key)
automations(organization_id, last_run_at)

executions(automation_id, started_at DESC)
executions(organization_id, started_at DESC)

integration_connections(organization_id, provider)
```

Use uniqueness:

```text
UNIQUE(organization_id, stable_key)
```

and, when available:

```text
UNIQUE(automation_id, external_execution_id)
```

to prevent duplicate ingestion.

---

# 34. Idempotency and Replay Protection

Execution ingestion should accept:

```text
execution_id
```

or an idempotency key.

Duplicate event:

```text
same execution ID
```

must not create a second execution.

Later, signed requests can include:

- timestamp
- nonce
- signature

---

# 35. Neon Strategy

Use Neon as managed PostgreSQL initially.

Application code must remain portable.

Rules:

1. Use standard PostgreSQL.
2. Keep migrations in repository.
3. Avoid unnecessary Neon-specific database features.
4. Use a normal `DATABASE_URL`.
5. Keep DB access behind repository/service interfaces.
6. Track Postgres version.
7. Keep extension use minimal.

Future migration:

```text
Neon
  ↓
pg_dump / replication
  ↓
Self-hosted PostgreSQL
  ↓
update Hyperdrive connection
```

The frontend/API should not need meaningful changes.

---

# 36. Cloudflare Strategy

Use Cloudflare for:

- static frontend hosting
- Worker API
- Cron Triggers
- Hyperdrive
- DNS
- optional Queues later
- optional R2 later for exports/backups

Do not use D1 as the primary database.

Do not add Queues until background volume requires them.

---

# 37. Tradeoffs

## 1. CLI source of truth vs dashboard editing

Decision:

Use a hybrid model.

Infrastructure state is controlled by the declared source.

Business metadata may be changed in the dashboard.

## 2. Polling vs webhooks

Decision:

Polling first.

Add webhooks later.

## 3. Inventory vs runtime monitoring

Decision:

Support different confidence levels.

An automation may be:

```text
Known
Observed
Monitored
```

Do not imply runtime monitoring where it does not exist.

## 4. SDK vs CLI

Decision:

CLI is primary developer interface for desired state.

SDK is optional runtime instrumentation.

## 5. Postgres vs specialized database

Decision:

PostgreSQL.

No graph DB.

## 6. Synchronous writes vs Queues

Decision:

Direct writes first.

Use Queues when event volume creates a real need.

## 7. Rich logs vs metadata only

Decision:

Metadata only.

Avoid turning UReg into a log platform.

## 8. Hard deletion vs history

Decision:

Soft delete.

Preserve history.

---

# 38. MVP Development Phases

---

## Phase 0 — Project Foundation

### Tasks

- create monorepo
- configure TypeScript
- configure linting/formatting
- configure tests
- create Cloudflare Worker
- create React/Vite app
- configure Neon database
- configure Hyperdrive
- configure Drizzle
- create migration workflow
- create local environment setup
- create CI

### Completion criteria

A developer can:

```text
clone repository
install dependencies
start frontend
start local Worker
connect to development DB
run migrations
run tests
```

---

## Phase 1 — Core Registry

### Build

- organizations
- users
- memberships
- automations
- executions
- repositories
- service layer
- API endpoints

### Build status enum and base reconciliation service.

### Completion criteria

Through the API, a user can:

- create automation
- list automation
- get automation
- update automation
- soft remove automation
- add execution
- view executions

---

## Phase 2 — Dashboard

### Build

- auth flow
- automation overview
- filters
- status summary
- automation detail page
- recent executions
- registry state
- technical details
- manual creation

### Completion criteria

A non-technical user can open the dashboard and understand:

- what exists
- what is healthy
- what needs attention
- who owns it
- when it last ran

---

## Phase 3 — Declarative CLI

### Build

- config schema
- YAML parser
- local validation
- `ureg init`
- `ureg diff`
- `ureg apply`
- `ureg list`
- `ureg get`
- `ureg status`
- auth

### Completion criteria

Given:

```yaml
automations:
  - id: stripe-sync
```

running:

```bash
ureg apply
```

creates or updates registry desired state.

Removing it from the YAML produces a destructive diff and then marks it removed when applied.

---

## Phase 4 — Reconciliation

### Build

- cron parser
- expected-run calculator
- grace windows
- state evaluator
- status reason codes
- scheduled reconciliation Worker
- transition tests

### Completion criteria

Automations correctly transition among:

```text
HEALTHY
MISSED
MISSING
STALE
UNREGISTERED
FAILING
REMOVED
UNKNOWN
```

based on deterministic test fixtures.

---

## Phase 5 — GitHub Actions Integration

### Build

- GitHub App
- OAuth/install flow
- encrypted credential storage
- repository discovery
- workflow discovery
- scheduled workflow parser
- recent run ingestion
- periodic sync

### Completion criteria

After connecting GitHub:

```text
scheduled GitHub workflows appear automatically
```

and undeclared workflows show as:

```text
UNREGISTERED
```

---

## Phase 6 — Python SDK

### Build

```python
with track("stripe-sync"):
    ...
```

Features:

- auth
- execution start
- execution finish
- failure capture
- duration
- idempotent execution ID
- heartbeat

### Completion criteria

Running an instrumented Python function causes its execution to appear on the dashboard within seconds.

---

## Phase 7 — Hardening

### Build

- integration retry logic
- API rate limiting
- tenant-isolation tests
- credential rotation
- secure CLI credential storage
- idempotency tests
- audit-friendly state transitions
- pagination
- indexes
- error handling
- basic monitoring

### Completion criteria

System is ready for a small external beta.

---

# 39. Suggested Build Order

Implement in this exact order unless a dependency requires otherwise:

```text
1. Monorepo + deployment skeleton
2. Neon + Drizzle schema
3. Registry repositories
4. Registry API
5. Authentication + organizations
6. Basic dashboard
7. automations.yaml schema
8. CLI init/diff/apply
9. Reconciliation engine
10. Reconciliation Cron Trigger
11. GitHub integration
12. Execution ingestion
13. Python SDK
14. Security hardening
15. Beta polish
```

---

# 40. Testing Strategy

## Unit tests

Must cover:

- cron parsing
- reconciliation transitions
- diff generation
- apply idempotency
- stable-key behavior
- status reason selection
- permission checks

## Integration tests

Must cover:

- Worker → Postgres
- organization isolation
- CLI → API
- SDK → execution API
- GitHub normalization

## Security tests

Explicitly test:

```text
Org A cannot retrieve Org B automation by ID.
Org A cannot retrieve Org B execution by ID.
Service token cannot access user endpoints.
Viewer cannot apply registry changes.
Duplicate execution IDs do not duplicate rows.
```

---

# 41. Example End-to-End MVP Demo

## Step 1

Developer creates:

```yaml
version: 1

automations:
  - id: nightly-backup
    name: Nightly Backup
    owner: infrastructure
    schedule: "0 2 * * *"
    environment: production

  - id: stripe-sync
    name: Stripe Customer Sync
    owner: payments
    schedule: "*/5 * * * *"
    environment: production
```

## Step 2

Developer runs:

```bash
ureg diff
ureg apply
```

## Step 3

Dashboard shows:

```text
Nightly Backup
Stripe Customer Sync
```

## Step 4

User connects GitHub.

UReg discovers:

```text
nightly-backup
customer-cleanup
```

## Step 5

Reconciler produces:

```text
nightly-backup      HEALTHY
stripe-sync         UNKNOWN
customer-cleanup    UNREGISTERED
```

## Step 6

Developer instruments Stripe sync:

```python
from ureg import track

with track("stripe-sync"):
    sync_customers()
```

## Step 7

Dashboard updates:

```text
stripe-sync
HEALTHY
Last ran 2 minutes ago
```

This demo demonstrates the full UReg value proposition.

---

# 42. Product UX Principles

1. Dashboard first.
2. Plain language before infrastructure terminology.
3. Technical detail is available, not forced.
4. Always distinguish known facts from inferred state.
5. Never claim an automation is healthy without sufficient evidence.
6. Make status understandable without reading documentation.
7. Preserve history.
8. Keep developer setup fast.
9. Integrations should provide immediate value.
10. Avoid configuration that executes arbitrary code.

---

# 43. Suggested Status Copy

## HEALTHY

```text
Running normally
```

## MISSED

```text
This automation was expected to run but did not.
```

## MISSING

```text
This automation is declared but cannot currently be found.
```

## STALE

```text
UReg has not seen this automation recently.
```

## UNREGISTERED

```text
UReg discovered this automation, but it is not registered.
```

## FAILING

```text
This automation is running but recent executions are failing.
```

## REMOVED

```text
This automation was intentionally removed.
```

## UNKNOWN

```text
UReg does not yet have enough information to determine health.
```

---

# 44. Naming

Working product name:

```text
UReg
```

Expansion:

```text
Universal Registry
```

Product description:

> A universal registry for everything your company runs automatically.

Alternative:

> See every cron job, scheduled workflow, and background automation in one place.

Do not spend meaningful MVP engineering time on branding.

---

# 45. MVP Success Criteria

The MVP is successful if a small team can:

1. create a UReg organization
2. declare automations through YAML
3. apply them with the CLI
4. see them in a dashboard
5. connect GitHub
6. discover scheduled workflows automatically
7. identify an unregistered workflow
8. instrument a custom job with the Python SDK
9. see recent executions
10. see UReg correctly identify a missed or stale automation
11. remove an automation while preserving history

If those eleven things work reliably, the MVP is complete.

---

# 46. What Not to Optimize Yet

Do not prematurely optimize:

- billions of events
- multi-region Postgres
- Kafka
- advanced caching
- graph traversal
- enterprise permission models
- real-time websocket updates
- dozens of integrations
- complex analytics
- automatic remediation
- zero-downtime database migration

Build clean interfaces so these can be added later.

---

# 47. Likely Future Additions

Only after MVP validation:

- TypeScript SDK
- Vercel Cron integration
- AWS EventBridge integration
- GCP Cloud Scheduler integration
- Zapier/Make/n8n visibility
- ownership reminders
- richer audit history
- status notifications
- Teams/Slack notifications
- execution retention policies
- API keys UI
- webhooks
- Cloudflare Queues
- self-hosted Postgres migration
- dependency metadata

These are not MVP commitments.

---

# 48. Implementation Rules for an Engineering Harness

When generating code for this project:

1. Preserve the narrow MVP scope in this document.
2. Do not introduce infrastructure not explicitly required.
3. Prefer boring, readable code over abstractions.
4. Use PostgreSQL-compatible schema and SQL.
5. Keep Neon-specific behavior isolated.
6. Keep Cloudflare-specific behavior at infrastructure boundaries.
7. All tenant-owned queries must include organization scope.
8. No API should accept or store arbitrary secrets.
9. No feature should execute arbitrary customer-provided shell commands.
10. Do not ingest raw application logs.
11. Treat CLI apply as declarative and idempotent.
12. Use soft deletion for automations.
13. Keep desired, observed, and execution state separate.
14. Reconciliation logic must be deterministic and thoroughly tested.
15. Add an integration only after its normalized representation is defined.
16. UI must remain usable by non-technical users.
17. Technical details should be progressive disclosure.
18. Every destructive CLI action must be visible before it is applied.
19. Favor standard Postgres features over proprietary database features.
20. Do not add AI functionality.

---

# 49. First Engineering Milestone

The first milestone should intentionally exclude GitHub and the SDK.

Deliver:

```text
React dashboard
+
Cloudflare Worker API
+
Neon PostgreSQL
+
organizations/auth
+
automation CRUD
+
automations.yaml
+
ureg diff
+
ureg apply
+
basic reconciler
```

At the end of this milestone, demonstrate:

```text
edit automations.yaml
        ↓
ureg diff
        ↓
ureg apply
        ↓
dashboard updates
        ↓
remove automation from YAML
        ↓
diff warns about deletion
        ↓
apply
        ↓
dashboard marks automation REMOVED
```

If this loop feels good, continue to integrations.

If it does not feel good, fix the core product before adding integrations.

---

# 50. Final Product Principle

The product should always remain understandable as:

```text
Declare
   ↓
Discover
   ↓
Observe
   ↓
Reconcile
   ↓
Visualize
```

UReg wins if it makes one previously difficult question easy:

> **What does our company run automatically, and is it actually running?**
