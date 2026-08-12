@kwdef mutable struct Hibachi <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    getAccountId::Function = getAccountId
    parseMarket::Function = parseMarket
    fetchMarkets::Function = fetchMarkets
    hardcodedCurrencies::Function = hardcodedCurrencies
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseTicker::Function = parseTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTicker::Function = fetchTicker
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchTradingFees::Function = fetchTradingFees
    orderMessage::Function = orderMessage
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    editOrderRequest::Function = editOrderRequest
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    cancelOrderRequest::Function = cancelOrderRequest
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    encodeWithdrawMessage::Function = encodeWithdrawMessage
    withdraw::Function = withdraw
    nonce::Function = nonce
    signMessage::Function = signMessage
    fetchOrderBook::Function = fetchOrderBook
    fetchMyTrades::Function = fetchMyTrades
    parseOHLCV::Function = parseOHLCV
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOHLCV::Function = fetchOHLCV
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    sign::Function = sign
    handleErrors::Function = handleErrors
    parseTransactionType::Function = parseTransactionType
    parseTransactionStatus::Function = parseTransactionStatus
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchDepositAddress::Function = fetchDepositAddress
    parseTransaction::Function = parseTransaction
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchMySettlementHistory::Function = fetchMySettlementHistory
    fetchTime::Function = fetchTime
    fetchOpenInterest::Function = fetchOpenInterest
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory

# Generated REST endpoint fields
    publicGetMarketExchangeInfo::Function = publicGetMarketExchangeInfo
    publicGetMarketInventory::Function = publicGetMarketInventory
    publicGetMarketDataPrices::Function = publicGetMarketDataPrices
    publicGetMarketDataStats::Function = publicGetMarketDataStats
    publicGetMarketDataTrades::Function = publicGetMarketDataTrades
    publicGetMarketDataKlines::Function = publicGetMarketDataKlines
    publicGetMarketDataOpenInterest::Function = publicGetMarketDataOpenInterest
    publicGetMarketDataOrderbook::Function = publicGetMarketDataOrderbook
    publicGetMarketDataFundingRates::Function = publicGetMarketDataFundingRates
    publicGetExchangeUtcTimestamp::Function = publicGetExchangeUtcTimestamp
    privateGetCapitalBalance::Function = privateGetCapitalBalance
    privateGetCapitalHistory::Function = privateGetCapitalHistory
    privateGetCapitalDepositInfo::Function = privateGetCapitalDepositInfo
    privateGetTradeAccountInfo::Function = privateGetTradeAccountInfo
    privateGetTradeAccountTrades::Function = privateGetTradeAccountTrades
    privateGetTradeAccountTradingHistory::Function = privateGetTradeAccountTradingHistory
    privateGetTradeAccountSettlementsHistory::Function = privateGetTradeAccountSettlementsHistory
    privateGetTradeOrders::Function = privateGetTradeOrders
    privateGetTradeOrder::Function = privateGetTradeOrder
    privateGetTradeOrdersHistory::Function = privateGetTradeOrdersHistory
    privatePutTradeOrder::Function = privatePutTradeOrder
    privateDeleteTradeOrder::Function = privateDeleteTradeOrder
    privateDeleteTradeOrders::Function = privateDeleteTradeOrders
    privatePostTradeOrder::Function = privatePostTradeOrder
    privatePostTradeOrders::Function = privatePostTradeOrders
    privatePostCapitalWithdraw::Function = privatePostCapitalWithdraw
    privatePostCapitalTransfer::Function = privatePostCapitalTransfer
    privatePostTradeAccountLeverage::Function = privatePostTradeAccountLeverage

end
function describe(self::Hibachi, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "hibachi",
    Symbol("name") => "Hibachi",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 100,
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome"), nothing),
    Symbol("certified") => false,
    Symbol("pro") => false,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMySettlementHistory") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrdersByStatus") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/f267bf5b-5c6c-45e2-9ce4-fb0af8a9d9ab",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://data-api.hibachi.xyz",
            Symbol("private") => "https://api.hibachi.xyz"
        ),
        Symbol("www") => "https://www.hibachi.xyz/",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://hibachi.xyz/r/ZBL2YFWIHU"
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/exchange-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/inventory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/data/funding-rates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchange/utc-timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("capital/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/account/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/account/trading_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/account/settlements_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => false,
        Symbol("accountId") => true,
        Symbol("privateKey") => true
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.00015"),
            Symbol("taker") => self.parseNumber("0.00045")
        )
    ),
    Symbol("currencies") => self.hardcodedCurrencies(),
    Symbol("options") => Dict{Symbol, Any}(),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => nothing
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("2") => BadRequest,
            Symbol("3") => OrderNotFound,
            Symbol("4") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function getAccountId(self::Hibachi, )
    self.checkRequiredCredentials();
    id = self.parseToInt(self.accountId);
    return id

end
function parseMarket(self::Hibachi, market)
    marketId = safeString(market, "symbol");
    numericId = self.safeNumber(market, "id");
    marketType = "swap";
    baseId = safeString(market, "underlyingSymbol");
    quoteId = safeString(market, "settlementSymbol");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = safeString(market, "settlementSymbol");
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    created = safeIntegerProduct(market, "marketCreationTimestamp", 1000);
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("numericId") => numericId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => marketType,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => safeString(market, "status") == "LIVE",
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "underlyingDecimals"))),
        Symbol("price") => self.parseNumber(safeValue(self.safeList(market, "orderbookGranularities", defaultValue = []), 0)) / 10000
    ),
    Symbol("limits") => Dict{Symbol, Any}(
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
            Symbol("min") => self.safeNumber(market, "minNotional"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => created,
    Symbol("info") => market
))

