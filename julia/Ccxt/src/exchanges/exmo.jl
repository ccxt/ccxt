@kwdef mutable struct Exmo <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchTradingFees::Function = fetchTradingFees
    fetchPrivateTradingFees::Function = fetchPrivateTradingFees
    fetchPublicTradingFees::Function = fetchPublicTradingFees
    parseFixedFloatValue::Function = parseFixedFloatValue
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchOrderBooks::Function = fetchOrderBooks
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchOpenOrders::Function = fetchOpenOrders
    parseStatus::Function = parseStatus
    parseSide::Function = parseSide
    parseOrder::Function = parseOrder
    fetchCanceledOrders::Function = fetchCanceledOrders
    editOrder::Function = editOrder
    fetchDepositAddress::Function = fetchDepositAddress
    getMarketFromTrades::Function = getMarketFromTrades
    withdraw::Function = withdraw
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchWithdrawals::Function = fetchWithdrawals
    fetchWithdrawal::Function = fetchWithdrawal
    fetchDeposit::Function = fetchDeposit
    fetchDeposits::Function = fetchDeposits
    sign::Function = sign
    nonce::Function = nonce
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    webGetCtrlFeesAndLimits::Function = webGetCtrlFeesAndLimits
    webGetEnDocsFees::Function = webGetEnDocsFees
    publicGetCurrency::Function = publicGetCurrency
    publicGetCurrencyListExtended::Function = publicGetCurrencyListExtended
    publicGetOrderBook::Function = publicGetOrderBook
    publicGetPairSettings::Function = publicGetPairSettings
    publicGetTicker::Function = publicGetTicker
    publicGetTrades::Function = publicGetTrades
    publicGetCandlesHistory::Function = publicGetCandlesHistory
    publicGetRequiredAmount::Function = publicGetRequiredAmount
    publicGetPaymentsProvidersCryptoList::Function = publicGetPaymentsProvidersCryptoList
    privatePostUserInfo::Function = privatePostUserInfo
    privatePostOrderCreate::Function = privatePostOrderCreate
    privatePostOrderCancel::Function = privatePostOrderCancel
    privatePostStopMarketOrderCreate::Function = privatePostStopMarketOrderCreate
    privatePostStopMarketOrderCancel::Function = privatePostStopMarketOrderCancel
    privatePostUserOpenOrders::Function = privatePostUserOpenOrders
    privatePostUserTrades::Function = privatePostUserTrades
    privatePostUserCancelledOrders::Function = privatePostUserCancelledOrders
    privatePostOrderTrades::Function = privatePostOrderTrades
    privatePostDepositAddress::Function = privatePostDepositAddress
    privatePostWithdrawCrypt::Function = privatePostWithdrawCrypt
    privatePostWithdrawGetTxid::Function = privatePostWithdrawGetTxid
    privatePostExcodeCreate::Function = privatePostExcodeCreate
    privatePostExcodeLoad::Function = privatePostExcodeLoad
    privatePostCodeCheck::Function = privatePostCodeCheck
    privatePostWalletHistory::Function = privatePostWalletHistory
    privatePostWalletOperations::Function = privatePostWalletOperations
    privatePostMarginUserOrderCreate::Function = privatePostMarginUserOrderCreate
    privatePostMarginUserOrderUpdate::Function = privatePostMarginUserOrderUpdate
    privatePostMarginUserOrderCancel::Function = privatePostMarginUserOrderCancel
    privatePostMarginUserPositionClose::Function = privatePostMarginUserPositionClose
    privatePostMarginUserPositionMarginAdd::Function = privatePostMarginUserPositionMarginAdd
    privatePostMarginUserPositionMarginRemove::Function = privatePostMarginUserPositionMarginRemove
    privatePostMarginCurrencyList::Function = privatePostMarginCurrencyList
    privatePostMarginPairList::Function = privatePostMarginPairList
    privatePostMarginSettings::Function = privatePostMarginSettings
    privatePostMarginFundingList::Function = privatePostMarginFundingList
    privatePostMarginUserInfo::Function = privatePostMarginUserInfo
    privatePostMarginUserOrderList::Function = privatePostMarginUserOrderList
    privatePostMarginUserOrderHistory::Function = privatePostMarginUserOrderHistory
    privatePostMarginUserOrderTrades::Function = privatePostMarginUserOrderTrades
    privatePostMarginUserOrderMaxQuantity::Function = privatePostMarginUserOrderMaxQuantity
    privatePostMarginUserPositionList::Function = privatePostMarginUserPositionList
    privatePostMarginUserPositionMarginRemoveInfo::Function = privatePostMarginUserPositionMarginRemoveInfo
    privatePostMarginUserPositionMarginAddInfo::Function = privatePostMarginUserPositionMarginAddInfo
    privatePostMarginUserWalletList::Function = privatePostMarginUserWalletList
    privatePostMarginUserWalletHistory::Function = privatePostMarginUserWalletHistory
    privatePostMarginUserTradeList::Function = privatePostMarginUserTradeList
    privatePostMarginTrades::Function = privatePostMarginTrades
    privatePostMarginLiquidationFeed::Function = privatePostMarginLiquidationFeed

end
function describe(self::Exmo, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "exmo",
    Symbol("name") => "EXMO",
    Symbol("countries") => ["LT"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1.1",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => "emulated",
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("setMargin") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("5m") => "5",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("45m") => "45",
        Symbol("1h") => "60",
        Symbol("2h") => "120",
        Symbol("3h") => "180",
        Symbol("4h") => "240",
        Symbol("1d") => "D",
        Symbol("1w") => "W",
        Symbol("1M") => "M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.exmo.com",
            Symbol("private") => "https://api.exmo.com",
            Symbol("web") => "https://exmo.me"
        ),
        Symbol("www") => "https://exmo.me",
        Symbol("referral") => "https://exmo.me/?ref=131685",
        Symbol("doc") => ["https://exmo.me/en/api_doc?ref=131685"],
        Symbol("fees") => "https://exmo.com/en/docs/fees"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("web") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ctrl/feesAndLimits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("en/docs/fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency/list/extended") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pair_settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("candles_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("required_amount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("payments/providers/crypto/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("user_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stop_market_order_create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stop_market_order_cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_cancelled_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw_crypt") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw_get_txid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("excode_create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("excode_load") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("code_check") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet_operations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/update") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/close") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/margin_add") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/margin_remove") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/currency/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/pair/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/funding/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/order/max_quantity") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/margin_remove_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/position/margin_add_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/wallet/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/wallet/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/user/trade/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/liquidation/feed") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.004"),
            Symbol("taker") => self.parseNumber("0.004")
        ),
        Symbol("transaction") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("TRX") => "TRC20"
        ),
        Symbol("fetchTradingFees") => Dict{Symbol, Any}(
            Symbol("method") => "fetchPrivateTradingFees"
        ),
        Symbol("margin") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
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
                Symbol("trailing") => false,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
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
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
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
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("GMT") => "GMT Token"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("140333") => InvalidOrder,
            Symbol("140434") => BadRequest,
            Symbol("40005") => AuthenticationError,
            Symbol("40009") => InvalidNonce,
            Symbol("40015") => ExchangeError,
            Symbol("40016") => OnMaintenance,
            Symbol("40017") => AuthenticationError,
            Symbol("40032") => PermissionDenied,
            Symbol("40033") => PermissionDenied,
            Symbol("40034") => RateLimitExceeded,
            Symbol("50052") => InsufficientFunds,
            Symbol("50054") => InsufficientFunds,
            Symbol("50304") => OrderNotFound,
            Symbol("50173") => OrderNotFound,
            Symbol("50277") => InvalidOrder,
            Symbol("50319") => InvalidOrder,
            Symbol("50321") => InvalidOrder,
            Symbol("50381") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("range period is too long") => BadRequest,
            Symbol("invalid syntax") => BadRequest,
            Symbol("API rate limit exceeded") => RateLimitExceeded
        )
    )
))

