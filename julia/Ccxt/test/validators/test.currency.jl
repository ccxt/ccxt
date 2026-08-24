using Test
using Ccxt
function testCurrency(exchange, skippedProperties, method, entry)

    if functions.ccxtruthy(entry == nothing)
            return 
    end
    format = Dict{Symbol, Any}(
        Symbol("id") => "btc",
        Symbol("code") => "BTC"
    );
    emptyAllowedFor = ["name", "fee"];
    isNative = @functions.ccxt_and(get(get(exchange, Symbol("has"), nothing), Symbol("fetchCurrencies"), nothing), get(get(exchange, Symbol("has"), nothing), Symbol("fetchCurrencies"), nothing) != "emulated");
    currencyType = safeString(exchange, entry, "type");
    if functions.ccxtruthy(isNative)
        format[Symbol("info")] = Dict{Symbol, Any}();
        format[Symbol("withdraw")] = true;
        format[Symbol("deposit")] = true;
        format[Symbol("precision")] = parseNumber(exchange, "0.0001");
        format[Symbol("fee")] = parseNumber(exchange, "0.001");
        format[Symbol("networks")] = Dict{Symbol, Any}();
        format[Symbol("limits")] = Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(exchange, "0.01"),
                Symbol("max") => parseNumber(exchange, "1000")
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => parseNumber(exchange, "0.01"),
                Symbol("max") => parseNumber(exchange, "1000")
            )
        );
        format[Symbol("type")] = "crypto";
        assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "type", ["fiat", "crypto", "leveraged", "other", nothing]);
        if functions.ccxtruthy(@functions.ccxt_and(currencyType != "crypto", (ccxt_in("depositForNonCrypto", skippedProperties))))
                        push!(emptyAllowedFor, "deposit");
        end
        if functions.ccxtruthy(@functions.ccxt_and(currencyType != "crypto", (ccxt_in("withdrawForNonCrypto", skippedProperties))))
                        push!(emptyAllowedFor, "withdraw");
        end
        if functions.ccxtruthy(@functions.ccxt_or(currencyType == "leveraged", currencyType == "other"))
                        push!(emptyAllowedFor, "precision");
        end
    end
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("code"), nothing));
    networks = safeDict(exchange, entry, "networks", Dict{Symbol, Any}());
    networkKeys = objectKeys(networks);
    networkKeysLength = length(networkKeys);
    if functions.ccxtruthy(@functions.ccxt_and(networkKeysLength == 0, (ccxt_in("skipCurrenciesWithoutNetworks", skippedProperties))))
            return 
    end
    try
        assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    catch e
        message = exceptionMessage(exchange, e);
        if functions.ccxtruthy(findfirst("\"id\" key", message) !== nothing)
            format[Symbol("id")] = 123;
            assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
        else
            @test message == ""; 
        end

    end
    checkPrecisionAccuracy(testSharedMethods, exchange, skippedProperties, method, entry, "precision");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "fee", "0");
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("limits", skippedProperties))))
        limits = safeValue(exchange, entry, "limits", Dict{Symbol, Any}());
        withdrawLimits = safeValue(exchange, limits, "withdraw", Dict{Symbol, Any}());
        depositLimits = safeValue(exchange, limits, "deposit", Dict{Symbol, Any}());
        assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, withdrawLimits, "min", "0");
        assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, withdrawLimits, "max", "0");
        assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, depositLimits, "min", "0");
        assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, depositLimits, "max", "0");
        minStringWithdrawal = safeString(exchange, withdrawLimits, "min");
        if functions.ccxtruthy(minStringWithdrawal != nothing)
            assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, withdrawLimits, "max", minStringWithdrawal);
        end
        minStringDeposit = safeString(exchange, depositLimits, "min");
        if functions.ccxtruthy(minStringDeposit != nothing)
            assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, depositLimits, "max", minStringDeposit);
        end
        assertValidCurrencyIdAndCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("id"), nothing), get(entry, Symbol("code"), nothing));
    end
end
