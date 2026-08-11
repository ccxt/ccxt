@kwdef mutable struct Coinone <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    cancelOrder::Function = cancelOrder
    fetchDepositAddresses::Function = fetchDepositAddresses
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetTicker::Function = publicGetTicker
    publicGetTickerUtc::Function = publicGetTickerUtc
    publicGetTrades::Function = publicGetTrades
    v2PublicGetRangeUnits::Function = v2PublicGetRangeUnits
    v2PublicGetMarketsQuoteCurrency::Function = v2PublicGetMarketsQuoteCurrency
    v2PublicGetMarketsQuoteCurrencyTargetCurrency::Function = v2PublicGetMarketsQuoteCurrencyTargetCurrency
    v2PublicGetOrderbookQuoteCurrencyTargetCurrency::Function = v2PublicGetOrderbookQuoteCurrencyTargetCurrency
    v2PublicGetTradesQuoteCurrencyTargetCurrency::Function = v2PublicGetTradesQuoteCurrencyTargetCurrency
    v2PublicGetTickerNewQuoteCurrency::Function = v2PublicGetTickerNewQuoteCurrency
    v2PublicGetTickerNewQuoteCurrencyTargetCurrency::Function = v2PublicGetTickerNewQuoteCurrencyTargetCurrency
    v2PublicGetTickerUtcNewQuoteCurrency::Function = v2PublicGetTickerUtcNewQuoteCurrency
    v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency::Function = v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency
    v2PublicGetCurrencies::Function = v2PublicGetCurrencies
    v2PublicGetCurrenciesCurrency::Function = v2PublicGetCurrenciesCurrency
    v2PublicGetChartQuoteCurrencyTargetCurrency::Function = v2PublicGetChartQuoteCurrencyTargetCurrency
    privatePostAccountDepositAddress::Function = privatePostAccountDepositAddress
    privatePostAccountBtcDepositAddress::Function = privatePostAccountBtcDepositAddress
    privatePostAccountBalance::Function = privatePostAccountBalance
    privatePostAccountDailyBalance::Function = privatePostAccountDailyBalance
    privatePostAccountUserInfo::Function = privatePostAccountUserInfo
    privatePostAccountVirtualAccount::Function = privatePostAccountVirtualAccount
    privatePostOrderCancelAll::Function = privatePostOrderCancelAll
    privatePostOrderCancel::Function = privatePostOrderCancel
    privatePostOrderLimitBuy::Function = privatePostOrderLimitBuy
    privatePostOrderLimitSell::Function = privatePostOrderLimitSell
    privatePostOrderCompleteOrders::Function = privatePostOrderCompleteOrders
    privatePostOrderLimitOrders::Function = privatePostOrderLimitOrders
    privatePostOrderOrderInfo::Function = privatePostOrderOrderInfo
    privatePostTransactionAuthNumber::Function = privatePostTransactionAuthNumber
    privatePostTransactionHistory::Function = privatePostTransactionHistory
    privatePostTransactionKrwHistory::Function = privatePostTransactionKrwHistory
    privatePostTransactionBtc::Function = privatePostTransactionBtc
    privatePostTransactionCoin::Function = privatePostTransactionCoin
    v2PrivatePostAccountBalance::Function = v2PrivatePostAccountBalance
    v2PrivatePostAccountDepositAddress::Function = v2PrivatePostAccountDepositAddress
    v2PrivatePostAccountUserInfo::Function = v2PrivatePostAccountUserInfo
    v2PrivatePostAccountVirtualAccount::Function = v2PrivatePostAccountVirtualAccount
    v2PrivatePostOrderCancel::Function = v2PrivatePostOrderCancel
    v2PrivatePostOrderLimitBuy::Function = v2PrivatePostOrderLimitBuy
    v2PrivatePostOrderLimitSell::Function = v2PrivatePostOrderLimitSell
    v2PrivatePostOrderLimitOrders::Function = v2PrivatePostOrderLimitOrders
    v2PrivatePostOrderCompleteOrders::Function = v2PrivatePostOrderCompleteOrders
    v2PrivatePostOrderQueryOrder::Function = v2PrivatePostOrderQueryOrder
    v2PrivatePostTransactionAuthNumber::Function = v2PrivatePostTransactionAuthNumber
    v2PrivatePostTransactionBtc::Function = v2PrivatePostTransactionBtc
    v2PrivatePostTransactionHistory::Function = v2PrivatePostTransactionHistory
    v2PrivatePostTransactionKrwHistory::Function = v2PrivatePostTransactionKrwHistory
    v2_1PrivatePostAccountBalanceAll::Function = v2_1PrivatePostAccountBalanceAll
    v2_1PrivatePostAccountBalance::Function = v2_1PrivatePostAccountBalance
    v2_1PrivatePostAccountTradeFee::Function = v2_1PrivatePostAccountTradeFee
    v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency::Function = v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency
    v2_1PrivatePostOrderLimit::Function = v2_1PrivatePostOrderLimit
    v2_1PrivatePostOrderCancel::Function = v2_1PrivatePostOrderCancel
    v2_1PrivatePostOrderCancelAll::Function = v2_1PrivatePostOrderCancelAll
    v2_1PrivatePostOrderOpenOrders::Function = v2_1PrivatePostOrderOpenOrders
    v2_1PrivatePostOrderOpenOrdersAll::Function = v2_1PrivatePostOrderOpenOrdersAll
    v2_1PrivatePostOrderCompleteOrders::Function = v2_1PrivatePostOrderCompleteOrders
    v2_1PrivatePostOrderCompleteOrdersAll::Function = v2_1PrivatePostOrderCompleteOrdersAll
    v2_1PrivatePostOrderInfo::Function = v2_1PrivatePostOrderInfo
    v2_1PrivatePostTransactionKrwHistory::Function = v2_1PrivatePostTransactionKrwHistory
    v2_1PrivatePostTransactionCoinHistory::Function = v2_1PrivatePostTransactionCoinHistory
    v2_1PrivatePostTransactionCoinWithdrawalLimit::Function = v2_1PrivatePostTransactionCoinWithdrawalLimit

