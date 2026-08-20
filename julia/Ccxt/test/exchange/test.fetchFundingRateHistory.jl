using Test
using Ccxt
function testFetchFundingRateHistory(exchange, skippedProperties, symbol)

    method = "fetchFundingRateHistory";
    fundingRatesHistory = Base.fetch(fetchFundingRateHistory(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, fundingRatesHistory, symbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fundingRatesHistory)))
        testFundingRateHistory(exchange, skippedProperties, method, get(fundingRatesHistory, i + 1, nothing), symbol);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, symbol, fundingRatesHistory);
    return true
end
