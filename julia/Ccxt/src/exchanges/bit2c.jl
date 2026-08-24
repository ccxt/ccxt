@kwdef mutable struct Bit2c <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrder::Function = fetchOrder
    parseOrder::Function = parseOrder
    fetchMyTrades::Function = fetchMyTrades
    removeCommaFromValue::Function = removeCommaFromValue
    parseTrade::Function = parseTrade
    isFiat::Function = isFiat
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetExchangesPairTicker::Function = publicGetExchangesPairTicker
    publicGetExchangesPairOrderbook::Function = publicGetExchangesPairOrderbook
    publicGetExchangesPairTrades::Function = publicGetExchangesPairTrades
    publicGetExchangesPairLasttrades::Function = publicGetExchangesPairLasttrades
    privatePostMerchantCreateCheckout::Function = privatePostMerchantCreateCheckout
    privatePostFundsAddCoinFundsRequest::Function = privatePostFundsAddCoinFundsRequest
    privatePostOrderAddFund::Function = privatePostOrderAddFund
    privatePostOrderAddOrder::Function = privatePostOrderAddOrder
    privatePostOrderGetById::Function = privatePostOrderGetById
    privatePostOrderAddOrderMarketPriceBuy::Function = privatePostOrderAddOrderMarketPriceBuy
    privatePostOrderAddOrderMarketPriceSell::Function = privatePostOrderAddOrderMarketPriceSell
    privatePostOrderCancelOrder::Function = privatePostOrderCancelOrder
    privatePostOrderAddCoinFundsRequest::Function = privatePostOrderAddCoinFundsRequest
    privatePostOrderAddStopOrder::Function = privatePostOrderAddStopOrder
    privatePostPaymentGetMyId::Function = privatePostPaymentGetMyId
    privatePostPaymentSend::Function = privatePostPaymentSend
    privatePostPaymentPay::Function = privatePostPaymentPay
    privateGetAccountBalance::Function = privateGetAccountBalance
    privateGetAccountBalanceV2::Function = privateGetAccountBalanceV2
    privateGetOrderMyOrders::Function = privateGetOrderMyOrders
    privateGetOrderGetById::Function = privateGetOrderGetById
    privateGetOrderAccountHistory::Function = privateGetOrderAccountHistory
    privateGetOrderOrderHistory::Function = privateGetOrderOrderHistory

