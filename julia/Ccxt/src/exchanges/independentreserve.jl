@kwdef mutable struct Independentreserve <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    sign::Function = sign

# Generated REST endpoint fields
    publicGetGetValidPrimaryCurrencyCodes::Function = publicGetGetValidPrimaryCurrencyCodes
    publicGetGetValidSecondaryCurrencyCodes::Function = publicGetGetValidSecondaryCurrencyCodes
    publicGetGetValidLimitOrderTypes::Function = publicGetGetValidLimitOrderTypes
    publicGetGetValidMarketOrderTypes::Function = publicGetGetValidMarketOrderTypes
    publicGetGetValidOrderTypes::Function = publicGetGetValidOrderTypes
    publicGetGetValidTransactionTypes::Function = publicGetGetValidTransactionTypes
    publicGetGetMarketSummary::Function = publicGetGetMarketSummary
    publicGetGetOrderBook::Function = publicGetGetOrderBook
    publicGetGetAllOrders::Function = publicGetGetAllOrders
    publicGetGetTradeHistorySummary::Function = publicGetGetTradeHistorySummary
    publicGetGetRecentTrades::Function = publicGetGetRecentTrades
    publicGetGetFxRates::Function = publicGetGetFxRates
    publicGetGetOrderMinimumVolumes::Function = publicGetGetOrderMinimumVolumes
    publicGetGetCryptoWithdrawalFees::Function = publicGetGetCryptoWithdrawalFees
    publicGetGetCryptoWithdrawalFees2::Function = publicGetGetCryptoWithdrawalFees2
    publicGetGetNetworks::Function = publicGetGetNetworks
    publicGetGetPrimaryCurrencyConfig2::Function = publicGetGetPrimaryCurrencyConfig2
    privatePostGetOpenOrders::Function = privatePostGetOpenOrders
    privatePostGetClosedOrders::Function = privatePostGetClosedOrders
    privatePostGetClosedFilledOrders::Function = privatePostGetClosedFilledOrders
    privatePostGetOrderDetails::Function = privatePostGetOrderDetails
    privatePostGetAccounts::Function = privatePostGetAccounts
    privatePostGetTransactions::Function = privatePostGetTransactions
    privatePostGetFiatBankAccounts::Function = privatePostGetFiatBankAccounts
    privatePostGetDigitalCurrencyDepositAddress::Function = privatePostGetDigitalCurrencyDepositAddress
    privatePostGetDigitalCurrencyDepositAddress2::Function = privatePostGetDigitalCurrencyDepositAddress2
    privatePostGetDigitalCurrencyDepositAddresses::Function = privatePostGetDigitalCurrencyDepositAddresses
    privatePostGetDigitalCurrencyDepositAddresses2::Function = privatePostGetDigitalCurrencyDepositAddresses2
    privatePostGetTrades::Function = privatePostGetTrades
    privatePostGetBrokerageFees::Function = privatePostGetBrokerageFees
    privatePostGetDigitalCurrencyWithdrawal::Function = privatePostGetDigitalCurrencyWithdrawal
    privatePostPlaceLimitOrder::Function = privatePostPlaceLimitOrder
    privatePostPlaceMarketOrder::Function = privatePostPlaceMarketOrder
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostSynchDigitalCurrencyDepositAddressWithBlockchain::Function = privatePostSynchDigitalCurrencyDepositAddressWithBlockchain
    privatePostRequestFiatWithdrawal::Function = privatePostRequestFiatWithdrawal
    privatePostWithdrawFiatCurrency::Function = privatePostWithdrawFiatCurrency
    privatePostWithdrawDigitalCurrency::Function = privatePostWithdrawDigitalCurrency
    privatePostWithdrawCrypto::Function = privatePostWithdrawCrypto

