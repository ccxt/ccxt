@kwdef mutable struct Coincheck <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseBalance::Function = parseBalance
    fetchStatus::Function = fetchStatus
    fetchBalance::Function = fetchBalance
    fetchOpenOrders::Function = fetchOpenOrders
    parseOrder::Function = parseOrder
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchMyTrades::Function = fetchMyTrades
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetExchangeOrdersRate::Function = publicGetExchangeOrdersRate
    publicGetExchangeStatus::Function = publicGetExchangeStatus
    publicGetOrderBooks::Function = publicGetOrderBooks
    publicGetRatePair::Function = publicGetRatePair
    publicGetTicker::Function = publicGetTicker
    publicGetTrades::Function = publicGetTrades
    privateGetAccounts::Function = privateGetAccounts
    privateGetAccountsBalance::Function = privateGetAccountsBalance
    privateGetAccountsLeverageBalance::Function = privateGetAccountsLeverageBalance
    privateGetBankAccounts::Function = privateGetBankAccounts
    privateGetDepositMoney::Function = privateGetDepositMoney
    privateGetExchangeOrdersId::Function = privateGetExchangeOrdersId
    privateGetExchangeOrdersOpens::Function = privateGetExchangeOrdersOpens
    privateGetExchangeOrdersCancelStatus::Function = privateGetExchangeOrdersCancelStatus
    privateGetExchangeOrdersTransactions::Function = privateGetExchangeOrdersTransactions
    privateGetExchangeOrdersTransactionsPagination::Function = privateGetExchangeOrdersTransactionsPagination
    privateGetExchangeLeveragePositions::Function = privateGetExchangeLeveragePositions
    privateGetLendingBorrowsMatches::Function = privateGetLendingBorrowsMatches
    privateGetSendMoney::Function = privateGetSendMoney
    privateGetWithdraws::Function = privateGetWithdraws
    privatePostBankAccounts::Function = privatePostBankAccounts
    privatePostDepositMoneyIdFast::Function = privatePostDepositMoneyIdFast
    privatePostExchangeOrders::Function = privatePostExchangeOrders
    privatePostExchangeTransfersToLeverage::Function = privatePostExchangeTransfersToLeverage
    privatePostExchangeTransfersFromLeverage::Function = privatePostExchangeTransfersFromLeverage
    privatePostLendingBorrows::Function = privatePostLendingBorrows
    privatePostLendingBorrowsIdRepay::Function = privatePostLendingBorrowsIdRepay
    privatePostSendMoney::Function = privatePostSendMoney
    privatePostWithdraws::Function = privatePostWithdraws
    privateDeleteBankAccountsId::Function = privateDeleteBankAccountsId
    privateDeleteExchangeOrdersId::Function = privateDeleteExchangeOrdersId
    privateDeleteWithdrawsId::Function = privateDeleteWithdrawsId

