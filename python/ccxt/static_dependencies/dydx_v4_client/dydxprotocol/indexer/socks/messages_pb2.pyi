from v4_proto.dydxprotocol.indexer.protocol.v1 import subaccount_pb2 as _subaccount_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BlockHeightMessage(_message.Message):
    __slots__ = ["block_height", "time", "version"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    TIME_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    block_height: str
    time: str
    version: str
    def __init__(self, block_height: _Optional[str] = ..., time: _Optional[str] = ..., version: _Optional[str] = ...) -> None: ...

class CandleMessage(_message.Message):
    __slots__ = ["clob_pair_id", "contents", "resolution", "version"]
    class Resolution(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    CONTENTS_FIELD_NUMBER: _ClassVar[int]
    FIFTEEN_MINUTES: CandleMessage.Resolution
    FIVE_MINUTES: CandleMessage.Resolution
    FOUR_HOURS: CandleMessage.Resolution
    ONE_DAY: CandleMessage.Resolution
    ONE_HOUR: CandleMessage.Resolution
    ONE_MINUTE: CandleMessage.Resolution
    RESOLUTION_FIELD_NUMBER: _ClassVar[int]
    THIRTY_MINUTES: CandleMessage.Resolution
    VERSION_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: str
    contents: str
    resolution: CandleMessage.Resolution
    version: str
    def __init__(self, contents: _Optional[str] = ..., clob_pair_id: _Optional[str] = ..., resolution: _Optional[_Union[CandleMessage.Resolution, str]] = ..., version: _Optional[str] = ...) -> None: ...

class MarketMessage(_message.Message):
    __slots__ = ["contents", "version"]
    CONTENTS_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    contents: str
    version: str
    def __init__(self, contents: _Optional[str] = ..., version: _Optional[str] = ...) -> None: ...

class OrderbookMessage(_message.Message):
    __slots__ = ["clob_pair_id", "contents", "version"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    CONTENTS_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: str
    contents: str
    version: str
    def __init__(self, contents: _Optional[str] = ..., clob_pair_id: _Optional[str] = ..., version: _Optional[str] = ...) -> None: ...

class SubaccountMessage(_message.Message):
    __slots__ = ["block_height", "contents", "event_index", "subaccount_id", "transaction_index", "version"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    CONTENTS_FIELD_NUMBER: _ClassVar[int]
    EVENT_INDEX_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    TRANSACTION_INDEX_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    block_height: str
    contents: str
    event_index: int
    subaccount_id: _subaccount_pb2.IndexerSubaccountId
    transaction_index: int
    version: str
    def __init__(self, block_height: _Optional[str] = ..., transaction_index: _Optional[int] = ..., event_index: _Optional[int] = ..., contents: _Optional[str] = ..., subaccount_id: _Optional[_Union[_subaccount_pb2.IndexerSubaccountId, _Mapping]] = ..., version: _Optional[str] = ...) -> None: ...

class TradeMessage(_message.Message):
    __slots__ = ["block_height", "clob_pair_id", "contents", "version"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    CONTENTS_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    block_height: str
    clob_pair_id: str
    contents: str
    version: str
    def __init__(self, block_height: _Optional[str] = ..., contents: _Optional[str] = ..., clob_pair_id: _Optional[str] = ..., version: _Optional[str] = ...) -> None: ...
