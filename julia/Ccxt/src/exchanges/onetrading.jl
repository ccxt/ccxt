@kwdef mutable struct Onetrading <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTradingFees::Function = fetchTradingFees
    fetchPublicTradingFees::Function = fetchPublicTradingFees
    fetchPrivateTradingFees::Function = fetchPrivateTradingFees
    parseFeeTiers::Function = parseFeeTiers
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    parseOrderType::Function = parseOrderType
    parseTimeInForce::Function = parseTimeInForce
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetCandlesticksInstrumentCode::Function = publicGetCandlesticksInstrumentCode
    publicGetFees::Function = publicGetFees
    publicGetInstruments::Function = publicGetInstruments
    publicGetOrderBookInstrumentCode::Function = publicGetOrderBookInstrumentCode
    publicGetMarketTicker::Function = publicGetMarketTicker
    publicGetMarketTickerInstrumentCode::Function = publicGetMarketTickerInstrumentCode
    publicGetTime::Function = publicGetTime
    privateGetAccountBalances::Function = privateGetAccountBalances
    privateGetAccountFees::Function = privateGetAccountFees
    privateGetAccountOrders::Function = privateGetAccountOrders
    privateGetAccountOrdersOrderId::Function = privateGetAccountOrdersOrderId
    privateGetAccountOrdersClientClientId::Function = privateGetAccountOrdersClientClientId
    privateGetAccountOrdersOrderIdTrades::Function = privateGetAccountOrdersOrderIdTrades
    privateGetAccountTrades::Function = privateGetAccountTrades
    privateGetAccountTradeTradeId::Function = privateGetAccountTradeTradeId
    privatePostAccountOrders::Function = privatePostAccountOrders
    privateDeleteAccountOrders::Function = privateDeleteAccountOrders
    privateDeleteAccountOrdersOrderId::Function = privateDeleteAccountOrdersOrderId
    privateDeleteAccountOrdersClientClientId::Function = privateDeleteAccountOrdersClientClientId

