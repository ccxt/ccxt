from typing import cast

import pytest

from constants import FIELD_PRIME
from .felt_serializer import FeltSerializer
from .errors import InvalidTypeException, InvalidValueException


@pytest.mark.parametrize(
    "value",
    [0, 1, 322132123, FIELD_PRIME - 1],
)
def test_valid_felt_values(value):
    serialized = FeltSerializer().serialize(value)
    deserialized = FeltSerializer().deserialize([value])

    assert deserialized == value
    assert serialized == [value]


def test_valid_shortstring():
    with pytest.warns(DeprecationWarning, match="Serializing shortstrings"):
        serialized = FeltSerializer().serialize(
            # We use cast because we don't want to show that strings are accepted in types
            cast(int, "string shorter than 32 chars")
        )
        assert serialized == [
            0x737472696E672073686F72746572207468616E203332206368617273
        ]


def test_invalid_shortstrings():
    with pytest.raises(InvalidValueException, match="Expected an ascii string"):
        FeltSerializer().serialize(cast(int, "õ"))

    with pytest.raises(
        InvalidValueException, match="cannot be longer than 31 characters"
    ):
        FeltSerializer().serialize(cast(int, "a" * 32))


def test_invalid_type():
    error_message = "Error: expected int, received '{}' of type '<class 'dict'>."
    with pytest.raises(InvalidTypeException, match=error_message):
        FeltSerializer().serialize(cast(int, {}))


@pytest.mark.parametrize(
    "value",
    [-1, -100, FIELD_PRIME, FIELD_PRIME + 10000],
)
def test_values_out_of_range(value):
    error_message = f"Error: invalid value '{value}' - must be in .* range."
    with pytest.raises(InvalidValueException, match=error_message):
        FeltSerializer().serialize(value)
    with pytest.raises(InvalidValueException, match=error_message):
        FeltSerializer().deserialize([value])


def test_not_all_values_used():
    error_message = "Last 1 values '0x2' out of total 2 values were not used during deserialization."
    with pytest.raises(InvalidValueException, match=error_message):
        FeltSerializer().deserialize([1, 2])
