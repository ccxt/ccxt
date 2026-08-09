@kwdef mutable struct Alpaca <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTrades::Function = fetchTrades
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    generateClientOrderId::Function = generateClientOrderId
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    editOrder::Function = editOrder
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    withdraw::Function = withdraw
    fetchTransactionsHelper::Function = fetchTransactionsHelper
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    traderPrivateGetV2Account::Function = traderPrivateGetV2Account
    traderPrivateGetV2Orders::Function = traderPrivateGetV2Orders
    traderPrivateGetV2OrdersOrderId::Function = traderPrivateGetV2OrdersOrderId
    traderPrivateGetV2Positions::Function = traderPrivateGetV2Positions
    traderPrivateGetV2PositionsSymbolOrAssetId::Function = traderPrivateGetV2PositionsSymbolOrAssetId
    traderPrivateGetV2AccountPortfolioHistory::Function = traderPrivateGetV2AccountPortfolioHistory
    traderPrivateGetV2Watchlists::Function = traderPrivateGetV2Watchlists
    traderPrivateGetV2WatchlistsWatchlistId::Function = traderPrivateGetV2WatchlistsWatchlistId
    traderPrivateGetV2WatchlistsByName::Function = traderPrivateGetV2WatchlistsByName
    traderPrivateGetV2AccountConfigurations::Function = traderPrivateGetV2AccountConfigurations
    traderPrivateGetV2AccountActivities::Function = traderPrivateGetV2AccountActivities
    traderPrivateGetV2AccountActivitiesActivityType::Function = traderPrivateGetV2AccountActivitiesActivityType
    traderPrivateGetV2Calendar::Function = traderPrivateGetV2Calendar
    traderPrivateGetV2Clock::Function = traderPrivateGetV2Clock
    traderPrivateGetV2Assets::Function = traderPrivateGetV2Assets
    traderPrivateGetV2AssetsSymbolOrAssetId::Function = traderPrivateGetV2AssetsSymbolOrAssetId
    traderPrivateGetV2CorporateActionsAnnouncementsId::Function = traderPrivateGetV2CorporateActionsAnnouncementsId
    traderPrivateGetV2CorporateActionsAnnouncements::Function = traderPrivateGetV2CorporateActionsAnnouncements
    traderPrivateGetV2Wallets::Function = traderPrivateGetV2Wallets
    traderPrivateGetV2WalletsTransfers::Function = traderPrivateGetV2WalletsTransfers
    traderPrivatePostV2Orders::Function = traderPrivatePostV2Orders
    traderPrivatePostV2Watchlists::Function = traderPrivatePostV2Watchlists
    traderPrivatePostV2WatchlistsWatchlistId::Function = traderPrivatePostV2WatchlistsWatchlistId
    traderPrivatePostV2WatchlistsByName::Function = traderPrivatePostV2WatchlistsByName
    traderPrivatePostV2WalletsTransfers::Function = traderPrivatePostV2WalletsTransfers
    traderPrivatePutV2OrdersOrderId::Function = traderPrivatePutV2OrdersOrderId
    traderPrivatePutV2WatchlistsWatchlistId::Function = traderPrivatePutV2WatchlistsWatchlistId
    traderPrivatePutV2WatchlistsByName::Function = traderPrivatePutV2WatchlistsByName
    traderPrivatePatchV2OrdersOrderId::Function = traderPrivatePatchV2OrdersOrderId
    traderPrivatePatchV2AccountConfigurations::Function = traderPrivatePatchV2AccountConfigurations
    traderPrivateDeleteV2Orders::Function = traderPrivateDeleteV2Orders
    traderPrivateDeleteV2OrdersOrderId::Function = traderPrivateDeleteV2OrdersOrderId
    traderPrivateDeleteV2Positions::Function = traderPrivateDeleteV2Positions
    traderPrivateDeleteV2PositionsSymbolOrAssetId::Function = traderPrivateDeleteV2PositionsSymbolOrAssetId
    traderPrivateDeleteV2WatchlistsWatchlistId::Function = traderPrivateDeleteV2WatchlistsWatchlistId
    traderPrivateDeleteV2WatchlistsByName::Function = traderPrivateDeleteV2WatchlistsByName
    traderPrivateDeleteV2WatchlistsWatchlistIdSymbol::Function = traderPrivateDeleteV2WatchlistsWatchlistIdSymbol
    marketPublicGetV1beta3CryptoLocBars::Function = marketPublicGetV1beta3CryptoLocBars
    marketPublicGetV1beta3CryptoLocLatestBars::Function = marketPublicGetV1beta3CryptoLocLatestBars
    marketPublicGetV1beta3CryptoLocLatestOrderbooks::Function = marketPublicGetV1beta3CryptoLocLatestOrderbooks
    marketPublicGetV1beta3CryptoLocLatestQuotes::Function = marketPublicGetV1beta3CryptoLocLatestQuotes
    marketPublicGetV1beta3CryptoLocLatestTrades::Function = marketPublicGetV1beta3CryptoLocLatestTrades
    marketPublicGetV1beta3CryptoLocQuotes::Function = marketPublicGetV1beta3CryptoLocQuotes
    marketPublicGetV1beta3CryptoLocSnapshots::Function = marketPublicGetV1beta3CryptoLocSnapshots
    marketPublicGetV1beta3CryptoLocTrades::Function = marketPublicGetV1beta3CryptoLocTrades
    marketPrivateGetV1beta1CorporateActions::Function = marketPrivateGetV1beta1CorporateActions
    marketPrivateGetV1beta1ForexLatestRates::Function = marketPrivateGetV1beta1ForexLatestRates
    marketPrivateGetV1beta1ForexRates::Function = marketPrivateGetV1beta1ForexRates
    marketPrivateGetV1beta1LogosSymbol::Function = marketPrivateGetV1beta1LogosSymbol
    marketPrivateGetV1beta1News::Function = marketPrivateGetV1beta1News
    marketPrivateGetV1beta1ScreenerStocksMostActives::Function = marketPrivateGetV1beta1ScreenerStocksMostActives
    marketPrivateGetV1beta1ScreenerMarketTypeMovers::Function = marketPrivateGetV1beta1ScreenerMarketTypeMovers
    marketPrivateGetV2StocksAuctions::Function = marketPrivateGetV2StocksAuctions
    marketPrivateGetV2StocksBars::Function = marketPrivateGetV2StocksBars
    marketPrivateGetV2StocksBarsLatest::Function = marketPrivateGetV2StocksBarsLatest
    marketPrivateGetV2StocksMetaConditionsTicktype::Function = marketPrivateGetV2StocksMetaConditionsTicktype
    marketPrivateGetV2StocksMetaExchanges::Function = marketPrivateGetV2StocksMetaExchanges
    marketPrivateGetV2StocksQuotes::Function = marketPrivateGetV2StocksQuotes
    marketPrivateGetV2StocksQuotesLatest::Function = marketPrivateGetV2StocksQuotesLatest
    marketPrivateGetV2StocksSnapshots::Function = marketPrivateGetV2StocksSnapshots
    marketPrivateGetV2StocksTrades::Function = marketPrivateGetV2StocksTrades
    marketPrivateGetV2StocksTradesLatest::Function = marketPrivateGetV2StocksTradesLatest
    marketPrivateGetV2StocksSymbolAuctions::Function = marketPrivateGetV2StocksSymbolAuctions
    marketPrivateGetV2StocksSymbolBars::Function = marketPrivateGetV2StocksSymbolBars
    marketPrivateGetV2StocksSymbolBarsLatest::Function = marketPrivateGetV2StocksSymbolBarsLatest
    marketPrivateGetV2StocksSymbolQuotes::Function = marketPrivateGetV2StocksSymbolQuotes
    marketPrivateGetV2StocksSymbolQuotesLatest::Function = marketPrivateGetV2StocksSymbolQuotesLatest
    marketPrivateGetV2StocksSymbolSnapshot::Function = marketPrivateGetV2StocksSymbolSnapshot
    marketPrivateGetV2StocksSymbolTrades::Function = marketPrivateGetV2StocksSymbolTrades
    marketPrivateGetV2StocksSymbolTradesLatest::Function = marketPrivateGetV2StocksSymbolTradesLatest

