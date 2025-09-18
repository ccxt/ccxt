from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.epochs import epoch_info_pb2 as _epoch_info_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["epoch_info_list"]
    EPOCH_INFO_LIST_FIELD_NUMBER: _ClassVar[int]
    epoch_info_list: _containers.RepeatedCompositeFieldContainer[_epoch_info_pb2.EpochInfo]
    def __init__(self, epoch_info_list: _Optional[_Iterable[_Union[_epoch_info_pb2.EpochInfo, _Mapping]]] = ...) -> None: ...