end
"""
retrieves data on all markets for hibachi
see: https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Hibachi; params=Dict())
    response = Base.fetch(self.publicGetMarketExchangeInfo(params));
    rows = self.safeList(response, "futureContracts");
    return self.parseMarkets(rows)

end
function hardcodedCurrencies(self::Hibachi, )
    result = Dict{Symbol, Any}();
    networks = Dict{Symbol, Any}();
    networkId = "ARBITRUM";
    networks[Symbol(networkId)] = Dict{Symbol, Any}(
        Symbol("id") => networkId,
        Symbol("network") => networkId,
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            )
        ),
        Symbol("active") => nothing,
        Symbol("deposit") => nothing,
        Symbol("withdraw") => nothing,
        Symbol("info") => Dict{Symbol, Any}()
    );
    code = self.safeCurrencyCode("USDT");
    if functions.ccxtruthy(code != nothing)
        result[Symbol(code)] = self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "USDT",
    Symbol("name") => "USDT",
    Symbol("type") => "fiat",
    Symbol("code") => code,
    Symbol("precision") => self.parseNumber("0.000001"),
    Symbol("active") => true,
    Symbol("fee") => nothing,
    Symbol("networks") => networks,
    Symbol("deposit") => true,
    Symbol("withdraw") => true,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => Dict{Symbol, Any}()
));
    end
    return result

end
function parseBalance(self::Hibachi, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    code = self.safeCurrencyCode("USDT");
    account = self.account();
    account[Symbol("total")] = safeString(response, "balance");
    account[Symbol("free")] = safeString(response, "maximalWithdraw");
    if functions.ccxtruthy(code != nothing)
        result[Symbol(code)] = account;
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Hibachi; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeAccountInfo(extend(request, params)));
    return self.parseBalance(response)

end
function parseTicker(self::Hibachi, ticker; market=nothing)
    prices = self.safeDict(ticker, "prices");
    stats = self.safeDict(ticker, "stats");
    bid = self.safeNumber(prices, "bidPrice");
    ask = self.safeNumber(prices, "askPrice");
    last_var = self.safeNumber(prices, "tradePrice");
    high = self.safeNumber(stats, "high24h");
    low = self.safeNumber(stats, "low24h");
    volume = self.safeNumber(stats, "volume24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("bid") => bid,
    Symbol("ask") => ask,
    Symbol("last") => last_var,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bidVolume") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => volume,
    Symbol("info") => ticker
), market = market)

end
function parseTrade(self::Hibachi, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    id = safeString(trade, "id");
    price = safeString(trade, "price");
    amount = safeString(trade, "quantity");
    timestamp = safeIntegerProduct(trade, "timestamp", 1000);
    cost = stringMul(price, amount);
    side = nothing;
    fee = nothing;
    orderType = nothing;
    orderId = nothing;
    takerOrMaker = nothing;
    if functions.ccxtruthy(id == nothing)
        side = safeStringLower(trade, "takerSide");
        takerOrMaker = "taker";
    else
        side = safeStringLower(trade, "side");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => safeString(trade, "fee"),
            Symbol("currency") => "USDT"
        );
        orderType = safeStringLower(trade, "orderType");
        if functions.ccxtruthy(side == "buy")
            orderId = safeString(trade, "bidOrderId");
        else
            orderId = safeString(trade, "askOrderId");
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("order") => orderId,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("type") => orderType,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (maximum value is 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of recent [trade structures]
"""
function fetchTrades(self::Hibachi, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketDataTrades(extend(request, params)));
    trades = self.safeList(response, "trades", defaultValue = []);
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market)

end
"""
fetches a price ticker and the related information for the past 24h
see: https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e
see: https://api-doc.hibachi.xyz/#0064ca53-a2d0-41b9-8ade-6b2abf4ccb12

# Arguments
- `symbol`::string: unified symbol of the market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Hibachi, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    rawPromises = [self.publicGetMarketDataPrices(extend(request, params)), self.publicGetMarketDataStats(extend(request, params))];
    promises = Base.fetch(asyncmap(Base.fetch, rawPromises));
    pricesResponse = get(promises, 1, nothing);
    statsResponse = get(promises, 2, nothing);
    ticker = Dict{Symbol, Any}(
        Symbol("prices") => pricesResponse,
        Symbol("stats") => statsResponse
    );
    return self.parseTicker(ticker, market = market)

end
function parseOrderStatus(self::Hibachi, status)
    uppercaseStatus = functions.ccxtruthy((status == nothing)) ? nothing : uppercase(status);
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "open",
        Symbol("CHILD_PENDING") => "open",
        Symbol("SCHEDULED_TWAP") => "open",
        Symbol("PLACED") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("PARTIAL_CANCELLED") => "canceled",
        Symbol("REJECTED") => "rejected"
    );
    return safeString(statuses, uppercaseStatus, status)

end
function parseOrder(self::Hibachi, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    status = safeString(order, "status");
    type_var = safeStringLower(order, "orderType");
    price = safeString2(order, "price", "avgFillPrice");
    rawSide = safeString(order, "side");
    side = nothing;
    if functions.ccxtruthy(rawSide == "BID")
        side = "buy";
    elseif functions.ccxtruthy(rawSide == "ASK")
        side = "sell";
    end
    amount = safeString(order, "totalQuantity");
    remaining = safeString(order, "availableQuantity");
    totalQuantity = safeString(order, "totalQuantity");
    availableQuantity = safeString(order, "availableQuantity");
    filled = safeString(order, "filledQuantity");
    if functions.ccxtruthy(@functions.ccxt_and(totalQuantity != nothing, availableQuantity != nothing))
        filled = stringSub(totalQuantity, availableQuantity);
    end
    remainingString = remaining;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(remainingString == nothing, totalQuantity != nothing), filled != nothing))
        remainingString = stringSub(totalQuantity, filled);
    end
    timeInForce = "GTC";
    orderFlags = safeValue(order, "orderFlags");
    postOnly = false;
    reduceOnly = false;
    if functions.ccxtruthy(orderFlags == "POST_ONLY")
        timeInForce = "PO";
        postOnly = true;
    elseif functions.ccxtruthy(orderFlags == "IOC")
        timeInForce = "IOC";
    else
        if functions.ccxtruthy(orderFlags == "REDUCE_ONLY")
            reduceOnly = true;
        end

    end
    timestamp = safeInteger(order, "createdAt");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeIntegerProduct(order, "creationTime", 1000);
    end
    lastUpdateTimestamp = safeInteger(order, "closedAt");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => nothing,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("average") => safeString(order, "avgFillPrice"),
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remainingString,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("postOnly") => postOnly,
    Symbol("triggerPrice") => self.safeNumber(order, "triggerPrice")
), market = market)

end
"""
fetches information on an order made by the user
see: https://api-doc.hibachi.xyz/#096a8854-b918-4de8-8731-b2a28d26b96d

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Hibachi, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id,
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
fetch the trading fee
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a map of market symbols to [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFees(self::Hibachi; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeAccountInfo(extend(request, params)));
    makerFeeRate = self.safeNumber(response, "tradeMakerFeeRate");
    takerFeeRate = self.safeNumber(response, "tradeTakerFeeRate");
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => makerFeeRate,
            Symbol("taker") => takerFeeRate,
            Symbol("percentage") => true
        );
        i += 1
    end
    return result

