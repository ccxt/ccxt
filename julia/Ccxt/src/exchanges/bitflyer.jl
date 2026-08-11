@kwdef mutable struct Bitflyer <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseExpiryDate::Function = parseExpiryDate
    safeMarket::Function = safeMarket
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrder::Function = fetchOrder
    fetchMyTrades::Function = fetchMyTrades
    fetchPositions::Function = fetchPositions
    withdraw::Function = withdraw
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseDepositStatus::Function = parseDepositStatus
    parseWithdrawalStatus::Function = parseWithdrawalStatus
    parseTransaction::Function = parseTransaction
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetGetmarketsUsa::Function = publicGetGetmarketsUsa
    publicGetGetmarketsEu::Function = publicGetGetmarketsEu
    publicGetGetmarkets::Function = publicGetGetmarkets
    publicGetGetboard::Function = publicGetGetboard
    publicGetGetticker::Function = publicGetGetticker
    publicGetGetexecutions::Function = publicGetGetexecutions
    publicGetGethealth::Function = publicGetGethealth
    publicGetGetboardstate::Function = publicGetGetboardstate
    publicGetGetchats::Function = publicGetGetchats
    publicGetGetfundingrate::Function = publicGetGetfundingrate
    privateGetGetpermissions::Function = privateGetGetpermissions
    privateGetGetbalance::Function = privateGetGetbalance
    privateGetGetbalancehistory::Function = privateGetGetbalancehistory
    privateGetGetcollateral::Function = privateGetGetcollateral
    privateGetGetcollateralhistory::Function = privateGetGetcollateralhistory
    privateGetGetcollateralaccounts::Function = privateGetGetcollateralaccounts
    privateGetGetaddresses::Function = privateGetGetaddresses
    privateGetGetcoinins::Function = privateGetGetcoinins
    privateGetGetcoinouts::Function = privateGetGetcoinouts
    privateGetGetbankaccounts::Function = privateGetGetbankaccounts
    privateGetGetdeposits::Function = privateGetGetdeposits
    privateGetGetwithdrawals::Function = privateGetGetwithdrawals
    privateGetGetchildorders::Function = privateGetGetchildorders
    privateGetGetparentorders::Function = privateGetGetparentorders
    privateGetGetparentorder::Function = privateGetGetparentorder
    privateGetGetexecutions::Function = privateGetGetexecutions
    privateGetGetpositions::Function = privateGetGetpositions
    privateGetGettradingcommission::Function = privateGetGettradingcommission
    privatePostSendcoin::Function = privatePostSendcoin
    privatePostWithdraw::Function = privatePostWithdraw
    privatePostSendchildorder::Function = privatePostSendchildorder
    privatePostCancelchildorder::Function = privatePostCancelchildorder
    privatePostSendparentorder::Function = privatePostSendparentorder
    privatePostCancelparentorder::Function = privatePostCancelparentorder
    privatePostCancelallchildorders::Function = privatePostCancelallchildorders

end
function describe(self::Bitflyer, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitflyer",
    Symbol("name") => "bitFlyer",
    Symbol("countries") => ["JP"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 1000,
    Symbol("hostname") => "bitflyer.com",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => nothing,
        Symbol("future") => nothing,
        Symbol("option") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => nothing,
        Symbol("cancelOrder") => true,
        Symbol("createOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOpenOrders") => "emulated",
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => "emulated",
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/d0217747-e54d-4533-8416-0d553dca74bb",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.{hostname}"
        ),
        Symbol("www") => "https://bitflyer.com",
        Symbol("doc") => "https://lightning.bitflyer.com/docs?lang=en"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("getmarkets/usa") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getmarkets/eu") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getmarkets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getboard") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getexecutions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gethealth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getboardstate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getchats") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getfundingrate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("getpermissions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getbalance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getbalancehistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getcollateral") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getcollateralhistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getcollateralaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getaddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getcoinins") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getcoinouts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getbankaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getdeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getwithdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getchildorders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getparentorders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getparentorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getexecutions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getpositions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gettradingcommission") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("sendcoin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sendchildorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelchildorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sendparentorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelparentorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelallchildorders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
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
                    Symbol("GTD") => true
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
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-2") => OnMaintenance
        )
    )
))

