# String encodings and numeric representations

import binascii
import re
from typing import (
    Any,
    AnyStr,
)

from ..typing import (
    HexStr,
)

from .types import (
    is_string,
    is_text,
)

_HEX_REGEXP = re.compile("(0[xX])?[0-9a-fA-F]*")


def decode_hex(value: str) -> bytes:
    if not is_text(value):
        raise TypeError("Value must be an instance of str")
    non_prefixed = remove_0x_prefix(HexStr(value))
    # unhexlify will only accept bytes type someday
    ascii_hex = non_prefixed.encode("ascii")
    return binascii.unhexlify(ascii_hex)


def encode_hex(value: AnyStr) -> HexStr:
    if not is_string(value):
        raise TypeError("Value must be an instance of str or unicode")
    elif isinstance(value, (bytes, bytearray)):
        ascii_bytes = value
    else:
        ascii_bytes = value.encode("ascii")

    binary_hex = binascii.hexlify(ascii_bytes)
    return add_0x_prefix(HexStr(binary_hex.decode("ascii")))


def is_0x_prefixed(value: str) -> bool:
    if not is_text(value):
        raise TypeError(
            f"is_0x_prefixed requires text typed arguments. Got: {repr(value)}"
        )
    return value.startswith(("0x", "0X"))


def remove_0x_prefix(value: HexStr) -> HexStr:
    if is_0x_prefixed(value):
        return HexStr(value[2:])
    return value


def add_0x_prefix(value: HexStr) -> HexStr:
    if is_0x_prefixed(value):
        return value
    return HexStr("0x" + value)


def is_hexstr(value: Any) -> bool:
    if not is_text(value) or not value:
        return False
    return _HEX_REGEXP.fullmatch(value) is not None


def is_hex(value: Any) -> bool:
    if not is_text(value):
        raise TypeError(f"is_hex requires text typed arguments. Got: {repr(value)}")
    if not value:
        return False
    return _HEX_REGEXP.fullmatch(value) is not None
