using Test
using Ccxt

@testset "Precise coverage" begin
    exchange = Binance()
    @test haskey(exchange, "precision")
    @test exchange.precision isa Dict
end
