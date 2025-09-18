from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf import any_pb2 as _any_pb2
from v4_proto.amino import amino_pb2 as _amino_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class LegacyAminoPubKey(_message.Message):
    __slots__ = ["public_keys", "threshold"]
    PUBLIC_KEYS_FIELD_NUMBER: _ClassVar[int]
    THRESHOLD_FIELD_NUMBER: _ClassVar[int]
    public_keys: _containers.RepeatedCompositeFieldContainer[_any_pb2.Any]
    threshold: int
    def __init__(self, threshold: _Optional[int] = ..., public_keys: _Optional[_Iterable[_Union[_any_pb2.Any, _Mapping]]] = ...) -> None: ...
