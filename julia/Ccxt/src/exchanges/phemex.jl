@kwdef mutable struct Phemex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseSafeNumber::Function = parseSafeNumber
    parseSwapMarket::Function = parseSwapMarket
    parseSpotMarket::Function = parseSpotMarket
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    customParseBidAsk::Function = customParseBidAsk
    customParseOrderBook::Function = customParseOrderBook
    fetchOrderBook::Function = fetchOrderBook
    toEn::Function = toEn
    toEv::Function = toEv
    toEp::Function = toEp
    fromEn::Function = fromEn
    fromEp::Function = fromEp
    fromEv::Function = fromEv
    fromEr::Function = fromEr
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    parseSpotBalance::Function = parseSpotBalance
    parseSwapBalance::Function = parseSwapBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseTimeInForce::Function = parseTimeInForce
    parseSpotOrder::Function = parseSpotOrder
    parseOrderSide::Function = parseOrderSide
    parseSwapOrder::Function = parseSwapOrder
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchPositions::Function = fetchPositions
    fetchPositionHistory::Function = fetchPositionHistory
    parsePosition::Function = parsePosition
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingFeeToPrecision::Function = parseFundingFeeToPrecision
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    setMargin::Function = setMargin
    parseMarginStatus::Function = parseMarginStatus
    parseMarginModification::Function = parseMarginModification
    setMarginMode::Function = setMarginMode
    setPositionMode::Function = setPositionMode
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    sign::Function = sign
    setLeverage::Function = setLeverage
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    withdraw::Function = withdraw
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetCfgV2Products::Function = publicGetCfgV2Products
    publicGetCfgFundingRates::Function = publicGetCfgFundingRates
    publicGetProducts::Function = publicGetProducts
    publicGetNomicsTrades::Function = publicGetNomicsTrades
    publicGetMdKline::Function = publicGetMdKline
    publicGetMdV2KlineList::Function = publicGetMdV2KlineList
    publicGetMdV2Kline::Function = publicGetMdV2Kline
    publicGetMdV2KlineLast::Function = publicGetMdV2KlineLast
    publicGetMdOrderbook::Function = publicGetMdOrderbook
    publicGetMdTrade::Function = publicGetMdTrade
    publicGetMdSpotTicker24hr::Function = publicGetMdSpotTicker24hr
    publicGetExchangePublicCfgChainSettings::Function = publicGetExchangePublicCfgChainSettings
    v1GetMdFullbook::Function = v1GetMdFullbook
    v1GetMdOrderbook::Function = v1GetMdOrderbook
    v1GetMdTrade::Function = v1GetMdTrade
    v1GetMdTicker24hr::Function = v1GetMdTicker24hr
    v1GetMdTicker24hrAll::Function = v1GetMdTicker24hrAll
    v1GetMdSpotTicker24hr::Function = v1GetMdSpotTicker24hr
    v1GetMdSpotTicker24hrAll::Function = v1GetMdSpotTicker24hrAll
    v1GetExchangePublicProducts::Function = v1GetExchangePublicProducts
    v1GetApiDataPublicDataFundingRateHistory::Function = v1GetApiDataPublicDataFundingRateHistory
    v2GetPublicProducts::Function = v2GetPublicProducts
    v2GetPublicProductsPlus::Function = v2GetPublicProductsPlus
    v2GetMdV2Orderbook::Function = v2GetMdV2Orderbook
    v2GetMdV2Trade::Function = v2GetMdV2Trade
    v2GetMdV2Ticker24hr::Function = v2GetMdV2Ticker24hr
    v2GetMdV2Ticker24hrAll::Function = v2GetMdV2Ticker24hrAll
    v2GetApiDataPublicDataFundingRateHistory::Function = v2GetApiDataPublicDataFundingRateHistory
    privateGetSpotOrdersActive::Function = privateGetSpotOrdersActive
    privateGetSpotOrders::Function = privateGetSpotOrders
    privateGetSpotWallets::Function = privateGetSpotWallets
    privateGetExchangeSpotOrder::Function = privateGetExchangeSpotOrder
    privateGetExchangeSpotOrderTrades::Function = privateGetExchangeSpotOrderTrades
    privateGetExchangeOrderV2OrderList::Function = privateGetExchangeOrderV2OrderList
    privateGetExchangeOrderV2TradingList::Function = privateGetExchangeOrderV2TradingList
    privateGetAccountsAccountPositions::Function = privateGetAccountsAccountPositions
    privateGetGAccountsAccountPositions::Function = privateGetGAccountsAccountPositions
    privateGetGAccountsPositions::Function = privateGetGAccountsPositions
    privateGetGAccountsRiskUnit::Function = privateGetGAccountsRiskUnit
    privateGetApiDataFuturesFundingFees::Function = privateGetApiDataFuturesFundingFees
    privateGetApiDataGFuturesFundingFees::Function = privateGetApiDataGFuturesFundingFees
    privateGetApiDataFuturesOrders::Function = privateGetApiDataFuturesOrders
    privateGetApiDataGFuturesOrders::Function = privateGetApiDataGFuturesOrders
    privateGetApiDataFuturesOrdersByOrderId::Function = privateGetApiDataFuturesOrdersByOrderId
    privateGetApiDataGFuturesOrdersByOrderId::Function = privateGetApiDataGFuturesOrdersByOrderId
    privateGetApiDataFuturesTrades::Function = privateGetApiDataFuturesTrades
    privateGetApiDataGFuturesTrades::Function = privateGetApiDataGFuturesTrades
    privateGetApiDataFuturesTradingFees::Function = privateGetApiDataFuturesTradingFees
    privateGetApiDataGFuturesTradingFees::Function = privateGetApiDataGFuturesTradingFees
    privateGetApiDataFuturesV2TradeAccountDetail::Function = privateGetApiDataFuturesV2TradeAccountDetail
    privateGetApiDataGFuturesClosedPosition::Function = privateGetApiDataGFuturesClosedPosition
    privateGetGOrdersActiveList::Function = privateGetGOrdersActiveList
    privateGetOrdersActiveList::Function = privateGetOrdersActiveList
    privateGetExchangeOrderList::Function = privateGetExchangeOrderList
    privateGetExchangeOrder::Function = privateGetExchangeOrder
    privateGetExchangeOrderTrade::Function = privateGetExchangeOrderTrade
    privateGetPhemexUserUsersChildren::Function = privateGetPhemexUserUsersChildren
    privateGetPhemexUserWalletsV2DepositAddress::Function = privateGetPhemexUserWalletsV2DepositAddress
    privateGetPhemexUserWalletsTradeAccountDetail::Function = privateGetPhemexUserWalletsTradeAccountDetail
    privateGetPhemexDepositWalletsApiDepositAddress::Function = privateGetPhemexDepositWalletsApiDepositAddress
    privateGetPhemexDepositWalletsApiDepositHist::Function = privateGetPhemexDepositWalletsApiDepositHist
    privateGetPhemexDepositWalletsApiChainCfg::Function = privateGetPhemexDepositWalletsApiChainCfg
    privateGetPhemexWithdrawWalletsApiWithdrawHist::Function = privateGetPhemexWithdrawWalletsApiWithdrawHist
    privateGetPhemexWithdrawWalletsApiAssetInfo::Function = privateGetPhemexWithdrawWalletsApiAssetInfo
    privateGetPhemexUserOrderClosedPositionList::Function = privateGetPhemexUserOrderClosedPositionList
    privateGetExchangeMarginsTransfer::Function = privateGetExchangeMarginsTransfer
    privateGetExchangeWalletsConfirmWithdraw::Function = privateGetExchangeWalletsConfirmWithdraw
    privateGetExchangeWalletsWithdrawList::Function = privateGetExchangeWalletsWithdrawList
    privateGetExchangeWalletsDepositList::Function = privateGetExchangeWalletsDepositList
    privateGetExchangeWalletsV2DepositAddress::Function = privateGetExchangeWalletsV2DepositAddress
    privateGetApiDataSpotsFunds::Function = privateGetApiDataSpotsFunds
    privateGetApiDataSpotsOrders::Function = privateGetApiDataSpotsOrders
    privateGetApiDataSpotsOrdersByOrderId::Function = privateGetApiDataSpotsOrdersByOrderId
    privateGetApiDataSpotsPnls::Function = privateGetApiDataSpotsPnls
    privateGetApiDataSpotsTrades::Function = privateGetApiDataSpotsTrades
    privateGetApiDataSpotsTradesByOrderId::Function = privateGetApiDataSpotsTradesByOrderId
    privateGetAssetsConvert::Function = privateGetAssetsConvert
    privateGetAssetsTransfer::Function = privateGetAssetsTransfer
    privateGetAssetsSpotsSubAccountsTransfer::Function = privateGetAssetsSpotsSubAccountsTransfer
    privateGetAssetsFuturesSubAccountsTransfer::Function = privateGetAssetsFuturesSubAccountsTransfer
    privateGetAssetsQuote::Function = privateGetAssetsQuote
    privatePostSpotOrders::Function = privatePostSpotOrders
    privatePostOrders::Function = privatePostOrders
    privatePostGOrders::Function = privatePostGOrders
    privatePostPositionsAssign::Function = privatePostPositionsAssign
    privatePostExchangeWalletsTransferOut::Function = privatePostExchangeWalletsTransferOut
    privatePostExchangeWalletsTransferIn::Function = privatePostExchangeWalletsTransferIn
    privatePostExchangeMargins::Function = privatePostExchangeMargins
    privatePostExchangeWalletsCreateWithdraw::Function = privatePostExchangeWalletsCreateWithdraw
    privatePostExchangeWalletsCancelWithdraw::Function = privatePostExchangeWalletsCancelWithdraw
    privatePostExchangeWalletsCreateWithdrawAddress::Function = privatePostExchangeWalletsCreateWithdrawAddress
    privatePostAssetsTransfer::Function = privatePostAssetsTransfer
    privatePostAssetsSpotsSubAccountsTransfer::Function = privatePostAssetsSpotsSubAccountsTransfer
    privatePostAssetsFuturesSubAccountsTransfer::Function = privatePostAssetsFuturesSubAccountsTransfer
    privatePostAssetsUniversalTransfer::Function = privatePostAssetsUniversalTransfer
    privatePostAssetsConvert::Function = privatePostAssetsConvert
    privatePostPhemexWithdrawWalletsApiCreateWithdraw::Function = privatePostPhemexWithdrawWalletsApiCreateWithdraw
    privatePostPhemexWithdrawWalletsApiCancelWithdraw::Function = privatePostPhemexWithdrawWalletsApiCancelWithdraw
    privatePutSpotOrdersCreate::Function = privatePutSpotOrdersCreate
    privatePutSpotOrders::Function = privatePutSpotOrders
    privatePutOrdersReplace::Function = privatePutOrdersReplace
    privatePutGOrdersReplace::Function = privatePutGOrdersReplace
    privatePutGOrdersCreate::Function = privatePutGOrdersCreate
    privatePutPositionsLeverage::Function = privatePutPositionsLeverage
    privatePutGPositionsLeverage::Function = privatePutGPositionsLeverage
    privatePutGPositionsSwitchPosModeSync::Function = privatePutGPositionsSwitchPosModeSync
    privatePutPositionsRiskLimit::Function = privatePutPositionsRiskLimit
    privateDeleteSpotOrders::Function = privateDeleteSpotOrders
    privateDeleteSpotOrdersAll::Function = privateDeleteSpotOrdersAll
    privateDeleteOrdersCancel::Function = privateDeleteOrdersCancel
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersAll::Function = privateDeleteOrdersAll
    privateDeleteGOrdersCancel::Function = privateDeleteGOrdersCancel
    privateDeleteGOrders::Function = privateDeleteGOrders
    privateDeleteGOrdersAll::Function = privateDeleteGOrdersAll

