from collections import OrderedDict

import pytest

from serialization.data_serializers.array_serializer import ArraySerializer
from serialization.data_serializers.felt_serializer import FeltSerializer
from serialization.data_serializers.struct_serializer import (
    StructSerializer,
)

felt_array_serializer = ArraySerializer(FeltSerializer())


@pytest.mark.parametrize(
    "serializer, value, serialized_value",
    [
        (
            StructSerializer(OrderedDict(x=FeltSerializer(), y=FeltSerializer())),
            # Reversed order, serializer should read them properly
            {"y": 2, "x": 1},
            [1, 2],
        ),
        (
            StructSerializer(
                OrderedDict(
                    inner=StructSerializer(
                        OrderedDict(x=FeltSerializer(), y=felt_array_serializer)
                    )
                )
            ),
            {"inner": {"x": 22, "y": [38]}},
            [22, 1, 38],
        ),
    ],
)
def test_valid_values(serializer, value, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value

    serialized = serializer.serialize(value)
    assert serialized == serialized_value
