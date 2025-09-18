from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
PERPETUAL_MARKET_TYPE_CROSS: PerpetualMarketType
PERPETUAL_MARKET_TYPE_ISOLATED: PerpetualMarketType
PERPETUAL_MARKET_TYPE_UNSPECIFIED: PerpetualMarketType

class LiquidityTier(_message.Message):
    __slots__ = ["base_position_notional", "id", "impact_notional", "initial_margin_ppm", "maintenance_fraction_ppm", "name", "open_interest_lower_cap", "open_interest_upper_cap"]
    BASE_POSITION_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    IMPACT_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    INITIAL_MARGIN_PPM_FIELD_NUMBER: _ClassVar[int]
    MAINTENANCE_FRACTION_PPM_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    OPEN_INTEREST_LOWER_CAP_FIELD_NUMBER: _ClassVar[int]
    OPEN_INTEREST_UPPER_CAP_FIELD_NUMBER: _ClassVar[int]
    base_position_notional: int
    id: int
    impact_notional: int
    initial_margin_ppm: int
    maintenance_fraction_ppm: int
    name: str
    open_interest_lower_cap: int
    open_interest_upper_cap: int
    def __init__(self, id: _Optional[int] = ..., name: _Optional[str] = ..., initial_margin_ppm: _Optional[int] = ..., maintenance_fraction_ppm: _Optional[int] = ..., base_position_notional: _Optional[int] = ..., impact_notional: _Optional[int] = ..., open_interest_lower_cap: _Optional[int] = ..., open_interest_upper_cap: _Optional[int] = ...) -> None: ...

class MarketPremiums(_message.Message):
    __slots__ = ["perpetual_id", "premiums"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    PREMIUMS_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    premiums: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, perpetual_id: _Optional[int] = ..., premiums: _Optional[_Iterable[int]] = ...) -> None: ...

class Perpetual(_message.Message):
    __slots__ = ["funding_index", "open_interest", "params"]
    FUNDING_INDEX_FIELD_NUMBER: _ClassVar[int]
    OPEN_INTEREST_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    funding_index: bytes
    open_interest: bytes
    params: PerpetualParams
    def __init__(self, params: _Optional[_Union[PerpetualParams, _Mapping]] = ..., funding_index: _Optional[bytes] = ..., open_interest: _Optional[bytes] = ...) -> None: ...

class PerpetualParams(_message.Message):
    __slots__ = ["atomic_resolution", "default_funding_ppm", "id", "liquidity_tier", "market_id", "market_type", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_FUNDING_PPM_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_TYPE_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    default_funding_ppm: int
    id: int
    liquidity_tier: int
    market_id: int
    market_type: PerpetualMarketType
    ticker: str
    def __init__(self, id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., default_funding_ppm: _Optional[int] = ..., liquidity_tier: _Optional[int] = ..., market_type: _Optional[_Union[PerpetualMarketType, str]] = ...) -> None: ...

class PremiumStore(_message.Message):
    __slots__ = ["all_market_premiums", "num_premiums"]
    ALL_MARKET_PREMIUMS_FIELD_NUMBER: _ClassVar[int]
    NUM_PREMIUMS_FIELD_NUMBER: _ClassVar[int]
    all_market_premiums: _containers.RepeatedCompositeFieldContainer[MarketPremiums]
    num_premiums: int
    def __init__(self, all_market_premiums: _Optional[_Iterable[_Union[MarketPremiums, _Mapping]]] = ..., num_premiums: _Optional[int] = ...) -> None: ...

class PerpetualMarketType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
