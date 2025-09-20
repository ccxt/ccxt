from v4_proto.dydxprotocol.clob import clob_pair_pb2 as _clob_pair_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ClobStagedFinalizeBlockEvent(_message.Message):
    __slots__ = ["create_clob_pair"]
    CREATE_CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    create_clob_pair: _clob_pair_pb2.ClobPair
    def __init__(self, create_clob_pair: _Optional[_Union[_clob_pair_pb2.ClobPair, _Mapping]] = ...) -> None: ...
