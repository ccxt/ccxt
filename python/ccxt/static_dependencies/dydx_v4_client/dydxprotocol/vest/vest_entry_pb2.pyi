from google.protobuf import timestamp_pb2 as _timestamp_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class VestEntry(_message.Message):
    __slots__ = ["denom", "end_time", "start_time", "treasury_account", "vester_account"]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    TREASURY_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    VESTER_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    denom: str
    end_time: _timestamp_pb2.Timestamp
    start_time: _timestamp_pb2.Timestamp
    treasury_account: str
    vester_account: str
    def __init__(self, vester_account: _Optional[str] = ..., treasury_account: _Optional[str] = ..., denom: _Optional[str] = ..., start_time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ..., end_time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...
