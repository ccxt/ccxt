@kwdef mutable struct Upbit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrency::Function = fetchCurrency
    fetchCurrencyById::Function = fetchCurrencyById
    fetchMarket::Function = fetchMarket
    fetchMarketById::Function = fetchMarketById
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBooks::Function = fetchOrderBooks
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    idsQueryStrings::Function = idsQueryStrings
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    calcOrderPrice::Function = calcOrderPrice
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    editOrder::Function = editOrder
    fetchDeposits::Function = fetchDeposits
    fetchDeposit::Function = fetchDeposit
    fetchWithdrawals::Function = fetchWithdrawals
    fetchWithdrawal::Function = fetchWithdrawal
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOrder::Function = fetchOrder
    fetchDepositAddresses::Function = fetchDepositAddresses
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    createDepositAddress::Function = createDepositAddress
    withdraw::Function = withdraw
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetMarketAll::Function = publicGetMarketAll
    publicGetCandlesTimeframe::Function = publicGetCandlesTimeframe
    publicGetCandlesTimeframeUnit::Function = publicGetCandlesTimeframeUnit
    publicGetCandlesSeconds::Function = publicGetCandlesSeconds
    publicGetCandlesMinutesUnit::Function = publicGetCandlesMinutesUnit
    publicGetCandlesMinutes1::Function = publicGetCandlesMinutes1
    publicGetCandlesMinutes3::Function = publicGetCandlesMinutes3
    publicGetCandlesMinutes5::Function = publicGetCandlesMinutes5
    publicGetCandlesMinutes10::Function = publicGetCandlesMinutes10
    publicGetCandlesMinutes15::Function = publicGetCandlesMinutes15
    publicGetCandlesMinutes30::Function = publicGetCandlesMinutes30
    publicGetCandlesMinutes60::Function = publicGetCandlesMinutes60
    publicGetCandlesMinutes240::Function = publicGetCandlesMinutes240
    publicGetCandlesDays::Function = publicGetCandlesDays
    publicGetCandlesWeeks::Function = publicGetCandlesWeeks
    publicGetCandlesMonths::Function = publicGetCandlesMonths
    publicGetCandlesYears::Function = publicGetCandlesYears
    publicGetTradesTicks::Function = publicGetTradesTicks
    publicGetTicker::Function = publicGetTicker
    publicGetTickerAll::Function = publicGetTickerAll
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetOrderbookInstruments::Function = publicGetOrderbookInstruments
    privateGetAccounts::Function = privateGetAccounts
    privateGetOrdersChance::Function = privateGetOrdersChance
    privateGetOrder::Function = privateGetOrder
    privateGetOrdersClosed::Function = privateGetOrdersClosed
    privateGetOrdersOpen::Function = privateGetOrdersOpen
    privateGetOrdersUuids::Function = privateGetOrdersUuids
    privateGetWithdraws::Function = privateGetWithdraws
    privateGetWithdraw::Function = privateGetWithdraw
    privateGetWithdrawsChance::Function = privateGetWithdrawsChance
    privateGetWithdrawsCoinAddresses::Function = privateGetWithdrawsCoinAddresses
    privateGetDeposits::Function = privateGetDeposits
    privateGetDepositsChanceCoin::Function = privateGetDepositsChanceCoin
    privateGetDeposit::Function = privateGetDeposit
    privateGetDepositsCoinAddresses::Function = privateGetDepositsCoinAddresses
    privateGetDepositsCoinAddress::Function = privateGetDepositsCoinAddress
    privateGetTravelRuleVasps::Function = privateGetTravelRuleVasps
    privateGetStatusWallet::Function = privateGetStatusWallet
    privateGetApiKeys::Function = privateGetApiKeys
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersTest::Function = privatePostOrdersTest
    privatePostOrdersCancelAndNew::Function = privatePostOrdersCancelAndNew
    privatePostWithdrawsCoin::Function = privatePostWithdrawsCoin
    privatePostWithdrawsKrw::Function = privatePostWithdrawsKrw
    privatePostDepositsKrw::Function = privatePostDepositsKrw
    privatePostDepositsGenerateCoinAddress::Function = privatePostDepositsGenerateCoinAddress
    privatePostTravelRuleDepositUuid::Function = privatePostTravelRuleDepositUuid
    privatePostTravelRuleDepositTxid::Function = privatePostTravelRuleDepositTxid
    privateDeleteOrder::Function = privateDeleteOrder
    privateDeleteOrdersOpen::Function = privateDeleteOrdersOpen
    privateDeleteOrdersUuids::Function = privateDeleteOrdersUuids
    privateDeleteWithdrawsCoin::Function = privateDeleteWithdrawsCoin

