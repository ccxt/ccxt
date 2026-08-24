using Test
using Ccxt
function testFetchCurrencies(exchange, skippedProperties)

    method = "fetchCurrencies";
    currencies = Base.fetch(Ccxt.fetchCurrencies(exchange));
    numInactiveCurrencies = 0;
    maxInactiveCurrenciesPercentage = safeInteger(exchange, skippedProperties, "maxInactiveCurrenciesPercentage", 50);
    requiredActiveCurrencies = ["BTC", "ETH", "USDT", "USDC"];
    features = get(exchange, Symbol("features"), nothing);
    featuresSpot = safeDict(exchange, features, "spot", Dict{Symbol, Any}());
    fetchCurrencies = safeDict(exchange, featuresSpot, "fetchCurrencies", Dict{Symbol, Any}());
    isFetchCurrenciesPrivate = safeValue(exchange, fetchCurrencies, "private", false);
    if functions.ccxtruthy(!functions.ccxtruthy(isFetchCurrenciesPrivate))
        values_var = objectValues(currencies);
        assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, values_var);
        currenciesLength = length(values_var);
        skipAmount = (ccxt_in("amountOfCurrencies", skippedProperties));
        @test functions.ccxtruthy(@functions.ccxt_or(skipAmount, functions.ccxt_gt(currenciesLength, 5)))
        skipActive = (ccxt_in("activeCurrenciesQuota", skippedProperties));
        skipMajorCurrencyCheck = (ccxt_in("activeMajorCurrencies", skippedProperties));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, currenciesLength))
            currency = get(values_var, i + 1, nothing);
            testCurrency(exchange, skippedProperties, method, currency);
            active = safeBool(exchange, currency, "active");
            if functions.ccxtruthy(active == false)
                numInactiveCurrencies = numInactiveCurrencies + 1;
            end
            code = safeString(exchange, currency, "code");
            withdraw = safeBool(exchange, currency, "withdraw");
            deposit = safeBool(exchange, currency, "deposit");
            isMicaCompliant = safeBool(exchange, get(exchange, Symbol("options"), nothing), "mica", false);
            skipUsdtForMica = @functions.ccxt_and(isMicaCompliant, code == "USDT");
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(inArray(exchange, code, requiredActiveCurrencies), !functions.ccxtruthy(skipMajorCurrencyCheck)), !functions.ccxtruthy(skipUsdtForMica)))
                @test functions.ccxtruthy(@functions.ccxt_and(withdraw, deposit))
            end
            i += 1
        end

        inactiveCurrenciesPercentage = (numInactiveCurrencies / currenciesLength) * 100;
        @test functions.ccxtruthy(@functions.ccxt_or(skipActive, (functions.ccxt_lt(inactiveCurrenciesPercentage, maxInactiveCurrenciesPercentage))))
        detectCurrencyConflicts(exchange, currencies);
    end
    return true
end


function detectCurrencyConflicts(exchange, currencyValues)

    ids = Dict{Symbol, Any}();
    keys_var = objectKeys(currencyValues);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        currency = get(currencyValues, Symbol(key), nothing);
        code = get(currency, Symbol("code"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(code, ids))))
            ids[Symbol(code)] = get(currency, Symbol("id"), nothing);
        else
            isDifferent = get(ids, Symbol(code), nothing) != get(currency, Symbol("id"), nothing);
            @test !functions.ccxtruthy(isDifferent)
        end
        i += 1
    end
    return true
end
