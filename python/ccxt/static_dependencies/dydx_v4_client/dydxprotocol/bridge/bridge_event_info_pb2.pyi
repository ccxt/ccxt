from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class BridgeEventInfo(_message.Message):
    __slots__ = ["eth_block_height", "next_id"]
    ETH_BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    NEXT_ID_FIELD_NUMBER: _ClassVar[int]
    eth_block_height: int
    next_id: int
    def __init__(self, next_id: _Optional[int] = ..., eth_block_height: _Optional[int] = ...) -> None: ...
