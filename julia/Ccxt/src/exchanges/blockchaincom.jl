@kwdef mutable struct Blockchaincom <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    fetchOrderBook::Function = fetchOrderBook
    fetchL3OrderBook::Function = fetchL3OrderBook
    fetchL2OrderBook::Function = fetchL2OrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseOrderState::Function = parseOrderState
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchTradingFees::Function = fetchTradingFees
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrdersByState::Function = fetchOrdersByState
    parseTrade::Function = parseTrade
    fetchMyTrades::Function = fetchMyTrades
    fetchDepositAddress::Function = fetchDepositAddress
    parseTransactionState::Function = parseTransactionState
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    fetchWithdrawals::Function = fetchWithdrawals
    fetchWithdrawal::Function = fetchWithdrawal
    fetchDeposits::Function = fetchDeposits
    fetchDeposit::Function = fetchDeposit
    fetchBalance::Function = fetchBalance
    fetchOrder::Function = fetchOrder
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetTickers::Function = publicGetTickers
    publicGetTickersSymbol::Function = publicGetTickersSymbol
    publicGetSymbols::Function = publicGetSymbols
    publicGetSymbolsSymbol::Function = publicGetSymbolsSymbol
    publicGetL2Symbol::Function = publicGetL2Symbol
    publicGetL3Symbol::Function = publicGetL3Symbol
    privateGetFees::Function = privateGetFees
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersOrderId::Function = privateGetOrdersOrderId
    privateGetTrades::Function = privateGetTrades
    privateGetFills::Function = privateGetFills
    privateGetDeposits::Function = privateGetDeposits
    privateGetDepositsDepositId::Function = privateGetDepositsDepositId
    privateGetAccounts::Function = privateGetAccounts
    privateGetAccountsAccountCurrency::Function = privateGetAccountsAccountCurrency
    privateGetWhitelist::Function = privateGetWhitelist
    privateGetWhitelistCurrency::Function = privateGetWhitelistCurrency
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetWithdrawalsWithdrawalId::Function = privateGetWithdrawalsWithdrawalId
    privatePostOrders::Function = privatePostOrders
    privatePostDepositsCurrency::Function = privatePostDepositsCurrency
    privatePostWithdrawals::Function = privatePostWithdrawals
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersOrderId::Function = privateDeleteOrdersOrderId

