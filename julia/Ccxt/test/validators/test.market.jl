using Test
using Ccxt
function testMarket(exchange, skippedProperties, method, market)

    if functions.ccxtruthy(market == nothing)
            return 
    end
    format = Dict{Symbol, Any}(
        Symbol("id") => "btcusd",
        Symbol("symbol") => "BTC/USD",
        Symbol("base") => "BTC",
        Symbol("quote") => "USD",
        Symbol("taker") => parseNumber(exchange, "0.0011"),
        Symbol("maker") => parseNumber(exchange, "0.0009"),
        Symbol("baseId") => "btc",
        Symbol("quoteId") => "usd",
        Symbol("active") => false,
        Symbol("type") => "spot",
        Symbol("linear") => false,
        Symbol("inverse") => false,
        Symbol("spot") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("margin") => false,
        Symbol("contract") => false,
        Symbol("contractSize") => parseNumber(exchange, "0.001"),
        Symbol("expiry") => 1656057600000,
        Symbol("expiryDatetime") => "2022-06-24T08:00:00.000Z",
        Symbol("optionType") => "put",
        Symbol("strike") => parseNumber(exchange, "56000"),
        Symbol("settle") => "XYZ",
        Symbol("settleId") => "Xyz",
        Symbol("precision") => Dict{Symbol, Any}(
            Symbol("price") => parseNumber(exchange, "0.001"),
            Symbol("amount") => parseNumber(exchange, "0.001"),
            Symbol("cost") => parseNumber(exchange, "0.001")
        ),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("amount") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(exchange, "0.01"),
                Symbol("max") => parseNumber(exchange, "1000")
            ),
            Symbol("price") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(exchange, "0.01"),
                Symbol("max") => parseNumber(exchange, "1000")
            ),
            Symbol("cost") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(exchange, "0.01"),
                Symbol("max") => parseNumber(exchange, "1000")
            )
        ),
        Symbol("marginModes") => Dict{Symbol, Any}(
            Symbol("cross") => true,
            Symbol("isolated") => false
        ),
        Symbol("info") => Dict{Symbol, Any}()
    );
    if functions.ccxtruthy(ccxt_in("quanto", market))
        format[Symbol("quanto")] = false;
    end
    spot = get(market, Symbol("spot"), nothing);
    contract = get(market, Symbol("contract"), nothing);
    swap = get(market, Symbol("swap"), nothing);
    future = get(market, Symbol("future"), nothing);
    option = get(market, Symbol("option"), nothing);
    index = safeBool(exchange, market, "index");
    isIndex = @functions.ccxt_and((index != nothing), index);
    linear = get(market, Symbol("linear"), nothing);
    inverse = get(market, Symbol("inverse"), nothing);
    quanto = safeBool(exchange, market, "quanto");
    isQuanto = @functions.ccxt_and((quanto != nothing), quanto);
    isInactiveMarket = get(market, Symbol("active"), nothing) == false;
    emptyAllowedFor = ["margin"];
    if functions.ccxtruthy(!functions.ccxtruthy(contract))
                push!(emptyAllowedFor, "contractSize");
                push!(emptyAllowedFor, "linear");
                push!(emptyAllowedFor, "inverse");
                push!(emptyAllowedFor, "quanto");
                push!(emptyAllowedFor, "settle");
                push!(emptyAllowedFor, "settleId");
    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(future), !functions.ccxtruthy(option)))
                push!(emptyAllowedFor, "expiry");
                push!(emptyAllowedFor, "expiryDatetime");
    end
    if functions.ccxtruthy(!functions.ccxtruthy(option))
                push!(emptyAllowedFor, "optionType");
                push!(emptyAllowedFor, "strike");
    end
    if functions.ccxtruthy(isInactiveMarket)
                push!(emptyAllowedFor, "contractSize");
                push!(emptyAllowedFor, "settle");
                push!(emptyAllowedFor, "settleId");
                push!(emptyAllowedFor, "baseId");
                push!(emptyAllowedFor, "quoteId");
                push!(emptyAllowedFor, "base");
                push!(emptyAllowedFor, "quote");
    end
    assertStructure(testSharedMethods, exchange, skippedProperties, method, market, format, emptyAllowedFor);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, market, "symbol");
    logText = logTemplate(testSharedMethods, exchange, method, market);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, market, "taker", "-100");
    assertLess(testSharedMethods, exchange, skippedProperties, method, market, "taker", "100");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, market, "maker", "-100");
    assertLess(testSharedMethods, exchange, skippedProperties, method, market, "maker", "100");
    validTypes = ["spot", "margin", "swap", "future", "option", "index", "other"];
    assertInArray(testSharedMethods, exchange, skippedProperties, method, market, "type", validTypes);
    validSubTypes = ["linear", "inverse", "quanto", nothing];
    assertInArray(testSharedMethods, exchange, skippedProperties, method, market, "subType", validSubTypes);
    checkedTypes = ["spot", "swap", "future", "option"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(checkedTypes)))
        type_var = get(checkedTypes, i + 1, nothing);
        if functions.ccxtruthy(get(market, Symbol(type_var), nothing))
            @test type_var == get(market, Symbol("type"), nothing)
        end
        i += 1
    end
    if functions.ccxtruthy(@functions.ccxt_or(swap, future))
        checkedSubTypes = ["linear", "inverse"];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(checkedSubTypes)))
            subType = get(checkedSubTypes, i + 1, nothing);
            if functions.ccxtruthy(get(market, Symbol(subType), nothing))
                @test subType == get(market, Symbol("subType"), nothing)
            end
            i += 1
        end

    end
    if functions.ccxtruthy(spot)
        assertInArray(testSharedMethods, exchange, skippedProperties, method, market, "margin", [true, false, nothing]);
    else
        assertInArray(testSharedMethods, exchange, skippedProperties, method, market, "margin", [false, nothing]);
    end
    if functions.ccxtruthy(spot)
        @test functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(contract), linear == nothing), inverse == nothing), !functions.ccxtruthy(option)), !functions.ccxtruthy(swap)), !functions.ccxtruthy(future)))
    else
        @test functions.ccxtruthy(@functions.ccxt_and(contract, (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(future, swap), option), isIndex))))
    end
    contractSize = safeString(exchange, market, "contractSize");
    if functions.ccxtruthy(@functions.ccxt_and(contract, !functions.ccxtruthy(isInactiveMarket)))
        if functions.ccxtruthy(isQuanto)
            @test linear == false
            @test inverse == false
        else
            @test inverse != nothing
            @test linear != nothing
            @test linear != inverse
        end
        @test functions.ccxtruthy((@functions.ccxt_or((ccxt_in("contractSize", skippedProperties)), contractSize != nothing)))
        @test functions.ccxtruthy(@functions.ccxt_or((ccxt_in("contractSize", skippedProperties)), stringGt(contractSize, "0")))
        @test functions.ccxtruthy(@functions.ccxt_or((ccxt_in("settle", skippedProperties)), (@functions.ccxt_and(get(market, Symbol("settle"), nothing) != nothing, get(market, Symbol("settleId"), nothing) != nothing))))
    elseif functions.ccxtruthy(!functions.ccxtruthy(contract))
        @test functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(linear == nothing, inverse == nothing), quanto == nothing))
        @test contractSize == nothing
        @test functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("settle"), nothing) == nothing), (get(market, Symbol("settleId"), nothing) == nothing)))
    end
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        @test functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)), !functions.ccxtruthy(get(market, Symbol("option"), nothing))), !functions.ccxtruthy(isIndex)))
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        @test functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("future"), nothing)), !functions.ccxtruthy(get(market, Symbol("option"), nothing))))
    else
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            @test functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("future"), nothing)), !functions.ccxtruthy(get(market, Symbol("swap"), nothing))))
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or(option, future))
        @test get(market, Symbol("expiry"), nothing) != nothing
        @test get(market, Symbol("expiryDatetime"), nothing) != nothing
        isoString = iso8601(exchange, get(market, Symbol("expiry"), nothing));
        @test get(market, Symbol("expiryDatetime"), nothing) == isoString
        assertGreater(testSharedMethods, exchange, skippedProperties, method, market, "expiry", "0");
        if functions.ccxtruthy(option)
            @test functions.ccxtruthy((@functions.ccxt_or((ccxt_in("strike", skippedProperties)), get(market, Symbol("strike"), nothing) != nothing)))
            assertGreater(testSharedMethods, exchange, skippedProperties, method, market, "strike", "0");
            @test functions.ccxtruthy((@functions.ccxt_or((ccxt_in("optionType", skippedProperties)), get(market, Symbol("optionType"), nothing) != nothing)))
            assertInArray(testSharedMethods, exchange, skippedProperties, method, market, "optionType", ["put", "call"]);
        else
            @test get(market, Symbol("strike"), nothing) == nothing
            @test get(market, Symbol("optionType"), nothing) == nothing
        end
    elseif functions.ccxtruthy(spot)
        @test functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("expiry"), nothing) == nothing), (get(market, Symbol("expiryDatetime"), nothing) == nothing)))
    end
    precisionKeys = objectKeys(get(market, Symbol("precision"), nothing));
    precisionKeysLen = length(precisionKeys);
    @test functions.ccxtruthy(functions.ccxt_ge(precisionKeysLen, 2))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(precisionKeys)))
        priceOrAmountKey = get(precisionKeys, i + 1, nothing);
        isExclusivePair = get(market, Symbol("baseId"), nothing) == "BTC";
        isNonSpot = !functions.ccxtruthy(spot);
        isPrice = priceOrAmountKey == "price";
        isTickSize5 = stringEq("5", safeString(exchange, get(market, Symbol("precision"), nothing), priceOrAmountKey));
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(isNonSpot, isPrice), isExclusivePair), isTickSize5))
            i += 1; continue
        end
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("precision", skippedProperties))))
            checkPrecisionAccuracy(testSharedMethods, exchange, skippedProperties, method, get(market, Symbol("precision"), nothing), priceOrAmountKey);
        end
        i += 1
    end
    limitsKeys = objectKeys(get(market, Symbol("limits"), nothing));
    limitsKeysLength = length(limitsKeys);
    @test functions.ccxtruthy(functions.ccxt_ge(limitsKeysLength, 3))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(limitsKeys)))
        key = get(limitsKeys, i + 1, nothing);
        limitEntry = get(get(market, Symbol("limits"), nothing), Symbol(key), nothing);
        if functions.ccxtruthy(isInactiveMarket)
            i += 1; continue
        end
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("limits", skippedProperties))))
            assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, limitEntry, "min", "0");
            assertGreater(testSharedMethods, exchange, skippedProperties, method, limitEntry, "max", "0");
            minString = safeString(exchange, limitEntry, "min");
            if functions.ccxtruthy(minString != nothing)
                assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, limitEntry, "max", minString);
            end
        end
        i += 1
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isInactiveMarket))
        assertValidCurrencyIdAndCode(testSharedMethods, exchange, skippedProperties, method, market, get(market, Symbol("baseId"), nothing), get(market, Symbol("base"), nothing));
        assertValidCurrencyIdAndCode(testSharedMethods, exchange, skippedProperties, method, market, get(market, Symbol("quoteId"), nothing), get(market, Symbol("quote"), nothing));
        assertValidCurrencyIdAndCode(testSharedMethods, exchange, skippedProperties, method, market, get(market, Symbol("settleId"), nothing), get(market, Symbol("settle"), nothing));
    end
    assertTimestamp(testSharedMethods, exchange, skippedProperties, method, market, nothing, "created");
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("marginModes", skippedProperties))))
        marginModes = safeDict(exchange, market, "marginModes", Dict{Symbol, Any}());
        @test functions.ccxtruthy(ccxt_in("cross", marginModes))
        @test functions.ccxtruthy(ccxt_in("isolated", marginModes))
        assertInArray(testSharedMethods, exchange, skippedProperties, method, marginModes, "cross", [true, false, nothing]);
        assertInArray(testSharedMethods, exchange, skippedProperties, method, marginModes, "isolated", [true, false, nothing]);
    end
end
