from typing import Dict, List, Optional, Tuple, Union

from typing_extensions import (
    Any,
    Literal,
    NotRequired,
    TypedDict,
)

RawInfo = Dict[str, Any]

LimitMarket = Literal["market", "limit"]
BuySell = Literal["buy", "sell"]
LongShort = Literal["long", "short"]
TakerMaker = Literal["taker", "maker"]
TimeInForce = Literal["GTC", "IOC", "FOK", "PO"]
MarketType = Literal["spot", "future", "swap", "option", "margin"]
MarginMode = Literal["cross", "isolated"]

MinMax = TypedDict("MinMax", {"min": float, "max": float})

FeeStructure = TypedDict("FeeStructure", {
    "currency": str,
    "cost": float,
    "rate": NotRequired[float],
})

PrecisionStructure = TypedDict("PrecisionStructure", {
    "price": Union[int, float],
    "amount": NotRequired[int],
    "cost": NotRequired[int],
})

ValueLimitStructureAWD = TypedDict("ValueLimitStructureAWD", {
    "amount": MinMax,
    "withdraw": MinMax,
    "deposit": MinMax,
})

ValueLimitStructureAPCL = TypedDict("ValueLimitStructureAPCL", {
    "amount": MinMax,
    "price": MinMax,
    "cost": MinMax,
    "leverage": MinMax,
})

NetworkStructure = TypedDict("NetworkStructure", {
    "id": str,
    "network": str,
    "name": NotRequired[str],
    "active": bool,
    "fee": float,
    "precision": int,
    "deposit": bool,
    "withdraw": bool,
    "limits": ValueLimitStructureAWD,
    "info": RawInfo,
})

CurrencyStructure = TypedDict("CurrencyStructure", {
    "id": str,
    "code": str,
    "name": str,
    "active": bool,
    "fee": float,
    "precision": int,
    "deposit": bool,
    "withdraw": bool,
    "limits": ValueLimitStructureAWD,
    "networks": Dict[str, NetworkStructure],
    "info": RawInfo,
})

MarketStructure = TypedDict("MarketStructure", {
    "id": str,
    "symbol": str,
    "base": str,
    "quote": str,
    "baseId": str,
    "quoteId": str,
    "active": bool,
    "type": MarketType,
    "spot": bool,
    "margin": bool,
    "future": bool,
    "swap": bool,
    "option": bool,
    "contract": bool,
    "settle": NotRequired[str],
    "settleId": NotRequired[str],
    "contractSize": NotRequired[int],
    "linear": bool,
    "inverse": bool,
    "expiry": NotRequired[int],
    "expiryDatetime": NotRequired[str],
    "strike": int,
    "optionType": NotRequired[Literal["call", "put"]],
    "taker": float,
    "maker": float,
    "percentage": bool,
    "tierBased": bool,
    "feeSide": Literal["get", "give", "base", "quote", "other"],
    "precision": PrecisionStructure,
    "limits": ValueLimitStructureAPCL,
    "info": RawInfo,
})

SingleOrderbookEntry = Union[
    Tuple[float, float],
    Tuple[float, float, str],
    Tuple[float, float, int],
    Tuple[float, float, float],
]

OrderbookStructure = TypedDict("OrderbookStructure", {
    "bids": List[SingleOrderbookEntry],
    "asks": List[SingleOrderbookEntry],
    "symbol": str,
    "timestamp": NotRequired[int],
    "datetime": NotRequired[str],
    "nonce": int,
})

TickerStructure = TypedDict("TickerStructure", {
    "symbol": str,
    "info": RawInfo,
    "timestamp": int,
    "datetime": str,
    "high": float,
    "low": float,
    "bid": float,
    "bidVolume": NotRequired[float],
    "ask": float,
    "askVolume": NotRequired[float],
    "vwap": float,
    "open": float,
    "close": float,
    "last": float,
    "previousClose": float,
    "change": float,
    "percentage": float,
    "average": float,
    "baseVolume": float,
    "quoteVolume": float,
})

