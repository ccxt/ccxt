# Batch 3 of the validator driver (see test_validators_pass.jl for builders).
@testset "validators: lastPrice" begin
    testLastPrice(_V_EX, _V_SKIP, "fetchLastPrices", _v_lastPrice("BTC/USDT"), "BTC/USDT")
end

@testset "validators: liquidation" begin
    testLiquidation(_V_EX, _V_SKIP, "fetchLiquidations", _v_liquidation("BTC/USDT"), "BTC/USDT")
end

@testset "validators: fundingRateHistory" begin
    testFundingRateHistory(_V_EX, _V_SKIP, "fetchFundingRateHistory", _v_fundingRateHistory("BTC/USDT:USDT"), "BTC/USDT:USDT")
end

@testset "validators: openInterest" begin
    testOpenInterest(_V_EX, _V_SKIP, "fetchOpenInterest", _v_openInterest("BTC/USDT"))
end

@testset "validators: marginMode" begin
    testMarginMode(_V_EX, _V_SKIP, "fetchMarginMode", _v_marginMode("BTC/USDT:USDT"))
end

@testset "validators: marginModification" begin
    testMarginModification(_V_EX, _V_SKIP, "fetchMarginModificationHistory", _v_marginModification("ADA/USDT:USDT"))
end
