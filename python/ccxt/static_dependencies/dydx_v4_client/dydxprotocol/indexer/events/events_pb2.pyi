from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.indexer.shared import removal_reason_pb2 as _removal_reason_pb2
from v4_proto.dydxprotocol.indexer.protocol.v1 import clob_pb2 as _clob_pb2
from v4_proto.dydxprotocol.indexer.protocol.v1 import perpetual_pb2 as _perpetual_pb2
from v4_proto.dydxprotocol.indexer.protocol.v1 import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.indexer.protocol.v1 import vault_pb2 as _vault_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AddressTradingReward(_message.Message):
    __slots__ = ["denom_amount", "owner"]
    DENOM_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    denom_amount: bytes
    owner: str
    def __init__(self, owner: _Optional[str] = ..., denom_amount: _Optional[bytes] = ...) -> None: ...

class AssetCreateEventV1(_message.Message):
    __slots__ = ["atomic_resolution", "has_market", "id", "market_id", "symbol"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    HAS_MARKET_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    SYMBOL_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    has_market: bool
    id: int
    market_id: int
    symbol: str
    def __init__(self, id: _Optional[int] = ..., symbol: _Optional[str] = ..., has_market: bool = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ...) -> None: ...

class DeleveragingEventV1(_message.Message):
    __slots__ = ["fill_amount", "is_buy", "is_final_settlement", "liquidated", "offsetting", "perpetual_id", "total_quote_quantums"]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    IS_BUY_FIELD_NUMBER: _ClassVar[int]
    IS_FINAL_SETTLEMENT_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATED_FIELD_NUMBER: _ClassVar[int]
    OFFSETTING_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    fill_amount: int
    is_buy: bool
    is_final_settlement: bool
    liquidated: _subaccount_pb2.IndexerSubaccountId
    offsetting: _subaccount_pb2.IndexerSubaccountId
    perpetual_id: int
    total_quote_quantums: int
    def __init__(self, liquidated: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., offsetting: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., perpetual_id: _Optional[int] = ..., fill_amount: _Optional[int] = ..., total_quote_quantums: _Optional[int] = ..., is_buy: bool = ..., is_final_settlement: bool = ...) -> None: ...

class FundingEventV1(_message.Message):
    __slots__ = ["type", "updates"]
    class Type(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    TYPE_FIELD_NUMBER: _ClassVar[int]
    TYPE_FUNDING_RATE_AND_INDEX: FundingEventV1.Type
    TYPE_PREMIUM_SAMPLE: FundingEventV1.Type
    TYPE_PREMIUM_VOTE: FundingEventV1.Type
    TYPE_UNSPECIFIED: FundingEventV1.Type
    UPDATES_FIELD_NUMBER: _ClassVar[int]
    type: FundingEventV1.Type
    updates: _containers.RepeatedCompositeFieldContainer[FundingUpdateV1]
    def __init__(self, updates: _Optional[_Iterable[_Union[FundingUpdateV1, _Mapping]]] = ..., type: _Optional[_Union[FundingEventV1.Type, str]] = ...) -> None: ...

class FundingUpdateV1(_message.Message):
    __slots__ = ["funding_index", "funding_value_ppm", "perpetual_id"]
    FUNDING_INDEX_FIELD_NUMBER: _ClassVar[int]
    FUNDING_VALUE_PPM_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    funding_index: bytes
    funding_value_ppm: int
    perpetual_id: int
    def __init__(self, perpetual_id: _Optional[int] = ..., funding_value_ppm: _Optional[int] = ..., funding_index: _Optional[bytes] = ...) -> None: ...

class LiquidationOrderV1(_message.Message):
    __slots__ = ["clob_pair_id", "is_buy", "liquidated", "perpetual_id", "subticks", "total_size"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    IS_BUY_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATED_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_SIZE_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: int
    is_buy: bool
    liquidated: _subaccount_pb2.IndexerSubaccountId
    perpetual_id: int
    subticks: int
    total_size: int
    def __init__(self, liquidated: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., clob_pair_id: _Optional[int] = ..., perpetual_id: _Optional[int] = ..., total_size: _Optional[int] = ..., is_buy: bool = ..., subticks: _Optional[int] = ...) -> None: ...

class LiquidityTierUpsertEventV1(_message.Message):
    __slots__ = ["base_position_notional", "id", "initial_margin_ppm", "maintenance_fraction_ppm", "name"]
    BASE_POSITION_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    INITIAL_MARGIN_PPM_FIELD_NUMBER: _ClassVar[int]
    MAINTENANCE_FRACTION_PPM_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    base_position_notional: int
    id: int
    initial_margin_ppm: int
    maintenance_fraction_ppm: int
    name: str
    def __init__(self, id: _Optional[int] = ..., name: _Optional[str] = ..., initial_margin_ppm: _Optional[int] = ..., maintenance_fraction_ppm: _Optional[int] = ..., base_position_notional: _Optional[int] = ...) -> None: ...

class LiquidityTierUpsertEventV2(_message.Message):
    __slots__ = ["base_position_notional", "id", "initial_margin_ppm", "maintenance_fraction_ppm", "name", "open_interest_lower_cap", "open_interest_upper_cap"]
    BASE_POSITION_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    INITIAL_MARGIN_PPM_FIELD_NUMBER: _ClassVar[int]
    MAINTENANCE_FRACTION_PPM_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    OPEN_INTEREST_LOWER_CAP_FIELD_NUMBER: _ClassVar[int]
    OPEN_INTEREST_UPPER_CAP_FIELD_NUMBER: _ClassVar[int]
    base_position_notional: int
    id: int
    initial_margin_ppm: int
    maintenance_fraction_ppm: int
    name: str
    open_interest_lower_cap: int
    open_interest_upper_cap: int
    def __init__(self, id: _Optional[int] = ..., name: _Optional[str] = ..., initial_margin_ppm: _Optional[int] = ..., maintenance_fraction_ppm: _Optional[int] = ..., base_position_notional: _Optional[int] = ..., open_interest_lower_cap: _Optional[int] = ..., open_interest_upper_cap: _Optional[int] = ...) -> None: ...

class MarketBaseEventV1(_message.Message):
    __slots__ = ["min_price_change_ppm", "pair"]
    MIN_PRICE_CHANGE_PPM_FIELD_NUMBER: _ClassVar[int]
    PAIR_FIELD_NUMBER: _ClassVar[int]
    min_price_change_ppm: int
    pair: str
    def __init__(self, pair: _Optional[str] = ..., min_price_change_ppm: _Optional[int] = ...) -> None: ...

class MarketCreateEventV1(_message.Message):
    __slots__ = ["base", "exponent"]
    BASE_FIELD_NUMBER: _ClassVar[int]
    EXPONENT_FIELD_NUMBER: _ClassVar[int]
    base: MarketBaseEventV1
    exponent: int
    def __init__(self, base: _Optional[_Union[MarketBaseEventV1, _Mapping]] = ..., exponent: _Optional[int] = ...) -> None: ...

class MarketEventV1(_message.Message):
    __slots__ = ["market_create", "market_id", "market_modify", "price_update"]
    MARKET_CREATE_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_MODIFY_FIELD_NUMBER: _ClassVar[int]
    PRICE_UPDATE_FIELD_NUMBER: _ClassVar[int]
    market_create: MarketCreateEventV1
    market_id: int
    market_modify: MarketModifyEventV1
    price_update: MarketPriceUpdateEventV1
    def __init__(self, market_id: _Optional[int] = ..., price_update: _Optional[_Union[MarketPriceUpdateEventV1, _Mapping]] = ..., market_create: _Optional[_Union[MarketCreateEventV1, _Mapping]] = ..., market_modify: _Optional[_Union[MarketModifyEventV1, _Mapping]] = ...) -> None: ...

class MarketModifyEventV1(_message.Message):
    __slots__ = ["base"]
    BASE_FIELD_NUMBER: _ClassVar[int]
    base: MarketBaseEventV1
    def __init__(self, base: _Optional[_Union[MarketBaseEventV1, _Mapping]] = ...) -> None: ...

class MarketPriceUpdateEventV1(_message.Message):
    __slots__ = ["price_with_exponent"]
    PRICE_WITH_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    price_with_exponent: int
    def __init__(self, price_with_exponent: _Optional[int] = ...) -> None: ...

class OpenInterestUpdate(_message.Message):
    __slots__ = ["open_interest", "perpetual_id"]
    OPEN_INTEREST_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    open_interest: bytes
    perpetual_id: int
    def __init__(self, perpetual_id: _Optional[int] = ..., open_interest: _Optional[bytes] = ...) -> None: ...

class OpenInterestUpdateEventV1(_message.Message):
    __slots__ = ["open_interest_updates"]
    OPEN_INTEREST_UPDATES_FIELD_NUMBER: _ClassVar[int]
    open_interest_updates: _containers.RepeatedCompositeFieldContainer[OpenInterestUpdate]
    def __init__(self, open_interest_updates: _Optional[_Iterable[_Union[OpenInterestUpdate, _Mapping]]] = ...) -> None: ...

class OrderFillEventV1(_message.Message):
    __slots__ = ["affiliate_rev_share", "fill_amount", "liquidation_order", "maker_builder_address", "maker_builder_fee", "maker_fee", "maker_order", "maker_order_router_address", "maker_order_router_fee", "order", "taker_builder_address", "taker_builder_fee", "taker_fee", "taker_order_router_address", "taker_order_router_fee", "total_filled_maker", "total_filled_taker"]
    AFFILIATE_REV_SHARE_FIELD_NUMBER: _ClassVar[int]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATION_ORDER_FIELD_NUMBER: _ClassVar[int]
    MAKER_BUILDER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAKER_BUILDER_FEE_FIELD_NUMBER: _ClassVar[int]
    MAKER_FEE_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_ROUTER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_ROUTER_FEE_FIELD_NUMBER: _ClassVar[int]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    TAKER_BUILDER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    TAKER_BUILDER_FEE_FIELD_NUMBER: _ClassVar[int]
    TAKER_FEE_FIELD_NUMBER: _ClassVar[int]
    TAKER_ORDER_ROUTER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    TAKER_ORDER_ROUTER_FEE_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FILLED_MAKER_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FILLED_TAKER_FIELD_NUMBER: _ClassVar[int]
    affiliate_rev_share: int
    fill_amount: int
    liquidation_order: LiquidationOrderV1
    maker_builder_address: str
    maker_builder_fee: int
    maker_fee: int
    maker_order: _clob_pb2.IndexerOrder
    maker_order_router_address: str
    maker_order_router_fee: int
    order: _clob_pb2.IndexerOrder
    taker_builder_address: str
    taker_builder_fee: int
    taker_fee: int
    taker_order_router_address: str
    taker_order_router_fee: int
    total_filled_maker: int
    total_filled_taker: int
    def __init__(self, maker_order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ..., order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ..., liquidation_order: _Optional[_Union[LiquidationOrderV1, _Mapping]] = ..., fill_amount: _Optional[int] = ..., maker_fee: _Optional[int] = ..., taker_fee: _Optional[int] = ..., total_filled_maker: _Optional[int] = ..., total_filled_taker: _Optional[int] = ..., affiliate_rev_share: _Optional[int] = ..., maker_builder_fee: _Optional[int] = ..., taker_builder_fee: _Optional[int] = ..., maker_builder_address: _Optional[str] = ..., taker_builder_address: _Optional[str] = ..., maker_order_router_fee: _Optional[int] = ..., taker_order_router_fee: _Optional[int] = ..., maker_order_router_address: _Optional[str] = ..., taker_order_router_address: _Optional[str] = ...) -> None: ...

class PerpetualMarketCreateEventV1(_message.Message):
    __slots__ = ["atomic_resolution", "clob_pair_id", "id", "liquidity_tier", "market_id", "quantum_conversion_exponent", "status", "step_base_quantums", "subticks_per_tick", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUM_CONVERSION_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STEP_BASE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_PER_TICK_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    clob_pair_id: int
    id: int
    liquidity_tier: int
    market_id: int
    quantum_conversion_exponent: int
    status: _clob_pb2.ClobPairStatus
    step_base_quantums: int
    subticks_per_tick: int
    ticker: str
    def __init__(self, id: _Optional[int] = ..., clob_pair_id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., status: _Optional[_Union[_clob_pb2.ClobPairStatus, str]] = ..., quantum_conversion_exponent: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., subticks_per_tick: _Optional[int] = ..., step_base_quantums: _Optional[int] = ..., liquidity_tier: _Optional[int] = ...) -> None: ...

class PerpetualMarketCreateEventV2(_message.Message):
    __slots__ = ["atomic_resolution", "clob_pair_id", "id", "liquidity_tier", "market_id", "market_type", "quantum_conversion_exponent", "status", "step_base_quantums", "subticks_per_tick", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_TYPE_FIELD_NUMBER: _ClassVar[int]
    QUANTUM_CONVERSION_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STEP_BASE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_PER_TICK_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    clob_pair_id: int
    id: int
    liquidity_tier: int
    market_id: int
    market_type: _perpetual_pb2.PerpetualMarketType
    quantum_conversion_exponent: int
    status: _clob_pb2.ClobPairStatus
    step_base_quantums: int
    subticks_per_tick: int
    ticker: str
    def __init__(self, id: _Optional[int] = ..., clob_pair_id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., status: _Optional[_Union[_clob_pb2.ClobPairStatus, str]] = ..., quantum_conversion_exponent: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., subticks_per_tick: _Optional[int] = ..., step_base_quantums: _Optional[int] = ..., liquidity_tier: _Optional[int] = ..., market_type: _Optional[_Union[_perpetual_pb2.PerpetualMarketType, str]] = ...) -> None: ...

class PerpetualMarketCreateEventV3(_message.Message):
    __slots__ = ["atomic_resolution", "clob_pair_id", "default_funding8hr_ppm", "id", "liquidity_tier", "market_id", "market_type", "quantum_conversion_exponent", "status", "step_base_quantums", "subticks_per_tick", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_FUNDING8HR_PPM_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_TYPE_FIELD_NUMBER: _ClassVar[int]
    QUANTUM_CONVERSION_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STEP_BASE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_PER_TICK_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    clob_pair_id: int
    default_funding8hr_ppm: int
    id: int
    liquidity_tier: int
    market_id: int
    market_type: _perpetual_pb2.PerpetualMarketType
    quantum_conversion_exponent: int
    status: _clob_pb2.ClobPairStatus
    step_base_quantums: int
    subticks_per_tick: int
    ticker: str
    def __init__(self, id: _Optional[int] = ..., clob_pair_id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., status: _Optional[_Union[_clob_pb2.ClobPairStatus, str]] = ..., quantum_conversion_exponent: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., subticks_per_tick: _Optional[int] = ..., step_base_quantums: _Optional[int] = ..., liquidity_tier: _Optional[int] = ..., market_type: _Optional[_Union[_perpetual_pb2.PerpetualMarketType, str]] = ..., default_funding8hr_ppm: _Optional[int] = ...) -> None: ...

class RegisterAffiliateEventV1(_message.Message):
    __slots__ = ["affiliate", "referee"]
    AFFILIATE_FIELD_NUMBER: _ClassVar[int]
    REFEREE_FIELD_NUMBER: _ClassVar[int]
    affiliate: str
    referee: str
    def __init__(self, referee: _Optional[str] = ..., affiliate: _Optional[str] = ...) -> None: ...

class SourceOfFunds(_message.Message):
    __slots__ = ["address", "subaccount_id"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    address: str
    subaccount_id: _subaccount_pb2.IndexerSubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., address: _Optional[str] = ...) -> None: ...

class StatefulOrderEventV1(_message.Message):
    __slots__ = ["conditional_order_placement", "conditional_order_triggered", "long_term_order_placement", "order_place", "order_removal", "order_replacement", "twap_order_placement"]
    class ConditionalOrderPlacementV1(_message.Message):
        __slots__ = ["order"]
        ORDER_FIELD_NUMBER: _ClassVar[int]
        order: _clob_pb2.IndexerOrder
        def __init__(self, order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ...) -> None: ...
    class ConditionalOrderTriggeredV1(_message.Message):
        __slots__ = ["triggered_order_id"]
        TRIGGERED_ORDER_ID_FIELD_NUMBER: _ClassVar[int]
        triggered_order_id: _clob_pb2.IndexerOrderId
        def __init__(self, triggered_order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ...) -> None: ...
    class LongTermOrderPlacementV1(_message.Message):
        __slots__ = ["order"]
        ORDER_FIELD_NUMBER: _ClassVar[int]
        order: _clob_pb2.IndexerOrder
        def __init__(self, order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ...) -> None: ...
    class LongTermOrderReplacementV1(_message.Message):
        __slots__ = ["old_order_id", "order"]
        OLD_ORDER_ID_FIELD_NUMBER: _ClassVar[int]
        ORDER_FIELD_NUMBER: _ClassVar[int]
        old_order_id: _clob_pb2.IndexerOrderId
        order: _clob_pb2.IndexerOrder
        def __init__(self, old_order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ..., order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ...) -> None: ...
    class StatefulOrderPlacementV1(_message.Message):
        __slots__ = ["order"]
        ORDER_FIELD_NUMBER: _ClassVar[int]
        order: _clob_pb2.IndexerOrder
        def __init__(self, order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ...) -> None: ...
    class StatefulOrderRemovalV1(_message.Message):
        __slots__ = ["reason", "removed_order_id"]
        REASON_FIELD_NUMBER: _ClassVar[int]
        REMOVED_ORDER_ID_FIELD_NUMBER: _ClassVar[int]
        reason: _removal_reason_pb2.OrderRemovalReason
        removed_order_id: _clob_pb2.IndexerOrderId
        def __init__(self, removed_order_id: _Optional[_Union[_clob_pb2.IndexerOrderId, _Mapping]] = ..., reason: _Optional[_Union[_removal_reason_pb2.OrderRemovalReason, str]] = ...) -> None: ...
    class TwapOrderPlacementV1(_message.Message):
        __slots__ = ["order"]
        ORDER_FIELD_NUMBER: _ClassVar[int]
        order: _clob_pb2.IndexerOrder
        def __init__(self, order: _Optional[_Union[_clob_pb2.IndexerOrder, _Mapping]] = ...) -> None: ...
    CONDITIONAL_ORDER_PLACEMENT_FIELD_NUMBER: _ClassVar[int]
    CONDITIONAL_ORDER_TRIGGERED_FIELD_NUMBER: _ClassVar[int]
    LONG_TERM_ORDER_PLACEMENT_FIELD_NUMBER: _ClassVar[int]
    ORDER_PLACE_FIELD_NUMBER: _ClassVar[int]
    ORDER_REMOVAL_FIELD_NUMBER: _ClassVar[int]
    ORDER_REPLACEMENT_FIELD_NUMBER: _ClassVar[int]
    TWAP_ORDER_PLACEMENT_FIELD_NUMBER: _ClassVar[int]
    conditional_order_placement: StatefulOrderEventV1.ConditionalOrderPlacementV1
    conditional_order_triggered: StatefulOrderEventV1.ConditionalOrderTriggeredV1
    long_term_order_placement: StatefulOrderEventV1.LongTermOrderPlacementV1
    order_place: StatefulOrderEventV1.StatefulOrderPlacementV1
    order_removal: StatefulOrderEventV1.StatefulOrderRemovalV1
    order_replacement: StatefulOrderEventV1.LongTermOrderReplacementV1
    twap_order_placement: StatefulOrderEventV1.TwapOrderPlacementV1
    def __init__(self, order_place: _Optional[_Union[StatefulOrderEventV1.StatefulOrderPlacementV1, _Mapping]] = ..., order_removal: _Optional[_Union[StatefulOrderEventV1.StatefulOrderRemovalV1, _Mapping]] = ..., conditional_order_placement: _Optional[_Union[StatefulOrderEventV1.ConditionalOrderPlacementV1, _Mapping]] = ..., conditional_order_triggered: _Optional[_Union[StatefulOrderEventV1.ConditionalOrderTriggeredV1, _Mapping]] = ..., long_term_order_placement: _Optional[_Union[StatefulOrderEventV1.LongTermOrderPlacementV1, _Mapping]] = ..., order_replacement: _Optional[_Union[StatefulOrderEventV1.LongTermOrderReplacementV1, _Mapping]] = ..., twap_order_placement: _Optional[_Union[StatefulOrderEventV1.TwapOrderPlacementV1, _Mapping]] = ...) -> None: ...

class SubaccountUpdateEventV1(_message.Message):
    __slots__ = ["subaccount_id", "updated_asset_positions", "updated_perpetual_positions"]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    UPDATED_ASSET_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    UPDATED_PERPETUAL_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    subaccount_id: _subaccount_pb2.IndexerSubaccountId
    updated_asset_positions: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.IndexerAssetPosition]
    updated_perpetual_positions: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.IndexerPerpetualPosition]
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., updated_perpetual_positions: _Optional[_Iterable[_Union[_subaccount_pb2.IndexerPerpetualPosition, _Mapping]]] = ..., updated_asset_positions: _Optional[_Iterable[_Union[_subaccount_pb2.IndexerAssetPosition, _Mapping]]] = ...) -> None: ...

class TradingRewardsEventV1(_message.Message):
    __slots__ = ["trading_rewards"]
    TRADING_REWARDS_FIELD_NUMBER: _ClassVar[int]
    trading_rewards: _containers.RepeatedCompositeFieldContainer[AddressTradingReward]
    def __init__(self, trading_rewards: _Optional[_Iterable[_Union[AddressTradingReward, _Mapping]]] = ...) -> None: ...

class TransferEventV1(_message.Message):
    __slots__ = ["amount", "asset_id", "recipient", "recipient_subaccount_id", "sender", "sender_subaccount_id"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    SENDER_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    amount: int
    asset_id: int
    recipient: SourceOfFunds
    recipient_subaccount_id: _subaccount_pb2.IndexerSubaccountId
    sender: SourceOfFunds
    sender_subaccount_id: _subaccount_pb2.IndexerSubaccountId
    def __init__(self, sender_subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., recipient_subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., asset_id: _Optional[int] = ..., amount: _Optional[int] = ..., sender: _Optional[_Union[SourceOfFunds, _Mapping]] = ..., recipient: _Optional[_Union[SourceOfFunds, _Mapping]] = ...) -> None: ...

class UpdateClobPairEventV1(_message.Message):
    __slots__ = ["clob_pair_id", "quantum_conversion_exponent", "status", "step_base_quantums", "subticks_per_tick"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUM_CONVERSION_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STEP_BASE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_PER_TICK_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: int
    quantum_conversion_exponent: int
    status: _clob_pb2.ClobPairStatus
    step_base_quantums: int
    subticks_per_tick: int
    def __init__(self, clob_pair_id: _Optional[int] = ..., status: _Optional[_Union[_clob_pb2.ClobPairStatus, str]] = ..., quantum_conversion_exponent: _Optional[int] = ..., subticks_per_tick: _Optional[int] = ..., step_base_quantums: _Optional[int] = ...) -> None: ...

class UpdatePerpetualEventV1(_message.Message):
    __slots__ = ["atomic_resolution", "id", "liquidity_tier", "market_id", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    id: int
    liquidity_tier: int
    market_id: int
    ticker: str
    def __init__(self, id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., liquidity_tier: _Optional[int] = ...) -> None: ...

class UpdatePerpetualEventV2(_message.Message):
    __slots__ = ["atomic_resolution", "id", "liquidity_tier", "market_id", "market_type", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_TYPE_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    id: int
    liquidity_tier: int
    market_id: int
    market_type: _perpetual_pb2.PerpetualMarketType
    ticker: str
    def __init__(self, id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., liquidity_tier: _Optional[int] = ..., market_type: _Optional[_Union[_perpetual_pb2.PerpetualMarketType, str]] = ...) -> None: ...

class UpdatePerpetualEventV3(_message.Message):
    __slots__ = ["atomic_resolution", "default_funding8hr_ppm", "id", "liquidity_tier", "market_id", "market_type", "ticker"]
    ATOMIC_RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_FUNDING8HR_PPM_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    MARKET_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_TYPE_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    atomic_resolution: int
    default_funding8hr_ppm: int
    id: int
    liquidity_tier: int
    market_id: int
    market_type: _perpetual_pb2.PerpetualMarketType
    ticker: str
    def __init__(self, id: _Optional[int] = ..., ticker: _Optional[str] = ..., market_id: _Optional[int] = ..., atomic_resolution: _Optional[int] = ..., liquidity_tier: _Optional[int] = ..., market_type: _Optional[_Union[_perpetual_pb2.PerpetualMarketType, str]] = ..., default_funding8hr_ppm: _Optional[int] = ...) -> None: ...

class UpsertVaultEventV1(_message.Message):
    __slots__ = ["address", "clob_pair_id", "status"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    address: str
    clob_pair_id: int
    status: _vault_pb2.VaultStatus
    def __init__(self, address: _Optional[str] = ..., clob_pair_id: _Optional[int] = ..., status: _Optional[_Union[_vault_pb2.VaultStatus, str]] = ...) -> None: ...
