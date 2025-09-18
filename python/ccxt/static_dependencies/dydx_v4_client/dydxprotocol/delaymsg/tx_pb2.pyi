from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from google.protobuf import any_pb2 as _any_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgDelayMessage(_message.Message):
    __slots__ = ["authority", "delay_blocks", "msg"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    DELAY_BLOCKS_FIELD_NUMBER: _ClassVar[int]
    MSG_FIELD_NUMBER: _ClassVar[int]
    authority: str
    delay_blocks: int
    msg: _any_pb2.Any
    def __init__(self, authority: _Optional[str] = ..., msg: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., delay_blocks: _Optional[int] = ...) -> None: ...

class MsgDelayMessageResponse(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...
