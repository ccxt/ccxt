from typing import List

from ..constants import FIELD_PRIME

CairoData = List[int]


MAX_UINT256 = (1 << 256) - 1
MIN_UINT256 = 0


def uint256_range_check(value: int):
    if not MIN_UINT256 <= value <= MAX_UINT256:
        raise ValueError(
            f"Uint256 is expected to be in range [0;2**256), got: {value}."
        )


MIN_FELT = -FIELD_PRIME // 2
MAX_FELT = FIELD_PRIME // 2


def is_in_felt_range(value: int) -> bool:
    return 0 <= value < FIELD_PRIME


def cairo_vm_range_check(value: int):
    if not is_in_felt_range(value):
        raise ValueError(
            f"Felt is expected to be in range [0; {FIELD_PRIME}), got: {value}."
        )


def encode_shortstring(text: str) -> int:
    """
    A function which encodes short string value (at most 31 characters) into cairo felt (MSB as first character)

    :param text: A short string value in python
    :return: Short string value encoded into felt
    """
    if len(text) > 31:
        raise ValueError(
            f"Shortstring cannot be longer than 31 characters, got: {len(text)}."
        )

    try:
        text_bytes = text.encode("ascii")
    except UnicodeEncodeError as u_err:
        raise ValueError(f"Expected an ascii string. Found: {repr(text)}.") from u_err
    value = int.from_bytes(text_bytes, "big")

    cairo_vm_range_check(value)
    return value


def decode_shortstring(value: int) -> str:
    """
    A function which decodes a felt value to short string (at most 31 characters)

    :param value: A felt value
    :return: Decoded string which is corresponds to that felt
    """
    cairo_vm_range_check(value)
    return "".join([chr(i) for i in value.to_bytes(31, byteorder="big")]).lstrip("\x00")
