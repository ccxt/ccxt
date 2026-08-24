@kwdef mutable struct Hyperliquid <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    setSandboxMode::Function = setSandboxMode
    market::Function = market
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchHip3Markets::Function = fetchHip3Markets
    fetchSwapMarkets::Function = fetchSwapMarkets
    calculatePricePrecision::Function = calculatePricePrecision
    fetchSpotMarkets::Function = fetchSpotMarkets
    parseMarket::Function = parseMarket
    updateSpotCurrencyCode::Function = updateSpotCurrencyCode
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchTickers::Function = fetchTickers
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    parseTicker::Function = parseTicker
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    amountToPrecision::Function = amountToPrecision
    priceToPrecision::Function = priceToPrecision
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signMessage::Function = signMessage
    constructPhantomAgent::Function = constructPhantomAgent
    actionHash::Function = actionHash
    signL1Action::Function = signL1Action
    signUserSignedAction::Function = signUserSignedAction
    buildUsdSendSig::Function = buildUsdSendSig
    buildUsdClassSendSig::Function = buildUsdClassSendSig
    buildWithdrawSig::Function = buildWithdrawSig
    buildUserDexAbstractionSig::Function = buildUserDexAbstractionSig
    buildUserAbstractionSig::Function = buildUserAbstractionSig
    buildApproveBuilderFeeSig::Function = buildApproveBuilderFeeSig
    setRef::Function = setRef
    approveBuilderFee::Function = approveBuilderFee
    initializeClient::Function = initializeClient
    handleBuilderFeeApproval::Function = handleBuilderFeeApproval
    isUnifiedEnabled::Function = isUnifiedEnabled
    setUserAbstraction::Function = setUserAbstraction
    enableUserDexAbstraction::Function = enableUserDexAbstraction
    setAgentAbstraction::Function = setAgentAbstraction
    createOrder::Function = createOrder
    createTwapOrder::Function = createTwapOrder
    createOrders::Function = createOrders
    createOrderRequest::Function = createOrderRequest
    createOrdersRequest::Function = createOrdersRequest
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelTwapOrder::Function = cancelTwapOrder
    cancelOrdersRequest::Function = cancelOrdersRequest
    cancelOrdersForSymbols::Function = cancelOrdersForSymbols
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    editOrdersRequest::Function = editOrdersRequest
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    createVault::Function = createVault
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    getDexFromHip3Symbol::Function = getDexFromHip3Symbol
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchPosition::Function = fetchPosition
    getDexFromSymbols::Function = getDexFromSymbols
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    setMarginMode::Function = setMarginMode
    setLeverage::Function = setLeverage
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    reserveRequestWeight::Function = reserveRequestWeight
    createSubAccount::Function = createSubAccount
    extractTypeFromDelta::Function = extractTypeFromDelta
    formatVaultAddress::Function = formatVaultAddress
    handlePublicAddress::Function = handlePublicAddress
    coinToMarketId::Function = coinToMarketId
    handleErrors::Function = handleErrors
    sign::Function = sign
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    parseCreateEditOrderArgs::Function = parseCreateEditOrderArgs

# Generated REST endpoint fields
    publicPostInfo::Function = publicPostInfo
    privatePostExchange::Function = privatePostExchange

end
function describe(self::Hyperliquid, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "hyperliquid",
    Symbol("name") => "Hyperliquid",
    Symbol("countries") => [],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 50,
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => nothing,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => "emulated",
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
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
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("hostname") => "hyperliquid.xyz",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/550769b3-d270-461e-9e02-8e8b8c0210b8",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.hyperliquid-testnet.xyz",
            Symbol("private") => "https://api.hyperliquid-testnet.xyz"
        ),
        Symbol("www") => "https://hyperliquid.xyz",
        Symbol("doc") => "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api",
        Symbol("fees") => "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees",
        Symbol("referral") => "https://app.hyperliquid.xyz/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("info") => Dict{Symbol, Any}(
    Symbol("cost") => 20,
    Symbol("byType") => Dict{Symbol, Any}(
        Symbol("l2Book") => 2,
        Symbol("allMids") => 2,
        Symbol("clearinghouseState") => 2,
        Symbol("orderStatus") => 2,
        Symbol("spotClearinghouseState") => 2,
        Symbol("exchangeStatus") => 2,
        Symbol("candleSnapshot") => 4
    )
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("exchange") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.00045"),
            Symbol("maker") => self.parseNumber("0.00015")
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0007"),
            Symbol("maker") => self.parseNumber("0.0004")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => true,
        Symbol("privateKey") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Price must be divisible by tick size.") => InvalidOrder,
            Symbol("Order must have minimum value of \$10") => InvalidOrder,
            Symbol("Insufficient margin to place order.") => InsufficientFunds,
            Symbol("Reduce only order would increase position.") => InvalidOrder,
            Symbol("Post only order would have immediately matched,") => InvalidOrder,
            Symbol("Order could not immediately match against any resting orders.") => InvalidOrder,
            Symbol("Invalid TP/SL price.") => InvalidOrder,
            Symbol("No liquidity available for market order.") => InvalidOrder,
            Symbol("Order was never placed, already canceled, or filled.") => OrderNotFound,
            Symbol("User or API Wallet ") => InvalidOrder,
            Symbol("Order has invalid size") => InvalidOrder,
            Symbol("Order price cannot be more than 80% away from the reference price") => InvalidOrder,
            Symbol("Order has zero size.") => InvalidOrder,
            Symbol("Insufficient spot balance asset") => InsufficientFunds,
            Symbol("Insufficient balance for withdrawal") => InsufficientFunds,
            Symbol("Insufficient balance for token transfer") => InsufficientFunds,
            Symbol("TWAP order value too small. Min is \$1200, which is \$10 per minute.") => InvalidOrder,
            Symbol("TWAP was never placed, already canceled, or filled.") => OrderNotFound,
            Symbol("Too many cumulative requests sent") => RateLimitExceeded
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "swap",
        Symbol("sandboxMode") => false,
        Symbol("builderFee") => true,
        Symbol("defaultSlippage") => 0.05,
        Symbol("marketHelperProps") => ["hip3TokensByName", "cachedCurrenciesById"],
        Symbol("zeroAddress") => "0x0000000000000000000000000000000000000000",
        Symbol("spotCurrencyMapping") => Dict{Symbol, Any}(
            Symbol("UDZ") => "2Z",
            Symbol("UBONK") => "BONK",
            Symbol("UBTC") => "BTC",
            Symbol("UETH") => "ETH",
            Symbol("UFART") => "FARTCOIN",
            Symbol("HPENGU") => "PENGU",
            Symbol("UPUMP") => "PUMP",
            Symbol("USOL") => "SOL",
            Symbol("UUUSPX") => "SPX",
            Symbol("USDT0") => "USDT",
            Symbol("XAUT0") => "XAUT",
            Symbol("UXPL") => "XPL"
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap", "hip3"],
            Symbol("hip3") => Dict{Symbol, Any}(
                Symbol("limit") => 10,
                Symbol("dexes") => []
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => false,
                        Symbol("mark") => false,
                        Symbol("index") => false
                    ),
                    Symbol("triggerPrice") => true,
                    Symbol("type") => true,
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
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
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 1000
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 2000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 2000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 2000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 2000,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 5000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forPerps") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        )
    ),
    Symbol("rollingWindowSize") => 0
))

end
function setSandboxMode(self::Hyperliquid, enabled)
    setSandboxMode(self.parent, enabled);
    self.options[Symbol("sandboxMode")] = enabled;

end
function market(self::Hyperliquid, symbol)
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " market() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    if functions.ccxtruthy(@functions.ccxt_and((symbol != nothing), !functions.ccxtruthy((ccxt_in(symbol, self.markets)))))
        symbolParts = split(symbol, "/");
        baseName = safeString(symbolParts, 0);
        spotCurrencyMapping = self.safeDict(self.options, "spotCurrencyMapping", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(ccxt_in(baseName, spotCurrencyMapping))
            unifiedBaseName = safeString(spotCurrencyMapping, baseName);
            quote_var = safeString(symbolParts, 1);
            newSymbol = string(self.safeCurrencyCode(unifiedBaseName), "/", quote_var);
            if functions.ccxtruthy(ccxt_in(newSymbol, self.markets))
                    return get(self.markets, Symbol(newSymbol), nothing)
            end
        end
    end
    return market(self.parent, symbol)

end
"""
the latest known information on the availability of the exchange API

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Hyperliquid; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "exchangeStatus"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    status = safeString(response, "specialStatuses");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == nothing)) ? "ok" : "maintenance",
    Symbol("updated") => safeInteger(response, "time"),
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Hyperliquid; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "exchangeStatus"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    return safeInteger(response, "time")

end
"""
fetches all available currencies on an exchange
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Hyperliquid; params=Dict())
    if functions.ccxtruthy(self.checkRequiredCredentials(error = false))
        Base.fetch(self.initializeClient());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "spotMeta"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    tokens = self.safeList(response, "tokens", defaultValue = []);
    self.options[Symbol("cachedCurrenciesById")] = Dict{Symbol, Any}();
    return self.parseCurrencies(tokens)

end
function parseCurrency(self::Hyperliquid, rawCurrency)
    id = safeString(rawCurrency, "index");
    name = safeString(rawCurrency, "name");
    code = self.safeCurrencyCode(name);
    self.options[Symbol("cachedCurrenciesById")][Symbol(id)] = name;
    result = self.safeCurrencyStructure(Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("name") => name,
        Symbol("code") => code,
        Symbol("precision") => self.parsePrecision(precision = safeString(rawCurrency, "weiDecimals")),
        Symbol("info") => rawCurrency,
        Symbol("active") => nothing,
        Symbol("deposit") => nothing,
        Symbol("withdraw") => nothing,
        Symbol("networks") => nothing,
        Symbol("fee") => nothing,
        Symbol("type") => "crypto",
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("amount") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            )
        )
    ));
    fullName = safeString(rawCurrency, "fullName");
    if functions.ccxtruthy(@functions.ccxt_and(fullName != nothing, name != nothing))
        isWrapped = @functions.ccxt_and(startswith(fullName, "Unit "), startswith(name, "U"));
        if functions.ccxtruthy(isWrapped)
            parts = split(name, "U");
            nameWithoutU = "";
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(parts)))
                nameWithoutU = string(nameWithoutU, get(parts, j + 1, nothing));
                j += 1
            end

            baseCode = self.safeCurrencyCode(nameWithoutU);
            if functions.ccxtruthy(code != nothing)
                self.options[Symbol("spotCurrencyMapping")][Symbol(code)] = baseCode;
            end
        end
    end
    return result

end
"""
retrieves data on all markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Hyperliquid; params=Dict())
    options = self.safeDict(self.options, "fetchMarkets", defaultValue = Dict{Symbol, Any}());
    types = self.safeList(options, "types", defaultValue = []);
    rawPromises = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        marketType = get(types, i + 1, nothing);
        if functions.ccxtruthy(marketType == "swap")
                        push!(rawPromises, self.fetchSwapMarkets(params = params));
        elseif functions.ccxtruthy(marketType == "spot")
            push!(rawPromises, self.fetchSpotMarkets(params = params));
        else
            if functions.ccxtruthy(marketType == "hip3")
                                push!(rawPromises, self.fetchHip3Markets(params = params));
            end

        end
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, rawPromises));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        result = arrayConcat(result, get(promises, i + 1, nothing));
        i += 1
    end
    return result

end
"""
retrieves data on all hip3 markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchHip3Markets(self::Hyperliquid; params=Dict())
    fetchDexes = Base.fetch(self.publicPostInfo(Dict{Symbol, Any}(
        Symbol("type") => "perpDexs"
    )));
    perpDexesOffset = Dict{Symbol, Any}();
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fetchDexes)))
        dex = self.safeDict(fetchDexes, i, defaultValue = Dict{Symbol, Any}());
        secondPart = (i - 1) * 10000;
        offset = self.sum(110000, secondPart);
        perpDexesOffset[Symbol(dex[Symbol("name")])] = offset;
        i += 1
    end
    fetchDexesList = [];
    options = self.safeDict(self.options, "fetchMarkets", defaultValue = Dict{Symbol, Any}());
    hip3 = self.safeDict(options, "hip3", defaultValue = Dict{Symbol, Any}());
    dexesProvided = self.safeList(hip3, "dexes", defaultValue = []);
    maxLimit = safeInteger(hip3, "limit", 10);
    userProvidedDexesLength = length(dexesProvided);
    if functions.ccxtruthy(functions.ccxt_gt(userProvidedDexesLength, 0))
        if functions.ccxtruthy(functions.ccxt_gt(userProvidedDexesLength, 0))
            fetchDexesList = dexesProvided;
        end
    else
        fetchDexesLength = length(fetchDexes);
        i = 1
        while functions.ccxtruthy(functions.ccxt_lt(i, maxLimit))
            if functions.ccxtruthy(functions.ccxt_ge(i, fetchDexesLength))
                break
            end
            dex = self.safeDict(fetchDexes, i, defaultValue = Dict{Symbol, Any}());
            if functions.ccxtruthy(dex == nothing)
                i += 1; continue
            end
            dexName = safeString(dex, "name");
            push!(fetchDexesList, dexName);
            i += 1
        end
    end
    rawPromises = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fetchDexesList)))
        request = Dict{Symbol, Any}(
            Symbol("type") => "metaAndAssetCtxs",
            Symbol("dex") => safeString(fetchDexesList, i)
        );
        push!(rawPromises, self.publicPostInfo(extend(request, params)));
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, rawPromises));
    self.options[Symbol("hip3TokensByName")] = Dict{Symbol, Any}();
    markets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        dexName = get(fetchDexesList, i + 1, nothing);
        offset = get(perpDexesOffset, Symbol(dexName), nothing);
        response = get(promises, i + 1, nothing);
        meta = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
        collateralToken = safeString(meta, "collateralToken");
        universe = self.safeList(meta, "universe", defaultValue = []);
        assetCtxs = self.safeList(response, 1, defaultValue = []);
        result = [];
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(universe)))
            data = extend(self.safeDict(universe, j, defaultValue = Dict{Symbol, Any}()), self.safeDict(assetCtxs, j, defaultValue = Dict{Symbol, Any}()));
            data[Symbol("baseId")] = self.sum(j, offset);
            data[Symbol("collateralToken")] = collateralToken;
            data[Symbol("hip3")] = true;
            data[Symbol("dex")] = dexName;
            cachedCurrencies = self.safeDict(self.options, "cachedCurrenciesById", defaultValue = Dict{Symbol, Any}());
            if functions.ccxtruthy(ccxt_in(collateralToken, cachedCurrencies))
                name = safeString(data, "name");
                collateralTokenCode = safeString(cachedCurrencies, collateralToken);
                data[Symbol("collateralTokenName")] = collateralTokenCode;
                safeCode = self.safeCurrencyCode(name);
                hip3Code = functions.ccxtruthy((safeCode == nothing)) ? name : replace(safeCode, ":" => "-");
                self.options[Symbol("hip3TokensByName")][Symbol(name)] = Dict{Symbol, Any}(
                    Symbol("quote") => collateralTokenCode,
                    Symbol("code") => hip3Code
                );
            end
            push!(result, data);
            j += 1
        end
        markets = arrayConcat(markets, self.parseMarkets(result));
        i += 1
    end
    return markets

