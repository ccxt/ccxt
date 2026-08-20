using Test
using Ccxt
function helperTestInitThrottler()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("rateLimit") => 10.8
    ));
    tokenBucket = exchangeProp(testSharedMethods, exchange, "tokenBucket");
    @test tokenBucket != nothing;
    rateLimit = exchangeProp(testSharedMethods, exchange, "rateLimit");
    @test rateLimit == 10.8;
    @test get(tokenBucket, Symbol("delay"), nothing) == 0.001;
    @test get(tokenBucket, Symbol("refillRate"), nothing) == 1 / rateLimit;
    @test functions.ccxtruthy(inArray(exchange, get(tokenBucket, Symbol("capacity"), nothing), [1, 1]));
    cost = parseToNumeric(exchange, safeString2(exchange, tokenBucket, "cost", "defaultCost"));
    @test functions.ccxtruthy(inArray(exchange, cost, [1, 1]));
    @test functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy((ccxt_in("maxCapacity", tokenBucket))), inArray(exchange, get(tokenBucket, Symbol("maxCapacity"), nothing), [1000, 1000])));
end


function helperTestSandboxState(exchange, expectEnabled=true)

    @test get(exchange, Symbol("urls"), nothing) != nothing;
    @test functions.ccxtruthy(ccxt_in("test", get(exchange, Symbol("urls"), nothing)));
    isSandboxModeEnabled = exchangeProp(testSharedMethods, exchange, "isSandboxModeEnabled");
    if functions.ccxtruthy(expectEnabled)
        @test functions.ccxtruthy(isSandboxModeEnabled);
        @test get(get(get(exchange, Symbol("urls"), nothing), Symbol("api"), nothing), Symbol("public"), nothing) == "https://testnet.org";
        @test get(get(get(exchange, Symbol("urls"), nothing), Symbol("apiBackup"), nothing), Symbol("public"), nothing) == "https://example.com";
    else
        @test !functions.ccxtruthy(isSandboxModeEnabled);
        @test get(get(get(exchange, Symbol("urls"), nothing), Symbol("api"), nothing), Symbol("public"), nothing) == "https://example.com";
        @test get(get(get(exchange, Symbol("urls"), nothing), Symbol("test"), nothing), Symbol("public"), nothing) == "https://testnet.org";
    end
end


function helperTestInitSandbox()

    opts = Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("options") => Dict{Symbol, Any}(
            Symbol("sandbox") => false
        ),
        Symbol("urls") => Dict{Symbol, Any}(
            Symbol("api") => Dict{Symbol, Any}(
                Symbol("public") => "https://example.com"
            ),
            Symbol("test") => Dict{Symbol, Any}(
                Symbol("public") => "https://testnet.org"
            )
        )
    );
    exchange3 = get(ccxt, Symbol("Exchange"), nothing)(opts);
    helperTestSandboxState(exchange3, false);
    setSandboxMode(exchange3, true);
    helperTestSandboxState(exchange3, true);
    opts[Symbol("options")][Symbol("sandbox")] = true;
    exchange4 = get(ccxt, Symbol("Exchange"), nothing)(opts);
    helperTestSandboxState(exchange4, true);
    setSandboxMode(exchange4, false);
    helperTestSandboxState(exchange4, false);
end


function helperTestInitMarket()

    sampleMarket = Dict{Symbol, Any}(
        Symbol("id") => "BtcUsd",
        Symbol("symbol") => "BTC/USD",
        Symbol("base") => "BTC",
        Symbol("quote") => "USD",
        Symbol("baseId") => "Btc",
        Symbol("quoteId") => "Usd",
        Symbol("type") => "spot",
        Symbol("spot") => true
    );
    exchange2 = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("markets") => Dict{Symbol, Any}(
            Symbol("BTC/USD") => sampleMarket
        )
    ));
    @test functions.ccxtruthy(@functions.ccxt_and((get(exchange2, Symbol("markets"), nothing) != nothing), (get(get(exchange2, Symbol("markets"), nothing), Symbol("BTC/USD"), nothing) != nothing)));
end


