from google.protobuf import any_pb2 as _any_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class DelayedMessage(_message.Message):
    __slots__ = ["block_height", "id", "msg"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MSG_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    id: int
    msg: _any_pb2.Any
    def __init__(self, id: _Optional[int] = ..., msg: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., block_height: _Optional[int] = ...) -> None: ...
