using Test
using Ccxt
function helperStrToBinary5(exchange, str)

    return base64ToBinary(exchange, stringToBase64(exchange, str))
end


function testBinaryToBase58()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parseNumber(exchange, nothing) == nothing;
    binary1 = helperStrToBinary5(exchange, "hello");
    @test binaryToBase58(exchange, binary1) == "Cn8eVZg";
    binary2 = helperStrToBinary5(exchange, "hello world");
    @test binaryToBase58(exchange, binary2) == "StV1DL6CwTryKyV";
    binary3 = helperStrToBinary5(exchange, "test");
    @test binaryToBase58(exchange, binary3) == "3yZe7d";
    binary4 = helperStrToBinary5(exchange, "a");
    @test binaryToBase58(exchange, binary4) == "2g";
    binary5 = helperStrToBinary5(exchange, "ab");
    @test binaryToBase58(exchange, binary5) == "8Qq";
    binary6 = helperStrToBinary5(exchange, "abc");
    @test binaryToBase58(exchange, binary6) == "ZiCa";
    binary7 = helperStrToBinary5(exchange, "{\"key\":\"value\"}");
    @test binaryToBase58(exchange, binary7) == "4SoiMiEYtTt5tPdi81Fik";
end