end
function describe(self::Onetrading, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "onetrading",
    Symbol("name") => "One Trading",
    Symbol("countries") => ["AT"],
    Symbol("rateLimit") => 300,
    Symbol("version") => "v1",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
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
        Symbol("createDepositAddress") => false,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => false,
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
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => false,
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
        Symbol("fetchLedger") => false,
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
        Symbol("fetchMarkPrice") => false,
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
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
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
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => false,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1/MINUTES",
        Symbol("5m") => "5/MINUTES",
        Symbol("15m") => "15/MINUTES",
        Symbol("30m") => "30/MINUTES",
        Symbol("1h") => "1/HOURS",
        Symbol("4h") => "4/HOURS",
        Symbol("1d") => "1/DAYS",
        Symbol("1w") => "1/WEEKS",
        Symbol("1M") => "1/MONTHS"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/341a1b01-7660-402a-9a2b-876391e52f15",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.onetrading.com/fast",
            Symbol("private") => "https://api.onetrading.com/fast"
        ),
        Symbol("www") => "https://onetrading.com/",
        Symbol("doc") => ["https://docs.onetrading.com"],
        Symbol("fees") => "https://onetrading.com/fees"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("candlesticks/{instrument_code}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order-book/{instrument_code}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market-ticker/{instrument_code}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders/client/{client_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders/{order_id}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/trade/{trade_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("account/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/orders/client/{client_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0015"),
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("tiers") => [Dict{Symbol, Any}(
    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0015")], [self.parseNumber("100"), self.parseNumber("0.0013")], [self.parseNumber("250"), self.parseNumber("0.0013")], [self.parseNumber("1000"), self.parseNumber("0.001")], [self.parseNumber("5000"), self.parseNumber("0.0009")], [self.parseNumber("10000"), self.parseNumber("0.00075")], [self.parseNumber("20000"), self.parseNumber("0.00065")]],
    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("100"), self.parseNumber("0.001")], [self.parseNumber("250"), self.parseNumber("0.0009")], [self.parseNumber("1000"), self.parseNumber("0.00075")], [self.parseNumber("5000"), self.parseNumber("0.0006")], [self.parseNumber("10000"), self.parseNumber("0.0005")], [self.parseNumber("20000"), self.parseNumber("0.0005")]]
)]
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => false
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("INVALID_CLIENT_UUID") => InvalidOrder,
            Symbol("ORDER_NOT_FOUND") => OrderNotFound,
            Symbol("ONLY_ONE_ERC20_ADDRESS_ALLOWED") => InvalidAddress,
            Symbol("DEPOSIT_ADDRESS_NOT_USED") => InvalidAddress,
            Symbol("INVALID_CREDENTIALS") => AuthenticationError,
            Symbol("MISSING_CREDENTIALS") => AuthenticationError,
            Symbol("INVALID_APIKEY") => AuthenticationError,
            Symbol("INVALID_SCOPES") => AuthenticationError,
            Symbol("INVALID_SUBJECT") => AuthenticationError,
            Symbol("INVALID_ISSUER") => AuthenticationError,
            Symbol("INVALID_AUDIENCE") => AuthenticationError,
            Symbol("INVALID_DEVICE_ID") => AuthenticationError,
            Symbol("INVALID_IP_RESTRICTION") => AuthenticationError,
            Symbol("APIKEY_REVOKED") => AuthenticationError,
            Symbol("APIKEY_EXPIRED") => AuthenticationError,
            Symbol("SYNCHRONIZER_TOKEN_MISMATCH") => AuthenticationError,
            Symbol("SESSION_EXPIRED") => AuthenticationError,
            Symbol("INTERNAL_ERROR") => AuthenticationError,
            Symbol("CLIENT_IP_BLOCKED") => PermissionDenied,
            Symbol("MISSING_PERMISSION") => PermissionDenied,
            Symbol("ILLEGAL_CHARS") => BadRequest,
            Symbol("UNSUPPORTED_MEDIA_TYPE") => BadRequest,
            Symbol("ACCOUNT_HISTORY_TIME_RANGE_TOO_BIG") => BadRequest,
            Symbol("CANDLESTICKS_TIME_RANGE_TOO_BIG") => BadRequest,
            Symbol("INVALID_INSTRUMENT_CODE") => BadRequest,
            Symbol("INVALID_ORDER_TYPE") => BadRequest,
            Symbol("INVALID_UNIT") => BadRequest,
            Symbol("INVALID_PERIOD") => BadRequest,
            Symbol("INVALID_TIME") => BadRequest,
            Symbol("INVALID_DATE") => BadRequest,
            Symbol("INVALID_CURRENCY") => BadRequest,
            Symbol("INVALID_AMOUNT") => BadRequest,
            Symbol("INVALID_PRICE") => BadRequest,
            Symbol("INVALID_LIMIT") => BadRequest,
            Symbol("INVALID_QUERY") => BadRequest,
            Symbol("INVALID_CURSOR") => BadRequest,
            Symbol("INVALID_ACCOUNT_ID") => BadRequest,
            Symbol("INVALID_SIDE") => InvalidOrder,
            Symbol("INVALID_ACCOUNT_HISTORY_FROM_TIME") => BadRequest,
            Symbol("INVALID_ACCOUNT_HISTORY_MAX_PAGE_SIZE") => BadRequest,
            Symbol("INVALID_ACCOUNT_HISTORY_TIME_PERIOD") => BadRequest,
            Symbol("INVALID_ACCOUNT_HISTORY_TO_TIME") => BadRequest,
            Symbol("INVALID_CANDLESTICKS_GRANULARITY") => BadRequest,
            Symbol("INVALID_CANDLESTICKS_UNIT") => BadRequest,
            Symbol("INVALID_ORDER_BOOK_DEPTH") => BadRequest,
            Symbol("INVALID_ORDER_BOOK_LEVEL") => BadRequest,
            Symbol("INVALID_PAGE_CURSOR") => BadRequest,
            Symbol("INVALID_TIME_RANGE") => BadRequest,
            Symbol("INVALID_TRADE_ID") => BadRequest,
            Symbol("INVALID_UI_ACCOUNT_SETTINGS") => BadRequest,
            Symbol("NEGATIVE_AMOUNT") => InvalidOrder,
            Symbol("NEGATIVE_PRICE") => InvalidOrder,
            Symbol("MIN_SIZE_NOT_SATISFIED") => InvalidOrder,
            Symbol("BAD_AMOUNT_PRECISION") => InvalidOrder,
            Symbol("BAD_PRICE_PRECISION") => InvalidOrder,
            Symbol("BAD_TRIGGER_PRICE_PRECISION") => InvalidOrder,
            Symbol("MAX_OPEN_ORDERS_EXCEEDED") => BadRequest,
            Symbol("MISSING_PRICE") => InvalidOrder,
            Symbol("MISSING_ORDER_TYPE") => InvalidOrder,
            Symbol("MISSING_SIDE") => InvalidOrder,
            Symbol("MISSING_CANDLESTICKS_PERIOD_PARAM") => ArgumentsRequired,
            Symbol("MISSING_CANDLESTICKS_UNIT_PARAM") => ArgumentsRequired,
            Symbol("MISSING_FROM_PARAM") => ArgumentsRequired,
            Symbol("MISSING_INSTRUMENT_CODE") => ArgumentsRequired,
            Symbol("MISSING_ORDER_ID") => InvalidOrder,
            Symbol("MISSING_TO_PARAM") => ArgumentsRequired,
            Symbol("MISSING_TRADE_ID") => ArgumentsRequired,
            Symbol("INVALID_ORDER_ID") => OrderNotFound,
            Symbol("NOT_FOUND") => OrderNotFound,
            Symbol("INSUFFICIENT_LIQUIDITY") => InsufficientFunds,
            Symbol("INSUFFICIENT_FUNDS") => InsufficientFunds,
            Symbol("NO_TRADING") => ExchangeNotAvailable,
            Symbol("SERVICE_UNAVAILABLE") => ExchangeNotAvailable,
            Symbol("GATEWAY_TIMEOUT") => ExchangeNotAvailable,
            Symbol("RATELIMIT") => DDoSProtection,
            Symbol("CF_RATELIMIT") => DDoSProtection,
            Symbol("INTERNAL_SERVER_ERROR") => ExchangeError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Order not found.") => OrderNotFound
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("MIOTA") => "IOTA"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true,
        Symbol("fetchTradingFees") => Dict{Symbol, Any}(
            Symbol("method") => "fetchPrivateTradingFees"
        ),
        Symbol("fiat") => ["EUR", "CHF"]
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1 / 12,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 5000
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
    )
))

