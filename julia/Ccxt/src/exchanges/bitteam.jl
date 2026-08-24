@kwdef mutable struct Bitteam <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchOrderBook::Function = fetchOrderBook
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseValueToPricision::Function = parseValueToPricision
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionType::Function = parseTransactionType
    parseTransactionStatus::Function = parseTransactionStatus
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    historyGetApiTwHistoryPairNameResolution::Function = historyGetApiTwHistoryPairNameResolution
    publicGetTradeApiAsset::Function = publicGetTradeApiAsset
    publicGetTradeApiCurrencies::Function = publicGetTradeApiCurrencies
    publicGetTradeApiOrderbooksSymbol::Function = publicGetTradeApiOrderbooksSymbol
    publicGetTradeApiOrders::Function = publicGetTradeApiOrders
    publicGetTradeApiPairName::Function = publicGetTradeApiPairName
    publicGetTradeApiPairs::Function = publicGetTradeApiPairs
    publicGetTradeApiPairsPrecisions::Function = publicGetTradeApiPairsPrecisions
    publicGetTradeApiRates::Function = publicGetTradeApiRates
    publicGetTradeApiTradeId::Function = publicGetTradeApiTradeId
    publicGetTradeApiTrades::Function = publicGetTradeApiTrades
    publicGetTradeApiCcxtPairs::Function = publicGetTradeApiCcxtPairs
    publicGetTradeApiCmcAssets::Function = publicGetTradeApiCmcAssets
    publicGetTradeApiCmcOrderbookPair::Function = publicGetTradeApiCmcOrderbookPair
    publicGetTradeApiCmcSummary::Function = publicGetTradeApiCmcSummary
    publicGetTradeApiCmcTicker::Function = publicGetTradeApiCmcTicker
    publicGetTradeApiCmcTradesPair::Function = publicGetTradeApiCmcTradesPair
    privateGetTradeApiCcxtBalance::Function = privateGetTradeApiCcxtBalance
    privateGetTradeApiCcxtOrderId::Function = privateGetTradeApiCcxtOrderId
    privateGetTradeApiCcxtOrdersOfUser::Function = privateGetTradeApiCcxtOrdersOfUser
    privateGetTradeApiCcxtTradesOfUser::Function = privateGetTradeApiCcxtTradesOfUser
    privateGetTradeApiTransactionsOfUser::Function = privateGetTradeApiTransactionsOfUser
    privatePostTradeApiCcxtCancelAllOrder::Function = privatePostTradeApiCcxtCancelAllOrder
    privatePostTradeApiCcxtCancelorder::Function = privatePostTradeApiCcxtCancelorder
    privatePostTradeApiCcxtOrdercreate::Function = privatePostTradeApiCcxtOrdercreate

