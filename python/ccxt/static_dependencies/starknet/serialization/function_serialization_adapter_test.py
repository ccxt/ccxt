from collections import OrderedDict

import pytest

from serialization.data_serializers.felt_serializer import FeltSerializer
from serialization.data_serializers.payload_serializer import (
    PayloadSerializer,
)
from serialization.errors import InvalidTypeException, InvalidValueException
from serialization.function_serialization_adapter import (
    FunctionSerializationAdapter,
)
from serialization.tuple_dataclass import TupleDataclass

serializer = FunctionSerializationAdapter(
    inputs_serializer=PayloadSerializer(
        OrderedDict(
            x=FeltSerializer(),
            y=FeltSerializer(),
            z=FeltSerializer(),
        )
    ),
    outputs_deserializer=PayloadSerializer(
        OrderedDict(
            a=FeltSerializer(),
            b=FeltSerializer(),
            c=FeltSerializer(),
        )
    ),
)


def test_serialize():
    serialized = [1, 2, 3]
    # pylint: disable=invalid-name
    x, y, z = serialized

    assert serializer.serialize(x, y, z) == serialized
    assert serializer.serialize(x=x, y=y, z=z) == serialized
    assert serializer.serialize(x, y=y, z=z) == serialized

    with pytest.raises(
        InvalidTypeException, match="Provided 4 positional arguments, 3 possible."
    ):
        serializer.serialize(1, 2, 3, 4)

    with pytest.raises(
        InvalidTypeException,
        match="Both positional and named argument provided for 'x'.",
    ):
        serializer.serialize(1, 2, x=1, y=3)

    with pytest.raises(
        InvalidTypeException,
        match="Unnecessary named arguments provided: 'unknown_key'.",
    ):
        serializer.serialize(1, 2, unknown_key=3)

    with pytest.raises(InvalidTypeException, match="Missing arguments: 'z'."):
        serializer.serialize(1, 2)


def test_deserialize():
    assert serializer.deserialize([1, 2, 3]) == TupleDataclass.from_dict(
        {"a": 1, "b": 2, "c": 3}
    )

    with pytest.raises(
        InvalidValueException,
        match="Last 2 values '0x4,0x5' out of total 5 values were not used during deserialization.",
    ):
        serializer.deserialize([1, 2, 3, 4, 5])

    with pytest.raises(
        InvalidValueException,
        match="Last 4 values '0x4,0x5,0x6...' out of total 7 values were not used during deserialization.",
    ):
        serializer.deserialize([1, 2, 3, 4, 5, 6, 7])

    with pytest.raises(
        InvalidValueException,
        match="Not enough data to deserialize 'c'. Can't read 1 values at position 2, 0 available.",
    ):
        serializer.deserialize([1, 2])
