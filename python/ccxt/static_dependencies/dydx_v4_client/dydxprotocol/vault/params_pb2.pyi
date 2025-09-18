from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.dydxprotocol.vault import vault_pb2 as _vault_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OperatorMetadata(_message.Message):
    __slots__ = ["description", "name"]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    description: str
    name: str
    def __init__(self, name: _Optional[str] = ..., description: _Optional[str] = ...) -> None: ...

class OperatorParams(_message.Message):
    __slots__ = ["metadata", "operator"]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    OPERATOR_FIELD_NUMBER: _ClassVar[int]
    metadata: OperatorMetadata
    operator: str
    def __init__(self, operator: _Optional[str] = ..., metadata: _Optional[_Union[OperatorMetadata, _Mapping]] = ...) -> None: ...

class Params(_message.Message):
    __slots__ = ["activation_threshold_quote_quantums", "layers", "order_expiration_seconds", "order_size_pct_ppm", "skew_factor_ppm", "spread_buffer_ppm", "spread_min_ppm"]
    ACTIVATION_THRESHOLD_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    LAYERS_FIELD_NUMBER: _ClassVar[int]
    ORDER_EXPIRATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    ORDER_SIZE_PCT_PPM_FIELD_NUMBER: _ClassVar[int]
    SKEW_FACTOR_PPM_FIELD_NUMBER: _ClassVar[int]
    SPREAD_BUFFER_PPM_FIELD_NUMBER: _ClassVar[int]
    SPREAD_MIN_PPM_FIELD_NUMBER: _ClassVar[int]
    activation_threshold_quote_quantums: bytes
    layers: int
    order_expiration_seconds: int
    order_size_pct_ppm: int
    skew_factor_ppm: int
    spread_buffer_ppm: int
    spread_min_ppm: int
    def __init__(self, layers: _Optional[int] = ..., spread_min_ppm: _Optional[int] = ..., spread_buffer_ppm: _Optional[int] = ..., skew_factor_ppm: _Optional[int] = ..., order_size_pct_ppm: _Optional[int] = ..., order_expiration_seconds: _Optional[int] = ..., activation_threshold_quote_quantums: _Optional[bytes] = ...) -> None: ...

class QuotingParams(_message.Message):
    __slots__ = ["activation_threshold_quote_quantums", "layers", "order_expiration_seconds", "order_size_pct_ppm", "skew_factor_ppm", "spread_buffer_ppm", "spread_min_ppm"]
    ACTIVATION_THRESHOLD_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    LAYERS_FIELD_NUMBER: _ClassVar[int]
    ORDER_EXPIRATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    ORDER_SIZE_PCT_PPM_FIELD_NUMBER: _ClassVar[int]
    SKEW_FACTOR_PPM_FIELD_NUMBER: _ClassVar[int]
    SPREAD_BUFFER_PPM_FIELD_NUMBER: _ClassVar[int]
    SPREAD_MIN_PPM_FIELD_NUMBER: _ClassVar[int]
    activation_threshold_quote_quantums: bytes
    layers: int
    order_expiration_seconds: int
    order_size_pct_ppm: int
    skew_factor_ppm: int
    spread_buffer_ppm: int
    spread_min_ppm: int
    def __init__(self, layers: _Optional[int] = ..., spread_min_ppm: _Optional[int] = ..., spread_buffer_ppm: _Optional[int] = ..., skew_factor_ppm: _Optional[int] = ..., order_size_pct_ppm: _Optional[int] = ..., order_expiration_seconds: _Optional[int] = ..., activation_threshold_quote_quantums: _Optional[bytes] = ...) -> None: ...

class VaultParams(_message.Message):
    __slots__ = ["quoting_params", "status"]
    QUOTING_PARAMS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    quoting_params: QuotingParams
    status: _vault_pb2.VaultStatus
    def __init__(self, status: _Optional[_Union[_vault_pb2.VaultStatus, str]] = ..., quoting_params: _Optional[_Union[QuotingParams, _Mapping]] = ...) -> None: ...
