@kwdef mutable struct Btcmarkets <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTransactionsWithMethod::Function = fetchTransactionsWithMethod
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    parseTransaction::Function = parseTransaction
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTime::Function = fetchTime
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTicker2::Function = fetchTicker2
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    cancelOrders::Function = cancelOrders
    cancelOrder::Function = cancelOrder
    calculateFee::Function = calculateFee
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    withdraw::Function = withdraw
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetMarkets::Function = publicGetMarkets
    publicGetMarketsMarketIdTicker::Function = publicGetMarketsMarketIdTicker
    publicGetMarketsMarketIdTrades::Function = publicGetMarketsMarketIdTrades
    publicGetMarketsMarketIdOrderbook::Function = publicGetMarketsMarketIdOrderbook
    publicGetMarketsMarketIdCandles::Function = publicGetMarketsMarketIdCandles
    publicGetMarketsTickers::Function = publicGetMarketsTickers
    publicGetMarketsOrderbooks::Function = publicGetMarketsOrderbooks
    publicGetTime::Function = publicGetTime
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersId::Function = privateGetOrdersId
    privateGetBatchordersIds::Function = privateGetBatchordersIds
    privateGetTrades::Function = privateGetTrades
    privateGetTradesId::Function = privateGetTradesId
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetWithdrawalsId::Function = privateGetWithdrawalsId
    privateGetDeposits::Function = privateGetDeposits
    privateGetDepositsId::Function = privateGetDepositsId
    privateGetTransfers::Function = privateGetTransfers
    privateGetTransfersId::Function = privateGetTransfersId
    privateGetAddresses::Function = privateGetAddresses
    privateGetWithdrawalFees::Function = privateGetWithdrawalFees
    privateGetAssets::Function = privateGetAssets
    privateGetAccountsMeTradingFees::Function = privateGetAccountsMeTradingFees
    privateGetAccountsMeWithdrawalLimits::Function = privateGetAccountsMeWithdrawalLimits
    privateGetAccountsMeBalances::Function = privateGetAccountsMeBalances
    privateGetAccountsMeTransactions::Function = privateGetAccountsMeTransactions
    privateGetReportsId::Function = privateGetReportsId
    privatePostOrders::Function = privatePostOrders
    privatePostBatchorders::Function = privatePostBatchorders
    privatePostWithdrawals::Function = privatePostWithdrawals
    privatePostReports::Function = privatePostReports
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersId::Function = privateDeleteOrdersId
    privateDeleteBatchordersIds::Function = privateDeleteBatchordersIds
    privatePutOrdersId::Function = privatePutOrdersId

end
function describe(self::Btcmarkets, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "btcmarkets",
    Symbol("name") => "BTC Markets",
    Symbol("countries") => ["AU"],
    Symbol("rateLimit") => 1000,
    Symbol("version") => "v3",
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
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
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
        Symbol("fetchOrders") => true,
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
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/8c8d6907-3873-4cc4-ad20-e22fba28247e",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.btcmarkets.net",
            Symbol("private") => "https://api.btcmarkets.net"
        ),
        Symbol("www") => "https://btcmarkets.net",
        Symbol("doc") => ["https://api.btcmarkets.net/doc/v3", "https://github.com/BTCMarkets/API"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{marketId}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{marketId}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{marketId}/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{marketId}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/orderbooks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchorders/{ids}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawal-fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/me/trading-fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/me/withdrawal-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/me/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/me/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reports/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchorders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reports") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchorders/{ids}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("1h") => "1h",
        Symbol("1d") => "1d"
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
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
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
            Symbol("InsufficientFund") => InsufficientFunds,
            Symbol("InvalidPrice") => InvalidOrder,
            Symbol("InvalidAmount") => InvalidOrder,
            Symbol("MissingArgument") => BadRequest,
            Symbol("OrderAlreadyCancelled") => InvalidOrder,
            Symbol("OrderNotFound") => OrderNotFound,
            Symbol("OrderStatusIsFinal") => InvalidOrder,
            Symbol("InvalidPaginationParameter") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("percentage") => true,
        Symbol("tierBased") => true,
        Symbol("maker") => self.parseNumber("-0.0005"),
        Symbol("taker") => self.parseNumber("0.0020")
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fees") => Dict{Symbol, Any}(
            Symbol("AUD") => Dict{Symbol, Any}(
                Symbol("maker") => self.parseNumber("0.0085"),
                Symbol("taker") => self.parseNumber("0.0085")
            )
        )
    )
))

