from typing import (
    Literal,
    NewType,
    TypeVar,
    Union,
)

from .encoding import (
    HexStr,
)

Hash32 = NewType("Hash32", bytes)
BlockNumber = NewType("BlockNumber", int)
BlockParams = Literal["latest", "earliest", "pending", "safe", "finalized"]
BlockIdentifier = Union[BlockParams, BlockNumber, Hash32, HexStr, int]

Address = NewType("Address", bytes)
HexAddress = NewType("HexAddress", HexStr)
ChecksumAddress = NewType("ChecksumAddress", HexAddress)
AnyAddress = TypeVar("AnyAddress", Address, HexAddress, ChecksumAddress)