end
function parseExpiryDate(self::Bitflyer, expiry)
    day = functions.ccxt_slice(expiry, 0, 2);
    monthName = functions.ccxt_slice(expiry, 2, 5);
    year = functions.ccxt_slice(expiry, 5, 9);
    months = Dict{Symbol, Any}(
        Symbol("JAN") => "01",
        Symbol("FEB") => "02",
        Symbol("MAR") => "03",
        Symbol("APR") => "04",
        Symbol("MAY") => "05",
        Symbol("JUN") => "06",
        Symbol("JUL") => "07",
        Symbol("AUG") => "08",
        Symbol("SEP") => "09",
        Symbol("OCT") => "10",
        Symbol("NOV") => "11",
        Symbol("DEC") => "12"
    );
    month = safeString(months, monthName);
    return self.parse8601(string(year, "-", month, "-", day, "T00:00:00Z"))

end
function safeMarket(self::Bitflyer, marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    return safeMarket(self.parent, marketId, market, delimiter, "spot")

end
function fetchMarkets(self::Bitflyer, params=Dict())
    jp_markets = Base.fetch(self.publicGetGetmarkets(params));
    us_markets = Base.fetch(self.publicGetGetmarketsUsa(params));
    eu_markets = Base.fetch(self.publicGetGetmarketsEu(params));
    markets = arrayConcat(toArray(jp_markets), toArray(us_markets));
    markets = arrayConcat(markets, toArray(eu_markets));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "product_code");
        currencies = split(id, "_");
        marketType = safeString(market, "market_type");
        swap = (marketType == "FX");
        future = (marketType == "Futures");
        spot = @functions.ccxt_and(!functions.ccxtruthy(swap), !functions.ccxtruthy(future));
        type_var = "spot";
        settle = nothing;
        baseId = nothing;
        quoteId = nothing;
        expiry = nothing;
        if functions.ccxtruthy(spot)
            baseId = safeString(currencies, 0);
            quoteId = safeString(currencies, 1);
        elseif functions.ccxtruthy(swap)
            type_var = "swap";
            baseId = safeString(currencies, 1);
            quoteId = safeString(currencies, 2);
        else
            if functions.ccxtruthy(future)
                alias = safeString(market, "alias");
                if functions.ccxtruthy(alias == nothing)
                    baseId = functions.ccxt_slice(id, 0, 3);
                    quoteId = functions.ccxt_slice(id, 3, 6);
                    expiryDate = functions.ccxt_slice(id, -9);
                    expiry = self.parseExpiryDate(expiryDate);
                else
                    splitAlias = split(alias, "_");
                    currencyIds = safeString(splitAlias, 0);
                    baseId = functions.ccxt_slice(currencyIds, 0, -3);
                    quoteId = functions.ccxt_slice(currencyIds, -3);
                    splitId = split(id, currencyIds);
                    expiryDate = safeString(splitId, 1);
                    expiry = self.parseExpiryDate(expiryDate);
                end
                type_var = "future";
            end

        end
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        taker = get(get(self.fees, Symbol("trading"), nothing), Symbol("taker"), nothing);
        maker = get(get(self.fees, Symbol("trading"), nothing), Symbol("maker"), nothing);
        contract = @functions.ccxt_or(swap, future);
        if functions.ccxtruthy(contract)
            maker = 0;
            taker = 0;
            settle = "JPY";
            symbol = string(symbol, ":", settle);
            if functions.ccxtruthy(future)
                symbol = string(symbol, "-", self.yymmdd(expiry));
            end
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => contract,
    Symbol("linear") => functions.ccxtruthy(spot) ? nothing : true,
    Symbol("inverse") => functions.ccxtruthy(spot) ? nothing : false,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => nothing,
        Symbol("price") => nothing
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
));
        i += 1
    end
    return result

end
function parseBalance(self::Bitflyer, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency_code");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "amount");
        account[Symbol("free")] = safeString(balance, "available");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Bitflyer, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetGetbalance(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Bitflyer, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    orderbook = Base.fetch(self.publicGetGetboard(extend(request, params)));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), nothing, "bids", "asks", "price", "size")