end
function describe(self::Alpaca, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "alpaca",
    Symbol("name") => "Alpaca",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 333,
    Symbol("hostname") => "alpaca.markets",
    Symbol("pro") => true,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/e9476df8-a450-4c3e-ab9a-1a7794219e1b",
        Symbol("www") => "https://alpaca.markets",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("broker") => "https://broker-api.{hostname}",
            Symbol("trader") => "https://api.{hostname}",
            Symbol("market") => "https://data.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("broker") => "https://broker-api.sandbox.{hostname}",
            Symbol("trader") => "https://paper-api.{hostname}",
            Symbol("market") => "https://data.{hostname}"
        ),
        Symbol("doc") => "https://alpaca.markets/docs/",
        Symbol("fees") => "https://docs.alpaca.markets/docs/crypto-fees"
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
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
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
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
        Symbol("fetchL1OrderBook") => true,
        Symbol("fetchL2OrderBook") => false,
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
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
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
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("broker") => Dict{Symbol, Any}(),
        Symbol("trader") => Dict{Symbol, Any}(
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => ["v2/account", "v2/orders", "v2/orders/{order_id}", "v2/positions", "v2/positions/{symbol_or_asset_id}", "v2/account/portfolio/history", "v2/watchlists", "v2/watchlists/{watchlist_id}", "v2/watchlists:by_name", "v2/account/configurations", "v2/account/activities", "v2/account/activities/{activity_type}", "v2/calendar", "v2/clock", "v2/assets", "v2/assets/{symbol_or_asset_id}", "v2/corporate_actions/announcements/{id}", "v2/corporate_actions/announcements", "v2/wallets", "v2/wallets/transfers"],
                Symbol("post") => ["v2/orders", "v2/watchlists", "v2/watchlists/{watchlist_id}", "v2/watchlists:by_name", "v2/wallets/transfers"],
                Symbol("put") => ["v2/orders/{order_id}", "v2/watchlists/{watchlist_id}", "v2/watchlists:by_name"],
                Symbol("patch") => ["v2/orders/{order_id}", "v2/account/configurations"],
                Symbol("delete") => ["v2/orders", "v2/orders/{order_id}", "v2/positions", "v2/positions/{symbol_or_asset_id}", "v2/watchlists/{watchlist_id}", "v2/watchlists:by_name", "v2/watchlists/{watchlist_id}/{symbol}"]
            )
        ),
        Symbol("market") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => ["v1beta3/crypto/{loc}/bars", "v1beta3/crypto/{loc}/latest/bars", "v1beta3/crypto/{loc}/latest/orderbooks", "v1beta3/crypto/{loc}/latest/quotes", "v1beta3/crypto/{loc}/latest/trades", "v1beta3/crypto/{loc}/quotes", "v1beta3/crypto/{loc}/snapshots", "v1beta3/crypto/{loc}/trades"]
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => ["v1beta1/corporate-actions", "v1beta1/forex/latest/rates", "v1beta1/forex/rates", "v1beta1/logos/{symbol}", "v1beta1/news", "v1beta1/screener/stocks/most-actives", "v1beta1/screener/{market_type}/movers", "v2/stocks/auctions", "v2/stocks/bars", "v2/stocks/bars/latest", "v2/stocks/meta/conditions/{ticktype}", "v2/stocks/meta/exchanges", "v2/stocks/quotes", "v2/stocks/quotes/latest", "v2/stocks/snapshots", "v2/stocks/trades", "v2/stocks/trades/latest", "v2/stocks/{symbol}/auctions", "v2/stocks/{symbol}/bars", "v2/stocks/{symbol}/bars/latest", "v2/stocks/{symbol}/quotes", "v2/stocks/{symbol}/quotes/latest", "v2/stocks/{symbol}/snapshot", "v2/stocks/{symbol}/trades", "v2/stocks/{symbol}/trades/latest"]
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("3m") => "3min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "1H",
        Symbol("2h") => "2H",
        Symbol("4h") => "4H",
        Symbol("6h") => "6H",
        Symbol("8h") => "8H",
        Symbol("12h") => "12H",
        Symbol("1d") => "1D",
        Symbol("3d") => "3D",
        Symbol("1w") => "1W",
        Symbol("1M") => "1M"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0015"),
            Symbol("taker") => self.parseNumber("0.0025"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0025")], [self.parseNumber("100000"), self.parseNumber("0.0022")], [self.parseNumber("500000"), self.parseNumber("0.0020")], [self.parseNumber("1000000"), self.parseNumber("0.0018")], [self.parseNumber("10000000"), self.parseNumber("0.0015")], [self.parseNumber("25000000"), self.parseNumber("0.0013")], [self.parseNumber("50000000"), self.parseNumber("0.0012")], [self.parseNumber("100000000"), self.parseNumber("0.001")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0015")], [self.parseNumber("100000"), self.parseNumber("0.0012")], [self.parseNumber("500000"), self.parseNumber("0.001")], [self.parseNumber("1000000"), self.parseNumber("0.0008")], [self.parseNumber("10000000"), self.parseNumber("0.0005")], [self.parseNumber("25000000"), self.parseNumber("0.0002")], [self.parseNumber("50000000"), self.parseNumber("0.0002")], [self.parseNumber("100000000"), self.parseNumber("0.00")]]
            )
        )
    ),
    Symbol("headers") => Dict{Symbol, Any}(
        Symbol("APCA-PARTNER-ID") => "ccxt"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultExchange") => "CBSE",
        Symbol("exchanges") => ["CBSE", "FTX", "GNSS", "ERSX"],
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("timeInForce") => "gtc"
        ),
        Symbol("clientOrderId") => "ccxt_{id}"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => true,
                        Symbol("mark") => true,
                        Symbol("index") => true
                    ),
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => true,
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
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
                Symbol("limit") => 500,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
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
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("forbidden.") => PermissionDenied,
            Symbol("40410000") => InvalidOrder,
            Symbol("40010001") => BadRequest,
            Symbol("40110000") => PermissionDenied,
            Symbol("40310000") => InsufficientFunds,
            Symbol("42910000") => RateLimitExceeded
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Invalid format for parameter") => BadRequest,
            Symbol("Invalid symbol") => BadSymbol
        )
    )
))

