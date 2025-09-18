from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.stats import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.stats import stats_pb2 as _stats_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryGlobalStatsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryGlobalStatsResponse(_message.Message):
    __slots__ = ["stats"]
    STATS_FIELD_NUMBER: _ClassVar[int]
    stats: _stats_pb2.GlobalStats
    def __init__(self, stats: _Optional[_Union[_stats_pb2.GlobalStats, _Mapping]] = ...) -> None: ...

class QueryParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.Params
    def __init__(self, params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...

class QueryStatsMetadataRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryStatsMetadataResponse(_message.Message):
    __slots__ = ["metadata"]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    metadata: _stats_pb2.StatsMetadata
    def __init__(self, metadata: _Optional[_Union[_stats_pb2.StatsMetadata, _Mapping]] = ...) -> None: ...

class QueryUserStatsRequest(_message.Message):
    __slots__ = ["user"]
    USER_FIELD_NUMBER: _ClassVar[int]
    user: str
    def __init__(self, user: _Optional[str] = ...) -> None: ...

class QueryUserStatsResponse(_message.Message):
    __slots__ = ["stats"]
    STATS_FIELD_NUMBER: _ClassVar[int]
    stats: _stats_pb2.UserStats
    def __init__(self, stats: _Optional[_Union[_stats_pb2.UserStats, _Mapping]] = ...) -> None: ...
