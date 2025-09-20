from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.base.v1beta1 import coin_pb2 as _coin_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgDepositToSubaccount(_message.Message):
    __slots__ = ["asset_id", "quantums", "recipient", "sender"]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    asset_id: int
    quantums: int
    recipient: _subaccount_pb2.SubaccountId
    sender: str
    def __init__(self, sender: _Optional[str] = ..., recipient: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., asset_id: _Optional[int] = ..., quantums: _Optional[int] = ...) -> None: ...

class MsgSendFromModuleToAccount(_message.Message):
    __slots__ = ["authority", "coin", "recipient", "sender_module_name"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    COIN_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_FIELD_NUMBER: _ClassVar[int]
    SENDER_MODULE_NAME_FIELD_NUMBER: _ClassVar[int]
    authority: str
    coin: _coin_pb2.Coin
    recipient: str
    sender_module_name: str
    def __init__(self, authority: _Optional[str] = ..., sender_module_name: _Optional[str] = ..., recipient: _Optional[str] = ..., coin: _Optional[_Union[_coin_pb2.Coin, _Mapping]] = ...) -> None: ...

class MsgWithdrawFromSubaccount(_message.Message):
    __slots__ = ["asset_id", "quantums", "recipient", "sender"]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    asset_id: int
    quantums: int
    recipient: str
    sender: _subaccount_pb2.SubaccountId
    def __init__(self, sender: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., recipient: _Optional[str] = ..., asset_id: _Optional[int] = ..., quantums: _Optional[int] = ...) -> None: ...

class Transfer(_message.Message):
    __slots__ = ["amount", "asset_id", "recipient", "sender"]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    ASSET_ID_FIELD_NUMBER: _ClassVar[int]
    RECIPIENT_FIELD_NUMBER: _ClassVar[int]
    SENDER_FIELD_NUMBER: _ClassVar[int]
    amount: int
    asset_id: int
    recipient: _subaccount_pb2.SubaccountId
    sender: _subaccount_pb2.SubaccountId
    def __init__(self, sender: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., recipient: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., asset_id: _Optional[int] = ..., amount: _Optional[int] = ...) -> None: ...
