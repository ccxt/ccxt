from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BlockStats(_message.Message):
    __slots__ = ["fills"]
    class Fill(_message.Message):
        __slots__ = ["maker", "notional", "taker"]
        MAKER_FIELD_NUMBER: _ClassVar[int]
        NOTIONAL_FIELD_NUMBER: _ClassVar[int]
        TAKER_FIELD_NUMBER: _ClassVar[int]
        maker: str
        notional: int
        taker: str
        def __init__(self, taker: _Optional[str] = ..., maker: _Optional[str] = ..., notional: _Optional[int] = ...) -> None: ...
    FILLS_FIELD_NUMBER: _ClassVar[int]
    fills: _containers.RepeatedCompositeFieldContainer[BlockStats.Fill]
    def __init__(self, fills: _Optional[_Iterable[_Union[BlockStats.Fill, _Mapping]]] = ...) -> None: ...

class CachedStakeAmount(_message.Message):
    __slots__ = ["cached_at", "staked_amount"]
    CACHED_AT_FIELD_NUMBER: _ClassVar[int]
    STAKED_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    cached_at: int
    staked_amount: bytes
    def __init__(self, staked_amount: _Optional[bytes] = ..., cached_at: _Optional[int] = ...) -> None: ...

class EpochStats(_message.Message):
    __slots__ = ["epoch_end_time", "stats"]
    class UserWithStats(_message.Message):
        __slots__ = ["stats", "user"]
        STATS_FIELD_NUMBER: _ClassVar[int]
        USER_FIELD_NUMBER: _ClassVar[int]
        stats: UserStats
        user: str
        def __init__(self, user: _Optional[str] = ..., stats: _Optional[_Union[UserStats, _Mapping]] = ...) -> None: ...
    EPOCH_END_TIME_FIELD_NUMBER: _ClassVar[int]
    STATS_FIELD_NUMBER: _ClassVar[int]
    epoch_end_time: _timestamp_pb2.Timestamp
    stats: _containers.RepeatedCompositeFieldContainer[EpochStats.UserWithStats]
    def __init__(self, epoch_end_time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ..., stats: _Optional[_Iterable[_Union[EpochStats.UserWithStats, _Mapping]]] = ...) -> None: ...

class GlobalStats(_message.Message):
    __slots__ = ["notional_traded"]
    NOTIONAL_TRADED_FIELD_NUMBER: _ClassVar[int]
    notional_traded: int
    def __init__(self, notional_traded: _Optional[int] = ...) -> None: ...

class StatsMetadata(_message.Message):
    __slots__ = ["trailing_epoch"]
    TRAILING_EPOCH_FIELD_NUMBER: _ClassVar[int]
    trailing_epoch: int
    def __init__(self, trailing_epoch: _Optional[int] = ...) -> None: ...

class UserStats(_message.Message):
    __slots__ = ["maker_notional", "taker_notional"]
    MAKER_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    TAKER_NOTIONAL_FIELD_NUMBER: _ClassVar[int]
    maker_notional: int
    taker_notional: int
    def __init__(self, taker_notional: _Optional[int] = ..., maker_notional: _Optional[int] = ...) -> None: ...
