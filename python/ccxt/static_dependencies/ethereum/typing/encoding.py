from typing import (
    NewType,
    Union,
)

HexStr = NewType("HexStr", str)
Primitives = Union[bytes, int, bool]