end
function describe(self::Phemex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "phemex",
    Symbol("name") => "Phemex",
    Symbol("countries") => ["CN"],
    Symbol("rateLimit") => 120.5,
    Symbol("version") => "v1",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("hostname") => "api.phemex.com",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => true,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistories") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("v1") => "https://testnet-api.phemex.com/v1",
            Symbol("v2") => "https://testnet-api.phemex.com",
            Symbol("public") => "https://testnet-api.phemex.com/exchange/public",
            Symbol("private") => "https://testnet-api.phemex.com"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v1") => "https://{hostname}/v1",
            Symbol("v2") => "https://{hostname}",
            Symbol("public") => "https://{hostname}/exchange/public",
            Symbol("private") => "https://{hostname}"
        ),
        Symbol("www") => "https://phemex.com",
        Symbol("doc") => "https://phemex-docs.github.io/#overview",
        Symbol("fees") => "https://phemex.com/fees-conditions",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://phemex.com/register?referralCode=EDNVJ",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "60",
        Symbol("3m") => "180",
        Symbol("5m") => "300",
        Symbol("15m") => "900",
        Symbol("30m") => "1800",
        Symbol("1h") => "3600",
        Symbol("2h") => "7200",
        Symbol("3h") => "10800",
        Symbol("4h") => "14400",
        Symbol("6h") => "21600",
        Symbol("12h") => "43200",
        Symbol("1d") => "86400",
        Symbol("1w") => "604800",
        Symbol("1M") => "2592000",
        Symbol("3M") => "7776000",
        Symbol("1Y") => "31104000"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("cfg/v2/products") => 5,
                Symbol("cfg/fundingRates") => 5,
                Symbol("products") => 5,
                Symbol("nomics/trades") => 5,
                Symbol("md/kline") => 5,
                Symbol("md/v2/kline/list") => 5,
                Symbol("md/v2/kline") => 5,
                Symbol("md/v2/kline/last") => 5,
                Symbol("md/orderbook") => 5,
                Symbol("md/trade") => 5,
                Symbol("md/spot/ticker/24hr") => 5,
                Symbol("exchange/public/cfg/chain-settings") => 5
            )
        ),
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("md/fullbook") => 5,
                Symbol("md/orderbook") => 5,
                Symbol("md/trade") => 5,
                Symbol("md/ticker/24hr") => 5,
                Symbol("md/ticker/24hr/all") => 5,
                Symbol("md/spot/ticker/24hr") => 5,
                Symbol("md/spot/ticker/24hr/all") => 5,
                Symbol("exchange/public/products") => 5,
                Symbol("api-data/public/data/funding-rate-history") => 5
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("public/products") => 5,
                Symbol("public/products-plus") => 5,
                Symbol("md/v2/orderbook") => 5,
                Symbol("md/v2/trade") => 5,
                Symbol("md/v2/ticker/24hr") => 5,
                Symbol("md/v2/ticker/24hr/all") => 5,
                Symbol("api-data/public/data/funding-rate-history") => 5
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("spot/orders/active") => 1,
                Symbol("spot/orders") => 1,
                Symbol("spot/wallets") => 5,
                Symbol("exchange/spot/order") => 5,
                Symbol("exchange/spot/order/trades") => 5,
                Symbol("exchange/order/v2/orderList") => 5,
                Symbol("exchange/order/v2/tradingList") => 5,
                Symbol("accounts/accountPositions") => 1,
                Symbol("g-accounts/accountPositions") => 1,
                Symbol("g-accounts/positions") => 25,
                Symbol("g-accounts/risk-unit") => 1,
                Symbol("api-data/futures/funding-fees") => 5,
                Symbol("api-data/g-futures/funding-fees") => 5,
                Symbol("api-data/futures/orders") => 5,
                Symbol("api-data/g-futures/orders") => 5,
                Symbol("api-data/futures/orders/by-order-id") => 5,
                Symbol("api-data/g-futures/orders/by-order-id") => 5,
                Symbol("api-data/futures/trades") => 5,
                Symbol("api-data/g-futures/trades") => 5,
                Symbol("api-data/futures/trading-fees") => 5,
                Symbol("api-data/g-futures/trading-fees") => 5,
                Symbol("api-data/futures/v2/tradeAccountDetail") => 5,
                Symbol("api-data/g-futures/closedPosition") => 5,
                Symbol("g-orders/activeList") => 1,
                Symbol("orders/activeList") => 1,
                Symbol("exchange/order/list") => 5,
                Symbol("exchange/order") => 5,
                Symbol("exchange/order/trade") => 5,
                Symbol("phemex-user/users/children") => 5,
                Symbol("phemex-user/wallets/v2/depositAddress") => 5,
                Symbol("phemex-user/wallets/tradeAccountDetail") => 5,
                Symbol("phemex-deposit/wallets/api/depositAddress") => 5,
                Symbol("phemex-deposit/wallets/api/depositHist") => 5,
                Symbol("phemex-deposit/wallets/api/chainCfg") => 5,
                Symbol("phemex-withdraw/wallets/api/withdrawHist") => 5,
                Symbol("phemex-withdraw/wallets/api/asset/info") => 5,
                Symbol("phemex-user/order/closedPositionList") => 5,
                Symbol("exchange/margins/transfer") => 5,
                Symbol("exchange/wallets/confirm/withdraw") => 5,
                Symbol("exchange/wallets/withdrawList") => 5,
                Symbol("exchange/wallets/depositList") => 5,
                Symbol("exchange/wallets/v2/depositAddress") => 5,
                Symbol("api-data/spots/funds") => 5,
                Symbol("api-data/spots/orders") => 5,
                Symbol("api-data/spots/orders/by-order-id") => 5,
                Symbol("api-data/spots/pnls") => 5,
                Symbol("api-data/spots/trades") => 5,
                Symbol("api-data/spots/trades/by-order-id") => 5,
                Symbol("assets/convert") => 5,
                Symbol("assets/transfer") => 5,
                Symbol("assets/spots/sub-accounts/transfer") => 5,
                Symbol("assets/futures/sub-accounts/transfer") => 5,
                Symbol("assets/quote") => 5
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("spot/orders") => 1,
                Symbol("orders") => 1,
                Symbol("g-orders") => 1,
                Symbol("positions/assign") => 5,
                Symbol("exchange/wallets/transferOut") => 5,
                Symbol("exchange/wallets/transferIn") => 5,
                Symbol("exchange/margins") => 5,
                Symbol("exchange/wallets/createWithdraw") => 5,
                Symbol("exchange/wallets/cancelWithdraw") => 5,
                Symbol("exchange/wallets/createWithdrawAddress") => 5,
                Symbol("assets/transfer") => 5,
                Symbol("assets/spots/sub-accounts/transfer") => 5,
                Symbol("assets/futures/sub-accounts/transfer") => 5,
                Symbol("assets/universal-transfer") => 5,
                Symbol("assets/convert") => 5,
                Symbol("phemex-withdraw/wallets/api/createWithdraw") => 5,
                Symbol("phemex-withdraw/wallets/api/cancelWithdraw") => 5
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("spot/orders/create") => 1,
                Symbol("spot/orders") => 1,
                Symbol("orders/replace") => 1,
                Symbol("g-orders/replace") => 1,
                Symbol("g-orders/create") => 1,
                Symbol("positions/leverage") => 5,
                Symbol("g-positions/leverage") => 5,
                Symbol("g-positions/switch-pos-mode-sync") => 5,
                Symbol("positions/riskLimit") => 5
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("spot/orders") => 2,
                Symbol("spot/orders/all") => 2,
                Symbol("orders/cancel") => 1,
                Symbol("orders") => 1,
                Symbol("orders/all") => 3,
                Symbol("g-orders/cancel") => 1,
                Symbol("g-orders") => 1,
                Symbol("g-orders/all") => 3
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001")
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("mark") => true,
                    Symbol("last") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 2,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 200,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 100000,
                Symbol("untilDays") => 2,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerDirection") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("mark") => true,
                        Symbol("last") => true,
                        Symbol("index") => true
                    ),
                    Symbol("price") => true
                ),
                Symbol("hedged") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("401") => AuthenticationError,
            Symbol("412") => BadRequest,
            Symbol("6001") => BadRequest,
            Symbol("19999") => BadRequest,
            Symbol("10001") => DuplicateOrderId,
            Symbol("10002") => OrderNotFound,
            Symbol("10003") => CancelPending,
            Symbol("10004") => CancelPending,
            Symbol("10005") => CancelPending,
            Symbol("11001") => InsufficientFunds,
            Symbol("11002") => InvalidOrder,
            Symbol("11003") => InsufficientFunds,
            Symbol("11004") => InvalidOrder,
            Symbol("11005") => InsufficientFunds,
            Symbol("11006") => ExchangeError,
            Symbol("11007") => ExchangeError,
            Symbol("11008") => ExchangeError,
            Symbol("11009") => ExchangeError,
            Symbol("11010") => InsufficientFunds,
            Symbol("11011") => InvalidOrder,
            Symbol("11012") => InvalidOrder,
            Symbol("11013") => InvalidOrder,
            Symbol("11014") => InvalidOrder,
            Symbol("11015") => InvalidOrder,
            Symbol("11016") => BadRequest,
            Symbol("11017") => ExchangeError,
            Symbol("11018") => ExchangeError,
            Symbol("11019") => ExchangeError,
            Symbol("11020") => ExchangeError,
            Symbol("11021") => ExchangeError,
            Symbol("11022") => AccountSuspended,
            Symbol("11023") => ExchangeError,
            Symbol("11024") => ExchangeError,
            Symbol("11025") => BadRequest,
            Symbol("11026") => ExchangeError,
            Symbol("11027") => BadSymbol,
            Symbol("11028") => BadSymbol,
            Symbol("11029") => ExchangeError,
            Symbol("11030") => ExchangeError,
            Symbol("11031") => DDoSProtection,
            Symbol("11032") => DDoSProtection,
            Symbol("11033") => DuplicateOrderId,
            Symbol("11034") => InvalidOrder,
            Symbol("11035") => InvalidOrder,
            Symbol("11036") => InvalidOrder,
            Symbol("11037") => InvalidOrder,
            Symbol("11038") => InvalidOrder,
            Symbol("11039") => InvalidOrder,
            Symbol("11040") => InvalidOrder,
            Symbol("11041") => InvalidOrder,
            Symbol("11042") => InvalidOrder,
            Symbol("11043") => InvalidOrder,
            Symbol("11044") => InvalidOrder,
            Symbol("11045") => InvalidOrder,
            Symbol("11046") => InvalidOrder,
            Symbol("11047") => InvalidOrder,
            Symbol("11048") => InvalidOrder,
            Symbol("11049") => InvalidOrder,
            Symbol("11050") => InvalidOrder,
            Symbol("11051") => InvalidOrder,
            Symbol("11052") => InvalidOrder,
            Symbol("11053") => InvalidOrder,
            Symbol("11054") => InvalidOrder,
            Symbol("11055") => InvalidOrder,
            Symbol("11056") => InvalidOrder,
            Symbol("11057") => InvalidOrder,
            Symbol("11058") => InvalidOrder,
            Symbol("11059") => InvalidOrder,
            Symbol("11060") => InvalidOrder,
            Symbol("11061") => CancelPending,
            Symbol("11062") => InvalidOrder,
            Symbol("11063") => InvalidOrder,
            Symbol("11064") => InvalidOrder,
            Symbol("11065") => InvalidOrder,
            Symbol("11066") => InvalidOrder,
            Symbol("11067") => InvalidOrder,
            Symbol("11068") => InvalidOrder,
            Symbol("11069") => ExchangeError,
            Symbol("11070") => BadSymbol,
            Symbol("11071") => InvalidOrder,
            Symbol("11072") => InvalidOrder,
            Symbol("11073") => InvalidOrder,
            Symbol("11074") => InvalidOrder,
            Symbol("11075") => InvalidOrder,
            Symbol("11076") => InvalidOrder,
            Symbol("11077") => InvalidOrder,
            Symbol("11078") => InvalidOrder,
            Symbol("11079") => InvalidOrder,
            Symbol("11080") => InvalidOrder,
            Symbol("11081") => InvalidOrder,
            Symbol("11082") => InsufficientFunds,
            Symbol("11083") => InvalidOrder,
            Symbol("11084") => InvalidOrder,
            Symbol("11085") => DuplicateOrderId,
            Symbol("11086") => InvalidOrder,
            Symbol("11087") => InvalidOrder,
            Symbol("11088") => InvalidOrder,
            Symbol("11089") => InvalidOrder,
            Symbol("11090") => InvalidOrder,
            Symbol("11091") => InvalidOrder,
            Symbol("11092") => InvalidOrder,
            Symbol("11093") => InvalidOrder,
            Symbol("11094") => InvalidOrder,
            Symbol("11095") => InvalidOrder,
            Symbol("11096") => InvalidOrder,
            Symbol("11097") => BadRequest,
            Symbol("11098") => BadRequest,
            Symbol("11099") => ExchangeError,
            Symbol("11100") => InsufficientFunds,
            Symbol("11101") => InsufficientFunds,
            Symbol("11102") => BadRequest,
            Symbol("11103") => BadRequest,
            Symbol("11104") => BadRequest,
            Symbol("11105") => InsufficientFunds,
            Symbol("11106") => InsufficientFunds,
            Symbol("11107") => ExchangeError,
            Symbol("11108") => InvalidOrder,
            Symbol("11109") => InvalidOrder,
            Symbol("11110") => InvalidOrder,
            Symbol("11111") => InvalidOrder,
            Symbol("11112") => InvalidOrder,
            Symbol("11113") => BadRequest,
            Symbol("11114") => InvalidOrder,
            Symbol("11115") => InvalidOrder,
            Symbol("11116") => InvalidOrder,
            Symbol("11117") => InvalidOrder,
            Symbol("11118") => InvalidOrder,
            Symbol("11119") => InvalidOrder,
            Symbol("11120") => InvalidOrder,
            Symbol("11121") => InvalidOrder,
            Symbol("11122") => InvalidOrder,
            Symbol("11123") => InvalidOrder,
            Symbol("11124") => InvalidOrder,
            Symbol("11125") => InvalidOrder,
            Symbol("11126") => InvalidOrder,
            Symbol("11128") => InvalidOrder,
            Symbol("11129") => InvalidOrder,
            Symbol("11130") => InvalidOrder,
            Symbol("11131") => InvalidOrder,
            Symbol("11132") => InvalidOrder,
            Symbol("11133") => InvalidOrder,
            Symbol("11134") => InvalidOrder,
            Symbol("30000") => BadRequest,
            Symbol("30018") => BadRequest,
            Symbol("34003") => PermissionDenied,
            Symbol("35104") => InsufficientFunds,
            Symbol("39995") => RateLimitExceeded,
            Symbol("39996") => PermissionDenied,
            Symbol("39997") => BadSymbol
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("401 Insufficient privilege") => PermissionDenied,
            Symbol("401 Request IP mismatch") => PermissionDenied,
            Symbol("Failed to find api-key") => AuthenticationError,
            Symbol("Missing required parameter") => BadRequest,
            Symbol("API Signature verification failed") => AuthenticationError,
            Symbol("Api key not found") => AuthenticationError
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("brokerId") => "CCXT123456",
        Symbol("x-phemex-request-expiry") => 60,
        Symbol("createOrderByQuoteRequiresPrice") => true,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRX",
            Symbol("ERC20") => "ETH",
            Symbol("BEP20") => "BNB"
        ),
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "ETH",
            Symbol("MKR") => "ETH"
        ),
        Symbol("defaultSubType") => "linear",
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("swap") => "future"
        ),
        Symbol("stableCoins") => ["BUSD", "FEI", "TUSD", "USD", "USDC", "USDD", "USDP", "USDT"],
        Symbol("transfer") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("triggerPriceTypesMap") => Dict{Symbol, Any}(
            Symbol("last") => "ByLastPrice",
            Symbol("mark") => "ByMarkPrice",
            Symbol("index") => "ByIndexPrice",
            Symbol("ask") => "ByAskPrice",
            Symbol("bid") => "ByBidPrice"
        )
    )
))

end
function parseSafeNumber(self::Phemex, value=nothing)
    if functions.ccxtruthy(value == nothing)
            return value
    end
    parts = split(value, ",");
    value = join(parts, "");
    parts = split(value, " ");
    return self.safeNumber(parts, 0)

