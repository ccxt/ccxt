from v4_proto.dydxprotocol.sending import transfer_pb2 as _transfer_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgCreateTransfer(_message.Message):
    __slots__ = ["transfer"]
    TRANSFER_FIELD_NUMBER: _ClassVar[int]
    transfer: _transfer_pb2.Transfer
    def __init__(self, transfer: _Optional[_Union[_transfer_pb2.Transfer, _Mapping]] = ...) -> None: ...

class MsgCreateTransferResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgDepositToSubaccountResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSendFromModuleToAccountResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgWithdrawFromSubaccountResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
