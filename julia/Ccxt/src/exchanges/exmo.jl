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
            Symbol("get") => ["ctrl/feesAndLimits", "en/docs/fees"]
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["currency", "currency/list/extended", "order_book", "pair_settings", "ticker", "trades", "candles_history", "required_amount", "payments/providers/crypto/list"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => ["user_info", "order_create", "order_cancel", "stop_market_order_create", "stop_market_order_cancel", "user_open_orders", "user_trades", "user_cancelled_orders", "order_trades", "deposit_address", "withdraw_crypt", "withdraw_get_txid", "excode_create", "excode_load", "code_check", "wallet_history", "wallet_operations", "margin/user/order/create", "margin/user/order/update", "margin/user/order/cancel", "margin/user/position/close", "margin/user/position/margin_add", "margin/user/position/margin_remove", "margin/currency/list", "margin/pair/list", "margin/settings", "margin/funding/list", "margin/user/info", "margin/user/order/list", "margin/user/order/history", "margin/user/order/trades", "margin/user/order/max_quantity", "margin/user/position/list", "margin/user/position/margin_remove_info", "margin/user/position/margin_add_info", "margin/user/wallet/list", "margin/user/wallet/history", "margin/user/trade/list", "margin/trades", "margin/liquidation/feed"]
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
function modifyMarginHelper(self::Exmo, symbol, amount, type_var, params=Dict())
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
    margin = self.parseMarginModification(response, market);
    options = safeValue(self.options, "margin", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(options, "fillResponseFromRequest", true);
    if functions.ccxtruthy(fillResponseFromRequest)
        margin[Symbol("type")] = type_var;
        margin[Symbol("amount")] = amount;
    end
    return margin

end
function parseMarginModification(self::Exmo, data, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(nothing, market),
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
function reduceMargin(self::Exmo, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params))

end
function addMargin(self::Exmo, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params))

end
function fetchTradingFees(self::Exmo, params=Dict())
    options = safeValue(self.options, "fetchTradingFees", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "fetchPrivateTradingFees");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    if functions.ccxtruthy(method == "fetchPrivateTradingFees")
            return Base.fetch(self.fetchPrivateTradingFees(params))
    end
    return Base.fetch(self.fetchPublicTradingFees(params))

end
function fetchPrivateTradingFees(self::Exmo, params=Dict())
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
        symbol = self.safeSymbol(marketId, nothing, "_");
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
function fetchPublicTradingFees(self::Exmo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetPairSettings(params));
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
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
function fetchTransactionFees(self::Exmo, codes=nothing, params=Dict())
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
            result[Symbol(code)][Symbol(typeInner)] = fee;
            j += 1
        end
        result[Symbol(code)][Symbol("info")] = providers;
        i += 1
    end
    self.options[Symbol("transactionFees")] = result;
    return result

end
function fetchDepositWithdrawFees(self::Exmo, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetPaymentsProvidersCryptoList(params));
    result = self.parseDepositWithdrawFees(response, codes);
    self.options[Symbol("transactionFees")] = result;
    return result

end
function parseDepositWithdrawFee(self::Exmo, fee, currency=nothing)
    result = self.depositWithdrawFee(fee);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fee)))
        provider = get(fee, i + 1, nothing);
        type_var = safeString(provider, "type");
        networkId = safeString(provider, "name");
        currencyId = safeString(provider, "currency_name");
        currency = self.safeCurrency(currencyId, currency);
        code = safeString(currency, "code");
        networkCode = self.networkIdToCode(networkId, code);
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
        result[Symbol("networks")][Symbol(networkCode)][Symbol(type_var)] = Dict{Symbol, Any}(
            Symbol("fee") => self.parseFixedFloatValue(safeString(splitCommissionDesc, 0)),
            Symbol("percentage") => percentage
        );
        i += 1
    end
    return self.assignDefaultDepositWithdrawFees(result)