end
function parseSwapMarket(self::Phemex, market)
    id = safeString(market, "symbol");
    contractUnderlyingAssets = safeString(market, "contractUnderlyingAssets");
    baseId = safeString(market, "baseCurrency", contractUnderlyingAssets);
    quoteId = safeString(market, "quoteCurrency");
    settleId = safeString(market, "settleCurrency");
    base = self.safeCurrencyCode(baseId);
    base = replace(base, " " => "");
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    inverse = false;
    if functions.ccxtruthy(settleId != quoteId)
        inverse = true;
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((ccxt_in("baseCurrency", market))), base == quote_var))
            base = settle;
        end
    end
    priceScale = safeInteger(market, "priceScale");
    ratioScale = safeInteger(market, "ratioScale");
    valueScale = safeInteger(market, "valueScale");
    minPriceEp = safeString(market, "minPriceEp");
    maxPriceEp = safeString(market, "maxPriceEp");
    makerFeeRateEr = safeString(market, "makerFeeRateEr");
    takerFeeRateEr = safeString(market, "takerFeeRateEr");
    status = safeString(market, "status");
    contractSizeString = safeString(market, "contractSize", " ");
    contractSize = nothing;
    if functions.ccxtruthy(settle == "USDT")
        contractSize = self.parseNumber("1");
    elseif functions.ccxtruthy(ccxt_indexOf(" ", contractSizeString))
        parts = split(contractSizeString, " ");
        contractSize = self.parseNumber(get(parts, 1, nothing));
    else
        contractSize = self.parseNumber(contractSizeString);
    end
    isLinear = !functions.ccxtruthy(inverse);
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var, ":", settle),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => status == "Listed",
    Symbol("contract") => true,
    Symbol("linear") => isLinear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.parseNumber(self.fromEn(takerFeeRateEr, ratioScale)),
    Symbol("maker") => self.parseNumber(self.fromEn(makerFeeRateEr, ratioScale)),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("priceScale") => priceScale,
    Symbol("valueScale") => valueScale,
    Symbol("ratioScale") => ratioScale,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber2(market, "lotSize", "qtyStepSize"),
        Symbol("price") => self.safeNumber(market, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(self.fromEn(minPriceEp, priceScale)),
            Symbol("max") => self.parseNumber(self.fromEn(maxPriceEp, priceScale))
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.parseNumber(safeString(market, "maxOrderQty"))
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseSpotMarket(self::Phemex, market)
    type_var = safeStringLower(market, "type");
    id = safeString(market, "symbol");
    quoteId = safeString(market, "quoteCurrency");
    baseId = safeString(market, "baseCurrency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    status = safeString(market, "status");
    precisionAmount = self.parseSafeNumber(safeString(market, "baseTickSize"));
    precisionPrice = self.parseSafeNumber(safeString(market, "quoteTickSize"));
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => type_var,
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => status == "Listed",
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(market, "defaultTakerFee"),
    Symbol("maker") => self.safeNumber(market, "defaultMakerFee"),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("priceScale") => safeInteger(market, "priceScale"),
    Symbol("valueScale") => safeInteger(market, "valueScale"),
    Symbol("ratioScale") => safeInteger(market, "ratioScale"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => precisionAmount,
        Symbol("price") => precisionPrice
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => precisionAmount,
            Symbol("max") => self.parseSafeNumber(safeString(market, "maxBaseOrderSize"))
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => precisionPrice,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseSafeNumber(safeString(market, "minOrderValue")),
            Symbol("max") => self.parseSafeNumber(safeString(market, "maxOrderValue"))
        )
    ),
    Symbol("created") => safeInteger(market, "listTime"),
    Symbol("info") => market
))

end
function fetchMarkets(self::Phemex, params=Dict())
    v2ProductsPromise = self.v2GetPublicProducts(params);
    v1ProductsPromise = self.v1GetExchangePublicProducts(params);
    (v2Products, v1Products) = (Base.fetch(asyncmap(Base.fetch, [v2ProductsPromise, v1ProductsPromise])));
    v1ProductsData = safeValue(v1Products, "data", []);
    v2ProductsData = self.safeDict(v2Products, "data", Dict{Symbol, Any}());
    products = self.safeList(v2ProductsData, "products", []);
    perpetualProductsV2 = self.safeList(v2ProductsData, "perpProductsV2", []);
    products = arrayConcat(products, perpetualProductsV2);
    riskLimits = self.safeList(v2ProductsData, "riskLimits", []);
    riskLimitsV2 = self.safeList(v2ProductsData, "riskLimitsV2", []);
    riskLimits = arrayConcat(riskLimits, riskLimitsV2);
    currencies = self.safeList(v2ProductsData, "currencies", []);
    riskLimitsById = indexBy(riskLimits, "symbol");
    v1ProductsById = indexBy(v1ProductsData, "symbol");
    currenciesByCode = indexBy(currencies, "currency");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(products)))
        market = get(products, i + 1, nothing);
        type_var = safeStringLower(market, "type");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "perpetual"), (type_var == "perpetualv2")), (type_var == "perpetualpilot")))
            id = safeString(market, "symbol");
            riskLimitValues = self.safeDict(riskLimitsById, id, Dict{Symbol, Any}());
            market = extend(market, riskLimitValues);
            v1ProductsValues = self.safeDict(v1ProductsById, id, Dict{Symbol, Any}());
            market = extend(market, v1ProductsValues);
            market = self.parseSwapMarket(market);
        else
            baseCurrency = safeString(market, "baseCurrency");
            currencyValues = self.safeDict(currenciesByCode, baseCurrency, Dict{Symbol, Any}());
            valueScale = safeString(currencyValues, "valueScale", "8");
            market = extend(market, Dict{Symbol, Any}(
    Symbol("valueScale") => valueScale
));
            market = self.parseSpotMarket(market);
        end
        push!(result, market);
        i += 1
    end
    return result

end
function fetchCurrencies(self::Phemex, params=Dict())
    response = Base.fetch(self.v2GetPublicProducts(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    currencies = safeValue(data, "currencies", []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Phemex, rawCurrency)
    id = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(id);
    valueScaleString = safeString(rawCurrency, "valueScale");
    valueScale = ccxt_parseInt(valueScaleString);
    minValueEv = safeString(rawCurrency, "minValueEv");
    maxValueEv = safeString(rawCurrency, "maxValueEv");
    minAmount = nothing;
    maxAmount = nothing;
    precision = nothing;
    if functions.ccxtruthy(valueScale != nothing)
        precisionString = self.parsePrecision(valueScaleString);
        precision = self.parseNumber(precisionString);
        minAmount = self.parseNumber(stringMul(minValueEv, precisionString));
        maxAmount = self.parseNumber(stringMul(maxValueEv, precisionString));
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("active") => safeString(rawCurrency, "status") == "Listed",
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => maxAmount
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("valueScale") => valueScale,
    Symbol("networks") => nothing,
    Symbol("type") => "crypto"
))

end
function customParseBidAsk(self::Phemex, bidask, priceKey=0, amountKey=1, market=nothing)
    if functions.ccxtruthy(market == nothing)
        throw(ArgumentsRequired(string(self.id, " customParseBidAsk() requires a market argument")));
    end
    amount = safeString(bidask, amountKey);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        amount = self.fromEv(amount, market);
    end
    return [self.parseNumber(self.fromEp(safeString(bidask, priceKey), market)), self.parseNumber(amount)]

end
function customParseOrderBook(self::Phemex, orderbook, symbol, timestamp=nothing, bidsKey="bids", asksKey="asks", priceKey=0, amountKey=1, market=nothing)
    result = Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp),
        Symbol("nonce") => nothing
    );
    sides = [bidsKey, asksKey];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(sides)))
        side = get(sides, i + 1, nothing);
        orders = [];
        bidasks = safeValue(orderbook, side);
        k = 0
        while functions.ccxtruthy(functions.ccxt_lt(k, length(bidasks)))
            push!(orders, self.customParseBidAsk(get(bidasks, k + 1, nothing), priceKey, amountKey, market));
            k += 1
        end
        result[Symbol(side)] = orders;
        i += 1
    end
    result[Symbol(bidsKey)] = sortBy(get(result, Symbol(bidsKey), nothing), 0, true);
    result[Symbol(asksKey)] = sortBy(get(result, Symbol(asksKey), nothing), 0);
    return result

end
function fetchOrderBook(self::Phemex, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isStableSettled = @functions.ccxt_or((get(market, Symbol("settle"), nothing) == "USDT"), (get(market, Symbol("settle"), nothing) == "USDC"));
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("linear"), nothing), isStableSettled))
        response = Base.fetch(self.v2GetMdV2Orderbook(extend(request, params)));
    else
        if functions.ccxtruthy(@functions.ccxt_and((limit != nothing), (functions.ccxt_le(limit, 30))))
            response = Base.fetch(self.v1GetMdOrderbook(extend(request, params)));
        else
            response = Base.fetch(self.v1GetMdFullbook(extend(request, params)));
        end
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    book = safeValue2(result, "book", "orderbook_p", Dict{Symbol, Any}());
    timestamp = safeIntegerProduct(result, "timestamp", 0.000001);
    orderbook = self.customParseOrderBook(book, symbol, timestamp, "bids", "asks", 0, 1, market);
    orderbook[Symbol("nonce")] = safeInteger(result, "sequence");
    return orderbook

end
function toEn(self::Phemex, n, scale)
    stringN = numberToString(n);
    precise = Precise(stringN);
    precise.decimals = get(precise, Symbol("decimals"), nothing) - scale;
    reduce(precise);
    preciseString = string(precise);
    return self.parseToNumeric(preciseString)

end
function toEv(self::Phemex, amount, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_or((amount == nothing), (market == nothing)))
            return amount
    end
    return self.toEn(amount, get(market, Symbol("valueScale"), nothing))

end
function toEp(self::Phemex, price, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_or((price == nothing), (market == nothing)))
            return price
    end
    return self.toEn(price, get(market, Symbol("priceScale"), nothing))

end
function fromEn(self::Phemex, en, scale)
    if functions.ccxtruthy(@functions.ccxt_or(en == nothing, scale == nothing))
            return nothing
    end
    precise = Precise(en);
    precise.decimals = self.sum(get(precise, Symbol("decimals"), nothing), scale);
    reduce(precise);
    return string(precise)

end
function fromEp(self::Phemex, ep, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_or((ep == nothing), (market == nothing)))
            return ep
    end
    return self.fromEn(ep, safeInteger(market, "priceScale"))

end
function fromEv(self::Phemex, ev, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_or((ev == nothing), (market == nothing)))
            return ev
    end
    return self.fromEn(ev, safeInteger(market, "valueScale"))

end
function fromEr(self::Phemex, er, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_or((er == nothing), (market == nothing)))
            return er
    end
    return self.fromEn(er, safeInteger(market, "ratioScale"))

end
function parseOHLCV(self::Phemex, ohlcv, market=nothing)
    if functions.ccxtruthy(@functions.ccxt_and((market != nothing), get(market, Symbol("spot"), nothing)))
        baseVolume = self.parseNumber(self.fromEv(safeString(ohlcv, 7), market));
    else
        baseVolume = self.safeNumber(ohlcv, 7);
    end
    return [safeTimestamp(ohlcv, 0), self.parseNumber(self.fromEp(safeString(ohlcv, 3), market)), self.parseNumber(self.fromEp(safeString(ohlcv, 4), market)), self.parseNumber(self.fromEp(safeString(ohlcv, 5), market)), self.parseNumber(self.fromEp(safeString(ohlcv, 6), market)), baseVolume]

end
function fetchOHLCV(self::Phemex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    userLimit = limit;
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    until = safeInteger2(params, "until", "to");
    params = omit(params, ["until"]);
    isStableSettled = @functions.ccxt_or((get(market, Symbol("settle"), nothing) == "USDT"), (get(market, Symbol("settle"), nothing) == "USDC"));
    usesSpecialFromToEndpoint = @functions.ccxt_and(((@functions.ccxt_or(get(market, Symbol("linear"), nothing), isStableSettled))), (@functions.ccxt_or((since != nothing), (until != nothing))));
    maxLimit = 1000;
    if functions.ccxtruthy(usesSpecialFromToEndpoint)
        maxLimit = 2000;
    end
    if functions.ccxtruthy(limit == nothing)
        limit = maxLimit;
    end
    request[Symbol("limit")] = min(limit, maxLimit);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("linear"), nothing), isStableSettled))
        if functions.ccxtruthy(@functions.ccxt_or((until != nothing), (since != nothing)))
            candleDuration = self.parseTimeframe(timeframe);
            if functions.ccxtruthy(since != nothing)
                since = round(since / 1000);
                request[Symbol("from")] = since;
            else
                since = (until / 100) - (maxLimit * candleDuration);
            end
            if functions.ccxtruthy(until != nothing)
                request[Symbol("to")] = round(until / 1000);
            else
                to = since + (maxLimit * candleDuration);
                now = seconds();
                if functions.ccxtruthy(functions.ccxt_gt(to, now))
                    to = now;
                end
                request[Symbol("to")] = to;
            end
            response = Base.fetch(self.publicGetMdV2KlineList(extend(request, params)));
        else
            response = Base.fetch(self.publicGetMdV2KlineLast(extend(request, params)));
        end
    else
        if functions.ccxtruthy(since != nothing)
            duration = self.parseTimeframe(timeframe) * 1000;
            timeDelta = milliseconds() - since;
            limit = self.parseToInt(timeDelta / duration);
        end
        response = Base.fetch(self.publicGetMdV2Kline(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseOHLCVs(rows, market, timeframe, since, userLimit)

end
function parseTicker(self::Phemex, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeIntegerProduct(ticker, "timestamp", 0.000001);
    last_var = self.fromEp(safeString2(ticker, "lastEp", "closeRp"), market);
    quoteVolume = self.fromEr(safeString2(ticker, "turnoverEv", "turnoverRv"), market);
    baseVolume = safeString(ticker, "volume");
    if functions.ccxtruthy(baseVolume == nothing)
        baseVolume = self.fromEv(safeString2(ticker, "volumeEv", "volumeRq"), market);
    end
    open = self.fromEp(safeString(ticker, "openEp"), market);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => self.fromEp(safeString2(ticker, "highEp", "highRp"), market),
    Symbol("low") => self.fromEp(safeString2(ticker, "lowEp", "lowRp"), market),
    Symbol("bid") => self.fromEp(safeString(ticker, "bidEp"), market),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => self.fromEp(safeString(ticker, "askEp"), market),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Phemex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("inverse"), nothing), get(market, Symbol("settle"), nothing) == "USD"))
            response = Base.fetch(self.v1GetMdTicker24hr(extend(request, params)));
        else
            response = Base.fetch(self.v2GetMdV2Ticker24hr(extend(request, params)));
        end
    else
        response = Base.fetch(self.v1GetMdSpotTicker24hr(extend(request, params)));
    end
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTicker(result, market)

