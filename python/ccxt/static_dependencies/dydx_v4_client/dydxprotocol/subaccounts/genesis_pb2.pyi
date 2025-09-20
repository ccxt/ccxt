from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["subaccounts"]
    SUBACCOUNTS_FIELD_NUMBER: _ClassVar[int]
    subaccounts: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.Subaccount]
    def __init__(self, subaccounts: _Optional[_Iterable[_Union[_subaccount_pb2.Subaccount, _Mapping]]] = ...) -> None: ...
