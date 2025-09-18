from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AffiliateTiers(_message.Message):
    __slots__ = ["tiers"]
    class Tier(_message.Message):
        __slots__ = ["req_referred_volume_quote_quantums", "req_staked_whole_coins", "taker_fee_share_ppm"]
        REQ_REFERRED_VOLUME_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
        REQ_STAKED_WHOLE_COINS_FIELD_NUMBER: _ClassVar[int]
        TAKER_FEE_SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
        req_referred_volume_quote_quantums: int
        req_staked_whole_coins: int
        taker_fee_share_ppm: int
        def __init__(self, req_referred_volume_quote_quantums: _Optional[int] = ..., req_staked_whole_coins: _Optional[int] = ..., taker_fee_share_ppm: _Optional[int] = ...) -> None: ...
    TIERS_FIELD_NUMBER: _ClassVar[int]
    tiers: _containers.RepeatedCompositeFieldContainer[AffiliateTiers.Tier]
    def __init__(self, tiers: _Optional[_Iterable[_Union[AffiliateTiers.Tier, _Mapping]]] = ...) -> None: ...

class AffiliateWhitelist(_message.Message):
    __slots__ = ["tiers"]
    class Tier(_message.Message):
        __slots__ = ["addresses", "taker_fee_share_ppm"]
        ADDRESSES_FIELD_NUMBER: _ClassVar[int]
        TAKER_FEE_SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
        addresses: _containers.RepeatedScalarFieldContainer[str]
        taker_fee_share_ppm: int
        def __init__(self, addresses: _Optional[_Iterable[str]] = ..., taker_fee_share_ppm: _Optional[int] = ...) -> None: ...
    TIERS_FIELD_NUMBER: _ClassVar[int]
    tiers: _containers.RepeatedCompositeFieldContainer[AffiliateWhitelist.Tier]
    def __init__(self, tiers: _Optional[_Iterable[_Union[AffiliateWhitelist.Tier, _Mapping]]] = ...) -> None: ...
