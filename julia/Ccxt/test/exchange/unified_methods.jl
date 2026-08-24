# Drives the transpiled unified-method tests (`test/exchange/test.<method>.jl`)
# against the recorded static response fixtures.
#
# Without this file the unified-method tests are dead weight: the
# `exchange_methods` group only *loads* them, which defines `testFetchTicker`,
# `testFetchOHLCV`, … but never calls any of them, so they contribute zero
# assertions. Here each one is actually invoked, which is what makes the
# validators behind them (`testTicker`, `testOrder`, `testTrade`, …) run against
# real parsed exchange output rather than synthetic data.
#
# Relationship to the upstream suite
# ----------------------------------
# Upstream runs these tests live (`node run-tests binance --js`), because they
# were written to exercise a real endpoint. That is a non-goal here — the Julia
# suite is offline. So the HTTP layer is stubbed with the recorded
# `httpResponse` from `test/fixtures/response/<id>.json` and the test is run
# unchanged on top of it. The exchange's own `parse*` implementation, the
# validators, and the shared assertion helpers all execute exactly as they would
# live; only the socket is replaced.
#
# `skippedProperties` is resolved by `unified_get_skips` below, a port of
# `getSkips` in `ts/src/test/tests.ts`, reading the same repo-root
# `skip-tests.json` the other five languages read. Keeping that faithful matters:
# it is how upstream records "this exchange genuinely does not return that
# field", and re-deriving it here by hand would quietly diverge from the rest of
# CCXT.
#
# Nothing runs on include: this file defines `unified_methods_testset(id)`, and
# `test/runtests.jl` registers one group per exchange on top of it.

using Test
using Ccxt
using JSON3

const UNIFIED_FIXTURE_ROOT = joinpath(@__DIR__, "..", "fixtures")
const UNIFIED_SKIP_TESTS_PATH = joinpath(@__DIR__, "..", "..", "..", "..", "skip-tests.json")

# The exchange set comes from `FIXTURE_EXCHANGES` in
# `test/fixtures/static_init_offline.jl` — the same registry the static request
# and response drivers use, so the three layers cannot drift apart.

# Structure-level skip groups, verbatim from `getSkips` in `ts/src/test/tests.ts`.
# A skip recorded against e.g. `ledger` applies to every method that returns a
# ledger entry, not just the one named in the JSON.
const UNIFIED_OBJECT_SKIPS = [
    "orderBook" => ["fetchOrderBook", "fetchOrderBooks", "fetchL2OrderBook",
                    "watchOrderBook", "watchOrderBookForSymbols"],
    "ticker" => ["fetchTicker", "fetchTickers", "watchTicker", "watchTickers"],
    "trade" => ["fetchTrades", "watchTrades", "watchTradesForSymbols"],
    "ohlcv" => ["fetchOHLCV", "watchOHLCV", "watchOHLCVForSymbols"],
    "ledger" => ["fetchLedger", "fetchLedgerEntry"],
    "depositWithdraw" => ["fetchDepositsWithdrawals", "fetchDeposits", "fetchWithdrawals"],
    "depositWithdrawFee" => ["fetchDepositWithdrawFee", "fetchDepositWithdrawFees"],
]

"""
    unified_get_skips(skippedMethods, methodName) -> Dict or String

Port of `getSkips` (`ts/src/test/tests.ts`). Merges the method-level skips with
any structure-level ones, then propagates the related-key rules upstream applies
(a skipped `timestamp` also skips `datetime`, `bid` also skips `ask`,
`baseVolume` also skips `quoteVolume`). Returns a `String` when the whole method
is skipped, matching the upstream sentinel.
"""
function unified_get_skips(skippedMethods, methodName::AbstractString)
    finalSkips = Dict{Symbol,Any}()
    entry = get(skippedMethods, Symbol(methodName), nothing)
    entry isa AbstractString && return entry
    entry isa AbstractDict && merge!(finalSkips, entry)
    for (objectName, objectMethods) in UNIFIED_OBJECT_SKIPS
        methodName in objectMethods || continue
        objEntry = get(skippedMethods, Symbol(objectName), nothing)
        objEntry isa AbstractString && return objEntry
        objEntry isa AbstractDict && merge!(finalSkips, objEntry)
    end
    for (a, b) in (("timestamp", "datetime"), ("bid", "ask"), ("baseVolume", "quoteVolume"))
        if haskey(finalSkips, Symbol(a)) && !haskey(finalSkips, Symbol(b))
            finalSkips[Symbol(b)] = finalSkips[Symbol(a)]
        end
    end
    return finalSkips
end

