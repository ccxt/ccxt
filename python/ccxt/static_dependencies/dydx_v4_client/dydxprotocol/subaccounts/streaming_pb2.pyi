from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class StreamSubaccountUpdate(_message.Message):
    __slots__ = ["snapshot", "subaccount_id", "updated_asset_positions", "updated_perpetual_positions"]
    SNAPSHOT_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    UPDATED_ASSET_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    UPDATED_PERPETUAL_POSITIONS_FIELD_NUMBER: _ClassVar[int]
    snapshot: bool
    subaccount_id: _subaccount_pb2.SubaccountId
    updated_asset_positions: _containers.RepeatedCompositeFieldContainer[SubaccountAssetPosition]
    updated_perpetual_positions: _containers.RepeatedCompositeFieldContainer[SubaccountPerpetualPosition]
    def __init__(self, subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., updated_perpetual_positions: _Optional[_Iterable[_Union[SubaccountPerpetualPosition, _Mapping]]] = ..., updated_asset_positions: _Optional[_Iterable[_Union[SubaccountAssetPosition, _Mapping]]] = ..., snapshot: bool = ...) -> None: ...

class SubaccountAssetPosition(_message.Message):
    __slots__ = ["asset_id", "quantums"]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    asset_id: int
    quantums: int
    def __init__(self, asset_id: _Optional[int] = ..., quantums: _Optional[int] = ...) -> None: ...

class SubaccountPerpetualPosition(_message.Message):
    __slots__ = ["perpetual_id", "quantums"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    quantums: int
    def __init__(self, perpetual_id: _Optional[int] = ..., quantums: _Optional[int] = ...) -> None: ...
