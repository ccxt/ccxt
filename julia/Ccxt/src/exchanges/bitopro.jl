@kwdef mutable struct Bitopro <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    insertMissingCandles::Function = insertMissingCandles
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    parseCancelOrders::Function = parseCancelOrders
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchWithdrawal::Function = fetchWithdrawal
    withdraw::Function = withdraw
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOrderBookPair::Function = publicGetOrderBookPair
    publicGetTickers::Function = publicGetTickers
    publicGetTickersPair::Function = publicGetTickersPair
    publicGetTradesPair::Function = publicGetTradesPair
    publicGetProvisioningCurrencies::Function = publicGetProvisioningCurrencies
    publicGetProvisioningTradingPairs::Function = publicGetProvisioningTradingPairs
    publicGetProvisioningLimitationsAndFees::Function = publicGetProvisioningLimitationsAndFees
    publicGetTradingHistoryPair::Function = publicGetTradingHistoryPair
    publicGetPriceOtcCurrency::Function = publicGetPriceOtcCurrency
    privateGetAccountsBalance::Function = privateGetAccountsBalance
    privateGetOrdersHistory::Function = privateGetOrdersHistory
    privateGetOrdersAllPair::Function = privateGetOrdersAllPair
    privateGetOrdersTradesPair::Function = privateGetOrdersTradesPair
    privateGetOrdersPairOrderId::Function = privateGetOrdersPairOrderId
    privateGetWalletWithdrawCurrencySerial::Function = privateGetWalletWithdrawCurrencySerial
    privateGetWalletWithdrawCurrencyIdId::Function = privateGetWalletWithdrawCurrencyIdId
    privateGetWalletDepositHistoryCurrency::Function = privateGetWalletDepositHistoryCurrency
    privateGetWalletWithdrawHistoryCurrency::Function = privateGetWalletWithdrawHistoryCurrency
    privateGetOrdersOpen::Function = privateGetOrdersOpen
    privatePostOrdersPair::Function = privatePostOrdersPair
    privatePostOrdersBatch::Function = privatePostOrdersBatch
    privatePostWalletWithdrawCurrency::Function = privatePostWalletWithdrawCurrency
    privatePutOrders::Function = privatePutOrders
    privateDeleteOrdersPairId::Function = privateDeleteOrdersPairId
    privateDeleteOrdersAll::Function = privateDeleteOrdersAll
    privateDeleteOrdersPair::Function = privateDeleteOrdersPair

end
function describe(self::Bitopro, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitopro",
    Symbol("name") => "BitoPro",
    Symbol("countries") => ["TW"],
    Symbol("version") => "v3",
    Symbol("rateLimit") => 100,
    Symbol("pro") => true,
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
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
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
        Symbol("fetchOrderTrades") => false,
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
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
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
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("3h") => "3h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/affc6337-b95a-44bf-aacd-04f9722364f6",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.bitopro.com/v3"
        ),
        Symbol("www") => "https://www.bitopro.com",
        Symbol("doc") => ["https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md"],
        Symbol("fees") => "https://www.bitopro.com/fees"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("order-book/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("provisioning/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("provisioning/trading-pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("provisioning/limitations-and-fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trading-history/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("price/otc/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/all/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/trades/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{pair}/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/withdraw/{currency}/{serial}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/withdraw/{currency}/id/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/depositHistory/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/withdrawHistory/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 20 / 3
),
                Symbol("wallet/withdraw/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders/{pair}/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("orders/all") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("orders/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("3000000"), self.parseNumber("0.00194")], [self.parseNumber("5000000"), self.parseNumber("0.0015")], [self.parseNumber("30000000"), self.parseNumber("0.0014")], [self.parseNumber("300000000"), self.parseNumber("0.0013")], [self.parseNumber("550000000"), self.parseNumber("0.0012")], [self.parseNumber("1300000000"), self.parseNumber("0.0011")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("3000000"), self.parseNumber("0.00097")], [self.parseNumber("5000000"), self.parseNumber("0.0007")], [self.parseNumber("30000000"), self.parseNumber("0.0006")], [self.parseNumber("300000000"), self.parseNumber("0.0005")], [self.parseNumber("550000000"), self.parseNumber("0.0004")], [self.parseNumber("1300000000"), self.parseNumber("0.0003")]]
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ERC20",
            Symbol("ETH") => "ERC20",
            Symbol("TRX") => "TRX",
            Symbol("TRC20") => "TRX",
            Symbol("BEP20") => "BSC",
            Symbol("BSC") => "BSC"
        ),
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("fiatCurrencies") => ["TWD"]
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => true,
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
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
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
            Symbol("Unsupported currency.") => BadRequest,
            Symbol("Unsupported order type") => BadRequest,
            Symbol("Invalid body") => BadRequest,
            Symbol("Invalid Signature") => AuthenticationError,
            Symbol("Address not in whitelist.") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Invalid amount") => InvalidOrder,
            Symbol("Balance for ") => InsufficientFunds,
            Symbol("Invalid ") => BadRequest,
            Symbol("Wrong parameter") => BadRequest
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}()
))