end
function describe(self::Bitteam, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitteam",
    Symbol("name") => "BIT.TEAM",
    Symbol("countries") => ["UK"],
    Symbol("version") => "v2.0.6",
    Symbol("rateLimit") => 1,
    Symbol("certified") => false,
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
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("deposit") => false,
        Symbol("editOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => false,
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
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => false,
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
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => true,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false,
        Symbol("ws") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("5m") => "5",
        Symbol("15m") => "15",
        Symbol("1h") => "60",
        Symbol("1d") => "1D"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/b41b5e0d-98e5-4bd3-8a6e-aeb230a4a135",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("history") => "https://history.bit.team",
            Symbol("public") => "https://bit.team",
            Symbol("private") => "https://bit.team"
        ),
        Symbol("www") => "https://bit.team/",
        Symbol("referral") => "https://bit.team/auth/sign-up?ref=bitboy2023",
        Symbol("doc") => ["https://bit.team/trade/api/documentation"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("history") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/tw/history/{pairName}/{resolution}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("trade/api/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/orderbooks/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/pair/{name}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/pairs/precisions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/rates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/trade/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/cmc/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/cmc/orderbook/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/cmc/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/cmc/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/cmc/trades/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("trade/api/ccxt/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/order/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/ordersOfUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/tradesOfUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/transactionsOfUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("trade/api/ccxt/cancel-all-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/cancelorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/api/ccxt/ordercreate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("maker") => self.parseNumber("0.002")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("Ethereum") => "ERC20",
            Symbol("ethereum") => "ERC20",
            Symbol("Tron") => "TRC20",
            Symbol("tron") => "TRC20",
            Symbol("Binance") => "BSC",
            Symbol("binance") => "BSC",
            Symbol("Binance Smart Chain") => "BSC",
            Symbol("bscscan") => "BSC",
            Symbol("Bitcoin") => "BTC",
            Symbol("bitcoin") => "BTC",
            Symbol("Litecoin") => "LTC",
            Symbol("litecoin") => "LTC",
            Symbol("Polygon") => "POLYGON",
            Symbol("polygon") => "POLYGON",
            Symbol("PRIZM") => "PRIZM",
            Symbol("Decimal") => "Decimal",
            Symbol("ufobject") => "ufobject",
            Symbol("tonchain") => "tonchain"
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("currenciesValuedInUsd") => Dict{Symbol, Any}(
                Symbol("USDT") => true,
                Symbol("BUSD") => true
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
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
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400002") => BadSymbol,
            Symbol("401000") => AuthenticationError,
            Symbol("403002") => BadRequest,
            Symbol("404200") => BadSymbol
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("is not allowed") => BadRequest,
            Symbol("Insufficient funds") => InsufficientFunds,
            Symbol("Invalid request params input") => BadRequest,
            Symbol("must be a number") => BadRequest,
            Symbol("must be a string") => BadRequest,
            Symbol("must be of type") => BadRequest,
            Symbol("must be one of") => BadRequest,
            Symbol("Order not found") => OrderNotFound,
            Symbol("Pair with pair name") => BadSymbol,
            Symbol("pairName") => BadSymbol,
            Symbol("Service Unavailable") => ExchangeNotAvailable,
            Symbol("Symbol ") => BadSymbol
        )
    )
))

end
"""
retrieves data on all markets for bitteam
see: https://bit.team/trade/api/documentation#/CCXT/getTradeApiCcxtPairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitteam; params=Dict())
    response = Base.fetch(self.publicGetTradeApiCcxtPairs(params));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    markets = safeValue(result, "pairs", []);
    return self.parseMarkets(markets)

end
function parseMarket(self::Bitteam, market)
    id = safeString(market, "name");
    numericId = safeInteger(market, "id");
    parts = split(id, "_");
    baseId = safeString(parts, 0);
    quoteId = safeString(parts, 1);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    active = safeValue(market, "active");
    timeStart = safeString(market, "timeStart");
    created = self.parse8601(timeStart);
    minCost = nothing;
    currenciesValuedInUsd = self.handleOption("fetchMarkets", "currenciesValuedInUsd", defaultValue = Dict{Symbol, Any}());
    quoteInUsd = self.safeBool(currenciesValuedInUsd, quote_var, defaultValue = false);
    if functions.ccxtruthy(quoteInUsd)
        settings = safeValue(market, "settings", Dict{Symbol, Any}());
        minCost = self.safeNumber(settings, "limit_usd");
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => numericId,
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
    Symbol("active") => active,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "baseStep"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quoteStep")))
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
            Symbol("min") => minCost,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => created,
    Symbol("info") => market
))

end
"""
fetches all available currencies on an exchange
see: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitteam; params=Dict())
    response = Base.fetch(self.publicGetTradeApiCurrencies(params));
    responseResult = safeValue(response, "result", Dict{Symbol, Any}());
    currencies = safeValue(responseResult, "currencies", []);
    statusesResponse = Base.fetch(self.publicGetTradeApiCmcAssets());
    statusesResponse = indexBy(statusesResponse, "unified_cryptoasset_id");
    self.options[Symbol("_temp_currencies_statuses")] = statusesResponse;
    result = self.parseCurrencies(currencies);
    delete!(self.options, :_temp_currencies_statuses);
    return result

