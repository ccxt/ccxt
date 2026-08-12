@kwdef mutable struct Bithumb <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    safeMarket::Function = safeMarket
    amountToPrecision::Function = amountToPrecision
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    cancelOrder::Function = cancelOrder
    cancelUnifiedOrder::Function = cancelUnifiedOrder
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    fixCommaNumber::Function = fixCommaNumber
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetTickerALLQuoteId::Function = publicGetTickerALLQuoteId
    publicGetTickerBaseIdQuoteId::Function = publicGetTickerBaseIdQuoteId
    publicGetOrderbookALLQuoteId::Function = publicGetOrderbookALLQuoteId
    publicGetOrderbookBaseIdQuoteId::Function = publicGetOrderbookBaseIdQuoteId
    publicGetTransactionHistoryBaseIdQuoteId::Function = publicGetTransactionHistoryBaseIdQuoteId
    publicGetNetworkInfo::Function = publicGetNetworkInfo
    publicGetAssetsstatusMultichainALL::Function = publicGetAssetsstatusMultichainALL
    publicGetAssetsstatusMultichainCurrency::Function = publicGetAssetsstatusMultichainCurrency
    publicGetWithdrawMinimumALL::Function = publicGetWithdrawMinimumALL
    publicGetWithdrawMinimumCurrency::Function = publicGetWithdrawMinimumCurrency
    publicGetAssetsstatusALL::Function = publicGetAssetsstatusALL
    publicGetAssetsstatusBaseId::Function = publicGetAssetsstatusBaseId
    publicGetCandlestickBaseIdQuoteIdInterval::Function = publicGetCandlestickBaseIdQuoteIdInterval
    privatePostInfoAccount::Function = privatePostInfoAccount
    privatePostInfoBalance::Function = privatePostInfoBalance
    privatePostInfoWalletAddress::Function = privatePostInfoWalletAddress
    privatePostInfoTicker::Function = privatePostInfoTicker
    privatePostInfoOrders::Function = privatePostInfoOrders
    privatePostInfoUserTransactions::Function = privatePostInfoUserTransactions
    privatePostInfoOrderDetail::Function = privatePostInfoOrderDetail
    privatePostTradePlace::Function = privatePostTradePlace
    privatePostTradeCancel::Function = privatePostTradeCancel
    privatePostTradeBtcWithdrawal::Function = privatePostTradeBtcWithdrawal
    privatePostTradeKrwDeposit::Function = privatePostTradeKrwDeposit
    privatePostTradeKrwWithdrawal::Function = privatePostTradeKrwWithdrawal
    privatePostTradeMarketBuy::Function = privatePostTradeMarketBuy
    privatePostTradeMarketSell::Function = privatePostTradeMarketSell
    privatePostTradeStopLimit::Function = privatePostTradeStopLimit

