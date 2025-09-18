from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.dydxprotocol.bridge import bridge_event_pb2 as _bridge_event_pb2
from v4_proto.dydxprotocol.bridge import params_pb2 as _params_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MsgAcknowledgeBridges(_message.Message):
    __slots__ = ["events"]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    events: _containers.RepeatedCompositeFieldContainer[_bridge_event_pb2.BridgeEvent]
    def __init__(self, events: _Optional[_Iterable[_Union[_bridge_event_pb2.BridgeEvent, _Mapping]]] = ...) -> None: ...

class MsgAcknowledgeBridgesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgCompleteBridge(_message.Message):
    __slots__ = ["authority", "event"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    EVENT_FIELD_NUMBER: _ClassVar[int]
    authority: str
    event: _bridge_event_pb2.BridgeEvent
    def __init__(self, authority: _Optional[str] = ..., event: _Optional[_Union[_bridge_event_pb2.BridgeEvent, _Mapping]] = ...) -> None: ...

class MsgCompleteBridgeResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateEventParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.EventParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.EventParams, _Mapping]] = ...) -> None: ...

class MsgUpdateEventParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateProposeParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.ProposeParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.ProposeParams, _Mapping]] = ...) -> None: ...

class MsgUpdateProposeParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateSafetyParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.SafetyParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.SafetyParams, _Mapping]] = ...) -> None: ...

class MsgUpdateSafetyParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
