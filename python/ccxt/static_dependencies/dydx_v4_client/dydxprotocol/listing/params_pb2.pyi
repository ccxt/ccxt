from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ListingVaultDepositParams(_message.Message):
    __slots__ = ["main_vault_deposit_amount", "new_vault_deposit_amount", "num_blocks_to_lock_shares"]
    MAIN_VAULT_DEPOSIT_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    NEW_VAULT_DEPOSIT_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    NUM_BLOCKS_TO_LOCK_SHARES_FIELD_NUMBER: _ClassVar[int]
    main_vault_deposit_amount: bytes
    new_vault_deposit_amount: bytes
    num_blocks_to_lock_shares: int
    def __init__(self, new_vault_deposit_amount: _Optional[bytes] = ..., main_vault_deposit_amount: _Optional[bytes] = ..., num_blocks_to_lock_shares: _Optional[int] = ...) -> None: ...
