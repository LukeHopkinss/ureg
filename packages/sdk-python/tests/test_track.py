import pytest

from ureg import automation, track


def test_track_yields_execution_id():
    with track("stripe-sync") as execution_id:
        assert execution_id


def test_track_reraises_failures():
    with pytest.raises(ValueError):
        with track("stripe-sync"):
            raise ValueError("boom")


def test_decorator_returns_value():
    @automation("stripe-sync")
    def job():
        return 42

    assert job() == 42