end
function describe(self::Upbit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "upbit",
    Symbol("name") => "Upbit",
    Symbol("countries") => ["KR", "ID", "SG", "TH"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 50,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelOrder") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => false,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1s") => "seconds",
        Symbol("1m") => "minutes",
        Symbol("3m") => "minutes",
        Symbol("5m") => "minutes",
        Symbol("10m") => "minutes",
        Symbol("15m") => "minutes",
        Symbol("30m") => "minutes",
        Symbol("1h") => "minutes",
        Symbol("4h") => "minutes",
        Symbol("1d") => "days",
        Symbol("1w") => "weeks",
        Symbol("1M") => "months",
        Symbol("1y") => "years"
    ),
    Symbol("hostname") => "api.upbit.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://{hostname}",
            Symbol("private") => "https://{hostname}"
        ),
        Symbol("www") => "https://upbit.com",
        Symbol("doc") => ["https://docs.upbit.com/kr", "https://global-docs.upbit.com"],
        Symbol("fees") => "https://upbit.com/service_center/guide"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/all") => 2,
                Symbol("candles/{timeframe}") => 2,
                Symbol("candles/{timeframe}/{unit}") => 2,
                Symbol("candles/seconds") => 2,
                Symbol("candles/minutes/{unit}") => 2,
                Symbol("candles/minutes/1") => 2,
                Symbol("candles/minutes/3") => 2,
                Symbol("candles/minutes/5") => 2,
                Symbol("candles/minutes/10") => 2,
                Symbol("candles/minutes/15") => 2,
                Symbol("candles/minutes/30") => 2,
                Symbol("candles/minutes/60") => 2,
                Symbol("candles/minutes/240") => 2,
                Symbol("candles/days") => 2,
                Symbol("candles/weeks") => 2,
                Symbol("candles/months") => 2,
                Symbol("candles/years") => 2,
                Symbol("trades/ticks") => 2,
                Symbol("ticker") => 2,
                Symbol("ticker/all") => 2,
                Symbol("orderbook") => 2,
                Symbol("orderbook/instruments") => 2
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts") => 0.67,
                Symbol("orders/chance") => 0.67,
                Symbol("order") => 0.67,
                Symbol("orders/closed") => 0.67,
                Symbol("orders/open") => 0.67,
                Symbol("orders/uuids") => 0.67,
                Symbol("withdraws") => 0.67,
                Symbol("withdraw") => 0.67,
                Symbol("withdraws/chance") => 0.67,
                Symbol("withdraws/coin_addresses") => 0.67,
                Symbol("deposits") => 0.67,
                Symbol("deposits/chance/coin") => 0.67,
                Symbol("deposit") => 0.67,
                Symbol("deposits/coin_addresses") => 0.67,
                Symbol("deposits/coin_address") => 0.67,
                Symbol("travel_rule/vasps") => 0.67,
                Symbol("status/wallet") => 0.67,
                Symbol("api_keys") => 0.67
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => 2.5,
                Symbol("orders/test") => 2.5,
                Symbol("orders/cancel_and_new") => 2.5,
                Symbol("withdraws/coin") => 0.67,
                Symbol("withdraws/krw") => 0.67,
                Symbol("deposits/krw") => 0.67,
                Symbol("deposits/generate_coin_address") => 0.67,
                Symbol("travel_rule/deposit/uuid") => 0.67,
                Symbol("travel_rule/deposit/txid") => 0.67
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => 0.67,
                Symbol("orders/open") => 40,
                Symbol("orders/uuids") => 0.67,
                Symbol("withdraws/coin") => 0.67
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0025"),
            Symbol("taker") => self.parseNumber("0.0025")
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}()
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => nothing,
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
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
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 200
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
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("This key has expired.") => AuthenticationError,
            Symbol("Missing request parameter error. Check the required parameters!") => BadRequest,
            Symbol("side is missing, side does not have a valid value") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("thirdparty_agreement_required") => PermissionDenied,
            Symbol("out_of_scope") => PermissionDenied,
            Symbol("order_not_found") => OrderNotFound,
            Symbol("insufficient_funds") => InsufficientFunds,
            Symbol("invalid_access_key") => AuthenticationError,
            Symbol("jwt_verification") => AuthenticationError,
            Symbol("create_ask_error") => ExchangeError,
            Symbol("create_bid_error") => ExchangeError,
            Symbol("volume_too_large") => InvalidOrder,
            Symbol("invalid_funds") => InvalidOrder
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("tradingFeesByQuoteCurrency") => Dict{Symbol, Any}(
            Symbol("KRW") => 0.0005
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("TON") => "Tokamak Network"
    )
))

