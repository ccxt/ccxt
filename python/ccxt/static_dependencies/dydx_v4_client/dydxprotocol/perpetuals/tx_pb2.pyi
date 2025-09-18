from v4_proto.cosmos_proto import cosmos_pb2 as _cosmos_pb2
from v4_proto.cosmos.msg.v1 import msg_pb2 as _msg_pb2
from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.perpetuals import params_pb2 as _params_pb2
from v4_proto.dydxprotocol.perpetuals import perpetual_pb2 as _perpetual_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class FundingPremium(_message.Message):
    __slots__ = ["perpetual_id", "premium_ppm"]
    PERPETUAL_ID_FIELD_NUMBER: _ClassVar[int]
    PREMIUM_PPM_FIELD_NUMBER: _ClassVar[int]
    perpetual_id: int
    premium_ppm: int
    def __init__(self, perpetual_id: _Optional[int] = ..., premium_ppm: _Optional[int] = ...) -> None: ...

class MsgAddPremiumVotes(_message.Message):
    __slots__ = ["votes"]
    VOTES_FIELD_NUMBER: _ClassVar[int]
    votes: _containers.RepeatedCompositeFieldContainer[FundingPremium]
    def __init__(self, votes: _Optional[_Iterable[_Union[FundingPremium, _Mapping]]] = ...) -> None: ...

class MsgAddPremiumVotesResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgCreatePerpetual(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _perpetual_pb2.PerpetualParams
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_perpetual_pb2.PerpetualParams, _Mapping]] = ...) -> None: ...

class MsgCreatePerpetualResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgSetLiquidityTier(_message.Message):
    __slots__ = ["authority", "liquidity_tier"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    LIQUIDITY_TIER_FIELD_NUMBER: _ClassVar[int]
    authority: str
    liquidity_tier: _perpetual_pb2.LiquidityTier
    def __init__(self, authority: _Optional[str] = ..., liquidity_tier: _Optional[_Union[_perpetual_pb2.LiquidityTier, _Mapping]] = ...) -> None: ...

class MsgSetLiquidityTierResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdateParams(_message.Message):
    __slots__ = ["authority", "params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    params: _params_pb2.Params
    def __init__(self, authority: _Optional[str] = ..., params: _Optional[_Union[_params_pb2.Params, _Mapping]] = ...) -> None: ...

class MsgUpdateParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class MsgUpdatePerpetualParams(_message.Message):
    __slots__ = ["authority", "perpetual_params"]
    AUTHORITY_FIELD_NUMBER: _ClassVar[int]
    PERPETUAL_PARAMS_FIELD_NUMBER: _ClassVar[int]
    authority: str
    perpetual_params: _perpetual_pb2.PerpetualParams
    def __init__(self, authority: _Optional[str] = ..., perpetual_params: _Optional[_Union[_perpetual_pb2.PerpetualParams, _Mapping]] = ...) -> None: ...

class MsgUpdatePerpetualParamsResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...