end
"""
retrieves data on all swap markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchSwapMarkets(self::Hyperliquid; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "metaAndAssetCtxs"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    meta = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    universe = self.safeList(meta, "universe", defaultValue = []);
    assetCtxs = self.safeList(response, 1, defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(universe)))
        data = extend(self.safeDict(universe, i, defaultValue = Dict{Symbol, Any}()), self.safeDict(assetCtxs, i, defaultValue = Dict{Symbol, Any}()));
        data[Symbol("baseId")] = i;
        push!(result, data);
        i += 1
    end
    return self.parseMarkets(result)

end
"""
Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision

# Arguments
- `price`::float: the price to use in the calculation
- `amountPrecision`::int: the amountPrecision to use in the calculation
- `maxDecimals`::int: the maxDecimals to use in the calculation

# Returns
- The calculated price precision
"""
function calculatePricePrecision(self::Hyperliquid, price, amountPrecision, maxDecimals)
    pricePrecision = 0;
    priceStr = numberToString(price);
    if functions.ccxtruthy(priceStr == nothing)
            return 0
    end
    priceSplitted = split(priceStr, ".");
    if functions.ccxtruthy(stringEq(priceStr, "0"))
        significantDigits = 5;
        integerDigits = 0;
        pricePrecision = min(maxDecimals - amountPrecision, significantDigits - integerDigits);
    elseif functions.ccxtruthy(@functions.ccxt_and(stringGt(priceStr, "0"), stringLt(priceStr, "1")))
        significantDigits = 5;
        decimalPart = safeString(priceSplitted, 1, "");
        leadingZeros = 0;
        while functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_le(leadingZeros, length(decimalPart))), (get(decimalPart, leadingZeros + 1, nothing) == "0")))
            leadingZeros = leadingZeros + 1;
        end
        pricePrecision = leadingZeros + significantDigits;
        pricePrecision = min(maxDecimals - amountPrecision, pricePrecision);
    else
        integerPart = safeString(priceSplitted, 0, "");
        significantDigits = max(5, length(integerPart));
        pricePrecision = min(maxDecimals - amountPrecision, significantDigits - length(integerPart));
    end
    return self.parseToInt(pricePrecision)

end
"""
retrieves data on all spot markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchSpotMarkets(self::Hyperliquid; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "spotMetaAndAssetCtxs"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    first_var = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    second = self.safeList(response, 1, defaultValue = []);
    meta = self.safeList(first_var, "universe", defaultValue = []);
    tokens = self.safeList(first_var, "tokens", defaultValue = []);
    markets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(meta)))
        market = self.safeDict(meta, i, defaultValue = Dict{Symbol, Any}());
        index = safeInteger(market, "index");
        extraData = self.safeDict(second, index, defaultValue = Dict{Symbol, Any}());
        marketName = safeString(market, "name");
        fees = self.safeDict(self.fees, "spot", defaultValue = Dict{Symbol, Any}());
        taker = self.safeNumber(fees, "taker");
        maker = self.safeNumber(fees, "maker");
        tokensPos = self.safeList(market, "tokens", defaultValue = []);
        baseTokenPos = safeInteger(tokensPos, 0);
        quoteTokenPos = safeInteger(tokensPos, 1);
        baseTokenInfo = self.safeDict(tokens, baseTokenPos, defaultValue = Dict{Symbol, Any}());
        quoteTokenInfo = self.safeDict(tokens, quoteTokenPos, defaultValue = Dict{Symbol, Any}());
        baseName = safeString(baseTokenInfo, "name");
        quoteId = safeString(quoteTokenInfo, "name");
        if functions.ccxtruthy(@functions.ccxt_or(baseName == nothing, quoteId == nothing))
            i += 1; continue
        end
        spotCurrencyMapping = self.safeDict(self.options, "spotCurrencyMapping", defaultValue = Dict{Symbol, Any}());
        mappedBaseName = safeString(spotCurrencyMapping, baseName, baseName);
        mappedQuoteId = safeString(spotCurrencyMapping, quoteId, quoteId);
        mappedBase = self.safeCurrencyCode(mappedBaseName);
        mappedQuote = self.safeCurrencyCode(mappedQuoteId);
        mappedSymbol = string(mappedBase, "/", mappedQuote);
        innerBaseTokenInfo = self.safeDict(baseTokenInfo, "spec", defaultValue = baseTokenInfo);
        amountPrecisionStr = safeString(innerBaseTokenInfo, "szDecimals");
        amountPrecision = ccxt_parseInt(amountPrecisionStr);
        price = self.safeNumber(extraData, "midPx");
        pricePrecision = 0;
        if functions.ccxtruthy(price != nothing)
            pricePrecision = self.calculatePricePrecision(price, amountPrecision, 8);
        end
        pricePrecisionStr = numberToString(pricePrecision);
        baseId = numberToString(index + 10000);
        entry = Dict{Symbol, Any}(
            Symbol("id") => marketName,
            Symbol("symbol") => mappedSymbol,
            Symbol("base") => mappedBase,
            Symbol("quote") => mappedQuote,
            Symbol("settle") => nothing,
            Symbol("baseId") => baseId,
            Symbol("baseName") => baseName,
            Symbol("quoteId") => quoteId,
            Symbol("settleId") => nothing,
            Symbol("type") => "spot",
            Symbol("spot") => true,
            Symbol("subType") => nothing,
            Symbol("margin") => nothing,
            Symbol("swap") => false,
            Symbol("future") => false,
            Symbol("option") => false,
            Symbol("active") => true,
            Symbol("contract") => false,
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing,
            Symbol("taker") => taker,
            Symbol("maker") => maker,
            Symbol("contractSize") => nothing,
            Symbol("expiry") => nothing,
            Symbol("expiryDatetime") => nothing,
            Symbol("strike") => nothing,
            Symbol("optionType") => nothing,
            Symbol("precision") => Dict{Symbol, Any}(
                Symbol("amount") => self.parseNumber(self.parsePrecision(precision = amountPrecisionStr)),
                Symbol("price") => self.parseNumber(self.parsePrecision(precision = pricePrecisionStr))
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
                    Symbol("min") => self.parseNumber("10"),
                    Symbol("max") => nothing
                )
            ),
            Symbol("created") => nothing,
            Symbol("info") => extend(extraData, market)
        );
        push!(markets, self.safeMarketStructure(market = entry));
        i += 1
    end
    return markets

