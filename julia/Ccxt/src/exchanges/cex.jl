@kwdef mutable struct Cex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTime::Function = fetchTime
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFees::Function = parseTradingFees
    parseTradingFee::Function = parseTradingFee
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrder::Function = fetchOpenOrder
    fetchClosedOrder::Function = fetchClosedOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    transfer::Function = transfer
    transferBetweenMainAndSubAccount::Function = transferBetweenMainAndSubAccount
    transferBetweenSubAccounts::Function = transferBetweenSubAccounts
    parseTransfer::Function = parseTransfer
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicPostGetServerTime::Function = publicPostGetServerTime
    publicPostGetPairsInfo::Function = publicPostGetPairsInfo
    publicPostGetCurrenciesInfo::Function = publicPostGetCurrenciesInfo
    publicPostGetProcessingInfo::Function = publicPostGetProcessingInfo
    publicPostGetTicker::Function = publicPostGetTicker
    publicPostGetTradeHistory::Function = publicPostGetTradeHistory
    publicPostGetOrderBook::Function = publicPostGetOrderBook
    publicPostGetCandles::Function = publicPostGetCandles
    privatePostGetMyCurrentFee::Function = privatePostGetMyCurrentFee
    privatePostGetFeeStrategy::Function = privatePostGetFeeStrategy
    privatePostGetMyVolume::Function = privatePostGetMyVolume
    privatePostDoCreateAccount::Function = privatePostDoCreateAccount
    privatePostGetMyAccountStatusV3::Function = privatePostGetMyAccountStatusV3
    privatePostGetMyWalletBalance::Function = privatePostGetMyWalletBalance
    privatePostGetMyOrders::Function = privatePostGetMyOrders
    privatePostDoMyNewOrder::Function = privatePostDoMyNewOrder
    privatePostDoCancelMyOrder::Function = privatePostDoCancelMyOrder
    privatePostDoCancelAllOrders::Function = privatePostDoCancelAllOrders
    privatePostGetOrderBook::Function = privatePostGetOrderBook
    privatePostGetCandles::Function = privatePostGetCandles
    privatePostGetTradeHistory::Function = privatePostGetTradeHistory
    privatePostGetMyTransactionHistory::Function = privatePostGetMyTransactionHistory
    privatePostGetMyFundingHistory::Function = privatePostGetMyFundingHistory
    privatePostDoMyInternalTransfer::Function = privatePostDoMyInternalTransfer
    privatePostGetProcessingInfo::Function = privatePostGetProcessingInfo
    privatePostGetDepositAddress::Function = privatePostGetDepositAddress
    privatePostDoDepositFundsFromWallet::Function = privatePostDoDepositFundsFromWallet
    privatePostDoWithdrawalFundsToWallet::Function = privatePostDoWithdrawalFundsToWallet

