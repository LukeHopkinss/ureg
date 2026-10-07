# ureg (Python SDK)

Optional runtime instrumentation for UReg. The registry provides value without it.

```python
from ureg import track

with track("stripe-sync"):
    sync_customers()
```

Status: scaffold. Network reporting arrives in Phase 6 (see `docs/plan.md` §15).
