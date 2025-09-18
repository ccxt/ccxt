from v4_proto.dydxprotocol.indexer.protocol.v1 import clob_pb2 as _clob_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class RedisOrder(_message.Message):
    __slots__ = ["id", "order", "price", "size", "ticker", "ticker_type"]
    class TickerType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    SIZE_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    TICKER_TYPE_FIELD_NUMBER: _ClassVar[int]
    TICKER_TYPE_PERPETUAL: RedisOrder.TickerType
    TICKER_TYPE_SPOT: RedisOrder.TickerType
    TICKER_TYPE_UNSPECIFIED: RedisOrder.TickerType
    id: str
    order: _clob_pb2.IndexerOrder
    price: str
    size: str
    ticker: str
    ticker_type: RedisOrder.TickerType
    def __init__(self, id: _Optional[str] = ..., order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ..., ticker: _Optional[str] = ..., ticker_type: _Optional[_Union[RedisOrder.TickerType, str]] = ..., price: _Optional[str] = ..., size: _Optional[str] = ...) -> None: ...
