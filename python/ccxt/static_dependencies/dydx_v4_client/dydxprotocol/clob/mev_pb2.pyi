from v4_proto.gogoproto import gogo_pb2 as _gogo_pb2
from v4_proto.dydxprotocol.subaccounts import subaccount_pb2 as _subaccount_pb2
from v4_proto.dydxprotocol.clob import clob_pair_pb2 as _clob_pair_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ClobMidPrice(_message.Message):
    __slots__ = ["clob_pair", "subticks"]
    CLOB_PAIR_FIELD_NUMBER: _ClassVar[int]
    SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    clob_pair: _clob_pair_pb2.ClobPair
    subticks: int
    def __init__(self, clob_pair: _Optional[_Union[_clob_pair_pb2.ClobPair, _Mapping]] = ..., subticks: _Optional[int] = ...) -> None: ...

class MEVLiquidationMatch(_message.Message):
    __slots__ = ["clob_pair_id", "fill_amount", "insurance_fund_delta_quote_quantums", "liquidated_subaccount_id", "maker_fee_ppm", "maker_order_is_buy", "maker_order_subaccount_id", "maker_order_subticks"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    INSURANCE_FUND_DELTA_QUOTE_QUANTUMS_FIELD_NUMBER: _ClassVar[int]
    LIQUIDATED_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    MAKER_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_IS_BUY_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: int
    fill_amount: int
    insurance_fund_delta_quote_quantums: int
    liquidated_subaccount_id: _subaccount_pb2.SubaccountId
    maker_fee_ppm: int
    maker_order_is_buy: bool
    maker_order_subaccount_id: _subaccount_pb2.SubaccountId
    maker_order_subticks: int
    def __init__(self, liquidated_subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., insurance_fund_delta_quote_quantums: _Optional[int] = ..., maker_order_subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., maker_order_subticks: _Optional[int] = ..., maker_order_is_buy: bool = ..., maker_fee_ppm: _Optional[int] = ..., clob_pair_id: _Optional[int] = ..., fill_amount: _Optional[int] = ...) -> None: ...

class MEVMatch(_message.Message):
    __slots__ = ["clob_pair_id", "fill_amount", "maker_fee_ppm", "maker_order_is_buy", "maker_order_subaccount_id", "maker_order_subticks", "taker_fee_ppm", "taker_order_subaccount_id"]
    CLOB_PAIR_ID_FIELD_NUMBER: _ClassVar[int]
    FILL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    MAKER_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_IS_BUY_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    MAKER_ORDER_SUBTICKS_FIELD_NUMBER: _ClassVar[int]
    TAKER_FEE_PPM_FIELD_NUMBER: _ClassVar[int]
    TAKER_ORDER_SUBACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    clob_pair_id: int
    fill_amount: int
    maker_fee_ppm: int
    maker_order_is_buy: bool
    maker_order_subaccount_id: _subaccount_pb2.SubaccountId
    maker_order_subticks: int
    taker_fee_ppm: int
    taker_order_subaccount_id: _subaccount_pb2.SubaccountId
    def __init__(self, taker_order_subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., taker_fee_ppm: _Optional[int] = ..., maker_order_subaccount_id: _Optional[_Union[_subaccount_pb2.SubaccountId, _Mapping]] = ..., maker_order_subticks: _Optional[int] = ..., maker_order_is_buy: bool = ..., maker_fee_ppm: _Optional[int] = ..., clob_pair_id: _Optional[int] = ..., fill_amount: _Optional[int] = ...) -> None: ...

class MevNodeToNodeMetrics(_message.Message):
    __slots__ = ["bp_mev_matches", "clob_mid_prices", "proposal_receive_time", "validator_mev_matches"]
    BP_MEV_MATCHES_FIELD_NUMBER: _ClassVar[int]
    CLOB_MID_PRICES_FIELD_NUMBER: _ClassVar[int]
    PROPOSAL_RECEIVE_TIME_FIELD_NUMBER: _ClassVar[int]
    VALIDATOR_MEV_MATCHES_FIELD_NUMBER: _ClassVar[int]
    bp_mev_matches: ValidatorMevMatches
    clob_mid_prices: _containers.RepeatedCompositeFieldContainer[ClobMidPrice]
    proposal_receive_time: int
    validator_mev_matches: ValidatorMevMatches
    def __init__(self, validator_mev_matches: _Optional[_Union[ValidatorMevMatches, _Mapping]] = ..., clob_mid_prices: _Optional[_Iterable[_Union[ClobMidPrice, _Mapping]]] = ..., bp_mev_matches: _Optional[_Union[ValidatorMevMatches, _Mapping]] = ..., proposal_receive_time: _Optional[int] = ...) -> None: ...

class ValidatorMevMatches(_message.Message):
    __slots__ = ["liquidation_matches", "matches"]
    LIQUIDATION_MATCHES_FIELD_NUMBER: _ClassVar[int]
    MATCHES_FIELD_NUMBER: _ClassVar[int]
    liquidation_matches: _containers.RepeatedCompositeFieldContainer[MEVLiquidationMatch]
    matches: _containers.RepeatedCompositeFieldContainer[MEVMatch]
    def __init__(self, matches: _Optional[_Iterable[_Union[MEVMatch, _Mapping]]] = ..., liquidation_matches: _Optional[_Iterable[_Union[MEVLiquidationMatch, _Mapping]]] = ...) -> None: ...
