using Test
using Ccxt

@testset "Safe methods coverage" begin
    exchange = Binance()
    symbols = get(exchange, "symbols", Dict())
    @test symbols isa Dict
    currencies = get(exchange, "currencies", Dict())
    @test currencies isa Dict
    @test get(exchange, "id", "") == "binance"
end
