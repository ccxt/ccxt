from v4_proto.dydxprotocol.indexer.shared import removal_reason_pb2 as _removal_reason_pb2
from v4_proto.dydxprotocol.indexer.protocol.v1 import clob_pb2 as _clob_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OffChainUpdateV1(_message.Message):
    __slots__ = ["order_place", "order_remove", "order_replace", "order_update"]
    ORDER_PLACE_FIELD_NUMBER: _ClassVar[int]
    ORDER_REMOVE_FIELD_NUMBER: _ClassVar[int]
    ORDER_REPLACE_FIELD_NUMBER: _ClassVar[int]
    ORDER_UPDATE_FIELD_NUMBER: _ClassVar[int]
    order_place: OrderPlaceV1
    order_remove: OrderRemoveV1
    order_replace: OrderReplaceV1
    order_update: OrderUpdateV1
    def __init__(self, order_place: _Optional[_Union[OrderPlaceV1, _Mapping]] = ..., order_remove: _Optional[_Union[OrderRemoveV1, _Mapping]] = ..., order_update: _Optional[_Union[OrderUpdateV1, _Mapping]] = ..., order_replace: _Optional[_Union[OrderReplaceV1, _Mapping]] = ...) -> None: ...

class OrderPlaceV1(_message.Message):
    __slots__ = ["order", "placement_status", "time_stamp"]
    class OrderPlacementStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    ORDER_FIELD_NUMBER: _ClassVar[int]
    ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED: OrderPlaceV1.OrderPlacementStatus
    ORDER_PLACEMENT_STATUS_OPENED: OrderPlaceV1.OrderPlacementStatus
    ORDER_PLACEMENT_STATUS_UNSPECIFIED: OrderPlaceV1.OrderPlacementStatus
    PLACEMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    TIME_STAMP_FIELD_NUMBER: _ClassVar[int]
    order: _clob_pb2.IndexerOrder
    placement_status: OrderPlaceV1.OrderPlacementStatus
    time_stamp: _timestamp_pb2.Timestamp
    def __init__(self, order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ..., placement_status: _Optional[_Union[OrderPlaceV1.OrderPlacementStatus, str]] = ..., time_stamp: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class OrderRemoveV1(_message.Message):
    __slots__ = ["reason", "removal_status", "removed_order_id", "time_stamp"]
    class OrderRemovalStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED: OrderRemoveV1.OrderRemovalStatus
    ORDER_REMOVAL_STATUS_CANCELED: OrderRemoveV1.OrderRemovalStatus
    ORDER_REMOVAL_STATUS_FILLED: OrderRemoveV1.OrderRemovalStatus
    ORDER_REMOVAL_STATUS_UNSPECIFIED: OrderRemoveV1.OrderRemovalStatus
    REASON_FIELD_NUMBER: _ClassVar[int]
    REMOVAL_STATUS_FIELD_NUMBER: _ClassVar[int]
    REMOVED_ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    TIME_STAMP_FIELD_NUMBER: _ClassVar[int]
    reason: _removal_reason_pb2.OrderRemovalReason
    removal_status: OrderRemoveV1.OrderRemovalStatus
    removed_order_id: _clob_pb2.IndexerOrderId
    time_stamp: _timestamp_pb2.Timestamp
    def __init__(self, removed_order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ..., reason: _Optional[_Union[_removal_reason_pb2.OrderRemovalReason, str]] = ..., removal_status: _Optional[_Union[OrderRemoveV1.OrderRemovalStatus, str]] = ..., time_stamp: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class OrderReplaceV1(_message.Message):
    __slots__ = ["old_order_id", "order", "placement_status", "time_stamp"]
    OLD_ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    PLACEMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    TIME_STAMP_FIELD_NUMBER: _ClassVar[int]
    old_order_id: _clob_pb2.IndexerOrderId
    order: _clob_pb2.IndexerOrder
    placement_status: OrderPlaceV1.OrderPlacementStatus
    time_stamp: _timestamp_pb2.Timestamp
    def __init__(self, old_order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ..., order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ..., placement_status: _Optional[_Union[OrderPlaceV1.OrderPlacementStatus, str]] = ..., time_stamp: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class OrderUpdateV1(_message.Message):
    __slots__ = ["order_id", "total_filled_quantums"]
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FILLED_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    order_id: _clob_pb2.IndexerOrderId
    total_filled_quantums: int
    def __init__(self, order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ..., total_filled_quantums: _Optional[int] = ...) -> None: ...
