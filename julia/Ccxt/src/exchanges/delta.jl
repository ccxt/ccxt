@kwdef mutable struct Delta <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    safeMarket::Function = safeMarket
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    loadMarkets::Function = loadMarkets
    indexByStringifiedNumericId::Function = indexByStringifiedNumericId
    fetchMarkets::Function = fetchMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrdersWithMethod::Function = fetchOrdersWithMethod
    fetchMyTrades::Function = fetchMyTrades
    fetchLedger::Function = fetchLedger
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    fetchSettlementHistory::Function = fetchSettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchGreeks::Function = fetchGreeks
    parseGreeks::Function = parseGreeks
    closeAllPositions::Function = closeAllPositions
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    setMarginMode::Function = setMarginMode
    fetchOption::Function = fetchOption
    parseOption::Function = parseOption
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetAssets::Function = publicGetAssets
    publicGetIndices::Function = publicGetIndices
    publicGetProducts::Function = publicGetProducts
    publicGetProductsSymbol::Function = publicGetProductsSymbol
    publicGetTickers::Function = publicGetTickers
    publicGetTickersSymbol::Function = publicGetTickersSymbol
    publicGetL2orderbookSymbol::Function = publicGetL2orderbookSymbol
    publicGetTradesSymbol::Function = publicGetTradesSymbol
    publicGetStats::Function = publicGetStats
    publicGetHistoryCandles::Function = publicGetHistoryCandles
    publicGetHistorySparklines::Function = publicGetHistorySparklines
    publicGetSettings::Function = publicGetSettings
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersOrderId::Function = privateGetOrdersOrderId
    privateGetOrdersClientOrderIdClientOid::Function = privateGetOrdersClientOrderIdClientOid
    privateGetProductsProductIdOrdersLeverage::Function = privateGetProductsProductIdOrdersLeverage
    privateGetPositionsMargined::Function = privateGetPositionsMargined
    privateGetPositions::Function = privateGetPositions
    privateGetOrdersHistory::Function = privateGetOrdersHistory
    privateGetFills::Function = privateGetFills
    privateGetFillsHistoryDownloadCsv::Function = privateGetFillsHistoryDownloadCsv
    privateGetWalletBalances::Function = privateGetWalletBalances
    privateGetWalletTransactions::Function = privateGetWalletTransactions
    privateGetWalletTransactionsDownload::Function = privateGetWalletTransactionsDownload
    privateGetWalletsSubAccountsTransferHistory::Function = privateGetWalletsSubAccountsTransferHistory
    privateGetUsersTradingPreferences::Function = privateGetUsersTradingPreferences
    privateGetSubAccounts::Function = privateGetSubAccounts
    privateGetProfile::Function = privateGetProfile
    privateGetRateLimitsQuota::Function = privateGetRateLimitsQuota
    privateGetHeartbeat::Function = privateGetHeartbeat
    privateGetDepositsAddress::Function = privateGetDepositsAddress
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersBracket::Function = privatePostOrdersBracket
    privatePostOrdersBatch::Function = privatePostOrdersBatch
    privatePostProductsProductIdOrdersLeverage::Function = privatePostProductsProductIdOrdersLeverage
    privatePostPositionsChangeMargin::Function = privatePostPositionsChangeMargin
    privatePostPositionsCloseAll::Function = privatePostPositionsCloseAll
    privatePostWalletsSubAccountBalanceTransfer::Function = privatePostWalletsSubAccountBalanceTransfer
    privatePostHeartbeatCreate::Function = privatePostHeartbeatCreate
    privatePostHeartbeat::Function = privatePostHeartbeat
    privatePostOrdersCancelAfter::Function = privatePostOrdersCancelAfter
    privatePostOrdersLeverage::Function = privatePostOrdersLeverage
    privatePutOrders::Function = privatePutOrders
    privatePutOrdersBracket::Function = privatePutOrdersBracket
    privatePutOrdersBatch::Function = privatePutOrdersBatch
    privatePutPositionsAutoTopup::Function = privatePutPositionsAutoTopup
    privatePutUsersUpdateMmp::Function = privatePutUsersUpdateMmp
    privatePutUsersResetMmp::Function = privatePutUsersResetMmp
    privatePutUsersMarginMode::Function = privatePutUsersMarginMode
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersAll::Function = privateDeleteOrdersAll
    privateDeleteOrdersBatch::Function = privateDeleteOrdersBatch

