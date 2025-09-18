from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.tendermint.abci import types_pb2 as _types_pb2
from v4_proto.tendermint.types import block_pb2 as _block_pb2
from google.protobuf import any_pb2 as _any_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ABCIMessageLog(_message.Message):
    __slots__ = ["events", "log", "msg_index"]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    LOG_FIELD_NUMBER: _ClassVar[int]
    MSG_INDEX_FIELD_NUMBER: _ClassVar[int]
    events: _containers.RepeatedCompositeFieldContainer[StringEvent]
    log: str
    msg_index: int
    def __init__(self, msg_index: _Optional[int] = ..., log: _Optional[str] = ..., events: _Optional[_Iterable[_Union[StringEvent, _Mapping]]] = ...) -> None: ...

class Attribute(_message.Message):
    __slots__ = ["key", "value"]
    KEY_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    key: str
    value: str
    def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...

class GasInfo(_message.Message):
    __slots__ = ["gas_used", "gas_wanted"]
    GAS_USED_FIELD_NUMBER: _ClassVar[int]
    GAS_WANTED_FIELD_NUMBER: _ClassVar[int]
    gas_used: int
    gas_wanted: int
    def __init__(self, gas_wanted: _Optional[int] = ..., gas_used: _Optional[int] = ...) -> None: ...

class MsgData(_message.Message):
    __slots__ = ["data", "msg_type"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    MSG_TYPE_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    msg_type: str
    def __init__(self, msg_type: _Optional[str] = ..., data: _Optional[bytes] = ...) -> None: ...

class Result(_message.Message):
    __slots__ = ["data", "events", "log", "msg_responses"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    LOG_FIELD_NUMBER: _ClassVar[int]
    MSG_RESPONSES_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    events: _containers.RepeatedCompositeFieldContainer[_types_pb2.Event]
    log: str
    msg_responses: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    def __init__(self, data: _Optional[bytes] = ..., log: _Optional[str] = ..., events: _Optional[_Iterable[_Union[_types_pb2.Event, _Mapping]]] = ..., msg_responses: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ...) -> None: ...

class SearchBlocksResult(_message.Message):
    __slots__ = ["blocks", "count", "limit", "page_number", "page_total", "total_count"]
    BLOCKS_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    PAGE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    PAGE_TOTAL_FIELD_NUMBER: _ClassVar[int]
    TOTAL_COUNT_FIELD_NUMBER: _ClassVar[int]
    blocks: _containers.RepeatedCompositeFieldContainer[_block_pb2.Block]
    count: int
    limit: int
    page_number: int
    page_total: int
    total_count: int
    def __init__(self, total_count: _Optional[int] = ..., count: _Optional[int] = ..., page_number: _Optional[int] = ..., page_total: _Optional[int] = ..., limit: _Optional[int] = ..., blocks: _Optional[_Iterable[_Union[_block_pb2.Block, _Mapping]]] = ...) -> None: ...

class SearchTxsResult(_message.Message):
    __slots__ = ["count", "limit", "page_number", "page_total", "total_count", "txs"]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    PAGE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    PAGE_TOTAL_FIELD_NUMBER: _ClassVar[int]
    TOTAL_COUNT_FIELD_NUMBER: _ClassVar[int]
    TXS_FIELD_NUMBER: _ClassVar[int]
    count: int
    limit: int
    page_number: int
    page_total: int
    total_count: int
    txs: _containers.RepeatedCompositeFieldContainer[TxResponse]
    def __init__(self, total_count: _Optional[int] = ..., count: _Optional[int] = ..., page_number: _Optional[int] = ..., page_total: _Optional[int] = ..., limit: _Optional[int] = ..., txs: _Optional[_Iterable[_Union[TxResponse, _Mapping]]] = ...) -> None: ...

class SimulationResponse(_message.Message):
    __slots__ = ["gas_info", "result"]
    GAS_INFO_FIELD_NUMBER: _ClassVar[int]
    RESULT_FIELD_NUMBER: _ClassVar[int]
    gas_info: GasInfo
    result: Result
    def __init__(self, gas_info: _Optional[_Union[GasInfo, _Mapping]] = ..., result: _Optional[_Union[Result, _Mapping]] = ...) -> None: ...

class StringEvent(_message.Message):
    __slots__ = ["attributes", "type"]
    ATTRIBUTES_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    attributes: _containers.RepeatedCompositeFieldContainer[Attribute]
    type: str
    def __init__(self, type: _Optional[str] = ..., attributes: _Optional[_Iterable[_Union[Attribute, _Mapping]]] = ...) -> None: ...

class TxMsgData(_message.Message):
    __slots__ = ["data", "msg_responses"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    MSG_RESPONSES_FIELD_NUMBER: _ClassVar[int]
    data: _containers.RepeatedCompositeFieldContainer[MsgData]
    msg_responses: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    def __init__(self, data: _Optional[_Iterable[_Union[MsgData, _Mapping]]] = ..., msg_responses: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ...) -> None: ...

class TxResponse(_message.Message):
    __slots__ = ["code", "codespace", "data", "events", "gas_used", "gas_wanted", "height", "info", "logs", "raw_log", "timestamp", "tx", "txhash"]
    CODESPACE_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    DATA_FIELD_NUMBER: _ClassVar[int]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    GAS_USED_FIELD_NUMBER: _ClassVar[int]
    GAS_WANTED_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    INFO_FIELD_NUMBER: _ClassVar[int]
    LOGS_FIELD_NUMBER: _ClassVar[int]
    RAW_LOG_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    TXHASH_FIELD_NUMBER: _ClassVar[int]
    TX_FIELD_NUMBER: _ClassVar[int]
    code: int
    codespace: str
    data: str
    events: _containers.RepeatedCompositeFieldContainer[_types_pb2.Event]
    gas_used: int
    gas_wanted: int
    height: int
    info: str
    logs: _containers.RepeatedCompositeFieldContainer[ABCIMessageLog]
    raw_log: str
    timestamp: str
    tx: _any_pb2.Any
    txhash: str
    def __init__(self, height: _Optional[int] = ..., txhash: _Optional[str] = ..., codespace: _Optional[str] = ..., code: _Optional[int] = ..., data: _Optional[str] = ..., raw_log: _Optional[str] = ..., logs: _Optional[_Iterable[_Union[ABCIMessageLog, _Mapping]]] = ..., info: _Optional[str] = ..., gas_wanted: _Optional[int] = ..., gas_used: _Optional[int] = ..., tx: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., timestamp: _Optional[str] = ..., events: _Optional[_Iterable[_Union[_types_pb2.Event, _Mapping]]] = ...) -> None: ...