end
function modifyMarginHelper(self::Exmo, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("position_id") => get(market, Symbol("id"), nothing),
        Symbol("quantity") => amount
    );
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(type_var == "add")
        response = Base.fetch(self.privatePostMarginUserPositionMarginAdd(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "reduce")
        response = Base.fetch(self.privatePostMarginUserPositionMarginRemove(extend(request, params)));
    end
    margin = self.parseMarginModification(response, market = market);
    options = safeValue(self.options, "margin", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(options, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        margin[Symbol("type")] = type_var;
        margin[Symbol("amount")] = amount;
    end
    return margin

end
function parseMarginModification(self::Exmo, data; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => safeValue(market, "quote"),
    Symbol("status") => "ok",
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
remove margin from a position
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#eebf9f25-0289-4946-9482-89872c738449

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Exmo, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params = params))

end
"""
add margin
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#143ef808-79ca-4e49-9e79-a60ea4d8c0e3

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Exmo, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
"""
fetch the trading fees for multiple markets
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#90927062-256c-4b03-900f-2b99131f9a54
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Exmo; params=Dict())
    options = safeValue(self.options, "fetchTradingFees", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "fetchPrivateTradingFees");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "fetchPrivateTradingFees")
            return Base.fetch(self.fetchPrivateTradingFees(params = params))
    end
    return Base.fetch(self.fetchPublicTradingFees(params = params))

end
function fetchPrivateTradingFees(self::Exmo; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostMarginPairList(params));
    pairs_var = safeValue(response, "pairs", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(pairs_var)))
        pair = get(pairs_var, i + 1, nothing);
        marketId = safeString(pair, "name");
        symbol = self.safeSymbol(marketId, market = nothing, delimiter = "_");
        makerString = safeString(pair, "trade_maker_fee");
        takerString = safeString(pair, "trade_taker_fee");
        maker = self.parseNumber(stringDiv(makerString, "100"));
        taker = self.parseNumber(stringDiv(takerString, "100"));
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => pair,
            Symbol("symbol") => symbol,
            Symbol("maker") => maker,
            Symbol("taker") => taker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
function fetchPublicTradingFees(self::Exmo; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetPairSettings(params));
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = safeValue(response, get(market, Symbol("id"), nothing), Dict{Symbol, Any}());
        makerString = safeString(fee, "commission_maker_percent");
        takerString = safeString(fee, "commission_taker_percent");
        maker = self.parseNumber(stringDiv(makerString, "100"));
        taker = self.parseNumber(stringDiv(takerString, "100"));
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => symbol,
            Symbol("maker") => maker,
            Symbol("taker") => taker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
function parseFixedFloatValue(self::Exmo, input)
    if functions.ccxtruthy(@functions.ccxt_or((input == nothing), (input == "-")))
            return nothing
    end
    if functions.ccxtruthy(input == "")
            return 0
    end
    isPercentage = (findfirst("%", input) !== nothing);
    parts = split(input, " ");
    value = replace(get(parts, 1, nothing), "%" => "");
    result = ccxt_toNumber(value);
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(result, 0)), isPercentage))
        throw(ExchangeError(string(self.id, " parseFixedFloatValue() detected an unsupported non-zero percentage-based fee ", input)));
    end
    return result

end
"""
please use fetchDepositWithdrawFees instead
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction fees structures]{@link https://docs.ccxt.com/?id=fees-structure}
"""
function fetchTransactionFees(self::Exmo; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    cryptoList = Base.fetch(self.publicGetPaymentsProvidersCryptoList(params));
    result = Dict{Symbol, Any}();
    cryptoListKeys = objectKeys(cryptoList);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(cryptoListKeys)))
        code = get(cryptoListKeys, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and(codes != nothing, !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        result[Symbol(code)] = Dict{Symbol, Any}(
            Symbol("deposit") => nothing,
            Symbol("withdraw") => nothing
        );
        currency = self.currency(code);
        currencyId = safeString(currency, "id");
        providers = safeValue(cryptoList, currencyId, []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(providers)))
            provider = get(providers, j + 1, nothing);
            typeInner = safeString(provider, "type");
            commissionDesc = safeString(provider, "commission_desc");
            fee = self.parseFixedFloatValue(commissionDesc);
            if functions.ccxtruthy(@functions.ccxt_and(code != nothing, typeInner != nothing))
                result[Symbol(code)][Symbol(typeInner)] = fee;
            end
            j += 1
        end
        result[Symbol(code)][Symbol("info")] = providers;
        i += 1
    end
    self.options[Symbol("transactionFees")] = result;
    return result

end
"""
fetch deposit and withdraw fees
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction fees structures]{@link https://docs.ccxt.com/?id=fees-structure}
"""
function fetchDepositWithdrawFees(self::Exmo; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetPaymentsProvidersCryptoList(params));
    result = self.parseDepositWithdrawFees(response, codes = codes);
    self.options[Symbol("transactionFees")] = result;
    return result

end
function parseDepositWithdrawFee(self::Exmo, fee; currency=nothing)
    result = self.depositWithdrawFee(fee);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fee)))
        provider = get(fee, i + 1, nothing);
        type_var = safeString(provider, "type");
        networkId = safeString(provider, "name");
        currencyId = safeString(provider, "currency_name");
        currency = self.safeCurrency(currencyId, currency = currency);
        code = safeString(currency, "code");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        commissionDesc = safeString(provider, "commission_desc");
        splitCommissionDesc = [];
        percentage = nothing;
        if functions.ccxtruthy(commissionDesc != nothing)
            splitCommissionDesc = split(commissionDesc, "%");
            splitCommissionDescLength = length(splitCommissionDesc);
            percentage = functions.ccxt_ge(splitCommissionDescLength, 2);
        end
        network = safeValue(get(result, Symbol("networks"), nothing), networkCode);
        if functions.ccxtruthy(network == nothing)
            if functions.ccxtruthy(networkCode != nothing)
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    )
                );
            end
        end
        if functions.ccxtruthy(@functions.ccxt_and((networkCode != nothing), (type_var != nothing)))
            result[Symbol("networks")][Symbol(networkCode)][Symbol(type_var)] = Dict{Symbol, Any}(
                Symbol("fee") => self.parseFixedFloatValue(safeString(splitCommissionDesc, 0)),
                Symbol("percentage") => percentage
            );
        end
        i += 1
    end
    return self.assignDefaultDepositWithdrawFees(result)

