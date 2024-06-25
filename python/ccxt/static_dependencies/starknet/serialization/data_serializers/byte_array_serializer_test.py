import pytest

from serialization.data_serializers.byte_array_serializer import (
    ByteArraySerializer,
)

byte_array_serializer = ByteArraySerializer()


@pytest.mark.parametrize(
    "value, serialized_value",
    [
        ("", [0, 0, 0]),
        ("hello", [0, 0x68656C6C6F, 5]),
        (
            "Long string, more than 31 characters.",
            [
                1,
                0x4C6F6E6720737472696E672C206D6F7265207468616E203331206368617261,
                0x63746572732E,
                6,
            ],
        ),
    ],
)
def test_values(value, serialized_value):
    serialized = byte_array_serializer.serialize(value)
    deserialized = byte_array_serializer.deserialize(serialized_value)

    assert deserialized == value
    assert serialized == serialized_value
