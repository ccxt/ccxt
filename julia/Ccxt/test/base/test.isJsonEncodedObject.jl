using Test
using Ccxt
function testIsJsonEncodedObject()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "{\"key\":\"value\"}"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "{}"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "[]"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "{x"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "[x"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "{"));
    @test functions.ccxtruthy(isJsonEncodedObject(exchange, "["));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, "x"));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, ""));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, "}"));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, "]"));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, "null"));
    @test !functions.ccxtruthy(isJsonEncodedObject(exchange, "undefined"));
end
