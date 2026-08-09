@kwdef mutable struct Whitebit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    fetchTradingFees::Function = fetchTradingFees
    fetchTradingLimits::Function = fetchTradingLimits
    fetchFundingLimits::Function = fetchFundingLimits
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrder::Function = fetchOrder
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrders::Function = fetchOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    fetchOrderTrades::Function = fetchOrderTrades
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransactions::Function = fetchTransactions
    fetchDepositAddress::Function = fetchDepositAddress
    createDepositAddress::Function = createDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchAccounts::Function = fetchAccounts
    setLeverage::Function = setLeverage
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDeposit::Function = fetchDeposit
    fetchDeposits::Function = fetchDeposits
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchPositionHistory::Function = fetchPositionHistory
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    parseBorrowRate::Function = parseBorrowRate
    isFiat::Function = isFiat
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
end
function describe(self::Whitebit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "whitebit",
    Symbol("name") => "WhiteBit",
    Symbol("version") => "v4",
    Symbol("countries") => ["EE"],
    Symbol("rateLimit") => 20,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCrossBorrowRate") => true,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingLimits") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTradingLimits") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v1/public",
                Symbol("private") => "https://whitebit.com/api/v1"
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v2/public"
            ),
            Symbol("v4") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v4/public",
                Symbol("private") => "https://whitebit.com/api/v4"
            )
        ),
        Symbol("www") => "https://www.whitebit.com",
        Symbol("doc") => "https://github.com/whitebit-exchange/api-docs",
        Symbol("fees") => "https://whitebit.com/fee-schedule",
        Symbol("referral") => "https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("web") => Dict{Symbol, Any}(
            Symbol("get") => ["v1/healthcheck"]
        ),
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => ["markets", "tickers", "ticker", "symbols", "depth/result", "history", "kline"]
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => ["account/balance", "order/new", "order/cancel", "orders", "account/order_history", "account/executed_history", "account/executed_history/all", "account/order"]
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => ["markets", "ticker", "assets", "fee", "depth/{market}", "trades/{market}"]
            )
        ),
        Symbol("v4") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => ["assets", "collateral/markets", "fee", "funding-history/{market}", "orderbook/depth/{market}", "orderbook/{market}", "ticker", "trades/{market}", "time", "ping", "markets", "futures", "platform/status", "mining-pool"]
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => ["collateral-account/balance", "collateral-account/balance-summary", "collateral-account/positions/history", "collateral-account/leverage", "collateral-account/positions/open", "collateral-account/summary", "collateral-account/funding-history", "main-account/address", "main-account/balance", "main-account/create-new-address", "main-account/codes", "main-account/codes/apply", "main-account/codes/my", "main-account/codes/history", "main-account/fiat-deposit-url", "main-account/history", "main-account/withdraw", "main-account/withdraw-pay", "main-account/transfer", "main-account/smart/plans", "main-account/smart/investment", "main-account/smart/investment/close", "main-account/smart/investments", "main-account/fee", "main-account/smart/interest-payment-history", "trade-account/balance", "trade-account/executed-history", "trade-account/order/history", "trade-account/order", "order/collateral/limit", "order/collateral/market", "order/collateral/stop-limit", "order/collateral/trigger-market", "order/collateral/bulk", "order/new", "order/market", "order/stock_market", "order/stop_limit", "order/stop_market", "order/cancel", "order/cancel/all", "order/kill-switch", "order/kill-switch/status", "order/bulk", "order/modify", "order/conditional-cancel", "orders", "oco-orders", "order/collateral/oco", "order/oco-cancel", "order/oto-cancel", "profile/websocket_token", "convert/estimate", "convert/confirm", "convert/history", "sub-account/create", "sub-account/delete", "sub-account/edit", "sub-account/list", "sub-account/transfer", "sub-account/block", "sub-account/unblock", "sub-account/balances", "sub-account/transfer/history", "sub-account/api-key/create", "sub-account/api-key/edit", "sub-account/api-key/delete", "sub-account/api-key/list", "sub-account/api-key/reset", "sub-account/api-key/ip-address/list", "sub-account/api-key/ip-address/create", "sub-account/api-key/ip-address/delete", "mining/rewards", "market/fee", "conditional-orders"]
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fiatCurrencies") => ["EUR", "USD", "RUB", "UAH"],
        Symbol("nonceWindow") => false,
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("account") => "spot"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "main",
            Symbol("main") => "main",
            Symbol("spot") => "spot",
            Symbol("margin") => "collateral",
            Symbol("trade") => "spot"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(),
        Symbol("defaultType") => "spot",
        Symbol("brokerId") => "ccxt"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("checkActive") => true,
                Symbol("checkExecuted") => true,
                Symbol("symbolRequired") => false,
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false
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
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            ),
            Symbol("fetchWithdrawals") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Unauthorized request.") => AuthenticationError,
            Symbol("The market format is invalid.") => BadSymbol,
            Symbol("Market is not available") => BadSymbol,
            Symbol("Invalid payload.") => BadRequest,
            Symbol("Amount must be greater than 0") => InvalidOrder,
            Symbol("Not enough balance.") => InsufficientFunds,
            Symbol("The order id field is required.") => InvalidOrder,
            Symbol("Not enough balance") => InsufficientFunds,
            Symbol("This action is unauthorized.") => PermissionDenied,
            Symbol("This API Key is not authorized to perform this action.") => PermissionDenied,
            Symbol("Unexecuted order was not found.") => OrderNotFound,
            Symbol("The selected from is invalid.") => BadRequest,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("422") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("limit must be less than or equal to") => BadRequest,
            Symbol("The Price should be less than or equal to") => InvalidOrder,
            Symbol("The Price should be greater than or equal to") => InvalidOrder,
            Symbol("This action is unauthorized") => PermissionDenied,
            Symbol("Given amount is less than min amount") => InvalidOrder,
            Symbol("Min amount step") => InvalidOrder,
            Symbol("Total is less than") => InvalidOrder,
            Symbol("fee must be no less than") => InvalidOrder,
            Symbol("Enable your key in API settings") => PermissionDenied,
            Symbol("You don't have such amount for transfer") => InsufficientFunds
        )
    )
))

