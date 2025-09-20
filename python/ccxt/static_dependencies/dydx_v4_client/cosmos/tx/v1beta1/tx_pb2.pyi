from v4_proto.amino import amino_pb2 as _amino_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.cosmos.crypto.multisig.v1beta1 import multisig_pb2 as _multisig_pb2
from v4_proto.cosmos.base.v1beta1 import coin_pb2 as _coin_pb2
from v4_proto.cosmos.tx.signing.v1beta1 import signing_pb2 as _signing_pb2
from google.protobuf import any_pb2 as _any_pb2
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AuthInfo(_message.Message):
    __slots__ = ["fee", "signer_infos", "tip"]
    FEE_FIELD_NUMBER: _ClassVar[int]
    SIGNER_INFOS_FIELD_NUMBER: _ClassVar[int]
    TIP_FIELD_NUMBER: _ClassVar[int]
    fee: Fee
    signer_infos: _containers.RepeatedCompositeFieldContainer[SignerInfo]
    tip: Tip
    def __init__(self, signer_infos: _Optional[_Iterable[_Union[SignerInfo, _Mapping]]] = ..., fee: _Optional[_Union[Fee, _Mapping]] = ..., tip: _Optional[_Union[Tip, _Mapping]] = ...) -> None: ...

class AuxSignerData(_message.Message):
    __slots__ = ["address", "mode", "sig", "sign_doc"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MODE_FIELD_NUMBER: _ClassVar[int]
    SIGN_DOC_FIELD_NUMBER: _ClassVar[int]
    SIG_FIELD_NUMBER: _ClassVar[int]
    address: str
    mode: _signing_pb2.SignMode
    sig: bytes
    sign_doc: SignDocDirectAux
    def __init__(self, address: _Optional[str] = ..., sign_doc: _Optional[_Union[SignDocDirectAux, _Mapping]] = ..., mode: _Optional[_Union[_signing_pb2.SignMode, str]] = ..., sig: _Optional[bytes] = ...) -> None: ...

class Fee(_message.Message):
    __slots__ = ["amount", "gas_limit", "granter", "payer"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    GAS_LIMIT_FIELD_NUMBER: _ClassVar[int]
    GRANTER_FIELD_NUMBER: _ClassVar[int]
    PAYER_FIELD_NUMBER: _ClassVar[int]
    amount: _containers.RepeatedCompositeFieldContainer[_coin_pb2.Coin]
    gas_limit: int
    granter: str
    payer: str
    def __init__(self, amount: _Optional[_Iterable[_Union[_coin_pb2.Coin, _Mapping]]] = ..., gas_limit: _Optional[int] = ..., payer: _Optional[str] = ..., granter: _Optional[str] = ...) -> None: ...

class ModeInfo(_message.Message):
    __slots__ = ["multi", "single"]
    class Multi(_message.Message):
        __slots__ = ["bitarray", "mode_infos"]
        BITARRAY_FIELD_NUMBER: _ClassVar[int]
        MODE_INFOS_FIELD_NUMBER: _ClassVar[int]
        bitarray: _multisig_pb2.CompactBitArray
        mode_infos: _containers.RepeatedCompositeFieldContainer[ModeInfo]
        def __init__(self, bitarray: _Optional[_Union[_multisig_pb2.CompactBitArray, _Mapping]] = ..., mode_infos: _Optional[_Iterable[_Union[ModeInfo, _Mapping]]] = ...) -> None: ...
    class Single(_message.Message):
        __slots__ = ["mode"]
        MODE_FIELD_NUMBER: _ClassVar[int]
        mode: _signing_pb2.SignMode
        def __init__(self, mode: _Optional[_Union[_signing_pb2.SignMode, str]] = ...) -> None: ...
    MULTI_FIELD_NUMBER: _ClassVar[int]
    SINGLE_FIELD_NUMBER: _ClassVar[int]
    multi: ModeInfo.Multi
    single: ModeInfo.Single
    def __init__(self, single: _Optional[_Union[ModeInfo.Single, _Mapping]] = ..., multi: _Optional[_Union[ModeInfo.Multi, _Mapping]] = ...) -> None: ...

class SignDoc(_message.Message):
    __slots__ = ["account_number", "auth_info_bytes", "body_bytes", "chain_id"]
    ACCOUNT_NUMBER_FIELD_NUMBER: _ClassVar[int]
    AUTH_INFO_BYTES_FIELD_NUMBER: _ClassVar[int]
    BODY_BYTES_FIELD_NUMBER: _ClassVar[int]
    CHAIN_ID_FIELD_NUMBER: _ClassVar[int]
    account_number: int
    auth_info_bytes: bytes
    body_bytes: bytes
    chain_id: str
    def __init__(self, body_bytes: _Optional[bytes] = ..., auth_info_bytes: _Optional[bytes] = ..., chain_id: _Optional[str] = ..., account_number: _Optional[int] = ...) -> None: ...

class SignDocDirectAux(_message.Message):
    __slots__ = ["account_number", "body_bytes", "chain_id", "public_key", "sequence", "tip"]
    ACCOUNT_NUMBER_FIELD_NUMBER: _ClassVar[int]
    BODY_BYTES_FIELD_NUMBER: _ClassVar[int]
    CHAIN_ID_FIELD_NUMBER: _ClassVar[int]
    PUBLIC_KEY_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    TIP_FIELD_NUMBER: _ClassVar[int]
    account_number: int
    body_bytes: bytes
    chain_id: str
    public_key: _any_pb2.Any
    sequence: int
    tip: Tip
    def __init__(self, body_bytes: _Optional[bytes] = ..., public_key: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., chain_id: _Optional[str] = ..., account_number: _Optional[int] = ..., sequence: _Optional[int] = ..., tip: _Optional[_Union[Tip, _Mapping]] = ...) -> None: ...

class SignerInfo(_message.Message):
    __slots__ = ["mode_info", "public_key", "sequence"]
    MODE_INFO_FIELD_NUMBER: _ClassVar[int]
    PUBLIC_KEY_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    mode_info: ModeInfo
    public_key: _any_pb2.Any
    sequence: int
    def __init__(self, public_key: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., mode_info: _Optional[_Union[ModeInfo, _Mapping]] = ..., sequence: _Optional[int] = ...) -> None: ...

class Tip(_message.Message):
    __slots__ = ["amount", "tipper"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    TIPPER_FIELD_NUMBER: _ClassVar[int]
    amount: _containers.RepeatedCompositeFieldContainer[_coin_pb2.Coin]
    tipper: str
    def __init__(self, amount: _Optional[_Iterable[_Union[_coin_pb2.Coin, _Mapping]]] = ..., tipper: _Optional[str] = ...) -> None: ...

class Tx(_message.Message):
    __slots__ = ["auth_info", "body", "signatures"]
    AUTH_INFO_FIELD_NUMBER: _ClassVar[int]
    BODY_FIELD_NUMBER: _ClassVar[int]
    SIGNATURES_FIELD_NUMBER: _ClassVar[int]
    auth_info: AuthInfo
    body: TxBody
    signatures: _containers.RepeatedScalarFieldContainer[bytes]
    def __init__(self, body: _Optional[_Union[TxBody, _Mapping]] = ..., auth_info: _Optional[_Union[AuthInfo, _Mapping]] = ..., signatures: _Optional[_Iterable[bytes]] = ...) -> None: ...

class TxBody(_message.Message):
    __slots__ = ["extension_options", "memo", "messages", "non_critical_extension_options", "timeout_height"]
    EXTENSION_OPTIONS_FIELD_NUMBER: _ClassVar[int]
    MEMO_FIELD_NUMBER: _ClassVar[int]
    MESSAGES_FIELD_NUMBER: _ClassVar[int]
    NON_CRITICAL_EXTENSION_OPTIONS_FIELD_NUMBER: _ClassVar[int]
    TIMEOUT_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    extension_options: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    memo: str
    messages: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    non_critical_extension_options: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    timeout_height: int
    def __init__(self, messages: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ..., memo: _Optional[str] = ..., timeout_height: _Optional[int] = ..., extension_options: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ..., non_critical_extension_options: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ...) -> None: ...

class TxRaw(_message.Message):
    __slots__ = ["auth_info_bytes", "body_bytes", "signatures"]
    AUTH_INFO_BYTES_FIELD_NUMBER: _ClassVar[int]
    BODY_BYTES_FIELD_NUMBER: _ClassVar[int]
    SIGNATURES_FIELD_NUMBER: _ClassVar[int]
    auth_info_bytes: bytes
    body_bytes: bytes
    signatures: _containers.RepeatedScalarFieldContainer[bytes]
    def __init__(self, body_bytes: _Optional[bytes] = ..., auth_info_bytes: _Optional[bytes] = ..., signatures: _Optional[_Iterable[bytes]] = ...) -> None: ...
