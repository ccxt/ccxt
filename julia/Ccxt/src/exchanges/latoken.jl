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
                Symbol("book/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chart/week") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chart/week/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency/available") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency/quotes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pair") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pair/available") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/{base}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/history/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/fee/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/feeLevels") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/bindings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("auth/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/account/currency/{currency}/{type}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/getOrder/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/pair/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/pair/{currency}/{quote}/active") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/getOrder/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/pair/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/pair/{currency}/{quote}/active") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/trade/pair/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/trade/fee/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/bindings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/bindings/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("auth/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/cancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/cancelAll/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/order/place") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/spot/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/spot/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/cancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/cancelAll/{currency}/{quote}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/stopOrder/place") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/depositAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/withdraw/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/withdraw/confirm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transaction/withdraw/resendCode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transfer/email") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transfer/id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth/transfer/phone") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api.latoken.com/doc/v2/#tag/Time/operation/currentTime

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Latoken; params=Dict())
    response = Base.fetch(self.publicGetTime(params));
    return safeInteger(response, "serverTime")

end
"""
retrieves data on all markets for latoken
see: https://api.latoken.com/doc/v2/#tag/Pair/operation/getActivePairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Latoken; params=Dict())
    response = Base.fetch(self.publicGetPair(params));
    if functions.ccxtruthy(self.safeBool(self.options, "adjustForTimeDifference", defaultValue = false))
        Base.fetch(self.loadTimeDifference());
    end
    currencies = self.safeDict(self.options, "cachedCurrencies", defaultValue = Dict{Symbol, Any}());
    currenciesById = indexBy(currencies, "id");
    result = [];
    rawMarkets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawMarkets)))
        market = get(rawMarkets, i + 1, nothing);
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
            if functions.ccxtruthy(@functions.ccxt_or((base == nothing), (quote_var == nothing)))
                i += 1; continue
            end
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
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Latoken; params=Dict())
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
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(currency, "decimals"))),
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
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.latoken.com/doc/v2/#tag/Account/operation/getBalancesByUser

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Latoken; params=Dict())
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
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    result[Symbol("timestamp")] = maxTimestamp;
    result[Symbol("datetime")] = self.iso8601(maxTimestamp);
    return self.safeBalance(result)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.latoken.com/doc/v2/#tag/Order-Book/operation/getOrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Latoken, symbol; limit=nothing, params=Dict())
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
    return self.parseOrderBook(response, symbol, timestamp = nothing, bidsKey = "bid", asksKey = "ask", priceKey = "price", amountKey = "quantity")

end
function parseTicker(self::Latoken, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    last_var = safeString(ticker, "lastPrice");
    timestamp = self.safeIntegerOmitZero(ticker, "updateTimestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
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
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.latoken.com/doc/v2/#tag/Ticker/operation/getTicker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Latoken, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("base") => get(market, Symbol("baseId"), nothing),
        Symbol("quote") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetTickerBaseQuote(extend(request, params)));
    return self.parseTicker(response, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api.latoken.com/doc/v2/#tag/Ticker/operation/getAllTickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Latoken; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    return self.parseTickers(response, symbols = symbols)

end
function parseTrade(self::Latoken, trade; market=nothing)
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
    if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(symbol, self.markets))))
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
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Latoken, symbol; since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getFeeByPair
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getAuthFeeByPair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Latoken, symbol; params=Dict())
    options = safeValue(self.options, "fetchTradingFee", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "fetchPrivateTradingFee");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "fetchPrivateTradingFee")
            return Base.fetch(self.fetchPrivateTradingFee(symbol, params = params))
    elseif functions.ccxtruthy(method == "fetchPublicTradingFee")
        return Base.fetch(self.fetchPublicTradingFee(symbol, params = params))
    else
        throw(NotSupported(string(self.id, " not support this method")));
    end

end
function fetchPublicTradingFee(self::Latoken, symbol; params=Dict())
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
function fetchPrivateTradingFee(self::Latoken, symbol; params=Dict())
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
"""
fetch all trades made by the user
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByTrader
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByAssetAndTrader

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Latoken; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = [];
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("quote")] = get(market, Symbol("quoteId"), nothing);
        response = Base.fetch(self.privateGetAuthTradePairCurrencyQuote(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAuthTrade(extend(request, params)));
    end
    return self.parseTrades(response, market = market, since = since, limit = limit)

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
function parseOrder(self::Latoken, order; market=nothing)
    id = safeString(order, "id");
    timestamp = safeInteger(order, "timestamp");
    baseId = safeString(order, "baseCurrency");
    quoteId = safeString(order, "quoteCurrency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((base != nothing), (quote_var != nothing)))
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(symbol, self.markets))))
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
), market = market)

