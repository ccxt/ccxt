from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BlockRateLimitConfiguration(_message.Message):
    __slots__ = ["max_short_term_order_cancellations_per_n_blocks", "max_short_term_orders_and_cancels_per_n_blocks", "max_short_term_orders_per_n_blocks", "max_stateful_orders_per_n_blocks"]
    MAX_SHORT_TERM_ORDERS_AND_CANCELS_PER_N_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    MAX_SHORT_TERM_ORDERS_PER_N_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    MAX_SHORT_TERM_ORDER_CANCELLATIONS_PER_N_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    MAX_STATEFUL_ORDERS_PER_N_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    max_short_term_order_cancellations_per_n_blocks: _containers.RepeatedCompositeFieldContainer[MaxPerNBlocksRateLimit]
    max_short_term_orders_and_cancels_per_n_blocks: _containers.RepeatedCompositeFieldContainer[MaxPerNBlocksRateLimit]
    max_short_term_orders_per_n_blocks: _containers.RepeatedCompositeFieldContainer[MaxPerNBlocksRateLimit]
    max_stateful_orders_per_n_blocks: _containers.RepeatedCompositeFieldContainer[MaxPerNBlocksRateLimit]
    def __init__(self, max_short_term_orders_per_n_blocks: _Optional[_Iterable[_Union[MaxPerNBlocksRateLimit, _Mapping]]] = ..., max_stateful_orders_per_n_blocks: _Optional[_Iterable[_Union[MaxPerNBlocksRateLimit, _Mapping]]] = ..., max_short_term_order_cancellations_per_n_blocks: _Optional[_Iterable[_Union[MaxPerNBlocksRateLimit, _Mapping]]] = ..., max_short_term_orders_and_cancels_per_n_blocks: _Optional[_Iterable[_Union[MaxPerNBlocksRateLimit, _Mapping]]] = ...) -> None: ...

class MaxPerNBlocksRateLimit(_message.Message):
    __slots__ = ["limit", "num_blocks"]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    NUM_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    limit: int
    num_blocks: int
    def __init__(self, num_blocks: _Optional[int] = ..., limit: _Optional[int] = ...) -> None: ...
