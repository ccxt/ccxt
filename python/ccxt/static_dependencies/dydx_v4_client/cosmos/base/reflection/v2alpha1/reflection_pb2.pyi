from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AppDescriptor(_message.Message):
    __slots__ = ["authn", "chain", "codec", "configuration", "query_services", "tx"]
    AUTHN_FIELD_NUMBER: _ClassVar[int]
    CHAIN_FIELD_NUMBER: _ClassVar[int]
    CODEC_FIELD_NUMBER: _ClassVar[int]
    CONFIGURATION_FIELD_NUMBER: _ClassVar[int]
    QUERY_SERVICES_FIELD_NUMBER: _ClassVar[int]
    TX_FIELD_NUMBER: _ClassVar[int]
    authn: AuthnDescriptor
    chain: ChainDescriptor
    codec: CodecDescriptor
    configuration: ConfigurationDescriptor
    query_services: QueryServicesDescriptor
    tx: TxDescriptor
    def __init__(self, authn: _Optional[_Union[AuthnDescriptor, _Mapping]] = ..., chain: _Optional[_Union[ChainDescriptor, _Mapping]] = ..., codec: _Optional[_Union[CodecDescriptor, _Mapping]] = ..., configuration: _Optional[_Union[ConfigurationDescriptor, _Mapping]] = ..., query_services: _Optional[_Union[QueryServicesDescriptor, _Mapping]] = ..., tx: _Optional[_Union[TxDescriptor, _Mapping]] = ...) -> None: ...

class AuthnDescriptor(_message.Message):
    __slots__ = ["sign_modes"]
    SIGN_MODES_FIELD_NUMBER: _ClassVar[int]
    sign_modes: _containers.RepeatedCompositeFieldContainer[SigningModeDescriptor]
    def __init__(self, sign_modes: _Optional[_Iterable[_Union[SigningModeDescriptor, _Mapping]]] = ...) -> None: ...

