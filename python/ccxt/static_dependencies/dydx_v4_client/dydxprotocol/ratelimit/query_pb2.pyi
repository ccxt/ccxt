from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.ratelimit import limit_params_pb2 as _limit_params_pb2
from v4_proto.dydxprotocol.ratelimit import capacity_pb2 as _capacity_pb2
from v4_proto.dydxprotocol.ratelimit import pending_send_packet_pb2 as _pending_send_packet_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ListLimitParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class ListLimitParamsResponse(_message.Message):
    __slots__ = ["limit_params_list"]
    LIMIT_PARAMS_LIST_FIELD_NUMBER: _ClassVar[int]
    limit_params_list: _containers.RepeatedCompositeFieldContainer[_limit_params_pb2.LimitParams]
    def __init__(self, limit_params_list: _Optional[_Iterable[_Union[_limit_params_pb2.LimitParams, _Mapping]]] = ...) -> None: ...

class QueryAllPendingSendPacketsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryAllPendingSendPacketsResponse(_message.Message):
    __slots__ = ["pending_send_packets"]
    PENDING_SEND_PACKETS_FIELD_NUMBER: _ClassVar[int]
    pending_send_packets: _containers.RepeatedCompositeFieldContainer[_pending_send_packet_pb2.PendingSendPacket]
    def __init__(self, pending_send_packets: _Optional[_Iterable[_Union[_pending_send_packet_pb2.PendingSendPacket, _Mapping]]] = ...) -> None: ...

class QueryCapacityByDenomRequest(_message.Message):
    __slots__ = ["denom"]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    denom: str
    def __init__(self, denom: _Optional[str] = ...) -> None: ...

class QueryCapacityByDenomResponse(_message.Message):
    __slots__ = ["limiter_capacity_list"]
    LIMITER_CAPACITY_LIST_FIELD_NUMBER: _ClassVar[int]
    limiter_capacity_list: _containers.RepeatedCompositeFieldContainer[_capacity_pb2.LimiterCapacity]
    def __init__(self, limiter_capacity_list: _Optional[_Iterable[_Union[_capacity_pb2.LimiterCapacity, _Mapping]]] = ...) -> None: ...
