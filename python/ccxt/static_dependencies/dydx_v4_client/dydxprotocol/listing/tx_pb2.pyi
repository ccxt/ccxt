from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.listing import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgCreateMarketPermissionless(_message.Message):
    __slots__ = ["subaccount_id", "ticker"]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    TICKER_FIELD_NUMBER: _ClassVar[int]
    subaccount_id: _subaccount_pb2.SubaccountId
    ticker: str
    def __init__(self, ticker: _Optional[str] = ..., subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ...) -> None: ...

class MsgCreateMarketPermissionlessResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetListingVaultDepositParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.ListingVaultDepositParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.ListingVaultDepositParams, _Mapping]] = ...) -> None: ...

class MsgSetListingVaultDepositParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetMarketsHardCap(_message.Message):
    __slots__ = ["authority", "hard_cap_for_markets"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    HARD_CAP_FOR_MARKETS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    hard_cap_for_markets: int
    def __init__(self, authority: _Optional[str] = ..., hard_cap_for_markets: _Optional[int] = ...) -> None: ...

class MsgSetMarketsHardCapResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpgradeIsolatedPerpetualToCross(_message.Message):
    __slots__ = ["authority", "perpetual_id"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    authority: str
    perpetual_id: int
    def __init__(self, authority: _Optional[str] = ..., perpetual_id: _Optional[int] = ...) -> None: ...

class MsgUpgradeIsolatedPerpetualToCrossResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
