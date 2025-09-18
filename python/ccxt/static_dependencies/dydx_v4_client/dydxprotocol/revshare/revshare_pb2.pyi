from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MarketMapperRevShareDetails(_message.Message):
    __slots__ = ["expiration_ts"]
    EXPIRATION_TS_FIELD_NUMBER: _ClassVar[int]
    expiration_ts: int
    def __init__(self, expiration_ts: _Optional[int] = ...) -> None: ...

class OrderRouterRevShare(_message.Message):
    __slots__ = ["address", "share_ppm"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
    address: str
    share_ppm: int
    def __init__(self, address: _Optional[str] = ..., share_ppm: _Optional[int] = ...) -> None: ...

class UnconditionalRevShareConfig(_message.Message):
    __slots__ = ["configs"]
    class RecipientConfig(_message.Message):
        __slots__ = ["address", "share_ppm"]
        ADDRESS_FIELD_NUMBER: _ClassVar[int]
        SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
        address: str
        share_ppm: int
        def __init__(self, address: _Optional[str] = ..., share_ppm: _Optional[int] = ...) -> None: ...
    CONFIGS_FIELD_NUMBER: _ClassVar[int]
    configs: _containers.RepeatedCompositeFieldContainer[UnconditionalRevShareConfig.RecipientConfig]
    def __init__(self, configs: _Optional[_Iterable[_Union[UnconditionalRevShareConfig.RecipientConfig, _Mapping]]] = ...) -> None: ...
