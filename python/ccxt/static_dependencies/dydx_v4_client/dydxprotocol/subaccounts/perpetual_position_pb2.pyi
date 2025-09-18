from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class PerpetualPosition(_message.Message):
    __slots__ = ["funding_index", "perpetual_id", "quantums", "quote_balance"]
    FUNDING_INDEX_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    QUOTE_BALANCE_FIELD_NUMBER: _ClassVar[int]
    funding_index: bytes
    perpetual_id: int
    quantums: bytes
    quote_balance: bytes
    def __init__(self, perpetual_id: _Optional[int] = ..., quantums: _Optional[bytes] = ..., funding_index: _Optional[bytes] = ..., quote_balance: _Optional[bytes] = ...) -> None: ...