end
function fetchMarkets(self::Whitebit, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    markets = Base.fetch(self.v4PublicGetMarkets());
    return self.parseMarkets(markets)

end
function parseMarket(self::Whitebit, market)
    id = safeString(market, "name");
    baseId = safeString(market, "stock");
    quoteId = safeString(market, "money");
    quoteId = functions.ccxtruthy((quoteId == "PERP")) ? "USDT" : quoteId;
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    active = safeValue(market, "tradesEnabled");
    isCollateral = safeValue(market, "isCollateral");
    typeId = safeString(market, "type");
    settle = nothing;
    settleId = nothing;
    symbol = string(base, "/", quote_var);
    swap = typeId == "futures";
    margin = @functions.ccxt_and(isCollateral, !functions.ccxtruthy(swap));
    contract = false;
    amountPrecision = self.parseNumber(self.parsePrecision(safeString(market, "stockPrec")));
    contractSize = amountPrecision;
    linear = nothing;
    inverse = nothing;
    if functions.ccxtruthy(swap)
        settleId = quoteId;
        settle = self.safeCurrencyCode(settleId);
        symbol = string(symbol, ":", settle);
        type_var = "swap";
        contract = true;
        linear = true;
        inverse = false;
    else
        type_var = "spot";
    end
    takerFeeRate = safeString(market, "takerFee");
    taker = stringDiv(takerFeeRate, "100");
    makerFeeRate = safeString(market, "makerFee");
    maker = stringDiv(makerFeeRate, "100");
    isSpot = !functions.ccxtruthy(swap);
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => isSpot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.parseNumber(taker),
    Symbol("maker") => self.parseNumber(maker),
    Symbol("contractSize") => functions.ccxtruthy(isSpot) ? nothing : contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "moneyPrec")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minAmount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minTotal"),
            Symbol("max") => self.safeNumber(market, "maxTotal")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)

end
function fetchCurrencies(self::Whitebit, params=Dict())
    response = Base.fetch(self.v4PublicGetAssets(params));
    enhancedArray = self.addKeyInArrayItems(response, "_coin_id");
    return self.parseCurrencies(enhancedArray)

end
function parseCurrency(self::Whitebit, rawCurrency)
    id = safeString(rawCurrency, "_coin_id");
    code = self.safeCurrencyCode(id);
    hasProvider = (ccxt_in("providers", rawCurrency));
    networks = Dict{Symbol, Any}();
    rawNetworks = self.safeDict(rawCurrency, "networks", Dict{Symbol, Any}());
    depositsNetworks = self.safeList(rawNetworks, "deposits", []);
    withdrawsNetworks = self.safeList(rawNetworks, "withdraws", []);
    networkLimits = self.safeDict(rawCurrency, "limits", Dict{Symbol, Any}());
    depositLimits = self.safeDict(networkLimits, "deposit", Dict{Symbol, Any}());
    withdrawLimits = self.safeDict(networkLimits, "withdraw", Dict{Symbol, Any}());
    allNetworks = arrayConcat(depositsNetworks, withdrawsNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(allNetworks)))
        networkId = get(allNetworks, j + 1, nothing);
        networkCode = self.networkIdToCode(networkId, code);
        networkDepositLimits = self.safeDict(depositLimits, networkId, Dict{Symbol, Any}());
        networkWithdrawLimits = self.safeDict(withdrawLimits, networkId, Dict{Symbol, Any}());
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("active") => nothing,
            Symbol("deposit") => inArray(networkId, depositsNetworks),
            Symbol("withdraw") => inArray(networkId, withdrawsNetworks),
            Symbol("fee") => nothing,
            Symbol("precision") => nothing,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(networkDepositLimits, "min"),
                    Symbol("max") => self.safeNumber(networkDepositLimits, "max")
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(networkWithdrawLimits, "min"),
                    Symbol("max") => self.safeNumber(networkWithdrawLimits, "max")
                )
            )
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "can_deposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "can_withdraw"),
    Symbol("fee") => nothing,
    Symbol("networks") => networks,
    Symbol("type") => functions.ccxtruthy(hasProvider) ? "fiat" : "crypto",
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "currency_precision"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min_withdraw"),
            Symbol("max") => self.safeNumber(rawCurrency, "max_withdraw")
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min_deposit"),
            Symbol("max") => self.safeNumber(rawCurrency, "max_deposit")
        )
    )
))

end
function fetchTransactionFees(self::Whitebit, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetFee(params));
    currenciesIds = objectKeys(response);
    withdrawFees = Dict{Symbol, Any}();
    depositFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currenciesIds)))
        currency = get(currenciesIds, i + 1, nothing);
        data = get(response, Symbol(currency), nothing);
        code = self.safeCurrencyCode(currency);
        withdraw = safeValue(data, "withdraw", Dict{Symbol, Any}());
        withdrawFees[Symbol(code)] = safeString(withdraw, "fixed");
        deposit = safeValue(data, "deposit", Dict{Symbol, Any}());
        depositFees[Symbol(code)] = safeString(deposit, "fixed");
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => depositFees,
    Symbol("info") => response
)

end
function fetchDepositWithdrawFees(self::Whitebit, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetFee(params));
    return self.parseDepositWithdrawFees(response, codes)

end
function parseDepositWithdrawFees(self::Whitebit, response, codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    codes = self.marketCodes(codes);
    currencyIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        entry = get(currencyIds, i + 1, nothing);
        splitEntry = split(entry, " ");
        currencyId = get(splitEntry, 1, nothing);
        feeInfo = get(response, Symbol(entry), nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_or((codes == nothing), (inArray(code, codes))))
            depositWithdrawFee = safeValue(depositWithdrawFees, code);
            if functions.ccxtruthy(depositWithdrawFee == nothing)
                depositWithdrawFees[Symbol(code)] = self.depositWithdrawFee(Dict{Symbol, Any}());
            end
            depositWithdrawFees[Symbol(code)][Symbol("info")][Symbol(entry)] = feeInfo;
            networkId = safeString(splitEntry, 1);
            withdraw = safeValue(feeInfo, "withdraw");
            deposit = safeValue(feeInfo, "deposit");
            withdrawFee = self.safeNumber(withdraw, "fixed");
            depositFee = self.safeNumber(deposit, "fixed");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
            );
            depositResult = Dict{Symbol, Any}(
                Symbol("fee") => depositFee,
                Symbol("percentage") => functions.ccxtruthy((depositFee != nothing)) ? false : nothing
            );
            if functions.ccxtruthy(networkId != nothing)
                networkLength = length(networkId);
                networkId = networkId[1 + 1:networkLength - 1];
                networkCode = self.networkIdToCode(networkId, code);
                depositWithdrawFees[Symbol(code)][Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => withdrawResult,
                    Symbol("deposit") => depositResult
                );
            else
                depositWithdrawFees[Symbol(code)][Symbol("withdraw")] = withdrawResult;
                depositWithdrawFees[Symbol(code)][Symbol("deposit")] = depositResult;
            end
        end
        i += 1
    end
    depositWithdrawCodes = objectKeys(depositWithdrawFees);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositWithdrawCodes)))
        code = get(depositWithdrawCodes, i + 1, nothing);
        currency = self.currency(code);
        depositWithdrawFees[Symbol(code)] = self.assignDefaultDepositWithdrawFees(get(depositWithdrawFees, Symbol(code), nothing), currency);
        i += 1
    end
    return depositWithdrawFees

