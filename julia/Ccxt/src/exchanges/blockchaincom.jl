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
                Symbol("tickers") => 1,
                Symbol("tickers/{symbol}") => 1,
                Symbol("symbols") => 1,
                Symbol("symbols/{symbol}") => 1,
                Symbol("l2/{symbol}") => 1,
                Symbol("l3/{symbol}") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("fees") => 1,
                Symbol("orders") => 1,
                Symbol("orders/{orderId}") => 1,
                Symbol("trades") => 1,
                Symbol("fills") => 1,
                Symbol("deposits") => 1,
                Symbol("deposits/{depositId}") => 1,
                Symbol("accounts") => 1,
                Symbol("accounts/{account}/{currency}") => 1,
                Symbol("whitelist") => 1,
                Symbol("whitelist/{currency}") => 1,
                Symbol("withdrawals") => 1,
                Symbol("withdrawals/{withdrawalId}") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => 1,
                Symbol("deposits/{currency}") => 1,
                Symbol("withdrawals") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders") => 1,
                Symbol("orders/{orderId}") => 1
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
function fetchMarkets(self::Blockchaincom, params=Dict())
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
        minPriceScalePrecisionString = self.parsePrecision(minPriceIncrementScaleString);
        pricePrecisionString = stringMul(minPriceIncrementString, minPriceScalePrecisionString);
        lotSizeString = safeString(market, "lot_size");
        lotSizeScaleString = safeString(market, "lot_size_scale");
        lotSizeScalePrecisionString = self.parsePrecision(lotSizeScaleString);
        amountPrecisionString = stringMul(lotSizeString, lotSizeScalePrecisionString);
        minOrderSizeString = safeString(market, "min_order_size");
        minOrderSizeScaleString = safeString(market, "min_order_size_scale");
        minOrderSizeScalePrecisionString = self.parsePrecision(minOrderSizeScaleString);
        minOrderSizePreciseString = stringMul(minOrderSizeString, minOrderSizeScalePrecisionString);
        minOrderSize = self.parseNumber(minOrderSizePreciseString);
        maxOrderSize = nothing;
        maxOrderSizeRaw = safeString(market, "max_order_size");
        if functions.ccxtruthy(maxOrderSizeRaw != "0")
            maxOrderSizeScaleString = safeString(market, "max_order_size_scale");
            maxOrderSizeScalePrecisionString = self.parsePrecision(maxOrderSizeScaleString);
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
function fetchOrderBook(self::Blockchaincom, symbol, limit=nothing, params=Dict())
    return Base.fetch(self.fetchL3OrderBook(symbol, limit, params))

end
function fetchL3OrderBook(self::Blockchaincom, symbol, limit=nothing, params=Dict())
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
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "px", "qty")

end
function fetchL2OrderBook(self::Blockchaincom, symbol, limit=nothing, params=Dict())
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
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "px", "qty")

end
function parseTicker(self::Blockchaincom, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market, "-");
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
), market)

