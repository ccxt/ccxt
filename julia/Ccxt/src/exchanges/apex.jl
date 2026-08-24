@kwdef mutable struct Apex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseAccount::Function = parseAccount
    fetchAccount::Function = fetchAccount
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseOrder::Function = parseOrder
    parseTimeInForce::Function = parseTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    safeMarket::Function = safeMarket
    generateRandomClientIdOmni::Function = generateRandomClientIdOmni
    addHyphenBeforeUsdt::Function = addHyphenBeforeUsdt
    getSeeds::Function = getSeeds
    getAccountId::Function = getAccountId
    createOrder::Function = createOrder
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    setLeverage::Function = setLeverage
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetV3Symbols::Function = publicGetV3Symbols
    publicGetV3HistoryFunding::Function = publicGetV3HistoryFunding
    publicGetV3Ticker::Function = publicGetV3Ticker
    publicGetV3Klines::Function = publicGetV3Klines
    publicGetV3Trades::Function = publicGetV3Trades
    publicGetV3Depth::Function = publicGetV3Depth
    publicGetV3Time::Function = publicGetV3Time
    publicGetV3DataAllTickerInfo::Function = publicGetV3DataAllTickerInfo
    privateGetV3Account::Function = privateGetV3Account
    privateGetV3AccountBalance::Function = privateGetV3AccountBalance
    privateGetV3Fills::Function = privateGetV3Fills
    privateGetV3OrderFills::Function = privateGetV3OrderFills
    privateGetV3Order::Function = privateGetV3Order
    privateGetV3HistoryOrders::Function = privateGetV3HistoryOrders
    privateGetV3OrderByClientOrderId::Function = privateGetV3OrderByClientOrderId
    privateGetV3Funding::Function = privateGetV3Funding
    privateGetV3HistoricalPnl::Function = privateGetV3HistoricalPnl
    privateGetV3OpenOrders::Function = privateGetV3OpenOrders
    privateGetV3Transfers::Function = privateGetV3Transfers
    privateGetV3Transfer::Function = privateGetV3Transfer
    privatePostV3DeleteOpenOrders::Function = privatePostV3DeleteOpenOrders
    privatePostV3DeleteClientOrderId::Function = privatePostV3DeleteClientOrderId
    privatePostV3DeleteOrder::Function = privatePostV3DeleteOrder
    privatePostV3Order::Function = privatePostV3Order
    privatePostV3SetInitialMarginRate::Function = privatePostV3SetInitialMarginRate
    privatePostV3TransferOut::Function = privatePostV3TransferOut
    privatePostV3ContractTransferOut::Function = privatePostV3ContractTransferOut

