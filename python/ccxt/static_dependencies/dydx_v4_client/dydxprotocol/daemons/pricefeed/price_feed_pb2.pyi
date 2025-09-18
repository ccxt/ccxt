from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ExchangePrice(_message.Message):
    __slots__ = ["exchange_id", "last_update_time", "price"]
    EXCHANGE_ID_FIELD_NUMBER: _ClassVar[int]
    LAST_UPDATE_TIME_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    exchange_id: str
    last_update_time: _timestamp_pb2.Timestamp
    price: int
    def __init__(self, exchange_id: _Optional[str] = ..., price: _Optional[int] = ..., last_update_time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class MarketPriceUpdate(_message.Message):
    __slots__ = ["exchange_prices", "market_id"]
    EXCHANGE_PRICES_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    exchange_prices: _containers.RepeatedCompositeFieldContainer[ExchangePrice]
    market_id: int
    def __init__(self, market_id: _Optional[int] = ..., exchange_prices: _Optional[_Iterable[_Union[ExchangePrice, _Mapping]]] = ...) -> None: ...

class UpdateMarketPricesRequest(_message.Message):
    __slots__ = ["market_price_updates"]
    MARKET_PRICE_UPDATES_FIELD_NUMBER: _ClassVar[int]
    market_price_updates: _containers.RepeatedCompositeFieldContainer[MarketPriceUpdate]
    def __init__(self, market_price_updates: _Optional[_Iterable[_Union[MarketPriceUpdate, _Mapping]]] = ...) -> None: ...

class UpdateMarketPricesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
