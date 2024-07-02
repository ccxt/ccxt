from collections import OrderedDict

from .array_serializer import ArraySerializer
from .felt_serializer import FeltSerializer
from .payload_serializer import (
    PayloadSerializer,
)


def test_remove_array_lengths():
    serializer = PayloadSerializer(
        OrderedDict(
            x=FeltSerializer(),
            y=FeltSerializer(),
            values_len=FeltSerializer(),
            values=ArraySerializer(FeltSerializer()),
        )
    )
    # len parameters have to be removed
    assert set(serializer.serializers.keys()) == {"x", "y", "values"}

    data = {"x": 1, "y": 2, "values": [0, 0, 0]}
    serialized = [1, 2, 3, 0, 0, 0]
    assert serializer.serialize(data) == serialized
    assert serializer.deserialize(serialized) == tuple(data.values())