end
function describe(self::Independentreserve, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "independentreserve",
    Symbol("name") => "Independent Reserve",
    Symbol("countries") => ["AU", "NZ"],
    Symbol("rateLimit") => 1000,
    Symbol("pro") => true,
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
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
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
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
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
        Symbol("fetchPositionForSymbolWs") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsForSymbolWs") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.independentreserve.com/Public",
            Symbol("private") => "https://api.independentreserve.com/Private"
        ),
        Symbol("www") => "https://www.independentreserve.com",
        Symbol("doc") => "https://www.independentreserve.com/API"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("GetValidPrimaryCurrencyCodes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidSecondaryCurrencyCodes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidLimitOrderTypes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidMarketOrderTypes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidOrderTypes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidTransactionTypes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetMarketSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAllOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTradeHistorySummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetRecentTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetFxRates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderMinimumVolumes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetCryptoWithdrawalFees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetCryptoWithdrawalFees2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetNetworks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetPrimaryCurrencyConfig2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("GetOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetClosedOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetClosedFilledOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderDetails") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTransactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetFiatBankAccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDigitalCurrencyDepositAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDigitalCurrencyDepositAddress2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDigitalCurrencyDepositAddresses") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDigitalCurrencyDepositAddresses2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetBrokerageFees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDigitalCurrencyWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("PlaceLimitOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("PlaceMarketOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SynchDigitalCurrencyDepositAddressWithBlockchain") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("RequestFiatWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("WithdrawFiatCurrency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("WithdrawDigitalCurrency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("WithdrawCrypto") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.005"),
            Symbol("maker") => self.parseNumber("0.005"),
            Symbol("percentage") => true,
            Symbol("tierBased") => false
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
                    Symbol("GTC") => true,
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
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
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("PLA") => "PlayChip"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "Ethereum",
            Symbol("USDC") => "Ethereum",
            Symbol("BTC") => "Bitcoin",
            Symbol("BCH") => "BitcoinCash",
            Symbol("ETH") => "Ethereum",
            Symbol("LTC") => "Litecoin",
            Symbol("XRP") => "XrpLedger",
            Symbol("ZRX") => "Ethereum",
            Symbol("EOS") => "EosIo",
            Symbol("XLM") => "Stellar",
            Symbol("BAT") => "Ethereum",
            Symbol("ETC") => "EthereumClassic",
            Symbol("LINK") => "Ethereum",
            Symbol("MKR") => "Ethereum",
            Symbol("DAI") => "Ethereum",
            Symbol("COMP") => "Ethereum",
            Symbol("SNX") => "Ethereum",
            Symbol("YFI") => "Ethereum",
            Symbol("AAVE") => "Ethereum",
            Symbol("GRT") => "Ethereum",
            Symbol("DOT") => "Polkadot",
            Symbol("UNI") => "Ethereum",
            Symbol("ADA") => "Cardano",
            Symbol("MATIC") => "Ethereum",
            Symbol("DOGE") => "Dogecoin",
            Symbol("SOL") => "Solana",
            Symbol("MANA") => "Ethereum",
            Symbol("SAND") => "Ethereum",
            Symbol("SHIB") => "Ethereum",
            Symbol("TRX") => "Tron",
            Symbol("RENDER") => "Solana",
            Symbol("WIF") => "Solana",
            Symbol("RLUSD") => "Ethereum",
            Symbol("PEPE") => "Ethereum"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "Bitcoin",
            Symbol("ETH") => "Ethereum",
            Symbol("BCH") => "BitcoinCash",
            Symbol("LTC") => "Litecoin",
            Symbol("XRP") => "XrpLedger",
            Symbol("EOS") => "EosIo",
            Symbol("XLM") => "Stellar",
            Symbol("ETC") => "EthereumClassic",
            Symbol("BSV") => "BitcoinSV",
            Symbol("DOGE") => "Dogecoin",
            Symbol("DOT") => "Polkadot",
            Symbol("ADA") => "Cardano",
            Symbol("SOL") => "Solana",
            Symbol("TRX") => "Tron"
        )
    )
))

