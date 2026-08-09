using Test
using Ccxt
function testBinaryConcat()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    binary1 = stringToBinary(exchange, "hello");
    binary2 = stringToBinary(exchange, " world");
    result1 = binaryConcat(exchange, binary1, binary2);
    @test binaryToString(exchange, result1) == "hello world";
    binary3 = stringToBinary(exchange, "foo");
    binary4 = stringToBinary(exchange, "bar");
    binary5 = stringToBinary(exchange, "baz");
    result2 = binaryConcat(exchange, binary3, binary4, binary5);
    @test binaryToString(exchange, result2) == "foobarbaz";
    result3 = binaryConcat(exchange, base16ToBinary(exchange, "68656c6c6f"), stringToBinary(exchange, " world"));
    @test binaryToString(exchange, result3) == "hello world";
end
