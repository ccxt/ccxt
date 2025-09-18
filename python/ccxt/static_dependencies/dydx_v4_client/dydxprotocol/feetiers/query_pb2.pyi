from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.feetiers import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryPerpetualFeeParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryPerpetualFeeParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.PerpetualFeeParams
    def __init__(self, params: _Optional[_Union[_params_pb2.PerpetualFeeParams, _Mapping]] = ...) -> None: ...

class QueryUserFeeTierRequest(_message.Message):
    __slots__ = ["user"]
    USER_FIELD_NUMBER: _ClassVar[int]
    user: str
    def __init__(self, user: _Optional[str] = ...) -> None: ...

class QueryUserFeeTierResponse(_message.Message):
    __slots__ = ["index", "tier"]
    INDEX_FIELD_NUMBER: _ClassVar[int]
    TIER_FIELD_NUMBER: _ClassVar[int]
    index: int
    tier: _params_pb2.PerpetualFeeTier
    def __init__(self, index: _Optional[int] = ..., tier: _Optional[_Union[_params_pb2.PerpetualFeeTier, _Mapping]] = ...) -> None: ...