end
"""
fetches all available currencies on an exchange
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitopro; params=Dict())
    response = Base.fetch(self.publicGetProvisioningCurrencies(params));
    currencies = self.safeList(response, "data", defaultValue = []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Bitopro, rawCurrency)
    fiatCurrencies = self.handleOption("fetchCurrencies", "fiatCurrencies", defaultValue = []);
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    deposit = self.safeBool(rawCurrency, "deposit");
    withdraw = self.safeBool(rawCurrency, "withdraw");
    isFiat = inArray(code, fiatCurrencies);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("name") => nothing,
    Symbol("active") => @functions.ccxt_and(deposit, withdraw),
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdraw,
    Symbol("fee") => self.safeNumber(rawCurrency, "withdrawFee"),
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "minWithdraw"),
            Symbol("max") => self.safeNumber(rawCurrency, "maxWithdraw")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => nothing
))

end
"""
retrieves data on all markets for bitopro
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trading_pair_info.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitopro; params=Dict())
    response = Base.fetch(self.publicGetProvisioningTradingPairs());
    markets = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(markets)

end
function parseMarket(self::Bitopro, market)
    active = !functions.ccxtruthy(self.safeBool(market, "maintain"));
    id = safeString(market, "pair");
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing id")));
    end
    uppercaseId = uppercase(id);
    baseId = safeString(market, "base");
    quoteId = safeString(market, "quote");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    limits = Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLimitBaseAmount"),
            Symbol("max") => self.safeNumber(market, "maxLimitBaseAmount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
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
    );
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("uppercaseId") => uppercaseId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => base,
    Symbol("quoteId") => quote_var,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("limits") => limits,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quotePrecision"))),
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "basePrecision")))
    ),
    Symbol("active") => active,
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseTicker(self::Bitopro, ticker; market=nothing)
    marketId = safeString(ticker, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = safeString(market, "symbol");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(ticker, "high24hr"),
    Symbol("low") => safeString(ticker, "low24hr"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => safeString(ticker, "lastPrice"),
    Symbol("last") => safeString(ticker, "lastPrice"),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "priceChange24hr"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume24hr"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bitopro, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersPair(extend(request, params)));
    ticker = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bitopro; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTickers());
    tickers = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(tickers, symbols = symbols)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_orderbook_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitopro, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetOrderBookPair(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "amount")

end
function parseTrade(self::Bitopro, trade; market=nothing)
    id = safeString(trade, "tradeId");
    orderId = safeString(trade, "orderId");
    timestamp = nothing;
    if functions.ccxtruthy(id == nothing)
        timestamp = safeTimestamp(trade, "timestamp");
    else
        timestamp = safeInteger(trade, "timestamp");
    end
    marketId = safeString(trade, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = safeString(market, "symbol");
    price = safeString(trade, "price");
    type_var = safeStringLower(trade, "type");
    side = safeStringLower(trade, "action");
    if functions.ccxtruthy(side == nothing)
        isBuyer = self.safeBool(trade, "isBuyer");
        if functions.ccxtruthy(isBuyer)
            side = "buy";
        else
            side = "sell";
        end
    end
    amount = safeString(trade, "amount");
    if functions.ccxtruthy(amount == nothing)
        amount = safeString(trade, "baseAmount");
    end
    fee = nothing;
    feeAmount = safeString(trade, "fee");
    feeSymbol = self.safeCurrencyCode(safeString(trade, "feeSymbol"));
    if functions.ccxtruthy(feeAmount != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeAmount,
            Symbol("currency") => feeSymbol,
            Symbol("rate") => nothing
        );
    end
    isTaker = self.safeBool(trade, "isTaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isTaker != nothing)
        if functions.ccxtruthy(isTaker)
            takerOrMaker = "taker";
        else
            takerOrMaker = "maker";
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trades_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bitopro, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradesPair(extend(request, params)));
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_limitations_and_fees.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bitopro; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetProvisioningLimitationsAndFees(params));
    tradingFeeRate = self.safeDict(response, "tradingFeeRate", defaultValue = Dict{Symbol, Any}());
    first_var = safeValue(tradingFeeRate, 0);
    result = Dict{Symbol, Any}();
    maker = self.safeNumber(first_var, "makerFee");
    taker = self.safeNumber(first_var, "takerFee");
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => first_var,
            Symbol("symbol") => symbol,
            Symbol("maker") => maker,
            Symbol("taker") => taker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
function parseOHLCV(self::Bitopro, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ohlc_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitopro, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    resolution = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => resolution
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 500;
    else
        limit = min(limit, 75000);
    end
    timeframeInSeconds = self.parseTimeframe(timeframe);
    alignedSince = nothing;
    if functions.ccxtruthy(since == nothing)
        request[Symbol("to")] = seconds();
        request[Symbol("from")] = get(request, Symbol("to"), nothing) - (limit * timeframeInSeconds);
    else
        timeframeInMilliseconds = timeframeInSeconds * 1000;
        alignedSince = floor(since / timeframeInMilliseconds) * timeframeInMilliseconds;
        request[Symbol("from")] = floor(since / 1000);
        request[Symbol("to")] = self.sum(get(request, Symbol("from"), nothing), limit * timeframeInSeconds);
    end
    response = Base.fetch(self.publicGetTradingHistoryPair(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    sparse = self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit);
    return self.insertMissingCandles(sparse, timeframeInSeconds, alignedSince, limit)

end
function insertMissingCandles(self::Bitopro, candles, distance, since, limit)
    len = length(candles);
    if functions.ccxtruthy(len == 0)
            return candles
    end
    result = [];
    copyFrom = get(candles, 1, nothing);
    timestamp = nothing;
    if functions.ccxtruthy(since == nothing)
        timestamp = get(copyFrom, 1, nothing);
    else
        timestamp = since;
    end
    i = 0;
    candleLength = length(candles);
    resultLength = 0;
    while functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_lt(resultLength, limit)), (functions.ccxt_lt(i, candleLength))))
        candle = get(candles, i + 1, nothing);
        if functions.ccxtruthy(get(candle, 1, nothing) == timestamp)
                        push!(result, candle);
            i = self.sum(i, 1);
        else
            copy_var = arrayConcat([], copyFrom);
            copy_var[1] = timestamp;
            copy_var[2] = get(copy_var, 5, nothing);
            copy_var[3] = get(copy_var, 5, nothing);
            copy_var[4] = get(copy_var, 5, nothing);
            copy_var[6] = self.parseNumber("0");
            push!(result, copy_var);
        end
        timestamp = self.sum(timestamp, distance * 1000);
        resultLength = length(result);
        copyFrom = get(result, resultLength - 1 + 1, nothing);
    end
    return result

