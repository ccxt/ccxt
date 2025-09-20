from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.clob import block_rate_limit_config_pb2 as _block_rate_limit_config_pb2
from v4_proto.dydxprotocol.clob import clob_pair_pb2 as _clob_pair_pb2
from v4_proto.dydxprotocol.clob import equity_tier_limit_config_pb2 as _equity_tier_limit_config_pb2
from v4_proto.dydxprotocol.clob import order_pb2 as _order_pb2
from v4_proto.dydxprotocol.clob import matches_pb2 as _matches_pb2
from v4_proto.dydxprotocol.clob import liquidations_config_pb2 as _liquidations_config_pb2
from v4_proto.dydxprotocol.clob import mev_pb2 as _mev_pb2
from v4_proto.dydxprotocol.indexer.off_chain_updates import off_chain_updates_pb2 as _off_chain_updates_pb2
from v4_proto.dydxprotocol.subaccounts import streaming_pb2 as _streaming_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.prices import streaming_pb2 as _streaming_pb2_1
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MevNodeToNodeCalculationRequest(_message.Message):
    __slots__ = ["block_proposer_matches", "validator_mev_metrics"]
    BLOCK_PROPOSER_MATCHES_FIELD_NUMBER: _ClassVar[int]
    VALIDATOR_MEV_METRICS_FIELD_NUMBER: _ClassVar[int]
    block_proposer_matches: _mev_pb2.ValidatorMevMatches
    validator_mev_metrics: _mev_pb2.MevNodeToNodeMetrics
    def __init__(self, block_proposer_matches: _Optional[_Union[_mev_pb2.ValidatorMevMatches, _Mapping]] = ..., validator_mev_metrics: _Optional[_Union[_mev_pb2.MevNodeToNodeMetrics, _Mapping]] = ...) -> None: ...

class MevNodeToNodeCalculationResponse(_message.Message):
    __slots__ = ["results"]
    class MevAndVolumePerClob(_message.Message):
        __slots__ = ["clob_pair_id", "mev", "volume"]
        CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
        MEV_FIELD_NUMBER: _ClassVar[int]
        VOLUME_FIELD_NUMBER: _ClassVar[int]
        clob_pair_id: int
        mev: float
        volume: int
        def __init__(self, clob_pair_id: _Optional[int] = ..., mev: _Optional[float] = ..., volume: _Optional[int] = ...) -> None: ...
    RESULTS_FIELD_NUMBER: _ClassVar[int]
    results: _containers.RepeatedCompositeFieldContainer[MevNodeToNodeCalculationResponse.MevAndVolumePerClob]
    def __init__(self, results: _Optional[_Iterable[_Union[MevNodeToNodeCalculationResponse.MevAndVolumePerClob, _Mapping]]] = ...) -> None: ...

class QueryAllClobPairRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryBlockRateLimitConfigurationRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryBlockRateLimitConfigurationResponse(_message.Message):
    __slots__ = ["block_rate_limit_config"]
    BLOCK_RATE_LIMIT_CONFIG_FIELD_NUMBER: _ClassVar[int]
    block_rate_limit_config: _block_rate_limit_config_pb2.BlockRateLimitConfiguration
    def __init__(self, block_rate_limit_config: _Optional[_Union[_block_rate_limit_config_pb2.BlockRateLimitConfiguration, _Mapping]] = ...) -> None: ...

