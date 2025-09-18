from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ListAllInterfacesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class ListAllInterfacesResponse(_message.Message):
    __slots__ = ["interface_names"]
    INTERFACE_NAMES_FIELD_NUMBER: _ClassVar[int]
    interface_names: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, interface_names: _Optional[_Iterable[str]] = ...) -> None: ...

class ListImplementationsRequest(_message.Message):
    __slots__ = ["interface_name"]
    INTERFACE_NAME_FIELD_NUMBER: _ClassVar[int]
    interface_name: str
    def __init__(self, interface_name: _Optional[str] = ...) -> None: ...

class ListImplementationsResponse(_message.Message):
    __slots__ = ["implementation_message_names"]
    IMPLEMENTATION_MESSAGE_NAMES_FIELD_NUMBER: _ClassVar[int]
    implementation_message_names: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, implementation_message_names: _Optional[_Iterable[str]] = ...) -> None: ...