end
"""
retrieves data on all markets for independentreserve

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Independentreserve; params=Dict())
    baseCurrenciesPromise = self.publicGetGetValidPrimaryCurrencyCodes(params);
    quoteCurrenciesPromise = self.publicGetGetValidSecondaryCurrencyCodes(params);
    limitsPromise = self.publicGetGetOrderMinimumVolumes(params);
    (baseCurrencies, quoteCurrencies, limits) = (Base.fetch(asyncmap(Base.fetch, [baseCurrenciesPromise, quoteCurrenciesPromise, limitsPromise])));
    result = [];
    baseCurrencyIds = toArray(baseCurrencies);
    quoteCurrencyIds = toArray(quoteCurrencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(baseCurrencyIds)))
        baseId = get(baseCurrencyIds, i + 1, nothing);
        base = self.safeCurrencyCode(baseId);
        minAmount = self.safeNumber(limits, baseId);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(quoteCurrencyIds)))
            quoteId = get(quoteCurrencyIds, j + 1, nothing);
            quote_var = self.safeCurrencyCode(quoteId);
            id = string(baseId, "/", quoteId);
            push!(result, Dict{Symbol, Any}(
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
        Symbol("amount") => nothing,
        Symbol("price") => nothing
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
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
    Symbol("info") => id
));
            j += 1
        end
        i += 1
    end
    return result

end
function parseBalance(self::Independentreserve, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "CurrencyCode");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "AvailableBalance");
        account[Symbol("total")] = safeString(balance, "TotalBalance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Independentreserve; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetAccounts(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Independentreserve, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(market, Symbol("baseId"), nothing),
        Symbol("secondaryCurrencyCode") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetGetOrderBook(extend(request, params)));
    timestamp = self.parse8601(safeString(response, "CreatedTimestampUtc"));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "BuyOrders", asksKey = "SellOrders", priceKey = "Price", amountKey = "Volume")

end
function parseTicker(self::Independentreserve, ticker; market=nothing)
    timestamp = self.parse8601(safeString(ticker, "CreatedTimestampUtc"));
    baseId = safeString(ticker, "PrimaryCurrencyCode");
    quoteId = safeString(ticker, "SecondaryCurrencyCode");
    defaultMarketId = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((baseId != nothing), (quoteId != nothing)))
        defaultMarketId = string(baseId, "/", quoteId);
    end
    market = self.safeMarket(marketId = defaultMarketId, market = market, delimiter = "/");
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "LastPrice");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "DayHighestPrice"),
    Symbol("low") => safeString(ticker, "DayLowestPrice"),
    Symbol("bid") => safeString(ticker, "CurrentHighestBidPrice"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "CurrentLowestOfferPrice"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => safeString(ticker, "DayAvgPrice"),
    Symbol("baseVolume") => safeString(ticker, "DayVolumeXbtInSecondaryCurrrency"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Independentreserve, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(market, Symbol("baseId"), nothing),
        Symbol("secondaryCurrencyCode") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.publicGetGetMarketSummary(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function parseOrder(self::Independentreserve, order; market=nothing)
    symbol = nothing;
    baseId = safeString(order, "PrimaryCurrencyCode");
    quoteId = safeString(order, "SecondaryCurrencyCode");
    base = nothing;
    quote_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((baseId != nothing), (quoteId != nothing)))
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
    elseif functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
        base = get(market, Symbol("base"), nothing);
        quote_var = get(market, Symbol("quote"), nothing);
    end
    orderType = safeString2(order, "Type", "OrderType");
    side = nothing;
    if functions.ccxtruthy(orderType != nothing)
        if functions.ccxtruthy(findfirst("Bid", orderType) !== nothing)
            side = "buy";
        elseif functions.ccxtruthy(findfirst("Offer", orderType) !== nothing)
            side = "sell";
        end
        if functions.ccxtruthy(findfirst("Market", orderType) !== nothing)
            orderType = "market";
        elseif functions.ccxtruthy(findfirst("Limit", orderType) !== nothing)
            orderType = "limit";
        end
    end
    timestamp = self.parse8601(safeString(order, "CreatedTimestampUtc"));
    filled = safeString(order, "VolumeFilled");
    feeRate = safeString(order, "FeePercent");
    feeCost = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(feeRate != nothing, filled != nothing))
        feeCost = stringMul(feeRate, filled);
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "OrderGuid"),
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => orderType,
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "TimeInForce")),
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "Price"),
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => safeString(order, "Value"),
    Symbol("average") => safeString(order, "AvgPrice"),
    Symbol("amount") => safeString2(order, "VolumeOrdered", "Volume"),
    Symbol("filled") => filled,
    Symbol("remaining") => safeString(order, "Outstanding"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "Status")),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("rate") => feeRate,
        Symbol("cost") => feeCost,
        Symbol("currency") => base
    ),
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Independentreserve, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Open") => "open",
        Symbol("PartiallyFilled") => "open",
        Symbol("Filled") => "closed",
        Symbol("PartiallyFilledAndCancelled") => "canceled",
        Symbol("Cancelled") => "canceled",
        Symbol("PartiallyFilledAndExpired") => "canceled",
        Symbol("Expired") => "canceled",
        Symbol("Failed") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Independentreserve, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("Gtc") => "GTC",
        Symbol("Moc") => "PO",
        Symbol("Fok") => "FOK",
        Symbol("Ioc") => "IOC"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
"""
fetches information on an order made by the user

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Independentreserve, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetOrderDetails(extend(Dict{Symbol, Any}(
        Symbol("orderGuid") => id
    ), params)));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    return self.parseOrder(response, market = market)

