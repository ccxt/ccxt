from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class CompactBitArray(_message.Message):
    __slots__ = ["elems", "extra_bits_stored"]
    ELEMS_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BITS_STORED_FIELD_NUMBER: _ClassVar[int]
    elems: bytes
    extra_bits_stored: int
    def __init__(self, extra_bits_stored: _Optional[int] = ..., elems: _Optional[bytes] = ...) -> None: ...

class MultiSignature(_message.Message):
    __slots__ = ["signatures"]
    SIGNATURES_FIELD_NUMBER: _ClassVar[int]
    signatures: _containers.RepeatedScalarFieldContainer[bytes]
    def __init__(self, signatures: _Optional[_Iterable[bytes]] = ...) -> None: ...