end
function describe(self::Bit2c, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bit2c",
    Symbol("name") => "Bit2C",
    Symbol("countries") => ["IL"],
    Symbol("rateLimit") => 3000,
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
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
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
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
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
        Symbol("fetchOrder") => true,
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
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("ws") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/db0bce50-6842-4c09-a1d5-0c87d22118aa",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://bit2c.co.il"
        ),
        Symbol("www") => "https://www.bit2c.co.il",
        Symbol("referral") => "https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf",
        Symbol("doc") => ["https://www.bit2c.co.il/home/api", "https://github.com/OferE/bit2c"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("Exchanges/{pair}/Ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Exchanges/{pair}/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Exchanges/{pair}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Exchanges/{pair}/lasttrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("Merchant/CreateCheckout") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Funds/AddCoinFundsRequest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddFund") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/GetById") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddOrderMarketPriceBuy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddOrderMarketPriceSell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/CancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddCoinFundsRequest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AddStopOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Payment/GetMyId") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Payment/Send") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Payment/Pay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("Account/Balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Account/Balance/v2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/MyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/GetById") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/AccountHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Order/OrderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("markets") => Dict{Symbol, Any}(
        Symbol("BTC/NIS") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "BtcNis",
    Symbol("symbol") => "BTC/NIS",
    Symbol("base") => "BTC",
    Symbol("quote") => "NIS",
    Symbol("baseId") => "Btc",
    Symbol("quoteId") => "Nis",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("ETH/NIS") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "EthNis",
    Symbol("symbol") => "ETH/NIS",
    Symbol("base") => "ETH",
    Symbol("quote") => "NIS",
    Symbol("baseId") => "Eth",
    Symbol("quoteId") => "Nis",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("LTC/NIS") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "LtcNis",
    Symbol("symbol") => "LTC/NIS",
    Symbol("base") => "LTC",
    Symbol("quote") => "NIS",
    Symbol("baseId") => "Ltc",
    Symbol("quoteId") => "Nis",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("USDC/NIS") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "UsdcNis",
    Symbol("symbol") => "USDC/NIS",
    Symbol("base") => "USDC",
    Symbol("quote") => "NIS",
    Symbol("baseId") => "Usdc",
    Symbol("quoteId") => "Nis",
    Symbol("type") => "spot",
    Symbol("spot") => true
))
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.025"),
            Symbol("taker") => self.parseNumber("0.03"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.03")], [self.parseNumber("20000"), self.parseNumber("0.0275")], [self.parseNumber("50000"), self.parseNumber("0.025")], [self.parseNumber("75000"), self.parseNumber("0.0225")], [self.parseNumber("100000"), self.parseNumber("0.02")], [self.parseNumber("250000"), self.parseNumber("0.015")], [self.parseNumber("500000"), self.parseNumber("0.0125")], [self.parseNumber("750000"), self.parseNumber("0.01")], [self.parseNumber("1000000"), self.parseNumber("0.008")], [self.parseNumber("2000000"), self.parseNumber("0.006")], [self.parseNumber("3000000"), self.parseNumber("0.004")], [self.parseNumber("4000000"), self.parseNumber("0.002")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.025")], [self.parseNumber("20000"), self.parseNumber("0.0225")], [self.parseNumber("50000"), self.parseNumber("0.02")], [self.parseNumber("75000"), self.parseNumber("0.0175")], [self.parseNumber("100000"), self.parseNumber("0.015")], [self.parseNumber("250000"), self.parseNumber("0.01")], [self.parseNumber("500000"), self.parseNumber("0.0075")], [self.parseNumber("750000"), self.parseNumber("0.005")], [self.parseNumber("1000000"), self.parseNumber("0.004")], [self.parseNumber("2000000"), self.parseNumber("0.003")], [self.parseNumber("3000000"), self.parseNumber("0.002")], [self.parseNumber("4000000"), self.parseNumber("0.001")]]
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchTrades") => Dict{Symbol, Any}(
            Symbol("method") => "public_get_exchanges_pair_trades"
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
                Symbol("daysBack") => 30,
                Symbol("untilDays") => 30,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
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
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Please provide valid APIkey") => AuthenticationError,
            Symbol("No order found.") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Please provide valid nonce") => InvalidNonce,
            Symbol("please approve new terms of use on site") => PermissionDenied
        )
    )
))