end
function parseMarket(self::Hyperliquid, market)
    collateralTokenCode = safeString(market, "collateralTokenName");
    quoteId = functions.ccxtruthy((collateralTokenCode == nothing)) ? "USDC" : collateralTokenCode;
    settleId = functions.ccxtruthy((collateralTokenCode == nothing)) ? "USDC" : collateralTokenCode;
    baseName = safeString(market, "name");
    base = self.safeCurrencyCode(baseName);
    if functions.ccxtruthy(base == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing base currency")));
    end
    base = replace(base, ":" => "-");
    quote_var = self.safeCurrencyCode(quoteId);
    baseId = safeString(market, "baseId");
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var);
    contract = true;
    swap = true;
    if functions.ccxtruthy(contract)
        if functions.ccxtruthy(swap)
            symbol = string(symbol, ":", settle);
        end
    end
    fees = self.safeDict(self.fees, "swap", defaultValue = Dict{Symbol, Any}());
    taker = self.safeNumber(fees, "taker");
    maker = self.safeNumber(fees, "maker");
    amountPrecisionStr = safeString(market, "szDecimals");
    amountPrecision = ccxt_parseInt(amountPrecisionStr);
    price = self.safeNumber(market, "markPx", defaultNumber = 0);
    pricePrecision = 0;
    if functions.ccxtruthy(price != nothing)
        pricePrecision = self.calculatePricePrecision(price, amountPrecision, 6);
    end
    pricePrecisionStr = numberToString(pricePrecision);
    isDelisted = self.safeBool(market, "isDelisted");
    active = true;
    if functions.ccxtruthy(isDelisted != nothing)
        active = !functions.ccxtruthy(isDelisted);
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => baseId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("baseName") => baseName,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => nothing,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = amountPrecisionStr)),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = pricePrecisionStr))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => safeInteger(market, "maxLeverage")
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
            Symbol("min") => self.parseNumber("10"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function updateSpotCurrencyCode(self::Hyperliquid, code)
    if functions.ccxtruthy(code == nothing)
            return code
    end
    spotCurrencyMapping = self.safeDict(self.options, "spotCurrencyMapping", defaultValue = Dict{Symbol, Any}());
    return safeString(spotCurrencyMapping, code, code)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.type`::string, optional: wallet type, ['spot', 'swap'], defaults to swap
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
- `params.dex`::string, optional: for hip3 markets, the dex name, eg: 'xyz'
- `params.subAccountAddress`::string, optional: sub account user address
- `params.enableUnifiedMargin`::bool, optional: enable unified margin, CCXT tries to auto-detects this value but you can override it

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Hyperliquid; params=Dict())
    shouldRefresh = @functions.ccxt_and((safeString2(params, "user", "address") != nothing), self.safeBool(params, "enableUnifiedMargin") == nothing);
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchBalance", params);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    isUnifiedEnabled = nothing;
    (isUnifiedEnabled, params) = Base.fetch(self.isUnifiedEnabled("fetchBalance", address = userAddress, shouldRefresh = shouldRefresh, params = params));
    dex = safeString(params, "dex");
    isSpot = @functions.ccxt_and((@functions.ccxt_or((type_var == "spot"), isUnifiedEnabled)), (dex == nothing));
    request = Dict{Symbol, Any}(
        Symbol("type") => functions.ccxtruthy((isSpot)) ? "spotClearinghouseState" : "clearinghouseState",
        Symbol("user") => userAddress
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    balances = self.safeList(response, "balances");
    if functions.ccxtruthy(balances != nothing)
        spotBalances = Dict{Symbol, Any}(
            Symbol("info") => response
        );
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
            balance = get(balances, i + 1, nothing);
            unifiedCode = self.safeCurrencyCode(safeString(balance, "coin"));
            code = functions.ccxtruthy(isSpot) ? self.updateSpotCurrencyCode(unifiedCode) : unifiedCode;
            account = self.account();
            total = safeString(balance, "total");
            used = safeString(balance, "hold");
            account[Symbol("total")] = total;
            account[Symbol("used")] = used;
            if functions.ccxtruthy(code != nothing)
                spotBalances[Symbol(code)] = account;
            end
            i += 1
        end

            return self.safeBalance(spotBalances)
    end
    data = self.safeDict(response, "marginSummary", defaultValue = Dict{Symbol, Any}());
    usdcBalance = Dict{Symbol, Any}(
        Symbol("total") => self.safeNumber(data, "accountValue")
    );
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != nothing), (marginMode == "isolated")))
        usdcBalance[Symbol("free")] = self.safeNumber(response, "withdrawable");
    else
        usdcBalance[Symbol("used")] = self.safeNumber(data, "totalMarginUsed");
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("USDC") => usdcBalance
    );
    timestamp = safeInteger(response, "time");
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Hyperliquid, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => "l2Book",
        Symbol("coin") => functions.ccxtruthy(get(market, Symbol("swap"), nothing)) ? safeString(market, "baseName") : get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    data = self.safeList(response, "levels", defaultValue = []);
    result = Dict{Symbol, Any}(
        Symbol("bids") => self.safeList(data, 0, defaultValue = []),
        Symbol("asks") => self.safeList(data, 1, defaultValue = [])
    );
    timestamp = safeInteger(response, "time");
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "px", amountKey = "sz")

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', by default fetches both
- `params.hip3`::bool, optional: set to true to fetch hip3 markets only

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Hyperliquid; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = [];
    type_var = safeString(params, "type");
    params = omit(params, "type");
    hip3 = false;
    (hip3, params) = self.handleOptionAndParams(params, "fetchTickers", "hip3", defaultValue = false);
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        if functions.ccxtruthy(firstSymbol != nothing)
            market = self.market(firstSymbol);
            if functions.ccxtruthy(self.safeBool(self.safeDict(market, "info"), "hip3"))
                hip3 = true;
            end
        end
    end
    if functions.ccxtruthy(hip3)
        params = omit(params, "hip3");
        response = Base.fetch(self.fetchHip3Markets(params = params));
    elseif functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.fetchSpotMarkets(params = params));
    else
        if functions.ccxtruthy(type_var == "swap")
            response = Base.fetch(self.fetchSwapMarkets(params = params));
        else
            response = Base.fetch(self.fetchMarkets(params = params));
        end

    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        market = get(response, i + 1, nothing);
        info = get(market, Symbol("info"), nothing);
        ticker = self.parseTicker(info, market = market);
        symbol = safeString(ticker, "symbol");
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetch the current funding rate for a symbol - hyperliquid only offers a bulk endpoint, so this filters the result of fetchFundingRates
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Hyperliquid, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    rates = Base.fetch(self.fetchFundingRates(symbols = [get(market, Symbol("symbol"), nothing)], params = params));
    rate = self.safeDict(rates, get(market, Symbol("symbol"), nothing));
    if functions.ccxtruthy(rate == nothing)
        throw(BadSymbol(string(self.id, " fetchFundingRate() could not find a funding rate for ", symbol)));
    end
    return rate

end
"""
retrieves data on all swap markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchFundingRates(self::Hyperliquid; symbols=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "metaAndAssetCtxs"
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    meta = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    universe = self.safeList(meta, "universe", defaultValue = []);
    assetCtxs = self.safeList(response, 1, defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(universe)))
        data = extend(self.safeDict(universe, i, defaultValue = Dict{Symbol, Any}()), self.safeDict(assetCtxs, i, defaultValue = Dict{Symbol, Any}()));
        push!(result, data);
        i += 1
    end
    return self.parseFundingRates(result, symbols = symbols)

end
function parseFundingRate(self::Hyperliquid, info; market=nothing)
    base = safeString(info, "name");
    marketId = self.coinToMarketId(base);
    symbol = self.safeSymbol(marketId, market = market);
    funding = self.safeNumber(info, "funding");
    markPx = self.safeNumber(info, "markPx");
    oraclePx = self.safeNumber(info, "oraclePx");
    fundingTimestamp = (floor(milliseconds() / 60 / 60 / 1000) + 1) * 60 * 60 * 1000;
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPx,
    Symbol("indexPrice") => oraclePx,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => funding,
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "1h"
)

end
function parseTicker(self::Hyperliquid, ticker; market=nothing)
    name = safeString(ticker, "name");
    marketId = self.coinToMarketId(name);
    market = self.safeMarket(marketId = marketId, market = market);
    bidAsk = self.safeList(ticker, "impactPxs");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("previousClose") => self.safeNumber(ticker, "prevDayPx"),
    Symbol("close") => self.safeNumber(ticker, "midPx"),
    Symbol("last") => self.safeNumber(ticker, "price"),
    Symbol("bid") => self.safeNumber(bidAsk, 0),
    Symbol("ask") => self.safeNumber(bidAsk, 1),
    Symbol("quoteVolume") => self.safeNumber(ticker, "dayNtlVlm"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents, support '1m', '15m', '1h', '1d'
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Hyperliquid, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    until = safeInteger(params, "until", milliseconds());
    useTail = since == nothing;
    originalSince = since;
    if functions.ccxtruthy(since == nothing)
        if functions.ccxtruthy(limit != nothing)
            timeframeInMilliseconds = self.parseTimeframe(timeframe) * 1000;
            since = self.sum(until, timeframeInMilliseconds * limit * -1);
            if functions.ccxtruthy(functions.ccxt_lt(since, 0))
                since = 0;
            end
            useTail = false;
        else
            since = 0;
        end
    end
    params = omit(params, ["until"]);
    request = Dict{Symbol, Any}(
        Symbol("type") => "candleSnapshot",
        Symbol("req") => Dict{Symbol, Any}(
            Symbol("coin") => functions.ccxtruthy(get(market, Symbol("swap"), nothing)) ? safeString(market, "baseName") : get(market, Symbol("id"), nothing),
            Symbol("interval") => safeString(self.timeframes, timeframe, timeframe),
            Symbol("startTime") => since,
            Symbol("endTime") => until
        )
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = originalSince, limit = limit, tail = useTail)

end
function parseOHLCV(self::Hyperliquid, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
"""
get the list of most recent trades for a particular symbol
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade
- `params.address`::string, optional: wallet address that made trades
- `params.user`::string, optional: wallet address that made trades
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchTrades(self::Hyperliquid, symbol; since=nothing, limit=nothing, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchTrades", params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("type")] = "userFillsByTime";
        request[Symbol("startTime")] = since;
    else
        request[Symbol("type")] = "userFills";
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    fills = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        fills = response;
    end
    return self.parseTrades(fills, market = market, since = since, limit = limit)

end
function amountToPrecision(self::Hyperliquid, symbol, amount)
    market = self.market(symbol);
    return decimalToPrecision(amount, ROUND, get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing), self.precisionMode, self.paddingMode)

end
function priceToPrecision(self::Hyperliquid, symbol, price)
    market = self.market(symbol);
    priceStr = numberToString(price);
    integerPart = get(split(priceStr, "."), 1, nothing);
    significantDigits = max(5, length(integerPart));
    result = decimalToPrecision(price, ROUND, significantDigits, SIGNIFICANT_DIGITS, self.paddingMode);
    maxDecimals = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? 8 : 6;
    subtractedValue = maxDecimals - precisionFromString(safeString(get(market, Symbol("precision"), nothing), "amount"));
    return decimalToPrecision(result, ROUND, subtractedValue, DECIMAL_PLACES, self.paddingMode)

end
function hashMessage(self::Hyperliquid, message)
    return string("0x", hash(message, keccak, "hex"))

end
function signHash(self::Hyperliquid, hash, privateKey)
    signature = ecdsa(functions.ccxt_slice(hash, -64), functions.ccxt_slice(privateKey, -64), secp256k1, nothing);
    return Dict{Symbol, Any}(
    Symbol("r") => string("0x", get(signature, Symbol("r"), nothing)),
    Symbol("s") => string("0x", get(signature, Symbol("s"), nothing)),
    Symbol("v") => self.sum(27, get(signature, Symbol("v"), nothing))
)

end
function signMessage(self::Hyperliquid, message, privateKey)
    return self.signHash(self.hashMessage(message), functions.ccxt_slice(privateKey, -64))

end
function constructPhantomAgent(self::Hyperliquid, hash; isTestnet=true)
    source = functions.ccxtruthy((isTestnet)) ? "b" : "a";
    return Dict{Symbol, Any}(
    Symbol("source") => source,
    Symbol("connectionId") => hash
)

end
function actionHash(self::Hyperliquid, action, vaultAddress, nonce; expiresAfter=nothing)
    dataBinary = self.packb(action);
    dataHex = self.binaryToBase16(dataBinary);
    data = dataHex;
    data += string("00000", self.intToBase16(nonce));
    if functions.ccxtruthy(vaultAddress == nothing)
        data += "00";
    else
        data += "01";
        data += vaultAddress;
    end
    if functions.ccxtruthy(expiresAfter != nothing)
        data += "00";
        data += string("00000", self.intToBase16(expiresAfter));
    end
    return hash(self.base16ToBinary(data), keccak, "binary")

end
function signL1Action(self::Hyperliquid, action, nonce; vaultAdress=nothing, expiresAfter=nothing)
    hash = self.actionHash(action, vaultAdress, nonce, expiresAfter = expiresAfter);
    isTestnet = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    phantomAgent = self.constructPhantomAgent(hash, isTestnet = isTestnet);
    zeroAddress = safeString(self.options, "zeroAddress");
    chainId = 1337;
    domain = Dict{Symbol, Any}(
        Symbol("chainId") => chainId,
        Symbol("name") => "Exchange",
        Symbol("verifyingContract") => zeroAddress,
        Symbol("version") => "1"
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("Agent") => [Dict{Symbol, Any}(
        Symbol("name") => "source",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "connectionId",
        Symbol("type") => "bytes32"
    )]
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, phantomAgent);
    signature = self.signMessage(msg, self.privateKey);
    return signature

end
function signUserSignedAction(self::Hyperliquid, messageTypes, message)
    zeroAddress = safeString(self.options, "zeroAddress");
    chainId = 421614;
    domain = Dict{Symbol, Any}(
        Symbol("chainId") => chainId,
        Symbol("name") => "HyperliquidSignTransaction",
        Symbol("verifyingContract") => zeroAddress,
        Symbol("version") => "1"
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, message);
    signature = self.signMessage(msg, self.privateKey);
    return signature

end
function buildUsdSendSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:UsdSend") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "destination",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "time",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function buildUsdClassSendSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:UsdClassTransfer") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "toPerp",
        Symbol("type") => "bool"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function buildWithdrawSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:Withdraw") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "destination",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "time",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function buildUserDexAbstractionSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:UserDexAbstraction") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "user",
        Symbol("type") => "address"
    ), Dict{Symbol, Any}(
        Symbol("name") => "enabled",
        Symbol("type") => "bool"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function buildUserAbstractionSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:UserSetAbstraction") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "user",
        Symbol("type") => "address"
    ), Dict{Symbol, Any}(
        Symbol("name") => "abstraction",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function buildApproveBuilderFeeSig(self::Hyperliquid, message)
    messageTypes = Dict{Symbol, Any}(
        Symbol("HyperliquidTransaction:ApproveBuilderFee") => [Dict{Symbol, Any}(
        Symbol("name") => "hyperliquidChain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "maxFeeRate",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "builder",
        Symbol("type") => "address"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    return self.signUserSignedAction(messageTypes, message)

end
function setRef(self::Hyperliquid, )
    if functions.ccxtruthy(self.safeBool(self.options, "refSet", defaultValue = false))
            return true
    end
    self.options[Symbol("refSet")] = true;
    action = Dict{Symbol, Any}(
        Symbol("type") => "setReferrer",
        Symbol("code") => safeString(self.options, "ref", "CCXT1")
    );
    nonce = milliseconds();
    signature = self.signL1Action(action, nonce);
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    response = nothing;
    try
        response = Base.fetch(self.privatePostExchange(request));
        return response
    catch e
        response = nothing;

    end
    return response

end
function approveBuilderFee(self::Hyperliquid, builder, maxFeeRate)
    nonce = milliseconds();
    isSandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    payload = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => functions.ccxtruthy(isSandboxMode) ? "Testnet" : "Mainnet",
        Symbol("maxFeeRate") => maxFeeRate,
        Symbol("builder") => builder,
        Symbol("nonce") => nonce
    );
    sig = self.buildApproveBuilderFeeSig(payload);
    action = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => get(payload, Symbol("hyperliquidChain"), nothing),
        Symbol("signatureChainId") => "0x66eee",
        Symbol("maxFeeRate") => get(payload, Symbol("maxFeeRate"), nothing),
        Symbol("builder") => get(payload, Symbol("builder"), nothing),
        Symbol("nonce") => nonce,
        Symbol("type") => "approveBuilderFee"
    );
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => sig,
        Symbol("vaultAddress") => nothing
    );
    return Base.fetch(self.privatePostExchange(request))

end
function initializeClient(self::Hyperliquid, )
    try
        Base.fetch(asyncmap(Base.fetch, [self.handleBuilderFeeApproval(), self.setRef(), self.isUnifiedEnabled("fetchBalance", address = nothing, shouldRefresh = false, params = Dict{Symbol, Any}())]));
    catch e
        return false

    end
    return true

end
function handleBuilderFeeApproval(self::Hyperliquid, )
    buildFee = self.safeBool(self.options, "builderFee", defaultValue = true);
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", defaultValue = false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    try
        builder = safeString(self.options, "builder", "0x6530512A6c89C7cfCEbC3BA7fcD9aDa5f30827a6");
        maxFeeRate = safeString(self.options, "feeRate", "0.01%");
        if functions.ccxtruthy(!functions.ccxtruthy(buildFee))
            maxFeeRate = "0%";
        end
        Base.fetch(self.approveBuilderFee(builder, maxFeeRate));
        self.options[Symbol("approvedBuilderFee")] = true;
    catch e
        self.options[Symbol("builderFee")] = false;

    end
    return true

end
"""
returns enableUnifiedMargin so the user can check if unified account is enabled
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state

# Arguments
- `method`::string: the method for which we want to check if unified margin is enabled, this is used to check options for specific methods (e.g. fetchBalance can have a specific option to enable unified margin)
- `address`::string, optional: the wallet address to query; defaults to the configured walletAddress
- `shouldRefresh`::bool, optional: force a fresh request instead of returning the cached value
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- enableUnifiedMargin
"""
function isUnifiedEnabled(self::Hyperliquid, method; address=nothing, shouldRefresh=false, params=Dict())
    userAddress = nothing;
    if functions.ccxtruthy(address != nothing)
        userAddress = address;
    else
        (userAddress, params) = self.handlePublicAddress("isUnifiedEnabled", params);
    end
    enableUnifiedMargin = nothing;
    (enableUnifiedMargin, params) = self.handleOptionAndParams(params, method, "enableUnifiedMargin");
    if functions.ccxtruthy(@functions.ccxt_or(enableUnifiedMargin == nothing, shouldRefresh))
        request = Dict{Symbol, Any}(
            Symbol("type") => "userAbstraction",
            Symbol("user") => userAddress
        );
        response = nothing;
        try
            rawResponse = Base.fetch(self.publicPostInfo(extend(request, params)));
            if functions.ccxtruthy(isa(rawResponse, AbstractString))
                response = rawResponse;
            end
        catch e
            if functions.ccxtruthy(isa(e, InvalidProxySettings))
                throw(e);
            end
            response = nothing;

        end
        if functions.ccxtruthy(response != nothing)
            response = replace(response, "\"" => "");
            response = replace(response, "\"" => "");
            enableUnifiedMargin = response == "unifiedAccount";
        end
        self.options[Symbol("enableUnifiedMargin")] = enableUnifiedMargin;
    end
    return [enableUnifiedMargin, params]

end
"""
set user abstraction mode
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction

# Arguments
- `abstraction`::string: one of the strings ["disabled", "unifiedAccount", "portfolioMargin"],
- `params`::object, optional:
- `params.type`::string, optional: 'userSetAbstraction' or 'agentSetAbstraction' default is 'userSetAbstraction'

# Returns
- dictionary response from the exchange
"""
function setUserAbstraction(self::Hyperliquid, abstraction; params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("setUserAbstraction", params);
    nonce = milliseconds();
    isSandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    type_var = safeString(params, "type", "userSetAbstraction");
    params = omit(params, "type");
    payload = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => functions.ccxtruthy(isSandboxMode) ? "Testnet" : "Mainnet",
        Symbol("user") => userAddress,
        Symbol("abstraction") => abstraction,
        Symbol("nonce") => nonce
    );
    sig = self.buildUserAbstractionSig(payload);
    action = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => get(payload, Symbol("hyperliquidChain"), nothing),
        Symbol("signatureChainId") => "0x66eee",
        Symbol("abstraction") => get(payload, Symbol("abstraction"), nothing),
        Symbol("user") => get(payload, Symbol("user"), nothing),
        Symbol("nonce") => nonce,
        Symbol("type") => type_var
    );
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => sig,
        Symbol("vaultAddress") => nothing
    );
    return Base.fetch(self.privatePostExchange(request))

end
"""
If set, actions on HIP-3 perps will automatically transfer collateral from validator-operated USDC perps balance for HIP-3 DEXs where USDC is the collateral token, and spot otherwise

# Arguments
- `enabled`::bool: whether to enable user dex abstraction
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'userDexAbstraction' or 'agentEnableDexAbstraction' default is 'userDexAbstraction'

# Returns
- dictionary response from the exchange
"""
function enableUserDexAbstraction(self::Hyperliquid, enabled; params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("enableUserDexAbstraction", params);
    nonce = milliseconds();
    isSandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    type_var = safeString(params, "type", "userDexAbstraction");
    params = omit(params, "type");
    payload = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => functions.ccxtruthy(isSandboxMode) ? "Testnet" : "Mainnet",
        Symbol("user") => userAddress,
        Symbol("enabled") => enabled,
        Symbol("nonce") => nonce
    );
    sig = self.buildUserDexAbstractionSig(payload);
    action = Dict{Symbol, Any}(
        Symbol("hyperliquidChain") => get(payload, Symbol("hyperliquidChain"), nothing),
        Symbol("signatureChainId") => "0x66eee",
        Symbol("enabled") => get(payload, Symbol("enabled"), nothing),
        Symbol("user") => get(payload, Symbol("user"), nothing),
        Symbol("nonce") => nonce,
        Symbol("type") => type_var
    );
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => sig,
        Symbol("vaultAddress") => nothing
    );
    return Base.fetch(self.privatePostExchange(request))

end
"""
set agent abstraction mode

# Arguments
- `abstraction`::string: one of the strings ["i", "u", "p"] where "i" is "disabled", "u" is "unifiedAccount", and "p" is "portfolioMargin"
- `params`::object, optional:

# Returns
- dictionary response from the exchange
"""
function setAgentAbstraction(self::Hyperliquid, abstraction; params=Dict())
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    action = Dict{Symbol, Any}(
        Symbol("type") => "agentSetAbstraction",
        Symbol("abstraction") => abstraction
    );
    signature = self.signL1Action(action, nonce);
    request[Symbol("action")] = action;
    request[Symbol("signature")] = signature;
    response = Base.fetch(self.privatePostExchange(extend(request, params)));
    return response

end
"""
create a trade order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'Gtc', 'Ioc', 'Alo'
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.slippage`::string, optional: the slippage for market order
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Hyperliquid, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (order, globalParams) = self.parseCreateEditOrderArgs(nothing, symbol, type_var, side, amount, price = price, params = params);
    orders = Base.fetch(self.createOrders([order], params = globalParams));
    return get(orders, 1, nothing)

end
"""
create a trade order that is executed as a TWAP order over a specified duration.

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `duration`::int: the duration of the TWAP order in milliseconds
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.randomize`::bool, optional: whether to randomize the time intervals of the TWAP order slices (default is false, meaning equal intervals)
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.expiresAfter`::int, optional: time in ms after which the twap order expires
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createTwapOrder(self::Hyperliquid, symbol, side, amount, duration; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    market = self.market(symbol);
    nonce = milliseconds();
    isBuy = (side == "BUY");
    vaultAddress = nothing;
    randomize = self.safeBool(params, "randomize", defaultValue = false);
    params = omit(params, "randomize");
    (vaultAddress, params) = self.handleOptionAndParams(params, "createOrder", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    durationMins = floor(duration / 1000 / 60);
    orderObj = Dict{Symbol, Any}(
        Symbol("a") => self.parseToInt(get(market, Symbol("baseId"), nothing)),
        Symbol("b") => isBuy,
        Symbol("s") => self.amountToPrecision(symbol, amount),
        Symbol("r") => self.safeBool(params, "reduceOnly", defaultValue = false),
        Symbol("m") => durationMins,
        Symbol("t") => randomize
    );
    orderAction = Dict{Symbol, Any}(
        Symbol("type") => "twapOrder",
        Symbol("twap") => orderObj
    );
    signature = self.signL1Action(orderAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => orderAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    expiresAfter = safeInteger(params, "expiresAfter");
    if functions.ccxtruthy(expiresAfter != nothing)
        request[Symbol("expiresAfter")] = expiresAfter;
        params = omit(params, "expiresAfter");
    end
    response = Base.fetch(self.privatePostExchange(request));
    responseObj = self.safeDict(response, "response", defaultValue = Dict{Symbol, Any}());
    data = self.safeDict(responseObj, "data", defaultValue = Dict{Symbol, Any}());
    status = self.safeDict(data, "status", defaultValue = Dict{Symbol, Any}());
    running = self.safeDict(status, "running", defaultValue = Dict{Symbol, Any}());
    orderId = safeString(running, "twapId");
    return self.parseOrder(Dict{Symbol, Any}(
    Symbol("status") => "running",
    Symbol("oid") => orderId
), market = market)

end
"""
create a list of trade orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Hyperliquid, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    request = self.createOrdersRequest(orders, params = params);
    response = Base.fetch(self.privatePostExchange(request));
    responseObj = self.safeDict(response, "response", defaultValue = Dict{Symbol, Any}());
    data = self.safeDict(responseObj, "data", defaultValue = Dict{Symbol, Any}());
    statuses = self.safeList(data, "statuses", defaultValue = []);
    ordersToBeParsed = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(statuses)))
        order = get(statuses, i + 1, nothing);
        if functions.ccxtruthy(order == "waitingForTrigger")
                        push!(ordersToBeParsed, Dict{Symbol, Any}(
    Symbol("status") => order
));
        else
            push!(ordersToBeParsed, order);
        end
        i += 1
    end
    return self.parseOrders(ordersToBeParsed)

