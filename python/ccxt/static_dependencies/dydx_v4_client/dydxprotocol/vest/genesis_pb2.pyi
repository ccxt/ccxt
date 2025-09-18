from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.vest import vest_entry_pb2 as _vest_entry_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["vest_entries"]
    VEST_ENTRIES_FIELD_NUMBER: _ClassVar[int]
    vest_entries: _containers.RepeatedCompositeFieldContainer[_vest_entry_pb2.VestEntry]
    def __init__(self, vest_entries: _Optional[_Iterable[_Union[_vest_entry_pb2.VestEntry, _Mapping]]] = ...) -> None: ...