end
function describe(self::Delta, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "delta",
    Symbol("name") => "Delta Exchange",
    Symbol("countries") => ["VC"],
    Symbol("rateLimit") => 300,
    Symbol("version") => "v2",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => true,
        Symbol("addMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => true,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => nothing,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => nothing,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTransfer") => nothing,
        Symbol("fetchTransfers") => nothing,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => nothing,
        Symbol("fetchWithdrawals") => nothing,
        Symbol("reduceMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
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
        Symbol("1d") => "1d",
        Symbol("7d") => "7d",
        Symbol("1w") => "1w",
        Symbol("2w") => "2w",
        Symbol("1M") => "30d"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://testnet-api.delta.exchange",
            Symbol("private") => "https://testnet-api.delta.exchange"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.delta.exchange",
            Symbol("private") => "https://api.delta.exchange"
        ),
        Symbol("www") => "https://www.delta.exchange",
        Symbol("doc") => ["https://docs.delta.exchange"],
        Symbol("fees") => "https://www.delta.exchange/fees",
        Symbol("referral") => "https://www.delta.exchange/app/signup/?code=IULYNB"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("indices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("l2orderbook/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("history/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("history/sparklines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/client_order_id/{client_oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{product_id}/orders/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/margined") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fills/history/download/csv") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/transactions/download") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallets/sub_accounts_transfer_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/trading_preferences") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub_accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("profile") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rate_limits/quota") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/bracket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("products/{product_id}/orders/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/change_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/close_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallets/sub_account_balance_transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("heartbeat/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/cancel_after") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/bracket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions/auto_topup") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/update_mmp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/reset_mmp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/margin_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
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
            Symbol("maker") => self.parseNumber("0.0010"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0015")], [self.parseNumber("100"), self.parseNumber("0.0013")], [self.parseNumber("250"), self.parseNumber("0.0013")], [self.parseNumber("1000"), self.parseNumber("0.001")], [self.parseNumber("5000"), self.parseNumber("0.0009")], [self.parseNumber("10000"), self.parseNumber("0.00075")], [self.parseNumber("20000"), self.parseNumber("0.00065")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("100"), self.parseNumber("0.001")], [self.parseNumber("250"), self.parseNumber("0.0009")], [self.parseNumber("1000"), self.parseNumber("0.00075")], [self.parseNumber("5000"), self.parseNumber("0.0006")], [self.parseNumber("10000"), self.parseNumber("0.0005")], [self.parseNumber("20000"), self.parseNumber("0.0005")]]
            )
        )
    ),
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome39"), nothing),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRC20(TRON)",
            Symbol("BEP20") => "BEP20(BSC)"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => nothing,
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => nothing,
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
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("insufficient_margin") => InsufficientFunds,
            Symbol("order_size_exceed_available") => InvalidOrder,
            Symbol("risk_limits_breached") => BadRequest,
            Symbol("invalid_contract") => BadSymbol,
            Symbol("immediate_liquidation") => InvalidOrder,
            Symbol("out_of_bankruptcy") => InvalidOrder,
            Symbol("self_matching_disrupted_post_only") => InvalidOrder,
            Symbol("immediate_execution_post_only") => InvalidOrder,
            Symbol("bad_schema") => BadRequest,
            Symbol("invalid_api_key") => AuthenticationError,
            Symbol("invalid_signature") => AuthenticationError,
            Symbol("open_order_not_found") => OrderNotFound,
            Symbol("unavailable") => ExchangeNotAvailable
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function createExpiredOptionMarket(self::Delta, symbol)
    quote_var = "USDT";
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    base = nothing;
    expiry = nothing;
    optionType = nothing;
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
        expiry = safeString(optionParts, 1);
        optionType = safeString(optionParts, 3);
    else
        base = safeString(optionParts, 1);
        expiry = safeString(optionParts, 3);
        optionType = safeString(optionParts, 0);
    end
    if functions.ccxtruthy(expiry != nothing)
        expiry = string(functions.ccxt_slice(expiry, 4), functions.ccxt_slice(expiry, 2, 4), functions.ccxt_slice(expiry, 0, 2));
    end
    settle = quote_var;
    strike = safeString(optionParts, 2);
    datetime = self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    optionTypeUnified = functions.ccxtruthy((optionType == "C")) ? "call" : "put";
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => string(optionType, "-", base, "-", strike, "-", expiry),
    Symbol("symbol") => string(base, "/", quote_var, ":", settle, "-", expiry, "-", strike, "-", optionType),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => quote_var,
    Symbol("settleId") => settle,
    Symbol("active") => false,
    Symbol("type") => "option",
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("spot") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("margin") => false,
    Symbol("contract") => true,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => timestamp,
    Symbol("expiryDatetime") => datetime,
    Symbol("optionType") => optionTypeUnified,
    Symbol("strike") => self.parseNumber(strike),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => nothing,
        Symbol("price") => nothing
    ),
    Symbol("limits") => Dict{Symbol, Any}(
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
    Symbol("info") => nothing
))

