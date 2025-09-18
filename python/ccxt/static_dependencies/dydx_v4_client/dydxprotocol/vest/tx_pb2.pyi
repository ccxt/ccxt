from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.vest import vest_entry_pb2 as _vest_entry_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgDeleteVestEntry(_message.Message):
    __slots__ = ["authority", "vester_account"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    VESTER_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    authority: str
    vester_account: str
    def __init__(self, authority: _Optional[str] = ..., vester_account: _Optional[str] = ...) -> None: ...

class MsgDeleteVestEntryResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetVestEntry(_message.Message):
    __slots__ = ["authority", "entry"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    ENTRY_FIELD_NUMBER: _ClassVar[int]
    authority: str
    entry: _vest_entry_pb2.VestEntry
    def __init__(self, authority: _Optional[str] = ..., entry: _Optional[_Union[_vest_entry_pb2.VestEntry, _Mapping]] = ...) -> None: ...

class MsgSetVestEntryResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
