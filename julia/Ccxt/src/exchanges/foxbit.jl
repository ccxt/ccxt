@kwdef mutable struct Foxbit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchTradingFees::Function = fetchTradingFees
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchOHLCV::Function = fetchOHLCV
    fetchBalance::Function = fetchBalance
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransactions::Function = fetchTransactions
    fetchStatus::Function = fetchStatus
    editOrder::Function = editOrder
    withdraw::Function = withdraw
    fetchLedger::Function = fetchLedger
    parseMarket::Function = parseMarket
    parseTradingFee::Function = parseTradingFee
    parseTicker::Function = parseTicker
    parseOHLCV::Function = parseOHLCV
    parseTrade::Function = parseTrade
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    parseDepositAddress::Function = parseDepositAddress
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    v3PublicGetCurrencies::Function = v3PublicGetCurrencies
    v3PublicGetMarkets::Function = v3PublicGetMarkets
    v3PublicGetMarketsTicker24hr::Function = v3PublicGetMarketsTicker24hr
    v3PublicGetMarketsMarketOrderbook::Function = v3PublicGetMarketsMarketOrderbook
    v3PublicGetMarketsMarketCandlesticks::Function = v3PublicGetMarketsMarketCandlesticks
    v3PublicGetMarketsMarketTradesHistory::Function = v3PublicGetMarketsMarketTradesHistory
    v3PublicGetMarketsMarketTicker24hr::Function = v3PublicGetMarketsMarketTicker24hr
    v3PrivateGetAccounts::Function = v3PrivateGetAccounts
    v3PrivateGetAccountsSymbolTransactions::Function = v3PrivateGetAccountsSymbolTransactions
    v3PrivateGetOrders::Function = v3PrivateGetOrders
    v3PrivateGetOrdersByOrderIdId::Function = v3PrivateGetOrdersByOrderIdId
    v3PrivateGetTrades::Function = v3PrivateGetTrades
    v3PrivateGetDepositsAddress::Function = v3PrivateGetDepositsAddress
    v3PrivateGetDeposits::Function = v3PrivateGetDeposits
    v3PrivateGetWithdrawals::Function = v3PrivateGetWithdrawals
    v3PrivateGetMeFeesTrading::Function = v3PrivateGetMeFeesTrading
    v3PrivatePostOrders::Function = v3PrivatePostOrders
    v3PrivatePostOrdersBatch::Function = v3PrivatePostOrdersBatch
    v3PrivatePostOrdersCancelReplace::Function = v3PrivatePostOrdersCancelReplace
    v3PrivatePostWithdrawals::Function = v3PrivatePostWithdrawals
    v3PrivatePutOrdersCancel::Function = v3PrivatePutOrdersCancel
    statusPublicGetStatus::Function = statusPublicGetStatus

