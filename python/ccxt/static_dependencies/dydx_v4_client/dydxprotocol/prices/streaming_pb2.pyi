from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.prices import market_price_pb2 as _market_price_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class StreamPriceUpdate(_message.Message):
    __slots__ = ["market_id", "price", "snapshot"]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    SNAPSHOT_FIELD_NUMBER: _ClassVar[int]
    market_id: int
    price: _market_price_pb2.MarketPrice
    snapshot: bool
    def __init__(self, market_id: _Optional[int] = ..., price: _Optional[_Union[_market_price_pb2.MarketPrice, _Mapping]] = ..., snapshot: bool = ...) -> None: ...
