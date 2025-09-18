from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import duration_pb2 as _duration_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AllDowntimeInfo(_message.Message):
    __slots__ = ["infos"]
    class DowntimeInfo(_message.Message):
        __slots__ = ["block_info", "duration"]
        BLOCK_INFO_FIELD_NUMBER: _ClassVar[int]
        DURATION_FIELD_NUMBER: _ClassVar[int]
        block_info: BlockInfo
        duration: _duration_pb2.Duration
        def __init__(self, duration: _Optional[_Union[_duration_pb2.Duration, _Mapping]] = ..., block_info: _Optional[_Union[BlockInfo, _Mapping]] = ...) -> None: ...
    INFOS_FIELD_NUMBER: _ClassVar[int]
    infos: _containers.RepeatedCompositeFieldContainer[AllDowntimeInfo.DowntimeInfo]
    def __init__(self, infos: _Optional[_Iterable[_Union[AllDowntimeInfo.DowntimeInfo, _Mapping]]] = ...) -> None: ...

class BlockInfo(_message.Message):
    __slots__ = ["height", "timestamp"]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    height: int
    timestamp: _timestamp_pb2.Timestamp
    def __init__(self, height: _Optional[int] = ..., timestamp: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...
