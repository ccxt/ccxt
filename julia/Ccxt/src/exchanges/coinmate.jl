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
            Symbol("get") => ["orderBook", "ticker", "tickerAll", "products", "transactions", "tradingPairs", "system/time"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => ["currencies", "balances", "bitcoinCashWithdrawal", "bitcoinCashDepositAddresses", "bitcoinDepositAddresses", "bitcoinWithdrawal", "bitcoinWithdrawalFees", "buyInstant", "buyLimit", "cancelOrder", "cancelOrderWithInfo", "createVoucher", "dashDepositAddresses", "dashWithdrawal", "ethereumWithdrawal", "ethereumDepositAddresses", "litecoinWithdrawal", "litecoinDepositAddresses", "openOrders", "order", "orderHistory", "orderById", "pusherAuth", "redeemVoucher", "replaceByBuyLimit", "replaceByBuyInstant", "replaceBySellLimit", "replaceBySellInstant", "rippleDepositAddresses", "rippleWithdrawal", "sellInstant", "sellLimit", "transactionHistory", "traderFees", "tradeHistory", "transfer", "transferHistory", "unconfirmedBitcoinDeposits", "unconfirmedBitcoinCashDeposits", "unconfirmedDashDeposits", "unconfirmedEthereumDeposits", "unconfirmedLitecoinDeposits", "unconfirmedRippleDeposits", "cancelAllOpenOrders", "withdrawVirtualCurrency", "virtualCurrencyDepositAddresses", "unconfirmedVirtualCurrencyDeposits", "adaWithdrawal", "adaDepositAddresses", "unconfirmedAdaDeposits", "solWithdrawal", "solDepositAddresses", "unconfirmedSolDeposits", "bankWireWithdrawal"]
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
function fetchTime(self::Coinmate, params=Dict())
    response = Base.fetch(self.publicGetSystemTime(params));
    return safeInteger(response, "serverTime")

end
function fetchMarkets(self::Coinmate, params=Dict())
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
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "lotDecimals"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "priceDecimals")))
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
function fetchBalance(self::Coinmate, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostBalances(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Coinmate, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing),
        Symbol("groupByPriceLimit") => "False"
    );
    response = Base.fetch(self.publicGetOrderBook(extend(request, params)));
    orderbook = get(response, Symbol("data"), nothing);
    timestamp = safeTimestamp(orderbook, "timestamp");
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "amount")

end
function fetchTicker(self::Coinmate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseTicker(data, market)

end
function fetchTickers(self::Coinmate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetTickerAll(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    keys_var = objectKeys(data);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        market = self.market(get(keys_var, i + 1, nothing));
        ticker = self.parseTicker(safeValue(data, get(keys_var, i + 1, nothing)), market);
        result[Symbol(market[Symbol("symbol")])] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function parseTicker(self::Coinmate, ticker, market=nothing)
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
), market)

end
function fetchDepositsWithdrawals(self::Coinmate, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    items = get(response, Symbol("data"), nothing);
    return self.parseTransactions(items, nothing, since, limit)

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
function parseTransaction(self::Coinmate, transaction, currency=nothing)
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "amountCurrency");
    code = self.safeCurrencyCode(currencyId, currency);
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
function withdraw(self::Coinmate, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
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
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
    data = safeValue(response, "data");
    transaction = self.parseTransaction(data, currency);
    fillResponseFromRequest = self.safeBool(withdrawOptions, "fillResponseFromRequest", true);
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
function fetchMyTrades(self::Coinmate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, nothing, since, limit)

end
function parseTrade(self::Coinmate, trade, market=nothing)
    marketId = safeString(trade, "currencyPair");
    market = self.safeMarket(marketId, market, "_");
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
), market)

end
function fetchTrades(self::Coinmate, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing),
        Symbol("minutesIntoHistory") => 10
    );
    response = Base.fetch(self.publicGetTransactions(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchTradingFee(self::Coinmate, symbol, params=Dict())
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
function fetchOpenOrders(self::Coinmate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    response = Base.fetch(self.privatePostOpenOrders(extend(Dict{Symbol, Any}(), params)));
    extension = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    return self.parseOrders(get(response, Symbol("data"), nothing), nothing, since, limit, extension)

end
function fetchOrders(self::Coinmate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(get(response, Symbol("data"), nothing), market, since, limit)

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
function parseOrder(self::Coinmate, order, market=nothing)
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
    symbol = self.safeSymbol(marketId, market, "_");
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
), market)

end
function createOrder(self::Coinmate, symbol, type_var, side, amount, price=nothing, params=Dict())
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
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
    id = safeString(response, "data");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id
), market)

end
function fetchOrder(self::Coinmate, id, symbol=nothing, params=Dict())
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
    return self.parseOrder(data, market)

