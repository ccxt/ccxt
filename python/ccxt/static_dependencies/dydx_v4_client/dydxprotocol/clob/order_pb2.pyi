from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.clob import liquidations_pb2 as _liquidations_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BuilderCodeParameters(_message.Message):
    __slots__ = ["builder_address", "fee_ppm"]
    BUILDER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    builder_address: str
    fee_ppm: int
    def __init__(self, builder_address: _Optional[str] = ..., fee_ppm: _Optional[int] = ...) -> None: ...

class ConditionalOrderPlacement(_message.Message):
    __slots__ = ["order", "placement_index", "trigger_index"]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    PLACEMENT_INDEX_FIELD_NUMBER: _ClassVar[int]
    TRIGGER_INDEX_FIELD_NUMBER: _ClassVar[int]
    order: Order
    placement_index: TransactionOrdering
    trigger_index: TransactionOrdering
    def __init__(self, order: _Optional[_Union[Order, _Mapping]] = ..., placement_index: _Optional[_Union[TransactionOrdering, _Mapping]] = ..., trigger_index: _Optional[_Union[TransactionOrdering, _Mapping]] = ...) -> None: ...

class LongTermOrderPlacement(_message.Message):
    __slots__ = ["order", "placement_index"]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    PLACEMENT_INDEX_FIELD_NUMBER: _ClassVar[int]
    order: Order
    placement_index: TransactionOrdering
    def __init__(self, order: _Optional[_Union[Order, _Mapping]] = ..., placement_index: _Optional[_Union[TransactionOrdering, _Mapping]] = ...) -> None: ...

