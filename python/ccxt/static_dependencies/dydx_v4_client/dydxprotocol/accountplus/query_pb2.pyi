from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.google.api import annotations_pb2 as _annotations_pb2
from v4_proto.dydxprotocol.accountplus import accountplus_pb2 as _accountplus_pb2
from v4_proto.dydxprotocol.accountplus import models_pb2 as _models_pb2
from v4_proto.dydxprotocol.accountplus import params_pb2 as _params_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AccountStateRequest(_message.Message):
    __slots__ = ["address"]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    address: str
    def __init__(self, address: _Optional[str] = ...) -> None: ...

class AccountStateResponse(_message.Message):
    __slots__ = ["account_state"]
    ACCOUNT_STATE_FIELD_NUMBER: _ClassVar[int]
    account_state: _accountplus_pb2.AccountState
    def __init__(self, account_state: _Optional[_Union[_accountplus_pb2.AccountState, _Mapping]] = ...) -> None: ...

class GetAuthenticatorRequest(_message.Message):
    __slots__ = ["account", "authenticator_id"]
    ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    AUTHENTICATOR_ID_FIELD_NUMBER: _ClassVar[int]
    account: str
    authenticator_id: int
    def __init__(self, account: _Optional[str] = ..., authenticator_id: _Optional[int] = ...) -> None: ...

class GetAuthenticatorResponse(_message.Message):
    __slots__ = ["account_authenticator"]
    ACCOUNT_AUTHENTICATOR_FIELD_NUMBER: _ClassVar[int]
    account_authenticator: _models_pb2.AccountAuthenticator
    def __init__(self, account_authenticator: _Optional[_Union[_models_pb2.AccountAuthenticator, _Mapping]] = ...) -> None: ...

class GetAuthenticatorsRequest(_message.Message):
    __slots__ = ["account"]
    ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    account: str
    def __init__(self, account: _Optional[str] = ...) -> None: ...

class GetAuthenticatorsResponse(_message.Message):
    __slots__ = ["account_authenticators"]
    ACCOUNT_AUTHENTICATORS_FIELD_NUMBER: _ClassVar[int]
    account_authenticators: _containers.RepeatedCompositeFieldContainer[_models_pb2.AccountAuthenticator]
    def __init__(self, account_authenticators: _Optional[_Iterable[_Union[_models_pb2.AccountAuthenticator, _Mapping]]] = ...) -> None: ...

class QueryParamsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class QueryParamsResponse(_message.Message):
    __slots__ = ["params"]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    params: _params_pb2.Params
    def __init__(self, params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...
