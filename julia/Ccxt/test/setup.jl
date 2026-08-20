# Shared preamble for every test group.
#
# `runtests.jl` includes this once before running any group. Individual group
# files (`test/groups/*.jl`) assume everything set up here is already in scope,
# which lets a single group be run on its own for a fast edit/test loop:
#
#     julia --project test/runtests.jl base
#     julia --project test/runtests.jl ws validators
#
using Test
using Ccxt

# In TS source, tests reference `ccxt` (lowercase) as the module name.
# Julia module is `Ccxt` (uppercase). Create lowercase alias.
const ccxt = Ccxt

# The transpiled helper functions (milliseconds, aggregate, safeX, assertX,
# ccxtruthy, ccxt_gt, ...) live in the `Ccxt.functions` submodule. Tests call
# them both qualified (`functions.ccxtruthy`) and bare (`milliseconds(...)`).
# Bring them into Main scope so both forms resolve.
const functions = Ccxt.functions
using Ccxt.functions
using Ccxt: CcxtExchange

# `Ccxt.functions` keeps `get` as a Ccxt-scoped helper (it is NOT a global
# `Base.get` override on builtin types — see `functions.ccxt_get`). The
# transpiled tests call `get(ccxt, Symbol("Exchange"), nothing)` to resolve a
# class by name, which requires `get` to bind to the Ccxt helper here in Main.
# Bind it explicitly so the test scope resolves `get` to the Ccxt implementation
# without re-pirating `Base` for the rest of the session.
const get = Ccxt.functions.get

# Base-module utility/helper methods (defined in `Ccxt.BaseMethods` and used by
# the transpiled test helpers as free functions, e.g. `jsonStringifyWithNull`,
# `getProperty`, `currency`, `safeCurrency`, `fetchTicker`, ...) are not all
# re-exported by `using Ccxt`. Import them explicitly into Main so the test
# files can call them bare.
using Ccxt: arraysConcat, binaryLength, binaryToString, base16decode, cancelAllOrders, cancelOrder,
    checkProxySettings, checkProxyUrlSettings, close, createOrder, createSafeDictionary,
    currency, describe, ethGetAddressFromPrivateKey, exceptionMessage, featureValue,
    fetch, fetch2, fetchAccounts, fetchBalance, fetchBidsAsks, fetchBorrowInterest,
    fetchClosedOrders, fetchCurrencies, fetchDeposits, fetchFundingRateHistory,
    fetchL2OrderBook, fetchLastPrices, fetchLedger, fetchLedgerEntry, fetchLeverageTiers,
    fetchLiquidations, fetchMarginMode, fetchMarginModes, fetchMarketLeverageTiers,
    fetchMarkets, fetchMyLiquidations, fetchMyTrades, fetchOHLCV, fetchOpenInterestHistory,
    fetchOpenOrders, fetchOrder, fetchOrderBook, fetchOrderBooks, fetchOrders,
    fetchPositions, fetchStatus, fetchTicker, fetchTickers, fetchTrades, fetchTradingFee,
    fetchTradingFees, fetchTransactions, fetchTransfers, fetchWithdrawals, getFetchCache,
    getProperty, handleMarketTypeAndParams, handleRequestNetwork, isBinaryMessage,
    isDictionary, isTickPrecision, jsonStringifyWithNull, loadMarkets, mapToSafeMap,
    market, networkCodeToId, networkIdToCode, parseNumber, parsePrecision, parseToInt,
    parseToNumeric, removeRepeatedElementsFromArray, safeBool, safeBool2, safeBoolN,
    safeCurrency, safeDict, safeDict2, safeDictN, safeIntegerOmitZero, safeList,
    safeList2, safeListN, safeMarket, safeNumber, safeNumber2, safeNumberN,
    safeNumberOmitZero, safeTicker, setMarketsFromExchange, setProperty, setSandboxMode,
    signIn, stringToBase16, stringToBinary, watchBalance, watchBidsAsks,
    watchLiquidationsForSymbols, watchMyTrades, watchOHLCV, watchOHLCVForSymbols,
    watchOrderBook, watchOrderBookForSymbols, watchOrders, watchPosition, watchPositions,
    watchTicker, watchTickers, watchTrades, watchTradesForSymbols