end
function safeMarket(self::Delta, marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((endswith(marketId, "-C")), (endswith(marketId, "-P"))), (startswith(marketId, "C-"))), (startswith(marketId, "P-")))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, (@functions.ccxt_or((self.markets_by_id == nothing), !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId, market, delimiter, marketType)

end
function fetchTime(self::Delta, params=Dict())
    response = Base.fetch(self.publicGetSettings(params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return safeIntegerProduct(result, "server_time", 0.001)

end
function fetchStatus(self::Delta, params=Dict())
    response = Base.fetch(self.publicGetSettings(params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    underMaintenance = safeString(result, "under_maintenance");
    status = functions.ccxtruthy((underMaintenance == "true")) ? "maintenance" : "ok";
    updated = safeIntegerProduct(result, "server_time", 0.001, milliseconds());
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchCurrencies(self::Delta, params=Dict())
    response = Base.fetch(self.publicGetAssets(params));
    currencies = self.safeList(response, "result", []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Delta, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    numericId = safeInteger(rawCurrency, "id");
    code = self.safeCurrencyCode(id);
    chains = self.safeList(rawCurrency, "networks", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "network");
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("name") => safeString(chain, "name"),
                Symbol("info") => chain,
                Symbol("active") => safeString(chain, "status") == "enabled",
                Symbol("deposit") => safeString(chain, "deposit_status") == "enabled",
                Symbol("withdraw") => safeString(chain, "withdrawal_status") == "enabled",
                Symbol("fee") => self.safeNumber(chain, "base_withdrawal_fee"),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "min_deposit_amount"),
                        Symbol("max") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "min_withdrawal_amount"),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => numericId,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("info") => rawCurrency,
    Symbol("active") => nothing,
    Symbol("deposit") => safeString(rawCurrency, "deposit_status") == "enabled",
    Symbol("withdraw") => safeString(rawCurrency, "withdrawal_status") == "enabled",
    Symbol("fee") => self.safeNumber(rawCurrency, "base_withdrawal_fee"),
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "precision"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min_withdrawal_amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks,
    Symbol("type") => "crypto"
))

end
function loadMarkets(self::Delta, reload=false, params=Dict())
    markets = Base.fetch(loadMarkets(self.parent, reload, params));
    currenciesByNumericId = self.safeDict(self.options, "currenciesByNumericId");
    if functions.ccxtruthy(@functions.ccxt_or((currenciesByNumericId == nothing), reload))
        self.options[Symbol("currenciesByNumericId")] = self.indexByStringifiedNumericId(self.currencies);
    end
    marketsByNumericId = self.safeDict(self.options, "marketsByNumericId");
    if functions.ccxtruthy(@functions.ccxt_or((marketsByNumericId == nothing), reload))
        self.options[Symbol("marketsByNumericId")] = self.indexByStringifiedNumericId(self.markets);
    end
    return markets

end
function indexByStringifiedNumericId(self::Delta, input)
    result = Dict{Symbol, Any}();
    if functions.ccxtruthy(input == nothing)
            return nothing
    end
    keys_var = objectKeys(input);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        item = get(input, Symbol(key), nothing);
        numericIdString = safeString(item, "numericId");
        if functions.ccxtruthy(numericIdString == nothing)
            i += 1; continue
        end
        result[Symbol(numericIdString)] = item;
        i += 1
    end
    return result

end
function fetchMarkets(self::Delta, params=Dict())
    response = Base.fetch(self.publicGetProducts(params));
    markets = self.safeList(response, "result", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        type_var = safeString(market, "contract_type");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "options_combos"), (type_var == "binary_call_options")), (type_var == "binary_put_options")))
            i += 1; continue
        end
        quotingAsset = self.safeDict(market, "quoting_asset", Dict{Symbol, Any}());
        underlyingAsset = self.safeDict(market, "underlying_asset", Dict{Symbol, Any}());
        settlingAsset = self.safeDict(market, "settling_asset");
        productSpecs = self.safeDict(market, "product_specs", Dict{Symbol, Any}());
        baseId = safeString(underlyingAsset, "symbol");
        quoteId = safeString(quotingAsset, "symbol");
        settleId = safeString(settlingAsset, "symbol");
        id = safeString(market, "symbol");
        numericId = safeInteger(market, "id");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        callOptions = (type_var == "call_options");
        putOptions = (type_var == "put_options");
        moveOptions = (type_var == "move_options");
        spot = (type_var == "spot");
        swap = (type_var == "perpetual_futures");
        future = (type_var == "futures");
        option = (@functions.ccxt_or(@functions.ccxt_or(callOptions, putOptions), moveOptions));
        strike = safeString(market, "strike_price");
        expiryDatetime = safeString(market, "settlement_time");
        expiry = self.parse8601(expiryDatetime);
        contractSize = self.safeNumber(market, "contract_value");
        amountPrecision = nothing;
        if functions.ccxtruthy(spot)
            amountPrecision = self.parseNumber(self.parsePrecision(safeString(productSpecs, "underlying_precision")));
        else
            amountPrecision = self.parseNumber("1");
        end
        linear = (settle == quote_var);
        optionType = nothing;
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(swap, future), option))
            symbol = string(symbol, ":", settle);
            if functions.ccxtruthy(@functions.ccxt_or(future, option))
                symbol = string(symbol, "-", self.yymmdd(expiry));
                if functions.ccxtruthy(option)
                    type_var = "option";
                    letter = "C";
                    optionType = "call";
                    if functions.ccxtruthy(putOptions)
                        letter = "P";
                        optionType = "put";
                    elseif functions.ccxtruthy(moveOptions)
                        letter = "M";
                        optionType = "move";
                    end
                    symbol = string(symbol, "-", strike, "-", letter);
                else
                    type_var = "future";
                end
            else
                type_var = "swap";
            end
        end
        state = safeString(market, "state");
        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => numericId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("active") => (state == "live"),
    Symbol("contract") => !functions.ccxtruthy(spot),
    Symbol("linear") => functions.ccxtruthy(spot) ? nothing : linear,
    Symbol("inverse") => functions.ccxtruthy(spot) ? nothing : !functions.ccxtruthy(linear),
    Symbol("taker") => self.safeNumber(market, "taker_commission_rate"),
    Symbol("maker") => self.safeNumber(market, "maker_commission_rate"),
    Symbol("contractSize") => functions.ccxtruthy(spot) ? nothing : contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => self.parseNumber(strike),
    Symbol("optionType") => optionType,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => self.safeNumber(market, "tick_size")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "position_size_limit")
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
    Symbol("created") => self.parse8601(safeString(market, "launch_time")),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function parseTicker(self::Delta, ticker, market=nothing)
    timestamp = safeIntegerProduct(ticker, "timestamp", 0.001);
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market);
    last_var = safeString(ticker, "close");
    quotes = self.safeDict(ticker, "quotes", Dict{Symbol, Any}());
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => self.safeNumber(ticker, "high"),
    Symbol("low") => self.safeNumber(ticker, "low"),
    Symbol("bid") => self.safeNumber(quotes, "best_bid"),
    Symbol("bidVolume") => self.safeNumber(quotes, "bid_size"),
    Symbol("ask") => self.safeNumber(quotes, "best_ask"),
    Symbol("askVolume") => self.safeNumber(quotes, "ask_size"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => self.safeNumber(ticker, "volume"),
    Symbol("quoteVolume") => self.safeNumber(ticker, "turnover"),
    Symbol("markPrice") => self.safeNumber(ticker, "mark_price"),
    Symbol("indexPrice") => self.safeNumber(ticker, "spot_price"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTicker(result, market)

end
function fetchTickers(self::Delta, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetTickers(params));
    tickers = self.safeList(response, "result", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        rawTicker = get(tickers, i + 1, nothing);
        contractType = safeString(rawTicker, "contract_type");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((contractType == "options_combos"), (contractType == "binary_call_options")), (contractType == "binary_put_options")))
            i += 1; continue
        end
        ticker = self.parseTicker(rawTicker);
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchOrderBook(self::Delta, symbol, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetL2orderbookSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), nothing, "buy", "sell", "price", "size")

