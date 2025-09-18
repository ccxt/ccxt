from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.listing import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["hard_cap_for_markets", "listing_vault_deposit_params"]
    HARD_CAP_FOR_MARKETS_FIELD_NUMBER: _ClassVar[int]
    LISTING_VAULT_DEPOSIT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    hard_cap_for_markets: int
    listing_vault_deposit_params: _params_pb2.ListingVaultDepositParams
    def __init__(self, hard_cap_for_markets: _Optional[int] = ..., listing_vault_deposit_params: _Optional[_Union[_params_pb2.ListingVaultDepositParams, _Mapping]] = ...) -> None: ...
