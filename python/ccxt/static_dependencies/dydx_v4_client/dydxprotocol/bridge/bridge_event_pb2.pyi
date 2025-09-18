from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.base.v1beta1 import coin_pb2 as _coin_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BridgeEvent(_message.Message):
    __slots__ = ["address", "coin", "eth_block_height", "id"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    COIN_FIELD_NUMBER: _ClassVar[int]
    ETH_BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    address: str
    coin: _coin_pb2.Coin
    eth_block_height: int
    id: int
    def __init__(self, id: _Optional[int] = ..., coin: _Optional[_Union[_coin_pb2.Coin, _Mapping]] = ..., address: _Optional[str] = ..., eth_block_height: _Optional[int] = ...) -> None: ...
