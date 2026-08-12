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
                Symbol("market/all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/{timeframe}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/{timeframe}/{unit}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/seconds") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/{unit}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/1") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/5") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/10") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/15") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/30") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/60") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/minutes/240") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/days") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/weeks") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/months") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("candles/years") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("trades/ticks") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("ticker/all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orderbook/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("orders/chance") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("orders/closed") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("orders/open") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("orders/uuids") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraws/chance") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraws/coin_addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits/chance/coin") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits/coin_addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits/coin_address") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("travel_rule/vasps") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("status/wallet") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("api_keys") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("orders/test") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("orders/cancel_and_new") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("withdraws/coin") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraws/krw") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits/krw") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("deposits/generate_coin_address") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("travel_rule/deposit/uuid") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("travel_rule/deposit/txid") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("orders/open") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("orders/uuids") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
),
                Symbol("withdraws/coin") => Dict{Symbol, Any}(
    Symbol("cost") => 0.67
)
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
function fetchCurrency(self::Upbit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    return Base.fetch(self.fetchCurrencyById(get(currency, Symbol("id"), nothing), params = params))

end
function fetchCurrencyById(self::Upbit, id; params=Dict())
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
function fetchMarket(self::Upbit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    return Base.fetch(self.fetchMarketById(get(market, Symbol("id"), nothing), params = params))

end
function fetchMarketById(self::Upbit, id; params=Dict())
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
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
"""
retrieves data on all markets for upbit
see: https://docs.upbit.com/kr/reference/list-trading-pairs
see: https://global-docs.upbit.com/reference/list-trading-pairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Upbit; params=Dict())
    response = Base.fetch(self.publicGetMarketAll(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Upbit, market)
    id = safeString(market, "market");
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing id")));
    end
    (quoteId, baseId) = split(id, "-");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("taker") => self.safeNumber(get(self.options, Symbol("tradingFeesByQuoteCurrency"), nothing), quote_var, defaultNumber = get(get(self.fees, Symbol("trading"), nothing), Symbol("taker"), nothing)),
    Symbol("maker") => self.safeNumber(get(self.options, Symbol("tradingFeesByQuoteCurrency"), nothing), quote_var, defaultNumber = get(get(self.fees, Symbol("trading"), nothing), Symbol("maker"), nothing)),
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
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.upbit.com/kr/reference/get-balance
see: https://global-docs.upbit.com/reference/get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Upbit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccounts(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://docs.upbit.com/kr/reference/list-orderbooks
see: https://global-docs.upbit.com/reference/list-orderbooks

# Arguments
- `symbols`::any: list of unified market symbols, all symbols fetched if undefined, default is undefined
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
function fetchOrderBooks(self::Upbit; symbols=nothing, limit=nothing, params=Dict())
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
        marketIds = self.marketIds(symbols = symbols);
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
    orderbooks = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderbooks)))
        orderbook = get(orderbooks, i + 1, nothing);
        marketId = safeString(orderbook, "market");
        symbol = self.safeSymbol(marketId, market = nothing, delimiter = "-");
        timestamp = safeInteger(orderbook, "timestamp");
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("symbol") => symbol,
            Symbol("bids") => sortBy(self.parseOrderBookBidsAsks(get(orderbook, Symbol("orderbook_units"), nothing), priceKey = "bid_price", amountKey = "bid_size"), 0, true),
            Symbol("asks") => sortBy(self.parseOrderBookBidsAsks(get(orderbook, Symbol("orderbook_units"), nothing), priceKey = "ask_price", amountKey = "ask_size"), 0),
            Symbol("timestamp") => timestamp,
            Symbol("datetime") => self.iso8601(timestamp),
            Symbol("nonce") => nothing
        );
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.upbit.com/kr/reference/list-orderbooks
see: https://global-docs.upbit.com/reference/list-orderbooks

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Upbit, symbol; limit=nothing, params=Dict())
    orderbooks = Base.fetch(self.fetchOrderBooks(symbols = [symbol], limit = limit, params = params));
    return safeValue(orderbooks, symbol)

end
function parseTicker(self::Upbit, ticker; market=nothing)
    timestamp = safeInteger(ticker, "trade_timestamp");
    marketId = safeString2(ticker, "market", "code");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
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
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.upbit.com/kr/reference/list-tickers
see: https://global-docs.upbit.com/reference/list-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Upbit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    ids = functions.ccxtruthy((symbols != nothing)) ? self.marketIds(symbols = symbols) : self.ids;
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
    return self.parseTickers(concated, symbols = symbols)

end
function idsQueryStrings(self::Upbit, ids, maxQueryLength)
    if functions.ccxtruthy(ids == nothing)
            return []
    end
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
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.upbit.com/kr/reference/list-tickers
see: https://global-docs.upbit.com/reference/list-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Upbit, symbol; params=Dict())
    tickers = Base.fetch(self.fetchTickers(symbols = [symbol], params = params));
    return safeValue(tickers, symbol)

end
function parseTrade(self::Upbit, trade; market=nothing)
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
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
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
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.upbit.com/kr/reference/list-pair-trades
see: https://global-docs.upbit.com/reference/list-pair-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Upbit, symbol; since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://docs.upbit.com/kr/reference/available-order-information
see: https://global-docs.upbit.com/reference/available-order-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Upbit, symbol; params=Dict())
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
"""
fetch the trading fees for markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [trading fee structure]{@link https://docs.ccxt.com/?id=trading-fee-structure}
"""
function fetchTradingFees(self::Upbit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fetchMarketResponse = Base.fetch(self.fetchMarkets(params = params));
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
        feeSymbol = safeString(get(fetchMarketResponse, i + 1, nothing), "symbol");
        if functions.ccxtruthy(feeSymbol != nothing)
            response[Symbol(feeSymbol)] = element;
        end
        i += 1
    end
    return response

end
function parseOHLCV(self::Upbit, ohlcv; market=nothing)
    return [self.parse8601(safeString(ohlcv, "candle_date_time_utc")), self.safeNumber(ohlcv, "opening_price"), self.safeNumber(ohlcv, "high_price"), self.safeNumber(ohlcv, "low_price"), self.safeNumber(ohlcv, "trade_price"), self.safeNumber(ohlcv, "candle_acc_trade_volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.upbit.com/kr/reference/list-candles-minutes
see: https://global-docs.upbit.com/reference/list-candles-minutes

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Upbit, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function calcOrderPrice(self::Upbit, symbol, amount; price=nothing, params=Dict())
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
    if functions.ccxtruthy(quoteAmount == nothing)
        throw(ArgumentsRequired(string(self.id, " calcOrderPrice() could not determine quote amount")));
    end
    return quoteAmount

end
"""
create a trade order
see: https://docs.upbit.com/kr/reference/new-order
see: https://global-docs.upbit.com/reference/new-order
see: https://docs.upbit.com/kr/reference/order-test
see: https://global-docs.upbit.com/reference/order-test

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: supports 'market' and 'limit'. if params.ordType is set to best, a best-type order will be created regardless of the value of type.
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount
- `params.ordType`::string, optional: this field can be used to place a ‘best’ type order
- `params.timeInForce`::string, optional: 'IOC' or 'FOK' for limit or best type orders, 'PO' for limit orders. this field is required when the order type is 'best'.
- `params.selfTradePrevention`::string, optional: 'reduce', 'cancel_maker', 'cancel_taker' {@link https://global-docs.upbit.com/docs/smp}
- `params.test`::bool, optional: If test is true, testOrder will be executed. It allows you to validate the request without creating an actual order. Default is false.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Upbit, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    customType = safeString2(params, "ordType", "ord_type");
    postOnly = self.isPostOnly(type_var == "market", false, params = params);
    timeInForce = safeStringLower2(params, "timeInForce", "time_in_force");
    selfTradePrevention = safeString2(params, "selfTradePrevention", "smp_type");
    test = self.safeBool(params, "test", defaultValue = false);
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
            orderPrice = self.calcOrderPrice(symbol, amount, price = price, params = params);
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
            orderPrice = self.calcOrderPrice(symbol, amount, price = price, params = params);
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
"""
cancels an open order
see: https://docs.upbit.com/kr/reference/cancel-order
see: https://global-docs.upbit.com/reference/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Upbit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
canceled existing order and create new order. It's only generated same side and symbol as the canceled order. it returns the data of the canceled order, except for `new_order_uuid` and `new_identifier`. to get the details of the new order, use `fetchOrder(new_order_uuid)`.
see: https://docs.upbit.com/kr/reference/cancel-and-new-order
see: https://global-docs.upbit.com/reference/cancel-and-new-order

# Arguments
- `id`::string: the uuid of the previous order you want to edit.
- `symbol`::string: the symbol of the new order. it must be the same as the symbol of the previous order.
- `type`::string: the type of the new order. only limit or market is accepted. if params.newOrdType is set to best, a best-type order will be created regardless of the value of type.
- `side`::string: the side of the new order. it must be the same as the side of the previous order.
- `amount`::float: the amount of the asset you want to buy or sell. It could be overridden by specifying the new_volume parameter in params.
- `price`::float: the price of the asset you want to buy or sell. It could be overridden by specifying the new_price parameter in params.
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.clientOrderId`::string, optional: to identify the previous order, either the id or this field is required in this method.
- `params.cost`::float, optional: for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount.
- `params.newTimeInForce`::string, optional: 'IOC' or 'FOK' for limit or best type orders, 'PO' for limit orders. this field is required when the order type is 'best'.
- `params.newClientOrderId`::string, optional: the order ID that the user can define.
- `params.newOrdType`::string, optional: this field only accepts limit, price, market, or best. You can refer to the Upbit developer documentation for details on how to use this field.
- `params.selfTradePrevention`::string, optional: 'reduce', 'cancel_maker', 'cancel_taker' {@link https://global-docs.upbit.com/docs/smp}

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Upbit, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    prevClientOrderId = safeString(params, "clientOrderId");
    customType = safeString2(params, "newOrdType", "new_ord_type");
    clientOrderId = safeString(params, "newClientOrderId");
    postOnly = self.isPostOnly(type_var == "market", false, params = params);
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
            orderPrice = self.calcOrderPrice(symbol, amount, price = price, params = params);
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
            orderPrice = self.calcOrderPrice(symbol, amount, price = price, params = params);
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
"""
fetch all deposits made to an account
see: https://docs.upbit.com/kr/reference/list-deposits
see: https://global-docs.upbit.com/reference/list-deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Upbit; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch information on a deposit
see: https://docs.upbit.com/kr/reference/get-deposit
see: https://global-docs.upbit.com/reference/get-deposit

# Arguments
- `id`::string: the unique id for the deposit
- `code`::string, optional: unified currency code of the currency deposited
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.txid`::string, optional: withdrawal transaction id, the id argument is reserved for uuid

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Upbit, id; code=nothing, params=Dict())
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
    return self.parseTransaction(response, currency = currency)

end
"""
fetch all withdrawals made from an account
see: https://docs.upbit.com/kr/reference/list-withdrawals
see: https://global-docs.upbit.com/reference/list-withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Upbit; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://docs.upbit.com/kr/reference/get-withdrawal
see: https://global-docs.upbit.com/reference/get-withdrawal

# Arguments
- `id`::string: the unique id for the withdrawal
- `code`::string, optional: unified currency code of the currency withdrawn
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.txid`::string, optional: withdrawal transaction id, the id argument is reserved for uuid

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawal(self::Upbit, id; code=nothing, params=Dict())
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
    return self.parseTransaction(response, currency = currency)

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
function parseTransaction(self::Upbit, transaction; currency=nothing)
    address = nothing;
    tag = nothing;
    updatedRaw = safeString(transaction, "done_at");
    timestamp = self.parse8601(safeString(transaction, "created_at", updatedRaw));
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
    end
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
function parseOrder(self::Upbit, order; market=nothing)
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
    market = self.safeMarket(marketId = marketId, market = market);
    trades = safeValue(order, "trades", []);
    trades = self.parseTrades(trades, market = market, since = nothing, limit = nothing, params = Dict{Symbol, Any}(
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
"""
fetch all unfilled currently open orders
see: https://docs.upbit.com/kr/reference/list-open-orders
see: https://global-docs.upbit.com/reference/list-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.state`::string, optional: default is 'wait', set to 'watch' for stop limit orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Upbit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.upbit.com/kr/reference/list-closed-orders
see: https://global-docs.upbit.com/reference/list-closed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Upbit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://docs.upbit.com/kr/reference/list-closed-orders
see: https://global-docs.upbit.com/reference/list-closed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Upbit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://docs.upbit.com/kr/reference/get-order
see: https://global-docs.upbit.com/reference/get-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by upbit fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Upbit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("uuid") => id
    );
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://docs.upbit.com/kr/reference/list-deposit-addresses
see: https://global-docs.upbit.com/reference/list-deposit-addresses

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddresses(self::Upbit; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetDepositsCoinAddresses(params));
    return self.parseDepositAddresses(response, codes = codes)

end
function parseDepositAddress(self::Upbit, depositAddress; currency=nothing)
    address = safeString(depositAddress, "deposit_address");
    tag = safeString(depositAddress, "secondary_address");
    currencyId = safeString(depositAddress, "currency");
    code = self.safeCurrencyCode(currencyId);
    networkId = safeString(depositAddress, "net_type");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.upbit.com/kr/reference/get-deposit-address
see: https://global-docs.upbit.com/reference/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string: deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Upbit, code; params=Dict())
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
        Symbol("net_type") => self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing))
    ), params)));
    return self.parseDepositAddress(response)

end
"""
create a currency deposit address
see: https://docs.upbit.com/kr/reference/create-deposit-address
see: https://global-docs.upbit.com/reference/create-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Upbit, code; params=Dict())
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
"""
make a withdrawal
see: https://docs.upbit.com/kr/reference/withdraw
see: https://global-docs.upbit.com/reference/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Upbit, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(code != "KRW")
        self.checkAddress(address = address);
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
function sign(self::Upbit, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Upbit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketAll(self::Upbit, params=Dict(), context=Dict())
    return request(self, "market/all"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesTimeframe(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/{timeframe}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesTimeframeUnit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/{timeframe}/{unit}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesSeconds(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/seconds"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutesUnit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/{unit}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes1(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/1"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes3(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/3"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes5(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/5"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes10(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/10"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes15(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/15"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes30(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/30"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes60(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/60"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMinutes240(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/minutes/240"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesDays(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/days"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesWeeks(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/weeks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesMonths(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/months"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlesYears(self::Upbit, params=Dict(), context=Dict())
    return request(self, "candles/years"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradesTicks(self::Upbit, params=Dict(), context=Dict())
    return request(self, "trades/ticks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Upbit, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerAll(self::Upbit, params=Dict(), context=Dict())
    return request(self, "ticker/all"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbook(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookInstruments(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orderbook/instruments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Upbit, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersChance(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/chance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrder(self::Upbit, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersClosed(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/closed"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOpen(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/open"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersUuids(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/uuids"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdraws(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdraw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraw"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawsChance(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/chance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawsCoinAddresses(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin_addresses"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeposits(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositsChanceCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/chance/coin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeposit(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposit"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositsCoinAddresses(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/coin_addresses"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositsCoinAddress(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/coin_address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTravelRuleVasps(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/vasps"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStatusWallet(self::Upbit, params=Dict(), context=Dict())
    return request(self, "status/wallet"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiKeys(self::Upbit, params=Dict(), context=Dict())
    return request(self, "api_keys"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersTest(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersCancelAndNew(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/cancel_and_new"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawsCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawsKrw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/krw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositsKrw(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/krw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositsGenerateCoinAddress(self::Upbit, params=Dict(), context=Dict())
    return request(self, "deposits/generate_coin_address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTravelRuleDepositUuid(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/deposit/uuid"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTravelRuleDepositTxid(self::Upbit, params=Dict(), context=Dict())
    return request(self, "travel_rule/deposit/txid"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrder(self::Upbit, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersOpen(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/open"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersUuids(self::Upbit, params=Dict(), context=Dict())
    return request(self, "orders/uuids"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteWithdrawsCoin(self::Upbit, params=Dict(), context=Dict())
    return request(self, "withdraws/coin"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Upbit(; kwargs...)
    inst = Upbit(Exchange(), describe, fetchCurrency, fetchCurrencyById, fetchMarket, fetchMarketById, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBooks, fetchOrderBook, parseTicker, fetchTickers, idsQueryStrings, fetchTicker, parseTrade, fetchTrades, fetchTradingFee, fetchTradingFees, parseOHLCV, fetchOHLCV, calcOrderPrice, createOrder, cancelOrder, editOrder, fetchDeposits, fetchDeposit, fetchWithdrawals, fetchWithdrawal, parseTransactionStatus, parseTransaction, parseOrderStatus, parseOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrder, fetchDepositAddresses, parseDepositAddress, fetchDepositAddress, createDepositAddress, withdraw, nonce, sign, handleErrors, publicGetMarketAll, publicGetCandlesTimeframe, publicGetCandlesTimeframeUnit, publicGetCandlesSeconds, publicGetCandlesMinutesUnit, publicGetCandlesMinutes1, publicGetCandlesMinutes3, publicGetCandlesMinutes5, publicGetCandlesMinutes10, publicGetCandlesMinutes15, publicGetCandlesMinutes30, publicGetCandlesMinutes60, publicGetCandlesMinutes240, publicGetCandlesDays, publicGetCandlesWeeks, publicGetCandlesMonths, publicGetCandlesYears, publicGetTradesTicks, publicGetTicker, publicGetTickerAll, publicGetOrderbook, publicGetOrderbookInstruments, privateGetAccounts, privateGetOrdersChance, privateGetOrder, privateGetOrdersClosed, privateGetOrdersOpen, privateGetOrdersUuids, privateGetWithdraws, privateGetWithdraw, privateGetWithdrawsChance, privateGetWithdrawsCoinAddresses, privateGetDeposits, privateGetDepositsChanceCoin, privateGetDeposit, privateGetDepositsCoinAddresses, privateGetDepositsCoinAddress, privateGetTravelRuleVasps, privateGetStatusWallet, privateGetApiKeys, privatePostOrders, privatePostOrdersTest, privatePostOrdersCancelAndNew, privatePostWithdrawsCoin, privatePostWithdrawsKrw, privatePostDepositsKrw, privatePostDepositsGenerateCoinAddress, privatePostTravelRuleDepositUuid, privatePostTravelRuleDepositTxid, privateDeleteOrder, privateDeleteOrdersOpen, privateDeleteOrdersUuids, privateDeleteWithdrawsCoin)
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
function __ccxt_doc_Upbit_fetchMarkets() end
"""
retrieves data on all markets for upbit
see: https://docs.upbit.com/kr/reference/list-trading-pairs
see: https://global-docs.upbit.com/reference/list-trading-pairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Upbit_fetchMarkets

function __ccxt_doc_Upbit_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.upbit.com/kr/reference/get-balance
see: https://global-docs.upbit.com/reference/get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Upbit_fetchBalance

function __ccxt_doc_Upbit_fetchOrderBooks() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://docs.upbit.com/kr/reference/list-orderbooks
see: https://global-docs.upbit.com/reference/list-orderbooks

# Arguments
- `symbols`::any: list of unified market symbols, all symbols fetched if undefined, default is undefined
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
__ccxt_doc_Upbit_fetchOrderBooks

function __ccxt_doc_Upbit_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.upbit.com/kr/reference/list-orderbooks
see: https://global-docs.upbit.com/reference/list-orderbooks

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Upbit_fetchOrderBook

function __ccxt_doc_Upbit_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.upbit.com/kr/reference/list-tickers
see: https://global-docs.upbit.com/reference/list-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Upbit_fetchTickers

function __ccxt_doc_Upbit_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.upbit.com/kr/reference/list-tickers
see: https://global-docs.upbit.com/reference/list-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Upbit_fetchTicker

function __ccxt_doc_Upbit_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.upbit.com/kr/reference/list-pair-trades
see: https://global-docs.upbit.com/reference/list-pair-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Upbit_fetchTrades

function __ccxt_doc_Upbit_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://docs.upbit.com/kr/reference/available-order-information
see: https://global-docs.upbit.com/reference/available-order-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Upbit_fetchTradingFee

function __ccxt_doc_Upbit_fetchTradingFees() end
"""
fetch the trading fees for markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [trading fee structure]{@link https://docs.ccxt.com/?id=trading-fee-structure}
"""
__ccxt_doc_Upbit_fetchTradingFees

function __ccxt_doc_Upbit_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.upbit.com/kr/reference/list-candles-minutes
see: https://global-docs.upbit.com/reference/list-candles-minutes

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Upbit_fetchOHLCV

function __ccxt_doc_Upbit_createOrder() end
"""
create a trade order
see: https://docs.upbit.com/kr/reference/new-order
see: https://global-docs.upbit.com/reference/new-order
see: https://docs.upbit.com/kr/reference/order-test
see: https://global-docs.upbit.com/reference/order-test

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: supports 'market' and 'limit'. if params.ordType is set to best, a best-type order will be created regardless of the value of type.
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount
- `params.ordType`::string, optional: this field can be used to place a ‘best’ type order
- `params.timeInForce`::string, optional: 'IOC' or 'FOK' for limit or best type orders, 'PO' for limit orders. this field is required when the order type is 'best'.
- `params.selfTradePrevention`::string, optional: 'reduce', 'cancel_maker', 'cancel_taker' {@link https://global-docs.upbit.com/docs/smp}
- `params.test`::bool, optional: If test is true, testOrder will be executed. It allows you to validate the request without creating an actual order. Default is false.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_createOrder

function __ccxt_doc_Upbit_cancelOrder() end
"""
cancels an open order
see: https://docs.upbit.com/kr/reference/cancel-order
see: https://global-docs.upbit.com/reference/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_cancelOrder

function __ccxt_doc_Upbit_editOrder() end
"""
canceled existing order and create new order. It's only generated same side and symbol as the canceled order. it returns the data of the canceled order, except for `new_order_uuid` and `new_identifier`. to get the details of the new order, use `fetchOrder(new_order_uuid)`.
see: https://docs.upbit.com/kr/reference/cancel-and-new-order
see: https://global-docs.upbit.com/reference/cancel-and-new-order

# Arguments
- `id`::string: the uuid of the previous order you want to edit.
- `symbol`::string: the symbol of the new order. it must be the same as the symbol of the previous order.
- `type`::string: the type of the new order. only limit or market is accepted. if params.newOrdType is set to best, a best-type order will be created regardless of the value of type.
- `side`::string: the side of the new order. it must be the same as the side of the previous order.
- `amount`::float: the amount of the asset you want to buy or sell. It could be overridden by specifying the new_volume parameter in params.
- `price`::float: the price of the asset you want to buy or sell. It could be overridden by specifying the new_price parameter in params.
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.clientOrderId`::string, optional: to identify the previous order, either the id or this field is required in this method.
- `params.cost`::float, optional: for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount.
- `params.newTimeInForce`::string, optional: 'IOC' or 'FOK' for limit or best type orders, 'PO' for limit orders. this field is required when the order type is 'best'.
- `params.newClientOrderId`::string, optional: the order ID that the user can define.
- `params.newOrdType`::string, optional: this field only accepts limit, price, market, or best. You can refer to the Upbit developer documentation for details on how to use this field.
- `params.selfTradePrevention`::string, optional: 'reduce', 'cancel_maker', 'cancel_taker' {@link https://global-docs.upbit.com/docs/smp}

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_editOrder

function __ccxt_doc_Upbit_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.upbit.com/kr/reference/list-deposits
see: https://global-docs.upbit.com/reference/list-deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Upbit_fetchDeposits

function __ccxt_doc_Upbit_fetchDeposit() end
"""
fetch information on a deposit
see: https://docs.upbit.com/kr/reference/get-deposit
see: https://global-docs.upbit.com/reference/get-deposit

# Arguments
- `id`::string: the unique id for the deposit
- `code`::string, optional: unified currency code of the currency deposited
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.txid`::string, optional: withdrawal transaction id, the id argument is reserved for uuid

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Upbit_fetchDeposit

function __ccxt_doc_Upbit_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.upbit.com/kr/reference/list-withdrawals
see: https://global-docs.upbit.com/reference/list-withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Upbit_fetchWithdrawals

function __ccxt_doc_Upbit_fetchWithdrawal() end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://docs.upbit.com/kr/reference/get-withdrawal
see: https://global-docs.upbit.com/reference/get-withdrawal

# Arguments
- `id`::string: the unique id for the withdrawal
- `code`::string, optional: unified currency code of the currency withdrawn
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.txid`::string, optional: withdrawal transaction id, the id argument is reserved for uuid

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Upbit_fetchWithdrawal

function __ccxt_doc_Upbit_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.upbit.com/kr/reference/list-open-orders
see: https://global-docs.upbit.com/reference/list-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.state`::string, optional: default is 'wait', set to 'watch' for stop limit orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_fetchOpenOrders

function __ccxt_doc_Upbit_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.upbit.com/kr/reference/list-closed-orders
see: https://global-docs.upbit.com/reference/list-closed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_fetchClosedOrders

function __ccxt_doc_Upbit_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://docs.upbit.com/kr/reference/list-closed-orders
see: https://global-docs.upbit.com/reference/list-closed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_fetchCanceledOrders

function __ccxt_doc_Upbit_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.upbit.com/kr/reference/get-order
see: https://global-docs.upbit.com/reference/get-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by upbit fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Upbit_fetchOrder

function __ccxt_doc_Upbit_fetchDepositAddresses() end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://docs.upbit.com/kr/reference/list-deposit-addresses
see: https://global-docs.upbit.com/reference/list-deposit-addresses

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Upbit_fetchDepositAddresses

function __ccxt_doc_Upbit_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.upbit.com/kr/reference/get-deposit-address
see: https://global-docs.upbit.com/reference/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string: deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Upbit_fetchDepositAddress

function __ccxt_doc_Upbit_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.upbit.com/kr/reference/create-deposit-address
see: https://global-docs.upbit.com/reference/create-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Upbit_createDepositAddress

function __ccxt_doc_Upbit_withdraw() end
"""
make a withdrawal
see: https://docs.upbit.com/kr/reference/withdraw
see: https://global-docs.upbit.com/reference/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Upbit_withdraw
