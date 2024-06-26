import re
from collections import OrderedDict

import pytest

from .option_serializer import (
    OptionSerializer,
)
from .output_serializer import (
    OutputSerializer,
)
from .struct_serializer import (
    StructSerializer,
)
from .uint_serializer import UintSerializer
from .uint_serializer_test import SHIFT

serializer = OutputSerializer(
    serializers=[
        UintSerializer(256),
        OptionSerializer(
            StructSerializer(
                OrderedDict(
                    my_option=OptionSerializer(UintSerializer(128)),
                    my_uint=UintSerializer(256),
                )
            )
        ),
    ]
)


@pytest.mark.parametrize(
    "value, serialized_value",
    [
        (
            (1 + 1 * SHIFT, OrderedDict(my_option=123, my_uint=1 + 1 * SHIFT)),
            [1, 1, 0, 0, 123, 1, 1],
        ),
        ((0, OrderedDict(my_option=None, my_uint=1)), [0, 0, 0, 1, 1, 0]),
        ((1, None), [1, 0, 1]),
    ],
)
def test_output_serializer_deserialize(value, serialized_value):
    deserialized = serializer.deserialize(serialized_value)
    assert deserialized == value


def test_output_serializer_serialize():
    error_message = re.escape(
        "Output serializer can't be used to transform python data into calldata."
    )
    with pytest.raises(ValueError, match=error_message):
        serializer.serialize([1, None])
