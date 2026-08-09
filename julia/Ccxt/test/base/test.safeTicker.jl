using Test
using Ccxt
function preciseEqualStr(exchange, result, key, expected)

    return stringEq(safeString(exchange, result, key), expected)
end


function testSafeTicker()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    ticker1 = Dict{Symbol, Any}(
        Symbol("open") => 5,
        Symbol("change") => 1
    );
    result1 = safeTicker(exchange, ticker1);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result1, "percentage", "20.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result1, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result1, "close", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result1, "last", "6.0"));
    ticker2 = Dict{Symbol, Any}(
        Symbol("open") => 5,
        Symbol("percentage") => 20
    );
    result2 = safeTicker(exchange, ticker2);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result2, "change", "1.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result2, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result2, "close", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result2, "last", "6.0"));
    ticker3 = Dict{Symbol, Any}(
        Symbol("close") => 6,
        Symbol("change") => 1
    );
    result3 = safeTicker(exchange, ticker3);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result3, "open", "5.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result3, "percentage", "20.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result3, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result3, "last", "6.0"));
    ticker4 = Dict{Symbol, Any}(
        Symbol("close") => 6,
        Symbol("percentage") => 20
    );
    result4 = safeTicker(exchange, ticker4);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result4, "open", "5.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result4, "change", "1.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result4, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result4, "last", "6.0"));
    ticker5 = Dict{Symbol, Any}(
        Symbol("average") => 5.5,
        Symbol("percentage") => 20
    );
    result5 = safeTicker(exchange, ticker5);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result5, "open", "5.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result5, "change", "1.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result5, "close", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result5, "last", "6.0"));
    ticker6 = Dict{Symbol, Any}(
        Symbol("average") => 5.5,
        Symbol("change") => 1
    );
    result6 = safeTicker(exchange, ticker6);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result6, "open", "5.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result6, "percentage", "20.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result6, "close", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result6, "last", "6.0"));
    ticker7 = Dict{Symbol, Any}(
        Symbol("open") => 5,
        Symbol("close") => 6
    );
    result7 = safeTicker(exchange, ticker7);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result7, "change", "1.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result7, "percentage", "20.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result7, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result7, "last", "6.0"));
    ticker8 = Dict{Symbol, Any}(
        Symbol("open") => 5,
        Symbol("close") => 6,
        Symbol("last") => 6,
        Symbol("high") => 6.5,
        Symbol("low") => 4.5,
        Symbol("average") => 5.5,
        Symbol("bid") => 5.9,
        Symbol("bidVolume") => 100,
        Symbol("ask") => 6.1,
        Symbol("askVolume") => 200,
        Symbol("change") => 1,
        Symbol("percentage") => 20,
        Symbol("vwap") => 5.75,
        Symbol("baseVolume") => 1000,
        Symbol("quoteVolume") => 5750,
        Symbol("previousClose") => 4.9,
        Symbol("indexPrice") => 5.8,
        Symbol("markPrice") => 5.9,
        Symbol("info") => Dict{Symbol, Any}()
    );
    result8 = safeTicker(exchange, ticker8);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "open", "5.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "high", "6.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "low", "4.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "close", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "last", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "change", "1.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "percentage", "20.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "average", "5.5"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "bid", "5.9"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "bidVolume", "100.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "ask", "6.1"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "askVolume", "200.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "vwap", "5.75"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "baseVolume", "1000.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "quoteVolume", "5750.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "previousClose", "4.9"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "indexPrice", "5.8"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result8, "markPrice", "5.9"));
    @test get(result8, Symbol("info"), nothing) != nothing;
    ticker9 = Dict{Symbol, Any}(
        Symbol("open") => 6,
        Symbol("close") => 6,
        Symbol("last") => 6,
        Symbol("change") => 0,
        Symbol("percentage") => 0
    );
    result9 = safeTicker(exchange, ticker9);
    @test functions.ccxtruthy(preciseEqualStr(exchange, result9, "change", "0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result9, "percentage", "0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result9, "open", "6.0"));
    @test functions.ccxtruthy(preciseEqualStr(exchange, result9, "last", "6.0"));
end