end
function cancelOrder(self::Coinmate, id, symbol=nothing, params=Dict())
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
function sign(self::Coinmate, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinmate, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOrderBook(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderBook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerAll(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tickerAll", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetProducts(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "products", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTransactions(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transactions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradingPairs(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tradingPairs", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSystemTime(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "system/time", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostCurrencies(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "currencies", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBalances(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "balances", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBitcoinCashWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinCashWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBitcoinCashDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinCashDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBitcoinDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBitcoinWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBitcoinWithdrawalFees(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bitcoinWithdrawalFees", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBuyInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "buyInstant", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBuyLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "buyLimit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrder(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelOrder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrderWithInfo(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelOrderWithInfo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCreateVoucher(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "createVoucher", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDashDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "dashDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDashWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "dashWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEthereumWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ethereumWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEthereumDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "ethereumDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLitecoinWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "litecoinWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLitecoinDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "litecoinDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenOrders(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrder(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderHistory", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderById(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "orderById", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPusherAuth(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "pusherAuth", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRedeemVoucher(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "redeemVoucher", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReplaceByBuyLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceByBuyLimit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReplaceByBuyInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceByBuyInstant", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReplaceBySellLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceBySellLimit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReplaceBySellInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "replaceBySellInstant", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRippleDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "rippleDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRippleWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "rippleWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSellInstant(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "sellInstant", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSellLimit(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "sellLimit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransactionHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transactionHistory", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTraderFees(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "traderFees", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "tradeHistory", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransfer(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransferHistory(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "transferHistory", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedBitcoinDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedBitcoinDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedBitcoinCashDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedBitcoinCashDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedDashDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedDashDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedEthereumDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedEthereumDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedLitecoinDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedLitecoinDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedRippleDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedRippleDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelAllOpenOrders(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "cancelAllOpenOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawVirtualCurrency(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "withdrawVirtualCurrency", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostVirtualCurrencyDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "virtualCurrencyDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedVirtualCurrencyDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedVirtualCurrencyDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAdaWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "adaWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAdaDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "adaDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedAdaDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedAdaDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSolWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "solWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSolDepositAddresses(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "solDepositAddresses", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUnconfirmedSolDeposits(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "unconfirmedSolDeposits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBankWireWithdrawal(self::Coinmate, params=Dict(), context=Dict())
    return request(self, "bankWireWithdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function Coinmate(; kwargs...)
    inst = Coinmate(Exchange(), describe, fetchTime, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, fetchTicker, fetchTickers, parseTicker, fetchDepositsWithdrawals, parseTransactionStatus, parseTransaction, withdraw, fetchMyTrades, parseTrade, fetchTrades, fetchTradingFee, fetchOpenOrders, fetchOrders, parseOrderStatus, parseOrderType, parseOrder, createOrder, fetchOrder, cancelOrder, nonce, sign, handleErrors, publicGetOrderBook, publicGetTicker, publicGetTickerAll, publicGetProducts, publicGetTransactions, publicGetTradingPairs, publicGetSystemTime, privatePostCurrencies, privatePostBalances, privatePostBitcoinCashWithdrawal, privatePostBitcoinCashDepositAddresses, privatePostBitcoinDepositAddresses, privatePostBitcoinWithdrawal, privatePostBitcoinWithdrawalFees, privatePostBuyInstant, privatePostBuyLimit, privatePostCancelOrder, privatePostCancelOrderWithInfo, privatePostCreateVoucher, privatePostDashDepositAddresses, privatePostDashWithdrawal, privatePostEthereumWithdrawal, privatePostEthereumDepositAddresses, privatePostLitecoinWithdrawal, privatePostLitecoinDepositAddresses, privatePostOpenOrders, privatePostOrder, privatePostOrderHistory, privatePostOrderById, privatePostPusherAuth, privatePostRedeemVoucher, privatePostReplaceByBuyLimit, privatePostReplaceByBuyInstant, privatePostReplaceBySellLimit, privatePostReplaceBySellInstant, privatePostRippleDepositAddresses, privatePostRippleWithdrawal, privatePostSellInstant, privatePostSellLimit, privatePostTransactionHistory, privatePostTraderFees, privatePostTradeHistory, privatePostTransfer, privatePostTransferHistory, privatePostUnconfirmedBitcoinDeposits, privatePostUnconfirmedBitcoinCashDeposits, privatePostUnconfirmedDashDeposits, privatePostUnconfirmedEthereumDeposits, privatePostUnconfirmedLitecoinDeposits, privatePostUnconfirmedRippleDeposits, privatePostCancelAllOpenOrders, privatePostWithdrawVirtualCurrency, privatePostVirtualCurrencyDepositAddresses, privatePostUnconfirmedVirtualCurrencyDeposits, privatePostAdaWithdrawal, privatePostAdaDepositAddresses, privatePostUnconfirmedAdaDeposits, privatePostSolWithdrawal, privatePostSolDepositAddresses, privatePostUnconfirmedSolDeposits, privatePostBankWireWithdrawal)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