end
function createOrderRequest(self::Hyperliquid, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    type_var = uppercase(type_var);
    side = uppercase(side);
    isMarket = (type_var == "MARKET");
    isBuy = (side == "BUY");
    clientOrderId = safeString2(params, "clientOrderId", "client_id");
    slippage = safeString(params, "slippage");
    defaultTimeInForce = functions.ccxtruthy((isMarket)) ? "ioc" : "gtc";
    postOnly = self.safeBool(params, "postOnly", defaultValue = false);
    if functions.ccxtruthy(postOnly)
        defaultTimeInForce = "alo";
    end
    timeInForce = safeStringLower(params, "timeInForce", defaultTimeInForce);
    timeInForce = capitalize(timeInForce);
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeString(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isTrigger = (@functions.ccxt_or(stopLossPrice, takeProfitPrice));
    px = nothing;
    if functions.ccxtruthy(isMarket)
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, "  market orders require price to calculate the max slippage price. Default slippage can be set in options (default is 5%).")));
        end
        px = functions.ccxtruthy((isBuy)) ? stringMul(price, stringAdd("1", slippage)) : stringMul(price, stringSub("1", slippage));
        px = self.priceToPrecision(symbol, px);
    else
        px = self.priceToPrecision(symbol, price);
    end
    sz = self.amountToPrecision(symbol, amount);
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    orderType = Dict{Symbol, Any}();
    if functions.ccxtruthy(isTrigger)
        isTp = false;
        if functions.ccxtruthy(takeProfitPrice != nothing)
            triggerPrice = self.priceToPrecision(symbol, takeProfitPrice);
            isTp = true;
        else
            triggerPrice = self.priceToPrecision(symbol, stopLossPrice);
        end
        tpSlType = functions.ccxtruthy((isTp)) ? "tp" : "sl";
        orderType[Symbol("trigger")] = Dict{Symbol, Any}(
            Symbol("isMarket") => isMarket,
            Symbol("triggerPx") => triggerPrice,
            Symbol("tpsl") => tpSlType
        );
    else
        orderType[Symbol("limit")] = Dict{Symbol, Any}(
            Symbol("tif") => timeInForce
        );
    end
    params = omit(params, ["clientOrderId", "slippage", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice", "timeInForce", "client_id", "reduceOnly", "postOnly"]);
    orderObj = Dict{Symbol, Any}(
        Symbol("a") => self.parseToInt(get(market, Symbol("baseId"), nothing)),
        Symbol("b") => isBuy,
        Symbol("p") => px,
        Symbol("s") => sz,
        Symbol("r") => reduceOnly,
        Symbol("t") => orderType
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        orderObj[Symbol("c")] = clientOrderId;
    end
    return orderObj

end
function createOrdersRequest(self::Hyperliquid, orders; params=Dict())
    self.checkRequiredCredentials();
    defaultSlippage = safeString(self.options, "defaultSlippage");
    defaultSlippage = safeString(params, "slippage", defaultSlippage);
    hasClientOrderId = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        clientOrderId = safeString2(orderParams, "clientOrderId", "client_id");
        if functions.ccxtruthy(clientOrderId != nothing)
            hasClientOrderId = true;
        end
        i += 1
    end
    if functions.ccxtruthy(hasClientOrderId)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
            rawOrder = get(orders, i + 1, nothing);
            orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
            clientOrderId = safeString2(orderParams, "clientOrderId", "client_id");
            if functions.ccxtruthy(clientOrderId == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrders() all orders must have clientOrderId if at least one has a clientOrderId")));
            end
            i += 1
        end

    end
    params = omit(params, ["slippage", "clientOrderId", "client_id", "slippage", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice", "timeInForce"]);
    nonce = milliseconds();
    orderReq = [];
    grouping = "na";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        market = self.market(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        type_var = safeStringUpper(rawOrder, "type");
        side = safeStringUpper(rawOrder, "side");
        amount = safeString(rawOrder, "amount");
        price = safeString(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        slippage = safeString(orderParams, "slippage", defaultSlippage);
        orderParams[Symbol("slippage")] = slippage;
        stopLoss = safeValue(orderParams, "stopLoss");
        takeProfit = safeValue(orderParams, "takeProfit");
        hasStopLoss = (stopLoss != nothing);
        hasTakeProfit = (takeProfit != nothing);
        orderParams = omit(orderParams, ["stopLoss", "takeProfit"]);
        mainOrderObj = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = orderParams);
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            stopLossOrderTriggerPrice = safeString2(stopLoss, "triggerPrice", "stopPrice");
            stopLossOrderType = safeString(stopLoss, "type", "limit");
            stopLossOrderLimitPrice = safeString2(stopLoss, "price", "stopLossPrice", stopLossOrderTriggerPrice);
            takeProfitOrderTriggerPrice = safeString2(takeProfit, "triggerPrice", "stopPrice");
            takeProfitOrderType = safeString(takeProfit, "type", "limit");
            takeProfitOrderLimitPrice = safeString2(takeProfit, "price", "takeProfitPrice", takeProfitOrderTriggerPrice);
            grouping = safeString(orderParams, "grouping", "normalTpsl");
            if functions.ccxtruthy(grouping == "positionTpsl")
                amount = "0";
                stopLossOrderType = "market";
                takeProfitOrderType = "market";
            elseif functions.ccxtruthy(grouping == "normalTpsl")
                push!(orderReq, mainOrderObj);
            else
                throw(NotSupported(string(self.id, " only support grouping normalTpsl and positionTpsl.")));
            end
            orderParams = omit(orderParams, ["stopLoss", "takeProfit", "grouping"]);
            triggerOrderSide = "";
            if functions.ccxtruthy(side == "BUY")
                triggerOrderSide = "sell";
            else
                triggerOrderSide = "buy";
            end
            if functions.ccxtruthy(hasTakeProfit)
                orderObj = self.createOrderRequest(symbol, takeProfitOrderType, triggerOrderSide, amount, price = takeProfitOrderLimitPrice, params = extend(orderParams, Dict{Symbol, Any}(
                    Symbol("takeProfitPrice") => takeProfitOrderTriggerPrice,
                    Symbol("reduceOnly") => true
                )));
                                push!(orderReq, orderObj);
            end
            if functions.ccxtruthy(hasStopLoss)
                orderObj = self.createOrderRequest(symbol, stopLossOrderType, triggerOrderSide, amount, price = stopLossOrderLimitPrice, params = extend(orderParams, Dict{Symbol, Any}(
                    Symbol("stopLossPrice") => stopLossOrderTriggerPrice,
                    Symbol("reduceOnly") => true
                )));
                                push!(orderReq, orderObj);
            end
        else
            push!(orderReq, mainOrderObj);
        end
        i += 1
    end
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "createOrder", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    orderAction = Dict{Symbol, Any}(
        Symbol("type") => "order",
        Symbol("orders") => orderReq,
        Symbol("grouping") => grouping
    );
    if functions.ccxtruthy(self.safeBool(self.options, "approvedBuilderFee", defaultValue = false))
        wallet = safeStringLower(self.options, "builder", "0x6530512A6c89C7cfCEbC3BA7fcD9aDa5f30827a6");
        feeInt = safeInteger(self.options, "feeInt", 10);
        if functions.ccxtruthy(!functions.ccxtruthy(self.safeBool(self.options, "builderFee", defaultValue = true)))
            feeInt = 0;
        end
        orderAction[Symbol("builder")] = Dict{Symbol, Any}(
            Symbol("b") => wallet,
            Symbol("f") => feeInt
        );
    end
    signature = self.signL1Action(orderAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => orderAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    return request

end
"""
cancels an open order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address
- `params.twap`::bool, optional: whether the order to cancel is a twap order, (default is false)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Hyperliquid, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.safeBool(params, "twap", defaultValue = false))
        params = omit(params, "twap");
            return Base.fetch(self.cancelTwapOrder(id, symbol = symbol, params = params))
    end
    orders = Base.fetch(self.cancelOrders([id], symbol = symbol, params = params));
    return self.safeDict(orders, 0)

end
"""
cancel multiple orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::array, optional: client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Hyperliquid, ids; symbol=nothing, params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    request = self.cancelOrdersRequest(ids, symbol = symbol, params = params);
    response = Base.fetch(self.privatePostExchange(request));
    innerResponse = self.safeDict(response, "response");
    data = self.safeDict(innerResponse, "data");
    statuses = self.safeList(data, "statuses", defaultValue = []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(statuses)))
        status = get(statuses, i + 1, nothing);
        push!(orders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => status,
    Symbol("status") => status
)));
        i += 1
    end
    return orders

end
"""
cancels a running twap order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.expiresAfter`::int, optional: time in ms after which the twap order expires
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelTwapOrder(self::Hyperliquid, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelTwapOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "cancelTwapOrder", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    action = Dict{Symbol, Any}(
        Symbol("type") => "twapCancel",
        Symbol("a") => self.parseToInt(get(market, Symbol("baseId"), nothing)),
        Symbol("t") => self.parseToNumeric(id)
    );
    nonce = milliseconds();
    signature = self.signL1Action(action, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    expiresAfter = safeInteger(params, "expiresAfter");
    if functions.ccxtruthy(expiresAfter != nothing)
        request[Symbol("expiresAfter")] = expiresAfter;
        params = omit(params, "expiresAfter");
    end
    response = Base.fetch(self.privatePostExchange(request));
    responseObj = self.safeDict(response, "response", defaultValue = Dict{Symbol, Any}());
    data = self.safeDict(responseObj, "data", defaultValue = Dict{Symbol, Any}());
    status = safeString(data, "status");
    return self.parseOrder(Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("oid") => id
), market = market)

end
function cancelOrdersRequest(self::Hyperliquid, ids; symbol=nothing, params=Dict())
    market = self.market(symbol);
    clientOrderId = safeValue2(params, "clientOrderId", "client_id");
    params = omit(params, ["clientOrderId", "client_id"]);
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    cancelReq = [];
    cancelAction = Dict{Symbol, Any}(
        Symbol("type") => "",
        Symbol("cancels") => []
    );
    baseId = self.parseToNumeric(get(market, Symbol("baseId"), nothing));
    if functions.ccxtruthy(clientOrderId != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(clientOrderId)))
            clientOrderId = [clientOrderId];
        end
        cancelAction[Symbol("type")] = "cancelByCloid";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderId)))
            push!(cancelReq, Dict{Symbol, Any}(
    Symbol("asset") => baseId,
    Symbol("cloid") => get(clientOrderId, i + 1, nothing)
));
            i += 1
        end

    else
        cancelAction[Symbol("type")] = "cancel";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            o = self.parseToNumeric(get(ids, i + 1, nothing));
            push!(cancelReq, Dict{Symbol, Any}(
    Symbol("a") => baseId,
    Symbol("o") => o
));
            i += 1
        end
    end
    cancelAction[Symbol("cancels")] = cancelReq;
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "cancelOrders", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(cancelAction, nonce, vaultAdress = vaultAddress);
    request[Symbol("action")] = cancelAction;
    request[Symbol("signature")] = signature;
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    return request

end
"""
cancel multiple orders for multiple symbols
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `orders`::array: each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrdersForSymbols(self::Hyperliquid, orders; params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    cancelReq = [];
    cancelAction = Dict{Symbol, Any}(
        Symbol("type") => "",
        Symbol("cancels") => []
    );
    cancelByCloid = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        clientOrderId = safeString(order, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            cancelByCloid = true;
        end
        id = safeString(order, "id");
        symbol = safeString(order, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrdersForSymbols() requires a symbol argument in each order")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(id != nothing, cancelByCloid))
            throw(BadRequest(string(self.id, " cancelOrdersForSymbols() all orders must have either id or clientOrderId")));
        end
        assetKey = functions.ccxtruthy(cancelByCloid) ? "asset" : "a";
        idKey = functions.ccxtruthy(cancelByCloid) ? "cloid" : "o";
        market = self.market(symbol);
        cancelObj = Dict{Symbol, Any}();
        cancelObj[Symbol(assetKey)] = self.parseToNumeric(get(market, Symbol("baseId"), nothing));
        cancelObj[Symbol(idKey)] = functions.ccxtruthy(cancelByCloid) ? clientOrderId : self.parseToNumeric(id);
        push!(cancelReq, cancelObj);
        i += 1
    end
    cancelAction[Symbol("type")] = functions.ccxtruthy(cancelByCloid) ? "cancelByCloid" : "cancel";
    cancelAction[Symbol("cancels")] = cancelReq;
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "cancelOrdersForSymbols", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(cancelAction, nonce, vaultAdress = vaultAddress);
    request[Symbol("action")] = cancelAction;
    request[Symbol("signature")] = signature;
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    response = Base.fetch(self.privatePostExchange(request));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
dead man's switch, cancel all orders after the given timeout

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Hyperliquid, timeout; params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    params = omit(params, ["clientOrderId", "client_id"]);
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    cancelAction = Dict{Symbol, Any}(
        Symbol("type") => "scheduleCancel",
        Symbol("time") => nonce + timeout
    );
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "cancelAllOrdersAfter", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(cancelAction, nonce, vaultAdress = vaultAddress);
    request[Symbol("action")] = cancelAction;
    request[Symbol("signature")] = signature;
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    response = Base.fetch(self.privatePostExchange(request));
    return response

end
function editOrdersRequest(self::Hyperliquid, orders; params=Dict())
    self.checkRequiredCredentials();
    hasClientOrderId = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        clientOrderId = safeString2(orderParams, "clientOrderId", "client_id");
        if functions.ccxtruthy(clientOrderId != nothing)
            hasClientOrderId = true;
        end
        i += 1
    end
    if functions.ccxtruthy(hasClientOrderId)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
            rawOrder = get(orders, i + 1, nothing);
            orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
            clientOrderId = safeString2(orderParams, "clientOrderId", "client_id");
            if functions.ccxtruthy(clientOrderId == nothing)
                throw(ArgumentsRequired(string(self.id, " editOrders() all orders must have clientOrderId if at least one has a clientOrderId")));
            end
            i += 1
        end

    end
    params = omit(params, ["slippage", "clientOrderId", "client_id", "slippage", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice", "timeInForce"]);
    modifies = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        id = safeString(rawOrder, "id");
        marketId = safeString(rawOrder, "symbol");
        market = self.market(marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        type_var = safeStringUpper(rawOrder, "type");
        isMarket = (type_var == "MARKET");
        side = safeStringUpper(rawOrder, "side");
        isBuy = (side == "BUY");
        amount = safeString(rawOrder, "amount");
        price = safeString(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        defaultSlippage = safeString(self.options, "defaultSlippage");
        slippage = safeString(orderParams, "slippage", defaultSlippage);
        defaultTimeInForce = functions.ccxtruthy((isMarket)) ? "ioc" : "gtc";
        postOnly = self.safeBool(orderParams, "postOnly", defaultValue = false);
        if functions.ccxtruthy(postOnly)
            defaultTimeInForce = "alo";
        end
        timeInForce = safeStringLower(orderParams, "timeInForce", defaultTimeInForce);
        timeInForce = capitalize(timeInForce);
        clientOrderId = safeString2(orderParams, "clientOrderId", "client_id");
        triggerPrice = safeString2(orderParams, "triggerPrice", "stopPrice");
        stopLossPrice = safeString(orderParams, "stopLossPrice", triggerPrice);
        takeProfitPrice = safeString(orderParams, "takeProfitPrice");
        isTrigger = (@functions.ccxt_or(stopLossPrice, takeProfitPrice));
        reduceOnly = self.safeBool(orderParams, "reduceOnly", defaultValue = false);
        orderParams = omit(orderParams, ["slippage", "timeInForce", "triggerPrice", "stopLossPrice", "takeProfitPrice", "clientOrderId", "client_id", "postOnly", "reduceOnly"]);
        px = numberToString(price);
        if functions.ccxtruthy(isMarket)
            px = functions.ccxtruthy((isBuy)) ? stringMul(px, stringAdd("1", slippage)) : stringMul(px, stringSub("1", slippage));
            px = self.priceToPrecision(symbol, px);
        else
            px = self.priceToPrecision(symbol, px);
        end
        sz = self.amountToPrecision(symbol, amount);
        orderType = Dict{Symbol, Any}();
        if functions.ccxtruthy(isTrigger)
            isTp = false;
            if functions.ccxtruthy(takeProfitPrice != nothing)
                triggerPrice = self.priceToPrecision(symbol, takeProfitPrice);
                isTp = true;
            else
                triggerPrice = self.priceToPrecision(symbol, stopLossPrice);
            end
            tpSlType = functions.ccxtruthy((isTp)) ? "tp" : "sl";
            orderType[Symbol("trigger")] = Dict{Symbol, Any}(
                Symbol("isMarket") => isMarket,
                Symbol("triggerPx") => triggerPrice,
                Symbol("tpsl") => tpSlType
            );
        else
            orderType[Symbol("limit")] = Dict{Symbol, Any}(
                Symbol("tif") => timeInForce
            );
        end
        if functions.ccxtruthy(triggerPrice == nothing)
            triggerPrice = "0";
        end
        orderReq = Dict{Symbol, Any}(
            Symbol("a") => self.parseToInt(get(market, Symbol("baseId"), nothing)),
            Symbol("b") => isBuy,
            Symbol("p") => px,
            Symbol("s") => sz,
            Symbol("r") => reduceOnly,
            Symbol("t") => orderType
        );
        if functions.ccxtruthy(clientOrderId != nothing)
            orderReq[Symbol("c")] = clientOrderId;
        end
        modifyReq = Dict{Symbol, Any}(
            Symbol("oid") => self.parseToInt(id),
            Symbol("order") => orderReq
        );
        push!(modifies, modifyReq);
        i += 1
    end
    nonce = milliseconds();
    modifyAction = Dict{Symbol, Any}(
        Symbol("type") => "batchModify",
        Symbol("modifies") => modifies
    );
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "editOrder", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(modifyAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => modifyAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    return request

end
"""
edit a trade order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'Gtc', 'Ioc', 'Alo'
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Hyperliquid, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an id argument")));
    end
    (order, globalParams) = self.parseCreateEditOrderArgs(id, symbol, type_var, side, amount, price = price, params = params);
    orders = Base.fetch(self.editOrders([order], params = globalParams));
    return get(orders, 1, nothing)

end
"""
edit a list of trade orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrders(self::Hyperliquid, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.initializeClient());
    request = self.editOrdersRequest(orders, params = params);
    response = Base.fetch(self.privatePostExchange(request));
    responseObject = self.safeDict(response, "response", defaultValue = Dict{Symbol, Any}());
    dataObject = self.safeDict(responseObject, "data", defaultValue = Dict{Symbol, Any}());
    statuses = self.safeList(dataObject, "statuses", defaultValue = []);
    return self.parseOrders(statuses)

end
"""
creates a value

# Arguments
- `name`::string: The name of the vault
- `description`::string: The description of the vault
- `initialUsd`::float: The initialUsd of the vault
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
function createVault(self::Hyperliquid, name, description, initialUsd; params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    usd = self.parseToInt(stringMul(numberToString(initialUsd), "1000000"));
    action = Dict{Symbol, Any}(
        Symbol("type") => "createVault",
        Symbol("name") => name,
        Symbol("description") => description,
        Symbol("initialUsd") => usd,
        Symbol("nonce") => nonce
    );
    signature = self.signL1Action(action, nonce);
    request[Symbol("action")] = action;
    request[Symbol("signature")] = signature;
    response = Base.fetch(self.privatePostExchange(extend(request, params)));
    return response

end
"""
fetches historical funding rate prices
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => "fundingHistory",
        Symbol("coin") => safeString(market, "baseName")
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    else
        maxLimit = functions.ccxtruthy((limit == nothing)) ? 500 : limit;
        request[Symbol("startTime")] = milliseconds() - maxLimit * 60 * 60 * 1000;
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    result = [];
    fundings = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        fundings = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fundings)))
        entry = get(fundings, i + 1, nothing);
        timestamp = safeInteger(entry, "time");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function getDexFromHip3Symbol(self::Hyperliquid, market)
    baseName = safeString(market, "baseName", "");
    part = split(baseName, ":");
    partsLength = length(part);
    if functions.ccxtruthy(functions.ccxt_gt(partsLength, 1))
            return safeString(part, 0)
    end
    return nothing

end
"""
fetch all unfilled currently open orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.method`::string, optional: 'openOrders' or 'frontendOpenOrders' default is 'frontendOpenOrders'
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name. default is null

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchOpenOrders", params);
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "method", defaultValue = "frontendOpenOrders");
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => method,
        Symbol("user") => userAddress
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        dexName = self.getDexFromHip3Symbol(market);
        if functions.ccxtruthy(dexName != nothing)
            request[Symbol("dex")] = dexName;
        end
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    orderWithStatus = [];
    rawOrders = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        rawOrders = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawOrders)))
        order = get(rawOrders, i + 1, nothing);
        extendOrder = Dict{Symbol, Any}();
        if functions.ccxtruthy(safeString(order, "status") == nothing)
            extendOrder[Symbol("ccxtStatus")] = "open";
        end
        push!(orderWithStatus, extend(order, extendOrder));
        i += 1
    end
    return self.parseOrders(orderWithStatus, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently closed orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = nothing, limit = nothing, params = params));
    closedOrders = self.filterByArray(orders, "status", values = ["closed"], indexed = false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol = symbol, since = since, limit = limit)

end
"""
fetch all canceled orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = nothing, limit = nothing, params = params));
    closedOrders = self.filterByArray(orders, "status", values = ["canceled"], indexed = false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol = symbol, since = since, limit = limit)

end
"""
fetch all closed and canceled orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = nothing, limit = nothing, params = params));
    closedOrders = self.filterByArray(orders, "status", values = ["canceled", "closed", "rejected"], indexed = false);
    return self.filterBySymbolSinceLimit(closedOrders, symbol = symbol, since = since, limit = limit)

end
"""
fetch all orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name. default is null

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchOrders", params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("type") => "historicalOrders",
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        dexName = self.getDexFromHip3Symbol(market);
        if functions.ccxtruthy(dexName != nothing)
            request[Symbol("dex")] = dexName;
        end
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    deduplicatedByOid = Dict{Symbol, Any}();
    historicalOrders = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        historicalOrders = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(historicalOrders)))
        rawOrder = get(historicalOrders, i + 1, nothing);
        entry = self.safeDict(rawOrder, "order");
        if functions.ccxtruthy(entry == nothing)
            entry = rawOrder;
        end
        oid = safeString(entry, "oid");
        if functions.ccxtruthy(oid != nothing)
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(oid, deduplicatedByOid))))
                deduplicatedByOid[Symbol(oid)] = rawOrder;
            else
                existingTimestamp = safeInteger(get(deduplicatedByOid, Symbol(oid), nothing), "statusTimestamp");
                currentTimestamp = safeInteger(rawOrder, "statusTimestamp");
                if functions.ccxtruthy(@functions.ccxt_and(currentTimestamp != nothing, (@functions.ccxt_or(existingTimestamp == nothing, functions.ccxt_gt(currentTimestamp, existingTimestamp)))))
                    deduplicatedByOid[Symbol(oid)] = rawOrder;
                end
            end
        end
        i += 1
    end
    deduplicated = objectValues(deduplicatedByOid);
    return self.parseOrders(deduplicated, market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Hyperliquid, id; symbol=nothing, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchOrder", params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    clientOrderId = safeString(params, "clientOrderId");
    request = Dict{Symbol, Any}(
        Symbol("type") => "orderStatus",
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("oid")] = clientOrderId;
    else
        isClientOrderId = functions.ccxt_ge(length(id), 34);
        request[Symbol("oid")] = functions.ccxtruthy(isClientOrderId) ? id : self.parseToNumeric(id);
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    data = self.safeDict(response, "order");
    return self.parseOrder(data, market = market)

end
function parseOrder(self::Hyperliquid, order; market=nothing)
    error = safeString(order, "error");
    if functions.ccxtruthy(error != nothing)
        finalOrder = order;
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => finalOrder,
    Symbol("status") => "rejected"
))
    end
    entry = self.safeDictN(order, ["order", "resting", "filled"]);
    if functions.ccxtruthy(entry == nothing)
        entry = order;
    end
    filled = self.safeDict(order, "filled", defaultValue = Dict{Symbol, Any}());
    coin = safeString(entry, "coin");
    marketId = nothing;
    if functions.ccxtruthy(coin != nothing)
        marketId = self.coinToMarketId(coin);
    end
    if functions.ccxtruthy(safeString(entry, "id") == nothing)
        market = self.safeMarket(marketId = marketId);
    else
        market = self.safeMarket(marketId = marketId, market = market);
    end
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(entry, "timestamp");
    status = safeString2(order, "status", "ccxtStatus");
    order = omit(order, ["ccxtStatus"]);
    side = safeString(entry, "side");
    if functions.ccxtruthy(side != nothing)
        side = functions.ccxtruthy((side == "A")) ? "sell" : "buy";
    end
    totalAmount = safeString2(entry, "origSz", "totalSz");
    remaining = safeString(entry, "sz");
    tif = safeStringUpper(entry, "tif");
    postOnly = nothing;
    if functions.ccxtruthy(tif != nothing)
        postOnly = (tif == "ALO");
    end
    triggerPx = functions.ccxtruthy(self.safeBool(entry, "isTrigger")) ? self.safeNumber(entry, "triggerPx") : nothing;
    orderTypeRaw = safeStringLower(entry, "orderType", "");
    stopLossPrice = nothing;
    takeProfitPrice = nothing;
    if functions.ccxtruthy(triggerPx != nothing)
        if functions.ccxtruthy(findfirst("stop", orderTypeRaw) !== nothing)
            stopLossPrice = triggerPx;
        elseif functions.ccxtruthy(findfirst("take profit", orderTypeRaw) !== nothing)
            takeProfitPrice = triggerPx;
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(entry, "oid"),
    Symbol("clientOrderId") => safeString(entry, "cloid"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "statusTimestamp"),
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(safeStringLower(entry, "orderType")),
    Symbol("timeInForce") => tif,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => self.safeBool(entry, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => safeString(entry, "limitPx"),
    Symbol("triggerPrice") => triggerPx,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("amount") => totalAmount,
    Symbol("cost") => nothing,
    Symbol("average") => safeString(entry, "avgPx"),
    Symbol("filled") => safeString(filled, "totalSz", stringSub(totalAmount, remaining)),
    Symbol("remaining") => remaining,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Hyperliquid, status)
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    statuses = Dict{Symbol, Any}(
        Symbol("triggered") => "open",
        Symbol("filled") => "closed",
        Symbol("open") => "open",
        Symbol("canceled") => "canceled",
        Symbol("rejected") => "rejected",
        Symbol("marginCanceled") => "canceled"
    );
    if functions.ccxtruthy(endswith(status, "Rejected"))
            return "rejected"
    end
    if functions.ccxtruthy(endswith(status, "Canceled"))
            return "canceled"
    end
    return safeString(statuses, status, status)

end
function parseOrderType(self::Hyperliquid, status)
    statuses = Dict{Symbol, Any}(
        Symbol("stop limit") => "limit",
        Symbol("stop market") => "market"
    );
    return safeString(statuses, status, status)

end
"""
fetch all trades made by the user
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchMyTrades", params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("type")] = "userFillsByTime";
        request[Symbol("startTime")] = since;
    else
        request[Symbol("type")] = "userFills";
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    myFills = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        myFills = response;
    end
    return self.parseTrades(myFills, market = market, since = since, limit = limit)

end
function parseTrade(self::Hyperliquid, trade; market=nothing)
    timestamp = safeInteger(trade, "time");
    price = safeString(trade, "px");
    amount = safeString(trade, "sz");
    coin = safeString(trade, "coin");
    marketId = self.coinToMarketId(coin);
    market = self.safeMarket(marketId = marketId);
    symbol = get(market, Symbol("symbol"), nothing);
    id = safeString(trade, "tid");
    side = safeString(trade, "side");
    if functions.ccxtruthy(side != nothing)
        side = functions.ccxtruthy((side == "A")) ? "sell" : "buy";
    end
    fee = safeString(trade, "fee");
    takerOrMaker = nothing;
    crossed = self.safeBool(trade, "crossed");
    if functions.ccxtruthy(crossed != nothing)
        takerOrMaker = functions.ccxtruthy(crossed) ? "taker" : "maker";
    end
    builderFee = safeString(trade, "builderFee");
    if functions.ccxtruthy(builderFee != nothing)
        fee = stringAdd(fee, builderFee);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => safeString(trade, "oid"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => fee,
        Symbol("currency") => safeString(trade, "feeToken"),
        Symbol("rate") => nothing
    )
), market = market)

end
"""
fetch data on an open position
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Hyperliquid, symbol; params=Dict())
    positions = Base.fetch(self.fetchPositions(symbols = [symbol], params = params));
    return self.safeDict(positions, 0, defaultValue = Dict{Symbol, Any}())

end
function getDexFromSymbols(self::Hyperliquid, methodName; symbols=nothing)
    if functions.ccxtruthy(symbols == nothing)
            return nothing
    end
    symbolsLength = length(symbols);
    if functions.ccxtruthy(symbolsLength == 0)
            return nothing
    end
    dexName = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, symbolsLength))
        if functions.ccxtruthy(dexName == nothing)
            market = self.market(get(symbols, i + 1, nothing));
            dexName = self.getDexFromHip3Symbol(market);
        else
            market = self.market(get(symbols, i + 1, nothing));
            currentDexName = self.getDexFromHip3Symbol(market);
            if functions.ccxtruthy(currentDexName != dexName)
                throw(NotSupported(string(self.id, " ", methodName, " only supports fetching positions for one DEX at a time for HIP3 markets")));
            end
        end
        i += 1
    end
    return dexName

