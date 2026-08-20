using Test
using Ccxt
function helperStrToBinary(exchange, str)

    return base64ToBinary(exchange, stringToBase64(exchange, str))
end


function testBinaryToBase64()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    binary1 = helperStrToBinary(exchange, "hello");
    @test binaryToBase64(exchange, binary1) == "aGVsbG8=";
    binary2 = helperStrToBinary(exchange, "hello world");
    @test binaryToBase64(exchange, binary2) == "aGVsbG8gd29ybGQ=";
    binary3 = helperStrToBinary(exchange, "test");
    @test binaryToBase64(exchange, binary3) == "dGVzdA==";
    binary4 = helperStrToBinary(exchange, "");
    @test binaryToBase64(exchange, binary4) == "";
    binary5 = helperStrToBinary(exchange, "a");
    @test binaryToBase64(exchange, binary5) == "YQ==";
    binary6 = helperStrToBinary(exchange, "ab");
    @test binaryToBase64(exchange, binary6) == "YWI=";
    binary7 = helperStrToBinary(exchange, "abc");
    @test binaryToBase64(exchange, binary7) == "YWJj";
    binary8 = helperStrToBinary(exchange, "{\"key\":\"value\"}");
    @test binaryToBase64(exchange, binary8) == "eyJrZXkiOiJ2YWx1ZSJ9";
    binary9 = helperStrToBinary(exchange, "123456");
    @test binaryToBase64(exchange, binary9) == "MTIzNDU2";
    binary10 = helperStrToBinary(exchange, "hello+world/test");
    @test binaryToBase64(exchange, binary10) == "aGVsbG8rd29ybGQvdGVzdA==";
    @test safeString(exchange, nothing, "key") == nothing;
end