end
function describe(self::Cex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "cex",
    Symbol("name") => "CEX.IO",
    Symbol("countries") => ["GB", "EU", "CY", "RU"],
    Symbol("rateLimit") => 300,
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
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrder") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
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
        Symbol("fetchLedger") => true,
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
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
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
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/6105a195-3bae-4a08-a1bd-b2a86e3e8f99",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://trade.cex.io/api/spot/rest-public",
            Symbol("private") => "https://trade.cex.io/api/spot/rest"
        ),
        Symbol("www") => "https://cex.io",
        Symbol("doc") => "https://trade.cex.io/docs/",
        Symbol("fees") => ["https://cex.io/fee-schedule", "https://cex.io/limits-commissions"],
        Symbol("referral") => "https://cex.io/r/0/up105393824/0/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("get_server_time") => 1,
                Symbol("get_pairs_info") => 1,
                Symbol("get_currencies_info") => 1,
                Symbol("get_processing_info") => 10,
                Symbol("get_ticker") => 1,
                Symbol("get_trade_history") => 1,
                Symbol("get_order_book") => 1,
                Symbol("get_candles") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("get_my_current_fee") => 5,
                Symbol("get_fee_strategy") => 1,
                Symbol("get_my_volume") => 5,
                Symbol("do_create_account") => 1,
                Symbol("get_my_account_status_v3") => 5,
                Symbol("get_my_wallet_balance") => 5,
                Symbol("get_my_orders") => 5,
                Symbol("do_my_new_order") => 1,
                Symbol("do_cancel_my_order") => 1,
                Symbol("do_cancel_all_orders") => 5,
                Symbol("get_order_book") => 1,
                Symbol("get_candles") => 1,
                Symbol("get_trade_history") => 1,
                Symbol("get_my_transaction_history") => 1,
                Symbol("get_my_funding_history") => 5,
                Symbol("do_my_internal_transfer") => 1,
                Symbol("get_processing_info") => 10,
                Symbol("get_deposit_address") => 5,
                Symbol("do_deposit_funds_from_wallet") => 1,
                Symbol("do_withdrawal_funds_to_wallet") => 1
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
                    Symbol("FOK") => true,
                    Symbol("PO") => false,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => nothing,
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
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
        Symbol("exact") => Dict{Symbol, Any}(),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("You have negative balance on following accounts") => InsufficientFunds,
            Symbol("Mandatory parameter side should be one of BUY,SELL") => BadRequest,
            Symbol("API orders from Main account are not allowed") => BadRequest,
            Symbol("check failed") => BadRequest,
            Symbol("Insufficient funds") => InsufficientFunds,
            Symbol("Get deposit address for main account is not allowed") => PermissionDenied,
            Symbol("Market Trigger orders are not allowed") => BadRequest,
            Symbol("key not passed or incorrect") => AuthenticationError,
            Symbol("API rate limit reached") => RateLimitExceeded
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("1d") => "1d"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "bitcoin",
            Symbol("ERC20") => "ERC20",
            Symbol("BSC20") => "binancesmartchain",
            Symbol("DOGE") => "dogecoin",
            Symbol("ALGO") => "algorand",
            Symbol("XLM") => "stellar",
            Symbol("ATOM") => "cosmos",
            Symbol("LTC") => "litecoin",
            Symbol("XRP") => "ripple",
            Symbol("FTM") => "fantom",
            Symbol("MINA") => "mina",
            Symbol("THETA") => "theta",
            Symbol("XTZ") => "tezos",
            Symbol("TIA") => "celestia",
            Symbol("CRONOS") => "cronos",
            Symbol("MATIC") => "polygon",
            Symbol("TON") => "ton",
            Symbol("TRC20") => "tron",
            Symbol("SOLANA") => "solana",
            Symbol("SGB") => "songbird",
            Symbol("DYDX") => "dydx",
            Symbol("DASH") => "dash",
            Symbol("ZIL") => "zilliqa",
            Symbol("EOS") => "eos",
            Symbol("AVALANCHEC") => "avalanche",
            Symbol("ETHPOW") => "ethereumpow",
            Symbol("NEAR") => "near",
            Symbol("ARB") => "arbitrum",
            Symbol("DOT") => "polkadot",
            Symbol("OPT") => "optimism",
            Symbol("INJ") => "injective",
            Symbol("ADA") => "cardano",
            Symbol("ONT") => "ontology",
            Symbol("ICP") => "icp",
            Symbol("KAVA") => "kava",
            Symbol("KSM") => "kusama",
            Symbol("SEI") => "sei",
            Symbol("NEO") => "neo",
            Symbol("NEO3") => "neo3",
            Symbol("XDC") => "xdc"
        )
    )
))

end
function fetchCurrencies(self::Cex, params=Dict())
    promises = [];
    push!(promises, self.publicPostGetCurrenciesInfo(params));
    push!(promises, self.publicPostGetProcessingInfo(params));
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    dataCurrencies = self.safeList(get(responses, 1, nothing), "data", []);
    dataNetworks = self.safeDict(get(responses, 2, nothing), "data", Dict{Symbol, Any}());
    currenciesIndexed = indexBy(dataCurrencies, "currency");
    data = deepExtend(currenciesIndexed, dataNetworks);
    return self.parseCurrencies(toArray(data))

