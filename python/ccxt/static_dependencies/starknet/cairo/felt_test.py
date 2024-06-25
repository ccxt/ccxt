import pytest

from cairo.felt import (
    cairo_vm_range_check,
    decode_shortstring,
    encode_shortstring,
)
from constants import FIELD_PRIME


@pytest.mark.parametrize("value", [-1, FIELD_PRIME, FIELD_PRIME + 1, -FIELD_PRIME])
def test_invalid_cairo_vm_values(value):
    with pytest.raises(ValueError, match="is expected to be in range \\[0;"):
        cairo_vm_range_check(value)


@pytest.mark.parametrize("value", [0, 1, FIELD_PRIME - 1])
def cairo_vm_range_check_good_numbers(value):
    cairo_vm_range_check(value)


def test_encode_decode_shortstring():
    shortstring = "hello"
    assert decode_shortstring(encode_shortstring(shortstring)) == shortstring