end
function fetchTradingFees(self::Whitebit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetAssets(params));
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = safeValue(response, get(market, Symbol("baseId"), nothing), Dict{Symbol, Any}());
        makerFee = safeString(fee, "maker_fee");
        takerFee = safeString(fee, "taker_fee");
        makerFee = stringDiv(makerFee, "100");
        takerFee = stringDiv(takerFee, "100");
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => get(market, Symbol("symbol"), nothing),
            Symbol("percentage") => true,
            Symbol("tierBased") => false,
            Symbol("maker") => self.parseNumber(makerFee),
            Symbol("taker") => self.parseNumber(takerFee)
        );
        i += 1
    end
    return result

end
function fetchTradingLimits(self::Whitebit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(self.markets);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = get(self.markets, Symbol(marketId), nothing);
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(market), !functions.ccxtruthy(get(market, Symbol("symbol"), nothing))))
            i += 1; continue
        end
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbols)
            symbolFound = false;
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(symbols)))
                if functions.ccxtruthy(get(symbols, j + 1, nothing) == symbol)
                    symbolFound = true;
                    break
                end
                j += 1
            end

            if functions.ccxtruthy(!functions.ccxtruthy(symbolFound))
                i += 1; continue
            end
        end
        limits = self.safeDict(market, "limits");
        amountLimits = self.safeDict(limits, "amount");
        priceLimits = self.safeDict(limits, "price");
        costLimits = self.safeDict(limits, "cost");
        hasAmountLimits = @functions.ccxt_and(@functions.ccxt_and(amountLimits, self.safeNumber(amountLimits, "min") != nothing), self.safeNumber(amountLimits, "max") != nothing);
        hasPriceLimits = @functions.ccxt_and(@functions.ccxt_and(priceLimits, self.safeNumber(priceLimits, "min") != nothing), self.safeNumber(priceLimits, "max") != nothing);
        hasCostLimits = @functions.ccxt_and(@functions.ccxt_and(costLimits, self.safeNumber(costLimits, "min") != nothing), self.safeNumber(costLimits, "max") != nothing);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(hasAmountLimits, hasPriceLimits), hasCostLimits))
            result[Symbol(symbol)] = Dict{Symbol, Any}(
                Symbol("info") => market,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(amountLimits, "min"),
                        Symbol("max") => self.safeNumber(amountLimits, "max")
                    ),
                    Symbol("price") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(priceLimits, "min"),
                        Symbol("max") => self.safeNumber(priceLimits, "max")
                    ),
                    Symbol("cost") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(costLimits, "min"),
                        Symbol("max") => self.safeNumber(costLimits, "max")
                    )
                )
            );
        end
        i += 1
    end
    return result

end
function fetchFundingLimits(self::Whitebit, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (currenciesData, feesData) = (Base.fetch(asyncmap(Base.fetch, [self.fetchCurrencies(), self.v4PublicGetFee(params)])));
    result = Dict{Symbol, Any}();
    currencyKeys = objectKeys(currenciesData);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyKeys)))
        code = get(currencyKeys, i + 1, nothing);
        currency = get(currenciesData, Symbol(code), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(currency))
            i += 1; continue
        end
        if functions.ccxtruthy(@functions.ccxt_and(codes != nothing, !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        feeData = nothing;
        feeKeys = objectKeys(feesData);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(feeKeys)))
            feeKey = get(feeKeys, j + 1, nothing);
            fee = get(feesData, Symbol(feeKey), nothing);
            if functions.ccxtruthy(@functions.ccxt_and(fee, get(fee, Symbol("ticker"), nothing) == code))
                feeData = fee;
                break
            end
            j += 1
        end
        limits = Dict{Symbol, Any}(
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => get(get(get(currency, Symbol("limits"), nothing), Symbol("deposit"), nothing), Symbol("min"), nothing),
                Symbol("max") => get(get(get(currency, Symbol("limits"), nothing), Symbol("deposit"), nothing), Symbol("max"), nothing)
            ),
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => get(get(get(currency, Symbol("limits"), nothing), Symbol("withdraw"), nothing), Symbol("min"), nothing),
                Symbol("max") => get(get(get(currency, Symbol("limits"), nothing), Symbol("withdraw"), nothing), Symbol("max"), nothing)
            )
        );
        if functions.ccxtruthy(feeData)
            depositFee = get(feeData, Symbol("deposit"), nothing);
            withdrawFee = get(feeData, Symbol("withdraw"), nothing);
            if functions.ccxtruthy(depositFee)
                depositFeeData = Dict{Symbol, Any}(
                    Symbol("fixed") => self.safeNumber(depositFee, "fixed")
                );
                if functions.ccxtruthy(get(depositFee, Symbol("flex"), nothing))
                    depositFeeData[Symbol("flex")] = Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "min_fee"),
                        Symbol("max") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "max_fee"),
                        Symbol("percent") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "percent")
                    );
                end
                limits[Symbol("deposit")][Symbol("fee")] = depositFeeData;
            end
            if functions.ccxtruthy(withdrawFee)
                withdrawFeeData = Dict{Symbol, Any}(
                    Symbol("fixed") => self.safeNumber(withdrawFee, "fixed")
                );
                if functions.ccxtruthy(get(withdrawFee, Symbol("flex"), nothing))
                    withdrawFeeData[Symbol("flex")] = Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "min_fee"),
                        Symbol("max") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "max_fee"),
                        Symbol("percent") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "percent")
                    );
                end
                limits[Symbol("withdraw")][Symbol("fee")] = withdrawFeeData;
            end
        end
        if functions.ccxtruthy(get(currency, Symbol("networks"), nothing))
            limits[Symbol("networks")] = get(currency, Symbol("networks"), nothing);
        end
        result[Symbol(code)] = Dict{Symbol, Any}(
            Symbol("info") => currency,
            Symbol("limits") => limits
        );
        i += 1
    end
    return result

end
function fetchTicker(self::Whitebit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetTicker(extend(request, params)));
    ticker = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Whitebit, ticker, market=nothing)
    marketId = safeString2(ticker, "tradingPairs", "ticker_id");
    market = self.safeMarket(marketId, market);
    last_var = safeStringN(ticker, ["last", "last_price", "lastPrice"]);
    close = safeString(ticker, "close", last_var);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString2(ticker, "bid", "highestBid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString2(ticker, "ask", "lowestAsk"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => close,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "change"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeStringN(ticker, ["base_volume", "volume", "baseVolume24h", "stock_volume"]),
    Symbol("quoteVolume") => safeStringN(ticker, ["quote_volume", "deal", "quoteVolume24h", "money_volume"]),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market)