end
"""
fetch all unfilled currently open orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Independentreserve; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("primaryCurrencyCode")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("secondaryCurrencyCode")] = get(market, Symbol("quoteId"), nothing);
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 50;
    end
    request[Symbol("pageIndex")] = 1;
    request[Symbol("pageSize")] = limit;
    response = Base.fetch(self.privatePostGetOpenOrders(extend(request, params)));
    data = self.safeList(response, "Data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Independentreserve; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("primaryCurrencyCode")] = get(market, Symbol("baseId"), nothing);
        request[Symbol("secondaryCurrencyCode")] = get(market, Symbol("quoteId"), nothing);
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 50;
    end
    request[Symbol("pageIndex")] = 1;
    request[Symbol("pageSize")] = limit;
    response = Base.fetch(self.privatePostGetClosedOrders(extend(request, params)));
    data = self.safeList(response, "Data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Independentreserve; symbol=nothing, since=nothing, limit=50, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    pageIndex = safeInteger(params, "pageIndex", 1);
    if functions.ccxtruthy(limit == nothing)
        limit = 50;
    end
    request = Dict{Symbol, Any}(
        Symbol("pageIndex") => pageIndex,
        Symbol("pageSize") => limit
    );
    response = Base.fetch(self.privatePostGetTrades(extend(request, params)));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    data = self.safeList(response, "Data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function parseTrade(self::Independentreserve, trade; market=nothing)
    timestamp = self.parse8601(get(trade, Symbol("TradeTimestampUtc"), nothing));
    id = safeString(trade, "TradeGuid");
    orderId = safeString(trade, "OrderGuid");
    priceString = safeString2(trade, "Price", "SecondaryCurrencyTradePrice");
    amountString = safeString2(trade, "VolumeTraded", "PrimaryCurrencyAmount");
    price = self.parseNumber(priceString);
    amount = self.parseNumber(amountString);
    cost = self.parseNumber(stringMul(priceString, amountString));
    baseId = safeString(trade, "PrimaryCurrencyCode");
    quoteId = safeString(trade, "SecondaryCurrencyCode");
    marketId = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((baseId != nothing), (quoteId != nothing)))
        marketId = string(baseId, "/", quoteId);
    end
    symbol = self.safeSymbol(marketId, market = market, delimiter = "/");
    side = safeString(trade, "OrderType");
    if functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy(findfirst("Bid", side) !== nothing)
            side = "buy";
        elseif functions.ccxtruthy(findfirst("Offer", side) !== nothing)
            side = "sell";
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => nothing
), market = market)

end
"""
get the list of most recent trades for a particular symbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Independentreserve, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(market, Symbol("baseId"), nothing),
        Symbol("secondaryCurrencyCode") => get(market, Symbol("quoteId"), nothing),
        Symbol("numberOfRecentTradesToRetrieve") => 50
    );
    response = Base.fetch(self.publicGetGetRecentTrades(extend(request, params)));
    trades = self.safeList(response, "Trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Independentreserve; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetBrokerageFees(params));
    fees = Dict{Symbol, Any}();
    rows = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        fee = get(rows, i + 1, nothing);
        currencyId = safeString(fee, "CurrencyCode");
        code = self.safeCurrencyCode(currencyId);
        tradingFee = self.safeNumber(fee, "Fee");
        if functions.ccxtruthy(code != nothing)
            fees[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("info") => fee,
                Symbol("fee") => tradingFee
            );
        end
        i += 1
    end
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = safeValue(fees, get(market, Symbol("base"), nothing), Dict{Symbol, Any}());
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => safeValue(fee, "info"),
            Symbol("symbol") => symbol,
            Symbol("maker") => self.safeNumber(fee, "fee"),
            Symbol("taker") => self.safeNumber(fee, "fee"),
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
"""
create a trade order

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
function createOrder(self::Independentreserve, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderType = capitalize(type_var);
    orderType += functions.ccxtruthy((side == "sell")) ? "Offer" : "Bid";
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(market, Symbol("baseId"), nothing),
        Symbol("secondaryCurrencyCode") => get(market, Symbol("quoteId"), nothing),
        Symbol("orderType") => orderType
    );
    request[Symbol("volume")] = amount;
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = price;
        response = Base.fetch(self.privatePostPlaceLimitOrder(extend(request, params)));
    else
        response = Base.fetch(self.privatePostPlaceMarketOrder(extend(request, params)));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => get(response, Symbol("OrderGuid"), nothing)
), market = market)

end
"""
cancels an open order
see: https://www.independentreserve.com/features/api#CancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Independentreserve, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderGuid") => id
    );
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.independentreserve.com/features/api#GetDigitalCurrencyDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Independentreserve, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostGetDigitalCurrencyDepositAddress(extend(request, params)));
    return self.parseDepositAddress(response)

