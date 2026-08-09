# Batch 1 of the validator driver (see test_validators_pass.jl for the
# synthetic-data builders). Runs the first six structure validators.
@testset "validators: ticker" begin
    testTicker(_V_EX, _V_SKIP, "fetchTicker", _v_ticker(), "BTC/USDT")
end

@testset "validators: trade" begin
    testTrade(_V_EX, _V_SKIP, "fetchTrades", _v_trade(), "ETH/BTC", _V_NOW)
end

@testset "validators: order" begin
    testOrder(_V_EX, _V_SKIP, "fetchOrder", _v_order("BTC/USDT"), "BTC/USDT", _V_NOW)
end

@testset "validators: orderBook" begin
    testOrderBook(_V_EX, _V_SKIP, "fetchOrderBook", _v_orderbook("BTC/USDT"), "BTC/USDT")
end

@testset "validators: balance" begin
    testBalance(_V_EX, _V_SKIP, "fetchBalance", _v_balance())
end

@testset "validators: position" begin
    testPosition(_V_EX, _V_SKIP, "fetchPositions", _v_position("BTC/USDT"), "BTC/USDT", _V_NOW)
end
