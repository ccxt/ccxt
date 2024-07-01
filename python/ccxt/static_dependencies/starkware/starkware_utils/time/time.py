from contextlib import contextmanager
from contextvars import ContextVar
from time import time as def_time_func
from typing import Callable

"""
Provides an overridable time() function.
Tests can mock this time function mock_time_func.

Example:
  with mock_time_func(lambda: 1000):
      assert time() == 1000
"""


mocked_time_func: ContextVar[Callable[[], float]] = ContextVar(
    "mocked_time_func", default=def_time_func
)


def time():
    time_func = mocked_time_func.get()
    return time_func()


def elapsed_time(timestamp: float) -> float:
    return time() - timestamp


@contextmanager
def mock_time_func(time_func: Callable[[], float]):
    last_val = mocked_time_func.get()
    try:
        mocked_time_func.set(time_func)
        yield
    finally:
        mocked_time_func.set(last_val)
