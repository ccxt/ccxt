using Test
using Ccxt
function testStringToBase64()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test stringToBase64(exchange, "hello world 123!@#\$%^&*()\"-+)S") == "aGVsbG8gd29ybGQgMTIzIUAjJCVeJiooKSItKylT";
end
