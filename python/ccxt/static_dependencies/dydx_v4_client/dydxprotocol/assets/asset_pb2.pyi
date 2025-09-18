from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Asset(_message.Message):
    __slots__ = ["atomic_resolution", "denom", "denom_exponent", "has_market", "id", "market_id", "symbol"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    DENOM_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    HAS_MARKET_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    SYMBOL_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    denom: str
    denom_exponent: int
    has_market: bool
    id: int
    market_id: int
    symbol: str
    def __init__(self, id: _Optional[int] = ..., symbol: _Optional[str] = ..., denom: _Optional[str] = ..., denom_exponent: _Optional[int] = ..., has_market: bool = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ...) -> None: ...
