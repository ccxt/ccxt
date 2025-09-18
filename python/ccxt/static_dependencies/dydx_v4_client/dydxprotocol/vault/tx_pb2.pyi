from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.vault import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.vault import share_pb2 as _share_pb2
from v4_proto.dydxprotocol.vault import vault_pb2 as _vault_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgAllocateToVault(_message.Message):
    __slots__ = ["authority", "quote_quantums", "vault_id"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    authority: str
    quote_quantums: bytes
    vault_id: _vault_pb2.VaultId
    def __init__(self, authority: _Optional[str] = ..., vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., quote_quantums: _Optional[bytes] = ...) -> None: ...

class MsgAllocateToVaultResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgDepositToMegavault(_message.Message):
    __slots__ = ["quote_quantums", "subaccount_id"]
    QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    quote_quantums: bytes
    subaccount_id: _subaccount_pb2.SubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., quote_quantums: _Optional[bytes] = ...) -> None: ...

class MsgDepositToMegavaultResponse(_message.Message):
    __slots__ = ["minted_shares"]
    MINTED_SHARES_FIELD_NUMBER: _ClassVar[int]
    minted_shares: _share_pb2.NumShares
    def __init__(self, minted_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ...) -> None: ...

class MsgRetrieveFromVault(_message.Message):
    __slots__ = ["authority", "quote_quantums", "vault_id"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    authority: str
    quote_quantums: bytes
    vault_id: _vault_pb2.VaultId
    def __init__(self, authority: _Optional[str] = ..., vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., quote_quantums: _Optional[bytes] = ...) -> None: ...

class MsgRetrieveFromVaultResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetVaultParams(_message.Message):
    __slots__ = ["authority", "vault_id", "vault_params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    VAULT_PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    vault_id: _vault_pb2.VaultId
    vault_params: _params_pb2.VaultParams
    def __init__(self, authority: _Optional[str] = ..., vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., vault_params: _Optional[_Union[_params_pb2.VaultParams, _Mapping]] = ...) -> None: ...

class MsgSetVaultParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetVaultQuotingParams(_message.Message):
    __slots__ = ["authority", "quoting_params", "vault_id"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    VAULT_ID_FIELD_NUMBER: _ClassVar[int]
    authority: str
    quoting_params: _params_pb2.QuotingParams
    vault_id: _vault_pb2.VaultId
    def __init__(self, authority: _Optional[str] = ..., vault_id: _Optional[_Union[_vault_pb2.VaultId, _Mapping]] = ..., quoting_params: _Optional[_Union[_params_pb2.QuotingParams, _Mapping]] = ...) -> None: ...

class MsgUnlockShares(_message.Message):
    __slots__ = ["authority", "owner_address"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    OWNER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    owner_address: str
    def __init__(self, authority: _Optional[str] = ..., owner_address: _Optional[str] = ...) -> None: ...

class MsgUnlockSharesResponse(_message.Message):
    __slots__ = ["unlocked_shares"]
    UNLOCKED_SHARES_FIELD_NUMBER: _ClassVar[int]
    unlocked_shares: _share_pb2.NumShares
    def __init__(self, unlocked_shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ...) -> None: ...

class MsgUpdateDefaultQuotingParams(_message.Message):
    __slots__ = ["authority", "default_quoting_params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    default_quoting_params: _params_pb2.QuotingParams
    def __init__(self, authority: _Optional[str] = ..., default_quoting_params: _Optional[_Union[_params_pb2.QuotingParams, _Mapping]] = ...) -> None: ...

class MsgUpdateDefaultQuotingParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateOperatorParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.OperatorParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.OperatorParams, _Mapping]] = ...) -> None: ...

class MsgUpdateOperatorParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.Params
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...

class MsgWithdrawFromMegavault(_message.Message):
    __slots__ = ["min_quote_quantums", "shares", "subaccount_id"]
    MIN_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    min_quote_quantums: bytes
    shares: _share_pb2.NumShares
    subaccount_id: _subaccount_pb2.SubaccountId
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., shares: _Optional[_Union[_share_pb2.NumShares, _Mapping]] = ..., min_quote_quantums: _Optional[bytes] = ...) -> None: ...

class MsgWithdrawFromMegavaultResponse(_message.Message):
    __slots__ = ["quote_quantums"]
    QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    quote_quantums: bytes
    def __init__(self, quote_quantums: _Optional[bytes] = ...) -> None: ...
