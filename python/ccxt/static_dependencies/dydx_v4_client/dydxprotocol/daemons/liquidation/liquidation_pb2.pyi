from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.clob import liquidations_pb2 as _liquidations_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class LiquidateSubaccountsRequest(_message.Message):
    __slots__ = ["block_height", "liquidatable_subaccount_ids", "negative_tnc_subaccount_ids", "subaccount_open_position_info"]
    BLOCK_HEIGHT_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATABLE_SUBACCOUNT_IDS_FIELD_NUMBER: _ClassVar[int]
    NEGATIVE_TNC_SUBACCOUNT_IDS_FIELD_NUMBER: _ClassVar[int]
    SUBACCOUNT_OPEN_POSITION_INFO_FIELD_NUMBER: _ClassVar[int]
    block_height: int
    liquidatable_subaccount_ids: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.SubaccountId]
    negative_tnc_subaccount_ids: _containers.RepeatedCompositeFieldContainer[_subaccount_pb2.SubaccountId]
    subaccount_open_position_info: _containers.RepeatedCompositeFieldContainer[_liquidations_pb2.SubaccountOpenPositionInfo]
    def __init__(self, block_height: _Optional[int] = ..., liquidatable_subaccount_ids: _Optional[_Iterable[_Union[_subaccount_pb2.SubaccountId, _Mapping]]] = ..., negative_tnc_subaccount_ids: _Optional[_Iterable[_Union[_subaccount_pb2.SubaccountId, _Mapping]]] = ..., subaccount_open_position_info: _Optional[_Iterable[_Union[_liquidations_pb2.SubaccountOpenPositionInfo, _Mapping]]] = ...) -> None: ...

class LiquidateSubaccountsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