end
"""
fetches all available currencies on an exchange
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7cdf0ca8-9ff6-4cf3-aa33-bcec83155c49
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Exmo; params=Dict())
    promises = [];
    push!(promises, self.publicGetCurrencyListExtended(params));
    push!(promises, self.publicGetPaymentsProvidersCryptoList(params));
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    currencyList = get(responses, 1, nothing);
    cryptoList = get(responses, 2, nothing);
    newArray = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyList)))
        currency = get(currencyList, i + 1, nothing);
        currencyId = safeString(currency, "name");
        providers = self.safeList(cryptoList, currencyId);
        push!(newArray, Dict{Symbol, Any}(
    Symbol("currency") => currency,
    Symbol("providers") => providers
));
        i += 1
    end
    return self.parseCurrencies(newArray)

end
function parseCurrency(self::Exmo, rawCurrency)
    currency = self.safeDict(rawCurrency, "currency", defaultValue = Dict{Symbol, Any}());
    providers = self.safeList(rawCurrency, "providers", defaultValue = []);
    currencyId = safeString(currency, "name");
    code = self.safeCurrencyCode(currencyId);
    type_var = "crypto";
    networks = Dict{Symbol, Any}();
    if functions.ccxtruthy(providers == nothing)
        type_var = "fiat";
    else
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(providers)))
            provider = get(providers, j + 1, nothing);
            name = safeString(provider, "name");
            if functions.ccxtruthy(name == nothing)
                throw(ExchangeError(string(self.id, " parseCurrency() missing name")));
            end
            networkId = replace(name, string(currencyId, " ") => "");
            networkId = replace(networkId, "(" => "");
            replaceChar = ")";
            networkId = replace(networkId, replaceChar => "");
            networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
            if functions.ccxtruthy(@functions.ccxt_or((networkCode == nothing), !functions.ccxtruthy((ccxt_in(networkCode, networks)))))
                if functions.ccxtruthy(networkCode != nothing)
                    networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                        Symbol("id") => networkId,
                        Symbol("network") => networkCode,
                        Symbol("active") => nothing,
                        Symbol("deposit") => nothing,
                        Symbol("withdraw") => nothing,
                        Symbol("fee") => nothing,
                        Symbol("limits") => Dict{Symbol, Any}(
                            Symbol("withdraw") => Dict{Symbol, Any}(
                                Symbol("min") => nothing,
                                Symbol("max") => nothing
                            ),
                            Symbol("deposit") => Dict{Symbol, Any}(
                                Symbol("min") => nothing,
                                Symbol("max") => nothing
                            )
                        ),
                        Symbol("info") => []
                    );
                end
            end
            typeInner = safeString(provider, "type");
            minValue = safeString(provider, "min");
            maxValue = safeString(provider, "max");
            activeProvider = self.safeBool(provider, "enabled");
            networkEntry = safeValue(networks, networkCode);
            if functions.ccxtruthy(typeInner == "deposit")
                networkEntry[Symbol("deposit")] = activeProvider;
                networkEntry[Symbol("limits")][Symbol("deposit")][Symbol("min")] = minValue;
                networkEntry[Symbol("limits")][Symbol("deposit")][Symbol("max")] = maxValue;
            elseif functions.ccxtruthy(typeInner == "withdraw")
                networkEntry[Symbol("withdraw")] = activeProvider;
                networkEntry[Symbol("limits")][Symbol("withdraw")][Symbol("min")] = minValue;
                networkEntry[Symbol("limits")][Symbol("withdraw")][Symbol("max")] = maxValue;
            end
            info = self.safeList(networkEntry, "info", defaultValue = []);
            push!(info, provider);
            networkEntry[Symbol("info")] = info;
            if functions.ccxtruthy(networkCode != nothing)
                networks[Symbol(networkCode)] = networkEntry;
            end
            j += 1
        end
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => safeString(currency, "description"),
    Symbol("type") => type_var,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber("1e-8"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => Dict{Symbol, Any}(
        Symbol("currency") => currency,
        Symbol("providers") => providers
    ),
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for exmo
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Exmo; params=Dict())
    promises = [];
    push!(promises, self.publicGetPairSettings(params));
    marginPairsDict = Dict{Symbol, Any}();
    fetchMargin = self.checkRequiredCredentials(error = false);
    if functions.ccxtruthy(fetchMargin)
                push!(promises, self.privatePostMarginPairList(params));
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    spotResponse = get(responses, 1, nothing);
    if functions.ccxtruthy(fetchMargin)
        marginPairs = get(responses, 2, nothing);
        pairs_var = self.safeList(marginPairs, "pairs");
        marginPairsDict = indexBy(pairs_var, "name");
    end
    keys_var = objectKeys(spotResponse);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        id = get(keys_var, i + 1, nothing);
        market = get(spotResponse, Symbol(id), nothing);
        marginMarket = self.safeDict(marginPairsDict, id);
        symbol = replace(id, "_" => "/");
        (baseId, quoteId) = split(symbol, "/");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        takerString = safeString(market, "commission_taker_percent");
        makerString = safeString(market, "commission_maker_percent");
        maxQuantity = safeString(market, "max_quantity");
        marginMaxQuantity = safeString(marginMarket, "max_order_quantity");
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
    Symbol("margin") => marginMarket != nothing,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.parseNumber(stringDiv(takerString, "100")),
    Symbol("maker") => self.parseNumber(stringDiv(makerString, "100")),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1e-8"),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "price_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.safeNumber(market, "leverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_quantity"),
            Symbol("max") => self.parseNumber(stringMax(maxQuantity, marginMaxQuantity))
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_price"),
            Symbol("max") => self.safeNumber(market, "max_price")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_amount"),
            Symbol("max") => self.safeNumber(market, "max_amount")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#65eeb949-74e5-4631-9184-c38387fe53e8

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
function fetchOHLCV(self::Exmo, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    until = safeIntegerProduct(params, "until", 0.001);
    untilIsDefined = (until != nothing);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    maxLimit = 3000;
    duration = self.parseTimeframe(timeframe);
    now = self.parseToInt(milliseconds() / 1000);
    if functions.ccxtruthy(since == nothing)
        to = functions.ccxtruthy(untilIsDefined) ? min(until, now) : now;
        if functions.ccxtruthy(limit == nothing)
            limit = 1000;
        else
            limit = min(limit, maxLimit);
        end
        request[Symbol("from")] = to - (limit * duration) - 1;
        request[Symbol("to")] = to;
    else
        request[Symbol("from")] = self.parseToInt(since / 1000);
        if functions.ccxtruthy(untilIsDefined)
            request[Symbol("to")] = min(until, now);
        else
            if functions.ccxtruthy(limit == nothing)
                limit = maxLimit;
            else
                limit = min(limit, maxLimit);
            end
            to = self.sum(since, limit * duration);
            request[Symbol("to")] = min(to, now);
        end
    end
    params = omit(params, "until");
    response = Base.fetch(self.publicGetCandlesHistory(extend(request, params)));
    candles = self.safeList(response, "candles", defaultValue = []);
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Exmo, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
function parseBalance(self::Exmo, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    wallets = safeValue(response, "wallets");
    if functions.ccxtruthy(wallets != nothing)
        currencyIds = objectKeys(wallets);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
            currencyId = get(currencyIds, i + 1, nothing);
            item = get(wallets, Symbol(currencyId), nothing);
            currency = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("used")] = safeString(item, "used");
            account[Symbol("free")] = safeString(item, "free");
            account[Symbol("total")] = safeString(item, "balance");
            if functions.ccxtruthy(currency != nothing)
                result[Symbol(currency)] = account;
            end
            i += 1
        end

    else
        free = safeValue(response, "balances", Dict{Symbol, Any}());
        used = safeValue(response, "reserved", Dict{Symbol, Any}());
        currencyIds = objectKeys(free);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
            currencyId = get(currencyIds, i + 1, nothing);
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            if functions.ccxtruthy(ccxt_in(currencyId, free))
                account[Symbol("free")] = safeString(free, currencyId);
            end
            if functions.ccxtruthy(ccxt_in(currencyId, used))
                account[Symbol("used")] = safeString(used, currencyId);
            end
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#59c5160f-27a1-4d9a-8cfb-7979c7ffaac6
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8388df7-1f9f-4d41-81c4-5a387d171dc6

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: *isolated* fetches the isolated margin balance

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Exmo; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " does not support cross margin")));
    end
    if functions.ccxtruthy(marginMode == "isolated")
        response = Base.fetch(self.privatePostMarginUserWalletList(params));
    else
        response = Base.fetch(self.privatePostUserInfo(params));
    end
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Exmo, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetOrderBook(extend(request, params)));
    result = self.safeDict(response, get(market, Symbol("id"), nothing));
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bid", asksKey = "ask")

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871

# Arguments
- `symbols`::any: list of unified market symbols, all symbols fetched if undefined, default is undefined
- `limit`::int, optional: max number of entries per orderbook to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
function fetchOrderBooks(self::Exmo; symbols=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ids = nothing;
    if functions.ccxtruthy(symbols == nothing)
        allIds = self.ids;
        if functions.ccxtruthy(allIds != nothing)
            ids = join(allIds, ",");
            if functions.ccxtruthy(functions.ccxt_gt(length(ids), 2048))
                numIds = length(allIds);
                throw(ExchangeError(string(self.id, " fetchOrderBooks() has ", numIds, " symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks")));
            end
        end
    else
        requestedIds = self.marketIds(symbols = symbols);
        ids = join(requestedIds, ",");
    end
    request = Dict{Symbol, Any}(
        Symbol("pair") => ids
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetOrderBook(extend(request, params)));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        symbol = self.safeSymbol(marketId);
        rawOrderBook = self.safeDict(response, marketId, defaultValue = Dict{Symbol, Any}());
        result[Symbol(symbol)] = self.parseOrderBook(rawOrderBook, symbol, timestamp = nothing, bidsKey = "bid", asksKey = "ask");
        i += 1
    end
    return result

end
function parseTicker(self::Exmo, ticker; market=nothing)
    timestamp = safeTimestamp(ticker, "updated");
    market = self.safeMarket(marketId = nothing, market = market);
    last_var = safeString(ticker, "last_trade");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "buy_price"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "sell_price"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => safeString(ticker, "avg"),
    Symbol("baseVolume") => safeString(ticker, "vol"),
    Symbol("quoteVolume") => safeString(ticker, "vol_curr"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Exmo; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetTicker(params));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
        symbol = get(market, Symbol("symbol"), nothing);
        ticker = safeValue(response, marketId);
        result[Symbol(symbol)] = self.parseTicker(ticker, market = market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Exmo, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    market = self.market(symbol);
    return self.parseTicker(safeValue(response, get(market, Symbol("id"), nothing)), market = market)

end
function parseTrade(self::Exmo, trade; market=nothing)
    timestamp = safeTimestamp(trade, "date");
    id = safeString(trade, "trade_id");
    orderId = safeString(trade, "order_id");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "quantity");
    costString = safeString(trade, "amount");
    side = safeString2(trade, "type", "trade_type");
    type_var = nothing;
    marketId = safeString(trade, "pair");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = get(market, Symbol("symbol"), nothing);
    isMaker = safeValue(trade, "is_maker");
    takerOrMakerDefault = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMakerDefault = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    takerOrMaker = safeString(trade, "exec_type", takerOrMakerDefault);
    fee = nothing;
    feeCostString = safeString(trade, "commission_amount");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "commission_currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        feeRateString = safeString(trade, "commission_percent");
        if functions.ccxtruthy(feeRateString != nothing)
            feeRateString = stringDiv(feeRateString, "1000", 18);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode,
            Symbol("rate") => feeRateString
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#5a5a9c0d-cf17-47f6-9d62-6d4404ebd5ac

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Exmo, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    data = self.safeList(response, get(market, Symbol("id"), nothing), defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#b8d8d9af-4f46-46a1-939b-ad261d79f452  // spot
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#f4b1aaf8-399f-403b-ab5e-4926d967a106  // margin

# Arguments
- `symbol`::string: a symbol is required but it can be a single string, or a non-empty array
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: *required for margin orders* the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: last deal offset, default = 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Exmo; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " only isolated margin is supported")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    pair = get(market, Symbol("id"), nothing);
    isSpot = marginMode != "isolated";
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(isSpot)
        request[Symbol("pair")] = pair;
    else
        request[Symbol("pair_name")] = pair;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    offset = safeInteger(params, "offset", 0);
    request[Symbol("offset")] = offset;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privatePostUserTrades(extend(request, params)));
    else
        responseFromExchange = Base.fetch(self.privatePostMarginTrades(extend(request, params)));
        response = safeValue(responseFromExchange, "trades");
    end
    result = [];
    marketIdsInner = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIdsInner)))
        marketId = get(marketIdsInner, i + 1, nothing);
        resultMarket = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
        items = get(response, Symbol(marketId), nothing);
        trades = self.parseTrades(items, market = resultMarket, since = since, limit = limit);
        result = arrayConcat(result, trades);
        i += 1
    end
    return self.filterBySinceLimit(result, since = since, limit = limit)

end
"""
create a market order by providing the symbol, side and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketOrderWithCost(self::Exmo, symbol, side, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", side, cost, price = nothing, params = params))

end
"""
create a market buy order by providing the symbol and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Exmo, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
"""
create a market sell order by providing the symbol and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Exmo, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, price = nothing, params = params))