end
function parseDepositAddress(self::Independentreserve, depositAddress; currency=nothing)
    address = safeString(depositAddress, "DepositAddress");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "Tag")
)

end
"""
make a withdrawal
see: https://www.independentreserve.com/features/api#WithdrawDigitalCurrency

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.comment`::object, optional: withdrawal comment, should not exceed 500 characters

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Independentreserve, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("primaryCurrencyCode") => get(currency, Symbol("id"), nothing),
        Symbol("withdrawalAddress") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("destinationTag")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        throw(BadRequest(string(self.id, " withdraw () does not accept params[\"networkCode\"]")));
    end
    response = Base.fetch(self.privatePostWithdrawDigitalCurrency(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTransaction(self::Independentreserve, transaction; currency=nothing)
    amount = self.safeDict(transaction, "Amount");
    destination = self.safeDict(transaction, "Destination");
    currencyId = safeString(transaction, "PrimaryCurrencyCode");
    datetime = safeString(transaction, "CreatedTimestampUtc");
    address = safeString(destination, "Address");
    tag = safeString(destination, "Tag");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "TransactionGuid"),
    Symbol("txid") => nothing,
    Symbol("type") => "withdraw",
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("amount") => self.safeNumber(amount, "Total"),
    Symbol("status") => safeString(transaction, "Status"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(amount, "Fee"),
        Symbol("rate") => nothing
    ),
    Symbol("internal") => false
)

end
function sign(self::Independentreserve, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        self.checkRequiredCredentials();
        nonce = self.nonce();
        auth = [url, string("apiKey=", self.apiKey), string("nonce=", nonce)];
        keys_var = objectKeys(params);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            key = get(keys_var, i + 1, nothing);
            value = string(get(params, Symbol(key), nothing));
            push!(auth, string(key, "=", value));
            i += 1
        end
        message = join(auth, ",");
        signature = self.hmac(self.encode(message), self.encode(self.secret), sha256);
        query = Dict{Symbol, Any}();
        query[Symbol("apiKey")] = self.apiKey;
        query[Symbol("nonce")] = nonce;
        query[Symbol("signature")] =         uppercase(signature);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            key = get(keys_var, i + 1, nothing);
            query[Symbol(key)] = get(params, Symbol(key), nothing);
            i += 1
        end
        body = json(query);
        headers = Dict{Symbol, Any}(
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Independentreserve, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetGetValidPrimaryCurrencyCodes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidPrimaryCurrencyCodes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidSecondaryCurrencyCodes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidSecondaryCurrencyCodes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidLimitOrderTypes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidLimitOrderTypes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidMarketOrderTypes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidMarketOrderTypes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidOrderTypes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidOrderTypes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidTransactionTypes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetValidTransactionTypes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetMarketSummary(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetMarketSummary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetOrderBook(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetOrderBook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetAllOrders(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetAllOrders"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetTradeHistorySummary(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetTradeHistorySummary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetRecentTrades(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetRecentTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetFxRates(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetFxRates"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetOrderMinimumVolumes(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetOrderMinimumVolumes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetCryptoWithdrawalFees(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetCryptoWithdrawalFees"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetCryptoWithdrawalFees2(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetCryptoWithdrawalFees2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetNetworks(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetNetworks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetPrimaryCurrencyConfig2(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetPrimaryCurrencyConfig2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetOpenOrders(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetOpenOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetClosedOrders(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetClosedOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetClosedFilledOrders(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetClosedFilledOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetOrderDetails(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetOrderDetails"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetAccounts(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetAccounts"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetTransactions(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetTransactions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetFiatBankAccounts(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetFiatBankAccounts"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDigitalCurrencyDepositAddress(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetDigitalCurrencyDepositAddress"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDigitalCurrencyDepositAddress2(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetDigitalCurrencyDepositAddress2"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDigitalCurrencyDepositAddresses(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetDigitalCurrencyDepositAddresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDigitalCurrencyDepositAddresses2(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetDigitalCurrencyDepositAddresses2"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetTrades(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetTrades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetBrokerageFees(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetBrokerageFees"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetDigitalCurrencyWithdrawal(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "GetDigitalCurrencyWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPlaceLimitOrder(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "PlaceLimitOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPlaceMarketOrder(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "PlaceMarketOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "CancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSynchDigitalCurrencyDepositAddressWithBlockchain(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "SynchDigitalCurrencyDepositAddressWithBlockchain"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRequestFiatWithdrawal(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "RequestFiatWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawFiatCurrency(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "WithdrawFiatCurrency"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawDigitalCurrency(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "WithdrawDigitalCurrency"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawCrypto(self::Independentreserve, params=Dict(), context=Dict())
    return request(self, "WithdrawCrypto"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Independentreserve(; kwargs...)
    inst = Independentreserve(Exchange(), describe, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, parseOrder, parseOrderStatus, parseTimeInForce, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchMyTrades, parseTrade, fetchTrades, fetchTradingFees, createOrder, cancelOrder, fetchDepositAddress, parseDepositAddress, withdraw, parseTransaction, sign, publicGetGetValidPrimaryCurrencyCodes, publicGetGetValidSecondaryCurrencyCodes, publicGetGetValidLimitOrderTypes, publicGetGetValidMarketOrderTypes, publicGetGetValidOrderTypes, publicGetGetValidTransactionTypes, publicGetGetMarketSummary, publicGetGetOrderBook, publicGetGetAllOrders, publicGetGetTradeHistorySummary, publicGetGetRecentTrades, publicGetGetFxRates, publicGetGetOrderMinimumVolumes, publicGetGetCryptoWithdrawalFees, publicGetGetCryptoWithdrawalFees2, publicGetGetNetworks, publicGetGetPrimaryCurrencyConfig2, privatePostGetOpenOrders, privatePostGetClosedOrders, privatePostGetClosedFilledOrders, privatePostGetOrderDetails, privatePostGetAccounts, privatePostGetTransactions, privatePostGetFiatBankAccounts, privatePostGetDigitalCurrencyDepositAddress, privatePostGetDigitalCurrencyDepositAddress2, privatePostGetDigitalCurrencyDepositAddresses, privatePostGetDigitalCurrencyDepositAddresses2, privatePostGetTrades, privatePostGetBrokerageFees, privatePostGetDigitalCurrencyWithdrawal, privatePostPlaceLimitOrder, privatePostPlaceMarketOrder, privatePostCancelOrder, privatePostSynchDigitalCurrencyDepositAddressWithBlockchain, privatePostRequestFiatWithdrawal, privatePostWithdrawFiatCurrency, privatePostWithdrawDigitalCurrency, privatePostWithdrawCrypto)
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
function __ccxt_doc_Independentreserve_fetchMarkets() end
"""
retrieves data on all markets for independentreserve

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Independentreserve_fetchMarkets