end
function fetchOrder(self::Whitebit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    checkActive = self.safeBool(params, "checkActive", true);
    checkExecuted = self.safeBool(params, "checkExecuted", true);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(checkActive)
        try
            response = Base.fetch(self.v4PrivatePostOrders(extend(request, params)));
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
                order = get(response, i + 1, nothing);
                orderId = safeString(order, "orderId");
                if functions.ccxtruthy(orderId == id)
                    marketId = safeString(order, "market");
                    marketNew = self.safeMarket(marketId, nothing, "_");
                        return self.parseOrder(order, marketNew)
                end
                i += 1
            end
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy((isa(error, OrderNotFound))))
                throw(error);
            end

        end
    end
    if functions.ccxtruthy(checkExecuted)
        try
            response = Base.fetch(self.v4PrivatePostTradeAccountOrderHistory(extend(request, params)));
            marketIds = objectKeys(response);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
                marketId = get(marketIds, i + 1, nothing);
                marketNew = self.safeMarket(marketId, nothing, "_");
                orders = get(response, Symbol(marketId), nothing);
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(orders)))
                    order = get(orders, j + 1, nothing);
                    orderId = safeString(order, "id");
                    if functions.ccxtruthy(orderId == id)
                            return self.parseOrder(order, marketNew)
                    end
                    j += 1
                end
                i += 1
            end
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy((isa(error, OrderNotFound))))
                throw(error);
            end

        end
    end
    throw(OrderNotFound(string(self.id, " fetchOrder() order not found: ", id)));

end
function fetchTickers(self::Whitebit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    onlyContractSymbols = true;
    if functions.ccxtruthy(symbols != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            market = self.market(symbol);
            if functions.ccxtruthy(!functions.ccxtruthy((get(market, Symbol("contract"), nothing))))
                onlyContractSymbols = false;
                break
            end
            i += 1
        end

    else
        onlyContractSymbols = false;
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", nothing, params);
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchTickers", "method", method);
    if functions.ccxtruthy(method == nothing)
        if functions.ccxtruthy(@functions.ccxt_or(onlyContractSymbols, (marketType == "swap")))
            method = "v4PublicGetFutures";
        else
            method = "v4PublicGetTicker";
        end
    end
    if functions.ccxtruthy(method == "v4PublicGetTicker")
        response = Base.fetch(self.v4PublicGetTicker(params));
    elseif functions.ccxtruthy(method == "v4PublicGetFutures")
        response = Base.fetch(self.v4PublicGetFutures(params));
    else
        response = Base.fetch(self.v2PublicGetTicker(params));
    end
    resultList = self.safeList(response, "result");
    if functions.ccxtruthy(resultList != nothing)
            return self.parseTickers(resultList, symbols)
    end
    marketIds = objectKeys(response);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = self.safeMarket(marketId);
        ticker = self.parseTicker(get(response, Symbol(marketId), nothing), market);
        symbol = get(ticker, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchOrderBook(self::Whitebit, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PublicGetOrderbookMarket(extend(request, params)));
    timestamp = safeTimestamp(response, "timestamp");
    return self.parseOrderBook(response, symbol, timestamp)

end
function fetchTrades(self::Whitebit, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PublicGetTradesMarket(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchMyTrades(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountExecutedHistory(extend(request, params)));
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return self.parseTrades(response, market, since, limit)
    else
        results = [];
        keys_var = objectKeys(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            marketId = get(keys_var, i + 1, nothing);
            marketNew = self.safeMarket(marketId, nothing, "_");
            rawTrades = safeValue(response, marketId, []);
            parsed = self.parseTrades(rawTrades, marketNew, since, limit);
            results = arrayConcat(results, parsed);
            i += 1
        end
        results = sortBy2(results, "timestamp", "id");
        return self.filterBySinceLimit(results, since, limit, "timestamp")
    end

end
function parseTrade(self::Whitebit, trade, market=nothing)
    market = self.safeMarket(nothing, market);
    timestamp = safeTimestamp2(trade, "time", "trade_timestamp");
    orderId = safeString2(trade, "dealOrderId", "orderId");
    cost = safeString(trade, "deal");
    price = safeString(trade, "price");
    amount = safeString2(trade, "amount", "quote_volume");
    id = safeString2(trade, "id", "tradeID");
    side = safeString2(trade, "type", "side");
    symbol = get(market, Symbol("symbol"), nothing);
    role = safeInteger(trade, "role");
    takerOrMaker = nothing;
    if functions.ccxtruthy(role != nothing)
        takerOrMaker = functions.ccxtruthy((role == 1)) ? "maker" : "taker";
    end
    fee = nothing;
    feeCost = safeString(trade, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => self.safeCurrencyCode(safeString(trade, "feeAsset"))
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market)

end
function fetchOHLCV(self::Whitebit, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        maxLimit = 1440;
        if functions.ccxtruthy(limit == nothing)
            limit = maxLimit;
        end
        limit = min(limit, maxLimit);
        start = self.parseToInt(since / 1000);
        request[Symbol("start")] = start;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1440);
    end
    response = Base.fetch(self.v1PublicGetKline(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOHLCVs(result, market, timeframe, since, limit)

end
function parseOHLCV(self::Whitebit, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
function fetchStatus(self::Whitebit, params=Dict())
    response = Base.fetch(self.v4PublicGetPing(params));
    status = safeString(response, 0);
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "pong")) ? "ok" : status,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Whitebit, params=Dict())
    response = Base.fetch(self.v4PublicGetTime(params));
    return safeIntegerProduct(response, "time", 1000)

end
function createMarketOrderWithCost(self::Whitebit, symbol, side, cost, params=Dict())
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", side, 0, nothing, extend(req, params)))

end
function createMarketBuyOrderWithCost(self::Whitebit, symbol, cost, params=Dict())
    return Base.fetch(self.createMarketOrderWithCost(symbol, "buy", cost, params))

end
function createOrder(self::Whitebit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => side
    );
    cost = nothing;
    (cost, params) = self.handleParamString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((side != "buy"), (type_var != "market")))
            throw(InvalidOrder(string(self.id, " createOrder() cost is only supported for market buy orders")));
        end
        request[Symbol("amount")] = self.costToPrecision(symbol, cost);
    else
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        brokerId = safeString(self.options, "brokerId");
        if functions.ccxtruthy(brokerId != nothing)
            request[Symbol("clientOrderId")] = string(brokerId, uuid16());
        end
    else
        request[Symbol("clientOrderId")] = clientOrderId;
        params = omit(params, ["clientOrderId"]);
    end
    marketType = safeString(market, "type");
    isLimitOrder = type_var == "limit";
    isMarketOrder = type_var == "market";
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "activation_price"]);
    isStopOrder = (triggerPrice != nothing);
    postOnly = self.isPostOnly(isMarketOrder, false, params);
    (marginMode, query) = self.handleMarginModeAndParams("createOrder", params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != nothing, marginMode != "cross"))
        throw(NotSupported(string(self.id, " createOrder() is only available for cross margin")));
    end
    params = omit(query, ["postOnly", "triggerPrice", "stopPrice"]);
    useCollateralEndpoint = @functions.ccxt_or(marginMode != nothing, marketType == "swap");
    if functions.ccxtruthy(isStopOrder)
        request[Symbol("activation_price")] = self.priceToPrecision(symbol, triggerPrice);
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
            response = Base.fetch(self.v4PrivatePostOrderStopLimit(extend(request, params)));
        else
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralTriggerMarket(extend(request, params)));
            else
                response = Base.fetch(self.v4PrivatePostOrderStopMarket(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralLimit(extend(request, params)));
            else
                response = Base.fetch(self.v4PrivatePostOrderNew(extend(request, params)));
            end
        else
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralMarket(extend(request, params)));
            else
                if functions.ccxtruthy(cost != nothing)
                    response = Base.fetch(self.v4PrivatePostOrderMarket(extend(request, params)));
                else
                    response = Base.fetch(self.v4PrivatePostOrderStockMarket(extend(request, params)));
                end
            end
        end
    end
    return self.parseOrder(response)

end
function editOrder(self::Whitebit, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "activationPrice"]);
    isStopOrder = (triggerPrice != nothing);
    if functions.ccxtruthy(isStopOrder)
        request[Symbol("activation_price")] = self.priceToPrecision(symbol, triggerPrice);
    end
    isLimitOrder = type_var == "limit";
    total = self.safeNumber(params, "total");
    if functions.ccxtruthy(total != nothing)
        request[Symbol("total")] = self.amountToPrecision(symbol, total);
    elseif functions.ccxtruthy(amount != nothing)
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        elseif functions.ccxtruthy(@functions.ccxt_and(type_var == "market", side == "buy"))
            request[Symbol("total")] = self.amountToPrecision(symbol, amount);
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    hasModifiableParam = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((amount != nothing), (price != nothing)), (triggerPrice != nothing)), (total != nothing));
    if functions.ccxtruthy(!functions.ccxtruthy(hasModifiableParam))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires at least one of: amount, price, activationPrice, or total parameters")));
    end
    params = omit(params, ["clientOrderId", "triggerPrice", "stopPrice", "activationPrice", "total"]);
    response = Base.fetch(self.v4PrivatePostOrderModify(extend(request, params)));
    return self.parseOrder(response)