end
function fetchCurrencies(self::Exmo, params=Dict())
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
    currency = self.safeDict(rawCurrency, "currency", Dict{Symbol, Any}());
    providers = self.safeList(rawCurrency, "providers", []);
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
            networkId = replace(name, string(currencyId, " ") => "");
            networkId = replace(networkId, "(" => "");
            replaceChar = ")";
            networkId = replace(networkId, replaceChar => "");
            networkCode = self.networkIdToCode(networkId, code);
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(networkCode, networks))))
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
            typeInner = safeString(provider, "type");
            minValue = safeString(provider, "min");
            maxValue = safeString(provider, "max");
            activeProvider = self.safeBool(provider, "enabled");
            networkEntry = get(networks, Symbol(networkCode), nothing);
            if functions.ccxtruthy(typeInner == "deposit")
                networkEntry[Symbol("deposit")] = activeProvider;
                networkEntry[Symbol("limits")][Symbol("deposit")][Symbol("min")] = minValue;
                networkEntry[Symbol("limits")][Symbol("deposit")][Symbol("max")] = maxValue;
            elseif functions.ccxtruthy(typeInner == "withdraw")
                networkEntry[Symbol("withdraw")] = activeProvider;
                networkEntry[Symbol("limits")][Symbol("withdraw")][Symbol("min")] = minValue;
                networkEntry[Symbol("limits")][Symbol("withdraw")][Symbol("max")] = maxValue;
            end
            info = self.safeList(networkEntry, "info", []);
            push!(info, provider);
            networkEntry[Symbol("info")] = info;
            networks[Symbol(networkCode)] = networkEntry;
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
function fetchMarkets(self::Exmo, params=Dict())
    promises = [];
    push!(promises, self.publicGetPairSettings(params));
    marginPairsDict = Dict{Symbol, Any}();
    fetchMargin = self.checkRequiredCredentials(false);
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
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "price_precision")))
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
function fetchOHLCV(self::Exmo, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    candles = self.safeList(response, "candles", []);
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Exmo, ohlcv, market=nothing)
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
            result[Symbol(currency)] = account;
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
            result[Symbol(code)] = account;
            i += 1
        end
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Exmo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params);
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
function fetchOrderBook(self::Exmo, symbol, limit=nothing, params=Dict())
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
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), nothing, "bid", "ask")

end
function fetchOrderBooks(self::Exmo, symbols=nothing, limit=nothing, params=Dict())
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
        requestedIds = self.marketIds(symbols);
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
        result[Symbol(symbol)] = self.parseOrderBook(get(response, Symbol(marketId), nothing), symbol, nothing, "bid", "ask");
        i += 1
    end
    return result

end
function parseTicker(self::Exmo, ticker, market=nothing)
    timestamp = safeTimestamp(ticker, "updated");
    market = self.safeMarket(nothing, market);
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
), market)

end
function fetchTickers(self::Exmo, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetTicker(params));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = self.safeMarket(marketId, nothing, "_");
        symbol = get(market, Symbol("symbol"), nothing);
        ticker = safeValue(response, marketId);
        result[Symbol(symbol)] = self.parseTicker(ticker, market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchTicker(self::Exmo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    market = self.market(symbol);
    return self.parseTicker(get(response, Symbol(get(market, Symbol("id"), nothing)), nothing), market)

end
function parseTrade(self::Exmo, trade, market=nothing)
    timestamp = safeTimestamp(trade, "date");
    id = safeString(trade, "trade_id");
    orderId = safeString(trade, "order_id");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "quantity");
    costString = safeString(trade, "amount");
    side = safeString2(trade, "type", "trade_type");
    type_var = nothing;
    marketId = safeString(trade, "pair");
    market = self.safeMarket(marketId, market, "_");
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
), market)

end
function fetchTrades(self::Exmo, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    data = self.safeList(response, get(market, Symbol("id"), nothing), []);
    return self.parseTrades(data, market, since, limit)

end
function fetchMyTrades(self::Exmo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params);
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
        resultMarket = self.safeMarket(marketId, nothing, "_");
        items = get(response, Symbol(marketId), nothing);
        trades = self.parseTrades(items, resultMarket, since, limit);
        result = arrayConcat(result, trades);
        i += 1
    end
    return self.filterBySinceLimit(result, since, limit)

end
function createMarketOrderWithCost(self::Exmo, symbol, side, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", side, cost, nothing, params))

end
function createMarketBuyOrderWithCost(self::Exmo, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function createMarketSellOrderWithCost(self::Exmo, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("cost") => cost
));
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, nothing, params))