end
function parseBalance(self::Bitopro, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        amount = safeString(balance, "amount");
        available = safeString(balance, "available");
        account = Dict{Symbol, Any}(
            Symbol("free") => available,
            Symbol("total") => amount
        );
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_account_balance.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bitopro; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountsBalance(params));
    balances = self.safeList(response, "data", defaultValue = []);
    return self.parseBalance(balances)

end
function parseOrderStatus(self::Bitopro, status)
    statuses = Dict{Symbol, Any}(
        Symbol("-1") => "open",
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "closed",
        Symbol("3") => "closed",
        Symbol("4") => "canceled",
        Symbol("6") => "canceled"
    );
    return functions.ccxtruthy((status == nothing)) ? nothing : safeString(statuses, status)

end
function parseOrder(self::Bitopro, order; market=nothing)
    id = safeString2(order, "id", "orderId");
    timestamp = safeInteger2(order, "timestamp", "createdTimestamp");
    side = safeString(order, "action");
    if functions.ccxtruthy(side == nothing)
        throw(ExchangeError(string(self.id, " parseOrder() returned no side")));
    end
    side = lowercase(side);
    amount = safeString2(order, "amount", "originalAmount");
    price = safeString(order, "price");
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = safeString(market, "symbol");
    orderStatus = safeString(order, "status");
    status = self.parseOrderStatus(orderStatus);
    type_var = safeStringLower(order, "type");
    average = safeString(order, "avgExecutionPrice");
    filled = safeString(order, "executedAmount");
    remaining = safeString(order, "remainingAmount");
    timeInForce = safeString(order, "timeInForce");
    postOnly = nothing;
    if functions.ccxtruthy(timeInForce == "POST_ONLY")
        postOnly = true;
    end
    fee = nothing;
    feeAmount = safeString(order, "fee");
    feeSymbol = self.safeCurrencyCode(safeString(order, "feeSymbol"));
    if functions.ccxtruthy(stringGt(feeAmount, "0"))
        fee = Dict{Symbol, Any}(
            Symbol("currency") => feeSymbol,
            Symbol("cost") => feeAmount
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => safeInteger(order, "updatedTimestamp"),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("info") => order
), market = market)