class ChainDescriptor(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class CodecDescriptor(_message.Message):
    __slots__ = ["interfaces"]
    INTERFACES_FIELD_NUMBER: _ClassVar[int]
    interfaces: _containers.RepeatedCompositeFieldContainer[InterfaceDescriptor]
    def __init__(self, interfaces: _Optional[_Iterable[_Union[InterfaceDescriptor, _Mapping]]] = ...) -> None: ...

class ConfigurationDescriptor(_message.Message):
    __slots__ = ["bech32_account_address_prefix"]
    BECH32_ACCOUNT_ADDRESS_PREFIX_FIELD_NUMBER: _ClassVar[int]
    bech32_account_address_prefix: str
    def __init__(self, bech32_account_address_prefix: _Optional[str] = ...) -> None: ...

class GetAuthnDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetAuthnDescriptorResponse(_message.Message):
    __slots__ = ["authn"]
    AUTHN_FIELD_NUMBER: _ClassVar[int]
    authn: AuthnDescriptor
    def __init__(self, authn: _Optional[_Union[AuthnDescriptor, _Mapping]] = ...) -> None: ...

class GetChainDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetChainDescriptorResponse(_message.Message):
    __slots__ = ["chain"]
    CHAIN_FIELD_NUMBER: _ClassVar[int]
    chain: ChainDescriptor
    def __init__(self, chain: _Optional[_Union[ChainDescriptor, _Mapping]] = ...) -> None: ...

class GetCodecDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetCodecDescriptorResponse(_message.Message):
    __slots__ = ["codec"]
    CODEC_FIELD_NUMBER: _ClassVar[int]
    codec: CodecDescriptor
    def __init__(self, codec: _Optional[_Union[CodecDescriptor, _Mapping]] = ...) -> None: ...

class GetConfigurationDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetConfigurationDescriptorResponse(_message.Message):
    __slots__ = ["config"]
    CONFIG_FIELD_NUMBER: _ClassVar[int]
    config: ConfigurationDescriptor
    def __init__(self, config: _Optional[_Union[ConfigurationDescriptor, _Mapping]] = ...) -> None: ...

class GetQueryServicesDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetQueryServicesDescriptorResponse(_message.Message):
    __slots__ = ["queries"]
    QUERIES_FIELD_NUMBER: _ClassVar[int]
    queries: QueryServicesDescriptor
    def __init__(self, queries: _Optional[_Union[QueryServicesDescriptor, _Mapping]] = ...) -> None: ...

class GetTxDescriptorRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetTxDescriptorResponse(_message.Message):
    __slots__ = ["tx"]
    TX_FIELD_NUMBER: _ClassVar[int]
    tx: TxDescriptor
    def __init__(self, tx: _Optional[_Union[TxDescriptor, _Mapping]] = ...) -> None: ...

class InterfaceAcceptingMessageDescriptor(_message.Message):
    __slots__ = ["field_descriptor_names", "fullname"]
    FIELD_DESCRIPTOR_NAMES_FIELD_NUMBER: _ClassVar[int]
    FULLNAME_FIELD_NUMBER: _ClassVar[int]
    field_descriptor_names: _containers.RepeatedScalarFieldContainer[str]
    fullname: str
    def __init__(self, fullname: _Optional[str] = ..., field_descriptor_names: _Optional[_Iterable[str]] = ...) -> None: ...

class InterfaceDescriptor(_message.Message):
    __slots__ = ["fullname", "interface_accepting_messages", "interface_implementers"]
    FULLNAME_FIELD_NUMBER: _ClassVar[int]
    INTERFACE_ACCEPTING_MESSAGES_FIELD_NUMBER: _ClassVar[int]
    INTERFACE_IMPLEMENTERS_FIELD_NUMBER: _ClassVar[int]
    fullname: str
    interface_accepting_messages: _containers.RepeatedCompositeFieldContainer[InterfaceAcceptingMessageDescriptor]
    interface_implementers: _containers.RepeatedCompositeFieldContainer[InterfaceImplementerDescriptor]
    def __init__(self, fullname: _Optional[str] = ..., interface_accepting_messages: _Optional[_Iterable[_Union[InterfaceAcceptingMessageDescriptor, _Mapping]]] = ..., interface_implementers: _Optional[_Iterable[_Union[InterfaceImplementerDescriptor, _Mapping]]] = ...) -> None: ...

class InterfaceImplementerDescriptor(_message.Message):
    __slots__ = ["fullname", "type_url"]
    FULLNAME_FIELD_NUMBER: _ClassVar[int]
    TYPE_URL_FIELD_NUMBER: _ClassVar[int]
    fullname: str
    type_url: str
    def __init__(self, fullname: _Optional[str] = ..., type_url: _Optional[str] = ...) -> None: ...

class MsgDescriptor(_message.Message):
    __slots__ = ["msg_type_url"]
    MSG_TYPE_URL_FIELD_NUMBER: _ClassVar[int]
    msg_type_url: str
    def __init__(self, msg_type_url: _Optional[str] = ...) -> None: ...

class QueryMethodDescriptor(_message.Message):
    __slots__ = ["full_query_path", "name"]
    FULL_QUERY_PATH_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    full_query_path: str
    name: str
    def __init__(self, name: _Optional[str] = ..., full_query_path: _Optional[str] = ...) -> None: ...

class QueryServiceDescriptor(_message.Message):
    __slots__ = ["fullname", "is_module", "methods"]
    FULLNAME_FIELD_NUMBER: _ClassVar[int]
    IS_MODULE_FIELD_NUMBER: _ClassVar[int]
    METHODS_FIELD_NUMBER: _ClassVar[int]
    fullname: str
    is_module: bool
    methods: _containers.RepeatedCompositeFieldContainer[QueryMethodDescriptor]
    def __init__(self, fullname: _Optional[str] = ..., is_module: bool = ..., methods: _Optional[_Iterable[_Union[QueryMethodDescriptor, _Mapping]]] = ...) -> None: ...

class QueryServicesDescriptor(_message.Message):
    __slots__ = ["query_services"]
    QUERY_SERVICES_FIELD_NUMBER: _ClassVar[int]
    query_services: _containers.RepeatedCompositeFieldContainer[QueryServiceDescriptor]
    def __init__(self, query_services: _Optional[_Iterable[_Union[QueryServiceDescriptor, _Mapping]]] = ...) -> None: ...

class SigningModeDescriptor(_message.Message):
    __slots__ = ["authn_info_provider_method_fullname", "name", "number"]
    AUTHN_INFO_PROVIDER_METHOD_FULLNAME_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    NUMBER_FIELD_NUMBER: _ClassVar[int]
    authn_info_provider_method_fullname: str
    name: str
    number: int
    def __init__(self, name: _Optional[str] = ..., number: _Optional[int] = ..., authn_info_provider_method_fullname: _Optional[str] = ...) -> None: ...

class TxDescriptor(_message.Message):
    __slots__ = ["fullname", "msgs"]
    FULLNAME_FIELD_NUMBER: _ClassVar[int]
    MSGS_FIELD_NUMBER: _ClassVar[int]
    fullname: str
    msgs: _containers.RepeatedCompositeFieldContainer[MsgDescriptor]
    def __init__(self, fullname: _Optional[str] = ..., msgs: _Optional[_Iterable[_Union[MsgDescriptor, _Mapping]]] = ...) -> None: ...
