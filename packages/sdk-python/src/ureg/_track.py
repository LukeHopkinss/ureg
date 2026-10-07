from __future__ import annotations

import functools
import time
import uuid
from contextlib import contextmanager
from typing import Callable, Iterator, TypeVar

F = TypeVar("F", bound=Callable[..., object])


@contextmanager
def track(automation_id: str) -> Iterator[str]:
    """Record one execution of ``automation_id``.

    Yields the idempotent execution ID. Scaffold: timing is captured but not yet
    reported; the start/finish API calls arrive in Phase 6.
    """
    execution_id = str(uuid.uuid4())
    started = time.monotonic()
    try:
        yield execution_id
    except BaseException:
        _finish(automation_id, execution_id, "failed", started)
        raise
    else:
        _finish(automation_id, execution_id, "success", started)


def automation(automation_id: str) -> Callable[[F], F]:
    """Decorator form of :func:`track`."""

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        def wrapper(*args: object, **kwargs: object) -> object:
            with track(automation_id):
                return fn(*args, **kwargs)

        return wrapper  # type: ignore[return-value]

    return decorator


def heartbeat(automation_id: str) -> None:
    """Signal that a long-running worker is alive. Not needed for scheduled jobs."""


def _finish(automation_id: str, execution_id: str, status: str, started: float) -> None:
    _duration_ms = int((time.monotonic() - started) * 1000)