end
function fetchCurrency(self::Upbit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    return Base.fetch(self.fetchCurrencyById(get(currency, Symbol("id"), nothing), params))

end
function fetchCurrencyById(self::Upbit, id, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("currency") => id
    );
    response = Base.fetch(self.privateGetWithdrawsChance(extend(request, params)));
    memberInfo = safeValue(response, "member_level", Dict{Symbol, Any}());
    currencyInfo = safeValue(response, "currency", Dict{Symbol, Any}());
    withdrawLimits = safeValue(response, "withdraw_limit", Dict{Symbol, Any}());
    canWithdraw = safeValue(withdrawLimits, "can_withdraw");
    walletState = safeString(currencyInfo, "wallet_state");
    walletLocked = safeValue(memberInfo, "wallet_locked");
    locked = safeValue(memberInfo, "locked");
    active = true;
    if functions.ccxtruthy(@functions.ccxt_and((canWithdraw != nothing), !functions.ccxtruthy(canWithdraw)))
        active = false;
    elseif functions.ccxtruthy(walletState != "working")
        active = false;
    else
        if functions.ccxtruthy(@functions.ccxt_and((walletLocked != nothing), walletLocked))
            active = false;
        elseif functions.ccxtruthy(@functions.ccxt_and((locked != nothing), locked))
            active = false;
        end

    end
    maxOnetimeWithdrawal = safeString(withdrawLimits, "onetime");
    maxDailyWithdrawal = safeString(withdrawLimits, "daily", maxOnetimeWithdrawal);
    remainingDailyWithdrawal = safeString(withdrawLimits, "remaining_daily", maxDailyWithdrawal);
    maxWithdrawLimit = nothing;
    if functions.ccxtruthy(stringGt(remainingDailyWithdrawal, "0"))
        maxWithdrawLimit = remainingDailyWithdrawal;
    else
        maxWithdrawLimit = maxDailyWithdrawal;
    end
    currencyId = safeString(currencyInfo, "code");
    code = self.safeCurrencyCode(currencyId);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => code,
    Symbol("active") => active,
    Symbol("fee") => self.safeNumber(currencyInfo, "withdraw_fee"),
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(withdrawLimits, "minimum"),
            Symbol("max") => self.parseNumber(maxWithdrawLimit)
        )
    )
)

end
function fetchMarket(self::Upbit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    return Base.fetch(self.fetchMarketById(get(market, Symbol("id"), nothing), params))

end
function fetchMarketById(self::Upbit, id, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("market") => id
    );
    response = Base.fetch(self.privateGetOrdersChance(extend(request, params)));
    marketInfo = safeValue(response, "market");
    bid = safeValue(marketInfo, "bid");
    ask = safeValue(marketInfo, "ask");
    marketId = safeString(marketInfo, "id");
    baseId = safeString(ask, "currency");
    quoteId = safeString(bid, "currency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    state = safeString(marketInfo, "state");
    bidFee = safeString(response, "bid_fee");
    askFee = safeString(response, "ask_fee");
    fee = self.parseNumber(stringMax(bidFee, askFee));
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => marketId,
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
    Symbol("active") => (state == "active"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => fee,
    Symbol("maker") => fee,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1e-8"),
        Symbol("price") => self.parseNumber("1e-8")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(ask, "min_total"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(bid, "min_total"),
            Symbol("max") => self.safeNumber(marketInfo, "max_total")
        ),
        Symbol("info") => response
    )
))

end
function fetchMarkets(self::Upbit, params=Dict())
    response = Base.fetch(self.publicGetMarketAll(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Upbit, market)
    id = safeString(market, "market");
    (quoteId, baseId) = split(id, "-");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
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
    Symbol("active") => true,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(get(self.options, Symbol("tradingFeesByQuoteCurrency"), nothing), quote_var, get(get(self.fees, Symbol("trading"), nothing), Symbol("taker"), nothing)),
    Symbol("maker") => self.safeNumber(get(self.options, Symbol("tradingFeesByQuoteCurrency"), nothing), quote_var, get(get(self.fees, Symbol("trading"), nothing), Symbol("maker"), nothing)),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber("1e-8"),
        Symbol("amount") => self.parseNumber("1e-8")
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
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseBalance(self::Upbit, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "balance");
        account[Symbol("used")] = safeString(balance, "locked");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Upbit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccounts(params));
    return self.parseBalance(response)

end
function fetchOrderBooks(self::Upbit, symbols=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ids = nothing;
    if functions.ccxtruthy(symbols == nothing)
        allIds = self.ids;
        if functions.ccxtruthy(allIds != nothing)
            ids = join(allIds, ",");
        end
    else
        marketIds = self.marketIds(symbols);
        ids = join(marketIds, ",");
    end
    request = Dict{Symbol, Any}(
        Symbol("markets") => ids
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetOrderbook(extend(request, params)));
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        orderbook = get(response, i + 1, nothing);
        marketId = safeString(orderbook, "market");
        symbol = self.safeSymbol(marketId, nothing, "-");
        timestamp = safeInteger(orderbook, "timestamp");
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("symbol") => symbol,
            Symbol("bids") => sortBy(self.parseOrderBookBidsAsks(get(orderbook, Symbol("orderbook_units"), nothing), "bid_price", "bid_size"), 0, true),
            Symbol("asks") => sortBy(self.parseOrderBookBidsAsks(get(orderbook, Symbol("orderbook_units"), nothing), "ask_price", "ask_size"), 0),
            Symbol("timestamp") => timestamp,
            Symbol("datetime") => self.iso8601(timestamp),
            Symbol("nonce") => nothing
        );
        i += 1
    end
    return result

end
function fetchOrderBook(self::Upbit, symbol, limit=nothing, params=Dict())
    orderbooks = Base.fetch(self.fetchOrderBooks([symbol], limit, params));
    return safeValue(orderbooks, symbol)

