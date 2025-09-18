from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.delaymsg import delayed_message_pb2 as _delayed_message_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryBlockMessageIdsRequest(_message.Message):
    __slots__ = ["block_height"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    def __init__(self, block_height: _Optional[int] = ...) -> None: ...

class QueryBlockMessageIdsResponse(_message.Message):
    __slots__ = ["message_ids"]
    MESSAGE_IDS_FIELD_NUMBER: _ClassVar[int]
    message_ids: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, message_ids: _Optional[_Iterable[int]] = ...) -> None: ...

class QueryMessageRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryMessageResponse(_message.Message):
    __slots__ = ["message"]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    message: _delayed_message_pb2.DelayedMessage
    def __init__(self, message: _Optional[_Union[_delayed_message_pb2.DelayedMessage, _Mapping]] = ...) -> None: ...

class QueryNextDelayedMessageIdRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryNextDelayedMessageIdResponse(_message.Message):
    __slots__ = ["next_delayed_message_id"]
    NEXT_DELAYED_MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    next_delayed_message_id: int
    def __init__(self, next_delayed_message_id: _Optional[int] = ...) -> None: ...