end
function fetchTransactionsWithMethod(self::Btcmarkets, method, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchDepositsWithdrawals(self::Btcmarkets, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsWithMethod("privateGetTransfers", code, since, limit, params))

end
function fetchDeposits(self::Btcmarkets, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsWithMethod("privateGetDeposits", code, since, limit, params))

end
function fetchWithdrawals(self::Btcmarkets, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsWithMethod("privateGetWithdrawals", code, since, limit, params))

end
function parseTransactionStatus(self::Btcmarkets, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Accepted") => "pending",
        Symbol("Pending Authorization") => "pending",
        Symbol("Complete") => "ok",
        Symbol("Cancelled") => "cancelled",
        Symbol("Failed") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Btcmarkets, type_var)
    statuses = Dict{Symbol, Any}(
        Symbol("Withdraw") => "withdrawal",
        Symbol("Deposit") => "deposit"
    );
    return safeString(statuses, type_var, type_var)

end
function parseTransaction(self::Btcmarkets, transaction, currency=nothing)
    timestamp = self.parse8601(safeString(transaction, "creationTime"));
    lastUpdate = self.parse8601(safeString(transaction, "lastUpdate"));
    type_var = self.parseTransactionType(safeStringLower(transaction, "type"));
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
    end
    cryptoPaymentDetail = self.safeDict(transaction, "paymentDetail", Dict{Symbol, Any}());
    txid = safeString(cryptoPaymentDetail, "txId");
    address = safeString(cryptoPaymentDetail, "address");
    tag = nothing;
    if functions.ccxtruthy(address != nothing)
        addressParts = split(address, "?dt=");
        numParts = length(addressParts);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
            address = get(addressParts, 1, nothing);
            tag = get(addressParts, 2, nothing);
        end
    end
    addressTo = address;
    tagTo = tag;
    addressFrom = nothing;
    tagFrom = nothing;
    fee = safeString(transaction, "fee");
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    currencyId = safeString(transaction, "assetName");
    code = self.safeCurrencyCode(currencyId);
    amount = safeString(transaction, "amount");
    if functions.ccxtruthy(fee)
        amount = stringSub(amount, fee);
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => tag,
    Symbol("tagTo") => tagTo,
    Symbol("tagFrom") => tagFrom,
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => lastUpdate,
    Symbol("comment") => safeString(transaction, "description"),
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(fee),
        Symbol("rate") => nothing
    ),
    Symbol("info") => transaction
)

end
function fetchMarkets(self::Btcmarkets, params=Dict())
    response = Base.fetch(self.publicGetMarkets(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Btcmarkets, market)
    baseId = safeString(market, "baseAssetName");
    quoteId = safeString(market, "quoteAssetName");
    id = safeString(market, "marketId");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    fees = safeValue(self.safeDict(self.options, "fees", Dict{Symbol, Any}()), quote_var, self.fees);
    pricePrecision = self.parseNumber(self.parsePrecision(safeString(market, "priceDecimals")));
    minAmount = self.safeNumber(market, "minOrderAmount");
    maxAmount = self.safeNumber(market, "maxOrderAmount");
    status = safeString(market, "status");
    minPrice = nothing;
    if functions.ccxtruthy(quote_var == "AUD")
        minPrice = pricePrecision;
    end
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
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
    Symbol("active") => (status == "Online"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => get(fees, Symbol("taker"), nothing),
    Symbol("maker") => get(fees, Symbol("maker"), nothing),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "amountDecimals"))),
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => maxAmount
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => minPrice,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchTime(self::Btcmarkets, params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return self.parse8601(safeString(response, "timestamp"))

end
function parseBalance(self::Btcmarkets, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "assetName");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("used")] = safeString(balance, "locked");
        account[Symbol("total")] = safeString(balance, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Btcmarkets, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountsMeBalances(params));
    return self.parseBalance(response)

