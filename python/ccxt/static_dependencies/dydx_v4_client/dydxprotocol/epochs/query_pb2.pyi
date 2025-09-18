from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.epochs import epoch_info_pb2 as _epoch_info_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllEpochInfoRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryEpochInfoAllResponse(_message.Message):
    __slots__ = ["epoch_info", "pagination"]
    EPOCH_INFO_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    epoch_info: _containers.RepeatedCompositeFieldContainer[_epoch_info_pb2.EpochInfo]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, epoch_info: _Optional[_Iterable[_Union[_epoch_info_pb2.EpochInfo, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryEpochInfoResponse(_message.Message):
    __slots__ = ["epoch_info"]
    EPOCH_INFO_FIELD_NUMBER: _ClassVar[int]
    epoch_info: _epoch_info_pb2.EpochInfo
    def __init__(self, epoch_info: _Optional[_Union[_epoch_info_pb2.EpochInfo, _Mapping]] = ...) -> None: ...

class QueryGetEpochInfoRequest(_message.Message):
    __slots__ = ["name"]
    NAME_FIELD_NUMBER: _ClassVar[int]
    name: str
    def __init__(self, name: _Optional[str] = ...) -> None: ...