end
function parseTicker(self::Upbit, ticker, market=nothing)
    timestamp = safeInteger(ticker, "trade_timestamp");
    marketId = safeString2(ticker, "market", "code");
    market = self.safeMarket(marketId, market, "-");
    last_var = safeString(ticker, "trade_price");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high_price"),
    Symbol("low") => safeString(ticker, "low_price"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "opening_price"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => safeString(ticker, "prev_closing_price"),
    Symbol("change") => safeString(ticker, "signed_change_price"),
    Symbol("percentage") => safeString(ticker, "signed_change_rate"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "acc_trade_volume_24h"),
    Symbol("quoteVolume") => safeString(ticker, "acc_trade_price_24h"),
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Upbit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    ids = functions.ccxtruthy((symbols != nothing)) ? self.marketIds(symbols) : self.ids;
    promises = [];
    queries = self.idsQueryStrings(ids, 6400);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(queries)))
        idsQuery = get(queries, i + 1, nothing);
        push!(promises, self.publicGetTicker(Dict{Symbol, Any}(
    Symbol("markets") => idsQuery
)));
        i += 1
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    concated = self.arraysConcat(responses);
    return self.parseTickers(concated, symbols)

end
function idsQueryStrings(self::Upbit, ids, maxQueryLength)
    idsString = "";
    queries = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        if functions.ccxtruthy(idsString != "")
            idsString = string(idsString, ",");
        end
        idsString = string(idsString, id);
        if functions.ccxtruthy(functions.ccxt_ge(length(idsString), maxQueryLength))
                        push!(queries, idsString);
            idsString = "";
        end
        i += 1
    end
    if functions.ccxtruthy(idsString != "")
                push!(queries, idsString);
    end
    return queries

end
function fetchTicker(self::Upbit, symbol, params=Dict())
    tickers = Base.fetch(self.fetchTickers([symbol], params));
    return safeValue(tickers, symbol)

end
function parseTrade(self::Upbit, trade, market=nothing)
    id = safeString2(trade, "sequential_id", "uuid");
    orderId = nothing;
    timestamp = safeInteger(trade, "timestamp");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = self.parse8601(safeString(trade, "created_at"));
    end
    side = nothing;
    askOrBid = safeStringLower2(trade, "ask_bid", "side");
    if functions.ccxtruthy(askOrBid == "ask")
        side = "sell";
    elseif functions.ccxtruthy(askOrBid == "bid")
        side = "buy";
    end
    cost = safeString(trade, "funds");
    price = safeString2(trade, "trade_price", "price");
    amount = safeString2(trade, "trade_volume", "volume");
    marketId = safeString2(trade, "market", "code");
    market = self.safeMarket(marketId, market, "-");
    fee = nothing;
    feeCost = safeString(trade, string(askOrBid, "_fee"));
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => get(market, Symbol("quote"), nothing),
            Symbol("cost") => feeCost
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Upbit, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("count") => limit
    );
    response = Base.fetch(self.publicGetTradesTicks(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchTradingFee(self::Upbit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetOrdersChance(extend(request, params)));
    askFee = safeString(response, "ask_fee");
    bidFee = safeString(response, "bid_fee");
    taker = stringMax(askFee, bidFee);
    makerAskFee = safeString(response, "maker_ask_fee");
    makerBidFee = safeString(response, "maker_bid_fee");
    maker = stringMax(makerAskFee, makerBidFee);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.parseNumber(maker),
    Symbol("taker") => self.parseNumber(taker),
    Symbol("percentage") => true,
    Symbol("tierBased") => false
)

end
function fetchTradingFees(self::Upbit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fetchMarketResponse = Base.fetch(self.fetchMarkets(params));
    response = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fetchMarketResponse)))
        element = Dict{Symbol, Any}();
        element[Symbol("maker")] = self.safeNumber(get(fetchMarketResponse, i + 1, nothing), "maker");
        element[Symbol("taker")] = self.safeNumber(get(fetchMarketResponse, i + 1, nothing), "taker");
        element[Symbol("symbol")] = safeString(get(fetchMarketResponse, i + 1, nothing), "symbol");
        element[Symbol("percentage")] = true;
        element[Symbol("tierBased")] = false;
        element[Symbol("info")] = get(fetchMarketResponse, i + 1, nothing);
        response[Symbol(safeString(fetchMarketResponse[i + 1], "symbol"))] = element;
        i += 1
    end
    return response

end
function parseOHLCV(self::Upbit, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, "candle_date_time_utc")), self.safeNumber(ohlcv, "opening_price"), self.safeNumber(ohlcv, "high_price"), self.safeNumber(ohlcv, "low_price"), self.safeNumber(ohlcv, "trade_price"), self.safeNumber(ohlcv, "candle_acc_trade_volume")]

