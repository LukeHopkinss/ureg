"""UReg Python SDK.

Reports execution metadata only (start, finish, success/failure, duration).
Never sends logs, payloads, or environment variables.
"""

from ureg._track import automation, heartbeat, track

__all__ = ["automation", "heartbeat", "track"]
__version__ = "0.0.0"
