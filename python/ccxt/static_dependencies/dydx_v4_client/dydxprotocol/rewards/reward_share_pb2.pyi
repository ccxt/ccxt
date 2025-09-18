from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class RewardShare(_message.Message):
    __slots__ = ["address", "weight"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    WEIGHT_FIELD_NUMBER: _ClassVar[int]
    address: str
    weight: bytes
    def __init__(self, address: _Optional[str] = ..., weight: _Optional[bytes] = ...) -> None: ...