end
function describe(self::Apex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "apex",
    Symbol("name") => "Apex",
    Symbol("countries") => [],
    Symbol("version") => "v3",
    Symbol("rateLimit") => 20,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("cancelOrdersForSymbols") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => false,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("5m") => "5",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("1h") => "60",
        Symbol("2h") => "120",
        Symbol("4h") => "240",
        Symbol("6h") => "360",
        Symbol("12h") => "720",
        Symbol("1d") => "D",
        Symbol("1w") => "W",
        Symbol("1M") => "M"
    ),
    Symbol("hostname") => "omni.apex.exchange",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/8ba7fbfa-0dd0-4ab9-8b72-ff60abe08ac6",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://{hostname}/api",
            Symbol("private") => "https://{hostname}/api"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://testnet.omni.apex.exchange/api",
            Symbol("private") => "https://testnet.omni.apex.exchange/api"
        ),
        Symbol("www") => "https://apex.exchange/",
        Symbol("doc") => "https://api-docs.omni.apex.exchange",
        Symbol("fees") => "https://apex-pro.gitbook.io/apex-pro/apex-omni-live-now/trading-perpetual-contracts/trading-fees",
        Symbol("referral") => "https://omni.apex.exchange/trade"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v3/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/history-funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/data/all-ticker-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v3/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/account-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/order-fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/order-by-client-order-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/historical-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v3/delete-open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/delete-client-order-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/delete-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/set-initial-margin-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/contract-transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("403") => RateLimitExceeded
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("20006") => "apikey sign error",
            Symbol("20016") => "request para error",
            Symbol("10001") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("ORDER_PRICE_MUST_GREETER_ZERO") => InvalidOrder,
            Symbol("ORDER_POSSIBLE_LEAD_TO_ACCOUNT_LIQUIDATED") => InvalidOrder,
            Symbol("ORDER_WITH_THIS_PRICE_CANNOT_REDUCE_POSITION_ONLY") => InvalidOrder
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0005"),
            Symbol("maker") => self.parseNumber("0.0002")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("walletAddress") => false,
        Symbol("privateKey") => false,
        Symbol("password") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "swap",
        Symbol("brokerId") => "6956"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
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
                    Symbol("PO") => true,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
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
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 200
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        )
    )
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-system-time-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Apex; params=Dict())
    response = Base.fetch(self.publicGetV3Time(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return safeInteger(data, "time")

end
function parseBalance(self::Apex, response)
    timestamp = milliseconds();
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    code = "USDT";
    account = self.account();
    account[Symbol("free")] = safeString(response, "availableBalance");
    account[Symbol("total")] = safeString(response, "totalEquityValue");
    result[Symbol(code)] = account;
    return self.safeBalance(result)

end
"""
query for account info
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Apex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetV3AccountBalance(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseBalance(data)

end
function parseAccount(self::Apex, account)
    accountId = safeString(account, "id", "0");
    return Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchAccount(self::Apex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetV3Account(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseAccount(data)

end
"""
fetches all available currencies on an exchange
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Apex; params=Dict())
    response = Base.fetch(self.publicGetV3Symbols(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    spotConfig = self.safeDict(data, "spotConfig", defaultValue = Dict{Symbol, Any}());
    multiChain = self.safeDict(spotConfig, "multiChain", defaultValue = Dict{Symbol, Any}());
    rows = self.safeList(spotConfig, "assets", defaultValue = []);
    chains = self.safeList(multiChain, "chains", defaultValue = []);
    self.options[Symbol("_temp_currencies_chains")] = chains;
    result = self.parseCurrencies(rows);
    delete!(self.options, :_temp_currencies_chains);
    return result

end
function parseCurrency(self::Apex, currency)
    currencyId = safeString(currency, "token");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(currency, "displayName");
    networks = Dict{Symbol, Any}();
    chains = get(self.options, Symbol("_temp_currencies_chains"), nothing);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        tokens = self.safeList(chain, "tokens", defaultValue = []);
        f = 0
        while functions.ccxtruthy(functions.ccxt_lt(f, length(tokens)))
            token = get(tokens, f + 1, nothing);
            tokenName = safeString(token, "token");
            if functions.ccxtruthy(tokenName == currencyId)
                networkId = safeString(chain, "chainId");
                networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
                if functions.ccxtruthy(networkCode != nothing)
                    networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                        Symbol("info") => chain,
                        Symbol("id") => networkId,
                        Symbol("network") => networkCode,
                        Symbol("active") => nothing,
                        Symbol("deposit") => !functions.ccxtruthy(self.safeBool(chain, "depositDisable")),
                        Symbol("withdraw") => self.safeBool(token, "withdrawEnable"),
                        Symbol("fee") => self.safeNumber(token, "minFee"),
                        Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(token, "decimals"))),
                        Symbol("limits") => Dict{Symbol, Any}(
                            Symbol("withdraw") => Dict{Symbol, Any}(
                                Symbol("min") => self.safeNumber(token, "minWithdraw"),
                                Symbol("max") => nothing
                            ),
                            Symbol("deposit") => Dict{Symbol, Any}(
                                Symbol("min") => self.safeNumber(chain, "minDeposit"),
                                Symbol("max") => nothing
                            )
                        )
                    );
                end
            end
            f += 1
        end
        j += 1
    end
    networkKeys = objectKeys(networks);
    networksLength = length(networkKeys);
    emptyChains = networksLength == 0;
    valueForEmpty = functions.ccxtruthy(emptyChains) ? false : nothing;
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => currency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("type") => "crypto",
    Symbol("name") => name,
    Symbol("active") => nothing,
    Symbol("deposit") => valueForEmpty,
    Symbol("withdraw") => valueForEmpty,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for apex
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Apex; params=Dict())
    response = Base.fetch(self.publicGetV3Symbols(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    contractConfig = self.safeDict(data, "contractConfig", defaultValue = Dict{Symbol, Any}());
    perpetualContract = self.safeList(contractConfig, "perpetualContract", defaultValue = []);
    return self.parseMarkets(perpetualContract)

end
function parseMarket(self::Apex, market)
    id = safeString(market, "symbol");
    id2 = safeString(market, "crossSymbolName");
    quoteId = safeString(market, "l2PairId");
    baseId = safeString(market, "baseTokenId");
    quote_var = safeString(market, "settleAssetId");
    base = self.safeCurrencyCode(baseId);
    settleId = safeString(market, "settleAssetId");
    settle = self.safeCurrencyCode(settleId);
    symbol = string(baseId, "/", quote_var, ":", settle);
    expiry = 0;
    takerFee = self.parseNumber("0.0002");
    makerFee = self.parseNumber("0.0005");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("id2") => id2,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => nothing,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => self.safeBool(market, "enableTrade"),
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => takerFee,
    Symbol("maker") => makerFee,
    Symbol("contractSize") => self.safeNumber(market, "minOrderSize"),
    Symbol("expiry") => functions.ccxtruthy((expiry == 0)) ? nothing : expiry,
    Symbol("expiryDatetime") => functions.ccxtruthy((expiry == 0)) ? nothing : self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "stepSize"),
        Symbol("price") => self.safeNumber(market, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "displayMinLeverage"),
            Symbol("max") => self.safeNumber(market, "displayMaxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderSize"),
            Symbol("max") => self.safeNumber(market, "maxOrderSize")
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
))