end
function parseBalance(self::Bit2c, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    codes = objectKeys(self.currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        account = self.account();
        currency = self.currency(code);
        uppercase_var = uppercase(get(currency, Symbol("id"), nothing));
        if functions.ccxtruthy(ccxt_in(uppercase_var, response))
            account[Symbol("free")] = safeString(response, string("AVAILABLE_", uppercase_var));
            account[Symbol("total")] = safeString(response, uppercase_var);
        end
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bit2c.co.il/home/api#balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bit2c; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountBalanceV2(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bit2c.co.il/home/api#orderb

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bit2c, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    orderbook = Base.fetch(self.publicGetExchangesPairOrderbook(extend(request, params)));
    return self.parseOrderBook(orderbook, symbol)

end
function parseTicker(self::Bit2c, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    averagePrice = safeString(ticker, "av");
    baseVolume = safeString(ticker, "a");
    last_var = safeString(ticker, "ll");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "h"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "l"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => averagePrice,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bit2c.co.il/home/api#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bit2c, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetExchangesPairTicker(extend(request, params)));
    return self.parseTicker(response, market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://bit2c.co.il/home/api#transactions
see: https://bit2c.co.il/home/api#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bit2c, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    optionValue = safeString(self.options, "fetchTradesMethod");
    method = self.handleOption("fetchTrades", "method", defaultValue = optionValue);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("date")] = self.parseToInt(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    responseList = [];
    if functions.ccxtruthy(method == "public_get_exchanges_pair_trades")
        response = Base.fetch(self.publicGetExchangesPairTrades(extend(request, params)));
        if functions.ccxtruthy(isa(response, AbstractString))
            throw(ExchangeError(response));
        end
        responseList = toArray(response);
    else
        response = Base.fetch(self.publicGetExchangesPairLasttrades(extend(request, params)));
        if functions.ccxtruthy(isa(response, AbstractString))
            throw(ExchangeError(response));
        end
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets
see: https://bit2c.co.il/home/api#balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bit2c; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountBalance(params));
    fees = safeValue(response, "Fees", Dict{Symbol, Any}());
    keys_var = objectKeys(fees);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        marketId = get(keys_var, i + 1, nothing);
        symbol = self.safeSymbol(marketId);
        fee = safeValue(fees, marketId);
        makerString = safeString(fee, "FeeMaker");
        takerString = safeString(fee, "FeeTaker");
        maker = self.parseNumber(stringDiv(makerString, "100"));
        taker = self.parseNumber(stringDiv(takerString, "100"));
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => symbol,
            Symbol("taker") => taker,
            Symbol("maker") => maker,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
"""
create a trade order
see: https://bit2c.co.il/home/api#addo

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bit2c, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = "privatePostOrderAddOrder";
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("Amount") => amount,
        Symbol("Pair") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var == "market")
        method += string("MarketPrice", capitalize(side));
    else
        request[Symbol("Price")] = price;
        amountString = numberToString(amount);
        priceString = numberToString(price);
        request[Symbol("Total")] = self.parseToNumeric(stringMul(amountString, priceString));
        request[Symbol("IsBid")] =         (side == "buy");
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://bit2c.co.il/home/api#cancelo

# Arguments
- `id`::string: order id
- `symbol`::string: Not used by bit2c cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bit2c, id; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privatePostOrderCancelOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch all unfilled currently open orders
see: https://bit2c.co.il/home/api#geto

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bit2c; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetOrderMyOrders(extend(request, params)));
    orders = safeValue(response, get(market, Symbol("id"), nothing), Dict{Symbol, Any}());
    asks = safeValue(orders, "ask", []);
    bids = self.safeList(orders, "bid", defaultValue = []);
    return self.parseOrders(arrayConcat(asks, bids), market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://bit2c.co.il/home/api#getoid

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bit2c, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrderGetById(extend(request, params)));
    return self.parseOrder(response, market = market)

end
function parseOrder(self::Bit2c, order; market=nothing)
    orderUnified = nothing;
    isNewOrder = false;
    if functions.ccxtruthy(ccxt_in("NewOrder", order))
        orderUnified = get(order, Symbol("NewOrder"), nothing);
        isNewOrder = true;
    else
        orderUnified = order;
    end
    id = safeString(orderUnified, "id");
    symbol = self.safeSymbol(nothing, market = market);
    timestamp = safeIntegerProduct(orderUnified, "created", 1000);
    status = nothing;
    if functions.ccxtruthy(isNewOrder)
        tempStatus = safeInteger(orderUnified, "status_type");
        if functions.ccxtruthy(@functions.ccxt_or(tempStatus == 0, tempStatus == 1))
            status = "open";
        elseif functions.ccxtruthy(tempStatus == 5)
            status = "closed";
        end
    else
        tempStatus = safeString(orderUnified, "status");
        if functions.ccxtruthy(@functions.ccxt_or(tempStatus == "New", tempStatus == "Open"))
            status = "open";
        elseif functions.ccxtruthy(tempStatus == "Completed")
            status = "closed";
        end
    end
    type_var = safeString(orderUnified, "order_type");
    if functions.ccxtruthy(type_var == "0")
        type_var = "limit";
    elseif functions.ccxtruthy(type_var == "1")
        type_var = "market";
    end
    side = safeString(orderUnified, "type");
    if functions.ccxtruthy(side == "0")
        side = "buy";
    elseif functions.ccxtruthy(side == "1")
        side = "sell";
    end
    price = safeString(orderUnified, "price");
    amount = nothing;
    remaining = nothing;
    if functions.ccxtruthy(isNewOrder)
        amount = safeString(orderUnified, "amount");
        remaining = safeString(orderUnified, "amount");
    else
        amount = safeString(orderUnified, "initialAmount");
        remaining = safeString(orderUnified, "amount");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market = market)

end
"""
fetch all trades made by the user
see: https://bit2c.co.il/home/api#orderh

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bit2c; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("take")] = limit;
    end
    request[Symbol("take")] = limit;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("toTime")] = self.yyyymmdd(milliseconds(), ".");
        request[Symbol("fromTime")] = self.yyyymmdd(since, ".");
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOrderOrderHistory(extend(request, params)));
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
function removeCommaFromValue(self::Bit2c, str)
    newString = "";
    strParts = split(str, ",");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(strParts)))
        newString += get(strParts, i + 1, nothing);
        i += 1
    end
    return newString