end
"""
fetch all open positions
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name, eg: XYZ

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Hyperliquid; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchPositions", params);
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}(
        Symbol("type") => "clearinghouseState",
        Symbol("user") => userAddress
    );
    dexName = self.getDexFromSymbols("fetchPositions", symbols = symbols);
    if functions.ccxtruthy(dexName != nothing)
        request[Symbol("dex")] = dexName;
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    data = self.safeList(response, "assetPositions", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        push!(result, self.parsePosition(get(data, i + 1, nothing)));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
function parsePosition(self::Hyperliquid, position; market=nothing)
    entry = self.safeDict(position, "position", defaultValue = Dict{Symbol, Any}());
    coin = safeString(entry, "coin");
    marketId = self.coinToMarketId(coin);
    market = self.safeMarket(marketId = marketId);
    symbol = get(market, Symbol("symbol"), nothing);
    leverage = self.safeDict(entry, "leverage", defaultValue = Dict{Symbol, Any}());
    marginMode = safeString(leverage, "type");
    isIsolated = (marginMode == "isolated");
    rawSize = safeString(entry, "szi");
    size_var = rawSize;
    side = nothing;
    if functions.ccxtruthy(size_var != nothing)
        side = functions.ccxtruthy(stringGt(rawSize, "0")) ? "long" : "short";
        size_var = stringAbs(size_var);
    end
    rawUnrealizedPnl = safeString(entry, "unrealizedPnl");
    absRawUnrealizedPnl = stringAbs(rawUnrealizedPnl);
    marginUsed = safeString(entry, "marginUsed");
    initialMargin = nothing;
    if functions.ccxtruthy(isIsolated)
        initialMargin = stringSub(marginUsed, rawUnrealizedPnl);
    else
        initialMargin = marginUsed;
    end
    percentage = stringMul(stringDiv(absRawUnrealizedPnl, marginUsed), "100");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("isolated") => isIsolated,
    Symbol("hedged") => nothing,
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => self.safeNumber(entry, "entryPx"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => self.safeNumber(entry, "positionValue"),
    Symbol("leverage") => self.safeNumber(leverage, "value"),
    Symbol("collateral") => self.parseNumber(marginUsed),
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => self.parseNumber(rawUnrealizedPnl),
    Symbol("liquidationPrice") => self.safeNumber(entry, "liquidationPx"),
    Symbol("marginMode") => marginMode,
    Symbol("percentage") => self.parseNumber(percentage)
))

end
"""
set margin mode (symbol)

