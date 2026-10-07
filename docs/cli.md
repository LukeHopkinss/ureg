# CLI

```bash
ureg login | logout
ureg init
ureg validate -f automations.yaml
ureg diff -f automations.yaml
ureg apply -f automations.yaml [--yes]
ureg list | get <id> | status
ureg remove <id>
```

Implemented so far: `init`, `validate` (and local validation in `diff`/`apply`).

Rules (plan §12–13): config validates locally before anything is sent; invalid cron and duplicate
IDs fail; destructive changes are shown before apply; apply is idempotent; config never executes
commands.