end
function parseOHLCV(self::Btcmarkets, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, 0)), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Btcmarkets, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("marketId") => get(market, Symbol("id"), nothing),
        Symbol("timeWindow") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 200);
    end
    response = Base.fetch(self.publicGetMarketsMarketIdCandles(extend(request, params)));
    return self.parseOHLCVs(toArray(response), market, timeframe, since, limit)

end
function fetchOrderBook(self::Btcmarkets, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("marketId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsMarketIdOrderbook(extend(request, params)));
    timestamp = safeIntegerProduct(response, "snapshotId", 0.001);
    orderbook = self.parseOrderBook(response, symbol, timestamp);
    orderbook[Symbol("nonce")] = safeInteger(response, "snapshotId");
    return orderbook

end
function parseTicker(self::Btcmarkets, ticker, market=nothing)
    marketId = safeString(ticker, "marketId");
    market = self.safeMarket(marketId, market, "-");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = self.parse8601(safeString(ticker, "timestamp"));
    last_var = safeString(ticker, "lastPrice");
    baseVolume = safeString(ticker, "volume24h");
    quoteVolume = safeString(ticker, "volumeQte24h");
    change = safeString(ticker, "price24h");
    percentage = safeString(ticker, "pricePct24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high24h"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bestBid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "bestAsk"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Btcmarkets, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("marketId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsMarketIdTicker(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTicker2(self::Btcmarkets, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsMarketIdTicker(extend(request, params)));
    return self.parseTicker(response, market)

end
function parseTrade(self::Btcmarkets, trade, market=nothing)
    timestamp = self.parse8601(safeString(trade, "timestamp"));
    marketId = safeString(trade, "marketId");
    market = self.safeMarket(marketId, market, "-");
    feeCurrencyCode = functions.ccxtruthy((get(market, Symbol("quote"), nothing) == "AUD")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
    side = safeString(trade, "side");
    if functions.ccxtruthy(side == "Bid")
        side = "buy";
    elseif functions.ccxtruthy(side == "Ask")
        side = "sell";
    end
    id = safeString(trade, "id");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    orderId = safeString(trade, "orderId");
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    takerOrMaker = safeStringLower(trade, "liquidityType");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => orderId,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Btcmarkets, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("marketId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsMarketIdTrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function createOrder(self::Btcmarkets, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("marketId") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("side") => functions.ccxtruthy((side == "buy")) ? "Bid" : "Ask"
    );
    lowercaseType = lowercase(type_var);
    orderTypes = safeValue(self.options, "orderTypes", Dict{Symbol, Any}(
        Symbol("limit") => "Limit",
        Symbol("market") => "Market",
        Symbol("stop") => "Stop",
        Symbol("stop limit") => "Stop Limit",
        Symbol("take profit") => "Take Profit"
    ));
    request[Symbol("type")] = safeString(orderTypes, lowercaseType, type_var);
    priceIsRequired = false;
    triggerPriceIsRequired = false;
    if functions.ccxtruthy(lowercaseType == "limit")
        priceIsRequired = true;
    elseif functions.ccxtruthy(lowercaseType == "stop limit")
        triggerPriceIsRequired = true;
        priceIsRequired = true;
    else
        if functions.ccxtruthy(lowercaseType == "take profit")
            triggerPriceIsRequired = true;
        elseif functions.ccxtruthy(lowercaseType == "stop")
            triggerPriceIsRequired = true;
        end

    end
    if functions.ccxtruthy(priceIsRequired)
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for a ", type_var, "order")));
        else
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
    end
    if functions.ccxtruthy(triggerPriceIsRequired)
        triggerPrice = self.safeNumber(params, "triggerPrice");
        params = omit(params, "triggerPrice");
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice parameter for a ", type_var, "order")));
        else
            request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    end
    params = omit(params, "clientOrderId");
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    return self.parseOrder(response, market)

end
function cancelOrders(self::Btcmarkets, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    numericIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(numericIds, ccxt_parseInt(get(ids, i + 1, nothing)));
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("ids") => numericIds
    );
    response = Base.fetch(self.privateDeleteBatchordersIds(extend(request, params)));
    cancelOrders = self.safeList(response, "cancelOrders", []);
    unprocessedRequests = self.safeList(response, "unprocessedRequests", []);
    orders = arrayConcat(cancelOrders, unprocessedRequests);
    return self.parseOrders(orders)

end
function cancelOrder(self::Btcmarkets, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateDeleteOrdersId(extend(request, params)));
    return self.parseOrder(response)

end
function calculateFee(self::Btcmarkets, symbol, type_var, side, amount, price, takerOrMaker="taker", params=Dict())
    market = self.market(symbol);
    currency = nothing;
    cost = nothing;
    if functions.ccxtruthy(get(market, Symbol("quote"), nothing) == "AUD")
        currency = get(market, Symbol("quote"), nothing);
        amountString = numberToString(amount);
        priceString = numberToString(price);
        otherUnitsAmount = stringMul(amountString, priceString);
        cost = self.costToPrecision(symbol, otherUnitsAmount);
    else
        currency = get(market, Symbol("base"), nothing);
        cost = self.amountToPrecision(symbol, amount);
    end
    rate = safeValue(market, takerOrMaker);
    rateCost = stringMul(numberToString(rate), cost);
    feeCost = self.feeToPrecision(symbol, rateCost);
    if functions.ccxtruthy(feeCost == nothing)
        feeCost = "0";
    end
    return Dict{Symbol, Any}(
    Symbol("type") => takerOrMaker,
    Symbol("currency") => currency,
    Symbol("rate") => rate,
    Symbol("cost") => ccxt_toNumber(feeCost)
)

end
function parseOrderStatus(self::Btcmarkets, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Accepted") => "open",
        Symbol("Placed") => "open",
        Symbol("Partially Matched") => "open",
        Symbol("Fully Matched") => "closed",
        Symbol("Cancelled") => "canceled",
        Symbol("Partially Cancelled") => "canceled",
        Symbol("Failed") => "rejected"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Btcmarkets, order, market=nothing)
    timestamp = self.parse8601(safeString(order, "creationTime"));
    marketId = safeString(order, "marketId");
    market = self.safeMarket(marketId, market, "-");
    side = safeString(order, "side");
    if functions.ccxtruthy(side == "Bid")
        side = "buy";
    elseif functions.ccxtruthy(side == "Ask")
        side = "sell";
    end
    type_var = safeStringLower(order, "type");
    price = safeString(order, "price");
    amount = safeString(order, "amount");
    remaining = safeString(order, "openAmount");
    status = self.parseOrderStatus(safeString(order, "status"));
    id = safeString(order, "orderId");
    clientOrderId = safeString(order, "clientOrderId");
    timeInForce = safeString(order, "timeInForce");
    postOnly = self.safeBool(order, "postOnly");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => self.safeNumber(order, "triggerPrice"),
    Symbol("cost") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("average") => nothing,
    Symbol("status") => status,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchOrder(self::Btcmarkets, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrdersId(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOrders(self::Btcmarkets, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("status") => "all"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("marketId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Btcmarkets, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchClosedOrders(self::Btcmarkets, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrders(symbol, since, limit, params));
    return filterBy(orders, "status", "closed")

end
function fetchMyTrades(self::Btcmarkets, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("marketId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function withdraw(self::Btcmarkets, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("assetName") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(code != "AUD")
        self.checkAddress(address);
        request[Symbol("toAddress")] = address;
    end
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("toAddress")] = string(address, "?dt=", tag);
    end
    response = Base.fetch(self.privatePostWithdrawals(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function nonce(self::Btcmarkets, )
    return milliseconds()

end
function sign(self::Btcmarkets, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", self.version, "/", self.implodeParams(path, params));
    query = keysort(omit(params, self.extractParams(path)));
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        secret = self.base64ToBinary(self.secret);
        auth = string(method, request, nonce);
        if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
            if functions.ccxtruthy(length(objectKeys(query)))
                request += string("?", self.urlencode(query));
            end
        else
            body = json(query);
            auth += body;
        end
        signature = self.hmac(self.encode(auth), secret, sha512, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("Accept") => "application/json",
            Symbol("Accept-Charset") => "UTF-8",
            Symbol("Content-Type") => "application/json",
            Symbol("BM-AUTH-APIKEY") => self.apiKey,
            Symbol("BM-AUTH-TIMESTAMP") => nonce,
            Symbol("BM-AUTH-SIGNATURE") => signature
        );
    elseif functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            request += string("?", self.urlencode(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), request);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Btcmarkets, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeString(response, "code");
    message = safeString(response, "message");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Btcmarkets, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarkets(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsMarketIdTicker(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/{marketId}/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsMarketIdTrades(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/{marketId}/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsMarketIdOrderbook(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/{marketId}/orderbook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsMarketIdCandles(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/{marketId}/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsTickers(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketsOrderbooks(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "markets/orderbooks", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTime(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetOrders(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBatchordersIds(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "batchorders/{ids}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTrades(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradesId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "trades/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawals(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawalsId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "withdrawals/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDeposits(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "deposits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDepositsId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "deposits/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTransfers(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "transfers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTransfersId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "transfers/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAddresses(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "addresses", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdrawalFees(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "withdrawal-fees", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssets(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "assets", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsMeTradingFees(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "accounts/me/trading-fees", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsMeWithdrawalLimits(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "accounts/me/withdrawal-limits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsMeBalances(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "accounts/me/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsMeTransactions(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "accounts/me/transactions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetReportsId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "reports/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostOrders(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBatchorders(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "batchorders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawals(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReports(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "reports", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteOrders(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOrdersId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteBatchordersIds(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "batchorders/{ids}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privatePutOrdersId(self::Btcmarkets, params=Dict(), context=Dict())
    return request(self, "orders/{id}", "private", "PUT", params, nothing, nothing, Dict())
end

function Btcmarkets(; kwargs...)
    inst = Btcmarkets(Exchange(), describe, fetchTransactionsWithMethod, fetchDepositsWithdrawals, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransactionType, parseTransaction, fetchMarkets, parseMarket, fetchTime, parseBalance, fetchBalance, parseOHLCV, fetchOHLCV, fetchOrderBook, parseTicker, fetchTicker, fetchTicker2, parseTrade, fetchTrades, createOrder, cancelOrders, cancelOrder, calculateFee, parseOrderStatus, parseOrder, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchMyTrades, withdraw, nonce, sign, handleErrors, publicGetMarkets, publicGetMarketsMarketIdTicker, publicGetMarketsMarketIdTrades, publicGetMarketsMarketIdOrderbook, publicGetMarketsMarketIdCandles, publicGetMarketsTickers, publicGetMarketsOrderbooks, publicGetTime, privateGetOrders, privateGetOrdersId, privateGetBatchordersIds, privateGetTrades, privateGetTradesId, privateGetWithdrawals, privateGetWithdrawalsId, privateGetDeposits, privateGetDepositsId, privateGetTransfers, privateGetTransfersId, privateGetAddresses, privateGetWithdrawalFees, privateGetAssets, privateGetAccountsMeTradingFees, privateGetAccountsMeWithdrawalLimits, privateGetAccountsMeBalances, privateGetAccountsMeTransactions, privateGetReportsId, privatePostOrders, privatePostBatchorders, privatePostWithdrawals, privatePostReports, privateDeleteOrders, privateDeleteOrdersId, privateDeleteBatchordersIds, privatePutOrdersId)
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
