# Python SDK

Optional. See `packages/sdk-python`.

```python
from ureg import track, automation, heartbeat

with track("stripe-sync"):
    sync_customers()

@automation("nightly-backup")
def backup(): ...

heartbeat("event-consumer")  # long-running workers only
```

SDK credentials are scoped service tokens (`execution:create`, `heartbeat:create`) and cannot read
the registry.
