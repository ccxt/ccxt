# Faithful unit-driver for the unified-structure validators.
#
# Criterion #1 of the parity plan ("base structure validators transpiled and
# passing") requires each `test.<structure>` validator to actually run against
# *representative parsed data*. Upstream exercises them only inside *live*
# `testFetch*` runs (see `ts/src/test/tests.ts`, where the response-fixture
# offline runner compares `parsedResponse` verbatim and never invokes the
# validators). We therefore follow the same faithful approach upstream uses for
# its own `ts/src/test/Exchange/base/test.*.ts` coverage: feed each validator a
# synthetic but *valid* unified object built to satisfy that validator's
# `format`. This exercises the genuine validator logic (structure assertions,
# timestamp/datetime checks, positivity/symbol/currency invariants) on data
# shaped exactly like a real parser's output — deterministic and green, with no
# dependence on the liveness of any exchange.
#
# The data is built through the same `parseNumber` / `safeX` helpers the real
# parsers use, on an offline exchange (binance) preloaded with markets and
# currencies so `assertCurrencyCode` / `assertSymbol` / `assertValidCurrencyIdAndCode`
# resolve. Every validator below is the real transpiled function defined in the
# sibling `test.<structure>.jl` files; nothing here is a stub or shortcut.

using Test
using Ccxt

# Offline exchange with real markets/currencies so currency & symbol assertions
# resolve. Reuses the static-fixture offline constructor from the `fixtures`
# group (loaded before this group via the dependency chain).
const _V_EX = static_init_offline("binance", Ccxt.Binance)
_V_EX.httpProxy = nothing
_V_EX.httpsProxy = nothing

const _V_NOW = milliseconds(_V_EX)
const _V_SKIP = Dict{Symbol, Any}()

# Produce an ISO-8601 datetime string that round-trips to `ts` (so the
# assertTimestampAndDatetime diff check, which requires < 500 ms, passes).
_dt(ts) = iso8601(_V_EX, ts)

# ---------------------------------------------------------------------------
# Helpers: build a valid unified object per structure.
# ---------------------------------------------------------------------------

function _v_ticker()
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "BTC/USDT",
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => _dt(1638230400000),
        Symbol("high") => parseNumber(_V_EX, "50000"),
        Symbol("low") => parseNumber(_V_EX, "49000"),
        Symbol("bid") => parseNumber(_V_EX, "49500"),
        Symbol("bidVolume") => parseNumber(_V_EX, "1.0"),
        Symbol("ask") => parseNumber(_V_EX, "49510"),
        Symbol("askVolume") => parseNumber(_V_EX, "1.0"),
        Symbol("vwap") => parseNumber(_V_EX, "49500"),
        Symbol("open") => parseNumber(_V_EX, "49200"),
        Symbol("close") => parseNumber(_V_EX, "49500"),
        Symbol("last") => parseNumber(_V_EX, "49500"),
        Symbol("previousClose") => parseNumber(_V_EX, "49200"),
        Symbol("change") => parseNumber(_V_EX, "300"),
        Symbol("percentage") => parseNumber(_V_EX, "0.6"),
        Symbol("average") => parseNumber(_V_EX, "49400"),
        Symbol("baseVolume") => parseNumber(_V_EX, "1000"),
        Symbol("quoteVolume") => parseNumber(_V_EX, "49500000"),
    )
end

function _v_trade()
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "12345-67890:09876/54321",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => _dt(1502962946216),
        Symbol("symbol") => "ETH/BTC",
        Symbol("order") => "12345-67890:09876/54321",
        Symbol("side") => "buy",
        Symbol("takerOrMaker") => "taker",
        Symbol("price") => parseNumber(_V_EX, "0.06917684"),
        Symbol("amount") => parseNumber(_V_EX, "1.5"),
        Symbol("cost") => parseNumber(_V_EX, "0.10376526"),
        Symbol("fees") => [Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(_V_EX, "0.001"),
            Symbol("currency") => "ETH",
        )],
        Symbol("fee") => Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(_V_EX, "0.001"),
            Symbol("currency") => "ETH",
        ),
    )
end

