import binascii
from typing import (
    Union,
)


def to_bytes(val: Union[bool, bytearray, bytes, int, str, memoryview]) -> bytes:
    """
    Equivalent to: `eth_utils.hexstr_if_str(eth_utils.to_bytes, val)` .

    Convert a hex string, integer, or bool, to a bytes representation.
    Alternatively, pass through bytes or bytearray as a bytes value.
    """
    if isinstance(val, bytes):
        return val
    elif isinstance(val, str):
        return hexstr_to_bytes(val)
    elif isinstance(val, bytearray):
        return bytes(val)
    elif isinstance(val, bool):
        return b"\x01" if val else b"\x00"
    elif isinstance(val, int):
        # Note that this int check must come after the bool check, because
        #   isinstance(True, int) is True
        if val < 0:
            raise ValueError(f"Cannot convert negative integer {val} to bytes")
        else:
            return to_bytes(hex(val))
    elif isinstance(val, memoryview):
        return bytes(val)
    else:
        raise TypeError(f"Cannot convert {val!r} of type {type(val)} to bytes")


def hexstr_to_bytes(hexstr: str) -> bytes:
    if hexstr.startswith(("0x", "0X")):
        non_prefixed_hex = hexstr[2:]
    else:
        non_prefixed_hex = hexstr

    # if the hex string is odd-length, then left-pad it to an even length
    if len(hexstr) % 2:
        padded_hex = "0" + non_prefixed_hex
    else:
        padded_hex = non_prefixed_hex

    try:
        ascii_hex = padded_hex.encode("ascii")
    except UnicodeDecodeError:
        raise ValueError(
            f"hex string {padded_hex} may only contain [0-9a-fA-F] characters"
        )
    else:
        return binascii.unhexlify(ascii_hex)