# Arguments
- `marginMode`::string: margin mode must be either [isolated, cross]
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::string, optional: the rate of leverage, is required if setting trade mode (symbol)
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- response from the exchange
"""
function setMarginMode(self::Hyperliquid, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    leverage = safeInteger(params, "leverage");
    if functions.ccxtruthy(leverage == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a leverage parameter")));
    end
    asset = self.parseToInt(get(market, Symbol("baseId"), nothing));
    isCross = (marginMode == "cross");
    nonce = milliseconds();
    params = omit(params, ["leverage"]);
    updateAction = Dict{Symbol, Any}(
        Symbol("type") => "updateLeverage",
        Symbol("asset") => asset,
        Symbol("isCross") => isCross,
        Symbol("leverage") => leverage
    );
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "setMarginMode", "vaultAddress", "subAccountAddress");
    if functions.ccxtruthy(vaultAddress != nothing)
        if functions.ccxtruthy(startswith(vaultAddress, "0x"))
            vaultAddress = replace(vaultAddress, "0x" => "");
        end
    end
    signature = self.signL1Action(updateAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => updateAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    response = Base.fetch(self.privatePostExchange(request));
    return response

end
"""
set the level of leverage for a market

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: margin mode must be either [isolated, cross], default is cross

# Returns
- response from the exchange
"""
function setLeverage(self::Hyperliquid, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = safeString(params, "marginMode", "cross");
    isCross = (marginMode == "cross");
    asset = self.parseToInt(get(market, Symbol("baseId"), nothing));
    nonce = milliseconds();
    params = omit(params, "marginMode");
    updateAction = Dict{Symbol, Any}(
        Symbol("type") => "updateLeverage",
        Symbol("asset") => asset,
        Symbol("isCross") => isCross,
        Symbol("leverage") => leverage
    );
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "setLeverage", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(updateAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => updateAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        params = omit(params, "vaultAddress");
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    response = Base.fetch(self.privatePostExchange(request));
    return response

end
"""
add margin
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Hyperliquid, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
"""
remove margin from a position
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Hyperliquid, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params = params))

end
function modifyMarginHelper(self::Hyperliquid, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    asset = self.parseToInt(get(market, Symbol("baseId"), nothing));
    sz = self.parseToInt(stringMul(self.amountToPrecision(symbol, amount), "1000000"));
    if functions.ccxtruthy(type_var == "reduce")
        sz = -sz;
    end
    nonce = milliseconds();
    updateAction = Dict{Symbol, Any}(
        Symbol("type") => "updateIsolatedMargin",
        Symbol("asset") => asset,
        Symbol("isBuy") => true,
        Symbol("ntli") => sz
    );
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "modifyMargin", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    signature = self.signL1Action(updateAction, nonce, vaultAdress = vaultAddress);
    request = Dict{Symbol, Any}(
        Symbol("action") => updateAction,
        Symbol("nonce") => nonce,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(vaultAddress != nothing)
        request[Symbol("vaultAddress")] = vaultAddress;
    end
    response = Base.fetch(self.privatePostExchange(request));
    return extend(self.parseMarginModification(response, market = market), Dict{Symbol, Any}(
    Symbol("code") => safeString(response, "status")
))

end
function parseMarginModification(self::Hyperliquid, data; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => safeString(market, "settle"),
    Symbol("status") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
transfer currency internally between wallets on the same account
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from *spot, swap*
- `toAccount`::string: account to transfer to *swap, spot or address*
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Hyperliquid, code, amount, fromAccount, toAccount; params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isSandboxMode = self.safeBool(self.options, "sandboxMode");
    nonce = milliseconds();
    if functions.ccxtruthy(inArray(fromAccount, ["spot", "swap", "perp"]))
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(toAccount, ["spot", "swap", "perp"])))
            throw(NotSupported(string(self.id, " transfer() only support spot <> swap transfer")));
        end
        strAmount = numberToString(amount);
        vaultAddress = safeString2(params, "vaultAddress", "subAccountAddress");
        if functions.ccxtruthy(vaultAddress != nothing)
            vaultAddress = self.formatVaultAddress(address = vaultAddress);
            strAmount = string(strAmount, " subaccount:", vaultAddress);
        end
        strAmountFinal = strAmount;
        toPerp = @functions.ccxt_or((toAccount == "perp"), (toAccount == "swap"));
        transferPayload = Dict{Symbol, Any}(
            Symbol("hyperliquidChain") => functions.ccxtruthy(isSandboxMode) ? "Testnet" : "Mainnet",
            Symbol("amount") => strAmountFinal,
            Symbol("toPerp") => toPerp,
            Symbol("nonce") => nonce
        );
        transferSig = self.buildUsdClassSendSig(transferPayload);
        transferRequest = Dict{Symbol, Any}(
            Symbol("action") => Dict{Symbol, Any}(
                Symbol("hyperliquidChain") => get(transferPayload, Symbol("hyperliquidChain"), nothing),
                Symbol("signatureChainId") => "0x66eee",
                Symbol("type") => "usdClassTransfer",
                Symbol("amount") => strAmountFinal,
                Symbol("toPerp") => toPerp,
                Symbol("nonce") => nonce
            ),
            Symbol("nonce") => nonce,
            Symbol("signature") => transferSig
        );
        transferResponse = Base.fetch(self.privatePostExchange(transferRequest));
            return transferResponse
    end
    isDeposit = false;
    subAccountAddress = nothing;
    if functions.ccxtruthy(fromAccount == "main")
        subAccountAddress = toAccount;
        isDeposit = true;
    elseif functions.ccxtruthy(toAccount == "main")
        subAccountAddress = fromAccount;
    else
        throw(NotSupported(string(self.id, " transfer() only support main <> subaccount transfer")));
    end
    self.checkAddress(address = subAccountAddress);
    transferType = safeString(params, "type");
    params = omit(params, "type");
    isUsdc = @functions.ccxt_or((code == nothing), (uppercase(code) == "USDC"));
    if functions.ccxtruthy(@functions.ccxt_and(isUsdc, (transferType != "spot")))
        usd = self.parseToInt(stringMul(numberToString(amount), "1000000"));
        action = Dict{Symbol, Any}(
            Symbol("type") => "subAccountTransfer",
            Symbol("subAccountUser") => subAccountAddress,
            Symbol("isDeposit") => isDeposit,
            Symbol("usd") => usd
        );
        sig = self.signL1Action(action, nonce);
        request = Dict{Symbol, Any}(
            Symbol("action") => action,
            Symbol("nonce") => nonce,
            Symbol("signature") => sig
        );
        response = Base.fetch(self.privatePostExchange(request));
            return self.parseTransfer(response)
    else
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " transfer() requires a currency code for spot sub-account transfers")));
        end
        currency = self.currency(code);
        currencyInfo = self.safeDict(currency, "info", defaultValue = Dict{Symbol, Any}());
        tokenName = safeString(currencyInfo, "name");
        tokenId = safeString(currencyInfo, "tokenId");
        token = string(tokenName, ":", tokenId);
        action = Dict{Symbol, Any}(
            Symbol("type") => "subAccountSpotTransfer",
            Symbol("subAccountUser") => subAccountAddress,
            Symbol("isDeposit") => isDeposit,
            Symbol("token") => token,
            Symbol("amount") => numberToString(amount)
        );
        sig = self.signL1Action(action, nonce);
        request = Dict{Symbol, Any}(
            Symbol("action") => action,
            Symbol("nonce") => nonce,
            Symbol("signature") => sig
        );
        response = Base.fetch(self.privatePostExchange(request));
        return self.parseTransfer(response)
    end

end
function parseTransfer(self::Hyperliquid, transfer; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => nothing,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => "ok"
)

end
"""
make a withdrawal (only support USDC)
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: vault address withdraw from

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Hyperliquid, code, amount, address; tag=nothing, params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    if functions.ccxtruthy(code != nothing)
        code = uppercase(code);
        if functions.ccxtruthy(code != "USDC")
            throw(NotSupported(string(self.id, " withdraw() only support USDC")));
        end
    end
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "withdraw", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    params = omit(params, "vaultAddress");
    nonce = milliseconds();
    action = Dict{Symbol, Any}();
    if functions.ccxtruthy(vaultAddress != nothing)
        action = Dict{Symbol, Any}(
            Symbol("type") => "vaultTransfer",
            Symbol("vaultAddress") => string("0x", vaultAddress),
            Symbol("isDeposit") => false,
            Symbol("usd") => amount
        );
        sig = self.signL1Action(action, nonce);
    else
        isSandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
        payload = Dict{Symbol, Any}(
            Symbol("hyperliquidChain") => functions.ccxtruthy(isSandboxMode) ? "Testnet" : "Mainnet",
            Symbol("destination") => address,
            Symbol("amount") => string(amount),
            Symbol("time") => nonce
        );
        sig = self.buildWithdrawSig(payload);
        action = Dict{Symbol, Any}(
            Symbol("hyperliquidChain") => get(payload, Symbol("hyperliquidChain"), nothing),
            Symbol("signatureChainId") => "0x66eee",
            Symbol("destination") => address,
            Symbol("amount") => string(amount),
            Symbol("time") => nonce,
            Symbol("type") => "withdraw3"
        );
    end
    request = Dict{Symbol, Any}(
        Symbol("action") => action,
        Symbol("nonce") => nonce,
        Symbol("signature") => sig
    );
    response = Base.fetch(self.privatePostExchange(request));
    return self.parseTransaction(response)

