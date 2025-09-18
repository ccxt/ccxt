from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class MarketMapperRevenueShareParams(_message.Message):
    __slots__ = ["address", "revenue_share_ppm", "valid_days"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    REVENUE_SHARE_PPM_FIELD_NUMBER: _ClassVar[int]
    VALID_DAYS_FIELD_NUMBER: _ClassVar[int]
    address: str
    revenue_share_ppm: int
    valid_days: int
    def __init__(self, address: _Optional[str] = ..., revenue_share_ppm: _Optional[int] = ..., valid_days: _Optional[int] = ...) -> None: ...