end
"""
create a trade order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#de6f4321-eeac-468c-87f7-c4ad7062e265  // stop market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#3561b86c-9ff1-436e-8e68-ac926b7eb523  // margin

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.timeInForce`::string, optional: *spot only* 'fok', 'ioc' or 'post_only'
- `params.postOnly`::bool, optional: *spot only* true for post only orders
- `params.cost`::float, optional: *spot only* *market orders only* the cost of the order in the quote currency for market orders

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Exmo, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isMarket = @functions.ccxt_and((type_var == "market"), (price == nothing));
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " only supports isolated margin")));
    end
    isSpot = (marginMode != "isolated");
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    cost = safeString(params, "cost");
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(cost == nothing)
        request[Symbol("quantity")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
    else
        request[Symbol("quantity")] = self.costToPrecision(get(market, Symbol("symbol"), nothing), cost);
    end
    clientOrderId = safeValue2(params, "client_id", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        clientOrderId = safeInteger2(params, "client_id", "clientOrderId");
        if functions.ccxtruthy(clientOrderId == nothing)
            throw(BadRequest(string(self.id, " createOrder() client order id must be an integer / numeric literal")));
        else
            request[Symbol("client_id")] = clientOrderId;
        end
    end
    leverage = self.safeNumber(params, "leverage");
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isSpot), (leverage == nothing)))
        throw(ArgumentsRequired(string(self.id, " createOrder requires an extra param params[\"leverage\"] for margin orders")));
    end
    params = omit(params, ["stopPrice", "stop_price", "triggerPrice", "timeInForce", "client_id", "clientOrderId", "cost"]);
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    if functions.ccxtruthy(isSpot)
        if functions.ccxtruthy(triggerPrice != nothing)
            if functions.ccxtruthy(type_var == "limit")
                throw(BadRequest(string(self.id, " createOrder () cannot create stop limit orders for spot, only stop market")));
            else
                request[Symbol("type")] = side;
                request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
            end
            response = Base.fetch(self.privatePostStopMarketOrderCreate(extend(request, params)));
        else
            execType = safeString(params, "exec_type");
            isPostOnly = nothing;
            (isPostOnly, params) = self.handlePostOnly(type_var == "market", execType == "post_only", params = params);
            timeInForce = safeString(params, "timeInForce");
            request[Symbol("price")] = functions.ccxtruthy(isMarket) ? 0 : self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
            if functions.ccxtruthy(type_var == "limit")
                request[Symbol("type")] = side;
            elseif functions.ccxtruthy(type_var == "market")
                marketSuffix = functions.ccxtruthy((cost != nothing)) ? "_total" : "";
                request[Symbol("type")] = string("market_", side, marketSuffix);
            end
            if functions.ccxtruthy(isPostOnly)
                request[Symbol("exec_type")] = "post_only";
            elseif functions.ccxtruthy(timeInForce != nothing)
                request[Symbol("exec_type")] = timeInForce;
            end
            response = Base.fetch(self.privatePostOrderCreate(extend(request, params)));
        end
    else
        if functions.ccxtruthy(triggerPrice != nothing)
            request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
            if functions.ccxtruthy(type_var == "limit")
                request[Symbol("type")] = string("stop_limit_", side);
            elseif functions.ccxtruthy(type_var == "market")
                request[Symbol("type")] = string("stop_", side);
            else
                request[Symbol("type")] = type_var;
            end
        else
            if functions.ccxtruthy(@functions.ccxt_or(type_var == "limit", type_var == "market"))
                request[Symbol("type")] = string(type_var, "_", side);
            else
                request[Symbol("type")] = type_var;
            end
        end
        response = Base.fetch(self.privatePostMarginUserOrderCreate(extend(request, params)));
    end
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#1f710d4b-75bc-4b65-ad68-006f863a3f26
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a4d0aae8-28f7-41ac-94fd-c4030130453d  // stop market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#705dfec5-2b35-4667-862b-faf54eca6209  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true to cancel a trigger order
- `params.marginMode`::string, optional: set to 'cross' or 'isolated' to cancel a margin order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Exmo, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    trigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " only supports isolated margin")));
    end
    if functions.ccxtruthy((marginMode == "isolated"))
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.privatePostMarginUserOrderCancel(extend(request, params)));
    else
        if functions.ccxtruthy(trigger)
            request[Symbol("parent_order_id")] = id;
            response = Base.fetch(self.privatePostStopMarketOrderCancel(extend(request, params)));
        else
            request[Symbol("order_id")] = id;
            response = Base.fetch(self.privatePostOrderCancel(extend(request, params)));
        end
    end
    return self.parseOrder(response)

end
"""
*spot only* fetches information on an order made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot

# Arguments
- `id`::string: order id
- `symbol`::string: not used by exmo fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Exmo, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => string(id)
    );
    response = Base.fetch(self.privatePostOrderTrades(extend(request, params)));
    order = self.parseOrder(response);
    order[Symbol("id")] =     string(id);
    return order

end
"""
fetch all the trades made from a single order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#00810661-9119-46c5-aec5-55abe9cb42c7  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" to fetch trades for a margin order

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Exmo, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrderTrades", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " only supports isolated margin")));
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => string(id)
    );
    if functions.ccxtruthy(marginMode == "isolated")
        response = Base.fetch(self.privatePostMarginUserOrderTrades(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrderTrades(extend(request, params)));
    end
    trades = self.safeList(response, "trades");
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#0e135370-daa4-4689-8acd-b6876dee9ba1  // spot open orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a7cfd4f0-476e-4675-b33f-22a46902f245  // margin

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" for margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Exmo; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params = params);
    isMargin = (@functions.ccxt_or((marginMode == "cross"), (marginMode == "isolated")));
    orders = [];
    if functions.ccxtruthy(isMargin)
        response = Base.fetch(self.privatePostMarginUserOrderList(params));
        params = extend(params, Dict{Symbol, Any}(
    Symbol("status") => "open"
));
        responseOrders = safeValue(response, "orders");
        orders = self.parseOrders(responseOrders, market = market, since = since, limit = limit, params = params);
    else
        response = Base.fetch(self.privatePostUserOpenOrders(params));
        marketIds = objectKeys(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            marketInner = self.safeMarket(marketId = marketId);
            params = extend(params, Dict{Symbol, Any}(
    Symbol("status") => "open"
));
            parsedOrders = self.parseOrders(get(response, Symbol(marketId), nothing), market = marketInner, since = since, limit = limit, params = params);
            orders = arrayConcat(orders, parsedOrders);
            i += 1
        end
    end
    return orders

end
function parseStatus(self::Exmo, status)
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    statuses = Dict{Symbol, Any}(
        Symbol("cancel_started") => "canceled"
    );
    if functions.ccxtruthy(findfirst("cancel", status) !== nothing)
        status = "canceled";
    end
    return safeString(statuses, status, status)

end
function parseSide(self::Exmo, orderType)
    side = Dict{Symbol, Any}(
        Symbol("limit_buy") => "buy",
        Symbol("limit_sell") => "sell",
        Symbol("market_buy") => "buy",
        Symbol("market_sell") => "sell",
        Symbol("stop_buy") => "buy",
        Symbol("stop_sell") => "sell",
        Symbol("stop_limit_buy") => "buy",
        Symbol("stop_limit_sell") => "sell",
        Symbol("trailing_stop_buy") => "buy",
        Symbol("trailing_stop_sell") => "sell",
        Symbol("stop_market_sell") => "sell",
        Symbol("stop_market_buy") => "buy",
        Symbol("buy") => "buy",
        Symbol("sell") => "sell"
    );
    return safeString(side, orderType, orderType)

end
function parseOrder(self::Exmo, order; market=nothing)
    id = safeString2(order, "order_id", "parent_order_id");
    eventTime = safeIntegerProduct2(order, "event_time", "created", 0.000001);
    timestamp = safeTimestamp(order, "created", eventTime);
    orderType = safeString2(order, "type", "order_type");
    side = self.parseSide(orderType);
    marketId = nothing;
    if functions.ccxtruthy(ccxt_in("pair", order))
        marketId = get(order, Symbol("pair"), nothing);
    elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("in_currency", order)), (ccxt_in("out_currency", order))))
        if functions.ccxtruthy(side == "buy")
            marketId = string(get(order, Symbol("in_currency"), nothing), "_", get(order, Symbol("out_currency"), nothing));
        else
            marketId = string(get(order, Symbol("out_currency"), nothing), "_", get(order, Symbol("in_currency"), nothing));
        end
    end
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    amount = safeString(order, "quantity");
    if functions.ccxtruthy(amount == nothing)
        amountField = functions.ccxtruthy((side == "buy")) ? "in_amount" : "out_amount";
        amount = safeString(order, amountField);
    end
    price = safeString(order, "price");
    cost = safeString(order, "amount");
    transactions = safeValue(order, "trades", []);
    clientOrderId = safeInteger(order, "client_id");
    triggerPrice = safeString(order, "stop_price");
    if functions.ccxtruthy(triggerPrice == "0")
        triggerPrice = nothing;
    end
    type_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((orderType != "buy"), (orderType != "sell")))
        type_var = orderType;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => safeIntegerProduct(order, "updated", 0.000001),
    Symbol("status") => self.parseStatus(safeString(order, "order_status")),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("average") => nothing,
    Symbol("trades") => transactions,
    Symbol("fee") => nothing,
    Symbol("info") => order
), market = market)

end
"""
fetches information on multiple canceled orders made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#1d2524dd-ae6d-403a-a067-77b50d13fbe5  // margin
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a51be1d0-af5f-44e4-99d7-f7b04c6067d0  // spot canceled orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" for margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Exmo; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchCanceledOrders", params = params);
    if functions.ccxtruthy(marginMode == "cross")
        throw(BadRequest(string(self.id, " only supports isolated margin")));
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    isSpot = (marginMode != "isolated");
    if functions.ccxtruthy(symbol != nothing)
        marketInner = self.market(symbol);
        symbol = get(marketInner, Symbol("symbol"), nothing);
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => limit
    );
    request[Symbol("offset")] = functions.ccxtruthy((since != nothing)) ? limit : 0;
    request[Symbol("limit")] = limit;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privatePostUserCancelledOrders(extend(request, params)));
        params = extend(params, Dict{Symbol, Any}(
    Symbol("status") => "canceled"
));
            return self.parseOrders(response, market = market, since = since, limit = limit, params = params)
    end
    responseSwap = Base.fetch(self.privatePostMarginUserOrderHistory(extend(request, params)));
    items = safeValue(responseSwap, "items");
    orders = self.parseOrders(items, market = market, since = since, limit = limit, params = params);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        if functions.ccxtruthy(get(order, Symbol("status"), nothing) == "canceled")
                        push!(result, order);
        end
        i += 1
    end
    return result