end
function describe(self::Foxbit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "foxbit",
    Symbol("name") => "Foxbit",
    Symbol("countries") => ["pt-BR"],
    Symbol("rateLimit") => 33.334,
    Symbol("version") => "1",
    Symbol("comment") => "Foxbit Exchange",
    Symbol("certified") => false,
    Symbol("pro") => false,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => nothing,
        Symbol("future") => nothing,
        Symbol("option") => nothing,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketSellOrder") => true,
        Symbol("createOrder") => true,
        Symbol("fecthOrderBook") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchL2OrderBook") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("loadMarkets") => true,
        Symbol("sandbox") => false,
        Symbol("withdraw") => true,
        Symbol("ws") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("2w") => "2w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/1f8faca2-ae2f-4222-b33e-5671e7d873dd",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.foxbit.com.br",
            Symbol("private") => "https://api.foxbit.com.br",
            Symbol("status") => "https://metadata-v2.foxbit.com.br/api"
        ),
        Symbol("www") => "https://app.foxbit.com.br",
        Symbol("doc") => ["https://docs.foxbit.com.br"]
    ),
    Symbol("precisionMode") => DECIMAL_PLACES,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => BadRequest,
            Symbol("429") => RateLimitExceeded,
            Symbol("404") => BadRequest,
            Symbol("500") => ExchangeError,
            Symbol("2001") => AuthenticationError,
            Symbol("2002") => AuthenticationError,
            Symbol("2003") => AuthenticationError,
            Symbol("2004") => BadRequest,
            Symbol("2005") => PermissionDenied,
            Symbol("3001") => PermissionDenied,
            Symbol("3002") => PermissionDenied,
            Symbol("3003") => AccountSuspended,
            Symbol("4001") => BadRequest,
            Symbol("4002") => InsufficientFunds,
            Symbol("4003") => InvalidOrder,
            Symbol("4004") => BadSymbol,
            Symbol("4005") => BadRequest,
            Symbol("4007") => ExchangeError,
            Symbol("4008") => InvalidOrder,
            Symbol("4009") => PermissionDenied,
            Symbol("4011") => RateLimitExceeded,
            Symbol("4012") => ExchangeError,
            Symbol("5001") => ExchangeNotAvailable,
            Symbol("5002") => OnMaintenance,
            Symbol("5003") => OnMaintenance,
            Symbol("5004") => InvalidOrder,
            Symbol("5005") => InvalidOrder,
            Symbol("5006") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v3") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencies") => 5,
                    Symbol("markets") => 5,
                    Symbol("markets/ticker/24hr") => 60,
                    Symbol("markets/{market}/orderbook") => 6,
                    Symbol("markets/{market}/candlesticks") => 12,
                    Symbol("markets/{market}/trades/history") => 12,
                    Symbol("markets/{market}/ticker/24hr") => 15
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("accounts") => 2,
                    Symbol("accounts/{symbol}/transactions") => 60,
                    Symbol("orders") => 2,
                    Symbol("orders/by-order-id/{id}") => 2,
                    Symbol("trades") => 6,
                    Symbol("deposits/address") => 10,
                    Symbol("deposits") => 10,
                    Symbol("withdrawals") => 10,
                    Symbol("me/fees/trading") => 60
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("orders") => 2,
                    Symbol("orders/batch") => 7.5,
                    Symbol("orders/cancel-replace") => 3,
                    Symbol("withdrawals") => 10
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("orders/cancel") => 2
                )
            )
        ),
        Symbol("status") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("status") => 30
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.005"),
            Symbol("maker") => self.parseNumber("0.0025")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("sandboxMode") => false,
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("algorand") => "ALGO",
            Symbol("arbitrum") => "ARBITRUM",
            Symbol("avalanchecchain") => "AVAX",
            Symbol("bitcoin") => "BTC",
            Symbol("bitcoincash") => "BCH",
            Symbol("bsc") => "BEP20",
            Symbol("cardano") => "ADA",
            Symbol("cosmos") => "ATOM",
            Symbol("dogecoin") => "DOGE",
            Symbol("erc20") => "ETH",
            Symbol("hedera") => "HBAR",
            Symbol("litecoin") => "LTC",
            Symbol("near") => "NEAR",
            Symbol("optimism") => "OPTIMISM",
            Symbol("polkadot") => "DOT",
            Symbol("polygon") => "MATIC",
            Symbol("ripple") => "XRP",
            Symbol("solana") => "SOL",
            Symbol("stacks") => "STX",
            Symbol("stellar") => "XLM",
            Symbol("tezos") => "XTZ",
            Symbol("trc20") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ALGO") => "algorand",
            Symbol("ARBITRUM") => "arbitrum",
            Symbol("AVAX") => "avalanchecchain",
            Symbol("BTC") => "bitcoin",
            Symbol("BCH") => "bitcoincash",
            Symbol("BEP20") => "bsc",
            Symbol("ADA") => "cardano",
            Symbol("ATOM") => "cosmos",
            Symbol("DOGE") => "dogecoin",
            Symbol("ETH") => "erc20",
            Symbol("HBAR") => "hedera",
            Symbol("LTC") => "litecoin",
            Symbol("NEAR") => "near",
            Symbol("OPTIMISM") => "optimism",
            Symbol("DOT") => "polkadot",
            Symbol("MATIC") => "polygon",
            Symbol("XRP") => "ripple",
            Symbol("SOL") => "solana",
            Symbol("STX") => "stacks",
            Symbol("XLM") => "stellar",
            Symbol("XTZ") => "tezos",
            Symbol("TRC20") => "trc20"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => false,
                    Symbol("index") => false
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("GTC") => true,
                    Symbol("FOK") => true,
                    Symbol("IOC") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => Dict{Symbol, Any}(
                    Symbol("expire_maker") => true,
                    Symbol("expire_taker") => true,
                    Symbol("expire_both") => true,
                    Symbol("none") => true
                ),
                Symbol("trailing") => false,
                Symbol("icebergAmount") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 5
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 10000,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1,
                Symbol("daysBack") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => 90,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        )
    )
))

