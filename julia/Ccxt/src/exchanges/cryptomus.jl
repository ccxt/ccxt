@kwdef mutable struct Cryptomus <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    fetchTradingFees::Function = fetchTradingFees
    parseFeeTiers::Function = parseFeeTiers
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetV2UserApiExchangeMarkets::Function = publicGetV2UserApiExchangeMarkets
    publicGetV2UserApiExchangeMarketPrice::Function = publicGetV2UserApiExchangeMarketPrice
    publicGetV1ExchangeMarketAssets::Function = publicGetV1ExchangeMarketAssets
    publicGetV1ExchangeMarketOrderBookCurrencyPair::Function = publicGetV1ExchangeMarketOrderBookCurrencyPair
    publicGetV1ExchangeMarketTickers::Function = publicGetV1ExchangeMarketTickers
    publicGetV1ExchangeMarketTradesCurrencyPair::Function = publicGetV1ExchangeMarketTradesCurrencyPair
    privateGetV2UserApiExchangeOrders::Function = privateGetV2UserApiExchangeOrders
    privateGetV2UserApiExchangeOrdersHistory::Function = privateGetV2UserApiExchangeOrdersHistory
    privateGetV2UserApiExchangeAccountBalance::Function = privateGetV2UserApiExchangeAccountBalance
    privateGetV2UserApiExchangeAccountTariffs::Function = privateGetV2UserApiExchangeAccountTariffs
    privateGetV2UserApiPaymentServices::Function = privateGetV2UserApiPaymentServices
    privateGetV2UserApiPayoutServices::Function = privateGetV2UserApiPayoutServices
    privateGetV2UserApiTransactionList::Function = privateGetV2UserApiTransactionList
    privatePostV2UserApiExchangeOrders::Function = privatePostV2UserApiExchangeOrders
    privatePostV2UserApiExchangeOrdersMarket::Function = privatePostV2UserApiExchangeOrdersMarket
    privateDeleteV2UserApiExchangeOrdersOrderId::Function = privateDeleteV2UserApiExchangeOrdersOrderId

end
function describe(self::Cryptomus, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "cryptomus",
    Symbol("name") => "Cryptomus",
    Symbol("countries") => ["CA"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v2",
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
        Symbol("cancelAllOrders") => false,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => false,
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
        Symbol("fetchMyTrades") => false,
        Symbol("fetchOHLCV") => false,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
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
        Symbol("fetchTicker") => false,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/cce42038-d22e-49bc-8a9a-b9c92a2859a0",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.cryptomus.com",
            Symbol("private") => "https://api.cryptomus.com"
        ),
        Symbol("www") => "https://cryptomus.com",
        Symbol("doc") => "https://doc.cryptomus.com/personal",
        Symbol("fees") => "https://cryptomus.com/tariffs",
        Symbol("referral") => "https://app.cryptomus.com/signup/?ref=JRP4yj"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v2/user-api/exchange/markets") => 1,
                Symbol("v2/user-api/exchange/market/price") => 1,
                Symbol("v1/exchange/market/assets") => 1,
                Symbol("v1/exchange/market/order-book/{currencyPair}") => 1,
                Symbol("v1/exchange/market/tickers") => 1,
                Symbol("v1/exchange/market/trades/{currencyPair}") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v2/user-api/exchange/orders") => 1,
                Symbol("v2/user-api/exchange/orders/history") => 1,
                Symbol("v2/user-api/exchange/account/balance") => 1,
                Symbol("v2/user-api/exchange/account/tariffs") => 1,
                Symbol("v2/user-api/payment/services") => 1,
                Symbol("v2/user-api/payout/services") => 1,
                Symbol("v2/user-api/transaction/list") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v2/user-api/exchange/orders") => 1,
                Symbol("v2/user-api/exchange/orders/market") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("v2/user-api/exchange/orders/{orderId}") => 1
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("percentage") => true,
            Symbol("feeSide") => "get",
            Symbol("maker") => self.parseNumber("0.02"),
            Symbol("taker") => self.parseNumber("0.02")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BEP20") => "bsc",
            Symbol("DASH") => "dash",
            Symbol("POLYGON") => "polygon",
            Symbol("ARB") => "arbitrum",
            Symbol("SOL") => "sol",
            Symbol("TON") => "ton",
            Symbol("ERC20") => "eth",
            Symbol("TRC20") => "tron",
            Symbol("LTC") => "ltc",
            Symbol("XMR") => "xmr",
            Symbol("BCH") => "bch",
            Symbol("DOGE") => "doge",
            Symbol("AVAX") => "avalanche",
            Symbol("BTC") => "btc",
            Symbol("RUB") => "rub"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("bsc") => "BEP20",
            Symbol("dash") => "DASH",
            Symbol("polygon") => "POLYGON",
            Symbol("arbitrum") => "ARB",
            Symbol("sol") => "SOL",
            Symbol("ton") => "TON",
            Symbol("eth") => "ERC20",
            Symbol("tron") => "TRC20",
            Symbol("ltc") => "LTC",
            Symbol("xmr") => "XMR",
            Symbol("bch") => "BCH",
            Symbol("doge") => "DOGE",
            Symbol("avalanche") => "AVAX",
            Symbol("btc") => "BTC",
            Symbol("rub") => "RUB"
        ),
        Symbol("fetchOrderBook") => Dict{Symbol, Any}(
            Symbol("level") => 0
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("500") => ExchangeError,
            Symbol("6") => InsufficientFunds,
            Symbol("Insufficient funds.") => InsufficientFunds,
            Symbol("Minimum amount 15 USDT") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("uid") => true
    ),
    Symbol("features") => Dict{Symbol, Any}()
))