end
function fetchTickers(self::Phemex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        first_var = safeValue(symbols, 0);
        market = self.market(first_var);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market, params);
    query = omit(params, "type");
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.v1GetMdSpotTicker24hrAll(query));
    elseif functions.ccxtruthy(@functions.ccxt_or(subType == "inverse", safeString(market, "settle") == "USD"))
        response = Base.fetch(self.v1GetMdTicker24hrAll(query));
    else
        response = Base.fetch(self.v2GetMdV2Ticker24hrAll(query));
    end
    result = self.safeList(response, "result", []);
    return self.parseTickers(result, symbols)

end
function fetchTrades(self::Phemex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isStableSettled = @functions.ccxt_or((get(market, Symbol("settle"), nothing) == "USDT"), (get(market, Symbol("settle"), nothing) == "USDC"));
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("linear"), nothing), isStableSettled))
        response = Base.fetch(self.v2GetMdV2Trade(extend(request, params)));
    else
        response = Base.fetch(self.v1GetMdTrade(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    trades = safeValue2(result, "trades", "trades_p", []);
    return self.parseTrades(trades, market, since, limit)

end
function parseTrade(self::Phemex, trade, market=nothing)
    id = nothing;
    side = nothing;
    costString = nothing;
    type_var = nothing;
    fee = nothing;
    feeCostString = nothing;
    feeRateString = nothing;
    feeCurrencyCode = nothing;
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    orderId = nothing;
    takerOrMaker = nothing;
    if functions.ccxtruthy(functions.ccxt_isArray(trade))
        tradeLength = length(trade);
        timestamp = safeIntegerProduct(trade, 0, 0.000001);
        if functions.ccxtruthy(functions.ccxt_gt(tradeLength, 4))
            id = safeString(trade, tradeLength - 4);
        end
        side = safeStringLower(trade, tradeLength - 3);
        priceString = safeString(trade, tradeLength - 2);
        amountString = safeString(trade, tradeLength - 1);
        if functions.ccxtruthy(isa(get(trade, tradeLength - 2 + 1, nothing), Number))
            priceString = self.fromEp(priceString, market);
            amountString = self.fromEv(amountString, market);
        end
    else
        timestamp = safeIntegerProduct(trade, "transactTimeNs", 0.000001);
        if functions.ccxtruthy(timestamp == nothing)
            timestamp = safeInteger(trade, "createdAt");
        end
        id = safeString2(trade, "execId", "execID");
        orderId = safeString(trade, "orderID");
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
            sideId = safeStringLower(trade, "side");
            if functions.ccxtruthy(@functions.ccxt_or((sideId == "buy"), (sideId == "sell")))
                side = sideId;
            elseif functions.ccxtruthy(sideId != nothing)
                side = functions.ccxtruthy((sideId == "1")) ? "buy" : "sell";
            end
            ordType = safeString(trade, "ordType");
            if functions.ccxtruthy(ordType == "1")
                type_var = "market";
            elseif functions.ccxtruthy(ordType == "2")
                type_var = "limit";
            end
            priceString = safeString(trade, "execPriceRp");
            amountString = safeString(trade, "execQtyRq");
            costString = safeString(trade, "execValueRv");
            feeCostString = omitZero(safeString(trade, "execFeeRv"));
            feeRateString = safeString(trade, "feeRateRr");
            if functions.ccxtruthy(feeCostString != nothing)
                currencyId = safeString(trade, "currency");
                feeCurrencyCode = self.safeCurrencyCode(currencyId);
            else
                ptFeeRv = omitZero(safeString(trade, "ptFeeRv"));
                if functions.ccxtruthy(ptFeeRv != nothing)
                    feeCostString = ptFeeRv;
                    feeCurrencyCode = "PT";
                end
            end
        else
            side = safeStringLower(trade, "side");
            type_var = self.parseOrderType(safeString(trade, "ordType"));
            execStatus = safeString(trade, "execStatus");
            if functions.ccxtruthy(execStatus == "MakerFill")
                takerOrMaker = "maker";
            end
            priceString = self.fromEp(safeString(trade, "execPriceEp"), market);
            amountString = self.fromEv(safeString(trade, "execBaseQtyEv"), market);
            amountString = safeString(trade, "execQty", amountString);
            costString = self.fromEr(safeString2(trade, "execQuoteQtyEv", "execValueEv"), market);
            feeCostString = self.fromEr(omitZero(safeString(trade, "execFeeEv")), market);
            if functions.ccxtruthy(feeCostString != nothing)
                feeRateString = self.fromEr(safeString(trade, "feeRateEr"), market);
                if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
                    feeCurrencyCode = self.safeCurrencyCode(safeString(trade, "feeCurrency"));
                else
                    info = safeValue(market, "info");
                    if functions.ccxtruthy(info != nothing)
                        settlementCurrencyId = safeString(info, "settlementCurrency");
                        feeCurrencyCode = self.safeCurrencyCode(settlementCurrencyId);
                    end
                end
            else
                feeCostString = safeString(trade, "ptFeeRv");
                if functions.ccxtruthy(feeCostString != nothing)
                    feeCurrencyCode = "PT";
                end
            end
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("rate") => feeRateString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market)

end
function parseSpotBalance(self::Phemex, response)
    timestamp = nothing;
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = safeValue(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        balance = get(data, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        currency = safeValue(self.currencies, code, Dict{Symbol, Any}());
        scale = safeInteger(currency, "valueScale", 8);
        account = self.account();
        balanceEv = safeString(balance, "balanceEv");
        lockedTradingBalanceEv = safeString(balance, "lockedTradingBalanceEv");
        lockedWithdrawEv = safeString(balance, "lockedWithdrawEv");
        total = self.fromEn(balanceEv, scale);
        lockedTradingBalance = self.fromEn(lockedTradingBalanceEv, scale);
        lockedWithdraw = self.fromEn(lockedWithdrawEv, scale);
        used = stringAdd(lockedTradingBalance, lockedWithdraw);
        lastUpdateTimeNs = safeIntegerProduct(balance, "lastUpdateTimeNs", 0.000001);
        timestamp = functions.ccxtruthy((timestamp == nothing)) ? lastUpdateTimeNs : max(timestamp, lastUpdateTimeNs);
        account[Symbol("total")] = total;
        account[Symbol("used")] = used;
        result[Symbol(code)] = account;
        i += 1
    end
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
function parseSwapBalance(self::Phemex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = safeValue(response, "data", Dict{Symbol, Any}());
    balance = safeValue(data, "account", Dict{Symbol, Any}());
    currencyId = safeString(balance, "currency");
    code = self.safeCurrencyCode(currencyId);
    currency = self.currency(code);
    valueScale = safeInteger(currency, "valueScale", 8);
    account = self.account();
    accountBalanceEv = safeString2(balance, "accountBalanceEv", "accountBalanceRv");
    totalUsedBalanceEv = safeString2(balance, "totalUsedBalanceEv", "totalUsedBalanceRv");
    needsConversion = (code != "USDT");
    account[Symbol("total")] = functions.ccxtruthy(needsConversion) ? self.fromEn(accountBalanceEv, valueScale) : accountBalanceEv;
    account[Symbol("used")] = functions.ccxtruthy(needsConversion) ? self.fromEn(totalUsedBalanceEv, valueScale) : totalUsedBalanceEv;
    result[Symbol(code)] = account;
    return self.safeBalance(result)

end
function fetchBalance(self::Phemex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    code = safeString(params, "code");
    params = omit(params, ["code"]);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and((type_var != "spot"), (type_var != "swap")))
        throw(BadRequest(string(self.id, " does not support ", type_var, " markets, only spot and swap")));
    end
    if functions.ccxtruthy(type_var == "swap")
        settle = nothing;
        (settle, params) = self.handleOptionAndParams(params, "fetchBalance", "settle", "USDT");
        if functions.ccxtruthy(@functions.ccxt_or(code != nothing, settle != nothing))
            coin = nothing;
            if functions.ccxtruthy(code != nothing)
                coin = code;
            else
                coin = settle;
            end
            currency = self.currency(coin);
            request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
            if functions.ccxtruthy(get(currency, Symbol("id"), nothing) == "USDT")
                response = Base.fetch(self.privateGetGAccountsAccountPositions(extend(request, params)));
            else
                response = Base.fetch(self.privateGetAccountsAccountPositions(extend(request, params)));
            end
        else
            currency = safeString(params, "currency");
            if functions.ccxtruthy(currency == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchBalance() requires a code parameter or a currency or settle parameter for ", type_var, " type")));
            end
            response = Base.fetch(self.privateGetSpotWallets(extend(request, params)));
        end
    else
        response = Base.fetch(self.privateGetSpotWallets(extend(request, params)));
    end
    if functions.ccxtruthy(type_var == "swap")
            return self.parseSwapBalance(response)
    end
    return self.parseSpotBalance(response)

end
function parseOrderStatus(self::Phemex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Created") => "open",
        Symbol("Untriggered") => "open",
        Symbol("Deactivated") => "closed",
        Symbol("Triggered") => "open",
        Symbol("Rejected") => "rejected",
        Symbol("New") => "open",
        Symbol("PartiallyFilled") => "open",
        Symbol("Filled") => "closed",
        Symbol("Canceled") => "canceled",
        Symbol("Suspended") => "canceled",
        Symbol("1") => "open",
        Symbol("2") => "canceled",
        Symbol("3") => "closed",
        Symbol("4") => "canceled",
        Symbol("5") => "open",
        Symbol("6") => "open",
        Symbol("7") => "closed",
        Symbol("8") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Phemex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "market",
        Symbol("2") => "limit",
        Symbol("3") => "stop",
        Symbol("4") => "stopLimit",
        Symbol("5") => "market",
        Symbol("6") => "limit",
        Symbol("7") => "market",
        Symbol("8") => "market",
        Symbol("9") => "stopLimit",
        Symbol("10") => "market",
        Symbol("Limit") => "limit",
        Symbol("Market") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseTimeInForce(self::Phemex, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GoodTillCancel") => "GTC",
        Symbol("PostOnly") => "PO",
        Symbol("ImmediateOrCancel") => "IOC",
        Symbol("FillOrKill") => "FOK"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseSpotOrder(self::Phemex, order, market=nothing)
    id = safeString(order, "orderID");
    clientOrderId = safeString(order, "clOrdID");
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId != nothing), (functions.ccxt_lt(length(clientOrderId), 1))))
        clientOrderId = nothing;
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = self.fromEp(safeString(order, "priceEp"), market);
    amount = self.fromEv(safeString(order, "baseQtyEv"), market);
    remaining = omitZero(self.fromEv(safeString(order, "leavesBaseQtyEv"), market));
    filled = self.fromEv(safeString2(order, "cumBaseQtyEv", "cumBaseValueEv"), market);
    cost = self.fromEr(safeString2(order, "cumQuoteValueEv", "quoteQtyEv"), market);
    average = self.fromEp(safeString(order, "avgPriceEp"), market);
    status = self.parseOrderStatus(safeString(order, "ordStatus"));
    side = safeStringLower(order, "side");
    type_var = self.parseOrderType(safeString(order, "ordType"));
    timestamp = safeIntegerProduct2(order, "actionTimeNs", "createTimeNs", 0.000001);
    fee = nothing;
    feeCost = self.fromEv(safeString(order, "cumFeeEv"), market);
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => self.safeCurrencyCode(safeString(order, "feeCurrency"))
        );
    end
    timeInForce = self.parseTimeInForce(safeString(order, "timeInForce"));
    triggerPrice = self.parseNumber(omitZero(self.fromEp(safeString(order, "stopPxEp"))));
    postOnly = (timeInForce == "PO");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function parseOrderSide(self::Phemex, side)
    sides = Dict{Symbol, Any}(
        Symbol("1") => "buy",
        Symbol("2") => "sell"
    );
    return safeString(sides, side, side)

end
function parseSwapOrder(self::Phemex, order, market=nothing)
    id = safeString2(order, "orderID", "orderId");
    clientOrderId = safeString2(order, "clOrdID", "clOrdId");
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId != nothing), (functions.ccxt_lt(length(clientOrderId), 1))))
        clientOrderId = nothing;
    end
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market);
    market = self.safeMarket(marketId, market);
    status = self.parseOrderStatus(safeString(order, "ordStatus"));
    side = self.parseOrderSide(safeStringLower(order, "side"));
    type_var = self.parseOrderType(safeString(order, "orderType"));
    price = safeString(order, "priceRp");
    if functions.ccxtruthy(price == nothing)
        price = self.fromEp(safeString(order, "priceEp"), market);
    end
    amount = self.safeNumber2(order, "orderQty", "orderQtyRq");
    filled = self.safeNumber2(order, "cumQty", "cumQtyRq");
    remaining = self.safeNumber2(order, "leavesQty", "leavesQtyRq");
    timestamp = safeIntegerProduct(order, "actionTimeNs", 0.000001);
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(order, "createdAt");
    end
    cost = self.safeNumber2(order, "cumValue", "cumValueRv");
    lastTradeTimestamp = safeIntegerProduct(order, "transactTimeNs", 0.000001);
    if functions.ccxtruthy(lastTradeTimestamp == 0)
        lastTradeTimestamp = nothing;
    end
    timeInForce = self.parseTimeInForce(safeString(order, "timeInForce"));
    triggerPrice = omitZero(safeString2(order, "stopPx", "stopPxRp"));
    postOnly = (timeInForce == "PO");
    reduceOnly = safeValue(order, "reduceOnly");
    execInst = safeString(order, "execInst");
    if functions.ccxtruthy(execInst == "ReduceOnly")
        reduceOnly = true;
    end
    takeProfit = safeString(order, "takeProfitRp");
    stopLoss = safeString(order, "stopLossRp");
    feeValue = omitZero(safeString(order, "execFeeRv"));
    ptFeeRv = omitZero(safeString(order, "ptFeeRv"));
    fee = nothing;
    if functions.ccxtruthy(feeValue != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeValue,
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    elseif functions.ccxtruthy(ptFeeRv != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => ptFeeRv,
            Symbol("currency") => "PT"
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfit,
    Symbol("stopLossPrice") => stopLoss,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("cost") => cost,
    Symbol("average") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
))

