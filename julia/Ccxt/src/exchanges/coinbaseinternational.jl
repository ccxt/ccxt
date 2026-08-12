@kwdef mutable struct Coinbaseinternational <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    handlePortfolioAndParams::Function = handlePortfolioAndParams
    handleNetworkIdAndParams::Function = handleNetworkIdAndParams
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    createDepositAddress::Function = createDepositAddress
    findDefaultNetwork::Function = findDefaultNetwork
    loadCurrencyNetworks::Function = loadCurrencyNetworks
    parseNetworks::Function = parseNetworks
    parseNetwork::Function = parseNetwork
    setMargin::Function = setMargin
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    fetchPositions::Function = fetchPositions
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDeposits::Function = fetchDeposits
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseTrade::Function = parseTrade
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    transfer::Function = transfer
    createOrder::Function = createOrder
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    editOrder::Function = editOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    withdraw::Function = withdraw
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    v1PublicGetAssets::Function = v1PublicGetAssets
    v1PublicGetAssetsAssets::Function = v1PublicGetAssetsAssets
    v1PublicGetAssetsAssetNetworks::Function = v1PublicGetAssetsAssetNetworks
    v1PublicGetInstruments::Function = v1PublicGetInstruments
    v1PublicGetInstrumentsInstrument::Function = v1PublicGetInstrumentsInstrument
    v1PublicGetInstrumentsInstrumentQuote::Function = v1PublicGetInstrumentsInstrumentQuote
    v1PublicGetInstrumentsInstrumentFunding::Function = v1PublicGetInstrumentsInstrumentFunding
    v1PublicGetInstrumentsInstrumentCandles::Function = v1PublicGetInstrumentsInstrumentCandles
    v1PrivateGetOrders::Function = v1PrivateGetOrders
    v1PrivateGetOrdersId::Function = v1PrivateGetOrdersId
    v1PrivateGetPortfolios::Function = v1PrivateGetPortfolios
    v1PrivateGetPortfoliosPortfolio::Function = v1PrivateGetPortfoliosPortfolio
    v1PrivateGetPortfoliosPortfolioDetail::Function = v1PrivateGetPortfoliosPortfolioDetail
    v1PrivateGetPortfoliosPortfolioSummary::Function = v1PrivateGetPortfoliosPortfolioSummary
    v1PrivateGetPortfoliosPortfolioBalances::Function = v1PrivateGetPortfoliosPortfolioBalances
    v1PrivateGetPortfoliosPortfolioBalancesAsset::Function = v1PrivateGetPortfoliosPortfolioBalancesAsset
    v1PrivateGetPortfoliosPortfolioPositions::Function = v1PrivateGetPortfoliosPortfolioPositions
    v1PrivateGetPortfoliosPortfolioPositionsInstrument::Function = v1PrivateGetPortfoliosPortfolioPositionsInstrument
    v1PrivateGetPortfoliosFills::Function = v1PrivateGetPortfoliosFills
    v1PrivateGetPortfoliosPortfolioFills::Function = v1PrivateGetPortfoliosPortfolioFills
    v1PrivateGetTransfers::Function = v1PrivateGetTransfers
    v1PrivateGetTransfersTransferUuid::Function = v1PrivateGetTransfersTransferUuid
    v1PrivatePostOrders::Function = v1PrivatePostOrders
    v1PrivatePostPortfolios::Function = v1PrivatePostPortfolios
    v1PrivatePostPortfoliosMargin::Function = v1PrivatePostPortfoliosMargin
    v1PrivatePostPortfoliosTransfer::Function = v1PrivatePostPortfoliosTransfer
    v1PrivatePostTransfersWithdraw::Function = v1PrivatePostTransfersWithdraw
    v1PrivatePostTransfersAddress::Function = v1PrivatePostTransfersAddress
    v1PrivatePostTransfersCreateCounterpartyId::Function = v1PrivatePostTransfersCreateCounterpartyId
    v1PrivatePostTransfersValidateCounterpartyId::Function = v1PrivatePostTransfersValidateCounterpartyId
    v1PrivatePostTransfersWithdrawCounterparty::Function = v1PrivatePostTransfersWithdrawCounterparty
    v1PrivatePutOrdersId::Function = v1PrivatePutOrdersId
    v1PrivatePutPortfoliosPortfolio::Function = v1PrivatePutPortfoliosPortfolio
    v1PrivateDeleteOrders::Function = v1PrivateDeleteOrders
    v1PrivateDeleteOrdersId::Function = v1PrivateDeleteOrdersId