end
function orderMessage(self::Hibachi, market, nonce, feeRate, type_var, side, amount; price=nothing)
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    sideInternal = 0;
    if functions.ccxtruthy(side == "sell")
        sideInternal = 0;
    elseif functions.ccxtruthy(side == "buy")
        sideInternal = 1;
    end
    amountStr = self.amountToPrecision(safeString(market, "symbol"), amount);
    feeRateStr = numberToString(feeRate);
    info = self.safeDict(market, "info");
    underlying = string("1e", safeString(info, "underlyingDecimals"));
    settlement = string("1e", safeString(info, "settlementDecimals"));
    one = "1";
    feeRateFactor = "100000000";
    priceFactor = "4294967296";
    quantityInternal = stringDiv(stringMul(amountStr, underlying), one, 0);
    feeRateInternal = stringDiv(stringMul(feeRateStr, feeRateFactor), one, 0);
    nonce16 = self.intToBase16(nonce);
    noncePadded = lpad(nonce16, 16, "0");
    encodedNonce = self.base16ToBinary(noncePadded);
    numericId = self.intToBase16(safeInteger(market, "numericId"));
    numericIdPadded = lpad(numericId, 8, "0");
    encodedMarketId = self.base16ToBinary(numericIdPadded);
    quantity16 = self.intToBase16(self.parseToInt(quantityInternal));
    quantityPadded = lpad(quantity16, 16, "0");
    encodedQuantity = self.base16ToBinary(quantityPadded);
    sideInternal16 = self.intToBase16(sideInternal);
    sidePadded = lpad(sideInternal16, 8, "0");
    encodedSide = self.base16ToBinary(sidePadded);
    feeRateInternal16 = self.intToBase16(self.parseToInt(feeRateInternal));
    feeRatePadded = lpad(feeRateInternal16, 16, "0");
    encodedFeeRate = self.base16ToBinary(feeRatePadded);
    encodedPrice = binaryConcat();
    if functions.ccxtruthy(type_var == "limit")
        priceStr = self.priceToPrecision(safeString(market, "symbol"), price);
        priceInternal = stringDiv(stringDiv(stringMul(stringMul(priceStr, priceFactor), settlement), underlying), one, 0);
        price16 = self.intToBase16(self.parseToInt(priceInternal));
        pricePadded = lpad(price16, 16, "0");
        encodedPrice = self.base16ToBinary(pricePadded);
    end
    message = binaryConcat(encodedNonce, encodedMarketId, encodedQuantity, encodedSide, encodedPrice, encodedFeeRate);
    return message

end
function createOrderRequest(self::Hibachi, nonce, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    takerFee = self.safeNumber(market, "taker", defaultNumber = self.safeNumber(self.options, "defaultTakerFee", defaultNumber = 0.00045));
    makerFee = self.safeNumber(market, "maker", defaultNumber = self.safeNumber(self.options, "defaultMakerFee", defaultNumber = 0.00015));
    takerFeeValue = functions.ccxtruthy((takerFee == nothing)) ? 0 : takerFee;
    makerFeeValue = functions.ccxtruthy((makerFee == nothing)) ? 0 : makerFee;
    feeRate = max(takerFeeValue, makerFeeValue);
    sideInternal = "";
    if functions.ccxtruthy(side == "sell")
        sideInternal = "ASK";
    elseif functions.ccxtruthy(side == "buy")
        sideInternal = "BID";
    end
    priceInternal = "";
    if functions.ccxtruthy(price)
        priceInternal = self.priceToPrecision(symbol, price);
    end
    message = self.orderMessage(market, nonce, feeRate, type_var, side, amount, price = price);
    signature = self.signMessage(message, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id"),
        Symbol("nonce") => nonce,
        Symbol("side") => sideInternal,
        Symbol("orderType") => uppercase(type_var),
        Symbol("quantity") => self.amountToPrecision(symbol, amount),
        Symbol("price") => priceInternal,
        Symbol("signature") => signature,
        Symbol("maxFeesPercent") => numberToString(feeRate)
    );
    postOnly = self.isPostOnly(uppercase(type_var) == "MARKET", nothing, params = params);
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    timeInForce = safeStringLower(params, "timeInForce");
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    if functions.ccxtruthy(postOnly)
        request[Symbol("orderFlags")] = "POST_ONLY";
    elseif functions.ccxtruthy(timeInForce == "ioc")
        request[Symbol("orderFlags")] = "IOC";
    else
        if functions.ccxtruthy(reduceOnly)
            request[Symbol("orderFlags")] = "REDUCE_ONLY";
        end

    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerPrice")] = triggerPrice;
    end
    params = omit(params, ["reduceOnly", "reduce_only", "postOnly", "timeInForce", "stopPrice", "triggerPrice"]);
    return extend(request, params)

end
"""
create a trade order
see: https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Hibachi, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = self.nonce();
    request = self.createOrderRequest(nonce, symbol, type_var, side, amount, price = price, params = params);
    request[Symbol("accountId")] = self.getAccountId();
    response = Base.fetch(self.privatePostTradeOrder(request));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(response, "orderId"),
    Symbol("status") => "pending"
))

end
"""
*contract only* create a list of trade orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Hibachi, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = self.nonce();
    requestOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        symbol = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(nonce + i, symbol, type_var, side, amount, price = price, params = orderParams);
        orderRequest[Symbol("action")] = "place";
        push!(requestOrders, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId(),
        Symbol("orders") => requestOrders
    );
    response = Base.fetch(self.privatePostTradeOrders(extend(request, params)));
    ret = [];
    responseOrders = self.safeList(response, "orders", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseOrders)))
        responseOrder = get(responseOrders, i + 1, nothing);
        push!(ret, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => responseOrder,
    Symbol("id") => safeString(responseOrder, "orderId"),
    Symbol("status") => "pending"
)));
        i += 1
    end
    return ret

