from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.assets import asset_pb2 as _asset_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllAssetsRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryAllAssetsResponse(_message.Message):
    __slots__ = ["asset", "pagination"]
    ASSET_FIELD_NUMBER: _ClassVar[int]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    asset: _containers.RepeatedCompositeFieldContainer[_asset_pb2.Asset]
    pagination: _pagination_pb2.PageResponse
    def __init__(self, asset: _Optional[_Iterable[_Union[_asset_pb2.Asset, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QueryAssetRequest(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class QueryAssetResponse(_message.Message):
    __slots__ = ["asset"]
    ASSET_FIELD_NUMBER: _ClassVar[int]
    asset: _asset_pb2.Asset
    def __init__(self, asset: _Optional[_Union[_asset_pb2.Asset, _Mapping]] = ...) -> None: ...