end
function parseTrade(self::Bit2c, trade; market=nothing)
    price = nothing;
    amount = nothing;
    orderId = nothing;
    fee = nothing;
    makerOrTaker = nothing;
    reference = safeString(trade, "reference");
    if functions.ccxtruthy(reference != nothing)
        id = reference;
        timestamp = safeTimestamp(trade, "ticks");
        price = safeString(trade, "price");
        price = self.removeCommaFromValue(price);
        amount = safeString(trade, "firstAmount");
        reference_parts = split(reference, "|");
        marketId = safeString(trade, "pair");
        market = self.safeMarket(marketId = marketId, market = market);
        market = self.safeMarket(marketId = get(reference_parts, 1, nothing), market = market);
        isMaker = safeValue(trade, "isMaker");
        makerOrTaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
        orderId = functions.ccxtruthy(isMaker) ? get(reference_parts, 3, nothing) : get(reference_parts, 2, nothing);
        action = safeInteger(trade, "action");
        if functions.ccxtruthy(action == 0)
            side = "buy";
        else
            side = "sell";
        end
        feeCost = safeString(trade, "feeAmount");
        if functions.ccxtruthy(feeCost != nothing)
            fee = Dict{Symbol, Any}(
                Symbol("cost") => feeCost,
                Symbol("currency") => "NIS"
            );
        end
    else
        timestamp = safeTimestamp(trade, "date");
        id = safeString(trade, "tid");
        price = safeString(trade, "price");
        amount = safeString(trade, "amount");
        side = safeValue(trade, "isBid");
        if functions.ccxtruthy(side != nothing)
            if functions.ccxtruthy(side)
                side = "buy";
            else
                side = "sell";
            end
        end
    end
    market = self.safeMarket(marketId = nothing, market = market);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => makerOrTaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
function isFiat(self::Bit2c, code)
    return code == "NIS"

