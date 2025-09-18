from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.prices import market_param_pb2 as _market_param_pb2
from v4_proto.dydxprotocol.prices import market_price_pb2 as _market_price_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllMarketParamsRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllMarketParamsResponse(_message.Message):
    __slots__ = ["market_params", "pagination"]
    MARKET_PARAMS_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    market_params: _containers.RepeatedCompositeFieldContainer[_market_param_pb2.MarketParam]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, market_params: _Optional[_Iterable[_Union[_market_param_pb2.MarketParam, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryAllMarketPricesRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllMarketPricesResponse(_message.Message):
    __slots__ = ["market_prices", "pagination"]
    MARKET_PRICES_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    market_prices: _containers.RepeatedCompositeFieldContainer[_market_price_pb2.MarketPrice]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, market_prices: _Optional[_Iterable[_Union[_market_price_pb2.MarketPrice, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryMarketParamRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryMarketParamResponse(_message.Message):
    __slots__ = ["market_param"]
    MARKET_PARAM_FIELD_NUMBER: _ClassVar[int]
    market_param: _market_param_pb2.MarketParam
    def __init__(self, market_param: _Optional[_Union[_market_param_pb2.MarketParam, _Mapping]] = ...) -> None: ...

class QueryMarketPriceRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryMarketPriceResponse(_message.Message):
    __slots__ = ["market_price"]
    MARKET_PRICE_FIELD_NUMBER: _ClassVar[int]
    market_price: _market_price_pb2.MarketPrice
    def __init__(self, market_price: _Optional[_Union[_market_price_pb2.MarketPrice, _Mapping]] = ...) -> None: ...

class QueryNextMarketIdRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryNextMarketIdResponse(_message.Message):
    __slots__ = ["next_market_id"]
    NEXT_MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    next_market_id: int
    def __init__(self, next_market_id: _Optional[int] = ...) -> None: ...