end
function fetchMarkets(self::Cryptomus, params=Dict())
    response = Base.fetch(self.publicGetV2UserApiExchangeMarkets(params));
    result = self.safeList(response, "result", []);
    return self.parseMarkets(result)

end
function parseMarket(self::Cryptomus, market)
    marketId = safeString(market, "symbol");
    parts = split(marketId, "_");
    baseId = get(parts, 1, nothing);
    quoteId = get(parts, 2, nothing);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    fees = self.safeDict(self.fees, "trading");
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("active") => true,
    Symbol("type") => "spot",
    Symbol("subType") => nothing,
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("contract") => false,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(fees, "taker"),
    Symbol("maker") => self.safeNumber(fees, "maker"),
    Symbol("percentage") => self.safeBool(fees, "percentage"),
    Symbol("tierBased") => nothing,
    Symbol("feeSide") => safeString(fees, "feeSide"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "quotePrec"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "basePrec")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteMinSize"),
            Symbol("max") => self.safeNumber(market, "quoteMaxSize")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "baseMinSize"),
            Symbol("max") => self.safeNumber(market, "baseMaxSize")
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
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
function fetchCurrencies(self::Cryptomus, params=Dict())
    response = Base.fetch(self.publicGetV1ExchangeMarketAssets(params));
    coins = self.safeList(response, "result");
    groupedById = groupBy(coins, "currency_code");
    groupedArray = objectValues(groupedById);
    return self.parseCurrencies(groupedArray)

end
function parseCurrency(self::Cryptomus, rawCurrency)
    id = nothing;
    code = nothing;
    networks = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawCurrency)))
        networkEntry = get(rawCurrency, i + 1, nothing);
        if functions.ccxtruthy(id == nothing)
            id = safeString(networkEntry, "currency_code");
            code = self.safeCurrencyCode(id);
        end
        networkId = safeString(networkEntry, "network_code");
        networkCode = self.networkIdToCode(networkId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(networkEntry, "min_withdraw"),
                    Symbol("max") => self.safeNumber(networkEntry, "max_withdraw")
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(networkEntry, "min_deposit"),
                    Symbol("max") => self.safeNumber(networkEntry, "max_deposit")
                )
            ),
            Symbol("active") => nothing,
            Symbol("deposit") => self.safeBool(networkEntry, "can_deposit"),
            Symbol("withdraw") => self.safeBool(networkEntry, "can_withdraw"),
            Symbol("fee") => nothing,
            Symbol("precision") => nothing,
            Symbol("info") => networkEntry
        );
        i += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("networks") => networks,
    Symbol("info") => rawCurrency
))

end
function fetchTickers(self::Cryptomus, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetV1ExchangeMarketTickers(params));
    data = self.safeList(response, "data");
    return self.parseTickers(data, symbols)

end
function parseTicker(self::Cryptomus, ticker, market=nothing)
    marketId = safeString(ticker, "currency_pair");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "last_price");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => nothing,
    Symbol("low") => nothing,
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
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "base_volume"),
    Symbol("quoteVolume") => safeString(ticker, "quote_volume"),
    Symbol("info") => ticker
), market)

end
function fetchOrderBook(self::Cryptomus, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    level = 0;
    (level, params) = self.handleOptionAndParams(params, "fetchOrderBook", "level", level);
    request[Symbol("level")] = level;
    response = Base.fetch(self.publicGetV1ExchangeMarketOrderBookCurrencyPair(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = safeTimestamp(data, "timestamp");
    return self.parseOrderBook(data, symbol, timestamp, "bids", "asks", "price", "quantity")

end
function fetchTrades(self::Cryptomus, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currencyPair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1ExchangeMarketTradesCurrencyPair(extend(request, params)));
    data = self.safeList(response, "data");
    return self.parseTrades(data, market, since, limit)

end
function parseTrade(self::Cryptomus, trade, market=nothing)
    timestamp = safeTimestamp(trade, "timestamp");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString(trade, "trade_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("side") => safeString(trade, "type"),
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "quote_volume"),
    Symbol("cost") => safeString(trade, "base_volume"),
    Symbol("takerOrMaker") => nothing,
    Symbol("type") => nothing,
    Symbol("order") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing
    ),
    Symbol("info") => trade
), market)

