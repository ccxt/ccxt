from typing import cast

import pytest

from .data_serializers import BoolSerializer
from .errors import InvalidTypeException


@pytest.mark.parametrize(
    "value",
    [True, False],
)
def test_valid_bool_values(value):
    serialized = BoolSerializer().serialize(value)
    deserialized = BoolSerializer().deserialize([value])

    assert deserialized == value
    assert serialized == [value]


def test_invalid_type():
    error_message = "Error: expected bool, received '{}' of type '<class 'dict'>."
    with pytest.raises(InvalidTypeException, match=error_message):
        BoolSerializer().serialize(cast(bool, {}))