function __ccxt_doc_Independentreserve_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Independentreserve_fetchBalance

function __ccxt_doc_Independentreserve_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Independentreserve_fetchOrderBook

function __ccxt_doc_Independentreserve_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Independentreserve_fetchTicker

function __ccxt_doc_Independentreserve_fetchOrder() end
"""
fetches information on an order made by the user

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Independentreserve_fetchOrder

function __ccxt_doc_Independentreserve_fetchOpenOrders() end
"""
fetch all unfilled currently open orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Independentreserve_fetchOpenOrders

function __ccxt_doc_Independentreserve_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Independentreserve_fetchClosedOrders

function __ccxt_doc_Independentreserve_fetchMyTrades() end
"""
fetch all trades made by the user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Independentreserve_fetchMyTrades

function __ccxt_doc_Independentreserve_fetchTrades() end
"""
get the list of most recent trades for a particular symbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Independentreserve_fetchTrades

function __ccxt_doc_Independentreserve_fetchTradingFees() end
"""
fetch the trading fees for multiple markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Independentreserve_fetchTradingFees

function __ccxt_doc_Independentreserve_createOrder() end
"""
create a trade order

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
__ccxt_doc_Independentreserve_createOrder

function __ccxt_doc_Independentreserve_cancelOrder() end
"""
cancels an open order
see: https://www.independentreserve.com/features/api#CancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Independentreserve_cancelOrder

function __ccxt_doc_Independentreserve_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.independentreserve.com/features/api#GetDigitalCurrencyDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Independentreserve_fetchDepositAddress

function __ccxt_doc_Independentreserve_withdraw() end
"""
make a withdrawal
see: https://www.independentreserve.com/features/api#WithdrawDigitalCurrency

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.comment`::object, optional: withdrawal comment, should not exceed 500 characters

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Independentreserve_withdraw