class QueryClobPairAllResponse(_message.Message):
    __slots__ = ["clob_pair", "pagination"]
    CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    clob_pair: _containers.RepeatedCompositeFieldContainer[_clob_pair_pb2.ClobPair]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, clob_pair: _Optional[_Iterable[_Union[_clob_pair_pb2.ClobPair, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryClobPairResponse(_message.Message):
    __slots__ = ["clob_pair"]
    CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    clob_pair: _clob_pair_pb2.ClobPair
    def __init__(self, clob_pair: _Optional[_Union[_clob_pair_pb2.ClobPair, _Mapping]] = ...) -> None: ...

class QueryEquityTierLimitConfigurationRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryEquityTierLimitConfigurationResponse(_message.Message):
    __slots__ = ["equity_tier_limit_config"]
    EQUITY_TIER_LIMIT_CONFIG_FIELD_NUMBER: _ClassVar[int]
    equity_tier_limit_config: _equity_tier_limit_config_pb2.EquityTierLimitConfiguration
    def __init__(self, equity_tier_limit_config: _Optional[_Union[_equity_tier_limit_config_pb2.EquityTierLimitConfiguration, _Mapping]] = ...) -> None: ...

class QueryGetClobPairRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryLiquidationsConfigurationRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryLiquidationsConfigurationResponse(_message.Message):
    __slots__ = ["liquidations_config"]
    LIQUIDATIONS_CONFIG_FIELD_NUMBER: _ClassVar[int]
    liquidations_config: _liquidations_config_pb2.LiquidationsConfig
    def __init__(self, liquidations_config: _Optional[_Union[_liquidations_config_pb2.LiquidationsConfig, _Mapping]] = ...) -> None: ...

class QueryNextClobPairIdRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryNextClobPairIdResponse(_message.Message):
    __slots__ = ["next_clob_pair_id"]
    NEXT_CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    next_clob_pair_id: int
    def __init__(self, next_clob_pair_id: _Optional[int] = ...) -> None: ...

class QueryStatefulOrderRequest(_message.Message):
    __slots__ = ["order_id"]
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    order_id: _order_pb2.OrderId
    def __init__(self, order_id: _Optional[_Union[_order_pb2.OrderId, _Mapping]] = ...) -> None: ...

class QueryStatefulOrderResponse(_message.Message):
    __slots__ = ["fill_amount", "order_placement", "triggered"]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    ORDER_PLACEMENT_FIELD_NUMBER: _ClassVar[int]
    TRIGGERED_FIELD_NUMBER: _ClassVar[int]
    fill_amount: int
    order_placement: _order_pb2.LongTermOrderPlacement
    triggered: bool
    def __init__(self, order_placement: _Optional[_Union[_order_pb2.LongTermOrderPlacement, _Mapping]] = ..., fill_amount: _Optional[int] = ..., triggered: bool = ...) -> None: ...

class StreamOrderbookFill(_message.Message):
    __slots__ = ["clob_match", "fill_amounts", "orders"]
    CLOB_MATCH_FIELD_NUMBER: _ClassVar[int]
    FILL_AMOUNTS_FIELD_NUMBER: _ClassVar[int]
    ORDERS_FIELD_NUMBER: _ClassVar[int]
    clob_match: _matches_pb2.ClobMatch
    fill_amounts: _containers.RepeatedScalarFieldContainer[int]
    orders: _containers.RepeatedCompositeFieldContainer[_order_pb2.Order]
    def __init__(self, clob_match: _Optional[_Union[_matches_pb2.ClobMatch, _Mapping]] = ..., orders: _Optional[_Iterable[_Union[_order_pb2.Order, _Mapping]]] = ..., fill_amounts: _Optional[_Iterable[int]] = ...) -> None: ...

class StreamOrderbookUpdate(_message.Message):
    __slots__ = ["snapshot", "updates"]
    SNAPSHOT_FIELD_NUMBER: _ClassVar[int]
    UPDATES_FIELD_NUMBER: _ClassVar[int]
    snapshot: bool
    updates: _containers.RepeatedCompositeFieldContainer[_off_chain_updates_pb2.OffChainUpdateV1]
    def __init__(self, snapshot: bool = ..., updates: _Optional[_Iterable[_Union[_off_chain_updates_pb2.OffChainUpdateV1, _Mapping]]] = ...) -> None: ...

class StreamOrderbookUpdatesRequest(_message.Message):
    __slots__ = ["clob_pair_id", "filter_orders_by_subaccount_id", "market_ids", "subaccount_ids"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    FILTER_ORDERS_BY_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    MARKET_IDS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_IDS_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: _containers.RepeatedScalarFieldContainer[int]
    filter_orders_by_subaccount_id: bool
    market_ids: _containers.RepeatedScalarFieldContainer[int]
    subaccount_ids: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.SubaccountId]
    def __init__(self, clob_pair_id: _Optional[_Iterable[int]] = ..., subaccount_ids: _Optional[_Iterable[_Union[_subaccount_pb2.SubaccountId, _Mapping]]] = ..., market_ids: _Optional[_Iterable[int]] = ..., filter_orders_by_subaccount_id: bool = ...) -> None: ...

class StreamOrderbookUpdatesResponse(_message.Message):
    __slots__ = ["updates"]
    UPDATES_FIELD_NUMBER: _ClassVar[int]
    updates: _containers.RepeatedCompositeFieldContainer[StreamUpdate]
    def __init__(self, updates: _Optional[_Iterable[_Union[StreamUpdate, _Mapping]]] = ...) -> None: ...

class StreamTakerOrder(_message.Message):
    __slots__ = ["liquidation_order", "order", "taker_order_status"]
    LIQUIDATION_ORDER_FIELD_NUMBER: _ClassVar[int]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    TAKER_ORDER_STATUS_FIELD_NUMBER: _ClassVar[int]
    liquidation_order: _order_pb2.StreamLiquidationOrder
    order: _order_pb2.Order
    taker_order_status: StreamTakerOrderStatus
    def __init__(self, order: _Optional[_Union[_order_pb2.Order, _Mapping]] = ..., liquidation_order: _Optional[_Union[_order_pb2.StreamLiquidationOrder, _Mapping]] = ..., taker_order_status: _Optional[_Union[StreamTakerOrderStatus, _Mapping]] = ...) -> None: ...

class StreamTakerOrderStatus(_message.Message):
    __slots__ = ["optimistically_filled_quantums", "order_status", "remaining_quantums"]
    OPTIMISTICALLY_FILLED_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    ORDER_STATUS_FIELD_NUMBER: _ClassVar[int]
    REMAINING_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    optimistically_filled_quantums: int
    order_status: int
    remaining_quantums: int
    def __init__(self, order_status: _Optional[int] = ..., remaining_quantums: _Optional[int] = ..., optimistically_filled_quantums: _Optional[int] = ...) -> None: ...

class StreamUpdate(_message.Message):
    __slots__ = ["block_height", "exec_mode", "order_fill", "orderbook_update", "price_update", "subaccount_update", "taker_order"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    EXEC_MODE_FIELD_NUMBER: _ClassVar[int]
    ORDERBOOK_UPDATE_FIELD_NUMBER: _ClassVar[int]
    ORDER_FILL_FIELD_NUMBER: _ClassVar[int]
    PRICE_UPDATE_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_UPDATE_FIELD_NUMBER: _ClassVar[int]
    TAKER_ORDER_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    exec_mode: int
    order_fill: StreamOrderbookFill
    orderbook_update: StreamOrderbookUpdate
    price_update: _streaming_pb2_1.StreamPriceUpdate
    subaccount_update: _streaming_pb2.StreamSubaccountUpdate
    taker_order: StreamTakerOrder
    def __init__(self, block_height: _Optional[int] = ..., exec_mode: _Optional[int] = ..., orderbook_update: _Optional[_Union[StreamOrderbookUpdate, _Mapping]] = ..., order_fill: _Optional[_Union[StreamOrderbookFill, _Mapping]] = ..., taker_order: _Optional[_Union[StreamTakerOrder, _Mapping]] = ..., subaccount_update: _Optional[_Union[_streaming_pb2.StreamSubaccountUpdate, _Mapping]] = ..., price_update: _Optional[_Union[_streaming_pb2_1.StreamPriceUpdate, _Mapping]] = ...) -> None: ...
