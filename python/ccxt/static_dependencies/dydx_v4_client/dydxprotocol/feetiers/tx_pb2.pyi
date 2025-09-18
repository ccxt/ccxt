from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.feetiers import params_pb2 as _params_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgUpdatePerpetualFeeParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.PerpetualFeeParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.PerpetualFeeParams, _Mapping]] = ...) -> None: ...

class MsgUpdatePerpetualFeeParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
