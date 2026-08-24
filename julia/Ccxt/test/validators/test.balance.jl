using Test
using Ccxt
function testBalance(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("free") => Dict{Symbol, Any}(),
        Symbol("used") => Dict{Symbol, Any}(),
        Symbol("total") => Dict{Symbol, Any}(),
        Symbol("info") => Dict{Symbol, Any}()
    );
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format);
    logText = logTemplate(testSharedMethods, exchange, method, entry);
    codesTotal = objectKeys(get(entry, Symbol("total"), nothing));
    codesFree = objectKeys(get(entry, Symbol("free"), nothing));
    codesUsed = objectKeys(get(entry, Symbol("used"), nothing));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, codesTotal, "total");
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, codesFree, "free");
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, codesUsed, "used");
    allCodes = arrayConcat(exchange, codesTotal, codesFree);
    allCodes = arrayConcat(exchange, allCodes, codesUsed);
    codesLength = length(codesTotal);
    freeLength = length(codesFree);
    usedLength = length(codesUsed);
    @test functions.ccxtruthy(@functions.ccxt_or((codesLength == freeLength), (codesLength == usedLength)))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allCodes)))
        code = get(allCodes, i + 1, nothing);
        @test functions.ccxtruthy(ccxt_in(code, get(entry, Symbol("total"), nothing)))
        @test functions.ccxtruthy(ccxt_in(code, get(entry, Symbol("free"), nothing)))
        @test functions.ccxtruthy(ccxt_in(code, get(entry, Symbol("used"), nothing)))
        total = safeString(exchange, get(entry, Symbol("total"), nothing), code);
        free = safeString(exchange, get(entry, Symbol("free"), nothing), code);
        used = safeString(exchange, get(entry, Symbol("used"), nothing), code);
        @test total != nothing
        @test free != nothing
        @test used != nothing
        @test functions.ccxtruthy(stringGe(total, "0"))
        @test functions.ccxtruthy(stringGe(free, "0"))
        @test functions.ccxtruthy(stringGe(used, "0"))
        sumFreeUsed = stringAdd(free, used);
        @test functions.ccxtruthy(stringEq(total, sumFreeUsed))
        i += 1
    end
end