end
function createOrder(self::Exmo, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isMarket = @functions.ccxt_and((type_var == "market"), (price == nothing));
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
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
            (isPostOnly, params) = self.handlePostOnly(type_var == "market", execType == "post_only", params);
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
    return self.parseOrder(response, market)

end
function cancelOrder(self::Exmo, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    trigger = safeValue2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params);
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
function fetchOrder(self::Exmo, id, symbol=nothing, params=Dict())
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
function fetchOrderTrades(self::Exmo, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrderTrades", params);
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
    return self.parseTrades(trades, market, since, limit)

end
function fetchOpenOrders(self::Exmo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params);
    isMargin = (@functions.ccxt_or((marginMode == "cross"), (marginMode == "isolated")));
    orders = [];
    if functions.ccxtruthy(isMargin)
        response = Base.fetch(self.privatePostMarginUserOrderList(params));
        params = extend(params, Dict{Symbol, Any}(
    Symbol("status") => "open"
));
        responseOrders = safeValue(response, "orders");
        orders = self.parseOrders(responseOrders, market, since, limit, params);
    else
        response = Base.fetch(self.privatePostUserOpenOrders(params));
        marketIds = objectKeys(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            marketInner = self.safeMarket(marketId);
            params = extend(params, Dict{Symbol, Any}(
    Symbol("status") => "open"
));
            parsedOrders = self.parseOrders(get(response, Symbol(marketId), nothing), marketInner, since, limit, params);
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
function parseOrder(self::Exmo, order, market=nothing)
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
    market = self.safeMarket(marketId, market);
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
), market)

end
function fetchCanceledOrders(self::Exmo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrders", params);
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
            return self.parseOrders(response, market, since, limit, params)
    end
    responseSwap = Base.fetch(self.privatePostMarginUserOrderHistory(extend(request, params)));
    items = safeValue(responseSwap, "items");
    orders = self.parseOrders(items, market, since, limit, params);
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
function editOrder(self::Exmo, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("editOrder", params);
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
function fetchDepositAddress(self::Exmo, code, params=Dict())
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
    self.checkAddress(address);
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
            return get(self.markets, Symbol(get(symbols, 1, nothing)), nothing)
    end
    return nothing

end
function withdraw(self::Exmo, code, amount, address, tag=nothing, params=Dict())
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
    return self.parseTransaction(response, currency)

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
function parseTransaction(self::Exmo, transaction, currency=nothing)
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
    code = self.safeCurrencyCode(currencyId, currency);
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
                address = replace(address, " " => "");
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
function fetchDepositsWithdrawals(self::Exmo, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(get(response, Symbol("history"), nothing), currency, since, limit)

end
function fetchWithdrawals(self::Exmo, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    items = self.safeList(response, "items", []);
    return self.parseTransactions(items, currency, since, limit)

end
function fetchWithdrawal(self::Exmo, id, code=nothing, params=Dict())
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
    first_var = self.safeDict(items, 0, Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency)

end
function fetchDeposit(self::Exmo, id, code=nothing, params=Dict())
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
    first_var = self.safeDict(items, 0, Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency)

end
function fetchDeposits(self::Exmo, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    items = self.safeList(response, "items", []);
    return self.parseTransactions(items, currency, since, limit)

end
function sign(self::Exmo, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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
        success = self.safeBool(response, "result", false);
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Exmo, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function webGetCtrlFeesAndLimits(self::Exmo, params=Dict(), context=Dict())
    return request(self, "ctrl/feesAndLimits", "web", "GET", params, nothing, nothing, Dict())
end

function webGetEnDocsFees(self::Exmo, params=Dict(), context=Dict())
    return request(self, "en/docs/fees", "web", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrency(self::Exmo, params=Dict(), context=Dict())
    return request(self, "currency", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrencyListExtended(self::Exmo, params=Dict(), context=Dict())
    return request(self, "currency/list/extended", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrderBook(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_book", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPairSettings(self::Exmo, params=Dict(), context=Dict())
    return request(self, "pair_settings", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Exmo, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "candles_history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRequiredAmount(self::Exmo, params=Dict(), context=Dict())
    return request(self, "required_amount", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPaymentsProvidersCryptoList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "payments/providers/crypto/list", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostUserInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostStopMarketOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "stop_market_order_create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostStopMarketOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "stop_market_order_cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserOpenOrders(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_open_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUserCancelledOrders(self::Exmo, params=Dict(), context=Dict())
    return request(self, "user_cancelled_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "order_trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositAddress(self::Exmo, params=Dict(), context=Dict())
    return request(self, "deposit_address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawCrypt(self::Exmo, params=Dict(), context=Dict())
    return request(self, "withdraw_crypt", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawGetTxid(self::Exmo, params=Dict(), context=Dict())
    return request(self, "withdraw_get_txid", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExcodeCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "excode_create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExcodeLoad(self::Exmo, params=Dict(), context=Dict())
    return request(self, "excode_load", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCodeCheck(self::Exmo, params=Dict(), context=Dict())
    return request(self, "code_check", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "wallet_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWalletOperations(self::Exmo, params=Dict(), context=Dict())
    return request(self, "wallet_operations", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderCreate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderUpdate(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/update", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderCancel(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionClose(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/close", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionMarginAdd(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_add", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionMarginRemove(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_remove", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginCurrencyList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/currency/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginPairList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/pair/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginSettings(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/settings", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginFundingList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/funding/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserOrderMaxQuantity(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/order/max_quantity", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionMarginRemoveInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_remove_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserPositionMarginAddInfo(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/position/margin_add_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserWalletList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/wallet/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserWalletHistory(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/wallet/history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginUserTradeList(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/user/trade/list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginTrades(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMarginLiquidationFeed(self::Exmo, params=Dict(), context=Dict())
    return request(self, "margin/liquidation/feed", "private", "POST", params, nothing, nothing, Dict())
end

function Exmo(; kwargs...)
    inst = Exmo(Exchange(), describe, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchTradingFees, fetchPrivateTradingFees, fetchPublicTradingFees, parseFixedFloatValue, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchCurrencies, parseCurrency, fetchMarkets, fetchOHLCV, parseOHLCV, parseBalance, fetchBalance, fetchOrderBook, fetchOrderBooks, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchTrades, fetchMyTrades, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, cancelOrder, fetchOrder, fetchOrderTrades, fetchOpenOrders, parseStatus, parseSide, parseOrder, fetchCanceledOrders, editOrder, fetchDepositAddress, getMarketFromTrades, withdraw, parseTransactionStatus, parseTransaction, fetchDepositsWithdrawals, fetchWithdrawals, fetchWithdrawal, fetchDeposit, fetchDeposits, sign, nonce, handleErrors, webGetCtrlFeesAndLimits, webGetEnDocsFees, publicGetCurrency, publicGetCurrencyListExtended, publicGetOrderBook, publicGetPairSettings, publicGetTicker, publicGetTrades, publicGetCandlesHistory, publicGetRequiredAmount, publicGetPaymentsProvidersCryptoList, privatePostUserInfo, privatePostOrderCreate, privatePostOrderCancel, privatePostStopMarketOrderCreate, privatePostStopMarketOrderCancel, privatePostUserOpenOrders, privatePostUserTrades, privatePostUserCancelledOrders, privatePostOrderTrades, privatePostDepositAddress, privatePostWithdrawCrypt, privatePostWithdrawGetTxid, privatePostExcodeCreate, privatePostExcodeLoad, privatePostCodeCheck, privatePostWalletHistory, privatePostWalletOperations, privatePostMarginUserOrderCreate, privatePostMarginUserOrderUpdate, privatePostMarginUserOrderCancel, privatePostMarginUserPositionClose, privatePostMarginUserPositionMarginAdd, privatePostMarginUserPositionMarginRemove, privatePostMarginCurrencyList, privatePostMarginPairList, privatePostMarginSettings, privatePostMarginFundingList, privatePostMarginUserInfo, privatePostMarginUserOrderList, privatePostMarginUserOrderHistory, privatePostMarginUserOrderTrades, privatePostMarginUserOrderMaxQuantity, privatePostMarginUserPositionList, privatePostMarginUserPositionMarginRemoveInfo, privatePostMarginUserPositionMarginAddInfo, privatePostMarginUserWalletList, privatePostMarginUserWalletHistory, privatePostMarginUserTradeList, privatePostMarginTrades, privatePostMarginLiquidationFeed)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
