import re

import pytest

from .uint256_serializer import (
    Uint256Serializer,
)
from .errors import InvalidTypeException, InvalidValueException

serializer = Uint256Serializer()
SHIFT = 2**128
MAX_U128 = SHIFT - 1


@pytest.mark.parametrize(
    "value, serialized_value",
    [
        (123 + 456 * SHIFT, [123, 456]),
        (
            21323213211421424142 + 347932774343 * SHIFT,
            [21323213211421424142, 347932774343],
        ),
        (0, [0, 0]),
        (MAX_U128, [MAX_U128, 0]),
        (MAX_U128 * SHIFT, [0, MAX_U128]),
        (MAX_U128 + MAX_U128 * SHIFT, [MAX_U128, MAX_U128]),
    ],
)
def test_valid_values(value, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value

    serialized = serializer.serialize(value)
    assert serialized == serialized_value

    assert serialized_value == serializer.serialize(
        {"low": serialized_value[0], "high": serialized_value[1]}
    )


def test_deserialize_invalid_values():
    # We need to escape braces
    low_error_message = re.escape(
        "Error at path 'low': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=low_error_message):
        serializer.deserialize([MAX_U128 + 1, 0])
    with pytest.raises(InvalidValueException, match=low_error_message):
        serializer.deserialize([MAX_U128 + 1, MAX_U128 + 1])
    with pytest.raises(InvalidValueException, match=low_error_message):
        serializer.deserialize([-1, 0])

    high_error_message = re.escape(
        "Error at path 'high': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=high_error_message):
        serializer.deserialize([0, MAX_U128 + 1])
    with pytest.raises(InvalidValueException, match=high_error_message):
        serializer.deserialize([0, -1])


def test_serialize_invalid_int_value():
    error_message = re.escape("Error: Uint256 is expected to be in range [0;2**256)")
    with pytest.raises(InvalidValueException, match=error_message):
        serializer.serialize(2**256)
    with pytest.raises(InvalidValueException, match=error_message):
        serializer.serialize(-1)


def test_serialize_invalid_dict_values():
    low_error_message = re.escape(
        "Error at path 'low': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=low_error_message):
        serializer.serialize({"low": -1, "high": 12324})
    with pytest.raises(InvalidValueException, match=low_error_message):
        serializer.serialize({"low": MAX_U128 + 1, "high": 4543535})

    high_error_message = re.escape(
        "Error at path 'high': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=high_error_message):
        serializer.serialize({"low": 652432, "high": -1})
    with pytest.raises(InvalidValueException, match=high_error_message):
        serializer.serialize({"low": 0, "high": MAX_U128 + 1})


def test_invalid_type():
    error_message = re.escape(
        "Error: expected int or dict, received 'wololoo' of type '<class 'str'>'."
    )
    with pytest.raises(InvalidTypeException, match=error_message):
        serializer.serialize("wololoo")  # type: ignore
