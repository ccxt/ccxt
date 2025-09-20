from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AccountAuthenticator(_message.Message):
    __slots__ = ["config", "id", "type"]
    CONFIG_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    config: bytes
    id: int
    type: str
    def __init__(self, id: _Optional[int] = ..., type: _Optional[str] = ..., config: _Optional[bytes] = ...) -> None: ...