end
function fetchOHLCV(self::Upbit, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    timeframePeriod = self.parseTimeframe(timeframe);
    timeframeValue = safeString(self.timeframes, timeframe, timeframe);
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("timeframe") => timeframeValue,
        Symbol("count") => limit
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("to")] = self.iso8601(self.sum(since, timeframePeriod * limit * 1000));
    end
    if functions.ccxtruthy(timeframeValue == "minutes")
        numMinutes = round(timeframePeriod / 60);
        request[Symbol("unit")] = numMinutes;
        response = Base.fetch(self.publicGetCandlesTimeframeUnit(extend(request, params)));
    else
        response = Base.fetch(self.publicGetCandlesTimeframe(extend(request, params)));
    end
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function calcOrderPrice(self::Upbit, symbol, amount, price=nothing, params=Dict())
    quoteAmount = nothing;
    createMarketBuyOrderRequiresPrice = safeValue(self.options, "createMarketBuyOrderRequiresPrice");
    cost = safeString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        quoteAmount = self.costToPrecision(symbol, cost);
    elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
        if functions.ccxtruthy(@functions.ccxt_or(price == nothing, amount == nothing))
            throw(InvalidOrder(string(self.id, " createOrder() requires the price and amount argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument")));
        end
        amountString = numberToString(amount);
        priceString = numberToString(price);
        costRequest = stringMul(amountString, priceString);
        quoteAmount = self.costToPrecision(symbol, costRequest);
    else
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " When createMarketBuyOrderRequiresPrice is false, \"amount\" is required and should be the total quote amount to spend.")));
        end
        quoteAmount = self.costToPrecision(symbol, amount);
    end
    return quoteAmount

