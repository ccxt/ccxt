using Test
using Ccxt
function testEthMethods()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    privateKey = "0x27c9c557bd398e354b57ba58046b055035c47788926eb53fcdb394769ef80e1b";
    publicKey = "0x3096cD9827766E03f8b6DF58996399406DC270Af";
    generatedAddress = ethGetAddressFromPrivateKey(exchange, privateKey);
    @test lowercase(generatedAddress) == lowercase(publicKey)
end