end
function parseTrade(self::Delta, trade, market=nothing)
    id = safeString(trade, "id");
    orderId = safeString(trade, "order_id");
    timestamp = self.parse8601(safeString(trade, "created_at"));
    timestamp = safeIntegerProduct(trade, "timestamp", 0.001, timestamp);
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "size");
    product = self.safeDict(trade, "product", Dict{Symbol, Any}());
    marketId = safeString(product, "symbol");
    symbol = self.safeSymbol(marketId, market);
    sellerRole = safeString(trade, "seller_role");
    side = safeString(trade, "side");
    if functions.ccxtruthy(side == nothing)
        if functions.ccxtruthy(sellerRole == "taker")
            side = "sell";
        elseif functions.ccxtruthy(sellerRole == "maker")
            side = "buy";
        end
    end
    takerOrMaker = safeString(trade, "role");
    metaData = self.safeDict(trade, "meta_data", Dict{Symbol, Any}());
    type_var = safeString(metaData, "order_type");
    if functions.ccxtruthy(type_var != nothing)
        type_var = replace(type_var, "_order" => "");
    end
    feeCostString = safeString(trade, "commission");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        settlingAsset = self.safeDict(product, "settling_asset", Dict{Symbol, Any}());
        feeCurrencyId = safeString(settlingAsset, "symbol");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchTrades(self::Delta, symbol, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradesSymbol(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseTrades(result, market, since, limit)

end
function parseOHLCV(self::Delta, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, "time"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchOHLCV(self::Delta, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe);
    limit = functions.ccxtruthy(limit) ? limit : 2000;
    until = safeIntegerProduct(params, "until", 0.001);
    untilIsDefined = (until != nothing);
    if functions.ccxtruthy(untilIsDefined)
        until = self.parseToInt(until);
    end
    if functions.ccxtruthy(since == nothing)
        end_var = functions.ccxtruthy(untilIsDefined) ? until : seconds();
        request[Symbol("end")] = end_var;
        if functions.ccxtruthy(end_var == nothing)
            throw(ExchangeError(string(self.id, " fetchOHLCV() missing end")));
        end
        request[Symbol("start")] = end_var - limit * duration;
    else
        start = self.parseToInt(since / 1000);
        request[Symbol("start")] = start;
        request[Symbol("end")] = functions.ccxtruthy(untilIsDefined) ? until : self.sum(start, limit * duration);
    end
    price = safeString(params, "price");
    if functions.ccxtruthy(price == "mark")
        request[Symbol("symbol")] = string("MARK:", get(market, Symbol("id"), nothing));
    elseif functions.ccxtruthy(price == "index")
        request[Symbol("symbol")] = get(get(get(market, Symbol("info"), nothing), Symbol("spot_index"), nothing), Symbol("symbol"), nothing);
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    params = omit(params, ["price", "until"]);
    response = Base.fetch(self.publicGetHistoryCandles(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOHLCVs(result, market, timeframe, since, limit)

end
function parseBalance(self::Delta, response)
    balances = self.safeList(response, "result", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    currenciesByNumericId = self.safeDict(self.options, "currenciesByNumericId", Dict{Symbol, Any}());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "asset_id");
        currency = self.safeDict(currenciesByNumericId, currencyId);
        code = functions.ccxtruthy((currency == nothing)) ? currencyId : get(currency, Symbol("code"), nothing);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "balance");
        account[Symbol("free")] = safeString(balance, "available_balance");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Delta, params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.privateGetWalletBalances(params));
    return self.parseBalance(response)

end
function fetchPosition(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing)
    );
    response = Base.fetch(self.privateGetPositions(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parsePosition(result, market)

end
function fetchPositions(self::Delta, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    response = Base.fetch(self.privateGetPositionsMargined(params));
    result = self.safeList(response, "result", []);
    return self.parsePositions(result, symbols)

end
function parsePosition(self::Delta, position, market=nothing)
    marketId = safeString(position, "product_symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeIntegerProduct(position, "timestamp", 0.001);
    sizeString = safeString(position, "size");
    side = nothing;
    if functions.ccxtruthy(sizeString != nothing)
        if functions.ccxtruthy(stringGt(sizeString, "0"))
            side = "buy";
        elseif functions.ccxtruthy(stringLt(sizeString, "0"))
            side = "sell";
        end
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("notional") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("unrealizedPnl") => nothing,
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.parseNumber(sizeString),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("markPrice") => nothing,
    Symbol("side") => side,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function parseOrderStatus(self::Delta, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("pending") => "open",
        Symbol("closed") => "closed",
        Symbol("cancelled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Delta, order, market=nothing)
    id = safeString(order, "id");
    clientOrderId = safeString(order, "client_order_id");
    createdAt = safeString(order, "created_at");
    timestamp = nothing;
    if functions.ccxtruthy(createdAt != nothing)
        if functions.ccxtruthy(findfirst("-", createdAt) !== nothing)
            timestamp = self.parse8601(createdAt);
        else
            timestamp = safeIntegerProduct(order, "created_at", 0.001);
        end
    end
    marketId = safeString(order, "product_id");
    marketsByNumericId = self.safeDict(self.options, "marketsByNumericId", Dict{Symbol, Any}());
    market = safeValue(marketsByNumericId, marketId, market);
    symbol = functions.ccxtruthy((market == nothing)) ? marketId : get(market, Symbol("symbol"), nothing);
    status = self.parseOrderStatus(safeString(order, "state"));
    side = safeString(order, "side");
    type_var = safeString(order, "order_type");
    if functions.ccxtruthy(type_var != nothing)
        type_var = replace(type_var, "_order" => "");
    end
    price = safeString(order, "limit_price");
    amount = safeString(order, "size");
    remaining = safeString(order, "unfilled_size");
    average = safeString(order, "average_fill_price");
    fee = nothing;
    feeCostString = safeString(order, "paid_commission");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyCode = nothing;
        if functions.ccxtruthy(market != nothing)
            settlingAsset = self.safeDict(get(market, Symbol("info"), nothing), "settling_asset", Dict{Symbol, Any}());
            feeCurrencyId = safeString(settlingAsset, "symbol");
            feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => average,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function createOrder(self::Delta, symbol, type_var, side, amount, price=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    orderType = string(type_var, "_order");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing),
        Symbol("size") => self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount),
        Symbol("side") => side,
        Symbol("order_type") => orderType
    );
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("limit_price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    clientOrderId = safeString2(params, "clientOrderId", "client_order_id");
    params = omit(params, ["clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
    end
    reduceOnly = self.safeBool(params, "reduceOnly");
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduce_only")] = reduceOnly;
        params = omit(params, "reduceOnly");
    end
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function editOrder(self::Delta, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => ccxt_parseInt(id),
        Symbol("product_id") => get(market, Symbol("numericId"), nothing)
    );
    if functions.ccxtruthy(amount != nothing)
        sizeString = self.amountToPrecision(symbol, amount);
        if functions.ccxtruthy(sizeString == nothing)
            sizeString = "0";
        end
        request[Symbol("size")] = ccxt_parseInt(sizeString);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
    end
    response = Base.fetch(self.privatePutOrders(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function cancelOrder(self::Delta, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => ccxt_parseInt(id),
        Symbol("product_id") => get(market, Symbol("numericId"), nothing)
    );
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function cancelAllOrders(self::Delta, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing)
    );
    response = self.privateDeleteOrdersAll(extend(request, params));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrder(self::Delta, id, symbol=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    clientOrderId = safeStringN(params, ["clientOrderId", "client_oid", "clientOid"]);
    params = omit(params, ["clientOrderId", "client_oid", "clientOid"]);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_oid")] = clientOrderId;
        response = Base.fetch(self.privateGetOrdersClientOrderIdClientOid(extend(request, params)));
    else
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.privateGetOrdersOrderId(extend(request, params)));
    end
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function fetchOpenOrders(self::Delta, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersWithMethod("privateGetOrders", symbol, since, limit, params))

end
function fetchClosedOrders(self::Delta, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersWithMethod("privateGetOrdersHistory", symbol, since, limit, params))

end
function fetchOrdersWithMethod(self::Delta, method, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("product_ids")] = get(market, Symbol("numericId"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = string(since, "000");
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(method == "privateGetOrders")
        response = Base.fetch(self.privateGetOrders(extend(request, params)));
    elseif functions.ccxtruthy(method == "privateGetOrdersHistory")
        response = Base.fetch(self.privateGetOrdersHistory(extend(request, params)));
    end
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, market, since, limit)

end
function fetchMyTrades(self::Delta, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("product_ids")] = get(market, Symbol("numericId"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = string(since, "000");
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.privateGetFills(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseTrades(result, market, since, limit)

end
function fetchLedger(self::Delta, code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset_id")] = get(currency, Symbol("numericId"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.privateGetWalletTransactions(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseLedger(result, currency, since, limit)

end
function parseLedgerEntryType(self::Delta, type_var)
    types = Dict{Symbol, Any}(
        Symbol("pnl") => "pnl",
        Symbol("deposit") => "transaction",
        Symbol("withdrawal") => "transaction",
        Symbol("commission") => "fee",
        Symbol("conversion") => "trade",
        Symbol("referral_bonus") => "referral",
        Symbol("commission_rebate") => "rebate"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Delta, item, currency=nothing)
    id = safeString(item, "uuid");
    direction = nothing;
    account = nothing;
    metaData = self.safeDict(item, "meta_data", Dict{Symbol, Any}());
    referenceId = safeString(metaData, "transaction_id");
    referenceAccount = nothing;
    type_var = safeString(item, "transaction_type");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "deposit"), (type_var == "commission_rebate")), (type_var == "referral_bonus")), (type_var == "pnl")), (type_var == "withdrawal_cancellation")), (type_var == "promo_credit")))
        direction = "in";
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "withdrawal"), (type_var == "commission")), (type_var == "conversion")), (type_var == "perpetual_futures_funding")))
        direction = "out";
    end
    type_var = self.parseLedgerEntryType(type_var);
    currencyId = safeString(item, "asset_id");
    currenciesByNumericId = self.safeDict(self.options, "currenciesByNumericId");
    currency = safeValue(currenciesByNumericId, currencyId, currency);
    code = functions.ccxtruthy((currency == nothing)) ? nothing : get(currency, Symbol("code"), nothing);
    amount = safeString(item, "amount");
    timestamp = self.parse8601(safeString(item, "created_at"));
    after = safeString(item, "balance");
    before = stringMax("0", stringSub(after, amount));
    status = "ok";
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("direction") => direction,
    Symbol("account") => account,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => referenceAccount,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => self.parseNumber(before),
    Symbol("after") => self.parseNumber(after),
    Symbol("status") => status,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => nothing
), currency)

end
function fetchDepositAddress(self::Delta, code, params=Dict())
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset_symbol") => get(currency, Symbol("id"), nothing)
    );
    networkCode = safeStringUpper(params, "network");
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network")] = self.networkCodeToId(networkCode, code);
        params = omit(params, "network");
    end
    response = Base.fetch(self.privateGetDepositsAddress(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseDepositAddress(result, currency)

end
function parseDepositAddress(self::Delta, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    marketId = safeString(depositAddress, "asset_symbol");
    networkId = safeString(depositAddress, "network");
    code = self.safeCurrencyCode(marketId, currency);
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
function fetchFundingRate(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseFundingRate(result, market)

end
function fetchFundingRates(self::Delta, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}(
        Symbol("contract_types") => "perpetual_futures"
    );
    response = Base.fetch(self.publicGetTickers(extend(request, params)));
    rates = self.safeList(response, "result", []);
    return self.parseFundingRates(rates, symbols)

end
function parseFundingRate(self::Delta, contract, market=nothing)
    timestamp = safeIntegerProduct(contract, "timestamp", 0.001);
    marketId = safeString(contract, "symbol");
    fundingRateString = safeString(contract, "funding_rate");
    fundingRate = stringDiv(fundingRateString, "100");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("markPrice") => self.safeNumber(contract, "mark_price"),
    Symbol("indexPrice") => self.safeNumber(contract, "spot_price"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.parseNumber(fundingRate),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function addMargin(self::Delta, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params))

end
function reduceMargin(self::Delta, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params))

end
function modifyMarginHelper(self::Delta, symbol, amount, type_var, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    amount = string(amount);
    if functions.ccxtruthy(type_var == "reduce")
        amount = stringMul(amount, "-1");
    end
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing),
        Symbol("delta_margin") => amount
    );
    response = Base.fetch(self.privatePostPositionsChangeMargin(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseMarginModification(result, market)

end
function parseMarginModification(self::Delta, data, market=nothing)
    marketId = safeString(data, "product_symbol");
    market = self.safeMarket(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => self.safeNumber(data, "margin"),
    Symbol("code") => nothing,
    Symbol("status") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function fetchOpenInterest(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOpenInterest(result, market)

end
function parseOpenInterest(self::Delta, interest, market=nothing)
    timestamp = safeIntegerProduct(interest, "timestamp", 0.001);
    marketId = safeString(interest, "symbol");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("baseVolume") => self.safeNumber(interest, "oi_value"),
    Symbol("quoteVolume") => self.safeNumber(interest, "oi_value_usd"),
    Symbol("openInterestAmount") => self.safeNumber(interest, "oi_contracts"),
    Symbol("openInterestValue") => self.safeNumber(interest, "oi"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function fetchLeverage(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing)
    );
    response = Base.fetch(self.privateGetProductsProductIdOrdersLeverage(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseLeverage(result, market)

end
function parseLeverage(self::Delta, leverage, market=nothing)
    marketId = safeString(leverage, "index_symbol");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(leverage, "margin_mode"),
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function setLeverage(self::Delta, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("numericId"), nothing),
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.privatePostProductsProductIdOrdersLeverage(extend(request, params)))

end
function fetchSettlementHistory(self::Delta, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("states") => "expired"
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.publicGetProducts(extend(request, params)));
    result = self.safeList(response, "result", []);
    settlements = self.parseSettlements(result, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, safeString(market, "symbol"), since, limit)

end
function parseSettlement(self::Delta, settlement, market)
    datetime = safeString(settlement, "settlement_time");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("price") => self.safeNumber(settlement, "settlement_price"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
function parseSettlements(self::Delta, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        i += 1
    end
    return result

end
function fetchGreeks(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseGreeks(result, market)

end
function parseGreeks(self::Delta, greeks, market=nothing)
    timestamp = safeIntegerProduct(greeks, "timestamp", 0.001);
    marketId = safeString(greeks, "symbol");
    symbol = self.safeSymbol(marketId, market);
    stats = self.safeDict(greeks, "greeks", Dict{Symbol, Any}());
    quotes = self.safeDict(greeks, "quotes", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("delta") => self.safeNumber(stats, "delta"),
    Symbol("gamma") => self.safeNumber(stats, "gamma"),
    Symbol("theta") => self.safeNumber(stats, "theta"),
    Symbol("vega") => self.safeNumber(stats, "vega"),
    Symbol("rho") => self.safeNumber(stats, "rho"),
    Symbol("bidSize") => self.safeNumber(quotes, "bid_size"),
    Symbol("askSize") => self.safeNumber(quotes, "ask_size"),
    Symbol("bidImpliedVolatility") => self.safeNumber(quotes, "bid_iv"),
    Symbol("askImpliedVolatility") => self.safeNumber(quotes, "ask_iv"),
    Symbol("markImpliedVolatility") => self.safeNumber(quotes, "mark_iv"),
    Symbol("bidPrice") => self.safeNumber(quotes, "best_bid"),
    Symbol("askPrice") => self.safeNumber(quotes, "best_ask"),
    Symbol("markPrice") => self.safeNumber(greeks, "mark_price"),
    Symbol("lastPrice") => self.safeNumber(greeks, "last_price"),
    Symbol("underlyingPrice") => self.safeNumber(greeks, "spot_price"),
    Symbol("info") => greeks
)

end
function closeAllPositions(self::Delta, params=Dict())
    Base.fetch(self.loadMarkets());
    request = Dict{Symbol, Any}(
        Symbol("close_all_portfolio") => true,
        Symbol("close_all_isolated") => true
    );
    response = Base.fetch(self.privatePostPositionsCloseAll(extend(request, params)));
    position = self.parsePosition(self.safeDict(response, "result", Dict{Symbol, Any}()));
    return [position]

end
function fetchMarginMode(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetProfile(params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseMarginMode(result, market)

end
function parseMarginMode(self::Delta, marginMode, market=nothing)
    symbol = nothing;
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => symbol,
    Symbol("marginMode") => safeString(marginMode, "margin_mode")
)

end
function setMarginMode(self::Delta, marginMode, symbol=nothing, params=Dict())
    self.checkRequiredArgument("setMarginMode", marginMode, "marginMode", ["isolated", "portfolio"]);
    subaccountUserId = safeString(params, "subaccount_user_id");
    self.checkRequiredArgument("setMarginMode", subaccountUserId, "params[\"subaccount_user_id\"]");
    request = Dict{Symbol, Any}(
        Symbol("margin_mode") => marginMode
    );
    return Base.fetch(self.privatePutUsersMarginMode(extend(request, params)))

end
function fetchOption(self::Delta, symbol, params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOption(result, nothing, market)

end
function parseOption(self::Delta, chain, currency=nothing, market=nothing)
    marketId = safeString(chain, "symbol");
    market = self.safeMarket(marketId, market);
    quotes = self.safeDict(chain, "quotes", Dict{Symbol, Any}());
    timestamp = safeIntegerProduct(chain, "timestamp", 0.001);
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => safeString(chain, "currency"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("impliedVolatility") => self.safeNumber(quotes, "mark_iv"),
    Symbol("openInterest") => self.safeNumber(chain, "oi"),
    Symbol("bidPrice") => self.safeNumber(quotes, "best_bid"),
    Symbol("askPrice") => self.safeNumber(quotes, "best_ask"),
    Symbol("midPrice") => self.safeNumber(quotes, "impact_mid_price"),
    Symbol("markPrice") => self.safeNumber(chain, "mark_price"),
    Symbol("lastPrice") => self.safeNumber(chain, "last_price"),
    Symbol("underlyingPrice") => self.safeNumber(chain, "spot_price"),
    Symbol("change") => self.safeNumber(chain, "change"),
    Symbol("percentage") => self.safeNumber(chain, "percentage"),
    Symbol("baseVolume") => self.safeNumber(chain, "volume"),
    Symbol("quoteVolume") => self.safeNumber(chain, "quote_volume")
)

end
function fetchPositionsADLRank(self::Delta, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    response = Base.fetch(self.privateGetPositionsMargined(params));
    result = self.safeList(response, "result", []);
    return self.parseADLRanks(result, symbols)

end
function parseADLRank(self::Delta, info, market=nothing)
    marketId = safeString(info, "product_symbol");
    datetime = safeString(info, "created_at");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("rank") => safeInteger(info, "adl_level"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
function sign(self::Delta, path, api="public", method="GET", params=Dict(), headers=Dict(), body=nothing)
    requestPath = string("/", self.version, "/", self.implodeParams(path, params));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), requestPath);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(seconds());
        headers = Dict{Symbol, Any}(
            Symbol("api-key") => self.apiKey,
            Symbol("timestamp") => timestamp
        );
        auth = string(method, timestamp, requestPath);
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                queryString = string("?", self.urlencode(query));
                auth += queryString;
                url += queryString;
            end
        else
            body = json(query);
            auth += body;
            headers[Symbol("Content-Type")] = "application/json";
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        headers[Symbol("signature")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Delta, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = self.safeDict(response, "error", Dict{Symbol, Any}());
    errorCode = safeString(error, "code");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Delta, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetAssets(self::Delta, params=Dict(), context=Dict())
    return request(self, "assets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetIndices(self::Delta, params=Dict(), context=Dict())
    return request(self, "indices", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetProducts(self::Delta, params=Dict(), context=Dict())
    return request(self, "products", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetProductsSymbol(self::Delta, params=Dict(), context=Dict())
    return request(self, "products/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Delta, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickersSymbol(self::Delta, params=Dict(), context=Dict())
    return request(self, "tickers/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetL2orderbookSymbol(self::Delta, params=Dict(), context=Dict())
    return request(self, "l2orderbook/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradesSymbol(self::Delta, params=Dict(), context=Dict())
    return request(self, "trades/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats(self::Delta, params=Dict(), context=Dict())
    return request(self, "stats", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetHistoryCandles(self::Delta, params=Dict(), context=Dict())
    return request(self, "history/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetHistorySparklines(self::Delta, params=Dict(), context=Dict())
    return request(self, "history/sparklines", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSettings(self::Delta, params=Dict(), context=Dict())
    return request(self, "settings", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetOrders(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersOrderId(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/{order_id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersClientOrderIdClientOid(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/client_order_id/{client_oid}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetProductsProductIdOrdersLeverage(self::Delta, params=Dict(), context=Dict())
    return request(self, "products/{product_id}/orders/leverage", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetPositionsMargined(self::Delta, params=Dict(), context=Dict())
    return request(self, "positions/margined", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetPositions(self::Delta, params=Dict(), context=Dict())
    return request(self, "positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersHistory(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFills(self::Delta, params=Dict(), context=Dict())
    return request(self, "fills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFillsHistoryDownloadCsv(self::Delta, params=Dict(), context=Dict())
    return request(self, "fills/history/download/csv", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletBalances(self::Delta, params=Dict(), context=Dict())
    return request(self, "wallet/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletTransactions(self::Delta, params=Dict(), context=Dict())
    return request(self, "wallet/transactions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletTransactionsDownload(self::Delta, params=Dict(), context=Dict())
    return request(self, "wallet/transactions/download", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWalletsSubAccountsTransferHistory(self::Delta, params=Dict(), context=Dict())
    return request(self, "wallets/sub_accounts_transfer_history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersTradingPreferences(self::Delta, params=Dict(), context=Dict())
    return request(self, "users/trading_preferences", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSubAccounts(self::Delta, params=Dict(), context=Dict())
    return request(self, "sub_accounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetProfile(self::Delta, params=Dict(), context=Dict())
    return request(self, "profile", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRateLimitsQuota(self::Delta, params=Dict(), context=Dict())
    return request(self, "rate_limits/quota", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetHeartbeat(self::Delta, params=Dict(), context=Dict())
    return request(self, "heartbeat", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDepositsAddress(self::Delta, params=Dict(), context=Dict())
    return request(self, "deposits/address", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostOrders(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersBracket(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/bracket", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersBatch(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/batch", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostProductsProductIdOrdersLeverage(self::Delta, params=Dict(), context=Dict())
    return request(self, "products/{product_id}/orders/leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPositionsChangeMargin(self::Delta, params=Dict(), context=Dict())
    return request(self, "positions/change_margin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPositionsCloseAll(self::Delta, params=Dict(), context=Dict())
    return request(self, "positions/close_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletsSubAccountBalanceTransfer(self::Delta, params=Dict(), context=Dict())
    return request(self, "wallets/sub_account_balance_transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostHeartbeatCreate(self::Delta, params=Dict(), context=Dict())
    return request(self, "heartbeat/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostHeartbeat(self::Delta, params=Dict(), context=Dict())
    return request(self, "heartbeat", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersCancelAfter(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/cancel_after", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrdersLeverage(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePutOrders(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutOrdersBracket(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/bracket", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutOrdersBatch(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/batch", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutPositionsAutoTopup(self::Delta, params=Dict(), context=Dict())
    return request(self, "positions/auto_topup", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutUsersUpdateMmp(self::Delta, params=Dict(), context=Dict())
    return request(self, "users/update_mmp", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutUsersResetMmp(self::Delta, params=Dict(), context=Dict())
    return request(self, "users/reset_mmp", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutUsersMarginMode(self::Delta, params=Dict(), context=Dict())
    return request(self, "users/margin_mode", "private", "PUT", params, nothing, nothing, Dict())
end

function privateDeleteOrders(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOrdersAll(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/all", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOrdersBatch(self::Delta, params=Dict(), context=Dict())
    return request(self, "orders/batch", "private", "DELETE", params, nothing, nothing, Dict())
end

function Delta(; kwargs...)
    inst = Delta(Exchange(), describe, createExpiredOptionMarket, safeMarket, fetchTime, fetchStatus, fetchCurrencies, parseCurrency, loadMarkets, indexByStringifiedNumericId, fetchMarkets, parseTicker, fetchTicker, fetchTickers, fetchOrderBook, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseBalance, fetchBalance, fetchPosition, fetchPositions, parsePosition, parseOrderStatus, parseOrder, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchOrdersWithMethod, fetchMyTrades, fetchLedger, parseLedgerEntryType, parseLedgerEntry, fetchDepositAddress, parseDepositAddress, fetchFundingRate, fetchFundingRates, parseFundingRate, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, fetchOpenInterest, parseOpenInterest, fetchLeverage, parseLeverage, setLeverage, fetchSettlementHistory, parseSettlement, parseSettlements, fetchGreeks, parseGreeks, closeAllPositions, fetchMarginMode, parseMarginMode, setMarginMode, fetchOption, parseOption, fetchPositionsADLRank, parseADLRank, sign, handleErrors, publicGetAssets, publicGetIndices, publicGetProducts, publicGetProductsSymbol, publicGetTickers, publicGetTickersSymbol, publicGetL2orderbookSymbol, publicGetTradesSymbol, publicGetStats, publicGetHistoryCandles, publicGetHistorySparklines, publicGetSettings, privateGetOrders, privateGetOrdersOrderId, privateGetOrdersClientOrderIdClientOid, privateGetProductsProductIdOrdersLeverage, privateGetPositionsMargined, privateGetPositions, privateGetOrdersHistory, privateGetFills, privateGetFillsHistoryDownloadCsv, privateGetWalletBalances, privateGetWalletTransactions, privateGetWalletTransactionsDownload, privateGetWalletsSubAccountsTransferHistory, privateGetUsersTradingPreferences, privateGetSubAccounts, privateGetProfile, privateGetRateLimitsQuota, privateGetHeartbeat, privateGetDepositsAddress, privatePostOrders, privatePostOrdersBracket, privatePostOrdersBatch, privatePostProductsProductIdOrdersLeverage, privatePostPositionsChangeMargin, privatePostPositionsCloseAll, privatePostWalletsSubAccountBalanceTransfer, privatePostHeartbeatCreate, privatePostHeartbeat, privatePostOrdersCancelAfter, privatePostOrdersLeverage, privatePutOrders, privatePutOrdersBracket, privatePutOrdersBatch, privatePutPositionsAutoTopup, privatePutUsersUpdateMmp, privatePutUsersResetMmp, privatePutUsersMarginMode, privateDeleteOrders, privateDeleteOrdersAll, privateDeleteOrdersBatch)
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