end
function cancelOrder(self::Whitebit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => ccxt_parseInt(id)
    );
    response = Base.fetch(self.v4PrivatePostOrderCancel(extend(request, params)));
    return self.parseOrder(response)

end
function cancelAllOrders(self::Whitebit, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    requestType = [];
    if functions.ccxtruthy(type_var == "spot")
        isMargin = nothing;
        (isMargin, params) = self.handleOptionAndParams(params, "cancelAllOrders", "isMargin", false);
        if functions.ccxtruthy(isMargin)
                        push!(requestType, "margin");
        else
            push!(requestType, "spot");
        end
    elseif functions.ccxtruthy(type_var == "swap")
        push!(requestType, "futures");
    else
        throw(NotSupported(string(self.id, " cancelAllOrders() does not support ", type_var, " type")));
    end
    request[Symbol("type")] = requestType;
    response = Base.fetch(self.v4PrivatePostOrderCancelAll(extend(request, params)));
    return self.parseOrders(response, market)

end
function fetchOrders(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (openOrders, closedOrders) = (Base.fetch(asyncmap(Base.fetch, [self.fetchOpenOrders(symbol, since, limit, params), self.fetchClosedOrders(symbol, since, limit, params)])));
    allOrders = arrayConcat(openOrders, closedOrders);
    sortedOrders = sortBy(allOrders, "timestamp", true);
    if functions.ccxtruthy(@functions.ccxt_and(limit != nothing, functions.ccxt_gt(length(sortedOrders), limit)))
            return sortedOrders[0 + 1:limit]
    end
    return sortedOrders

end
function cancelAllOrdersAfter(self::Whitebit, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = safeString(params, "symbol");
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrdersAfter() requires a symbol argument in params")));
    end
    market = self.market(symbol);
    params = omit(params, "symbol");
    isBiggerThanZero = (functions.ccxt_gt(timeout, 0));
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(isBiggerThanZero)
        request[Symbol("timeout")] = numberToString(timeout / 1000);
    else
        request[Symbol("timeout")] = "null";
    end
    response = Base.fetch(self.v4PrivatePostOrderKillSwitch(extend(request, params)));
    return response

end
function parseBalance(self::Whitebit, response)
    balanceKeys = objectKeys(response);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balanceKeys)))
        id = get(balanceKeys, i + 1, nothing);
        code = self.safeCurrencyCode(id);
        balance = get(response, Symbol(id), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(balance != nothing, self.isDictionary(balance)))
            account = self.account();
            account[Symbol("free")] = safeString2(balance, "available", "main_balance");
            account[Symbol("used")] = safeString(balance, "freeze");
            account[Symbol("total")] = safeString(balance, "main_balance");
            result[Symbol(code)] = account;
        else
            account = self.account();
            account[Symbol("total")] = balance;
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Whitebit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.v4PrivatePostCollateralAccountBalance(params));
    else
        options = safeValue(self.options, "fetchBalance", Dict{Symbol, Any}());
        defaultAccount = safeString(options, "account");
        account = safeString2(params, "account", "type", defaultAccount);
        params = omit(params, ["account", "type"]);
        if functions.ccxtruthy(@functions.ccxt_or(account == "main", account == "funding"))
            response = Base.fetch(self.v4PrivatePostMainAccountBalance(params));
        else
            response = Base.fetch(self.v4PrivatePostTradeAccountBalance(params));
        end
    end
    return self.parseBalance(response)

end
function fetchOpenOrders(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit, Dict{Symbol, Any}(
    Symbol("status") => "open"
))

end
function fetchClosedOrders(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountOrderHistory(extend(request, params)));
    marketIds = objectKeys(response);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        marketNew = self.safeMarket(marketId, nothing, "_");
        orders = get(response, Symbol(marketId), nothing);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(orders)))
            order = self.parseOrder(get(orders, j + 1, nothing), marketNew);
            push!(results, extend(order, Dict{Symbol, Any}(
    Symbol("status") => "closed"
)));
            j += 1
        end
        i += 1
    end
    results = sortBy(results, "timestamp");
    results = self.filterBySymbolSinceLimit(results, symbol, since, limit);
    return results