function helperTestProperties()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}());
    keys_var = ["chrome", "chrome39", "chrome100"];
    @test exchangeProp(testSharedMethods, exchange, "userAgents") != nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        userAgent = get(exchangeProp(testSharedMethods, exchange, "userAgents"), Symbol(key), nothing);
        @test userAgent != nothing;
        i += 1
    end
    @test get(exchange, Symbol("options"), nothing) != nothing;
    @test exchangeProp(testSharedMethods, exchange, "apiKey") == nothing
    @test get(exchange, Symbol("secret"), nothing) == nothing
    @test get(exchange, Symbol("uid"), nothing) == nothing
    @test get(exchange, Symbol("login"), nothing) == nothing
    @test get(exchange, Symbol("password"), nothing) == nothing
    @test get(exchange, Symbol("twofa"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "privateKey") == nothing
    @test exchangeProp(testSharedMethods, exchange, "walletAddress") == nothing
    @test get(exchange, Symbol("token"), nothing) == nothing
    requiredCredentials = Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("uid") => false,
        Symbol("accountId") => false,
        Symbol("login") => false,
        Symbol("password") => false,
        Symbol("twofa") => false,
        Symbol("privateKey") => false,
        Symbol("walletAddress") => false,
        Symbol("token") => false
    );
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "requiredCredentials", exchangeProp(testSharedMethods, exchange, "requiredCredentials"), requiredCredentials);
    @test get(exchange, Symbol("proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "proxyUrl") == nothing
    @test get(exchange, Symbol("proxy_url"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "proxyUrlCallback") == nothing
    @test get(exchange, Symbol("proxy_url_callback"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "httpProxy") == nothing
    @test get(exchange, Symbol("http_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "httpProxyCallback") == nothing
    @test get(exchange, Symbol("http_proxy_callback"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "httpsProxy") == nothing
    @test get(exchange, Symbol("https_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "httpsProxyCallback") == nothing
    @test get(exchange, Symbol("https_proxy_callback"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "socksProxy") == nothing
    @test get(exchange, Symbol("socks_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "socksProxyCallback") == nothing
    @test get(exchange, Symbol("socks_proxy_callback"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "wsProxy") == nothing
    @test get(exchange, Symbol("ws_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "wssProxy") == nothing
    @test get(exchange, Symbol("wss_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "wsSocksProxy") == nothing
    @test get(exchange, Symbol("ws_socks_proxy"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "lastRestRequestTimestamp") == 0
    @test get(exchange, Symbol("last_http_response"), nothing) == nothing
    @test get(exchange, Symbol("last_response_headers"), nothing) == nothing
    @test get(exchange, Symbol("last_request_headers"), nothing) == nothing
    @test get(exchange, Symbol("last_request_body"), nothing) == nothing
    @test get(exchange, Symbol("last_request_url"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "returnResponseHeaders") == false
    @test get(exchange, Symbol("id"), nothing) == string("Exch", "ange")
    @test get(exchange, Symbol("has"), nothing) != nothing
    @test get(exchange, Symbol("api"), nothing) == nothing
    @test get(exchange, Symbol("features"), nothing) == nothing
    @test functions.ccxtruthy(functions.ccxt_ge(exchangeProp(testSharedMethods, exchange, "minFundingAddressLength"), 1))
    @test exchangeProp(testSharedMethods, exchange, "isSandboxModeEnabled") == false
    @test functions.ccxtruthy(exchangeProp(testSharedMethods, exchange, "enableRateLimit"))
    @test exchangeProp(testSharedMethods, exchange, "rateLimiterAlgorithm") == "leakyBucket"
    @test exchangeProp(testSharedMethods, exchange, "rateLimit") == 2000
    @test get(exchange, Symbol("certified"), nothing) == false
    @test get(exchange, Symbol("pro"), nothing) == false
    @test get(exchange, Symbol("alias"), nothing) == false
    httpExceptionKeys = ["400", "401", "403", "404", "405", "407", "408", "409", "410", "418", "422", "429", "451", "500", "501", "502", "503", "504", "511", "520", "521", "522", "525", "526", "530"];
    @test length((objectKeys(exchangeProp(testSharedMethods, exchange, "httpExceptions")))) == length(httpExceptionKeys)
    limits = Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    );
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "limits", get(exchange, Symbol("limits"), nothing), limits);
    @test exchangeProp(testSharedMethods, exchange, "rollingWindowSize") == 60000
    @test get(exchange, Symbol("countries"), nothing) == nothing
    urls = Dict{Symbol, Any}(
        Symbol("logo") => nothing,
        Symbol("api") => nothing,
        Symbol("test") => nothing,
        Symbol("www") => nothing,
        Symbol("doc") => nothing,
        Symbol("api_management") => nothing,
        Symbol("fees") => nothing,
        Symbol("referral") => nothing
    );
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "urls", get(exchange, Symbol("urls"), nothing), urls);
    @test get(exchange, Symbol("precision"), nothing) == nothing
    @test get(exchange, Symbol("hostname"), nothing) == nothing
    @test functions.ccxtruthy(@functions.ccxt_or(exchangeProp(testSharedMethods, exchange, "precisionMode") == nothing, exchangeProp(testSharedMethods, exchange, "precisionMode") == 4))
    @test functions.ccxtruthy(@functions.ccxt_or(exchangeProp(testSharedMethods, exchange, "paddingMode") == nothing, exchangeProp(testSharedMethods, exchange, "paddingMode") == 5))
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "headers", get(exchange, Symbol("headers"), nothing), Dict{Symbol, Any}());
    @test functions.ccxtruthy(exchangeProp(testSharedMethods, exchange, "substituteCommonCurrencyCodes"))
    @test functions.ccxtruthy(exchangeProp(testSharedMethods, exchange, "reduceFees"))
    fees = Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => nothing,
            Symbol("percentage") => nothing,
            Symbol("taker") => nothing,
            Symbol("maker") => nothing
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => nothing,
            Symbol("percentage") => nothing,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}()
        )
    );
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "fees", get(exchange, Symbol("fees"), nothing), fees);
    status = Dict{Symbol, Any}(
        Symbol("status") => "ok",
        Symbol("updated") => nothing,
        Symbol("eta") => nothing,
        Symbol("url") => nothing,
        Symbol("info") => nothing
    );
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "status", get(exchange, Symbol("status"), nothing), status);
    @test get(exchange, Symbol("timeout"), nothing) == 10000
    @test get(exchange, Symbol("verbose"), nothing) == false
    @test !functions.ccxtruthy(exchangeProp(testSharedMethods, exchange, "reloadingMarkets"))
    @test exchangeProp(testSharedMethods, exchange, "marketsLoading") == nothing
    @test get(exchange, Symbol("version"), nothing) == nothing
    @test get(exchange, Symbol("name"), nothing) == nothing
    @test get(exchange, Symbol("exceptions"), nothing) == nothing
    @test get(exchange, Symbol("timeframes"), nothing) == nothing
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "balance", get(exchange, Symbol("balance"), nothing), createSafeDictionary(exchange, true));
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "bidsasks", get(exchange, Symbol("bidsasks"), nothing), createSafeDictionary(exchange, true));
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "orderbooks", get(exchange, Symbol("orderbooks"), nothing), createSafeDictionary(exchange, true));
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "tickers", get(exchange, Symbol("tickers"), nothing), createSafeDictionary(exchange, true));
    @test get(exchange, Symbol("liquidations"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "myLiquidations") == nothing;
    @test get(exchange, Symbol("orders"), nothing) == nothing
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "trades", get(exchange, Symbol("trades"), nothing), createSafeDictionary(exchange, true));
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "transactions", get(exchange, Symbol("transactions"), nothing), createSafeDictionary(exchange));
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "ohlcvs", get(exchange, Symbol("ohlcvs"), nothing), createSafeDictionary(exchange, true));
    @test exchangeProp(testSharedMethods, exchange, "myTrades") == nothing;
    @test get(exchange, Symbol("positions"), nothing) == nothing
    @test get(exchange, Symbol("markets"), nothing) == nothing
    @test length(get(exchange, Symbol("symbols"), nothing)) == 0
    @test get(exchange, Symbol("markets_by_id"), nothing) == nothing
    @test get(exchange, Symbol("ids"), nothing) == nothing
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "currencies", get(exchange, Symbol("currencies"), nothing), Dict{Symbol, Any}());
    @test exchangeProp(testSharedMethods, exchange, "baseCurrencies") == nothing
    @test exchangeProp(testSharedMethods, exchange, "quoteCurrencies") == nothing
    @test get(exchange, Symbol("currencies_by_id"), nothing) == nothing
    @test get(exchange, Symbol("codes"), nothing) == nothing
    @test get(exchange, Symbol("accounts"), nothing) == nothing
    @test exchangeProp(testSharedMethods, exchange, "accountsById") == nothing
    assertDeepEqual(testSharedMethods, exchange, Dict{Symbol, Any}(), "commonCurrencies", exchangeProp(testSharedMethods, exchange, "commonCurrencies"), Dict{Symbol, Any}(
    Symbol("XBT") => "BTC",
    Symbol("BCHSV") => "BSV"
));
    fetchHistoryCache = getFetchCache(exchange);
    @test length(fetchHistoryCache) == 0
end


function testAfterConstructor()

    helperTestInitThrottler();
    helperTestInitSandbox();
    helperTestInitMarket();
    helperTestProperties();
end
