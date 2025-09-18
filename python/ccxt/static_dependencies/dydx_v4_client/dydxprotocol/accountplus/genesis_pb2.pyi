from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.accountplus import accountplus_pb2 as _accountplus_pb2
from v4_proto.dydxprotocol.accountplus import models_pb2 as _models_pb2
from v4_proto.dydxprotocol.accountplus import params_pb2 as _params_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AuthenticatorData(_message.Message):
    __slots__ = ["address", "authenticators"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    AUTHENTICATORS_FIELD_NUMBER: _ClassVar[int]
    address: str
    authenticators: _containers.RepeatedCompositeFieldContainer[_models_pb2.AccountAuthenticator]
    def __init__(self, address: _Optional[str] = ..., authenticators: _Optional[_Iterable[_Union[_models_pb2.AccountAuthenticator, _Mapping]]] = ...) -> None: ...

class GenesisState(_message.Message):
    __slots__ = ["accounts", "authenticator_data", "next_authenticator_id", "params"]
    ACCOUNTS_FIELD_NUMBER: _ClassVar[int]
    AUTHENTICATOR_DATA_FIELD_NUMBER: _ClassVar[int]
    NEXT_AUTHENTICATOR_ID_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    accounts: _containers.RepeatedCompositeFieldContainer[_accountplus_pb2.AccountState]
    authenticator_data: _containers.RepeatedCompositeFieldContainer[AuthenticatorData]
    next_authenticator_id: int
    params: _params_pb2.Params
    def __init__(self, accounts: _Optional[_Iterable[_Union[_accountplus_pb2.AccountState, _Mapping]]] = ..., params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ..., next_authenticator_id: _Optional[int] = ..., authenticator_data: _Optional[_Iterable[_Union[AuthenticatorData, _Mapping]]] = ...) -> None: ...
