from concurrent.futures import Executor
from contextlib import contextmanager
from contextvars import ContextVar
from typing import Optional

executor_ctx_var: ContextVar[Optional[Executor]] = ContextVar("executor", default=None)


@contextmanager
def service_executor(executor: Executor):
    """
    Context manager that sets executor_ctx_var context variable.
    """
    try:
        prev = executor_ctx_var.get()
        executor_ctx_var.set(executor)
        yield
    finally:
        executor_ctx_var.set(prev)
