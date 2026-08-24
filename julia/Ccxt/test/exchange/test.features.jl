using Test
using Ccxt
function testFeatures(exchange, skippedProperties)

    marketTypes = ["spot", "swap", "future", "option"];
    subTypes = ["linear", "inverse"];
    features = get(exchange, Symbol("features"), nothing);
    keys_var = objectKeys(features);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        assertInArray(testSharedMethods, exchange, skippedProperties, "features", keys_var, i, marketTypes);
        marketType = get(keys_var, i + 1, nothing);
        value = get(features, Symbol(marketType), nothing);
        if functions.ccxtruthy(value == nothing)
            i += 1; continue
        end
        if functions.ccxtruthy(marketType == "spot")
            testFeaturesInner(exchange, skippedProperties, value);
        else
            subKeys = objectKeys(value);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(subKeys)))
                subKey = get(subKeys, j + 1, nothing);
                assertInArray(testSharedMethods, exchange, skippedProperties, "features", subKeys, j, subTypes);
                subValue = get(value, Symbol(subKey), nothing);
                if functions.ccxtruthy(subValue != nothing)
                    testFeaturesInner(exchange, skippedProperties, subValue);
                end
                j += 1
            end
        end
        i += 1
    end
    return true
end


function testFeaturesInner(exchange, skippedProperties, featureObj)

    format = Dict{Symbol, Any}(
        Symbol("sandbox") => false,
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("triggerPrice") => false,
            Symbol("triggerPriceType") => Dict{Symbol, Any}(
                Symbol("mark") => false,
                Symbol("last") => false,
                Symbol("index") => false
            ),
            Symbol("stopLossPrice") => false,
            Symbol("takeProfitPrice") => false,
            Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => false,
                    Symbol("mark") => false,
                    Symbol("index") => false
                ),
                Symbol("price") => false
            ),
            Symbol("timeInForce") => Dict{Symbol, Any}(
                Symbol("GTC") => false,
                Symbol("IOC") => false,
                Symbol("FOK") => false,
                Symbol("PO") => false,
                Symbol("GTD") => false
            ),
            Symbol("hedged") => false,
            Symbol("trailing") => false
        ),
        Symbol("createOrders") => Dict{Symbol, Any}(
            Symbol("max") => 5
        ),
        Symbol("fetchMyTrades") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("daysBack") => 0,
            Symbol("limit") => 0,
            Symbol("untilDays") => 0,
            Symbol("symbolRequired") => false
        ),
        Symbol("fetchOrder") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("trigger") => false,
            Symbol("trailing") => false,
            Symbol("symbolRequired") => false
        ),
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("limit") => 0,
            Symbol("trigger") => false,
            Symbol("trailing") => false,
            Symbol("symbolRequired") => false
        ),
        Symbol("fetchOrders") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("limit") => 0,
            Symbol("daysBack") => 0,
            Symbol("untilDays") => 0,
            Symbol("trigger") => false,
            Symbol("trailing") => false,
            Symbol("symbolRequired") => false
        ),
        Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
            Symbol("marginMode") => false,
            Symbol("limit") => 0,
            Symbol("daysBack") => 0,
            Symbol("daysBackCanceled") => 0,
            Symbol("untilDays") => 0,
            Symbol("trigger") => false,
            Symbol("trailing") => false,
            Symbol("symbolRequired") => false
        ),
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("limit") => 0
        )
    );
    featureKeys = objectKeys(featureObj);
    allMethods = objectKeys(get(exchange, Symbol("has"), nothing));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(featureKeys)))
        assertInArray(testSharedMethods, exchange, skippedProperties, "features", featureKeys, i, allMethods);
        assertStructure(testSharedMethods, exchange, skippedProperties, "features", featureObj, format, nothing, true);
        i += 1
    end
end
