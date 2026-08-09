using Test
using Ccxt
function testBinaryToBase16()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parseNumber(exchange, nothing) == nothing;
    binary1 = base16ToBinary(exchange, "ff");
    @test binaryToBase16(exchange, binary1) == "ff";
    binary2 = base16ToBinary(exchange, "0000");
    @test binaryToBase16(exchange, binary2) == "0000";
    binary3 = base16ToBinary(exchange, "01020304");
    @test binaryToBase16(exchange, binary3) == "01020304";
    binary4 = base16ToBinary(exchange, "00");
    @test binaryToBase16(exchange, binary4) == "00";
    binary5 = base16ToBinary(exchange, "ff");
    @test binaryLength(exchange, binary5) == 1;
    @test functions.ccxtruthy(isBinaryMessage(exchange, binary5));
    binary6 = base16ToBinary(exchange, "00000000499602d2");
    @test binaryToBase16(exchange, binary6) == "00000000499602d2";
    @test binaryLength(exchange, binary6) == 8;
    binary7 = base16ToBinary(exchange, "deadbeef");
    @test binaryToBase16(exchange, binary7) == "deadbeef";
    @test binaryLength(exchange, binary7) == 4;
    hex8 = "cafebabe";
    binary8 = base16ToBinary(exchange, hex8);
    @test binaryToBase16(exchange, binary8) == hex8;
end
