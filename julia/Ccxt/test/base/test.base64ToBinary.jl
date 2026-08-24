using Test
using Ccxt
function testBase64ToBinary()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    b64_1 = "aGVsbG8=";
    binary1 = base64ToBinary(exchange, b64_1);
    @test binaryToBase64(exchange, binary1) == b64_1;
    b64_2 = "aGVsbG8gd29ybGQ=";
    binary2 = base64ToBinary(exchange, b64_2);
    @test binaryToBase64(exchange, binary2) == b64_2;
    b64_3 = "dGVzdA==";
    binary3 = base64ToBinary(exchange, b64_3);
    @test binaryToBase64(exchange, binary3) == b64_3;
    b64_4 = "";
    binary4 = base64ToBinary(exchange, b64_4);
    @test binaryToBase64(exchange, binary4) == b64_4;
    b64_5 = "YQ==";
    binary5 = base64ToBinary(exchange, b64_5);
    @test binaryToBase64(exchange, binary5) == b64_5;
    b64_6 = "YWI=";
    binary6 = base64ToBinary(exchange, b64_6);
    @test binaryToBase64(exchange, binary6) == b64_6;
    b64_7 = "YWJj";
    binary7 = base64ToBinary(exchange, b64_7);
    @test binaryToBase64(exchange, binary7) == b64_7;
    b64_8 = "eyJrZXkiOiJ2YWx1ZSJ9";
    binary8 = base64ToBinary(exchange, b64_8);
    @test binaryToBase64(exchange, binary8) == b64_8;
    b64_9 = "MTIzNDU2";
    binary9 = base64ToBinary(exchange, b64_9);
    @test binaryToBase64(exchange, binary9) == b64_9;
    b64_10 = "aGVsbG8rd29ybGQvdGVzdA==";
    binary10 = base64ToBinary(exchange, b64_10);
    @test binaryToBase64(exchange, binary10) == b64_10;
    @test safeString(exchange, nothing, "key") == nothing;
end
