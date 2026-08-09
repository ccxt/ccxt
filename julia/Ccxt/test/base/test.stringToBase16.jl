using Test
using Ccxt
function testStringToBase16()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    result1 = stringToBase16(exchange, "hello");
    expected1 = "0x68656c6c6f";
    @test result1 == expected1
    result2 = stringToBase16(exchange, "world 1!@#\$%^&*()");
    expected2 = "0x776f726c64203121402324255e262a2829";
    @test result2 == expected2
end