end
function fetchTime(self::Alpaca, params=Dict())
    response = self.traderPrivateGetV2Clock(params);
    timestamp = safeString(response, "timestamp");
    localTime = timestamp[0 + 1:23];
    jetlagStrStart = length(timestamp) - 6;
    jetlagStrEnd = length(timestamp) - 3;
    jetlag = timestamp[jetlagStrStart + 1:jetlagStrEnd];
    iso = self.parseToInt(self.parse8601(localTime)) - self.parseToNumeric(jetlag) * 3600 * 1000;
    return iso

end
function fetchMarkets(self::Alpaca, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("asset_class") => "crypto",
        Symbol("status") => "active"
    );
    assets = self.traderPrivateGetV2Assets(extend(request, params));
    return self.parseMarkets(assets)

end
function parseMarket(self::Alpaca, asset)
    marketId = safeString(asset, "symbol");
    parts = split(marketId, "/");
    assetClass = safeString(asset, "class");
    baseId = safeString(parts, 0);
    quoteId = safeString(parts, 1);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    if functions.ccxtruthy(@functions.ccxt_and(quote_var == nothing, assetClass == "us_equity"))
        quote_var = "USD";
    end
    symbol = string(base, "/", quote_var);
    status = safeString(asset, "status");
    active = (status == "active");
    minAmount = self.safeNumber(asset, "min_order_size");
    amount = self.safeNumber(asset, "min_trade_increment");
    price = self.safeNumber(asset, "price_increment");
    return Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => nothing,
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
        Symbol("amount") => amount,
        Symbol("price") => price
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
    Symbol("info") => asset
)