OHLCVStructure = Tuple[int, float, float, float, float, float]

ExchangeStatusStructure = TypedDict("ExchangeStatusStructure", {
    "status": Literal["ok", "shutdown", "error", "maintenance"],
    "updated": NotRequired[int],
    "eta": NotRequired[Any],
    "url": NotRequired[str],
})

BorrowRateStructure = TypedDict("BorrowRateStructure", {
    "currency": str,
    "rate": float,
    "period": int,
    "timestamp": int,
    "datetime": str,
    "info": RawInfo,
})

LeverageTierStructure = TypedDict("LeverageTierStructure", {
    "tier": int,
    "notionalCurrency": str,
    "minNotional": Union[int, float],
    "maxNotional": Union[int, float],
    "maintenanceMarginRate": float,
    "maxLeverage": Union[int, float],
    "info": RawInfo
})
LeverageTiers = List[LeverageTierStructure]

FundingRateStructure = TypedDict("FundingRateStructure", {
    "info": RawInfo,
    "symbol": str,
    "markPrice": float,
    "indexPrice": float,
    "interestRate": float,
    "estimatedSettlePrice": NotRequired[float],
    "timestamp": NotRequired[int],
    "datetime": NotRequired[str],
    "fundingRate": float,
    "fundingTimestamp": int,
    "fundingDatetime": str,
    "nextFundingRate": float,
    "nextFundingTimestamp": NotRequired[int],
    "nextfundingDatetime": NotRequired[str],
    "previousFundingRate": NotRequired[float],
    "previousFundingTimestamp": NotRequired[int],
    "previousFundingDatetime": NotRequired[str],
})

FundingRateHistoryStructure = TypedDict("FundingRateHistoryStructure", {
    "info": RawInfo,
    "symbol": str,
    "fundingRate": float,
    "timestamp": int,
    "datetime": str,
})

OpenInterestStructure = TypedDict("OpenInterestStructure", {
    "symbol": str,
    "baseVolume": float,
    "quoteVolume": float,
    "timestamp": int,
    "datetime": str,
    "info": RawInfo
})

PositionRiskStructure = TypedDict("PositionRiskStructure", {
    "info": RawInfo,
    "symbol": str,
    "contracts": int,
    "constractSize": int,
    "unrealizedPnl": float,
    "leverage": float,
    "liquidationPrice": float,
    "collateral": int,
    "notional": float,
    "markPrice": float,
    "entryPrice": float,
    "timestamp": int,
    "initialMargin": float,
    "initialMarginPercentage": float,
    "maintenanceMargin": float,
    "maintenanceMarginPercentage": float,
    "marginRatio": float,
    "datetime": str,
    "marginMode": str,
    "side": LongShort,
    "hedged": bool,
    "percentage": float,
})

AccountStructure = TypedDict("AccountStructure", {
    "id": str,
    "type": str,
    "name": str,
    "code": str,
    "info": RawInfo
})
AccountsList = List[AccountStructure]

# Since balance is also indexed by currencies, 
# it's hard to define this as TypedDict
BalanceStructure = Dict[str, Any]

TradeStructure = TypedDict("TradeStructure", {
    "info": RawInfo,
    "id": str,
    "timestamp": int,
    "datetime": str,
    "symbol": str,
    "order": NotRequired[str],
    "type": Optional[LimitMarket],
    "side": BuySell,
    "takerOrMaker": TakerMaker,
    "price": float,
    "amount": float,
    "cost": float,
    "fee": FeeStructure,
})

OrderStructure = TypedDict("OrderStructure", {
    "info": RawInfo,
    "id": str,
    "clientOrderId": NotRequired[str],
    "datetime": str,
    "timestamp": int,
    "lastTradeTimestamp": NotRequired[int],
    "status": Literal["open", "closed", "canceled", "expired", "rejected"],
    "symbol": str,
    "type": str,
    "timeInForce": TimeInForce,
    "side": BuySell,
    "price": float,
    "average": float,
    "amount": float,
    "filled": float,
    "remaining": float,
    "cost": float,
    "trades": List[TradeStructure],
    "fee": NotRequired[FeeStructure],
})