end
function describe(self::Coincheck, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coincheck",
    Symbol("name") => "Coincheck",
    Symbol("countries") => ["JP", "ID"],
    Symbol("rateLimit") => 1500,
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
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchDeposits") => true,
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
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOpenInterest") => false,
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
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("ws") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://coincheck.com/api"
        ),
        Symbol("www") => "https://coincheck.com",
        Symbol("doc") => "https://coincheck.com/documents/exchange/api",
        Symbol("fees") => ["https://coincheck.com/exchange/fee", "https://coincheck.com/info/fee"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["exchange/orders/rate", "exchange_status", "order_books", "rate/{pair}", "ticker", "trades"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => ["accounts", "accounts/balance", "accounts/leverage_balance", "bank_accounts", "deposit_money", "exchange/orders/{id}", "exchange/orders/opens", "exchange/orders/cancel_status", "exchange/orders/transactions", "exchange/orders/transactions_pagination", "exchange/leverage/positions", "lending/borrows/matches", "send_money", "withdraws"],
            Symbol("post") => ["bank_accounts", "deposit_money/{id}/fast", "exchange/orders", "exchange/transfers/to_leverage", "exchange/transfers/from_leverage", "lending/borrows", "lending/borrows/{id}/repay", "send_money", "withdraws"],
            Symbol("delete") => ["bank_accounts/{id}", "exchange/orders/{id}", "withdraws/{id}"]
        )
    ),
    Symbol("markets") => Dict{Symbol, Any}(
        Symbol("BTC/JPY") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "btc_jpy",
    Symbol("symbol") => "BTC/JPY",
    Symbol("base") => "BTC",
    Symbol("quote") => "JPY",
    Symbol("baseId") => "btc",
    Symbol("quoteId") => "jpy",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("ETC/JPY") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "etc_jpy",
    Symbol("symbol") => "ETC/JPY",
    Symbol("base") => "ETC",
    Symbol("quote") => "JPY",
    Symbol("baseId") => "etc",
    Symbol("quoteId") => "jpy",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("FCT/JPY") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "fct_jpy",
    Symbol("symbol") => "FCT/JPY",
    Symbol("base") => "FCT",
    Symbol("quote") => "JPY",
    Symbol("baseId") => "fct",
    Symbol("quoteId") => "jpy",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("MONA/JPY") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "mona_jpy",
    Symbol("symbol") => "MONA/JPY",
    Symbol("base") => "MONA",
    Symbol("quote") => "JPY",
    Symbol("baseId") => "mona",
    Symbol("quoteId") => "jpy",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("ETC/BTC") => self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => "etc_btc",
    Symbol("symbol") => "ETC/BTC",
    Symbol("base") => "ETC",
    Symbol("quote") => "BTC",
    Symbol("baseId") => "etc",
    Symbol("quoteId") => "btc",
    Symbol("type") => "spot",
    Symbol("spot") => true
))
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
                    Symbol("IOC") => false,
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
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
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
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0"),
            Symbol("taker") => self.parseNumber("0")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("disabled API Key") => AuthenticationError,
            Symbol("invalid authentication") => AuthenticationError
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function parseBalance(self::Coincheck, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    codes = objectKeys(self.currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        currency = self.currency(code);
        currencyId = get(currency, Symbol("id"), nothing);
        if functions.ccxtruthy(ccxt_in(currencyId, response))
            account = self.account();
            reserved = string(currencyId, "_reserved");
            account[Symbol("free")] = safeString(response, currencyId);
            account[Symbol("used")] = safeString(response, reserved);
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchStatus(self::Coincheck, params=Dict())
    response = Base.fetch(self.publicGetExchangeStatus(params));
    exchangeStatuses = self.safeList(response, "exchange_status", []);
    status = "ok";
    updated = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(exchangeStatuses)))
        exchangeStatus = get(exchangeStatuses, i + 1, nothing);
        rawStatus = safeString(exchangeStatus, "status");
        if functions.ccxtruthy(updated == nothing)
            updated = safeTimestamp(exchangeStatus, "timestamp");
        end
        if functions.ccxtruthy(rawStatus != "available")
            status = "maintenance";
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchBalance(self::Coincheck, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountsBalance(params));
    return self.parseBalance(response)

end
function fetchOpenOrders(self::Coincheck, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetExchangeOrdersOpens(params));
    rawOrders = safeValue(response, "orders", []);
    parsedOrders = self.parseOrders(rawOrders, market, since, limit);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(parsedOrders)))
        push!(result, extend(get(parsedOrders, i + 1, nothing), Dict{Symbol, Any}(
    Symbol("status") => "open"
)));
        i += 1
    end
    return result

end
function parseOrder(self::Coincheck, order, market=nothing)
    id = safeString(order, "id");
    side = safeString(order, "order_type");
    timestamp = self.parse8601(safeString(order, "created_at"));
    amount = safeString(order, "pending_amount");
    remaining = safeString(order, "pending_amount");
    price = safeString(order, "rate");
    status = nothing;
    marketId = safeString(order, "pair");
    symbol = self.safeSymbol(marketId, market, "_");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("amount") => amount,
    Symbol("remaining") => remaining,
    Symbol("filled") => nothing,
    Symbol("side") => side,
    Symbol("type") => nothing,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing,
    Symbol("trades") => nothing
), market)

