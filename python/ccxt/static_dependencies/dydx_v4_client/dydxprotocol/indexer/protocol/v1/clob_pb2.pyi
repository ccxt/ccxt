from v4_proto.dydxprotocol.indexer.protocol.v1 import subaccount_pb2 as _subaccount_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

CLOB_PAIR_STATUS_ACTIVE: ClobPairStatus
CLOB_PAIR_STATUS_CANCEL_ONLY: ClobPairStatus
CLOB_PAIR_STATUS_FINAL_SETTLEMENT: ClobPairStatus
CLOB_PAIR_STATUS_INITIALIZING: ClobPairStatus
CLOB_PAIR_STATUS_PAUSED: ClobPairStatus
CLOB_PAIR_STATUS_POST_ONLY: ClobPairStatus
CLOB_PAIR_STATUS_UNSPECIFIED: ClobPairStatus
DESCRIPTOR: _descriptor.FileDescriptor

class BuilderCodeParameters(_message.Message):
    __slots__ = ["builder_address", "fee_ppm"]
    BUILDER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    builder_address: str
    fee_ppm: int
    def __init__(self, builder_address: _Optional[str] = ..., fee_ppm: _Optional[int] = ...) -> None: ...

class IndexerOrder(_message.Message):
    __slots__ = ["builder_code_params", "client_metadata", "condition_type", "conditional_order_trigger_subticks", "good_til_block", "good_til_block_time", "order_id", "order_router_address", "quantums", "reduce_only", "side", "subticks", "time_in_force", "twap_parameters"]
    class ConditionType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    class Side(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    class TimeInForce(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    BUILDER_CODE_PARAMS_FIELD_NUMBER: _ClassVar[int]
    CLIENT_METADATA_FIELD_NUMBER: _ClassVar[int]
    CONDITIONAL_ORDER_TRIGGER_SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    CONDITION_TYPE_FIELD_NUMBER: _ClassVar[int]
    CONDITION_TYPE_STOP_LOSS: IndexerOrder.ConditionType
    CONDITION_TYPE_TAKE_PROFIT: IndexerOrder.ConditionType
    CONDITION_TYPE_UNSPECIFIED: IndexerOrder.ConditionType
    GOOD_TIL_BLOCK_FIELD_NUMBER: _ClassVar[int]
    GOOD_TIL_BLOCK_TIME_FIELD_NUMBER: _ClassVar[int]
    ORDER_ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_ROUTER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    REDUCE_ONLY_FIELD_NUMBER: _ClassVar[int]
    SIDE_BUY: IndexerOrder.Side
    SIDE_FIELD_NUMBER: _ClassVar[int]
    SIDE_SELL: IndexerOrder.Side
    SIDE_UNSPECIFIED: IndexerOrder.Side
    SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    TIME_IN_FORCE_FIELD_NUMBER: _ClassVar[int]
    TIME_IN_FORCE_FILL_OR_KILL: IndexerOrder.TimeInForce
    TIME_IN_FORCE_IOC: IndexerOrder.TimeInForce
    TIME_IN_FORCE_POST_ONLY: IndexerOrder.TimeInForce
    TIME_IN_FORCE_UNSPECIFIED: IndexerOrder.TimeInForce
    TWAP_PARAMETERS_FIELD_NUMBER: _ClassVar[int]
    builder_code_params: BuilderCodeParameters
    client_metadata: int
    condition_type: IndexerOrder.ConditionType
    conditional_order_trigger_subticks: int
    good_til_block: int
    good_til_block_time: int
    order_id: IndexerOrderId
    order_router_address: str
    quantums: int
    reduce_only: bool
    side: IndexerOrder.Side
    subticks: int
    time_in_force: IndexerOrder.TimeInForce
    twap_parameters: TwapParameters
    def __init__(self, order_id: _Optional[_Union[IndexerOrderId, _Mapping]] = ..., side: _Optional[_Union[IndexerOrder.Side, str]] = ..., quantums: _Optional[int] = ..., subticks: _Optional[int] = ..., good_til_block: _Optional[int] = ..., good_til_block_time: _Optional[int] = ..., time_in_force: _Optional[_Union[IndexerOrder.TimeInForce, str]] = ..., reduce_only: bool = ..., client_metadata: _Optional[int] = ..., condition_type: _Optional[_Union[IndexerOrder.ConditionType, str]] = ..., conditional_order_trigger_subticks: _Optional[int] = ..., builder_code_params: _Optional[_Union[BuilderCodeParameters, _Mapping]] = ..., order_router_address: _Optional[str] = ..., twap_parameters: _Optional[_Union[TwapParameters, _Mapping]] = ...) -> None: ...

class IndexerOrderId(_message.Message):
    __slots__ = ["client_id", "clob_pair_id", "order_flags", "subaccount_id"]
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    ORDER_FLAGS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    client_id: int
    clob_pair_id: int
    order_flags: int
    subaccount_id: _subaccount_pb2.IndexerSubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., client_id: _Optional[int] = ..., order_flags: _Optional[int] = ..., clob_pair_id: _Optional[int] = ...) -> None: ...

class TwapParameters(_message.Message):
    __slots__ = ["duration", "interval", "price_tolerance"]
    DURATION_FIELD_NUMBER: _ClassVar[int]
    INTERVAL_FIELD_NUMBER: _ClassVar[int]
    PRICE_TOLERANCE_FIELD_NUMBER: _ClassVar[int]
    duration: int
    interval: int
    price_tolerance: int
    def __init__(self, duration: _Optional[int] = ..., interval: _Optional[int] = ..., price_tolerance: _Optional[int] = ...) -> None: ...

class ClobPairStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
