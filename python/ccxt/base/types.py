import sys
import types
from typing import Type, Union, List, Optional, Any as PythonAny
from decimal import Decimal


if sys.version_info >= (3, 8):
    from typing import TypedDict, Literal, Dict
else:
    from typing import Dict
    from typing_extensions import Literal
    TypedDict = Dict

if sys.version_info >= (3, 11):
    from typing import NotRequired
else:
    from typing_extensions import NotRequired


OrderSide = Literal['buy', 'sell']
OrderType = Literal['limit', 'market']
PositionSide = Literal['long', 'short']
Any = PythonAny


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
Num = Union[None, str, float, int, Decimal]
NumType = Union[Type[str], Type[float], Type[int], Type[Decimal]]
Str = Optional[str]
Strings = Optional[List[str]]
Int = Optional[int]
Bool = Optional[bool]
MarketType = Literal['spot', 'margin', 'swap', 'future', 'option']
SubType = Literal['linear', 'inverse']


class FeeInterface(TypedDict):
    currency: Str
    cost: Num
    rate: NotRequired[Num]


Fee = Optional[FeeInterface]


class TradingFeeInterface(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    maker: Num
    taker: Num
    percentage: Bool
    tierBased: Bool


class Balance(TypedDict):
    free: Num
    used: Num
    total: Num
    debt: NotRequired[Num]


class BalanceAccount(TypedDict):
    free: Str
    used: Str
    total: Str


class Account(TypedDict):
    id: Str
    type: Str
    code: Str
    info: Dict[str, Any]


class Trade(TypedDict):
    info: Dict[str, Any]
    amount: Num
    datetime: Str
    id: Str
    order: Str
    price: Num
    timestamp: Int
    type: Str
    side: Str
    symbol: Str
    takerOrMaker: Str
    cost: Num
    fee: Fee


class Position(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    id: Str
    timestamp: Int
    datetime: Str
    contracts: Num
    contractSize: Num
    side: Str
    notional: Num
    leverage: Num
    unrealizedPnl: Num
    realizedPnl: Num
    collateral: Num
    entryPrice: Num
    markPrice: Num
    liquidationPrice: Num
    hedged: bool
    maintenanceMargin: Num
    initialMargin: Num
    initialMarginPercentage: Num
    marginMode: Str
    marginRatio: Num
    lastUpdateTimestamp: Int
    lastPrice: Num
    percentage: Num
    stopLossPrice: Num
    takeProfitPrice: Num

class OrderRequest(TypedDict):
    symbol: Str
    type: Str
    side: Str
    amount: Union[None, float]
    price: Union[None, float]
    params: Dict[str, Any]


# prediction-market order request — carries an `outcome` handle instead of a `symbol`
class PredictionOrderRequest(TypedDict):
    outcome: Str
    type: Str
    side: Str
    amount: Union[None, float]
    price: Union[None, float]
    params: Dict[str, Any]


class CancellationRequest(TypedDict):
    id: Str
    symbol: Str
    clientOrderId: Str


class Order(TypedDict):
    info: Dict[str, Any]
    id: Str
    clientOrderId: Str
    datetime: Str
    timestamp: Int
    lastTradeTimestamp: Int
    lastUpdateTimestamp: Int
    status: Str
    symbol: Str
    type: Str
    timeInForce: Str
    side: OrderSide
    price: Num
    average: Num
    amount: Num
    filled: Num
    remaining: Num
    stopPrice: Num
    takeProfitPrice: Num
    stopLossPrice: Num
    cost: Num
    trades: List[Trade]
    reduceOnly: Bool
    postOnly: Bool
    fee: Fee


class Liquidation(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    timestamp: Int
    datetime: Str
    price: Num
    baseValue: Num
    quoteValue: Num
    side: OrderSide
    contracts: Num
    contractSize: Num


class FundingHistory(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    code: Str
    timestamp: Int
    datetime: Str
    id: Str
    amount: Num


class Balances(Dict[str, Balance]):
    datetime: Str
    timestamp: Int


class OrderBook(TypedDict):
    asks: List[List[Num]]
    bids: List[List[Num]]
    datetime: Str
    timestamp: Int
    nonce: Int
    symbol: Str


class Transaction(TypedDict):
    info: Dict[str, any]
    id: Str
    txid: Str
    timestamp: Int
    datetime: Str
    address: Str
    addressFrom: Str
    addressTo: Str
    tag: Str
    tagFrom: Str
    tagTo: Str
    type: Str
    amount: Num
    currency: Str
    status: Str
    updated: Int
    fee: Fee
    network: Str
    comment: Str
    internal: Bool


class TransferEntry(TypedDict):
    info: Dict[str, any]
    id: Str
    timestamp: Int
    datetime: Str
    currency: Str
    amount: Num
    fromAccount: Str
    toAccount: Str
    status: Str


class Ticker(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    timestamp: Int
    datetime: Str
    high: Num
    low: Num
    bid: Num
    bidVolume: Num
    ask: Num
    askVolume: Num
    vwap: Num
    open: Num
    close: Num
    last: Num
    previousClose: Num
    change: Num
    percentage: Num
    average: Num
    quoteVolume: Num
    baseVolume: Num
    markPrice: Num
    indexPrice: Num


Tickers = Dict[str, Ticker]

OrderBooks = Dict[str, OrderBook]
class MarginMode(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    marginMode: Str


MarginModes = Dict[str, MarginMode]


class Leverage(TypedDict):
    info: Dict[str, Any]
    symbol: Str
    marginMode: Str
    longLeverage: Num
    shortLeverage: Num


Leverages = Dict[str, Leverage]


class Greeks(TypedDict):
    symbol: Str
    timestamp: Int
    datetime: Str
    delta: Num
    gamma: Num
    theta: Num
    vega: Num
    rho: Num
    vanna: Num
    volga: Num
    charm: Num
    bidSize: Num
    askSize: Num
    bidImpliedVolatility: Num
    askImpliedVolatility: Num
    markImpliedVolatility: Num
    bidPrice: Num
    askPrice: Num
    markPrice: Num
    lastPrice: Num
    underlyingPrice: Num
    info: Dict[str, Any]


class Conversion(TypedDict):
    info: Dict[str, Any]
    timestamp: Int
    datetime: Str
    id: Str
    fromCurrency: Str
    fromAmount: Num
    toCurrency: Str
    toAmount: Num
    price: Num
    fee: Num


class Option(TypedDict):
    info: Dict[str, Any]
    currency: Str
    symbol: Str
    timestamp: Int
    datetime: Str
    impliedVolatility: Num
    openInterest: Num
    bidPrice: Num
    askPrice: Num
    midPrice: Num
    markPrice: Num
    lastPrice: Num
    underlyingPrice: Num
    change: Num
    percentage: Num
    baseVolume: Num
    quoteVolume: Num


OptionChain = Dict[str, Option]

class MarketMarginModes(TypedDict):
    cross: bool
    isolated: bool

class MinMax(TypedDict):
    min: Num
    max: Num

class MarketLimits(TypedDict):
    amount: Optional[MinMax]
    cost: Optional[MinMax]
    leverage: Optional[MinMax]
    price: Optional[MinMax]
    market: Optional[MinMax]


class Precision(TypedDict):
    amount: Num
    price: Num
    cost: Num


class MarketInterface(TypedDict):
    info: Dict[str, Any]
    id: Str
    symbol: Str
    base: Str
    quote: Str
    baseId: Str
    quoteId: Str
    active: Bool
    type: Str
    subType: Str
    spot: bool
    margin: bool
    marginModes: MarketMarginModes
    swap: bool
    future: bool
    option: bool
    contract: bool
    settle: Str
    settleId: Str
    contractSize: Num
    linear: bool
    inverse: bool
    expiry: Num
    expiryDatetime: Str
    strike: Num
    optionType: Str
    taker: Num
    maker: Num
    percentage: bool
    tierBased: bool
    feeSide: Str
    precision: Precision
    limits: MarketLimits
    created: Int

class Limit(TypedDict):
    min: Num
    max: Num


class CurrencyLimits(TypedDict):
    amount: Limit
    withdraw: Limit


class CurrencyInterface(TypedDict):
    id: Str
    code: Str
    numericId: Int
    precision: Num
    type: Str
    margin: Bool
    name: Str
    active: Bool
    deposit: Bool
    withdraw: Bool
    fee: Num
    limits: CurrencyLimits
    networks: Dict[str, any]
    info: any


class LastPrice(TypedDict):
    symbol: Str
    timestamp: Int
    datetime: Str
    price: Num
    side: OrderSide
    info: Dict[str, Any]


class MarginModification(TypedDict):
    info: Dict[str, any]
    symbol: str
    type: Optional[Literal['add', 'reduce', 'set']]
    marginMode: Optional[Literal['isolated', 'cross']]
    amount: Optional[float]
    code: Str
    status: Str
    timestamp: Int
    datetime: Str


class CrossBorrowRate(TypedDict):
    info: Dict[str, any]
    currency: Str
    rate: float
    period: Optional[float]
    timestamp: Int
    datetime: Str


class IsolatedBorrowRate(TypedDict):
    info: Dict[str, any]
    symbol: str
    base: str
    baseRate: float
    quote: str
    quoteRate: float
    period: Int
    timestamp: Int
    datetime: Str


class FundingRate(TypedDict):
    symbol: Str
    timestamp: Int
    fundingRate: Num
    datetime: Str
    markPrice: Num
    indexPrice: Num
    interestRate: Num
    estimatedSettlePrice: Num
    fundingTimestamp: Int
    fundingDatetime: Str
    nextFundingTimestamp: Int
    nextFundingDatetime: Str
    nextFundingRate: Num
    previousFundingTimestamp: Int
    previousFundingDatetime: Str
    previousFundingRate: Num
    info: Dict[str, Any]
    interval: Str

class FundingRateHistory(TypedDict):
    symbol: Str
    timestamp: Int
    fundingRate: Num
    datetime: Str
    info: Dict[str, Any]

class OpenInterest(TypedDict):
    symbol: Str
    openInterestAmount: Num
    openInterestValue: Num
    baseVolume: Num
    quoteVolume: Num
    timestamp: Int
    datetime: Str
    info: Dict[str, Any]

class LeverageTier:
    tier: Num
    symbol: Str
    currency: Str
    minNotional: Num
    maxNotional: Num
    maintenanceMarginRate: Num
    maxLeverage: Num
    info: Dict[str, Any]


class LedgerEntry:
    id: Str
    info: Any
    timestamp: Int
    datetime: Str
    direction: Str
    account: Str
    referenceId: Str
    referenceAccount: Str
    type: Str
    currency: Str
    amount: Str
    before: float
    after: float
    status: Str
    fee: Fee


class DepositAddress:
    info: Any
    currency: Str
    network: Optional[Str]
    address: Str
    tag: Optional[Str]


class LongShortRatio:
    info: Any
    symbol: Str
    timestamp: Optional[Int]
    datetime: Optional[Str]
    timeframe: Optional[Str]
    longShortRatio: float


class ADL:
    info: Any
    symbol: Str
    rank: Optional[Int]
    rating: Optional[Str]
    percentage: Optional[Num]
    timestamp: Optional[Int]
    datetime: Optional[Str]


class BorrowInterest:
    info: Any
    symbol: Optional[Str]
    currency: Optional[Str]
    interest: Optional[Num]
    interestRate: Optional[Num]
    amountBorrowed: Optional[Num]
    marginMode: Optional[Str]
    timestamp: Optional[Int]
    datetime: Optional[Str]


FundingRates = Dict[Str, FundingRate]
OpenInterests = Dict[Str, OpenInterest]
LastPrices = Dict[Str, LastPrice]
Currencies = Dict[Str, CurrencyInterface]
TradingFees = Dict[Str, TradingFeeInterface]
IsolatedBorrowRates = Dict[Str, IsolatedBorrowRate]
CrossBorrowRates = Dict[Str, CrossBorrowRate]
LeverageTiers = Dict[Str, List[LeverageTier]]

# Prediction-market structures (ccxt.prediction namespace).
# Hierarchy: Event -> Market -> Outcome. The Outcome is the tradeable unit; there is
# no `symbol` field — the handle is `outcome` ("MARKET:LABEL") and the raw exchange id
# is `outcomeId`. Prices are probabilities 0..1, amounts are shares, costs are collateral.
class PredictionFees(TypedDict):
    trading: Num       # per-trade taker/maker rate (fraction, e.g. 0.02 = 2%)
    resolution: Num    # fee taken from winnings at settlement (fraction)


class PredictionOutcome(TypedDict):
    info: Any
    outcome: str         # unified handle "TRUMP_WIN_2024:YES" — round-trips; ex.outcomes key
    outcomeId: Str       # raw exchange/on-chain id (token id / ticker / coin)
    label: Str           # short human name "Yes"
    market: Str          # parent market handle
    marketId: Str
    event: Str
    price: Num           # probability 0..1
    bid: Num
    ask: Num
    active: Bool
    winner: Bool         # resolved True (the settleFraction == 1 case)
    settleFraction: Num  # 0..1 fractional settlement
    precision: Precision  # outcome-level price/amount precision


class PredictionMarket(TypedDict):
    info: Any
    id: str              # raw exchange market id
    market: str          # unified handle "TRUMP_WIN_2024"
    event: Str
    marketType: Str      # 'binary' | 'categorical' | 'scalar'
    executionModel: Str  # 'clob' | 'amm' | 'parimutuel'
    title: Str
    description: Str
    outcomes: List[PredictionOutcome]   # 1..N (categorical can be > 2)
    underlying: Str      # scalar only
    floorStrike: Num     # scalar only
    capStrike: Num       # scalar only
    strikeType: Str      # scalar only
    collateral: Str      # quote currency symbol (USDC / USD1 / USD / ...)
    active: Bool
    closed: Bool
    resolved: Bool
    resolvedOutcome: Str       # winning outcome handle
    settlementValue: Num       # scalar: the realized number
    created: Int
    createdDatetime: Str
    end: Int
    endDatetime: Str
    volume: Num
    liquidity: Num
    openInterest: Num
    tickSize: Num
    limits: MarketLimits
    fees: PredictionFees
    resolutionSource: Str
    image: Str


class PredictionEvent(TypedDict):
    info: Any
    id: str              # raw exchange event id
    event: str           # unified handle "US_ELECTION_2024"
    title: Str
    description: Str
    slug: Str
    category: Str
    tags: List[str]
    markets: List[PredictionMarket]   # grouped ccxt market rows (each with its outcomes list) — matches the TS type + runtime
    mutuallyExclusive: Bool    # exactly one market in the event resolves YES
    active: Bool
    resolved: Bool
    volume: Num
    liquidity: Num
    created: Int
    createdDatetime: Str
    end: Int
    endDatetime: Str
    image: Str
    url: str


# Native dedicated prediction-market trading types. They inherit their base unified
# TypedDict (so all base keys are valid) and add the prediction identity fields. The
# inherited `symbol` is left unpopulated — `outcome` (the "MARKET:LABEL" handle) is the
# canonical identity. Mirrors the `Prediction* extends <Base>` interfaces in
# ts/src/base/types.ts and the native structs in Go/C#/Java.
class PredictionTicker(TypedDict):  # standalone (was Ticker) — outcome-addressed, no symbol
    info: Dict[str, Any]
    timestamp: Int
    datetime: Str
    high: Num
    low: Num
    bid: Num
    bidVolume: Num
    ask: Num
    askVolume: Num
    open: Num
    close: Num
    last: Num
    change: Num
    percentage: Num
    average: Num
    quoteVolume: Num
    baseVolume: Num
    outcome: str
    outcomeId: Str
    label: Str
    market: Str
    event: Str
    openInterest: Num


class PredictionOrder(TypedDict):  # standalone (was Order) — outcome-addressed, no symbol
    info: Dict[str, Any]
    id: Str
    clientOrderId: Str
    datetime: Str
    timestamp: Int
    lastTradeTimestamp: Int
    lastUpdateTimestamp: Int
    status: Str
    type: Str
    timeInForce: Str
    side: OrderSide
    price: Num
    average: Num
    amount: Num
    filled: Num
    remaining: Num
    cost: Num
    trades: List[Trade]
    reduceOnly: Bool
    postOnly: Bool
    fee: Fee
    outcome: str
    outcomeId: Str
    label: Str
    market: Str
    event: Str


class PredictionTrade(TypedDict):  # standalone (was Trade) — outcome-addressed, no symbol
    info: Dict[str, Any]
    amount: Num
    datetime: Str
    id: Str
    order: Str
    price: Num
    timestamp: Int
    type: Str
    side: Str
    takerOrMaker: Str
    cost: Num
    fee: Fee
    outcome: str
    outcomeId: Str
    label: Str
    market: Str
    realizedPnl: Num


class PredictionPosition(TypedDict):  # standalone (was Position) — outcome-addressed, no symbol
    info: Dict[str, Any]
    id: Str
    timestamp: Int
    datetime: Str
    contracts: Num
    contractSize: Num
    side: Str
    notional: Num
    unrealizedPnl: Num
    realizedPnl: Num
    collateral: Num
    entryPrice: Num
    markPrice: Num
    lastPrice: Num
    percentage: Num
    outcome: str
    outcomeId: Str
    label: Str
    market: Str
    event: Str
    oppositeOutcome: Str
    resolved: Bool
    won: Bool
    settleFraction: Num
    payout: Num


PredictionTickers = Dict[str, PredictionTicker]


class PredictionOrderBook(TypedDict):  # standalone (was OrderBook) — outcome-addressed, no symbol
    asks: List[List[Num]]
    bids: List[List[Num]]
    datetime: Str
    timestamp: Int
    nonce: Int
    outcome: str
    outcomeId: Str
    market: Str


class PredictionTradingFee(TypedDict):  # standalone (was TradingFeeInterface) — outcome-addressed, no symbol
    info: Dict[str, Any]
    maker: Num
    taker: Num
    percentage: Bool
    tierBased: Bool
    outcome: str
    outcomeId: Str
    market: Str


class PredictionOpenInterest(TypedDict):  # standalone (was OpenInterest) — outcome-addressed, no symbol
    openInterestAmount: Num
    openInterestValue: Num
    timestamp: Int
    datetime: Str
    info: Dict[str, Any]
    outcome: str
    outcomeId: Str
    market: Str


class PredictionSettlement(TypedDict):
    info: Any
    id: Str
    timestamp: Int
    datetime: Str
    outcome: Str
    outcomeId: Str
    market: Str
    event: Str
    result: Str
    won: Bool
    amount: Num
    price: Num
    cost: Num
    payout: Num
    pnl: Num


class fetchEventsParams(TypedDict):
    query: Str
    limit: Int
    sort: Literal['volume', 'liquidity', 'newest']
    status: Literal['active', 'inactive', 'closed', 'all']
    searchIn: Literal['title', 'description', 'both']
    eventId: Str
    slug: Str


Market = Optional[MarketInterface]
Currency = Optional[CurrencyInterface]

class ConstructorArgs(TypedDict, total=False):
    apiKey: str
    secret: str
    passphrase: str
    password: str
    privateKey: str
    walletAddress: str
    uid: str
    verbose: bool
    testnet: bool
    sandbox: bool  # redudant but kept for backwards compatibility
    options: Dict[str, Any]
    enableRateLimit: bool
    httpsProxy: str
    socksProxy: str
    wssProxy: str
    proxy: str
    rateLimit: Num
    commonCurrencies: Dict[str, Any]
    userAgent: str
    userAgents: Dict[str, Any]
    timeout: Num
    markets: Dict[str, Any]
    currencies: Dict[str, Any]
    hostname: str
    urls: Dict[str, Any]
    headers: Dict[str, Any]
    session: Any
