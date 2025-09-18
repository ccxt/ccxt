from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class MsgSlashValidator(_message.Message):
    __slots__ = ["authority", "infraction_height", "slash_factor", "tokens_at_infraction_height", "validator_address"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    INFRACTION_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    SLASH_FACTOR_FIELD_NUMBER: _ClassVar[int]
    TOKENS_AT_INFRACTION_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    VALIDATOR_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    infraction_height: int
    slash_factor: str
    tokens_at_infraction_height: bytes
    validator_address: str
    def __init__(self, authority: _Optional[str] = ..., validator_address: _Optional[str] = ..., infraction_height: _Optional[int] = ..., tokens_at_infraction_height: _Optional[bytes] = ..., slash_factor: _Optional[str] = ...) -> None: ...

class MsgSlashValidatorResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