end
function describe(self::Blockchaincom, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "blockchaincom",
    Symbol("secret") => nothing,
    Symbol("name") => "Blockchain.com",
    Symbol("countries") => ["LX"],
    Symbol("rateLimit") => 500,
    Symbol("version") => "v3",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchL2OrderBook") => true,
        Symbol("fetchL3OrderBook") => true,
        Symbol("fetchLedger") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => false,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => true,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => nothing,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/975e3054-3399-4363-bcee-ec3c6d63d4e8",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://testnet-api.delta.exchange",
            Symbol("private") => "https://testnet-api.delta.exchange"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.blockchain.com/v3/exchange",
            Symbol("private") => "https://api.blockchain.com/v3/exchange"
        ),
        Symbol("www") => "https://blockchain.com",
        Symbol("doc") => ["https://api.blockchain.com/v3"],
        Symbol("fees") => "https://exchange.blockchain.com/fees"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("symbols/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("l2/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("l3/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("fees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/{depositId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("accounts/{account}/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("whitelist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("whitelist/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals/{withdrawalId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("deposits/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
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
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0045")], [self.parseNumber("10000"), self.parseNumber("0.0035")], [self.parseNumber("50000"), self.parseNumber("0.0018")], [self.parseNumber("100000"), self.parseNumber("0.0018")], [self.parseNumber("500000"), self.parseNumber("0.0018")], [self.parseNumber("1000000"), self.parseNumber("0.0018")], [self.parseNumber("2500000"), self.parseNumber("0.0018")], [self.parseNumber("5000000"), self.parseNumber("0.0016")], [self.parseNumber("25000000"), self.parseNumber("0.0014")], [self.parseNumber("100000000"), self.parseNumber("0.0011")], [self.parseNumber("500000000"), self.parseNumber("0.0008")], [self.parseNumber("1000000000"), self.parseNumber("0.0006")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("10000"), self.parseNumber("0.0017")], [self.parseNumber("50000"), self.parseNumber("0.0015")], [self.parseNumber("100000"), self.parseNumber("0.0008")], [self.parseNumber("500000"), self.parseNumber("0.0007")], [self.parseNumber("1000000"), self.parseNumber("0.0006")], [self.parseNumber("2500000"), self.parseNumber("0.0005")], [self.parseNumber("5000000"), self.parseNumber("0.0004")], [self.parseNumber("25000000"), self.parseNumber("0.0003")], [self.parseNumber("100000000"), self.parseNumber("0.0002")], [self.parseNumber("500000000"), self.parseNumber("0.0001")], [self.parseNumber("1000000000"), self.parseNumber("0")]]
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => true
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRX",
            Symbol("ALGO") => "ALGO",
            Symbol("ADA") => "ADA",
            Symbol("AR") => "AR",
            Symbol("ATOM") => "ATOM",
            Symbol("AVAXC") => "AVAX",
            Symbol("BCH") => "BCH",
            Symbol("BSV") => "BSV",
            Symbol("BTC") => "BTC",
            Symbol("DCR") => "DCR",
            Symbol("DESO") => "DESO",
            Symbol("DASH") => "DASH",
            Symbol("CELO") => "CELO",
            Symbol("CHZ") => "CHZ",
            Symbol("MATIC") => "MATIC",
            Symbol("SOL") => "SOL",
            Symbol("DOGE") => "DOGE",
            Symbol("DOT") => "DOT",
            Symbol("EOS") => "EOS",
            Symbol("ETC") => "ETC",
            Symbol("FIL") => "FIL",
            Symbol("KAVA") => "KAVA",
            Symbol("LTC") => "LTC",
            Symbol("IOTA") => "MIOTA",
            Symbol("NEAR") => "NEAR",
            Symbol("STX") => "STX",
            Symbol("XLM") => "XLM",
            Symbol("XMR") => "XMR",
            Symbol("XRP") => "XRP",
            Symbol("XTZ") => "XTZ",
            Symbol("ZEC") => "ZEC",
            Symbol("ZIL") => "ZIL"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => false,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("symbolRequired") => false,
                Symbol("trailing") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
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
            Symbol("401") => AuthenticationError,
            Symbol("404") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
"""
retrieves data on all markets for blockchaincom
see: https://api.blockchain.com/v3/#getsymbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Blockchaincom; params=Dict())
    markets = Base.fetch(self.publicGetSymbols(params));
    marketIds = objectKeys(markets);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = safeValue(markets, marketId);
        baseId = safeString(market, "base_currency");
        quoteId = safeString(market, "counter_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        numericId = self.safeNumber(market, "id");
        active = nothing;
        marketState = safeString(market, "status");
        if functions.ccxtruthy(marketState == "open")
            active = true;
        else
            active = false;
        end
        minPriceIncrementString = safeString(market, "min_price_increment");
        minPriceIncrementScaleString = safeString(market, "min_price_increment_scale");
        minPriceScalePrecisionString = self.parsePrecision(precision = minPriceIncrementScaleString);
        pricePrecisionString = stringMul(minPriceIncrementString, minPriceScalePrecisionString);
        lotSizeString = safeString(market, "lot_size");
        lotSizeScaleString = safeString(market, "lot_size_scale");
        lotSizeScalePrecisionString = self.parsePrecision(precision = lotSizeScaleString);
        amountPrecisionString = stringMul(lotSizeString, lotSizeScalePrecisionString);
        minOrderSizeString = safeString(market, "min_order_size");
        minOrderSizeScaleString = safeString(market, "min_order_size_scale");
        minOrderSizeScalePrecisionString = self.parsePrecision(precision = minOrderSizeScaleString);
        minOrderSizePreciseString = stringMul(minOrderSizeString, minOrderSizeScalePrecisionString);
        minOrderSize = self.parseNumber(minOrderSizePreciseString);
        maxOrderSize = nothing;
        maxOrderSizeRaw = safeString(market, "max_order_size");
        if functions.ccxtruthy(maxOrderSizeRaw != "0")
            maxOrderSizeScaleString = safeString(market, "max_order_size_scale");
            maxOrderSizeScalePrecisionString = self.parsePrecision(precision = maxOrderSizeScaleString);
            maxOrderSizeValueString = stringMul(maxOrderSizeRaw, maxOrderSizeScalePrecisionString);
            maxOrderSize = self.parseNumber(maxOrderSizeValueString);
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => market,
    Symbol("id") => marketId,
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
        Symbol("amount") => self.parseNumber(amountPrecisionString),
        Symbol("price") => self.parseNumber(pricePrecisionString)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minOrderSize,
            Symbol("max") => maxOrderSize
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
    Symbol("created") => nothing
));
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.blockchain.com/v3/#getl3orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Blockchaincom, symbol; limit=nothing, params=Dict())
    return Base.fetch(self.fetchL3OrderBook(symbol, limit = limit, params = params))

end
"""
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.blockchain.com/v3/#getl3orderbook

# Arguments
- `symbol`::string: unified market symbol
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchL3OrderBook(self::Blockchaincom, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetL3Symbol(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "px", amountKey = "qty")

end
function fetchL2OrderBook(self::Blockchaincom, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetL2Symbol(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = "px", amountKey = "qty")

end
function parseTicker(self::Blockchaincom, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    last_var = safeString(ticker, "last_trade_price");
    baseVolume = safeString(ticker, "volume_24h");
    open = safeString(ticker, "price_24h");
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
    Symbol("open") => open,
    Symbol("close") => nothing,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.blockchain.com/v3/#gettickerbysymbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Blockchaincom, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    return self.parseTicker(response, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api.blockchain.com/v3/#gettickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Blockchaincom; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    tickers = Base.fetch(self.publicGetTickers(params));
    return self.parseTickers(tickers, symbols = symbols)

end
function parseOrderState(self::Blockchaincom, state)
    states = Dict{Symbol, Any}(
        Symbol("OPEN") => "open",
        Symbol("REJECTED") => "rejected",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PART_FILLED") => "open",
        Symbol("EXPIRED") => "expired"
    );
    return safeString(states, state, state)

end
function parseOrder(self::Blockchaincom, order; market=nothing)
    clientOrderId = safeString(order, "clOrdId");
    type_var = safeStringLower(order, "ordType");
    statusId = safeString(order, "ordStatus");
    state = self.parseOrderState(statusId);
    side = safeStringLower(order, "side");
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    exchangeOrderId = safeString(order, "exOrdId");
    price = functions.ccxtruthy((type_var != "market")) ? safeString(order, "price") : nothing;
    average = self.safeNumber(order, "avgPx");
    timestamp = safeInteger(order, "timestamp");
    datetime = self.iso8601(timestamp);
    filled = safeString(order, "cumQty");
    remaining = safeString(order, "leavesQty");
    result = self.safeOrder(Dict{Symbol, Any}(
        Symbol("id") => exchangeOrderId,
        Symbol("clientOrderId") => clientOrderId,
        Symbol("datetime") => datetime,
        Symbol("timestamp") => timestamp,
        Symbol("lastTradeTimestamp") => nothing,
        Symbol("status") => state,
        Symbol("symbol") => symbol,
        Symbol("type") => type_var,
        Symbol("timeInForce") => nothing,
        Symbol("side") => side,
        Symbol("price") => price,
        Symbol("average") => average,
        Symbol("amount") => nothing,
        Symbol("filled") => filled,
        Symbol("remaining") => remaining,
        Symbol("cost") => nothing,
        Symbol("trades") => [],
        Symbol("fees") => [],
        Symbol("info") => order
    ));
    return result

end
"""
create a trade order
see: https://api.blockchain.com/v3/#createorder

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
function createOrder(self::Blockchaincom, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderType = safeString(params, "ordType", type_var);
    uppercaseOrderType = uppercase(orderType);
    clientOrderId = safeString2(params, "clientOrderId", "clOrdId", uuid16());
    params = omit(params, ["ordType", "clientOrderId", "clOrdId"]);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("ordType") => uppercaseOrderType,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("orderQty") => self.amountToPrecision(symbol, amount),
        Symbol("clOrdId") => clientOrderId
    );
    triggerPrice = safeValueN(params, ["triggerPrice", "stopPx", "stopPrice"]);
    params = omit(params, ["triggerPrice", "stopPx", "stopPrice"]);
    if functions.ccxtruthy(@functions.ccxt_or(uppercaseOrderType == "STOP", uppercaseOrderType == "STOPLIMIT"))
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a stopPx or triggerPrice param for a ", uppercaseOrderType, " order")));
        end
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(uppercaseOrderType == "MARKET")
            request[Symbol("ordType")] = "STOP";
        elseif functions.ccxtruthy(uppercaseOrderType == "LIMIT")
            request[Symbol("ordType")] = "STOPLIMIT";
        end
    end
    priceRequired = false;
    stopPriceRequired = false;
    if functions.ccxtruthy(@functions.ccxt_or(get(request, Symbol("ordType"), nothing) == "LIMIT", get(request, Symbol("ordType"), nothing) == "STOPLIMIT"))
        priceRequired = true;
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(request, Symbol("ordType"), nothing) == "STOP", get(request, Symbol("ordType"), nothing) == "STOPLIMIT"))
        stopPriceRequired = true;
    end
    if functions.ccxtruthy(priceRequired)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(stopPriceRequired)
        request[Symbol("stopPx")] = self.priceToPrecision(symbol, triggerPrice);
    end
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://api.blockchain.com/v3/#deleteorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Blockchaincom, id; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateDeleteOrdersOrderId(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => response
))

end
"""
cancel all open orders
see: https://api.blockchain.com/v3/#deleteallorders

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in, all markets are used if undefined, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Blockchaincom; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        marketId = self.marketId(symbol);
        request[Symbol("symbol")] = marketId;
    end
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
fetch the trading fees for multiple markets
see: https://api.blockchain.com/v3/#getfees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Blockchaincom; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    makerFee = self.safeNumber(response, "makerRate");
    takerFee = self.safeNumber(response, "takerRate");
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => makerFee,
            Symbol("taker") => takerFee
        );
        i += 1
    end
    return result

end
"""
fetches information on multiple canceled orders made by the user
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Blockchaincom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "CANCELED";
    return Base.fetch(self.fetchOrdersByState(state, symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Blockchaincom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "FILLED";
    return Base.fetch(self.fetchOrdersByState(state, symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all unfilled currently open orders
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Blockchaincom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "OPEN";
    return Base.fetch(self.fetchOrdersByState(state, symbol = symbol, since = since, limit = limit, params = params))

end
function fetchOrdersByState(self::Blockchaincom, state; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("status") => state,
        Symbol("limit") => 100
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
function parseTrade(self::Blockchaincom, trade; market=nothing)
    orderId = safeString(trade, "exOrdId");
    tradeId = safeString(trade, "tradeId");
    side = safeStringLower(trade, "side");
    marketId = safeString(trade, "symbol");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "qty");
    timestamp = safeInteger(trade, "timestamp");
    datetime = self.iso8601(timestamp);
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    symbol = get(market, Symbol("symbol"), nothing);
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrency = get(market, Symbol("quote"), nothing);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrency
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => tradeId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market = market)

end
"""
fetch all trades made by the user
see: https://api.blockchain.com/v3/#getfills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Blockchaincom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = self.marketId(symbol);
        market = self.market(symbol);
    end
    trades = Base.fetch(self.privateGetFills(extend(request, params)));
    return self.parseTrades(trades, market = market, since = since, limit = limit, params = params)

end
"""
fetch the deposit address for a currency associated with this account
see: https://api.blockchain.com/v3/#getdepositaddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Blockchaincom, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostDepositsCurrency(extend(request, params)));
    rawAddress = safeString(response, "address");
    tag = nothing;
    address = nothing;
    if functions.ccxtruthy(rawAddress != nothing)
        addressParts = split(rawAddress, ";");
        tag = safeString(addressParts, 0);
        address = safeString(addressParts, 1);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function parseTransactionState(self::Blockchaincom, state)
    states = Dict{Symbol, Any}(
        Symbol("COMPLETED") => "ok",
        Symbol("REJECTED") => "failed",
        Symbol("PENDING") => "pending",
        Symbol("FAILED") => "failed",
        Symbol("REFUNDED") => "refunded"
    );
    return safeString(states, state, state)

end
function parseTransaction(self::Blockchaincom, transaction; currency=nothing)
    type_var = nothing;
    id = nothing;
    amount = self.safeNumber(transaction, "amount");
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    state = safeString(transaction, "state");
    if functions.ccxtruthy(ccxt_in("depositId", transaction))
        type_var = "deposit";
        id = safeString(transaction, "depositId");
    elseif functions.ccxtruthy(ccxt_in("withdrawalId", transaction))
        type_var = "withdrawal";
        id = safeString(transaction, "withdrawalId");
    end
    feeCost = functions.ccxtruthy((type_var == "withdrawal")) ? self.safeNumber(transaction, "fee") : nothing;
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    address = safeString(transaction, "address");
    txid = safeString(transaction, "txhash");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionState(state),
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
"""
make a withdrawal
see: https://api.blockchain.com/v3/#createwithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Blockchaincom, code, amount, address; tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("beneficiary") => address,
        Symbol("sendMax") => false
    );
    response = Base.fetch(self.privatePostWithdrawals(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
"""
fetch all withdrawals made from an account
see: https://api.blockchain.com/v3/#getwithdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Blockchaincom; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetWithdrawals(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://api.blockchain.com/v3/#getwithdrawalbyid

# Arguments
- `id`::string: withdrawal id
- `code`::string: not used by blockchaincom.fetchWithdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawal(self::Blockchaincom, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("withdrawalId") => id
    );
    response = Base.fetch(self.privateGetWithdrawalsWithdrawalId(extend(request, params)));
    return self.parseTransaction(response)

end
"""
fetch all deposits made to an account
see: https://api.blockchain.com/v3/#getdeposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Blockchaincom; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetDeposits(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch information on a deposit
see: https://api.blockchain.com/v3/#getdepositbyid

# Arguments
- `id`::string: deposit id
- `code`::string: not used by fetchDeposit ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Blockchaincom, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    depositId = safeString(params, "depositId", id);
    request = Dict{Symbol, Any}(
        Symbol("depositId") => depositId
    );
    deposit = Base.fetch(self.privateGetDepositsDepositId(extend(request, params)));
    return self.parseTransaction(deposit)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.blockchain.com/v3/#getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Blockchaincom; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountName = safeString(params, "account", "primary");
    params = omit(params, "account");
    request = Dict{Symbol, Any}(
        Symbol("account") => accountName
    );
    response = Base.fetch(self.privateGetAccounts(extend(request, params)));
    balances = safeValue(response, accountName);
    if functions.ccxtruthy(balances == nothing)
        throw(ExchangeError(string(self.id, " fetchBalance() could not find the \"", accountName, "\" account")));
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("total")] = safeString(entry, "balance");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetches information on an order made by the user
see: https://api.blockchain.com/v3/#getorderbyid

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by blockchaincom fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Blockchaincom, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateGetOrdersOrderId(extend(request, params)));
    return self.parseOrder(response)

end
function sign(self::Blockchaincom, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    requestPath = string("/", self.implodeParams(path, params));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), requestPath);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        headers = Dict{Symbol, Any}(
            Symbol("X-API-Token") => self.secret
        );
        if functions.ccxtruthy((method == "GET"))
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        else
            body = json(query);
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Blockchaincom, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    text = safeString(response, "text");
    if functions.ccxtruthy(text != nothing)
        if functions.ccxtruthy(text == "Insufficient Balance")
            throw(InsufficientFunds(string(self.id, " ", body)));
        end
    end
    errorCode = safeString(response, "status");
    errorMessage = safeString(response, "error");
    if functions.ccxtruthy(code != nothing)
        feedback = string(self.id, " ", json(response));
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessage, feedback);
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Blockchaincom, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetTickers(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickersSymbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "tickers/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSymbols(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSymbolsSymbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "symbols/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetL2Symbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "l2/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetL3Symbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "l3/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFees(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOrderId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTrades(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFills(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeposits(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositsDepositId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits/{depositId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsAccountCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "accounts/{account}/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWhitelist(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "whitelist"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWhitelistCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "whitelist/{currency}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawals(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawalsWithdrawalId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals/{withdrawalId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositsCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits/{currency}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawals(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersOrderId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Blockchaincom(; kwargs...)
    inst = Blockchaincom(Exchange(), describe, fetchMarkets, fetchOrderBook, fetchL3OrderBook, fetchL2OrderBook, parseTicker, fetchTicker, fetchTickers, parseOrderState, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchTradingFees, fetchCanceledOrders, fetchClosedOrders, fetchOpenOrders, fetchOrdersByState, parseTrade, fetchMyTrades, fetchDepositAddress, parseTransactionState, parseTransaction, withdraw, fetchWithdrawals, fetchWithdrawal, fetchDeposits, fetchDeposit, fetchBalance, fetchOrder, sign, handleErrors, publicGetTickers, publicGetTickersSymbol, publicGetSymbols, publicGetSymbolsSymbol, publicGetL2Symbol, publicGetL3Symbol, privateGetFees, privateGetOrders, privateGetOrdersOrderId, privateGetTrades, privateGetFills, privateGetDeposits, privateGetDepositsDepositId, privateGetAccounts, privateGetAccountsAccountCurrency, privateGetWhitelist, privateGetWhitelistCurrency, privateGetWithdrawals, privateGetWithdrawalsWithdrawalId, privatePostOrders, privatePostDepositsCurrency, privatePostWithdrawals, privateDeleteOrders, privateDeleteOrdersOrderId)
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
function __ccxt_doc_Blockchaincom_fetchMarkets() end
"""
retrieves data on all markets for blockchaincom
see: https://api.blockchain.com/v3/#getsymbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Blockchaincom_fetchMarkets

function __ccxt_doc_Blockchaincom_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.blockchain.com/v3/#getl3orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Blockchaincom_fetchOrderBook

function __ccxt_doc_Blockchaincom_fetchL3OrderBook() end
"""
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.blockchain.com/v3/#getl3orderbook

# Arguments
- `symbol`::string: unified market symbol
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Blockchaincom_fetchL3OrderBook

function __ccxt_doc_Blockchaincom_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.blockchain.com/v3/#gettickerbysymbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Blockchaincom_fetchTicker

function __ccxt_doc_Blockchaincom_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://api.blockchain.com/v3/#gettickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Blockchaincom_fetchTickers

function __ccxt_doc_Blockchaincom_createOrder() end
"""
create a trade order
see: https://api.blockchain.com/v3/#createorder

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
__ccxt_doc_Blockchaincom_createOrder

function __ccxt_doc_Blockchaincom_cancelOrder() end
"""
cancels an open order
see: https://api.blockchain.com/v3/#deleteorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_cancelOrder

function __ccxt_doc_Blockchaincom_cancelAllOrders() end
"""
cancel all open orders
see: https://api.blockchain.com/v3/#deleteallorders

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in, all markets are used if undefined, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_cancelAllOrders

function __ccxt_doc_Blockchaincom_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://api.blockchain.com/v3/#getfees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Blockchaincom_fetchTradingFees

function __ccxt_doc_Blockchaincom_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_fetchCanceledOrders

function __ccxt_doc_Blockchaincom_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_fetchClosedOrders

function __ccxt_doc_Blockchaincom_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api.blockchain.com/v3/#getorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_fetchOpenOrders

function __ccxt_doc_Blockchaincom_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api.blockchain.com/v3/#getfills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Blockchaincom_fetchMyTrades

function __ccxt_doc_Blockchaincom_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://api.blockchain.com/v3/#getdepositaddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Blockchaincom_fetchDepositAddress

function __ccxt_doc_Blockchaincom_withdraw() end
"""
make a withdrawal
see: https://api.blockchain.com/v3/#createwithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blockchaincom_withdraw

function __ccxt_doc_Blockchaincom_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://api.blockchain.com/v3/#getwithdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blockchaincom_fetchWithdrawals

function __ccxt_doc_Blockchaincom_fetchWithdrawal() end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://api.blockchain.com/v3/#getwithdrawalbyid

# Arguments
- `id`::string: withdrawal id
- `code`::string: not used by blockchaincom.fetchWithdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blockchaincom_fetchWithdrawal

function __ccxt_doc_Blockchaincom_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://api.blockchain.com/v3/#getdeposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blockchaincom_fetchDeposits

function __ccxt_doc_Blockchaincom_fetchDeposit() end
"""
fetch information on a deposit
see: https://api.blockchain.com/v3/#getdepositbyid

# Arguments
- `id`::string: deposit id
- `code`::string: not used by fetchDeposit ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blockchaincom_fetchDeposit

function __ccxt_doc_Blockchaincom_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.blockchain.com/v3/#getaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Blockchaincom_fetchBalance

function __ccxt_doc_Blockchaincom_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api.blockchain.com/v3/#getorderbyid

# Arguments
- `id`::string: the order id
- `symbol`::string: not used by blockchaincom fetchOrder
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blockchaincom_fetchOrder