end
function parseOrderType(self::Whitebit, type_var)
    types = Dict{Symbol, Any}(
        Symbol("limit") => "limit",
        Symbol("market") => "market",
        Symbol("stop market") => "market",
        Symbol("stop limit") => "limit",
        Symbol("stock market") => "market",
        Symbol("margin limit") => "limit",
        Symbol("margin market") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Whitebit, order, market=nothing)
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId, market, "_");
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeString(order, "side");
    filled = safeString(order, "dealStock");
    remaining = safeString(order, "left");
    clientOrderId = safeString(order, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == "")
        clientOrderId = nothing;
    end
    price = safeString(order, "price");
    triggerPrice = self.safeNumber(order, "activation_price");
    orderId = safeString2(order, "orderId", "id");
    type_var = safeString(order, "type");
    orderType = self.parseOrderType(type_var);
    if functions.ccxtruthy(orderType == "market")
        remaining = nothing;
    end
    amount = safeString(order, "amount");
    cost = safeString(order, "dealMoney");
    if functions.ccxtruthy(@functions.ccxt_and((side == "buy"), (@functions.ccxt_or((type_var == "market"), (type_var == "stop market")))))
        amount = filled;
    end
    dealFee = safeString(order, "dealFee");
    fee = nothing;
    if functions.ccxtruthy(dealFee != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(dealFee),
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    end
    timestamp = safeTimestamp2(order, "ctime", "timestamp");
    lastTradeTimestamp = safeTimestamp(order, "ftime");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => orderId,
    Symbol("symbol") => symbol,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("type") => orderType,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("average") => nothing,
    Symbol("cost") => cost,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function parseOrderStatus(self::Whitebit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CANCELED") => "canceled",
        Symbol("OPEN") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed"
    );
    return safeStringLower(statuses, status, status)

end
function fetchOrderTrades(self::Whitebit, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountOrder(extend(request, params)));
    data = self.safeList(response, "records", []);
    return self.parseTrades(data, market)

end
function fetchWithdrawals(self::Whitebit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    request[Symbol("transactionMethod")] = "2";
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    return self.parseTransactions(self.safeList(response, "records", []), currency, since, limit)

end
function fetchTransactions(self::Whitebit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchDepositAddress(self::Whitebit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(self.isFiat(code))
        provider = safeString(params, "provider");
        if functions.ccxtruthy(provider == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires a provider when the ticker is fiat")));
        end
        request[Symbol("provider")] = provider;
        amount = self.safeNumber(params, "amount");
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires an amount when the ticker is fiat")));
        end
        request[Symbol("amount")] = amount;
        uniqueId = safeValue(params, "uniqueId");
        if functions.ccxtruthy(uniqueId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires an uniqueId when the ticker is fiat")));
        end
        response = Base.fetch(self.v4PrivatePostMainAccountFiatDepositUrl(extend(request, params)));
    else
        response = Base.fetch(self.v4PrivatePostMainAccountAddress(extend(request, params)));
    end
    url = safeString(response, "url");
    account = safeValue(response, "account", Dict{Symbol, Any}());
    address = safeString(account, "address", url);
    tag = safeString(account, "memo");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function createDepositAddress(self::Whitebit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PrivatePostMainAccountCreateNewAddress(extend(request, params)));
    data = self.safeDict(response, "account", Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency)

end
function parseDepositAddress(self::Whitebit, depositAddress, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("network") => nothing,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
function fetchAccounts(self::Whitebit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accounts = [];
    subAccounts = Base.fetch(self.v4PrivatePostSubAccountList(params));
    if functions.ccxtruthy(@functions.ccxt_and(subAccounts, functions.ccxt_isArray(subAccounts)))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(subAccounts)))
            subAccount = safeValue(subAccounts, i);
            accountId = safeString(subAccount, "id");
            accountName = safeString(subAccount, "name");
            if functions.ccxtruthy(accountId)
                                push!(accounts, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => "subaccount",
    Symbol("name") => @functions.ccxt_or(accountName, string("SubAccount ", accountId)),
    Symbol("code") => nothing,
    Symbol("info") => subAccount
));
            end
            i += 1
        end

    end
    return accounts

end
function setLeverage(self::Whitebit, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol != nothing)
        throw(NotSupported(string(self.id, " setLeverage() does not allow to set per symbol")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 20))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 20")));
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.v4PrivatePostCollateralAccountLeverage(extend(request, params)))

end
function transfer(self::Whitebit, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsByType");
    fromAccountId = safeString(accountsByType, fromAccount, fromAccount);
    toAccountId = safeString(accountsByType, toAccount, toAccount);
    amountString = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amountString,
        Symbol("from") => fromAccountId,
        Symbol("to") => toAccountId
    );
    response = Base.fetch(self.v4PrivatePostMainAccountTransfer(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Whitebit, transfer, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing
)

end
function withdraw(self::Whitebit, code, amount, address, tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    uniqueId = safeValue(params, "uniqueId");
    if functions.ccxtruthy(uniqueId == nothing)
        uniqueId = uuid22();
    end
    request[Symbol("uniqueId")] = uniqueId;
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    if functions.ccxtruthy(self.isFiat(code))
        provider = safeValue(params, "provider");
        if functions.ccxtruthy(provider == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires a provider when the ticker is fiat")));
        end
        request[Symbol("provider")] = provider;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountWithdraw(extend(request, params)));
    return extend(self.parseTransaction(response, currency), Dict{Symbol, Any}(
    Symbol("id") => uniqueId
))

end
function parseTransaction(self::Whitebit, transaction, currency=nothing)
    currency = self.safeCurrency(nothing, currency);
    address = safeString(transaction, "address");
    timestamp = safeTimestamp(transaction, "createdAt");
    currencyId = safeString(transaction, "ticker");
    status = safeString(transaction, "status");
    method = safeString(transaction, "method");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "uniqueId"),
    Symbol("txid") => safeString(transaction, "transactionId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => safeString(transaction, "network"),
    Symbol("addressFrom") => functions.ccxtruthy((method == "1")) ? address : nothing,
    Symbol("address") => address,
    Symbol("addressTo") => functions.ccxtruthy((method == "2")) ? address : nothing,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("type") => functions.ccxtruthy((method == "1")) ? "deposit" : "withdrawal",
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => safeString(transaction, "memo"),
    Symbol("tagTo") => nothing,
    Symbol("comment") => safeString(transaction, "description"),
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(transaction, "fee"),
        Symbol("currency") => self.safeCurrencyCode(currencyId, currency)
    ),
    Symbol("info") => transaction
)

end
function parseTransactionStatus(self::Whitebit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("1") => "pending",
        Symbol("2") => "pending",
        Symbol("3") => "ok",
        Symbol("4") => "canceled",
        Symbol("5") => "pending",
        Symbol("6") => "pending",
        Symbol("7") => "ok",
        Symbol("9") => "canceled",
        Symbol("10") => "pending",
        Symbol("11") => "pending",
        Symbol("12") => "pending",
        Symbol("13") => "pending",
        Symbol("14") => "pending",
        Symbol("15") => "pending",
        Symbol("16") => "pending",
        Symbol("17") => "pending"
    );
    return safeString(statuses, status, status)

end
function fetchDeposit(self::Whitebit, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("transactionMethod") => 1,
        Symbol("uniqueId") => id,
        Symbol("limit") => 1,
        Symbol("offset") => 0
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = safeValue(response, "records", []);
    first_var = self.safeDict(records, 0, Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency)

end
function fetchDeposits(self::Whitebit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("transactionMethod") => 1,
        Symbol("limit") => 100,
        Symbol("offset") => 0
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = self.safeList(response, "records", []);
    return self.parseTransactions(records, currency, since, limit)

end
function fetchBorrowInterest(self::Whitebit, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(extend(request, params)));
    interest = self.parseBorrowInterests(response, market);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Whitebit, info, market=nothing)
    marketId = safeString(info, "market");
    symbol = self.safeSymbol(marketId, market, "_");
    timestamp = safeTimestamp(info, "modifyDate");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => "USDT",
    Symbol("interest") => self.safeNumber(info, "unrealizedFunding"),
    Symbol("interestRate") => 0.00098,
    Symbol("amountBorrowed") => self.safeNumber(info, "amount"),
    Symbol("marginMode") => "cross",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchFundingRate(self::Whitebit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = self.symbol(symbol);
    response = Base.fetch(self.fetchFundingRates([symbol], params));
    return safeValue(response, symbol)

end
function fetchFundingRates(self::Whitebit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.v4PublicGetFutures(params));
    data = self.safeList(response, "result", []);
    return self.parseFundingRates(data, symbols)

end
function parseFundingRate(self::Whitebit, contract, market=nothing)
    marketId = safeString(contract, "ticker_id");
    symbol = self.safeSymbol(marketId, market);
    markPrice = self.safeNumber(contract, "markPrice");
    indexPrice = self.safeNumber(contract, "indexPrice");
    interestRate = self.safeNumber(contract, "interestRate");
    fundingRate = self.safeNumber(contract, "funding_rate");
    fundingTime = safeInteger(contract, "next_funding_rate_timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => interestRate,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function fetchFundingHistory(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = since;
    end
    (request, params) = self.handleUntilOption("endDate", request, params);
    response = Base.fetch(self.v4PrivatePostCollateralAccountFundingHistory(request));
    data = self.safeList(response, "records", []);
    return self.parseFundingHistories(data, market, since, limit)

end
function parseFundingHistory(self::Whitebit, contract, market=nothing)
    marketId = safeString(contract, "market");
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("code") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.safeNumber(contract, "fundingAmount")
)

end
function parseFundingHistories(self::Whitebit, contracts, market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contracts)))
        contract = get(contracts, i + 1, nothing);
        push!(result, self.parseFundingHistory(contract, market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since, limit)

end
function fetchDepositsWithdrawals(self::Whitebit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = self.safeList(response, "records");
    return self.parseTransactions(records, currency, since, limit)

end
function fetchConvertQuote(self::Whitebit, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    request = Dict{Symbol, Any}(
        Symbol("from") => fromCode,
        Symbol("to") => toCode,
        Symbol("amount") => numberToString(amount),
        Symbol("direction") => "from"
    );
    response = Base.fetch(self.v4PrivatePostConvertEstimate(extend(request, params)));
    return self.parseConversion(response, fromCurrency, toCurrency)

end
function createConvertTrade(self::Whitebit, id, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    request = Dict{Symbol, Any}(
        Symbol("quoteId") => id
    );
    response = Base.fetch(self.v4PrivatePostConvertConfirm(extend(request, params)));
    return self.parseConversion(response, fromCurrency, toCurrency)

end
function fetchConvertTradeHistory(self::Whitebit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        request[Symbol("fromTicker")] = code;
    end
    if functions.ccxtruthy(since != nothing)
        start = self.parseToInt(since / 1000);
        request[Symbol("from")] = numberToString(start);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("to", request, params, 0.001);
    response = Base.fetch(self.v4PrivatePostConvertHistory(extend(request, params)));
    rows = self.safeList(response, "records", []);
    return self.parseConversions(rows, code, "fromCurrency", "toCurrency", since, limit)

end
function parseConversion(self::Whitebit, conversion, fromCurrency=nothing, toCurrency=nothing)
    path = self.safeList(conversion, "path", []);
    first_var = self.safeDict(path, 0, Dict{Symbol, Any}());
    fromPath = safeString(first_var, "from");
    toPath = safeString(first_var, "to");
    timestamp = safeTimestamp2(conversion, "date", "expireAt");
    fromCoin = safeString(conversion, "from", fromPath);
    fromCode = self.safeCurrencyCode(fromCoin, fromCurrency);
    toCoin = safeString(conversion, "to", toPath);
    toCode = self.safeCurrencyCode(toCoin, toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(conversion, "id"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber2(conversion, "give", "finalGive"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber2(conversion, "receive", "finalReceive"),
    Symbol("price") => self.safeNumber(conversion, "rate"),
    Symbol("fee") => nothing
)

end
function fetchPositionHistory(self::Whitebit, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = since;
    end
    (request, params) = self.handleUntilOption("endDate", request, params);
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsHistory(extend(request, params)));
    positions = self.parsePositions(response);
    return self.filterBySymbolSinceLimit(positions, symbol, since, limit)

end
function fetchPositions(self::Whitebit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(params));
    return self.parsePositions(response, symbols)

end
function fetchPosition(self::Whitebit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(extend(request, params)));
    data = self.safeDict(response, 0, Dict{Symbol, Any}());
    return self.parsePosition(data, market)

end
function parsePosition(self::Whitebit, position, market=nothing)
    marketId = safeString(position, "market");
    timestamp = safeTimestamp(position, "openDate");
    tpsl = self.safeDict(position, "tpsl", Dict{Symbol, Any}());
    orderDetail = self.safeDict(position, "orderDetail", Dict{Symbol, Any}());
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "positionId"),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("notional") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("entryPrice") => self.safeNumber(position, "basePrice"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "pnl"),
    Symbol("realizedPnl") => self.safeNumber(orderDetail, "realizedPnl"),
    Symbol("percentage") => self.safeNumber(position, "pnlPercent"),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => nothing,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeTimestamp(position, "modifyDate"),
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => self.safeNumber(position, "margin"),
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => self.safeNumber(tpsl, "stopLoss"),
    Symbol("takeProfitPrice") => self.safeNumber(tpsl, "takeProfit")
))

end
function fetchCrossBorrowRate(self::Whitebit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PrivatePostMainAccountSmartPlans(extend(request, params)));
    data = self.safeList(response, 0, []);
    return self.parseBorrowRate(data, currency)

end
function parseBorrowRate(self::Whitebit, info, currency=nothing)
    currencyId = safeString(info, "ticker");
    percent = safeString(info, "percent");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("rate") => self.parseNumber(stringDiv(percent, "100")),
    Symbol("period") => safeInteger(info, "duration"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function isFiat(self::Whitebit, currency)
    fiatCurrencies = safeValue(self.options, "fiatCurrencies", []);
    return inArray(currency, fiatCurrencies)

end
function fetchFundingRateHistory(self::Whitebit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, maxLimit))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = round(since / 1000);
    end
    (request, params) = self.handleUntilOption("until_timestamp", request, params, 0.001);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PublicGetFundingHistoryMarket(extend(request, params)));
    return self.parseFundingRateHistories(response, market, since, limit)

end
function parseFundingRateHistory(self::Whitebit, info, market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId, market);
    timestamp = safeTimestamp(info, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(info, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function nonce(self::Whitebit, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Whitebit, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    version = safeValue(api, 0);
    accessibility = safeValue(api, 1);
    if functions.ccxtruthy(headers == nothing)
        headers = Dict{Symbol, Any}();
    end
    headers[Symbol("User-Agent")] = string("ccxt/", self.id, "-", self.version);
    pathWithParams = string("/", self.implodeParams(path, params));
    url = string(get(get(get(self.urls, Symbol("api"), nothing), Symbol(version), nothing), Symbol(accessibility), nothing), pathWithParams);
    if functions.ccxtruthy(accessibility == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(accessibility == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        secret = self.encode(self.secret);
        request = string("/", "api", "/", version, pathWithParams);
        (nonceWindow, requestParams) = self.handleOptionAndParams(params, "sign", "nonceWindow", false);
        body = json(extend(Dict{Symbol, Any}(
    Symbol("request") => request,
    Symbol("nonce") => nonce,
    Symbol("nonceWindow") => nonceWindow
), requestParams));
        payload = self.stringToBase64(body);
        signature = self.hmac(self.encode(payload), secret, sha512);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("X-TXC-APIKEY") => self.apiKey,
            Symbol("X-TXC-PAYLOAD") => payload,
            Symbol("X-TXC-SIGNATURE") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Whitebit, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 418), (code == 429)))
        throw(DDoSProtection(string(self.id, " ", code, " ", reason, " ", body)));
    end
    if functions.ccxtruthy(code == 404)
        throw(ExchangeError(string(self.id, " ", code, " endpoint not found")));
    end
    if functions.ccxtruthy(response != nothing)
        status = safeString(response, "status");
        errors = safeValue(response, "errors");
        message = safeString(response, "message");
        codeNew = safeInteger(response, "code");
        hasErrorStatus = @functions.ccxt_and(@functions.ccxt_and(status != nothing, status != "200"), errors != nothing);
        if functions.ccxtruthy(@functions.ccxt_or(hasErrorStatus, codeNew != nothing))
            feedback = string(self.id, " ", body);
            errorInfo = message;
            if functions.ccxtruthy(hasErrorStatus)
                errorInfo = status;
            else
                errorObject = self.safeDict(response, "errors", Dict{Symbol, Any}());
                errorKeys = objectKeys(errorObject);
                errorsLength = length(errorKeys);
                if functions.ccxtruthy(functions.ccxt_gt(errorsLength, 0))
                    errorKey = get(errorKeys, 1, nothing);
                    errorMessageArray = safeValue(errorObject, errorKey, []);
                    errorMessageLength = length(errorMessageArray);
                    errorInfo = functions.ccxtruthy((functions.ccxt_gt(errorMessageLength, 0))) ? get(errorMessageArray, 1, nothing) : body;
                end
            end
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorInfo, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            throw(ExchangeError(feedback));
        end
        success = self.safeBool(response, "success", true);
        if functions.ccxtruthy(!functions.ccxtruthy(success))
            errMsg = self.safeDict(response, "message", Dict{Symbol, Any}());
            errKeys = objectKeys(errMsg);
            errKeysLength = length(errKeys);
            errorInfo = body;
            if functions.ccxtruthy(functions.ccxt_gt(errKeysLength, 0))
                errorKey = get(errKeys, 1, nothing);
                errorMessageArray = self.safeList(errMsg, errorKey, []);
                errorMessageLength = length(errorMessageArray);
                errorInfo = functions.ccxtruthy((functions.ccxt_gt(errorMessageLength, 0))) ? get(errorMessageArray, 1, nothing) : body;
            end
            feedback = string(self.id, " ", body);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorInfo, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Whitebit, name::Symbol) = ccxt_getproperty(self, name)

function Whitebit(; kwargs...)
    inst = Whitebit(Exchange(), describe, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFees, fetchTradingFees, fetchTradingLimits, fetchFundingLimits, fetchTicker, parseTicker, fetchOrder, fetchTickers, fetchOrderBook, fetchTrades, fetchMyTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchStatus, fetchTime, createMarketOrderWithCost, createMarketBuyOrderWithCost, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOrders, cancelAllOrdersAfter, parseBalance, fetchBalance, fetchOpenOrders, fetchClosedOrders, parseOrderType, parseOrder, parseOrderStatus, fetchOrderTrades, fetchWithdrawals, fetchTransactions, fetchDepositAddress, createDepositAddress, parseDepositAddress, fetchAccounts, setLeverage, transfer, parseTransfer, withdraw, parseTransaction, parseTransactionStatus, fetchDeposit, fetchDeposits, fetchBorrowInterest, parseBorrowInterest, fetchFundingRate, fetchFundingRates, parseFundingRate, fetchFundingHistory, parseFundingHistory, parseFundingHistories, fetchDepositsWithdrawals, fetchConvertQuote, createConvertTrade, fetchConvertTradeHistory, parseConversion, fetchPositionHistory, fetchPositions, fetchPosition, parsePosition, fetchCrossBorrowRate, parseBorrowRate, isFiat, fetchFundingRateHistory, parseFundingRateHistory, nonce, sign, handleErrors)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