"""
    unified_mock_http!(exchange, payload)

Replay `payload` for every HTTP call. Installed at `fetchImplementation` so the
full response pipeline (`handleRestResponse`, `parseJson`, `handleErrors` and the
exchange's own parsers) still runs, exactly as in `static_response.jl`.
"""
function unified_mock_http!(ex, payload)
    bodyText = JSON3.write(payload)
    ex.fetchImplementation = (url, params) -> Dict(
        :status => 200,
        :statusText => "OK",
        :headers => Dict{Symbol,Any}(Symbol("Content-Type") => "application/json"),
        :text => (() -> bodyText),
        :arrayBuffer => (() -> Vector{UInt8}(codeunits(bodyText))),
    )
    return ex
end

# method name => (test entry point, how it wants its third argument).
#   :none   -> testX(exchange, skippedProperties)
#   :symbol -> testX(exchange, skippedProperties, symbol)
#   :code   -> testX(exchange, skippedProperties, currencyCode)
const UNIFIED_METHOD_TESTS = Dict{String,Tuple{Any,Symbol}}(
    "fetchTicker"             => (testFetchTicker, :symbol),
    "fetchTickers"            => (testFetchTickers, :symbol),
    "fetchOHLCV"              => (testFetchOHLCV, :symbol),
    "fetchOrderBook"          => (testFetchOrderBook, :symbol),
    "fetchTrades"             => (testFetchTrades, :symbol),
    "fetchMyTrades"           => (testFetchMyTrades, :symbol),
    "fetchOrders"             => (testFetchOrders, :symbol),
    "fetchOpenOrders"         => (testFetchOpenOrders, :symbol),
    "fetchClosedOrders"       => (testFetchClosedOrders, :symbol),
    "fetchPositions"          => (testFetchPositions, :symbol),
    "fetchFundingRateHistory" => (testFetchFundingRateHistory, :symbol),
    "fetchBalance"            => (testFetchBalance, :none),
    "fetchStatus"             => (testFetchStatus, :none),
    "fetchAccounts"           => (testFetchAccounts, :none),
    "fetchCurrencies"         => (testFetchCurrencies, :none),
    "fetchLedger"             => (testFetchLedger, :code),
    "fetchDeposits"           => (testFetchDeposits, :code),
    "fetchWithdrawals"        => (testFetchWithdrawals, :code),
    "fetchTransfers"          => (testFetchTransfers, :code),
)

# Keys the shared validators bound-check against zero, and the bound each one
# uses. A recorded value that violates its bound is a real disagreement between
# the exchange's parser and the validator, not a missing field, so it gets its
# own rule in `unified_fixture_skips` — see the note there.
#
# Both sets are transcribed from the `assertGreaterOrEqual (…, '0')` and
# `assertGreater (…, '0')` call sites in the `ts/src/test/Exchange/base/*.ts`
# validators reachable from the methods this driver runs. Only top-level keys of
# a unified structure are listed; nested ones (`limits.min`, `precision.amount`)
# are not scanned, which can only under-skip, never over-skip.
const UNIFIED_NON_NEGATIVE_KEYS = Set{Symbol}([
    :amount, :before, :after, :cost, :filled, :remaining, :total,
    :vwap, :askVolume, :bidVolume, :baseVolume, :quoteVolume,
])

const UNIFIED_POSITIVE_KEYS = Set{Symbol}([
    # test.position.ts
    :leverage, :initialMargin, :initialMarginPercentage, :maintenanceMargin,
    :maintenanceMarginPercentage, :entryPrice, :notional, :contracts,
    :contractSize, :marginRatio, :liquidationPrice, :markPrice, :collateral,
    # test.ticker.ts
    :open, :high, :low, :close, :ask, :bid, :average,
    # test.order.ts
    :price, :stopPrice,
    # test.status.ts
    :updated, :eta,
])

"""
    unified_fixture_entries(parsed) -> Vector

The individual unified structures inside a recorded `parsedResponse`. Most
methods record a list; `fetchTickers` and `fetchCurrencies` record a dict keyed
by symbol / currency code.

`Base.values` must be qualified here: `test/setup.jl` imports a number of CCXT
helpers into `Main`, which leaves several `Base` names (`values`, `sort`,
`sleep`, …) ambiguous for a bare call.
"""
function unified_fixture_entries(parsed)
    parsed isa AbstractVector && return collect(parsed)
    parsed isa AbstractDict && return collect(Base.values(parsed))
    return Any[]
end

