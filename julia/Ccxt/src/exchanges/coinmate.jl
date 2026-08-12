@kwdef mutable struct Coinmate <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    cancelOrder::Function = cancelOrder
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOrderBook::Function = publicGetOrderBook
    publicGetTicker::Function = publicGetTicker
    publicGetTickerAll::Function = publicGetTickerAll
    publicGetProducts::Function = publicGetProducts
    publicGetTransactions::Function = publicGetTransactions
    publicGetTradingPairs::Function = publicGetTradingPairs
    publicGetSystemTime::Function = publicGetSystemTime
    privatePostCurrencies::Function = privatePostCurrencies
    privatePostBalances::Function = privatePostBalances
    privatePostBitcoinCashWithdrawal::Function = privatePostBitcoinCashWithdrawal
    privatePostBitcoinCashDepositAddresses::Function = privatePostBitcoinCashDepositAddresses
    privatePostBitcoinDepositAddresses::Function = privatePostBitcoinDepositAddresses
    privatePostBitcoinWithdrawal::Function = privatePostBitcoinWithdrawal
    privatePostBitcoinWithdrawalFees::Function = privatePostBitcoinWithdrawalFees
    privatePostBuyInstant::Function = privatePostBuyInstant
    privatePostBuyLimit::Function = privatePostBuyLimit
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostCancelOrderWithInfo::Function = privatePostCancelOrderWithInfo
    privatePostCreateVoucher::Function = privatePostCreateVoucher
    privatePostDashDepositAddresses::Function = privatePostDashDepositAddresses
    privatePostDashWithdrawal::Function = privatePostDashWithdrawal
    privatePostEthereumWithdrawal::Function = privatePostEthereumWithdrawal
    privatePostEthereumDepositAddresses::Function = privatePostEthereumDepositAddresses
    privatePostLitecoinWithdrawal::Function = privatePostLitecoinWithdrawal
    privatePostLitecoinDepositAddresses::Function = privatePostLitecoinDepositAddresses
    privatePostOpenOrders::Function = privatePostOpenOrders
    privatePostOrder::Function = privatePostOrder
    privatePostOrderHistory::Function = privatePostOrderHistory
    privatePostOrderById::Function = privatePostOrderById
    privatePostPusherAuth::Function = privatePostPusherAuth
    privatePostRedeemVoucher::Function = privatePostRedeemVoucher
    privatePostReplaceByBuyLimit::Function = privatePostReplaceByBuyLimit
    privatePostReplaceByBuyInstant::Function = privatePostReplaceByBuyInstant
    privatePostReplaceBySellLimit::Function = privatePostReplaceBySellLimit
    privatePostReplaceBySellInstant::Function = privatePostReplaceBySellInstant
    privatePostRippleDepositAddresses::Function = privatePostRippleDepositAddresses
    privatePostRippleWithdrawal::Function = privatePostRippleWithdrawal
    privatePostSellInstant::Function = privatePostSellInstant
    privatePostSellLimit::Function = privatePostSellLimit
    privatePostTransactionHistory::Function = privatePostTransactionHistory
    privatePostTraderFees::Function = privatePostTraderFees
    privatePostTradeHistory::Function = privatePostTradeHistory
    privatePostTransfer::Function = privatePostTransfer
    privatePostTransferHistory::Function = privatePostTransferHistory
    privatePostUnconfirmedBitcoinDeposits::Function = privatePostUnconfirmedBitcoinDeposits
    privatePostUnconfirmedBitcoinCashDeposits::Function = privatePostUnconfirmedBitcoinCashDeposits
    privatePostUnconfirmedDashDeposits::Function = privatePostUnconfirmedDashDeposits
    privatePostUnconfirmedEthereumDeposits::Function = privatePostUnconfirmedEthereumDeposits
    privatePostUnconfirmedLitecoinDeposits::Function = privatePostUnconfirmedLitecoinDeposits
    privatePostUnconfirmedRippleDeposits::Function = privatePostUnconfirmedRippleDeposits
    privatePostCancelAllOpenOrders::Function = privatePostCancelAllOpenOrders
    privatePostWithdrawVirtualCurrency::Function = privatePostWithdrawVirtualCurrency
    privatePostVirtualCurrencyDepositAddresses::Function = privatePostVirtualCurrencyDepositAddresses
    privatePostUnconfirmedVirtualCurrencyDeposits::Function = privatePostUnconfirmedVirtualCurrencyDeposits
    privatePostAdaWithdrawal::Function = privatePostAdaWithdrawal
    privatePostAdaDepositAddresses::Function = privatePostAdaDepositAddresses
    privatePostUnconfirmedAdaDeposits::Function = privatePostUnconfirmedAdaDeposits
    privatePostSolWithdrawal::Function = privatePostSolWithdrawal
    privatePostSolDepositAddresses::Function = privatePostSolDepositAddresses
    privatePostUnconfirmedSolDeposits::Function = privatePostUnconfirmedSolDeposits
    privatePostBankWireWithdrawal::Function = privatePostBankWireWithdrawal