end
function parseTransaction(self::Hyperliquid, transaction; currency=nothing)
    timestamp = safeInteger(transaction, "time");
    delta = self.safeDict(transaction, "delta", defaultValue = Dict{Symbol, Any}());
    fee = nothing;
    feeCost = safeInteger(delta, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => "USDC",
            Symbol("cost") => feeCost
        );
    end
    internal = nothing;
    type_var = safeString(delta, "type");
    if functions.ccxtruthy(type_var != nothing)
        internal = (type_var == "internalTransfer");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => nothing,
    Symbol("txid") => safeString(transaction, "hash"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => safeString(delta, "destination"),
    Symbol("addressFrom") => safeString(delta, "user"),
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => self.safeNumber(delta, "usdc"),
    Symbol("currency") => nothing,
    Symbol("status") => safeString(transaction, "status"),
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => internal,
    Symbol("fee") => fee
)

end
"""
fetch the trading fees for a market

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Hyperliquid, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchTradingFee", params);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => "userFees",
        Symbol("user") => userAddress
    );
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    data = Dict{Symbol, Any}(
        Symbol("userCrossRate") => safeString(response, "userCrossRate"),
        Symbol("userAddRate") => safeString(response, "userAddRate")
    );
    return self.parseTradingFee(data, market = market)

end
function parseTradingFee(self::Hyperliquid, fee; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "userAddRate"),
    Symbol("taker") => self.safeNumber(fee, "userCrossRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Hyperliquid; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchLedger", params);
    request = Dict{Symbol, Any}(
        Symbol("type") => "userNonFundingLedgerUpdates",
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        params = omit(params, ["until"]);
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    return self.parseLedger(response, currency = nothing, since = since, limit = limit)

end
function parseLedgerEntry(self::Hyperliquid, item; currency=nothing)
    timestamp = safeInteger(item, "time");
    delta = self.safeDict(item, "delta", defaultValue = Dict{Symbol, Any}());
    fee = nothing;
    feeCost = safeInteger(delta, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => "USDC",
            Symbol("cost") => feeCost
        );
    end
    type_var = safeString(delta, "type");
    amount = safeString(delta, "usdc");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "hash"),
    Symbol("direction") => nothing,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => safeString(delta, "user"),
    Symbol("referenceId") => safeString(item, "hash"),
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => nothing,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => fee
), currency = currency)

end
function parseLedgerEntryType(self::Hyperliquid, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("internalTransfer") => "transfer",
        Symbol("accountClassTransfer") => "transfer"
    );
    return safeString(ledgerType, type_var, type_var)

end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.subAccountAddress`::string, optional: sub account user address
- `params.vaultAddress`::string, optional: vault address

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Hyperliquid; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchDepositsWithdrawals", params);
    request = Dict{Symbol, Any}(
        Symbol("type") => "userNonFundingLedgerUpdates",
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        if functions.ccxtruthy(since == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDeposits requires since while until is set")));
        end
        request[Symbol("endTime")] = until;
        params = omit(params, ["until"]);
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    depositLedger = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        depositLedger = response;
    end
    records = self.extractTypeFromDelta(data = depositLedger);
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    deposits = [];
    if functions.ccxtruthy(vaultAddress != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(records)))
            record = get(records, i + 1, nothing);
            if functions.ccxtruthy(get(record, Symbol("type"), nothing) == "vaultDeposit")
                delta = self.safeDict(record, "delta", defaultValue = Dict{Symbol, Any}());
                if functions.ccxtruthy(get(delta, Symbol("vault"), nothing) == string("0x", vaultAddress))
                                        push!(deposits, record);
                end
            end
            i += 1
        end

    else
        deposits = self.filterByArray(records, "type", values = ["deposit"], indexed = false);
    end
    return self.parseTransactions(deposits, currency = nothing, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.subAccountAddress`::string, optional: sub account user address
- `params.vaultAddress`::string, optional: vault address

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Hyperliquid; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchDepositsWithdrawals", params);
    request = Dict{Symbol, Any}(
        Symbol("type") => "userNonFundingLedgerUpdates",
        Symbol("user") => userAddress
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        params = omit(params, ["until"]);
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    withdrawalLedger = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        withdrawalLedger = response;
    end
    records = self.extractTypeFromDelta(data = withdrawalLedger);
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "vaultAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    withdrawals = [];
    if functions.ccxtruthy(vaultAddress != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(records)))
            record = get(records, i + 1, nothing);
            if functions.ccxtruthy(get(record, Symbol("type"), nothing) == "vaultWithdraw")
                delta = self.safeDict(record, "delta", defaultValue = Dict{Symbol, Any}());
                if functions.ccxtruthy(get(delta, Symbol("vault"), nothing) == string("0x", vaultAddress))
                                        push!(withdrawals, record);
                end
            end
            i += 1
        end

    else
        withdrawals = self.filterByArray(records, "type", values = ["withdraw"], indexed = false);
    end
    return self.parseTransactions(withdrawals, currency = nothing, since = since, limit = limit)

end
"""
Retrieves the open interest for a list of symbols

# Arguments
- `symbols`::array, optional: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterests(self::Hyperliquid; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    swapMarkets = Base.fetch(self.fetchSwapMarkets());
    return self.parseOpenInterests(swapMarkets, symbols = symbols)

end
"""
retrieves the open interest of a contract trading pair

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Hyperliquid, symbol; params=Dict())
    symbol = self.symbol(symbol);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ois = Base.fetch(self.fetchOpenInterests(symbols = [symbol], params = params));
    return get(ois, Symbol(symbol), nothing)

end
function parseOpenInterest(self::Hyperliquid, interest; market=nothing)
    interest = self.safeDict(interest, "info", defaultValue = Dict{Symbol, Any}());
    coin = safeString(interest, "name");
    marketId = nothing;
    if functions.ccxtruthy(coin != nothing)
        marketId = self.coinToMarketId(coin);
    end
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId),
    Symbol("openInterestAmount") => self.safeNumber(interest, "openInterest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => interest
), market = market)

end
"""
fetch the history of funding payments paid and received on this account

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Hyperliquid; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    userAddress = nothing;
    (userAddress, params) = self.handlePublicAddress("fetchFundingHistory", params);
    request = Dict{Symbol, Any}(
        Symbol("user") => userAddress,
        Symbol("type") => "userFunding"
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicPostInfo(extend(request, params)));
    return self.parseIncomes(response, market = market, since = since, limit = limit)

end
function parseIncome(self::Hyperliquid, income; market=nothing)
    id = safeString(income, "hash");
    timestamp = safeInteger(income, "time");
    delta = self.safeDict(income, "delta");
    coin = safeString(delta, "coin");
    marketId = nothing;
    if functions.ccxtruthy(coin != nothing)
        marketId = self.coinToMarketId(coin);
    end
    market = self.safeMarket(marketId = marketId, market = market);
    amount = safeString(delta, "usdc");
    code = safeString(market, "settle", "USDC");
    rate = self.safeNumber(delta, "fundingRate");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => id,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("rate") => rate
)

end
"""
Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.

# Arguments
- `weight`::float: the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a response object
"""
function reserveRequestWeight(self::Hyperliquid, weight; params=Dict())
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    action = Dict{Symbol, Any}(
        Symbol("type") => "reserveRequestWeight",
        Symbol("weight") => weight
    );
    signature = self.signL1Action(action, nonce);
    request[Symbol("action")] = action;
    request[Symbol("signature")] = signature;
    response = Base.fetch(self.privatePostExchange(extend(request, params)));
    return response

end
"""
creates a sub-account under the main account

# Arguments
- `name`::string: the name of the sub-account
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.expiresAfter`::int, optional: time in ms after which the sub-account will expire

# Returns
- a response object
"""
function createSubAccount(self::Hyperliquid, name; params=Dict())
    nonce = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("nonce") => nonce
    );
    action = Dict{Symbol, Any}(
        Symbol("type") => "createSubAccount",
        Symbol("name") => name
    );
    expiresAfter = safeInteger(params, "expiresAfter");
    if functions.ccxtruthy(expiresAfter != nothing)
        params = omit(params, "expiresAfter");
        request[Symbol("expiresAfter")] = expiresAfter;
    end
    signature = self.signL1Action(action, nonce, vaultAdress = nothing, expiresAfter = expiresAfter);
    request[Symbol("action")] = action;
    request[Symbol("signature")] = signature;
    response = Base.fetch(self.privatePostExchange(extend(request, params)));
    return response

end
function extractTypeFromDelta(self::Hyperliquid; data=[])
    records = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        record = get(data, i + 1, nothing);
        record[Symbol("type")] = get(get(record, Symbol("delta"), nothing), Symbol("type"), nothing);
        push!(records, record);
        i += 1
    end
    return records

end
function formatVaultAddress(self::Hyperliquid; address=nothing)
    if functions.ccxtruthy(address == nothing)
            return nothing
    end
    if functions.ccxtruthy(startswith(address, "0x"))
            return replace(address, "0x" => "")
    end
    return address

end
function handlePublicAddress(self::Hyperliquid, methodName, params)
    userAux = nothing;
    (userAux, params) = self.handleOptionAndParams2(params, methodName, "user", "subAccountAddress");
    user = userAux;
    (user, params) = self.handleOptionAndParams(params, methodName, "address", defaultValue = userAux);
    if functions.ccxtruthy(@functions.ccxt_and((user != nothing), (user != "")))
            return [user, params]
    end
    if functions.ccxtruthy(@functions.ccxt_and((self.walletAddress != nothing), (self.walletAddress != "")))
            return [self.walletAddress, params]
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a user parameter inside \'params\' or the wallet address set")));