end
function fetchCurrencies(self::Foxbit, params=Dict())
    response = Base.fetch(self.v3PublicGetCurrencies(params));
    data = self.safeList(response, "data", []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Foxbit, rawCurrency)
    precision = safeInteger(rawCurrency, "precision");
    currencyId = safeString(rawCurrency, "symbol");
    name = safeString(rawCurrency, "name");
    code = self.safeCurrencyCode(currencyId);
    depositInfo = self.safeDict(rawCurrency, "deposit_info");
    withdrawInfo = self.safeDict(rawCurrency, "withdraw_info");
    networks = self.safeList(rawCurrency, "networks", []);
    type_var = safeStringLower(rawCurrency, "type");
    parsedNetworks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networks)))
        network = get(networks, j + 1, nothing);
        networkId = safeString(network, "code");
        networkCode = self.networkIdToCode(networkId, code);
        networkWithdrawInfo = self.safeDict(network, "withdraw_info");
        networkDepositInfo = self.safeDict(network, "deposit_info");
        isWithdrawEnabled = safeString(networkWithdrawInfo, "status") == "ENABLED";
        isDepositEnabled = safeString(networkDepositInfo, "status") == "ENABLED";
        parsedNetworks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => rawCurrency,
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("name") => safeString(network, "name"),
            Symbol("deposit") => isDepositEnabled,
            Symbol("withdraw") => isWithdrawEnabled,
            Symbol("active") => true,
            Symbol("precision") => precision,
            Symbol("fee") => self.safeNumber(networkWithdrawInfo, "fee"),
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("amount") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(depositInfo, "min_amount"),
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(withdrawInfo, "min_amount"),
                    Symbol("max") => nothing
                )
            )
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => name,
    Symbol("active") => true,
    Symbol("type") => type_var,
    Symbol("deposit") => self.safeBool(depositInfo, "enabled", false),
    Symbol("withdraw") => self.safeBool(withdrawInfo, "enabled", false),
    Symbol("fee") => self.safeNumber(withdrawInfo, "fee"),
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(depositInfo, "min_amount"),
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(withdrawInfo, "min_amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => parsedNetworks
))

end
function fetchMarkets(self::Foxbit, params=Dict())
    response = Base.fetch(self.v3PublicGetMarkets(params));
    markets = self.safeList(response, "data", []);
    return self.parseMarkets(markets)

end
function fetchTicker(self::Foxbit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v3PublicGetMarketsMarketTicker24hr(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(result, market)

end
function fetchTickers(self::Foxbit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.v3PublicGetMarketsTicker24hr(params));
    data = self.safeList(response, "data", []);
    return self.parseTickers(data, symbols)

end
function fetchTradingFees(self::Foxbit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetMeFeesTrading(params));
    data = self.safeList(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "market_symbol");
        market = self.safeMarket(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTradingFee(entry, market);
        i += 1
    end
    return result

end
function fetchOrderBook(self::Foxbit, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    defaultLimit = 20;
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("depth") => functions.ccxtruthy((limit == nothing)) ? defaultLimit : limit
    );
    response = Base.fetch(self.v3PublicGetMarketsMarketOrderbook(extend(request, params)));
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, symbol, timestamp)

end
function fetchTrades(self::Foxbit, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 200))
            request[Symbol("page_size")] = 200;
        end
    end
    response = Base.fetch(self.v3PublicGetMarketsMarketTradesHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchOHLCV(self::Foxbit, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    interval = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 500))
            request[Symbol("limit")] = 500;
        end
    end
    response = Base.fetch(self.v3PublicGetMarketsMarketCandlesticks(extend(request, params)));
    return self.parseOHLCVs(response, market, interval, since, limit)

end
function fetchBalance(self::Foxbit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetAccounts(params));
    accounts = self.safeList(response, "data", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        account = get(accounts, i + 1, nothing);
        currencyId = safeString(account, "currency_symbol");
        currencyCode = self.safeCurrencyCode(currencyId);
        total = safeString(account, "balance");
        used = safeString(account, "balance_locked");
        free = safeString(account, "balance_available");
        balanceObj = Dict{Symbol, Any}(
            Symbol("free") => free,
            Symbol("used") => used,
            Symbol("total") => total
        );
        result[Symbol(currencyCode)] = balanceObj;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchOpenOrders(self::Foxbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("ACTIVE", symbol, since, limit, params))

end
function fetchClosedOrders(self::Foxbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("FILLED", symbol, since, limit, params))

end
function fetchCanceledOrders(self::Foxbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("CANCELED", symbol, since, limit, params))

end
function fetchOrdersByStatus(self::Foxbit, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("state") => status
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market_symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    response = Base.fetch(self.v3PrivateGetOrders(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function createOrder(self::Foxbit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = uppercase(type_var);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(type_var != "LIMIT", type_var != "MARKET"), type_var != "STOP_MARKET"), type_var != "STOP_LIMIT"), type_var != "INSTANT"))
        throw(InvalidOrder(string("Invalid order type: ", type_var, ". Must be one of: limit, market, stop_market, stop_limit, instant.")));
    end
    timeInForce = safeStringUpper(params, "timeInForce");
    postOnly = self.safeBool(params, "postOnly", false);
    triggerPrice = self.safeNumber(params, "triggerPrice");
    request = Dict{Symbol, Any}(
        Symbol("market_symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("type") => type_var
    );
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "STOP_MARKET", type_var == "STOP_LIMIT"))
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(InvalidOrder(string("Invalid order type: ", type_var, ". Must have triggerPrice.")));
        end
    end
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(timeInForce == "PO")
            request[Symbol("post_only")] = true;
        else
            request[Symbol("time_in_force")] = timeInForce;
        end
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("post_only")] = true;
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
    end
    if functions.ccxtruthy(type_var == "INSTANT")
        request[Symbol("amount")] = self.priceToPrecision(symbol, amount);
    else
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "LIMIT", type_var == "STOP_LIMIT"))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
    end
    params = omit(params, ["timeInForce", "postOnly", "triggerPrice", "clientOrderId"]);
    response = Base.fetch(self.v3PrivatePostOrders(extend(request, params)));
    return self.parseOrder(response, market)