end
function fetchOrderBook(self::Coincheck, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderBooks(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing))

end
function parseTicker(self::Coincheck, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = safeTimestamp(ticker, "timestamp");
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Coincheck, symbol, params=Dict())
    if functions.ccxtruthy(symbol != "BTC/JPY")
        throw(BadSymbol(string(self.id, " fetchTicker() supports BTC/JPY only")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    ticker = Base.fetch(self.publicGetTicker(extend(request, params)));
    return self.parseTicker(ticker, market)

end
function parseTrade(self::Coincheck, trade, market=nothing)
    timestamp = self.parse8601(safeString(trade, "created_at"));
    id = safeString(trade, "id");
    priceString = safeString(trade, "rate");
    marketId = safeString(trade, "pair");
    market = self.safeMarket(marketId, market, "_");
    baseId = get(market, Symbol("baseId"), nothing);
    quoteId = get(market, Symbol("quoteId"), nothing);
    symbol = get(market, Symbol("symbol"), nothing);
    takerOrMaker = nothing;
    amountString = nothing;
    costString = nothing;
    side = nothing;
    fee = nothing;
    orderId = nothing;
    if functions.ccxtruthy(ccxt_in("liquidity", trade))
        if functions.ccxtruthy(safeString(trade, "liquidity") == "T")
            takerOrMaker = "taker";
        elseif functions.ccxtruthy(safeString(trade, "liquidity") == "M")
            takerOrMaker = "maker";
        end
        funds = safeValue(trade, "funds", Dict{Symbol, Any}());
        amountString = safeString(funds, baseId);
        costString = safeString(funds, quoteId);
        fee = Dict{Symbol, Any}(
            Symbol("currency") => safeString(trade, "fee_currency"),
            Symbol("cost") => safeString(trade, "fee")
        );
        side = safeString(trade, "side");
        orderId = safeString(trade, "order_id");
    else
        amountString = safeString(trade, "amount");
        side = safeString(trade, "order_type");
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("order") => orderId,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market)

end
function fetchMyTrades(self::Coincheck, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetExchangeOrdersTransactionsPagination(extend(request, params)));
    transactions = self.safeList(response, "data", []);
    return self.parseTrades(transactions, market, since, limit)

end
function fetchTrades(self::Coincheck, symbol, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchTradingFees(self::Coincheck, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccounts(params));
    fees = safeValue(response, "exchange_fees", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    if functions.ccxtruthy(symbols == nothing)
            return result
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = safeValue(fees, get(market, Symbol("id"), nothing), Dict{Symbol, Any}());
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(fee, "maker_fee"),
            Symbol("taker") => self.safeNumber(fee, "taker_fee"),
            Symbol("percentage") => true,
            Symbol("tierBased") => false
        );
        i += 1
    end
    return result

end
function createOrder(self::Coincheck, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var == "market")
        request[Symbol("order_type")] = string(type_var, "_", side);
        if functions.ccxtruthy(side == "sell")
            request[Symbol("amount")] = amount;
        else
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() : you should use \"cost\" parameter instead of \"amount\" argument to create market buy orders")));
            end
            request[Symbol("market_buy_amount")] = cost;
        end
    else
        request[Symbol("order_type")] = side;
        request[Symbol("rate")] = price;
        request[Symbol("amount")] = amount;
    end
    response = Base.fetch(self.privatePostExchangeOrders(extend(request, params)));
    id = safeString(response, "id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => response
), market)

end
function cancelOrder(self::Coincheck, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateDeleteExchangeOrdersId(extend(request, params)));
    return self.parseOrder(response)