end
function parseCurrency(self::Cex, rawCurrency)
    id = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(id);
    type_var = functions.ccxtruthy(self.safeBool(rawCurrency, "fiat")) ? "fiat" : "crypto";
    currencyPrecision = self.parseNumber(self.parsePrecision(safeString(rawCurrency, "precision")));
    networks = Dict{Symbol, Any}();
    rawNetworks = self.safeDict(rawCurrency, "blockchains", Dict{Symbol, Any}());
    keys_var = objectKeys(rawNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(keys_var)))
        networkId = get(keys_var, j + 1, nothing);
        rawNetwork = get(rawNetworks, Symbol(networkId), nothing);
        networkCode = self.networkIdToCode(networkId, code);
        deposit = safeString(rawNetwork, "deposit") == "enabled";
        withdraw = safeString(rawNetwork, "withdrawal") == "enabled";
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("margin") => nothing,
            Symbol("deposit") => deposit,
            Symbol("withdraw") => withdraw,
            Symbol("active") => nothing,
            Symbol("fee") => self.safeNumber(rawNetwork, "withdrawalFee"),
            Symbol("precision") => currencyPrecision,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(rawNetwork, "minDeposit"),
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(rawNetwork, "minWithdrawal"),
                    Symbol("max") => nothing
                )
            ),
            Symbol("info") => rawNetwork
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => nothing,
    Symbol("type") => type_var,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "walletDeposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "walletWithdrawal"),
    Symbol("fee") => nothing,
    Symbol("precision") => currencyPrecision,
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
    Symbol("networks") => networks,
    Symbol("info") => rawCurrency
))

end
function fetchMarkets(self::Cex, params=Dict())
    response = Base.fetch(self.publicPostGetPairsInfo(params));
    data = self.safeList(response, "data", []);
    return self.parseMarkets(data)

end
function parseMarket(self::Cex, market)
    baseId = safeString(market, "base");
    base = self.safeCurrencyCode(baseId);
    quoteId = safeString(market, "quote");
    quote_var = self.safeCurrencyCode(quoteId);
    id = string(base, "-", quote_var);
    symbol = string(base, "/", quote_var);
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("baseId") => baseId,
    Symbol("quote") => quote_var,
    Symbol("quoteId") => quoteId,
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
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "baseMin"),
            Symbol("max") => self.safeNumber(market, "baseMax")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minPrice"),
            Symbol("max") => self.safeNumber(market, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteMin"),
            Symbol("max") => self.safeNumber(market, "quoteMax")
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => safeString(market, "baseLotSize"),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "pricePrecision"))),
        Symbol("base") => self.parseNumber(self.parsePrecision(safeString(market, "basePrecision"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(safeString(market, "quotePrecision")))
    ),
    Symbol("active") => nothing,
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchTime(self::Cex, params=Dict())
    response = Base.fetch(self.publicPostGetServerTime(params));
    data = self.safeDict(response, "data");
    timestamp = safeInteger(data, "timestamp");
    return timestamp

end
function fetchTicker(self::Cex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.fetchTickers([symbol], params));
    return self.safeDict(response, symbol, Dict{Symbol, Any}())

end
function fetchTickers(self::Cex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        request[Symbol("pairs")] = self.marketIds(symbols);
    end
    response = Base.fetch(self.publicPostGetTicker(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTickers(data, symbols)

end
function parseTicker(self::Cex, ticker, market=nothing)
    marketId = safeString(ticker, "id");
    symbol = self.safeSymbol(marketId, market);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => self.safeNumber(ticker, "high"),
    Symbol("low") => self.safeNumber(ticker, "low"),
    Symbol("bid") => self.safeNumber(ticker, "bestBid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => self.safeNumber(ticker, "bestAsk"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => safeString(ticker, "last"),
    Symbol("previousClose") => nothing,
    Symbol("change") => self.safeNumber(ticker, "priceChange"),
    Symbol("percentage") => self.safeNumber(ticker, "priceChangePercentage"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("info") => ticker
), market)

end
function fetchTrades(self::Cex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("fromDateISO")] = self.iso8601(since);
    end
    until = nothing;
    (until, params) = self.handleParamInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("toDateISO")] = self.iso8601(until);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = min(limit, 10000);
    end
    response = Base.fetch(self.publicPostGetTradeHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "trades", []);
    return self.parseTrades(trades, market, since, limit)

end
function parseTrade(self::Cex, trade, market=nothing)
    dateStr = safeString(trade, "dateISO");
    timestamp = self.parse8601(dateStr);
    market = self.safeMarket(nothing, market);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString(trade, "tradeId"),
    Symbol("order") => nothing,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("side") => safeStringLower(trade, "side"),
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "amount"),
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchOrderBook(self::Cex, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicPostGetOrderBook(extend(request, params)));
    orderBook = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = safeInteger(orderBook, "timestamp");
    return self.parseOrderBook(orderBook, get(market, Symbol("symbol"), nothing), timestamp)

end
function fetchOHLCV(self::Cex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    dataType = nothing;
    (dataType, params) = self.handleOptionAndParams(params, "fetchOHLCV", "dataType");
    if functions.ccxtruthy(dataType == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV requires a parameter \"dataType\" to be either \"bestBid\" or \"bestAsk\"")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => get(self.timeframes, Symbol(timeframe), nothing),
        Symbol("dataType") => dataType
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("fromISO")] = self.iso8601(since);
    end
    until = nothing;
    (until, params) = self.handleParamInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("toISO")] = self.iso8601(until);
    elseif functions.ccxtruthy(since == nothing)
        request[Symbol("toISO")] = self.iso8601(milliseconds());
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(since != nothing, until != nothing), limit != nothing))
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV does not support fetching candles with both a limit and since/until")));
    elseif functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(since != nothing, until != nothing)), limit == nothing))
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV requires a limit parameter when fetching candles with since or until")));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicPostGetCandles(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function parseOHLCV(self::Cex, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchTradingFees(self::Cex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetMyCurrentFee(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    fees = self.safeDict(data, "tradingFee", Dict{Symbol, Any}());
    return self.parseTradingFees(fees, true)

