from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.vault import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.vault import share_pb2 as _share_pb2
from v4_proto.dydxprotocol.vault import vault_pb2 as _vault_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["all_owner_share_unlocks", "default_quoting_params", "operator_params", "owner_shares", "total_shares", "vaults"]
    ALL_OWNER_SHARE_UNLOCKS_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    OPERATOR_PARAMS_FIELD_NUMBER: _ClassVar[int]
    OWNER_SHARES_FIELD_NUMBER: _ClassVar[int]
    TOTAL_SHARES_FIELD_NUMBER: _ClassVar[int]
    VAULTS_FIELD_NUMBER: _ClassVar[int]
    all_owner_share_unlocks: _containers.RepeatedCompositeFieldContainer[_share_pb2.OwnerShareUnlocks]
    default_quoting_params: _params_pb2.QuotingParams
    operator_params: _params_pb2.OperatorParams
    owner_shares: _containers.RepeatedCompositeFieldContainer[_share_pb2.OwnerShare]
    total_shares: _share_pb2.NumShares
    vaults: _containers.RepeatedCompositeFieldContainer[Vault]
    def __init__(self, total_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ..., owner_shares: _Optional[_Iterable[_Union[_share_pb2.OwnerShare, _Mapping]]] = ..., vaults: _Optional[_Iterable[_Union[Vault, _Mapping]]] = ..., default_quoting_params: _Optional[_Union[_params_pb2.QuotingParams, _Mapping]] = ..., all_owner_share_unlocks: _Optional[_Iterable[_Union[_share_pb2.OwnerShareUnlocks, _Mapping]]] = ..., operator_params: _Optional[_Union[_params_pb2.OperatorParams, _Mapping]] = ...) -> None: ...

class GenesisStateV6(_message.Message):
    __slots__ = ["default_quoting_params", "vaults"]
    DEFAULT_QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    VAULTS_FIELD_NUMBER: _ClassVar[int]
    default_quoting_params: _params_pb2.QuotingParams
    vaults: _containers.RepeatedCompositeFieldContainer[Vault]
    def __init__(self, vaults: _Optional[_Iterable[_Union[Vault, _Mapping]]] = ..., default_quoting_params: _Optional[_Union[_params_pb2.QuotingParams, _Mapping]] = ...) -> None: ...

class Vault(_message.Message):
    __slots__ = ["most_recent_client_ids", "vault_id", "vault_params"]
    MOST_RECENT_CLIENT_IDS_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    most_recent_client_ids: _containers.RepeatedScalarFieldContainer[int]
    vault_id: _vault_pb2.VaultId
    vault_params: _params_pb2.VaultParams
    def __init__(self, vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., vault_params: _Optional[_Union[_params_pb2.VaultParams, _Mapping]] = ..., most_recent_client_ids: _Optional[_Iterable[int]] = ...) -> None: ...

class VaultV6(_message.Message):
    __slots__ = ["most_recent_client_ids", "owner_shares", "total_shares", "vault_id", "vault_params"]
    MOST_RECENT_CLIENT_IDS_FIELD_NUMBER: _ClassVar[int]
    OWNER_SHARES_FIELD_NUMBER: _ClassVar[int]
    TOTAL_SHARES_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    most_recent_client_ids: _containers.RepeatedScalarFieldContainer[int]
    owner_shares: _containers.RepeatedCompositeFieldContainer[_share_pb2.OwnerShare]
    total_shares: _share_pb2.NumShares
    vault_id: _vault_pb2.VaultId
    vault_params: _params_pb2.VaultParams
    def __init__(self, vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., total_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ..., owner_shares: _Optional[_Iterable[_Union[_share_pb2.OwnerShare, _Mapping]]] = ..., vault_params: _Optional[_Union[_params_pb2.VaultParams, _Mapping]] = ..., most_recent_client_ids: _Optional[_Iterable[int]] = ...) -> None: ...