end
function describe(self::Bithumb, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bithumb",
    Symbol("name") => "Bithumb",
    Symbol("countries") => ["KR"],
    Symbol("rateLimit") => 500,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
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
        Symbol("createMarketOrder") => true,
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
        Symbol("fetchCurrencies") => false,
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
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchOHLCV") => true,
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
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("hostname") => "bithumb.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/c9e0eefb-4777-46b9-8f09-9d7f7c4af82d",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.{hostname}/public",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("www") => "https://www.bithumb.com",
        Symbol("doc") => "https://apidocs.bithumb.com",
        Symbol("fees") => "https://en.bithumb.com/customer_support/info_fee"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ticker/ALL_{quoteId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/{baseId}_{quoteId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/ALL_{quoteId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/{baseId}_{quoteId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transaction_history/{baseId}_{quoteId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("network-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetsstatus/multichain/ALL") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetsstatus/multichain/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw/minimum/ALL") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw/minimum/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetsstatus/ALL") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetsstatus/{baseId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("candlestick/{baseId}_{quoteId}/{interval}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("info/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/wallet_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/user_transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("info/order_detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/place") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/btc_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/krw_deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/krw_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/market_buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/market_sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/stop_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("0.0025"),
            Symbol("taker") => self.parseNumber("0.0025")
        )
    ),
    Symbol("precisionMode") => SIGNIFICANT_DIGITS,
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
            Symbol("fetchMyTrades") => nothing,
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("Bad Request(SSL)") => BadRequest,
        Symbol("Bad Request(Bad Method)") => BadRequest,
        Symbol("Bad Request.(Auth Data)") => AuthenticationError,
        Symbol("Not Member") => AuthenticationError,
        Symbol("Invalid Apikey") => AuthenticationError,
        Symbol("Method Not Allowed.(Access IP)") => PermissionDenied,
        Symbol("Method Not Allowed.(BTC Adress)") => InvalidAddress,
        Symbol("Method Not Allowed.(Access)") => PermissionDenied,
        Symbol("Database Fail") => ExchangeNotAvailable,
        Symbol("Invalid Parameter") => BadRequest,
        Symbol("5600") => ExchangeError,
        Symbol("Unknown Error") => ExchangeError,
        Symbol("After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions") => ExchangeError
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("10m") => "10m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "24h"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("quoteCurrencies") => Dict{Symbol, Any}(
            Symbol("BTC") => Dict{Symbol, Any}(
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("cost") => Dict{Symbol, Any}(
                        Symbol("min") => 0.0002,
                        Symbol("max") => 100
                    )
                )
            ),
            Symbol("KRW") => Dict{Symbol, Any}(
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("cost") => Dict{Symbol, Any}(
                        Symbol("min") => 500,
                        Symbol("max") => 5000000000
                    )
                )
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("ALT") => "ArchLoot",
        Symbol("FTC") => "FTC2",
        Symbol("SOC") => "Soda Coin"
    )
))

end
function safeMarket(self::Bithumb; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    return safeMarket(self.parent, marketId = marketId, market = market, delimiter = delimiter, marketType = "spot")

end
function amountToPrecision(self::Bithumb, symbol, amount)
    market = self.market(symbol);
    return decimalToPrecision(amount, TRUNCATE, get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing), DECIMAL_PLACES)

end
"""
retrieves data on all markets for bithumb
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bithumb; params=Dict())
    result = [];
    quoteCurrencies = self.safeDict(self.options, "quoteCurrencies", defaultValue = Dict{Symbol, Any}());
    quotes = objectKeys(quoteCurrencies);
    promises = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(quotes)))
        request = Dict{Symbol, Any}(
            Symbol("quoteId") => get(quotes, i + 1, nothing)
        );
        push!(promises, self.publicGetTickerALLQuoteId(extend(request, params)));
        i += 1
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(quotes)))
        quote_var = get(quotes, i + 1, nothing);
        quoteId = quote_var;
        response = get(results, i + 1, nothing);
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        extension = self.safeDict(quoteCurrencies, quote_var, defaultValue = Dict{Symbol, Any}());
        currencyIds = objectKeys(data);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(currencyIds)))
            currencyId = get(currencyIds, j + 1, nothing);
            if functions.ccxtruthy(currencyId == "date")
                j += 1; continue
            end
            market = get(data, Symbol(currencyId), nothing);
            base = self.safeCurrencyCode(currencyId);
            active = true;
            if functions.ccxtruthy(functions.ccxt_isArray(market))
                numElements = length(market);
                if functions.ccxtruthy(numElements == 0)
                    active = false;
                end
            end
            entry = deepExtend(Dict{Symbol, Any}(
                Symbol("id") => currencyId,
                Symbol("symbol") => string(base, "/", quote_var),
                Symbol("base") => base,
                Symbol("quote") => quote_var,
                Symbol("settle") => nothing,
                Symbol("baseId") => currencyId,
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
                Symbol("expiryDateTime") => nothing,
                Symbol("strike") => nothing,
                Symbol("optionType") => nothing,
                Symbol("precision") => Dict{Symbol, Any}(
                    Symbol("amount") => ccxt_parseInt("4"),
                    Symbol("price") => ccxt_parseInt("4")
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
                    Symbol("cost") => Dict{Symbol, Any}()
                ),
                Symbol("created") => nothing,
                Symbol("info") => market
            ), extension);
            push!(result, entry);
            j += 1
        end
        i += 1
    end
    return result

end
function parseBalance(self::Bithumb, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeDict(response, "data");
    codes = objectKeys(self.currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        account = self.account();
        currency = self.currency(code);
        lowerCurrencyId = safeStringLower(currency, "id");
        account[Symbol("total")] = safeString(balances, string("total_", lowerCurrencyId));
        account[Symbol("used")] = safeString(balances, string("in_use_", lowerCurrencyId));
        account[Symbol("free")] = safeString(balances, string("available_", lowerCurrencyId));
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bithumb; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => "ALL"
    );
    response = Base.fetch(self.privatePostInfoBalance(extend(request, params)));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bithumb, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("baseId") => get(market, Symbol("baseId"), nothing),
        Symbol("quoteId") => get(market, Symbol("quoteId"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetOrderbookBaseIdQuoteId(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "timestamp");
    return self.parseOrderBook(data, symbol, timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "quantity")

end
function parseTicker(self::Bithumb, ticker; market=nothing)
    timestamp = safeInteger(ticker, "date");
    symbol = self.safeSymbol(nothing, market = market);
    open = safeString(ticker, "opening_price");
    close = safeString(ticker, "closing_price");
    baseVolume = safeString(ticker, "units_traded_24H");
    quoteVolume = safeString(ticker, "acc_trade_value_24H");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "max_price"),
    Symbol("low") => safeString(ticker, "min_price"),
    Symbol("bid") => safeString(ticker, "buy_price"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "sell_price"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => close,
    Symbol("last") => close,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bithumb; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    result = Dict{Symbol, Any}();
    quoteCurrencies = self.safeDict(self.options, "quoteCurrencies", defaultValue = Dict{Symbol, Any}());
    quotes = objectKeys(quoteCurrencies);
    promises = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(quotes)))
        request = Dict{Symbol, Any}(
            Symbol("quoteId") => get(quotes, i + 1, nothing)
        );
        push!(promises, self.publicGetTickerALLQuoteId(extend(request, params)));
        i += 1
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(quotes)))
        quote_var = get(quotes, i + 1, nothing);
        response = get(responses, i + 1, nothing);
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        timestamp = safeInteger(data, "date");
        tickers = omit(data, "date");
        currencyIds = objectKeys(tickers);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(currencyIds)))
            currencyId = get(currencyIds, j + 1, nothing);
            ticker = get(data, Symbol(currencyId), nothing);
            base = self.safeCurrencyCode(currencyId);
            symbol = string(base, "/", quote_var);
            market = self.safeMarket(marketId = symbol);
            ticker[Symbol("date")] = timestamp;
            result[Symbol(symbol)] = self.parseTicker(ticker, market = market);
            j += 1
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bithumb, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("baseId") => get(market, Symbol("baseId"), nothing),
        Symbol("quoteId") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetTickerBaseIdQuoteId(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(data, market = market)

end
function parseOHLCV(self::Bithumb, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bithumb, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("baseId") => get(market, Symbol("baseId"), nothing),
        Symbol("quoteId") => get(market, Symbol("quoteId"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    response = Base.fetch(self.publicGetCandlestickBaseIdQuoteIdInterval(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseTrade(self::Bithumb, trade; market=nothing)
    timestamp = nothing;
    transactionDatetime = safeString(trade, "transaction_date");
    if functions.ccxtruthy(transactionDatetime != nothing)
        parts = split(transactionDatetime, " ");
        numParts = length(parts);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
            transactionDate = get(parts, 1, nothing);
            transactionTime = get(parts, 2, nothing);
            if functions.ccxtruthy(functions.ccxt_lt(length(transactionTime), 8))
                transactionTime = string("0", transactionTime);
            end
            timestamp = self.parse8601(string(transactionDate, " ", transactionTime));
        else
            timestamp = safeIntegerProduct(trade, "transaction_date", 0.001);
        end
    end
    if functions.ccxtruthy(timestamp != nothing)
        timestamp -= 9 * 3600000;
    end
    type_var = nothing;
    side = safeString(trade, "type");
    side = functions.ccxtruthy((side == "ask")) ? "sell" : "buy";
    id = safeString(trade, "cont_no");
    market = self.safeMarket(marketId = nothing, market = market);
    priceString = safeString(trade, "price");
    amountString = self.fixCommaNumber(safeString2(trade, "units_traded", "units"));
    costString = safeString(trade, "total");
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "fee_currency");
        feeCurrencyCode = self.commonCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => nothing,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bithumb, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("baseId") => get(market, Symbol("baseId"), nothing),
        Symbol("quoteId") => get(market, Symbol("quoteId"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetTransactionHistoryBaseIdQuoteId(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
create a trade order
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0

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
function createOrder(self::Bithumb, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_currency") => get(market, Symbol("id"), nothing),
        Symbol("payment_currency") => get(market, Symbol("quote"), nothing),
        Symbol("units") => amount
    );
    method = "privatePostTradePlace";
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = price;
        request[Symbol("type")] = functions.ccxtruthy((side == "buy")) ? "bid" : "ask";
    else
        method = string("privatePostTradeMarket", capitalize(side));
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    id = safeString(response, "order_id");
    if functions.ccxtruthy(id == nothing)
        throw(InvalidOrder(string(self.id, " createOrder() did not return an order id")));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("id") => id
), market = market)

end
"""
fetches information on an order made by the user
see: https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bithumb, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("count") => 1,
        Symbol("order_currency") => get(market, Symbol("base"), nothing),
        Symbol("payment_currency") => get(market, Symbol("quote"), nothing)
    );
    response = Base.fetch(self.privatePostInfoOrderDetail(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseOrder(extend(data, Dict{Symbol, Any}(
    Symbol("order_id") => id
)), market = market)

end
function parseOrderStatus(self::Bithumb, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Pending") => "open",
        Symbol("Completed") => "closed",
        Symbol("Cancel") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bithumb, order; market=nothing)
    timestamp = safeIntegerProduct(order, "order_date", 0.001);
    sideProperty = safeString2(order, "type", "side");
    side = functions.ccxtruthy((sideProperty == "bid")) ? "buy" : "sell";
    status = self.parseOrderStatus(safeString(order, "order_status"));
    price = safeString2(order, "order_price", "price");
    type_var = "limit";
    if functions.ccxtruthy(stringEquals(price, "0"))
        type_var = "market";
    end
    amount = self.fixCommaNumber(safeString2(order, "order_qty", "units"));
    remaining = self.fixCommaNumber(safeString(order, "units_remaining"));
    if functions.ccxtruthy(remaining == nothing)
        if functions.ccxtruthy(status == "closed")
            remaining = "0";
        elseif functions.ccxtruthy(status != "canceled")
            remaining = amount;
        end
    end
    symbol = nothing;
    baseId = safeString(order, "order_currency");
    quoteId = safeString(order, "payment_currency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    if functions.ccxtruthy(@functions.ccxt_and((base != nothing), (quote_var != nothing)))
        symbol = string(base, "/", quote_var);
    end
    if functions.ccxtruthy(symbol == nothing)
        market = self.safeMarket(marketId = nothing, market = market);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    id = safeString(order, "order_id");
    rawTrades = self.safeList(order, "contract", defaultValue = []);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => rawTrades
), market = market)

end
"""
fetch all unfilled currently open orders
see: https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bithumb; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("count") => limit,
        Symbol("order_currency") => get(market, Symbol("base"), nothing),
        Symbol("payment_currency") => get(market, Symbol("quote"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    response = Base.fetch(self.privatePostInfoOrders(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
cancels an open order
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bithumb, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    side_in_params = (ccxt_in("side", params));
    if functions.ccxtruthy(!functions.ccxtruthy(side_in_params))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a `side` parameter (sell or buy)")));
    end
    market = self.market(symbol);
    side = functions.ccxtruthy((get(params, Symbol("side"), nothing) == "buy")) ? "bid" : "ask";
    params = omit(params, ["side", "currency"]);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("type") => side,
        Symbol("order_currency") => get(market, Symbol("base"), nothing),
        Symbol("payment_currency") => get(market, Symbol("quote"), nothing)
    );
    response = Base.fetch(self.privatePostTradeCancel(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function cancelUnifiedOrder(self::Bithumb, order; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("side") => get(order, Symbol("side"), nothing)
    );
    return Base.fetch(self.cancelOrder(get(order, Symbol("id"), nothing), symbol = get(order, Symbol("symbol"), nothing), params = extend(request, params)))

end
"""
make a withdrawal
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bithumb, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("units") => amount,
        Symbol("address") => address,
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(code == "XRP", code == "XMR"), code == "EOS"), code == "STEEM"), code == "TON"))
        destination = safeString(params, "destination");
        if functions.ccxtruthy(@functions.ccxt_and((tag == nothing), (destination == nothing)))
            throw(ArgumentsRequired(string(self.id, " ", code, " withdraw() requires a tag argument or an extra destination param")));
        elseif functions.ccxtruthy(tag != nothing)
            request[Symbol("destination")] = tag;
        end
    end
    response = Base.fetch(self.privatePostTradeBtcWithdrawal(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTransaction(self::Bithumb, transaction; currency=nothing)
    currency = self.safeCurrency(nothing, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("txid") => nothing,
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
    Symbol("fee") => nothing,
    Symbol("info") => transaction
)

end
function fixCommaNumber(self::Bithumb, numberStr)
    if functions.ccxtruthy(numberStr == nothing)
            return nothing
    end
    finalNumberStr = numberStr;
    while functions.ccxtruthy(findfirst(",", finalNumberStr) !== nothing)
        finalNumberStr = replace(finalNumberStr, "," => "");
    end
    return finalNumberStr

end
function nonce(self::Bithumb, )
    return milliseconds()

end
function sign(self::Bithumb, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = string("/", self.implodeParams(path, params));
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), endpoint);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("endpoint") => endpoint
), query));
        bodyParts = split(body, "%20");
        body = join(bodyParts, "+");
        nonce = string(self.nonce());
        auth = string(endpoint, "\0", body, "\0", nonce);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha512);
        signature64 = self.stringToBase64(signature);
        headers = Dict{Symbol, Any}(
            Symbol("Accept") => "application/json",
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("Api-Key") => self.apiKey,
            Symbol("Api-Sign") => signature64,
            Symbol("Api-Nonce") => nonce
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bithumb, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("status", response))
        status = safeString(response, "status");
        message = safeString(response, "message");
        if functions.ccxtruthy(status != nothing)
            if functions.ccxtruthy(status == "0000")
                    return nothing
            elseif functions.ccxtruthy(message == "거래 진행중인 내역이 존재하지 않습니다.")
                return nothing
            end
            feedback = string(self.id, " ", message);
            self.throwExactlyMatchedException(self.exceptions, status, feedback);
            self.throwExactlyMatchedException(self.exceptions, message, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bithumb, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetTickerALLQuoteId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "ticker/ALL_{quoteId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerBaseIdQuoteId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "ticker/{baseId}_{quoteId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookALLQuoteId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "orderbook/ALL_{quoteId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookBaseIdQuoteId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "orderbook/{baseId}_{quoteId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTransactionHistoryBaseIdQuoteId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "transaction_history/{baseId}_{quoteId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetNetworkInfo(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "network-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetsstatusMultichainALL(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "assetsstatus/multichain/ALL"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetsstatusMultichainCurrency(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "assetsstatus/multichain/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetWithdrawMinimumALL(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "withdraw/minimum/ALL"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetWithdrawMinimumCurrency(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "withdraw/minimum/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetsstatusALL(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "assetsstatus/ALL"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssetsstatusBaseId(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "assetsstatus/{baseId}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCandlestickBaseIdQuoteIdInterval(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "candlestick/{baseId}_{quoteId}/{interval}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoAccount(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoBalance(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/balance"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoWalletAddress(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/wallet_address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoTicker(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/ticker"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoOrders(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoUserTransactions(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/user_transactions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInfoOrderDetail(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "info/order_detail"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradePlace(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/place"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeCancel(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeBtcWithdrawal(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/btc_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeKrwDeposit(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/krw_deposit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeKrwWithdrawal(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/krw_withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeMarketBuy(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/market_buy"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeMarketSell(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/market_sell"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeStopLimit(self::Bithumb, params=Dict(), context=Dict())
    return request(self, "trade/stop_limit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bithumb(; kwargs...)
    inst = Bithumb(Exchange(), describe, safeMarket, amountToPrecision, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseOHLCV, fetchOHLCV, parseTrade, fetchTrades, createOrder, fetchOrder, parseOrderStatus, parseOrder, fetchOpenOrders, cancelOrder, cancelUnifiedOrder, withdraw, parseTransaction, fixCommaNumber, nonce, sign, handleErrors, publicGetTickerALLQuoteId, publicGetTickerBaseIdQuoteId, publicGetOrderbookALLQuoteId, publicGetOrderbookBaseIdQuoteId, publicGetTransactionHistoryBaseIdQuoteId, publicGetNetworkInfo, publicGetAssetsstatusMultichainALL, publicGetAssetsstatusMultichainCurrency, publicGetWithdrawMinimumALL, publicGetWithdrawMinimumCurrency, publicGetAssetsstatusALL, publicGetAssetsstatusBaseId, publicGetCandlestickBaseIdQuoteIdInterval, privatePostInfoAccount, privatePostInfoBalance, privatePostInfoWalletAddress, privatePostInfoTicker, privatePostInfoOrders, privatePostInfoUserTransactions, privatePostInfoOrderDetail, privatePostTradePlace, privatePostTradeCancel, privatePostTradeBtcWithdrawal, privatePostTradeKrwDeposit, privatePostTradeKrwWithdrawal, privatePostTradeMarketBuy, privatePostTradeMarketSell, privatePostTradeStopLimit)
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
function __ccxt_doc_Bithumb_fetchMarkets() end
"""
retrieves data on all markets for bithumb
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bithumb_fetchMarkets

function __ccxt_doc_Bithumb_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bithumb_fetchBalance

function __ccxt_doc_Bithumb_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bithumb_fetchOrderBook

function __ccxt_doc_Bithumb_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bithumb_fetchTickers

function __ccxt_doc_Bithumb_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bithumb_fetchTicker

function __ccxt_doc_Bithumb_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bithumb_fetchOHLCV

function __ccxt_doc_Bithumb_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bithumb_fetchTrades

function __ccxt_doc_Bithumb_createOrder() end
"""
create a trade order
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0

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
__ccxt_doc_Bithumb_createOrder

function __ccxt_doc_Bithumb_fetchOrder() end
"""
fetches information on an order made by the user
see: https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bithumb_fetchOrder

function __ccxt_doc_Bithumb_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bithumb_fetchOpenOrders

function __ccxt_doc_Bithumb_cancelOrder() end
"""
cancels an open order
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bithumb_cancelOrder

function __ccxt_doc_Bithumb_withdraw() end
"""
make a withdrawal
see: https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bithumb_withdraw