end
function parseTicker(self::Bitflyer, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = self.parse8601(safeString(ticker, "timestamp"));
    last_var = safeString(ticker, "ltp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "best_bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "best_ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume_by_product"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Bitflyer, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetticker(extend(request, params)));
    return self.parseTicker(response, market)

end
function parseTrade(self::Bitflyer, trade, market=nothing)
    side = safeStringLower(trade, "side");
    if functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(side), 1))
            side = nothing;
        end
    end
    order = nothing;
    if functions.ccxtruthy(side != nothing)
        idInner = string(side, "_child_order_acceptance_id");
        if functions.ccxtruthy(ccxt_in(idInner, trade))
            order = get(trade, Symbol(idInner), nothing);
        end
    end
    if functions.ccxtruthy(order == nothing)
        order = safeString(trade, "child_order_acceptance_id");
    end
    timestamp = self.parse8601(safeString(trade, "exec_date"));
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "size");
    id = safeString(trade, "id");
    market = self.safeMarket(nothing, market);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => order,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchTrades(self::Bitflyer, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetGetexecutions(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchTradingFee(self::Bitflyer, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetGettradingcommission(extend(request, params)));
    fee = self.safeNumber(response, "commission_rate");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => fee,
    Symbol("taker") => fee,
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function createOrder(self::Bitflyer, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("product_code") => self.marketId(symbol),
        Symbol("child_order_type") => uppercase(type_var),
        Symbol("side") => uppercase(side),
        Symbol("price") => price,
        Symbol("size") => amount
    );
    result = Base.fetch(self.privatePostSendchildorder(extend(request, params)));
    id = safeString(result, "child_order_acceptance_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => result
))

end
function cancelOrder(self::Bitflyer, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("product_code") => self.marketId(symbol),
        Symbol("child_order_acceptance_id") => id
    );
    response = Base.fetch(self.privatePostCancelchildorder(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function parseOrderStatus(self::Bitflyer, status)
    statuses = Dict{Symbol, Any}(
        Symbol("ACTIVE") => "open",
        Symbol("COMPLETED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("EXPIRED") => "canceled",
        Symbol("REJECTED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitflyer, order, market=nothing)
    timestamp = self.parse8601(safeString(order, "child_order_date"));
    price = safeString(order, "price");
    amount = safeString(order, "size");
    filled = safeString(order, "executed_size");
    remaining = safeString(order, "outstanding_size");
    status = self.parseOrderStatus(safeString(order, "child_order_state"));
    type_var = safeStringLower(order, "child_order_type");
    side = safeStringLower(order, "side");
    marketId = safeString(order, "product_code");
    symbol = self.safeSymbol(marketId, market);
    fee = nothing;
    feeCost = self.safeNumber(order, "total_commission");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => nothing,
            Symbol("rate") => nothing
        );
    end
    id = safeString(order, "child_order_acceptance_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("info") => order,
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
    Symbol("cost") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("fee") => fee,
    Symbol("average") => nothing,
    Symbol("trades") => nothing
), market)

end
function fetchOrders(self::Bitflyer, symbol=nothing, since=nothing, limit=100, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing),
        Symbol("count") => limit
    );
    response = Base.fetch(self.privateGetGetchildorders(extend(request, params)));
    orders = self.parseOrders(response, market, since, limit);
    if functions.ccxtruthy(symbol != nothing)
        orders = filterBy(orders, "symbol", symbol);
    end
    return orders

end
function fetchOpenOrders(self::Bitflyer, symbol=nothing, since=nothing, limit=100, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("child_order_state") => "ACTIVE"
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchClosedOrders(self::Bitflyer, symbol=nothing, since=nothing, limit=100, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("child_order_state") => "COMPLETED"
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchOrder(self::Bitflyer, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    orders = Base.fetch(self.fetchOrders(symbol));
    ordersById = indexBy(orders, "id");
    if functions.ccxtruthy(ccxt_in(id, ordersById))
            return get(ordersById, Symbol(id), nothing)
    end
    throw(OrderNotFound(string(self.id, " No order found with id ", id)));

end
function fetchMyTrades(self::Bitflyer, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetexecutions(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchPositions(self::Bitflyer, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPositions() requires a `symbols` argument, exactly one symbol in an array")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("product_code") => self.marketIds(symbols)
    );
    response = Base.fetch(self.privateGetGetpositions(extend(request, params)));
    return response

end
function withdraw(self::Bitflyer, code, amount, address, tag=nothing, params=Dict())
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(code != "JPY", code != "USD"), code != "EUR"))
        throw(ExchangeError(string(self.id, " allows withdrawing JPY, USD, EUR only, ", code, " is not supported")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency_code") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = Base.fetch(self.privatePostWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function fetchDeposits(self::Bitflyer, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetcoinins(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawals(self::Bitflyer, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetcoinouts(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function parseDepositStatus(self::Bitflyer, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "pending",
        Symbol("COMPLETED") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseWithdrawalStatus(self::Bitflyer, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "pending",
        Symbol("COMPLETED") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitflyer, transaction, currency=nothing)
    id = safeString2(transaction, "id", "message_id");
    address = safeString(transaction, "address");
    currencyId = safeString(transaction, "currency_code");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = self.parse8601(safeString(transaction, "event_date"));
    amount = self.safeNumber(transaction, "amount");
    txId = safeString(transaction, "tx_hash");
    rawStatus = safeString(transaction, "status");
    type_var = nothing;
    status = nothing;
    fee = nothing;
    if functions.ccxtruthy(ccxt_in("fee", transaction))
        type_var = "withdrawal";
        status = self.parseWithdrawalStatus(rawStatus);
        feeCost = safeString(transaction, "fee");
        additionalFee = safeString(transaction, "additional_fee");
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => self.parseNumber(stringAdd(feeCost, additionalFee))
        );
    else
        type_var = "deposit";
        status = self.parseDepositStatus(rawStatus);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function fetchFundingRate(self::Bitflyer, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_code") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetfundingrate(extend(request, params)));
    return self.parseFundingRate(response, market)

end
function parseFundingRate(self::Bitflyer, contract, market=nothing)
    nextFundingDatetime = safeString(contract, "next_funding_rate_settledate");
    nextFundingTimestamp = self.parse8601(nextFundingDatetime);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => nothing,
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => self.safeNumber(contract, "current_funding_rate"),
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function sign(self::Bitflyer, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", self.version, "/");
    if functions.ccxtruthy(api == "private")
        request += "me/";
    end
    request += path;
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(params)))
            request += string("?", self.urlencode(params));
        end
    end
    baseUrl = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing));
    url = string(baseUrl, request);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        content = [nonce, method, request];
        auth = join(content, "");
        if functions.ccxtruthy(length(objectKeys(params)))
            if functions.ccxtruthy(method != "GET")
                body = json(params);
                auth += body;
            end
        end
        headers = Dict{Symbol, Any}(
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-TIMESTAMP") => nonce,
            Symbol("ACCESS-SIGN") => self.hmac(self.encode(auth), self.encode(self.secret), sha256),
            Symbol("Content-Type") => "application/json"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitflyer, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    errorMessage = safeString(response, "error_message");
    statusCode = safeInteger(response, "status");
    if functions.ccxtruthy(errorMessage != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), statusCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitflyer, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetGetmarketsUsa(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getmarkets/usa", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetmarketsEu(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getmarkets/eu", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetmarkets(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getmarkets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetboard(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getboard", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetticker(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetexecutions(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getexecutions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGethealth(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "gethealth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetboardstate(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getboardstate", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetchats(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getchats", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetGetfundingrate(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getfundingrate", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetGetpermissions(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getpermissions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetbalance(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getbalance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetbalancehistory(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getbalancehistory", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetcollateral(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getcollateral", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetcollateralhistory(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getcollateralhistory", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetcollateralaccounts(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getcollateralaccounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetaddresses(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getaddresses", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetcoinins(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getcoinins", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetcoinouts(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getcoinouts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetbankaccounts(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getbankaccounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetdeposits(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getdeposits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetwithdrawals(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getwithdrawals", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetchildorders(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getchildorders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetparentorders(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getparentorders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetparentorder(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getparentorder", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetexecutions(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getexecutions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGetpositions(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "getpositions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetGettradingcommission(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "gettradingcommission", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostSendcoin(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "sendcoin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdraw(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSendchildorder(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "sendchildorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelchildorder(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "cancelchildorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSendparentorder(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "sendparentorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelparentorder(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "cancelparentorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelallchildorders(self::Bitflyer, params=Dict(), context=Dict())
    return request(self, "cancelallchildorders", "private", "POST", params, nothing, nothing, Dict())
end

function Bitflyer(; kwargs...)
    inst = Bitflyer(Exchange(), describe, parseExpiryDate, safeMarket, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, parseTrade, fetchTrades, fetchTradingFee, createOrder, cancelOrder, parseOrderStatus, parseOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchOrder, fetchMyTrades, fetchPositions, withdraw, fetchDeposits, fetchWithdrawals, parseDepositStatus, parseWithdrawalStatus, parseTransaction, fetchFundingRate, parseFundingRate, sign, handleErrors, publicGetGetmarketsUsa, publicGetGetmarketsEu, publicGetGetmarkets, publicGetGetboard, publicGetGetticker, publicGetGetexecutions, publicGetGethealth, publicGetGetboardstate, publicGetGetchats, publicGetGetfundingrate, privateGetGetpermissions, privateGetGetbalance, privateGetGetbalancehistory, privateGetGetcollateral, privateGetGetcollateralhistory, privateGetGetcollateralaccounts, privateGetGetaddresses, privateGetGetcoinins, privateGetGetcoinouts, privateGetGetbankaccounts, privateGetGetdeposits, privateGetGetwithdrawals, privateGetGetchildorders, privateGetGetparentorders, privateGetGetparentorder, privateGetGetexecutions, privateGetGetpositions, privateGetGettradingcommission, privatePostSendcoin, privatePostWithdraw, privatePostSendchildorder, privatePostCancelchildorder, privatePostSendparentorder, privatePostCancelparentorder, privatePostCancelallchildorders)
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