end
function fetchTrades(self::Alpaca, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    marketId = get(market, Symbol("id"), nothing);
    loc = safeString(params, "loc", "us");
    method = safeString(params, "method", "marketPublicGetV1beta3CryptoLocTrades");
    request = Dict{Symbol, Any}(
        Symbol("symbols") => marketId,
        Symbol("loc") => loc
    );
    params = omit(params, ["loc", "method"]);
    symbolTrades = nothing;
    if functions.ccxtruthy(method == "marketPublicGetV1beta3CryptoLocTrades")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start")] = self.iso8601(since);
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = self.marketPublicGetV1beta3CryptoLocTrades(extend(request, params));
        trades = self.safeDict(response, "trades", Dict{Symbol, Any}());
        symbolTrades = self.safeList(trades, marketId, []);
    elseif functions.ccxtruthy(method == "marketPublicGetV1beta3CryptoLocLatestTrades")
        response = self.marketPublicGetV1beta3CryptoLocLatestTrades(extend(request, params));
        trades = self.safeDict(response, "trades", Dict{Symbol, Any}());
        symbolTrades = self.safeDict(trades, marketId, Dict{Symbol, Any}());
        symbolTrades = [symbolTrades];
    else
        throw(NotSupported(string(self.id, " fetchTrades() does not support ", method, ", marketPublicGetV1beta3CryptoLocTrades and marketPublicGetV1beta3CryptoLocLatestTrades are supported")));
    end
    return self.parseTrades(symbolTrades, market, since, limit)

end
function fetchOrderBook(self::Alpaca, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    id = get(market, Symbol("id"), nothing);
    loc = safeString(params, "loc", "us");
    request = Dict{Symbol, Any}(
        Symbol("symbols") => id,
        Symbol("loc") => loc
    );
    response = self.marketPublicGetV1beta3CryptoLocLatestOrderbooks(extend(request, params));
    orderbooks = self.safeDict(response, "orderbooks", Dict{Symbol, Any}());
    rawOrderbook = self.safeDict(orderbooks, id, Dict{Symbol, Any}());
    timestamp = self.parse8601(safeString(rawOrderbook, "t"));
    return self.parseOrderBook(rawOrderbook, get(market, Symbol("symbol"), nothing), timestamp, "b", "a", "p", "s")

end
function fetchOHLCV(self::Alpaca, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    marketId = get(market, Symbol("id"), nothing);
    loc = safeString(params, "loc", "us");
    method = safeString(params, "method", "marketPublicGetV1beta3CryptoLocBars");
    request = Dict{Symbol, Any}(
        Symbol("symbols") => marketId,
        Symbol("loc") => loc
    );
    params = omit(params, ["loc", "method"]);
    ohlcvs = nothing;
    if functions.ccxtruthy(method == "marketPublicGetV1beta3CryptoLocBars")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start")] = self.yyyymmdd(since);
        end
        request[Symbol("timeframe")] = safeString(self.timeframes, timeframe, timeframe);
        response = self.marketPublicGetV1beta3CryptoLocBars(extend(request, params));
        bars = self.safeDict(response, "bars", Dict{Symbol, Any}());
        ohlcvs = self.safeList(bars, marketId, []);
    elseif functions.ccxtruthy(method == "marketPublicGetV1beta3CryptoLocLatestBars")
        response = self.marketPublicGetV1beta3CryptoLocLatestBars(extend(request, params));
        bars = self.safeDict(response, "bars", Dict{Symbol, Any}());
        ohlcvs = self.safeDict(bars, marketId, Dict{Symbol, Any}());
        ohlcvs = [ohlcvs];
    else
        throw(NotSupported(string(self.id, " fetchOHLCV() does not support ", method, ", marketPublicGetV1beta3CryptoLocBars and marketPublicGetV1beta3CryptoLocLatestBars are supported")));
    end
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Alpaca, ohlcv, market=nothing)
    datetime = safeString(ohlcv, "t");
    timestamp = self.parse8601(datetime);
    return [timestamp, self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
function fetchTicker(self::Alpaca, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    symbol = self.symbol(symbol);
    tickers = self.fetchTickers([symbol], params);
    return self.safeDict(tickers, symbol)

end
function fetchTickers(self::Alpaca, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTickers() requires a symbols argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    symbols = self.marketSymbols(symbols);
    loc = safeString(params, "loc", "us");
    ids = self.marketIds(symbols);
    request = Dict{Symbol, Any}(
        Symbol("symbols") => join(ids, ","),
        Symbol("loc") => loc
    );
    params = omit(params, "loc");
    response = self.marketPublicGetV1beta3CryptoLocSnapshots(extend(request, params));
    results = [];
    snapshots = self.safeDict(response, "snapshots", Dict{Symbol, Any}());
    marketIds = objectKeys(snapshots);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = self.safeMarket(marketId);
        entry = self.safeDict(snapshots, marketId);
        dailyBar = self.safeDict(entry, "dailyBar", Dict{Symbol, Any}());
        prevDailyBar = self.safeDict(entry, "prevDailyBar", Dict{Symbol, Any}());
        latestQuote = self.safeDict(entry, "latestQuote", Dict{Symbol, Any}());
        latestTrade = self.safeDict(entry, "latestTrade", Dict{Symbol, Any}());
        datetime = safeString(latestQuote, "t");
        ticker = self.safeTicker(Dict{Symbol, Any}(
            Symbol("info") => entry,
            Symbol("symbol") => get(market, Symbol("symbol"), nothing),
            Symbol("timestamp") => self.parse8601(datetime),
            Symbol("datetime") => datetime,
            Symbol("high") => safeString(dailyBar, "h"),
            Symbol("low") => safeString(dailyBar, "l"),
            Symbol("bid") => safeString(latestQuote, "bp"),
            Symbol("bidVolume") => safeString(latestQuote, "bs"),
            Symbol("ask") => safeString(latestQuote, "ap"),
            Symbol("askVolume") => safeString(latestQuote, "as"),
            Symbol("vwap") => safeString(dailyBar, "vw"),
            Symbol("open") => safeString(dailyBar, "o"),
            Symbol("close") => safeString(dailyBar, "c"),
            Symbol("last") => safeString(latestTrade, "p"),
            Symbol("previousClose") => safeString(prevDailyBar, "c"),
            Symbol("change") => nothing,
            Symbol("percentage") => nothing,
            Symbol("average") => nothing,
            Symbol("baseVolume") => safeString(dailyBar, "v"),
            Symbol("quoteVolume") => safeString(dailyBar, "n")
        ), market);
        push!(results, ticker);
        i += 1
    end
    return self.filterByArray(results, "symbol", symbols)

end
function generateClientOrderId(self::Alpaca, params)
    clientOrderIdprefix = safeString(self.options, "clientOrderId");
    uuid = Ccxt.uuid();
    parts = split(uuid, "-");
    random_id = join(parts, "");
    defaultClientId = self.implodeParams(clientOrderIdprefix, Dict{Symbol, Any}(
        Symbol("id") => random_id
    ));
    clientOrderId = safeString(params, "clientOrderId", defaultClientId);
    return clientOrderId

end
function createMarketOrderWithCost(self::Alpaca, symbol, side, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return self.createOrder(symbol, "market", side, 0, nothing, extend(req, params))

end
function createMarketBuyOrderWithCost(self::Alpaca, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return self.createOrder(symbol, "market", "buy", 0, nothing, extend(req, params))

end
function createMarketSellOrderWithCost(self::Alpaca, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return self.createOrder(symbol, "market", "sell", cost, nothing, extend(req, params))

end
function createOrder(self::Alpaca, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    id = get(market, Symbol("id"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => id,
        Symbol("side") => side,
        Symbol("type") => type_var
    );
    triggerPrice = safeStringN(params, ["triggerPrice", "stop_price"]);
    if functions.ccxtruthy(triggerPrice != nothing)

        if functions.ccxtruthy(findfirst("limit", type_var) !== nothing)
            newType = "stop_limit";
        else
            throw(NotSupported(string(self.id, " createOrder() does not support stop orders for ", type_var, " orders, only stop_limit orders are supported")));
        end
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("type")] = newType;
    end
    if functions.ccxtruthy(findfirst("limit", type_var) !== nothing)
        request[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
    end
    cost = safeString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        params = omit(params, "cost");
        request[Symbol("notional")] = self.costToPrecision(symbol, cost);
    else
        request[Symbol("qty")] = self.amountToPrecision(symbol, amount);
    end
    defaultTIF = nothing;
    (defaultTIF, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce");
    request[Symbol("time_in_force")] = defaultTIF;
    params = omit(params, ["timeInForce", "triggerPrice"]);
    request[Symbol("client_order_id")] = self.generateClientOrderId(params);
    params = omit(params, ["clientOrderId"]);
    order = self.traderPrivatePostV2Orders(extend(request, params));
    return self.parseOrder(order, market)

end
function cancelOrder(self::Alpaca, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = self.traderPrivateDeleteV2OrdersOrderId(extend(request, params));
    return self.parseOrder(response)

end
function cancelAllOrders(self::Alpaca, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    response = self.traderPrivateDeleteV2Orders(params);
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return self.parseOrders(response)
    else
        return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]
    end

end
function fetchOrder(self::Alpaca, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    order = self.traderPrivateGetV2OrdersOrderId(extend(request, params));
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId);
    return self.parseOrder(order, market)

end
function fetchOrders(self::Alpaca, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("status") => "all"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbols")] = get(market, Symbol("id"), nothing);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = self.iso8601(until);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = self.traderPrivateGetV2Orders(extend(request, params));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Alpaca, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    return self.fetchOrders(symbol, since, limit, extend(request, params))

end
function fetchClosedOrders(self::Alpaca, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "closed"
    );
    return self.fetchOrders(symbol, since, limit, extend(request, params))

end
function editOrder(self::Alpaca, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("qty")] = self.amountToPrecision(symbol, amount);
    end
    triggerPrice = safeStringN(params, ["triggerPrice", "stop_price"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop_price")] = self.priceToPrecision(symbol, triggerPrice);
        params = omit(params, "triggerPrice");
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
    end
    timeInForce = nothing;
    (timeInForce, params) = self.handleOptionAndParams(params, "editOrder", "timeInForce", "gtc");
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("time_in_force")] = timeInForce;
    end
    request[Symbol("client_order_id")] = self.generateClientOrderId(params);
    params = omit(params, ["clientOrderId"]);
    response = self.traderPrivatePatchV2OrdersOrderId(extend(request, params));
    return self.parseOrder(response, market)

end
function parseOrder(self::Alpaca, order, market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    alpacaStatus = safeString(order, "status");
    status = self.parseOrderStatus(alpacaStatus);
    feeValue = safeString(order, "commission");
    fee = nothing;
    if functions.ccxtruthy(feeValue != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeValue,
            Symbol("currency") => "USD"
        );
    end
    orderType = safeString(order, "order_type");
    if functions.ccxtruthy(orderType != nothing)
        if functions.ccxtruthy(findfirst("limit", orderType) !== nothing)
            orderType = "limit";
        end
    end
    datetime = safeString(order, "submitted_at");
    timestamp = self.parse8601(datetime);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "id"),
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("lastTradeTimeStamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => orderType,
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "time_in_force")),
    Symbol("postOnly") => nothing,
    Symbol("side") => safeString(order, "side"),
    Symbol("price") => self.safeNumber(order, "limit_price"),
    Symbol("triggerPrice") => self.safeNumber(order, "stop_price"),
    Symbol("cost") => nothing,
    Symbol("average") => self.safeNumber(order, "filled_avg_price"),
    Symbol("amount") => self.safeNumber(order, "qty"),
    Symbol("filled") => self.safeNumber(order, "filled_qty"),
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => order
), market)

end
function parseOrderStatus(self::Alpaca, status)
    statuses = Dict{Symbol, Any}(
        Symbol("pending_new") => "open",
        Symbol("accepted") => "open",
        Symbol("new") => "open",
        Symbol("partially_filled") => "open",
        Symbol("activated") => "open",
        Symbol("filled") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Alpaca, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("day") => "Day"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function fetchMyTrades(self::Alpaca, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("activity_type") => "FILL"
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("until")] = self.iso8601(until);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    (request, params) = self.handleUntilOption("until", request, params);
    response = self.traderPrivateGetV2AccountActivitiesActivityType(extend(request, params));
    return self.parseTrades(response, market, since, limit)

end
function parseTrade(self::Alpaca, trade, market=nothing)
    marketId = safeString2(trade, "S", "symbol");
    symbol = self.safeSymbol(marketId, market);
    datetime = safeString2(trade, "t", "transaction_time");
    timestamp = self.parse8601(datetime);
    alpacaSide = safeString(trade, "tks");
    side = safeString(trade, "side");
    if functions.ccxtruthy(alpacaSide == "B")
        side = "buy";
    elseif functions.ccxtruthy(alpacaSide == "S")
        side = "sell";
    end
    priceString = safeString2(trade, "p", "price");
    amountString = safeString2(trade, "s", "qty");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "i", "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => "taker",
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchDepositAddress(self::Alpaca, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = self.traderPrivateGetV2Wallets(extend(request, params));
    return self.parseDepositAddress(response, currency)

end
function parseDepositAddress(self::Alpaca, depositAddress, currency=nothing)
    parsedCurrency = nothing;
    if functions.ccxtruthy(currency != nothing)
        parsedCurrency = get(currency, Symbol("id"), nothing);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => parsedCurrency,
    Symbol("network") => nothing,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => nothing
)

end
function withdraw(self::Alpaca, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    if functions.ccxtruthy(tag)
        address = string(address, ":", tag);
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => numberToString(amount)
    );
    response = self.traderPrivatePostV2WalletsTransfers(extend(request, params));
    return self.parseTransaction(response, currency)

end
function fetchTransactionsHelper(self::Alpaca, type_var, code, since, limit, params)
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = self.traderPrivateGetV2WalletsTransfers(params);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        direction = safeString(entry, "direction");
        if functions.ccxtruthy(direction == type_var)
                        push!(results, entry);
        elseif functions.ccxtruthy(type_var == "BOTH")
            push!(results, entry);
        end
        i += 1
    end
    return self.parseTransactions(results, currency, since, limit, params)

end
function fetchDepositsWithdrawals(self::Alpaca, code=nothing, since=nothing, limit=nothing, params=Dict())
    return self.fetchTransactionsHelper("BOTH", code, since, limit, params)

end
function fetchDeposits(self::Alpaca, code=nothing, since=nothing, limit=nothing, params=Dict())
    return self.fetchTransactionsHelper("INCOMING", code, since, limit, params)

end
function fetchWithdrawals(self::Alpaca, code=nothing, since=nothing, limit=nothing, params=Dict())
    return self.fetchTransactionsHelper("OUTGOING", code, since, limit, params)

end
function parseTransaction(self::Alpaca, transaction, currency=nothing)
    datetime = safeString(transaction, "created_at");
    currencyId = safeString(transaction, "asset");
    code = self.safeCurrencyCode(currencyId, currency);
    fees = safeString(transaction, "fees");
    networkFee = safeString(transaction, "network_fee");
    totalFee = stringAdd(fees, networkFee);
    fee = Dict{Symbol, Any}(
        Symbol("cost") => self.parseNumber(totalFee),
        Symbol("currency") => code
    );
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "tx_hash"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("network") => safeString(transaction, "chain"),
    Symbol("address") => safeString(transaction, "to_address"),
    Symbol("addressTo") => safeString(transaction, "to_address"),
    Symbol("addressFrom") => safeString(transaction, "from_address"),
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => self.parseTransactionType(safeString(transaction, "direction")),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => nothing,
    Symbol("fee") => fee,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Alpaca, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PROCESSING") => "pending",
        Symbol("FAILED") => "failed",
        Symbol("COMPLETE") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Alpaca, type_var)
    types = Dict{Symbol, Any}(
        Symbol("INCOMING") => "deposit",
        Symbol("OUTGOING") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function fetchBalance(self::Alpaca, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    response = self.traderPrivateGetV2Account(params);
    return self.parseBalance(response)

end
function parseBalance(self::Alpaca, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    account = self.account();
    currencyId = safeString(response, "currency");
    code = self.safeCurrencyCode(currencyId);
    account[Symbol("free")] = safeString(response, "cash");
    account[Symbol("total")] = safeString(response, "equity");
    result[Symbol(code)] = account;
    return self.safeBalance(result)

end
function sign(self::Alpaca, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = string("/", self.implodeParams(path, params));
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(get(api, 1, nothing)), nothing));
    headers = functions.ccxtruthy((headers != nothing)) ? headers : Dict{Symbol, Any}();
    if functions.ccxtruthy(get(api, 2, nothing) == "private")
        self.checkRequiredCredentials();
        headers[Symbol("APCA-API-KEY-ID")] = self.apiKey;
        headers[Symbol("APCA-API-SECRET-KEY")] = self.secret;
    end
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(length(objectKeys(query)))
        if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
            endpoint += string("?", self.urlencode(query));
        else
            body = json(query);
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    url = string(url, endpoint);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Alpaca, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    errorCode = safeString(response, "code");
    if functions.ccxtruthy(code != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    end
    message = safeValue(response, "message");
    if functions.ccxtruthy(message != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Alpaca, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function traderPrivateGetV2Account(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Orders(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2OrdersOrderId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders/{order_id}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Positions(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/positions", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2PositionsSymbolOrAssetId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/positions/{symbol_or_asset_id}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2AccountPortfolioHistory(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account/portfolio/history", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Watchlists(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2WatchlistsWatchlistId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists/{watchlist_id}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2WatchlistsByName(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists:by_name", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2AccountConfigurations(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account/configurations", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2AccountActivities(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account/activities", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2AccountActivitiesActivityType(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account/activities/{activity_type}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Calendar(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/calendar", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Clock(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/clock", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Assets(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/assets", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2AssetsSymbolOrAssetId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/assets/{symbol_or_asset_id}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2CorporateActionsAnnouncementsId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/corporate_actions/announcements/{id}", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2CorporateActionsAnnouncements(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/corporate_actions/announcements", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2Wallets(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/wallets", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivateGetV2WalletsTransfers(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/wallets/transfers", ["trader", "private"], "GET", params, nothing, nothing, Dict())
end

function traderPrivatePostV2Orders(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders", ["trader", "private"], "POST", params, nothing, nothing, Dict())
end

function traderPrivatePostV2Watchlists(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists", ["trader", "private"], "POST", params, nothing, nothing, Dict())
end

function traderPrivatePostV2WatchlistsWatchlistId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists/{watchlist_id}", ["trader", "private"], "POST", params, nothing, nothing, Dict())
end

function traderPrivatePostV2WatchlistsByName(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists:by_name", ["trader", "private"], "POST", params, nothing, nothing, Dict())
end

function traderPrivatePostV2WalletsTransfers(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/wallets/transfers", ["trader", "private"], "POST", params, nothing, nothing, Dict())
end

function traderPrivatePutV2OrdersOrderId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders/{order_id}", ["trader", "private"], "PUT", params, nothing, nothing, Dict())
end

function traderPrivatePutV2WatchlistsWatchlistId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists/{watchlist_id}", ["trader", "private"], "PUT", params, nothing, nothing, Dict())
end

function traderPrivatePutV2WatchlistsByName(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists:by_name", ["trader", "private"], "PUT", params, nothing, nothing, Dict())
end

function traderPrivatePatchV2OrdersOrderId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders/{order_id}", ["trader", "private"], "PATCH", params, nothing, nothing, Dict())
end

function traderPrivatePatchV2AccountConfigurations(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/account/configurations", ["trader", "private"], "PATCH", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2Orders(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2OrdersOrderId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/orders/{order_id}", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2Positions(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/positions", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2PositionsSymbolOrAssetId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/positions/{symbol_or_asset_id}", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2WatchlistsWatchlistId(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists/{watchlist_id}", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2WatchlistsByName(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists:by_name", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function traderPrivateDeleteV2WatchlistsWatchlistIdSymbol(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/watchlists/{watchlist_id}/{symbol}", ["trader", "private"], "DELETE", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocBars(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/bars", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocLatestBars(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/latest/bars", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocLatestOrderbooks(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/latest/orderbooks", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocLatestQuotes(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/latest/quotes", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocLatestTrades(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/latest/trades", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocQuotes(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/quotes", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocSnapshots(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/snapshots", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPublicGetV1beta3CryptoLocTrades(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta3/crypto/{loc}/trades", ["market", "public"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1CorporateActions(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/corporate-actions", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1ForexLatestRates(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/forex/latest/rates", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1ForexRates(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/forex/rates", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1LogosSymbol(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/logos/{symbol}", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1News(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/news", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1ScreenerStocksMostActives(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/screener/stocks/most-actives", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV1beta1ScreenerMarketTypeMovers(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v1beta1/screener/{market_type}/movers", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksAuctions(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/auctions", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksBars(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/bars", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksBarsLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/bars/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksMetaConditionsTicktype(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/meta/conditions/{ticktype}", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksMetaExchanges(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/meta/exchanges", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksQuotes(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/quotes", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksQuotesLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/quotes/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSnapshots(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/snapshots", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksTrades(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/trades", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksTradesLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/trades/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolAuctions(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/auctions", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolBars(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/bars", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolBarsLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/bars/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolQuotes(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/quotes", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolQuotesLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/quotes/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolSnapshot(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/snapshot", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolTrades(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/trades", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function marketPrivateGetV2StocksSymbolTradesLatest(self::Alpaca, params=Dict(), context=Dict())
    return request(self, "v2/stocks/{symbol}/trades/latest", ["market", "private"], "GET", params, nothing, nothing, Dict())
end

function Alpaca(; kwargs...)
    inst = Alpaca(Exchange(), describe, fetchTime, fetchMarkets, parseMarket, fetchTrades, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchTicker, fetchTickers, generateClientOrderId, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, cancelOrder, cancelAllOrders, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, editOrder, parseOrder, parseOrderStatus, parseTimeInForce, fetchMyTrades, parseTrade, fetchDepositAddress, parseDepositAddress, withdraw, fetchTransactionsHelper, fetchDepositsWithdrawals, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, parseTransactionType, fetchBalance, parseBalance, sign, handleErrors, traderPrivateGetV2Account, traderPrivateGetV2Orders, traderPrivateGetV2OrdersOrderId, traderPrivateGetV2Positions, traderPrivateGetV2PositionsSymbolOrAssetId, traderPrivateGetV2AccountPortfolioHistory, traderPrivateGetV2Watchlists, traderPrivateGetV2WatchlistsWatchlistId, traderPrivateGetV2WatchlistsByName, traderPrivateGetV2AccountConfigurations, traderPrivateGetV2AccountActivities, traderPrivateGetV2AccountActivitiesActivityType, traderPrivateGetV2Calendar, traderPrivateGetV2Clock, traderPrivateGetV2Assets, traderPrivateGetV2AssetsSymbolOrAssetId, traderPrivateGetV2CorporateActionsAnnouncementsId, traderPrivateGetV2CorporateActionsAnnouncements, traderPrivateGetV2Wallets, traderPrivateGetV2WalletsTransfers, traderPrivatePostV2Orders, traderPrivatePostV2Watchlists, traderPrivatePostV2WatchlistsWatchlistId, traderPrivatePostV2WatchlistsByName, traderPrivatePostV2WalletsTransfers, traderPrivatePutV2OrdersOrderId, traderPrivatePutV2WatchlistsWatchlistId, traderPrivatePutV2WatchlistsByName, traderPrivatePatchV2OrdersOrderId, traderPrivatePatchV2AccountConfigurations, traderPrivateDeleteV2Orders, traderPrivateDeleteV2OrdersOrderId, traderPrivateDeleteV2Positions, traderPrivateDeleteV2PositionsSymbolOrAssetId, traderPrivateDeleteV2WatchlistsWatchlistId, traderPrivateDeleteV2WatchlistsByName, traderPrivateDeleteV2WatchlistsWatchlistIdSymbol, marketPublicGetV1beta3CryptoLocBars, marketPublicGetV1beta3CryptoLocLatestBars, marketPublicGetV1beta3CryptoLocLatestOrderbooks, marketPublicGetV1beta3CryptoLocLatestQuotes, marketPublicGetV1beta3CryptoLocLatestTrades, marketPublicGetV1beta3CryptoLocQuotes, marketPublicGetV1beta3CryptoLocSnapshots, marketPublicGetV1beta3CryptoLocTrades, marketPrivateGetV1beta1CorporateActions, marketPrivateGetV1beta1ForexLatestRates, marketPrivateGetV1beta1ForexRates, marketPrivateGetV1beta1LogosSymbol, marketPrivateGetV1beta1News, marketPrivateGetV1beta1ScreenerStocksMostActives, marketPrivateGetV1beta1ScreenerMarketTypeMovers, marketPrivateGetV2StocksAuctions, marketPrivateGetV2StocksBars, marketPrivateGetV2StocksBarsLatest, marketPrivateGetV2StocksMetaConditionsTicktype, marketPrivateGetV2StocksMetaExchanges, marketPrivateGetV2StocksQuotes, marketPrivateGetV2StocksQuotesLatest, marketPrivateGetV2StocksSnapshots, marketPrivateGetV2StocksTrades, marketPrivateGetV2StocksTradesLatest, marketPrivateGetV2StocksSymbolAuctions, marketPrivateGetV2StocksSymbolBars, marketPrivateGetV2StocksSymbolBarsLatest, marketPrivateGetV2StocksSymbolQuotes, marketPrivateGetV2StocksSymbolQuotesLatest, marketPrivateGetV2StocksSymbolSnapshot, marketPrivateGetV2StocksSymbolTrades, marketPrivateGetV2StocksSymbolTradesLatest)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
