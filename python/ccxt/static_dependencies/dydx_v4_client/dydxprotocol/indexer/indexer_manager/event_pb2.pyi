from google.protobuf import timestamp_pb2 as _timestamp_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class IndexerEventsStoreValue(_message.Message):
    __slots__ = ["events"]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    events: _containers.RepeatedCompositeFieldContainer[IndexerTendermintEventWrapper]
    def __init__(self, events: _Optional[_Iterable[_Union[IndexerTendermintEventWrapper, _Mapping]]] = ...) -> None: ...

class IndexerTendermintBlock(_message.Message):
    __slots__ = ["events", "height", "time", "tx_hashes"]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    TIME_FIELD_NUMBER: _ClassVar[int]
    TX_HASHES_FIELD_NUMBER: _ClassVar[int]
    events: _containers.RepeatedCompositeFieldContainer[IndexerTendermintEvent]
    height: int
    time: _timestamp_pb2.Timestamp
    tx_hashes: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, height: _Optional[int] = ..., time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ..., events: _Optional[_Iterable[_Union[IndexerTendermintEvent, _Mapping]]] = ..., tx_hashes: _Optional[_Iterable[str]] = ...) -> None: ...

class IndexerTendermintEvent(_message.Message):
    __slots__ = ["block_event", "data_bytes", "event_index", "subtype", "transaction_index", "version"]
    class BlockEvent(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    BLOCK_EVENT_BEGIN_BLOCK: IndexerTendermintEvent.BlockEvent
    BLOCK_EVENT_END_BLOCK: IndexerTendermintEvent.BlockEvent
    BLOCK_EVENT_FIELD_NUMBER: _ClassVar[int]
    BLOCK_EVENT_UNSPECIFIED: IndexerTendermintEvent.BlockEvent
    DATA_BYTES_FIELD_NUMBER: _ClassVar[int]
    EVENT_INDEX_FIELD_NUMBER: _ClassVar[int]
    SUBTYPE_FIELD_NUMBER: _ClassVar[int]
    TRANSACTION_INDEX_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    block_event: IndexerTendermintEvent.BlockEvent
    data_bytes: bytes
    event_index: int
    subtype: str
    transaction_index: int
    version: int
    def __init__(self, subtype: _Optional[str] = ..., transaction_index: _Optional[int] = ..., block_event: _Optional[_Union[IndexerTendermintEvent.BlockEvent, str]] = ..., event_index: _Optional[int] = ..., version: _Optional[int] = ..., data_bytes: _Optional[bytes] = ...) -> None: ...

class IndexerTendermintEventWrapper(_message.Message):
    __slots__ = ["event", "txn_hash"]
    EVENT_FIELD_NUMBER: _ClassVar[int]
    TXN_HASH_FIELD_NUMBER: _ClassVar[int]
    event: IndexerTendermintEvent
    txn_hash: str
    def __init__(self, event: _Optional[_Union[IndexerTendermintEvent, _Mapping]] = ..., txn_hash: _Optional[str] = ...) -> None: ...