end
function parseOrder(self::Phemex, order, market=nothing)
    isSwap = self.safeBool(market, "swap", false);
    hasPnl = @functions.ccxt_or(@functions.ccxt_or((ccxt_in("closedPnl", order)), (ccxt_in("closedPnlRv", order))), (ccxt_in("totalPnlRv", order)));
    if functions.ccxtruthy(@functions.ccxt_or(isSwap, hasPnl))
            return self.parseSwapOrder(order, market)
    end
    return self.parseSpotOrder(order, market)

end
function createOrder(self::Phemex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    requestSide = capitalize(side);
    type_var = capitalize(type_var);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => requestSide,
        Symbol("ordType") => type_var
    );
    clientOrderId = safeString2(params, "clOrdID", "clientOrderId");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    isStableSettled = @functions.ccxt_or((get(market, Symbol("settle"), nothing) == "USDT"), (get(market, Symbol("settle"), nothing) == "USDC"));
    if functions.ccxtruthy(clientOrderId == nothing)
        brokerId = safeString(self.options, "brokerId", "CCXT123456");
        if functions.ccxtruthy(brokerId != nothing)
            request[Symbol("clOrdID")] = string(brokerId, uuid16());
        end
    else
        request[Symbol("clOrdID")] = clientOrderId;
        params = omit(params, ["clOrdID", "clientOrderId"]);
    end
    triggerPrice = safeStringN(params, ["stopPx", "stopPrice", "triggerPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("stopPxRp")] = self.priceToPrecision(symbol, triggerPrice);
        else
            request[Symbol("stopPxEp")] = self.toEp(triggerPrice, market);
        end
    end
    params = omit(params, ["stopPx", "stopPrice", "stopLoss", "takeProfit", "triggerPrice"]);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        qtyType = safeValue(params, "qtyType", "ByBase");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "Market"), (type_var == "Stop")), (type_var == "MarketIfTouched")))
            if functions.ccxtruthy(price != nothing)
                qtyType = "ByQuote";
            end
        end
        if functions.ccxtruthy(triggerPrice != nothing)
            if functions.ccxtruthy(type_var == "Limit")
                request[Symbol("ordType")] = "StopLimit";
            elseif functions.ccxtruthy(type_var == "Market")
                request[Symbol("ordType")] = "Stop";
            end
            request[Symbol("trigger")] = "ByLastPrice";
        end
        request[Symbol("qtyType")] = qtyType;
        if functions.ccxtruthy(qtyType == "ByQuote")
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(get(self.options, Symbol("createOrderByQuoteRequiresPrice"), nothing))
                if functions.ccxtruthy(price != nothing)
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteAmount = stringMul(amountString, priceString);
                    cost = self.parseNumber(quoteAmount);
                elseif functions.ccxtruthy(cost == nothing)
                    throw(ArgumentsRequired(string(self.id, " createOrder() ", qtyType, " requires a price argument or a cost parameter")));
                end
            end
            cost = functions.ccxtruthy((cost == nothing)) ? amount : cost;
            costString = numberToString(cost);
            request[Symbol("quoteQtyEv")] = self.toEv(costString, market);
        else
            amountString = numberToString(amount);
            request[Symbol("baseQtyEv")] = self.toEv(amountString, market);
        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        hedged = self.safeBool(params, "hedged", false);
        params = omit(params, "hedged");
        posSide = safeStringLower(params, "posSide");
        if functions.ccxtruthy(posSide == nothing)
            if functions.ccxtruthy(hedged)
                reduceOnly = self.safeBool(params, "reduceOnly");
                if functions.ccxtruthy(reduceOnly)
                    side = functions.ccxtruthy((side == "buy")) ? "sell" : "buy";
                    params = omit(params, "reduceOnly");
                end
                posSide = functions.ccxtruthy((side == "buy")) ? "Long" : "Short";
            else
                posSide = "Merged";
            end
        end
        posSide = capitalize(posSide);
        request[Symbol("posSide")] = posSide;
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("orderQtyRq")] = amount;
        else
            request[Symbol("orderQty")] = self.parseToInt(amount);
        end
        if functions.ccxtruthy(triggerPrice != nothing)
            triggerType = safeString(params, "triggerType", "ByMarkPrice");
            request[Symbol("triggerType")] = triggerType;
            triggerDirection = nothing;
            (triggerDirection, params) = self.handleParamString(params, "triggerDirection");
            if functions.ccxtruthy(triggerDirection == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() also requires a 'triggerDirection' parameter with either 'ascending' or 'descending' value")));
            end
            if functions.ccxtruthy(@functions.ccxt_or(triggerDirection == "ascending", triggerDirection == "up"))
                if functions.ccxtruthy(side == "sell")
                    request[Symbol("ordType")] = functions.ccxtruthy((type_var == "Market")) ? "MarketIfTouched" : "LimitIfTouched";
                elseif functions.ccxtruthy(side == "buy")
                    request[Symbol("ordType")] = functions.ccxtruthy((type_var == "Market")) ? "Stop" : "StopLimit";
                end
            elseif functions.ccxtruthy(@functions.ccxt_or(triggerDirection == "descending", triggerDirection == "down"))
                if functions.ccxtruthy(side == "sell")
                    request[Symbol("ordType")] = functions.ccxtruthy((type_var == "Market")) ? "Stop" : "StopLimit";
                elseif functions.ccxtruthy(side == "buy")
                    request[Symbol("ordType")] = functions.ccxtruthy((type_var == "Market")) ? "MarketIfTouched" : "LimitIfTouched";
                end
            end
        end
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            if functions.ccxtruthy(hasStopLoss)
                stopLossTriggerPrice = safeValue2(stopLoss, "triggerPrice", "stopPrice");
                if functions.ccxtruthy(stopLossTriggerPrice == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a trigger price in params[\"stopLoss\"][\"triggerPrice\"] for a stop loss order")));
                end
                if functions.ccxtruthy(isStableSettled)
                    request[Symbol("stopLossRp")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
                else
                    request[Symbol("stopLossEp")] = self.toEp(stopLossTriggerPrice, market);
                end
                stopLossTriggerPriceType = safeString2(stopLoss, "triggerPriceType", "slTrigger");
                if functions.ccxtruthy(stopLossTriggerPriceType != nothing)
                    request[Symbol("slTrigger")] = safeString(get(self.options, Symbol("triggerPriceTypesMap"), nothing), stopLossTriggerPriceType, stopLossTriggerPriceType);
                end
                slLimitPrice = safeString(stopLoss, "price");
                if functions.ccxtruthy(slLimitPrice != nothing)
                    request[Symbol("slPxRp")] = self.priceToPrecision(symbol, slLimitPrice);
                end
            end
            if functions.ccxtruthy(hasTakeProfit)
                takeProfitTriggerPrice = safeValue2(takeProfit, "triggerPrice", "stopPrice");
                if functions.ccxtruthy(takeProfitTriggerPrice == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a trigger price in params[\"takeProfit\"][\"triggerPrice\"] for a take profit order")));
                end
                if functions.ccxtruthy(isStableSettled)
                    request[Symbol("takeProfitRp")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
                else
                    request[Symbol("takeProfitEp")] = self.toEp(takeProfitTriggerPrice, market);
                end
                takeProfitTriggerPriceType = safeString2(takeProfit, "triggerPriceType", "tpTrigger");
                if functions.ccxtruthy(takeProfitTriggerPriceType != nothing)
                    request[Symbol("tpTrigger")] = safeString(get(self.options, Symbol("triggerPriceTypesMap"), nothing), takeProfitTriggerPriceType, takeProfitTriggerPriceType);
                end
                tpLimitPrice = safeString(takeProfit, "price");
                if functions.ccxtruthy(tpLimitPrice != nothing)
                    request[Symbol("tpPxRp")] = self.priceToPrecision(symbol, tpLimitPrice);
                end
            end
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "Limit"), (type_var == "StopLimit")), (type_var == "LimitIfTouched")))
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("priceRp")] = self.priceToPrecision(symbol, price);
        else
            priceString = numberToString(price);
            request[Symbol("priceEp")] = self.toEp(priceString, market);
        end
    end
    takeProfitPrice = safeString(params, "takeProfitPrice");
    if functions.ccxtruthy(takeProfitPrice != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("takeProfitRp")] = self.priceToPrecision(symbol, takeProfitPrice);
        else
            request[Symbol("takeProfitEp")] = self.toEp(takeProfitPrice, market);
        end
        params = omit(params, "takeProfitPrice");
    end
    stopLossPrice = safeString(params, "stopLossPrice");
    if functions.ccxtruthy(stopLossPrice != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("stopLossRp")] = self.priceToPrecision(symbol, stopLossPrice);
        else
            request[Symbol("stopLossEp")] = self.toEp(stopLossPrice, market);
        end
        params = omit(params, "stopLossPrice");
    end
    if functions.ccxtruthy(isStableSettled)
        response = Base.fetch(self.privatePostGOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        response = Base.fetch(self.privatePostOrders(extend(request, params)));
    else
        response = Base.fetch(self.privatePostSpotOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function editOrder(self::Phemex, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "clOrdID");
    params = omit(params, ["clientOrderId", "clOrdID"]);
    isStableSettled = @functions.ccxt_or((get(market, Symbol("settle"), nothing) == "USDT"), (get(market, Symbol("settle"), nothing) == "USDC"));
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdID")] = clientOrderId;
    else
        request[Symbol("orderID")] = id;
    end
    if functions.ccxtruthy(price != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("priceRp")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
        else
            request[Symbol("priceEp")] = self.toEp(price, market);
        end
    end
    finalQty = safeString(params, "baseQtyEv");
    params = omit(params, ["baseQtyEv"]);
    if functions.ccxtruthy(finalQty != nothing)
        request[Symbol("baseQtyEV")] = finalQty;
    elseif functions.ccxtruthy(amount != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("orderQtyRq")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        else
            request[Symbol("baseQtyEV")] = self.toEv(amount, market);
        end
    end
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPx", "stopPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(isStableSettled)
            request[Symbol("stopPxRp")] = self.priceToPrecision(symbol, triggerPrice);
        else
            request[Symbol("stopPxEp")] = self.toEp(triggerPrice, market);
        end
    end
    params = omit(params, ["triggerPrice", "stopPx", "stopPrice"]);
    if functions.ccxtruthy(isStableSettled)
        posSide = safeString(params, "posSide");
        if functions.ccxtruthy(posSide == nothing)
            request[Symbol("posSide")] = "Merged";
        end
        response = Base.fetch(self.privatePutGOrdersReplace(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privatePutOrdersReplace(extend(request, params)));
    else
        response = Base.fetch(self.privatePutSpotOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function cancelOrder(self::Phemex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "clOrdID");
    params = omit(params, ["clientOrderId", "clOrdID"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdID")] = clientOrderId;
    else
        request[Symbol("orderID")] = id;
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
        posSide = safeString(params, "posSide");
        if functions.ccxtruthy(posSide == nothing)
            request[Symbol("posSide")] = "Merged";
        end
        response = Base.fetch(self.privateDeleteGOrdersCancel(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateDeleteOrdersCancel(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteSpotOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function cancelAllOrders(self::Phemex, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    trigger = safeValue2(params, "stop", "trigger", false);
    params = omit(params, ["stop", "trigger"]);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(trigger)
        request[Symbol("untriggerred")] = trigger;
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
        response = Base.fetch(self.privateDeleteGOrdersAll(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateDeleteOrdersAll(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteSpotOrdersAll(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrder(self::Phemex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "clOrdID");
    params = omit(params, ["clientOrderId", "clOrdID"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdID")] = clientOrderId;
    else
        request[Symbol("orderID")] = id;
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
        response = Base.fetch(self.privateGetApiDataGFuturesOrdersByOrderId(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateGetApiDataSpotsOrdersByOrderId(extend(request, params)));
    else
        response = Base.fetch(self.privateGetExchangeOrder(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    order = data;
    if functions.ccxtruthy(functions.ccxt_isArray(data))
        numOrders = length(data);
        if functions.ccxtruthy(functions.ccxt_lt(numOrders, 1))
            if functions.ccxtruthy(clientOrderId != nothing)
                throw(OrderNotFound(string(self.id, " fetchOrder() ", symbol, " order with clientOrderId ", clientOrderId, " not found")));
            else
                throw(OrderNotFound(string(self.id, " fetchOrder() ", symbol, " order with id ", id, " not found")));
            end
        end
        order = self.safeDict(data, 0, Dict{Symbol, Any}());
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        rows = self.safeList(data, "rows", []);
        order = self.safeDict(rows, 0, Dict{Symbol, Any}());
    end
    return self.parseOrder(order, market)

end
function fetchOrders(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
        request[Symbol("currency")] = get(market, Symbol("settle"), nothing);
        response = Base.fetch(self.privateGetExchangeOrderV2OrderList(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateGetExchangeOrderList(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiDataSpotsOrders(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", data);
    return self.parseOrders(rows, market, since, limit)

end
function fetchOpenOrders(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    try
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
            response = Base.fetch(self.privateGetGOrdersActiveList(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            response = Base.fetch(self.privateGetOrdersActiveList(extend(request, params)));
        else
            response = Base.fetch(self.privateGetSpotOrders(extend(request, params)));
        end
    catch e
        if functions.ccxtruthy(isa(e, OrderNotFound))
                return []
        end
        throw(e);

    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    if functions.ccxtruthy(functions.ccxt_isArray(data))
            return self.parseOrders(data, market, since, limit)
    else
        rows = self.safeList(data, "rows", []);
        return self.parseOrders(rows, market, since, limit)
    end

end
function fetchClosedOrders(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(@functions.ccxt_or((symbol == nothing), (safeString(market, "settle") == "USDT")))
        request[Symbol("currency")] = safeString(params, "settle", "USDT");
        response = Base.fetch(self.privateGetExchangeOrderV2OrderList(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and(market != nothing, get(market, Symbol("swap"), nothing)))
        response = Base.fetch(self.privateGetExchangeOrderList(extend(request, params)));
    else
        response = Base.fetch(self.privateGetExchangeSpotOrder(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    if functions.ccxtruthy(functions.ccxt_isArray(data))
            return self.parseOrders(data, market, since, limit)
    else
        rows = self.safeList(data, "rows", []);
        return self.parseOrders(rows, market, since, limit)
    end

end
function fetchMyTrades(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        limit = min(200, limit);
        request[Symbol("limit")] = limit;
    end
    isUSDTSettled = @functions.ccxt_and((type_var != "spot"), (@functions.ccxt_or((symbol == nothing), (safeString(market, "settle") == "USDT"))));
    if functions.ccxtruthy(isUSDTSettled)
        request[Symbol("currency")] = "USDT";
        request[Symbol("offset")] = 0;
        if functions.ccxtruthy(limit == nothing)
            request[Symbol("limit")] = 200;
        end
    elseif functions.ccxtruthy(@functions.ccxt_and(symbol != nothing, market != nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(isUSDTSettled)
        response = Base.fetch(self.privateGetExchangeOrderV2TradingList(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "swap")
        request[Symbol("tradeType")] = "Trade";
        response = Base.fetch(self.privateGetExchangeOrderTrade(extend(request, params)));
    else
        response = Base.fetch(self.privateGetExchangeSpotOrderTrades(extend(request, params)));
    end
    if functions.ccxtruthy(isUSDTSettled)
        data = safeValue(response, "data", []);
    else
        data = safeValue(response, "data", Dict{Symbol, Any}());
        data = safeValue(data, "rows", []);
    end
    return self.parseTrades(data, market, since, limit)

end
function fetchDepositAddress(self::Phemex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    defaultNetworks = self.safeDict(self.options, "defaultNetworks");
    defaultNetwork = safeStringUpper(defaultNetworks, code);
    networks = self.safeDict(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper2(params, "network", "chainName", defaultNetwork);
    network = safeString(networks, network, network);
    if functions.ccxtruthy(network == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires a network parameter")));
    else
        request[Symbol("chainName")] = network;
        params = omit(params, "network");
    end
    response = Base.fetch(self.privateGetExchangeWalletsV2DepositAddress(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    address = safeString(data, "address");
    tag = safeString(data, "tag");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDeposits(self::Phemex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetExchangeWalletsDepositList(params));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawals(self::Phemex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    response = Base.fetch(self.privateGetExchangeWalletsWithdrawList(params));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function parseTransactionStatus(self::Phemex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Success") => "ok",
        Symbol("Succeed") => "ok",
        Symbol("Rejected") => "failed",
        Symbol("Security check failed") => "failed",
        Symbol("SecurityCheckFailed") => "failed",
        Symbol("Expired") => "failed",
        Symbol("Address Risk") => "failed",
        Symbol("Security Checking") => "pending",
        Symbol("SecurityChecking") => "pending",
        Symbol("Pending Review") => "pending",
        Symbol("Pending Transfer") => "pending",
        Symbol("AmlCsApporve") => "pending",
        Symbol("New") => "pending",
        Symbol("Confirmed") => "pending",
        Symbol("Cancelled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Phemex, transaction, currency=nothing)
    id = safeString(transaction, "id");
    address = safeString(transaction, "address");
    tag = nothing;
    txid = safeString(transaction, "txHash");
    currencyId = safeString(transaction, "currency");
    currency = self.safeCurrency(currencyId, currency);
    code = get(currency, Symbol("code"), nothing);
    networkId = safeString(transaction, "chainName");
    timestamp = safeIntegerN(transaction, ["createdAt", "submitedAt", "submittedAt"]);
    type_var = safeStringLower(transaction, "type");
    feeCost = self.parseNumber(self.fromEn(safeString(transaction, "feeEv"), get(currency, Symbol("valueScale"), nothing)));
    if functions.ccxtruthy(feeCost == nothing)
        feeCost = self.safeNumber(transaction, "feeRv");
    end
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        type_var = "withdrawal";
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    amount = self.parseNumber(self.fromEn(safeString(transaction, "amountEv"), get(currency, Symbol("valueScale"), nothing)));
    if functions.ccxtruthy(amount == nothing)
        amount = self.safeNumber(transaction, "amountRv");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
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
function fetchPositions(self::Phemex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    subType = nothing;
    code = safeString2(params, "currency", "code", "USDT");
    params = omit(params, ["currency", "code"]);
    settle = nothing;
    market = nothing;
    firstSymbol = safeString(symbols, 0);
    if functions.ccxtruthy(firstSymbol != nothing)
        market = self.market(firstSymbol);
        settle = get(market, Symbol("settle"), nothing);
        code = get(market, Symbol("settle"), nothing);
    else
        (settle, params) = self.handleOptionAndParams(params, "fetchPositions", "settle", code);
    end
    (subType, params) = self.handleSubTypeAndParams("fetchPositions", market, params);
    isUSDTSettled = settle == "USDT";
    if functions.ccxtruthy(isUSDTSettled)
        code = "USDT";
    elseif functions.ccxtruthy(settle == "BTC")
        code = "BTC";
    else
        if functions.ccxtruthy(code == nothing)
            code = functions.ccxtruthy((subType == "linear")) ? "USD" : "BTC";
        end

    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(isUSDTSettled)
        method = nothing;
        (method, params) = self.handleOptionAndParams(params, "fetchPositions", "method", "privateGetGAccountsAccountPositions");
        if functions.ccxtruthy(method == "privateGetGAccountsAccountPositions")
            response = Base.fetch(self.privateGetGAccountsAccountPositions(extend(request, params)));
        else
            response = Base.fetch(self.privateGetGAccountsPositions(extend(request, params)));
        end
    else
        response = Base.fetch(self.privateGetAccountsAccountPositions(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    positions = safeValue(data, "positions", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        position = get(positions, i + 1, nothing);
        push!(result, self.parsePosition(position));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function fetchPositionHistory(self::Phemex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(200, limit);
    end
    response = Base.fetch(self.privateGetApiDataGFuturesClosedPosition(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data, [symbol]);
    return self.filterBySymbolSinceLimit(positions, symbol, since, limit)

end
function parsePosition(self::Phemex, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    collateral = safeString2(position, "positionMargin", "positionMarginRv");
    notionalString = safeString2(position, "value", "valueRv");
    maintenanceMarginPercentageString = safeString2(position, "maintMarginReq", "maintMarginReqRr");
    maintenanceMarginString = stringMul(notionalString, maintenanceMarginPercentageString);
    initialMarginString = safeString2(position, "assignedPosBalance", "assignedPosBalanceRv");
    initialMarginPercentageString = stringDiv(initialMarginString, notionalString);
    liquidationPrice = self.safeNumber2(position, "liquidationPrice", "liquidationPriceRp");
    markPriceString = safeString2(position, "markPrice", "markPriceRp");
    contracts = safeStringN(position, ["size", "sizeRq", "closedSizeRq"]);
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    leverage = self.parseNumber(stringAbs((safeString2(position, "leverage", "leverageRr"))));
    entryPriceString = safeStringN(position, ["avgEntryPrice", "avgEntryPriceRp", "openPrice"]);
    rawSide = safeString(position, "side");
    side = nothing;
    if functions.ccxtruthy(rawSide != nothing)
        isLong = (@functions.ccxt_or(rawSide == "Buy", rawSide == "1"));
        side = functions.ccxtruthy(isLong) ? "long" : "short";
    end
    priceDiff = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(side == "long")
            priceDiff = stringSub(markPriceString, entryPriceString);
        else
            priceDiff = stringSub(entryPriceString, markPriceString);
        end
    else
        if functions.ccxtruthy(side == "long")
            priceDiff = stringSub(stringDiv("1", entryPriceString), stringDiv("1", markPriceString));
        else
            priceDiff = stringSub(stringDiv("1", markPriceString), stringDiv("1", entryPriceString));
        end
    end
    unrealizedPnl = stringMul(stringMul(priceDiff, contracts), contractSizeString);
    apiUnrealizedPnl = safeString(position, "unRealisedPnlRv", unrealizedPnl);
    marginRatio = stringDiv(maintenanceMarginString, collateral);
    isCross = safeValue(position, "crossMargin");
    timestamp = safeInteger(position, "openedTimeNs");
    lastUpdateTimestamp = safeInteger(position, "updatedTimeNs", safeIntegerProduct(position, "transactTimeNs", 0.000001));
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "execSeq"),
    Symbol("symbol") => symbol,
    Symbol("contracts") => self.parseNumber(contracts),
    Symbol("contractSize") => contractSize,
    Symbol("realizedPnl") => self.safeNumber2(position, "curTermRealisedPnlRv", "realizedPnlRv"),
    Symbol("unrealizedPnl") => self.parseNumber(apiUnrealizedPnl),
    Symbol("leverage") => leverage,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("collateral") => self.parseNumber(collateral),
    Symbol("notional") => self.parseNumber(notionalString),
    Symbol("markPrice") => self.parseNumber(markPriceString),
    Symbol("lastPrice") => nothing,
    Symbol("entryPrice") => self.parseNumber(entryPriceString),
    Symbol("exitPrice") => self.safeNumber(position, "closePrice"),
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentageString),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMarginString),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(maintenanceMarginPercentageString),
    Symbol("marginRatio") => self.parseNumber(marginRatio),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("marginMode") => functions.ccxtruthy(isCross) ? "cross" : "isolated",
    Symbol("side") => side,
    Symbol("hedged") => safeString(position, "posMode") == "Hedged",
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchFundingHistory(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 200))
            throw(BadRequest(string(self.id, " fetchFundingHistory() limit argument cannot exceed 200")));
        end
        request[Symbol("limit")] = limit;
    end
    isStableSettled = @functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC");
    if functions.ccxtruthy(isStableSettled)
        response = Base.fetch(self.privateGetApiDataGFuturesFundingFees(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiDataFuturesFundingFees(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    rows = safeValue(data, "rows", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        entry = get(rows, i + 1, nothing);
        timestamp = safeInteger(entry, "createTime");
        execFee = safeString2(entry, "execFeeEv", "execFeeRv");
        currencyCode = self.safeCurrencyCode(safeString(entry, "currency"));
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => safeString(entry, "symbol"),
    Symbol("code") => currencyCode,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.parseFundingFeeToPrecision(execFee, market, currencyCode)
));
        i += 1
    end
    return result

end
function parseFundingFeeToPrecision(self::Phemex, value, market=nothing, currencyCode=nothing)
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(value == nothing, currencyCode == nothing), market == nothing))
            return value
    end
    isStableSettled = @functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC");
    if functions.ccxtruthy(!functions.ccxtruthy(isStableSettled))
        currency = self.safeCurrency(currencyCode);
        scale = safeString(get(currency, Symbol("info"), nothing), "valueScale");
        tickPrecision = self.parsePrecision(scale);
        value = stringMul(value, tickPrecision);
    end
    return value

end
function fetchFundingRate(self::Phemex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("linear"), nothing)))
        response = Base.fetch(self.v1GetMdTicker24hr(extend(request, params)));
    else
        response = Base.fetch(self.v2GetMdV2Ticker24hr(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseFundingRate(result, market)

end
function parseFundingRate(self::Phemex, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market);
    timestamp = safeIntegerProduct(contract, "timestamp", 0.000001);
    markEp = self.fromEp(safeString(contract, "markEp"), market);
    indexEp = self.fromEp(safeString(contract, "indexEp"), market);
    fundingRateEr = self.fromEr(safeString(contract, "fundingRateEr"), market);
    nextFundingRateEr = self.fromEr(safeString(contract, "predFundingRateEr"), market);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => self.safeNumber(contract, "markPriceRp", markEp),
    Symbol("indexPrice") => self.safeNumber(contract, "indexPriceRp", indexEp),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRateRr", fundingRateEr),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => self.safeNumber(contract, "predFundingRateRr", nextFundingRateEr),
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function setMargin(self::Phemex, symbol, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("posBalanceEv") => self.toEv(amount, market)
    );
    response = Base.fetch(self.privatePostPositionsAssign(extend(request, params)));
    return extend(self.parseMarginModification(response, market), Dict{Symbol, Any}(
    Symbol("amount") => amount
))

end
function parseMarginStatus(self::Phemex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseMarginModification(self::Phemex, data, market=nothing)
    market = self.safeMarket(nothing, market);
    inverse = safeValue(market, "inverse");
    codeCurrency = functions.ccxtruthy(inverse) ? "base" : "quote";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("type") => "set",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => get(market, Symbol(codeCurrency), nothing),
    Symbol("status") => self.parseMarginStatus(safeString(data, "code")),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function setMarginMode(self::Phemex, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap contracts only")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "isolated", marginMode != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isCross = marginMode == "cross";
    if functions.ccxtruthy(inArray(get(market, Symbol("settle"), nothing), ["USDT", "USDC"]))
        currentLeverage = safeString(params, "leverage");
        if functions.ccxtruthy(currentLeverage == nothing)
            throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a \"leverage\" parameter for USDT markets")));
        end
        request[Symbol("leverageRr")] = functions.ccxtruthy(isCross) ? stringNeg(stringAbs(currentLeverage)) : stringAbs(currentLeverage);
            return Base.fetch(self.privatePutGPositionsLeverage(extend(request, params)))
    end
    leverage = safeInteger(params, "leverage");
    if functions.ccxtruthy(marginMode == "cross")
        leverage = 0;
    end
    if functions.ccxtruthy(leverage == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a leverage parameter")));
    end
    request[Symbol("leverage")] = leverage;
    return Base.fetch(self.privatePutPositionsLeverage(extend(request, params)))

end
function setPositionMode(self::Phemex, hedged, symbol=nothing, params=Dict())
    self.checkRequiredArgument("setPositionMode", symbol, "symbol");
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("settle"), nothing) != "USDT")
        throw(BadSymbol(string(self.id, " setPositionMode() supports USDT settled markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(hedged)
        request[Symbol("targetPosMode")] = "Hedged";
    else
        request[Symbol("targetPosMode")] = "OneWay";
    end
    return Base.fetch(self.privatePutGPositionsSwitchPosModeSync(extend(request, params)))

end
function fetchLeverageTiers(self::Phemex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols != nothing)
        first_var = safeValue(symbols, 0);
        market = self.market(first_var);
        if functions.ccxtruthy(get(market, Symbol("settle"), nothing) != "USD")
            throw(BadSymbol(string(self.id, " fetchLeverageTiers() supports USD settled markets only")));
        end
    end
    response = Base.fetch(self.publicGetCfgV2Products(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    riskLimits = self.safeList(data, "riskLimits");
    return self.parseLeverageTiers(riskLimits, symbols, "symbol")

end
function parseMarketLeverageTiers(self::Phemex, info, market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId, market);
    riskLimits = (get(get(market, Symbol("info"), nothing), Symbol("riskLimits"), nothing));
    tiers = [];
    minNotional = 0;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(riskLimits)))
        tier = get(riskLimits, i + 1, nothing);
        maxNotional = safeInteger(tier, "limit");
        minNotionalResponse = minNotional;
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("currency") => get(market, Symbol("settle"), nothing),
    Symbol("minNotional") => minNotionalResponse,
    Symbol("maxNotional") => maxNotional,
    Symbol("maintenanceMarginRate") => safeString(tier, "maintenanceMargin"),
    Symbol("maxLeverage") => nothing,
    Symbol("info") => tier
));
        minNotional = maxNotional;
        i += 1
    end
    return tiers

end
function sign(self::Phemex, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    requestPath = string("/", self.implodeParams(path, params));
    url = requestPath;
    queryString = "";
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((method == "GET"), (method == "DELETE")), (method == "PUT")), (url == "/positions/assign")))
        if functions.ccxtruthy(length(objectKeys(query)))
            queryString = self.urlencodeWithArrayRepeat(query);
            url += string("?", queryString);
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = seconds();
        xPhemexRequestExpiry = safeInteger(self.options, "x-phemex-request-expiry", 60);
        expiry = self.sum(timestamp, xPhemexRequestExpiry);
        expiryString = string(expiry);
        headers = Dict{Symbol, Any}(
            Symbol("x-phemex-access-token") => self.apiKey,
            Symbol("x-phemex-request-expiry") => expiryString
        );
        payload = "";
        if functions.ccxtruthy(method == "POST")
            isOrderPlacement = @functions.ccxt_or(@functions.ccxt_or((path == "g-orders"), (path == "spot/orders")), (path == "orders"));
            if functions.ccxtruthy(isOrderPlacement)
                if functions.ccxtruthy(safeString(params, "clOrdID") == nothing)
                    id = safeString(self.options, "brokerId", "CCXT123456");
                    params[Symbol("clOrdID")] = string(id, uuid16());
                end
            end
            payload = json(params);
            body = payload;
            headers[Symbol("Content-Type")] = "application/json";
        end
        auth = string(requestPath, queryString, expiryString, payload);
        headers[Symbol("x-phemex-request-signature")] = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
    end
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), url);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function setLeverage(self::Phemex, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, -100)), (functions.ccxt_gt(leverage, 100))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between -100 and 100")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isHedged = self.safeBool(params, "hedged", false);
    longLeverageRr = safeInteger(params, "longLeverageRr");
    shortLeverageRr = safeInteger(params, "shortLeverageRr");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC"))
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(isHedged), longLeverageRr == nothing), shortLeverageRr == nothing))
            request[Symbol("leverageRr")] = leverage;
        else
            longVar = functions.ccxtruthy((longLeverageRr != nothing)) ? longLeverageRr : leverage;
            shortVar = functions.ccxtruthy((shortLeverageRr != nothing)) ? shortLeverageRr : leverage;
            request[Symbol("longLeverageRr")] = longVar;
            request[Symbol("shortLeverageRr")] = shortVar;
        end
        response = Base.fetch(self.privatePutGPositionsLeverage(extend(request, params)));
    else
        request[Symbol("leverage")] = leverage;
        response = Base.fetch(self.privatePutPositionsLeverage(extend(request, params)));
    end
    return response

end
function transfer(self::Phemex, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    scaledAmmount = self.toEv(amount, currency);
    direction = nothing;
    transfer = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(fromId == "spot", toId == "future"))
        direction = 2;
    elseif functions.ccxtruthy(@functions.ccxt_and(fromId == "future", toId == "spot"))
        direction = 1;
    end
    if functions.ccxtruthy(direction != nothing)
        request = Dict{Symbol, Any}(
            Symbol("currency") => get(currency, Symbol("id"), nothing),
            Symbol("moveOp") => direction,
            Symbol("amountEv") => scaledAmmount
        );
        response = Base.fetch(self.privatePostAssetsTransfer(extend(request, params)));
        data = safeValue(response, "data", Dict{Symbol, Any}());
        transfer = self.parseTransfer(data, currency);
    else
        request = Dict{Symbol, Any}(
            Symbol("fromUserId") => fromId,
            Symbol("toUserId") => toId,
            Symbol("amountEv") => scaledAmmount,
            Symbol("currency") => get(currency, Symbol("id"), nothing),
            Symbol("bizType") => safeString(params, "bizType", "SPOT")
        );
        response = Base.fetch(self.privatePostAssetsUniversalTransfer(extend(request, params)));
        transfer = self.parseTransfer(response);
    end
    transferOptions = safeValue(self.options, "transfer", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", true);
    if functions.ccxtruthy(fillResponseFromRequest)
        if functions.ccxtruthy(get(transfer, Symbol("fromAccount"), nothing) == nothing)
            transfer[Symbol("fromAccount")] = fromAccount;
        end
        if functions.ccxtruthy(get(transfer, Symbol("toAccount"), nothing) == nothing)
            transfer[Symbol("toAccount")] = toAccount;
        end
        if functions.ccxtruthy(get(transfer, Symbol("amount"), nothing) == nothing)
            transfer[Symbol("amount")] = amount;
        end
        if functions.ccxtruthy(get(transfer, Symbol("currency"), nothing) == nothing)
            transfer[Symbol("currency")] = code;
        end
    end
    return transfer

end
function fetchTransfers(self::Phemex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetAssetsTransfer(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    transfers = self.safeList(data, "rows", []);
    return self.parseTransfers(transfers, currency, since, limit)

end
function parseTransfer(self::Phemex, transfer, currency=nothing)
    id = safeString(transfer, "linkKey");
    status = safeString(transfer, "status");
    amountEv = safeString(transfer, "amountEv");
    amountTransfered = self.fromEv(amountEv);
    currencyId = safeString(transfer, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    side = safeInteger(transfer, "side");
    fromId = nothing;
    toId = nothing;
    if functions.ccxtruthy(side == 1)
        fromId = "swap";
        toId = "spot";
    elseif functions.ccxtruthy(side == 2)
        fromId = "spot";
        toId = "swap";
    end
    timestamp = safeInteger(transfer, "createTime");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => amountTransfered,
    Symbol("fromAccount") => fromId,
    Symbol("toAccount") => toId,
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Phemex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("3") => "rejected",
        Symbol("6") => "canceled",
        Symbol("10") => "ok",
        Symbol("11") => "failed"
    );
    return safeString(statuses, status, status)

end
function fetchFundingRateHistory(self::Phemex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isUsdtSettled = @functions.ccxt_or(get(market, Symbol("settle"), nothing) == "USDT", get(market, Symbol("settle"), nothing) == "USDC");
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, 100))
    end
    customSymbol = nothing;
    if functions.ccxtruthy(isUsdtSettled)
        customSymbol = string(".", get(market, Symbol("id"), nothing), "FR8H");
    else
        customSymbol = string(".", get(market, Symbol("baseId"), nothing), "FR8H");
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => customSymbol
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    if functions.ccxtruthy(isUsdtSettled)
        response = Base.fetch(self.v2GetApiDataPublicDataFundingRateHistory(extend(request, params)));
    else
        response = Base.fetch(self.v1GetApiDataPublicDataFundingRateHistory(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    rates = safeValue(data, "rows");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rates)))
        item = get(rates, i + 1, nothing);
        timestamp = safeInteger(item, "fundingTime");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(item, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function withdraw(self::Phemex, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    currency = self.currency(code);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkId = nothing;
    if functions.ccxtruthy(networkCode != nothing)
        networkId = self.networkCodeToId(networkCode, code);
    end
    stableCoins = safeValue(self.options, "stableCoins");
    if functions.ccxtruthy(networkId == nothing)
        if functions.ccxtruthy(!functions.ccxtruthy((inArray(code, stableCoins))))
            networkId = get(currency, Symbol("id"), nothing);
        else
            throw(ArgumentsRequired(string(self.id, " withdraw () requires an extra argument params[\"network\"]")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => amount,
        Symbol("chainName") => uppercase(networkId)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressTag")] = tag;
    end
    response = Base.fetch(self.privatePostPhemexWithdrawWalletsApiCreateWithdraw(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransaction(data, currency)

end
function fetchOpenInterest(self::Phemex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest is only supported for contract markets.")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2GetMdV2Ticker24hr(extend(request, params)));
    result = self.safeDict(response, "result");
    return self.parseOpenInterest(result, market)

end
function parseOpenInterest(self::Phemex, interest, market=nothing)
    timestamp = safeInteger(interest, "timestamp") / 1000000;
    id = safeString(interest, "symbol");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("info") => interest,
    Symbol("symbol") => self.safeSymbol(id, market),
    Symbol("baseVolume") => safeString(interest, "volumeRq"),
    Symbol("quoteVolume") => nothing,
    Symbol("openInterestAmount") => safeString(interest, "openInterestRv"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
), market)

end
function fetchConvertQuote(self::Phemex, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    valueScale = safeInteger(fromCurrency, "valueScale");
    request = Dict{Symbol, Any}(
        Symbol("fromCurrency") => fromCode,
        Symbol("toCurrency") => toCode,
        Symbol("fromAmountEv") => self.toEn(amount, valueScale)
    );
    response = Base.fetch(self.privateGetAssetsQuote(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseConversion(data, fromCurrency, toCurrency)

end
function createConvertTrade(self::Phemex, id, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    valueScale = safeInteger(fromCurrency, "valueScale");
    request = Dict{Symbol, Any}(
        Symbol("code") => id,
        Symbol("fromCurrency") => fromCode,
        Symbol("toCurrency") => toCode
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("fromAmountEv")] = self.toEn(amount, valueScale);
    end
    response = Base.fetch(self.privatePostAssetsConvert(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "fromCurrency");
    fromResult = self.safeCurrency(fromCurrencyId, fromCurrency);
    toCurrencyId = safeString(data, "toCurrency");
    to = self.safeCurrency(toCurrencyId, toCurrency);
    return self.parseConversion(data, fromResult, to)

end
function fetchConvertTradeHistory(self::Phemex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        request[Symbol("fromCurrency")] = code;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetAssetsConvert(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseConversions(rows, code, "fromCurrency", "toCurrency", since, limit)

end
function parseConversion(self::Phemex, conversion, fromCurrency=nothing, toCurrency=nothing)
    quoteArgs = self.safeDict(conversion, "quoteArgs", Dict{Symbol, Any}());
    requestTime = safeInteger(quoteArgs, "requestAt");
    timestamp = safeInteger(conversion, "createTime", requestTime);
    fromCoin = safeString(conversion, "fromCurrency", safeString(fromCurrency, "code"));
    fromCode = self.safeCurrencyCode(fromCoin, fromCurrency);
    toCoin = safeString(conversion, "toCurrency", safeString(toCurrency, "code"));
    toCode = self.safeCurrencyCode(toCoin, toCurrency);
    fromValueScale = safeInteger(fromCurrency, "valueScale");
    toValueScale = safeInteger(toCurrency, "valueScale");
    fromAmount = self.fromEn(safeString(conversion, "fromAmountEv"), fromValueScale);
    if functions.ccxtruthy(@functions.ccxt_and(fromAmount == nothing, quoteArgs != nothing))
        fromAmount = self.fromEn(safeString(quoteArgs, "origin"), fromValueScale);
    end
    toAmount = self.fromEn(safeString(conversion, "toAmountEv"), toValueScale);
    if functions.ccxtruthy(@functions.ccxt_and(toAmount == nothing, quoteArgs != nothing))
        toAmount = self.fromEn(safeString(quoteArgs, "proceeds"), toValueScale);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(conversion, "code"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.parseNumber(fromAmount),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.parseNumber(toAmount),
    Symbol("price") => self.safeNumber(quoteArgs, "price"),
    Symbol("fee") => nothing
)

end
function fetchPositionsADLRank(self::Phemex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    subType = nothing;
    code = safeString2(params, "currency", "code", "USDT");
    params = omit(params, ["currency", "code"]);
    settle = nothing;
    market = nothing;
    firstSymbol = safeString(symbols, 0);
    if functions.ccxtruthy(firstSymbol != nothing)
        market = self.market(firstSymbol);
        settle = get(market, Symbol("settle"), nothing);
        code = get(market, Symbol("settle"), nothing);
    else
        (settle, params) = self.handleOptionAndParams(params, "fetchPositionsADLRank", "settle", code);
    end
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsADLRank", market, params);
    isUSDTSettled = settle == "USDT";
    if functions.ccxtruthy(isUSDTSettled)
        code = "USDT";
    elseif functions.ccxtruthy(settle == "BTC")
        code = "BTC";
    else
        if functions.ccxtruthy(code == nothing)
            code = functions.ccxtruthy((subType == "linear")) ? "USD" : "BTC";
        end

    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(isUSDTSettled)
        method = nothing;
        (method, params) = self.handleOptionAndParams(params, "fetchPositionsADLRank", "method", "privateGetGAccountsAccountPositions");
        if functions.ccxtruthy(method == "privateGetGAccountsAccountPositions")
            response = Base.fetch(self.privateGetGAccountsAccountPositions(extend(request, params)));
        else
            response = Base.fetch(self.privateGetGAccountsPositions(extend(request, params)));
        end
    else
        response = Base.fetch(self.privateGetAccountsAccountPositions(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    ranks = safeValue(data, "positions", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ranks)))
        rank = get(ranks, i + 1, nothing);
        push!(result, self.parseADLRank(rank));
        i += 1
    end
    return self.filterByArrayADLRanks(result, "symbol", symbols, false)

end
function parseADLRank(self::Phemex, info, market=nothing)
    marketId = safeString(info, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("rank") => nothing,
    Symbol("rating") => nothing,
    Symbol("percentage") => self.safeNumber2(info, "deleveragePercentileRr", "deleveragePercentileEr"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function handleErrors(self::Phemex, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    error = safeValue(response, "error", response);
    errorCode = safeString(error, "code");
    message = safeString(error, "msg");
    if functions.ccxtruthy(@functions.ccxt_and((errorCode != nothing), (errorCode != "0")))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Phemex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCfgV2Products(self::Phemex, params=Dict(), context=Dict())
    return request(self, "cfg/v2/products", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetCfgFundingRates(self::Phemex, params=Dict(), context=Dict())
    return request(self, "cfg/fundingRates", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetProducts(self::Phemex, params=Dict(), context=Dict())
    return request(self, "products", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetNomicsTrades(self::Phemex, params=Dict(), context=Dict())
    return request(self, "nomics/trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdKline(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdV2KlineList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/kline/list", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdV2Kline(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdV2KlineLast(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/kline/last", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdOrderbook(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdTrade(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/trade", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetMdSpotTicker24hr(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/spot/ticker/24hr", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetExchangePublicCfgChainSettings(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/public/cfg/chain-settings", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdFullbook(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/fullbook", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdOrderbook(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/orderbook", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdTrade(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/trade", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdTicker24hr(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/ticker/24hr", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdTicker24hrAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/ticker/24hr/all", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdSpotTicker24hr(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/spot/ticker/24hr", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetMdSpotTicker24hrAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/spot/ticker/24hr/all", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetExchangePublicProducts(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/public/products", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v1GetApiDataPublicDataFundingRateHistory(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/public/data/funding-rate-history", "v1", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetPublicProducts(self::Phemex, params=Dict(), context=Dict())
    return request(self, "public/products", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetPublicProductsPlus(self::Phemex, params=Dict(), context=Dict())
    return request(self, "public/products-plus", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetMdV2Orderbook(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/orderbook", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetMdV2Trade(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/trade", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetMdV2Ticker24hr(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/ticker/24hr", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetMdV2Ticker24hrAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "md/v2/ticker/24hr/all", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2GetApiDataPublicDataFundingRateHistory(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/public/data/funding-rate-history", "v2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetSpotOrdersActive(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders/active", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotWallets(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/wallets", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeSpotOrder(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/spot/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeSpotOrderTrades(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/spot/order/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeOrderV2OrderList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/order/v2/orderList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeOrderV2TradingList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/order/v2/tradingList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountsAccountPositions(self::Phemex, params=Dict(), context=Dict())
    return request(self, "accounts/accountPositions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetGAccountsAccountPositions(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-accounts/accountPositions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetGAccountsPositions(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-accounts/positions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetGAccountsRiskUnit(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-accounts/risk-unit", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetApiDataFuturesFundingFees(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/funding-fees", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesFundingFees(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/funding-fees", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataFuturesOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataFuturesOrdersByOrderId(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/orders/by-order-id", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesOrdersByOrderId(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/orders/by-order-id", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataFuturesTrades(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesTrades(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataFuturesTradingFees(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/trading-fees", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesTradingFees(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/trading-fees", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataFuturesV2TradeAccountDetail(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/futures/v2/tradeAccountDetail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataGFuturesClosedPosition(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/g-futures/closedPosition", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetGOrdersActiveList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders/activeList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrdersActiveList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders/activeList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetExchangeOrderList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/order/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeOrder(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeOrderTrade(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/order/trade", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexUserUsersChildren(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-user/users/children", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexUserWalletsV2DepositAddress(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-user/wallets/v2/depositAddress", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexUserWalletsTradeAccountDetail(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-user/wallets/tradeAccountDetail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexDepositWalletsApiDepositAddress(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-deposit/wallets/api/depositAddress", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexDepositWalletsApiDepositHist(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-deposit/wallets/api/depositHist", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexDepositWalletsApiChainCfg(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-deposit/wallets/api/chainCfg", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexWithdrawWalletsApiWithdrawHist(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-withdraw/wallets/api/withdrawHist", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexWithdrawWalletsApiAssetInfo(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-withdraw/wallets/api/asset/info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetPhemexUserOrderClosedPositionList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-user/order/closedPositionList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeMarginsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/margins/transfer", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeWalletsConfirmWithdraw(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/confirm/withdraw", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeWalletsWithdrawList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/withdrawList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeWalletsDepositList(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/depositList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetExchangeWalletsV2DepositAddress(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/v2/depositAddress", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsFunds(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/funds", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsOrdersByOrderId(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/orders/by-order-id", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsPnls(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/pnls", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsTrades(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetApiDataSpotsTradesByOrderId(self::Phemex, params=Dict(), context=Dict())
    return request(self, "api-data/spots/trades/by-order-id", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAssetsConvert(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/convert", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAssetsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/transfer", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAssetsSpotsSubAccountsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/spots/sub-accounts/transfer", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAssetsFuturesSubAccountsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/futures/sub-accounts/transfer", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAssetsQuote(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/quote", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostGOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostPositionsAssign(self::Phemex, params=Dict(), context=Dict())
    return request(self, "positions/assign", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeWalletsTransferOut(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/transferOut", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeWalletsTransferIn(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/transferIn", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeMargins(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/margins", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeWalletsCreateWithdraw(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/createWithdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeWalletsCancelWithdraw(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/cancelWithdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostExchangeWalletsCreateWithdrawAddress(self::Phemex, params=Dict(), context=Dict())
    return request(self, "exchange/wallets/createWithdrawAddress", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostAssetsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostAssetsSpotsSubAccountsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/spots/sub-accounts/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostAssetsFuturesSubAccountsTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/futures/sub-accounts/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostAssetsUniversalTransfer(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/universal-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostAssetsConvert(self::Phemex, params=Dict(), context=Dict())
    return request(self, "assets/convert", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostPhemexWithdrawWalletsApiCreateWithdraw(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-withdraw/wallets/api/createWithdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostPhemexWithdrawWalletsApiCancelWithdraw(self::Phemex, params=Dict(), context=Dict())
    return request(self, "phemex-withdraw/wallets/api/cancelWithdraw", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePutSpotOrdersCreate(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders/create", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePutSpotOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePutOrdersReplace(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders/replace", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePutGOrdersReplace(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders/replace", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePutGOrdersCreate(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders/create", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePutPositionsLeverage(self::Phemex, params=Dict(), context=Dict())
    return request(self, "positions/leverage", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePutGPositionsLeverage(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-positions/leverage", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePutGPositionsSwitchPosModeSync(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-positions/switch-pos-mode-sync", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePutPositionsRiskLimit(self::Phemex, params=Dict(), context=Dict())
    return request(self, "positions/riskLimit", "private", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateDeleteSpotOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateDeleteSpotOrdersAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "spot/orders/all", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateDeleteOrdersCancel(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders/cancel", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrdersAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "orders/all", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privateDeleteGOrdersCancel(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders/cancel", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteGOrders(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteGOrdersAll(self::Phemex, params=Dict(), context=Dict())
    return request(self, "g-orders/all", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function Phemex(; kwargs...)
    inst = Phemex(Exchange(), describe, parseSafeNumber, parseSwapMarket, parseSpotMarket, fetchMarkets, fetchCurrencies, parseCurrency, customParseBidAsk, customParseOrderBook, fetchOrderBook, toEn, toEv, toEp, fromEn, fromEp, fromEv, fromEr, parseOHLCV, fetchOHLCV, parseTicker, fetchTicker, fetchTickers, fetchTrades, parseTrade, parseSpotBalance, parseSwapBalance, fetchBalance, parseOrderStatus, parseOrderType, parseTimeInForce, parseSpotOrder, parseOrderSide, parseSwapOrder, parseOrder, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchMyTrades, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, fetchPositions, fetchPositionHistory, parsePosition, fetchFundingHistory, parseFundingFeeToPrecision, fetchFundingRate, parseFundingRate, setMargin, parseMarginStatus, parseMarginModification, setMarginMode, setPositionMode, fetchLeverageTiers, parseMarketLeverageTiers, sign, setLeverage, transfer, fetchTransfers, parseTransfer, parseTransferStatus, fetchFundingRateHistory, withdraw, fetchOpenInterest, parseOpenInterest, fetchConvertQuote, createConvertTrade, fetchConvertTradeHistory, parseConversion, fetchPositionsADLRank, parseADLRank, handleErrors, publicGetCfgV2Products, publicGetCfgFundingRates, publicGetProducts, publicGetNomicsTrades, publicGetMdKline, publicGetMdV2KlineList, publicGetMdV2Kline, publicGetMdV2KlineLast, publicGetMdOrderbook, publicGetMdTrade, publicGetMdSpotTicker24hr, publicGetExchangePublicCfgChainSettings, v1GetMdFullbook, v1GetMdOrderbook, v1GetMdTrade, v1GetMdTicker24hr, v1GetMdTicker24hrAll, v1GetMdSpotTicker24hr, v1GetMdSpotTicker24hrAll, v1GetExchangePublicProducts, v1GetApiDataPublicDataFundingRateHistory, v2GetPublicProducts, v2GetPublicProductsPlus, v2GetMdV2Orderbook, v2GetMdV2Trade, v2GetMdV2Ticker24hr, v2GetMdV2Ticker24hrAll, v2GetApiDataPublicDataFundingRateHistory, privateGetSpotOrdersActive, privateGetSpotOrders, privateGetSpotWallets, privateGetExchangeSpotOrder, privateGetExchangeSpotOrderTrades, privateGetExchangeOrderV2OrderList, privateGetExchangeOrderV2TradingList, privateGetAccountsAccountPositions, privateGetGAccountsAccountPositions, privateGetGAccountsPositions, privateGetGAccountsRiskUnit, privateGetApiDataFuturesFundingFees, privateGetApiDataGFuturesFundingFees, privateGetApiDataFuturesOrders, privateGetApiDataGFuturesOrders, privateGetApiDataFuturesOrdersByOrderId, privateGetApiDataGFuturesOrdersByOrderId, privateGetApiDataFuturesTrades, privateGetApiDataGFuturesTrades, privateGetApiDataFuturesTradingFees, privateGetApiDataGFuturesTradingFees, privateGetApiDataFuturesV2TradeAccountDetail, privateGetApiDataGFuturesClosedPosition, privateGetGOrdersActiveList, privateGetOrdersActiveList, privateGetExchangeOrderList, privateGetExchangeOrder, privateGetExchangeOrderTrade, privateGetPhemexUserUsersChildren, privateGetPhemexUserWalletsV2DepositAddress, privateGetPhemexUserWalletsTradeAccountDetail, privateGetPhemexDepositWalletsApiDepositAddress, privateGetPhemexDepositWalletsApiDepositHist, privateGetPhemexDepositWalletsApiChainCfg, privateGetPhemexWithdrawWalletsApiWithdrawHist, privateGetPhemexWithdrawWalletsApiAssetInfo, privateGetPhemexUserOrderClosedPositionList, privateGetExchangeMarginsTransfer, privateGetExchangeWalletsConfirmWithdraw, privateGetExchangeWalletsWithdrawList, privateGetExchangeWalletsDepositList, privateGetExchangeWalletsV2DepositAddress, privateGetApiDataSpotsFunds, privateGetApiDataSpotsOrders, privateGetApiDataSpotsOrdersByOrderId, privateGetApiDataSpotsPnls, privateGetApiDataSpotsTrades, privateGetApiDataSpotsTradesByOrderId, privateGetAssetsConvert, privateGetAssetsTransfer, privateGetAssetsSpotsSubAccountsTransfer, privateGetAssetsFuturesSubAccountsTransfer, privateGetAssetsQuote, privatePostSpotOrders, privatePostOrders, privatePostGOrders, privatePostPositionsAssign, privatePostExchangeWalletsTransferOut, privatePostExchangeWalletsTransferIn, privatePostExchangeMargins, privatePostExchangeWalletsCreateWithdraw, privatePostExchangeWalletsCancelWithdraw, privatePostExchangeWalletsCreateWithdrawAddress, privatePostAssetsTransfer, privatePostAssetsSpotsSubAccountsTransfer, privatePostAssetsFuturesSubAccountsTransfer, privatePostAssetsUniversalTransfer, privatePostAssetsConvert, privatePostPhemexWithdrawWalletsApiCreateWithdraw, privatePostPhemexWithdrawWalletsApiCancelWithdraw, privatePutSpotOrdersCreate, privatePutSpotOrders, privatePutOrdersReplace, privatePutGOrdersReplace, privatePutGOrdersCreate, privatePutPositionsLeverage, privatePutGPositionsLeverage, privatePutGPositionsSwitchPosModeSync, privatePutPositionsRiskLimit, privateDeleteSpotOrders, privateDeleteSpotOrdersAll, privateDeleteOrdersCancel, privateDeleteOrders, privateDeleteOrdersAll, privateDeleteGOrdersCancel, privateDeleteGOrders, privateDeleteGOrdersAll)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