end
function describe(self::Coinbaseinternational, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinbaseinternational",
    Symbol("name") => "Coinbase International",
    Symbol("countries") => ["US"],
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome"), nothing),
    Symbol("headers") => Dict{Symbol, Any}(
        Symbol("CB-VERSION") => "2018-05-30"
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrder") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL2OrderBook") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyBuys") => true,
        Symbol("fetchMySells") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => false,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.international.coinbase.com/api"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api-n5e1.coinbase.com/api"
        ),
        Symbol("www") => "https://international.coinbase.com",
        Symbol("doc") => ["https://docs.cloud.coinbase.com/intx/docs"],
        Symbol("fees") => ["https://help.coinbase.com/en/international-exchange/trading-deposits-withdrawals/international-exchange-fees"],
        Symbol("referral") => ""
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/{assets}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/{asset}/networks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments/{instrument}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments/{instrument}/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments/{instrument}/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments/{instrument}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/balances/{asset}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/positions/{instrument}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/{transfer_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/create-counterparty-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/validate-counterparty-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfers/withdraw/counterparty") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("portfolios/{portfolio}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.004"),
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("1000000"), self.parseNumber("0.004")], [self.parseNumber("5000000"), self.parseNumber("0.0035")], [self.parseNumber("10000000"), self.parseNumber("0.0035")], [self.parseNumber("50000000"), self.parseNumber("0.003")], [self.parseNumber("250000000"), self.parseNumber("0.0025")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("1000000"), self.parseNumber("0.0016")], [self.parseNumber("5000000"), self.parseNumber("0.001")], [self.parseNumber("10000000"), self.parseNumber("0.0008")], [self.parseNumber("50000000"), self.parseNumber("0.0005")], [self.parseNumber("250000000"), self.parseNumber("0")]]
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("DUPLICATE_CLIENT_ORDER_ID") => DuplicateOrderId,
            Symbol("Order rejected") => InvalidOrder,
            Symbol("market orders must be IoC") => InvalidOrder,
            Symbol("tif is required") => InvalidOrder,
            Symbol("Invalid replace order request") => InvalidOrder,
            Symbol("Unauthorized") => PermissionDenied,
            Symbol("invalid result_limit") => BadRequest,
            Symbol("is a required field") => BadRequest,
            Symbol("Not Found") => BadRequest,
            Symbol("ip not allowed") => AuthenticationError,
            Symbol("cbe spot routing instrument not supported") => NotSupported
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "ONE_MINUTE",
        Symbol("5m") => "FIVE_MINUTE",
        Symbol("15m") => "FIFTEEN_MINUTE",
        Symbol("30m") => "THIRTY_MINUTE",
        Symbol("1h") => "ONE_HOUR",
        Symbol("2h") => "TWO_HOUR",
        Symbol("6h") => "SIX_HOUR",
        Symbol("1d") => "ONE_DAY"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("brokerId") => "nfqkvdjp",
        Symbol("portfolio") => "",
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("method") => "v1PrivatePostTransfersWithdraw"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("ethereum") => "ETH",
            Symbol("arbitrum") => "ARBITRUM",
            Symbol("avacchain") => "AVAX",
            Symbol("optimism") => "OPTIMISM",
            Symbol("polygon") => "MATIC",
            Symbol("solana") => "SOL",
            Symbol("bitcoin") => "BTC"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => true,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => true,
                    Symbol("GTC") => true
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 10000,
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
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
function handlePortfolioAndParams(self::Coinbaseinternational, methodName; params=Dict())
    portfolio = nothing;
    (portfolio, params) = self.handleOptionAndParams(params, methodName, "portfolio");
    if functions.ccxtruthy(@functions.ccxt_and((portfolio != nothing), (portfolio != "")))
            return [portfolio, params]
    end
    defaultPortfolio = safeString(self.options, "portfolio");
    if functions.ccxtruthy(@functions.ccxt_and((defaultPortfolio != nothing), (defaultPortfolio != "")))
            return [defaultPortfolio, params]
    end
    accounts = Base.fetch(self.fetchAccounts());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        account = get(accounts, i + 1, nothing);
        info = self.safeDict(account, "info", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(self.safeBool(info, "is_default"))
            portfolioId = safeString(info, "portfolio_id");
            self.options[Symbol("portfolio")] = portfolioId;
                return [portfolioId, params]
        end
        i += 1
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a portfolio parameter or set the default portfolio with this.options[\"portfolio\"]")));

end
function handleNetworkIdAndParams(self::Coinbaseinternational, currencyCode, methodName; params=Dict())
    networkId = nothing;
    (networkId, params) = self.handleOptionAndParams(params, methodName, "network_arn_id");
    if functions.ccxtruthy(networkId == nothing)
        Base.fetch(self.loadCurrencyNetworks(currencyCode));
        networks = get(get(self.currencies, Symbol(currencyCode), nothing), Symbol("networks"), nothing);
        network = safeString2(params, "networkCode", "network");
        if functions.ccxtruthy(network == nothing)
            if functions.ccxtruthy(isEmpty(networks))
                throw(BadRequest(string(self.id, " createDepositAddress network not found for currency ", currencyCode, " please specify networkId in params")));
            end
            defaultNetwork = self.findDefaultNetwork(networks);
            networkId = get(defaultNetwork, Symbol("id"), nothing);
        else
            networkId = self.networkCodeToId(network, currencyCode = currencyCode);
        end
    end
    return [networkId, params]

