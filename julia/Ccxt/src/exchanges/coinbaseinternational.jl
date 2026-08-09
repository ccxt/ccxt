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
        Symbol("future") => true,
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
                Symbol("get") => ["assets", "assets/{assets}", "assets/{asset}/networks", "instruments", "instruments/{instrument}", "instruments/{instrument}/quote", "instruments/{instrument}/funding", "instruments/{instrument}/candles"]
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => ["orders", "orders/{id}", "portfolios", "portfolios/{portfolio}", "portfolios/{portfolio}/detail", "portfolios/{portfolio}/summary", "portfolios/{portfolio}/balances", "portfolios/{portfolio}/balances/{asset}", "portfolios/{portfolio}/positions", "portfolios/{portfolio}/positions/{instrument}", "portfolios/fills", "portfolios/{portfolio}/fills", "transfers", "transfers/{transfer_uuid}"],
                Symbol("post") => ["orders", "portfolios", "portfolios/margin", "portfolios/transfer", "transfers/withdraw", "transfers/address", "transfers/create-counterparty-id", "transfers/validate-counterparty-id", "transfers/withdraw/counterparty"],
                Symbol("put") => ["orders/{id}", "portfolios/{portfolio}"],
                Symbol("delete") => ["orders", "orders/{id}"]
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
function handlePortfolioAndParams(self::Coinbaseinternational, methodName, params=Dict())
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
        info = self.safeDict(account, "info", Dict{Symbol, Any}());
        if functions.ccxtruthy(self.safeBool(info, "is_default"))
            portfolioId = safeString(info, "portfolio_id");
            self.options[Symbol("portfolio")] = portfolioId;
                return [portfolioId, params]
        end
        i += 1
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a portfolio parameter or set the default portfolio with this.options[\"portfolio\"]")));

end
function handleNetworkIdAndParams(self::Coinbaseinternational, currencyCode, methodName, params=Dict())
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
            networkId = self.networkCodeToId(network, currencyCode);
        end
    end
    return [networkId, params]

end
function fetchAccounts(self::Coinbaseinternational, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivateGetPortfolios(params));
    return self.parseAccounts(response, params)

end
function parseAccount(self::Coinbaseinternational, account)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(account, "portfolio_id", "portfolio_uuid"),
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
function fetchOHLCV(self::Coinbaseinternational, symbol, timeframe="1m", since=nothing, limit=100, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 10000))
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
    candles = self.safeList(response, "aggregations", []);
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Coinbaseinternational, ohlcv, market=nothing)
    return [self.parse8601(safeString2(ohlcv, "start", "time")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchFundingRateHistory(self::Coinbaseinternational, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    maxEntriesPerRequest = nothing;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "maxEntriesPerRequest", 100);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingRateHistory", symbol, since, limit, params, pageKey, maxEntriesPerRequest))
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
    rawRates = self.safeList(response, "results", []);
    return self.parseFundingRateHistories(rawRates, market, since, limit)

end
function parseFundingRateHistory(self::Coinbaseinternational, info, market=nothing)
    return self.parseFundingRate(info, market)

end
function parseFundingRate(self::Coinbaseinternational, contract, market=nothing)
    fundingDatetime = safeString2(contract, "event_time", "time");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market),
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
function fetchFundingHistory(self::Coinbaseinternational, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    fundings = self.safeList(response, "results", []);
    return self.parseIncomes(fundings, market, since, limit)

end
function parseIncome(self::Coinbaseinternational, income, market=nothing)
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId, market, nothing, "contract");
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
function fetchTransfers(self::Coinbaseinternational, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    transfers = self.safeList(response, "results", []);
    return self.parseTransfers(transfers, currency, since, limit)

end
function parseTransfer(self::Coinbaseinternational, transfer, currency=nothing)
    datetime = safeInteger(transfer, "created_at");
    timestamp = self.parse8601(datetime);
    currencyId = safeString(transfer, "asset");
    code = self.safeCurrencyCode(currencyId);
    fromPorfolio = self.safeDict(transfer, "from_portfolio", Dict{Symbol, Any}());
    fromId = safeString(fromPorfolio, "id");
    toPorfolio = self.safeDict(transfer, "to_portfolio", Dict{Symbol, Any}());
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
function createDepositAddress(self::Coinbaseinternational, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createDepositAddress", "method", "v1PrivatePostTransfersAddress");
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("createDepositAddress", params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    if functions.ccxtruthy(method == "v1PrivatePostTransfersAddress")
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
        networkId = nothing;
        (networkId, params) = Base.fetch(self.handleNetworkIdAndParams(code, "createDepositAddress", params));
        request[Symbol("network_arn_id")] = networkId;
    end
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
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
        is_default = self.safeBool(info, "is_default", false);
        if functions.ccxtruthy(is_default)
                return get(networksArray, i + 1, nothing)
        end
        i += 1
    end
    return get(networksArray, 1, nothing)

end
function loadCurrencyNetworks(self::Coinbaseinternational, code, params=Dict())
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
function parseNetworks(self::Coinbaseinternational, networks, params=Dict())
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(networks)))
        network = extend(self.parseNetwork(get(networks, i + 1, nothing)), params);
        result[Symbol(network[Symbol("network")])] = network;
        i += 1
    end
    return result

end
function parseNetwork(self::Coinbaseinternational, network, params=Dict())
    currencyId = safeString(network, "asset_name");
    currencyCode = self.safeCurrencyCode(currencyId);
    networkId = safeString(network, "network_arn_id");
    networkIdForCode = safeStringN(network, ["network_name", "display_name", "network_arn_id"], "");
    return self.safeNetwork(Dict{Symbol, Any}(
    Symbol("info") => network,
    Symbol("id") => networkId,
    Symbol("name") => safeString(network, "display_name"),
    Symbol("network") => self.networkIdToCode(networkIdForCode, currencyCode),
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
function setMargin(self::Coinbaseinternational, symbol, amount, params=Dict())
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("setMargin", params));
    if functions.ccxtruthy(symbol != nothing)
        throw(BadRequest(string(self.id, " setMargin() only allows setting margin to full portfolio")));
    end
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("margin_override") => amount
    );
    return Base.fetch(self.v1PrivatePostPortfoliosMargin(extend(request, params)))

end
function fetchDepositsWithdrawals(self::Coinbaseinternational, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = nothing;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "paginate");
    maxEntriesPerRequest = nothing;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchDepositsWithdrawals", "maxEntriesPerRequest", 100);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchDepositsWithdrawals", code, since, limit, params, pageKey, maxEntriesPerRequest))
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
    rawTransactions = self.safeList(response, "results", []);
    return self.parseTransactions(rawTransactions)

