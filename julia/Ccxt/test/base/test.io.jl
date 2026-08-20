using Test
using Ccxt
function testIo()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleex"
    ));
    ms = milliseconds(exchange);
    fileName = string("ccxt-test-io-", ms, ".ccxtfile");
    tempDir = getTempDir(exchange);
    @test functions.ccxtruthy(@functions.ccxt_and(tempDir != nothing, tempDir != ""))
    filePath = string(tempDir, fileName);
    fileContent = "hello world";
    @test functions.ccxtruthy(writeFile(exchange, filePath, fileContent))
    @test functions.ccxtruthy(existsFile(exchange, filePath))
    readContent = readFile(exchange, filePath);
    @test readContent == fileContent
end
