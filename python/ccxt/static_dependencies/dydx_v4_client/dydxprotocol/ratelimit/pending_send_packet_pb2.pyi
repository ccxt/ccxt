from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class PendingSendPacket(_message.Message):
    __slots__ = ["channel_id", "sequence"]
    CHANNEL_ID_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    channel_id: str
    sequence: int
    def __init__(self, channel_id: _Optional[str] = ..., sequence: _Optional[int] = ...) -> None: ...
