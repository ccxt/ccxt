from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ClobPair(_message.Message):
    __slots__ = ["id", "perpetual_clob_metadata", "quantum_conversion_exponent", "spot_clob_metadata", "status", "step_base_quantums", "subticks_per_tick"]
    class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    ID_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_CLOB_METADATA_FIELD_NUMBER: _ClassVar[int]
    QUANTUM_CONVERSION_EXPONENT_FIELD_NUMBER: _ClassVar[int]
    SPOT_CLOB_METADATA_FIELD_NUMBER: _ClassVar[int]
    STATUS_ACTIVE: ClobPair.Status
    STATUS_CANCEL_ONLY: ClobPair.Status
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FINAL_SETTLEMENT: ClobPair.Status
    STATUS_INITIALIZING: ClobPair.Status
    STATUS_PAUSED: ClobPair.Status
    STATUS_POST_ONLY: ClobPair.Status
    STATUS_UNSPECIFIED: ClobPair.Status
    STEP_BASE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_PER_TICK_FIELD_NUMBER: _ClassVar[int]
    id: int
    perpetual_clob_metadata: PerpetualClobMetadata
    quantum_conversion_exponent: int
    spot_clob_metadata: SpotClobMetadata
    status: ClobPair.Status
    step_base_quantums: int
    subticks_per_tick: int
    def __init__(self, id: _Optional[int] = ..., perpetual_clob_metadata: _Optional[_Union[PerpetualClobMetadata, _Mapping]] = ..., spot_clob_metadata: _Optional[_Union[SpotClobMetadata, _Mapping]] = ..., step_base_quantums: _Optional[int] = ..., subticks_per_tick: _Optional[int] = ..., quantum_conversion_exponent: _Optional[int] = ..., status: _Optional[_Union[ClobPair.Status, str]] = ...) -> None: ...

class PerpetualClobMetadata(_message.Message):
    __slots__ = ["perpetual_id"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    def __init__(self, perpetual_id: _Optional[int] = ...) -> None: ...

class SpotClobMetadata(_message.Message):
    __slots__ = ["base_asset_id", "quote_asset_id"]
    BASE_ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    QUOTE_ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    base_asset_id: int
    quote_asset_id: int
    def __init__(self, base_asset_id: _Optional[int] = ..., quote_asset_id: _Optional[int] = ...) -> None: ...
