from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class PageRequest(_message.Message):
    __slots__ = ["count_total", "key", "limit", "offset", "reverse"]
    COUNT_TOTAL_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    REVERSE_FIELD_NUMBER: _ClassVar[int]
    count_total: bool
    key: bytes
    limit: int
    offset: int
    reverse: bool
    def __init__(self, key: _Optional[bytes] = ..., offset: _Optional[int] = ..., limit: _Optional[int] = ..., count_total: bool = ..., reverse: bool = ...) -> None: ...

class PageResponse(_message.Message):
    __slots__ = ["next_key", "total"]
    NEXT_KEY_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    next_key: bytes
    total: int
    def __init__(self, next_key: _Optional[bytes] = ..., total: _Optional[int] = ...) -> None: ...
