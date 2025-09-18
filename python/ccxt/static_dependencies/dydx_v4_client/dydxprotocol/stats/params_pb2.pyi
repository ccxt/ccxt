from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import duration_pb2 as _duration_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Params(_message.Message):
    __slots__ = ["window_duration"]
    WINDOW_DURATION_FIELD_NUMBER: _ClassVar[int]
    window_duration: _duration_pb2.Duration
    def __init__(self, window_duration: _Optional[_Union[_duration_pb2.Duration, _Mapping]] = ...) -> None: ...
