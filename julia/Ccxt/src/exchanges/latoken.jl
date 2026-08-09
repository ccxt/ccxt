@kwdef mutable struct Latoken <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    fetchPublicTradingFee::Function = fetchPublicTradingFee
    fetchPrivateTradingFee::Function = fetchPrivateTradingFee
    fetchMyTrades::Function = fetchMyTrades
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchTransactions::Function = fetchTransactions
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetBookCurrencyQuote::Function = publicGetBookCurrencyQuote
    publicGetChartWeek::Function = publicGetChartWeek
    publicGetChartWeekCurrencyQuote::Function = publicGetChartWeekCurrencyQuote
    publicGetCurrency::Function = publicGetCurrency
    publicGetCurrencyAvailable::Function = publicGetCurrencyAvailable
    publicGetCurrencyQuotes::Function = publicGetCurrencyQuotes
    publicGetCurrencyCurrency::Function = publicGetCurrencyCurrency
    publicGetPair::Function = publicGetPair
    publicGetPairAvailable::Function = publicGetPairAvailable
    publicGetTicker::Function = publicGetTicker
    publicGetTickerBaseQuote::Function = publicGetTickerBaseQuote
    publicGetTime::Function = publicGetTime
    publicGetTradeHistoryCurrencyQuote::Function = publicGetTradeHistoryCurrencyQuote
    publicGetTradeFeeCurrencyQuote::Function = publicGetTradeFeeCurrencyQuote
    publicGetTradeFeeLevels::Function = publicGetTradeFeeLevels
    publicGetTransactionBindings::Function = publicGetTransactionBindings
    privateGetAuthAccount::Function = privateGetAuthAccount
    privateGetAuthAccountCurrencyCurrencyType::Function = privateGetAuthAccountCurrencyCurrencyType
    privateGetAuthOrder::Function = privateGetAuthOrder
    privateGetAuthOrderGetOrderId::Function = privateGetAuthOrderGetOrderId
    privateGetAuthOrderPairCurrencyQuote::Function = privateGetAuthOrderPairCurrencyQuote
    privateGetAuthOrderPairCurrencyQuoteActive::Function = privateGetAuthOrderPairCurrencyQuoteActive
    privateGetAuthStopOrder::Function = privateGetAuthStopOrder
    privateGetAuthStopOrderGetOrderId::Function = privateGetAuthStopOrderGetOrderId
    privateGetAuthStopOrderPairCurrencyQuote::Function = privateGetAuthStopOrderPairCurrencyQuote
    privateGetAuthStopOrderPairCurrencyQuoteActive::Function = privateGetAuthStopOrderPairCurrencyQuoteActive
    privateGetAuthTrade::Function = privateGetAuthTrade
    privateGetAuthTradePairCurrencyQuote::Function = privateGetAuthTradePairCurrencyQuote
    privateGetAuthTradeFeeCurrencyQuote::Function = privateGetAuthTradeFeeCurrencyQuote
    privateGetAuthTransaction::Function = privateGetAuthTransaction
    privateGetAuthTransactionBindings::Function = privateGetAuthTransactionBindings
    privateGetAuthTransactionBindingsCurrency::Function = privateGetAuthTransactionBindingsCurrency
    privateGetAuthTransactionId::Function = privateGetAuthTransactionId
    privateGetAuthTransfer::Function = privateGetAuthTransfer
    privatePostAuthOrderCancel::Function = privatePostAuthOrderCancel
    privatePostAuthOrderCancelAll::Function = privatePostAuthOrderCancelAll
    privatePostAuthOrderCancelAllCurrencyQuote::Function = privatePostAuthOrderCancelAllCurrencyQuote
    privatePostAuthOrderPlace::Function = privatePostAuthOrderPlace
    privatePostAuthSpotDeposit::Function = privatePostAuthSpotDeposit
    privatePostAuthSpotWithdraw::Function = privatePostAuthSpotWithdraw
    privatePostAuthStopOrderCancel::Function = privatePostAuthStopOrderCancel
    privatePostAuthStopOrderCancelAll::Function = privatePostAuthStopOrderCancelAll
    privatePostAuthStopOrderCancelAllCurrencyQuote::Function = privatePostAuthStopOrderCancelAllCurrencyQuote
    privatePostAuthStopOrderPlace::Function = privatePostAuthStopOrderPlace
    privatePostAuthTransactionDepositAddress::Function = privatePostAuthTransactionDepositAddress
    privatePostAuthTransactionWithdraw::Function = privatePostAuthTransactionWithdraw
    privatePostAuthTransactionWithdrawCancel::Function = privatePostAuthTransactionWithdrawCancel
    privatePostAuthTransactionWithdrawConfirm::Function = privatePostAuthTransactionWithdrawConfirm
    privatePostAuthTransactionWithdrawResendCode::Function = privatePostAuthTransactionWithdrawResendCode
    privatePostAuthTransferEmail::Function = privatePostAuthTransferEmail
    privatePostAuthTransferId::Function = privatePostAuthTransferId
    privatePostAuthTransferPhone::Function = privatePostAuthTransferPhone