end
function editOrderRequest(self::Hibachi, nonce, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    takerFee = self.safeNumber(market, "taker", defaultNumber = 0);
    makerFee = self.safeNumber(market, "maker", defaultNumber = 0);
    takerFeeValue = functions.ccxtruthy((takerFee == nothing)) ? 0 : takerFee;
    makerFeeValue = functions.ccxtruthy((makerFee == nothing)) ? 0 : makerFee;
    feeRate = max(takerFeeValue, makerFeeValue);
    message = self.orderMessage(market, nonce, feeRate, type_var, side, amount, price = price);
    signature = self.signMessage(message, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id,
        Symbol("nonce") => nonce,
        Symbol("updatedQuantity") => self.amountToPrecision(symbol, amount),
        Symbol("updatedPrice") => self.priceToPrecision(symbol, price),
        Symbol("maxFeesPercent") => numberToString(feeRate),
        Symbol("signature") => signature
    );
    return extend(request, params)

end
"""
edit a limit order that is not matched
see: https://api-doc.hibachi.xyz/#94d2cdaf-1c71-440f-a981-da1112824810

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell', should stay the same with original side
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Hibachi, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = self.nonce();
    request = self.editOrderRequest(nonce, id, symbol, type_var, side, amount = amount, price = price, params = params);
    request[Symbol("accountId")] = self.getAccountId();
    Base.fetch(self.privatePutTradeOrder(request));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => "pending"
))

end
"""
edit a list of trade orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `orders`::array: list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrders(self::Hibachi, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = self.nonce();
    requestOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        id = safeString(rawOrder, "id");
        symbol = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.editOrderRequest(nonce + i, id, symbol, type_var, side, amount = amount, price = price, params = orderParams);
        orderRequest[Symbol("action")] = "modify";
        push!(requestOrders, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId(),
        Symbol("orders") => requestOrders
    );
    response = Base.fetch(self.privatePostTradeOrders(extend(request, params)));
    ret = [];
    responseOrders = self.safeList(response, "orders", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseOrders)))
        responseOrder = get(responseOrders, i + 1, nothing);
        push!(ret, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => responseOrder,
    Symbol("id") => safeString(responseOrder, "orderId"),
    Symbol("status") => "pending"
)));
        i += 1
    end
    return ret

end
function cancelOrderRequest(self::Hibachi, id)
    bigid = self.convertToBigInt(id);
    idbase16 = self.intToBase16(bigid);
    idPadded = lpad(idbase16, 16, "0");
    message = self.base16ToBinary(idPadded);
    signature = self.signMessage(message, self.privateKey);
    return Dict{Symbol, Any}(
    Symbol("orderId") => id,
    Symbol("signature") => signature
)

end
"""
cancels an open order
see: https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271

# Arguments
- `id`::string: order id
- `symbol`::string: is unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Hibachi, id; symbol=nothing, params=Dict())
    request = self.cancelOrderRequest(id);
    request[Symbol("accountId")] = self.getAccountId();
    response = Base.fetch(self.privateDeleteTradeOrder(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id,
    Symbol("status") => "canceled"
))

end
"""
cancel multiple orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Hibachi, ids; symbol=nothing, params=Dict())
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        orderRequest = self.cancelOrderRequest(get(ids, i + 1, nothing));
        orderRequest[Symbol("action")] = "cancel";
        push!(orders, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId(),
        Symbol("orders") => orders
    );
    response = Base.fetch(self.privatePostTradeOrders(extend(request, params)));
    ret = [];
    responseOrders = self.safeList(response, "orders", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseOrders)))
        responseOrder = get(responseOrders, i + 1, nothing);
        push!(ret, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => responseOrder,
    Symbol("id") => safeString(responseOrder, "orderId"),
    Symbol("status") => "canceled"
)));
        i += 1
    end
    return ret

end
"""
cancel all open orders in a market
see: https://api-doc.hibachi.xyz/#8ed24695-016e-49b2-a72d-7511ca921fee

# Arguments
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Hibachi; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = self.nonce();
    nonce16 = self.intToBase16(nonce);
    noncePadded = lpad(nonce16, 16, "0");
    message = self.base16ToBinary(noncePadded);
    signature = self.signMessage(message, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId(),
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("contractId")] = safeInteger(market, "numericId");
    end
    response = Base.fetch(self.privateDeleteTradeOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function encodeWithdrawMessage(self::Hibachi, amount, maxFees, address)
    USDTAssetId = 1;
    USDTFactor = "1000000";
    amountStr = numberToString(amount);
    maxFeesStr = numberToString(maxFees);
    one = "1";
    quantityInternal = stringDiv(stringMul(amountStr, USDTFactor), one, 0);
    maxFeesInternal = stringDiv(stringMul(maxFeesStr, USDTFactor), one, 0);
    usdtAsset16 = self.intToBase16(USDTAssetId);
    usdtAssetPadded = lpad(usdtAsset16, 8, "0");
    encodedAssetId = self.base16ToBinary(usdtAssetPadded);
    quantity16 = self.intToBase16(self.parseToInt(quantityInternal));
    quantityPadded = lpad(quantity16, 16, "0");
    encodedQuantity = self.base16ToBinary(quantityPadded);
    maxFees16 = self.intToBase16(self.parseToInt(maxFeesInternal));
    maxFeesPadded = lpad(maxFees16, 16, "0");
    encodedMaxFees = self.base16ToBinary(maxFeesPadded);
    encodedAddress = self.base16ToBinary(address);
    message = binaryConcat(encodedAssetId, encodedQuantity, encodedMaxFees, encodedAddress);
    return message

end
"""
make a withdrawal
see: https://api-doc.hibachi.xyz/#6421625d-3e45-45fa-be9b-d2a0e780c090

# Arguments
- `code`::string: unified currency code, only support USDT
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Hibachi, code, amount, address; tag=nothing, params=Dict())
    withdrawAddress = functions.ccxt_slice(address, -40);
    exchangeInfo = Base.fetch(self.publicGetMarketExchangeInfo(params));
    feeConfig = self.safeDict(exchangeInfo, "feeConfig");
    maxFees = self.safeNumber(feeConfig, "withdrawalFees");
    message = self.encodeWithdrawMessage(amount, maxFees, withdrawAddress);
    signature = self.signMessage(message, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId(),
        Symbol("coin") => "USDT",
        Symbol("network") => "ARBITRUM",
        Symbol("withdrawAddress") => withdrawAddress,
        Symbol("selfWithdrawal") => false,
        Symbol("quantity") => numberToString(amount),
        Symbol("maxFees") => numberToString(maxFees),
        Symbol("signature") => signature
    );
    Base.fetch(self.privatePostCapitalWithdraw(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => nothing,
    Symbol("id") => nothing,
    Symbol("txid") => nothing,
    Symbol("timestamp") => milliseconds(),
    Symbol("datetime") => nothing,
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => withdrawAddress,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => "withdrawal",
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => "pending",
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => "USDT",
        Symbol("cost") => maxFees
    ),
    Symbol("network") => "ARBITRUM",
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function nonce(self::Hibachi, )
    return milliseconds()

end
function signMessage(self::Hibachi, message, privateKey)
    if functions.ccxtruthy(length(privateKey) == 44)
            return self.hmac(message, self.encode(privateKey), sha256, "hex")
    else
        hash = Ccxt.hash(message, sha256, "hex");
        signature = ecdsa(functions.ccxt_slice(hash, -64), functions.ccxt_slice(privateKey, -64), secp256k1, nothing);
        r = get(signature, Symbol("r"), nothing);
        s = get(signature, Symbol("s"), nothing);
        v = self.intToBase16(get(signature, Symbol("v"), nothing));
        return string(lpad(r, 64, "0"), lpad(s, 64, "0"), lpad(v, 2, "0"))
    end

end
"""
fetches the state of the open orders on the orderbook
see: https://api-doc.hibachi.xyz/#c7a64b0d-9e37-4009-93e5-2aa12e8d7e9b

# Arguments
- `symbol`::string: unified symbol of the market
- `limit`::int, optional: currently unused
- `params`::object, optional: extra parameters to be passed -- see documentation link above

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Hibachi, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketDataOrderbook(extend(request, params)));
    formattedResponse = Dict{Symbol, Any}();
    formattedResponse[Symbol("ask")] = self.safeList(self.safeDict(response, "ask"), "levels");
    formattedResponse[Symbol("bid")] = self.safeList(self.safeDict(response, "bid"), "levels");
    return self.parseOrderBook(formattedResponse, symbol, timestamp = milliseconds(), bidsKey = "bid", asksKey = "ask", priceKey = "price", amountKey = "quantity")

end
"""
fetch all trades made by the user
see: https://api-doc.hibachi.xyz/#0adbf143-189f-40e0-afdc-88af4cba3c79

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeAccountTrades(extend(request, params)));
    trades = self.safeList(response, "trades");
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit, params = params)