end
"""
fetch all the accounts associated with a profile
see: https://docs.cloud.coinbase.com/intx/reference/getportfolios

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Coinbaseinternational; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivateGetPortfolios(params));
    return self.parseAccounts(response, params = params)

end
function parseAccount(self::Coinbaseinternational, account)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(account, "portfolio_id", "portfolio_uuid"),
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cdp.coinbase.com/intx/reference/getinstrumentcandles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, default 100 max 10000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Coinbaseinternational, symbol; timeframe="1m", since=nothing, limit=100, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 10000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("granularity") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = self.iso8601(since);
    else
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a since argument")));
    end
    unitl = safeInteger(params, "until");
    if functions.ccxtruthy(unitl != nothing)
        params = omit(params, "until");
        request[Symbol("end")] = self.iso8601(unitl);
    end
    response = Base.fetch(self.v1PublicGetInstrumentsInstrumentCandles(extend(request, params)));
    candles = self.safeList(response, "aggregations", defaultValue = []);
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Coinbaseinternational, ohlcv; market=nothing)
    return [self.parse8601(safeString2(ohlcv, "start", "time")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical funding rate prices
see: https://docs.cloud.coinbase.com/intx/reference/getinstrumentfunding

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Coinbaseinternational; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    maxEntriesPerRequest = 100;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "maxEntriesPerRequest", defaultValue = maxEntriesPerRequest);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, pageKey = pageKey, maxEntriesPerRequest = maxEntriesPerRequest))
    end
    market = self.market(symbol);
    page = safeInteger(params, pageKey, 1) - 1;
    offSet = safeInteger2(params, "offset", "result_offset", page * maxEntriesPerRequest);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("result_offset") => offSet
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("result_limit")] = limit;
    end
    response = Base.fetch(self.v1PublicGetInstrumentsInstrumentFunding(extend(request, params)));
    rawRates = self.safeList(response, "results", defaultValue = []);
    return self.parseFundingRateHistories(rawRates, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Coinbaseinternational, info; market=nothing)
    return self.parseFundingRate(info, market = market)

end
function parseFundingRate(self::Coinbaseinternational, contract; market=nothing)
    fundingDatetime = safeString2(contract, "event_time", "time");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("markPrice") => self.safeNumber(contract, "mark_price"),
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => self.parse8601(fundingDatetime),
    Symbol("datetime") => fundingDatetime,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("fundingTimestamp") => self.parse8601(fundingDatetime),
    Symbol("fundingDatetime") => fundingDatetime,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.cdp.coinbase.com/intx/reference/gettransfers

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Coinbaseinternational; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "FUNDING"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    portfolios = nothing;
    (portfolios, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "portfolios");
    if functions.ccxtruthy(portfolios != nothing)
        request[Symbol("portfolios")] = portfolios;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time_from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("result_limit")] = limit;
    else
        request[Symbol("result_limit")] = 100;
    end
    response = Base.fetch(self.v1PrivateGetTransfers(extend(request, params)));
    fundings = self.safeList(response, "results", defaultValue = []);
    return self.parseIncomes(fundings, market = market, since = since, limit = limit)

end
function parseIncome(self::Coinbaseinternational, income; market=nothing)
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    datetime = safeInteger(income, "created_at");
    timestamp = self.parse8601(datetime);
    currencyId = safeString(income, "asset");
    code = self.safeCurrencyCode(currencyId);
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "transfer_uuid"),
    Symbol("amount") => self.safeNumber(income, "amount"),
    Symbol("rate") => nothing
)

end
"""
fetch a history of internal transfers made on an account
see: https://docs.cdp.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Coinbaseinternational; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "INTERNAL"
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    portfolios = nothing;
    (portfolios, params) = self.handleOptionAndParams(params, "fetchTransfers", "portfolios");
    if functions.ccxtruthy(portfolios != nothing)
        request[Symbol("portfolios")] = portfolios;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time_from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("result_limit")] = limit;
    else
        request[Symbol("result_limit")] = 100;
    end
    response = Base.fetch(self.v1PrivateGetTransfers(extend(request, params)));
    transfers = self.safeList(response, "results", defaultValue = []);
    return self.parseTransfers(transfers, currency = currency, since = since, limit = limit)

end
function parseTransfer(self::Coinbaseinternational, transfer; currency=nothing)
    datetime = safeInteger(transfer, "created_at");
    timestamp = self.parse8601(datetime);
    currencyId = safeString(transfer, "asset");
    code = self.safeCurrencyCode(currencyId);
    fromPorfolio = self.safeDict(transfer, "from_portfolio", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(fromPorfolio, "id");
    toPorfolio = self.safeDict(transfer, "to_portfolio", defaultValue = Dict{Symbol, Any}());
    toId = safeString(toPorfolio, "id");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transfer_uuid"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromId,
    Symbol("toAccount") => toId,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status"))
)

end
function parseTransferStatus(self::Coinbaseinternational, status)
    statuses = Dict{Symbol, Any}(
        Symbol("FAILED") => "failed",
        Symbol("PROCESSED") => "ok",
        Symbol("NEW") => "pending",
        Symbol("STARTED") => "pending"
    );
    return safeString(statuses, status, status)

end
"""
create a currency deposit address
see: https://docs.cloud.coinbase.com/intx/reference/createaddress
see: https://docs.cloud.coinbase.com/intx/reference/createcounterpartyid

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network_arn_id`::string, optional: Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) if not provided will pick default
- `params.network`::string, optional: unified network code to identify the blockchain network

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Coinbaseinternational, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createDepositAddress", "method", defaultValue = "v1PrivatePostTransfersAddress");
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("createDepositAddress", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    if functions.ccxtruthy(method == "v1PrivatePostTransfersAddress")
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
        networkId = nothing;
        (networkId, params) = Base.fetch(self.handleNetworkIdAndParams(code, "createDepositAddress", params = params));
        request[Symbol("network_arn_id")] = networkId;
    end
    if functions.ccxtruthy(method == nothing)
        throw(ArgumentsRequired(string(self.id, " method is required")));
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    tag = safeString(response, "destination_tag");
    address = safeString2(response, "address", "counterparty_id");
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("tag") => tag,
    Symbol("address") => address,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
function findDefaultNetwork(self::Coinbaseinternational, networks)
    networksArray = toArray(networks);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(networksArray)))
        info = get(get(networksArray, i + 1, nothing), Symbol("info"), nothing);
        is_default = self.safeBool(info, "is_default", defaultValue = false);
        if functions.ccxtruthy(is_default)
                return get(networksArray, i + 1, nothing)
        end
        i += 1
    end
    return get(networksArray, 1, nothing)

end
function loadCurrencyNetworks(self::Coinbaseinternational, code; params=Dict())
    currency = self.currency(code);
    networks = self.safeDict(currency, "networks");
    if functions.ccxtruthy(networks != nothing)
            return false
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    rawNetworks = Base.fetch(self.v1PublicGetAssetsAssetNetworks(request));
    currency[Symbol("networks")] = self.parseNetworks(rawNetworks);
    return true

end
function parseNetworks(self::Coinbaseinternational, networks; params=Dict())
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(networks)))
        network = extend(self.parseNetwork(get(networks, i + 1, nothing)), params);
        result[Symbol(network[Symbol("network")])] = network;
        i += 1
    end
    return result

end
function parseNetwork(self::Coinbaseinternational, network; params=Dict())
    currencyId = safeString(network, "asset_name");
    currencyCode = self.safeCurrencyCode(currencyId);
    networkId = safeString(network, "network_arn_id");
    networkIdForCode = safeStringN(network, ["network_name", "display_name", "network_arn_id"], "");
    return self.safeNetwork(Dict{Symbol, Any}(
    Symbol("info") => network,
    Symbol("id") => networkId,
    Symbol("name") => safeString(network, "display_name"),
    Symbol("network") => self.networkIdToCode(networkId = networkIdForCode, currencyCode = currencyCode),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("precision") => nothing,
    Symbol("fee") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(network, "min_withdrawal_amt"),
            Symbol("max") => self.safeNumber(network, "max_withdrawal_amt")
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    )
))

end
"""
Either adds or reduces margin in order to set the margin to a specific value
see: https://docs.cloud.coinbase.com/intx/reference/setportfoliomarginoverride

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint

# Returns
- A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
"""
function setMargin(self::Coinbaseinternational, symbol, amount; params=Dict())
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("setMargin", params = params));
    if functions.ccxtruthy(symbol != nothing)
        throw(BadRequest(string(self.id, " setMargin() only allows setting margin to full portfolio")));
    end
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("margin_override") => amount
    );
    response = Base.fetch(self.v1PrivatePostPortfoliosMargin(extend(request, params)));
    return response

end
"""
fetch history of deposits and withdrawals
see: https://docs.cloud.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Coinbaseinternational; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = nothing;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "paginate");
    maxEntriesPerRequest = 100;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "maxEntriesPerRequest", defaultValue = maxEntriesPerRequest);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchDepositsWithdrawals", symbol = code, since = since, limit = limit, params = params, pageKey = pageKey, maxEntriesPerRequest = maxEntriesPerRequest))
    end
    page = safeInteger(params, pageKey, 1) - 1;
    offSet = safeInteger2(params, "offset", "result_offset", page * maxEntriesPerRequest);
    request = Dict{Symbol, Any}(
        Symbol("result_offset") => offSet
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time_from")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        newLimit = min(limit, 100);
        request[Symbol("result_limit")] = newLimit;
    end
    portfolios = nothing;
    (portfolios, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "portfolios");
    if functions.ccxtruthy(portfolios != nothing)
        request[Symbol("portfolios")] = portfolios;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("time_to")] = self.iso8601(until);
    end
    response = Base.fetch(self.v1PrivateGetTransfers(extend(request, params)));
    rawTransactions = self.safeList(response, "results", defaultValue = []);
    return self.parseTransactions(rawTransactions)

end
"""
fetch data on an open position
see: https://docs.cloud.coinbase.com/intx/reference/getportfolioposition

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Coinbaseinternational, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = self.symbol(symbol);
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchPosition", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("instrument") => self.marketId(symbol)
    );
    position = Base.fetch(self.v1PrivateGetPortfoliosPortfolioPositionsInstrument(extend(request, params)));
    return self.parsePosition(position)

end
function parsePosition(self::Coinbaseinternational, position; market=nothing)
    marketId = safeString(position, "symbol");
    quantity = safeString(position, "net_size");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    side = "long";
    if functions.ccxtruthy(stringLe(quantity, "0"))
        side = "short";
        quantity = stringMul("-1", quantity);
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("entryPrice") => nothing,
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("notional") => nothing,
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_pnl"),
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "im_contribution"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
"""
fetch all open positions
see: https://docs.cloud.coinbase.com/intx/reference/getportfoliopositions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Coinbaseinternational; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchPositions", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    response = Base.fetch(self.v1PrivateGetPortfoliosPortfolioPositions(extend(request, params)));
    positions = self.parsePositions(response);
    if functions.ccxtruthy(isEmpty(symbols))
            return positions
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArrayPositions(positions, "symbol", values = symbols, indexed = false)

