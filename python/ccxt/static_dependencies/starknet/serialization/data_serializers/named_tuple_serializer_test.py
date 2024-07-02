from collections import OrderedDict, namedtuple

import pytest

from .array_serializer import ArraySerializer
from .felt_serializer import FeltSerializer
from .named_tuple_serializer import (
    NamedTupleSerializer,
)
from ..tuple_dataclass import TupleDataclass

felt_array_serializer = ArraySerializer(FeltSerializer())


# Used to generate dict, TupleDataclass and namedtuple. All of them are accepted
# by the NamedTupleSerializer.
def to_different_formats(data: TupleDataclass):
    as_dict = data.as_dict()
    yield as_dict
    yield data
    named_tuple_type = namedtuple("SomeTuple", as_dict)
    yield named_tuple_type(**as_dict)


def test_reversed_order():
    serializer = NamedTupleSerializer(
        OrderedDict(x=FeltSerializer(), y=FeltSerializer(), z=FeltSerializer())
    )
    assert serializer.serialize({"z": 3, "y": 2, "x": 1}) == [1, 2, 3]


@pytest.mark.parametrize(
    "serializer, value, serialized_value",
    [
        (
            NamedTupleSerializer(OrderedDict(x=FeltSerializer(), y=FeltSerializer())),
            TupleDataclass.from_dict({"x": 1, "y": 2}),
            [1, 2],
        ),
        (
            NamedTupleSerializer(
                OrderedDict(
                    inner=NamedTupleSerializer(
                        OrderedDict(x=FeltSerializer(), y=felt_array_serializer)
                    )
                )
            ),
            TupleDataclass.from_dict(
                {"inner": TupleDataclass.from_dict({"x": 22, "y": [38]})}
            ),
            [22, 1, 38],
        ),
    ],
)
def test_valid_values(serializer, value, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value

    for data in to_different_formats(value):
        serialized = serializer.serialize(data)
        assert serialized == serialized_value
