from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class FillablePriceConfig(_message.Message):
    __slots__ = ["bankruptcy_adjustment_ppm", "spread_to_maintenance_margin_ratio_ppm"]
    BANKRUPTCY_ADJUSTMENT_PPM_FIELD_NUMBER: _ClassVar[int]
    SPREAD_TO_MAINTENANCE_MARGIN_RATIO_PPM_FIELD_NUMBER: _ClassVar[int]
    bankruptcy_adjustment_ppm: int
    spread_to_maintenance_margin_ratio_ppm: int
    def __init__(self, bankruptcy_adjustment_ppm: _Optional[int] = ..., spread_to_maintenance_margin_ratio_ppm: _Optional[int] = ...) -> None: ...

class LiquidationsConfig(_message.Message):
    __slots__ = ["fillable_price_config", "max_liquidation_fee_ppm", "position_block_limits", "subaccount_block_limits"]
    FILLABLE_PRICE_CONFIG_FIELD_NUMBER: _ClassVar[int]
    MAX_LIQUIDATION_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    POSITION_BLOCK_LIMITS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_BLOCK_LIMITS_FIELD_NUMBER: _ClassVar[int]
    fillable_price_config: FillablePriceConfig
    max_liquidation_fee_ppm: int
    position_block_limits: PositionBlockLimits
    subaccount_block_limits: SubaccountBlockLimits
    def __init__(self, max_liquidation_fee_ppm: _Optional[int] = ..., position_block_limits: _Optional[_Union[PositionBlockLimits, _Mapping]] = ..., subaccount_block_limits: _Optional[_Union[SubaccountBlockLimits, _Mapping]] = ..., fillable_price_config: _Optional[_Union[FillablePriceConfig, _Mapping]] = ...) -> None: ...

class PositionBlockLimits(_message.Message):
    __slots__ = ["max_position_portion_liquidated_ppm", "min_position_notional_liquidated"]
    MAX_POSITION_PORTION_LIQUIDATED_PPM_FIELD_NUMBER: _ClassVar[int]
    MIN_POSITION_NOTIONAL_LIQUIDATED_FIELD_NUMBER: _ClassVar[int]
    max_position_portion_liquidated_ppm: int
    min_position_notional_liquidated: int
    def __init__(self, min_position_notional_liquidated: _Optional[int] = ..., max_position_portion_liquidated_ppm: _Optional[int] = ...) -> None: ...

class SubaccountBlockLimits(_message.Message):
    __slots__ = ["max_notional_liquidated", "max_quantums_insurance_lost"]
    MAX_NOTIONAL_LIQUIDATED_FIELD_NUMBER: _ClassVar[int]
    MAX_QUANTUMS_INSURANCE_LOST_FIELD_NUMBER: _ClassVar[int]
    max_notional_liquidated: int
    max_quantums_insurance_lost: int
    def __init__(self, max_notional_liquidated: _Optional[int] = ..., max_quantums_insurance_lost: _Optional[int] = ...) -> None: ...