end
function fetchDeposits(self::Coincheck, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetDepositMoney(extend(request, params)));
    data = self.safeList(response, "deposits", []);
    return self.parseTransactions(data, currency, since, limit, Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
function fetchWithdrawals(self::Coincheck, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWithdraws(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit, Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
function parseTransactionStatus(self::Coincheck, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending") => "pending",
        Symbol("processing") => "pending",
        Symbol("finished") => "ok",
        Symbol("canceled") => "canceled",
        Symbol("confirmed") => "pending",
        Symbol("received") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Coincheck, transaction, currency=nothing)
    id = safeString(transaction, "id");
    timestamp = self.parse8601(safeString(transaction, "created_at"));
    address = safeString(transaction, "address");
    amount = self.safeNumber(transaction, "amount");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    updated = self.parse8601(safeString(transaction, "confirmed_at"));
    fee = nothing;
    feeCost = self.safeNumber(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function nonce(self::Coincheck, )
    return milliseconds()

end
function sign(self::Coincheck, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        queryString = "";
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(keysort(query)));
            end
        else
            if functions.ccxtruthy(length(objectKeys(query)))
                body = self.urlencode(keysort(query));
                queryString = body;
            end
        end
        auth = string(nonce, url, queryString);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-NONCE") => nonce,
            Symbol("ACCESS-SIGNATURE") => self.hmac(self.encode(auth), self.encode(self.secret), sha256)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coincheck, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = self.safeBool(response, "success", true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        error = safeString(response, "error");
        feedback = string(self.id, " ", json(response));
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        throw(ExchangeError(string(self.id, " ", json(response))));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coincheck, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetExchangeOrdersRate(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/rate", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetExchangeStatus(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange_status", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrderBooks(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "order_books", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRatePair(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "rate/{pair}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetAccounts(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "accounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsBalance(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "accounts/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountsLeverageBalance(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "accounts/leverage_balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBankAccounts(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "bank_accounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetDepositMoney(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "deposit_money", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeOrdersId(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeOrdersOpens(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/opens", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeOrdersCancelStatus(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/cancel_status", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeOrdersTransactions(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/transactions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeOrdersTransactionsPagination(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/transactions_pagination", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetExchangeLeveragePositions(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/leverage/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetLendingBorrowsMatches(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "lending/borrows/matches", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSendMoney(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "send_money", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWithdraws(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "withdraws", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostBankAccounts(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "bank_accounts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDepositMoneyIdFast(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "deposit_money/{id}/fast", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExchangeOrders(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExchangeTransfersToLeverage(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/transfers/to_leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExchangeTransfersFromLeverage(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/transfers/from_leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLendingBorrows(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "lending/borrows", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLendingBorrowsIdRepay(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "lending/borrows/{id}/repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSendMoney(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "send_money", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdraws(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "withdraws", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteBankAccountsId(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "bank_accounts/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteExchangeOrdersId(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "exchange/orders/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteWithdrawsId(self::Coincheck, params=Dict(), context=Dict())
    return request(self, "withdraws/{id}", "private", "DELETE", params, nothing, nothing, Dict())
end

function Coincheck(; kwargs...)
    inst = Coincheck(Exchange(), describe, parseBalance, fetchStatus, fetchBalance, fetchOpenOrders, parseOrder, fetchOrderBook, parseTicker, fetchTicker, parseTrade, fetchMyTrades, fetchTrades, fetchTradingFees, createOrder, cancelOrder, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, nonce, sign, handleErrors, publicGetExchangeOrdersRate, publicGetExchangeStatus, publicGetOrderBooks, publicGetRatePair, publicGetTicker, publicGetTrades, privateGetAccounts, privateGetAccountsBalance, privateGetAccountsLeverageBalance, privateGetBankAccounts, privateGetDepositMoney, privateGetExchangeOrdersId, privateGetExchangeOrdersOpens, privateGetExchangeOrdersCancelStatus, privateGetExchangeOrdersTransactions, privateGetExchangeOrdersTransactionsPagination, privateGetExchangeLeveragePositions, privateGetLendingBorrowsMatches, privateGetSendMoney, privateGetWithdraws, privatePostBankAccounts, privatePostDepositMoneyIdFast, privatePostExchangeOrders, privatePostExchangeTransfersToLeverage, privatePostExchangeTransfersFromLeverage, privatePostLendingBorrows, privatePostLendingBorrowsIdRepay, privatePostSendMoney, privatePostWithdraws, privateDeleteBankAccountsId, privateDeleteExchangeOrdersId, privateDeleteWithdrawsId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
