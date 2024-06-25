import pytest

from constants import FIELD_PRIME
from serialization.data_serializers.array_serializer import ArraySerializer
from serialization.data_serializers.felt_serializer import FeltSerializer

felt_array_serializer = ArraySerializer(FeltSerializer())


@pytest.mark.parametrize(
    "serializer, value, serialized_value",
    [
        (felt_array_serializer, [], [0]),
        (felt_array_serializer, [1, 2, FIELD_PRIME - 1], [3, 1, 2, FIELD_PRIME - 1]),
        # 4 nested arrays and last filled with felts
        (
            ArraySerializer(ArraySerializer(ArraySerializer(felt_array_serializer))),
            [[[[22, 38]]]],
            [1, 1, 1, 2, 22, 38],
        ),
    ],
)
def test_valid_values(serializer, value, serialized_value):
    serialized = serializer.serialize(value)
    deserialized = serializer.deserialize(serialized_value)

    assert deserialized == value
    assert serialized == serialized_value