end
"""
create a trade order
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_order.md

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::object, optional: the price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bitopro, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => type_var,
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("action") => side,
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("timestamp") => milliseconds()
    );
    orderType = uppercase(type_var);
    if functions.ccxtruthy(orderType == "LIMIT")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(orderType == "STOP_LIMIT")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
        params = omit(params, ["triggerPrice", "stopPrice"]);
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a triggerPrice parameter for ", orderType, " orders")));
        else
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
        condition = safeString(params, "condition");
        if functions.ccxtruthy(condition == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a condition parameter for ", orderType, " orders")));
        else
            request[Symbol("condition")] = condition;
        end
    end
    postOnly = self.isPostOnly(orderType == "MARKET", nothing, params = params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("timeInForce")] = "POST_ONLY";
    end
    response = Base.fetch(self.privatePostOrdersPair(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_an_order.md

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bitopro, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateDeleteOrdersPairId(extend(request, params)));
    return self.parseOrder(response, market = market)

end
function parseCancelOrders(self::Bitopro, data)
    dataKeys = objectKeys(data);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(dataKeys)))
        marketId = get(dataKeys, i + 1, nothing);
        orderIds = get(data, Symbol(marketId), nothing);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(orderIds)))
            push!(orders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => get(orderIds, j + 1, nothing),
    Symbol("id") => get(orderIds, j + 1, nothing),
    Symbol("symbol") => self.safeSymbol(marketId)
)));
            j += 1
        end
        i += 1
    end
    return orders

end
"""
cancel multiple orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_batch_orders.md

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bitopro, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    id = get(market, Symbol("uppercaseId"), nothing);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(id != nothing)
        request[Symbol(id)] = ids;
    end
    response = Base.fetch(self.privatePutOrders(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseCancelOrders(data)

end
"""
cancel all open orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_all_orders.md

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bitopro; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateDeleteOrdersPair(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteOrdersAll(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseCancelOrders(data)

end
"""
fetches information on an order made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_order_data.md

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bitopro, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id,
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetOrdersPairOrderId(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
fetches information on multiple orders made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bitopro; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTimestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOrdersAllPair(extend(request, params)));
    orders = self.safeList(response, "data", defaultValue = []);
    if functions.ccxtruthy(orders == nothing)
        orders = [];
    end
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_open_orders_data.md

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bitopro; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOrdersOpen(extend(request, params)));
    orders = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bitopro; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("statusKind") => "DONE"
    );
    return self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params))

