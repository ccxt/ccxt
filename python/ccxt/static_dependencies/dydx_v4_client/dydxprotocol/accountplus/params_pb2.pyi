from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Params(_message.Message):
    __slots__ = ["is_smart_account_active"]
    IS_SMART_ACCOUNT_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    is_smart_account_active: bool
    def __init__(self, is_smart_account_active: bool = ...) -> None: ...