end
function parseCurrency(self::Bitteam, currency)
    statusesResponse = safeValue(self.options, "_temp_currencies_statuses", Dict{Symbol, Any}());
    id = safeString(currency, "symbol");
    numericId = safeInteger(currency, "id");
    code = self.safeCurrencyCode(id);
    active = self.safeBool(currency, "active", defaultValue = false);
    precision = self.parseNumber(self.parsePrecision(precision = safeString(currency, "precision")));
    txLimits = safeValue(currency, "txLimits", Dict{Symbol, Any}());
    minWithdraw = safeString(txLimits, "minWithdraw");
    maxWithdraw = safeString(txLimits, "maxWithdraw");
    minDeposit = safeString(txLimits, "minDeposit");
    fee = nothing;
    withdrawCommissionFixed = safeValue(txLimits, "withdrawCommissionFixed", Dict{Symbol, Any}());
    feesByNetworkId = Dict{Symbol, Any}();
    blockChain = safeString(currency, "blockChain");
    if functions.ccxtruthy(@functions.ccxt_and((blockChain != nothing), (blockChain != "")))
        fee = self.parseNumber(withdrawCommissionFixed);
        feesByNetworkId[Symbol(blockChain)] = fee;
    else
        feesByNetworkId = withdrawCommissionFixed;
    end
    statuses = safeValue(statusesResponse, numericId, Dict{Symbol, Any}());
    deposit = safeValue(statuses, "depositStatus");
    withdraw = safeValue(statuses, "withdrawStatus");
    networkIds = objectKeys(feesByNetworkId);
    networks = Dict{Symbol, Any}();
    networkPrecision = self.parseNumber(self.parsePrecision(precision = safeString(currency, "decimals")));
    typeRaw = safeString(currency, "type");
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
        networkId = get(networkIds, j + 1, nothing);
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        networkFee = self.safeNumber(feesByNetworkId, networkId);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("deposit") => deposit,
                Symbol("withdraw") => withdraw,
                Symbol("active") => active,
                Symbol("fee") => networkFee,
                Symbol("precision") => networkPrecision,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.parseNumber(minWithdraw),
                        Symbol("max") => self.parseNumber(maxWithdraw)
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.parseNumber(minDeposit),
                        Symbol("max") => nothing
                    )
                ),
                Symbol("info") => currency
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => numericId,
    Symbol("code") => code,
    Symbol("name") => code,
    Symbol("info") => currency,
    Symbol("active") => active,
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdraw,
    Symbol("fee") => fee,
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minWithdraw),
            Symbol("max") => self.parseNumber(maxWithdraw)
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minDeposit),
            Symbol("max") => nothing
        )
    ),
    Symbol("type") => typeRaw,
    Symbol("networks") => networks
))

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitteam, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    resolution = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("pairName") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => resolution
    );
    response = Base.fetch(self.historyGetApiTwHistoryPairNameResolution(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Bitteam, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcOrderbookPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (default 100, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitteam, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradeApiCmcOrderbookPair(extend(request, params)));
    timestamp = safeInteger(response, "timestamp");
    orderbook = self.parseOrderBook(response, symbol, timestamp = timestamp);
    return orderbook

end
"""
fetches information on multiple orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of  orde structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: the status of the order - 'active', 'closed', 'cancelled', 'all', 'history' (default 'all')

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function fetchOrders(self::Bitteam; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = safeString(params, "type", "all");
    request = Dict{Symbol, Any}(
        Symbol("type") => type_var
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTradeApiCcxtOrdersOfUser(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    orders = self.safeList(result, "orders", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on an order
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrderId

# Arguments
- `id`::any: order id
- `symbol`::string: not used by fetchOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function fetchOrder(self::Bitteam, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetTradeApiCcxtOrderId(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
"""
fetch all unfilled currently open orders
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function fetchOpenOrders(self::Bitteam; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "active"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple closed orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of closed order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function fetchClosedOrders(self::Bitteam; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "closed"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple canceled orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of canceled order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function fetchCanceledOrders(self::Bitteam; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "cancelled"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
create a trade order
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtOrdercreate

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function createOrder(self::Bitteam, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pairId") => safeString(market, "numericId"),
        Symbol("type") => type_var,
        Symbol("side") => side,
        Symbol("amount") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        else
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
    end
    response = Base.fetch(self.privatePostTradeApiCcxtOrdercreate(extend(request, params)));
    order = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
"""
cancels an open order
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function cancelOrder(self::Bitteam, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privatePostTradeApiCcxtCancelorder(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result)

end
"""
cancel open orders of market
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelallorder

# Arguments
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function cancelAllOrders(self::Bitteam; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pairId")] = safeString(market, "numericId");
    else
        request[Symbol("pairId")] = "0";
    end
    response = Base.fetch(self.privatePostTradeApiCcxtCancelAllOrder(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    orders = [result];
    return self.parseOrders(orders, market = market)

end
function parseOrder(self::Bitteam, order; market=nothing)
    id = safeString(order, "id");
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    clientOrderId = safeString(order, "orderCid");
    timestamp = nothing;
    createdAt = safeString(order, "createdAt");
    if functions.ccxtruthy(createdAt != nothing)
        timestamp = self.parse8601(createdAt);
    else
        timestamp = safeTimestamp(order, "timestamp");
    end
    updatedAt = safeString(order, "updatedAt");
    lastUpdateTimestamp = self.parse8601(updatedAt);
    status = self.parseOrderStatus(safeString(order, "status"));
    type_var = self.parseOrderType(safeString(order, "type"));
    side = safeString(order, "side");
    feeRaw = safeValue(order, "fee");
    price = safeString(order, "price");
    amount = safeString(order, "quantity");
    filled = safeString(order, "executed");
    fee = nothing;
    if functions.ccxtruthy(feeRaw != nothing)
        feeCost = safeString(feeRaw, "amount");
        feeCurrencyId = safeString(feeRaw, "symbol");
        fee = Dict{Symbol, Any}(
            Symbol("currency") => self.safeCurrencyCode(feeCurrencyId),
            Symbol("cost") => feeCost,
            Symbol("rate") => nothing
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("status") => status,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => "GTC",
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString(order, "stopPrice"),
    Symbol("average") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("info") => order,
    Symbol("postOnly") => false
), market = market)

end
function parseOrderStatus(self::Bitteam, status)
    statuses = Dict{Symbol, Any}(
        Symbol("accepted") => "open",
        Symbol("executed") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("partiallyCancelled") => "canceled",
        Symbol("delete") => "rejected",
        Symbol("inactive") => "rejected",
        Symbol("executing") => "open",
        Symbol("created") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Bitteam, status)
    statuses = Dict{Symbol, Any}(
        Symbol("market") => "market",
        Symbol("limit") => "limit"
    );
    return safeString(statuses, status, status)

end
function parseValueToPricision(self::Bitteam, valueObject, valueKey, preciseObject, precisionKey)
    valueRawString = safeString(valueObject, valueKey);
    precisionRawString = safeString(preciseObject, precisionKey);
    if functions.ccxtruthy(@functions.ccxt_or(valueRawString == nothing, precisionRawString == nothing))
            return nothing
    end
    precisionString = self.parsePrecision(precision = precisionRawString);
    return stringMul(valueRawString, precisionString)

end
"""
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcSummary

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
"""
function fetchTickers(self::Bitteam; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTradeApiCmcSummary());
    tickers = [];
    rawTickers = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        rawTickers = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawTickers)))
        rawTicker = get(rawTickers, i + 1, nothing);
        ticker = self.parseTicker(rawTicker);
        push!(tickers, ticker);
        i += 1
    end
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
"""
function fetchTicker(self::Bitteam, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradeApiPairName(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    pair = self.safeDict(result, "pair", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(pair, market = market)

end
function parseTicker(self::Bitteam, ticker; market=nothing)
    marketId = safeStringLower(ticker, "trading_pairs");
    market = self.safeMarket(marketId = marketId, market = market);
    bestBidPrice = nothing;
    bestAskPrice = nothing;
    bestBidVolume = nothing;
    bestAskVolume = nothing;
    bids = safeValue(ticker, "bids");
    asks = safeValue(ticker, "asks");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((bids != nothing), (functions.ccxt_isArray(bids))), (asks != nothing)), (functions.ccxt_isArray(asks))))
        bestBid = safeValue(bids, 0, Dict{Symbol, Any}());
        bestBidPrice = safeString(bestBid, "price");
        bestBidVolume = safeString(bestBid, "quantity");
        bestAsk = safeValue(asks, 0, Dict{Symbol, Any}());
        bestAskPrice = safeString(bestAsk, "price");
        bestAskVolume = safeString(bestAsk, "quantity");
    else
        bestBidPrice = safeString(ticker, "highest_bid");
        bestAskPrice = safeString(ticker, "lowest_ask");
    end
    baseVolume = safeString2(ticker, "volume24", "base_volume");
    quoteVolume = safeString2(ticker, "quoteVolume24", "quote_volume");
    high = safeString2(ticker, "highPrice24", "highest_price_24h");
    low = safeString2(ticker, "lowPrice24", "lowest_price_24h");
    close = safeString2(ticker, "lastPrice", "last_price");
    changePcnt = safeString2(ticker, "change24", "price_change_percent_24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("open") => nothing,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("close") => close,
    Symbol("bid") => bestBidPrice,
    Symbol("bidVolume") => bestBidVolume,
    Symbol("ask") => bestAskPrice,
    Symbol("askVolume") => bestAskVolume,
    Symbol("vwap") => nothing,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => changePcnt,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcTradesPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
"""
function fetchTrades(self::Bitteam, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradeApiCmcTradesPair(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtTradesofuser

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
"""
function fetchMyTrades(self::Bitteam; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pairId")] = get(market, Symbol("numericId"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTradeApiCcxtTradesOfUser(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    trades = self.safeList(result, "trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Bitteam, trade; market=nothing)
    marketId = safeString(trade, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    id = safeString2(trade, "id", "trade_id");
    price = safeString(trade, "price");
    amount = safeString2(trade, "quantity", "base_volume");
    cost = safeString(trade, "quote_volume");
    takerOrMaker = safeString(trade, "isCurrentSide");
    timestamp = safeString(trade, "timestamp");
    if functions.ccxtruthy(takerOrMaker != nothing)
        timestamp = stringMul(timestamp, "1000");
    end
    side = safeString2(trade, "side", "type");
    feeInfo = nothing;
    order = nothing;
    if functions.ccxtruthy(takerOrMaker == "maker")
        if functions.ccxtruthy(side == "sell")
            side = "buy";
        elseif functions.ccxtruthy(side == "buy")
            side = "sell";
        end
        order = safeString(trade, "makerOrderId");
        feeInfo = safeValue(trade, "feeMaker", Dict{Symbol, Any}());
    elseif functions.ccxtruthy(takerOrMaker == "taker")
        order = safeString(trade, "takerOrderId");
        feeInfo = safeValue(trade, "feeTaker", Dict{Symbol, Any}());
    end
    feeCurrencyId = safeString(feeInfo, "symbol");
    feeCost = safeString(feeInfo, "amount");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(feeCurrencyId),
        Symbol("cost") => feeCost
    );
    intTs = self.parseToInt(timestamp);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => order,
    Symbol("timestamp") => intTs,
    Symbol("datetime") => self.iso8601(intTs),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market = market)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtBalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#balance-structure}
"""
function fetchBalance(self::Bitteam; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetTradeApiCcxtBalance(params));
    return self.parseBalance(response)

end
function parseBalance(self::Bitteam, response)
    timestamp = milliseconds();
    balance = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    result = safeValue(response, "result", Dict{Symbol, Any}());
    balanceByCurrencies = omit(result, ["free", "used", "total"]);
    rawCurrencyIds = objectKeys(balanceByCurrencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawCurrencyIds)))
        rawCurrencyId = get(rawCurrencyIds, i + 1, nothing);
        currencyBalance = safeValue(result, rawCurrencyId);
        free = safeString(currencyBalance, "free");
        used = safeString(currencyBalance, "used");
        total = safeString(currencyBalance, "total");
        currencyCode = self.safeCurrencyCode(lowercase(rawCurrencyId));
        if functions.ccxtruthy(currencyCode != nothing)
            balance[Symbol(currencyCode)] = Dict{Symbol, Any}(
                Symbol("free") => free,
                Symbol("used") => used,
                Symbol("total") => total
            );
        end
        i += 1
    end
    return self.safeBalance(balance)

end
"""
fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiTransactionsofuser

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal
- `limit`::int, optional: max number of deposit/withdrawals to return (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
"""
function fetchDepositsWithdrawals(self::Bitteam; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("numericId"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTradeApiTransactionsOfUser(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    transactions = self.safeList(result, "transactions", defaultValue = []);
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Bitteam, transaction; currency=nothing)
    currencyObject = safeValue(transaction, "currency");
    currencyId = safeString(currencyObject, "symbol");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    id = safeString(transaction, "id");
    params = safeValue(transaction, "params");
    txid = safeString(params, "tx_id");
    timestamp = safeInteger(transaction, "timestamp");
    networkId = safeString(transaction, "blockChain");
    if functions.ccxtruthy(networkId == nothing)
        links = safeValue(currencyObject, "links", []);
        blockChain = safeValue(links, 0, Dict{Symbol, Any}());
        networkId = safeString(blockChain, "blockChain");
    end
    addressFrom = safeString(transaction, "sender");
    addressTo = safeString(transaction, "recipient");
    tag = safeString(transaction, "message");
    type_var = self.parseTransactionType(safeString(transaction, "type"));
    amount = self.parseValueToPricision(transaction, "amount", currencyObject, "decimals");
    status = self.parseTransactionStatus(safeValue(transaction, "status"));
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("addressFrom") => addressFrom,
    Symbol("address") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("fee") => nothing,
    Symbol("comment") => safeString(transaction, "description"),
    Symbol("internal") => false
)

end
function parseTransactionType(self::Bitteam, type_var)
    types = Dict{Symbol, Any}(
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function parseTransactionStatus(self::Bitteam, status)
    statuses = Dict{Symbol, Any}(
        Symbol("approving") => "pending",
        Symbol("success") => "ok"
    );
    return safeString(statuses, status, status)

end
function sign(self::Bitteam, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = omit(params, self.extractParams(path));
    endpoint = string("/", self.implodeParams(path, params));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), endpoint);
    query = self.urlencode(request);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        if functions.ccxtruthy(method == "POST")
            body = json(request);
        elseif functions.ccxtruthy(length(query) != 0)
            url += string("?", query);
        end
        auth = string(self.apiKey, ":", self.secret);
        auth64 = self.stringToBase64(auth);
        signature = string("Basic ", auth64);
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => signature,
            Symbol("Content-Type") => "application/json"
        );
    elseif functions.ccxtruthy(length(query) != 0)
        url += string("?", query);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitteam, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(code != 200)
        if functions.ccxtruthy(code == 404)
            if functions.ccxtruthy(@functions.ccxt_and((findfirst("/ccxt/order/", url) !== nothing), (method == "GET")))
                parts = split(url, "/order/");
                orderId = safeString(parts, 1);
                throw(OrderNotFound(string(self.id, " order ", orderId, " not found")));
            end
            if functions.ccxtruthy(findfirst("/cmc/orderbook/", url) !== nothing)
                parts = split(url, "/cmc/orderbook/");
                symbolId = safeString(parts, 1);
                throw(BadSymbol(string(self.id, " symbolId ", symbolId, " not found")));
            end
        end
        feedback = string(self.id, " ", body);
        message = safeString(response, "message");
        responseCode = safeString(response, "code");
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), responseCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitteam, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function historyGetApiTwHistoryPairNameResolution(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "api/tw/history/{pairName}/{resolution}"; api="history", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiAsset(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/asset"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCurrencies(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiOrderbooksSymbol(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/orderbooks/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiOrders(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/orders"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiPairName(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/pair/{name}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiPairs(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/pairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiPairsPrecisions(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/pairs/precisions"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiRates(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/rates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiTradeId(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/trade/{id}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiTrades(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCcxtPairs(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/pairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCmcAssets(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/cmc/assets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCmcOrderbookPair(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/cmc/orderbook/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCmcSummary(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/cmc/summary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCmcTicker(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/cmc/ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeApiCmcTradesPair(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/cmc/trades/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeApiCcxtBalance(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeApiCcxtOrderId(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/order/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeApiCcxtOrdersOfUser(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/ordersOfUser"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeApiCcxtTradesOfUser(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/tradesOfUser"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeApiTransactionsOfUser(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/transactionsOfUser"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeApiCcxtCancelAllOrder(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/cancel-all-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeApiCcxtCancelorder(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/cancelorder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeApiCcxtOrdercreate(self::Bitteam, params=Dict(), context=Dict())
    return request(self, "trade/api/ccxt/ordercreate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitteam(; kwargs...)
    inst = Bitteam(Exchange(), describe, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchOHLCV, parseOHLCV, fetchOrderBook, fetchOrders, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, createOrder, cancelOrder, cancelAllOrders, parseOrder, parseOrderStatus, parseOrderType, parseValueToPricision, fetchTickers, fetchTicker, parseTicker, fetchTrades, fetchMyTrades, parseTrade, fetchBalance, parseBalance, fetchDepositsWithdrawals, parseTransaction, parseTransactionType, parseTransactionStatus, sign, handleErrors, historyGetApiTwHistoryPairNameResolution, publicGetTradeApiAsset, publicGetTradeApiCurrencies, publicGetTradeApiOrderbooksSymbol, publicGetTradeApiOrders, publicGetTradeApiPairName, publicGetTradeApiPairs, publicGetTradeApiPairsPrecisions, publicGetTradeApiRates, publicGetTradeApiTradeId, publicGetTradeApiTrades, publicGetTradeApiCcxtPairs, publicGetTradeApiCmcAssets, publicGetTradeApiCmcOrderbookPair, publicGetTradeApiCmcSummary, publicGetTradeApiCmcTicker, publicGetTradeApiCmcTradesPair, privateGetTradeApiCcxtBalance, privateGetTradeApiCcxtOrderId, privateGetTradeApiCcxtOrdersOfUser, privateGetTradeApiCcxtTradesOfUser, privateGetTradeApiTransactionsOfUser, privatePostTradeApiCcxtCancelAllOrder, privatePostTradeApiCcxtCancelorder, privatePostTradeApiCcxtOrdercreate)
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
function __ccxt_doc_Bitteam_fetchMarkets() end
"""
retrieves data on all markets for bitteam
see: https://bit.team/trade/api/documentation#/CCXT/getTradeApiCcxtPairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitteam_fetchMarkets

function __ccxt_doc_Bitteam_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitteam_fetchCurrencies

function __ccxt_doc_Bitteam_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitteam_fetchOHLCV

function __ccxt_doc_Bitteam_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcOrderbookPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (default 100, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitteam_fetchOrderBook

function __ccxt_doc_Bitteam_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of  orde structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: the status of the order - 'active', 'closed', 'cancelled', 'all', 'history' (default 'all')

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_fetchOrders

function __ccxt_doc_Bitteam_fetchOrder() end
"""
fetches information on an order
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrderId

# Arguments
- `id`::any: order id
- `symbol`::string: not used by fetchOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_fetchOrder

function __ccxt_doc_Bitteam_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_fetchOpenOrders

function __ccxt_doc_Bitteam_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of closed order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_fetchClosedOrders

function __ccxt_doc_Bitteam_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of canceled order structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_fetchCanceledOrders

function __ccxt_doc_Bitteam_createOrder() end
"""
create a trade order
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtOrdercreate

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_createOrder

function __ccxt_doc_Bitteam_cancelOrder() end
"""
cancels an open order
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_cancelOrder

function __ccxt_doc_Bitteam_cancelAllOrders() end
"""
cancel open orders of market
see: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelallorder

# Arguments
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitteam_cancelAllOrders

function __ccxt_doc_Bitteam_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcSummary

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
"""
__ccxt_doc_Bitteam_fetchTickers

function __ccxt_doc_Bitteam_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
"""
__ccxt_doc_Bitteam_fetchTicker

function __ccxt_doc_Bitteam_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcTradesPair

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
"""
__ccxt_doc_Bitteam_fetchTrades

function __ccxt_doc_Bitteam_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtTradesofuser

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
"""
__ccxt_doc_Bitteam_fetchMyTrades

function __ccxt_doc_Bitteam_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtBalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#balance-structure}
"""
__ccxt_doc_Bitteam_fetchBalance

function __ccxt_doc_Bitteam_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
see: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiTransactionsofuser

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal
- `limit`::int, optional: max number of deposit/withdrawals to return (default 10)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
"""
__ccxt_doc_Bitteam_fetchDepositsWithdrawals