end
function describe(self::Coinone, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinone",
    Symbol("name") => "CoinOne",
    Symbol("countries") => ["KR"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v2",
    Symbol("pro") => false,
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
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => true,
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
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("ws") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.coinone.co.kr",
            Symbol("v2Public") => "https://api.coinone.co.kr/public/v2",
            Symbol("v2Private") => "https://api.coinone.co.kr/v2",
            Symbol("v2_1Private") => "https://api.coinone.co.kr/v2.1"
        ),
        Symbol("www") => "https://coinone.co.kr",
        Symbol("doc") => "https://doc.coinone.co.kr"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_utc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2Public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("range_units") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{quote_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_new/{quote_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_new/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_utc_new/{quote_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_utc_new/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chart/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/btc_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/daily_balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/user_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/virtual_account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/complete_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/order_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/auth_number") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/krw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/btc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/coin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2Private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/user_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/virtual_account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/complete_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/query_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/auth_number") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/btc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/krw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2_1Private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/balance/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/trade_fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/trade_fee/{quote_currency}/{target_currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/open_orders/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/complete_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/complete_orders/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/krw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/coin/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction/coin/withdrawal/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => 0.002,
            Symbol("maker") => 0.002
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => false,
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
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
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
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("104") => OrderNotFound,
        Symbol("107") => BadRequest,
        Symbol("108") => BadSymbol,
        Symbol("405") => OnMaintenance
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("SOC") => "Soda Coin"
    )
))

end
function fetchCurrencies(self::Coinone, params=Dict())
    response = Base.fetch(self.v2PublicGetCurrencies(params));
    currencies = self.safeList(response, "currencies", []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Coinone, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    isWithdrawEnabled = safeString(rawCurrency, "withdraw_status", "") == "normal";
    isDepositEnabled = safeString(rawCurrency, "deposit_status", "") == "normal";
    type_var = functions.ccxtruthy((code != "KRW")) ? "crypto" : "fiat";
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("active") => nothing,
    Symbol("deposit") => isDepositEnabled,
    Symbol("withdraw") => isWithdrawEnabled,
    Symbol("fee") => self.safeNumber(rawCurrency, "withdrawal_fee"),
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "max_precision"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "withdrawal_min_amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("type") => type_var
))

