from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.ratelimit import limit_params_pb2 as _limit_params_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["limit_params_list"]
    LIMIT_PARAMS_LIST_FIELD_NUMBER: _ClassVar[int]
    limit_params_list: _containers.RepeatedCompositeFieldContainer[_limit_params_pb2.LimitParams]
    def __init__(self, limit_params_list: _Optional[_Iterable[_Union[_limit_params_pb2.LimitParams, _Mapping]]] = ...) -> None: ...
