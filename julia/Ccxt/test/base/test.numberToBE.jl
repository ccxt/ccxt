using Test
using Ccxt
function testNumberToBE()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    num1 = 1234567890;
    padding1 = 8;
    result1 = numberToBE(exchange, num1, padding1);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result1));
    @test binaryLength(exchange, result1) == padding1;
    expectedBinary1 = base16ToBinary(exchange, "00000000499602d2");
    resultBase64 = binaryToBase64(exchange, result1);
    expectedBase64 = binaryToBase64(exchange, expectedBinary1);
    @test resultBase64 == expectedBase64
    result2 = numberToBE(exchange, 0, 1);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result2));
    @test binaryLength(exchange, result2) == 1;
    expectedBinary2 = base16ToBinary(exchange, "00");
    @test binaryToBase64(exchange, result2) == binaryToBase64(exchange, expectedBinary2)
    result3 = numberToBE(exchange, 1, 1);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result3));
    @test binaryLength(exchange, result3) == 1;
    expectedBinary3 = base16ToBinary(exchange, "01");
    @test binaryToBase64(exchange, result3) == binaryToBase64(exchange, expectedBinary3)
    result4 = numberToBE(exchange, 255, 1);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result4));
    @test binaryLength(exchange, result4) == 1;
    expectedBinary4 = base16ToBinary(exchange, "ff");
    @test binaryToBase64(exchange, result4) == binaryToBase64(exchange, expectedBinary4)
    result5 = numberToBE(exchange, 256, 2);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result5));
    @test binaryLength(exchange, result5) == 2;
    expectedBinary5 = base16ToBinary(exchange, "0100");
    @test binaryToBase64(exchange, result5) == binaryToBase64(exchange, expectedBinary5)
    result6 = numberToBE(exchange, 1, 4);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result6));
    @test binaryLength(exchange, result6) == 4;
    expectedBinary6 = base16ToBinary(exchange, "00000001");
    @test binaryToBase64(exchange, result6) == binaryToBase64(exchange, expectedBinary6)
    result7 = numberToBE(exchange, 0, 8);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result7));
    @test binaryLength(exchange, result7) == 8;
    expectedBinary7 = base16ToBinary(exchange, "0000000000000000");
    @test binaryToBase64(exchange, result7) == binaryToBase64(exchange, expectedBinary7)
    result8 = numberToBE(exchange, 4294967295, 4);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result8));
    @test binaryLength(exchange, result8) == 4;
    expectedBinary8 = base16ToBinary(exchange, "ffffffff");
    @test binaryToBase64(exchange, result8) == binaryToBase64(exchange, expectedBinary8)
    result9 = numberToBE(exchange, 16909060, 4);
    @test functions.ccxtruthy(isBinaryMessage(exchange, result9));
    @test binaryLength(exchange, result9) == 4;
    expectedBinary9 = base16ToBinary(exchange, "01020304");
    @test binaryToBase64(exchange, result9) == binaryToBase64(exchange, expectedBinary9)
    describe(exchange);
end
