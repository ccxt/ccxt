from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
VAULT_STATUS_CLOSE_ONLY: VaultStatus
VAULT_STATUS_DEACTIVATED: VaultStatus
VAULT_STATUS_QUOTING: VaultStatus
VAULT_STATUS_STAND_BY: VaultStatus
VAULT_STATUS_UNSPECIFIED: VaultStatus
VAULT_TYPE_CLOB: VaultType
VAULT_TYPE_UNSPECIFIED: VaultType

class VaultId(_message.Message):
    __slots__ = ["number", "type"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    number: int
    type: VaultType
    def __init__(self, type: _Optional[_Union[VaultType, str]] = ..., number: _Optional[int] = ...) -> None: ...

class VaultType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class VaultStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