end
function parseTradingFees(self::Cex, response, useKeyAsId=false)
    result = Dict{Symbol, Any}();
    keys_var = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        market = nothing;
        if functions.ccxtruthy(useKeyAsId)
            market = self.safeMarket(key);
        end
        parsed = self.parseTradingFee(get(response, Symbol(key), nothing), market);
        result[Symbol(parsed[Symbol("symbol")])] = parsed;
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, result))))
            market = self.market(symbol);
            result[Symbol(symbol)] = self.parseTradingFee(response, market);
        end
        i += 1
    end
    return result

end
function parseTradingFee(self::Cex, fee, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("maker") => self.safeNumber(fee, "percent"),
    Symbol("taker") => self.safeNumber(fee, "percent"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchAccounts(self::Cex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetMyAccountStatusV3(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    balances = self.safeDict(data, "balancesPerAccounts", Dict{Symbol, Any}());
    arrays = toArray(balances);
    return self.parseAccounts(arrays, params)

end
function parseAccount(self::Cex, account)
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
function fetchBalance(self::Cex, params=Dict())
    accountName = nothing;
    (accountName, params) = self.handleParamString(params, "account", "");
    method = nothing;
    (method, params) = self.handleParamString(params, "method", "privatePostGetMyWalletBalance");
    accountBalance = nothing;
    if functions.ccxtruthy(method == "privatePostGetMyAccountStatusV3")
        response = Base.fetch(self.privatePostGetMyAccountStatusV3(params));
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
        balances = self.safeDict(data, "balancesPerAccounts", Dict{Symbol, Any}());
        accountBalance = self.safeDict(balances, accountName, Dict{Symbol, Any}());
    else
        response = Base.fetch(self.privatePostGetMyWalletBalance(params));
        accountBalance = self.safeDict(response, "data", Dict{Symbol, Any}());
    end
    return self.parseBalance(accountBalance)

end
function parseBalance(self::Cex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    keys_var = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        balance = self.safeDict(response, key, Dict{Symbol, Any}());
        code = self.safeCurrencyCode(key);
        account = Dict{Symbol, Any}(
            Symbol("used") => safeString(balance, "balanceOnHold"),
            Symbol("total") => safeString(balance, "balance")
        );
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchOrdersByStatus(self::Cex, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    isClosedOrders = (status == "closed");
    if functions.ccxtruthy(isClosedOrders)
        request[Symbol("archived")] = true;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("serverCreateTimestampFrom")] = since;
    elseif functions.ccxtruthy(isClosedOrders)
        request[Symbol("serverCreateTimestampFrom")] = milliseconds() - 364 * 24 * 60 * 60 * 1000;
    end
    until = nothing;
    (until, params) = self.handleParamInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("serverCreateTimestampTo")] = until;
    end
    response = Base.fetch(self.privatePostGetMyOrders(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrders(self::Cex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("closed", symbol, since, limit, params))

end
function fetchOpenOrders(self::Cex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("open", symbol, since, limit, params))

end
function fetchOpenOrder(self::Cex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    result = Base.fetch(self.fetchOpenOrders(symbol, nothing, nothing, extend(request, params)));
    return get(result, 1, nothing)

end
function fetchClosedOrder(self::Cex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    result = Base.fetch(self.fetchClosedOrders(symbol, nothing, nothing, extend(request, params)));
    return get(result, 1, nothing)

end
function parseOrderStatus(self::Cex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING_NEW") => "open",
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("EXPIRED") => "expired",
        Symbol("REJECTED") => "rejected",
        Symbol("PENDING_CANCEL") => "canceling",
        Symbol("CANCELLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Cex, order, market=nothing)
    currency1 = safeString(order, "currency1");
    currency2 = safeString(order, "currency2");
    marketId = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(currency1 != nothing, currency2 != nothing))
        marketId = string(currency1, "-", currency2);
    end
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    status = self.parseOrderStatus(safeString(order, "status"));
    fee = Dict{Symbol, Any}();
    feeAmount = self.safeNumber(order, "feeAmount");
    if functions.ccxtruthy(feeAmount != nothing)
        currencyId = safeString(order, "feeCurrency");
        feeCode = self.safeCurrencyCode(currencyId);
        fee[Symbol("currency")] = feeCode;
        fee[Symbol("cost")] = feeAmount;
    end
    timestamp = safeInteger(order, "serverCreateTimestamp");
    requestedBase = self.safeNumber(order, "requestedAmountCcy1");
    executedBase = self.safeNumber(order, "executedAmountCcy1");
    executedQuote = self.safeNumber(order, "executedAmountCcy2");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(order, "lastUpdateTimestamp"),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => safeStringLower(order, "orderType"),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => nothing,
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => self.safeNumber(order, "price"),
    Symbol("triggerPrice") => self.safeNumber(order, "stopPrice"),
    Symbol("amount") => requestedBase,
    Symbol("cost") => executedQuote,
    Symbol("average") => self.safeNumber(order, "averagePrice"),
    Symbol("filled") => executedBase,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("info") => order
), market)

end
function createOrder(self::Cex, symbol, type_var, side, amount, price=nothing, params=Dict())
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, "createOrder", "accountId");
    if functions.ccxtruthy(accountId == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() : API trading is now allowed from main account, set params[\"accountId\"] or .options[\"createOrder\"][\"accountId\"] to the name of your sub-account")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("clientOrderId") => uuid(),
        Symbol("currency1") => get(market, Symbol("baseId"), nothing),
        Symbol("currency2") => get(market, Symbol("quoteId"), nothing),
        Symbol("accountId") => accountId,
        Symbol("orderType") => capitalize(lowercase(type_var)),
        Symbol("side") => uppercase(side),
        Symbol("timestamp") => milliseconds(),
        Symbol("amountCcy1") => self.amountToPrecision(symbol, amount)
    );
    timeInForce = nothing;
    (timeInForce, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce", "GTC");
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("timeInForce")] = timeInForce;
    end
    triggerPrice = nothing;
    (triggerPrice, params) = self.handleParamString(params, "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("type")] = "Stop Limit";
        request[Symbol("stopPrice")] = triggerPrice;
    end
    response = Base.fetch(self.privatePostDoMyNewOrder(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(data, market)

end
function cancelOrder(self::Cex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id),
        Symbol("cancelRequestId") => string("c_", (milliseconds())),
        Symbol("timestamp") => milliseconds()
    );
    response = Base.fetch(self.privatePostDoCancelMyOrder(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data)

end
function cancelAllOrders(self::Cex, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostDoCancelAllOrders(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    ids = self.safeList(data, "clientOrderIds", []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        push!(orders, Dict{Symbol, Any}(
    Symbol("clientOrderId") => id
));
        i += 1
    end
    return self.parseOrders(orders)

end
function fetchLedger(self::Cex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("dateFrom")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    until = nothing;
    (until, params) = self.handleParamInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("dateTo")] = until;
    end
    response = Base.fetch(self.privatePostGetMyTransactionHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseLedger(data, currency, since, limit)

end
function parseLedgerEntry(self::Cex, item, currency=nothing)
    amount = safeString(item, "amount");
    direction = nothing;
    if functions.ccxtruthy(stringLe(amount, "0"))
        direction = "out";
        amount = stringMul("-1", amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "currency");
    currency = self.safeCurrency(currencyId, currency);
    code = self.safeCurrencyCode(currencyId, currency);
    timestampString = safeString(item, "timestamp");
    timestamp = self.parse8601(timestampString);
    type_var = safeString(item, "type");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "transactionId"),
    Symbol("direction") => direction,
    Symbol("account") => safeString(item, "accountId", ""),
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Cex, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("commission") => "fee"
    );
    return safeString(ledgerType, type_var, type_var)

end
function fetchDepositsWithdrawals(self::Cex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("dateFrom")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    until = nothing;
    (until, params) = self.handleParamInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("dateTo")] = until;
    end
    response = Base.fetch(self.privatePostGetMyFundingHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function parseTransaction(self::Cex, transaction, currency=nothing)
    currencyId = safeString(transaction, "currency");
    direction = safeString(transaction, "direction");
    type_var = functions.ccxtruthy((direction == "withdraw")) ? "withdrawal" : "deposit";
    code = self.safeCurrencyCode(currencyId, currency);
    updatedAt = safeString(transaction, "updatedAt");
    timestamp = self.parse8601(updatedAt);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "txId"),
    Symbol("txid") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(transaction, "commissionAmount")
    ),
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Cex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("rejected") => "rejected",
        Symbol("pending") => "pending",
        Symbol("approved") => "ok"
    );
    return safeString(statuses, status, status)

end
function transfer(self::Cex, code, amount, fromAccount, toAccount, params=Dict())
    transfer = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(toAccount != "", fromAccount != ""))
        transfer = Base.fetch(self.transferBetweenSubAccounts(code, amount, fromAccount, toAccount, params));
    else
        transfer = Base.fetch(self.transferBetweenMainAndSubAccount(code, amount, fromAccount, toAccount, params));
    end
    fillResponseFromRequest = self.handleOption("transfer", "fillResponseFromRequest", true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
    end
    return transfer

end
function transferBetweenMainAndSubAccount(self::Cex, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    fromMain = (fromAccount == "");
    targetAccount = functions.ccxtruthy(fromMain) ? toAccount : fromAccount;
    guid = safeString(params, "guid", uuid());
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("accountId") => targetAccount,
        Symbol("clientTxId") => guid
    );
    response = nothing;
    if functions.ccxtruthy(fromMain)
        response = Base.fetch(self.privatePostDoDepositFundsFromWallet(extend(request, params)));
    else
        response = Base.fetch(self.privatePostDoWithdrawalFundsToWallet(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransfer(data, currency)

end
function transferBetweenSubAccounts(self::Cex, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("fromAccountId") => fromAccount,
        Symbol("toAccountId") => toAccount
    );
    response = Base.fetch(self.privatePostDoMyInternalTransfer(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransfer(data, currency)

end
function parseTransfer(self::Cex, transfer, currency=nothing)
    currencyId = safeString(transfer, "currency");
    currencyCode = self.safeCurrencyCode(currencyId, currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString2(transfer, "transactionId", "clientTxId"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => currencyCode,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => self.parseTransactionStatus(safeString(transfer, "status"))
)

end
function fetchDepositAddress(self::Cex, code, params=Dict())
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, "createOrder", "accountId");
    if functions.ccxtruthy(accountId == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() : main account is not allowed to fetch deposit address from api, set params[\"accountId\"] or .options[\"createOrder\"][\"accountId\"] to the name of your sub-account")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("accountId") => accountId,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("blockchain") => self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.privatePostGetDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency)

end
function parseDepositAddress(self::Cex, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency);
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => self.networkIdToCode(safeString(depositAddress, "blockchain"), get(currency, Symbol("code"), nothing)),
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function sign(self::Cex, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        else
            body = json(query);
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json"
            );
        end
    else
        self.checkRequiredCredentials();
        seconds = string(seconds());
        body = json(query);
        auth = string(path, seconds, body);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("X-AGGR-KEY") => self.apiKey,
            Symbol("X-AGGR-TIMESTAMP") => seconds,
            Symbol("X-AGGR-SIGNATURE") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Cex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
        if functions.ccxtruthy(body == nothing)
            throw(NullResponse(string(self.id, " returned empty response")));
        elseif functions.ccxtruthy(get(body, 1, nothing) == "{")
            fixed = self.fixStringifiedJsonMembers(body);
            response = self.parseJson(fixed);
        else
            throw(NullResponse(string(self.id, " returned unparsed response: ", body)));
        end
    end
    error = safeString(response, "error");
    if functions.ccxtruthy(error != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    if functions.ccxtruthy(findfirst("do_my_new_order", url) !== nothing)
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
        rejectReason = safeString(data, "rejectReason");
        if functions.ccxtruthy(rejectReason != nothing)
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), rejectReason, rejectReason);
            throw(ExchangeError(string(self.id, " createOrder() ", rejectReason)));
        end
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Cex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicPostGetServerTime(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_server_time", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetPairsInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_pairs_info", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetCurrenciesInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_currencies_info", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetProcessingInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_processing_info", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function publicPostGetTicker(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_ticker", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetTradeHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_trade_history", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetOrderBook(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_order_book", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicPostGetCandles(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_candles", "public", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetMyCurrentFee(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_current_fee", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostGetFeeStrategy(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_fee_strategy", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetMyVolume(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_volume", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostDoCreateAccount(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_create_account", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetMyAccountStatusV3(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_account_status_v3", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostGetMyWalletBalance(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_wallet_balance", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostGetMyOrders(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostDoMyNewOrder(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_my_new_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDoCancelMyOrder(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_cancel_my_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDoCancelAllOrders(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_cancel_all_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostGetOrderBook(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_order_book", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetCandles(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_candles", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetTradeHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_trade_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetMyTransactionHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_transaction_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetMyFundingHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_funding_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostDoMyInternalTransfer(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_my_internal_transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGetProcessingInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_processing_info", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostGetDepositAddress(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_deposit_address", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostDoDepositFundsFromWallet(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_deposit_funds_from_wallet", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDoWithdrawalFundsToWallet(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_withdrawal_funds_to_wallet", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Cex(; kwargs...)
    inst = Cex(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchTime, fetchTicker, fetchTickers, parseTicker, fetchTrades, parseTrade, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchTradingFees, parseTradingFees, parseTradingFee, fetchAccounts, parseAccount, fetchBalance, parseBalance, fetchOrdersByStatus, fetchClosedOrders, fetchOpenOrders, fetchOpenOrder, fetchClosedOrder, parseOrderStatus, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchDepositsWithdrawals, parseTransaction, parseTransactionStatus, transfer, transferBetweenMainAndSubAccount, transferBetweenSubAccounts, parseTransfer, fetchDepositAddress, parseDepositAddress, sign, handleErrors, publicPostGetServerTime, publicPostGetPairsInfo, publicPostGetCurrenciesInfo, publicPostGetProcessingInfo, publicPostGetTicker, publicPostGetTradeHistory, publicPostGetOrderBook, publicPostGetCandles, privatePostGetMyCurrentFee, privatePostGetFeeStrategy, privatePostGetMyVolume, privatePostDoCreateAccount, privatePostGetMyAccountStatusV3, privatePostGetMyWalletBalance, privatePostGetMyOrders, privatePostDoMyNewOrder, privatePostDoCancelMyOrder, privatePostDoCancelAllOrders, privatePostGetOrderBook, privatePostGetCandles, privatePostGetTradeHistory, privatePostGetMyTransactionHistory, privatePostGetMyFundingHistory, privatePostDoMyInternalTransfer, privatePostGetProcessingInfo, privatePostGetDepositAddress, privatePostDoDepositFundsFromWallet, privatePostDoWithdrawalFundsToWallet)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