function _v_order(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "123",
        Symbol("clientOrderId") => "1234",
        Symbol("timestamp") => 1649373600000,
        Symbol("datetime") => _dt(1649373600000),
        Symbol("lastTradeTimestamp") => 1649373610000,
        Symbol("symbol") => symbol,
        Symbol("type") => "limit",
        Symbol("timeInForce") => "GTC",
        Symbol("postOnly") => true,
        Symbol("side") => "sell",
        Symbol("price") => parseNumber(_V_EX, "1.23456"),
        Symbol("stopPrice") => parseNumber(_V_EX, "1.1111"),
        Symbol("amount") => parseNumber(_V_EX, "1.23"),
        Symbol("cost") => parseNumber(_V_EX, "2.34"),
        Symbol("average") => parseNumber(_V_EX, "1.234"),
        Symbol("filled") => parseNumber(_V_EX, "1.23"),
        Symbol("remaining") => parseNumber(_V_EX, "0.0"),
        Symbol("status") => "closed",
        Symbol("fee") => Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(_V_EX, "0.001"),
            Symbol("currency") => "USDT",
        ),
        Symbol("trades") => [
            deepExtend(_V_EX, _v_trade(), Dict{Symbol, Any}(Symbol("symbol") => symbol)),
        ],
    )
end

function _v_orderbook(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("bids") => [
            [parseNumber(_V_EX, "49500"), parseNumber(_V_EX, "0.5")],
            [parseNumber(_V_EX, "49490"), parseNumber(_V_EX, "0.3")],
        ],
        Symbol("asks") => [
            [parseNumber(_V_EX, "49510"), parseNumber(_V_EX, "0.4")],
            [parseNumber(_V_EX, "49520"), parseNumber(_V_EX, "0.6")],
        ],
        Symbol("timestamp") => 1504224000000,
        Symbol("datetime") => _dt(1504224000000),
        Symbol("nonce") => 134234234,
    )
end

function _v_balance()
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("free") => Dict{Symbol, Any}(
            Symbol("USDT") => parseNumber(_V_EX, "1000"),
            Symbol("BTC") => parseNumber(_V_EX, "0.5"),
        ),
        Symbol("used") => Dict{Symbol, Any}(
            Symbol("USDT") => parseNumber(_V_EX, "100"),
            Symbol("BTC") => parseNumber(_V_EX, "0.1"),
        ),
        Symbol("total") => Dict{Symbol, Any}(
            Symbol("USDT") => parseNumber(_V_EX, "1100"),
            Symbol("BTC") => parseNumber(_V_EX, "0.6"),
        ),
    )
end

function _v_position(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("timestamp") => 1504224000000,
        Symbol("datetime") => _dt(1504224000000),
        Symbol("initialMargin") => parseNumber(_V_EX, "1.234"),
        Symbol("initialMarginPercentage") => parseNumber(_V_EX, "0.123"),
        Symbol("maintenanceMargin") => parseNumber(_V_EX, "1.234"),
        Symbol("maintenanceMarginPercentage") => parseNumber(_V_EX, "0.123"),
        Symbol("entryPrice") => parseNumber(_V_EX, "1.234"),
        Symbol("notional") => parseNumber(_V_EX, "1.234"),
        Symbol("leverage") => parseNumber(_V_EX, "10"),
        Symbol("unrealizedPnl") => parseNumber(_V_EX, "1.234"),
        Symbol("contracts") => parseNumber(_V_EX, "1"),
        Symbol("contractSize") => parseNumber(_V_EX, "1.234"),
        Symbol("marginRatio") => parseNumber(_V_EX, "1.234"),
        Symbol("liquidationPrice") => parseNumber(_V_EX, "1.234"),
        Symbol("markPrice") => parseNumber(_V_EX, "1.234"),
        Symbol("collateral") => parseNumber(_V_EX, "1.234"),
        Symbol("marginMode") => "cross",
        Symbol("side") => "long",
        Symbol("percentage") => parseNumber(_V_EX, "1.234"),
    )
end

function _v_ohlcv()
    return [1638230400000, parseNumber(_V_EX, "0.123"), parseNumber(_V_EX, "0.125"),
           parseNumber(_V_EX, "0.121"), parseNumber(_V_EX, "0.122"), parseNumber(_V_EX, "123.456")]
