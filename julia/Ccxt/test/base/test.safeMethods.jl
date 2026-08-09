using Test
using Ccxt
function equals(a, b)

    for prop in objectKeys(a)
        if functions.ccxtruthy(get(a, Symbol(prop), nothing) != get(b, Symbol(prop), nothing))
                return false
        end
    end
    return true
end


function testSafeMethods()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "regirock"
    ));
    inputDict = Dict{Symbol, Any}(
        Symbol("i") => 1,
        Symbol("f") => 0.123,
        Symbol("bool") => true,
        Symbol("list") => [1, 2, 3],
        Symbol("dict") => Dict{Symbol, Any}(
            Symbol("a") => 1
        ),
        Symbol("listOfDicts") => [Dict{Symbol, Any}(
        Symbol("a") => 1
    )],
        Symbol("str") => "heLlo",
        Symbol("strNumber") => "3",
        Symbol("zeroNumeric") => 0,
        Symbol("zeroString") => "0",
        Symbol("undefined") => nothing,
        Symbol("emptyString") => "",
        Symbol("floatNumeric") => 0.123,
        Symbol("floatString") => "0.123",
        Symbol("longInt") => 123456789012345
    );
    inputList = ["Hi", 2];
    compareDict = Dict{Symbol, Any}(
        Symbol("a") => 1
    );
    compareList = [1, 2, 3];
    factor = 10;
    @test safeValue(exchange, inputDict, "i") == 1;
    @test safeValue(exchange, inputDict, "f") == 0.123;
    @test functions.ccxtruthy(safeValue(exchange, inputDict, "bool"));
    @test functions.ccxtruthy(equals(safeValue(exchange, inputDict, "list"), compareList));
    dictObject = safeValue(exchange, inputDict, "dict");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeValue(exchange, inputDict, "str") == "heLlo";
    @test safeValue(exchange, inputDict, "strNumber") == "3";
    @test safeValue(exchange, inputList, 0) == "Hi";
    @test safeValue2(exchange, inputDict, "a", "i") == 1;
    @test safeValue2(exchange, inputDict, "a", "f") == 0.123;
    @test functions.ccxtruthy(safeValue2(exchange, inputDict, "a", "bool"));
    @test functions.ccxtruthy(equals(safeValue2(exchange, inputDict, "a", "list"), compareList));
    dictObject = safeValue2(exchange, inputDict, "a", "dict");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeValue2(exchange, inputDict, "a", "str") == "heLlo";
    @test safeValue2(exchange, inputDict, "a", "strNumber") == "3";
    @test safeValue2(exchange, inputList, 2, 0) == "Hi";
    @test safeValueN(exchange, inputDict, ["a", "b", "i"]) == 1;
    @test safeValueN(exchange, inputDict, ["a", "b", "f"]) == 0.123;
    @test functions.ccxtruthy(safeValueN(exchange, inputDict, ["a", "b", "bool"]));
    @test functions.ccxtruthy(equals(safeValueN(exchange, inputDict, ["a", "b", "list"]), compareList));
    dictObject = safeValueN(exchange, inputDict, ["a", "b", "dict"]);
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeValueN(exchange, inputDict, ["a", "b", "str"]) == "heLlo";
    @test safeValueN(exchange, inputDict, ["a", "b", "strNumber"]) == "3";
    @test safeValueN(exchange, inputList, [3, 2, 0]) == "Hi";
    dictObject = safeDict(exchange, inputDict, "dict");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    listObject = safeDict(exchange, inputDict, "list");
    @test listObject == nothing;
    @test safeDict(exchange, inputList, 1) == nothing;
    dictObject = safeDict2(exchange, inputDict, "a", "dict");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    listObject = safeDict2(exchange, inputDict, "a", "list");
    @test listObject == nothing;
    @test safeDict2(exchange, inputList, 2, 1) == nothing;
    dictObject = safeDictN(exchange, inputDict, ["a", "b", "dict"]);
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    listObject = safeDictN(exchange, inputDict, ["a", "b", "list"]);
    @test listObject == nothing;
    @test safeDictN(exchange, inputList, [3, 2, 1]) == nothing;
    listObject = safeList(exchange, inputDict, "list");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeList(exchange, inputDict, "dict") == nothing;
    @test safeList(exchange, inputList, 1) == nothing;
    arrayOfDicts = safeList(exchange, inputDict, "listOfDicts");
    @test functions.ccxtruthy(equals(get(arrayOfDicts, 1, nothing), Dict{Symbol, Any}(
    Symbol("a") => 1
)));
    listObject = safeList2(exchange, inputDict, "a", "list");
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeList2(exchange, inputDict, "a", "dict") == nothing;
    @test safeList2(exchange, inputList, 2, 1) == nothing;
    listObject = safeListN(exchange, inputDict, ["a", "b", "list"]);
    @test functions.ccxtruthy(equals(dictObject, compareDict));
    @test safeListN(exchange, inputDict, ["a", "b", "dict"]) == nothing;
    @test safeListN(exchange, inputList, [3, 2, 1]) == nothing;
    @test safeString(exchange, inputDict, "i") == "1";
    @test safeString(exchange, inputDict, "f") == "0.123";
    @test safeString(exchange, inputDict, "str") == "heLlo";
    @test safeString(exchange, inputDict, "strNumber") == "3";
    @test safeString(exchange, inputList, 0) == "Hi";
    @test safeString2(exchange, inputDict, "a", "i") == "1";
    @test safeString2(exchange, inputDict, "a", "f") == "0.123";
    @test safeString2(exchange, inputDict, "a", "str") == "heLlo";
    @test safeString2(exchange, inputDict, "a", "strNumber") == "3";
    @test safeString2(exchange, inputList, 2, 0) == "Hi";
    @test safeStringN(exchange, inputDict, ["a", "b", "i"]) == "1";
    @test safeStringN(exchange, inputDict, ["a", "b", "f"]) == "0.123";
    @test safeStringN(exchange, inputDict, ["a", "b", "str"]) == "heLlo";
    @test safeStringN(exchange, inputDict, ["a", "b", "strNumber"]) == "3";
    @test safeStringN(exchange, inputList, [3, 2, 0]) == "Hi";
    @test safeStringLower(exchange, inputDict, "i") == "1";
    @test safeStringLower(exchange, inputDict, "f") == "0.123";
    @test safeStringLower(exchange, inputDict, "str") == "hello";
    @test safeStringLower(exchange, inputDict, "strNumber") == "3";
    @test safeStringLower(exchange, inputList, 0) == "hi";
    @test safeStringLower2(exchange, inputDict, "a", "i") == "1";
    @test safeStringLower2(exchange, inputDict, "a", "f") == "0.123";
    @test safeStringLower2(exchange, inputDict, "a", "str") == "hello";
    @test safeStringLower2(exchange, inputDict, "a", "strNumber") == "3";
    @test safeStringLower2(exchange, inputList, 2, 0) == "hi";
    @test safeStringLowerN(exchange, inputDict, ["a", "b", "i"]) == "1";
    @test safeStringLowerN(exchange, inputDict, ["a", "b", "f"]) == "0.123";
    @test safeStringLowerN(exchange, inputDict, ["a", "b", "str"]) == "hello";
    @test safeStringLowerN(exchange, inputDict, ["a", "b", "strNumber"]) == "3";
    @test safeStringLowerN(exchange, inputList, [3, 2, 0]) == "hi";
    @test safeStringUpper(exchange, inputDict, "i") == "1";
    @test safeStringUpper(exchange, inputDict, "f") == "0.123";
    @test safeStringUpper(exchange, inputDict, "str") == "HELLO";
    @test safeStringUpper(exchange, inputDict, "strNumber") == "3";
    @test safeStringUpper(exchange, inputList, 0) == "HI";
    @test safeStringUpper2(exchange, inputDict, "a", "i") == "1";
    @test safeStringUpper2(exchange, inputDict, "a", "f") == "0.123";
    @test safeStringUpper2(exchange, inputDict, "a", "str") == "HELLO";
    @test safeStringUpper2(exchange, inputDict, "a", "strNumber") == "3";
    @test safeStringUpper2(exchange, inputList, 2, 0) == "HI";
    @test safeStringUpperN(exchange, inputDict, ["a", "b", "i"]) == "1";
    @test safeStringUpperN(exchange, inputDict, ["a", "b", "f"]) == "0.123";
    @test safeStringUpperN(exchange, inputDict, ["a", "b", "str"]) == "HELLO";
    @test safeStringUpperN(exchange, inputDict, ["a", "b", "strNumber"]) == "3";
    @test safeStringUpperN(exchange, inputList, [3, 2, 0]) == "HI";
    @test safeInteger(exchange, inputDict, "i") == 1;
    @test safeInteger(exchange, inputDict, "f") == 0;
    @test safeInteger(exchange, inputDict, "strNumber") == 3;
    @test safeInteger(exchange, inputList, 1) == 2;
    @test safeInteger2(exchange, inputDict, "a", "i") == 1;
    @test safeInteger2(exchange, inputDict, "a", "f") == 0;
    @test safeInteger2(exchange, inputDict, "a", "strNumber") == 3;
    @test safeInteger2(exchange, inputList, 2, 1) == 2;
    @test safeIntegerN(exchange, inputDict, ["a", "b", "i"]) == 1;
    @test safeIntegerN(exchange, inputDict, ["a", "b", "f"]) == 0;
    @test safeIntegerN(exchange, inputDict, ["a", "b", "strNumber"]) == 3;
    @test safeIntegerN(exchange, inputList, [3, 2, 1]) == 2;
    @test safeIntegerOmitZero(exchange, inputDict, "i") == 1;
    @test safeIntegerOmitZero(exchange, inputDict, "f") == nothing;
    @test safeIntegerOmitZero(exchange, inputDict, "strNumber") == 3;
    @test safeIntegerOmitZero(exchange, inputList, 1) == 2;
    @test safeIntegerProduct(exchange, inputDict, "i", factor) == 10;
    @test safeIntegerProduct(exchange, inputDict, "f", factor) == 1;
    @test safeIntegerProduct(exchange, inputDict, "strNumber", factor) == 30;
    @test safeIntegerProduct(exchange, inputList, 1, factor) == 20;
    @test safeIntegerProduct(exchange, inputDict, "longInt", 0.000001) == 123456789;
    @test safeIntegerProduct(exchange, inputDict, "inexistent", 0.000001, 123456789) == 123456789;
    @test safeIntegerProduct2(exchange, inputDict, "a", "i", factor) == 10;
    @test safeIntegerProduct2(exchange, inputDict, "a", "f", factor) == 1;
    @test safeIntegerProduct2(exchange, inputDict, "a", "strNumber", factor) == 30;
    @test safeIntegerProduct2(exchange, inputList, 2, 1, factor) == 20;
    @test safeIntegerProductN(exchange, inputDict, ["a", "b", "i"], factor) == 10;
    @test safeIntegerProductN(exchange, inputDict, ["a", "b", "f"], factor) == 1;
    @test safeIntegerProductN(exchange, inputDict, ["a", "b", "strNumber"], factor) == 30;
    @test safeIntegerProductN(exchange, inputList, [3, 2, 1], factor) == 20;
    @test safeTimestamp(exchange, inputDict, "i") == 1000;
    @test safeTimestamp(exchange, inputDict, "f") == 123;
    @test safeTimestamp(exchange, inputDict, "strNumber") == 3000;
    @test safeTimestamp(exchange, inputList, 1) == 2000;
    @test safeTimestamp2(exchange, inputDict, "a", "i") == 1000;
    @test safeTimestamp2(exchange, inputDict, "a", "f") == 123;
    @test safeTimestamp2(exchange, inputDict, "a", "strNumber") == 3000;
    @test safeTimestamp2(exchange, inputList, 2, 1) == 2000;
    @test safeTimestampN(exchange, inputDict, ["a", "b", "i"]) == 1000;
    @test safeTimestampN(exchange, inputDict, ["a", "b", "f"]) == 123;
    @test safeTimestampN(exchange, inputDict, ["a", "b", "strNumber"]) == 3000;
    @test safeTimestampN(exchange, inputList, [3, 2, 1]) == 2000;
    @test safeFloat(exchange, inputDict, "i") == ccxt_toNumber(1);
    @test safeFloat(exchange, inputDict, "f") == 0.123;
    @test safeFloat(exchange, inputDict, "strNumber") == ccxt_toNumber(3);
    @test safeFloat(exchange, inputList, 1) == ccxt_toNumber(2);
    @test safeFloat2(exchange, inputDict, "a", "i") == ccxt_toNumber(1);
    @test safeFloat2(exchange, inputDict, "a", "f") == 0.123;
    @test safeFloat2(exchange, inputDict, "a", "strNumber") == ccxt_toNumber(3);
    @test safeFloat2(exchange, inputList, 2, 1) == ccxt_toNumber(2);
    @test safeFloatN(exchange, inputDict, ["a", "b", "i"]) == ccxt_toNumber(1);
    @test safeFloatN(exchange, inputDict, ["a", "b", "f"]) == 0.123;
    @test safeFloatN(exchange, inputDict, ["a", "b", "strNumber"]) == ccxt_toNumber(3);
    @test safeFloatN(exchange, inputList, [3, 2, 1]) == ccxt_toNumber(2);
    @test safeNumber(exchange, inputDict, "i") == parseNumber(exchange, 1);
    @test safeNumber(exchange, inputDict, "f") == parseNumber(exchange, 0.123);
    @test safeNumber(exchange, inputDict, "strNumber") == parseNumber(exchange, 3);
    @test safeNumber(exchange, inputList, 1) == parseNumber(exchange, 2);
    @test safeNumber(exchange, inputList, "bool") == nothing;
    @test safeNumber(exchange, inputList, "list") == nothing;
    @test safeNumber(exchange, inputList, "dict") == nothing;
    @test safeNumber(exchange, inputList, "str") == nothing;
    @test safeNumber2(exchange, inputDict, "a", "i") == parseNumber(exchange, 1);
    @test safeNumber2(exchange, inputDict, "a", "f") == parseNumber(exchange, 0.123);
    @test safeNumber2(exchange, inputDict, "a", "strNumber") == parseNumber(exchange, 3);
    @test safeNumber2(exchange, inputList, 2, 1) == parseNumber(exchange, 2);
    @test safeNumberN(exchange, inputDict, ["a", "b", "i"]) == parseNumber(exchange, 1);
    @test safeNumberN(exchange, inputDict, ["a", "b", "f"]) == parseNumber(exchange, 0.123);
    @test safeNumberN(exchange, inputDict, ["a", "b", "strNumber"]) == parseNumber(exchange, 3);
    @test safeNumberN(exchange, inputList, [3, 2, 1]) == parseNumber(exchange, 2);
    @test functions.ccxtruthy(safeBool(exchange, inputDict, "bool"));
    @test safeBool(exchange, inputList, 1) == nothing;
    @test functions.ccxtruthy(safeBool2(exchange, inputDict, "a", "bool"));
    @test safeBool2(exchange, inputList, 2, 1) == nothing;
    @test functions.ccxtruthy(safeBoolN(exchange, inputDict, ["a", "b", "bool"]));
    @test safeBoolN(exchange, inputList, [3, 2, 1]) == nothing;
    @test safeNumberOmitZero(exchange, inputDict, "zeroNumeric") == nothing;
    @test safeNumberOmitZero(exchange, inputDict, "zeroString") == nothing;
    @test safeNumberOmitZero(exchange, inputDict, "undefined") == nothing;
    @test safeNumberOmitZero(exchange, inputDict, "emptyString") == nothing;
    @test safeNumberOmitZero(exchange, inputDict, "floatNumeric") != nothing;
    @test safeNumberOmitZero(exchange, inputDict, "floatString") != nothing;
    arrayCache = ArrayCache(100);
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "order1",
    Symbol("price") => 50000
));
    @test functions.ccxtruthy(functions.ccxt_gt(length(arrayCache), 0));
    arrayCacheByTimestamp = ArrayCacheByTimestamp(100);
    append(arrayCacheByTimestamp, [1000, 50000, 1, 2, 3]);
    arrayCacheByTimestampData = safeValue(exchange, arrayCacheByTimestamp, "Data");
    cacheByTimestampData = functions.ccxtruthy(arrayCacheByTimestampData != nothing) ? arrayCacheByTimestampData : arrayCacheByTimestamp;
    @test functions.ccxtruthy(functions.ccxt_gt(length(cacheByTimestampData), 0));
    arrayCacheBySymbolById = ArrayCacheBySymbolById(100);
    append(arrayCacheBySymbolById, Dict{Symbol, Any}(
    Symbol("symbol") => "ETH/USDT",
    Symbol("id") => "order2",
    Symbol("price") => 3000
));
    arrayCacheBySymbolByIdHashmap = get(arrayCacheBySymbolById, Symbol("hashmap"), nothing);
    @test get(arrayCacheBySymbolByIdHashmap, Symbol("ETH/USDT"), nothing) != nothing;
    @test get(get(arrayCacheBySymbolByIdHashmap, Symbol("ETH/USDT"), nothing), Symbol("order2"), nothing) != nothing;
    arrayCacheBySymbolByIdData = safeValue(exchange, arrayCacheBySymbolById, "Data");
    cacheBySymbolByIdData = functions.ccxtruthy(arrayCacheBySymbolByIdData != nothing) ? arrayCacheBySymbolByIdData : arrayCacheBySymbolById;
    @test functions.ccxtruthy(functions.ccxt_gt(length(cacheBySymbolByIdData), 0));
    arrayCacheBySymbolBySide = ArrayCacheBySymbolBySide();
    append(arrayCacheBySymbolBySide, Dict{Symbol, Any}(
    Symbol("symbol") => "BNB/USDT",
    Symbol("side") => "buy",
    Symbol("price") => 400
));
    arrayCacheBySymbolBySideHashmap = get(arrayCacheBySymbolBySide, Symbol("hashmap"), nothing);
    @test get(arrayCacheBySymbolBySideHashmap, Symbol("BNB/USDT"), nothing) != nothing;
    arrayCacheBySymbolBySideData = safeValue(exchange, arrayCacheBySymbolBySide, "Data");
    cacheBySymbolBySideData = functions.ccxtruthy(arrayCacheBySymbolBySideData != nothing) ? arrayCacheBySymbolBySideData : arrayCacheBySymbolBySide;
    @test functions.ccxtruthy(functions.ccxt_gt(length(cacheBySymbolBySideData), 0));
    arrayCacheHashmapDirect = get(arrayCache, Symbol("hashmap"), nothing);
    nestedMap = arrayCacheHashmapDirect;
    @test safeValue(exchange, nestedMap, "NONEXISTENT") == nothing;
    tradesMap = Dict{Symbol, Any}(
        Symbol("BTC/USDT") => arrayCache,
        Symbol("ETH/USDT") => arrayCacheBySymbolById
    );
    stored = safeValue(exchange, tradesMap, "BTC/USDT");
    @test stored != nothing;
    retrievedArrayCacheHashmap = get(stored, Symbol("hashmap"), nothing);
    @test retrievedArrayCacheHashmap != nothing;
    retrievedArrayCacheBySymbolById = safeValue(exchange, tradesMap, "ETH/USDT");
    @test retrievedArrayCacheBySymbolById != nothing;
    retrievedArrayCacheBySymbolByIdHashmap = get(retrievedArrayCacheBySymbolById, Symbol("hashmap"), nothing);
    @test retrievedArrayCacheBySymbolByIdHashmap != nothing;
    @test safeValue(exchange, tradesMap, "NONEXISTENT") == nothing;
    ohlcvInnerMap = Dict{Symbol, Any}(
        Symbol("1m") => arrayCacheByTimestamp,
        Symbol("5m") => ArrayCacheByTimestamp(100)
    );
    retrievedArrayCacheByTimestamp = safeValue(exchange, ohlcvInnerMap, "1m");
    @test retrievedArrayCacheByTimestamp != nothing;
    retrievedArrayCacheByTimestampHashmap = get(retrievedArrayCacheByTimestamp, Symbol("hashmap"), nothing);
    @test retrievedArrayCacheByTimestampHashmap != nothing;
    @test safeValue(exchange, ohlcvInnerMap, "5m") != nothing;
    @test safeValue(exchange, ohlcvInnerMap, "NONEXISTENT") == nothing;
    cacheBySideMap = Dict{Symbol, Any}(
        Symbol("BTC/USDT") => arrayCacheBySymbolBySide
    );
    retrievedArrayCacheBySymbolBySide = safeValue(exchange, cacheBySideMap, "BTC/USDT");
    @test retrievedArrayCacheBySymbolBySide != nothing;
    retrievedArrayCacheBySymbolBySideHashmap = get(retrievedArrayCacheBySymbolBySide, Symbol("hashmap"), nothing);
    @test retrievedArrayCacheBySymbolBySideHashmap != nothing;
    @test safeValue(exchange, cacheBySideMap, "NONEXISTENT") == nothing;
end