end
function fetchTime(self::Onetrading, params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return safeInteger(response, "epoch_millis")

end
function fetchCurrencies(self::Onetrading, params=Dict())
    response = Base.fetch(self.publicGetCurrencies(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Onetrading, rawCurrency)
    id = safeString(rawCurrency, "code");
    code = self.safeCurrencyCode(id);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("info") => rawCurrency,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "precision"))),
    Symbol("withdraw") => nothing,
    Symbol("deposit") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}()
))

end
function fetchMarkets(self::Onetrading, params=Dict())
    response = Base.fetch(self.publicGetInstruments(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Onetrading, market)
    baseAsset = self.safeDict(market, "base", Dict{Symbol, Any}());
    quoteAsset = self.safeDict(market, "quote", Dict{Symbol, Any}());
    baseId = safeString(baseAsset, "code");
    quoteId = safeString(quoteAsset, "code");
    id = safeString(market, "id");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    state = safeString(market, "state");
    type_var = safeString(market, "type");
    isPerp = type_var == "PERP";
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(isPerp)
        symbol = string(symbol, ":", quote_var);
    end
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => functions.ccxtruthy(isPerp) ? quote_var : nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => functions.ccxtruthy(isPerp) ? quoteId : nothing,
    Symbol("type") => functions.ccxtruthy(isPerp) ? "swap" : "spot",
    Symbol("spot") => !functions.ccxtruthy(isPerp),
    Symbol("margin") => false,
    Symbol("swap") => isPerp,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (state == "ACTIVE"),
    Symbol("contract") => isPerp,
    Symbol("linear") => functions.ccxtruthy(isPerp) ? true : nothing,
    Symbol("inverse") => functions.ccxtruthy(isPerp) ? false : nothing,
    Symbol("contractSize") => functions.ccxtruthy(isPerp) ? self.parseNumber("1") : nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "amount_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "market_precision")))
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
            Symbol("min") => self.safeNumber(market, "min_size"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchTradingFees(self::Onetrading, params=Dict())
    method = safeString(params, "method");
    params = omit(params, "method");
    if functions.ccxtruthy(method == nothing)
        options = safeValue(self.options, "fetchTradingFees", Dict{Symbol, Any}());
        method = safeString(options, "method", "fetchPrivateTradingFees");
    end
    if functions.ccxtruthy(method == "fetchPrivateTradingFees")
            return Base.fetch(self.fetchPrivateTradingFees(params))
    elseif functions.ccxtruthy(method == "fetchPublicTradingFees")
        return Base.fetch(self.fetchPublicTradingFees(params))
    else
        throw(NotSupported(string(self.id, " fetchTradingFees() does not support ", method, ", fetchPrivateTradingFees and fetchPublicTradingFees are supported")));
    end

end
function fetchPublicTradingFees(self::Onetrading, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetFees(params));
    spotFees = self.safeDict(response, 0, Dict{Symbol, Any}());
    futuresFees = self.safeDict(response, 1, Dict{Symbol, Any}());
    spotFeeTiers = self.safeList(spotFees, "fee_tiers", []);
    futuresFeeTiers = self.safeList(futuresFees, "fee_tiers", []);
    spotTiers = self.parseFeeTiers(spotFeeTiers);
    futuresTiers = self.parseFeeTiers(futuresFeeTiers);
    firstSpotTier = self.safeDict(spotTiers, 0, Dict{Symbol, Any}());
    firstFuturesTier = self.safeDict(futuresTiers, 0, Dict{Symbol, Any}());
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        tierObject = functions.ccxtruthy((get(market, Symbol("spot"), nothing))) ? firstSpotTier : firstFuturesTier;
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => spotFees,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(tierObject, "maker_fee"),
            Symbol("taker") => self.safeNumber(tierObject, "taker_fee"),
            Symbol("percentage") => true,
            Symbol("tierBased") => true,
            Symbol("tiers") => spotTiers
        );
        i += 1
    end
    return result

end
function fetchPrivateTradingFees(self::Onetrading, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountFees(params));
    activeFeeTier = self.safeList(response, "active_fee_tiers");
    spotFees = self.safeDict(activeFeeTier, 0, Dict{Symbol, Any}());
    futuresFees = self.safeDict(activeFeeTier, 1, Dict{Symbol, Any}());
    spotMakerFee = safeString(spotFees, "maker_fee");
    spotTakerFee = safeString(spotFees, "taker_fee");
    spotMakerFee = stringDiv(spotMakerFee, "100");
    spotTakerFee = stringDiv(spotTakerFee, "100");
    futuresMakerFee = safeString(futuresFees, "maker_fee");
    futuresTakerFee = safeString(futuresFees, "taker_fee");
    futuresMakerFee = stringDiv(futuresMakerFee, "100");
    futuresTakerFee = stringDiv(futuresTakerFee, "100");
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        makerFee = functions.ccxtruthy((get(market, Symbol("spot"), nothing))) ? spotMakerFee : futuresMakerFee;
        takerFee = functions.ccxtruthy((get(market, Symbol("spot"), nothing))) ? spotTakerFee : futuresTakerFee;
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.parseNumber(makerFee),
            Symbol("taker") => self.parseNumber(takerFee),
            Symbol("percentage") => true,
            Symbol("tierBased") => true,
            Symbol("tiers") => nothing
        );
        i += 1
    end
    return result