end
function coinToMarketId(self::Hyperliquid, coin)
    if functions.ccxtruthy(coin == nothing)
            return nothing
    end
    hi3TokensByname = self.safeDict(self.options, "hip3TokensByName", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(self.safeDict(hi3TokensByname, coin))
        hip3Dict = self.safeDict(hi3TokensByname, coin);
        quote_var = safeString(hip3Dict, "quote", "USDC");
        code = safeString(hip3Dict, "code", coin);
            return string(code, "/", quote_var, ":", quote_var)
    end
    if functions.ccxtruthy(@functions.ccxt_or(findfirst("/", coin) !== nothing, findfirst("@", coin) !== nothing))
            return coin
    end
    if functions.ccxtruthy(findfirst(":", coin) !== nothing)
        coin = replace(coin, ":" => "-");
    end
    return string(self.safeCurrencyCode(coin), "/USDC:USDC")

end
function handleErrors(self::Hyperliquid, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    status = safeString(response, "status", "");
    error = safeString(response, "error");
    message = nothing;
    if functions.ccxtruthy(status == "err")
        message = safeString(response, "response");
    elseif functions.ccxtruthy(status == "unknownOid")
        throw(OrderNotFound(string(self.id, " ", body)));
    else
        if functions.ccxtruthy(error != nothing)
            message = error;
        else
            responsePayload = self.safeDict(response, "response", defaultValue = Dict{Symbol, Any}());
            data = self.safeDict(responsePayload, "data", defaultValue = Dict{Symbol, Any}());
            statuses = self.safeList(data, "statuses", defaultValue = []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(statuses)))
                message = safeString(get(statuses, i + 1, nothing), "error");
                if functions.ccxtruthy(message != nothing)
                    break
                end
                i += 1
            end
            if functions.ccxtruthy(ccxt_in("status", data))
                errorStatus = self.safeDict(data, "status", defaultValue = Dict{Symbol, Any}());
                errorMsg = safeString(errorStatus, "error");
                if functions.ccxtruthy(errorStatus != nothing)
                    message = errorMsg;
                end
            end
        end

    end
    feedback = string(self.id, " ", body);
    nonEmptyMessage = (@functions.ccxt_and((message != nothing), (message != "")));
    if functions.ccxtruthy(nonEmptyMessage)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
    end
    if functions.ccxtruthy(nonEmptyMessage)
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Hyperliquid, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), "/", path);
    if functions.ccxtruthy(method == "POST")
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json"
        );
        body = json(params);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function calculateRateLimiterCost(self::Hyperliquid, api, method, path, params; config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byType", config)), (ccxt_in("type", params))))
        type_var = get(params, Symbol("type"), nothing);
        byType = get(config, Symbol("byType"), nothing);
        if functions.ccxtruthy(ccxt_in(type_var, byType))
                return get(byType, Symbol(type_var), nothing)
        end
    end
    return safeValue(config, "cost", 1)

end
function parseCreateEditOrderArgs(self::Hyperliquid, id, symbol, type_var, side, amount; price=nothing, params=Dict())
    market = self.market(symbol);
    vaultAddress = nothing;
    (vaultAddress, params) = self.handleOptionAndParams2(params, "createOrder", "vaultAddress", "subAccountAddress");
    vaultAddress = self.formatVaultAddress(address = vaultAddress);
    symbol = get(market, Symbol("symbol"), nothing);
    order = Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("type") => type_var,
        Symbol("side") => side,
        Symbol("amount") => amount,
        Symbol("price") => price,
        Symbol("params") => params
    );
    globalParams = Dict{Symbol, Any}();
    if functions.ccxtruthy(vaultAddress != nothing)
        globalParams[Symbol("vaultAddress")] = vaultAddress;
    end
    if functions.ccxtruthy(id != nothing)
        order[Symbol("id")] = id;
    end
    return [order, globalParams]

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Hyperliquid, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicPostInfo(self::Hyperliquid, params=Dict(), context=Dict())
    return request(self, "info"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostExchange(self::Hyperliquid, params=Dict(), context=Dict())
    return request(self, "exchange"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Hyperliquid(; kwargs...)
    inst = Hyperliquid(Exchange(), describe, setSandboxMode, market, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchHip3Markets, fetchSwapMarkets, calculatePricePrecision, fetchSpotMarkets, parseMarket, updateSpotCurrencyCode, fetchBalance, fetchOrderBook, fetchTickers, fetchFundingRate, fetchFundingRates, parseFundingRate, parseTicker, fetchOHLCV, parseOHLCV, fetchTrades, amountToPrecision, priceToPrecision, hashMessage, signHash, signMessage, constructPhantomAgent, actionHash, signL1Action, signUserSignedAction, buildUsdSendSig, buildUsdClassSendSig, buildWithdrawSig, buildUserDexAbstractionSig, buildUserAbstractionSig, buildApproveBuilderFeeSig, setRef, approveBuilderFee, initializeClient, handleBuilderFeeApproval, isUnifiedEnabled, setUserAbstraction, enableUserDexAbstraction, setAgentAbstraction, createOrder, createTwapOrder, createOrders, createOrderRequest, createOrdersRequest, cancelOrder, cancelOrders, cancelTwapOrder, cancelOrdersRequest, cancelOrdersForSymbols, cancelAllOrdersAfter, editOrdersRequest, editOrder, editOrders, createVault, fetchFundingRateHistory, getDexFromHip3Symbol, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, fetchOrders, fetchOrder, parseOrder, parseOrderStatus, parseOrderType, fetchMyTrades, parseTrade, fetchPosition, getDexFromSymbols, fetchPositions, parsePosition, setMarginMode, setLeverage, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, transfer, parseTransfer, withdraw, parseTransaction, fetchTradingFee, parseTradingFee, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchDeposits, fetchWithdrawals, fetchOpenInterests, fetchOpenInterest, parseOpenInterest, fetchFundingHistory, parseIncome, reserveRequestWeight, createSubAccount, extractTypeFromDelta, formatVaultAddress, handlePublicAddress, coinToMarketId, handleErrors, sign, calculateRateLimiterCost, parseCreateEditOrderArgs, publicPostInfo, privatePostExchange)
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
function __ccxt_doc_Hyperliquid_fetchStatus() end
"""
the latest known information on the availability of the exchange API

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Hyperliquid_fetchStatus

function __ccxt_doc_Hyperliquid_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Hyperliquid_fetchTime

function __ccxt_doc_Hyperliquid_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Hyperliquid_fetchCurrencies

function __ccxt_doc_Hyperliquid_fetchMarkets() end
"""
retrieves data on all markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hyperliquid_fetchMarkets

function __ccxt_doc_Hyperliquid_fetchHip3Markets() end
"""
retrieves data on all hip3 markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hyperliquid_fetchHip3Markets

function __ccxt_doc_Hyperliquid_fetchSwapMarkets() end
"""
retrieves data on all swap markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hyperliquid_fetchSwapMarkets

function __ccxt_doc_Hyperliquid_calculatePricePrecision() end
"""
Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision

# Arguments
- `price`::float: the price to use in the calculation
- `amountPrecision`::int: the amountPrecision to use in the calculation
- `maxDecimals`::int: the maxDecimals to use in the calculation

# Returns
- The calculated price precision
"""
__ccxt_doc_Hyperliquid_calculatePricePrecision

function __ccxt_doc_Hyperliquid_fetchSpotMarkets() end
"""
retrieves data on all spot markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hyperliquid_fetchSpotMarkets

function __ccxt_doc_Hyperliquid_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.type`::string, optional: wallet type, ['spot', 'swap'], defaults to swap
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
- `params.dex`::string, optional: for hip3 markets, the dex name, eg: 'xyz'
- `params.subAccountAddress`::string, optional: sub account user address
- `params.enableUnifiedMargin`::bool, optional: enable unified margin, CCXT tries to auto-detects this value but you can override it

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Hyperliquid_fetchBalance

function __ccxt_doc_Hyperliquid_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Hyperliquid_fetchOrderBook

function __ccxt_doc_Hyperliquid_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', by default fetches both
- `params.hip3`::bool, optional: set to true to fetch hip3 markets only

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hyperliquid_fetchTickers

function __ccxt_doc_Hyperliquid_fetchFundingRate() end
"""
fetch the current funding rate for a symbol - hyperliquid only offers a bulk endpoint, so this filters the result of fetchFundingRates
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
"""
__ccxt_doc_Hyperliquid_fetchFundingRate

function __ccxt_doc_Hyperliquid_fetchFundingRates() end
"""
retrieves data on all swap markets for hyperliquid
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hyperliquid_fetchFundingRates

function __ccxt_doc_Hyperliquid_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents, support '1m', '15m', '1h', '1d'
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Hyperliquid_fetchOHLCV

function __ccxt_doc_Hyperliquid_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade
- `params.address`::string, optional: wallet address that made trades
- `params.user`::string, optional: wallet address that made trades
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Hyperliquid_fetchTrades

function __ccxt_doc_Hyperliquid_isUnifiedEnabled() end
"""
returns enableUnifiedMargin so the user can check if unified account is enabled
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state

# Arguments
- `method`::string: the method for which we want to check if unified margin is enabled, this is used to check options for specific methods (e.g. fetchBalance can have a specific option to enable unified margin)
- `address`::string, optional: the wallet address to query; defaults to the configured walletAddress
- `shouldRefresh`::bool, optional: force a fresh request instead of returning the cached value
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- enableUnifiedMargin
"""
__ccxt_doc_Hyperliquid_isUnifiedEnabled

function __ccxt_doc_Hyperliquid_setUserAbstraction() end
"""
set user abstraction mode
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction

# Arguments
- `abstraction`::string: one of the strings ["disabled", "unifiedAccount", "portfolioMargin"],
- `params`::object, optional:
- `params.type`::string, optional: 'userSetAbstraction' or 'agentSetAbstraction' default is 'userSetAbstraction'

# Returns
- dictionary response from the exchange
"""
__ccxt_doc_Hyperliquid_setUserAbstraction

function __ccxt_doc_Hyperliquid_enableUserDexAbstraction() end
"""
If set, actions on HIP-3 perps will automatically transfer collateral from validator-operated USDC perps balance for HIP-3 DEXs where USDC is the collateral token, and spot otherwise

# Arguments
- `enabled`::bool: whether to enable user dex abstraction
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'userDexAbstraction' or 'agentEnableDexAbstraction' default is 'userDexAbstraction'

# Returns
- dictionary response from the exchange
"""
__ccxt_doc_Hyperliquid_enableUserDexAbstraction

function __ccxt_doc_Hyperliquid_setAgentAbstraction() end
"""
set agent abstraction mode

# Arguments
- `abstraction`::string: one of the strings ["i", "u", "p"] where "i" is "disabled", "u" is "unifiedAccount", and "p" is "portfolioMargin"
- `params`::object, optional:

# Returns
- dictionary response from the exchange
"""
__ccxt_doc_Hyperliquid_setAgentAbstraction

function __ccxt_doc_Hyperliquid_createOrder() end
"""
create a trade order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'Gtc', 'Ioc', 'Alo'
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.slippage`::string, optional: the slippage for market order
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_createOrder

function __ccxt_doc_Hyperliquid_createTwapOrder() end
"""
create a trade order that is executed as a TWAP order over a specified duration.

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `duration`::int: the duration of the TWAP order in milliseconds
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.randomize`::bool, optional: whether to randomize the time intervals of the TWAP order slices (default is false, meaning equal intervals)
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.expiresAfter`::int, optional: time in ms after which the twap order expires
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_createTwapOrder

function __ccxt_doc_Hyperliquid_createOrders() end
"""
create a list of trade orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_createOrders

function __ccxt_doc_Hyperliquid_cancelOrder() end
"""
cancels an open order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address
- `params.twap`::bool, optional: whether the order to cancel is a twap order, (default is false)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_cancelOrder

function __ccxt_doc_Hyperliquid_cancelOrders() end
"""
cancel multiple orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::array, optional: client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_cancelOrders

function __ccxt_doc_Hyperliquid_cancelTwapOrder() end
"""
cancels a running twap order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.expiresAfter`::int, optional: time in ms after which the twap order expires
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_cancelTwapOrder

function __ccxt_doc_Hyperliquid_cancelOrdersForSymbols() end
"""
cancel multiple orders for multiple symbols
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid

# Arguments
- `orders`::array: each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_cancelOrdersForSymbols

function __ccxt_doc_Hyperliquid_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- the api result
"""
__ccxt_doc_Hyperliquid_cancelAllOrdersAfter

function __ccxt_doc_Hyperliquid_editOrder() end
"""
edit a trade order
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'Gtc', 'Ioc', 'Alo'
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.vaultAddress`::string, optional: the vault address for order
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_editOrder

function __ccxt_doc_Hyperliquid_editOrders() end
"""
edit a list of trade orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_editOrders

function __ccxt_doc_Hyperliquid_createVault() end
"""
creates a value

# Arguments
- `name`::string: The name of the vault
- `description`::string: The description of the vault
- `initialUsd`::float: The initialUsd of the vault
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
__ccxt_doc_Hyperliquid_createVault

function __ccxt_doc_Hyperliquid_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Hyperliquid_fetchFundingRateHistory

function __ccxt_doc_Hyperliquid_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.method`::string, optional: 'openOrders' or 'frontendOpenOrders' default is 'frontendOpenOrders'
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name. default is null

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchOpenOrders

function __ccxt_doc_Hyperliquid_fetchClosedOrders() end
"""
fetch all unfilled currently closed orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchClosedOrders

function __ccxt_doc_Hyperliquid_fetchCanceledOrders() end
"""
fetch all canceled orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchCanceledOrders

function __ccxt_doc_Hyperliquid_fetchCanceledAndClosedOrders() end
"""
fetch all closed and canceled orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchCanceledAndClosedOrders

function __ccxt_doc_Hyperliquid_fetchOrders() end
"""
fetch all orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name. default is null

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchOrders

function __ccxt_doc_Hyperliquid_fetchOrder() end
"""
fetches information on an order made by the user
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hyperliquid_fetchOrder

function __ccxt_doc_Hyperliquid_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Hyperliquid_fetchMyTrades

function __ccxt_doc_Hyperliquid_fetchPosition() end
"""
fetch data on an open position
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Hyperliquid_fetchPosition

function __ccxt_doc_Hyperliquid_fetchPositions() end
"""
fetch all open positions
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address
- `params.dex`::string, optional: perp dex name, eg: XYZ

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Hyperliquid_fetchPositions

function __ccxt_doc_Hyperliquid_setMarginMode() end
"""
set margin mode (symbol)

# Arguments
- `marginMode`::string: margin mode must be either [isolated, cross]
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::string, optional: the rate of leverage, is required if setting trade mode (symbol)
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- response from the exchange
"""
__ccxt_doc_Hyperliquid_setMarginMode

function __ccxt_doc_Hyperliquid_setLeverage() end
"""
set the level of leverage for a market

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: margin mode must be either [isolated, cross], default is cross

# Returns
- response from the exchange
"""
__ccxt_doc_Hyperliquid_setLeverage

function __ccxt_doc_Hyperliquid_addMargin() end
"""
add margin
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Hyperliquid_addMargin

function __ccxt_doc_Hyperliquid_reduceMargin() end
"""
remove margin from a position
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Hyperliquid_reduceMargin

function __ccxt_doc_Hyperliquid_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from *spot, swap*
- `toAccount`::string: account to transfer to *swap, spot or address*
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: the vault address for order

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Hyperliquid_transfer

function __ccxt_doc_Hyperliquid_withdraw() end
"""
make a withdrawal (only support USDC)
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
see: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.vaultAddress`::string, optional: vault address withdraw from

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hyperliquid_withdraw

function __ccxt_doc_Hyperliquid_fetchTradingFee() end
"""
fetch the trading fees for a market

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.user`::string, optional: user address, will default to this.walletAddress if not provided
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Hyperliquid_fetchTradingFee

function __ccxt_doc_Hyperliquid_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Hyperliquid_fetchLedger

function __ccxt_doc_Hyperliquid_fetchDeposits() end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.subAccountAddress`::string, optional: sub account user address
- `params.vaultAddress`::string, optional: vault address

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hyperliquid_fetchDeposits

function __ccxt_doc_Hyperliquid_fetchWithdrawals() end
"""
fetch all withdrawals made from an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.subAccountAddress`::string, optional: sub account user address
- `params.vaultAddress`::string, optional: vault address

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hyperliquid_fetchWithdrawals

function __ccxt_doc_Hyperliquid_fetchOpenInterests() end
"""
Retrieves the open interest for a list of symbols

# Arguments
- `symbols`::array, optional: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Hyperliquid_fetchOpenInterests

function __ccxt_doc_Hyperliquid_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Hyperliquid_fetchOpenInterest

function __ccxt_doc_Hyperliquid_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subAccountAddress`::string, optional: sub account user address

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Hyperliquid_fetchFundingHistory

function __ccxt_doc_Hyperliquid_reserveRequestWeight() end
"""
Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.

# Arguments
- `weight`::float: the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a response object
"""
__ccxt_doc_Hyperliquid_reserveRequestWeight

function __ccxt_doc_Hyperliquid_createSubAccount() end
"""
creates a sub-account under the main account

# Arguments
- `name`::string: the name of the sub-account
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.expiresAfter`::int, optional: time in ms after which the sub-account will expire

# Returns
- a response object
"""
__ccxt_doc_Hyperliquid_createSubAccount
