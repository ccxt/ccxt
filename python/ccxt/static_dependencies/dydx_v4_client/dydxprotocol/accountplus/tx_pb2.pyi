from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class MsgAddAuthenticator(_message.Message):
    __slots__ = ["authenticator_type", "data", "sender"]
    AUTHENTICATOR_TYPE_FIELD_NUMBER: _ClassVar[int]
    DATA_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    authenticator_type: str
    data: bytes
    sender: str
    def __init__(self, sender: _Optional[str] = ..., authenticator_type: _Optional[str] = ..., data: _Optional[bytes] = ...) -> None: ...

class MsgAddAuthenticatorResponse(_message.Message):
    __slots__ = ["success"]
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    success: bool
    def __init__(self, success: bool = ...) -> None: ...

class MsgRemoveAuthenticator(_message.Message):
    __slots__ = ["id", "sender"]
    ID_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    id: int
    sender: str
    def __init__(self, sender: _Optional[str] = ..., id: _Optional[int] = ...) -> None: ...

class MsgRemoveAuthenticatorResponse(_message.Message):
    __slots__ = ["success"]
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    success: bool
    def __init__(self, success: bool = ...) -> None: ...

class MsgSetActiveState(_message.Message):
    __slots__ = ["active", "authority"]
    ACTIVE_FIELD_NUMBER: _ClassVar[int]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    active: bool
    authority: str
    def __init__(self, authority: _Optional[str] = ..., active: bool = ...) -> None: ...

class MsgSetActiveStateResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class TxExtension(_message.Message):
    __slots__ = ["selected_authenticators"]
    SELECTED_AUTHENTICATORS_FIELD_NUMBER: _ClassVar[int]
    selected_authenticators: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, selected_authenticators: _Optional[_Iterable[int]] = ...) -> None: ...
