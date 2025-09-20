from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Coin(_message.Message):
    __slots__ = ["amount", "denom"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    amount: str
    denom: str
    def __init__(self, denom: _Optional[str] = ..., amount: _Optional[str] = ...) -> None: ...

class DecCoin(_message.Message):
    __slots__ = ["amount", "denom"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    DENOM_FIELD_NUMBER: _ClassVar[int]
    amount: str
    denom: str
    def __init__(self, denom: _Optional[str] = ..., amount: _Optional[str] = ...) -> None: ...

class DecProto(_message.Message):
    __slots__ = ["dec"]
    DEC_FIELD_NUMBER: _ClassVar[int]
    dec: str
    def __init__(self, dec: _Optional[str] = ...) -> None: ...

class IntProto(_message.Message):
    __slots__ = ["int"]
    INT_FIELD_NUMBER: _ClassVar[int]
    int: str
    def __init__(self, int: _Optional[str] = ...) -> None: ...