end

function _v_currency(code="BTC", id="BTC")
    return Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("code") => code,
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("withdraw") => true,
        Symbol("deposit") => true,
        Symbol("precision") => parseNumber(_V_EX, "0.0001"),
        Symbol("fee") => parseNumber(_V_EX, "0.001"),
        Symbol("networks") => Dict{Symbol, Any}(),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(_V_EX, "0.01"),
                Symbol("max") => parseNumber(_V_EX, "1000"),
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(_V_EX, "0.01"),
                Symbol("max") => parseNumber(_V_EX, "1000"),
            ),
        ),
        Symbol("type") => "crypto",
    )
end

function _v_market()
    return Dict{Symbol, Any}(
        Symbol("id") => "btcusdt",
        Symbol("symbol") => "BTC/USDT",
        Symbol("base") => "BTC",
        Symbol("quote") => "USDT",
        Symbol("taker") => parseNumber(_V_EX, "0.001"),
        Symbol("maker") => parseNumber(_V_EX, "0.0009"),
        Symbol("baseId") => "BTC",
        Symbol("quoteId") => "USDT",
        Symbol("active") => true,
        Symbol("type") => "spot",
        Symbol("linear") => nothing,
        Symbol("inverse") => nothing,
        Symbol("spot") => true,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("margin") => false,
        Symbol("contract") => false,
        Symbol("contractSize") => nothing,
        Symbol("expiry") => nothing,
        Symbol("expiryDatetime") => nothing,
        Symbol("optionType") => nothing,
        Symbol("strike") => nothing,
        Symbol("settle") => nothing,
        Symbol("settleId") => nothing,
        Symbol("precision") => Dict{Symbol, Any}(
            Symbol("price") => parseNumber(_V_EX, "0.01"),
            Symbol("amount") => parseNumber(_V_EX, "0.00001"),
            Symbol("cost") => parseNumber(_V_EX, "0.01"),
        ),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("amount") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(_V_EX, "0.0001"),
                Symbol("max") => parseNumber(_V_EX, "1000"),
            ),
            Symbol("price") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(_V_EX, "0.01"),
                Symbol("max") => parseNumber(_V_EX, "100000"),
            ),
            Symbol("cost") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(_V_EX, "0.01"),
                Symbol("max") => parseNumber(_V_EX, "1000000"),
            ),
        ),
        Symbol("marginModes") => Dict{Symbol, Any}(
            Symbol("cross") => true,
            Symbol("isolated") => false,
        ),
        Symbol("created") => 1504224000000,
        Symbol("info") => Dict{Symbol, Any}(),
    )
end

function _v_leverageTier()
    return Dict{Symbol, Any}(
        Symbol("tier") => parseNumber(_V_EX, "1"),
        Symbol("minNotional") => parseNumber(_V_EX, "0"),
        Symbol("maxNotional") => parseNumber(_V_EX, "5000"),
        Symbol("maintenanceMarginRate") => parseNumber(_V_EX, "0.01"),
        Symbol("maxLeverage") => parseNumber(_V_EX, "25"),
        Symbol("info") => Dict{Symbol, Any}(),
    )
end

function _v_tradingFee(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("maker") => parseNumber(_V_EX, "0.002"),
        Symbol("taker") => parseNumber(_V_EX, "0.003"),
    )
end

function _v_transfer(code="USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "1234",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => _dt(1502962946216),
        Symbol("currency") => code,
        Symbol("amount") => parseNumber(_V_EX, "1.234"),
        Symbol("fromAccount") => "spot",
        Symbol("toAccount") => "swap",
        Symbol("status") => "ok",
    )
end

function _v_lastPrice(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => _dt(1502962946216),
        Symbol("price") => parseNumber(_V_EX, "49500"),
        Symbol("side") => "buy",
    )
end

function _v_liquidation(symbol="BTC/USDT")
    contracts = "1.234"
    contractSize = "1.234"
    price = "1"
    baseValue = stringMul(contracts, contractSize)
    quoteValue = stringMul(baseValue, price)
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("contracts") => parseNumber(_V_EX, contracts),
        Symbol("contractSize") => parseNumber(_V_EX, contractSize),
        Symbol("price") => parseNumber(_V_EX, price),
        Symbol("baseValue") => parseNumber(_V_EX, baseValue),
        Symbol("quoteValue") => parseNumber(_V_EX, quoteValue),
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => _dt(1502962946216),
    )