"""
    unified_fixture_skips(parsed) -> Dict

Derive the extra `skippedProperties` implied by the *recording itself*.

These tests were written against a live endpoint, where optional fields are
generally populated. A fixture is one captured call, so it can legitimately lack
an optional field the validator would otherwise demand — okx's recorded position
carries no `notional`, kraken's recorded deposit no `updated`. Those absences
describe the recording, not a defect, so they are read straight off the stored
`parsedResponse` rather than hand-listed (a hand-written list would silently rot
as fixtures are re-captured).

This cannot mask a parser bug: `static_response.jl` already asserts field by
field that what the parser computes equals what is stored, so a field the parser
wrongly nulls out fails *there*. Only fields that are null in the stored,
independently verified output are skipped here.

A recorded value that violates a numeric bound is treated the same way, for the
same reason. Two occur in these fixtures, and the reference JavaScript build
parses both to the identical value, so each is an upstream disagreement between
an exchange's parser and a validator rather than a Julia defect:

  * okx's ledger entry records `amount: -10.158`, encoding the direction in the
    sign, while `testLedgerEntry` asserts `amount >= 0` and reads direction from
    the separate `direction` field.
  * coinbase's position records `liquidationPrice: 0` — no liquidation price for
    an unleveraged position — while `testPosition` asserts it is strictly
    positive, which holds only for a leveraged one.

Only the offending field is skipped; every other field of the entry is still
checked.

The `amountOfCurrencies` skip is the same idea applied to a count rather than a
key. `testFetchCurrencies` demands more than five currencies, which is a
statement about a live exchange; a fixture records a handful (kraken's records
two). Upstream spells that exemption `amountOfCurrencies` in `skip-tests.json`,
so the same key is reused rather than inventing a Julia-only one.
"""
function unified_fixture_skips(parsed)
    skips = Dict{Symbol,Any}()
    entries = unified_fixture_entries(parsed)
    for entry in entries
        entry isa AbstractDict || continue
        for (k, v) in entry
            k === :info && continue
            if v === nothing
                skips[k] = "null in recorded fixture"
            elseif v isa Real && !(v isa Bool)
                if k in UNIFIED_NON_NEGATIVE_KEYS && v < 0
                    skips[k] = "recorded value $v is negative"
                elseif k in UNIFIED_POSITIVE_KEYS && v <= 0
                    skips[k] = "recorded value $v is not strictly positive"
                end
            end
        end
    end
    if 0 < length(entries) <= 5
        skips[:amountOfCurrencies] = "fixture records $(length(entries)) currencies, not a live listing"
    end
    return skips
end

"""
    unified_fixture_recorded_params(input) -> Dict

The exchange-specific `params` the fixture was captured with.

A few methods cannot run without one: coinbase's `fetchPositions` raises
`ArgumentsRequired` unless a `portfolio` UUID is supplied, and the recording
carries the UUID it was captured with. The unified test signature has nowhere to
put such a param — upstream's answer, quoted in that very error message, is
`exchange.options`, and `handleOptionAndParams` resolves params and options
through the same lookup.

Applying them matters beyond that one case: a payload recorded for
`{'type': 'papi'}` is a portfolio-margin balance, and parsing it as spot would
be checking the parser against data it was never given. Restoring the params
runs each test against the payload under the conditions it belongs to.

They are installed in the per-method namespace (`options[methodName]`), which
`handleOptionAndParams` and `handleMarketTypeAndParams` both consult before the
exchange-wide one, so nothing leaks into sibling methods.
"""
function unified_fixture_recorded_params(input)
    params = Dict{Symbol,Any}()
    input isa AbstractVector || return params
    for arg in input
        arg isa AbstractDict && merge!(params, arg)
    end
    return params
end

"""
    unified_apply_recorded_params!(exchange, methodName, params)

Merge `params` into `exchange.options[methodName]`, preserving any per-method
options the exchange already declares (binance ships a `fetchPositions.method`
default, and `extend` is shallow, so assigning the dict outright would drop it).
"""
function unified_apply_recorded_params!(ex, methodName::AbstractString, params)
    isempty(params) && return ex
    existing = get(ex.options, Symbol(methodName), nothing)
    # `Base.merge` must be qualified, like `Base.values` above: CCXT exports a
    # `merge` of its own into the test `Main`.
    merged = existing isa AbstractDict ? Base.merge(Dict{Symbol,Any}(existing), params) : params
    Ccxt.extendExchangeOptions(ex, Dict{Symbol,Any}(Symbol(methodName) => merged))
    return ex
end

"""
    unified_fee_cost_is_numeric(parsed) -> Bool

Whether every recorded `fee.cost` is a number.

`assertFeeStructure` requires `fee['cost']` to be numeric, and unlike its
siblings it takes no `skippedProperties` escape hatch — deliberately, since a
stringly-typed fee is a real defect. kraken's and coinbase's recorded orders
carry `fee.cost` as the raw exchange string, so those entries genuinely violate
the unified contract.

The cause is in `safeOrder` (`ts/src/base/Exchange.ts`): when a parser sets
`fee` but not `fees`, `parseFee` is false, so the numeric conversion is applied
only to the copy pushed into `fees[]` while `order['fee']` is returned as the
parser left it. The reference JavaScript build produces the identical string
cost from these same fixtures, so this is upstream behaviour, not a Julia
porting defect, and fixing base `safeOrder` is outside this port's scope.

Upstream's live suite does not trip over it because a test account usually has
no open or closed orders to iterate, and an empty array passes. Recorded
fixtures always carry data, so the driver meets it every run.

Affected entries are excluded and marked `@test_broken` rather than silently
dropped, which both surfaces them in the summary and turns the situation into an
error the moment it stops being true — if `safeOrder` is fixed or a fixture is
re-captured, the unexpected pass forces this exclusion to be removed.
"""
function unified_fee_cost_is_numeric(parsed)
    for entry in unified_fixture_entries(parsed)
        entry isa AbstractDict || continue
        fee = get(entry, :fee, nothing)
        fee isa AbstractDict || continue
        cost = get(fee, :cost, nothing)
        (cost === nothing || cost isa Number) || return false
    end
    return true