end
function parseTicker(self::Apex, ticker; market=nothing)
    timestamp = milliseconds();
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = self.safeSymbol(marketId, market = market);
    last_var = safeString(ticker, "lastPrice");
    percentage = safeString(ticker, "price24hPcnt");
    quoteVolume = safeString(ticker, "turnover24h");
    baseVolume = safeString(ticker, "volume24h");
    high = safeString(ticker, "highPrice24h");
    low = safeString(ticker, "lowPrice24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Apex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id2")
    );
    response = Base.fetch(self.publicGetV3Ticker(extend(request, params)));
    tickers = self.safeList(response, "data", defaultValue = []);
    rawTicker = self.safeDict(tickers, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(rawTicker, market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbols`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Apex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetV3DataAllTickerInfo(params));
    tickers = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(tickers, symbols = symbols)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-candlestick-chart-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Apex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("symbol") => safeString(market, "id2")
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    request[Symbol("limit")] = limit;
    (request, params) = self.handleUntilOption("end", request, params, multiplier = 0.001);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = floor(since / 1000);
    end
    response = Base.fetch(self.publicGetV3Klines(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    OHLCVs = self.safeList(data, safeString(market, "id2"), defaultValue = []);
    return self.parseOHLCVs(OHLCVs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Apex, ohlcv; market=nothing)
    return [safeInteger2(ohlcv, "start", "t"), self.safeNumber2(ohlcv, "open", "o"), self.safeNumber2(ohlcv, "high", "h"), self.safeNumber2(ohlcv, "low", "l"), self.safeNumber2(ohlcv, "close", "c"), self.safeNumber2(ohlcv, "volume", "v")]

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-market-depth-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Apex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id2")
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request[Symbol("limit")] = limit;
    response = Base.fetch(self.publicGetV3Depth(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = milliseconds();
    orderbook = self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "b", asksKey = "a");
    orderbook[Symbol("nonce")] = safeInteger(data, "u");
    return orderbook

end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-newest-trading-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Apex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id2")
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 500;
    end
    request[Symbol("limit")] = limit;
    response = Base.fetch(self.publicGetV3Trades(extend(request, params)));
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Apex, trade; market=nothing)
    marketId = safeString2(trade, "s", "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    id = safeString2(trade, "i", "id");
    timestamp = safeIntegerN(trade, ["t", "T", "createdAt"]);
    priceString = safeString2(trade, "p", "price");
    amountString = safeString2(trade, "v", "size");
    side = safeStringLower2(trade, "S", "side");
    type_var = safeString(trade, "type");
    fee = safeString(trade, "fee");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => nothing,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
"""
retrieves the open interest of a contract trading pair
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Apex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id2")
    );
    response = Base.fetch(self.publicGetV3Ticker(extend(request, params)));
    tickers = self.safeList(response, "data", defaultValue = []);
    rawTicker = self.safeDict(tickers, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOpenInterest(rawTicker, market = market)

end
function parseOpenInterest(self::Apex, interest; market=nothing)
    timestamp = milliseconds();
    marketId = safeString(interest, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = self.safeSymbol(marketId, market = market);
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("openInterestAmount") => safeString(interest, "openInterest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetches historical funding rate prices
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-funding-rate-history-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Apex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("beginTimeInclusive")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    page = safeInteger(params, "page");
    if functions.ccxtruthy(page != nothing)
        request[Symbol("page")] = page;
    end
    endTimeExclusive = safeIntegerN(params, ["endTime", "endTimeExclusive", "until"]);
    if functions.ccxtruthy(endTimeExclusive != nothing)
        request[Symbol("endTimeExclusive")] = endTimeExclusive;
    end
    response = Base.fetch(self.publicGetV3HistoryFunding(extend(request, params)));
    rates = [];
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    resultList = self.safeList(data, "historyFunds", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(resultList)))
        entry = get(resultList, i + 1, nothing);
        timestamp = safeInteger(entry, "fundingTimestamp");
        marketId = safeString(entry, "symbol");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("fundingRate") => self.safeNumber(entry, "rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseOrder(self::Apex, order; market=nothing)
    timestamp = safeInteger(order, "createdAt");
    orderId = safeString(order, "id");
    clientOrderId = safeString(order, "clientId");
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString(order, "price");
    amount = safeString(order, "size");
    orderType = safeString(order, "type");
    status = safeString(order, "status");
    side = safeStringLower(order, "side");
    remaining = omitZero(safeString(order, "remainingSize"));
    lastUpdateTimestamp = safeInteger(order, "updatedTime");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(orderType),
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "timeInForce")),
    Symbol("postOnly") => self.safeBool(order, "postOnly"),
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString(order, "triggerPrice"),
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("average") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => safeString(order, "fee"),
        Symbol("currency") => get(market, Symbol("settleId"), nothing)
    ),
    Symbol("info") => order
), market = market)

end
function parseTimeInForce(self::Apex, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GOOD_TIL_CANCEL") => "GOOD_TIL_CANCEL",
        Symbol("FILL_OR_KILL") => "FILL_OR_KILL",
        Symbol("IMMEDIATE_OR_CANCEL") => "IMMEDIATE_OR_CANCEL",
        Symbol("POST_ONLY") => "POST_ONLY"
    );
    return safeString(timeInForces, timeInForce)

end
function parseOrderStatus(self::Apex, status)
    if functions.ccxtruthy(status != nothing)
        statuses = Dict{Symbol, Any}(
            Symbol("PENDING") => "open",
            Symbol("OPEN") => "open",
            Symbol("FILLED") => "filled",
            Symbol("CANCELING") => "canceled",
            Symbol("CANCELED") => "canceled",
            Symbol("UNTRIGGERED") => "open"
        );
            return safeString(statuses, status, status)
    end
    return status

end
function parseOrderType(self::Apex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("STOP_LIMIT") => "limit",
        Symbol("STOP_MARKET") => "market",
        Symbol("TAKE_PROFIT_LIMIT") => "limit",
        Symbol("TAKE_PROFIT_MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function safeMarket(self::Apex; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    if functions.ccxtruthy(@functions.ccxt_and(market == nothing, marketId != nothing))
        marketsMap = self.markets;
        marketsById = self.markets_by_id;
        if functions.ccxtruthy(@functions.ccxt_and((marketsMap != nothing), (ccxt_in(marketId, marketsMap))))
            market = get(marketsMap, Symbol(marketId), nothing);
        elseif functions.ccxtruthy(@functions.ccxt_and((marketsById != nothing), (ccxt_in(marketId, marketsById))))
            market = get(marketsById, Symbol(marketId), nothing);
        else
            newMarketId = self.addHyphenBeforeUsdt(marketId);
            if functions.ccxtruthy(@functions.ccxt_and((marketsById != nothing), (ccxt_in(newMarketId, marketsById))))
                markets = get(marketsById, Symbol(newMarketId), nothing);
                numMarkets = length(markets);
                if functions.ccxtruthy(functions.ccxt_gt(numMarkets, 0))
                    if functions.ccxtruthy(get(get(get(marketsById, Symbol(newMarketId), nothing), 1, nothing), Symbol("id2"), nothing) == marketId)
                        market = get(get(marketsById, Symbol(newMarketId), nothing), 1, nothing);
                    end
                end
            end
        end
    end
    return safeMarket(self.parent, marketId = marketId, market = market, delimiter = delimiter, marketType = marketType)

end
function generateRandomClientIdOmni(self::Apex, _accountId)
    accountId = @functions.ccxt_or(_accountId, string(self.randNumber(12)));
    return string("apexomni-", accountId, "-", milliseconds(), "-", self.randNumber(6))

end
function addHyphenBeforeUsdt(self::Apex, symbol)
    uppercaseSymbol = uppercase(symbol);
    index = ccxt_indexOf("USDT", uppercaseSymbol);
    symbolChar = safeString(symbol, index - 1);
    if functions.ccxtruthy(@functions.ccxt_and(functions.ccxt_gt(index, 0), symbolChar != "-"))
            return string(functions.ccxt_slice(symbol, 0, index), "-", functions.ccxt_slice(symbol, index))
    end
    return symbol

end
function getSeeds(self::Apex, )
    seeds = safeString(self.options, "seeds");
    if functions.ccxtruthy(seeds == nothing)
        throw(ArgumentsRequired(string(self.id, " the \"seeds\" key is required in the options to access private endpoints. You can find it in API Management > Omni Key, and then set it as exchange.options[\"seeds\"] = XXXX")));
    end
    return seeds

end
function getAccountId(self::Apex, )
    accountId = safeString(self.options, "accountId", "0");
    if functions.ccxtruthy(accountId == "0")
        accountData = Base.fetch(self.fetchAccount());
        self.options[Symbol("accountId")] = safeString(accountData, "id", "0");
    end
    return get(self.options, Symbol("accountId"), nothing)

end
"""
create a trade order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-creating-orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Apex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderType = uppercase(type_var);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    orderSide = uppercase(side);
    orderSize = self.amountToPrecision(symbol, amount);
    orderPrice = "0";
    if functions.ccxtruthy(price != nothing)
        orderPrice = self.priceToPrecision(symbol, price);
    end
    fees = self.safeDict(self.fees, "swap", defaultValue = Dict{Symbol, Any}());
    taker = safeString(fees, "taker", "0.0005");
    maker = safeString(fees, "maker", "0.0002");
    limitFee = decimalToPrecision(stringAdd(stringMul(stringMul(orderPrice, orderSize), taker), numberToString(get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing))), TRUNCATE, get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing), self.precisionMode, self.paddingMode);
    timeNow = milliseconds();
    triggerPrice = safeString(params, "triggerPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    if functions.ccxtruthy(stopLossPrice != nothing)
        orderType = functions.ccxtruthy((orderType == "MARKET")) ? "STOP_MARKET" : "STOP_LIMIT";
        triggerPrice = stopLossPrice;
    elseif functions.ccxtruthy(takeProfitPrice != nothing)
        orderType = functions.ccxtruthy((orderType == "MARKET")) ? "TAKE_PROFIT_MARKET" : "TAKE_PROFIT_LIMIT";
        triggerPrice = takeProfitPrice;
    end
    isMarket = orderType == "MARKET";
    if functions.ccxtruthy(@functions.ccxt_and(isMarket, (price == nothing)))
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for market orders")));
    end
    timeInForce = safeStringUpper(params, "timeInForce");
    postOnly = self.isPostOnly(isMarket, nothing, params = params);
    if functions.ccxtruthy(timeInForce == nothing)
        timeInForce = "GOOD_TIL_CANCEL";
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isMarket))
        if functions.ccxtruthy(postOnly)
            timeInForce = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "ioc")
            timeInForce = "IMMEDIATE_OR_CANCEL";
        end
    end
    params = omit(params, "timeInForce");
    params = omit(params, "postOnly");
    clientOrderId = safeStringN(params, ["clientId", "clientOrderId", "client_order_id"]);
    accountId = Base.fetch(self.getAccountId());
    if functions.ccxtruthy(clientOrderId == nothing)
        clientOrderId = self.generateRandomClientIdOmni(accountId);
    end
    finalClientOrderId = clientOrderId;
    params = omit(params, ["clientId", "clientOrderId", "client_order_id", "stopLossPrice", "takeProfitPrice", "triggerPrice"]);
    finalOrderPrice = orderPrice;
    orderToSign = Dict{Symbol, Any}(
        Symbol("accountId") => accountId,
        Symbol("slotId") => finalClientOrderId,
        Symbol("nonce") => finalClientOrderId,
        Symbol("pairId") => get(market, Symbol("quoteId"), nothing),
        Symbol("size") => orderSize,
        Symbol("price") => finalOrderPrice,
        Symbol("direction") => orderSide,
        Symbol("makerFeeRate") => maker,
        Symbol("takerFeeRate") => taker
    );
    if functions.ccxtruthy(triggerPrice != nothing)
        orderToSign[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    end
    signature = Base.fetch(self.getZKContractSignatureObj(self.remove0xPrefix(self.getSeeds()), params = orderToSign));
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide,
        Symbol("type") => orderType,
        Symbol("size") => orderSize,
        Symbol("price") => finalOrderPrice,
        Symbol("limitFee") => limitFee,
        Symbol("expiration") => floor(timeNow / 1000 + 30 * 24 * 60 * 60),
        Symbol("timeInForce") => timeInForce,
        Symbol("clientId") => finalClientOrderId,
        Symbol("brokerId") => safeString(self.options, "brokerId", "6956")
    );
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    end
    request[Symbol("signature")] = signature;
    response = Base.fetch(self.privatePostV3Order(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferId`::string, optional: UUID, which is unique across the platform

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Apex, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    configResponse = Base.fetch(self.publicGetV3Symbols(params));
    configData = self.safeDict(configResponse, "data", defaultValue = Dict{Symbol, Any}());
    contractConfig = self.safeDict(configData, "contractConfig", defaultValue = Dict{Symbol, Any}());
    contractAssets = self.safeList(contractConfig, "assets", defaultValue = []);
    spotConfig = self.safeDict(configData, "spotConfig", defaultValue = Dict{Symbol, Any}());
    spotAssets = self.safeList(spotConfig, "assets", defaultValue = []);
    globalConfig = self.safeDict(spotConfig, "global", defaultValue = Dict{Symbol, Any}());
    receiverAddress = safeString(globalConfig, "contractAssetPoolEthAddress", "");
    receiverZkAccountId = safeString(globalConfig, "contractAssetPoolZkAccountId", "");
    receiverSubAccountId = safeString(globalConfig, "contractAssetPoolSubAccount", "");
    receiverAccountId = safeString(globalConfig, "contractAssetPoolAccountId", "");
    accountResponse = Base.fetch(self.privateGetV3Account(params));
    accountData = self.safeDict(accountResponse, "data", defaultValue = Dict{Symbol, Any}());
    spotAccount = self.safeDict(accountData, "spotAccount", defaultValue = Dict{Symbol, Any}());
    zkAccountId = safeString(spotAccount, "zkAccountId", "");
    subAccountId = safeString(spotAccount, "defaultSubAccountId", "0");
    subAccounts = self.safeList(spotAccount, "subAccounts", defaultValue = []);
    nonce = "0";
    if functions.ccxtruthy(functions.ccxt_gt(length(subAccounts), 0))
        nonce = safeString(get(subAccounts, 1, nothing), "nonce", "0");
    end
    finalNonce = nonce;
    ethAddress = safeString(accountData, "ethereumAddress", "");
    accountId = safeString(accountData, "id", "");
    currency = Dict{Symbol, Any}();
    assets = [];
    if functions.ccxtruthy(@functions.ccxt_and(fromAccount != nothing, lowercase(fromAccount) == "contract"))
        assets = contractAssets;
    else
        assets = spotAssets;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        if functions.ccxtruthy(safeString(get(assets, i + 1, nothing), "token", "") == code)
            currency = get(assets, i + 1, nothing);
        end
        i += 1
    end
    tokenId = safeString(currency, "tokenId", "");
    decimalsNum = self.safeNumber(currency, "decimals", defaultNumber = 0);
    decimalsNumber = functions.ccxtruthy((decimalsNum == nothing)) ? 0 : decimalsNum;
    mathPowResult = (pow(10, decimalsNumber));
    amountNumber = self.parseToInt(amount * mathPowResult);
    timestampSeconds = self.parseToInt(milliseconds() / 1000);
    clientOrderId = safeStringN(params, ["clientId", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId == nothing)
        clientOrderId = self.generateRandomClientIdOmni(safeString(self.options, "accountId"));
    end
    finalClientOrderId = clientOrderId;
    params = omit(params, ["clientId", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(@functions.ccxt_and(fromAccount != nothing, lowercase(fromAccount) == "contract"))
        formattedUint32 = "4294967295";
        zkSignAccountId = stringMod(accountId, formattedUint32);
        expireTime = timestampSeconds + 3600 * 24 * 28;
        orderToSign = Dict{Symbol, Any}(
            Symbol("zkAccountId") => zkSignAccountId,
            Symbol("receiverAddress") => ethAddress,
            Symbol("subAccountId") => subAccountId,
            Symbol("receiverSubAccountId") => subAccountId,
            Symbol("tokenId") => tokenId,
            Symbol("amount") => string(amountNumber),
            Symbol("fee") => "0",
            Symbol("nonce") => finalClientOrderId,
            Symbol("timestampSeconds") => expireTime,
            Symbol("isContract") => true
        );
        signature = Base.fetch(self.getZKTransferSignatureObj(self.remove0xPrefix(self.getSeeds()), params = orderToSign));
        request = Dict{Symbol, Any}(
            Symbol("amount") => amount,
            Symbol("expireTime") => expireTime,
            Symbol("clientWithdrawId") => finalClientOrderId,
            Symbol("signature") => signature,
            Symbol("token") => code,
            Symbol("ethAddress") => ethAddress
        );
        response = Base.fetch(self.privatePostV3ContractTransferOut(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        currentTime = milliseconds();
        parsedAmount = self.parseNumber(amount);
            return extend(self.parseTransfer(data, currency = self.currency(code)), Dict{Symbol, Any}(
    Symbol("timestamp") => currentTime,
    Symbol("datetime") => self.iso8601(currentTime),
    Symbol("amount") => parsedAmount,
    Symbol("fromAccount") => "contract",
    Symbol("toAccount") => "spot"
))
    else
        orderToSign = Dict{Symbol, Any}(
            Symbol("zkAccountId") => zkAccountId,
            Symbol("receiverAddress") => receiverAddress,
            Symbol("subAccountId") => subAccountId,
            Symbol("receiverSubAccountId") => receiverSubAccountId,
            Symbol("tokenId") => tokenId,
            Symbol("amount") => string(amountNumber),
            Symbol("fee") => "0",
            Symbol("nonce") => finalNonce,
            Symbol("timestampSeconds") => timestampSeconds
        );
        signature = Base.fetch(self.getZKTransferSignatureObj(self.remove0xPrefix(self.getSeeds()), params = orderToSign));
        amountStr = string(amount);
        ts = timestampSeconds;
        request = Dict{Symbol, Any}(
            Symbol("amount") => amountStr,
            Symbol("timestamp") => ts,
            Symbol("clientTransferId") => finalClientOrderId,
            Symbol("signature") => signature,
            Symbol("zkAccountId") => zkAccountId,
            Symbol("subAccountId") => subAccountId,
            Symbol("fee") => "0",
            Symbol("token") => code,
            Symbol("tokenId") => tokenId,
            Symbol("receiverAccountId") => receiverAccountId,
            Symbol("receiverZkAccountId") => receiverZkAccountId,
            Symbol("receiverSubAccountId") => receiverSubAccountId,
            Symbol("receiverAddress") => receiverAddress,
            Symbol("nonce") => finalNonce
        );
        response = Base.fetch(self.privatePostV3TransferOut(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        currentTime = milliseconds();
        return extend(self.parseTransfer(data, currency = self.currency(code)), Dict{Symbol, Any}(
    Symbol("timestamp") => currentTime,
    Symbol("datetime") => self.iso8601(currentTime),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("fromAccount") => "spot",
    Symbol("toAccount") => "contract"
))
    end

end
function parseTransfer(self::Apex, transfer; currency=nothing)
    currencyId = safeString(transfer, "coin");
    timestamp = safeInteger(transfer, "timestamp");
    fromAccount = safeString(transfer, "fromAccount");
    toAccount = safeString(transfer, "toAccount");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString2(transfer, "transferId", "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => safeString(transfer, "status")
)

end
"""
cancel all open orders in a market
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-cancel-all-open-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Apex; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostV3DeleteOpenOrders(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return [self.parseOrder(data, market = market)]

end
"""
cancels an open order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Apex, id; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    clientOrderId = safeStringN(params, ["clientId", "clientOrderId", "client_order_id"]);
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("id")] = clientOrderId;
        params = omit(params, ["clientId", "clientOrderId", "client_order_id"]);
        response = Base.fetch(self.privatePostV3DeleteClientOrderId(extend(request, params)));
    else
        request[Symbol("id")] = id;
        response = Base.fetch(self.privatePostV3DeleteOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.safeOrder(data)

end
"""
fetches information on an order made by the user
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-order-id
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-order-by-clientorderid

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Apex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeStringN(params, ["clientId", "clientOrderId", "client_order_id"]);
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("id")] = clientOrderId;
        params = omit(params, ["clientId", "clientOrderId", "client_order_id"]);
        response = Base.fetch(self.privateGetV3OrderByClientOrderId(extend(request, params)));
    else
        request[Symbol("id")] = id;
        response = Base.fetch(self.privateGetV3Order(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data)

end
"""
fetches information on multiple orders made by the user
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Apex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetV3OpenOrders(params));
    orders = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(orders, market = nothing, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-all-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.status`::bool, optional: "PENDING", "OPEN", "FILLED", "CANCELED", "EXPIRED", "UNTRIGGERED"
- `params.side`::bool, optional: BUY or SELL
- `params.type`::string, optional: "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
- `params.orderType`::string, optional: "ACTIVE","CONDITION","HISTORY"
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Apex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("beginTimeInclusive")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    endTimeExclusive = safeIntegerN(params, ["endTime", "endTimeExclusive", "until"]);
    if functions.ccxtruthy(endTimeExclusive != nothing)
        request[Symbol("endTimeExclusive")] = endTimeExclusive;
        params = omit(params, ["endTime", "endTimeExclusive", "until"]);
    end
    response = Base.fetch(self.privateGetV3HistoryOrders(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-trade-history

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Apex, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "clientId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["clientOrderId", "clientId"]);
    response = Base.fetch(self.privateGetV3OrderFills(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", defaultValue = []);
    return self.parseTrades(orders, market = nothing, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-trade-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time
- `params.side`::bool, optional: BUY or SELL
- `params.orderType`::string, optional: "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Apex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("beginTimeInclusive")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    endTimeExclusive = safeIntegerN(params, ["endTime", "endTimeExclusive", "until"]);
    if functions.ccxtruthy(endTimeExclusive != nothing)
        request[Symbol("endTimeExclusive")] = endTimeExclusive;
        params = omit(params, ["endTime", "endTimeExclusive", "until"]);
    end
    response = Base.fetch(self.privateGetV3Fills(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", defaultValue = []);
    return self.parseTrades(orders, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-funding-rate

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.side`::bool, optional: BUY or SELL
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Apex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("beginTimeInclusive")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    endTimeExclusive = safeIntegerN(params, ["endTime", "endTimeExclusive", "until"]);
    if functions.ccxtruthy(endTimeExclusive != nothing)
        params = omit(params, ["endTime", "endTimeExclusive", "until"]);
        request[Symbol("endTimeExclusive")] = endTimeExclusive;
    end
    response = Base.fetch(self.privateGetV3Funding(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    fundingValues = self.safeList(data, "fundingValues", defaultValue = []);
    return self.parseIncomes(fundingValues, market = market, since = since, limit = limit)

end
function parseIncome(self::Apex, income; market=nothing)
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    code = "USDT";
    timestamp = safeInteger(income, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "id"),
    Symbol("amount") => self.safeNumber(income, "fundingValue"),
    Symbol("rate") => self.safeNumber(income, "rate")
)

end
"""
set the level of leverage for a market
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-sets-the-initial-margin-rate-of-a-contract

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Apex, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    leverageString = numberToString(leverage);
    initialMarginRate = stringDiv("1", leverageString, 4);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("initialMarginRate") => initialMarginRate
    );
    response = Base.fetch(self.privatePostV3SetInitialMarginRate(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return data

end
"""
fetch all open positions
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Apex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetV3Account(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    positions = self.safeList(data, "positions", defaultValue = []);
    return self.parsePositions(positions, symbols = symbols)

end
function parsePosition(self::Apex, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(position, "side");
    quantity = safeString(position, "size");
    timestamp = safeInteger(position, "updatedTime");
    leverage = 20;
    customInitialMarginRate = safeString2(position, "customInitialMarginRate", "customImr", "0");
    if functions.ccxtruthy(precisionFromString(customInitialMarginRate) != 0)
        leverage = self.parseToInt(stringDiv("1", customInitialMarginRate, 4));
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => symbol,
    Symbol("entryPrice") => safeString(position, "entryPrice"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => leverage,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
function sign(self::Apex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), "/", path);
    headers = Dict{Symbol, Any}(
        Symbol("User-Agent") => "apex-CCXT",
        Symbol("Accept") => "application/json",
        Symbol("Content-Type") => "application/x-www-form-urlencoded"
    );
    signPath = string("/api/", path);
    signBody = body;
    if functions.ccxtruthy(uppercase(method) != "POST")
        if functions.ccxtruthy(length(objectKeys(params)))
            signPath += string("?", self.rawencode(params));
            url += string("?", self.rawencode(params));
        end
    else
        sortedQuery = keysort(params);
        signBody = self.rawencode(sortedQuery);
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(milliseconds());
        messageString = string(timestamp, uppercase(method), signPath);
        if functions.ccxtruthy(signBody != nothing)
            messageString = string(messageString, signBody);
        end
        signature = self.hmac(self.encode(messageString), self.encode(self.stringToBase64(self.secret)), sha256, "base64");
        headers[Symbol("APEX-SIGNATURE")] = signature;
        headers[Symbol("APEX-API-KEY")] = self.apiKey;
        headers[Symbol("APEX-TIMESTAMP")] = timestamp;
        headers[Symbol("APEX-PASSPHRASE")] = self.password;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => signBody,
    Symbol("headers") => headers
)

end
function handleErrors(self::Apex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeInteger(response, "code");
    if functions.ccxtruthy(@functions.ccxt_and(errorCode != nothing, errorCode != 0))
        feedback = string(self.id, " ", body);
        message = safeString2(response, "key", "msg");
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        status = string(code);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), status, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Apex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetV3Symbols(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3HistoryFunding(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/history-funding"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3Ticker(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3Klines(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3Trades(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3Depth(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3Time(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3DataAllTickerInfo(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/data/all-ticker-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Account(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3AccountBalance(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/account-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Fills(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3OrderFills(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/order-fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Order(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3HistoryOrders(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/history-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3OrderByClientOrderId(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/order-by-client-order-id"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Funding(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/funding"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3HistoricalPnl(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/historical-pnl"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3OpenOrders(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/open-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Transfers(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV3Transfer(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/transfer"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3DeleteOpenOrders(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/delete-open-orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3DeleteClientOrderId(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/delete-client-order-id"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3DeleteOrder(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/delete-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3Order(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3SetInitialMarginRate(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/set-initial-margin-rate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3TransferOut(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/transfer-out"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV3ContractTransferOut(self::Apex, params=Dict(), context=Dict())
    return request(self, "v3/contract-transfer-out"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Apex(; kwargs...)
    inst = Apex(Exchange(), describe, fetchTime, parseBalance, fetchBalance, parseAccount, fetchAccount, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseTicker, fetchTicker, fetchTickers, fetchOHLCV, parseOHLCV, fetchOrderBook, fetchTrades, parseTrade, fetchOpenInterest, parseOpenInterest, fetchFundingRateHistory, parseOrder, parseTimeInForce, parseOrderStatus, parseOrderType, safeMarket, generateRandomClientIdOmni, addHyphenBeforeUsdt, getSeeds, getAccountId, createOrder, transfer, parseTransfer, cancelAllOrders, cancelOrder, fetchOrder, fetchOpenOrders, fetchOrders, fetchOrderTrades, fetchMyTrades, fetchFundingHistory, parseIncome, setLeverage, fetchPositions, parsePosition, sign, handleErrors, publicGetV3Symbols, publicGetV3HistoryFunding, publicGetV3Ticker, publicGetV3Klines, publicGetV3Trades, publicGetV3Depth, publicGetV3Time, publicGetV3DataAllTickerInfo, privateGetV3Account, privateGetV3AccountBalance, privateGetV3Fills, privateGetV3OrderFills, privateGetV3Order, privateGetV3HistoryOrders, privateGetV3OrderByClientOrderId, privateGetV3Funding, privateGetV3HistoricalPnl, privateGetV3OpenOrders, privateGetV3Transfers, privateGetV3Transfer, privatePostV3DeleteOpenOrders, privatePostV3DeleteClientOrderId, privatePostV3DeleteOrder, privatePostV3Order, privatePostV3SetInitialMarginRate, privatePostV3TransferOut, privatePostV3ContractTransferOut)
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
function __ccxt_doc_Apex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-system-time-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Apex_fetchTime

function __ccxt_doc_Apex_fetchBalance() end
"""
query for account info
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Apex_fetchBalance

function __ccxt_doc_Apex_fetchAccount() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Apex_fetchAccount

function __ccxt_doc_Apex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Apex_fetchCurrencies

function __ccxt_doc_Apex_fetchMarkets() end
"""
retrieves data on all markets for apex
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Apex_fetchMarkets

function __ccxt_doc_Apex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Apex_fetchTicker

function __ccxt_doc_Apex_fetchTickers() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbols`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Apex_fetchTickers

function __ccxt_doc_Apex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-candlestick-chart-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Apex_fetchOHLCV

function __ccxt_doc_Apex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-market-depth-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Apex_fetchOrderBook

function __ccxt_doc_Apex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-newest-trading-data-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Apex_fetchTrades

function __ccxt_doc_Apex_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Apex_fetchOpenInterest

function __ccxt_doc_Apex_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://api-docs.omni.apex.exchange/#publicapi-v3-for-omni-get-funding-rate-history-v3

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Apex_fetchFundingRateHistory

function __ccxt_doc_Apex_createOrder() end
"""
create a trade order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-creating-orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_createOrder

function __ccxt_doc_Apex_transfer() end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferId`::string, optional: UUID, which is unique across the platform

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Apex_transfer

function __ccxt_doc_Apex_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-cancel-all-open-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_cancelAllOrders

function __ccxt_doc_Apex_cancelOrder() end
"""
cancels an open order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_cancelOrder

function __ccxt_doc_Apex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-order-id
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-order-by-clientorderid

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_fetchOrder

function __ccxt_doc_Apex_fetchOpenOrders() end
"""
fetches information on multiple orders made by the user
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_fetchOpenOrders

function __ccxt_doc_Apex_fetchOrders() end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-all-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.status`::bool, optional: "PENDING", "OPEN", "FILLED", "CANCELED", "EXPIRED", "UNTRIGGERED"
- `params.side`::bool, optional: BUY or SELL
- `params.type`::string, optional: "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
- `params.orderType`::string, optional: "ACTIVE","CONDITION","HISTORY"
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Apex_fetchOrders

function __ccxt_doc_Apex_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-trade-history

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Apex_fetchOrderTrades

function __ccxt_doc_Apex_fetchMyTrades() end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-trade-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time
- `params.side`::bool, optional: BUY or SELL
- `params.orderType`::string, optional: "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Apex_fetchMyTrades

function __ccxt_doc_Apex_fetchFundingHistory() end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-funding-rate

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.side`::bool, optional: BUY or SELL
- `params.page`::bool, optional: Page numbers start from 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Apex_fetchFundingHistory

function __ccxt_doc_Apex_setLeverage() end
"""
set the level of leverage for a market
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-post-sets-the-initial-margin-rate-of-a-contract

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Apex_setLeverage

function __ccxt_doc_Apex_fetchPositions() end
"""
fetch all open positions
see: https://api-docs.omni.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Apex_fetchPositions
