from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.blocktime import blocktime_pb2 as _blocktime_pb2
from v4_proto.dydxprotocol.blocktime import params_pb2 as _params_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllDowntimeInfoRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryAllDowntimeInfoResponse(_message.Message):
    __slots__ = ["info"]
    INFO_FIELD_NUMBER: _ClassVar[int]
    info: _blocktime_pb2.AllDowntimeInfo
    def __init__(self, info: _Optional[_Union[_blocktime_pb2.AllDowntimeInfo, _Mapping]] = ...) -> None: ...

class QueryDowntimeParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryDowntimeParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.DowntimeParams
    def __init__(self, params: _Optional[_Union[_params_pb2.DowntimeParams, _Mapping]] = ...) -> None: ...

class QueryPreviousBlockInfoRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryPreviousBlockInfoResponse(_message.Message):
    __slots__ = ["info"]
    INFO_FIELD_NUMBER: _ClassVar[int]
    info: _blocktime_pb2.BlockInfo
    def __init__(self, info: _Optional[_Union[_blocktime_pb2.BlockInfo, _Mapping]] = ...) -> None: ...

class QuerySynchronyParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QuerySynchronyParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.SynchronyParams
    def __init__(self, params: _Optional[_Union[_params_pb2.SynchronyParams, _Mapping]] = ...) -> None: ...
