@kwdef mutable struct Zaif <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    customNonce::Function = customNonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetDepthPair::Function = publicGetDepthPair
    publicGetCurrenciesPair::Function = publicGetCurrenciesPair
    publicGetCurrenciesAll::Function = publicGetCurrenciesAll
    publicGetCurrencyPairsPair::Function = publicGetCurrencyPairsPair
    publicGetCurrencyPairsAll::Function = publicGetCurrencyPairsAll
    publicGetLastPricePair::Function = publicGetLastPricePair
    publicGetTickerPair::Function = publicGetTickerPair
    publicGetTradesPair::Function = publicGetTradesPair
    privatePostActiveOrders::Function = privatePostActiveOrders
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostDepositHistory::Function = privatePostDepositHistory
    privatePostGetIdInfo::Function = privatePostGetIdInfo
    privatePostGetInfo::Function = privatePostGetInfo
    privatePostGetInfo2::Function = privatePostGetInfo2
    privatePostGetPersonalInfo::Function = privatePostGetPersonalInfo
    privatePostTrade::Function = privatePostTrade
    privatePostTradeHistory::Function = privatePostTradeHistory
    privatePostWithdraw::Function = privatePostWithdraw
    privatePostWithdrawHistory::Function = privatePostWithdrawHistory
    ecapiPostCreateInvoice::Function = ecapiPostCreateInvoice
    ecapiPostGetInvoice::Function = ecapiPostGetInvoice
    ecapiPostGetInvoiceIdsByOrderNumber::Function = ecapiPostGetInvoiceIdsByOrderNumber
    ecapiPostCancelInvoice::Function = ecapiPostCancelInvoice
    tlapiPostGetPositions::Function = tlapiPostGetPositions
    tlapiPostPositionHistory::Function = tlapiPostPositionHistory
    tlapiPostActivePositions::Function = tlapiPostActivePositions
    tlapiPostCreatePosition::Function = tlapiPostCreatePosition
    tlapiPostChangePosition::Function = tlapiPostChangePosition
    tlapiPostCancelPosition::Function = tlapiPostCancelPosition
    fapiGetGroupsGroupId::Function = fapiGetGroupsGroupId
    fapiGetLastPriceGroupIdPair::Function = fapiGetLastPriceGroupIdPair
    fapiGetTickerGroupIdPair::Function = fapiGetTickerGroupIdPair
    fapiGetTradesGroupIdPair::Function = fapiGetTradesGroupIdPair
    fapiGetDepthGroupIdPair::Function = fapiGetDepthGroupIdPair

