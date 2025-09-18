from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.perpetuals import perpetual_pb2 as _perpetual_pb2
from v4_proto.dydxprotocol.perpetuals import params_pb2 as _params_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GenesisState(_message.Message):
    __slots__ = ["liquidity_tiers", "params", "perpetuals"]
    LIQUIDITY_TIERS_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    PERPETUALS_FIELD_NUMBER: _ClassVar[int]
    liquidity_tiers: _containers.RepeatedCompositeFieldContainer[_perpetual_pb2.LiquidityTier]
    params: _params_pb2.Params
    perpetuals: _containers.RepeatedCompositeFieldContainer[_perpetual_pb2.Perpetual]
    def __init__(self, perpetuals: _Optional[_Iterable[_Union[_perpetual_pb2.Perpetual, _Mapping]]] = ..., liquidity_tiers: _Optional[_Iterable[_Union[_perpetual_pb2.LiquidityTier, _Mapping]]] = ..., params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...
