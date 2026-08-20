# Faithful driver for the unified-structure *shared* assert primitives
# (`test.sharedMethods`, file #25 in `ts/src/test/Exchange/base/` — the
# `test.*.ts` companion that every one of the 24 structure validators calls).
#
# `test.sharedMethods` is a helper library in all three languages: upstream TS
# never invokes it as a standalone test, and neither does Python. But it is the
# 25th file in the structure-validator set, and its assert primitives
# (`assertStructure`, `assertTimestamp`, `assertGreater`, `assertSymbol`,
# `assertFeeStructure`, `assertDeepEqual`, …) are the real code under test for
# every validator run elsewhere. This driver exercises each primitive directly
# against representative data so the shipped `test.sharedMethods.jl` is proven
# to work on the real path — not merely loaded.
#
# Each primitive performs its own `@test`s internally (transpiled from TS
# `assert(...)`); the driver *calls* the primitive and appends `@test true` so
# the surrounding `@testset` reports a passing item and a failure inside a
# primitive is attributed to that primitive's set, not swallowed.
#
# The data fed here mirrors what the real parsers produce: numeric strings for
# the `Precise.string*` comparisons, real market/currency symbols for the
# symbol/currency asserts, an offline exchange (binance) preloaded with
# markets and currencies so `assertCurrencyCode` / `assertSymbolInMarkets`
# resolve. The first parameter of every primitive is `self` (the module), which
# is `nothing` when the helper is called freestanding — exactly as the 24
# validators invoke it (`assertStructure(nothing, exchange, …)`).

using Test
using Ccxt

# Offline exchange with real markets/currencies so currency & symbol assertions
# resolve. Reuses the static-fixture offline constructor (loaded before this
# group via the dependency chain).
const _S_EX = static_init_offline("binance", Ccxt.Binance)
_S_EX.httpProxy = nothing
_S_EX.httpsProxy = nothing

const _S_SKIP = Dict{Symbol, Any}()
const _S_NOW = milliseconds(_S_EX)

# ---------------------------------------------------------------------------
# Each primitive, one @testset. Signature order: (self=nothing, exchange,
# skippedProperties, method, entry, ...).
# ---------------------------------------------------------------------------

@testset "sharedMethods: assertType" begin
    assertType(nothing, _S_EX, _S_SKIP, Dict{Symbol,Any}(:a => 1), :a, Dict{Symbol,Any}(:a => 1))
    @test true
end

@testset "sharedMethods: assertStructure" begin
    assertStructure(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:a => 1), Dict{Symbol,Any}(:a => 1))
    @test true
end

@testset "sharedMethods: assertTimestamp" begin
    assertTimestamp(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:timestamp => 1638230400000), _S_NOW)
    @test true
end

@testset "sharedMethods: assertTimestampAndDatetime" begin
    assertTimestampAndDatetime(nothing, _S_EX, _S_SKIP, "t",
        Dict{Symbol,Any}(:timestamp => 1638230400000, :datetime => iso8601(_S_EX, 1638230400000)), _S_NOW)
    @test true
end

@testset "sharedMethods: assertGreater" begin
    assertGreater(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:x => "5"), :x, "0")
    @test true
end

@testset "sharedMethods: assertGreaterOrEqual" begin
    assertGreaterOrEqual(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:x => "5"), :x, "5")
    @test true
end

@testset "sharedMethods: assertLess" begin
    assertLess(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:x => "3"), :x, "9")
    @test true
end

@testset "sharedMethods: assertLessOrEqual" begin
    assertLessOrEqual(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:x => "3"), :x, "3")
    @test true
end

@testset "sharedMethods: assertEqual" begin
    assertEqual(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:k => "12.5"), :k, "12.5")
    @test true
end

@testset "sharedMethods: assertNonEqual" begin
    assertNonEqual(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:k => "12.5"), :k, "99.0")
    @test true
end

@testset "sharedMethods: assertInArray" begin
    assertInArray(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:k => "b"), :k, ["a", "b", "c"])
    @test true
end

@testset "sharedMethods: assertInteger" begin
    assertInteger(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:n => 5), :n)
    @test true
end

@testset "sharedMethods: assertSymbol" begin
    assertSymbol(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:symbol => "BTC/USDT"), :symbol, "BTC/USDT")
    @test true
end

@testset "sharedMethods: assertSymbolInMarkets" begin
    assertSymbolInMarkets(nothing, _S_EX, _S_SKIP, Dict{Symbol,Any}(), "BTC/USDT")
    @test true
end

@testset "sharedMethods: assertCurrencyCode" begin
    assertCurrencyCode(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(), "USDT", "USDT")
    @test true
end

@testset "sharedMethods: assertValidCurrencyIdAndCode" begin
    assertValidCurrencyIdAndCode(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:currency => "USDT"), "USDT", "USDT")
    @test true
end

@testset "sharedMethods: assertFeeStructure" begin
    assertFeeStructure(nothing, _S_EX, _S_SKIP, "t",
        Dict{Symbol,Any}(:fee => Dict{Symbol,Any}(:cost => 1.0, :currency => "USDT")), :fee)
    @test true
end

@testset "sharedMethods: assertDeepEqual" begin
    assertDeepEqual(nothing, _S_EX, _S_SKIP, "t", Dict{Symbol,Any}(:a => 1), Dict{Symbol,Any}(:a => 1))
    @test true
end
