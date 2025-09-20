from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.dydxprotocol.subaccounts import asset_position_pb2 as _asset_position_pb2
from v4_proto.dydxprotocol.subaccounts import perpetual_position_pb2 as _perpetual_position_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Subaccount(_message.Message):
    __slots__ = ["asset_positions", "id", "margin_enabled", "perpetual_positions"]
    ASSET_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MARGIN_ENABLED_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    asset_positions: _containers.RepeatedCompositeFieldContainer[_asset_position_pb2.AssetPosition]
    id: SubaccountId
    margin_enabled: bool
    perpetual_positions: _containers.RepeatedCompositeFieldContainer[_perpetual_position_pb2.PerpetualPosition]
    def __init__(self, id: _Optional[_Union[SubaccountId, _Mapping]] = ..., asset_positions: _Optional[_Iterable[_Union[_asset_position_pb2.AssetPosition, _Mapping]]] = ..., perpetual_positions: _Optional[_Iterable[_Union[_perpetual_position_pb2.PerpetualPosition, _Mapping]]] = ..., margin_enabled: bool = ...) -> None: ...

class SubaccountId(_message.Message):
    __slots__ = ["number", "owner"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    number: int
    owner: str
    def __init__(self, owner: _Optional[str] = ..., number: _Optional[int] = ...) -> None: ...
