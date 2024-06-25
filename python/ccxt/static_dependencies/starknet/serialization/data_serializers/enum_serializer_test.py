from collections import OrderedDict

import pytest

from serialization.data_serializers.enum_serializer import EnumSerializer
from serialization.data_serializers.option_serializer import (
    OptionSerializer,
)
from serialization.data_serializers.struct_serializer import (
    StructSerializer,
)
from serialization.data_serializers.uint_serializer import UintSerializer

serializer = EnumSerializer(
    serializers=OrderedDict(
        a=UintSerializer(256),
        b=UintSerializer(128),
        c=StructSerializer(
            OrderedDict(
                my_option=OptionSerializer(UintSerializer(128)),
                my_uint=UintSerializer(256),
            )
        ),
    )
)


@pytest.mark.parametrize(
    "value, correct_serialized_value",
    [
        ({"a": 100}, [0, 100, 0]),
        ({"b": 200}, [1, 200]),
        ({"c": {"my_option": 300, "my_uint": 300}}, [2, 0, 300, 300, 0]),
    ],
)
def test_output_serializer(value, correct_serialized_value):
    deserialized = serializer.deserialize(correct_serialized_value)

    deserialized_and_serialized = serializer.serialize(deserialized)
    serialized_value = serializer.serialize(value)

    assert deserialized_and_serialized == correct_serialized_value
    assert serialized_value == correct_serialized_value
    assert serialized_value == deserialized_and_serialized


def test_serializer_throws_on_wrong_parameters():
    with pytest.raises(ValueError, match="Can serialize only one enum variant, got: 2"):
        serializer.serialize({"a": 100, "b": 200})

    with pytest.raises(ValueError, match="Can serialize only one enum variant, got: 0"):
        serializer.serialize({})
