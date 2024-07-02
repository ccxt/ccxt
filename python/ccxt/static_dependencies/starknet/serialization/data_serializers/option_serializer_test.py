import pytest

from .option_serializer import (
    OptionSerializer,
)
from .uint_serializer import UintSerializer


@pytest.mark.parametrize(
    "serializer, value, serialized_value",
    [
        (OptionSerializer(UintSerializer(128)), 123, [0, 123]),
        (OptionSerializer(UintSerializer(256)), 1, [0, 1, 0]),
        (OptionSerializer(UintSerializer(128)), None, [1]),
        (OptionSerializer(UintSerializer(256)), None, [1]),
    ],
)
def test_option_serializer(serializer, value, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value

    serialized = serializer.serialize(value)
    assert serialized == serialized_value