end
function parseFeeTiers(self::Onetrading, feeTiers, market=nothing)
    takerFees = [];
    makerFees = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(feeTiers)))
        tier = get(feeTiers, i + 1, nothing);
        volume = self.safeNumber(tier, "volume");
        taker = safeString(tier, "taker_fee");
        maker = safeString(tier, "maker_fee");
        maker = stringDiv(maker, "100");
        taker = stringDiv(taker, "100");
        push!(makerFees, [volume, self.parseNumber(maker)]);
        push!(takerFees, [volume, self.parseNumber(taker)]);
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("maker") => makerFees,
    Symbol("taker") => takerFees
)

end
function parseTicker(self::Onetrading, ticker, market=nothing)
    timestamp = self.parse8601(safeString(ticker, "time"));
    marketId = safeString(ticker, "instrument_code");
    symbol = self.safeSymbol(marketId, market, "_");
    last_var = safeString(ticker, "last_price");
    percentage = safeString(ticker, "price_change_percentage");
    change = safeString(ticker, "price_change");
    baseVolume = safeString(ticker, "base_volume");
    quoteVolume = safeString(ticker, "quote_volume");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "best_bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "best_ask"),
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
function fetchTicker(self::Onetrading, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_code") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketTickerInstrumentCode(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Onetrading, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetMarketTicker(params));
    result = Dict{Symbol, Any}();
    rawTickers = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawTickers)))
        ticker = self.parseTicker(get(rawTickers, i + 1, nothing));
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchOrderBook(self::Onetrading, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_code") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetOrderBookInstrumentCode(extend(request, params)));
    timestamp = self.parse8601(safeString(response, "time"));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "amount")