# Arbitrary-precision string arithmetic lives in the `Ccxt.PreciseArith`
# submodule (named apart from the `Precise` type it exports, so that the type
# stays importable under its own name — see `src/Precise.jl`).
# Only the `string*` wrapper API and the `Precise` type itself are pulled into
# Main — the bare operations (`add`, `div`, `mod`, `abs`, `min`, `max`,
# `reduce`, ...) collide with `Base` and are always called qualified.
using Ccxt.PreciseArith: Precise, stringMul, stringDiv, stringAdd, stringSub,
    stringAbs, stringNeg, stringMod, stringOr, stringEquals, stringEq,
    stringMin, stringMax, stringGt, stringGe, stringLt, stringLe

# WebSocket base data structures (`src/wsbase.jl`) exercised by the Pro base
# tests. `reset` and `limit` also exist in `Base`, so a bare `using Ccxt`
# leaves them ambiguous rather than resolved; import them by name so the
# transpiled `reset(orderBook)` / `limit(orderBook)` calls bind to ours.
using Ccxt: reset, limit, store, storeArray, append, clear, getLimit, ws_equals

# The Julia transpiler emits utility calls thread from the TS source as
# `helper(exchange, args...)` — i.e. it threads the exchange instance as a
# leading `self` argument, exactly like an `Exchange` method. These helpers are
# plain free functions that do NOT take `self`, and for the `safe*` family the
# real first argument (the parsed object) follows the redundant exchange. We
# install a thin overload in the test scope that drops the spurious leading
# `CcxtExchange` and forwards to the real implementation. Genuine
# `CcxtExchange` methods (e.g. `fetchTicker(self, symbol)`) are unaffected
# because Julia dispatch prefers their more-specific signatures.
const _CCXT_NOSELF_UTILS = Symbol[
    :aggregate, :arrayConcat, :capitalize, :clone, :decimalToPrecision,
    :deepExtend, :existsFile, :extend, :extractParams, :filterBy, :getTempDir,
    :groupBy, :implodeParams, :inArray, :indexBy, :isEmpty, :isJsonEncodedObject,
    :json, :keysort, :microseconds, :milliseconds, :numberToBE, :numberToString,
    :omit, :omitZero, :parseDate, :parseTimeframe, :precisionFromString, :rawencode,
    :readFile, :roundTimeframe, :safeFloat, :safeFloatN, :safeInteger, :safeIntegerN,
    :safeIntegerProduct, :safeIntegerProductN, :safeString, :safeStringLower,
    :safeStringLowerN, :safeStringN, :safeStringUpper, :safeStringUpperN,
    :safeTimestamp, :safeTimestampN, :safeValue, :safeValueN, :seconds, :sleep,
    :sortBy, :strip, :sum, :toArray, :unique, :urlencode, :urlencodeNested,
    :urlencodeWithArrayRepeat, :uuid, :writeFile, :ymd, :ymdhms, :yymmdd, :yyyymmdd,
    # Binary / crypto conversion helpers that are free functions in
    # `Ccxt.functions`; the transpiler threads `exchange` as a leading `self`
    # into each call. NOTE: `stringToBinary`/`binaryToString` are genuine
    # `CcxtExchange` methods (see BaseMethods.jl:737/741) and are NOT listed
    # here — the transpiler's threaded `self` already dispatches to them.
    :base16ToBinary, :binaryToBase16, :base58ToBinary, :binaryToBase58,
    :base64ToBinary, :binaryToBase64, :binaryConcat, :binaryConcatArray,
    :stringToBase64, :base64ToString,
    # Crypto / datetime free helpers — same threaded-`self` treatment.
    :ccxt_in, :ccxt_indexOf, :objectKeys, :objectValues, :objectEntries,
    :utf8encode, :utf8decode, :hmac, :crc32,
    :hash, :encode, :decode, :ecdsa, :rsa, :jwt, :totp, :iso8601, :parse8601,
    # `2`-suffixed and misc. free helpers used by the transpiled base tests.
    :packb, :urlencodeBase64, :numberToLE, :base64ToBase64Url, :unCamelCase,
    :now, :sortBy2, :safeString2, :safeValue2, :safeFloat2, :safeInteger2,
    :safeStringLower2, :safeStringUpper2, :safeTimestamp2, :safeIntegerProduct2,
    :uuid16, :uuid22,
    # `sort!` collides with `Base.sort!`; the transpiler emits CCXT's `sort`
    # helper as `sort!` (e.g. `exchange.sort(array)` -> `sort!(array, exchange)`).
    # Add a Main forwarder so the bare name routes to `Ccxt.functions.sort!`
    # instead of Base's in-place sorter.
    :sort!,
    # Numeric coercion helper used by the transpiled `safeFloat`/`safeNumber`
    # assertions (`safeFloat (exchange, dict, 'i') === exchange.parseToNumeric
    # (1)` in TS becomes `... == ccxt_toNumber(1)`).
    :ccxt_toNumber,
]
# Installing the shim is subtler than it looks. In Julia 1.12 a bare
# `using M` (or `using M: name`) makes `name` *readable* in Main but does not
# make it extendable: `@eval name(...) = ...` then defines a brand-new Main
# function that shadows the original and drops every existing method. Only
# `import M: name` binds the name for extension. Names that clash with `Base`
# (`hash`, `sleep`, `sum`, `strip`, `unique`, `sort`, ...) are worse still —
# `using` leaves them ambiguous, so they are not even readable.
#
# So for each helper we resolve the owning module explicitly, `import` the name
# from it, and add the self-dropping method to the *existing* function. Bare
# no-self calls (`hash(encode(""), sha256, "hex")`) keep working because the
# original methods are still there, and any genuine `Exchange` method of the
# same name stays more specific than our `(::CcxtExchange, args...)` catch-all.
function _ccxt_owner(sym::Symbol)
    for m in (Ccxt.functions, Ccxt)
        if isdefined(m, sym) && getfield(m, sym) isa Function
            return getfield(m, sym)
        end
    end
    return nothing