end
"""
fetch all trades made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_trades_data.md

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bitopro; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetOrdersTradesPair(extend(request, params)));
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTransactionStatus(self::Bitopro, status)
    states = Dict{Symbol, Any}(
        Symbol("COMPLETE") => "ok",
        Symbol("INVALID") => "failed",
        Symbol("PROCESSING") => "pending",
        Symbol("WAIT_PROCESS") => "pending",
        Symbol("FAILED") => "failed",
        Symbol("EXPIRED") => "failed",
        Symbol("CANCELLED") => "failed",
        Symbol("EMAIL_VERIFICATION") => "pending",
        Symbol("WAIT_CONFIRMATION") => "pending"
    );
    return safeString(states, status, status)

end
function parseTransaction(self::Bitopro, transaction; currency=nothing)
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transaction, "timestamp");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "message");
    status = safeString(transaction, "status");
    networkId = safeString(transaction, "protocol");
    if functions.ccxtruthy(networkId == "MAIN")
        networkId = code;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "serial"),
    Symbol("txid") => safeString(transaction, "txid"),
    Symbol("type") => nothing,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("amount") => self.safeNumber(transaction, "total"),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(transaction, "fee"),
        Symbol("rate") => nothing
    )
)

end
"""
fetch all deposits made to an account
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_deposit_invoices_data.md

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bitopro; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDeposits() requires the code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTimestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWalletDepositHistoryCurrency(extend(request, params)));
    result = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(result, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
"""
fetch all withdrawals made from an account
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_withdraw_invoices_data.md

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bitopro; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchWithdrawals() requires the code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTimestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWalletWithdrawHistoryCurrency(extend(request, params)));
    result = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(result, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_withdraw_invoice_data.md

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawal(self::Bitopro, id; code=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchWithdrawal() requires the code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("serial") => id,
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetWalletWithdrawCurrencySerial(extend(request, params)));
    result = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(result, currency = currency)

end
"""
make a withdrawal
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_withdraw_invoice.md

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bitopro, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(ccxt_in("network", params))
        networks = self.safeDict(self.options, "networks", defaultValue = Dict{Symbol, Any}());
        requestedNetwork = safeStringUpper(params, "network");
        params = omit(params, ["network"]);
        networkId = functions.ccxtruthy((requestedNetwork == nothing)) ? nothing : safeString(networks, requestedNetwork);
        if functions.ccxtruthy(networkId == nothing)
            throw(ExchangeError(string(self.id, " invalid network ", requestedNetwork)));
        end
        request[Symbol("protocol")] = networkId;
    end
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("message")] = tag;
    end
    response = Base.fetch(self.privatePostWalletWithdrawCurrency(extend(request, params)));
    result = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(result, currency = currency)

end
function parseDepositWithdrawFee(self::Bitopro, fee; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("withdraw") => Dict{Symbol, Any}(
        Symbol("fee") => self.safeNumber(fee, "withdrawFee"),
        Symbol("percentage") => false
    ),
    Symbol("deposit") => Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    ),
    Symbol("networks") => Dict{Symbol, Any}()
)

end
"""
fetch deposit and withdraw fees
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bitopro; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetProvisioningCurrencies(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseDepositWithdrawFees(data, codes = codes, currencyIdKey = "currency")

end
function sign(self::Bitopro, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(headers == nothing)
        headers = Dict{Symbol, Any}();
    end
    headers[Symbol("X-BITOPRO-API")] = "ccxt";
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        if functions.ccxtruthy(@functions.ccxt_or(method == "POST", method == "PUT"))
            body = json(params);
            payload = self.stringToBase64(body);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha384);
            headers[Symbol("X-BITOPRO-APIKEY")] = self.apiKey;
            headers[Symbol("X-BITOPRO-PAYLOAD")] = payload;
            headers[Symbol("X-BITOPRO-SIGNATURE")] = signature;
        elseif functions.ccxtruthy(@functions.ccxt_or(method == "GET", method == "DELETE"))
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
            nonce = milliseconds();
            rawData = Dict{Symbol, Any}(
                Symbol("nonce") => nonce
            );
            data = json(rawData);
            payload = self.stringToBase64(data);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha384);
            headers[Symbol("X-BITOPRO-APIKEY")] = self.apiKey;
            headers[Symbol("X-BITOPRO-PAYLOAD")] = payload;
            headers[Symbol("X-BITOPRO-SIGNATURE")] = signature;
        end
    elseif functions.ccxtruthy(@functions.ccxt_and(api == "public", method == "GET"))
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), url);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitopro, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(@functions.ccxt_and(functions.ccxt_ge(code, 200), functions.ccxt_lt(code, 300)))
            return nothing
    end
    feedback = string(self.id, " ", body);
    error = safeString(response, "error");
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
    throw(ExchangeError(feedback));

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitopro, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOrderBookPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "order-book/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickers(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickersPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "tickers/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradesPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "trades/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProvisioningCurrencies(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "provisioning/currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProvisioningTradingPairs(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "provisioning/trading-pairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProvisioningLimitationsAndFees(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "provisioning/limitations-and-fees"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradingHistoryPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "trading-history/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPriceOtcCurrency(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "price/otc/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsBalance(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "accounts/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersHistory(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersAllPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/all/{pair}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersTradesPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/trades/{pair}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersPairOrderId(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/{pair}/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletWithdrawCurrencySerial(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "wallet/withdraw/{currency}/{serial}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletWithdrawCurrencyIdId(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "wallet/withdraw/{currency}/id/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletDepositHistoryCurrency(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "wallet/depositHistory/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletWithdrawHistoryCurrency(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "wallet/withdrawHistory/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOpen(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/open"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/{pair}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersBatch(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletWithdrawCurrency(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "wallet/withdraw/{currency}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutOrders(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersPairId(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/{pair}/{id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersAll(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/all"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersPair(self::Bitopro, params=Dict(), context=Dict())
    return request(self, "orders/{pair}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitopro(; kwargs...)
    inst = Bitopro(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseTicker, fetchTicker, fetchTickers, fetchOrderBook, parseTrade, fetchTrades, fetchTradingFees, parseOHLCV, fetchOHLCV, insertMissingCandles, parseBalance, fetchBalance, parseOrderStatus, parseOrder, createOrder, cancelOrder, parseCancelOrders, cancelOrders, cancelAllOrders, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchMyTrades, parseTransactionStatus, parseTransaction, fetchDeposits, fetchWithdrawals, fetchWithdrawal, withdraw, parseDepositWithdrawFee, fetchDepositWithdrawFees, sign, handleErrors, publicGetOrderBookPair, publicGetTickers, publicGetTickersPair, publicGetTradesPair, publicGetProvisioningCurrencies, publicGetProvisioningTradingPairs, publicGetProvisioningLimitationsAndFees, publicGetTradingHistoryPair, publicGetPriceOtcCurrency, privateGetAccountsBalance, privateGetOrdersHistory, privateGetOrdersAllPair, privateGetOrdersTradesPair, privateGetOrdersPairOrderId, privateGetWalletWithdrawCurrencySerial, privateGetWalletWithdrawCurrencyIdId, privateGetWalletDepositHistoryCurrency, privateGetWalletWithdrawHistoryCurrency, privateGetOrdersOpen, privatePostOrdersPair, privatePostOrdersBatch, privatePostWalletWithdrawCurrency, privatePutOrders, privateDeleteOrdersPairId, privateDeleteOrdersAll, privateDeleteOrdersPair)
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
function __ccxt_doc_Bitopro_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitopro_fetchCurrencies

function __ccxt_doc_Bitopro_fetchMarkets() end
"""
retrieves data on all markets for bitopro
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trading_pair_info.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitopro_fetchMarkets