end
function describe(self::Zaif, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "zaif",
    Symbol("name") => "Zaif",
    Symbol("countries") => ["JP"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "1",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createOrder") => true,
        Symbol("createStopLossOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
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
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("setMarginMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/c6c97d18-5bde-46ed-8eb1-85404d36150e",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.zaif.jp"
        ),
        Symbol("www") => "https://zaif.jp",
        Symbol("doc") => ["https://techbureau-api-document.readthedocs.io/ja/latest/index.html", "https://corp.zaif.jp/api-docs", "https://corp.zaif.jp/api-docs/api_links", "https://www.npmjs.com/package/zaif.jp", "https://github.com/you21979/node-zaif"],
        Symbol("fees") => "https://zaif.jp/fee?lang=en"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0")
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("depth/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency_pairs/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currency_pairs/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("last_price/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("active_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deposit_history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_id_info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("get_info2") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("get_personal_info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("trade") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("trade_history") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("withdraw_history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("ecapi") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("createInvoice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getInvoice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getInvoiceIdsByOrderNumber") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelInvoice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("tlapi") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("get_positions") => Dict{Symbol, Any}(
    Symbol("cost") => 66
),
                Symbol("position_history") => Dict{Symbol, Any}(
    Symbol("cost") => 66
),
                Symbol("active_positions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("create_position") => Dict{Symbol, Any}(
    Symbol("cost") => 33
),
                Symbol("change_position") => Dict{Symbol, Any}(
    Symbol("cost") => 33
),
                Symbol("cancel_position") => Dict{Symbol, Any}(
    Symbol("cost") => 33
)
            )
        ),
        Symbol("fapi") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("groups/{group_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("last_price/{group_id}/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/{group_id}/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades/{group_id}/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth/{group_id}/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => nothing,
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => nothing
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
            Symbol("unsupported currency_pair") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function fetchMarkets(self::Zaif, params=Dict())
    markets = Base.fetch(self.publicGetCurrencyPairsAll(params));
    return self.parseMarkets(markets)

end
function parseMarket(self::Zaif, market)
    id = safeString(market, "currency_pair");
    name = safeString(market, "name");
    if functions.ccxtruthy(name == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing name")));
    end
    (baseId, quoteId) = split(name, "/");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    return self.safeMarketStructure(Dict{Symbol, Any}(
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
    Symbol("margin") => nothing,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "item_unit_step"),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "aux_unit_point")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "item_unit_min"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "aux_unit_min"),
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
function parseBalance(self::Zaif, response)
    balances = safeValue(response, "return", Dict{Symbol, Any}());
    deposit = safeValue(balances, "deposit");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    funds = safeValue(balances, "funds", Dict{Symbol, Any}());
    currencyIds = objectKeys(funds);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        balance = safeString(funds, currencyId);
        account = self.account();
        account[Symbol("free")] = balance;
        account[Symbol("total")] = balance;
        if functions.ccxtruthy(deposit != nothing)
            if functions.ccxtruthy(ccxt_in(currencyId, deposit))
                account[Symbol("total")] = safeString(deposit, currencyId);
            end
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Zaif, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetInfo(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Zaif, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetDepthPair(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing))

end
function parseTicker(self::Zaif, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    vwap = safeString(ticker, "vwap");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = stringMul(baseVolume, vwap);
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => vwap,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Zaif, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    ticker = Base.fetch(self.publicGetTickerPair(extend(request, params)));
    return self.parseTicker(ticker, market)

end
function parseTrade(self::Zaif, trade, market=nothing)
    side = safeString(trade, "trade_type");
    side = functions.ccxtruthy((side == "bid")) ? "buy" : "sell";
    timestamp = safeTimestamp(trade, "date");
    id = safeString2(trade, "id", "tid");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    marketId = safeString(trade, "currency_pair");
    symbol = self.safeSymbol(marketId, market, "_");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("order") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchTrades(self::Zaif, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTradesPair(extend(request, params)));
    trades = toArray(response);
    numTrades = length(trades);
    if functions.ccxtruthy(numTrades == 1)
        firstTrade = self.safeDict(trades, 0, Dict{Symbol, Any}());
        if functions.ccxtruthy(!functions.ccxtruthy(length(objectKeys(firstTrade))))
            trades = [];
        end
    end
    return self.parseTrades(trades, market, since, limit)

end
function createOrder(self::Zaif, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(type_var != "limit")
        throw(ExchangeError(string(self.id, " createOrder() allows limit orders only")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency_pair") => get(market, Symbol("id"), nothing),
        Symbol("action") => functions.ccxtruthy((side == "buy")) ? "bid" : "ask",
        Symbol("amount") => amount,
        Symbol("price") => price
    );
    response = Base.fetch(self.privatePostTrade(extend(request, params)));
    data = self.safeDict(response, "return", Dict{Symbol, Any}());
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => string(get(data, Symbol("order_id"), nothing))
), market)

end
function cancelOrder(self::Zaif, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    data = self.safeDict(response, "return", Dict{Symbol, Any}());
    return self.parseOrder(data)

end
function parseOrder(self::Zaif, order, market=nothing)
    side = safeString(order, "action");
    side = functions.ccxtruthy((side == "bid")) ? "buy" : "sell";
    timestamp = safeTimestamp(order, "timestamp");
    marketId = safeString(order, "currency_pair");
    symbol = self.safeSymbol(marketId, market, "_");
    price = safeString(order, "price");
    amount = safeString(order, "amount");
    id = safeString2(order, "id", "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => "open",
    Symbol("symbol") => symbol,
    Symbol("type") => "limit",
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market)

end
function fetchOpenOrders(self::Zaif, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostActiveOrders(extend(request, params)));
    data = self.safeDict(response, "return", Dict{Symbol, Any}());
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrders(self::Zaif, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostTradeHistory(extend(request, params)));
    data = self.safeDict(response, "return", Dict{Symbol, Any}());
    return self.parseOrders(data, market, since, limit)

end
function withdraw(self::Zaif, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(code == "JPY")
        throw(ExchangeError(string(self.id, " withdraw() does not allow ", code, " withdrawals")));
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("message")] = tag;
    end
    result = Base.fetch(self.privatePostWithdraw(extend(request, params)));
    returnData = self.safeDict(result, "return", Dict{Symbol, Any}());
    return self.parseTransaction(returnData, currency)

end
function parseTransaction(self::Zaif, transaction, currency=nothing)
    currency = self.safeCurrency(nothing, currency);
    fee = nothing;
    feeCost = safeValue(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => get(currency, Symbol("code"), nothing)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "txid"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("amount") => nothing,
    Symbol("type") => nothing,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("status") => nothing,
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => transaction
)

end
function customNonce(self::Zaif, )
    num = numberToString(milliseconds() / 1000);
    nonce = ccxt_toNumber(num);
    return toFixed(nonce, 8)

end
function sign(self::Zaif, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/");
    if functions.ccxtruthy(api == "public")
        url += string("api/", self.version, "/", self.implodeParams(path, params));
    elseif functions.ccxtruthy(api == "fapi")
        url += string("fapi/", self.version, "/", self.implodeParams(path, params));
    else
        self.checkRequiredCredentials();
        if functions.ccxtruthy(api == "ecapi")
            url += "ecapi";
        elseif functions.ccxtruthy(api == "tlapi")
            url += "tlapi";
        else
            url += "tapi";
        end
        nonce = self.customNonce();
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("method") => path,
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
function handleErrors(self::Zaif, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    error = safeString(response, "error");
    if functions.ccxtruthy(error != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    success = self.safeBool(response, "success", true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Zaif, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetDepthPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "depth/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrenciesPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "currencies/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrenciesAll(self::Zaif, params=Dict(), context=Dict())
    return request(self, "currencies/all", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrencyPairsPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "currency_pairs/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCurrencyPairsAll(self::Zaif, params=Dict(), context=Dict())
    return request(self, "currency_pairs/all", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetLastPricePair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "last_price/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "ticker/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradesPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "trades/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostActiveOrders(self::Zaif, params=Dict(), context=Dict())
    return request(self, "active_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelOrder(self::Zaif, params=Dict(), context=Dict())
    return request(self, "cancel_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositHistory(self::Zaif, params=Dict(), context=Dict())
    return request(self, "deposit_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetIdInfo(self::Zaif, params=Dict(), context=Dict())
    return request(self, "get_id_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetInfo(self::Zaif, params=Dict(), context=Dict())
    return request(self, "get_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetInfo2(self::Zaif, params=Dict(), context=Dict())
    return request(self, "get_info2", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetPersonalInfo(self::Zaif, params=Dict(), context=Dict())
    return request(self, "get_personal_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTrade(self::Zaif, params=Dict(), context=Dict())
    return request(self, "trade", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeHistory(self::Zaif, params=Dict(), context=Dict())
    return request(self, "trade_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdraw(self::Zaif, params=Dict(), context=Dict())
    return request(self, "withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawHistory(self::Zaif, params=Dict(), context=Dict())
    return request(self, "withdraw_history", "private", "POST", params, nothing, nothing, Dict())
end

function ecapiPostCreateInvoice(self::Zaif, params=Dict(), context=Dict())
    return request(self, "createInvoice", "ecapi", "POST", params, nothing, nothing, Dict())
end

function ecapiPostGetInvoice(self::Zaif, params=Dict(), context=Dict())
    return request(self, "getInvoice", "ecapi", "POST", params, nothing, nothing, Dict())
end

function ecapiPostGetInvoiceIdsByOrderNumber(self::Zaif, params=Dict(), context=Dict())
    return request(self, "getInvoiceIdsByOrderNumber", "ecapi", "POST", params, nothing, nothing, Dict())
end

function ecapiPostCancelInvoice(self::Zaif, params=Dict(), context=Dict())
    return request(self, "cancelInvoice", "ecapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostGetPositions(self::Zaif, params=Dict(), context=Dict())
    return request(self, "get_positions", "tlapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostPositionHistory(self::Zaif, params=Dict(), context=Dict())
    return request(self, "position_history", "tlapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostActivePositions(self::Zaif, params=Dict(), context=Dict())
    return request(self, "active_positions", "tlapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostCreatePosition(self::Zaif, params=Dict(), context=Dict())
    return request(self, "create_position", "tlapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostChangePosition(self::Zaif, params=Dict(), context=Dict())
    return request(self, "change_position", "tlapi", "POST", params, nothing, nothing, Dict())
end

function tlapiPostCancelPosition(self::Zaif, params=Dict(), context=Dict())
    return request(self, "cancel_position", "tlapi", "POST", params, nothing, nothing, Dict())
end

function fapiGetGroupsGroupId(self::Zaif, params=Dict(), context=Dict())
    return request(self, "groups/{group_id}", "fapi", "GET", params, nothing, nothing, Dict())
end

function fapiGetLastPriceGroupIdPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "last_price/{group_id}/{pair}", "fapi", "GET", params, nothing, nothing, Dict())
end

function fapiGetTickerGroupIdPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "ticker/{group_id}/{pair}", "fapi", "GET", params, nothing, nothing, Dict())
end

function fapiGetTradesGroupIdPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "trades/{group_id}/{pair}", "fapi", "GET", params, nothing, nothing, Dict())
end

function fapiGetDepthGroupIdPair(self::Zaif, params=Dict(), context=Dict())
    return request(self, "depth/{group_id}/{pair}", "fapi", "GET", params, nothing, nothing, Dict())
end

function Zaif(; kwargs...)
    inst = Zaif(Exchange(), describe, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, parseTrade, fetchTrades, createOrder, cancelOrder, parseOrder, fetchOpenOrders, fetchClosedOrders, withdraw, parseTransaction, customNonce, sign, handleErrors, publicGetDepthPair, publicGetCurrenciesPair, publicGetCurrenciesAll, publicGetCurrencyPairsPair, publicGetCurrencyPairsAll, publicGetLastPricePair, publicGetTickerPair, publicGetTradesPair, privatePostActiveOrders, privatePostCancelOrder, privatePostDepositHistory, privatePostGetIdInfo, privatePostGetInfo, privatePostGetInfo2, privatePostGetPersonalInfo, privatePostTrade, privatePostTradeHistory, privatePostWithdraw, privatePostWithdrawHistory, ecapiPostCreateInvoice, ecapiPostGetInvoice, ecapiPostGetInvoiceIdsByOrderNumber, ecapiPostCancelInvoice, tlapiPostGetPositions, tlapiPostPositionHistory, tlapiPostActivePositions, tlapiPostCreatePosition, tlapiPostChangePosition, tlapiPostCancelPosition, fapiGetGroupsGroupId, fapiGetLastPriceGroupIdPair, fapiGetTickerGroupIdPair, fapiGetTradesGroupIdPair, fapiGetDepthGroupIdPair)
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
