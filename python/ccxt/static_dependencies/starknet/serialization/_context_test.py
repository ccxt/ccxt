import pytest

from ._context import SerializationContext
from .errors import InvalidTypeException, InvalidValueException


@pytest.mark.parametrize(
    "initial_exception, wrapped_class",
    [
        (ValueError("Test"), InvalidValueException),
        (TypeError("Test"), InvalidTypeException),
    ],
)
def test_if_exceptions_are_wrapped(initial_exception, wrapped_class):
    with pytest.raises(wrapped_class, match="Error: Test"):
        with SerializationContext.create():
            raise initial_exception
