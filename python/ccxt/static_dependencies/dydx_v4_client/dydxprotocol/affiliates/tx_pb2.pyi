from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.affiliates import affiliates_pb2 as _affiliates_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgRegisterAffiliate(_message.Message):
    __slots__ = ["affiliate", "referee"]
    AFFILIATE_FIELD_NUMBER: _ClassVar[int]
    REFEREE_FIELD_NUMBER: _ClassVar[int]
    affiliate: str
    referee: str
    def __init__(self, referee: _Optional[str] = ..., affiliate: _Optional[str] = ...) -> None: ...

class MsgRegisterAffiliateResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateAffiliateTiers(_message.Message):
    __slots__ = ["authority", "tiers"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    TIERS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    tiers: _affiliates_pb2.AffiliateTiers
    def __init__(self, authority: _Optional[str] = ..., tiers: _Optional[_Union[_affiliates_pb2.AffiliateTiers, _Mapping]] = ...) -> None: ...

class MsgUpdateAffiliateTiersResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateAffiliateWhitelist(_message.Message):
    __slots__ = ["authority", "whitelist"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    WHITELIST_FIELD_NUMBER: _ClassVar[int]
    authority: str
    whitelist: _affiliates_pb2.AffiliateWhitelist
    def __init__(self, authority: _Optional[str] = ..., whitelist: _Optional[_Union[_affiliates_pb2.AffiliateWhitelist, _Mapping]] = ...) -> None: ...

class MsgUpdateAffiliateWhitelistResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
