# Security

UReg collects **metadata about automations**, never the data they process.

- No env vars, API keys, connection strings, logs, stdout/stderr, or payloads are stored.
- Integration credentials are encrypted at rest, never shown after creation, and revocable.
- Human and service credentials are separate; service tokens are narrowly scoped.
- Every tenant-owned query is scoped by `organization_id` in the repository layer.
- UReg never calls customer-provided URLs (no SSRF surface): automations call UReg, not the reverse.
- `automations.yaml` is structured data only; unknown fields are rejected and nothing is executed.
- Webhooks (later) must verify signatures and enforce replay protection.

Required security tests are listed in `plan.md` §40.
