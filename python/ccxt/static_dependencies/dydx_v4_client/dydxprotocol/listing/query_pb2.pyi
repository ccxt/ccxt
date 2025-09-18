from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.listing import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryListingVaultDepositParams(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryListingVaultDepositParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.ListingVaultDepositParams
    def __init__(self, params: _Optional[_Union[_params_pb2.ListingVaultDepositParams, _Mapping]] = ...) -> None: ...

class QueryMarketsHardCap(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryMarketsHardCapResponse(_message.Message):
    __slots__ = ["hard_cap"]
    HARD_CAP_FIELD_NUMBER: _ClassVar[int]
    hard_cap: int
    def __init__(self, hard_cap: _Optional[int] = ...) -> None: ...
