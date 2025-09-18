from google.protobuf import descriptor_pb2 as _descriptor_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional, Union as _Union

ACCEPTS_INTERFACE_FIELD_NUMBER: _ClassVar[int]
DECLARE_INTERFACE_FIELD_NUMBER: _ClassVar[int]
DECLARE_SCALAR_FIELD_NUMBER: _ClassVar[int]
DESCRIPTOR: _descriptor.FileDescriptor
IMPLEMENTS_INTERFACE_FIELD_NUMBER: _ClassVar[int]
SCALAR_FIELD_NUMBER: _ClassVar[int]
SCALAR_TYPE_BYTES: ScalarType
SCALAR_TYPE_STRING: ScalarType
SCALAR_TYPE_UNSPECIFIED: ScalarType
accepts_interface: _descriptor.FieldDescriptor
declare_interface: _descriptor.FieldDescriptor
declare_scalar: _descriptor.FieldDescriptor
implements_interface: _descriptor.FieldDescriptor
scalar: _descriptor.FieldDescriptor

class InterfaceDescriptor(_message.Message):
    __slots__ = ["description", "name"]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    description: str
    name: str
    def __init__(self, name: _Optional[str] = ..., description: _Optional[str] = ...) -> None: ...

class ScalarDescriptor(_message.Message):
    __slots__ = ["description", "field_type", "name"]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    FIELD_TYPE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    description: str
    field_type: _containers.RepeatedScalarFieldContainer[ScalarType]
    name: str
    def __init__(self, name: _Optional[str] = ..., description: _Optional[str] = ..., field_type: _Optional[_Iterable[_Union[ScalarType, str]]] = ...) -> None: ...

class ScalarType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
