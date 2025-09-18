from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import duration_pb2 as _duration_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class DowntimeParams(_message.Message):
    __slots__ = ["durations"]
    DURATIONS_FIELD_NUMBER: _ClassVar[int]
    durations: _containers.RepeatedCompositeFieldContainer[_duration_pb2.Duration]
    def __init__(self, durations: _Optional[_Iterable[_Union[_duration_pb2.Duration, _Mapping]]] = ...) -> None: ...

class SynchronyParams(_message.Message):
    __slots__ = ["next_block_delay"]
    NEXT_BLOCK_DELAY_FIELD_NUMBER: _ClassVar[int]
    next_block_delay: _duration_pb2.Duration
    def __init__(self, next_block_delay: _Optional[_Union[_duration_pb2.Duration, _Mapping]] = ...) -> None: ...
