from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class IndexerAssetPosition(_message.Message):
    __slots__ = ["asset_id", "index", "quantums"]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    INDEX_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    asset_id: int
    index: int
    quantums: bytes
    def __init__(self, asset_id: _Optional[int] = ..., quantums: _Optional[bytes] = ..., index: _Optional[int] = ...) -> None: ...

class IndexerPerpetualPosition(_message.Message):
    __slots__ = ["funding_index", "funding_payment", "perpetual_id", "quantums"]
    FUNDING_INDEX_FIELD_NUMBER: _ClassVar[int]
    FUNDING_PAYMENT_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    funding_index: bytes
    funding_payment: bytes
    perpetual_id: int
    quantums: bytes
    def __init__(self, perpetual_id: _Optional[int] = ..., quantums: _Optional[bytes] = ..., funding_index: _Optional[bytes] = ..., funding_payment: _Optional[bytes] = ...) -> None: ...

class IndexerSubaccountId(_message.Message):
    __slots__ = ["number", "owner"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    number: int
    owner: str
    def __init__(self, owner: _Optional[str] = ..., number: _Optional[int] = ...) -> None: ...
