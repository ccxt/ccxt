from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class NumShares(_message.Message):
    __slots__ = ["num_shares"]
    NUM_SHARES_FIELD_NUMBER: _ClassVar[int]
    num_shares: bytes
    def __init__(self, num_shares: _Optional[bytes] = ...) -> None: ...

class OwnerShare(_message.Message):
    __slots__ = ["owner", "shares"]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    owner: str
    shares: NumShares
    def __init__(self, owner: _Optional[str] = ..., shares: _Optional[_Union[NumShares, _Mapping]] = ...) -> None: ...

class OwnerShareUnlocks(_message.Message):
    __slots__ = ["owner_address", "share_unlocks"]
    OWNER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    SHARE_UNLOCKS_FIELD_NUMBER: _ClassVar[int]
    owner_address: str
    share_unlocks: _containers.RepeatedCompositeFieldContainer[ShareUnlock]
    def __init__(self, owner_address: _Optional[str] = ..., share_unlocks: _Optional[_Iterable[_Union[ShareUnlock, _Mapping]]] = ...) -> None: ...

class ShareUnlock(_message.Message):
    __slots__ = ["shares", "unlock_block_height"]
    SHARES_FIELD_NUMBER: _ClassVar[int]
    UNLOCK_BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    shares: NumShares
    unlock_block_height: int
    def __init__(self, shares: _Optional[_Union[NumShares, _Mapping]] = ..., unlock_block_height: _Optional[int] = ...) -> None: ...
