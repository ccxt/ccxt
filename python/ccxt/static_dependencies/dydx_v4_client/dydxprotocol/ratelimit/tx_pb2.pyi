from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.ratelimit import limit_params_pb2 as _limit_params_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgSetLimitParams(_message.Message):
    __slots__ = ["authority", "limit_params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    LIMIT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    limit_params: _limit_params_pb2.LimitParams
    def __init__(self, authority: _Optional[str] = ..., limit_params: _Optional[_Union[_limit_params_pb2.LimitParams, _Mapping]] = ...) -> None: ...

class MsgSetLimitParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
