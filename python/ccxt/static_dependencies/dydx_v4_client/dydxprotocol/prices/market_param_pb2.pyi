from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class MarketParam(_message.Message):
    __slots__ = ["exchange_config_json", "exponent", "id", "min_exchanges", "min_price_change_ppm", "pair"]
    EXCHANGE_CONFIG_JSON_FIELD_NUMBER: _ClassVar[int]
    EXPONENT_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MIN_EXCHANGES_FIELD_NUMBER: _ClassVar[int]
    MIN_PRICE_CHANGE_PPM_FIELD_NUMBER: _ClassVar[int]
    PAIR_FIELD_NUMBER: _ClassVar[int]
    exchange_config_json: str
    exponent: int
    id: int
    min_exchanges: int
    min_price_change_ppm: int
    pair: str
    def __init__(self, id: _Optional[int] = ..., pair: _Optional[str] = ..., exponent: _Optional[int] = ..., min_exchanges: _Optional[int] = ..., min_price_change_ppm: _Optional[int] = ..., exchange_config_json: _Optional[str] = ...) -> None: ...
