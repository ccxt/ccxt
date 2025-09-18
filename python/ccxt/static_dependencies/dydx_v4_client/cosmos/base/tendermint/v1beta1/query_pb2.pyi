from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import any_pb2 as _any_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.tendermint.p2p import types_pb2 as _types_pb2
from v4_proto.tendermint.types import types_pb2 as _types_pb2_1
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.cosmos.base.tendermint.v1beta1 import types_pb2 as _types_pb2_1_1
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.tendermint.types import block_pb2 as _block_pb2
from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ABCIQueryRequest(_message.Message):
    __slots__ = ["data", "height", "path", "prove"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    PATH_FIELD_NUMBER: _ClassVar[int]
    PROVE_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    height: int
    path: str
    prove: bool
    def __init__(self, data: _Optional[bytes] = ..., path: _Optional[str] = ..., height: _Optional[int] = ..., prove: bool = ...) -> None: ...

class ABCIQueryResponse(_message.Message):
    __slots__ = ["code", "codespace", "height", "index", "info", "key", "log", "proof_ops", "value"]
    CODESPACE_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    INDEX_FIELD_NUMBER: _ClassVar[int]
    INFO_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    LOG_FIELD_NUMBER: _ClassVar[int]
    PROOF_OPS_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    code: int
    codespace: str
    height: int
    index: int
    info: str
    key: bytes
    log: str
    proof_ops: ProofOps
    value: bytes
    def __init__(self, code: _Optional[int] = ..., log: _Optional[str] = ..., info: _Optional[str] = ..., index: _Optional[int] = ..., key: _Optional[bytes] = ..., value: _Optional[bytes] = ..., proof_ops: _Optional[_Union[ProofOps, _Mapping]] = ..., height: _Optional[int] = ..., codespace: _Optional[str] = ...) -> None: ...

class GetBlockByHeightRequest(_message.Message):
    __slots__ = ["height"]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    height: int
    def __init__(self, height: _Optional[int] = ...) -> None: ...

class GetBlockByHeightResponse(_message.Message):
    __slots__ = ["block", "block_id", "sdk_block"]
    BLOCK_FIELD_NUMBER: _ClassVar[int]
    BLOCK_ID_FIELD_NUMBER: _ClassVar[int]
    SDK_BLOCK_FIELD_NUMBER: _ClassVar[int]
    block: _block_pb2.Block
    block_id: _types_pb2_1.BlockID
    sdk_block: _types_pb2_1_1.Block
    def __init__(self, block_id: _Optional[_Union[_types_pb2_1.BlockID, _Mapping]] = ..., block: _Optional[_Union[_block_pb2.Block, _Mapping]] = ..., sdk_block: _Optional[_Union[_types_pb2_1_1.Block, _Mapping]] = ...) -> None: ...

class GetLatestBlockRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetLatestBlockResponse(_message.Message):
    __slots__ = ["block", "block_id", "sdk_block"]
    BLOCK_FIELD_NUMBER: _ClassVar[int]
    BLOCK_ID_FIELD_NUMBER: _ClassVar[int]
    SDK_BLOCK_FIELD_NUMBER: _ClassVar[int]
    block: _block_pb2.Block
    block_id: _types_pb2_1.BlockID
    sdk_block: _types_pb2_1_1.Block
    def __init__(self, block_id: _Optional[_Union[_types_pb2_1.BlockID, _Mapping]] = ..., block: _Optional[_Union[_block_pb2.Block, _Mapping]] = ..., sdk_block: _Optional[_Union[_types_pb2_1_1.Block, _Mapping]] = ...) -> None: ...

class GetLatestValidatorSetRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class GetLatestValidatorSetResponse(_message.Message):
    __slots__ = ["block_height", "pagination", "validators"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    VALIDATORS_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    pagination: _pagination_pb2.PageResponse
    validators: _containers.RepeatedCompositeFieldContainer[Validator]
    def __init__(self, block_height: _Optional[int] = ..., validators: _Optional[_Iterable[_Union[Validator, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class GetNodeInfoRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetNodeInfoResponse(_message.Message):
    __slots__ = ["application_version", "default_node_info"]
    APPLICATION_VERSION_FIELD_NUMBER: _ClassVar[int]
    DEFAULT_NODE_INFO_FIELD_NUMBER: _ClassVar[int]
    application_version: VersionInfo
    default_node_info: _types_pb2.DefaultNodeInfo
    def __init__(self, default_node_info: _Optional[_Union[_types_pb2.DefaultNodeInfo, _Mapping]] = ..., application_version: _Optional[_Union[VersionInfo, _Mapping]] = ...) -> None: ...

class GetSyncingRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetSyncingResponse(_message.Message):
    __slots__ = ["syncing"]
    SYNCING_FIELD_NUMBER: _ClassVar[int]
    syncing: bool
    def __init__(self, syncing: bool = ...) -> None: ...

class GetValidatorSetByHeightRequest(_message.Message):
    __slots__ = ["height", "pagination"]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    height: int
    pagination: _pagination_pb2.PageRequest
    def __init__(self, height: _Optional[int] = ..., pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class GetValidatorSetByHeightResponse(_message.Message):
    __slots__ = ["block_height", "pagination", "validators"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    VALIDATORS_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    pagination: _pagination_pb2.PageResponse
    validators: _containers.RepeatedCompositeFieldContainer[Validator]
    def __init__(self, block_height: _Optional[int] = ..., validators: _Optional[_Iterable[_Union[Validator, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class Module(_message.Message):
    __slots__ = ["path", "sum", "version"]
    PATH_FIELD_NUMBER: _ClassVar[int]
    SUM_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    path: str
    sum: str
    version: str
    def __init__(self, path: _Optional[str] = ..., version: _Optional[str] = ..., sum: _Optional[str] = ...) -> None: ...

class ProofOp(_message.Message):
    __slots__ = ["data", "key", "type"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    key: bytes
    type: str
    def __init__(self, type: _Optional[str] = ..., key: _Optional[bytes] = ..., data: _Optional[bytes] = ...) -> None: ...

class ProofOps(_message.Message):
    __slots__ = ["ops"]
    OPS_FIELD_NUMBER: _ClassVar[int]
    ops: _containers.RepeatedCompositeFieldContainer[ProofOp]
    def __init__(self, ops: _Optional[_Iterable[_Union[ProofOp, _Mapping]]] = ...) -> None: ...

class Validator(_message.Message):
    __slots__ = ["address", "proposer_priority", "pub_key", "voting_power"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    PROPOSER_PRIORITY_FIELD_NUMBER: _ClassVar[int]
    PUB_KEY_FIELD_NUMBER: _ClassVar[int]
    VOTING_POWER_FIELD_NUMBER: _ClassVar[int]
    address: str
    proposer_priority: int
    pub_key: _any_pb2.Any
    voting_power: int
    def __init__(self, address: _Optional[str] = ..., pub_key: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., voting_power: _Optional[int] = ..., proposer_priority: _Optional[int] = ...) -> None: ...

class VersionInfo(_message.Message):
    __slots__ = ["app_name", "build_deps", "build_tags", "cosmos_sdk_version", "git_commit", "go_version", "name", "version"]
    APP_NAME_FIELD_NUMBER: _ClassVar[int]
    BUILD_DEPS_FIELD_NUMBER: _ClassVar[int]
    BUILD_TAGS_FIELD_NUMBER: _ClassVar[int]
    COSMOS_SDK_VERSION_FIELD_NUMBER: _ClassVar[int]
    GIT_COMMIT_FIELD_NUMBER: _ClassVar[int]
    GO_VERSION_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    app_name: str
    build_deps: _containers.RepeatedCompositeFieldContainer[Module]
    build_tags: str
    cosmos_sdk_version: str
    git_commit: str
    go_version: str
    name: str
    version: str
    def __init__(self, name: _Optional[str] = ..., app_name: _Optional[str] = ..., version: _Optional[str] = ..., git_commit: _Optional[str] = ..., build_tags: _Optional[str] = ..., go_version: _Optional[str] = ..., build_deps: _Optional[_Iterable[_Union[Module, _Mapping]]] = ..., cosmos_sdk_version: _Optional[str] = ...) -> None: ...