end
function fetchPosition(self::Coinbaseinternational, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = self.symbol(symbol);
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchPosition", params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("instrument") => self.marketId(symbol)
    );
    position = Base.fetch(self.v1PrivateGetPortfoliosPortfolioPositionsInstrument(extend(request, params)));
    return self.parsePosition(position)

end
function parsePosition(self::Coinbaseinternational, position, market=nothing)
    marketId = safeString(position, "symbol");
    quantity = safeString(position, "net_size");
    market = self.safeMarket(marketId, market, "-");
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
function fetchPositions(self::Coinbaseinternational, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchPositions", params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    response = Base.fetch(self.v1PrivateGetPortfoliosPortfolioPositions(extend(request, params)));
    positions = self.parsePositions(response);
    if functions.ccxtruthy(isEmpty(symbols))
            return positions
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArrayPositions(positions, "symbol", symbols, false)

end
function fetchWithdrawals(self::Coinbaseinternational, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params[Symbol("type")] = "WITHDRAW";
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, params))

end
function fetchDeposits(self::Coinbaseinternational, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params[Symbol("type")] = "DEPOSIT";
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, params))

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
function parseTransaction(self::Coinbaseinternational, transaction, currency=nothing)
    datetime = safeString(transaction, "updated_at");
    fromPorfolio = self.safeDict(transaction, "from_portfolio", Dict{Symbol, Any}());
    addressFrom = safeStringN(transaction, ["from_address", "from_cb_account", safeStringN(fromPorfolio, ["id", "uuid", "name"]), "from_counterparty_id"]);
    toPorfolio = self.safeDict(transaction, "from_portfolio", Dict{Symbol, Any}());
    addressTo = safeStringN(transaction, ["to_address", "to_cb_account", safeStringN(toPorfolio, ["id", "uuid", "name"]), "to_counterparty_id"]);
    code = safeString(currency, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "transfer_uuid"),
    Symbol("txid") => safeString(transaction, "transaction_uuid"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("network") => self.networkIdToCode(safeString(transaction, "network_name"), code),
    Symbol("address") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => safeString(transaction, "resource"),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => self.safeCurrencyCode(safeString(transaction, "asset"), currency),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => self.parse8601(datetime),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => nothing,
        Symbol("currency") => nothing
    )
)

