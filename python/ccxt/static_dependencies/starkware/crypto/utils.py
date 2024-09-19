from typing import (
    AsyncGenerator,
    Optional,
    TypeVar,
)

import sys

if sys.version_info.minor >= 11:
    from typing import Literal, ParamSpec
else:
    from typing_extensions import Literal, ParamSpec

T = TypeVar("T")
P = ParamSpec("P")
K = TypeVar("K")
V = TypeVar("V")
TAsyncGenerator = TypeVar("TAsyncGenerator", bound=AsyncGenerator)
NumType = TypeVar("NumType", int, float)
HASH_BYTES = 32

# If more shared types start popping up here extract to types.py.
Endianness = Literal["big", "little"]
TComparable = TypeVar("TComparable", bound="Comparable")

def to_bytes(
    value: int,
    length: Optional[int] = None,
    byte_order: Optional[Endianness] = None,
    signed: Optional[bool] = None,
) -> bytes:
    """
    Converts the given integer to a bytes object of given length and byte order.
    The default values are 32B width (which is the hash result width) and 'big', respectively.
    """
    if length is None:
        length = HASH_BYTES

    if byte_order is None:
        byte_order = "big"

    if signed is None:
        signed = False

    return int.to_bytes(value, length=length, byteorder=byte_order, signed=signed)


def from_bytes(
    value: bytes,
    byte_order: Optional[Endianness] = None,
    signed: Optional[bool] = None,
) -> int:
    """
    Converts the given bytes object (parsed according to the given byte order) to an integer.
    Default byte order is 'big'.
    """
    if byte_order is None:
        byte_order = "big"

    if signed is None:
        signed = False

    return int.from_bytes(value, byteorder=byte_order, signed=signed)