end
function parseOHLCV(self::Hibachi, ohlcv; market=nothing)
    return [safeIntegerProduct(ohlcv, "timestamp", 1000), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volumeNotional")]

end
"""
fetches all current open orders
see: https://api-doc.hibachi.xyz/#3243f8a0-086c-44c5-ab8a-71bbb7bab403

# Arguments
- `symbol`::string, optional: unified market symbol to filter by
- `since`::int, optional: milisecond timestamp of the earliest order
- `limit`::int, optional: the maximum number of open orders to return
- `params`::object, optional: extra parameters

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetch orders filtered by terminal status
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `status`::string: exchange specific terminal status
- `symbol`::string, optional: unified market symbol to filter by
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of orders to return
- `params`::object, optional: extra parameters
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrdersByStatus(self::Hibachi, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(status != nothing)
        request[Symbol("status")] = status;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchOrdersByStatus", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.privateGetTradeOrdersHistory(extend(request, params)));
    orders = self.safeList(response, "orders", defaultValue = []);
    parsedOrders = self.parseOrders(orders, market = market);
    return self.filterBySymbolSinceLimit(parsedOrders, symbol = symbol, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of closed order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrdersByStatus("filled", symbol = symbol, since = since, limit = limit, params = params));
    filtered = filterBy(orders, "status", "closed");
    return self.filterBySinceLimit(filtered, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of canceled order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrdersByStatus(nothing, symbol = symbol, since = since, limit = limit, params = params));
    filtered = filterBy(orders, "status", "canceled");
    return self.filterBySinceLimit(filtered, since = since, limit = limit)

end
"""
fetches historical candlestick data containing the close, high, low, open prices, interval and the volumeNotional
see: https://api-doc.hibachi.xyz/#4f0eacec-c61e-4d51-afb3-23c51c2c6bac

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Hibachi, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    timeframe = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => timeframe
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("fromMs")] = since;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchOHLCV", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("toMs")] = until;
    end
    response = Base.fetch(self.publicGetMarketDataKlines(extend(request, params)));
    klines = self.safeList(response, "klines", defaultValue = []);
    return self.parseOHLCVs(klines, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetch all open positions
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Hibachi; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetTradeAccountInfo(extend(request, params)));
    data = self.safeList(response, "positions", defaultValue = []);
    return self.parsePositions(data, symbols = symbols)

end
function parsePosition(self::Hibachi, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(position, "direction");
    quantity = safeString(position, "quantity");
    unrealizedFunding = safeString(position, "unrealizedFundingPnl", "0");
    unrealizedTrading = safeString(position, "unrealizedTradingPnl", "0");
    unrealizedPnl = stringAdd(unrealizedFunding, unrealizedTrading);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("entryPrice") => safeString(position, "average_entry_price"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => safeString(position, "notionalValue"),
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
function sign(self::Hibachi, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = string("/", self.implodeParams(path, params));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), endpoint);
    headers = Dict{Symbol, Any}(
        Symbol("Hibachi-Client") => "HibachiCCXT/unversioned"
    );
    if functions.ccxtruthy(method == "GET")
        request = omit(params, self.extractParams(path));
        query = self.urlencode(request);
        if functions.ccxtruthy(length(query) != 0)
            url += string("?", query);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(method == "POST", method == "PUT"), method == "DELETE"))
        headers[Symbol("Content-Type")] = "application/json";
        body = json(params);
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        headers[Symbol("Authorization")] = self.apiKey;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Hibachi, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("status", response))
        status = safeString(response, "status");
        if functions.ccxtruthy(status == "failed")
            code = safeString(response, "errorCode");
            feedback = string(self.id, " ", body);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
            message = safeString(response, "message");
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end
function parseTransactionType(self::Hibachi, type_var)
    types = Dict{Symbol, Any}(
        Symbol("deposit") => "transaction",
        Symbol("withdrawal") => "transaction",
        Symbol("transfer-in") => "transfer",
        Symbol("transfer-out") => "transfer"
    );
    return safeString(types, type_var, type_var)

