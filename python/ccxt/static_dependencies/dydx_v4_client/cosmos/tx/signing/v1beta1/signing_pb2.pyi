from v4_proto.cosmos.crypto.multisig.v1beta1 import multisig_pb2 as _multisig_pb2
from google.protobuf import any_pb2 as _any_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
SIGN_MODE_DIRECT: SignMode
SIGN_MODE_DIRECT_AUX: SignMode
SIGN_MODE_EIP_191: SignMode
SIGN_MODE_LEGACY_AMINO_JSON: SignMode
SIGN_MODE_TEXTUAL: SignMode
SIGN_MODE_UNSPECIFIED: SignMode

class SignatureDescriptor(_message.Message):
    __slots__ = ["data", "public_key", "sequence"]
    class Data(_message.Message):
        __slots__ = ["multi", "single"]
        class Multi(_message.Message):
            __slots__ = ["bitarray", "signatures"]
            BITARRAY_FIELD_NUMBER: _ClassVar[int]
            SIGNATURES_FIELD_NUMBER: _ClassVar[int]
            bitarray: _multisig_pb2.CompactBitArray
            signatures: _containers.RepeatedCompositeFieldContainer[SignatureDescriptor.Data]
            def __init__(self, bitarray: _Optional[_Union[_multisig_pb2.CompactBitArray, _Mapping]] = ..., signatures: _Optional[_Iterable[_Union[SignatureDescriptor.Data, _Mapping]]] = ...) -> None: ...
        class Single(_message.Message):
            __slots__ = ["mode", "signature"]
            MODE_FIELD_NUMBER: _ClassVar[int]
            SIGNATURE_FIELD_NUMBER: _ClassVar[int]
            mode: SignMode
            signature: bytes
            def __init__(self, mode: _Optional[_Union[SignMode, str]] = ..., signature: _Optional[bytes] = ...) -> None: ...
        MULTI_FIELD_NUMBER: _ClassVar[int]
        SINGLE_FIELD_NUMBER: _ClassVar[int]
        multi: SignatureDescriptor.Data.Multi
        single: SignatureDescriptor.Data.Single
        def __init__(self, single: _Optional[_Union[SignatureDescriptor.Data.Single, _Mapping]] = ..., multi: _Optional[_Union[SignatureDescriptor.Data.Multi, _Mapping]] = ...) -> None: ...
    DATA_FIELD_NUMBER: _ClassVar[int]
    PUBLIC_KEY_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    data: SignatureDescriptor.Data
    public_key: _any_pb2.Any
    sequence: int
    def __init__(self, public_key: _Optional[_Union[_any_pb2.Any, _Mapping]] = ..., data: _Optional[_Union[SignatureDescriptor.Data, _Mapping]] = ..., sequence: _Optional[int] = ...) -> None: ...

class SignatureDescriptors(_message.Message):
    __slots__ = ["signatures"]
    SIGNATURES_FIELD_NUMBER: _ClassVar[int]
    signatures: _containers.RepeatedCompositeFieldContainer[SignatureDescriptor]
    def __init__(self, signatures: _Optional[_Iterable[_Union[SignatureDescriptor, _Mapping]]] = ...) -> None: ...

class SignMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