end

const _CCXT_SHIM_SKIPPED = Symbol[]
for _sym in _CCXT_NOSELF_UTILS
    _fn = _ccxt_owner(_sym)
    if _fn === nothing
        push!(_CCXT_SHIM_SKIPPED, _sym)
        continue
    end
    # Define a fresh Main binding rather than extending the imported one.
    # Many of these helpers are plain const aliases (`base16ToBinary =
    # base16decode`, `encode = utf8encode`, ...) which Julia refuses to add
    # methods to, so a forwarder is the only uniform option. Both call shapes
    # are forwarded to the same underlying implementation: the transpiler's
    # `helper(exchange, xs...)` drops the exchange, and a bare `helper(xs...)`
    # passes straight through. None of the names listed above is a genuine
    # `self`-taking `Exchange` method, so nothing real gets shadowed.
    @eval begin
        $(_sym)(self::CcxtExchange, args...; kwargs...) = $(_fn)(args...; kwargs...)
        $(_sym)(args...; kwargs...) = $(_fn)(args...; kwargs...)
    end
end
if !isempty(_CCXT_SHIM_SKIPPED)
    @warn "no-self shim skipped (not defined in Ccxt)" symbols = _CCXT_SHIM_SKIPPED
end

# Warm up the async/timer machinery exactly once, before any timed test runs.
# Julia's first `@async` + `Base.sleep` + `setTimeout_safe` call path pays a
# one-time JIT/thread-pool cold-start cost of a few hundred milliseconds. `test.sleep`
# measures wall-time around a single `sleep` call and only allows a ±20 ms margin,
# so without this warmup the very first `sleep` in the process blows past the ceiling.
# Running it here (outside any timed section) keeps the test's measurement honest.
let
    function _warm()
        Base.fetch(sleep(10))
    end
    try _warm() catch; end
end

# Same reasoning for `loadMarkets`. `test.setMarketsFromExchange` asserts that
# calling `loadMarkets` on an exchange whose markets were copied from another
# instance is a pure cache hit (`timeTaken < 10` ms — no re-derivation, no
# network). That budget is about the *cache lookup*, but the first
# `loadMarkets` call in a fresh process also pays Julia's one-time JIT cost for
# the whole `loadMarkets`/`setMarkets` call graph, which alone exceeds 10 ms.
# Compiling it here, outside any timed section, keeps the test measuring what
# it is meant to measure.
let
    warmMarkets = Dict{Symbol, Any}(
        Symbol("BTC/USD") => Dict{Symbol, Any}(
            Symbol("id") => "BtcUsd",
            Symbol("symbol") => "BTC/USD",
            Symbol("base") => "BTC",
            Symbol("quote") => "USD",
            Symbol("baseId") => "Btc",
            Symbol("quoteId") => "Usd",
            Symbol("type") => "spot",
            Symbol("spot") => true,
        ),
    )
    try
        warmExchange = Ccxt.Exchange(Dict{Symbol, Any}(
            Symbol("id") => "warmupEx",
            Symbol("markets") => warmMarkets,
        ))
        Base.fetch(loadMarkets(warmExchange))
        Base.fetch(loadMarkets(warmExchange))
    catch
    end
end

# Shared test methods — must be loaded before any group, since the transpiled
# base/validator/exchange tests all call `testSharedMethods` helpers.
include("validators/test.sharedMethods.jl")
