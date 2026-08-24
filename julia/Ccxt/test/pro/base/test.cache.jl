using Test
using Ccxt
function equals(a, b)

    if functions.ccxtruthy(length(a) != length(b))
            return false
    end
    for prop in functions.ccxt_forin(a)
        if functions.ccxtruthy(prop == "hashmap")
            continue;
        end
        if functions.ccxtruthy(@functions.ccxt_or(functions.ccxt_isArray(get(a, Symbol(prop), nothing)), isa(get(a, Symbol(prop), nothing), Dict)))
            if functions.ccxtruthy(!functions.ccxtruthy(equals(get(a, Symbol(prop), nothing), get(b, Symbol(prop), nothing))))
                    return false
            end
        elseif functions.ccxtruthy(get(a, Symbol(prop), nothing) != get(b, Symbol(prop), nothing))
            return false
        end
    end
    return true
end


function testWsCache()

    arrayCache = ArrayCache(3);
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 1
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 2
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 3
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 4
));
    @test functions.ccxtruthy(equals(arrayCache, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 2
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 3
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 4
)]));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 5
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 6
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 7
));
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 8
));
    @test functions.ccxtruthy(equals(arrayCache, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 6
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 7
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 8
)]));
    clear(arrayCache);
    append(arrayCache, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 1
));
    @test functions.ccxtruthy(equals(arrayCache, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 1
)]));
    arraycache2 = ArrayCache(1);
    append(arraycache2, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 1
));
    append(arraycache2, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 2
));
    @test functions.ccxtruthy(equals(arraycache2, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("data") => 2
)]));
    timestampCache = ArrayCacheByTimestamp();
    ohlcv1 = [100, 1, 2, 3];
    ohlcv2 = [200, 5, 6, 7];
    append(timestampCache, ohlcv1);
    append(timestampCache, ohlcv2);
    @test functions.ccxtruthy(equals(timestampCache, [ohlcv1, ohlcv2]));
    modify2 = [200, 10, 11, 12];
    append(timestampCache, modify2);
    @test functions.ccxtruthy(equals(timestampCache, [ohlcv1, modify2]));
    cacheSymbolId = ArrayCacheBySymbolById();
    object1 = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "abcdef",
        Symbol("i") => 1
    );
    object2 = Dict{Symbol, Any}(
        Symbol("symbol") => "ETH/USDT",
        Symbol("id") => "qwerty",
        Symbol("i") => 2
    );
    object3 = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "abcdef",
        Symbol("i") => 3
    );
    append(cacheSymbolId, object1);
    append(cacheSymbolId, object2);
    append(cacheSymbolId, object3);
    @test functions.ccxtruthy(equals(cacheSymbolId, [object2, object3]));
    cacheSymbolId5 = ArrayCacheBySymbolById(5);
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, 11))
        append(cacheSymbolId5, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => string(i),
    Symbol("i") => i
));
        i += 1
    end
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "6",
    Symbol("i") => 6
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 7
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 8
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "9",
    Symbol("i") => 9
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "10",
    Symbol("i") => 10
)]));
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, 11))
        append(cacheSymbolId5, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => string(i),
    Symbol("i") => i + 10
));
        i += 1
    end
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "6",
    Symbol("i") => 16
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 17
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 18
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "9",
    Symbol("i") => 19
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "10",
    Symbol("i") => 20
)]));
    middle = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "8",
        Symbol("i") => 28
    );
    append(cacheSymbolId5, middle);
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "6",
    Symbol("i") => 16
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 17
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "9",
    Symbol("i") => 19
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "10",
    Symbol("i") => 20
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 28
)]));
    otherMiddle = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "7",
        Symbol("i") => 27
    );
    append(cacheSymbolId5, otherMiddle);
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "6",
    Symbol("i") => 16
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "9",
    Symbol("i") => 19
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "10",
    Symbol("i") => 20
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 28
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 27
)]));
    i = 30
    while functions.ccxtruthy(functions.ccxt_lt(i, 33))
        append(cacheSymbolId5, Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => string(i),
    Symbol("i") => i + 10
));
        i += 1
    end
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 28
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 27
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "30",
    Symbol("i") => 40
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "31",
    Symbol("i") => 41
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "32",
    Symbol("i") => 42
)]));
    first_var = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "8",
        Symbol("i") => 38
    );
    append(cacheSymbolId5, first_var);
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 27
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "30",
    Symbol("i") => 40
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "31",
    Symbol("i") => 41
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "32",
    Symbol("i") => 42
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 38
)]));
    another = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("id") => "30",
        Symbol("i") => 50
    );
    append(cacheSymbolId5, another);
    @test functions.ccxtruthy(equals(cacheSymbolId5, [Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "7",
    Symbol("i") => 27
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "31",
    Symbol("i") => 41
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "32",
    Symbol("i") => 42
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "8",
    Symbol("i") => 38
), Dict{Symbol, Any}(
    Symbol("symbol") => "BTC/USDT",
    Symbol("id") => "30",
    Symbol("i") => 50
)]));
    symbol = "BTC/USDT";
    cacheSymbolId2 = ArrayCacheBySymbolById();
    initialLength = 5;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, initialLength))
        append(cacheSymbolId2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => string(i),
    Symbol("i") => i
));
        i += 1
    end
    limited = getLimit(cacheSymbolId2, symbol, nothing);
    @test initialLength == limited;
    cacheSymbolId3 = ArrayCacheBySymbolById();
    appendItemsLength = 3;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, appendItemsLength))
        append(cacheSymbolId3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => string(i),
    Symbol("i") => i
));
        i += 1
    end
    outsideLimit = 5;
    limited = getLimit(cacheSymbolId3, symbol, outsideLimit);
    @test appendItemsLength == limited;
    outsideLimit = 2;
    limited = getLimit(cacheSymbolId3, symbol, outsideLimit);
    @test outsideLimit == limited;
    symbol = "BTC/USDT";
    cacheSymbolId4 = ArrayCacheBySymbolById();
    initialLength = 5;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, initialLength))
        append(cacheSymbolId4, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => string(i),
    Symbol("i") => i
));
        i += 1
    end
    limited = getLimit(cacheSymbolId4, nothing, nothing);
    @test initialLength == limited;
    cacheSymbolId6 = ArrayCacheBySymbolById();
    appendItemsLength = 3;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, appendItemsLength))
        append(cacheSymbolId6, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => string(i),
    Symbol("i") => i
));
        i += 1
    end
    outsideLimit = 5;
    limited = getLimit(cacheSymbolId6, symbol, outsideLimit);
    @test appendItemsLength == limited;
    outsideLimit = 2;
    limited = getLimit(cacheSymbolId6, symbol, outsideLimit);
    @test outsideLimit == limited;
    cacheSymbolId7 = ArrayCacheBySymbolById();
    symbol = "BTC/USDT";
    otherSymbol = "ETH/USDT";
    append(cacheSymbolId7, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "singleId",
    Symbol("i") => 3
));
    append(cacheSymbolId7, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "singleId",
    Symbol("i") => 3
));
    append(cacheSymbolId7, Dict{Symbol, Any}(
    Symbol("symbol") => otherSymbol,
    Symbol("id") => "singleId",
    Symbol("i") => 3
));
    outsideLimit = 5;
    limited = getLimit(cacheSymbolId7, symbol, outsideLimit);
    limited2 = getLimit(cacheSymbolId7, nothing, outsideLimit);
    @test limited == 1;
    @test limited2 == 2;
    timestampCache2 = ArrayCacheByTimestamp();
    initialLength = 5;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, initialLength))
        append(timestampCache2, [i * 10, i * 10, i * 10, i * 10]);
        i += 1
    end
    limited = getLimit(timestampCache2, nothing, nothing);
    @test initialLength == limited;
    appendItemsLength = 3;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, appendItemsLength))
        append(timestampCache2, [i * 4, i * 4, i * 4, i * 4]);
        i += 1
    end
    outsideLimit = 5;
    limited = getLimit(timestampCache2, nothing, outsideLimit);
    @test appendItemsLength == limited;
    outsideLimit = 2;
    limited = getLimit(timestampCache2, nothing, outsideLimit);
    @test outsideLimit == limited;
    cacheSymbolId8 = ArrayCacheBySymbolById();
    symbol = "BTC/USDT";
    outsideLimit = 5;
    append(cacheSymbolId8, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "oneId",
    Symbol("i") => 3
));
    getLimit(cacheSymbolId8, nothing, outsideLimit);
    append(cacheSymbolId8, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "oneId",
    Symbol("i") => 4
));
    getLimit(cacheSymbolId8, nothing, outsideLimit);
    append(cacheSymbolId8, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "twoId",
    Symbol("i") => 5
));
    getLimit(cacheSymbolId8, nothing, outsideLimit);
    append(cacheSymbolId8, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "twoId",
    Symbol("i") => 6
));
    limited = getLimit(cacheSymbolId8, nothing, outsideLimit);
    @test limited == 1;
    cacheSymbolId9 = ArrayCacheBySymbolById();
    symbol = "BTC/USDT";
    symbol2 = "ETH/USDT";
    outsideLimit = 5;
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "one",
    Symbol("i") => 1
));
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("id") => "two",
    Symbol("i") => 1
));
    @test getLimit(cacheSymbolId9, nothing, outsideLimit) == 2;
    @test getLimit(cacheSymbolId9, symbol, outsideLimit) == 1;
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => "one",
    Symbol("i") => 2
));
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("id") => "two",
    Symbol("i") => 2
));
    @test getLimit(cacheSymbolId9, symbol, outsideLimit) == 1;
    @test getLimit(cacheSymbolId9, nothing, outsideLimit) == 2;
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("id") => "two",
    Symbol("i") => 3
));
    append(cacheSymbolId9, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("id") => "three",
    Symbol("i") => 3
));
    @test getLimit(cacheSymbolId9, nothing, outsideLimit) == 2;
    cacheSymbolSide = ArrayCacheBySymbolBySide();
    symbol = "BTC/USDT";
    outsideLimit = 5;
    append(cacheSymbolSide, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 1
));
    append(cacheSymbolSide, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 0
));
    @test getLimit(cacheSymbolSide, symbol, outsideLimit) == 1;
    append(cacheSymbolSide, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 1
));
    @test getLimit(cacheSymbolSide, symbol, outsideLimit) == 1;
    cacheSymbolSide2 = ArrayCacheBySymbolBySide();
    symbol = "BTC/USDT";
    outsideLimit = 5;
    append(cacheSymbolSide2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 1
));
    @test getLimit(cacheSymbolSide2, nothing, outsideLimit) == 1;
    append(cacheSymbolSide2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 0
));
    @test getLimit(cacheSymbolSide2, nothing, outsideLimit) == 1;
    append(cacheSymbolSide2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "long",
    Symbol("contracts") => 3
));
    @test getLimit(cacheSymbolSide2, nothing, outsideLimit) == 1;
    append(cacheSymbolSide2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "long",
    Symbol("contracts") => 2
));
    append(cacheSymbolSide2, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "long",
    Symbol("contracts") => 1
));
    @test getLimit(cacheSymbolSide2, nothing, outsideLimit) == 1;
    cacheSymbolSide3 = ArrayCacheBySymbolBySide();
    symbol = "BTC/USDT";
    symbol2 = "ETH/USDT";
    append(cacheSymbolSide3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 1
));
    append(cacheSymbolSide3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("side") => "long",
    Symbol("contracts") => 1
));
    @test getLimit(cacheSymbolSide3, nothing, outsideLimit) == 2;
    @test getLimit(cacheSymbolSide3, symbol, outsideLimit) == 1;
    append(cacheSymbolSide3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "short",
    Symbol("contracts") => 2
));
    append(cacheSymbolSide3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("side") => "long",
    Symbol("contracts") => 2
));
    @test getLimit(cacheSymbolSide3, symbol, outsideLimit) == 1;
    @test getLimit(cacheSymbolSide3, nothing, outsideLimit) == 2;
    append(cacheSymbolSide3, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("side") => "long",
    Symbol("contracts") => 3
));
    @test getLimit(cacheSymbolSide3, nothing, outsideLimit) == 1;
    cacheSymbolSide4 = ArrayCacheBySymbolBySide();
    symbol = "BTC/USDT";
    symbol2 = "ETH/USDT";
    symbol3 = "XRP/USDT";
    append(cacheSymbolSide4, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("side") => "long",
    Symbol("contracts") => 1
));
    append(cacheSymbolSide4, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("side") => "long",
    Symbol("contracts") => 2
));
    append(cacheSymbolSide4, Dict{Symbol, Any}(
    Symbol("symbol") => symbol3,
    Symbol("side") => "long",
    Symbol("contracts") => 3
));
    @test get(get(cacheSymbolSide4, 1, nothing), Symbol("symbol"), nothing) == symbol;
    @test get(get(cacheSymbolSide4, 2, nothing), Symbol("symbol"), nothing) == symbol2;
    append(cacheSymbolSide4, Dict{Symbol, Any}(
    Symbol("symbol") => symbol2,
    Symbol("side") => "long",
    Symbol("contracts") => 4
));
    @test functions.ccxtruthy(@functions.ccxt_and(get(get(cacheSymbolSide4, 1, nothing), Symbol("contracts"), nothing) == 1, get(get(cacheSymbolSide4, 1, nothing), Symbol("symbol"), nothing) == symbol));
    @test functions.ccxtruthy(@functions.ccxt_and(get(get(cacheSymbolSide4, 2, nothing), Symbol("contracts"), nothing) == 3, get(get(cacheSymbolSide4, 2, nothing), Symbol("symbol"), nothing) == symbol3));
    @test functions.ccxtruthy(@functions.ccxt_and(get(get(cacheSymbolSide4, 3, nothing), Symbol("contracts"), nothing) == 4, get(get(cacheSymbolSide4, 3, nothing), Symbol("symbol"), nothing) == symbol2));
    arrayLength = length(cacheSymbolSide4);
    @test arrayLength == 3;
end