class Order(_message.Message):
    __slots__ = ["builder_code_parameters", "client_metadata", "condition_type", "conditional_order_trigger_subticks", "good_til_block", "good_til_block_time", "order_id", "order_router_address", "quantums", "reduce_only", "side", "subticks", "time_in_force", "twap_parameters"]
    class ConditionType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    class Side(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    class TimeInForce(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    BUILDER_CODE_PARAMETERS_FIELD_NUMBER: _ClassVar[int]
    CLIENT_METADATA_FIELD_NUMBER: _ClassVar[int]
    CONDITIONAL_ORDER_TRIGGER_SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    CONDITION_TYPE_FIELD_NUMBER: _ClassVar[int]
    CONDITION_TYPE_STOP_LOSS: Order.ConditionType
    CONDITION_TYPE_TAKE_PROFIT: Order.ConditionType
    CONDITION_TYPE_UNSPECIFIED: Order.ConditionType
    GOOD_TIL_BLOCK_FIELD_NUMBER: _ClassVar[int]
    GOOD_TIL_BLOCK_TIME_FIELD_NUMBER: _ClassVar[int]
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_ROUTER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    REDUCE_ONLY_FIELD_NUMBER: _ClassVar[int]
    SIDE_BUY: Order.Side
    SIDE_FIELD_NUMBER: _ClassVar[int]
    SIDE_SELL: Order.Side
    SIDE_UNSPECIFIED: Order.Side
    SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    TIME_IN_FORCE_FIELD_NUMBER: _ClassVar[int]
    TIME_IN_FORCE_FILL_OR_KILL: Order.TimeInForce
    TIME_IN_FORCE_IOC: Order.TimeInForce
    TIME_IN_FORCE_POST_ONLY: Order.TimeInForce
    TIME_IN_FORCE_UNSPECIFIED: Order.TimeInForce
    TWAP_PARAMETERS_FIELD_NUMBER: _ClassVar[int]
    builder_code_parameters: BuilderCodeParameters
    client_metadata: int
    condition_type: Order.ConditionType
    conditional_order_trigger_subticks: int
    good_til_block: int
    good_til_block_time: int
    order_id: OrderId
    order_router_address: str
    quantums: int
    reduce_only: bool
    side: Order.Side
    subticks: int
    time_in_force: Order.TimeInForce
    twap_parameters: TwapParameters
    def __init__(self, order_id: _Optional[_Union[OrderId, _Mapping]] = ..., side: _Optional[_Union[Order.Side, str]] = ..., quantums: _Optional[int] = ..., subticks: _Optional[int] = ..., good_til_block: _Optional[int] = ..., good_til_block_time: _Optional[int] = ..., time_in_force: _Optional[_Union[Order.TimeInForce, str]] = ..., reduce_only: bool = ..., client_metadata: _Optional[int] = ..., condition_type: _Optional[_Union[Order.ConditionType, str]] = ..., conditional_order_trigger_subticks: _Optional[int] = ..., twap_parameters: _Optional[_Union[TwapParameters, _Mapping]] = ..., builder_code_parameters: _Optional[_Union[BuilderCodeParameters, _Mapping]] = ..., order_router_address: _Optional[str] = ...) -> None: ...

class OrderFillState(_message.Message):
    __slots__ = ["fill_amount", "prunable_block_height"]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    PRUNABLE_BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    fill_amount: int
    prunable_block_height: int
    def __init__(self, fill_amount: _Optional[int] = ..., prunable_block_height: _Optional[int] = ...) -> None: ...

class OrderId(_message.Message):
    __slots__ = ["client_id", "clob_pair_id", "order_flags", "subaccount_id"]
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_FLAGS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    client_id: int
    clob_pair_id: int
    order_flags: int
    subaccount_id: _subaccount_pb2.SubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., client_id: _Optional[int] = ..., order_flags: _Optional[int] = ..., clob_pair_id: _Optional[int] = ...) -> None: ...

class OrdersFilledDuringLatestBlock(_message.Message):
    __slots__ = ["order_ids"]
    ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    order_ids: _containers.RepeatedCompositeFieldContainer[OrderId]
    def __init__(self, order_ids: _Optional[_Iterable[_Union[OrderId, _Mapping]]] = ...) -> None: ...

class PotentiallyPrunableOrders(_message.Message):
    __slots__ = ["order_ids"]
    ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    order_ids: _containers.RepeatedCompositeFieldContainer[OrderId]
    def __init__(self, order_ids: _Optional[_Iterable[_Union[OrderId, _Mapping]]] = ...) -> None: ...

class StatefulOrderTimeSliceValue(_message.Message):
    __slots__ = ["order_ids"]
    ORDER_IDS_FIELD_NUMBER: _ClassVar[int]
    order_ids: _containers.RepeatedCompositeFieldContainer[OrderId]
    def __init__(self, order_ids: _Optional[_Iterable[_Union[OrderId, _Mapping]]] = ...) -> None: ...

class StreamLiquidationOrder(_message.Message):
    __slots__ = ["clob_pair_id", "is_buy", "liquidation_info", "quantums", "subticks"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    IS_BUY_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATION_INFO_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: int
    is_buy: bool
    liquidation_info: _liquidations_pb2.PerpetualLiquidationInfo
    quantums: int
    subticks: int
    def __init__(self, liquidation_info: _Optional[_Union[_liquidations_pb2.PerpetualLiquidationInfo, _Mapping]] = ..., clob_pair_id: _Optional[int] = ..., is_buy: bool = ..., quantums: _Optional[int] = ..., subticks: _Optional[int] = ...) -> None: ...

class TransactionOrdering(_message.Message):
    __slots__ = ["block_height", "transaction_index"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    TRANSACTION_INDEX_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    transaction_index: int
    def __init__(self, block_height: _Optional[int] = ..., transaction_index: _Optional[int] = ...) -> None: ...

class TwapOrderPlacement(_message.Message):
    __slots__ = ["order", "remaining_legs", "remaining_quantums"]
    ORDER_FIELD_NUMBER: _ClassVar[int]
    REMAINING_LEGS_FIELD_NUMBER: _ClassVar[int]
    REMAINING_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    order: Order
    remaining_legs: int
    remaining_quantums: int
    def __init__(self, order: _Optional[_Union[Order, _Mapping]] = ..., remaining_legs: _Optional[int] = ..., remaining_quantums: _Optional[int] = ...) -> None: ...

class TwapParameters(_message.Message):
    __slots__ = ["duration", "interval", "price_tolerance"]
    DURATION_FIELD_NUMBER: _ClassVar[int]
    INTERVAL_FIELD_NUMBER: _ClassVar[int]
    PRICE_TOLERANCE_FIELD_NUMBER: _ClassVar[int]
    duration: int
    interval: int
    price_tolerance: int
    def __init__(self, duration: _Optional[int] = ..., interval: _Optional[int] = ..., price_tolerance: _Optional[int] = ...) -> None: ...