LedgerEntryStructure = TypedDict("LedgerEntryStructure", {
    "id": str,
    "direction": Literal["in", "out"],
    "account": str,
    "referenceId": str,
    "referenceAccount": NotRequired[str],
    "type": Literal["trade", "transaction", "fee", "rebate", "cashback", "referral", "transfer", "airdrop", "whatever"],
    "currency": str,
    "amount": float,
    "timestamp": int,
    "datetime": str,
    "before": float,
    "after": float,
    "status": Literal["ok", "pending", "canceled"],
    "fee": NotRequired[FeeStructure],
    "info": RawInfo,
})

TransactionStructure = TypedDict("TransactionStructure", {
    "info": RawInfo,
    "id": str,
    "txid": str,
    "timestamp": int,
    "datetime": str,
    "addressFrom": NotRequired[str],
    "address": str,
    "addressTo": NotRequired[str],
    "tagFrom": str,
    "tag": str,
    "tagTo": str,
    "type": Literal["deposit", "withdrawal"],
    "amount": float,
    "currency": str,
    "status": Literal["ok", "pending", "failed", "canceled"],
    "updated": NotRequired[int],
    "comment": NotRequired[str],
    "fee": NotRequired[FeeStructure],
})

AddressStructure = TypedDict("AddressStructure", {
    "currency": str,
    "network": NotRequired[str],
    "address": str,
    "tag": NotRequired[str],
    "info": RawInfo,
})

TransferStructure = TypedDict("TransferStructure", {
    "info": RawInfo,
    "id": str,
    "timestamp": int,
    "datetime": str,
    "currency": str,
    "amount": float,
    "fromAccount": MarketType,
    "toAccount": MarketType,
    "status": str,
})

TradingFeeEntryStructure = TypedDict("TradingFeeEntryStructure", {
    "maker": float,
    "taker": float,
    "info": RawInfo,
    "symbol": str,
})
TradingFeeStructure = Dict[str, TradingFeeEntryStructure]

TransactionFeeStructure = TypedDict("TransactionFeeStructure", {
    "withdraw": Dict[str, float],
    "deposit": Dict[str, float],
    "info": RawInfo,
})

BorrowInterestStructure = TypedDict("BorrowInterestStructure", {
    "account": str,
    "currency": str,
    "interest": float,
    "interestRate": float,
    "amountBorrowed": float,
    "timestamp": int,
    "datetime": str,
    "info": RawInfo,
})

MarginLoanStructure = TypedDict("MarginLoanStructure", {
    "id": str,
    "currency": str,
    "amount": float,
    "symbol": str,
    "timestamp": int,
    "datetime": str,
    "info": RawInfo,
})

MarginStructure = TypedDict("MarginStructure", {
    "info": RawInfo,
    "type": Literal["add", "reduce", "set"],
    "amount": float,
    "total": float,
    "code": str,
    "symbol": str,
    "status": str,
})

PositionStructure = TypedDict("PositionStructure", {
    "info": RawInfo,
    "id": str,
    "symbol": str,
    "timestamp": int,
    "datetime": str,
    "isolated": bool,
    "hedged": bool,
    "side": LongShort,
    "contracts": float,
    "contractSize": float,
    "entryPrice": float,
    "markPrice": float,
    "notional": float,
    "leverage": float,
    "collateral": float,
    "initialMargin": float,
    "maintenanceMargin": float,
    "initialMarginPercentage": float,
    "maintenanceMarginPercentage": float,
    "unrealizedPnl": float,
    "liquidationPrice": float,
    "marginMode": MarginMode,
    "percentage": float,
})

FundingHistoryStructure = TypedDict("FundingHistoryStructure", {
    "info": RawInfo,
    "symbol": str,
    "code": str,
    "timestamp": int,
    "datetime": str,
    "id": str,
    "amount": float,
})
