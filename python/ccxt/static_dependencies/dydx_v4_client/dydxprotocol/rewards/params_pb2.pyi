from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Params(_message.Message):
    __slots__ = ["denom", "denom_exponent", "fee_multiplier_ppm", "market_id", "treasury_account"]
    DENOM_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    FEE_MULTIPLIER_PPM_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    TREASURY_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    denom: str
    denom_exponent: int
    fee_multiplier_ppm: int
    market_id: int
    treasury_account: str
    def __init__(self, treasury_account: _Optional[str] = ..., denom: _Optional[str] = ..., denom_exponent: _Optional[int] = ..., market_id: _Optional[int] = ..., fee_multiplier_ppm: _Optional[int] = ...) -> None: ...