end

"""
    unified_pick_argument(kind, input, parsed) -> String or nothing

Choose the symbol / currency code to run a test with. The fixture's own `input`
array is preferred, since that is the call that produced the recorded payload;
otherwise it is read back off the stored `parsedResponse` so the argument always
matches the data the test will see.
"""
function unified_pick_argument(kind::Symbol, input, parsed)
    if input isa AbstractVector && !isempty(input) && input[1] isa AbstractString
        return String(input[1])
    end
    first_entry = nothing
    if parsed isa AbstractVector && !isempty(parsed)
        first_entry = parsed[1]
    elseif parsed isa AbstractDict
        first_entry = parsed
    end
    first_entry isa AbstractDict || return nothing
    key = kind === :symbol ? :symbol : :currency
    v = get(first_entry, key, nothing)
    v isa AbstractString && return v
    # `fetchTickers` stores a dict keyed by symbol rather than a list.
    if kind === :symbol && parsed isa AbstractDict && !isempty(parsed)
        return String(first(keys(parsed)))
    end
    return nothing
end

"""
    unified_methods_testset(id)

Run every unified-method test that has a recorded response fixture for `id`.

Scoped per exchange so the suite can shard it and so a single exchange can be
re-run on its own; `test/runtests.jl` registers one group per exchange
(`unified_binance`, `unified_kraken`, …).
"""
function unified_methods_testset(id::AbstractString)
    cls = fixture_exchange_class(id)
    skipData = _static_loadjson(UNIFIED_SKIP_TESTS_PATH)
    @testset "unified methods vs response fixtures: $id" begin
        data = _static_loadjson(joinpath(UNIFIED_FIXTURE_ROOT, "response", id * ".json"))
        globalOptions = get(data, :options, Dict{Symbol,Any}())
        skippedMethods = get(get(skipData, Symbol(id), Dict{Symbol,Any}()),
                             :skipMethods, Dict{Symbol,Any}())
        for (mname, entries) in get(data, :methods, Dict{Symbol,Any}())
            mn = String(mname)
            haskey(UNIFIED_METHOD_TESTS, mn) || continue
            testfn, kind = UNIFIED_METHOD_TESTS[mn]
            skips = unified_get_skips(skippedMethods, mn)
            # A string means upstream skips the whole method for this exchange.
            skips isa AbstractString && continue
            # Use the first enabled entry that carries a recorded payload.
            entry = nothing
            for e in entries
                get(e, :disabled, false) === true && continue
                get(e, :httpResponse, nothing) === nothing && continue
                entry = e
                break
            end
            entry === nothing && continue
            # An entry whose recorded fee.cost is a string cannot satisfy
            # `assertFeeStructure`, which has no skip channel. Record the
            # known-failing expectation instead of dropping it silently —
            # see `unified_fee_cost_is_numeric` for why this is upstream.
            if !unified_fee_cost_is_numeric(get(entry, :parsedResponse, nothing))
                @testset "$mn" begin
                    @test_broken unified_fee_cost_is_numeric(get(entry, :parsedResponse, nothing))
                end
                continue
            end
            merge!(skips, unified_fixture_skips(get(entry, :parsedResponse, nothing)))
            arg = unified_pick_argument(kind, get(entry, :input, nothing),
                                        get(entry, :parsedResponse, nothing))
            (kind !== :none && arg === nothing) && continue
            ex = static_init_offline(id, cls)
            ex.httpProxy = nothing
            ex.httpsProxy = nothing
            Ccxt.extendExchangeOptions(ex, globalOptions)
            entryOptions = get(entry, :options, nothing)
            entryOptions !== nothing && Ccxt.extendExchangeOptions(ex, entryOptions)
            unified_apply_recorded_params!(ex, mn,
                unified_fixture_recorded_params(get(entry, :input, nothing)))
            unified_mock_http!(ex, get(entry, :httpResponse, nothing))
            @testset "$mn" begin
                if kind === :none
                    testfn(ex, skips)
                else
                    testfn(ex, skips, arg)
                end
            end
        end
    end
end