end
function parseTrade(self::Coinbaseinternational, trade, market=nothing)
    marketId = safeString(trade, "symbol");
    datetime = safeString(trade, "event_time");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "fill_id", "exec_id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchMarkets(self::Coinbaseinternational, params=Dict())
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
    return Dict{Symbol, Any}(
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
)

end
function fetchCurrencies(self::Coinbaseinternational, params=Dict())
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
function fetchTickers(self::Coinbaseinternational, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    instruments = Base.fetch(self.v1PublicGetInstruments(params));
    tickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(instruments)))
        instrument = get(instruments, i + 1, nothing);
        marketId = safeString(instrument, "symbol");
        symbol = self.safeSymbol(marketId);
        quote_var = self.safeDict(instrument, "quote", Dict{Symbol, Any}());
        tickers[Symbol(symbol)] = self.parseTicker(quote_var, self.safeMarket(marketId));
        i += 1
    end
    return self.filterByArray(tickers, "symbol", symbols, true)

end
function fetchTicker(self::Coinbaseinternational, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => self.marketId(symbol)
    );
    ticker = Base.fetch(self.v1PublicGetInstrumentsInstrumentQuote(extend(request, params)));
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Coinbaseinternational, ticker, market=nothing)
    datetime = safeString(ticker, "timestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => self.safeSymbol(nothing, market),
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
function fetchBalance(self::Coinbaseinternational, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchBalance", params));
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
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function transfer(self::Coinbaseinternational, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("ammount") => amount,
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
function createOrder(self::Coinbaseinternational, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    typeId = uppercase(type_var);
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "stop_price"]);
    clientOrderIdprefix = safeString(self.options, "brokerId", "nfqkvdjp");
    clientOrderId = string(clientOrderIdprefix, "-", uuid());
    clientOrderId = clientOrderId[0 + 1:17];
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
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("createOrder", params));
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
    return self.parseOrder(response, market)

end
function parseOrder(self::Coinbaseinternational, order, market=nothing)
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
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
), market)

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
function cancelOrder(self::Coinbaseinternational, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("cancelOrder", params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio,
        Symbol("id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    orders = Base.fetch(self.v1PrivateDeleteOrdersId(extend(request, params)));
    return self.parseOrder(orders, market)

end
function cancelAllOrders(self::Coinbaseinternational, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("cancelAllOrders", params));
    request = Dict{Symbol, Any}(
        Symbol("portfolio") => portfolio
    );
    market = nothing;
    if functions.ccxtruthy(symbol)
        market = self.market(symbol);
        request[Symbol("instrument")] = get(market, Symbol("id"), nothing);
    end
    orders = Base.fetch(self.v1PrivateDeleteOrders(extend(request, params)));
    return self.parseOrders(orders, market)

end
function editOrder(self::Coinbaseinternational, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("editOrder", params));
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
    return self.parseOrder(order, market)

end
function fetchOrder(self::Coinbaseinternational, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchOrder", params));
    request = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("portfolio") => portfolio
    );
    order = Base.fetch(self.v1PrivateGetOrdersId(extend(request, params)));
    return self.parseOrder(order, market)

end
function fetchOpenOrders(self::Coinbaseinternational, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("fetchOpenOrders", params));
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    maxEntriesPerRequest = nothing;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "maxEntriesPerRequest", 100);
    pageKey = "ccxtPageKey";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchOpenOrders", symbol, since, limit, params, pageKey, maxEntriesPerRequest))
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
    rawOrders = self.safeList(response, "results", []);
    return self.parseOrders(rawOrders, market, since, limit)

end
function fetchMyTrades(self::Coinbaseinternational, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    pageKey = "ccxtPageKey";
    maxEntriesPerRequest = nothing;
    (maxEntriesPerRequest, params) = self.handleOptionAndParams(params, "fetchMyTrades", "maxEntriesPerRequest", 100);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchMyTrades", symbol, since, limit, params, pageKey, maxEntriesPerRequest))
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
    until = safeStringN(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("ref_datetime")] = self.iso8601(until);
    end
    response = Base.fetch(self.v1PrivateGetPortfoliosFills(extend(request, params)));
    trades = self.safeList(response, "results", []);
    return self.parseTrades(trades, market, since, limit)

end
function withdraw(self::Coinbaseinternational, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    portfolio = nothing;
    (portfolio, params) = Base.fetch(self.handlePortfolioAndParams("withdraw", params));
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "withdraw", "method", "v1PrivatePostTransfersWithdraw");
    networkId = nothing;
    (networkId, params) = Base.fetch(self.handleNetworkIdAndParams(code, "withdraw", params));
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
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
    return self.parseTransaction(response, currency)

end
function sign(self::Coinbaseinternational, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinbaseinternational, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetAssets(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetAssetsAssets(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets/{assets}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetAssetsAssetNetworks(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "assets/{asset}/networks", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInstruments(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInstrumentsInstrument(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInstrumentsInstrumentQuote(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/quote", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInstrumentsInstrumentFunding(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/funding", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInstrumentsInstrumentCandles(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "instruments/{instrument}/candles", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfolios(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolio(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioDetail(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/detail", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioSummary(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/summary", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioBalances(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/balances", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioBalancesAsset(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/balances/{asset}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioPositions(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/positions", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioPositionsInstrument(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/positions/{instrument}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosFills(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/fills", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPortfoliosPortfolioFills(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}/fills", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetTransfers(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetTransfersTransferUuid(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/{transfer_uuid}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivatePostOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostPortfolios(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostPortfoliosMargin(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/margin", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostPortfoliosTransfer(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/transfer", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostTransfersWithdraw(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/withdraw", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostTransfersAddress(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/address", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostTransfersCreateCounterpartyId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/create-counterparty-id", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostTransfersValidateCounterpartyId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/validate-counterparty-id", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostTransfersWithdrawCounterparty(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "transfers/withdraw/counterparty", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePutOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}", ["v1", "private"], "PUT", params, nothing, nothing, Dict())
end

function v1PrivatePutPortfoliosPortfolio(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "portfolios/{portfolio}", ["v1", "private"], "PUT", params, nothing, nothing, Dict())
end

function v1PrivateDeleteOrders(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v1PrivateDeleteOrdersId(self::Coinbaseinternational, params=Dict(), context=Dict())
    return request(self, "orders/{id}", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function Coinbaseinternational(; kwargs...)
    inst = Coinbaseinternational(Exchange(), describe, handlePortfolioAndParams, handleNetworkIdAndParams, fetchAccounts, parseAccount, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, parseFundingRateHistory, parseFundingRate, fetchFundingHistory, parseIncome, fetchTransfers, parseTransfer, parseTransferStatus, createDepositAddress, findDefaultNetwork, loadCurrencyNetworks, parseNetworks, parseNetwork, setMargin, fetchDepositsWithdrawals, fetchPosition, parsePosition, fetchPositions, fetchWithdrawals, fetchDeposits, parseTransactionStatus, parseTransaction, parseTrade, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTickers, fetchTicker, parseTicker, fetchBalance, parseBalance, transfer, createOrder, parseOrder, parseOrderStatus, parseOrderType, cancelOrder, cancelAllOrders, editOrder, fetchOrder, fetchOpenOrders, fetchMyTrades, withdraw, sign, handleErrors, v1PublicGetAssets, v1PublicGetAssetsAssets, v1PublicGetAssetsAssetNetworks, v1PublicGetInstruments, v1PublicGetInstrumentsInstrument, v1PublicGetInstrumentsInstrumentQuote, v1PublicGetInstrumentsInstrumentFunding, v1PublicGetInstrumentsInstrumentCandles, v1PrivateGetOrders, v1PrivateGetOrdersId, v1PrivateGetPortfolios, v1PrivateGetPortfoliosPortfolio, v1PrivateGetPortfoliosPortfolioDetail, v1PrivateGetPortfoliosPortfolioSummary, v1PrivateGetPortfoliosPortfolioBalances, v1PrivateGetPortfoliosPortfolioBalancesAsset, v1PrivateGetPortfoliosPortfolioPositions, v1PrivateGetPortfoliosPortfolioPositionsInstrument, v1PrivateGetPortfoliosFills, v1PrivateGetPortfoliosPortfolioFills, v1PrivateGetTransfers, v1PrivateGetTransfersTransferUuid, v1PrivatePostOrders, v1PrivatePostPortfolios, v1PrivatePostPortfoliosMargin, v1PrivatePostPortfoliosTransfer, v1PrivatePostTransfersWithdraw, v1PrivatePostTransfersAddress, v1PrivatePostTransfersCreateCounterpartyId, v1PrivatePostTransfersValidateCounterpartyId, v1PrivatePostTransfersWithdrawCounterparty, v1PrivatePutOrdersId, v1PrivatePutPortfoliosPortfolio, v1PrivateDeleteOrders, v1PrivateDeleteOrdersId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