end
function fetchBalance(self::Cryptomus, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetV2UserApiExchangeAccountBalance(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseBalance(result)

end
function parseBalance(self::Cryptomus, balance)
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balance)))
        balanceEntry = get(balance, i + 1, nothing);
        currencyId = safeString(balanceEntry, "ticker");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balanceEntry, "available");
        account[Symbol("used")] = safeString(balanceEntry, "held");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function createOrder(self::Cryptomus, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("direction") => side,
        Symbol("tag") => "ccxt"
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("client_order_id")] = clientOrderId;
    end
    sideBuy = side == "buy";
    amountToString = numberToString(amount);
    priceToString = numberToString(price);
    cost = nothing;
    (cost, params) = self.handleParamString(params, "cost");
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(sideBuy)
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(@functions.ccxt_and((price == nothing), (cost == nothing)))
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option of param to false and pass the cost to spend in the amount argument")));
                elseif functions.ccxtruthy(cost == nothing)
                    cost = stringMul(amountToString, priceToString);
                end
            else
                cost = functions.ccxtruthy(cost) ? cost : amountToString;
            end
            request[Symbol("value")] = cost;
        else
            request[Symbol("quantity")] = amountToString;
        end
        response = Base.fetch(self.privatePostV2UserApiExchangeOrdersMarket(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price parameter for a ", type_var, " order")));
        end
        request[Symbol("quantity")] = amountToString;
        request[Symbol("price")] = price;
        response = Base.fetch(self.privatePostV2UserApiExchangeOrders(extend(request, params)));
    else
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a type parameter (limit or market)")));
    end
    return self.parseOrder(response, market)

end
function cancelOrder(self::Cryptomus, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    request[Symbol("orderId")] = id;
    response = Base.fetch(self.privateDeleteV2UserApiExchangeOrdersOrderId(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function fetchCanceledAndClosedOrders(self::Cryptomus, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.privateGetV2UserApiExchangeOrdersHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        order = get(result, i + 1, nothing);
        push!(orders, self.parseOrder(order, market));
        i += 1
    end
    return orders

end
function fetchOpenOrders(self::Cryptomus, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetV2UserApiExchangeOrders(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, market, nothing, nothing)

end
function parseOrder(self::Cryptomus, order, market=nothing)
    id = safeString2(order, "order_id", "id");
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    dateTime = safeString(order, "createdAt");
    timestamp = self.parse8601(dateTime);
    deal = self.safeDict(order, "deal", Dict{Symbol, Any}());
    averageFilledPrice = self.safeNumber(deal, "averageFilledPrice");
    type_var = safeString(order, "type");
    side = safeString(order, "direction");
    price = self.safeNumber(order, "price");
    transaction = self.safeList(deal, "transactions", []);
    fee = nothing;
    firstTx = self.safeDict(transaction, 0);
    feeCurrency = safeString(firstTx, "feeCurrency");
    if functions.ccxtruthy(feeCurrency != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => self.safeCurrencyCode(feeCurrency),
            Symbol("cost") => self.safeNumber(firstTx, "fee")
        );
    end
    if functions.ccxtruthy(price == nothing)
        price = self.safeNumber(firstTx, "filledPrice");
    end
    amount = self.safeNumber(order, "quantity");
    cost = self.safeNumber(order, "value");
    status = self.parseOrderStatus(safeString(order, "state"));
    clientOrderId = safeString(order, "clientOrderId");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("stopPrice") => safeString(order, "stopLossPrice"),
    Symbol("triggerPrice") => safeString(order, "stopLossPrice"),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => averageFilledPrice,
    Symbol("filled") => safeString(order, "filledQuantity"),
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("info") => order
), market)

end
function parseOrderStatus(self::Cryptomus, status=nothing)
    statuses = Dict{Symbol, Any}(
        Symbol("active") => "open",
        Symbol("completed") => "closed",
        Symbol("partially_completed") => "open",
        Symbol("cancelled") => "canceled",
        Symbol("expired") => "expired",
        Symbol("failed") => "failed"
    );
    return safeString(statuses, status, status)

end
function fetchTradingFees(self::Cryptomus, params=Dict())
    response = Base.fetch(self.privateGetV2UserApiExchangeAccountTariffs(params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    currentFeeTier = self.safeDict(data, "current_tariff_step", Dict{Symbol, Any}());
    makerFee = safeString(currentFeeTier, "maker_percent");
    takerFee = safeString(currentFeeTier, "taker_percent");
    makerFee = stringDiv(makerFee, "100");
    takerFee = stringDiv(takerFee, "100");
    feeTiers = self.safeList(data, "tariff_steps", []);
    result = Dict{Symbol, Any}();
    tiers = self.parseFeeTiers(feeTiers);
    symbols = self.symbols;
    if functions.ccxtruthy(symbols == nothing)
            return result
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.parseNumber(makerFee),
            Symbol("taker") => self.parseNumber(takerFee),
            Symbol("percentage") => true,
            Symbol("tierBased") => true,
            Symbol("tiers") => tiers
        );
        i += 1
    end
    return result

end
function parseFeeTiers(self::Cryptomus, feeTiers, market=nothing)
    takerFees = [];
    makerFees = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(feeTiers)))
        tier = get(feeTiers, i + 1, nothing);
        turnover = self.safeNumber(tier, "from_turnover");
        taker = safeString(tier, "taker_percent");
        maker = safeString(tier, "maker_percent");
        maker = stringDiv(maker, "100");
        taker = stringDiv(taker, "100");
        push!(makerFees, [turnover, self.parseNumber(maker)]);
        push!(takerFees, [turnover, self.parseNumber(taker)]);
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("maker") => makerFees,
    Symbol("taker") => takerFees
)

end
function sign(self::Cryptomus, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = self.implodeParams(path, params);
    params = omit(params, self.extractParams(path));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", endpoint);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        jsonParams = "";
        headers = Dict{Symbol, Any}(
            Symbol("userId") => self.uid
        );
        if functions.ccxtruthy(method != "GET")
            body = json(params);
            jsonParams = body;
            headers[Symbol("Content-Type")] = "application/json";
        else
            query = self.urlencode(params);
            if functions.ccxtruthy(length(query) != 0)
                url += string("?", query);
            end
        end
        jsonParamsBase64 = self.stringToBase64(jsonParams);
        stringToSign = string(jsonParamsBase64, self.secret);
        signature = hash(self.encode(stringToSign), md5);
        headers[Symbol("sign")] = signature;
    else
        query = self.urlencode(params);
        if functions.ccxtruthy(length(query) != 0)
            url += string("?", query);
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Cryptomus, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("code", response))
        code = safeString(response, "code");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    elseif functions.ccxtruthy(ccxt_in("message", response))
        message = safeString(response, "message");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Cryptomus, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetV2UserApiExchangeMarkets(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/markets", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV2UserApiExchangeMarketPrice(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/market/price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1ExchangeMarketAssets(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v1/exchange/market/assets", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1ExchangeMarketOrderBookCurrencyPair(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v1/exchange/market/order-book/{currencyPair}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1ExchangeMarketTickers(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v1/exchange/market/tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1ExchangeMarketTradesCurrencyPair(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v1/exchange/market/trades/{currencyPair}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiExchangeOrders(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiExchangeOrdersHistory(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/orders/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiExchangeAccountBalance(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/account/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiExchangeAccountTariffs(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/account/tariffs", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiPaymentServices(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/payment/services", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiPayoutServices(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/payout/services", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV2UserApiTransactionList(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/transaction/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV2UserApiExchangeOrders(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV2UserApiExchangeOrdersMarket(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/orders/market", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteV2UserApiExchangeOrdersOrderId(self::Cryptomus, params=Dict(), context=Dict())
    return request(self, "v2/user-api/exchange/orders/{orderId}", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Cryptomus(; kwargs...)
    inst = Cryptomus(Exchange(), describe, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTickers, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchBalance, parseBalance, createOrder, cancelOrder, fetchCanceledAndClosedOrders, fetchOpenOrders, parseOrder, parseOrderStatus, fetchTradingFees, parseFeeTiers, sign, handleErrors, publicGetV2UserApiExchangeMarkets, publicGetV2UserApiExchangeMarketPrice, publicGetV1ExchangeMarketAssets, publicGetV1ExchangeMarketOrderBookCurrencyPair, publicGetV1ExchangeMarketTickers, publicGetV1ExchangeMarketTradesCurrencyPair, privateGetV2UserApiExchangeOrders, privateGetV2UserApiExchangeOrdersHistory, privateGetV2UserApiExchangeAccountBalance, privateGetV2UserApiExchangeAccountTariffs, privateGetV2UserApiPaymentServices, privateGetV2UserApiPayoutServices, privateGetV2UserApiTransactionList, privatePostV2UserApiExchangeOrders, privatePostV2UserApiExchangeOrdersMarket, privateDeleteV2UserApiExchangeOrdersOrderId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
