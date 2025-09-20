from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.clob import order_pb2 as _order_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ProcessProposerMatchesEvents(_message.Message):
    __slots__ = ["block_height", "conditional_order_ids_triggered_in_last_block", "expired_stateful_order_ids", "order_ids_filled_in_last_block", "placed_conditional_order_ids", "placed_long_term_order_ids", "placed_stateful_cancellation_order_ids", "removed_stateful_order_ids"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    CONDITIONAL_ORDER_IDS_TRIGGERED_IN_LAST_BLOCK_FIELD_NUMBER: _ClassVar[int]
    EXPIRED_STATEFUL_ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    ORDER_IDS_FILLED_IN_LAST_BLOCK_FIELD_NUMBER: _ClassVar[int]
    PLACED_CONDITIONAL_ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    PLACED_LONG_TERM_ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    PLACED_STATEFUL_CANCELLATION_ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    REMOVED_STATEFUL_ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    conditional_order_ids_triggered_in_last_block: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    expired_stateful_order_ids: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    order_ids_filled_in_last_block: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    placed_conditional_order_ids: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    placed_long_term_order_ids: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    placed_stateful_cancellation_order_ids: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    removed_stateful_order_ids: _containers.RepeatedCompositeFieldContainer[_order_pb2.OrderId]
    def __init__(self, placed_long_term_order_ids: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., expired_stateful_order_ids: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., order_ids_filled_in_last_block: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., placed_stateful_cancellation_order_ids: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., removed_stateful_order_ids: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., conditional_order_ids_triggered_in_last_block: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., placed_conditional_order_ids: _Optional[_Iterable[_Union[_order_pb2.OrderId, _Mapping]]] = ..., block_height: _Optional[int] = ...) -> None: ...