end
function fetchMarkets(self::Coinone, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => "KRW"
    );
    response = Base.fetch(self.v2PublicGetTickerNewQuoteCurrency(request));
    tickers = self.safeList(response, "tickers", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        entry = safeValue(tickers, i);
        id = safeString(entry, "id");
        baseId = safeStringUpper(entry, "target_currency");
        quoteId = safeStringUpper(entry, "quote_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
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
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1e-4"),
        Symbol("price") => self.parseNumber("1e-4"),
        Symbol("cost") => self.parseNumber("1e-8")
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
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => entry
));
        i += 1
    end
    return result

end
function parseBalance(self::Coinone, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = omit(response, ["errorCode", "result", "normalWallets"]);
    currencyIds = objectKeys(balances);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        balance = get(balances, Symbol(currencyId), nothing);
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "avail");
        account[Symbol("total")] = safeString(balance, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Coinone, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivatePostAccountBalance(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Coinone, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => get(market, Symbol("quote"), nothing),
        Symbol("target_currency") => get(market, Symbol("base"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.v2PublicGetOrderbookQuoteCurrencyTargetCurrency(extend(request, params)));
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "qty")

end
function fetchTickers(self::Coinone, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => "KRW"
    );
    market = nothing;
    response = nothing;
    if functions.ccxtruthy(symbols != nothing)
        first_var = safeString(symbols, 0);
        market = self.market(first_var);
        request[Symbol("quote_currency")] = get(market, Symbol("quote"), nothing);
        request[Symbol("target_currency")] = get(market, Symbol("base"), nothing);
        response = Base.fetch(self.v2PublicGetTickerNewQuoteCurrencyTargetCurrency(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetTickerNewQuoteCurrency(extend(request, params)));
    end
    data = self.safeList(response, "tickers", []);
    return self.parseTickers(data, symbols)

end
function fetchTicker(self::Coinone, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => get(market, Symbol("quote"), nothing),
        Symbol("target_currency") => get(market, Symbol("base"), nothing)
    );
    response = Base.fetch(self.v2PublicGetTickerNewQuoteCurrencyTargetCurrency(extend(request, params)));
    data = self.safeList(response, "tickers", []);
    ticker = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Coinone, ticker, market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    last_var = safeString(ticker, "last");
    asks = self.safeList(ticker, "best_asks", []);
    bids = self.safeList(ticker, "best_bids", []);
    baseId = safeString(ticker, "target_currency");
    quoteId = safeString(ticker, "quote_currency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(bids, "price"),
    Symbol("bidVolume") => safeString(bids, "qty"),
    Symbol("ask") => safeString(asks, "price"),
    Symbol("askVolume") => safeString(asks, "qty"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "first"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "target_volume"),
    Symbol("quoteVolume") => safeString(ticker, "quote_volume"),
    Symbol("info") => ticker
), market)

end
function parseTrade(self::Coinone, trade, market=nothing)
    timestamp = safeInteger(trade, "timestamp");
    market = self.safeMarket(nothing, market);
    isSellerMaker = self.safeBool(trade, "is_seller_maker");
    side = nothing;
    if functions.ccxtruthy(isSellerMaker != nothing)
        side = functions.ccxtruthy(isSellerMaker) ? "sell" : "buy";
    end
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "qty");
    orderId = safeString(trade, "orderId");
    feeCostString = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostString = stringAbs(feeCostString);
        feeRateString = safeString(trade, "feeRate");
        feeRateString = stringAbs(feeRateString);
        feeCurrencyCode = functions.ccxtruthy((side == "sell")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode,
            Symbol("rate") => feeRateString
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString(trade, "id"),
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => orderId,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Coinone, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => get(market, Symbol("quote"), nothing),
        Symbol("target_currency") => get(market, Symbol("base"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 200);
    end
    response = Base.fetch(self.v2PublicGetTradesQuoteCurrencyTargetCurrency(extend(request, params)));
    data = self.safeList(response, "transactions", []);
    return self.parseTrades(data, market, since, limit)

end
function createOrder(self::Coinone, symbol, type_var, side, amount, price=nothing, params=Dict())
    orderType = uppercase(type_var);
    orderSide = uppercase(side);
    if functions.ccxtruthy(orderType != "LIMIT")
        throw(ExchangeError(string(self.id, " createOrder() allows limit orders only")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for the limit orders")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => get(market, Symbol("quoteId"), nothing),
        Symbol("target_currency") => get(market, Symbol("baseId"), nothing),
        Symbol("type") => orderType,
        Symbol("side") => orderSide,
        Symbol("price") => self.priceToPrecision(symbol, price),
        Symbol("qty") => self.amountToPrecision(symbol, amount)
    );
    response = Base.fetch(self.v2_1PrivatePostOrderLimit(extend(request, params)));
    return self.parseOrder(response, market)

end
function fetchOrder(self::Coinone, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("currency") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivatePostOrderQueryOrder(extend(request, params)));
    return self.parseOrder(response, market)

end
function parseOrderStatus(self::Coinone, status)
    statuses = Dict{Symbol, Any}(
        Symbol("live") => "open",
        Symbol("partially_filled") => "open",
        Symbol("partially_canceled") => "open",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Coinone, order, market=nothing)
    id = safeString2(order, "orderId", "order_id");
    baseId = safeString2(order, "baseCurrency", "target_currency");
    quoteId = safeString2(order, "targetCurrency", "quote_currency");
    base = nothing;
    quote_var = nothing;
    if functions.ccxtruthy(baseId != nothing)
        base = self.safeCurrencyCode(baseId);
    end
    if functions.ccxtruthy(quoteId != nothing)
        quote_var = self.safeCurrencyCode(quoteId);
    end
    symbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((base != nothing), (quote_var != nothing)))
        symbol = string(base, "/", quote_var);
        market = self.safeMarket(symbol, market, "/");
    end
    timestamp = safeTimestamp2(order, "timestamp", "updatedAt");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger2(order, "ordered_at", "updated_at");
    end
    side = safeStringLower2(order, "type", "side");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((side == "limit"), (side == "market")), (side == "stop_limit")))
        side = safeStringLower(order, "side");
    end
    if functions.ccxtruthy(side == "ask")
        side = "sell";
    elseif functions.ccxtruthy(side == "bid")
        side = "buy";
    end
    remainingString = safeString2(order, "remainQty", "remain_qty");
    amountString = safeStringN(order, ["originalQty", "qty", "original_qty"]);
    status = safeString(order, "status");
    if functions.ccxtruthy(status == "live")
        if functions.ccxtruthy(@functions.ccxt_and((remainingString != nothing), (amountString != nothing)))
            isLessThan = stringLt(remainingString, amountString);
            if functions.ccxtruthy(isLessThan)
                status = "canceled";
            end
        end
    end
    status = self.parseOrderStatus(status);
    fee = nothing;
    feeCostString = safeString(order, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyCode = functions.ccxtruthy((side == "sell")) ? quote_var : base;
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("rate") => safeString2(order, "feeRate", "fee_rate"),
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => "limit",
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => safeString2(order, "averageExecutedPrice", "average_executed_price"),
    Symbol("amount") => amountString,
    Symbol("filled") => safeString2(order, "executedQty", "executed_qty"),
    Symbol("remaining") => remainingString,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function fetchOpenOrders(self::Coinone, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ExchangeError(string(self.id, " fetchOpenOrders() allows fetching closed orders with a specific symbol")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("quote_currency") => get(market, Symbol("quoteId"), nothing),
        Symbol("target_currency") => get(market, Symbol("baseId"), nothing)
    );
    response = Base.fetch(self.v2_1PrivatePostOrderOpenOrders(extend(request, params)));
    openOrders = self.safeList2(response, "open_orders", "limitOrders", []);
    return self.parseOrders(openOrders, market, since, limit)

end
function fetchMyTrades(self::Coinone, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivatePostOrderCompleteOrders(extend(request, params)));
    completeOrders = self.safeList(response, "completeOrders", []);
    return self.parseTrades(completeOrders, market, since, limit)

end
function cancelOrder(self::Coinone, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.")));
    end
    price = self.safeNumber(params, "price");
    qty = self.safeNumber(params, "qty");
    isAsk = safeInteger(params, "is_ask");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((price == nothing), (qty == nothing)), (isAsk == nothing)))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument.")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("price") => price,
        Symbol("qty") => qty,
        Symbol("is_ask") => isAsk,
        Symbol("currency") => self.marketId(symbol)
    );
    response = Base.fetch(self.v2PrivatePostOrderCancel(extend(request, params)));
    return self.safeOrder(response)

end
function fetchDepositAddresses(self::Coinone, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivatePostAccountDepositAddress(params));
    walletAddress = self.safeDict(response, "walletAddress", Dict{Symbol, Any}());
    keys_var = objectKeys(walletAddress);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(walletAddress, Symbol(key), nothing);
        if functions.ccxtruthy(@functions.ccxt_or((!functions.ccxtruthy(value)), (value == "-1")))
            i += 1; continue
        end
        parts = split(key, "_");
        currencyId = safeValue(parts, 0);
        secondPart = safeValue(parts, 1);
        code = self.safeCurrencyCode(currencyId);
        depositAddress = safeValue(result, code);
        if functions.ccxtruthy(depositAddress == nothing)
            depositAddress = Dict{Symbol, Any}(
                Symbol("info") => value,
                Symbol("currency") => code,
                Symbol("network") => nothing,
                Symbol("address") => nothing,
                Symbol("tag") => nothing
            );
        end
        address = safeString(depositAddress, "address", value);
        self.checkAddress(address);
        depositAddress[Symbol("address")] = address;
        depositAddress[Symbol("info")] = address;
        if functions.ccxtruthy((@functions.ccxt_or(secondPart == "tag", secondPart == "memo")))
            depositAddress[Symbol("tag")] = value;
            depositAddress[Symbol("info")] = [address, value];
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = depositAddress;
        end
        i += 1
    end
    return result

end
function sign(self::Coinone, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = self.implodeParams(path, params);
    query = omit(params, self.extractParams(path));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/");
    if functions.ccxtruthy(api == "v2Public")
        url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("v2Public"), nothing), "/");
        api = "public";
    elseif functions.ccxtruthy(api == "v2Private")
        url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("v2Private"), nothing), "/");
    else
        if functions.ccxtruthy(api == "v2_1Private")
            url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("v2_1Private"), nothing), "/");
        end

    end
    if functions.ccxtruthy(api == "public")
        url += request;
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        url += request;
        nonce = nothing;
        if functions.ccxtruthy(api == "v2_1Private")
            nonce = uuid();
        else
            nonce = string(self.nonce());
        end
        json = Ccxt.json(extend(Dict{Symbol, Any}(
            Symbol("access_token") => self.apiKey,
            Symbol("nonce") => nonce
        ), params));
        payload = self.stringToBase64(json);
        body = payload;
        secret = uppercase(self.secret);
        signature = self.hmac(self.encode(payload), self.encode(secret), sha512);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("X-COINONE-PAYLOAD") => payload,
            Symbol("X-COINONE-SIGNATURE") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinone, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeString(response, "error_code");
    if functions.ccxtruthy(@functions.ccxt_and(errorCode != nothing, errorCode != "0"))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(self.exceptions, errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinone, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOrderbook(self::Coinone, params=Dict(), context=Dict())
    return request(self, "orderbook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerUtc(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker_utc", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Coinone, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetRangeUnits(self::Coinone, params=Dict(), context=Dict())
    return request(self, "range_units", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetMarketsQuoteCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "markets/{quote_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetMarketsQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "markets/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetOrderbookQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "orderbook/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetTradesQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "trades/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetTickerNewQuoteCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker_new/{quote_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetTickerNewQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker_new/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetTickerUtcNewQuoteCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker_utc_new/{quote_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "ticker_utc_new/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetCurrencies(self::Coinone, params=Dict(), context=Dict())
    return request(self, "currencies", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetCurrenciesCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "currencies/{currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function v2PublicGetChartQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "chart/{quote_currency}/{target_currency}", "v2Public", "GET", params, nothing, nothing, Dict())
end

function privatePostAccountDepositAddress(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/deposit_address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBtcDepositAddress(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/btc_deposit_address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBalance(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountDailyBalance(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/daily_balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountUserInfo(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/user_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountVirtualAccount(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/virtual_account", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCancelAll(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/cancel_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCancel(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderLimitBuy(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_buy", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderLimitSell(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_sell", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCompleteOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/complete_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderLimitOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderOrderInfo(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/order_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionAuthNumber(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/auth_number", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionKrwHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/krw/history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionBtc(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/btc", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionCoin(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/coin", "private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostAccountBalance(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/balance", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostAccountDepositAddress(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/deposit_address", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostAccountUserInfo(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/user_info", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostAccountVirtualAccount(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/virtual_account", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderCancel(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/cancel", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderLimitBuy(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_buy", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderLimitSell(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_sell", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderLimitOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit_orders", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderCompleteOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/complete_orders", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostOrderQueryOrder(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/query_order", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostTransactionAuthNumber(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/auth_number", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostTransactionBtc(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/btc", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostTransactionHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/history", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2PrivatePostTransactionKrwHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/krw/history", "v2Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostAccountBalanceAll(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/balance/all", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostAccountBalance(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/balance", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostAccountTradeFee(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/trade_fee", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency(self::Coinone, params=Dict(), context=Dict())
    return request(self, "account/trade_fee/{quote_currency}/{target_currency}", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderLimit(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/limit", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderCancel(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/cancel", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderCancelAll(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/cancel/all", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderOpenOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/open_orders", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderOpenOrdersAll(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/open_orders/all", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderCompleteOrders(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/complete_orders", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderCompleteOrdersAll(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/complete_orders/all", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostOrderInfo(self::Coinone, params=Dict(), context=Dict())
    return request(self, "order/info", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostTransactionKrwHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/krw/history", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostTransactionCoinHistory(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/coin/history", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function v2_1PrivatePostTransactionCoinWithdrawalLimit(self::Coinone, params=Dict(), context=Dict())
    return request(self, "transaction/coin/withdrawal/limit", "v2_1Private", "POST", params, nothing, nothing, Dict())
end

function Coinone(; kwargs...)
    inst = Coinone(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, fetchTickers, fetchTicker, parseTicker, parseTrade, fetchTrades, createOrder, fetchOrder, parseOrderStatus, parseOrder, fetchOpenOrders, fetchMyTrades, cancelOrder, fetchDepositAddresses, sign, handleErrors, publicGetOrderbook, publicGetTicker, publicGetTickerUtc, publicGetTrades, v2PublicGetRangeUnits, v2PublicGetMarketsQuoteCurrency, v2PublicGetMarketsQuoteCurrencyTargetCurrency, v2PublicGetOrderbookQuoteCurrencyTargetCurrency, v2PublicGetTradesQuoteCurrencyTargetCurrency, v2PublicGetTickerNewQuoteCurrency, v2PublicGetTickerNewQuoteCurrencyTargetCurrency, v2PublicGetTickerUtcNewQuoteCurrency, v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency, v2PublicGetCurrencies, v2PublicGetCurrenciesCurrency, v2PublicGetChartQuoteCurrencyTargetCurrency, privatePostAccountDepositAddress, privatePostAccountBtcDepositAddress, privatePostAccountBalance, privatePostAccountDailyBalance, privatePostAccountUserInfo, privatePostAccountVirtualAccount, privatePostOrderCancelAll, privatePostOrderCancel, privatePostOrderLimitBuy, privatePostOrderLimitSell, privatePostOrderCompleteOrders, privatePostOrderLimitOrders, privatePostOrderOrderInfo, privatePostTransactionAuthNumber, privatePostTransactionHistory, privatePostTransactionKrwHistory, privatePostTransactionBtc, privatePostTransactionCoin, v2PrivatePostAccountBalance, v2PrivatePostAccountDepositAddress, v2PrivatePostAccountUserInfo, v2PrivatePostAccountVirtualAccount, v2PrivatePostOrderCancel, v2PrivatePostOrderLimitBuy, v2PrivatePostOrderLimitSell, v2PrivatePostOrderLimitOrders, v2PrivatePostOrderCompleteOrders, v2PrivatePostOrderQueryOrder, v2PrivatePostTransactionAuthNumber, v2PrivatePostTransactionBtc, v2PrivatePostTransactionHistory, v2PrivatePostTransactionKrwHistory, v2_1PrivatePostAccountBalanceAll, v2_1PrivatePostAccountBalance, v2_1PrivatePostAccountTradeFee, v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency, v2_1PrivatePostOrderLimit, v2_1PrivatePostOrderCancel, v2_1PrivatePostOrderCancelAll, v2_1PrivatePostOrderOpenOrders, v2_1PrivatePostOrderOpenOrdersAll, v2_1PrivatePostOrderCompleteOrders, v2_1PrivatePostOrderCompleteOrdersAll, v2_1PrivatePostOrderInfo, v2_1PrivatePostTransactionKrwHistory, v2_1PrivatePostTransactionCoinHistory, v2_1PrivatePostTransactionCoinWithdrawalLimit)
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
