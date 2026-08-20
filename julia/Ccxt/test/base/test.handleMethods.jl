using Test
using Ccxt
function helperTestHandleMarketTypeAndParams()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("options") => Dict{Symbol, Any}(
            Symbol("defaultType") => "valueFromOptions",
            Symbol("fetchX") => Dict{Symbol, Any}(
                Symbol("defaultType") => "valueFromMethodOptions"
            )
        )
    ));
    initialParams = Dict{Symbol, Any}(
        Symbol("defaultType") => "valueFromParam"
    );
    market = safeMarket(exchange, "TEST1/TEST2");
    market[Symbol("type")] = "spot";
    (marketType1, params1) = handleMarketTypeAndParams(exchange, "fetchX", market, initialParams, "valueDefault");
    @test functions.ccxtruthy(ccxt_in("defaultType", initialParams));
    @test !functions.ccxtruthy((ccxt_in("defaultType", params1)));
    @test marketType1 == "valueFromParam";
    (marketType2, params2) = handleMarketTypeAndParams(exchange, "fetchX", market, Dict{Symbol, Any}(), "valueDefault");
    @test marketType2 == "spot";
    (marketType3, params3) = handleMarketTypeAndParams(exchange, "fetchX", nothing, Dict{Symbol, Any}(), "valueDefault");
    @test marketType3 == "valueDefault";
    (marketType4, params4) = handleMarketTypeAndParams(exchange, "fetchX", nothing, Dict{Symbol, Any}());
    @test marketType4 == "valueFromMethodOptions";
    (marketType5, params5) = handleMarketTypeAndParams(exchange, "fetchY", nothing, Dict{Symbol, Any}(), nothing);
    @test marketType5 == "valueFromOptions";
    exchange.options[Symbol("defaultType")] = nothing;
    (marketType6, params6) = handleMarketTypeAndParams(exchange, "fetchY", nothing, Dict{Symbol, Any}(), nothing);
    @test marketType6 == "spot";
    @test functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(params1 != nothing, params2 != nothing), params3 != nothing), params4 != nothing), params5 != nothing), params6 != nothing));
end


function helperTestHandleNetworkRequest()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("options") => Dict{Symbol, Any}(
            Symbol("networks") => Dict{Symbol, Any}(
                Symbol("XYZ") => "Xyz"
            )
        )
    ));
    exchange.currencies = createSafeDictionary(exchange);
    currencyCode = "ETH";
    (request1, params1) = handleRequestNetwork(exchange, Dict{Symbol, Any}(
        Symbol("network") => "XYZ"
    ), Dict{Symbol, Any}(), "chain_id", currencyCode, false);
    @test !functions.ccxtruthy((ccxt_in("network", params1)));
    @test functions.ccxtruthy(ccxt_in("chain_id", request1));
    @test get(request1, Symbol("chain_id"), nothing) == "Xyz";
end


function testHandleMethods()

    helperTestHandleMarketTypeAndParams();
    helperTestHandleNetworkRequest();
end