end
function fetchTicker(self::Blockchaincom, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTickersSymbol(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Blockchaincom, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    tickers = Base.fetch(self.publicGetTickers(params));
    return self.parseTickers(tickers, symbols)

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
function parseOrder(self::Blockchaincom, order, market=nothing)
    clientOrderId = safeString(order, "clOrdId");
    type_var = safeStringLower(order, "ordType");
    statusId = safeString(order, "ordStatus");
    state = self.parseOrderState(statusId);
    side = safeStringLower(order, "side");
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market, "-");
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
function createOrder(self::Blockchaincom, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderType = safeString(params, "ordType", type_var);
    uppercaseOrderType = uppercase(orderType);
    clientOrderId = safeString2(params, "clientOrderId", "clOrdId", uuid16());
    params = omit(params, ["ordType", "clientOrderId", "clOrdId"]);
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
    return self.parseOrder(response, market)

end
function cancelOrder(self::Blockchaincom, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateDeleteOrdersOrderId(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => response
))

end
function cancelAllOrders(self::Blockchaincom, symbol=nothing, params=Dict())
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
function fetchTradingFees(self::Blockchaincom, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetFees(params));
    makerFee = self.safeNumber(response, "makerRate");
    takerFee = self.safeNumber(response, "takerRate");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
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
function fetchCanceledOrders(self::Blockchaincom, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "CANCELED";
    return Base.fetch(self.fetchOrdersByState(state, symbol, since, limit, params))

end
function fetchClosedOrders(self::Blockchaincom, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "FILLED";
    return Base.fetch(self.fetchOrdersByState(state, symbol, since, limit, params))

end
function fetchOpenOrders(self::Blockchaincom, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    state = "OPEN";
    return Base.fetch(self.fetchOrdersByState(state, symbol, since, limit, params))

end
function fetchOrdersByState(self::Blockchaincom, state, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseOrders(response, market, since, limit)

end
function parseTrade(self::Blockchaincom, trade, market=nothing)
    orderId = safeString(trade, "exOrdId");
    tradeId = safeString(trade, "tradeId");
    side = safeStringLower(trade, "side");
    marketId = safeString(trade, "symbol");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "qty");
    timestamp = safeInteger(trade, "timestamp");
    datetime = self.iso8601(timestamp);
    market = self.safeMarket(marketId, market, "-");
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
), market)

end
function fetchMyTrades(self::Blockchaincom, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchDepositAddress(self::Blockchaincom, code, params=Dict())
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
function parseTransaction(self::Blockchaincom, transaction, currency=nothing)
    type_var = nothing;
    id = nothing;
    amount = self.safeNumber(transaction, "amount");
    timestamp = safeInteger(transaction, "timestamp");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
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
function withdraw(self::Blockchaincom, code, amount, address, tag=nothing, params=Dict())
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
    return self.parseTransaction(response, currency)

end
function fetchWithdrawals(self::Blockchaincom, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawal(self::Blockchaincom, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("withdrawalId") => id
    );
    response = Base.fetch(self.privateGetWithdrawalsWithdrawalId(extend(request, params)));
    return self.parseTransaction(response)

end
function fetchDeposits(self::Blockchaincom, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(response, currency, since, limit)

end
function fetchDeposit(self::Blockchaincom, id, code=nothing, params=Dict())
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
function fetchBalance(self::Blockchaincom, params=Dict())
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
function fetchOrder(self::Blockchaincom, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateGetOrdersOrderId(extend(request, params)));
    return self.parseOrder(response)

end
function sign(self::Blockchaincom, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Blockchaincom, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetTickers(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickersSymbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "tickers/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSymbols(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSymbolsSymbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "symbols/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetL2Symbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "l2/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetL3Symbol(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "l3/{symbol}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFees(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "fees", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrdersOrderId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetTrades(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFills(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "fills", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetDeposits(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetDepositsDepositId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits/{depositId}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAccounts(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "accounts", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAccountsAccountCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "accounts/{account}/{currency}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetWhitelist(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "whitelist", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetWhitelistCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "whitelist/{currency}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetWithdrawals(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetWithdrawalsWithdrawalId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals/{withdrawalId}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDepositsCurrency(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "deposits/{currency}", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostWithdrawals(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "withdrawals", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrders(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrdersOrderId(self::Blockchaincom, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Blockchaincom(; kwargs...)
    inst = Blockchaincom(Exchange(), describe, fetchMarkets, fetchOrderBook, fetchL3OrderBook, fetchL2OrderBook, parseTicker, fetchTicker, fetchTickers, parseOrderState, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchTradingFees, fetchCanceledOrders, fetchClosedOrders, fetchOpenOrders, fetchOrdersByState, parseTrade, fetchMyTrades, fetchDepositAddress, parseTransactionState, parseTransaction, withdraw, fetchWithdrawals, fetchWithdrawal, fetchDeposits, fetchDeposit, fetchBalance, fetchOrder, sign, handleErrors, publicGetTickers, publicGetTickersSymbol, publicGetSymbols, publicGetSymbolsSymbol, publicGetL2Symbol, publicGetL3Symbol, privateGetFees, privateGetOrders, privateGetOrdersOrderId, privateGetTrades, privateGetFills, privateGetDeposits, privateGetDepositsDepositId, privateGetAccounts, privateGetAccountsAccountCurrency, privateGetWhitelist, privateGetWhitelistCurrency, privateGetWithdrawals, privateGetWithdrawalsWithdrawalId, privatePostOrders, privatePostDepositsCurrency, privatePostWithdrawals, privateDeleteOrders, privateDeleteOrdersOrderId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
