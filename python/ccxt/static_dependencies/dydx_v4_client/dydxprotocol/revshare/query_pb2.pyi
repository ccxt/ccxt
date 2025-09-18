from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.revshare import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.revshare import revshare_pb2 as _revshare_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryMarketMapperRevShareDetails(_message.Message):
    __slots__ = ["market_id"]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    market_id: int
    def __init__(self, market_id: _Optional[int] = ...) -> None: ...

class QueryMarketMapperRevShareDetailsResponse(_message.Message):
    __slots__ = ["details"]
    DETAILS_FIELD_NUMBER: _ClassVar[int]
    details: _revshare_pb2.MarketMapperRevShareDetails
    def __init__(self, details: _Optional[_Union[_revshare_pb2.MarketMapperRevShareDetails, _Mapping]] = ...) -> None: ...

class QueryMarketMapperRevenueShareParams(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryMarketMapperRevenueShareParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.MarketMapperRevenueShareParams
    def __init__(self, params: _Optional[_Union[_params_pb2.MarketMapperRevenueShareParams, _Mapping]] = ...) -> None: ...

class QueryOrderRouterRevShare(_message.Message):
    __slots__ = ["address"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    address: str
    def __init__(self, address: _Optional[str] = ...) -> None: ...

class QueryOrderRouterRevShareResponse(_message.Message):
    __slots__ = ["order_router_rev_share"]
    ORDER_ROUTER_REV_SHARE_FIELD_NUMBER: _ClassVar[int]
    order_router_rev_share: _revshare_pb2.OrderRouterRevShare
    def __init__(self, order_router_rev_share: _Optional[_Union[_revshare_pb2.OrderRouterRevShare, _Mapping]] = ...) -> None: ...

class QueryUnconditionalRevShareConfig(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryUnconditionalRevShareConfigResponse(_message.Message):
    __slots__ = ["config"]
    CONFIG_FIELD_NUMBER: _ClassVar[int]
    config: _revshare_pb2.UnconditionalRevShareConfig
    def __init__(self, config: _Optional[_Union[_revshare_pb2.UnconditionalRevShareConfig, _Mapping]] = ...) -> None: ...
