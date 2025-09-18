from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.vest import vest_entry_pb2 as _vest_entry_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryVestEntryRequest(_message.Message):
    __slots__ = ["vester_account"]
    VESTER_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    vester_account: str
    def __init__(self, vester_account: _Optional[str] = ...) -> None: ...

class QueryVestEntryResponse(_message.Message):
    __slots__ = ["entry"]
    ENTRY_FIELD_NUMBER: _ClassVar[int]
    entry: _vest_entry_pb2.VestEntry
    def __init__(self, entry: _Optional[_Union[_vest_entry_pb2.VestEntry, _Mapping]] = ...) -> None: ...