end
function createOrders(self::Foxbit, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = self.safeDict(orders, i);
        symbol = safeString(order, "symbol");
        market = self.market(symbol);
        type_var = safeStringUpper(order, "type");
        orderParams = self.safeDict(order, "params", Dict{Symbol, Any}());
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(type_var != "LIMIT", type_var != "MARKET"), type_var != "STOP_MARKET"), type_var != "STOP_LIMIT"), type_var != "INSTANT"))
            throw(InvalidOrder(string("Invalid order type: ", type_var, ". Must be one of: limit, market, stop_market, stop_limit, instant.")));
        end
        timeInForce = safeStringUpper(orderParams, "timeInForce");
        postOnly = self.safeBool(orderParams, "postOnly", false);
        triggerPrice = self.safeNumber(orderParams, "triggerPrice");
        request = Dict{Symbol, Any}(
            Symbol("market_symbol") => get(market, Symbol("id"), nothing),
            Symbol("side") => safeStringUpper(order, "side"),
            Symbol("type") => type_var
        );
        if functions.ccxtruthy(@functions.ccxt_or(type_var == "STOP_MARKET", type_var == "STOP_LIMIT"))
            if functions.ccxtruthy(triggerPrice == nothing)
                throw(InvalidOrder(string("Invalid order type: ", type_var, ". Must have triggerPrice.")));
            end
        end
        if functions.ccxtruthy(timeInForce != nothing)
            if functions.ccxtruthy(timeInForce == "PO")
                request[Symbol("post_only")] = true;
            else
                request[Symbol("time_in_force")] = timeInForce;
            end

        end
        if functions.ccxtruthy(postOnly)
            request[Symbol("post_only")] = true;

        end
        if functions.ccxtruthy(triggerPrice != nothing)
            request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);

        end
        if functions.ccxtruthy(type_var == "INSTANT")
            request[Symbol("amount")] = self.priceToPrecision(symbol, safeString(order, "amount"));
        else
            request[Symbol("quantity")] = self.amountToPrecision(symbol, safeString(order, "amount"));
        end
        if functions.ccxtruthy(@functions.ccxt_or(type_var == "LIMIT", type_var == "STOP_LIMIT"))
            request[Symbol("price")] = self.priceToPrecision(symbol, safeString(order, "price"));
        end
        push!(ordersRequests, extend(request, orderParams));
        i += 1
    end
    createOrdersRequest = Dict{Symbol, Any}(
        Symbol("data") => ordersRequests
    );
    response = Base.fetch(self.v3PrivatePostOrdersBatch(extend(createOrdersRequest, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function cancelOrder(self::Foxbit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => self.parseNumber(id),
        Symbol("type") => "ID"
    );
    response = Base.fetch(self.v3PrivatePutOrdersCancel(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function cancelAllOrders(self::Foxbit, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "ALL"
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("type")] = "MARKET";
        request[Symbol("market_symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v3PrivatePutOrdersCancel(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrder(self::Foxbit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.v3PrivateGetOrdersByOrderIdId(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOrders(self::Foxbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market_symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    response = Base.fetch(self.v3PrivateGetOrders(extend(request, params)));
    list = self.safeList(response, "data", []);
    return self.parseOrders(list, market, since, limit)

end
function fetchMyTrades(self::Foxbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    response = Base.fetch(self.v3PrivateGetTrades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchDepositAddress(self::Foxbit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency_symbol") => get(currency, Symbol("id"), nothing)
    );
    (networkCode, paramsOmited) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network_code")] = self.networkCodeToId(networkCode, code);
    end
    response = Base.fetch(self.v3PrivateGetDepositsAddress(extend(request, paramsOmited)));
    return self.parseDepositAddress(response, currency)

end
function fetchDeposits(self::Foxbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    response = Base.fetch(self.v3PrivateGetDeposits(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawals(self::Foxbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    response = Base.fetch(self.v3PrivateGetWithdrawals(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchTransactions(self::Foxbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    withdrawals = Base.fetch(self.fetchWithdrawals(code, since, limit, params));
    deposits = Base.fetch(self.fetchDeposits(code, since, limit, params));
    allTransactions = arrayConcat(withdrawals, deposits);
    result = sortBy(allTransactions, "timestamp");
    return result

end
function fetchStatus(self::Foxbit, params=Dict())
    response = Base.fetch(self.statusPublicGetStatus(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    attributes = self.safeDict(data, "attributes", Dict{Symbol, Any}());
    statusRaw = safeString(attributes, "status");
    statusMap = Dict{Symbol, Any}(
        Symbol("NORMAL") => "ok",
        Symbol("UNDER_MAINTENANCE") => "maintenance"
    );
    return Dict{Symbol, Any}(
    Symbol("status") => safeString(statusMap, statusRaw, statusRaw),
    Symbol("updated") => safeString(attributes, "updatedAt"),
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function editOrder(self::Foxbit, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a symbol argument")));
    end
    type_var = uppercase(type_var);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(type_var != "LIMIT", type_var != "MARKET"), type_var != "STOP_MARKET"), type_var != "INSTANT"))
        throw(InvalidOrder(string("Invalid order type: ", type_var, ". Must be one of: LIMIT, MARKET, STOP_MARKET, INSTANT.")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("mode") => "ALLOW_FAILURE",
        Symbol("cancel") => Dict{Symbol, Any}(
            Symbol("type") => "ID",
            Symbol("id") => self.parseNumber(id)
        ),
        Symbol("create") => Dict{Symbol, Any}(
            Symbol("type") => type_var,
            Symbol("side") => uppercase(side),
            Symbol("market_symbol") => get(market, Symbol("id"), nothing)
        )
    );
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "LIMIT", type_var == "MARKET"))
        request[Symbol("create")][Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        if functions.ccxtruthy(type_var == "LIMIT")
            request[Symbol("create")][Symbol("price")] = self.priceToPrecision(symbol, price);
        end
    end
    if functions.ccxtruthy(type_var == "STOP_MARKET")
        request[Symbol("create")][Symbol("stop_price")] = self.priceToPrecision(symbol, price);
        request[Symbol("create")][Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(type_var == "INSTANT")
        request[Symbol("create")][Symbol("amount")] = self.priceToPrecision(symbol, amount);
    end
    response = Base.fetch(self.v3PrivatePostOrdersCancelReplace(extend(request, params)));
    return self.parseOrder(get(response, Symbol("create"), nothing), market)

end
function withdraw(self::Foxbit, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency_symbol") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount),
        Symbol("destination_address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("destination_tag")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network_code")] = self.networkCodeToId(networkCode, code);
    end
    response = Base.fetch(self.v3PrivatePostWithdrawals(extend(request, params)));
    return self.parseTransaction(response)

end
function fetchLedger(self::Foxbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLedger() requires a code argument")));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            request[Symbol("page_size")] = 100;
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = self.iso8601(since);
    end
    currency = self.currency(code);
    request[Symbol("symbol")] = get(currency, Symbol("id"), nothing);
    response = Base.fetch(self.v3PrivateGetAccountsSymbolTransactions(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseLedger(data, currency, since, limit)

end
function parseMarket(self::Foxbit, market)
    id = safeString(market, "symbol");
    baseAssets = self.safeDict(market, "base");
    baseId = safeString(baseAssets, "symbol");
    quoteAssets = self.safeDict(market, "quote");
    quoteId = safeString(quoteAssets, "symbol");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    fees = self.safeDict(market, "default_fees");
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("active") => true,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("future") => false,
    Symbol("swap") => false,
    Symbol("option") => false,
    Symbol("contract") => false,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("taker") => self.safeNumber(fees, "taker"),
    Symbol("maker") => self.safeNumber(fees, "maker"),
    Symbol("percentage") => true,
    Symbol("tierBased") => false,
    Symbol("feeSide") => "get",
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => safeInteger(quoteAssets, "precision"),
        Symbol("amount") => safeInteger(baseAssets, "precision"),
        Symbol("cost") => safeInteger(quoteAssets, "precision")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quantity_min"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "price_min"),
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => market
))

end
function parseTradingFee(self::Foxbit, entry, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("maker") => self.safeNumber(entry, "maker"),
    Symbol("taker") => self.safeNumber(entry, "taker"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function parseTicker(self::Foxbit, ticker, market=nothing)
    marketId = safeString(ticker, "market_symbol");
    symbol = self.safeSymbol(marketId, market, nothing, "spot");
    rolling_24h = get(ticker, Symbol("rolling_24h"), nothing);
    best = self.safeDict(ticker, "best");
    bestAsk = self.safeDict(best, "ask");
    bestBid = self.safeDict(best, "bid");
    lastTrade = get(ticker, Symbol("last_trade"), nothing);
    lastPrice = safeString(lastTrade, "price");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => self.parseDate(safeString(lastTrade, "date")),
    Symbol("datetime") => self.iso8601(self.parseDate(safeString(lastTrade, "date"))),
    Symbol("high") => self.safeNumber(rolling_24h, "high"),
    Symbol("low") => self.safeNumber(rolling_24h, "low"),
    Symbol("bid") => self.safeNumber(bestBid, "price"),
    Symbol("bidVolume") => self.safeNumber(bestBid, "volume"),
    Symbol("ask") => self.safeNumber(bestAsk, "price"),
    Symbol("askVolume") => self.safeNumber(bestAsk, "volume"),
    Symbol("vwap") => nothing,
    Symbol("open") => self.safeNumber(rolling_24h, "open"),
    Symbol("close") => lastPrice,
    Symbol("last") => lastPrice,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(rolling_24h, "price_change"),
    Symbol("percentage") => safeString(rolling_24h, "price_change_percent"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(rolling_24h, "volume"),
    Symbol("quoteVolume") => safeString(rolling_24h, "quote_volume"),
    Symbol("info") => ticker
), market)

end
function parseOHLCV(self::Foxbit, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 6)]

end
function parseTrade(self::Foxbit, trade, market=nothing)
    timestamp = self.parseDate(safeString(trade, "created_at"));
    price = safeString(trade, "price");
    amount = safeString(trade, "volume", safeString(trade, "quantity"));
    privateSideField = safeStringLower(trade, "side");
    side = safeStringLower(trade, "taker_side", privateSideField);
    cost = stringMul(price, amount);
    fee = Dict{Symbol, Any}(
        Symbol("currency") => self.safeSymbol(safeString(trade, "fee_currency_symbol")),
        Symbol("cost") => self.safeNumber(trade, "fee"),
        Symbol("rate") => nothing
    );
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString(trade, "id"),
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("order") => nothing,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market)

end
function parseOrderStatus(self::Foxbit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PARTIALLY_CANCELED") => "open",
        Symbol("ACTIVE") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("PENDING_CANCEL") => "canceled",
        Symbol("CANCELED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Foxbit, order, market=nothing)
    symbol = safeString(order, "market_symbol");
    if functions.ccxtruthy(@functions.ccxt_and(market == nothing, symbol != nothing))
        market = self.market(symbol);
    end
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    end
    timestamp = self.parseDate(safeString(order, "created_at"));
    price = safeString(order, "price");
    filled = safeString(order, "quantity_executed");
    remaining = safeString(order, "quantity");
    amount = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(remaining != nothing, filled != nothing))
        amount = stringAdd(remaining, filled);
    end
    cost = safeString(order, "funds_received");
    if functions.ccxtruthy(!functions.ccxtruthy(cost))
        priceAverage = safeString(order, "price_avg");
        priceToCalculate = safeString(order, "price", priceAverage);
        cost = stringMul(priceToCalculate, amount);
    end
    side = safeStringLower(order, "side");
    feeCurrency = safeStringUpper(market, "quoteId");
    if functions.ccxtruthy(side == "buy")
        feeCurrency = safeStringUpper(market, "baseId");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "id"),
    Symbol("info") => order,
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => self.parseOrderStatus(safeString(order, "state")),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => safeString(order, "type"),
    Symbol("timeInForce") => safeString(order, "time_in_force"),
    Symbol("postOnly") => self.safeBool(order, "post_only"),
    Symbol("reduceOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => self.parseNumber(price),
    Symbol("triggerPrice") => self.safeNumber(order, "stop_price"),
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("cost") => self.parseNumber(cost),
    Symbol("average") => self.safeNumber(order, "price_avg"),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("filled") => self.parseNumber(filled),
    Symbol("remaining") => self.parseNumber(remaining),
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => feeCurrency,
        Symbol("cost") => self.safeNumber(order, "fee_paid")
    )
))

end
function parseDepositAddress(self::Foxbit, depositAddress, currency=nothing)
    network = self.safeDict(depositAddress, "network");
    networkId = safeString(network, "code");
    currencyCode = self.safeCurrencyCode(nothing, currency);
    unifiedNetwork = self.networkIdToCode(networkId, currencyCode);
    return Dict{Symbol, Any}(
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "tag"),
    Symbol("currency") => currencyCode,
    Symbol("network") => unifiedNetwork,
    Symbol("info") => depositAddress
)

end
function parseTransactionStatus(self::Foxbit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUBMITTING") => "pending",
        Symbol("SUBMITTED") => "pending",
        Symbol("REJECTED") => "failed",
        Symbol("CANCELLED") => "canceled",
        Symbol("ACCEPTED") => "ok",
        Symbol("WARNING") => "pending",
        Symbol("UNBLOCKED") => "pending",
        Symbol("BLOCKED") => "pending",
        Symbol("PROCESSING") => "pending",
        Symbol("CANCELED") => "canceled",
        Symbol("FAILED") => "failed",
        Symbol("DONE") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Foxbit, transaction, currency=nothing, since=nothing, limit=nothing)
    cryptoDetails = self.safeDict(transaction, "details_crypto");
    address = safeString2(cryptoDetails, "receiving_address", "destination_address");
    sn = safeString(transaction, "sn");
    type_var = "withdrawal";
    if functions.ccxtruthy(@functions.ccxt_and(sn != nothing, get(sn, 1, nothing) == "D"))
        type_var = "deposit";
    end
    fee = safeString(transaction, "fee", "0");
    amount = safeString(transaction, "amount");
    currencySymbol = safeString(transaction, "currency_symbol");
    actualAmount = amount;
    currencyCode = self.safeCurrencyCode(currencySymbol);
    status = self.parseTransactionStatus(safeString(transaction, "state"));
    created_at = safeString(transaction, "created_at");
    timestamp = self.parseDate(created_at);
    datetime = self.iso8601(timestamp);
    if functions.ccxtruthy(@functions.ccxt_and(fee != nothing, amount != nothing))
        actualAmount = stringSub(amount, fee);
    end
    feeRate = stringDiv(fee, actualAmount);
    feeObj = Dict{Symbol, Any}(
        Symbol("cost") => self.parseNumber(fee),
        Symbol("currency") => currencyCode,
        Symbol("rate") => self.parseNumber(feeRate)
    );
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "sn"),
    Symbol("txid") => safeString(cryptoDetails, "transaction_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("network") => safeString(transaction, "network_code"),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => safeString(transaction, "destination_tag"),
    Symbol("tagTo") => safeString(transaction, "destination_tag"),
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("currency") => currencyCode,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("fee") => feeObj,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function parseLedgerEntryType(self::Foxbit, type_var)
    types = Dict{Symbol, Any}(
        Symbol("DEPOSITING") => "transaction",
        Symbol("WITHDRAWING") => "transaction",
        Symbol("TRADING") => "trade",
        Symbol("INTERNAL_TRANSFERING") => "transfer",
        Symbol("OTHERS") => "transaction"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Foxbit, item, currency=nothing)
    id = safeString(item, "uuid");
    createdAt = safeString(item, "created_at");
    timestamp = self.parse8601(createdAt);
    reasonType = safeString(item, "reason_type");
    type_var = self.parseLedgerEntryType(reasonType);
    exchangeSymbol = safeString(item, "currency_symbol");
    currencySymbol = self.safeCurrencyCode(exchangeSymbol);
    direction = "in";
    amount = self.safeNumber(item, "amount");
    realAmount = amount;
    balance = self.safeNumber(item, "balance");
    fee = Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(item, "fee"),
        Symbol("currency") => currencySymbol
    );
    if functions.ccxtruthy(functions.ccxt_lt(amount, 0))
        direction = "out";
        realAmount = amount * -1;
    end
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => item,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => currencySymbol,
    Symbol("amount") => realAmount,
    Symbol("before") => balance - amount,
    Symbol("after") => balance,
    Symbol("status") => "ok",
    Symbol("fee") => fee
)

end
function sign(self::Foxbit, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    version = get(api, 1, nothing);
    urlPath = get(api, 2, nothing);
    fullPath = string("/rest/", version, "/", self.implodeParams(path, params));
    if functions.ccxtruthy(version == "status")
        fullPath = "/status";
        urlPath = "status";
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(urlPath), nothing), fullPath);
    params = omit(params, self.extractParams(path));
    timestamp = milliseconds();
    query = "";
    signatureQuery = "";
    if functions.ccxtruthy(method == "GET")
        paramKeys = objectKeys(params);
        paramKeysLength = length(paramKeys);
        if functions.ccxtruthy(functions.ccxt_gt(paramKeysLength, 0))
            query = self.urlencode(params);
            url += string("?", query);
        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(paramKeys)))
            key = get(paramKeys, i + 1, nothing);
            value = safeString(params, key);
            if functions.ccxtruthy(value != nothing)
                signatureQuery += string(key, "=", value);
            end
            if functions.ccxtruthy(functions.ccxt_lt(i, paramKeysLength - 1))
                signatureQuery += "&";
            end
            i += 1
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or(method == "POST", method == "PUT"))
        body = json(params);
    end
    bodyToSignature = "";
    if functions.ccxtruthy(body != nothing)
        bodyToSignature = body;
    end
    headers = Dict{Symbol, Any}(
        Symbol("Content-Type") => "application/json"
    );
    if functions.ccxtruthy(urlPath == "private")
        self.checkRequiredCredentials();
        preHash = string(numberToString(timestamp), method, fullPath, signatureQuery, bodyToSignature);
        signature = self.hmac(self.encode(preHash), self.encode(self.secret), sha256, "hex");
        headers[Symbol("X-FB-ACCESS-KEY")] = self.apiKey;
        headers[Symbol("X-FB-ACCESS-TIMESTAMP")] = numberToString(timestamp);
        headers[Symbol("X-FB-ACCESS-SIGNATURE")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Foxbit, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = self.safeDict(response, "error");
    code = safeString(error, "code");
    details = self.safeList(error, "details");
    message = safeString(error, "message");
    detailsString = "";
    if functions.ccxtruthy(details)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
            detailsString = string(detailsString, get(details, i + 1, nothing), " ");
            i += 1
        end

    end
    if functions.ccxtruthy(error != nothing)
        feedback = string(self.id, " ", message, " details: ", detailsString);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), detailsString, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Foxbit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v3PublicGetCurrencies(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "currencies", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v3PublicGetMarkets(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v3PublicGetMarketsTicker24hr(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets/ticker/24hr", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v3PublicGetMarketsMarketOrderbook(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets/{market}/orderbook", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v3PublicGetMarketsMarketCandlesticks(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets/{market}/candlesticks", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function v3PublicGetMarketsMarketTradesHistory(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets/{market}/trades/history", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function v3PublicGetMarketsMarketTicker24hr(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "markets/{market}/ticker/24hr", ["v3", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 15))
end

function v3PrivateGetAccounts(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "accounts", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function v3PrivateGetAccountsSymbolTransactions(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "accounts/{symbol}/transactions", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v3PrivateGetOrders(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function v3PrivateGetOrdersByOrderIdId(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders/by-order-id/{id}", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function v3PrivateGetTrades(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "trades", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v3PrivateGetDepositsAddress(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "deposits/address", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v3PrivateGetDeposits(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "deposits", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v3PrivateGetWithdrawals(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "withdrawals", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v3PrivateGetMeFeesTrading(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "me/fees/trading", ["v3", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v3PrivatePostOrders(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders", ["v3", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function v3PrivatePostOrdersBatch(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders/batch", ["v3", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function v3PrivatePostOrdersCancelReplace(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders/cancel-replace", ["v3", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function v3PrivatePostWithdrawals(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "withdrawals", ["v3", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v3PrivatePutOrdersCancel(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "orders/cancel", ["v3", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function statusPublicGetStatus(self::Foxbit, params=Dict(), context=Dict())
    return request(self, "status", ["status", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function Foxbit(; kwargs...)
    inst = Foxbit(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchTicker, fetchTickers, fetchTradingFees, fetchOrderBook, fetchTrades, fetchOHLCV, fetchBalance, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByStatus, createOrder, createOrders, cancelOrder, cancelAllOrders, fetchOrder, fetchOrders, fetchMyTrades, fetchDepositAddress, fetchDeposits, fetchWithdrawals, fetchTransactions, fetchStatus, editOrder, withdraw, fetchLedger, parseMarket, parseTradingFee, parseTicker, parseOHLCV, parseTrade, parseOrderStatus, parseOrder, parseDepositAddress, parseTransactionStatus, parseTransaction, parseLedgerEntryType, parseLedgerEntry, sign, handleErrors, v3PublicGetCurrencies, v3PublicGetMarkets, v3PublicGetMarketsTicker24hr, v3PublicGetMarketsMarketOrderbook, v3PublicGetMarketsMarketCandlesticks, v3PublicGetMarketsMarketTradesHistory, v3PublicGetMarketsMarketTicker24hr, v3PrivateGetAccounts, v3PrivateGetAccountsSymbolTransactions, v3PrivateGetOrders, v3PrivateGetOrdersByOrderIdId, v3PrivateGetTrades, v3PrivateGetDepositsAddress, v3PrivateGetDeposits, v3PrivateGetWithdrawals, v3PrivateGetMeFeesTrading, v3PrivatePostOrders, v3PrivatePostOrdersBatch, v3PrivatePostOrdersCancelReplace, v3PrivatePostWithdrawals, v3PrivatePutOrdersCancel, statusPublicGetStatus)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
