import sys
import types
from typing import Union, List, Optional, Any
from decimal import Decimal

if sys.version_info.minor > 7:
    from typing import TypedDict, Literal, Dict
else:
    from typing import Dict
    from typing_extensions import Literal
    TypedDict = Dict


OrderSide = Literal['buy', 'sell']
OrderType = Literal['limit', 'market']
PositionSide = Literal['long', 'short']


class Entry:
    def __init__(self, path, api, method, config):
        self.name = None
        self.path = path
        self.api = api
        self.method = method
        self.config = config

        def unbound_method(_self, params={}):
            return _self.request(self.path, self.api, self.method, params, config=self.config)

        self.unbound_method = unbound_method

    def __get__(self, instance, owner):
        if instance is None:
            return self.unbound_method
        else:
            return types.MethodType(self.unbound_method, instance)

    def __set_name__(self, owner, name):
        self.name = name


IndexType = Union[str, int]
Numeric = Union[None, str, float, int, Decimal]
String = Optional[str]
Int = Optional[int]
Bool = Optional[bool]
Fee = Optional[Dict[str, Any]]


class Balance(TypedDict):
    free: Numeric
    used: Numeric
    total: Numeric


class Trade(TypedDict):
    info: Dict[str, Any]
    amount: Numeric
    datetime: String
    id: String
    order: String
    price: Numeric
    timestamp: Int
    type: String
    side: String
    symbol: String
    takerOrMaker: String
    cost: Numeric
    fee: Fee


class Position(TypedDict):
    info: Dict[str, Any]
    symbol: String
    id: String
    timestamp: Int
    datetime: String
    contracts: Numeric
    contractSize: Numeric
    side: String
    notional: Numeric
    leverage: Numeric
    unrealizedPnl: Numeric
    realizedPnl: Numeric
    collateral: Numeric
    entryPrice: Numeric
    markPrice: Numeric
    liquidationPrice: Numeric
    hedged: bool
    maintenanceMargin: Numeric
    initialMargin: Numeric
    initialMarginPercentage: Numeric
    marginMode: String
    marginRatio: Numeric
    lastUpdateTimestamp: Int
    lastPrice: Numeric
    percentage: Numeric
    stopLossPrice: Numeric
    takeProfitPrice: Numeric


class OrderRequest(TypedDict):
    symbol: String
    type: String
    side: String
    amount: Union[None, float]
    price: Union[None, float]
    params: Dict[str, Any]


class Order(TypedDict):
    info: Dict[str, Any]
    id: String
    clientOrderId: String
    datetime: String
    timestamp: Int
    lastTradeTimestamp: Int
    lastUpdateTimestamp: Int
    status: String
    symbol: String
    type: String
    timeInForce: String
    side: OrderSide
    price: Numeric
    average: Numeric
    amount: Numeric
    filled: Numeric
    remaining: Numeric
    stopPrice: Numeric
    takeProfitPrice: Numeric
    stopLossPrice: Numeric
    cost: Numeric
    trades: List[Trade]
    fee: Fee


class FundingHistory(TypedDict):
    info: Dict[str, Any]
    symbol: String
    code: String
    timestamp: Int
    datetime: String
    id: String
    amount: Numeric


class Balances(Dict[str, Balance]):
    datetime: String
    timestamp: Int


class OrderBook(TypedDict):
    asks: List[Numeric]
    bids: List[Numeric]
    datetime: String
    timestamp: Int
    nonce: Int


class Transaction(TypedDict):
    info: Dict[str, any]
    id: String
    txid: String
    timestamp: Int
    datetime: String
    address: String
    addressFrom: String
    addressTo: String
    tag: String
    tagFrom: String
    tagTo: String
    type: String
    amount: Numeric
    currency: String
    status: String
    updated: Int
    fee: Fee
    network: String
    comment: String
    internal: Bool


class Ticker(TypedDict):
    info: Dict[str, Any]
    symbol: String
    timestamp: Int
    datetime: String
    high: Numeric
    low: Numeric
    bid: Numeric
    bidVolume: Numeric
    ask: Numeric
    askVolume: Numeric
    vwap: Numeric
    open: Numeric
    close: Numeric
    last: Numeric
    previousClose: Numeric
    change: Numeric
    percentage: Numeric
    average: Numeric
    quoteVolume: Numeric
    baseVolume: Numeric


Tickers = Dict[str, Ticker]


class MarginMode(TypedDict):
    info: Dict[str, Any]
    symbol: String
    marginMode: String


class Greeks(TypedDict):
    symbol: String
    timestamp: Int
    datetime: String
    delta: Numeric
    gamma: Numeric
    theta: Numeric
    vega: Numeric
    rho: Numeric
    bidSize: Numeric
    askSize: Numeric
    bidImpliedVolatility: Numeric
    askImpliedVolatility: Numeric
    markImpliedVolatility: Numeric
    bidPrice: Numeric
    askPrice: Numeric
    markPrice: Numeric
    lastPrice: Numeric
    underlyingPrice: Numeric
    info: Dict[str, Any]


class Market(TypedDict):
    info: Dict[str, Any]
    id: String
    symbol: String
    base: String
    quote: String
    baseId: String
    quoteId: String
    active: Bool
    type: String
    spot: bool
    margin: bool
    swap: bool
    future: bool
    option: bool
    contract: bool
    settle: String
    settleId: String
    contractSize: Numeric
    linear: bool
    inverse: bool
    expiry: Numeric
    expiryDatetime: String
    strike: Numeric
    optionType: String
    taker: Numeric
    maker: Numeric
    percentage: bool
    tierBased: bool
    feeSide: String
    precision: Any
    limits: Any
    created: Int
