using Test
using Ccxt

@testset "Utility coverage" begin
    exchange = Binance()
    @test haskey(exchange, "id")
    @test exchange.id == "binance"
    @test exchange.name == "Binance"
end