end
function describe(self::Latoken, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "latoken",
    Symbol("name") => "Latoken",
    Symbol("countries") => ["KY"],
    Symbol("version") => "v2",
    Symbol("rateLimit") => 1000,
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
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFees") => false,
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
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
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
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.latoken.com"
        ),
        Symbol("www") => "https://latoken.com",
        Symbol("doc") => ["https://api.latoken.com"],
        Symbol("fees") => "https://latoken.com/fees",
        Symbol("referral") => "https://latoken.com/invite?r=mvgp2djk"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("book/{currency}/{quote}") => 1,
                Symbol("chart/week") => 1,
                Symbol("chart/week/{currency}/{quote}") => 1,
                Symbol("currency") => 1,
                Symbol("currency/available") => 1,
                Symbol("currency/quotes") => 1,
                Symbol("currency/{currency}") => 1,
                Symbol("pair") => 1,
                Symbol("pair/available") => 1,
                Symbol("ticker") => 1,
                Symbol("ticker/{base}/{quote}") => 1,
                Symbol("time") => 1,
                Symbol("trade/history/{currency}/{quote}") => 1,
                Symbol("trade/fee/{currency}/{quote}") => 1,
                Symbol("trade/feeLevels") => 1,
                Symbol("transaction/bindings") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("auth/account") => 1,
                Symbol("auth/account/currency/{currency}/{type}") => 1,
                Symbol("auth/order") => 1,
                Symbol("auth/order/getOrder/{id}") => 1,
                Symbol("auth/order/pair/{currency}/{quote}") => 1,
                Symbol("auth/order/pair/{currency}/{quote}/active") => 1,
                Symbol("auth/stopOrder") => 1,
                Symbol("auth/stopOrder/getOrder/{id}") => 1,
                Symbol("auth/stopOrder/pair/{currency}/{quote}") => 1,
                Symbol("auth/stopOrder/pair/{currency}/{quote}/active") => 1,
                Symbol("auth/trade") => 1,
                Symbol("auth/trade/pair/{currency}/{quote}") => 1,
                Symbol("auth/trade/fee/{currency}/{quote}") => 1,
                Symbol("auth/transaction") => 1,
                Symbol("auth/transaction/bindings") => 1,
                Symbol("auth/transaction/bindings/{currency}") => 1,
                Symbol("auth/transaction/{id}") => 1,
                Symbol("auth/transfer") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("auth/order/cancel") => 1,
                Symbol("auth/order/cancelAll") => 1,
                Symbol("auth/order/cancelAll/{currency}/{quote}") => 1,
                Symbol("auth/order/place") => 1,
                Symbol("auth/spot/deposit") => 1,
                Symbol("auth/spot/withdraw") => 1,
                Symbol("auth/stopOrder/cancel") => 1,
                Symbol("auth/stopOrder/cancelAll") => 1,
                Symbol("auth/stopOrder/cancelAll/{currency}/{quote}") => 1,
                Symbol("auth/stopOrder/place") => 1,
                Symbol("auth/transaction/depositAddress") => 1,
                Symbol("auth/transaction/withdraw") => 1,
                Symbol("auth/transaction/withdraw/cancel") => 1,
                Symbol("auth/transaction/withdraw/confirm") => 1,
                Symbol("auth/transaction/withdraw/resendCode") => 1,
                Symbol("auth/transfer/email") => 1,
                Symbol("auth/transfer/id") => 1,
                Symbol("auth/transfer/phone") => 1
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0049"),
            Symbol("taker") => self.parseNumber("0.0049")
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("BUX") => "Buxcoin",
        Symbol("CBT") => "Community Business Token",
        Symbol("CTC") => "CyberTronchain",
        Symbol("DMD") => "Diamond Coin",
        Symbol("FREN") => "Frenchie",
        Symbol("GDX") => "GoldenX",
        Symbol("GEC") => "Geco One",
        Symbol("GEM") => "NFTmall",
        Symbol("GMT") => "GMT Token",
        Symbol("IMC") => "IMCoin",
        Symbol("MT") => "Monarch",
        Symbol("TPAY") => "Tetra Pay",
        Symbol("TRADE") => "Smart Trade Coin",
        Symbol("TSL") => "Treasure SL",
        Symbol("UNO") => "Unobtanium",
        Symbol("WAR") => "Warrior Token"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("INTERNAL_ERROR") => ExchangeError,
            Symbol("SERVICE_UNAVAILABLE") => ExchangeNotAvailable,
            Symbol("NOT_AUTHORIZED") => AuthenticationError,
            Symbol("FORBIDDEN") => PermissionDenied,
            Symbol("BAD_REQUEST") => BadRequest,
            Symbol("NOT_FOUND") => ExchangeError,
            Symbol("ACCESS_DENIED") => PermissionDenied,
            Symbol("REQUEST_REJECTED") => ExchangeError,
            Symbol("HTTP_MEDIA_TYPE_NOT_SUPPORTED") => BadRequest,
            Symbol("MEDIA_TYPE_NOT_ACCEPTABLE") => BadRequest,
            Symbol("METHOD_ARGUMENT_NOT_VALID") => BadRequest,
            Symbol("VALIDATION_ERROR") => BadRequest,
            Symbol("ACCOUNT_EXPIRED") => AccountSuspended,
            Symbol("BAD_CREDENTIALS") => AuthenticationError,
            Symbol("COOKIE_THEFT") => AuthenticationError,
            Symbol("CREDENTIALS_EXPIRED") => AccountSuspended,
            Symbol("INSUFFICIENT_AUTHENTICATION") => AuthenticationError,
            Symbol("UNKNOWN_LOCATION") => AuthenticationError,
            Symbol("TOO_MANY_REQUESTS") => RateLimitExceeded,
            Symbol("INSUFFICIENT_FUNDS") => InsufficientFunds,
            Symbol("ORDER_VALIDATION") => InvalidOrder,
            Symbol("BAD_TICKS") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("invalid API key, signature or digest") => AuthenticationError,
            Symbol("The API key was revoked") => AuthenticationError,
            Symbol("request expired or bad") => InvalidNonce,
            Symbol("For input string") => BadRequest,
            Symbol("Unable to resolve currency by tag") => BadSymbol,
            Symbol("Can't find currency with tag") => BadSymbol,
            Symbol("Unable to place order because pair is in inactive state") => BadSymbol,
            Symbol("API keys are not available for") => AccountSuspended
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("types") => Dict{Symbol, Any}(
            Symbol("wallet") => "ACCOUNT_TYPE_WALLET",
            Symbol("funding") => "ACCOUNT_TYPE_WALLET",
            Symbol("spot") => "ACCOUNT_TYPE_SPOT"
        ),
        Symbol("accounts") => Dict{Symbol, Any}(
            Symbol("ACCOUNT_TYPE_WALLET") => "wallet",
            Symbol("ACCOUNT_TYPE_SPOT") => "spot"
        ),
        Symbol("fetchTradingFee") => Dict{Symbol, Any}(
            Symbol("method") => "fetchPrivateTradingFee"
        ),
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => true
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
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => nothing
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
function nonce(self::Latoken, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function fetchTime(self::Latoken, params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return safeInteger(response, "serverTime")

end
function fetchMarkets(self::Latoken, params=Dict())
    response = Base.fetch(self.publicGetPair(params));
    if functions.ccxtruthy(self.safeBool(self.options, "adjustForTimeDifference", false))
        Base.fetch(self.loadTimeDifference());
    end
    currencies = self.safeDict(self.options, "cachedCurrencies", Dict{Symbol, Any}());
    currenciesById = indexBy(currencies, "id");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        market = get(response, i + 1, nothing);
        id = safeString(market, "id");
        baseId = safeString(market, "baseCurrency");
        quoteId = safeString(market, "quoteCurrency");
        baseCurrency = self.safeDict(currenciesById, baseId);
        quoteCurrency = self.safeDict(currenciesById, quoteId);
        baseCurrencyInfo = self.safeDict(baseCurrency, "info");
        quoteCurrencyInfo = self.safeDict(quoteCurrency, "info");
        if functions.ccxtruthy(@functions.ccxt_and(baseCurrencyInfo != nothing, quoteCurrencyInfo != nothing))
            base = self.safeCurrencyCode(safeString(baseCurrencyInfo, "tag"));
            quote_var = self.safeCurrencyCode(safeString(quoteCurrencyInfo, "tag"));
            lowercaseQuote = lowercase(quote_var);
            capitalizedQuote = capitalize(lowercaseQuote);
            status = safeString(market, "status");
                        push!(result, Dict{Symbol, Any}(
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
    Symbol("active") => (status == "PAIR_STATUS_ACTIVE"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "quantityTick"),
        Symbol("price") => self.safeNumber(market, "priceTick")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderQuantity"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, string("minOrderCost", capitalizedQuote)),
            Symbol("max") => self.safeNumber(market, string("maxOrderCost", capitalizedQuote))
        )
    ),
    Symbol("created") => safeInteger(market, "created"),
    Symbol("info") => market
));
        end
        i += 1
    end
    return result