end
function parseOHLCV(self::Onetrading, ohlcv, market=nothing)
    granularity = safeValue(ohlcv, "granularity");
    unit = safeString(granularity, "unit");
    period = safeString(granularity, "period");
    units = Dict{Symbol, Any}(
        Symbol("MINUTES") => "m",
        Symbol("HOURS") => "h",
        Symbol("DAYS") => "d",
        Symbol("WEEKS") => "w",
        Symbol("MONTHS") => "M"
    );
    lowercaseUnit = safeString(units, unit);
    if functions.ccxtruthy(@functions.ccxt_or((period == nothing), (lowercaseUnit == nothing)))
        throw(ExchangeError(string(self.id, " parseOHLCV() missing period/unit")));
    end
    timeframe = string(period, lowercaseUnit);
    durationInSeconds = self.parseTimeframe(timeframe);
    duration = durationInSeconds * 1000;
    timestamp = self.parse8601(safeString(ohlcv, "time"));
    if functions.ccxtruthy(timestamp == nothing)
        throw(ExchangeError(string(self.id, " parseOHLCV() missing timestamp")));
    end
    alignedTimestamp = duration * self.parseToInt(timestamp / duration);
    options = safeValue(self.options, "fetchOHLCV", Dict{Symbol, Any}());
    volumeField = safeString(options, "volume", "total_amount");
    return [alignedTimestamp, self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, volumeField)]

end
function fetchOHLCV(self::Onetrading, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    periodUnit = safeString(self.timeframes, timeframe);
    if functions.ccxtruthy(periodUnit == nothing)
        throw(ExchangeError(string(self.id, " fetchOHLCV() missing periodUnit")));
    end
    (period, unit) = split(periodUnit, "/");
    durationInSeconds = self.parseTimeframe(timeframe);
    duration = durationInSeconds * 1000;
    if functions.ccxtruthy(limit == nothing)
        limit = 1500;
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_code") => get(market, Symbol("id"), nothing),
        Symbol("period") => period,
        Symbol("unit") => unit
    );
    if functions.ccxtruthy(since == nothing)
        now = milliseconds();
        request[Symbol("to")] = self.iso8601(now);
        request[Symbol("from")] = self.iso8601(now - limit * duration);
    else
        request[Symbol("from")] = self.iso8601(since);
        request[Symbol("to")] = self.iso8601(self.sum(since, limit * duration));
    end
    response = Base.fetch(self.publicGetCandlesticksInstrumentCode(extend(request, params)));
    ohlcv = self.safeList(response, "candlesticks");
    return self.parseOHLCVs(ohlcv, market, timeframe, since, limit)

end
function parseTrade(self::Onetrading, trade, market=nothing)
    feeInfo = safeValue(trade, "fee", Dict{Symbol, Any}());
    trade = safeValue(trade, "trade", trade);
    timestamp = safeInteger(trade, "trade_timestamp");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = self.parse8601(safeString(trade, "time"));
    end
    side = safeStringLower2(trade, "side", "taker_side");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    costString = safeString(trade, "volume");
    marketId = safeString(trade, "instrument_code");
    symbol = self.safeSymbol(marketId, market, "_");
    feeCostString = safeString(feeInfo, "fee_amount");
    takerOrMaker = nothing;
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(feeInfo, "fee_currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        feeRateString = safeString(feeInfo, "fee_percentage");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode,
            Symbol("rate") => feeRateString
        );
        takerOrMaker = safeStringLower(feeInfo, "fee_type");
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString2(trade, "trade_id", "sequence"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function parseBalance(self::Onetrading, response)
    balances = safeValue(response, "balances", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "currency_code");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Onetrading, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountBalances(params));
    return self.parseBalance(response)

