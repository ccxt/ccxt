using Test
using Ccxt
function testUrlencodeBase64()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test urlencodeBase64(exchange, "hello") == "aGVsbG8";
    @test urlencodeBase64(exchange, "hello world") == "aGVsbG8gd29ybGQ";
    @test urlencodeBase64(exchange, "test") == "dGVzdA";
    @test urlencodeBase64(exchange, "") == "";
    @test urlencodeBase64(exchange, "a") == "YQ";
    @test urlencodeBase64(exchange, "ab") == "YWI";
    @test urlencodeBase64(exchange, "abc") == "YWJj";
    @test urlencodeBase64(exchange, "abcd") == "YWJjZA";
    @test urlencodeBase64(exchange, "{\"user\":\"test\"}") == "eyJ1c2VyIjoidGVzdCJ9";
    @test urlencodeBase64(exchange, "subjects?_d") == "c3ViamVjdHM_X2Q";
    @test urlencodeBase64(exchange, "The quick brown fox") == "VGhlIHF1aWNrIGJyb3duIGZveA";
    @test urlencodeBase64(exchange, "123456789") == "MTIzNDU2Nzg5";
    binaryData = base16ToBinary(exchange, "191919191919");
    @test urlencodeBase64(exchange, binaryData) == "GRkZGRkZ";
end
