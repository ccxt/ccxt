@kwdef mutable struct Bitbank <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchDepositAddress::Function = fetchDepositAddress
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetPairTicker::Function = publicGetPairTicker
    publicGetTickers::Function = publicGetTickers
    publicGetTickersJpy::Function = publicGetTickersJpy
    publicGetPairDepth::Function = publicGetPairDepth
    publicGetPairTransactions::Function = publicGetPairTransactions
    publicGetPairTransactionsYyyymmdd::Function = publicGetPairTransactionsYyyymmdd
    publicGetPairCandlestickCandletypeYyyymmdd::Function = publicGetPairCandlestickCandletypeYyyymmdd
    publicGetPairCircuitBreakInfo::Function = publicGetPairCircuitBreakInfo
    privateGetUserAssets::Function = privateGetUserAssets
    privateGetUserSpotOrder::Function = privateGetUserSpotOrder
    privateGetUserSpotActiveOrders::Function = privateGetUserSpotActiveOrders
    privateGetUserMarginPositions::Function = privateGetUserMarginPositions
    privateGetUserSpotTradeHistory::Function = privateGetUserSpotTradeHistory
    privateGetUserDepositHistory::Function = privateGetUserDepositHistory
    privateGetUserUnconfirmedDeposits::Function = privateGetUserUnconfirmedDeposits
    privateGetUserDepositOriginators::Function = privateGetUserDepositOriginators
    privateGetUserWithdrawalAccount::Function = privateGetUserWithdrawalAccount
    privateGetUserWithdrawalHistory::Function = privateGetUserWithdrawalHistory
    privateGetSpotStatus::Function = privateGetSpotStatus
    privateGetSpotPairs::Function = privateGetSpotPairs
    privatePostUserSpotOrder::Function = privatePostUserSpotOrder
    privatePostUserSpotCancelOrder::Function = privatePostUserSpotCancelOrder
    privatePostUserSpotCancelOrders::Function = privatePostUserSpotCancelOrders
    privatePostUserSpotOrdersInfo::Function = privatePostUserSpotOrdersInfo
    privatePostUserConfirmDeposits::Function = privatePostUserConfirmDeposits
    privatePostUserConfirmDepositsAll::Function = privatePostUserConfirmDepositsAll
    privatePostUserRequestWithdrawal::Function = privatePostUserRequestWithdrawal
    marketsGetSpotPairs::Function = marketsGetSpotPairs

end
function describe(self::Bitbank, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitbank",
    Symbol("name") => "bitbank",
    Symbol("countries") => ["JP"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 100,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "1hour",
        Symbol("4h") => "4hour",
        Symbol("8h") => "8hour",
        Symbol("12h") => "12hour",
        Symbol("1d") => "1day",
        Symbol("1w") => "1week"
    ),
    Symbol("hostname") => "bitbank.cc",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/9d616de0-8a88-4468-8e38-d269acab0348",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://public.{hostname}",
            Symbol("private") => "https://api.{hostname}",
            Symbol("markets") => "https://api.{hostname}"
        ),
        Symbol("www") => "https://bitbank.cc/",
        Symbol("doc") => "https://docs.bitbank.cc/",
        Symbol("fees") => "https://bitbank.cc/docs/fees/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("{pair}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers_jpy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{pair}/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{pair}/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{pair}/transactions/{yyyymmdd}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{pair}/candlestick/{candletype}/{yyyymmdd}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("{pair}/circuit_break_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("user/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/spot/active_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/margin/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/spot/trade_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/deposit_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/unconfirmed_deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/deposit_originators") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/withdrawal_account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/withdrawal_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("user/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/spot/cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/spot/cancel_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/spot/orders_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/confirm_deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/confirm_deposits_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("user/request_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
)
            )
        ),
        Symbol("markets") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("spot/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
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
                Symbol("limit") => 1000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("20001") => AuthenticationError,
            Symbol("20002") => AuthenticationError,
            Symbol("20003") => AuthenticationError,
            Symbol("20005") => AuthenticationError,
            Symbol("20004") => InvalidNonce,
            Symbol("40020") => InvalidOrder,
            Symbol("40021") => InvalidOrder,
            Symbol("40025") => ExchangeError,
            Symbol("40013") => OrderNotFound,
            Symbol("40014") => OrderNotFound,
            Symbol("50008") => PermissionDenied,
            Symbol("50009") => OrderNotFound,
            Symbol("50010") => OrderNotFound,
            Symbol("60001") => InsufficientFunds,
            Symbol("60005") => InvalidOrder
        )
    )
))

end
function fetchMarkets(self::Bitbank, params=Dict())
    response = Base.fetch(self.marketsGetSpotPairs(params));
    data = safeValue(response, "data");
    pairs_var = safeValue(data, "pairs", []);
    return self.parseMarkets(pairs_var)

