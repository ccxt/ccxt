from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.affiliates import affiliates_pb2 as _affiliates_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["affiliate_tiers"]
    AFFILIATE_TIERS_FIELD_NUMBER: _ClassVar[int]
    affiliate_tiers: _affiliates_pb2.AffiliateTiers
    def __init__(self, affiliate_tiers: _Optional[_Union[_affiliates_pb2.AffiliateTiers, _Mapping]] = ...) -> None: ...
