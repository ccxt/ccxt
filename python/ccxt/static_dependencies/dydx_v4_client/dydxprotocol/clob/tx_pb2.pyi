from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.clob import block_rate_limit_config_pb2 as _block_rate_limit_config_pb2
from v4_proto.dydxprotocol.clob import clob_pair_pb2 as _clob_pair_pb2
from v4_proto.dydxprotocol.clob import equity_tier_limit_config_pb2 as _equity_tier_limit_config_pb2
from v4_proto.dydxprotocol.clob import matches_pb2 as _matches_pb2
from v4_proto.dydxprotocol.clob import order_pb2 as _order_pb2
from v4_proto.dydxprotocol.clob import order_removals_pb2 as _order_removals_pb2
from v4_proto.dydxprotocol.clob import liquidations_config_pb2 as _liquidations_config_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgBatchCancel(_message.Message):
    __slots__ = ["good_til_block", "short_term_cancels", "subaccount_id"]
    GOOD_TIL_BLOCK_FIELD_NUMBER: _ClassVar[int]
    SHORT_TERM_CANCELS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    good_til_block: int
    short_term_cancels: _containers.RepeatedCompositeFieldContainer[OrderBatch]
    subaccount_id: _subaccount_pb2.SubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., short_term_cancels: _Optional[_Iterable[_Union[OrderBatch, _Mapping]]] = ..., good_til_block: _Optional[int] = ...) -> None: ...

class MsgBatchCancelResponse(_message.Message):
    __slots__ = ["short_term_failed", "short_term_succeeded"]
    SHORT_TERM_FAILED_FIELD_NUMBER: _ClassVar[int]
    SHORT_TERM_SUCCEEDED_FIELD_NUMBER: _ClassVar[int]
    short_term_failed: _containers.RepeatedCompositeFieldContainer[OrderBatch]
    short_term_succeeded: _containers.RepeatedCompositeFieldContainer[OrderBatch]
    def __init__(self, short_term_succeeded: _Optional[_Iterable[_Union[OrderBatch, _Mapping]]] = ..., short_term_failed: _Optional[_Iterable[_Union[OrderBatch, _Mapping]]] = ...) -> None: ...

class MsgCancelOrder(_message.Message):
    __slots__ = ["good_til_block", "good_til_block_time", "order_id"]
    GOOD_TIL_BLOCK_FIELD_NUMBER: _ClassVar[int]
    GOOD_TIL_BLOCK_TIME_FIELD_NUMBER: _ClassVar[int]
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    good_til_block: int
    good_til_block_time: int
    order_id: _order_pb2.OrderId
    def __init__(self, order_id: _Optional[_Union[_order_pb2.OrderId, _Mapping]] = ..., good_til_block: _Optional[int] = ..., good_til_block_time: _Optional[int] = ...) -> None: ...

class MsgCancelOrderResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgCreateClobPair(_message.Message):
    __slots__ = ["authority", "clob_pair"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    authority: str
    clob_pair: _clob_pair_pb2.ClobPair
    def __init__(self, authority: _Optional[str] = ..., clob_pair: _Optional[_Union[_clob_pair_pb2.ClobPair, _Mapping]] = ...) -> None: ...

class MsgCreateClobPairResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgPlaceOrder(_message.Message):
    __slots__ = ["order"]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    order: _order_pb2.Order
    def __init__(self, order: _Optional[_Union[_order_pb2.Order, _Mapping]] = ...) -> None: ...

class MsgPlaceOrderResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgProposedOperations(_message.Message):
    __slots__ = ["operations_queue"]
    OPERATIONS_QUEUE_FIELD_NUMBER: _ClassVar[int]
    operations_queue: _containers.RepeatedCompositeFieldContainer[OperationRaw]
    def __init__(self, operations_queue: _Optional[_Iterable[_Union[OperationRaw, _Mapping]]] = ...) -> None: ...

class MsgProposedOperationsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateBlockRateLimitConfiguration(_message.Message):
    __slots__ = ["authority", "block_rate_limit_config"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    BLOCK_RATE_LIMIT_CONFIG_FIELD_NUMBER: _ClassVar[int]
    authority: str
    block_rate_limit_config: _block_rate_limit_config_pb2.BlockRateLimitConfiguration
    def __init__(self, authority: _Optional[str] = ..., block_rate_limit_config: _Optional[_Union[_block_rate_limit_config_pb2.BlockRateLimitConfiguration, _Mapping]] = ...) -> None: ...

class MsgUpdateBlockRateLimitConfigurationResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateClobPair(_message.Message):
    __slots__ = ["authority", "clob_pair"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    authority: str
    clob_pair: _clob_pair_pb2.ClobPair
    def __init__(self, authority: _Optional[str] = ..., clob_pair: _Optional[_Union[_clob_pair_pb2.ClobPair, _Mapping]] = ...) -> None: ...

class MsgUpdateClobPairResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateEquityTierLimitConfiguration(_message.Message):
    __slots__ = ["authority", "equity_tier_limit_config"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    EQUITY_TIER_LIMIT_CONFIG_FIELD_NUMBER: _ClassVar[int]
    authority: str
    equity_tier_limit_config: _equity_tier_limit_config_pb2.EquityTierLimitConfiguration
    def __init__(self, authority: _Optional[str] = ..., equity_tier_limit_config: _Optional[_Union[_equity_tier_limit_config_pb2.EquityTierLimitConfiguration, _Mapping]] = ...) -> None: ...

class MsgUpdateEquityTierLimitConfigurationResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateLiquidationsConfig(_message.Message):
    __slots__ = ["authority", "liquidations_config"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATIONS_CONFIG_FIELD_NUMBER: _ClassVar[int]
    authority: str
    liquidations_config: _liquidations_config_pb2.LiquidationsConfig
    def __init__(self, authority: _Optional[str] = ..., liquidations_config: _Optional[_Union[_liquidations_config_pb2.LiquidationsConfig, _Mapping]] = ...) -> None: ...

class MsgUpdateLiquidationsConfigResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class OperationRaw(_message.Message):
    __slots__ = ["match", "order_removal", "short_term_order_placement"]
    MATCH_FIELD_NUMBER: _ClassVar[int]
    ORDER_REMOVAL_FIELD_NUMBER: _ClassVar[int]
    SHORT_TERM_ORDER_PLACEMENT_FIELD_NUMBER: _ClassVar[int]
    match: _matches_pb2.ClobMatch
    order_removal: _order_removals_pb2.OrderRemoval
    short_term_order_placement: bytes
    def __init__(self, match: _Optional[_Union[_matches_pb2.ClobMatch, _Mapping]] = ..., short_term_order_placement: _Optional[bytes] = ..., order_removal: _Optional[_Union[_order_removals_pb2.OrderRemoval, _Mapping]] = ...) -> None: ...

class OrderBatch(_message.Message):
    __slots__ = ["client_ids", "clob_pair_id"]
    CLIENT_IDS_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    client_ids: _containers.RepeatedScalarFieldContainer[int]
    clob_pair_id: int
    def __init__(self, clob_pair_id: _Optional[int] = ..., client_ids: _Optional[_Iterable[int]] = ...) -> None: ...