end
function parseTransactionStatus(self::Hibachi, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending") => "pending",
        Symbol("claimable") => "pending",
        Symbol("completed") => "ok",
        Symbol("failed") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseLedgerEntry(self::Hibachi, item; currency=nothing)
    transactionType = safeString(item, "transactionType");
    timestamp = nothing;
    type_var = nothing;
    direction = nothing;
    amount = nothing;
    fee = nothing;
    referenceId = nothing;
    referenceAccount = nothing;
    status = nothing;
    if functions.ccxtruthy(transactionType == nothing)
        timestamp = safeIntegerProduct(item, "timestamp", 1000);
        type_var = "trade";
        amountStr = safeString(item, "realizedPnl");
        if functions.ccxtruthy(stringLt(amountStr, "0"))
            direction = "out";
            amountStr = stringNeg(amountStr);
        else
            direction = "in";
        end
        amount = self.parseNumber(amountStr);
        fee = Dict{Symbol, Any}(
            Symbol("currency") => "USDT",
            Symbol("cost") => self.safeNumber(item, "fee")
        );
        status = "ok";
    else
        timestamp = safeIntegerProduct(item, "timestampSec", 1000);
        amount = self.safeNumber(item, "quantity");
        direction = functions.ccxtruthy((@functions.ccxt_or(transactionType == "deposit", transactionType == "transfer-in"))) ? "in" : "out";
        type_var = self.parseTransactionType(transactionType);
        status = self.parseTransactionStatus(safeString(item, "status"));
        if functions.ccxtruthy(transactionType == "transfer-in")
            referenceAccount = safeString(item, "srcAccountId");
        elseif functions.ccxtruthy(transactionType == "transfer-out")
            referenceAccount = safeString(item, "receivingAccountId");
        end
        referenceId = safeString(item, "transactionHash");
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("id") => safeString(item, "id"),
    Symbol("currency") => self.currency("USDT"),
    Symbol("account") => numberToString(self.accountId),
    Symbol("referenceAccount") => referenceAccount,
    Symbol("referenceId") => referenceId,
    Symbol("status") => status,
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("fee") => fee,
    Symbol("direction") => direction,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("type") => type_var,
    Symbol("info") => item
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Hibachi; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency("USDT");
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    rawPromises = [self.privateGetCapitalHistory(extend(request, params)), self.privateGetTradeAccountTradingHistory(extend(request, params))];
    promises = Base.fetch(asyncmap(Base.fetch, rawPromises));
    responseCapitalHistory = get(promises, 1, nothing);
    rowsCapitalHistory = self.safeList(responseCapitalHistory, "transactions", defaultValue = []);
    responseTradingHistory = get(promises, 2, nothing);
    rowsTradingHistory = self.safeList(responseTradingHistory, "tradingHistory", defaultValue = []);
    rows = arrayConcat(rowsCapitalHistory, rowsTradingHistory);
    return self.parseLedger(rows, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch deposit address for given currency and chain. currently, we have a single EVM address across multiple EVM chains. Note: This method is currently only supported for trustless accounts
see: https://api-doc.hibachi.xyz/#6fa35580-3d45-4b59-854d-c9326db06af5

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters for API
- `params.publicKey`::string, optional: your public key, you can get it from UI after creating API key

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Hibachi, code; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("publicKey") => safeString(params, "publicKey"),
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetCapitalDepositInfo(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => "USDT",
    Symbol("network") => "ARBITRUM",
    Symbol("address") => safeString(response, "depositAddressEvm"),
    Symbol("tag") => nothing
)

end
function parseTransaction(self::Hibachi, transaction; currency=nothing)
    timestamp = safeIntegerProduct(transaction, "timestampSec", 1000);
    address = safeString(transaction, "withdrawalAddress");
    transactionType = safeString(transaction, "transactionType");
    if functions.ccxtruthy(@functions.ccxt_and(transactionType != "deposit", transactionType != "withdrawal"))
        transactionType = self.parseTransactionType(transactionType);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "transactionHash"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => "ARBITRUM",
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => transactionType,
    Symbol("amount") => self.safeNumber(transaction, "quantity"),
    Symbol("currency") => "USDT",
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing
)

end
"""
fetch deposit and withdrawal history for the account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest transaction
- `limit`::int, optional: the maximum number of transactions to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Hibachi; code=nothing, since=nothing, limit=nothing, params=Dict())
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    response = Base.fetch(self.privateGetCapitalHistory(extend(request, params)));
    transactions = self.safeList(response, "transactions", defaultValue = []);
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch deposits made to account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: filter by earliest timestamp (ms)
- `limit`::int, optional: maximum number of deposits to be returned
- `params`::object, optional: extra parameters to be passed to API

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Hibachi; code=nothing, since=nothing, limit=nothing, params=Dict())
    transactions = Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = nothing, params = params));
    deposits = filterBy(transactions, "type", "deposit");
    return self.filterBySinceLimit(deposits, since = since, limit = limit, key = "timestamp")

end
"""
fetch withdrawals made from account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: filter by earliest timestamp (ms)
- `limit`::int, optional: maximum number of deposits to be returned
- `params`::object, optional: extra parameters to be passed to API

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Hibachi; code=nothing, since=nothing, limit=nothing, params=Dict())
    transactions = Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = nothing, params = params));
    withdrawals = filterBy(transactions, "type", "withdrawal");
    return self.filterBySinceLimit(withdrawals, since = since, limit = limit, key = "timestamp")

end
function parseSettlement(self::Hibachi, settlement; market=nothing)
    timestamp = safeTimestamp(settlement, "timestamp");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("price") => self.safeNumber(settlement, "indexPrice"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseSettlements(self::Hibachi, settlements; market=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market = market));
        i += 1
    end
    return result

end
"""
fetches historical settlement records of the user
see: https://api-doc.hibachi.xyz/#28185336-04b7-4480-bcc8-a33516ad458b

# Arguments
- `symbol`::string, optional: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms of the earliest settlement
- `limit`::int, optional: the maximum number of settlements to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest settlement

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
"""
function fetchMySettlementHistory(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("accountId") => self.getAccountId()
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("contractId")] = get(market, Symbol("numericId"), nothing);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchMySettlementHistory", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = self.parseToInt(until / 1000);
    end
    response = Base.fetch(self.privateGetTradeAccountSettlementsHistory(extend(request, params)));
    data = self.safeList(response, "settlements", defaultValue = []);
    settlements = self.parseSettlements(data, market = market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-doc.hibachi.xyz/#3277e546-4cb0-4d30-a832-717af0de9b20

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Hibachi; params=Dict())
    response = Base.fetch(self.publicGetExchangeUtcTimestamp(params));
    return safeInteger(response, "timestampMs")