end
function parseOrderStatus(self::Onetrading, status)
    statuses = Dict{Symbol, Any}(
        Symbol("FILLED") => "open",
        Symbol("FILLED_FULLY") => "closed",
        Symbol("FILLED_CLOSED") => "canceled",
        Symbol("FILLED_REJECTED") => "rejected",
        Symbol("OPEN") => "open",
        Symbol("REJECTED") => "rejected",
        Symbol("CLOSED") => "canceled",
        Symbol("FAILED") => "failed",
        Symbol("STOP_TRIGGERED") => "triggered",
        Symbol("DONE") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Onetrading, order, market=nothing)
    rawOrder = safeValue(order, "order", order);
    id = safeString(rawOrder, "order_id");
    clientOrderId = safeString(rawOrder, "client_id");
    timestamp = self.parse8601(safeString(rawOrder, "time"));
    rawStatus = self.parseOrderStatus(safeString(rawOrder, "status"));
    status = self.parseOrderStatus(rawStatus);
    marketId = safeString(rawOrder, "instrument_code");
    symbol = self.safeSymbol(marketId, market, "_");
    price = safeString(rawOrder, "price");
    amount = safeString(rawOrder, "amount");
    filled = safeString(rawOrder, "filled_amount");
    side = safeStringLower(rawOrder, "side");
    type_var = safeStringLower(rawOrder, "type");
    timeInForce = self.parseTimeInForce(safeString(rawOrder, "time_in_force"));
    postOnly = safeValue(rawOrder, "is_post_only");
    rawTrades = safeValue(order, "trades", []);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(type_var),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => self.safeNumber(rawOrder, "trigger_price"),
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("trades") => rawTrades
), market)

end
function parseOrderType(self::Onetrading, type_var)
    types = Dict{Symbol, Any}(
        Symbol("booked") => "limit"
    );
    return safeString(types, type_var, type_var)

end
function parseTimeInForce(self::Onetrading, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GOOD_TILL_CANCELLED") => "GTC",
        Symbol("GOOD_TILL_TIME") => "GTT",
        Symbol("IMMEDIATE_OR_CANCELLED") => "IOC",
        Symbol("FILL_OR_KILL") => "FOK"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function createOrder(self::Onetrading, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_code") => get(market, Symbol("id"), nothing),
        Symbol("type") => uppercaseType,
        Symbol("side") => uppercase(side),
        Symbol("amount") => self.amountToPrecision(symbol, amount)
    );
    priceIsRequired = false;
    if functions.ccxtruthy(@functions.ccxt_or(uppercaseType == "LIMIT", uppercaseType == "STOP"))
        priceIsRequired = true;
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "trigger_price", "stopPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(uppercaseType == "MARKET")
            throw(BadRequest(string(self.id, " createOrder() cannot place stop market orders, only stop limit")));
        end
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("type")] = "STOP";
        params = omit(params, ["triggerPrice", "trigger_price", "stopPrice"]);
    elseif functions.ccxtruthy(uppercaseType == "STOP")
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice param for ", type_var, " orders")));
    end
    if functions.ccxtruthy(priceIsRequired)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
        params = omit(params, ["clientOrderId", "client_id"]);
    end
    timeInForce = safeString2(params, "timeInForce", "time_in_force", "GOOD_TILL_CANCELLED");
    params = omit(params, "timeInForce");
    request[Symbol("time_in_force")] = timeInForce;
    response = Base.fetch(self.privatePostAccountOrders(extend(request, params)));
    return self.parseOrder(response, market)