end
function parseMarket(self::Bitbank, entry)
    id = safeString(entry, "name");
    baseId = safeString(entry, "base_asset");
    quoteId = safeString(entry, "quote_asset");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => safeValue(entry, "is_enabled"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(entry, "taker_fee_rate_quote"),
    Symbol("maker") => self.safeNumber(entry, "maker_fee_rate_quote"),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(entry, "amount_digits"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(entry, "price_digits")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(entry, "unit_amount"),
            Symbol("max") => self.safeNumber(entry, "limit_max_amount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => entry
))

end
function parseTicker(self::Bitbank, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = safeInteger(ticker, "timestamp");
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "buy"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "sell"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "vol"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Bitbank, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPairTicker(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTicker(data, market)

end
function fetchOrderBook(self::Bitbank, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPairDepth(extend(request, params)));
    orderbook = safeValue(response, "data", Dict{Symbol, Any}());
    timestamp = safeInteger(orderbook, "timestamp");
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp)

end
function parseTrade(self::Bitbank, trade, market=nothing)
    timestamp = safeInteger(trade, "executed_at");
    market = self.safeMarket(nothing, market);
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    id = safeString2(trade, "transaction_id", "trade_id");
    takerOrMaker = safeString(trade, "maker_taker");
    fee = nothing;
    feeCostString = safeString(trade, "fee_amount_quote");
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => get(market, Symbol("quote"), nothing),
            Symbol("cost") => feeCostString
        );
    end
    orderId = safeString(trade, "order_id");
    type_var = safeString(trade, "type");
    side = safeString(trade, "side");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchTrades(self::Bitbank, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPairTransactions(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "transactions", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchTradingFees(self::Bitbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.marketsGetSpotPairs(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    pairs_var = safeValue(data, "pairs", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(pairs_var)))
        pair = get(pairs_var, i + 1, nothing);
        marketId = safeString(pair, "name");
        market = self.safeMarket(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => pair,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(pair, "maker_fee_rate_quote"),
            Symbol("taker") => self.safeNumber(pair, "taker_fee_rate_quote"),
            Symbol("percentage") => true,
            Symbol("tierBased") => false
        );
        i += 1
    end
    return result

end
function parseOHLCV(self::Bitbank, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 5), self.safeNumber(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4)]

end
function fetchOHLCV(self::Bitbank, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(since == nothing)
        if functions.ccxtruthy(limit == nothing)
            limit = 1000;
        end
        duration = self.parseTimeframe(timeframe);
        since = milliseconds() - duration * 1000 * limit;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("candletype") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("yyyymmdd") => self.yyyymmdd(since, "")
    );
    response = Base.fetch(self.publicGetPairCandlestickCandletypeYyyymmdd(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    candlestick = safeValue(data, "candlestick", []);
    first_var = safeValue(candlestick, 0, Dict{Symbol, Any}());
    ohlcv = self.safeList(first_var, "ohlcv", []);
    return self.parseOHLCVs(ohlcv, market, timeframe, since, limit)

end
function parseBalance(self::Bitbank, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    data = safeValue(response, "data", Dict{Symbol, Any}());
    assets = safeValue(data, "assets", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        balance = get(assets, i + 1, nothing);
        currencyId = safeString(balance, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "free_amount");
        account[Symbol("used")] = safeString(balance, "locked_amount");
        account[Symbol("total")] = safeString(balance, "onhand_amount");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Bitbank, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUserAssets(params));
    return self.parseBalance(response)

end
function parseOrderStatus(self::Bitbank, status)
    statuses = Dict{Symbol, Any}(
        Symbol("UNFILLED") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FULLY_FILLED") => "closed",
        Symbol("CANCELED_UNFILLED") => "canceled",
        Symbol("CANCELED_PARTIALLY_FILLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitbank, order, market=nothing)
    id = safeString(order, "order_id");
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(order, "ordered_at");
    price = safeString(order, "price");
    amount = safeString(order, "start_amount");
    filled = safeString(order, "executed_amount");
    remaining = safeString(order, "remaining_amount");
    average = safeString(order, "average_price");
    status = self.parseOrderStatus(safeString(order, "status"));
    type_var = safeStringLower(order, "type");
    side = safeStringLower(order, "side");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order
), market)

end
function createOrder(self::Bitbank, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("side") => side,
        Symbol("type") => type_var
    );
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    response = Base.fetch(self.privatePostUserSpotOrder(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(data, market)

end
function cancelOrder(self::Bitbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostUserSpotCancelOrder(extend(request, params)));
    data = safeValue(response, "data");
    return self.parseOrder(data)

end
function fetchOrder(self::Bitbank, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetUserSpotOrder(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(data, market)

end
function fetchOpenOrders(self::Bitbank, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = self.parseToInt(since / 1000);
    end
    response = Base.fetch(self.privateGetUserSpotActiveOrders(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchMyTrades(self::Bitbank, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = self.parseToInt(since / 1000);
    end
    response = Base.fetch(self.privateGetUserSpotTradeHistory(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "trades", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchDepositAddress(self::Bitbank, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetUserWithdrawalAccount(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    accounts = safeValue(data, "accounts", []);
    firstAccount = safeValue(accounts, 0, Dict{Symbol, Any}());
    address = safeString(firstAccount, "address");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function withdraw(self::Bitbank, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("uuid", params))))
        throw(ExchangeError(string(self.id, " uuid is required for withdrawal")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = Base.fetch(self.privatePostUserRequestWithdrawal(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransaction(data, currency)

end
function parseTransaction(self::Bitbank, transaction, currency=nothing)
    txid = safeString(transaction, "txid");
    currency = self.safeCurrency(nothing, currency);
    return Dict{Symbol, Any}(
    Symbol("id") => txid,
    Symbol("txid") => txid,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("amount") => nothing,
    Symbol("type") => nothing,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("status") => nothing,
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => transaction
)

end
function nonce(self::Bitbank, )
    return milliseconds()

end
function sign(self::Bitbank, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), "/");
    if functions.ccxtruthy(@functions.ccxt_or((api == "public"), (api == "markets")))
        url += self.implodeParams(path, params);
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        authMethod = safeString(self.options, "authMethod", "timeWindow");
        isTimeWindow = (authMethod == "timeWindow");
        requestTime = string(milliseconds());
        timeWindow = safeString(self.options, "timeWindow", "5000");
        nonce = string(self.nonce());
        auth = nothing;
        if functions.ccxtruthy(isTimeWindow)
            auth = string(requestTime, timeWindow);
        else
            auth = nonce;
        end
        url += string(self.version, "/", self.implodeParams(path, params));
        if functions.ccxtruthy(method == "POST")
            body = json(query);
            auth += body;
        else
            auth += string("/", self.version, "/", path);
            if functions.ccxtruthy(length(objectKeys(query)))
                query = self.urlencode(query);
                url += string("?", query);
                auth += string("?", query);
            end
        end
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-SIGNATURE") => self.hmac(self.encode(auth), self.encode(self.secret), sha256)
        );
        if functions.ccxtruthy(isTimeWindow)
            headers[Symbol("ACCESS-REQUEST-TIME")] = requestTime;
            headers[Symbol("ACCESS-TIME-WINDOW")] = timeWindow;
        else
            headers[Symbol("ACCESS-NONCE")] = nonce;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitbank, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = safeInteger(response, "success");
    data = safeValue(response, "data");
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(success), !functions.ccxtruthy(data)))
        errorMessages = Dict{Symbol, Any}(
            Symbol("10000") => "URL does not exist",
            Symbol("10001") => "A system error occurred. Please contact support",
            Symbol("10002") => "Invalid JSON format. Please check the contents of transmission",
            Symbol("10003") => "A system error occurred. Please contact support",
            Symbol("10005") => "A timeout error occurred. Please wait for a while and try again",
            Symbol("20001") => "API authentication failed",
            Symbol("20002") => "Illegal API key",
            Symbol("20003") => "API key does not exist",
            Symbol("20004") => "API Nonce does not exist",
            Symbol("20005") => "API signature does not exist",
            Symbol("20011") => "Two-step verification failed",
            Symbol("20014") => "SMS authentication failed",
            Symbol("30001") => "Please specify the order quantity",
            Symbol("30006") => "Please specify the order ID",
            Symbol("30007") => "Please specify the order ID array",
            Symbol("30009") => "Please specify the stock",
            Symbol("30012") => "Please specify the order price",
            Symbol("30013") => "Trade Please specify either",
            Symbol("30015") => "Please specify the order type",
            Symbol("30016") => "Please specify asset name",
            Symbol("30019") => "Please specify uuid",
            Symbol("30039") => "Please specify the amount to be withdrawn",
            Symbol("40001") => "The order quantity is invalid",
            Symbol("40006") => "Count value is invalid",
            Symbol("40007") => "End time is invalid",
            Symbol("40008") => "end_id Value is invalid",
            Symbol("40009") => "The from_id value is invalid",
            Symbol("40013") => "The order ID is invalid",
            Symbol("40014") => "The order ID array is invalid",
            Symbol("40015") => "Too many specified orders",
            Symbol("40017") => "Incorrect issue name",
            Symbol("40020") => "The order price is invalid",
            Symbol("40021") => "The trading classification is invalid",
            Symbol("40022") => "Start date is invalid",
            Symbol("40024") => "The order type is invalid",
            Symbol("40025") => "Incorrect asset name",
            Symbol("40028") => "uuid is invalid",
            Symbol("40048") => "The amount of withdrawal is illegal",
            Symbol("50003") => "Currently, this account is in a state where you can not perform the operation you specified. Please contact support",
            Symbol("50004") => "Currently, this account is temporarily registered. Please try again after registering your account",
            Symbol("50005") => "Currently, this account is locked. Please contact support",
            Symbol("50006") => "Currently, this account is locked. Please contact support",
            Symbol("50008") => "User identification has not been completed",
            Symbol("50009") => "Your order does not exist",
            Symbol("50010") => "Can not cancel specified order",
            Symbol("50011") => "API not found",
            Symbol("60001") => "The number of possessions is insufficient",
            Symbol("60002") => "It exceeds the quantity upper limit of the tender buying order",
            Symbol("60003") => "The specified quantity exceeds the limit",
            Symbol("60004") => "The specified quantity is below the threshold",
            Symbol("60005") => "The specified price is above the limit",
            Symbol("60006") => "The specified price is below the lower limit",
            Symbol("70001") => "A system error occurred. Please contact support",
            Symbol("70002") => "A system error occurred. Please contact support",
            Symbol("70003") => "A system error occurred. Please contact support",
            Symbol("70004") => "We are unable to accept orders as the transaction is currently suspended",
            Symbol("70005") => "Order can not be accepted because purchase order is currently suspended",
            Symbol("70006") => "We can not accept orders because we are currently unsubscribed ",
            Symbol("70009") => "We are currently temporarily restricting orders to be carried out. Please use the limit order.",
            Symbol("70010") => "We are temporarily raising the minimum order quantity as the system load is now rising."
        );
        code = safeString(data, "code");
        message = safeString(errorMessages, code, "Error");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, message);
        throw(ExchangeError(string(self.id, " ", json(response))));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitbank, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetPairTicker(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickersJpy(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "tickers_jpy", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairDepth(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairTransactions(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/transactions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairTransactionsYyyymmdd(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/transactions/{yyyymmdd}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairCandlestickCandletypeYyyymmdd(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/candlestick/{candletype}/{yyyymmdd}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairCircuitBreakInfo(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "{pair}/circuit_break_info", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetUserAssets(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/assets", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserSpotOrder(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserSpotActiveOrders(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/active_orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserMarginPositions(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/margin/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserSpotTradeHistory(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/trade_history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserDepositHistory(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/deposit_history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserUnconfirmedDeposits(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/unconfirmed_deposits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserDepositOriginators(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/deposit_originators", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserWithdrawalAccount(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/withdrawal_account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUserWithdrawalHistory(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/withdrawal_history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotStatus(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "spot/status", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSpotPairs(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "spot/pairs", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostUserSpotOrder(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserSpotCancelOrder(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/cancel_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserSpotCancelOrders(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/cancel_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserSpotOrdersInfo(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/spot/orders_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserConfirmDeposits(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/confirm_deposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserConfirmDepositsAll(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/confirm_deposits_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserRequestWithdrawal(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "user/request_withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function marketsGetSpotPairs(self::Bitbank, params=Dict(), context=Dict())
    return request(self, "spot/pairs", "markets", "GET", params, nothing, nothing, Dict())
end

function Bitbank(; kwargs...)
    inst = Bitbank(Exchange(), describe, fetchMarkets, parseMarket, parseTicker, fetchTicker, fetchOrderBook, parseTrade, fetchTrades, fetchTradingFees, parseOHLCV, fetchOHLCV, parseBalance, fetchBalance, parseOrderStatus, parseOrder, createOrder, cancelOrder, fetchOrder, fetchOpenOrders, fetchMyTrades, fetchDepositAddress, withdraw, parseTransaction, nonce, sign, handleErrors, publicGetPairTicker, publicGetTickers, publicGetTickersJpy, publicGetPairDepth, publicGetPairTransactions, publicGetPairTransactionsYyyymmdd, publicGetPairCandlestickCandletypeYyyymmdd, publicGetPairCircuitBreakInfo, privateGetUserAssets, privateGetUserSpotOrder, privateGetUserSpotActiveOrders, privateGetUserMarginPositions, privateGetUserSpotTradeHistory, privateGetUserDepositHistory, privateGetUserUnconfirmedDeposits, privateGetUserDepositOriginators, privateGetUserWithdrawalAccount, privateGetUserWithdrawalHistory, privateGetSpotStatus, privateGetSpotPairs, privatePostUserSpotOrder, privatePostUserSpotCancelOrder, privatePostUserSpotCancelOrders, privatePostUserSpotOrdersInfo, privatePostUserConfirmDeposits, privatePostUserConfirmDepositsAll, privatePostUserRequestWithdrawal, marketsGetSpotPairs)
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
