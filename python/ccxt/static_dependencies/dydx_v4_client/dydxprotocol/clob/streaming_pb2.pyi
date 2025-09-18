from v4_proto.dydxprotocol.subaccounts import streaming_pb2 as _streaming_pb2
from v4_proto.dydxprotocol.prices import streaming_pb2 as _streaming_pb2_1
from v4_proto.dydxprotocol.clob import query_pb2 as _query_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class StagedFinalizeBlockEvent(_message.Message):
    __slots__ = ["order_fill", "orderbook_update", "price_update", "subaccount_update"]
    ORDERBOOK_UPDATE_FIELD_NUMBER: _ClassVar[int]
    ORDER_FILL_FIELD_NUMBER: _ClassVar[int]
    PRICE_UPDATE_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_UPDATE_FIELD_NUMBER: _ClassVar[int]
    order_fill: _query_pb2.StreamOrderbookFill
    orderbook_update: _query_pb2.StreamOrderbookUpdate
    price_update: _streaming_pb2_1.StreamPriceUpdate
    subaccount_update: _streaming_pb2.StreamSubaccountUpdate
    def __init__(self, order_fill: _Optional[_Union[_query_pb2.StreamOrderbookFill, _Mapping]] = ..., subaccount_update: _Optional[_Union[_streaming_pb2.StreamSubaccountUpdate, _Mapping]] = ..., orderbook_update: _Optional[_Union[_query_pb2.StreamOrderbookUpdate, _Mapping]] = ..., price_update: _Optional[_Union[_streaming_pb2_1.StreamPriceUpdate, _Mapping]] = ...) -> None: ...
