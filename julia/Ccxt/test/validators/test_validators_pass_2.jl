# Batch 2 of the validator driver (see test_validators_pass.jl for builders).
@testset "validators: ohlcv" begin
    testOHLCV(_V_EX, _V_SKIP, "fetchOHLCV", _v_ohlcv(), "BTC/USDT", _V_NOW)
end

@testset "validators: currency" begin
    testCurrency(_V_EX, _V_SKIP, "fetchCurrencies", _v_currency("BTC", "BTC"))
end

@testset "validators: market" begin
    testMarket(_V_EX, _V_SKIP, "fetchMarkets", _v_market())
end

@testset "validators: leverageTier" begin
    testLeverageTier(_V_EX, _V_SKIP, "fetchLeverageTiers", _v_leverageTier())
end

@testset "validators: tradingFee" begin
    testTradingFee(_V_EX, _V_SKIP, "fetchTradingFee", "BTC/USDT", _v_tradingFee("BTC/USDT"))
end

@testset "validators: transfer" begin
    testTransfer(_V_EX, _V_SKIP, "fetchTransfers", _v_transfer("USDT"), "USDT")
end
