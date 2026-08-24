using Test
using Ccxt
function testEncode()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    input = "encode-test";
    encoded = encode(exchange, input);
    decoded = decode(exchange, encoded);
    @test decoded == input
end


function testDecode()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    input = "decode-test";
    encoded = encode(exchange, input);
    decoded = decode(exchange, encoded);
    @test decoded == input
end


function testEncodeDecode()

    testEncode();
    testDecode();
end
