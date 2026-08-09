using Test

@testset "Julia coverage parity (manifest-backed)" begin
    manifest_path = joinpath(@__DIR__, "..", "src", "exchanges", "manifest.json")
    @test isfile(manifest_path)
    content = read(manifest_path, String)
    @test occursin("\"modules\"", content)
    @test occursin("\"Binance\"", content)
    @test occursin("\"Kraken\"", content)
    @test occursin("\"Coinbase\"", content)
    @test occursin("\"Bybit\"", content)
    @test occursin("\"Okx\"", content)
    @test length(split(content, '\n')) >= 100
end
