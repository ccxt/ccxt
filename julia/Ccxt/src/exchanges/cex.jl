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
        Symbol("fetchOrdersByStatus") => true,
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
                Symbol("get_server_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_pairs_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_currencies_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_processing_info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("get_ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_trade_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("get_my_current_fee") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_fee_strategy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_my_volume") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("do_create_account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_my_account_status_v3") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_my_wallet_balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_my_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("do_my_new_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("do_cancel_my_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("do_cancel_all_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_trade_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_my_transaction_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_my_funding_history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("do_my_internal_transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_processing_info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("get_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("do_deposit_funds_from_wallet") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("do_withdrawal_funds_to_wallet") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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
            Symbol("ARBITRUM") => "arbitrum",
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
"""
fetches all available currencies on an exchange
see: https://trade.cex.io/docs/#rest-public-api-calls-currencies-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Cex; params=Dict())
    promises = [];
    push!(promises, self.publicPostGetCurrenciesInfo(params));
    push!(promises, self.publicPostGetProcessingInfo(params));
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    dataCurrencies = self.safeList(get(responses, 1, nothing), "data", defaultValue = []);
    dataNetworks = self.safeDict(get(responses, 2, nothing), "data", defaultValue = Dict{Symbol, Any}());
    currenciesIndexed = indexBy(dataCurrencies, "currency");
    data = deepExtend(currenciesIndexed, dataNetworks);
    return self.parseCurrencies(toArray(data))

end
function parseCurrency(self::Cex, rawCurrency)
    id = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(id);
    type_var = functions.ccxtruthy(self.safeBool(rawCurrency, "fiat")) ? "fiat" : "crypto";
    currencyPrecision = self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, "precision")));
    networks = Dict{Symbol, Any}();
    rawNetworks = self.safeDict(rawCurrency, "blockchains", defaultValue = Dict{Symbol, Any}());
    keys_var = objectKeys(rawNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(keys_var)))
        networkId = get(keys_var, j + 1, nothing);
        rawNetwork = get(rawNetworks, Symbol(networkId), nothing);
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        deposit = safeString(rawNetwork, "deposit") == "enabled";
        withdraw = safeString(rawNetwork, "withdrawal") == "enabled";
        if functions.ccxtruthy(networkCode != nothing)
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
        end
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
"""
retrieves data on all markets for ace
see: https://trade.cex.io/docs/#rest-public-api-calls-pairs-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Cex; params=Dict())
    response = Base.fetch(self.publicPostGetPairsInfo(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(data)

end
function parseMarket(self::Cex, market)
    baseId = safeString(market, "base");
    base = self.safeCurrencyCode(baseId);
    quoteId = safeString(market, "quote");
    quote_var = self.safeCurrencyCode(quoteId);
    id = string(base, "-", quote_var);
    symbol = string(base, "/", quote_var);
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision"))),
        Symbol("base") => self.parseNumber(self.parsePrecision(precision = safeString(market, "basePrecision"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quotePrecision")))
    ),
    Symbol("active") => nothing,
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://trade.cex.io/docs/#rest-public-api-calls-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Cex; params=Dict())
    response = Base.fetch(self.publicPostGetServerTime(params));
    data = self.safeDict(response, "data");
    timestamp = safeInteger(data, "timestamp");
    return timestamp

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://trade.cex.io/docs/#rest-public-api-calls-ticker

# Arguments
- `symbol`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Cex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.fetchTickers(symbols = [symbol], params = params));
    return self.safeDict(response, symbol, defaultValue = Dict{Symbol, Any}())

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://trade.cex.io/docs/#rest-public-api-calls-ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Cex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        request[Symbol("pairs")] = self.marketIds(symbols = symbols);
    end
    response = Base.fetch(self.publicPostGetTicker(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTickers(data, symbols = symbols)

end
function parseTicker(self::Cex, ticker; market=nothing)
    marketId = safeString(ticker, "id");
    symbol = self.safeSymbol(marketId, market = market);
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
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://trade.cex.io/docs/#rest-public-api-calls-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Cex, symbol; since=nothing, limit=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(data, "trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Cex, trade; market=nothing)
    dateStr = safeString(trade, "dateISO");
    timestamp = self.parse8601(dateStr);
    market = self.safeMarket(marketId = nothing, market = market);
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
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://trade.cex.io/docs/#rest-public-api-calls-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Cex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicPostGetOrderBook(extend(request, params)));
    orderBook = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(orderBook, "timestamp");
    return self.parseOrderBook(orderBook, get(market, Symbol("symbol"), nothing), timestamp = timestamp)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://trade.cex.io/docs/#rest-public-api-calls-candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Cex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Cex, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetch the trading fees for multiple markets
see: https://trade.cex.io/docs/#rest-public-api-calls-candles

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Cex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetMyCurrentFee(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    fees = self.safeDict(data, "tradingFee", defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFees(fees, useKeyAsId = true)

end
function parseTradingFees(self::Cex, response; useKeyAsId=false)
    result = Dict{Symbol, Any}();
    keys_var = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        market = nothing;
        if functions.ccxtruthy(useKeyAsId)
            market = self.safeMarket(marketId = key);
        end
        parsed = self.parseTradingFee(get(response, Symbol(key), nothing), market = market);
        if functions.ccxtruthy(get(parsed, Symbol("symbol"), nothing) != nothing)
            result[Symbol(parsed[Symbol("symbol")])] = parsed;
        end
        i += 1
    end
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, result))))
            market = self.market(symbol);
            result[Symbol(symbol)] = self.parseTradingFee(response, market = market);
        end
        i += 1
    end
    return result

end
function parseTradingFee(self::Cex, fee; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("maker") => self.safeNumber(fee, "percent"),
    Symbol("taker") => self.safeNumber(fee, "percent"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchAccounts(self::Cex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetMyAccountStatusV3(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    balances = self.safeDict(data, "balancesPerAccounts", defaultValue = Dict{Symbol, Any}());
    arrays = toArray(balances);
    return self.parseAccounts(arrays, params = params)

end
function parseAccount(self::Cex, account)
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://trade.cex.io/docs/#rest-private-api-calls-account-status-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::object, optional: 'privatePostGetMyWalletBalance' or 'privatePostGetMyAccountStatusV3'
- `params.account`::object, optional: in case 'privatePostGetMyAccountStatusV3' is chosen, this can specify the account name (default is empty string)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Cex; params=Dict())
    accountName = nothing;
    (accountName, params) = self.handleParamString(params, "account", defaultValue = "");
    method = nothing;
    (method, params) = self.handleParamString(params, "method", defaultValue = "privatePostGetMyWalletBalance");
    accountBalance = nothing;
    if functions.ccxtruthy(method == "privatePostGetMyAccountStatusV3")
        response = Base.fetch(self.privatePostGetMyAccountStatusV3(params));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        balances = self.safeDict(data, "balancesPerAccounts", defaultValue = Dict{Symbol, Any}());
        accountBalance = self.safeDict(balances, accountName, defaultValue = Dict{Symbol, Any}());
    else
        response = Base.fetch(self.privatePostGetMyWalletBalance(params));
        accountBalance = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
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
        balance = self.safeDict(response, key, defaultValue = Dict{Symbol, Any}());
        code = self.safeCurrencyCode(key);
        account = Dict{Symbol, Any}(
            Symbol("used") => safeString(balance, "balanceOnHold"),
            Symbol("total") => safeString(balance, "balance")
        );
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetches information on multiple orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `status`::string: order status to fetch for
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrdersByStatus(self::Cex, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Cex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("closed", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple canceled orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Cex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("open", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on an open order made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrder(self::Cex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    result = Base.fetch(self.fetchOpenOrders(symbol = symbol, since = nothing, limit = nothing, params = extend(request, params)));
    return get(result, 1, nothing)

end
"""
fetches information on an closed order made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrder(self::Cex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    result = Base.fetch(self.fetchClosedOrders(symbol = symbol, since = nothing, limit = nothing, params = extend(request, params)));
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
function parseOrder(self::Cex, order; market=nothing)
    currency1 = safeString(order, "currency1");
    currency2 = safeString(order, "currency2");
    marketId = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(currency1 != nothing, currency2 != nothing))
        marketId = string(currency1, "-", currency2);
    end
    market = self.safeMarket(marketId = marketId, market = market);
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
), market = market)

end
"""
create a trade order
see: https://trade.cex.io/docs/#rest-private-api-calls-new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account-id to use (default is empty string)
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Cex, symbol, type_var, side, amount; price=nothing, params=Dict())
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, "createOrder", "accountId");
    if functions.ccxtruthy(accountId == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() : API trading is now allowed from main account, set params[\"accountId\"] or .options[\"createOrder\"][\"accountId\"] to the name of your sub-account")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
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
    (timeInForce, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce", defaultValue = "GTC");
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancels an open order
see: https://trade.cex.io/docs/#rest-private-api-calls-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Cex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id),
        Symbol("cancelRequestId") => string("c_", (milliseconds())),
        Symbol("timestamp") => milliseconds()
    );
    response = Base.fetch(self.privatePostDoCancelMyOrder(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data)

end
"""
cancel all open orders in a market
see: https://trade.cex.io/docs/#rest-private-api-calls-cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Cex; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostDoCancelAllOrders(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    ids = self.safeList(data, "clientOrderIds", defaultValue = []);
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
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://trade.cex.io/docs/#rest-private-api-calls-transaction-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Cex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLedger(data, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Cex, item; currency=nothing)
    amount = safeString(item, "amount");
    direction = nothing;
    if functions.ccxtruthy(stringLe(amount, "0"))
        direction = "out";
        amount = stringMul("-1", amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
), currency = currency)

end
function parseLedgerEntryType(self::Cex, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("commission") => "fee"
    );
    return safeString(ledgerType, type_var, type_var)

end
"""
fetch history of deposits and withdrawals
see: https://trade.cex.io/docs/#rest-private-api-calls-funding-history

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Cex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Cex, transaction; currency=nothing)
    currencyId = safeString(transaction, "currency");
    direction = safeString(transaction, "direction");
    type_var = functions.ccxtruthy((direction == "withdraw")) ? "withdrawal" : "deposit";
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
"""
transfer currency internally between wallets on the same account
see: https://trade.cex.io/docs/#rest-private-api-calls-internal-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `toAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Cex, code, amount, fromAccount, toAccount; params=Dict())
    transfer = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(toAccount != "", fromAccount != ""))
        transfer = Base.fetch(self.transferBetweenSubAccounts(code, amount, fromAccount, toAccount, params = params));
    else
        transfer = Base.fetch(self.transferBetweenMainAndSubAccount(code, amount, fromAccount, toAccount, params = params));
    end
    fillResponseFromRequest = self.handleOption("transfer", "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
    end
    return transfer

end
function transferBetweenMainAndSubAccount(self::Cex, code, amount, fromAccount, toAccount; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransfer(data, currency = currency)

end
function transferBetweenSubAccounts(self::Cex, code, amount, fromAccount, toAccount; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransfer(data, currency = currency)

end
function parseTransfer(self::Cex, transfer; currency=nothing)
    currencyId = safeString(transfer, "currency");
    currencyCode = self.safeCurrencyCode(currencyId, currency = currency);
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
"""
fetch the deposit address for a currency associated with this account
see: https://trade.cex.io/docs/#rest-private-api-calls-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account-id (default to empty string) to refer to (at this moment, only sub-accounts allowed by exchange)

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Cex, code; params=Dict())
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
        Symbol("blockchain") => self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.privatePostGetDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
function parseDepositAddress(self::Cex, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => self.networkIdToCode(networkId = safeString(depositAddress, "blockchain"), currencyCode = get(currency, Symbol("code"), nothing)),
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function sign(self::Cex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        rejectReason = safeString(data, "rejectReason");
        if functions.ccxtruthy(rejectReason != nothing)
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), rejectReason, rejectReason);
            throw(ExchangeError(string(self.id, " createOrder() ", rejectReason)));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Cex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicPostGetServerTime(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_server_time"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetPairsInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_pairs_info"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetCurrenciesInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_currencies_info"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetProcessingInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_processing_info"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetTicker(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_ticker"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetTradeHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_trade_history"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetOrderBook(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_order_book"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostGetCandles(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_candles"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyCurrentFee(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_current_fee"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetFeeStrategy(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_fee_strategy"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyVolume(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_volume"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoCreateAccount(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_create_account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyAccountStatusV3(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_account_status_v3"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyWalletBalance(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_wallet_balance"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyOrders(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoMyNewOrder(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_my_new_order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoCancelMyOrder(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_cancel_my_order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoCancelAllOrders(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_cancel_all_orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetOrderBook(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_order_book"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetCandles(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_candles"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetTradeHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_trade_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyTransactionHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_transaction_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMyFundingHistory(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_my_funding_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoMyInternalTransfer(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_my_internal_transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetProcessingInfo(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_processing_info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDepositAddress(self::Cex, params=Dict(), context=Dict())
    return request(self, "get_deposit_address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoDepositFundsFromWallet(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_deposit_funds_from_wallet"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDoWithdrawalFundsToWallet(self::Cex, params=Dict(), context=Dict())
    return request(self, "do_withdrawal_funds_to_wallet"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Cex(; kwargs...)
    inst = Cex(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchTime, fetchTicker, fetchTickers, parseTicker, fetchTrades, parseTrade, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchTradingFees, parseTradingFees, parseTradingFee, fetchAccounts, parseAccount, fetchBalance, parseBalance, fetchOrdersByStatus, fetchClosedOrders, fetchOpenOrders, fetchOpenOrder, fetchClosedOrder, parseOrderStatus, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchDepositsWithdrawals, parseTransaction, parseTransactionStatus, transfer, transferBetweenMainAndSubAccount, transferBetweenSubAccounts, parseTransfer, fetchDepositAddress, parseDepositAddress, sign, handleErrors, publicPostGetServerTime, publicPostGetPairsInfo, publicPostGetCurrenciesInfo, publicPostGetProcessingInfo, publicPostGetTicker, publicPostGetTradeHistory, publicPostGetOrderBook, publicPostGetCandles, privatePostGetMyCurrentFee, privatePostGetFeeStrategy, privatePostGetMyVolume, privatePostDoCreateAccount, privatePostGetMyAccountStatusV3, privatePostGetMyWalletBalance, privatePostGetMyOrders, privatePostDoMyNewOrder, privatePostDoCancelMyOrder, privatePostDoCancelAllOrders, privatePostGetOrderBook, privatePostGetCandles, privatePostGetTradeHistory, privatePostGetMyTransactionHistory, privatePostGetMyFundingHistory, privatePostDoMyInternalTransfer, privatePostGetProcessingInfo, privatePostGetDepositAddress, privatePostDoDepositFundsFromWallet, privatePostDoWithdrawalFundsToWallet)
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
function __ccxt_doc_Cex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://trade.cex.io/docs/#rest-public-api-calls-currencies-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Cex_fetchCurrencies

function __ccxt_doc_Cex_fetchMarkets() end
"""
retrieves data on all markets for ace
see: https://trade.cex.io/docs/#rest-public-api-calls-pairs-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Cex_fetchMarkets

function __ccxt_doc_Cex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://trade.cex.io/docs/#rest-public-api-calls-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Cex_fetchTime

function __ccxt_doc_Cex_fetchTicker() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://trade.cex.io/docs/#rest-public-api-calls-ticker

# Arguments
- `symbol`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Cex_fetchTicker

function __ccxt_doc_Cex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://trade.cex.io/docs/#rest-public-api-calls-ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Cex_fetchTickers

function __ccxt_doc_Cex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://trade.cex.io/docs/#rest-public-api-calls-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Cex_fetchTrades

function __ccxt_doc_Cex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://trade.cex.io/docs/#rest-public-api-calls-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Cex_fetchOrderBook

function __ccxt_doc_Cex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://trade.cex.io/docs/#rest-public-api-calls-candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Cex_fetchOHLCV

function __ccxt_doc_Cex_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://trade.cex.io/docs/#rest-public-api-calls-candles

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Cex_fetchTradingFees

function __ccxt_doc_Cex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://trade.cex.io/docs/#rest-private-api-calls-account-status-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::object, optional: 'privatePostGetMyWalletBalance' or 'privatePostGetMyAccountStatusV3'
- `params.account`::object, optional: in case 'privatePostGetMyAccountStatusV3' is chosen, this can specify the account name (default is empty string)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Cex_fetchBalance

function __ccxt_doc_Cex_fetchOrdersByStatus() end
"""
fetches information on multiple orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `status`::string: order status to fetch for
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_fetchOrdersByStatus

function __ccxt_doc_Cex_fetchClosedOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_fetchClosedOrders

function __ccxt_doc_Cex_fetchOpenOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_fetchOpenOrders

function __ccxt_doc_Cex_fetchOpenOrder() end
"""
fetches information on an open order made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_fetchOpenOrder

function __ccxt_doc_Cex_fetchClosedOrder() end
"""
fetches information on an closed order made by the user
see: https://trade.cex.io/docs/#rest-private-api-calls-orders

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_fetchClosedOrder

function __ccxt_doc_Cex_createOrder() end
"""
create a trade order
see: https://trade.cex.io/docs/#rest-private-api-calls-new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account-id to use (default is empty string)
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_createOrder

function __ccxt_doc_Cex_cancelOrder() end
"""
cancels an open order
see: https://trade.cex.io/docs/#rest-private-api-calls-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_cancelOrder

function __ccxt_doc_Cex_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://trade.cex.io/docs/#rest-private-api-calls-cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cex_cancelAllOrders

function __ccxt_doc_Cex_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://trade.cex.io/docs/#rest-private-api-calls-transaction-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Cex_fetchLedger

function __ccxt_doc_Cex_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://trade.cex.io/docs/#rest-private-api-calls-funding-history

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Cex_fetchDepositsWithdrawals

function __ccxt_doc_Cex_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://trade.cex.io/docs/#rest-private-api-calls-internal-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `toAccount`::string: 'SPOT', 'FUND', or 'CONTRACT'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Cex_transfer

function __ccxt_doc_Cex_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://trade.cex.io/docs/#rest-private-api-calls-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account-id (default to empty string) to refer to (at this moment, only sub-accounts allowed by exchange)

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Cex_fetchDepositAddress
