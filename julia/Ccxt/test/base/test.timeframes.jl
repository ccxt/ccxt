using Test
using Ccxt
function testRoundTimeframe()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    testDate = parse8601(exchange, "2019-08-12 13:22:08");
    if functions.ccxtruthy(testDate == nothing)
            return 
    end
    @test roundTimeframe(exchange, "5m", testDate, ROUND_DOWN) == parse8601(exchange, "2019-08-12 13:20:00");
    @test roundTimeframe(exchange, "10m", testDate, ROUND_DOWN) == parse8601(exchange, "2019-08-12 13:20:00");
    @test roundTimeframe(exchange, "30m", testDate, ROUND_DOWN) == parse8601(exchange, "2019-08-12 13:00:00");
    @test roundTimeframe(exchange, "1d", testDate, ROUND_DOWN) == parse8601(exchange, "2019-08-12 00:00:00");
    @test roundTimeframe(exchange, "5m", testDate, ROUND_UP) == parse8601(exchange, "2019-08-12 13:25:00");
    @test roundTimeframe(exchange, "10m", testDate, ROUND_UP) == parse8601(exchange, "2019-08-12 13:30:00");
    @test roundTimeframe(exchange, "30m", testDate, ROUND_UP) == parse8601(exchange, "2019-08-12 13:30:00");
    @test roundTimeframe(exchange, "1h", testDate, ROUND_UP) == parse8601(exchange, "2019-08-12 14:00:00");
    @test roundTimeframe(exchange, "1d", testDate, ROUND_UP) == parse8601(exchange, "2019-08-13 00:00:00");
end


function testParseTimeframe()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parseTimeframe(exchange, "1m") == 60;
    @test parseTimeframe(exchange, "5m") == 300;
    @test parseTimeframe(exchange, "1h") == 3600;
    @test parseTimeframe(exchange, "1d") == 86400;
    @test parseTimeframe(exchange, "1w") == 604800;
    @test parseTimeframe(exchange, "1M") == 2592000;
    @test parseTimeframe(exchange, "1y") == 31536000;
end


function testTimeframes()

    testRoundTimeframe();
    testParseTimeframe();
end