end
function describe(self::Coinmate, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinmate",
    Symbol("name") => "CoinMate",
    Symbol("countries") => ["GB", "CZ", "EU"],
    Symbol("rateLimit") => 600,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
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
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
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
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://coinmate.io/api"
        ),
        Symbol("www") => "https://coinmate.io",
        Symbol("fees") => "https://coinmate.io/fees",
        Symbol("doc") => ["https://coinmate.docs.apiary.io", "https://coinmate.io/developers"],
        Symbol("referral") => "https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("uid") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickerAll") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bitcoinCashWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bitcoinCashDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bitcoinDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bitcoinWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bitcoinWithdrawalFees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buyInstant") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buyLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelOrderWithInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("createVoucher") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dashDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dashWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ethereumWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ethereumDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("litecoinWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("litecoinDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderById") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pusherAuth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("redeemVoucher") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("replaceByBuyLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("replaceByBuyInstant") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("replaceBySellLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("replaceBySellInstant") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rippleDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rippleWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sellInstant") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sellLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transactionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("traderFees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradeHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transferHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedBitcoinDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedBitcoinCashDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedDashDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedEthereumDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedLitecoinDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedRippleDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelAllOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawVirtualCurrency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("virtualCurrencyDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedVirtualCurrencyDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("adaWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("adaDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedAdaDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("solWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("solDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unconfirmedSolDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bankWireWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.006"),
            Symbol("maker") => self.parseNumber("0.004"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.006")], [self.parseNumber("10000"), self.parseNumber("0.003")], [self.parseNumber("100000"), self.parseNumber("0.0023")], [self.parseNumber("250000"), self.parseNumber("0.0021")], [self.parseNumber("500000"), self.parseNumber("0.0018")], [self.parseNumber("1000000"), self.parseNumber("0.0015")], [self.parseNumber("3000000"), self.parseNumber("0.0012")], [self.parseNumber("15000000"), self.parseNumber("0.001")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("10000"), self.parseNumber("0.002")], [self.parseNumber("100000"), self.parseNumber("0.0012")], [self.parseNumber("250000"), self.parseNumber("0.0009")], [self.parseNumber("500000"), self.parseNumber("0.0005")], [self.parseNumber("1000000"), self.parseNumber("0.0003")], [self.parseNumber("3000000"), self.parseNumber("0.0002")], [self.parseNumber("15000000"), self.parseNumber("-0.0004")]]
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fillResponsefromRequest") => true,
            Symbol("methods") => Dict{Symbol, Any}(
                Symbol("BTC") => "privatePostBitcoinWithdrawal",
                Symbol("LTC") => "privatePostLitecoinWithdrawal",
                Symbol("BCH") => "privatePostBitcoinCashWithdrawal",
                Symbol("ETH") => "privatePostEthereumWithdrawal",
                Symbol("XRP") => "privatePostRippleWithdrawal",
                Symbol("DASH") => "privatePostDashWithdrawal",
                Symbol("DAI") => "privatePostDaiWithdrawal",
                Symbol("ADA") => "privatePostAdaWithdrawal",
                Symbol("SOL") => "privatePostSolWithdrawal"
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
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("No order with given ID") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Not enough account balance available") => InsufficientFunds,
            Symbol("Incorrect order ID") => InvalidOrder,
            Symbol("Minimum Order Size ") => InvalidOrder,
            Symbol("max allowed precision") => InvalidOrder,
            Symbol("TOO MANY REQUESTS") => RateLimitExceeded,
            Symbol("Access denied.") => AuthenticationError
        )
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://coinmate.docs.apiary.io/#reference/system/get-server-time/get

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Coinmate; params=Dict())
    response = Base.fetch(self.publicGetSystemTime(params));
    return safeInteger(response, "serverTime")

end
"""
retrieves data on all markets for coinmate
see: https://coinmate.docs.apiary.io/#reference/trading-pairs/get-trading-pairs/get

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Coinmate; params=Dict())
    response = Base.fetch(self.publicGetTradingPairs(params));
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        id = safeString(market, "name");
        baseId = safeString(market, "firstCurrency");
        quoteId = safeString(market, "secondCurrency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        push!(result, Dict{Symbol, Any}(
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
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "lotDecimals"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "priceDecimals")))
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
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function parseBalance(self::Coinmate, response)
    balances = safeValue(response, "data", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    currencyIds = objectKeys(balances);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        balance = safeValue(balances, currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "reserved");
        account[Symbol("total")] = safeString(balance, "balance");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://coinmate.docs.apiary.io/#reference/balance/get-balances/post

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinmate; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostBalances(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://coinmate.docs.apiary.io/#reference/order-book/get-order-book/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Coinmate, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing),
        Symbol("groupByPriceLimit") => "False"
    );
    response = Base.fetch(self.publicGetOrderBook(extend(request, params)));
    orderbook = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeTimestamp(orderbook, "timestamp");
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "amount")

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://coinmate.docs.apiary.io/#reference/ticker/get-ticker/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinmate, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseTicker(data, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://coinmate.docs.apiary.io/#reference/ticker/get-ticker-all/get

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinmate; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetTickerAll(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    keys_var = objectKeys(data);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        market = self.market(get(keys_var, i + 1, nothing));
        ticker = self.parseTicker(safeValue(data, get(keys_var, i + 1, nothing)), market = market);
        result[Symbol(market[Symbol("symbol")])] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function parseTicker(self::Coinmate, ticker; market=nothing)
    timestamp = safeTimestamp(ticker, "timestamp");
    last_var = self.safeNumber(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => self.safeNumber(ticker, "high"),
    Symbol("low") => self.safeNumber(ticker, "low"),
    Symbol("bid") => self.safeNumber(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => self.safeNumber(ticker, "ask"),
    Symbol("vwap") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => self.safeNumber(ticker, "amount"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetch history of deposits and withdrawals
see: https://coinmate.docs.apiary.io/#reference/transfers/get-transfer-history/post

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Coinmate; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => 1000
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timestampFrom")] = since;
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostTransferHistory(extend(request, params)));
    items = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(items, currency = nothing, since = since, limit = limit)

end
function parseTransactionStatus(self::Coinmate, status)
    statuses = Dict{Symbol, Any}(
        Symbol("COMPLETED") => "ok",
        Symbol("WAITING") => "pending",
        Symbol("SENT") => "pending",
        Symbol("CREATED") => "pending",
        Symbol("OK") => "ok",
        Symbol("NEW") => "pending",
        Symbol("CANCELED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Coinmate, transaction; currency=nothing)
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "amountCurrency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "transactionId", "id"),
    Symbol("txid") => safeString(transaction, "txid"),
    Symbol("type") => safeStringLower(transaction, "transferType"),
    Symbol("currency") => code,
    Symbol("network") => safeString(transaction, "walletType"),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "transferStatus")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => safeString(transaction, "destination"),
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => safeString(transaction, "destinationTag"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(transaction, "fee"),
        Symbol("currency") => code,
        Symbol("rate") => nothing
    )
)

end
"""
make a withdrawal
see: https://coinmate.docs.apiary.io/#reference/bitcoin-withdrawal-and-deposit/withdraw-bitcoins/post
see: https://coinmate.docs.apiary.io/#reference/litecoin-withdrawal-and-deposit/withdraw-litecoins/post
see: https://coinmate.docs.apiary.io/#reference/ethereum-withdrawal-and-deposit/withdraw-ethereum/post
see: https://coinmate.docs.apiary.io/#reference/ripple-withdrawal-and-deposit/withdraw-ripple/post
see: https://coinmate.docs.apiary.io/#reference/cardano-withdrawal-and-deposit/withdraw-cardano/post
see: https://coinmate.docs.apiary.io/#reference/solana-withdrawal-and-deposit/withdraw-solana/post

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Coinmate, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    withdrawOptions = safeValue(self.options, "withdraw", Dict{Symbol, Any}());
    methods = safeValue(withdrawOptions, "methods", Dict{Symbol, Any}());
    method = safeString(methods, code);
    if functions.ccxtruthy(method == nothing)
        allowedCurrencies = objectKeys(methods);
        throw(ExchangeError(string(self.id, " withdraw() only allows withdrawing the following currencies: ", join(allowedCurrencies, ", "))));
    end
    request = Dict{Symbol, Any}(
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("destinationTag")] = tag;
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    data = safeValue(response, "data");
    transaction = self.parseTransaction(data, currency = currency);
    fillResponseFromRequest = self.safeBool(withdrawOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transaction[Symbol("amount")] = amount;
        transaction[Symbol("currency")] = code;
        transaction[Symbol("address")] = address;
        transaction[Symbol("tag")] = tag;
        transaction[Symbol("type")] = "withdrawal";
        transaction[Symbol("status")] = "pending";
    end
    return transaction

end
"""
fetch all trades made by the user
see: https://coinmate.docs.apiary.io/#reference/trade-history/get-trade-history/post

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinmate; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 1000;
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currencyPair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timestampFrom")] = since;
    end
    response = Base.fetch(self.privatePostTradeHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = nothing, since = since, limit = limit)

end
function parseTrade(self::Coinmate, trade; market=nothing)
    marketId = safeString(trade, "currencyPair");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    side = safeStringLower2(trade, "type", "tradeType");
    type_var = safeStringLower(trade, "orderType");
    orderId = safeString(trade, "orderId");
    id = safeString(trade, "transactionId");
    timestamp = safeInteger2(trade, "timestamp", "createdTimestamp");
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    end
    takerOrMaker = safeString(trade, "feeType");
    takerOrMaker = functions.ccxtruthy((takerOrMaker == "MAKER")) ? "maker" : "taker";
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("order") => orderId,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://coinmate.docs.apiary.io/#reference/transactions/transactions/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Coinmate, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing),
        Symbol("minutesIntoHistory") => 10
    );
    response = Base.fetch(self.publicGetTransactions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://coinmate.docs.apiary.io/#reference/trader-fees/get-trading-fees/post

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Coinmate, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostTraderFees(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    makerString = safeString(data, "maker");
    takerString = safeString(data, "taker");
    maker = self.parseNumber(stringDiv(makerString, "100"));
    taker = self.parseNumber(stringDiv(takerString, "100"));
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => maker,
    Symbol("taker") => taker,
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
"""
fetch all unfilled currently open orders
see: https://coinmate.docs.apiary.io/#reference/order/get-open-orders/post

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Coinmate; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    response = Base.fetch(self.privatePostOpenOrders(extend(Dict{Symbol, Any}(), params)));
    extension = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = nothing, since = since, limit = limit, params = extension)

end
"""
fetches information on multiple orders made by the user
see: https://coinmate.docs.apiary.io/#reference/order/order-history/post

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Coinmate; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostOrderHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
function parseOrderStatus(self::Coinmate, status)
    statuses = Dict{Symbol, Any}(
        Symbol("FILLED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("OPEN") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Coinmate, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Coinmate, order; market=nothing)
    id = safeString(order, "id");
    timestamp = safeInteger(order, "timestamp");
    side = safeStringLower(order, "type");
    priceString = safeString(order, "price");
    amountString = safeString(order, "originalAmount");
    remainingString = safeString2(order, "remainingAmount", "amount");
    status = self.parseOrderStatus(safeString(order, "status"));
    type_var = self.parseOrderType(safeString(order, "orderTradeType"));
    averageString = safeString(order, "avgPrice");
    marketId = safeString(order, "currencyPair");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_");
    clientOrderId = safeString(order, "clientOrderId");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("triggerPrice") => self.safeNumber(order, "stopPrice"),
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("average") => averageString,
    Symbol("filled") => nothing,
    Symbol("remaining") => remainingString,
    Symbol("status") => status,
    Symbol("trades") => nothing,
    Symbol("info") => order,
    Symbol("fee") => nothing
), market = market)

end
"""
create a trade order
see: https://coinmate.docs.apiary.io/#reference/order/buy-limit-order/post
see: https://coinmate.docs.apiary.io/#reference/order/sell-limit-order/post
see: https://coinmate.docs.apiary.io/#reference/order/buy-instant-order/post
see: https://coinmate.docs.apiary.io/#reference/order/sell-instant-order/post

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
function createOrder(self::Coinmate, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = string("privatePost", capitalize(side));
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(side == "buy")
            request[Symbol("total")] = self.amountToPrecision(symbol, amount);
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
        method += "Instant";
    else
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        method += capitalize(type_var);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    id = safeString(response, "data");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id
), market = market)

end
"""
fetches information on an order made by the user
see: https://coinmate.docs.apiary.io/#reference/order/get-order-by-orderid/post
see: https://coinmate.docs.apiary.io/#reference/order/get-order-by-clientorderid/post

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Coinmate, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privatePostOrderById(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(data, market = market)

end
"""
cancels an open order
see: https://coinmate.docs.apiary.io/#reference/order/cancel-order/post

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinmate, id; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privatePostCancelOrderWithInfo(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(data)

end
function nonce(self::Coinmate, )
    return milliseconds()

end
function sign(self::Coinmate, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        auth = string(nonce, self.uid, self.apiKey);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("clientId") => self.uid,
    Symbol("nonce") => nonce,
    Symbol("publicKey") => self.apiKey,
    Symbol("signature") => uppercase(signature)
), params));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinmate, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorMessage = safeString(response, "errorMessage");
    if functions.ccxtruthy(errorMessage != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorMessage, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessage, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinmate, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOrderBook(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderBook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerAll(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tickerAll"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetProducts(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "products"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTransactions(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transactions"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradingPairs(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tradingPairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemTime(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "system/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCurrencies(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "currencies"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBalances(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "balances"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinCashWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinCashWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinCashDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinCashDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBitcoinWithdrawalFees(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinWithdrawalFees"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBuyInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "buyInstant"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBuyLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "buyLimit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrderWithInfo(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelOrderWithInfo"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCreateVoucher(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "createVoucher"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDashDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "dashDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDashWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "dashWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEthereumWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ethereumWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEthereumDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ethereumDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLitecoinWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "litecoinWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLitecoinDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "litecoinDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOpenOrders(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrder(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderById(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderById"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPusherAuth(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "pusherAuth"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRedeemVoucher(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "redeemVoucher"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReplaceByBuyLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceByBuyLimit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReplaceByBuyInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceByBuyInstant"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReplaceBySellLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceBySellLimit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReplaceBySellInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceBySellInstant"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRippleDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "rippleDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRippleWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "rippleWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSellInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "sellInstant"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSellLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "sellLimit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransactionHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transactionHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTraderFees(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "traderFees"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tradeHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransfer(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransferHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transferHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedBitcoinDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedBitcoinDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedBitcoinCashDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedBitcoinCashDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedDashDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedDashDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedEthereumDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedEthereumDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedLitecoinDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedLitecoinDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedRippleDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedRippleDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelAllOpenOrders(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelAllOpenOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawVirtualCurrency(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "withdrawVirtualCurrency"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVirtualCurrencyDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "virtualCurrencyDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedVirtualCurrencyDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedVirtualCurrencyDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAdaWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "adaWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAdaDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "adaDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedAdaDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedAdaDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSolWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "solWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSolDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "solDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnconfirmedSolDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedSolDeposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBankWireWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bankWireWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinmate(; kwargs...)
    inst = Coinmate(Exchange(), describe, fetchTime, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, fetchTicker, fetchTickers, parseTicker, fetchDepositsWithdrawals, parseTransactionStatus, parseTransaction, withdraw, fetchMyTrades, parseTrade, fetchTrades, fetchTradingFee, fetchOpenOrders, fetchOrders, parseOrderStatus, parseOrderType, parseOrder, createOrder, fetchOrder, cancelOrder, nonce, sign, handleErrors, publicGetOrderBook, publicGetTicker, publicGetTickerAll, publicGetProducts, publicGetTransactions, publicGetTradingPairs, publicGetSystemTime, privatePostCurrencies, privatePostBalances, privatePostBitcoinCashWithdrawal, privatePostBitcoinCashDepositAddresses, privatePostBitcoinDepositAddresses, privatePostBitcoinWithdrawal, privatePostBitcoinWithdrawalFees, privatePostBuyInstant, privatePostBuyLimit, privatePostCancelOrder, privatePostCancelOrderWithInfo, privatePostCreateVoucher, privatePostDashDepositAddresses, privatePostDashWithdrawal, privatePostEthereumWithdrawal, privatePostEthereumDepositAddresses, privatePostLitecoinWithdrawal, privatePostLitecoinDepositAddresses, privatePostOpenOrders, privatePostOrder, privatePostOrderHistory, privatePostOrderById, privatePostPusherAuth, privatePostRedeemVoucher, privatePostReplaceByBuyLimit, privatePostReplaceByBuyInstant, privatePostReplaceBySellLimit, privatePostReplaceBySellInstant, privatePostRippleDepositAddresses, privatePostRippleWithdrawal, privatePostSellInstant, privatePostSellLimit, privatePostTransactionHistory, privatePostTraderFees, privatePostTradeHistory, privatePostTransfer, privatePostTransferHistory, privatePostUnconfirmedBitcoinDeposits, privatePostUnconfirmedBitcoinCashDeposits, privatePostUnconfirmedDashDeposits, privatePostUnconfirmedEthereumDeposits, privatePostUnconfirmedLitecoinDeposits, privatePostUnconfirmedRippleDeposits, privatePostCancelAllOpenOrders, privatePostWithdrawVirtualCurrency, privatePostVirtualCurrencyDepositAddresses, privatePostUnconfirmedVirtualCurrencyDeposits, privatePostAdaWithdrawal, privatePostAdaDepositAddresses, privatePostUnconfirmedAdaDeposits, privatePostSolWithdrawal, privatePostSolDepositAddresses, privatePostUnconfirmedSolDeposits, privatePostBankWireWithdrawal)
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
function __ccxt_doc_Coinmate_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://coinmate.docs.apiary.io/#reference/system/get-server-time/get

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Coinmate_fetchTime

function __ccxt_doc_Coinmate_fetchMarkets() end
"""
retrieves data on all markets for coinmate
see: https://coinmate.docs.apiary.io/#reference/trading-pairs/get-trading-pairs/get

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Coinmate_fetchMarkets

function __ccxt_doc_Coinmate_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://coinmate.docs.apiary.io/#reference/balance/get-balances/post

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinmate_fetchBalance

function __ccxt_doc_Coinmate_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://coinmate.docs.apiary.io/#reference/order-book/get-order-book/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Coinmate_fetchOrderBook

function __ccxt_doc_Coinmate_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://coinmate.docs.apiary.io/#reference/ticker/get-ticker/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinmate_fetchTicker

function __ccxt_doc_Coinmate_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://coinmate.docs.apiary.io/#reference/ticker/get-ticker-all/get

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinmate_fetchTickers

function __ccxt_doc_Coinmate_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://coinmate.docs.apiary.io/#reference/transfers/get-transfer-history/post

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinmate_fetchDepositsWithdrawals

function __ccxt_doc_Coinmate_withdraw() end
"""
make a withdrawal
see: https://coinmate.docs.apiary.io/#reference/bitcoin-withdrawal-and-deposit/withdraw-bitcoins/post
see: https://coinmate.docs.apiary.io/#reference/litecoin-withdrawal-and-deposit/withdraw-litecoins/post
see: https://coinmate.docs.apiary.io/#reference/ethereum-withdrawal-and-deposit/withdraw-ethereum/post
see: https://coinmate.docs.apiary.io/#reference/ripple-withdrawal-and-deposit/withdraw-ripple/post
see: https://coinmate.docs.apiary.io/#reference/cardano-withdrawal-and-deposit/withdraw-cardano/post
see: https://coinmate.docs.apiary.io/#reference/solana-withdrawal-and-deposit/withdraw-solana/post

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinmate_withdraw

function __ccxt_doc_Coinmate_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://coinmate.docs.apiary.io/#reference/trade-history/get-trade-history/post

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinmate_fetchMyTrades

function __ccxt_doc_Coinmate_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://coinmate.docs.apiary.io/#reference/transactions/transactions/get

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Coinmate_fetchTrades

function __ccxt_doc_Coinmate_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://coinmate.docs.apiary.io/#reference/trader-fees/get-trading-fees/post

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Coinmate_fetchTradingFee

function __ccxt_doc_Coinmate_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://coinmate.docs.apiary.io/#reference/order/get-open-orders/post

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinmate_fetchOpenOrders

function __ccxt_doc_Coinmate_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://coinmate.docs.apiary.io/#reference/order/order-history/post

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinmate_fetchOrders

function __ccxt_doc_Coinmate_createOrder() end
"""
create a trade order
see: https://coinmate.docs.apiary.io/#reference/order/buy-limit-order/post
see: https://coinmate.docs.apiary.io/#reference/order/sell-limit-order/post
see: https://coinmate.docs.apiary.io/#reference/order/buy-instant-order/post
see: https://coinmate.docs.apiary.io/#reference/order/sell-instant-order/post

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
__ccxt_doc_Coinmate_createOrder

function __ccxt_doc_Coinmate_fetchOrder() end
"""
fetches information on an order made by the user
see: https://coinmate.docs.apiary.io/#reference/order/get-order-by-orderid/post
see: https://coinmate.docs.apiary.io/#reference/order/get-order-by-clientorderid/post

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinmate_fetchOrder

function __ccxt_doc_Coinmate_cancelOrder() end
"""
cancels an open order
see: https://coinmate.docs.apiary.io/#reference/order/cancel-order/post

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinmate_cancelOrder
