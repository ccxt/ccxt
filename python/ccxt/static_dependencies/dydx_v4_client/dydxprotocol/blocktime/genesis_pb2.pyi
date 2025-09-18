from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.blocktime import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.DowntimeParams
    def __init__(self, params: _Optional[_Union[_params_pb2.DowntimeParams, _Mapping]] = ...) -> None: ...