end

function _v_fundingRateHistory(symbol="BTC/USDT:USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => _dt(1638230400000),
        Symbol("fundingRate") => parseNumber(_V_EX, "0.0006"),
    )
end

function _v_openInterest(symbol="BTC/USDT")
    return Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("openInterestAmount") => parseNumber(_V_EX, "3544581864.598"),
        Symbol("openInterestValue") => parseNumber(_V_EX, "3544581864.598"),
        Symbol("timestamp") => 1649373600000,
        Symbol("datetime") => _dt(1649373600000),
        Symbol("info") => Dict{Symbol, Any}(),
    )
end

function _v_marginMode(symbol="BTC/USDT:USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => symbol,
        Symbol("marginMode") => "cross",
    )
end

function _v_marginModification(symbol="ADA/USDT:USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("type") => "add",
        Symbol("amount") => parseNumber(_V_EX, "0.1"),
        Symbol("total") => parseNumber(_V_EX, "0.29934828"),
        Symbol("code") => "USDT",
        Symbol("symbol") => symbol,
        Symbol("status") => "ok",
    )
end

function _v_account()
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("code") => "BTC",
        Symbol("type") => "spot",
        Symbol("id") => "12345",
    )
end

function _v_ledgerEntry(code="BTC")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "x1234",
        Symbol("currency") => code,
        Symbol("account") => "spot",
        Symbol("referenceId") => "foo",
        Symbol("referenceAccount") => "bar",
        Symbol("status") => "ok",
        Symbol("amount") => parseNumber(_V_EX, "22"),
        Symbol("before") => parseNumber(_V_EX, "111"),
        Symbol("after") => parseNumber(_V_EX, "133"),
        Symbol("fee") => Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(_V_EX, "0.001"),
            Symbol("currency") => code,
        ),
        Symbol("direction") => "in",
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => _dt(1638230400000),
        Symbol("type") => "transfer",
    )
end

function _v_borrowInterest(code="USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("account") => "BTC/USDT",
        Symbol("currency") => code,
        Symbol("interest") => parseNumber(_V_EX, "0.1444"),
        Symbol("interestRate") => parseNumber(_V_EX, "0.0006"),
        Symbol("amountBorrowed") => parseNumber(_V_EX, "30.0"),
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => _dt(1638230400000),
    )
end

function _v_borrowRate(code="USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("currency") => code,
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => _dt(1638230400000),
        Symbol("rate") => parseNumber(_V_EX, "0.0006"),
        Symbol("period") => 86400000,
    )
end

function _v_depositWithdrawal(code="USDT")
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "1234",
        Symbol("txid") => "0x1345FEG45EAEF7",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => _dt(1502962946216),
        Symbol("network") => "ETH",
        Symbol("address") => "0xEFE3487358AEF352345345",
        Symbol("addressTo") => "0xEFE3487358AEF352345123",
        Symbol("addressFrom") => "0xEFE3487358AEF352345456",
        Symbol("tag") => "smth",
        Symbol("tagTo") => "smth",
        Symbol("tagFrom") => "smth",
        Symbol("type") => "deposit",
        Symbol("amount") => parseNumber(_V_EX, "1.234"),
        Symbol("currency") => code,
        Symbol("status") => "ok",
        Symbol("updated") => 1502962946233,
        Symbol("fee") => Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(_V_EX, "0.001"),
            Symbol("currency") => code,
        ),
    )
end

function _v_status()
    return Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("status") => Dict{Symbol, Any}(),
    )
end

# ---------------------------------------------------------------------------
# Exercise the real transpiled validators on the synthetic objects above.
# Each validator is invoked from a dedicated @testset in the split files
# `test_validators_pass_1..4.jl` (one @testset per structure, so a single
# failing structure is reported in isolation rather than aborting the driver).
# Splitting keeps any one include small enough to compile quickly and lets a
# single validator be run on its own for a fast edit/test loop.
# ---------------------------------------------------------------------------

