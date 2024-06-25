import re

import pytest

from serialization.data_serializers.uint_serializer import UintSerializer
from serialization.errors import InvalidTypeException, InvalidValueException

u128_serializer = UintSerializer(bits=128)
u256_serializer = UintSerializer(bits=256)

SHIFT = 2**128
MAX_U128 = SHIFT - 1


@pytest.mark.parametrize(
    "value, serializer, serialized_value",
    [
        (123 + 456 * SHIFT, u256_serializer, [123, 456]),
        (
            21323213211421424142 + 347932774343 * SHIFT,
            u256_serializer,
            [21323213211421424142, 347932774343],
        ),
        (0, u256_serializer, [0, 0]),
        (MAX_U128, u256_serializer, [MAX_U128, 0]),
        (MAX_U128 * SHIFT, u256_serializer, [0, MAX_U128]),
        (MAX_U128 + MAX_U128 * SHIFT, u256_serializer, [MAX_U128, MAX_U128]),
        (123, u128_serializer, [123]),
        (0, u128_serializer, [0]),
        (MAX_U128, u128_serializer, [MAX_U128]),
    ],
)
def test_valid_values(value, serializer, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value

    serialized = serializer.serialize(value)
    assert serialized == serialized_value

    if serializer.bits == 256:
        assert serialized_value == serializer.serialize(
            {"low": serialized_value[0], "high": serialized_value[1]}
        )


@pytest.mark.parametrize(
    "value, uint256_part",
    [
        ([MAX_U128 + 1, 0], "low"),
        ([MAX_U128 + 1, MAX_U128 + 1], "low"),
        ([-1, 0], "low"),
        ([0, MAX_U128 + 1], "high"),
        ([0, -1], "high"),
    ],
)
def test_deserialize_invalid_256_values(value, uint256_part):
    # We need to escape braces
    error_message = re.escape(
        "Error at path '" + uint256_part + "': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=error_message):
        u256_serializer.deserialize(value)


def test_deserialize_invalid_128_values():
    # We need to escape braces
    error_message = re.escape(
        "Error at path 'uint128': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=error_message):
        u128_serializer.deserialize([MAX_U128 + 1])
    with pytest.raises(InvalidValueException, match=error_message):
        u128_serializer.deserialize([-1])


def test_serialize_invalid_256_int_value():
    error_message = re.escape("Error: Uint256 is expected to be in range [0;2**256)")
    with pytest.raises(InvalidValueException, match=error_message):
        u256_serializer.serialize(2**256)
    with pytest.raises(InvalidValueException, match=error_message):
        u256_serializer.serialize(-1)


def test_serialize_invalid_128_int_value():
    error_message = re.escape("Error: expected value in range [0;2**128)")
    with pytest.raises(InvalidValueException, match=error_message):
        u128_serializer.serialize(2**128)
    with pytest.raises(InvalidValueException, match=error_message):
        u128_serializer.serialize(-1)


def test_serialize_invalid_dict_values():
    low_error_message = re.escape(
        "Error at path 'low': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=low_error_message):
        u256_serializer.serialize({"low": -1, "high": 12324})
    with pytest.raises(InvalidValueException, match=low_error_message):
        u256_serializer.serialize({"low": MAX_U128 + 1, "high": 4543535})

    high_error_message = re.escape(
        "Error at path 'high': expected value in range [0;2**128)"
    )
    with pytest.raises(InvalidValueException, match=high_error_message):
        u256_serializer.serialize({"low": 652432, "high": -1})
    with pytest.raises(InvalidValueException, match=high_error_message):
        u256_serializer.serialize({"low": 0, "high": MAX_U128 + 1})


@pytest.mark.parametrize("serializer", (u128_serializer, u256_serializer))
def test_invalid_type(serializer):
    error_message = re.escape(
        "Error: expected int or dict, received 'wololoo' of type '<class 'str'>'."
    )
    with pytest.raises(InvalidTypeException, match=error_message):
        serializer.serialize("wololoo")  # type: ignore