function __ccxt_doc_Bitopro_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitopro_fetchTicker

function __ccxt_doc_Bitopro_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitopro_fetchTickers

function __ccxt_doc_Bitopro_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_orderbook_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitopro_fetchOrderBook

function __ccxt_doc_Bitopro_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trades_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bitopro_fetchTrades

function __ccxt_doc_Bitopro_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_limitations_and_fees.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bitopro_fetchTradingFees

function __ccxt_doc_Bitopro_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ohlc_data.md

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitopro_fetchOHLCV

function __ccxt_doc_Bitopro_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_account_balance.md

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bitopro_fetchBalance

function __ccxt_doc_Bitopro_createOrder() end
"""
create a trade order
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_order.md

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::object, optional: the price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_createOrder

function __ccxt_doc_Bitopro_cancelOrder() end
"""
cancels an open order
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_an_order.md

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_cancelOrder

function __ccxt_doc_Bitopro_cancelOrders() end
"""
cancel multiple orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_batch_orders.md

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_cancelOrders

function __ccxt_doc_Bitopro_cancelAllOrders() end
"""
cancel all open orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_all_orders.md

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_cancelAllOrders

function __ccxt_doc_Bitopro_fetchOrder() end
"""
fetches information on an order made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_order_data.md

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_fetchOrder

function __ccxt_doc_Bitopro_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_fetchOrders

function __ccxt_doc_Bitopro_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_open_orders_data.md

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_fetchOpenOrders

function __ccxt_doc_Bitopro_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitopro_fetchClosedOrders

function __ccxt_doc_Bitopro_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_trades_data.md

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitopro_fetchMyTrades

function __ccxt_doc_Bitopro_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_deposit_invoices_data.md

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitopro_fetchDeposits

function __ccxt_doc_Bitopro_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_withdraw_invoices_data.md

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitopro_fetchWithdrawals

function __ccxt_doc_Bitopro_fetchWithdrawal() end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_withdraw_invoice_data.md

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitopro_fetchWithdrawal

function __ccxt_doc_Bitopro_withdraw() end
"""
make a withdrawal
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_withdraw_invoice.md

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitopro_withdraw

function __ccxt_doc_Bitopro_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitopro_fetchDepositWithdrawFees
