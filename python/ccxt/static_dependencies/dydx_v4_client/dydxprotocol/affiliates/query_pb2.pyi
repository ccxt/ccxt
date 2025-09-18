from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.affiliates import affiliates_pb2 as _affiliates_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AffiliateInfoRequest(_message.Message):
    __slots__ = ["address"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    address: str
    def __init__(self, address: _Optional[str] = ...) -> None: ...

class AffiliateInfoResponse(_message.Message):
    __slots__ = ["fee_share_ppm", "is_whitelisted", "referred_volume", "staked_amount", "tier"]
    FEE_SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
    IS_WHITELISTED_FIELD_NUMBER: _ClassVar[int]
    REFERRED_VOLUME_FIELD_NUMBER: _ClassVar[int]
    STAKED_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    TIER_FIELD_NUMBER: _ClassVar[int]
    fee_share_ppm: int
    is_whitelisted: bool
    referred_volume: bytes
    staked_amount: bytes
    tier: int
    def __init__(self, is_whitelisted: bool = ..., tier: _Optional[int] = ..., fee_share_ppm: _Optional[int] = ..., referred_volume: _Optional[bytes] = ..., staked_amount: _Optional[bytes] = ...) -> None: ...

class AffiliateWhitelistRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class AffiliateWhitelistResponse(_message.Message):
    __slots__ = ["whitelist"]
    WHITELIST_FIELD_NUMBER: _ClassVar[int]
    whitelist: _affiliates_pb2.AffiliateWhitelist
    def __init__(self, whitelist: _Optional[_Union[_affiliates_pb2.AffiliateWhitelist, _Mapping]] = ...) -> None: ...

class AllAffiliateTiersRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class AllAffiliateTiersResponse(_message.Message):
    __slots__ = ["tiers"]
    TIERS_FIELD_NUMBER: _ClassVar[int]
    tiers: _affiliates_pb2.AffiliateTiers
    def __init__(self, tiers: _Optional[_Union[_affiliates_pb2.AffiliateTiers, _Mapping]] = ...) -> None: ...

class ReferredByRequest(_message.Message):
    __slots__ = ["address"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    address: str
    def __init__(self, address: _Optional[str] = ...) -> None: ...

class ReferredByResponse(_message.Message):
    __slots__ = ["affiliate_address"]
    AFFILIATE_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    affiliate_address: str
    def __init__(self, affiliate_address: _Optional[str] = ...) -> None: ...