end
"""
fetch the deposit address for a currency associated with this account
see: https://bit2c.co.il/home/api#addc

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bit2c, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(self.isFiat(code))
        throw(NotSupported(string(self.id, " fetchDepositAddress() does not support fiat currencies")));
    end
    request = Dict{Symbol, Any}(
        Symbol("Coin") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostFundsAddCoinFundsRequest(extend(request, params)));
    return self.parseDepositAddress(response, currency = currency)

end
function parseDepositAddress(self::Bit2c, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address = address);
    code = self.safeCurrencyCode(nothing, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function nonce(self::Bit2c, )
    return milliseconds()

end
function sign(self::Bit2c, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", self.implodeParams(path, params));
    if functions.ccxtruthy(api == "public")
        url += ".json";
    else
        self.checkRequiredCredentials();
        nonce = self.nonce();
        query = extend(Dict{Symbol, Any}(
            Symbol("nonce") => nonce
        ), params);
        auth = self.urlencode(query);
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", auth);
            end
        else
            body = auth;
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha512, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("key") => self.apiKey,
            Symbol("sign") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bit2c, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = safeString(response, "error");
    if functions.ccxtruthy(error == nothing)
        error = safeString(response, "Error");
    end
    if functions.ccxtruthy(error != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bit2c, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetExchangesPairTicker(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Exchanges/{pair}/Ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangesPairOrderbook(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Exchanges/{pair}/orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangesPairTrades(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Exchanges/{pair}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangesPairLasttrades(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Exchanges/{pair}/lasttrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMerchantCreateCheckout(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Merchant/CreateCheckout"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFundsAddCoinFundsRequest(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Funds/AddCoinFundsRequest"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddFund(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddFund"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddOrder(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderGetById(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/GetById"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddOrderMarketPriceBuy(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddOrderMarketPriceBuy"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddOrderMarketPriceSell(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddOrderMarketPriceSell"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCancelOrder(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/CancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddCoinFundsRequest(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddCoinFundsRequest"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderAddStopOrder(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AddStopOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPaymentGetMyId(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Payment/GetMyId"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPaymentSend(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Payment/Send"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPaymentPay(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Payment/Pay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountBalance(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Account/Balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountBalanceV2(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Account/Balance/v2"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderMyOrders(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/MyOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderGetById(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/GetById"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderAccountHistory(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/AccountHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOrderHistory(self::Bit2c, params=Dict(), context=Dict())
    return request(self, "Order/OrderHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bit2c(; kwargs...)
    inst = Bit2c(Exchange(), describe, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTrades, fetchTradingFees, createOrder, cancelOrder, fetchOpenOrders, fetchOrder, parseOrder, fetchMyTrades, removeCommaFromValue, parseTrade, isFiat, fetchDepositAddress, parseDepositAddress, nonce, sign, handleErrors, publicGetExchangesPairTicker, publicGetExchangesPairOrderbook, publicGetExchangesPairTrades, publicGetExchangesPairLasttrades, privatePostMerchantCreateCheckout, privatePostFundsAddCoinFundsRequest, privatePostOrderAddFund, privatePostOrderAddOrder, privatePostOrderGetById, privatePostOrderAddOrderMarketPriceBuy, privatePostOrderAddOrderMarketPriceSell, privatePostOrderCancelOrder, privatePostOrderAddCoinFundsRequest, privatePostOrderAddStopOrder, privatePostPaymentGetMyId, privatePostPaymentSend, privatePostPaymentPay, privateGetAccountBalance, privateGetAccountBalanceV2, privateGetOrderMyOrders, privateGetOrderGetById, privateGetOrderAccountHistory, privateGetOrderOrderHistory)
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
function __ccxt_doc_Bit2c_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bit2c.co.il/home/api#balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bit2c_fetchBalance

function __ccxt_doc_Bit2c_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bit2c.co.il/home/api#orderb

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bit2c_fetchOrderBook

function __ccxt_doc_Bit2c_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bit2c.co.il/home/api#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bit2c_fetchTicker

function __ccxt_doc_Bit2c_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://bit2c.co.il/home/api#transactions
see: https://bit2c.co.il/home/api#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bit2c_fetchTrades

function __ccxt_doc_Bit2c_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://bit2c.co.il/home/api#balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bit2c_fetchTradingFees

function __ccxt_doc_Bit2c_createOrder() end
"""
create a trade order
see: https://bit2c.co.il/home/api#addo

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bit2c_createOrder

function __ccxt_doc_Bit2c_cancelOrder() end
"""
cancels an open order
see: https://bit2c.co.il/home/api#cancelo

# Arguments
- `id`::string: order id
- `symbol`::string: Not used by bit2c cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bit2c_cancelOrder

function __ccxt_doc_Bit2c_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://bit2c.co.il/home/api#geto

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bit2c_fetchOpenOrders

function __ccxt_doc_Bit2c_fetchOrder() end
"""
fetches information on an order made by the user
see: https://bit2c.co.il/home/api#getoid

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bit2c_fetchOrder

function __ccxt_doc_Bit2c_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://bit2c.co.il/home/api#orderh

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bit2c_fetchMyTrades

function __ccxt_doc_Bit2c_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://bit2c.co.il/home/api#addc

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bit2c_fetchDepositAddress
