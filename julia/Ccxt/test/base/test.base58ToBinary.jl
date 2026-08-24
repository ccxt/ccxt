using Test
using Ccxt
function testBase58ToBinary()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    b58_1 = "Cn8eVZg";
    binary1 = base58ToBinary(exchange, b58_1);
    @test binaryToBase58(exchange, binary1) == b58_1;
    b58_2 = "StV1DL6CwTryKyV";
    binary2 = base58ToBinary(exchange, b58_2);
    @test binaryToBase58(exchange, binary2) == b58_2;
    b58_3 = "3yZe7d";
    binary3 = base58ToBinary(exchange, b58_3);
    @test binaryToBase58(exchange, binary3) == b58_3;
    b58_4 = "2g";
    binary4 = base58ToBinary(exchange, b58_4);
    @test binaryToBase58(exchange, binary4) == b58_4;
    b58_5 = "8Qq";
    binary5 = base58ToBinary(exchange, b58_5);
    @test binaryToBase58(exchange, binary5) == b58_5;
    b58_6 = "ZiCa";
    binary6 = base58ToBinary(exchange, b58_6);
    @test binaryToBase58(exchange, binary6) == b58_6;
    b58_7 = "4SoiMiEYtTt5tPdi81Fik";
    binary7 = base58ToBinary(exchange, b58_7);
    @test binaryToBase58(exchange, binary7) == b58_7;
    @test parseNumber(exchange, nothing) == nothing;
end
