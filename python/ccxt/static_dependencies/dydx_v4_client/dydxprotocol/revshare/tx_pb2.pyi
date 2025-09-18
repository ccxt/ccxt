from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.revshare import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.revshare import revshare_pb2 as _revshare_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgSetMarketMapperRevShareDetailsForMarket(_message.Message):
    __slots__ = ["authority", "market_id", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    market_id: int
    params: _revshare_pb2.MarketMapperRevShareDetails
    def __init__(self, authority: _Optional[str] = ..., market_id: _Optional[int] = ..., params: _Optional[_Union[_revshare_pb2.MarketMapperRevShareDetails, _Mapping]] = ...) -> None: ...

class MsgSetMarketMapperRevShareDetailsForMarketResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetMarketMapperRevenueShare(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.MarketMapperRevenueShareParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.MarketMapperRevenueShareParams, _Mapping]] = ...) -> None: ...

class MsgSetMarketMapperRevenueShareResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetOrderRouterRevShare(_message.Message):
    __slots__ = ["authority", "order_router_rev_share"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    ORDER_ROUTER_REV_SHARE_FIELD_NUMBER: _ClassVar[int]
    authority: str
    order_router_rev_share: _revshare_pb2.OrderRouterRevShare
    def __init__(self, authority: _Optional[str] = ..., order_router_rev_share: _Optional[_Union[_revshare_pb2.OrderRouterRevShare, _Mapping]] = ...) -> None: ...

class MsgSetOrderRouterRevShareResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateUnconditionalRevShareConfig(_message.Message):
    __slots__ = ["authority", "config"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    CONFIG_FIELD_NUMBER: _ClassVar[int]
    authority: str
    config: _revshare_pb2.UnconditionalRevShareConfig
    def __init__(self, authority: _Optional[str] = ..., config: _Optional[_Union[_revshare_pb2.UnconditionalRevShareConfig, _Mapping]] = ...) -> None: ...

class MsgUpdateUnconditionalRevShareConfigResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