end
"""
fetch all withdrawals made from an account
see: https://docs.cloud.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Coinbaseinternational; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params[Symbol("type")] = "WITHDRAW";
    return Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = limit, params = params))

end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Coinbaseinternational; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params[Symbol("type")] = "DEPOSIT";
    return Base.fetch(self.fetchDepositsWithdrawals(code = code, since = since, limit = limit, params = params))

end
function parseTransactionStatus(self::Coinbaseinternational, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PROCESSED") => "ok",
        Symbol("NEW") => "pending",
        Symbol("STARTED") => "pending",
        Symbol("FAILED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Coinbaseinternational, transaction; currency=nothing)
    datetime = safeString(transaction, "updated_at");
    fromPorfolio = self.safeDict(transaction, "from_portfolio", defaultValue = Dict{Symbol, Any}());
    addressFrom = safeStringN(transaction, ["from_address", "from_cb_account", safeStringN(fromPorfolio, ["id", "uuid", "name"]), "from_counterparty_id"]);
    toPorfolio = self.safeDict(transaction, "from_portfolio", defaultValue = Dict{Symbol, Any}());
    addressTo = safeStringN(transaction, ["to_address", "to_cb_account", safeStringN(toPorfolio, ["id", "uuid", "name"]), "to_counterparty_id"]);
    code = safeString(currency, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "transfer_uuid"),
    Symbol("txid") => safeString(transaction, "transaction_uuid"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("network") => self.networkIdToCode(networkId = safeString(transaction, "network_name"), currencyCode = code),
    Symbol("address") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => safeString(transaction, "resource"),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => self.safeCurrencyCode(safeString(transaction, "asset"), currency = currency),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => self.parse8601(datetime),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => nothing,
        Symbol("currency") => nothing
    )
)

end
function parseTrade(self::Coinbaseinternational, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    datetime = safeString(trade, "event_time");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "fill_id", "exec_id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("type") => nothing,
    Symbol("side") => safeStringLower(trade, "side"),
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => self.safeNumber(trade, "fill_price"),
    Symbol("amount") => self.safeNumber(trade, "fill_qty"),
    Symbol("cost") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(trade, "fee"),
        Symbol("currency") => self.safeCurrencyCode(safeString(trade, "fee_asset"))
    )
))

end
"""
retrieves data on all markets for coinbaseinternational
see: https://docs.cloud.coinbase.com/intx/reference/getinstruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Coinbaseinternational; params=Dict())
    response = Base.fetch(self.v1PublicGetInstruments(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Coinbaseinternational, market)
    marketId = safeString(market, "symbol");
    baseId = safeString(market, "base_asset_name");
    quoteId = safeString(market, "quote_asset_name");
    typeId = safeString(market, "type");
    isSpot = (typeId == "SPOT");
    fees = self.fees;
    symbol = string(baseId, "/", quoteId);
    settleId = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(isSpot))
        settleId = quoteId;
        symbol += string(":", quoteId);
    end
    isLinear = functions.ccxtruthy(isSpot) ? nothing : (settleId == quoteId);
    isInverse = functions.ccxtruthy(isSpot) ? nothing : (settleId != quoteId);
    if functions.ccxtruthy(marketId == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing marketId")));
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("lowercaseId") => lowercase(marketId),
    Symbol("symbol") => symbol,
    Symbol("base") => baseId,
    Symbol("quote") => quoteId,
    Symbol("settle") => settleId,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => functions.ccxtruthy(isSpot) ? "spot" : "swap",
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => !functions.ccxtruthy(isSpot),
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => safeString(market, "trading_state") == "TRADING",
    Symbol("contract") => !functions.ccxtruthy(isSpot),
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("taker") => get(get(fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
    Symbol("maker") => get(get(fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
    Symbol("contractSize") => functions.ccxtruthy(isSpot) ? nothing : 1,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "base_increment"),
        Symbol("price") => self.safeNumber(market, "quote_increment"),
        Symbol("cost") => self.safeNumber(market, "quote_increment")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.safeNumber(market, "base_imf")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => functions.ccxtruthy(isSpot) ? nothing : self.safeNumber(market, "position_limit_qty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_notional_value"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => market,
    Symbol("created") => nothing
))

end
"""
fetches all available currencies on an exchange
see: https://docs.cloud.coinbase.com/intx/reference/getassets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Coinbaseinternational; params=Dict())
    currencies = Base.fetch(self.v1PublicGetAssets(params));
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Coinbaseinternational, currency)
    id = safeString(currency, "asset_name");
    code = self.safeCurrencyCode(id);
    statusId = safeString(currency, "status");
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => code,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("info") => currency,
    Symbol("active") => (statusId == "ACTIVE"),
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("networks") => nothing,
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("limits") => self.limits
))

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cloud.coinbase.com/intx/reference/getinstruments

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinbaseinternational; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    instruments = Base.fetch(self.v1PublicGetInstruments(params));
    tickers = Dict{Symbol, Any}();
    rows = [];
    if functions.ccxtruthy(functions.ccxt_isArray(instruments))
        rows = instruments;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        instrument = get(rows, i + 1, nothing);
        marketId = safeString(instrument, "symbol");
        symbol = self.safeSymbol(marketId);
        quote_var = self.safeDict(instrument, "quote", defaultValue = Dict{Symbol, Any}());
        tickers[Symbol(symbol)] = self.parseTicker(quote_var, market = self.safeMarket(marketId = marketId));
        i += 1
    end
    return self.filterByArray(tickers, "symbol", values = symbols, indexed = true)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cloud.coinbase.com/intx/reference/getinstrumentquote

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinbaseinternational, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => self.marketId(symbol)
    );
    ticker = Base.fetch(self.v1PublicGetInstrumentsInstrumentQuote(extend(request, params)));
    return self.parseTicker(ticker, market = market)

end
function parseTicker(self::Coinbaseinternational, ticker; market=nothing)
    datetime = safeString(ticker, "timestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("bid") => self.safeNumber(ticker, "best_bid_price"),
    Symbol("bidVolume") => self.safeNumber(ticker, "best_bid_size"),
    Symbol("ask") => self.safeNumber(ticker, "best_ask_price"),
    Symbol("askVolume") => self.safeNumber(ticker, "best_ask_size"),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => nothing,
    Symbol("last") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("vwap") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => nothing,
    Symbol("previousClose") => nothing,
    Symbol("markPrice") => self.safeNumber(ticker, "mark_price"),
    Symbol("indexPrice") => self.safeNumber(ticker, "index_price")
))

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cloud.coinbase.com/intx/reference/getportfoliobalances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.v3`::bool, optional: default false, set true to use v3 api endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinbaseinternational; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchBalance", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    balances = Base.fetch(self.v1PrivateGetPortfoliosPortfolioBalances(extend(request, params)));
    return self.parseBalance(balances)

end
function parseBalance(self::Coinbaseinternational, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        rawBalance = get(response, i + 1, nothing);
        currencyId = safeString(rawBalance, "asset_name");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(rawBalance, "quantity");
        account[Symbol("used")] = safeString(rawBalance, "hold");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
Transfer an amount of asset from one portfolio to another.
see: https://docs.cloud.coinbase.com/intx/reference/createportfolioassettransfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure}
"""
function transfer(self::Coinbaseinternational, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("from") => fromAccount,
        Symbol("to") => toAccount
    );
    response = Base.fetch(self.v1PrivatePostPortfoliosTransfer(extend(request, params)));
    success = self.safeBool(response, "success");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => functions.ccxtruthy(success) ? "ok" : "failed"
)

end
"""
create a trade order
see: https://docs.cloud.coinbase.com/intx/reference/createorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.postOnly`::bool, optional: true or false
- `params.tif`::string, optional: 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
- `params.expire_time`::string, optional: The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
- `params.stp_mode`::string, optional: Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Coinbaseinternational, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    typeId = uppercase(type_var);
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    clientOrderIdprefix = safeString(self.options, "brokerId", "nfqkvdjp");
    clientOrderId = string(clientOrderIdprefix, "-", uuid());
    clientOrderId = functions.ccxt_slice(clientOrderId, 0, 17);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => clientOrderId,
        Symbol("side") => uppercase(side),
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("size") => self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount)
    );
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(type_var == "limit")
            typeId = "STOP_LIMIT";
        else
            typeId = "STOP";
        end
        request[Symbol("stop_price")] = triggerPrice;
    end
    request[Symbol("type")] = typeId;
    if functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price parameter for a limit order types")));
        end
        request[Symbol("price")] = price;
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("createOrder", params = params));
    if functions.ccxtruthy(portfolio != nothing)
        request[Symbol("portfolio")] = portfolio;
    end
    postOnly = self.safeBool2(params, "postOnly", "post_only");
    tif = safeString2(params, "tif", "timeInForce");
    if functions.ccxtruthy(typeId == "MARKET")
        if functions.ccxtruthy(@functions.ccxt_and(tif != nothing, tif != "IOC"))
            throw(InvalidOrder(string(self.id, " createOrder() market orders must have tif set to \"IOC\"")));
        end
        tif = "IOC";
    else
        tif = functions.ccxtruthy((tif == nothing)) ? "GTC" : tif;
    end
    if functions.ccxtruthy(postOnly != nothing)
        request[Symbol("post_only")] = postOnly;
    end
    request[Symbol("tif")] = tif;
    params = omit(params, ["client_order_id", "user", "postOnly", "timeInForce"]);
    response = Base.fetch(self.v1PrivatePostOrders(extend(request, params)));
    return self.parseOrder(response, market = market)

end
function parseOrder(self::Coinbaseinternational, order; market=nothing)
    marketId = safeString(order, "symbol");
    feeCost = self.safeNumber(order, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost
        );
    end
    datetime = safeString2(order, "submit_time", "event_time");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("type") => self.parseOrderType(safeString(order, "type")),
    Symbol("timeInForce") => safeString(order, "tif"),
    Symbol("postOnly") => nothing,
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => safeString(order, "stop_price"),
    Symbol("amount") => safeString(order, "size"),
    Symbol("filled") => safeString(order, "exec_qty"),
    Symbol("remaining") => safeString(order, "leaves_qty"),
    Symbol("cost") => nothing,
    Symbol("average") => safeString(order, "avg_price"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "order_status")),
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Coinbaseinternational, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIAL_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("REPLACED") => "canceled",
        Symbol("PENDING_CANCEL") => "open",
        Symbol("REJECTED") => "rejected",
        Symbol("PENDING_NEW") => "open",
        Symbol("EXPIRED") => "expired",
        Symbol("PENDING_REPLACE") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Coinbaseinternational, type_var)
    if functions.ccxtruthy(type_var == "UNKNOWN_ORDER_TYPE")
            return nothing
    end
    types = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("STOP") => "limit",
        Symbol("STOP_LIMIT") => "limit"
    );
    return safeString(types, type_var, type_var)

end
"""
cancels an open order
see: https://docs.cloud.coinbase.com/intx/reference/cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinbaseinternational, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("cancelOrder", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    orders = Base.fetch(self.v1PrivateDeleteOrdersId(extend(request, params)));
    return self.parseOrder(orders, market = market)

end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Coinbaseinternational; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("cancelAllOrders", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    market = nothing;
    if functions.ccxtruthy(symbol)
        market = self.market(symbol);
        request[Symbol("instrument")] = get(market, Symbol("id"), nothing);
    end
    orders = Base.fetch(self.v1PrivateDeleteOrders(extend(request, params)));
    return self.parseOrders(orders, market = market)

end
"""
edit a trade order
see: https://docs.cloud.coinbase.com/intx/reference/modifyorder

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string: client order id

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Coinbaseinternational, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("editOrder", params = params));
    if functions.ccxtruthy(portfolio != nothing)
        request[Symbol("portfolio")] = portfolio;
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    triggerPrice = self.safeNumberN(params, ["stopPrice", "stop_price", "triggerPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = triggerPrice;
    end
    clientOrderId = safeString2(params, "client_order_id", "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        throw(BadRequest(string(self.id, " editOrder() requires a clientOrderId parameter")));
    end
    request[Symbol("client_order_id")] = clientOrderId;
    order = Base.fetch(self.v1PrivatePutOrdersId(extend(request, params)));
    return self.parseOrder(order, market = market)

end
"""
fetches information on an order made by the user
see: https://docs.cloud.coinbase.com/intx/reference/modifyorder

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol that the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Coinbaseinternational, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchOrder", params = params));
    request = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("portfolio") => portfolio
    );
    order = Base.fetch(self.v1PrivateGetOrdersId(extend(request, params)));
    return self.parseOrder(order, market = market)

end
"""
fetches information on all currently open orders
see: https://docs.cloud.coinbase.com/intx/reference/getorders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.offset`::int, optional: offset
- `params.event_type`::string, optional: The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Coinbaseinternational; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchOpenOrders", params = params));
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    maxEntriesPerRequest = 100;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "maxEntriesPerRequest", defaultValue = maxEntriesPerRequest);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, pageKey = pageKey, maxEntriesPerRequest = maxEntriesPerRequest))
    end
    page = safeInteger(params, pageKey, 1) - 1;
    offSet = safeInteger2(params, "offset", "result_offset", page * maxEntriesPerRequest);
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("result_offset") => offSet
    );
    market = nothing;
    if functions.ccxtruthy(symbol)
        market = self.market(symbol);
        request[Symbol("instrument")] = symbol;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            throw(BadRequest(string(self.id, " fetchOpenOrders() maximum limit is 100")));
        end
        request[Symbol("result_limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("ref_datetime")] = self.iso8601(since);
    end
    response = Base.fetch(self.v1PrivateGetOrders(extend(request, params)));
    rawOrders = self.safeList(response, "results", defaultValue = []);
    return self.parseOrders(rawOrders, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://docs.cloud.coinbase.com/intx/reference/getmultiportfoliofills

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinbaseinternational; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    pageKey = "ccxtPageKey";
    maxEntriesPerRequest = 100;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchMyTrades", "maxEntriesPerRequest", defaultValue = maxEntriesPerRequest);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, pageKey = pageKey, maxEntriesPerRequest = maxEntriesPerRequest))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    page = safeInteger(params, pageKey, 1) - 1;
    offSet = safeInteger2(params, "offset", "result_offset", page * maxEntriesPerRequest);
    request = Dict{Symbol, Any}(
        Symbol("result_offset") => offSet
    );
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
            throw(BadRequest(string(self.id, " fetchMyTrades() maximum limit is 100. Consider setting paginate to true to fetch more trades.")));
        end
        request[Symbol("result_limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time_from")] = self.iso8601(since);
    end
    until = safeString(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("ref_datetime")] = self.iso8601(until);
    end
    response = Base.fetch(self.v1PrivateGetPortfoliosFills(extend(request, params)));
    trades = self.safeList(response, "results", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
make a withdrawal
see: https://docs.cloud.coinbase.com/intx/reference/withdraw
see: https://docs.cloud.coinbase.com/intx/reference/counterpartywithdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: an optional tag for the withdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.add_network_fee_to_total`::bool, optional: if true, deducts network fee from the portfolio, otherwise deduct fee from the withdrawal
- `params.network_arn_id`::string, optional: Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a)
- `params.nonce`::string, optional: a unique integer representing the withdrawal request

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Coinbaseinternational, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("withdraw", params = params));
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "withdraw", "method", defaultValue = "v1PrivatePostTransfersWithdraw");
    networkId = nothing;
    (networkId, params) = Base.fetch(self.handleNetworkIdAndParams(code, "withdraw", params = params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("type") => "send",
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => amount,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("network_arn_id") => networkId,
        Symbol("nonce") => self.nonce()
    );
    if functions.ccxtruthy(method == nothing)
        throw(ArgumentsRequired(string(self.id, " method is required")));
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function sign(self::Coinbaseinternational, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    version = get(api, 1, nothing);
    signed = get(api, 2, nothing) == "private";
    fullPath = string("/", version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    savedPath = string("/api", fullPath);
    if functions.ccxtruthy(@functions.ccxt_or(method == "GET", method == "DELETE"))
        if functions.ccxtruthy(length(objectKeys(query)))
            fullPath += string("?", self.urlencodeWithArrayRepeat(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), fullPath);
    if functions.ccxtruthy(signed)
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        payload = "";
        if functions.ccxtruthy(method != "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                payload = body;
            end
        end
        auth = string(nonce, method, savedPath, payload);
        signature = self.hmac(self.encode(auth), self.base64ToBinary(self.secret), sha256, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("CB-ACCESS-TIMESTAMP") => nonce,
            Symbol("CB-ACCESS-SIGN") => signature,
            Symbol("CB-ACCESS-PASSPHRASE") => self.password,
            Symbol("CB-ACCESS-KEY") => self.apiKey
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinbaseinternational, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    errMsg = safeString(response, "title");
    if functions.ccxtruthy(errMsg != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errMsg, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errMsg, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinbaseinternational, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetAssets(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetAssetsAssets(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets/{assets}"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetAssetsAssetNetworks(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets/{asset}/networks"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInstruments(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInstrumentsInstrument(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInstrumentsInstrumentQuote(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/quote"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInstrumentsInstrumentFunding(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/funding"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetInstrumentsInstrumentCandles(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/candles"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfolios(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolio(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioDetail(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/detail"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioSummary(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/summary"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioBalances(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/balances"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioBalancesAsset(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/balances/{asset}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioPositions(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/positions"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioPositionsInstrument(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/positions/{instrument}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosFills(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/fills"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetPortfoliosPortfolioFills(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/fills"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetTransfers(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetTransfersTransferUuid(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/{transfer_uuid}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPortfolios(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPortfoliosMargin(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/margin"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPortfoliosTransfer(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostTransfersWithdraw(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/withdraw"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostTransfersAddress(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/address"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostTransfersCreateCounterpartyId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/create-counterparty-id"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostTransfersValidateCounterpartyId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/validate-counterparty-id"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostTransfersWithdrawCounterparty(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/withdraw/counterparty"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutPortfoliosPortfolio(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinbaseinternational(; kwargs...)
    inst = Coinbaseinternational(Exchange(), describe, handlePortfolioAndParams, handleNetworkIdAndParams, fetchAccounts, parseAccount, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, parseFundingRateHistory, parseFundingRate, fetchFundingHistory, parseIncome, fetchTransfers, parseTransfer, parseTransferStatus, createDepositAddress, findDefaultNetwork, loadCurrencyNetworks, parseNetworks, parseNetwork, setMargin, fetchDepositsWithdrawals, fetchPosition, parsePosition, fetchPositions, fetchWithdrawals, fetchDeposits, parseTransactionStatus, parseTransaction, parseTrade, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTickers, fetchTicker, parseTicker, fetchBalance, parseBalance, transfer, createOrder, parseOrder, parseOrderStatus, parseOrderType, cancelOrder, cancelAllOrders, editOrder, fetchOrder, fetchOpenOrders, fetchMyTrades, withdraw, sign, handleErrors, v1PublicGetAssets, v1PublicGetAssetsAssets, v1PublicGetAssetsAssetNetworks, v1PublicGetInstruments, v1PublicGetInstrumentsInstrument, v1PublicGetInstrumentsInstrumentQuote, v1PublicGetInstrumentsInstrumentFunding, v1PublicGetInstrumentsInstrumentCandles, v1PrivateGetOrders, v1PrivateGetOrdersId, v1PrivateGetPortfolios, v1PrivateGetPortfoliosPortfolio, v1PrivateGetPortfoliosPortfolioDetail, v1PrivateGetPortfoliosPortfolioSummary, v1PrivateGetPortfoliosPortfolioBalances, v1PrivateGetPortfoliosPortfolioBalancesAsset, v1PrivateGetPortfoliosPortfolioPositions, v1PrivateGetPortfoliosPortfolioPositionsInstrument, v1PrivateGetPortfoliosFills, v1PrivateGetPortfoliosPortfolioFills, v1PrivateGetTransfers, v1PrivateGetTransfersTransferUuid, v1PrivatePostOrders, v1PrivatePostPortfolios, v1PrivatePostPortfoliosMargin, v1PrivatePostPortfoliosTransfer, v1PrivatePostTransfersWithdraw, v1PrivatePostTransfersAddress, v1PrivatePostTransfersCreateCounterpartyId, v1PrivatePostTransfersValidateCounterpartyId, v1PrivatePostTransfersWithdrawCounterparty, v1PrivatePutOrdersId, v1PrivatePutPortfoliosPortfolio, v1PrivateDeleteOrders, v1PrivateDeleteOrdersId)
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
function __ccxt_doc_Coinbaseinternational_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://docs.cloud.coinbase.com/intx/reference/getportfolios

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Coinbaseinternational_fetchAccounts

function __ccxt_doc_Coinbaseinternational_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cdp.coinbase.com/intx/reference/getinstrumentcandles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, default 100 max 10000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Coinbaseinternational_fetchOHLCV

function __ccxt_doc_Coinbaseinternational_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://docs.cloud.coinbase.com/intx/reference/getinstrumentfunding

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchFundingRateHistory

function __ccxt_doc_Coinbaseinternational_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.cdp.coinbase.com/intx/reference/gettransfers

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchFundingHistory

function __ccxt_doc_Coinbaseinternational_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://docs.cdp.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchTransfers

function __ccxt_doc_Coinbaseinternational_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.cloud.coinbase.com/intx/reference/createaddress
see: https://docs.cloud.coinbase.com/intx/reference/createcounterpartyid

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network_arn_id`::string, optional: Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) if not provided will pick default
- `params.network`::string, optional: unified network code to identify the blockchain network

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinbaseinternational_createDepositAddress

function __ccxt_doc_Coinbaseinternational_setMargin() end
"""
Either adds or reduces margin in order to set the margin to a specific value
see: https://docs.cloud.coinbase.com/intx/reference/setportfoliomarginoverride

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint

# Returns
- A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
"""
__ccxt_doc_Coinbaseinternational_setMargin

function __ccxt_doc_Coinbaseinternational_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://docs.cloud.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchDepositsWithdrawals

function __ccxt_doc_Coinbaseinternational_fetchPosition() end
"""
fetch data on an open position
see: https://docs.cloud.coinbase.com/intx/reference/getportfolioposition

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchPosition

function __ccxt_doc_Coinbaseinternational_fetchPositions() end
"""
fetch all open positions
see: https://docs.cloud.coinbase.com/intx/reference/getportfoliopositions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchPositions

function __ccxt_doc_Coinbaseinternational_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.cloud.coinbase.com/intx/reference/gettransfers

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchWithdrawals

function __ccxt_doc_Coinbaseinternational_fetchDeposits() end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolios`::string, optional: Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
- `params.until`::int, optional: Only find transfers updated before this time. Use timestamp format
- `params.status`::string, optional: The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
- `params.type`::string, optional: The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchDeposits

function __ccxt_doc_Coinbaseinternational_fetchMarkets() end
"""
retrieves data on all markets for coinbaseinternational
see: https://docs.cloud.coinbase.com/intx/reference/getinstruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Coinbaseinternational_fetchMarkets

function __ccxt_doc_Coinbaseinternational_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.cloud.coinbase.com/intx/reference/getassets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Coinbaseinternational_fetchCurrencies

function __ccxt_doc_Coinbaseinternational_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cloud.coinbase.com/intx/reference/getinstruments

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchTickers

function __ccxt_doc_Coinbaseinternational_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cloud.coinbase.com/intx/reference/getinstrumentquote

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchTicker

function __ccxt_doc_Coinbaseinternational_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cloud.coinbase.com/intx/reference/getportfoliobalances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.v3`::bool, optional: default false, set true to use v3 api endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchBalance

function __ccxt_doc_Coinbaseinternational_transfer() end
"""
Transfer an amount of asset from one portfolio to another.
see: https://docs.cloud.coinbase.com/intx/reference/createportfolioassettransfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure}
"""
__ccxt_doc_Coinbaseinternational_transfer

function __ccxt_doc_Coinbaseinternational_createOrder() end
"""
create a trade order
see: https://docs.cloud.coinbase.com/intx/reference/createorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.postOnly`::bool, optional: true or false
- `params.tif`::string, optional: 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
- `params.expire_time`::string, optional: The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
- `params.stp_mode`::string, optional: Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_createOrder

function __ccxt_doc_Coinbaseinternational_cancelOrder() end
"""
cancels an open order
see: https://docs.cloud.coinbase.com/intx/reference/cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_cancelOrder

function __ccxt_doc_Coinbaseinternational_cancelAllOrders() end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_cancelAllOrders

function __ccxt_doc_Coinbaseinternational_editOrder() end
"""
edit a trade order
see: https://docs.cloud.coinbase.com/intx/reference/modifyorder

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string: client order id

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_editOrder

function __ccxt_doc_Coinbaseinternational_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.cloud.coinbase.com/intx/reference/modifyorder

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol that the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchOrder

function __ccxt_doc_Coinbaseinternational_fetchOpenOrders() end
"""
fetches information on all currently open orders
see: https://docs.cloud.coinbase.com/intx/reference/getorders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.offset`::int, optional: offset
- `params.event_type`::string, optional: The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchOpenOrders

function __ccxt_doc_Coinbaseinternational_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.cloud.coinbase.com/intx/reference/getmultiportfoliofills

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinbaseinternational_fetchMyTrades

function __ccxt_doc_Coinbaseinternational_withdraw() end
"""
make a withdrawal
see: https://docs.cloud.coinbase.com/intx/reference/withdraw
see: https://docs.cloud.coinbase.com/intx/reference/counterpartywithdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: an optional tag for the withdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.add_network_fee_to_total`::bool, optional: if true, deducts network fee from the portfolio, otherwise deduct fee from the withdrawal
- `params.network_arn_id`::string, optional: Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a)
- `params.nonce`::string, optional: a unique integer representing the withdrawal request

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbaseinternational_withdraw