end
function cancelOrder(self::Onetrading, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    params = omit(params, ["clientOrderId", "client_id"]);
    method = "privateDeleteAccountOrdersOrderId";
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderId != nothing)
        method = "privateDeleteAccountOrdersClientClientId";
        request[Symbol("client_id")] = clientOrderId;
    else
        request[Symbol("order_id")] = id;
    end
    response = nothing;
    if functions.ccxtruthy(method == "privateDeleteAccountOrdersOrderId")
        response = Base.fetch(self.privateDeleteAccountOrdersOrderId(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteAccountOrdersClientClientId(extend(request, params)));
    end
    return self.parseOrder(response)

end
function cancelAllOrders(self::Onetrading, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_code")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateDeleteAccountOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelOrders(self::Onetrading, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("ids") => join(ids, ",")
    );
    response = Base.fetch(self.privateDeleteAccountOrders(extend(request, params)));
    order = self.safeOrder(Dict{Symbol, Any}(
        Symbol("info") => response
    ));
    return [order]

end
function fetchOrder(self::Onetrading, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetAccountOrdersOrderId(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOpenOrders(self::Onetrading, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_code")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        to = safeString(params, "to");
        if functions.ccxtruthy(to == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a \"to\" iso8601 string param with the since argument is specified, max range is 100 days")));
        end
        request[Symbol("from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("max_page_size")] = limit;
    end
    response = Base.fetch(self.privateGetAccountOrders(extend(request, params)));
    orderHistory = self.safeList(response, "order_history", []);
    return self.parseOrders(orderHistory, market, since, limit)

end
function fetchClosedOrders(self::Onetrading, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("with_cancelled_and_rejected") => true
    );
    return Base.fetch(self.fetchOpenOrders(symbol, since, limit, extend(request, params)))

end
function fetchOrderTrades(self::Onetrading, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("max_page_size")] = limit;
    end
    response = Base.fetch(self.privateGetAccountOrdersOrderIdTrades(extend(request, params)));
    tradeHistory = safeValue(response, "trade_history", []);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    return self.parseTrades(tradeHistory, market, since, limit)

end
function fetchMyTrades(self::Onetrading, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_code")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        to = safeString(params, "to");
        if functions.ccxtruthy(to == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a \"to\" iso8601 string param with the since argument is specified, max range is 100 days")));
        end
        request[Symbol("from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("max_page_size")] = limit;
    end
    response = Base.fetch(self.privateGetAccountTrades(extend(request, params)));
    tradeHistory = self.safeList(response, "trade_history", []);
    return self.parseTrades(tradeHistory, market, since, limit)

end
function sign(self::Onetrading, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        headers = Dict{Symbol, Any}(
            Symbol("Accept") => "application/json",
            Symbol("Authorization") => string("Bearer ", self.apiKey)
        );
        if functions.ccxtruthy(method == "POST")
            body = json(query);
            headers[Symbol("Content-Type")] = "application/json";
        else
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Onetrading, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    message = safeString(response, "error");
    if functions.ccxtruthy(message != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Onetrading, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCurrencies(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "currencies", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesticksInstrumentCode(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "candlesticks/{instrument_code}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFees(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "fees", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetInstruments(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "instruments", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrderBookInstrumentCode(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "order-book/{instrument_code}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketTicker(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "market-ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketTickerInstrumentCode(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "market-ticker/{instrument_code}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTime(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBalances(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountFees(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/fees", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountOrders(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountOrdersOrderId(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders/{order_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountOrdersClientClientId(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders/client/{client_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountOrdersOrderIdTrades(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders/{order_id}/trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountTrades(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountTradeTradeId(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/trade/{trade_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostAccountOrders(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteAccountOrders(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteAccountOrdersOrderId(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders/{order_id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteAccountOrdersClientClientId(self::Onetrading, params=Dict(), context=Dict())
    return request(self, "account/orders/client/{client_id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function Onetrading(; kwargs...)
    inst = Onetrading(Exchange(), describe, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchTradingFees, fetchPublicTradingFees, fetchPrivateTradingFees, parseFeeTiers, parseTicker, fetchTicker, fetchTickers, fetchOrderBook, parseOHLCV, fetchOHLCV, parseTrade, parseBalance, fetchBalance, parseOrderStatus, parseOrder, parseOrderType, parseTimeInForce, createOrder, cancelOrder, cancelAllOrders, cancelOrders, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchOrderTrades, fetchMyTrades, sign, handleErrors, publicGetCurrencies, publicGetCandlesticksInstrumentCode, publicGetFees, publicGetInstruments, publicGetOrderBookInstrumentCode, publicGetMarketTicker, publicGetMarketTickerInstrumentCode, publicGetTime, privateGetAccountBalances, privateGetAccountFees, privateGetAccountOrders, privateGetAccountOrdersOrderId, privateGetAccountOrdersClientClientId, privateGetAccountOrdersOrderIdTrades, privateGetAccountTrades, privateGetAccountTradeTradeId, privatePostAccountOrders, privateDeleteAccountOrders, privateDeleteAccountOrdersOrderId, privateDeleteAccountOrdersClientClientId)
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