end
function createOrder(self::Upbit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    customType = safeString2(params, "ordType", "ord_type");
    postOnly = self.isPostOnly(type_var == "market", false, params);
    timeInForce = safeStringLower2(params, "timeInForce", "time_in_force");
    selfTradePrevention = safeString2(params, "selfTradePrevention", "smp_type");
    test = self.safeBool(params, "test", false);
    if functions.ccxtruthy(@functions.ccxt_and(postOnly, (selfTradePrevention != nothing)))
        throw(ExchangeError(string(self.id, " createOrder() does not support post_only and selfTradePrevention simultaneously.")));
    end
    orderSide = nothing;
    if functions.ccxtruthy(side == "buy")
        orderSide = "bid";
    elseif functions.ccxtruthy(side == "sell")
        orderSide = "ask";
    else
        throw(InvalidOrder(string(self.id, " createOrder() supports only buy or sell in the side argument.")));
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide
    );
    if functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(@functions.ccxt_or(price == nothing, amount == nothing))
            throw(ArgumentsRequired(string(self.id, " the limit type order in createOrder() is required price and amount.")));
        end
        request[Symbol("ord_type")] = "limit";
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("volume")] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(side == "buy")
            request[Symbol("ord_type")] = "price";
            orderPrice = self.calcOrderPrice(symbol, amount, price, params);
            request[Symbol("price")] = orderPrice;
        else
            if functions.ccxtruthy(amount == nothing)
                throw(ArgumentsRequired(string(self.id, " the market sell type order in createOrder() is required amount.")));
            end
            request[Symbol("ord_type")] = "market";
            request[Symbol("volume")] = self.amountToPrecision(symbol, amount);
        end
    else
        throw(InvalidOrder(string(self.id, " createOrder() supports only limit or market types in the type argument.")));
    end
    if functions.ccxtruthy(customType == "best")
        params = omit(params, ["ordType", "ord_type"]);
        request[Symbol("ord_type")] = "best";
        if functions.ccxtruthy(side == "buy")
            orderPrice = self.calcOrderPrice(symbol, amount, price, params);
            request[Symbol("price")] = orderPrice;
        else
            if functions.ccxtruthy(amount == nothing)
                throw(ArgumentsRequired(string(self.id, " the best sell type order in createOrder() is required amount.")));
            end
            request[Symbol("volume")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("identifier")] = clientOrderId;
    end
    if functions.ccxtruthy(postOnly)
        if functions.ccxtruthy(get(request, Symbol("ord_type"), nothing) != "limit")
            throw(InvalidOrder(string(self.id, " postOnly orders are only supported for limit orders")));
        end
        request[Symbol("time_in_force")] = "post_only";
    end
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(@functions.ccxt_or(timeInForce == "ioc", timeInForce == "fok"))
            request[Symbol("time_in_force")] = timeInForce;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(get(request, Symbol("ord_type"), nothing) == "best", timeInForce == nothing))
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a timeInForce parameter for best type orders")));
    end
    params = omit(params, ["timeInForce", "time_in_force", "postOnly", "clientOrderId", "cost", "selfTradePrevention", "smp_type", "test"]);
    if functions.ccxtruthy(test)
        response = Base.fetch(self.privatePostOrdersTest(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrders(extend(request, params)));
    end
    return self.parseOrder(response)

end
function cancelOrder(self::Upbit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.parseOrder(response)

end
function editOrder(self::Upbit, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    prevClientOrderId = safeString(params, "clientOrderId");
    customType = safeString2(params, "newOrdType", "new_ord_type");
    clientOrderId = safeString(params, "newClientOrderId");
    postOnly = self.isPostOnly(type_var == "market", false, params);
    timeInForce = safeStringLower2(params, "newTimeInForce", "new_time_in_force");
    selfTradePrevention = safeString2(params, "selfTradePrevention", "new_smp_type");
    if functions.ccxtruthy(@functions.ccxt_and(postOnly, (selfTradePrevention != nothing)))
        throw(ExchangeError(string(self.id, " editOrder() does not support post_only and selfTradePrevention simultaneously.")));
    end
    params = omit(params, "clientOrderId");
    if functions.ccxtruthy(id != nothing)
        request[Symbol("prev_order_uuid")] = id;
    elseif functions.ccxtruthy(prevClientOrderId != nothing)
        request[Symbol("prev_order_identifier")] = prevClientOrderId;
    else
        throw(ArgumentsRequired(string(self.id, " editOrder() is required id or clientOrderId.")));
    end
    if functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(@functions.ccxt_or(price == nothing, amount == nothing))
            throw(ArgumentsRequired(string(self.id, " editOrder() is required price and amount to create limit type order.")));
        end
        request[Symbol("new_ord_type")] = "limit";
        request[Symbol("new_price")] = self.priceToPrecision(symbol, price);
        request[Symbol("new_volume")] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(side == "buy")
            request[Symbol("new_ord_type")] = "price";
            orderPrice = self.calcOrderPrice(symbol, amount, price, params);
            request[Symbol("new_price")] = orderPrice;
        else
            if functions.ccxtruthy(amount == nothing)
                throw(ArgumentsRequired(string(self.id, " editOrder() is required amount to create market sell type order.")));
            end
            request[Symbol("new_ord_type")] = "market";
            request[Symbol("new_volume")] = self.amountToPrecision(symbol, amount);
        end
    else
        throw(InvalidOrder(string(self.id, " editOrder() supports only limit or market types in the type argument.")));
    end
    if functions.ccxtruthy(customType == "best")
        params = omit(params, ["newOrdType", "new_ord_type"]);
        request[Symbol("new_ord_type")] = "best";
        if functions.ccxtruthy(side == "buy")
            orderPrice = self.calcOrderPrice(symbol, amount, price, params);
            request[Symbol("new_price")] = orderPrice;
        else
            if functions.ccxtruthy(amount == nothing)
                throw(ArgumentsRequired(string(self.id, " editOrder() is required amount to create best sell order.")));
            end
            request[Symbol("new_volume")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("new_identifier")] = clientOrderId;
    end
    if functions.ccxtruthy(selfTradePrevention != nothing)
        request[Symbol("new_smp_type")] = selfTradePrevention;
    end
    if functions.ccxtruthy(postOnly)
        if functions.ccxtruthy(get(request, Symbol("new_ord_type"), nothing) != "limit")
            throw(InvalidOrder(string(self.id, " postOnly orders are only supported for limit orders")));
        end
        request[Symbol("new_time_in_force")] = "post_only";
    end
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(@functions.ccxt_or(timeInForce == "ioc", timeInForce == "fok"))
            request[Symbol("new_time_in_force")] = timeInForce;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(get(request, Symbol("new_ord_type"), nothing) == "best", timeInForce == nothing))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a timeInForce parameter for best type orders")));
    end
    params = omit(params, ["newTimeInForce", "new_time_in_force", "postOnly", "newClientOrderId", "cost", "selfTradePrevention", "new_smp_type"]);
    response = Base.fetch(self.privatePostOrdersCancelAndNew(extend(request, params)));
    result = Dict{Symbol, Any}();
    result[Symbol("uuid")] = safeString(response, "new_order_uuid");
    result[Symbol("identifier")] = safeString(response, "new_order_identifier");
    result[Symbol("side")] = safeString(response, "side");
    result[Symbol("market")] = safeString(response, "market");
    return self.parseOrder(result)

end
function fetchDeposits(self::Upbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetDeposits(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchDeposit(self::Upbit, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetDeposit(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function fetchWithdrawals(self::Upbit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWithdraws(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawal(self::Upbit, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseTransactionStatus(self::Upbit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("submitting") => "pending",
        Symbol("submitted") => "pending",
        Symbol("almost_accepted") => "pending",
        Symbol("rejected") => "failed",
        Symbol("accepted") => "ok",
        Symbol("processing") => "pending",
        Symbol("done") => "ok",
        Symbol("canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Upbit, transaction, currency=nothing)
    address = nothing;
    tag = nothing;
    updatedRaw = safeString(transaction, "done_at");
    timestamp = self.parse8601(safeString(transaction, "created_at", updatedRaw));
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
    end
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "uuid"),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("status") => self.parseTransactionStatus(safeStringLower(transaction, "state")),
    Symbol("type") => type_var,
    Symbol("updated") => self.parse8601(updatedRaw),
    Symbol("txid") => safeString(transaction, "txid"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(transaction, "fee")
    )
)

end
function parseOrderStatus(self::Upbit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("wait") => "open",
        Symbol("done") => "closed",
        Symbol("cancel") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Upbit, order, market=nothing)
    id = safeString(order, "uuid");
    side = safeString(order, "side");
    if functions.ccxtruthy(side == "bid")
        side = "buy";
    else
        side = "sell";
    end
    identifier = safeString(order, "identifier");
    type_var = safeString(order, "ord_type");
    timestamp = self.parse8601(safeString(order, "created_at"));
    status = self.parseOrderStatus(safeString(order, "state"));
    lastTradeTimestamp = nothing;
    price = safeString(order, "price");
    amount = safeString(order, "volume");
    remaining = safeString(order, "remaining_volume");
    filled = safeString(order, "executed_volume");
    cost = nothing;
    if functions.ccxtruthy(type_var == "price")
        type_var = "market";
        cost = price;
        price = nothing;
    end
    average = nothing;
    fee = nothing;
    feeCost = safeString(order, "paid_fee");
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId, market);
    trades = safeValue(order, "trades", []);
    trades = self.parseTrades(trades, market, nothing, nothing, Dict{Symbol, Any}(
    Symbol("order") => id,
    Symbol("type") => type_var
));
    numTrades = length(trades);
    if functions.ccxtruthy(functions.ccxt_gt(numTrades, 0))
        lastTradeTimestamp = get(get(trades, numTrades - 1 + 1, nothing), Symbol("timestamp"), nothing);
        getFeesFromTrades = false;
        if functions.ccxtruthy(feeCost == nothing)
            getFeesFromTrades = true;
            feeCost = "0";
        end
        cost = "0";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, numTrades))
            trade = get(trades, i + 1, nothing);
            cost = stringAdd(cost, safeString(trade, "cost"));
            if functions.ccxtruthy(getFeesFromTrades)
                tradeFee = safeValue(get(trades, i + 1, nothing), "fee", Dict{Symbol, Any}());
                tradeFeeCost = safeString(tradeFee, "cost");
                if functions.ccxtruthy(tradeFeeCost != nothing)
                    feeCost = stringAdd(feeCost, tradeFeeCost);
                end
            end
            i += 1
        end

        average = stringDiv(cost, filled);
    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => get(market, Symbol("quote"), nothing),
            Symbol("cost") => feeCost
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => identifier,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => safeStringUpper(order, "time_in_force"),
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => self.parseNumber(cost),
    Symbol("average") => self.parseNumber(average),
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => trades
))

end
function fetchOpenOrders(self::Upbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOrdersOpen(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchClosedOrders(self::Upbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("state") => "done"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.privateGetOrdersClosed(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchCanceledOrders(self::Upbit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("state") => "cancel"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.privateGetOrdersClosed(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchOrder(self::Upbit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    return self.parseOrder(response)

end
function fetchDepositAddresses(self::Upbit, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetDepositsCoinAddresses(params));
    return self.parseDepositAddresses(response, codes)

end
function parseDepositAddress(self::Upbit, depositAddress, currency=nothing)
    address = safeString(depositAddress, "deposit_address");
    tag = safeString(depositAddress, "secondary_address");
    currencyId = safeString(depositAddress, "currency");
    code = self.safeCurrencyCode(currencyId);
    networkId = safeString(depositAddress, "net_type");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDepositAddress(self::Upbit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress requires params[\"network\"]")));
    end
    response = Base.fetch(self.privateGetDepositsCoinAddress(extend(Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("net_type") => self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing))
    ), params)));
    return self.parseDepositAddress(response)

end
function createDepositAddress(self::Upbit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostDepositsGenerateCoinAddress(extend(request, params)));
    message = safeString(response, "message");
    if functions.ccxtruthy(message != nothing)
        throw(AddressPending(string(self.id, " is generating ", code, " deposit address, call fetchDepositAddress or createDepositAddress one more time later to retrieve the generated address")));
    end
    return self.parseDepositAddress(response)

end
function withdraw(self::Upbit, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(code != "KRW")
        self.checkAddress(address);
        network = safeStringUpper2(params, "network", "net_type");
        if functions.ccxtruthy(network == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires a network argument")));
        end
        params = omit(params, ["network"]);
        request[Symbol("net_type")] = network;
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        request[Symbol("address")] = address;
        if functions.ccxtruthy(tag != nothing)
            request[Symbol("secondary_address")] = tag;
        end
        params = omit(params, "network");
        response = Base.fetch(self.privatePostWithdrawsCoin(extend(request, params)));
    else
        response = Base.fetch(self.privatePostWithdrawsKrw(extend(request, params)));
    end
    return self.parseTransaction(response)

end
function nonce(self::Upbit, )
    return milliseconds()

end
function sign(self::Upbit, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = self.implodeParams(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), Dict{Symbol, Any}(
        Symbol("hostname") => self.hostname
    ));
    url += string("/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(method != "POST")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        headers = Dict{Symbol, Any}();
        nonce = uuid();
        request = Dict{Symbol, Any}(
            Symbol("access_key") => self.apiKey,
            Symbol("nonce") => nonce
        );
        hasQuery = length(objectKeys(query));
        auth = nothing;
        if functions.ccxtruthy(@functions.ccxt_and((method != "GET"), (method != "DELETE")))
            body = json(params);
            headers[Symbol("Content-Type")] = "application/json";
        end
        if functions.ccxtruthy(hasQuery)
            auth = self.rawencode(query);
        end
        if functions.ccxtruthy(auth != nothing)
            hash = Ccxt.hash(self.encode(auth), sha512);
            request[Symbol("query_hash")] = hash;
            request[Symbol("query_hash_alg")] = "SHA512";
        end
        token = jwt(request, self.encode(self.secret), sha256);
        headers[Symbol("Authorization")] = string("Bearer ", token);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Upbit, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = safeValue(response, "error");
    if functions.ccxtruthy(error != nothing)
        message = safeString(error, "message");
        name = safeString(error, "name");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), name, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), name, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Upbit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketAll(self::Upbit, params=Dict(), context=Dict())
    return request(self, "market/all", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesTimeframe(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/{timeframe}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesTimeframeUnit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/{timeframe}/{unit}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesSeconds(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/seconds", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutesUnit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/{unit}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes1(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/1", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes3(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/3", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes5(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/5", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes10(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/10", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes15(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/15", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes30(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/30", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes60(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/60", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMinutes240(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/240", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesDays(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/days", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesWeeks(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/weeks", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesMonths(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/months", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetCandlesYears(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/years", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetTradesTicks(self::Upbit, params=Dict(), context=Dict())
    return request(self, "trades/ticks", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetTicker(self::Upbit, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetTickerAll(self::Upbit, params=Dict(), context=Dict())
    return request(self, "ticker/all", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetOrderbook(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function publicGetOrderbookInstruments(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orderbook/instruments", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateGetAccounts(self::Upbit, params=Dict(), context=Dict())
    return request(self, "accounts", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetOrdersChance(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/chance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetOrder(self::Upbit, params=Dict(), context=Dict())
    return request(self, "order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetOrdersClosed(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/closed", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetOrdersOpen(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/open", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetOrdersUuids(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/uuids", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetWithdraws(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetWithdraw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraw", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetWithdrawsChance(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/chance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetWithdrawsCoinAddresses(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin_addresses", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetDeposits(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetDepositsChanceCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/chance/coin", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetDeposit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposit", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetDepositsCoinAddresses(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/coin_addresses", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetDepositsCoinAddress(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/coin_address", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetTravelRuleVasps(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/vasps", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetStatusWallet(self::Upbit, params=Dict(), context=Dict())
    return request(self, "status/wallet", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateGetApiKeys(self::Upbit, params=Dict(), context=Dict())
    return request(self, "api_keys", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostOrders(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostOrdersTest(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/test", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostOrdersCancelAndNew(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/cancel_and_new", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostWithdrawsCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostWithdrawsKrw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/krw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostDepositsKrw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/krw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostDepositsGenerateCoinAddress(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/generate_coin_address", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostTravelRuleDepositUuid(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/deposit/uuid", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privatePostTravelRuleDepositTxid(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/deposit/txid", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateDeleteOrder(self::Upbit, params=Dict(), context=Dict())
    return request(self, "order", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateDeleteOrdersOpen(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/open", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function privateDeleteOrdersUuids(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/uuids", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function privateDeleteWithdrawsCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 0.67))
end

function Upbit(; kwargs...)
    inst = Upbit(Exchange(), describe, fetchCurrency, fetchCurrencyById, fetchMarket, fetchMarketById, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBooks, fetchOrderBook, parseTicker, fetchTickers, idsQueryStrings, fetchTicker, parseTrade, fetchTrades, fetchTradingFee, fetchTradingFees, parseOHLCV, fetchOHLCV, calcOrderPrice, createOrder, cancelOrder, editOrder, fetchDeposits, fetchDeposit, fetchWithdrawals, fetchWithdrawal, parseTransactionStatus, parseTransaction, parseOrderStatus, parseOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrder, fetchDepositAddresses, parseDepositAddress, fetchDepositAddress, createDepositAddress, withdraw, nonce, sign, handleErrors, publicGetMarketAll, publicGetCandlesTimeframe, publicGetCandlesTimeframeUnit, publicGetCandlesSeconds, publicGetCandlesMinutesUnit, publicGetCandlesMinutes1, publicGetCandlesMinutes3, publicGetCandlesMinutes5, publicGetCandlesMinutes10, publicGetCandlesMinutes15, publicGetCandlesMinutes30, publicGetCandlesMinutes60, publicGetCandlesMinutes240, publicGetCandlesDays, publicGetCandlesWeeks, publicGetCandlesMonths, publicGetCandlesYears, publicGetTradesTicks, publicGetTicker, publicGetTickerAll, publicGetOrderbook, publicGetOrderbookInstruments, privateGetAccounts, privateGetOrdersChance, privateGetOrder, privateGetOrdersClosed, privateGetOrdersOpen, privateGetOrdersUuids, privateGetWithdraws, privateGetWithdraw, privateGetWithdrawsChance, privateGetWithdrawsCoinAddresses, privateGetDeposits, privateGetDepositsChanceCoin, privateGetDeposit, privateGetDepositsCoinAddresses, privateGetDepositsCoinAddress, privateGetTravelRuleVasps, privateGetStatusWallet, privateGetApiKeys, privatePostOrders, privatePostOrdersTest, privatePostOrdersCancelAndNew, privatePostWithdrawsCoin, privatePostWithdrawsKrw, privatePostDepositsKrw, privatePostDepositsGenerateCoinAddress, privatePostTravelRuleDepositUuid, privatePostTravelRuleDepositTxid, privateDeleteOrder, privateDeleteOrdersOpen, privateDeleteOrdersUuids, privateDeleteWithdrawsCoin)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
