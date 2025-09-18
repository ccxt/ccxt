from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.prices import market_param_pb2 as _market_param_pb2
from v4_proto.dydxprotocol.prices import market_price_pb2 as _market_price_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["market_params", "market_prices"]
    MARKET_PARAMS_FIELD_NUMBER: _ClassVar[int]
    MARKET_PRICES_FIELD_NUMBER: _ClassVar[int]
    market_params: _containers.RepeatedCompositeFieldContainer[_market_param_pb2.MarketParam]
    market_prices: _containers.RepeatedCompositeFieldContainer[_market_price_pb2.MarketPrice]
    def __init__(self, market_params: _Optional[_Iterable[_Union[_market_param_pb2.MarketParam, _Mapping]]] = ..., market_prices: _Optional[_Iterable[_Union[_market_price_pb2.MarketPrice, _Mapping]]] = ...) -> None: ...