end
function fetchCurrencies(self::Latoken, params=Dict())
    response = Base.fetch(self.publicGetCurrency(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Latoken, currency)
    id = safeString(currency, "id");
    tag = safeString(currency, "tag");
    code = self.safeCurrencyCode(tag);
    currencyType = safeString(currency, "type");
    isCrypto = (@functions.ccxt_or(currencyType == "CURRENCY_TYPE_CRYPTO", currencyType == "CURRENCY_TYPE_IEO"));
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => currency,
    Symbol("name") => safeString(currency, "name"),
    Symbol("type") => functions.ccxtruthy(isCrypto) ? "crypto" : "other",
    Symbol("active") => safeString(currency, "status") == "CURRENCY_STATUS_ACTIVE",
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => self.safeNumber(currency, "fee"),
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(currency, "decimals"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(currency, "minTransferAmount"),
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
function fetchBalance(self::Latoken, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAuthAccount(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    maxTimestamp = nothing;
    defaultType = safeString2(self.options, "fetchBalance", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    types = safeValue(self.options, "types", Dict{Symbol, Any}());
    accountType = safeString(types, type_var, type_var);
    balancesByType = groupBy(response, "type");
    balances = safeValue(balancesByType, accountType, []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        timestamp = safeInteger(balance, "timestamp");
        if functions.ccxtruthy(timestamp != nothing)
            if functions.ccxtruthy(maxTimestamp == nothing)
                maxTimestamp = timestamp;
            else
                maxTimestamp = max(maxTimestamp, timestamp);
            end
        end
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "blocked");
        result[Symbol(code)] = account;
        i += 1
    end
    result[Symbol("timestamp")] = maxTimestamp;
    result[Symbol("datetime")] = self.iso8601(maxTimestamp);
    return self.safeBalance(result)

end
function fetchOrderBook(self::Latoken, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetBookCurrencyQuote(extend(request, params)));
    return self.parseOrderBook(response, symbol, nothing, "bid", "ask", "price", "quantity")

end
function parseTicker(self::Latoken, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    last_var = safeString(ticker, "lastPrice");
    timestamp = self.safeIntegerOmitZero(ticker, "updateTimestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("low") => nothing,
    Symbol("high") => nothing,
    Symbol("bid") => safeString(ticker, "bestBid"),
    Symbol("bidVolume") => safeString(ticker, "bestBidQuantity"),
    Symbol("ask") => safeString(ticker, "bestAsk"),
    Symbol("askVolume") => safeString(ticker, "bestAskQuantity"),
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "change24h"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "amount24h"),
    Symbol("quoteVolume") => safeString(ticker, "volume24h"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Latoken, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("base") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetTickerBaseQuote(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Latoken, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    return self.parseTickers(response, symbols)

end
function parseTrade(self::Latoken, trade, market=nothing)
    type_var = nothing;
    timestamp = safeInteger(trade, "timestamp");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "quantity");
    costString = safeString(trade, "cost");
    makerBuyer = safeValue(trade, "makerBuyer");
    side = safeString(trade, "direction");
    if functions.ccxtruthy(side == nothing)
        side = functions.ccxtruthy(makerBuyer) ? "sell" : "buy";
    else
        if functions.ccxtruthy(side == "TRADE_DIRECTION_BUY")
            side = "buy";
        elseif functions.ccxtruthy(side == "TRADE_DIRECTION_SELL")
            side = "sell";
        end
    end
    isBuy = (side == "buy");
    takerOrMaker = functions.ccxtruthy((@functions.ccxt_and(makerBuyer, isBuy))) ? "maker" : "taker";
    baseId = safeString(trade, "baseCurrency");
    quoteId = safeString(trade, "quoteCurrency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(ccxt_in(symbol, self.markets))
        market = self.market(symbol);
    end
    id = safeString(trade, "id");
    orderId = safeString(trade, "order");
    feeCost = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => quote_var
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Latoken, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.publicGetTradeHistoryCurrencyQuote(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchTradingFee(self::Latoken, symbol, params=Dict())
    options = safeValue(self.options, "fetchTradingFee", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "fetchPrivateTradingFee");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "fetchPrivateTradingFee")
            return Base.fetch(self.fetchPrivateTradingFee(symbol, params))
    elseif functions.ccxtruthy(method == "fetchPublicTradingFee")
        return Base.fetch(self.fetchPublicTradingFee(symbol, params))
    else
        throw(NotSupported(string(self.id, " not support this method")));
    end

end
function fetchPublicTradingFee(self::Latoken, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetTradeFeeCurrencyQuote(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.safeNumber(response, "makerFee"),
    Symbol("taker") => self.safeNumber(response, "takerFee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchPrivateTradingFee(self::Latoken, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.privateGetAuthTradeFeeCurrencyQuote(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.safeNumber(response, "makerFee"),
    Symbol("taker") => self.safeNumber(response, "takerFee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchMyTrades(self::Latoken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("quote")] = get(market, Symbol("quoteId"), nothing);
        response = Base.fetch(self.privateGetAuthTradePairCurrencyQuote(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAuthTrade(extend(request, params)));
    end
    return self.parseTrades(response, market, since, limit)

end
function parseOrderStatus(self::Latoken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("ORDER_STATUS_PLACED") => "open",
        Symbol("ORDER_STATUS_CLOSED") => "closed",
        Symbol("ORDER_STATUS_CANCELLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Latoken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("ORDER_TYPE_MARKET") => "market",
        Symbol("ORDER_TYPE_LIMIT") => "limit"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Latoken, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("ORDER_CONDITION_GOOD_TILL_CANCELLED") => "GTC",
        Symbol("ORDER_CONDITION_IMMEDIATE_OR_CANCEL") => "IOC",
        Symbol("ORDER_CONDITION_FILL_OR_KILL") => "FOK"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrder(self::Latoken, order, market=nothing)
    id = safeString(order, "id");
    timestamp = safeInteger(order, "timestamp");
    baseId = safeString(order, "baseCurrency");
    quoteId = safeString(order, "quoteCurrency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((base != nothing), (quote_var != nothing)))
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(ccxt_in(symbol, self.markets))
            market = self.market(symbol);
        end
    end
    orderSide = safeString(order, "side");
    side = nothing;
    if functions.ccxtruthy(orderSide != nothing)
        parts = split(orderSide, "_");
        partsLength = length(parts);
        side = safeStringLower(parts, partsLength - 1);
    end
    type_var = self.parseOrderType(safeString(order, "type"));
    price = safeString(order, "price");
    amount = safeString(order, "quantity");
    filled = safeString(order, "filled");
    cost = safeString(order, "cost");
    status = self.parseOrderStatus(safeString(order, "status"));
    message = safeString(order, "message");
    if functions.ccxtruthy(message != nothing)
        if functions.ccxtruthy(findfirst("cancel", message) !== nothing)
            status = "canceled";
        elseif functions.ccxtruthy(findfirst("accept", message) !== nothing)
            status = "open";
        end
    end
    clientOrderId = safeString(order, "clientOrderId");
    timeInForce = self.parseTimeInForce(safeString(order, "condition"));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString(order, "stopPrice"),
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("average") => nothing,
    Symbol("remaining") => nothing,
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function fetchOpenOrders(self::Latoken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, "stop");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateGetAuthStopOrderPairCurrencyQuoteActive(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAuthOrderPairCurrencyQuoteActive(extend(request, params)));
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchOrders(self::Latoken, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("quote")] = get(market, Symbol("quoteId"), nothing);
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privateGetAuthStopOrderPairCurrencyQuote(extend(request, params)));
        else
            response = Base.fetch(self.privateGetAuthOrderPairCurrencyQuote(extend(request, params)));
        end
    else
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privateGetAuthStopOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateGetAuthOrder(extend(request, params)));
        end
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchOrder(self::Latoken, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privateGetAuthStopOrderGetOrderId(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAuthOrderGetOrderId(extend(request, params)));
    end
    return self.parseOrder(response)

end
function createOrder(self::Latoken, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("baseCurrency") => get(market, Symbol("baseId"), nothing),
        Symbol("quoteCurrency") => get(market, Symbol("quoteId"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("condition") => "GTC",
        Symbol("type") => uppercaseType,
        Symbol("clientOrderId") => uuid(),
        Symbol("quantity") => self.amountToPrecision(symbol, amount),
        Symbol("timestamp") => seconds()
    );
    if functions.ccxtruthy(uppercaseType == "LIMIT")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    params = omit(params, ["triggerPrice", "stopPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        response = Base.fetch(self.privatePostAuthStopOrderPlace(extend(request, params)));
    else
        response = Base.fetch(self.privatePostAuthOrderPlace(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function cancelOrder(self::Latoken, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.privatePostAuthStopOrderCancel(extend(request, params)));
    else
        response = Base.fetch(self.privatePostAuthOrderCancel(extend(request, params)));
    end
    return self.parseOrder(response)

end
function cancelAllOrders(self::Latoken, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    isTrigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("quote")] = get(market, Symbol("quoteId"), nothing);
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privatePostAuthStopOrderCancelAllCurrencyQuote(extend(request, params)));
        else
            response = Base.fetch(self.privatePostAuthOrderCancelAllCurrencyQuote(extend(request, params)));
        end
    else
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privatePostAuthStopOrderCancelAll(extend(request, params)));
        else
            response = Base.fetch(self.privatePostAuthOrderCancelAll(extend(request, params)));
        end
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchTransactions(self::Latoken, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetAuthTransaction(extend(request, params)));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    content = self.safeList(response, "content", []);
    return self.parseTransactions(content, currency, since, limit)

end
function parseTransaction(self::Latoken, transaction, currency=nothing)
    id = safeString(transaction, "id");
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    amount = self.safeNumber(transaction, "amount");
    addressFrom = safeString(transaction, "senderAddress");
    addressTo = safeString(transaction, "recipientAddress");
    txid = safeString(transaction, "transactionHash");
    tagTo = safeString(transaction, "memo");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    feeCost = self.safeNumber(transaction, "transactionFee");
    if functions.ccxtruthy(feeCost != nothing)
        fee[Symbol("cost")] = feeCost;
        fee[Symbol("currency")] = code;
    end
    type_var = self.parseTransactionType(safeString(transaction, "type"));
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("address") => addressTo,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tagTo,
    Symbol("tag") => tagTo,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Latoken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("TRANSACTION_STATUS_CONFIRMED") => "ok",
        Symbol("TRANSACTION_STATUS_EXECUTED") => "ok",
        Symbol("TRANSACTION_STATUS_CHECKING") => "pending",
        Symbol("TRANSACTION_STATUS_CANCELLED") => "canceled",
        Symbol("TRANSACTION_STATUS_FAILED") => "failed",
        Symbol("TRANSACTION_STATUS_REJECTED") => "rejected"
    );
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Latoken, type_var)
    types = Dict{Symbol, Any}(
        Symbol("TRANSACTION_TYPE_DEPOSIT") => "deposit",
        Symbol("TRANSACTION_TYPE_WITHDRAWAL") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function fetchTransfers(self::Latoken, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    response = Base.fetch(self.privateGetAuthTransfer(params));
    transfers = self.safeList(response, "content", []);
    return self.parseTransfers(transfers, currency, since, limit)

end
function transfer(self::Latoken, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("recipient") => toAccount,
        Symbol("value") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(findfirst("@", toAccount) !== nothing)
        response = Base.fetch(self.privatePostAuthTransferEmail(extend(request, params)));
    elseif functions.ccxtruthy(length(toAccount) == 36)
        response = Base.fetch(self.privatePostAuthTransferId(extend(request, params)));
    else
        response = Base.fetch(self.privatePostAuthTransferPhone(extend(request, params)));
    end
    return self.parseTransfer(response)

end
function parseTransfer(self::Latoken, transfer, currency=nothing)
    timestamp = safeTimestamp(transfer, "timestamp");
    currencyId = safeString(transfer, "currency");
    status = safeString(transfer, "status");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => safeInteger(transfer, "timestamp"),
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "transferringFunds"),
    Symbol("fromAccount") => safeString(transfer, "fromAccount"),
    Symbol("toAccount") => safeString(transfer, "toAccount"),
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Latoken, status)
    statuses = Dict{Symbol, Any}(
        Symbol("TRANSFER_STATUS_COMPLETED") => "ok",
        Symbol("TRANSFER_STATUS_PENDING") => "pending",
        Symbol("TRANSFER_STATUS_REJECTED") => "failed",
        Symbol("TRANSFER_STATUS_UNVERIFIED") => "pending",
        Symbol("TRANSFER_STATUS_CANCELLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function sign(self::Latoken, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", self.version, "/", self.implodeParams(path, params));
    requestString = request;
    query = omit(params, self.extractParams(path));
    urlencodedQuery = self.urlencode(query);
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            requestString += string("?", urlencodedQuery);
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        auth = string(method, request, urlencodedQuery);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha512);
        headers = Dict{Symbol, Any}(
            Symbol("X-LA-APIKEY") => self.apiKey,
            Symbol("X-LA-SIGNATURE") => signature,
            Symbol("X-LA-DIGEST") => "HMAC-SHA512"
        );
        if functions.ccxtruthy(method == "POST")
            headers[Symbol("Content-Type")] = "application/json";
            body = json(query);
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), requestString);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Latoken, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    message = safeString(response, "message");
    feedback = string(self.id, " ", body);
    if functions.ccxtruthy(message != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
    end
    error = safeValue(response, "error");
    errorMessage = safeString(error, "message");
    if functions.ccxtruthy(@functions.ccxt_or((error != nothing), (errorMessage != nothing)))
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Latoken, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetBookCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "book/{currency}/{quote}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetChartWeek(self::Latoken, params=Dict(), context=Dict())
    return request(self, "chart/week", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetChartWeekCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "chart/week/{currency}/{quote}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCurrencyAvailable(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/available", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCurrencyQuotes(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/quotes", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCurrencyCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/{currency}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetPair(self::Latoken, params=Dict(), context=Dict())
    return request(self, "pair", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetPairAvailable(self::Latoken, params=Dict(), context=Dict())
    return request(self, "pair/available", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTicker(self::Latoken, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickerBaseQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "ticker/{base}/{quote}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTime(self::Latoken, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTradeHistoryCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/history/{currency}/{quote}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTradeFeeCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/fee/{currency}/{quote}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTradeFeeLevels(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/feeLevels", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTransactionBindings(self::Latoken, params=Dict(), context=Dict())
    return request(self, "transaction/bindings", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthAccount(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthAccountCurrencyCurrencyType(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/account/currency/{currency}/{type}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthOrder(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthOrderGetOrderId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/getOrder/{id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthOrderPairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/pair/{currency}/{quote}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthOrderPairCurrencyQuoteActive(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/pair/{currency}/{quote}/active", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthStopOrder(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthStopOrderGetOrderId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/getOrder/{id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthStopOrderPairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/pair/{currency}/{quote}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthStopOrderPairCurrencyQuoteActive(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/pair/{currency}/{quote}/active", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTrade(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTradePairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade/pair/{currency}/{quote}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTradeFeeCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade/fee/{currency}/{quote}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTransaction(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTransactionBindings(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/bindings", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTransactionBindingsCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/bindings/{currency}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTransactionId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/{id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAuthTransfer(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthOrderCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthOrderCancelAll(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancelAll", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthOrderCancelAllCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancelAll/{currency}/{quote}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthOrderPlace(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/place", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthSpotDeposit(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/spot/deposit", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthSpotWithdraw(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/spot/withdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthStopOrderCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthStopOrderCancelAll(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancelAll", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthStopOrderCancelAllCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancelAll/{currency}/{quote}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthStopOrderPlace(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/place", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransactionDepositAddress(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/depositAddress", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransactionWithdraw(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransactionWithdrawCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransactionWithdrawConfirm(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/confirm", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransactionWithdrawResendCode(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/resendCode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransferEmail(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/email", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransferId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/id", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAuthTransferPhone(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/phone", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Latoken(; kwargs...)
    inst = Latoken(Exchange(), describe, nonce, fetchTime, fetchMarkets, fetchCurrencies, parseCurrency, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseTrade, fetchTrades, fetchTradingFee, fetchPublicTradingFee, fetchPrivateTradingFee, fetchMyTrades, parseOrderStatus, parseOrderType, parseTimeInForce, parseOrder, fetchOpenOrders, fetchOrders, fetchOrder, createOrder, cancelOrder, cancelAllOrders, fetchTransactions, parseTransaction, parseTransactionStatus, parseTransactionType, fetchTransfers, transfer, parseTransfer, parseTransferStatus, sign, handleErrors, publicGetBookCurrencyQuote, publicGetChartWeek, publicGetChartWeekCurrencyQuote, publicGetCurrency, publicGetCurrencyAvailable, publicGetCurrencyQuotes, publicGetCurrencyCurrency, publicGetPair, publicGetPairAvailable, publicGetTicker, publicGetTickerBaseQuote, publicGetTime, publicGetTradeHistoryCurrencyQuote, publicGetTradeFeeCurrencyQuote, publicGetTradeFeeLevels, publicGetTransactionBindings, privateGetAuthAccount, privateGetAuthAccountCurrencyCurrencyType, privateGetAuthOrder, privateGetAuthOrderGetOrderId, privateGetAuthOrderPairCurrencyQuote, privateGetAuthOrderPairCurrencyQuoteActive, privateGetAuthStopOrder, privateGetAuthStopOrderGetOrderId, privateGetAuthStopOrderPairCurrencyQuote, privateGetAuthStopOrderPairCurrencyQuoteActive, privateGetAuthTrade, privateGetAuthTradePairCurrencyQuote, privateGetAuthTradeFeeCurrencyQuote, privateGetAuthTransaction, privateGetAuthTransactionBindings, privateGetAuthTransactionBindingsCurrency, privateGetAuthTransactionId, privateGetAuthTransfer, privatePostAuthOrderCancel, privatePostAuthOrderCancelAll, privatePostAuthOrderCancelAllCurrencyQuote, privatePostAuthOrderPlace, privatePostAuthSpotDeposit, privatePostAuthSpotWithdraw, privatePostAuthStopOrderCancel, privatePostAuthStopOrderCancelAll, privatePostAuthStopOrderCancelAllCurrencyQuote, privatePostAuthStopOrderPlace, privatePostAuthTransactionDepositAddress, privatePostAuthTransactionWithdraw, privatePostAuthTransactionWithdrawCancel, privatePostAuthTransactionWithdrawConfirm, privatePostAuthTransactionWithdrawResendCode, privatePostAuthTransferEmail, privatePostAuthTransferId, privatePostAuthTransferPhone)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
