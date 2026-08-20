# --- TS type aliases type-erased to Any (no runtime meaning in dynamic Julia) ---
# These mirror the `const X = Any` aliases the `--base` transpile used to
# prepend to BaseMethods.jl. They are extracted here so every included file
# (functions, WS base, BaseMethods, exchanges) resolves the names.
const ADL = Any
const Account = Any
const ArrayCacheByTimestamp = Any
const Balance = Any
const BalanceAccount = Any
const Balances = Any
const BorrowInterest = Any
const Conversion = Any
const CrossBorrowRate = Any
const Currency = Any
const CurrencyInterface = Any
const DepositAddress = Any
const Dictionary = Any
const Fee = Any
const FundingHistory = Any
const FundingRate = Any
const FundingRateHistory = Any
const Greeks = Any
const IndexType = Any
const LastPrice = Any
const LastPrices = Any
const LedgerEntry = Any
const Leverage = Any
const LeverageTier = Any
const Leverages = Any
const Liquidation = Any
const LongShortRatio = Any
const MarginMode = Any
const MarginModes = Any
const Market = Any
const MarketInterface = Any
const MarketType = Any
const MinMax = Any
const Num = Any
const OHLCV = Any
const OHLCVC = Any
const Ob = Any
const OpenInterest = Any
const Option = Any
const OptionChain = Any
const Order = Any
const OrderBook = Any
const OrderRequest = Any
const OrderSide = Any
const OrderType = Any
const Position = Any
const Str = Any
const Strings = Any
const Ticker = Any
const Tickers = Any
const Trade = Any
const Transaction = Any
const TransferEntry = Any
const NestedDictionary = Any
const Currencies = Any
const ArrayCache = Any
const ConstructorArgs = Any
# TS primitive aliases the transpiler emits as `ccxt_*` names.
# `ccxt_Number` is the default value for the `number` Function field
# (TS `number: Number` initializer). It ports the JS `Number()` global.
function ccxt_Number(x=nothing)
    if x === nothing || x === ""
        return nothing
    elseif x isa Number
        return x
    else
        v = tryparse(Float64, string(x))
        return v === nothing ? x : v
    end
end
# JS static-property access on the transpiled `Number` global
# (e.g. `Number.MAX_VALUE`). Ported as a Julia function, so expose the
# statics via `get`; the constructor feeds this into a `Float64` field.
const ccxt_Number_MAX_VALUE = typemax(Float64)
function Base.get(::typeof(ccxt_Number), k::Symbol, default)
    if k === Symbol("MAX_VALUE")
        return ccxt_Number_MAX_VALUE
    end
    return default
end
# WebSocket base classes (Cache, OrderBookSide, OrderBook, the ArrayCache
# family and `Future`) are implemented for real in `wsbase.jl` and used by the
# offline Pro WS base tests (cache, orderBook, future). `Client`/`WsClient`
# remain type-erased to `Any` for now: the REST `Exchange` base only references
# them by name inside methods that are never invoked on the offline test path
# (the live-network `close` test is excluded from the offline suite), so the
# foundation still loads cleanly. When the full WS transport lands, real
# transpiled classes replace these.
#
# `Future` deliberately has no alias here — `wsbase.jl` defines it as a concrete
# type, and a `const Future = Any` in this file would shadow it (this file is
# included first) and make `Future()` fail with "no constructors have been
# defined for Any".
const Client = Any
const Cache = Any
const WsClient = Any
