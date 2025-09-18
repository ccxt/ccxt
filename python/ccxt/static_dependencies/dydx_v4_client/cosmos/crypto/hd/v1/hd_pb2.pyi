from v4_proto.amino import amino_pb2 as _amino_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class BIP44Params(_message.Message):
    __slots__ = ["account", "address_index", "change", "coin_type", "purpose"]
    ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_INDEX_FIELD_NUMBER: _ClassVar[int]
    CHANGE_FIELD_NUMBER: _ClassVar[int]
    COIN_TYPE_FIELD_NUMBER: _ClassVar[int]
    PURPOSE_FIELD_NUMBER: _ClassVar[int]
    account: int
    address_index: int
    change: bool
    coin_type: int
    purpose: int
    def __init__(self, purpose: _Optional[int] = ..., coin_type: _Optional[int] = ..., account: _Optional[int] = ..., change: bool = ..., address_index: _Optional[int] = ...) -> None: ...