end
"""
fetch all unfilled currently open orders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyActiveOrdersByPair
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyActiveStopOrdersByPair  // stop

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Latoken; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrdersByPair
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrders       // stop
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrdersByPair // stop

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Latoken; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getOrderById
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getStopOrderById

# Arguments
- `id`::string: order id
- `symbol`::string, optional: not used by latoken fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching a trigger order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Latoken, id; symbol=nothing, params=Dict())
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
"""
create a trade order
see: https://api.latoken.com/doc/v2/#tag/Order/operation/placeOrder
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/placeStopOrder  // stop

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at EXCHANGE SPECIFIC PARAMETERS
- `params.condition`::string, optional: "GTC", "IOC", or  "FOK"
- `params.clientOrderId`::string, optional: [ 0 .. 50 ] characters, client's custom order id (free field for your convenience)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Latoken, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
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
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelOrder
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/cancelStopOrder  // stop

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling a trigger order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Latoken, id; symbol=nothing, params=Dict())
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
"""
cancel all open orders in a market
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrdersByPair

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Latoken; symbol=nothing, params=Dict())
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
"""
use fetchDepositsWithdrawals instead
see: https://api.latoken.com/doc/v2/#tag/Transaction/operation/getUserTransactions

# Arguments
- `code`::string: unified currency code for the currency of the transactions, default is undefined
- `since`::int, optional: timestamp in ms of the earliest transaction, default is undefined
- `limit`::int, optional: max number of transactions to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchTransactions(self::Latoken; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetAuthTransaction(extend(request, params)));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    content = self.safeList(response, "content", defaultValue = []);
    return self.parseTransactions(content, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Latoken, transaction; currency=nothing)
    id = safeString(transaction, "id");
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
"""
fetch a history of internal transfers made on an account
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/getUsersTransfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Latoken; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    response = Base.fetch(self.privateGetAuthTransfer(params));
    transfers = self.safeList(response, "content", defaultValue = []);
    return self.parseTransfers(transfers, currency = currency, since = since, limit = limit)

end
"""
transfer currency internally between wallets on the same account
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByEmail
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferById
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByPhone

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Latoken, code, amount, fromAccount, toAccount; params=Dict())
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
function parseTransfer(self::Latoken, transfer; currency=nothing)
    timestamp = safeTimestamp(transfer, "timestamp");
    currencyId = safeString(transfer, "currency");
    status = safeString(transfer, "status");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => safeInteger(transfer, "timestamp"),
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
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
function sign(self::Latoken, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Latoken, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetBookCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "book/{currency}/{quote}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChartWeek(self::Latoken, params=Dict(), context=Dict())
    return request(self, "chart/week"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChartWeekCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "chart/week/{currency}/{quote}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencyAvailable(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/available"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencyQuotes(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/quotes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencyCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "currency/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPair(self::Latoken, params=Dict(), context=Dict())
    return request(self, "pair"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPairAvailable(self::Latoken, params=Dict(), context=Dict())
    return request(self, "pair/available"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Latoken, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerBaseQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "ticker/{base}/{quote}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTime(self::Latoken, params=Dict(), context=Dict())
    return request(self, "time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeHistoryCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/history/{currency}/{quote}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeFeeCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/fee/{currency}/{quote}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeFeeLevels(self::Latoken, params=Dict(), context=Dict())
    return request(self, "trade/feeLevels"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTransactionBindings(self::Latoken, params=Dict(), context=Dict())
    return request(self, "transaction/bindings"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthAccount(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthAccountCurrencyCurrencyType(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/account/currency/{currency}/{type}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthOrder(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthOrderGetOrderId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/getOrder/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthOrderPairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/pair/{currency}/{quote}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthOrderPairCurrencyQuoteActive(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/pair/{currency}/{quote}/active"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthStopOrder(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthStopOrderGetOrderId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/getOrder/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthStopOrderPairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/pair/{currency}/{quote}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthStopOrderPairCurrencyQuoteActive(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/pair/{currency}/{quote}/active"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTrade(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTradePairCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade/pair/{currency}/{quote}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTradeFeeCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/trade/fee/{currency}/{quote}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTransaction(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTransactionBindings(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/bindings"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTransactionBindingsCurrency(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/bindings/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTransactionId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAuthTransfer(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthOrderCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthOrderCancelAll(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancelAll"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthOrderCancelAllCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/cancelAll/{currency}/{quote}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthOrderPlace(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/order/place"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthSpotDeposit(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/spot/deposit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthSpotWithdraw(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/spot/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthStopOrderCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthStopOrderCancelAll(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancelAll"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthStopOrderCancelAllCurrencyQuote(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/cancelAll/{currency}/{quote}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthStopOrderPlace(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/stopOrder/place"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransactionDepositAddress(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/depositAddress"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransactionWithdraw(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransactionWithdrawCancel(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransactionWithdrawConfirm(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/confirm"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransactionWithdrawResendCode(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transaction/withdraw/resendCode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransferEmail(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/email"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransferId(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/id"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuthTransferPhone(self::Latoken, params=Dict(), context=Dict())
    return request(self, "auth/transfer/phone"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Latoken(; kwargs...)
    inst = Latoken(Exchange(), describe, nonce, fetchTime, fetchMarkets, fetchCurrencies, parseCurrency, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseTrade, fetchTrades, fetchTradingFee, fetchPublicTradingFee, fetchPrivateTradingFee, fetchMyTrades, parseOrderStatus, parseOrderType, parseTimeInForce, parseOrder, fetchOpenOrders, fetchOrders, fetchOrder, createOrder, cancelOrder, cancelAllOrders, fetchTransactions, parseTransaction, parseTransactionStatus, parseTransactionType, fetchTransfers, transfer, parseTransfer, parseTransferStatus, sign, handleErrors, publicGetBookCurrencyQuote, publicGetChartWeek, publicGetChartWeekCurrencyQuote, publicGetCurrency, publicGetCurrencyAvailable, publicGetCurrencyQuotes, publicGetCurrencyCurrency, publicGetPair, publicGetPairAvailable, publicGetTicker, publicGetTickerBaseQuote, publicGetTime, publicGetTradeHistoryCurrencyQuote, publicGetTradeFeeCurrencyQuote, publicGetTradeFeeLevels, publicGetTransactionBindings, privateGetAuthAccount, privateGetAuthAccountCurrencyCurrencyType, privateGetAuthOrder, privateGetAuthOrderGetOrderId, privateGetAuthOrderPairCurrencyQuote, privateGetAuthOrderPairCurrencyQuoteActive, privateGetAuthStopOrder, privateGetAuthStopOrderGetOrderId, privateGetAuthStopOrderPairCurrencyQuote, privateGetAuthStopOrderPairCurrencyQuoteActive, privateGetAuthTrade, privateGetAuthTradePairCurrencyQuote, privateGetAuthTradeFeeCurrencyQuote, privateGetAuthTransaction, privateGetAuthTransactionBindings, privateGetAuthTransactionBindingsCurrency, privateGetAuthTransactionId, privateGetAuthTransfer, privatePostAuthOrderCancel, privatePostAuthOrderCancelAll, privatePostAuthOrderCancelAllCurrencyQuote, privatePostAuthOrderPlace, privatePostAuthSpotDeposit, privatePostAuthSpotWithdraw, privatePostAuthStopOrderCancel, privatePostAuthStopOrderCancelAll, privatePostAuthStopOrderCancelAllCurrencyQuote, privatePostAuthStopOrderPlace, privatePostAuthTransactionDepositAddress, privatePostAuthTransactionWithdraw, privatePostAuthTransactionWithdrawCancel, privatePostAuthTransactionWithdrawConfirm, privatePostAuthTransactionWithdrawResendCode, privatePostAuthTransferEmail, privatePostAuthTransferId, privatePostAuthTransferPhone)
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
function __ccxt_doc_Latoken_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api.latoken.com/doc/v2/#tag/Time/operation/currentTime

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Latoken_fetchTime

function __ccxt_doc_Latoken_fetchMarkets() end
"""
retrieves data on all markets for latoken
see: https://api.latoken.com/doc/v2/#tag/Pair/operation/getActivePairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Latoken_fetchMarkets

function __ccxt_doc_Latoken_fetchCurrencies() end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Latoken_fetchCurrencies

function __ccxt_doc_Latoken_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.latoken.com/doc/v2/#tag/Account/operation/getBalancesByUser

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Latoken_fetchBalance

function __ccxt_doc_Latoken_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.latoken.com/doc/v2/#tag/Order-Book/operation/getOrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Latoken_fetchOrderBook

function __ccxt_doc_Latoken_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.latoken.com/doc/v2/#tag/Ticker/operation/getTicker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Latoken_fetchTicker

function __ccxt_doc_Latoken_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api.latoken.com/doc/v2/#tag/Ticker/operation/getAllTickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Latoken_fetchTickers

function __ccxt_doc_Latoken_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Latoken_fetchTrades

function __ccxt_doc_Latoken_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getFeeByPair
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getAuthFeeByPair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Latoken_fetchTradingFee

function __ccxt_doc_Latoken_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByTrader
see: https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByAssetAndTrader

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Latoken_fetchMyTrades

function __ccxt_doc_Latoken_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyActiveOrdersByPair
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyActiveStopOrdersByPair  // stop

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_fetchOpenOrders

function __ccxt_doc_Latoken_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrdersByPair
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrders       // stop
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrdersByPair // stop

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_fetchOrders

function __ccxt_doc_Latoken_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api.latoken.com/doc/v2/#tag/Order/operation/getOrderById
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getStopOrderById

# Arguments
- `id`::string: order id
- `symbol`::string, optional: not used by latoken fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if fetching a trigger order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_fetchOrder

function __ccxt_doc_Latoken_createOrder() end
"""
create a trade order
see: https://api.latoken.com/doc/v2/#tag/Order/operation/placeOrder
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/placeStopOrder  // stop

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at EXCHANGE SPECIFIC PARAMETERS
- `params.condition`::string, optional: "GTC", "IOC", or  "FOK"
- `params.clientOrderId`::string, optional: [ 0 .. 50 ] characters, client's custom order id (free field for your convenience)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_createOrder

function __ccxt_doc_Latoken_cancelOrder() end
"""
cancels an open order
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelOrder
see: https://api.latoken.com/doc/v2/#tag/StopOrder/operation/cancelStopOrder  // stop

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling a trigger order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_cancelOrder

function __ccxt_doc_Latoken_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrders
see: https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrdersByPair

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling trigger orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Latoken_cancelAllOrders

function __ccxt_doc_Latoken_fetchTransactions() end
"""
use fetchDepositsWithdrawals instead
see: https://api.latoken.com/doc/v2/#tag/Transaction/operation/getUserTransactions

# Arguments
- `code`::string: unified currency code for the currency of the transactions, default is undefined
- `since`::int, optional: timestamp in ms of the earliest transaction, default is undefined
- `limit`::int, optional: max number of transactions to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Latoken_fetchTransactions

function __ccxt_doc_Latoken_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/getUsersTransfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Latoken_fetchTransfers

function __ccxt_doc_Latoken_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByEmail
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferById
see: https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByPhone

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Latoken_transfer
