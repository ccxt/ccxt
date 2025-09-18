from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.perpetuals import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.perpetuals import perpetual_pb2 as _perpetual_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllLiquidityTiersRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllLiquidityTiersResponse(_message.Message):
    __slots__ = ["liquidity_tiers", "pagination"]
    LIQUIDITY_TIERS_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    liquidity_tiers: _containers.RepeatedCompositeFieldContainer[_perpetual_pb2.LiquidityTier]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, liquidity_tiers: _Optional[_Iterable[_Union[_perpetual_pb2.LiquidityTier, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryAllPerpetualsRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllPerpetualsResponse(_message.Message):
    __slots__ = ["pagination", "perpetual"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageResponse
    perpetual: _containers.RepeatedCompositeFieldContainer[_perpetual_pb2.Perpetual]
    def __init__(self, perpetual: _Optional[_Iterable[_Union[_perpetual_pb2.Perpetual, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryNextPerpetualIdRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryNextPerpetualIdResponse(_message.Message):
    __slots__ = ["next_perpetual_id"]
    NEXT_PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    next_perpetual_id: int
    def __init__(self, next_perpetual_id: _Optional[int] = ...) -> None: ...

class QueryParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.Params
    def __init__(self, params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...

class QueryPerpetualRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryPerpetualResponse(_message.Message):
    __slots__ = ["perpetual"]
    PERPETUAL_FIELD_NUMBER: _ClassVar[int]
    perpetual: _perpetual_pb2.Perpetual
    def __init__(self, perpetual: _Optional[_Union[_perpetual_pb2.Perpetual, _Mapping]] = ...) -> None: ...

class QueryPremiumSamplesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryPremiumSamplesResponse(_message.Message):
    __slots__ = ["premium_samples"]
    PREMIUM_SAMPLES_FIELD_NUMBER: _ClassVar[int]
    premium_samples: _perpetual_pb2.PremiumStore
    def __init__(self, premium_samples: _Optional[_Union[_perpetual_pb2.PremiumStore, _Mapping]] = ...) -> None: ...

class QueryPremiumVotesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryPremiumVotesResponse(_message.Message):
    __slots__ = ["premium_votes"]
    PREMIUM_VOTES_FIELD_NUMBER: _ClassVar[int]
    premium_votes: _perpetual_pb2.PremiumStore
    def __init__(self, premium_votes: _Optional[_Union[_perpetual_pb2.PremiumStore, _Mapping]] = ...) -> None: ...
