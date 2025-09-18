from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from typing import ClassVar as _ClassVar

DESCRIPTOR: _descriptor.FileDescriptor
VAULT_STATUS_CLOSE_ONLY: VaultStatus
VAULT_STATUS_DEACTIVATED: VaultStatus
VAULT_STATUS_QUOTING: VaultStatus
VAULT_STATUS_STAND_BY: VaultStatus
VAULT_STATUS_UNSPECIFIED: VaultStatus

class VaultStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
