using Test
using Ccxt
function testIso8601()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test iso8601(exchange, 514862627000) == "1986-04-26T01:23:47.000Z";
    @test iso8601(exchange, 514862627559) == "1986-04-26T01:23:47.559Z";
    @test iso8601(exchange, 514862627062) == "1986-04-26T01:23:47.062Z";
    @test iso8601(exchange, 1) == "1970-01-01T00:00:00.001Z";
    @test iso8601(exchange, -1) == nothing;
    @test iso8601(exchange, nothing) == nothing;
    @test iso8601(exchange, "") == nothing;
    @test iso8601(exchange, "a") == nothing;
    @test iso8601(exchange, Dict{Symbol, Any}()) == nothing;
end


function testParse8601()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parse8601(exchange, "1986-04-26T01:23:47.000Z") == 514862627000;
    @test parse8601(exchange, "1986-04-26T01:23:47.559Z") == 514862627559;
    @test parse8601(exchange, "1986-04-26T01:23:47.062Z") == 514862627062;
    @test parse8601(exchange, "1986-04-26T01:23:47.06Z") == 514862627060;
    @test parse8601(exchange, "1986-04-26T01:23:47.6Z") == 514862627600;
    @test parse8601(exchange, "1977-13-13T00:00:00.000Z") == nothing;
    @test parse8601(exchange, "1986-04-26T25:71:47.000Z") == nothing;
    @test parse8601(exchange, "3333") == nothing;
    @test parse8601(exchange, "Sr90") == nothing;
    @test parse8601(exchange, "") == nothing;
    @test parse8601(exchange, nothing) == nothing;
    @test parse8601(exchange, Dict{Symbol, Any}()) == nothing;
    @test parse8601(exchange, 33) == nothing;
end


function testParseDate()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parseDate(exchange, "1986-04-26 00:00:00") == 514857600000;
    @test parseDate(exchange, "1986-04-26T01:23:47.000Z") == 514862627000;
    @test parseDate(exchange, "1986-13-13 00:00:00") == nothing;
end


function testMicroseconds()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    value = microseconds(exchange);
    valueString = string(value);
    @test functions.ccxtruthy(functions.ccxt_gt(value, 0));
    @test length(valueString) == 16;
end


function testMilliseconds()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    value = milliseconds(exchange);
    valueString = string(value);
    @test functions.ccxtruthy(functions.ccxt_gt(value, 0));
    @test length(valueString) == 13;
end


function testSeconds()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    value = seconds(exchange);
    valueString = string(value);
    @test functions.ccxtruthy(functions.ccxt_gt(value, 0));
    @test length(valueString) == 10;
end


function testYymmdd()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    testMs = 1750123456789;
    value = yymmdd(exchange, testMs, "_");
    @test value == "25_06_17";
    value2 = yymmdd(exchange, milliseconds(exchange));
    @test length(value2) == 6;
    intNum = parseToInt(exchange, value2);
    @test functions.ccxtruthy(@functions.ccxt_and(functions.ccxt_gt(intNum, 260000), functions.ccxt_lt(intNum, 360000)));
end


function testYyyymmdd()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    testMs = 1750123456789;
    value = yyyymmdd(exchange, testMs, "_");
    @test value == "2025_06_17";
    value2 = yyyymmdd(exchange, milliseconds(exchange));
    @test length(value2) == 10;
    intNum = parseToInt(exchange, replace((replace(value2, "-" => "")), "-" => ""));
    @test functions.ccxtruthy(@functions.ccxt_and(functions.ccxt_gt(intNum, 20260000), functions.ccxt_lt(intNum, 20360000)));
end


function testYmd()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    testMs = 1750123456789;
    value = ymd(exchange, testMs, "_");
    @test value == "2025_06_17";
end


function testYmdhms()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    testMs = 1750123456789;
    value = ymdhms(exchange, testMs, "_");
    @test functions.ccxtruthy(@functions.ccxt_or(value == "2025-06-17_01:24:16", value == "2025-06-17_01:24:17"));
end


function testDatetime()

    testIso8601();
    testParse8601();
    testParseDate();
    testYmd();
    testYmdhms();
    testMicroseconds();
    testMilliseconds();
    testSeconds();
    testYymmdd();
    testYyyymmdd();
end
