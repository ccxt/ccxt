import pytest

from ..models.address import parse_address


@pytest.mark.parametrize(
    "input_addr, output",
    [(123, 123), ("859", 2137), ("0x859", 2137)],
)
def test_parse_address(input_addr, output):
    assert parse_address(input_addr) == output


def test_parse_invalid_address():
    with pytest.raises(TypeError, match="address format"):
        # Ignore typing, because it is an error check (float can't be passed here)
        # noinspection PyTypeChecker
        parse_address(0.22)  # pyright: ignore