end
"""
retrieves the open interest of a contract trading pair
see: https://api-doc.hibachi.xyz/#bc34e8ae-e094-4802-8d56-3efe3a7bad49

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Hibachi, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketDataOpenInterest(extend(request, params)));
    timestamp = milliseconds();
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("openInterestAmount") => safeString(response, "totalQuantity"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => response
), market = market)

end
"""
fetch the current funding rate
see: https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Hibachi, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketDataPrices(extend(request, params)));
    funding = self.safeDict(response, "fundingRateEstimation", defaultValue = Dict{Symbol, Any}());
    timestamp = milliseconds();
    nextFundingTimestamp = safeIntegerProduct(funding, "nextFundingTimestamp", 1000);
    return Dict{Symbol, Any}(
    Symbol("info") => funding,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.parseNumber("0"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(funding, "estimatedFundingRate"),
    Symbol("fundingTimestamp") => nextFundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "8h"
)

end
"""
fetches historical funding rate prices
see: https://api-doc.hibachi.xyz/#079586af-0d94-41ea-99bb-7afcd93bf438

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Hibachi; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketDataFundingRates(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeIntegerProduct(entry, "fundingTimestamp", 1000);
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Hibachi, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketExchangeInfo(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/exchange-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketInventory(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/inventory"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataPrices(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/prices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataStats(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/stats"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataTrades(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataKlines(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataOpenInterest(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/open-interest"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataOrderbook(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketDataFundingRates(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "market/data/funding-rates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangeUtcTimestamp(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "exchange/utc-timestamp"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCapitalBalance(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "capital/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCapitalHistory(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "capital/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCapitalDepositInfo(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "capital/deposit-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeAccountInfo(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/account/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeAccountTrades(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/account/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeAccountTradingHistory(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/account/trading_history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeAccountSettlementsHistory(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/account/settlements_history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrders(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrder(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersHistory(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/orders/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutTradeOrder(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/order"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteTradeOrder(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteTradeOrders(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeOrder(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeOrders(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCapitalWithdraw(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "capital/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCapitalTransfer(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "capital/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeAccountLeverage(self::Hibachi, params=Dict(), context=Dict())
    return request(self, "trade/account/leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Hibachi(; kwargs...)
    inst = Hibachi(Exchange(), describe, getAccountId, parseMarket, fetchMarkets, hardcodedCurrencies, parseBalance, fetchBalance, parseTicker, parseTrade, fetchTrades, fetchTicker, parseOrderStatus, parseOrder, fetchOrder, fetchTradingFees, orderMessage, createOrderRequest, createOrder, createOrders, editOrderRequest, editOrder, editOrders, cancelOrderRequest, cancelOrder, cancelOrders, cancelAllOrders, encodeWithdrawMessage, withdraw, nonce, signMessage, fetchOrderBook, fetchMyTrades, parseOHLCV, fetchOpenOrders, fetchOrdersByStatus, fetchClosedOrders, fetchCanceledOrders, fetchOHLCV, fetchPositions, parsePosition, sign, handleErrors, parseTransactionType, parseTransactionStatus, parseLedgerEntry, fetchLedger, fetchDepositAddress, parseTransaction, fetchDepositsWithdrawals, fetchDeposits, fetchWithdrawals, parseSettlement, parseSettlements, fetchMySettlementHistory, fetchTime, fetchOpenInterest, fetchFundingRate, fetchFundingRateHistory, publicGetMarketExchangeInfo, publicGetMarketInventory, publicGetMarketDataPrices, publicGetMarketDataStats, publicGetMarketDataTrades, publicGetMarketDataKlines, publicGetMarketDataOpenInterest, publicGetMarketDataOrderbook, publicGetMarketDataFundingRates, publicGetExchangeUtcTimestamp, privateGetCapitalBalance, privateGetCapitalHistory, privateGetCapitalDepositInfo, privateGetTradeAccountInfo, privateGetTradeAccountTrades, privateGetTradeAccountTradingHistory, privateGetTradeAccountSettlementsHistory, privateGetTradeOrders, privateGetTradeOrder, privateGetTradeOrdersHistory, privatePutTradeOrder, privateDeleteTradeOrder, privateDeleteTradeOrders, privatePostTradeOrder, privatePostTradeOrders, privatePostCapitalWithdraw, privatePostCapitalTransfer, privatePostTradeAccountLeverage)
    # describe() first, then the user config — the same order, and the same
    # merge rule, as the TS base constructor (Exchange.ts, "merge constructor
    # overrides to this instance"): a plain object is deep-merged onto the
    # current value, anything else is assigned. Assigning dictionaries
    # wholesale would drop the base defaults an exchange does not restate —
    # e.g. `options.defaultNetworkCodeReplacements`, which every
    # networkIdToCode lookup needs.
    #
    # `features` is the exception, and is assigned rather than merged.
    # Julia models inheritance by composition, so a child's `parent` is a
    # fully-built instance that has already run `afterConstruct` — and
    # `featuresGenerator` rewrites `features` in place, expanding the raw
    # `{'default': ...}` / `{'swap': {'extends': ...}}` shorthand into a
    # per-market-type table and recording absent types as `nothing`. Merging
    # that derived table with the raw `describe()` value it was derived from
    # feeds the generator its own output on the child's pass: a market type
    # the parent recorded as absent comes back as a present-but-`nothing`
    # entry, which the generator then tries to index into. In TS the
    # generator only ever sees the raw value, so assign it here too.
    desc = inst.describe()
    for (k, v) in desc
        key = Symbol(k)
        if v isa AbstractDict && key !== :features
            inst[key] = deepExtend(get(inst, key, nothing), v)
        else
            inst[key] = v
        end
    end
    for (k, v) in kwargs
        if v isa AbstractDict && k !== :features
            inst[k] = deepExtend(get(inst, k, nothing), v)
        else
            inst[k] = v
        end
    end
    # Re-run the tail of the TS base constructor now that this exchange's
    # own describe() has been merged in. The composed parent Exchange only
    # ever saw the base describe(), so these derived values are still the
    # base ones until they are recomputed here.
    #
    # defineRestApi is deliberately not repeated: the generator emits every
    # api endpoint as a real Julia function (and a struct field), so the
    # dynamic closures the TS constructor installs have no work to do.
    for k in objectKeys(inst.has)
        inst[Symbol(string("has", capitalize(k)))] = ccxtruthy(get(inst.has, Symbol(k), nothing))
    end
    newUpdates = get(inst.options, Symbol("newUpdates"), nothing)
    inst.newUpdates = newUpdates === nothing ? true : newUpdates
    # afterConstruct already honours `options.sandbox`/`options.testnet`; the
    # TS constructor's extra `setSandboxMode` call reads the *user config*,
    # which arrives here as kwargs. Repeating the options-based check would
    # swap the api/test URLs a second time and clobber the apiBackup snapshot.
    inst.afterConstruct()
    if ccxtruthy(get(kwargs, :sandbox, false)) || ccxtruthy(get(kwargs, :testnet, false))
        inst.setSandboxMode(true)
    end
    inst.loadExchangeSpecificFiles()
    return inst
end


# Per-exchange docstring holders (see build/juliaTranspileCLI.ts buildDocRegistrySource).
function __ccxt_doc_Hibachi_fetchMarkets() end
"""
retrieves data on all markets for hibachi
see: https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hibachi_fetchMarkets

function __ccxt_doc_Hibachi_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Hibachi_fetchBalance

function __ccxt_doc_Hibachi_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (maximum value is 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of recent [trade structures]
"""
__ccxt_doc_Hibachi_fetchTrades

function __ccxt_doc_Hibachi_fetchTicker() end
"""
fetches a price ticker and the related information for the past 24h
see: https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e
see: https://api-doc.hibachi.xyz/#0064ca53-a2d0-41b9-8ade-6b2abf4ccb12

# Arguments
- `symbol`::string: unified symbol of the market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hibachi_fetchTicker

function __ccxt_doc_Hibachi_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api-doc.hibachi.xyz/#096a8854-b918-4de8-8731-b2a28d26b96d

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_fetchOrder

function __ccxt_doc_Hibachi_fetchTradingFees() end
"""
fetch the trading fee
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a map of market symbols to [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Hibachi_fetchTradingFees

function __ccxt_doc_Hibachi_createOrder() end
"""
create a trade order
see: https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_createOrder

function __ccxt_doc_Hibachi_createOrders() end
"""
*contract only* create a list of trade orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_createOrders

function __ccxt_doc_Hibachi_editOrder() end
"""
edit a limit order that is not matched
see: https://api-doc.hibachi.xyz/#94d2cdaf-1c71-440f-a981-da1112824810

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell', should stay the same with original side
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_editOrder

function __ccxt_doc_Hibachi_editOrders() end
"""
edit a list of trade orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `orders`::array: list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_editOrders

function __ccxt_doc_Hibachi_cancelOrder() end
"""
cancels an open order
see: https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271

# Arguments
- `id`::string: order id
- `symbol`::string: is unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_cancelOrder

function __ccxt_doc_Hibachi_cancelOrders() end
"""
cancel multiple orders
see: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, unused
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_cancelOrders

function __ccxt_doc_Hibachi_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://api-doc.hibachi.xyz/#8ed24695-016e-49b2-a72d-7511ca921fee

# Arguments
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_cancelAllOrders

function __ccxt_doc_Hibachi_withdraw() end
"""
make a withdrawal
see: https://api-doc.hibachi.xyz/#6421625d-3e45-45fa-be9b-d2a0e780c090

# Arguments
- `code`::string: unified currency code, only support USDT
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hibachi_withdraw

function __ccxt_doc_Hibachi_fetchOrderBook() end
"""
fetches the state of the open orders on the orderbook
see: https://api-doc.hibachi.xyz/#c7a64b0d-9e37-4009-93e5-2aa12e8d7e9b

# Arguments
- `symbol`::string: unified symbol of the market
- `limit`::int, optional: currently unused
- `params`::object, optional: extra parameters to be passed -- see documentation link above

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Hibachi_fetchOrderBook

function __ccxt_doc_Hibachi_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api-doc.hibachi.xyz/#0adbf143-189f-40e0-afdc-88af4cba3c79

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Hibachi_fetchMyTrades

function __ccxt_doc_Hibachi_fetchOpenOrders() end
"""
fetches all current open orders
see: https://api-doc.hibachi.xyz/#3243f8a0-086c-44c5-ab8a-71bbb7bab403

# Arguments
- `symbol`::string, optional: unified market symbol to filter by
- `since`::int, optional: milisecond timestamp of the earliest order
- `limit`::int, optional: the maximum number of open orders to return
- `params`::object, optional: extra parameters

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_fetchOpenOrders

function __ccxt_doc_Hibachi_fetchOrdersByStatus() end
"""
fetch orders filtered by terminal status
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `status`::string: exchange specific terminal status
- `symbol`::string, optional: unified market symbol to filter by
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of orders to return
- `params`::object, optional: extra parameters
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_fetchOrdersByStatus

function __ccxt_doc_Hibachi_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of closed order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_fetchClosedOrders

function __ccxt_doc_Hibachi_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://api-doc.hibachi.xyz/#0ca35e79-a80e-4a91-bd32-de3fc2b0b1fa

# Arguments
- `symbol`::string, optional: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of canceled order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order
- `params.cursorOrderId`::string, optional: pagination cursor, returns orders with orderId strictly less than this value

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hibachi_fetchCanceledOrders

function __ccxt_doc_Hibachi_fetchOHLCV() end
"""
fetches historical candlestick data containing the close, high, low, open prices, interval and the volumeNotional
see: https://api-doc.hibachi.xyz/#4f0eacec-c61e-4d51-afb3-23c51c2c6bac

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Hibachi_fetchOHLCV

function __ccxt_doc_Hibachi_fetchPositions() end
"""
fetch all open positions
see: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Hibachi_fetchPositions

function __ccxt_doc_Hibachi_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Hibachi_fetchLedger

function __ccxt_doc_Hibachi_fetchDepositAddress() end
"""
fetch deposit address for given currency and chain. currently, we have a single EVM address across multiple EVM chains. Note: This method is currently only supported for trustless accounts
see: https://api-doc.hibachi.xyz/#6fa35580-3d45-4b59-854d-c9326db06af5

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters for API
- `params.publicKey`::string, optional: your public key, you can get it from UI after creating API key

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Hibachi_fetchDepositAddress

function __ccxt_doc_Hibachi_fetchDepositsWithdrawals() end
"""
fetch deposit and withdrawal history for the account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest transaction
- `limit`::int, optional: the maximum number of transactions to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hibachi_fetchDepositsWithdrawals

function __ccxt_doc_Hibachi_fetchDeposits() end
"""
fetch deposits made to account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: filter by earliest timestamp (ms)
- `limit`::int, optional: maximum number of deposits to be returned
- `params`::object, optional: extra parameters to be passed to API

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hibachi_fetchDeposits

function __ccxt_doc_Hibachi_fetchWithdrawals() end
"""
fetch withdrawals made from account
see: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: filter by earliest timestamp (ms)
- `limit`::int, optional: maximum number of deposits to be returned
- `params`::object, optional: extra parameters to be passed to API

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hibachi_fetchWithdrawals

function __ccxt_doc_Hibachi_fetchMySettlementHistory() end
"""
fetches historical settlement records of the user
see: https://api-doc.hibachi.xyz/#28185336-04b7-4480-bcc8-a33516ad458b

# Arguments
- `symbol`::string, optional: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms of the earliest settlement
- `limit`::int, optional: the maximum number of settlements to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest settlement

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
"""
__ccxt_doc_Hibachi_fetchMySettlementHistory

function __ccxt_doc_Hibachi_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-doc.hibachi.xyz/#3277e546-4cb0-4d30-a832-717af0de9b20

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Hibachi_fetchTime

function __ccxt_doc_Hibachi_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://api-doc.hibachi.xyz/#bc34e8ae-e094-4802-8d56-3efe3a7bad49

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Hibachi_fetchOpenInterest

function __ccxt_doc_Hibachi_fetchFundingRate() end
"""
fetch the current funding rate
see: https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Hibachi_fetchFundingRate

function __ccxt_doc_Hibachi_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://api-doc.hibachi.xyz/#079586af-0d94-41ea-99bb-7afcd93bf438

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Hibachi_fetchFundingRateHistory
