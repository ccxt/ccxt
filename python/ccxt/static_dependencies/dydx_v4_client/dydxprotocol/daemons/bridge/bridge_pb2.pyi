from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.bridge import bridge_event_pb2 as _bridge_event_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AddBridgeEventsRequest(_message.Message):
    __slots__ = ["bridge_events"]
    BRIDGE_EVENTS_FIELD_NUMBER: _ClassVar[int]
    bridge_events: _containers.RepeatedCompositeFieldContainer[_bridge_event_pb2.BridgeEvent]
    def __init__(self, bridge_events: _Optional[_Iterable[_Union[_bridge_event_pb2.BridgeEvent, _Mapping]]] = ...) -> None: ...

class AddBridgeEventsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
