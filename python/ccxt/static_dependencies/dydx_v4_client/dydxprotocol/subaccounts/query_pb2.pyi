from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.cosmos.base.query.v1beta1 import pagination_pb2 as _pagination_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class QueryAllSubaccountRequest(_message.Message):
    __slots__ = ["pagination"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageRequest
    def __init__(self, pagination: _Optional[_Union[_pagination_pb2.PageRequest, _Mapping]] = ...) -> None: ...

class QueryCollateralPoolAddressRequest(_message.Message):
    __slots__ = ["perpetual_id"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    def __init__(self, perpetual_id: _Optional[int] = ...) -> None: ...

class QueryCollateralPoolAddressResponse(_message.Message):
    __slots__ = ["collateral_pool_address"]
    COLLATERAL_POOL_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    collateral_pool_address: str
    def __init__(self, collateral_pool_address: _Optional[str] = ...) -> None: ...

class QueryGetSubaccountRequest(_message.Message):
    __slots__ = ["number", "owner"]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    number: int
    owner: str
    def __init__(self, owner: _Optional[str] = ..., number: _Optional[int] = ...) -> None: ...

class QueryGetWithdrawalAndTransfersBlockedInfoRequest(_message.Message):
    __slots__ = ["perpetual_id"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    def __init__(self, perpetual_id: _Optional[int] = ...) -> None: ...

class QueryGetWithdrawalAndTransfersBlockedInfoResponse(_message.Message):
    __slots__ = ["chain_outage_seen_at_block", "negative_tnc_subaccount_seen_at_block", "withdrawals_and_transfers_unblocked_at_block"]
    CHAIN_OUTAGE_SEEN_AT_BLOCK_FIELD_NUMBER: _ClassVar[int]
    NEGATIVE_TNC_SUBACCOUNT_SEEN_AT_BLOCK_FIELD_NUMBER: _ClassVar[int]
    WITHDRAWALS_AND_TRANSFERS_UNBLOCKED_AT_BLOCK_FIELD_NUMBER: _ClassVar[int]
    chain_outage_seen_at_block: int
    negative_tnc_subaccount_seen_at_block: int
    withdrawals_and_transfers_unblocked_at_block: int
    def __init__(self, negative_tnc_subaccount_seen_at_block: _Optional[int] = ..., chain_outage_seen_at_block: _Optional[int] = ..., withdrawals_and_transfers_unblocked_at_block: _Optional[int] = ...) -> None: ...

class QuerySubaccountAllResponse(_message.Message):
    __slots__ = ["pagination", "subaccount"]
    PAGINATION_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_FIELD_NUMBER: _ClassVar[int]
    pagination: _pagination_pb2.PageResponse
    subaccount: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.Subaccount]
    def __init__(self, subaccount: _Optional[_Iterable[_Union[_subaccount_pb2.Subaccount, _Mapping]]] = ..., pagination: _Optional[_Union[_pagination_pb2.PageResponse, _Mapping]] = ...) -> None: ...

class QuerySubaccountResponse(_message.Message):
    __slots__ = ["subaccount"]
    SUBACCOUNT_FIELD_NUMBER: _ClassVar[int]
    subaccount: _subaccount_pb2.Subaccount
    def __init__(self, subaccount: _Optional[_Union[_subaccount_pb2.Subaccount, _Mapping]] = ...) -> None: ...
