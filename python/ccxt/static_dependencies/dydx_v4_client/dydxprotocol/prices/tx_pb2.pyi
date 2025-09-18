from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.prices import market_param_pb2 as _market_param_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgCreateOracleMarket(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _market_param_pb2.MarketParam
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_market_param_pb2.MarketParam, _Mapping]] = ...) -> None: ...

class MsgCreateOracleMarketResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateMarketParam(_message.Message):
    __slots__ = ["authority", "market_param"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    MARKET_PARAM_FIELD_NUMBER: _ClassVar[int]
    authority: str
    market_param: _market_param_pb2.MarketParam
    def __init__(self, authority: _Optional[str] = ..., market_param: _Optional[_Union[_market_param_pb2.MarketParam, _Mapping]] = ...) -> None: ...

class MsgUpdateMarketParamResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateMarketPrices(_message.Message):
    __slots__ = ["market_price_updates"]
    class MarketPrice(_message.Message):
        __slots__ = ["market_id", "price"]
        MARKET_ID_FIELD_NUMBER: _ClassVar[int]
        PRICE_FIELD_NUMBER: _ClassVar[int]
        market_id: int
        price: int
        def __init__(self, market_id: _Optional[int] = ..., price: _Optional[int] = ...) -> None: ...
    MARKET_PRICE_UPDATES_FIELD_NUMBER: _ClassVar[int]
    market_price_updates: _containers.RepeatedCompositeFieldContainer[MsgUpdateMarketPrices.MarketPrice]
    def __init__(self, market_price_updates: _Optional[_Iterable[_Union[MsgUpdateMarketPrices.MarketPrice, _Mapping]]] = ...) -> None: ...

class MsgUpdateMarketPricesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
