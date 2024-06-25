import pytest

from serialization.data_serializers.array_serializer import ArraySerializer
from serialization.data_serializers.felt_serializer import FeltSerializer
from serialization.data_serializers.tuple_serializer import TupleSerializer

felt_array_serializer = ArraySerializer(FeltSerializer())


@pytest.mark.parametrize(
    "serializer, value, serialized_value",
    [
        (TupleSerializer([FeltSerializer(), FeltSerializer()]), (1, 2), [1, 2]),
        (
            TupleSerializer([FeltSerializer(), felt_array_serializer]),
            (1, [22, 38]),
            [1, 2, 22, 38],
        ),
        (
            # 3 nested tuples
            TupleSerializer([TupleSerializer([TupleSerializer([FeltSerializer()])])]),
            (((1,),),),
            [1],
        ),
        (
            TupleSerializer([FeltSerializer(), TupleSerializer([FeltSerializer()])]),
            (1, (2,)),
            [1, 2],
        ),
    ],
)
def test_valid_values(serializer, value, serialized_value):
    serialized = serializer.serialize(value)
    deserialized = serializer.deserialize(serialized_value)

    assert deserialized == value
    assert serialized == serialized_value
