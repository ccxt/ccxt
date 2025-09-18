from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.vault import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.vault import share_pb2 as _share_pb2
from v4_proto.dydxprotocol.vault import vault_pb2 as _vault_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllVaultsRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllVaultsResponse(_message.Message):
    __slots__ = ["pagination", "vaults"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    VAULTS_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageResponse
    vaults: _containers.RepeatedCompositeFieldContainer[QueryVaultResponse]
    def __init__(self, vaults: _Optional[_Iterable[_Union[QueryVaultResponse, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryMegavaultAllOwnerSharesRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryMegavaultAllOwnerSharesResponse(_message.Message):
    __slots__ = ["owner_shares", "pagination"]
    OWNER_SHARES_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    owner_shares: _containers.RepeatedCompositeFieldContainer[_share_pb2.OwnerShare]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, owner_shares: _Optional[_Iterable[_Union[_share_pb2.OwnerShare, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryMegavaultOwnerSharesRequest(_message.Message):
    __slots__ = ["address"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    address: str
    def __init__(self, address: _Optional[str] = ...) -> None: ...

class QueryMegavaultOwnerSharesResponse(_message.Message):
    __slots__ = ["address", "equity", "share_unlocks", "shares", "withdrawable_equity"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    EQUITY_FIELD_NUMBER: _ClassVar[int]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    SHARE_UNLOCKS_FIELD_NUMBER: _ClassVar[int]
    WITHDRAWABLE_EQUITY_FIELD_NUMBER: _ClassVar[int]
    address: str
    equity: bytes
    share_unlocks: _containers.RepeatedCompositeFieldContainer[_share_pb2.ShareUnlock]
    shares: _share_pb2.NumShares
    withdrawable_equity: bytes
    def __init__(self, address: _Optional[str] = ..., shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ..., share_unlocks: _Optional[_Iterable[_Union[_share_pb2.ShareUnlock, _Mapping]]] = ..., equity: _Optional[bytes] = ..., withdrawable_equity: _Optional[bytes] = ...) -> None: ...

class QueryMegavaultTotalSharesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryMegavaultTotalSharesResponse(_message.Message):
    __slots__ = ["total_shares"]
    TOTAL_SHARES_FIELD_NUMBER: _ClassVar[int]
    total_shares: _share_pb2.NumShares
    def __init__(self, total_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ...) -> None: ...

class QueryMegavaultWithdrawalInfoRequest(_message.Message):
    __slots__ = ["shares_to_withdraw"]
    SHARES_TO_WITHDRAW_FIELD_NUMBER: _ClassVar[int]
    shares_to_withdraw: _share_pb2.NumShares
    def __init__(self, shares_to_withdraw: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ...) -> None: ...

class QueryMegavaultWithdrawalInfoResponse(_message.Message):
    __slots__ = ["expected_quote_quantums", "megavault_equity", "shares_to_withdraw", "total_shares"]
    EXPECTED_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    MEGAVAULT_EQUITY_FIELD_NUMBER: _ClassVar[int]
    SHARES_TO_WITHDRAW_FIELD_NUMBER: _ClassVar[int]
    TOTAL_SHARES_FIELD_NUMBER: _ClassVar[int]
    expected_quote_quantums: bytes
    megavault_equity: bytes
    shares_to_withdraw: _share_pb2.NumShares
    total_shares: _share_pb2.NumShares
    def __init__(self, shares_to_withdraw: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ..., expected_quote_quantums: _Optional[bytes] = ..., megavault_equity: _Optional[bytes] = ..., total_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ...) -> None: ...

class QueryParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryParamsResponse(_message.Message):
    __slots__ = ["default_quoting_params", "operator_params"]
    DEFAULT_QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    OPERATOR_PARAMS_FIELD_NUMBER: _ClassVar[int]
    default_quoting_params: _params_pb2.QuotingParams
    operator_params: _params_pb2.OperatorParams
    def __init__(self, default_quoting_params: _Optional[_Union[_params_pb2.QuotingParams, _Mapping]] = ..., operator_params: _Optional[_Union[_params_pb2.OperatorParams, _Mapping]] = ...) -> None: ...

class QueryVaultParamsRequest(_message.Message):
    __slots__ = ["number", "type"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    number: int
    type: _vault_pb2.VaultType
    def __init__(self, type: _Optional[_Union[_vault_pb2.VaultType, str]] = ..., number: _Optional[int] = ...) -> None: ...

class QueryVaultParamsResponse(_message.Message):
    __slots__ = ["vault_id", "vault_params"]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    vault_id: _vault_pb2.VaultId
    vault_params: _params_pb2.VaultParams
    def __init__(self, vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., vault_params: _Optional[_Union[_params_pb2.VaultParams, _Mapping]] = ...) -> None: ...

class QueryVaultRequest(_message.Message):
    __slots__ = ["number", "type"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    number: int
    type: _vault_pb2.VaultType
    def __init__(self, type: _Optional[_Union[_vault_pb2.VaultType, str]] = ..., number: _Optional[int] = ...) -> None: ...

class QueryVaultResponse(_message.Message):
    __slots__ = ["equity", "inventory", "most_recent_client_ids", "subaccount_id", "vault_id", "vault_params"]
    EQUITY_FIELD_NUMBER: _ClassVar[int]
    INVENTORY_FIELD_NUMBER: _ClassVar[int]
    MOST_RECENT_CLIENT_IDS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    equity: bytes
    inventory: bytes
    most_recent_client_ids: _containers.RepeatedScalarFieldContainer[int]
    subaccount_id: _subaccount_pb2.SubaccountId
    vault_id: _vault_pb2.VaultId
    vault_params: _params_pb2.VaultParams
    def __init__(self, vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., equity: _Optional[bytes] = ..., inventory: _Optional[bytes] = ..., vault_params: _Optional[_Union[_params_pb2.VaultParams, _Mapping]] = ..., most_recent_client_ids: _Optional[_Iterable[int]] = ...) -> None: ...