end
"""
*margin only* edit a trade order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#f27ee040-c75f-4b59-b608-d05bd45b7899  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: unified CCXT market symbol
- `type`::string: not used by exmo editOrder
- `side`::string: not used by exmo editOrder
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: stop price for stop-market and stop-limit orders
- `params.marginMode`::string: must be set to isolated EXCHANGE SPECIFIC PARAMETERS
- `params.distance`::int, optional: distance for trailing stop orders
- `params.expire`::int, optional: expiration timestamp in UTC timezone for the order. order will not be expired if expire is 0
- `params.comment`::string, optional: optional comment for order. up to 50 latin symbols, whitespaces, underscores

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Exmo, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("editOrder", params = params);
    if functions.ccxtruthy(marginMode != "isolated")
        throw(BadRequest(string(self.id, " editOrder() can only be used for isolated margin orders")));
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    params = omit(params, ["triggerPrice", "stopPrice"]);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = amount;
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), triggerPrice);
    end
    response = Base.fetch(self.privatePostMarginUserOrderUpdate(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch the deposit address for a currency associated with this account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8f9ced9-7ab6-4383-a6a4-bc54469ba60e

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Exmo, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostDepositAddress(params));
    depositAddress = safeString(response, code);
    address = nothing;
    tag = nothing;
    if functions.ccxtruthy(depositAddress)
        addressAndTag = split(depositAddress, ",");
        address = get(addressAndTag, 1, nothing);
        numParts = length(addressAndTag);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
            tag = get(addressAndTag, 2, nothing);
        end
    end
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function getMarketFromTrades(self::Exmo, trades)
    tradesBySymbol = indexBy(trades, "pair");
    symbols = objectKeys(tradesBySymbol);
    numSymbols = length(symbols);
    if functions.ccxtruthy(numSymbols == 1)
            return self.market(get(symbols, 1, nothing))
    end
    return nothing

end
"""
make a withdrawal
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#3ab9c34d-ad58-4f87-9c57-2e2ea88a8325

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Exmo, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("invoice")] = tag;
    end
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network");
    network = safeString(networks, network, network);
    if functions.ccxtruthy(network != nothing)
        request[Symbol("transport")] = network;
        params = omit(params, "network");
    end
    response = Base.fetch(self.privatePostWithdrawCrypt(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTransactionStatus(self::Exmo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("transferred") => "ok",
        Symbol("paid") => "ok",
        Symbol("pending") => "pending",
        Symbol("processing") => "pending",
        Symbol("verifying") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Exmo, transaction; currency=nothing)
    timestamp = safeTimestamp2(transaction, "dt", "created");
    amountString = safeString(transaction, "amount");
    if functions.ccxtruthy(amountString != nothing)
        amountString = stringAbs(amountString);
    end
    txid = safeString(transaction, "txid");
    if functions.ccxtruthy(txid == nothing)
        extra = safeValue(transaction, "extra", Dict{Symbol, Any}());
        extraTxid = safeString(extra, "txid");
        if functions.ccxtruthy(extraTxid != "")
            txid = extraTxid;
        end
    end
    type_var = safeString(transaction, "type");
    currencyId = safeString2(transaction, "curr", "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    address = nothing;
    comment = nothing;
    account = safeString(transaction, "account");
    if functions.ccxtruthy(type_var == "deposit")
        comment = account;
    elseif functions.ccxtruthy(type_var == "withdrawal")
        address = account;
        if functions.ccxtruthy(address != nothing)
            parts = split(address, ":");
            numParts = length(parts);
            if functions.ccxtruthy(numParts == 2)
                address = safeString(parts, 1);
                if functions.ccxtruthy(address != nothing)
                    address = replace(address, " " => "");
                end
            end
        end
    end
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    if functions.ccxtruthy(!functions.ccxtruthy(get(get(self.fees, Symbol("transaction"), nothing), Symbol("percentage"), nothing)))
        key = functions.ccxtruthy((type_var == "withdrawal")) ? "withdraw" : "deposit";
        feeCost = safeString(transaction, "commission");
        if functions.ccxtruthy(feeCost == nothing)
            transactionFees = safeValue(self.options, "transactionFees", Dict{Symbol, Any}());
            codeFees = safeValue(transactionFees, code, Dict{Symbol, Any}());
            feeCost = safeString(codeFees, key);
        end
        provider = safeString(transaction, "provider");
        if functions.ccxtruthy(provider == "cashback")
            feeCost = "0";
        end
        if functions.ccxtruthy(feeCost != nothing)
            if functions.ccxtruthy(type_var == "withdrawal")
                amountString = stringSub(amountString, feeCost);
            end
            fee[Symbol("cost")] = self.parseNumber(feeCost);
            fee[Symbol("currency")] = code;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "order_id", "task_id"),
    Symbol("txid") => txid,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => safeString(transaction, "provider"),
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("status") => self.parseTransactionStatus(safeStringLower(transaction, "status")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => safeTimestamp(transaction, "updated"),
    Symbol("comment") => comment,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
"""
fetch history of deposits and withdrawals
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#31e69a33-4849-4e6a-b4b4-6d574238f6a7

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Exmo; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("date")] = self.parseToInt(since / 1000);
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privatePostWalletHistory(extend(request, params)));
    history = self.safeList(response, "history", defaultValue = []);
    return self.parseTransactions(history, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Exmo; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("type") => "withdraw"
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostWalletOperations(extend(request, params)));
    items = self.safeList(response, "items", defaultValue = []);
    return self.parseTransactions(items, currency = currency, since = since, limit = limit)

end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawal(self::Exmo, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("type") => "withdraw"
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostWalletOperations(extend(request, params)));
    items = safeValue(response, "items", []);
    first_var = self.safeDict(items, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency = currency)

end
"""
fetch information on a deposit
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `id`::string: deposit id
- `code`::string: unified currency code, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Exmo, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("type") => "deposit"
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostWalletOperations(extend(request, params)));
    items = safeValue(response, "items", []);
    first_var = self.safeDict(items, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency = currency)

end
"""
fetch all deposits made to an account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Exmo; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("type") => "deposit"
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostWalletOperations(extend(request, params)));
    items = self.safeList(response, "items", defaultValue = []);
    return self.parseTransactions(items, currency = currency, since = since, limit = limit)

end
function sign(self::Exmo, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/");
    if functions.ccxtruthy(api != "web")
        url += string(self.version, "/");
    end
    url += path;
    if functions.ccxtruthy(@functions.ccxt_or((api == "public"), (api == "web")))
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = self.nonce();
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("nonce") => nonce
), params));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("Key") => self.apiKey,
            Symbol("Sign") => self.hmac(self.encode(body), self.encode(self.secret), sha512)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function nonce(self::Exmo, )
    return milliseconds()

end
function handleErrors(self::Exmo, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("error", response)), !functions.ccxtruthy((ccxt_in("result", response)))))
        errorCode = safeValue(response, "error", Dict{Symbol, Any}());
        messageError = safeString(errorCode, "msg");
        code = safeString(errorCode, "code");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), messageError, feedback);
        throw(ExchangeError(feedback));
    end
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("result", response)), (ccxt_in("errmsg", response))))
        success = self.safeBool(response, "result", defaultValue = false);
        if functions.ccxtruthy(isa(success, AbstractString))
            if functions.ccxtruthy(@functions.ccxt_or((success == "true"), (success == "1")))
                success = true;
            else
                success = false;
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy(success))
            code = nothing;
            message = safeString2(response, "error", "errmsg");
            if functions.ccxtruthy(message == nothing)
                throw(ExchangeError(string(self.id, " handleErrors() missing message")));
            end
            errorParts = split(message, ":");
            numParts = length(errorParts);
            if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
                errorSubParts = split(get(errorParts, 1, nothing), " ");
                numSubParts = length(errorSubParts);
                code = functions.ccxtruthy((functions.ccxt_gt(numSubParts, 1))) ? get(errorSubParts, 2, nothing) : get(errorSubParts, 1, nothing);
            end
            feedback = string(self.id, " ", body);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Exmo, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function webGetCtrlFeesAndLimits(self::Exmo, params=Dict(), context=Dict())
    return request(self, "ctrl/feesAndLimits"; api="web", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function webGetEnDocsFees(self::Exmo, params=Dict(), context=Dict())
    return request(self, "en/docs/fees"; api="web", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrency(self::Exmo, params=Dict(), context=Dict())
    return request(self, "currency"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencyListExtended(self::Exmo, params=Dict(), context=Dict())
    return request(self, "currency/list/extended"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBook(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_book"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPairSettings(self::Exmo, params=Dict(), context=Dict())
    return request(self, "pair_settings"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Exmo, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "candles_history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetRequiredAmount(self::Exmo, params=Dict(), context=Dict())
    return request(self, "required_amount"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPaymentsProvidersCryptoList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "payments/providers/crypto/list"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStopMarketOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "stop_market_order_create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStopMarketOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "stop_market_order_cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserOpenOrders(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_open_orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserCancelledOrders(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_cancelled_orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositAddress(self::Exmo, params=Dict(), context=Dict())
    return request(self, "deposit_address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawCrypt(self::Exmo, params=Dict(), context=Dict())
    return request(self, "withdraw_crypt"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawGetTxid(self::Exmo, params=Dict(), context=Dict())
    return request(self, "withdraw_get_txid"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostExcodeCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "excode_create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostExcodeLoad(self::Exmo, params=Dict(), context=Dict())
    return request(self, "excode_load"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCodeCheck(self::Exmo, params=Dict(), context=Dict())
    return request(self, "code_check"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "wallet_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletOperations(self::Exmo, params=Dict(), context=Dict())
    return request(self, "wallet_operations"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderUpdate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/update"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionClose(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/close"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionMarginAdd(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_add"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionMarginRemove(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_remove"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginCurrencyList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/currency/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginPairList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/pair/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginSettings(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/settings"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginFundingList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/funding/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserOrderMaxQuantity(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/max_quantity"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionMarginRemoveInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_remove_info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserPositionMarginAddInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_add_info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserWalletList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/wallet/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserWalletHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/wallet/history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginUserTradeList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/trade/list"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginLiquidationFeed(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/liquidation/feed"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Exmo(; kwargs...)
    inst = Exmo(Exchange(), describe, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchTradingFees, fetchPrivateTradingFees, fetchPublicTradingFees, parseFixedFloatValue, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchCurrencies, parseCurrency, fetchMarkets, fetchOHLCV, parseOHLCV, parseBalance, fetchBalance, fetchOrderBook, fetchOrderBooks, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchTrades, fetchMyTrades, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, cancelOrder, fetchOrder, fetchOrderTrades, fetchOpenOrders, parseStatus, parseSide, parseOrder, fetchCanceledOrders, editOrder, fetchDepositAddress, getMarketFromTrades, withdraw, parseTransactionStatus, parseTransaction, fetchDepositsWithdrawals, fetchWithdrawals, fetchWithdrawal, fetchDeposit, fetchDeposits, sign, nonce, handleErrors, webGetCtrlFeesAndLimits, webGetEnDocsFees, publicGetCurrency, publicGetCurrencyListExtended, publicGetOrderBook, publicGetPairSettings, publicGetTicker, publicGetTrades, publicGetCandlesHistory, publicGetRequiredAmount, publicGetPaymentsProvidersCryptoList, privatePostUserInfo, privatePostOrderCreate, privatePostOrderCancel, privatePostStopMarketOrderCreate, privatePostStopMarketOrderCancel, privatePostUserOpenOrders, privatePostUserTrades, privatePostUserCancelledOrders, privatePostOrderTrades, privatePostDepositAddress, privatePostWithdrawCrypt, privatePostWithdrawGetTxid, privatePostExcodeCreate, privatePostExcodeLoad, privatePostCodeCheck, privatePostWalletHistory, privatePostWalletOperations, privatePostMarginUserOrderCreate, privatePostMarginUserOrderUpdate, privatePostMarginUserOrderCancel, privatePostMarginUserPositionClose, privatePostMarginUserPositionMarginAdd, privatePostMarginUserPositionMarginRemove, privatePostMarginCurrencyList, privatePostMarginPairList, privatePostMarginSettings, privatePostMarginFundingList, privatePostMarginUserInfo, privatePostMarginUserOrderList, privatePostMarginUserOrderHistory, privatePostMarginUserOrderTrades, privatePostMarginUserOrderMaxQuantity, privatePostMarginUserPositionList, privatePostMarginUserPositionMarginRemoveInfo, privatePostMarginUserPositionMarginAddInfo, privatePostMarginUserWalletList, privatePostMarginUserWalletHistory, privatePostMarginUserTradeList, privatePostMarginTrades, privatePostMarginLiquidationFeed)
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
function __ccxt_doc_Exmo_reduceMargin() end
"""
remove margin from a position
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#eebf9f25-0289-4946-9482-89872c738449

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Exmo_reduceMargin

function __ccxt_doc_Exmo_addMargin() end
"""
add margin
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#143ef808-79ca-4e49-9e79-a60ea4d8c0e3

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Exmo_addMargin

function __ccxt_doc_Exmo_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#90927062-256c-4b03-900f-2b99131f9a54
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Exmo_fetchTradingFees

function __ccxt_doc_Exmo_fetchTransactionFees() end
"""
please use fetchDepositWithdrawFees instead
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction fees structures]{@link https://docs.ccxt.com/?id=fees-structure}
"""
__ccxt_doc_Exmo_fetchTransactionFees

function __ccxt_doc_Exmo_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction fees structures]{@link https://docs.ccxt.com/?id=fees-structure}
"""
__ccxt_doc_Exmo_fetchDepositWithdrawFees

function __ccxt_doc_Exmo_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7cdf0ca8-9ff6-4cf3-aa33-bcec83155c49
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Exmo_fetchCurrencies

function __ccxt_doc_Exmo_fetchMarkets() end
"""
retrieves data on all markets for exmo
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Exmo_fetchMarkets

function __ccxt_doc_Exmo_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#65eeb949-74e5-4631-9184-c38387fe53e8

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
__ccxt_doc_Exmo_fetchOHLCV

function __ccxt_doc_Exmo_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#59c5160f-27a1-4d9a-8cfb-7979c7ffaac6
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8388df7-1f9f-4d41-81c4-5a387d171dc6

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: *isolated* fetches the isolated margin balance

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Exmo_fetchBalance

function __ccxt_doc_Exmo_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Exmo_fetchOrderBook

function __ccxt_doc_Exmo_fetchOrderBooks() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871

# Arguments
- `symbols`::any: list of unified market symbols, all symbols fetched if undefined, default is undefined
- `limit`::int, optional: max number of entries per orderbook to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
__ccxt_doc_Exmo_fetchOrderBooks

function __ccxt_doc_Exmo_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Exmo_fetchTickers

function __ccxt_doc_Exmo_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Exmo_fetchTicker

function __ccxt_doc_Exmo_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#5a5a9c0d-cf17-47f6-9d62-6d4404ebd5ac

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Exmo_fetchTrades

function __ccxt_doc_Exmo_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#b8d8d9af-4f46-46a1-939b-ad261d79f452  // spot
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#f4b1aaf8-399f-403b-ab5e-4926d967a106  // margin

# Arguments
- `symbol`::string: a symbol is required but it can be a single string, or a non-empty array
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: *required for margin orders* the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: last deal offset, default = 0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Exmo_fetchMyTrades

function __ccxt_doc_Exmo_createMarketOrderWithCost() end
"""
create a market order by providing the symbol, side and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_createMarketOrderWithCost

function __ccxt_doc_Exmo_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_createMarketBuyOrderWithCost

function __ccxt_doc_Exmo_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_createMarketSellOrderWithCost

function __ccxt_doc_Exmo_createOrder() end
"""
create a trade order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#de6f4321-eeac-468c-87f7-c4ad7062e265  // stop market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#3561b86c-9ff1-436e-8e68-ac926b7eb523  // margin

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.timeInForce`::string, optional: *spot only* 'fok', 'ioc' or 'post_only'
- `params.postOnly`::bool, optional: *spot only* true for post only orders
- `params.cost`::float, optional: *spot only* *market orders only* the cost of the order in the quote currency for market orders

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_createOrder

function __ccxt_doc_Exmo_cancelOrder() end
"""
cancels an open order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#1f710d4b-75bc-4b65-ad68-006f863a3f26
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a4d0aae8-28f7-41ac-94fd-c4030130453d  // stop market
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#705dfec5-2b35-4667-862b-faf54eca6209  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true to cancel a trigger order
- `params.marginMode`::string, optional: set to 'cross' or 'isolated' to cancel a margin order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_cancelOrder

function __ccxt_doc_Exmo_fetchOrder() end
"""
*spot only* fetches information on an order made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot

# Arguments
- `id`::string: order id
- `symbol`::string: not used by exmo fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_fetchOrder

function __ccxt_doc_Exmo_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#00810661-9119-46c5-aec5-55abe9cb42c7  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" to fetch trades for a margin order

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Exmo_fetchOrderTrades

function __ccxt_doc_Exmo_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#0e135370-daa4-4689-8acd-b6876dee9ba1  // spot open orders
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a7cfd4f0-476e-4675-b33f-22a46902f245  // margin

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" for margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_fetchOpenOrders

function __ccxt_doc_Exmo_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#1d2524dd-ae6d-403a-a067-77b50d13fbe5  // margin
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#a51be1d0-af5f-44e4-99d7-f7b04c6067d0  // spot canceled orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: set to "isolated" for margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_fetchCanceledOrders

function __ccxt_doc_Exmo_editOrder() end
"""
*margin only* edit a trade order
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#f27ee040-c75f-4b59-b608-d05bd45b7899  // margin

# Arguments
- `id`::string: order id
- `symbol`::string: unified CCXT market symbol
- `type`::string: not used by exmo editOrder
- `side`::string: not used by exmo editOrder
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: stop price for stop-market and stop-limit orders
- `params.marginMode`::string: must be set to isolated EXCHANGE SPECIFIC PARAMETERS
- `params.distance`::int, optional: distance for trailing stop orders
- `params.expire`::int, optional: expiration timestamp in UTC timezone for the order. order will not be expired if expire is 0
- `params.comment`::string, optional: optional comment for order. up to 50 latin symbols, whitespaces, underscores

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Exmo_editOrder

function __ccxt_doc_Exmo_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8f9ced9-7ab6-4383-a6a4-bc54469ba60e

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Exmo_fetchDepositAddress

function __ccxt_doc_Exmo_withdraw() end
"""
make a withdrawal
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#3ab9c34d-ad58-4f87-9c57-2e2ea88a8325

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_withdraw

function __ccxt_doc_Exmo_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#31e69a33-4849-4e6a-b4b4-6d574238f6a7

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_fetchDepositsWithdrawals

function __ccxt_doc_Exmo_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_fetchWithdrawals

function __ccxt_doc_Exmo_fetchWithdrawal() end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_fetchWithdrawal

function __ccxt_doc_Exmo_fetchDeposit() end
"""
fetch information on a deposit
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `id`::string: deposit id
- `code`::string: unified currency code, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_fetchDeposit

function __ccxt_doc_Exmo_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Exmo_fetchDeposits
