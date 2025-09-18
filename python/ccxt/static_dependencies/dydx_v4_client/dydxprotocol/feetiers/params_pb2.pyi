from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class PerpetualFeeParams(_message.Message):
    __slots__ = ["tiers"]
    TIERS_FIELD_NUMBER: _ClassVar[int]
    tiers: _containers.RepeatedCompositeFieldContainer[PerpetualFeeTier]
    def __init__(self, tiers: _Optional[_Iterable[_Union[PerpetualFeeTier, _Mapping]]] = ...) -> None: ...

class PerpetualFeeTier(_message.Message):
    __slots__ = ["absolute_volume_requirement", "maker_fee_ppm", "maker_volume_share_requirement_ppm", "name", "taker_fee_ppm", "total_volume_share_requirement_ppm"]
    ABSOLUTE_VOLUME_REQUIREMENT_FIELD_NUMBER: _ClassVar[int]
    MAKER_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    MAKER_VOLUME_SHARE_REQUIREMENT_PPM_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    TAKER_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    TOTAL_VOLUME_SHARE_REQUIREMENT_PPM_FIELD_NUMBER: _ClassVar[int]
    absolute_volume_requirement: int
    maker_fee_ppm: int
    maker_volume_share_requirement_ppm: int
    name: str
    taker_fee_ppm: int
    total_volume_share_requirement_ppm: int
    def __init__(self, name: _Optional[str] = ..., absolute_volume_requirement: _Optional[int] = ..., total_volume_share_requirement_ppm: _Optional[int] = ..., maker_volume_share_requirement_ppm: _Optional[int] = ..., maker_fee_ppm: _Optional[int] = ..., taker_fee_ppm: _Optional[int] = ...) -> None: ...
