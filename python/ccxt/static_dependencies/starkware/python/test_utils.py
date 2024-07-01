import dataclasses
import inspect
import re
from abc import abstractmethod
from contextlib import contextmanager, nullcontext
from typing import Callable, ContextManager, Optional, Type, TypeVar

import pytest
from pytest import MonkeyPatch


def maybe_raises(
    expected_exception, error_message: Optional[str], escape_error_message: bool = True
) -> ContextManager:
    """
    A utility function for parameterized tests with both positive and negative cases.
    If error_message is None, it expects no error,
    otherwise it expects an error of the given type with the given message.
    Unless 'escape_error_message' is set to False, the error message will be escaped.

    See:
    https://docs.pytest.org/en/stable/example/parametrize.html#parametrizing-conditional-raising.

    The typical use case is:
        with as_expectation(error_message) as ex:
            runner.run('tested_function', *args)

        if ex is not None:
            return

        # Extra validation logic.
    """
    if error_message is None:
        return nullcontext()

    error_message = re.escape(error_message) if escape_error_message else error_message
    return pytest.raises(expected_exception, match=error_message)


T = TypeVar("T")


class WithoutValidations:
    @abstractmethod
    def perform_validations(self):
        pass


def without_validations(base: Type[T]) -> Type[T]:
    """
    Receives a class and returns the same class but with __post_init__ disabled. This is useful in
    order to create an invalid object for negative tests.
    """

    class _WithoutValidations(base, WithoutValidations):  # type: ignore
        def __post_init__(self):
            pass

        def perform_validations(self):
            """
            Performs the validations that were skipped in the constructor.
            """
            if hasattr(base, "__post_init__"):
                super().__post_init__()

            for field_info in dataclasses.fields(self):
                field = getattr(self, field_info.name)
                if isinstance(field, WithoutValidations):
                    field.perform_validations()

    return _WithoutValidations


class FunctionComplete(Exception):
    pass


def raise_after_applying(func):
    """
    Returns a function that applies the given function and then raises an exception.
    """
    if inspect.iscoroutinefunction(func):

        async def async_apply_and_raise(*args, **kwargs):
            await func(*args, **kwargs)
            raise FunctionComplete()

        return async_apply_and_raise

    def apply_and_raise(*args, **kwargs):
        func(*args, **kwargs)
        raise FunctionComplete()

    return apply_and_raise


@contextmanager
def apply_and_stop(obj, last_func, monkeypatch: MonkeyPatch):
    """
    Stops the flow in the context after applying `last_func`, a member of `obj`.
    Useful for testing a function within a process, without considering the behavior after it.
    """
    monkeypatch.setattr(obj, last_func.__name__, raise_after_applying(func=last_func))
    try:
        yield
    except FunctionComplete:
        pass
    finally:
        monkeypatch.setattr(obj, last_func.__name__, last_func)


def as_coroutine(func: Callable):
    """
    Converts the given function to a coroutine.
    Useful for turning a lambda function to an async function.
    """

    async def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
