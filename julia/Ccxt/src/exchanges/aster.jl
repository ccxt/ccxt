@kwdef mutable struct Aster <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    isInverse::Function = isInverse
    isLinear::Function = isLinear
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTime::Function = fetchTime
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchBidsAsks::Function = fetchBidsAsks
    parseFundingRate::Function = parseFundingRate
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingIntervals::Function = fetchFundingIntervals
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    setMarginMode::Function = setMarginMode
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrder::Function = fetchOpenOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    createOrderRequest::Function = createOrderRequest
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    setLeverage::Function = setLeverage
    fetchLeverages::Function = fetchLeverages
    parseLeverage::Function = parseLeverage
    fetchMarginModes::Function = fetchMarginModes
    parseMarginMode::Function = parseMarginMode
    fetchMarginAdjustmentHistory::Function = fetchMarginAdjustmentHistory
    parseMarginModification::Function = parseMarginModification
    modifyMarginHelper::Function = modifyMarginHelper
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    parseIncome::Function = parseIncome
    fetchFundingHistory::Function = fetchFundingHistory
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchLedger::Function = fetchLedger
    parsePositionRisk::Function = parsePositionRisk
    fetchPositionsRisk::Function = fetchPositionsRisk
    fetchPositions::Function = fetchPositions
    parseAccountPositions::Function = parseAccountPositions
    parseAccountPosition::Function = parseAccountPosition
    fetchAccountPositions::Function = fetchAccountPositions
    loadLeverageBrackets::Function = loadLeverageBrackets
    keccakMessage::Function = keccakMessage
    signMessage::Function = signMessage
    signWithdrawPayload::Function = signWithdrawPayload
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    sign::Function = sign
    encodeValuesWithJson::Function = encodeValuesWithJson
    capitalizeKeys::Function = capitalizeKeys
    loadMarketsAndSignIn::Function = loadMarketsAndSignIn
    signIn::Function = signIn
    initializeClient::Function = initializeClient
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    fapiPublicGetV1Ping::Function = fapiPublicGetV1Ping
    fapiPublicGetV3Ping::Function = fapiPublicGetV3Ping
    fapiPublicGetV1Time::Function = fapiPublicGetV1Time
    fapiPublicGetV3Time::Function = fapiPublicGetV3Time
    fapiPublicGetV1ExchangeInfo::Function = fapiPublicGetV1ExchangeInfo
    fapiPublicGetV3ExchangeInfo::Function = fapiPublicGetV3ExchangeInfo
    fapiPublicGetV1Depth::Function = fapiPublicGetV1Depth
    fapiPublicGetV3Depth::Function = fapiPublicGetV3Depth
    fapiPublicGetV1Trades::Function = fapiPublicGetV1Trades
    fapiPublicGetV3Trades::Function = fapiPublicGetV3Trades
    fapiPublicGetV1HistoricalTrades::Function = fapiPublicGetV1HistoricalTrades
    fapiPublicGetV3HistoricalTrades::Function = fapiPublicGetV3HistoricalTrades
    fapiPublicGetV1AggTrades::Function = fapiPublicGetV1AggTrades
    fapiPublicGetV3AggTrades::Function = fapiPublicGetV3AggTrades
    fapiPublicGetV1Klines::Function = fapiPublicGetV1Klines
    fapiPublicGetV3Klines::Function = fapiPublicGetV3Klines
    fapiPublicGetV1IndexPriceKlines::Function = fapiPublicGetV1IndexPriceKlines
    fapiPublicGetV3IndexPriceKlines::Function = fapiPublicGetV3IndexPriceKlines
    fapiPublicGetV1MarkPriceKlines::Function = fapiPublicGetV1MarkPriceKlines
    fapiPublicGetV3MarkPriceKlines::Function = fapiPublicGetV3MarkPriceKlines
    fapiPublicGetV1PremiumIndex::Function = fapiPublicGetV1PremiumIndex
    fapiPublicGetV3PremiumIndex::Function = fapiPublicGetV3PremiumIndex
    fapiPublicGetV1FundingRate::Function = fapiPublicGetV1FundingRate
    fapiPublicGetV3FundingRate::Function = fapiPublicGetV3FundingRate
    fapiPublicGetV1FundingInfo::Function = fapiPublicGetV1FundingInfo
    fapiPublicGetV3FundingInfo::Function = fapiPublicGetV3FundingInfo
    fapiPublicGetV1Ticker24hr::Function = fapiPublicGetV1Ticker24hr
    fapiPublicGetV3Ticker24hr::Function = fapiPublicGetV3Ticker24hr
    fapiPublicGetV1TickerPrice::Function = fapiPublicGetV1TickerPrice
    fapiPublicGetV3TickerPrice::Function = fapiPublicGetV3TickerPrice
    fapiPublicGetV1TickerBookTicker::Function = fapiPublicGetV1TickerBookTicker
    fapiPublicGetV3TickerBookTicker::Function = fapiPublicGetV3TickerBookTicker
    fapiPublicGetV1AdlQuantile::Function = fapiPublicGetV1AdlQuantile
    fapiPublicGetV1ForceOrders::Function = fapiPublicGetV1ForceOrders
    fapiPublicGetV3Indexreferences::Function = fapiPublicGetV3Indexreferences
    fapiPrivateGetV1PositionSideDual::Function = fapiPrivateGetV1PositionSideDual
    fapiPrivateGetV3PositionSideDual::Function = fapiPrivateGetV3PositionSideDual
    fapiPrivateGetV1MultiAssetsMargin::Function = fapiPrivateGetV1MultiAssetsMargin
    fapiPrivateGetV3MultiAssetsMargin::Function = fapiPrivateGetV3MultiAssetsMargin
    fapiPrivateGetV1Order::Function = fapiPrivateGetV1Order
    fapiPrivateGetV3Order::Function = fapiPrivateGetV3Order
    fapiPrivateGetV1OpenOrder::Function = fapiPrivateGetV1OpenOrder
    fapiPrivateGetV3OpenOrder::Function = fapiPrivateGetV3OpenOrder
    fapiPrivateGetV1OpenOrders::Function = fapiPrivateGetV1OpenOrders
    fapiPrivateGetV3OpenOrders::Function = fapiPrivateGetV3OpenOrders
    fapiPrivateGetV1AllOrders::Function = fapiPrivateGetV1AllOrders
    fapiPrivateGetV3AllOrders::Function = fapiPrivateGetV3AllOrders
    fapiPrivateGetV2Balance::Function = fapiPrivateGetV2Balance
    fapiPrivateGetV3Balance::Function = fapiPrivateGetV3Balance
    fapiPrivateGetV3Account::Function = fapiPrivateGetV3Account
    fapiPrivateGetV1PositionMarginHistory::Function = fapiPrivateGetV1PositionMarginHistory
    fapiPrivateGetV3PositionMarginHistory::Function = fapiPrivateGetV3PositionMarginHistory
    fapiPrivateGetV2PositionRisk::Function = fapiPrivateGetV2PositionRisk
    fapiPrivateGetV3PositionRisk::Function = fapiPrivateGetV3PositionRisk
    fapiPrivateGetV1UserTrades::Function = fapiPrivateGetV1UserTrades
    fapiPrivateGetV3UserTrades::Function = fapiPrivateGetV3UserTrades
    fapiPrivateGetV1Income::Function = fapiPrivateGetV1Income
    fapiPrivateGetV3Income::Function = fapiPrivateGetV3Income
    fapiPrivateGetV1LeverageBracket::Function = fapiPrivateGetV1LeverageBracket
    fapiPrivateGetV3LeverageBracket::Function = fapiPrivateGetV3LeverageBracket
    fapiPrivateGetV1CommissionRate::Function = fapiPrivateGetV1CommissionRate
    fapiPrivateGetV3CommissionRate::Function = fapiPrivateGetV3CommissionRate
    fapiPrivateGetV3AdlQuantile::Function = fapiPrivateGetV3AdlQuantile
    fapiPrivateGetV3ForceOrders::Function = fapiPrivateGetV3ForceOrders
    fapiPrivateGetV3Mmp::Function = fapiPrivateGetV3Mmp
    fapiPrivateGetV3AccountWithJoinMargin::Function = fapiPrivateGetV3AccountWithJoinMargin
    fapiPrivateGetV4Account::Function = fapiPrivateGetV4Account
    fapiPrivateGetV3Agent::Function = fapiPrivateGetV3Agent
    fapiPrivateGetV3Builder::Function = fapiPrivateGetV3Builder
    fapiPrivatePostV1PositionSideDual::Function = fapiPrivatePostV1PositionSideDual
    fapiPrivatePostV3PositionSideDual::Function = fapiPrivatePostV3PositionSideDual
    fapiPrivatePostV1MultiAssetsMargin::Function = fapiPrivatePostV1MultiAssetsMargin
    fapiPrivatePostV3MultiAssetsMargin::Function = fapiPrivatePostV3MultiAssetsMargin
    fapiPrivatePostV1Order::Function = fapiPrivatePostV1Order
    fapiPrivatePostV3Order::Function = fapiPrivatePostV3Order
    fapiPrivatePostV1OrderTest::Function = fapiPrivatePostV1OrderTest
    fapiPrivatePostV3OrderTest::Function = fapiPrivatePostV3OrderTest
    fapiPrivatePostV1BatchOrders::Function = fapiPrivatePostV1BatchOrders
    fapiPrivatePostV3BatchOrders::Function = fapiPrivatePostV3BatchOrders
    fapiPrivatePostV1AssetWalletTransfer::Function = fapiPrivatePostV1AssetWalletTransfer
    fapiPrivatePostV3AssetWalletTransfer::Function = fapiPrivatePostV3AssetWalletTransfer
    fapiPrivatePostV1CountdownCancelAll::Function = fapiPrivatePostV1CountdownCancelAll
    fapiPrivatePostV3CountdownCancelAll::Function = fapiPrivatePostV3CountdownCancelAll
    fapiPrivatePostV1Leverage::Function = fapiPrivatePostV1Leverage
    fapiPrivatePostV3Leverage::Function = fapiPrivatePostV3Leverage
    fapiPrivatePostV1MarginType::Function = fapiPrivatePostV1MarginType
    fapiPrivatePostV3MarginType::Function = fapiPrivatePostV3MarginType
    fapiPrivatePostV1PositionMargin::Function = fapiPrivatePostV1PositionMargin
    fapiPrivatePostV3PositionMargin::Function = fapiPrivatePostV3PositionMargin
    fapiPrivatePostV1ListenKey::Function = fapiPrivatePostV1ListenKey
    fapiPrivatePostV3ListenKey::Function = fapiPrivatePostV3ListenKey
    fapiPrivatePostV3Mmp::Function = fapiPrivatePostV3Mmp
    fapiPrivatePostV3MmpReset::Function = fapiPrivatePostV3MmpReset
    fapiPrivatePostV3Noop::Function = fapiPrivatePostV3Noop
    fapiPrivatePostV3ApproveAgent::Function = fapiPrivatePostV3ApproveAgent
    fapiPrivatePostV3UpdateAgent::Function = fapiPrivatePostV3UpdateAgent
    fapiPrivatePostV3ApproveBuilder::Function = fapiPrivatePostV3ApproveBuilder
    fapiPrivatePostV3UpdateBuilder::Function = fapiPrivatePostV3UpdateBuilder
    fapiPrivatePutV1ListenKey::Function = fapiPrivatePutV1ListenKey
    fapiPrivatePutV3ListenKey::Function = fapiPrivatePutV3ListenKey
    fapiPrivateDeleteV1Order::Function = fapiPrivateDeleteV1Order
    fapiPrivateDeleteV3Order::Function = fapiPrivateDeleteV3Order
    fapiPrivateDeleteV1AllOpenOrders::Function = fapiPrivateDeleteV1AllOpenOrders
    fapiPrivateDeleteV3AllOpenOrders::Function = fapiPrivateDeleteV3AllOpenOrders
    fapiPrivateDeleteV1BatchOrders::Function = fapiPrivateDeleteV1BatchOrders
    fapiPrivateDeleteV3BatchOrders::Function = fapiPrivateDeleteV3BatchOrders
    fapiPrivateDeleteV3Mmp::Function = fapiPrivateDeleteV3Mmp
    fapiPrivateDeleteV1ListenKey::Function = fapiPrivateDeleteV1ListenKey
    fapiPrivateDeleteV3ListenKey::Function = fapiPrivateDeleteV3ListenKey
    fapiPrivateDeleteV3Agent::Function = fapiPrivateDeleteV3Agent
    fapiPrivateDeleteV3Builder::Function = fapiPrivateDeleteV3Builder
    sapiPublicGetV1Ping::Function = sapiPublicGetV1Ping
    sapiPublicGetV1Time::Function = sapiPublicGetV1Time
    sapiPublicGetV1ExchangeInfo::Function = sapiPublicGetV1ExchangeInfo
    sapiPublicGetV1Depth::Function = sapiPublicGetV1Depth
    sapiPublicGetV1Trades::Function = sapiPublicGetV1Trades
    sapiPublicGetV1HistoricalTrades::Function = sapiPublicGetV1HistoricalTrades
    sapiPublicGetV1AggTrades::Function = sapiPublicGetV1AggTrades
    sapiPublicGetV1Klines::Function = sapiPublicGetV1Klines
    sapiPublicGetV1Ticker24hr::Function = sapiPublicGetV1Ticker24hr
    sapiPublicGetV1TickerPrice::Function = sapiPublicGetV1TickerPrice
    sapiPublicGetV1TickerBookTicker::Function = sapiPublicGetV1TickerBookTicker
    sapiPublicGetV1AsterWithdrawEstimateFee::Function = sapiPublicGetV1AsterWithdrawEstimateFee
    sapiPublicGetV3Ping::Function = sapiPublicGetV3Ping
    sapiPublicGetV3Time::Function = sapiPublicGetV3Time
    sapiPublicGetV3ExchangeInfo::Function = sapiPublicGetV3ExchangeInfo
    sapiPublicGetV3Depth::Function = sapiPublicGetV3Depth
    sapiPublicGetV3Trades::Function = sapiPublicGetV3Trades
    sapiPublicGetV3HistoricalTrades::Function = sapiPublicGetV3HistoricalTrades
    sapiPublicGetV3AggTrades::Function = sapiPublicGetV3AggTrades
    sapiPublicGetV3Klines::Function = sapiPublicGetV3Klines
    sapiPublicGetV3Ticker24hr::Function = sapiPublicGetV3Ticker24hr
    sapiPublicGetV3TickerPrice::Function = sapiPublicGetV3TickerPrice
    sapiPublicGetV3TickerBookTicker::Function = sapiPublicGetV3TickerBookTicker
    sapiPublicGetV3AsterWithdrawEstimateFee::Function = sapiPublicGetV3AsterWithdrawEstimateFee
    sapiPrivateGetV1CommissionRate::Function = sapiPrivateGetV1CommissionRate
    sapiPrivateGetV1Order::Function = sapiPrivateGetV1Order
    sapiPrivateGetV1OpenOrders::Function = sapiPrivateGetV1OpenOrders
    sapiPrivateGetV1AllOrders::Function = sapiPrivateGetV1AllOrders
    sapiPrivateGetV1TransactionHistory::Function = sapiPrivateGetV1TransactionHistory
    sapiPrivateGetV1Account::Function = sapiPrivateGetV1Account
    sapiPrivateGetV1UserTrades::Function = sapiPrivateGetV1UserTrades
    sapiPrivateGetV3CommissionRate::Function = sapiPrivateGetV3CommissionRate
    sapiPrivateGetV3Order::Function = sapiPrivateGetV3Order
    sapiPrivateGetV3OpenOrders::Function = sapiPrivateGetV3OpenOrders
    sapiPrivateGetV3AllOrders::Function = sapiPrivateGetV3AllOrders
    sapiPrivateGetV3Account::Function = sapiPrivateGetV3Account
    sapiPrivateGetV3UserTrades::Function = sapiPrivateGetV3UserTrades
    sapiPrivateGetV3OpenOrder::Function = sapiPrivateGetV3OpenOrder
    sapiPrivatePostV1Order::Function = sapiPrivatePostV1Order
    sapiPrivatePostV1AssetWalletTransfer::Function = sapiPrivatePostV1AssetWalletTransfer
    sapiPrivatePostV1AssetSendToAddress::Function = sapiPrivatePostV1AssetSendToAddress
    sapiPrivatePostV1ListenKey::Function = sapiPrivatePostV1ListenKey
    sapiPrivatePostV3Order::Function = sapiPrivatePostV3Order
    sapiPrivatePostV3AssetWalletTransfer::Function = sapiPrivatePostV3AssetWalletTransfer
    sapiPrivatePostV3AsterUserWithdraw::Function = sapiPrivatePostV3AsterUserWithdraw
    sapiPrivatePostV3ListenKey::Function = sapiPrivatePostV3ListenKey
    sapiPrivatePutV1ListenKey::Function = sapiPrivatePutV1ListenKey
    sapiPrivatePutV3ListenKey::Function = sapiPrivatePutV3ListenKey
    sapiPrivateDeleteV1Order::Function = sapiPrivateDeleteV1Order
    sapiPrivateDeleteV1AllOpenOrders::Function = sapiPrivateDeleteV1AllOpenOrders
    sapiPrivateDeleteV1ListenKey::Function = sapiPrivateDeleteV1ListenKey
    sapiPrivateDeleteV3AllOpenOrders::Function = sapiPrivateDeleteV3AllOpenOrders
    sapiPrivateDeleteV3Order::Function = sapiPrivateDeleteV3Order
    sapiPrivateDeleteV3ListenKey::Function = sapiPrivateDeleteV3ListenKey

end
function describe(self::Aster, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "aster",
    Symbol("name") => "Aster",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 333,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/5e5909d6-c4de-4435-992f-4339c80edbd7",
        Symbol("www") => "https://www.asterdex.com/en",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("fapiPublic") => "https://fapi.asterdex.com/fapi",
            Symbol("fapiPrivate") => "https://fapi.asterdex.com/fapi",
            Symbol("sapiPublic") => "https://sapi.asterdex.com/api",
            Symbol("sapiPrivate") => "https://sapi.asterdex.com/api"
        ),
        Symbol("doc") => "https://github.com/asterdex/api-docs",
        Symbol("fees") => "https://docs.asterdex.com/product/asterex-simple/fees-and-slippage",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.asterdex.com/en/referral/aA1c2B",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => false,
        Symbol("createLimitSellOrder") => false,
        Symbol("createMarketBuyOrder") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrder") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("editOrder") => false,
        Symbol("editOrders") => false,
        Symbol("fetchAccounts") => nothing,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => "emulated",
        Symbol("fetchCanceledOrders") => "emulated",
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => "emulated",
        Symbol("fetchFundingIntervals") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => "emulated",
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLastPrices") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => false,
        Symbol("fetchLeverage") => "emulated",
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => true,
        Symbol("fetchMarginMode") => "emulated",
        Symbol("fetchMarginModes") => true,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => "emulated",
        Symbol("fetchTransactionFee") => "emulated",
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("fapiPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/ping") => 1,
                Symbol("v3/ping") => 1,
                Symbol("v1/time") => 1,
                Symbol("v3/time") => 1,
                Symbol("v1/exchangeInfo") => 1,
                Symbol("v3/exchangeInfo") => 1,
                Symbol("v1/depth") => 1,
                Symbol("v3/depth") => 2,
                Symbol("v1/trades") => 1,
                Symbol("v3/trades") => 1,
                Symbol("v1/historicalTrades") => 1,
                Symbol("v3/historicalTrades") => 20,
                Symbol("v1/aggTrades") => 1,
                Symbol("v3/aggTrades") => 20,
                Symbol("v1/klines") => 1,
                Symbol("v3/klines") => 1,
                Symbol("v1/indexPriceKlines") => 1,
                Symbol("v3/indexPriceKlines") => 1,
                Symbol("v1/markPriceKlines") => 1,
                Symbol("v3/markPriceKlines") => 1,
                Symbol("v1/premiumIndex") => 1,
                Symbol("v3/premiumIndex") => 1,
                Symbol("v1/fundingRate") => 1,
                Symbol("v3/fundingRate") => 1,
                Symbol("v1/fundingInfo") => 1,
                Symbol("v3/fundingInfo") => 1,
                Symbol("v1/ticker/24hr") => 1,
                Symbol("v3/ticker/24hr") => 1,
                Symbol("v1/ticker/price") => 1,
                Symbol("v3/ticker/price") => 1,
                Symbol("v1/ticker/bookTicker") => 1,
                Symbol("v3/ticker/bookTicker") => 1,
                Symbol("v1/adlQuantile") => 1,
                Symbol("v1/forceOrders") => 1,
                Symbol("v3/indexreferences") => 1
            )
        ),
        Symbol("fapiPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/positionSide/dual") => 1,
                Symbol("v3/positionSide/dual") => 30,
                Symbol("v1/multiAssetsMargin") => 1,
                Symbol("v3/multiAssetsMargin") => 1,
                Symbol("v1/order") => 1,
                Symbol("v3/order") => 1,
                Symbol("v1/openOrder") => 1,
                Symbol("v3/openOrder") => 1,
                Symbol("v1/openOrders") => 1,
                Symbol("v3/openOrders") => 1,
                Symbol("v1/allOrders") => 1,
                Symbol("v3/allOrders") => 1,
                Symbol("v2/balance") => 1,
                Symbol("v3/balance") => 1,
                Symbol("v3/account") => 1,
                Symbol("v1/positionMargin/history") => 1,
                Symbol("v3/positionMargin/history") => 1,
                Symbol("v2/positionRisk") => 1,
                Symbol("v3/positionRisk") => 1,
                Symbol("v1/userTrades") => 1,
                Symbol("v3/userTrades") => 5,
                Symbol("v1/income") => 1,
                Symbol("v3/income") => 1,
                Symbol("v1/leverageBracket") => 1,
                Symbol("v3/leverageBracket") => 1,
                Symbol("v1/commissionRate") => 1,
                Symbol("v3/commissionRate") => 1,
                Symbol("v3/adlQuantile") => 1,
                Symbol("v3/forceOrders") => 1,
                Symbol("v3/mmp") => 1,
                Symbol("v3/accountWithJoinMargin") => 1,
                Symbol("v4/account") => 1,
                Symbol("v3/agent") => 1,
                Symbol("v3/builder") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v1/positionSide/dual") => 1,
                Symbol("v3/positionSide/dual") => 1,
                Symbol("v1/multiAssetsMargin") => 1,
                Symbol("v3/multiAssetsMargin") => 1,
                Symbol("v1/order") => 1,
                Symbol("v3/order") => 1,
                Symbol("v1/order/test") => 1,
                Symbol("v3/order/test") => 1,
                Symbol("v1/batchOrders") => 1,
                Symbol("v3/batchOrders") => 1,
                Symbol("v1/asset/wallet/transfer") => 1,
                Symbol("v3/asset/wallet/transfer") => 1,
                Symbol("v1/countdownCancelAll") => 1,
                Symbol("v3/countdownCancelAll") => 1,
                Symbol("v1/leverage") => 1,
                Symbol("v3/leverage") => 1,
                Symbol("v1/marginType") => 1,
                Symbol("v3/marginType") => 1,
                Symbol("v1/positionMargin") => 1,
                Symbol("v3/positionMargin") => 1,
                Symbol("v1/listenKey") => 1,
                Symbol("v3/listenKey") => 1,
                Symbol("v3/mmp") => 1,
                Symbol("v3/mmpReset") => 1,
                Symbol("v3/noop") => 1,
                Symbol("v3/approveAgent") => 1,
                Symbol("v3/updateAgent") => 1,
                Symbol("v3/approveBuilder") => 1,
                Symbol("v3/updateBuilder") => 1
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("v1/listenKey") => 1,
                Symbol("v3/listenKey") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("v1/order") => 1,
                Symbol("v3/order") => 1,
                Symbol("v1/allOpenOrders") => 1,
                Symbol("v3/allOpenOrders") => 1,
                Symbol("v1/batchOrders") => 1,
                Symbol("v3/batchOrders") => 1,
                Symbol("v3/mmp") => 1,
                Symbol("v1/listenKey") => 1,
                Symbol("v3/listenKey") => 1,
                Symbol("v3/agent") => 1,
                Symbol("v3/builder") => 1
            )
        ),
        Symbol("sapiPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/ping") => 1,
                Symbol("v1/time") => 1,
                Symbol("v1/exchangeInfo") => 1,
                Symbol("v1/depth") => 1,
                Symbol("v1/trades") => 1,
                Symbol("v1/historicalTrades") => 1,
                Symbol("v1/aggTrades") => 1,
                Symbol("v1/klines") => 1,
                Symbol("v1/ticker/24hr") => 1,
                Symbol("v1/ticker/price") => 1,
                Symbol("v1/ticker/bookTicker") => 1,
                Symbol("v1/aster/withdraw/estimateFee") => 1,
                Symbol("v3/ping") => 1,
                Symbol("v3/time") => 1,
                Symbol("v3/exchangeInfo") => 1,
                Symbol("v3/depth") => Dict{Symbol, Any}(
                    Symbol("cost") => 2,
                    Symbol("byLimit") => [[50, 2], [100, 5], [500, 10], [1000, 20]]
                ),
                Symbol("v3/trades") => 1,
                Symbol("v3/historicalTrades") => 20,
                Symbol("v3/aggTrades") => 20,
                Symbol("v3/klines") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
                ),
                Symbol("v3/ticker/24hr") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 40
                ),
                Symbol("v3/ticker/price") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 2
                ),
                Symbol("v3/ticker/bookTicker") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 2
                ),
                Symbol("v3/aster/withdraw/estimateFee") => 1
            )
        ),
        Symbol("sapiPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/commissionRate") => 1,
                Symbol("v1/order") => 1,
                Symbol("v1/openOrders") => 1,
                Symbol("v1/allOrders") => 1,
                Symbol("v1/transactionHistory") => 1,
                Symbol("v1/account") => 1,
                Symbol("v1/userTrades") => 1,
                Symbol("v3/commissionRate") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 2
                ),
                Symbol("v3/order") => 1,
                Symbol("v3/openOrders") => 1,
                Symbol("v3/allOrders") => 5,
                Symbol("v3/account") => 5,
                Symbol("v3/userTrades") => 5,
                Symbol("v3/openOrder") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v1/order") => 1,
                Symbol("v1/asset/wallet/transfer") => 5,
                Symbol("v1/asset/sendToAddress") => 1,
                Symbol("v1/listenKey") => 1,
                Symbol("v3/order") => 1,
                Symbol("v3/asset/wallet/transfer") => 5,
                Symbol("v3/aster/user-withdraw") => 1,
                Symbol("v3/listenKey") => 1
            ),
            Symbol("put") => ["v1/listenKey", "v3/listenKey"],
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("v1/order") => 1,
                Symbol("v1/allOpenOrders") => 1,
                Symbol("v1/listenKey") => 1,
                Symbol("v3/allOpenOrders") => 1,
                Symbol("v3/order") => 1,
                Symbol("v3/listenKey") => 1
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("privateKey") => true
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0001"),
            Symbol("taker") => self.parseNumber("0.00035")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("recvWindow") => 10 * 1000,
        Symbol("zeroAddress") => "0x0000000000000000000000000000000000000000",
        Symbol("v3ChainId") => 1666,
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("timeInForce") => "GTC",
            Symbol("quoteOrderQty") => true
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("swap") => "FUTURE",
            Symbol("future") => "FUTURE",
            Symbol("linear") => "FUTURE"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH",
            Symbol("BEP20") => "BSC",
            Symbol("ARBONE") => "Arbitrum"
        ),
        Symbol("networksToChainId") => Dict{Symbol, Any}(
            Symbol("ETH") => 1,
            Symbol("BSC") => 56,
            Symbol("Arbitrum") => 42161
        ),
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("warnIfNoSymbol") => true
        ),
        Symbol("builderFee") => true,
        Symbol("builder") => "0x1F5877C19e3777Cfd15F9d57253eA4aA5254Ec39",
        Symbol("builderRate") => "0.001"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => OperationRejected,
            Symbol("-1001") => NetworkError,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => DuplicateOrderId,
            Symbol("-1005") => BadRequest,
            Symbol("-1006") => BadResponse,
            Symbol("-1007") => RequestTimeout,
            Symbol("-1010") => OperationRejected,
            Symbol("-1011") => PermissionDenied,
            Symbol("-1013") => BadRequest,
            Symbol("-1014") => OrderNotFillable,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => ExchangeClosedByUser,
            Symbol("-1020") => NotSupported,
            Symbol("-1021") => InvalidNonce,
            Symbol("-1022") => AuthenticationError,
            Symbol("-1023") => BadRequest,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => ArgumentsRequired,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => ArgumentsRequired,
            Symbol("-1106") => BadRequest,
            Symbol("-1108") => BadRequest,
            Symbol("-1109") => BadRequest,
            Symbol("-1110") => BadSymbol,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => BadRequest,
            Symbol("-1113") => BadRequest,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => InvalidOrder,
            Symbol("-1116") => InvalidOrder,
            Symbol("-1117") => InvalidOrder,
            Symbol("-1118") => InvalidOrder,
            Symbol("-1119") => InvalidOrder,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1125") => AuthenticationError,
            Symbol("-1127") => BadRequest,
            Symbol("-1128") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1136") => InvalidOrder,
            Symbol("-2010") => InvalidOrder,
            Symbol("-2011") => OrderNotFound,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2014") => AuthenticationError,
            Symbol("-2015") => AuthenticationError,
            Symbol("-2016") => MarketClosed,
            Symbol("-2018") => InsufficientFunds,
            Symbol("-2019") => InsufficientFunds,
            Symbol("-2020") => OrderNotFillable,
            Symbol("-2021") => OrderImmediatelyFillable,
            Symbol("-2022") => OperationRejected,
            Symbol("-2023") => AccountSuspended,
            Symbol("-2024") => InsufficientFunds,
            Symbol("-2025") => RateLimitExceeded,
            Symbol("-2026") => NotSupported,
            Symbol("-2027") => BadRequest,
            Symbol("-2028") => BadRequest,
            Symbol("-4000") => InvalidOrder,
            Symbol("-4001") => InvalidOrder,
            Symbol("-4002") => InvalidOrder,
            Symbol("-4003") => InvalidOrder,
            Symbol("-4004") => InvalidOrder,
            Symbol("-4005") => InvalidOrder,
            Symbol("-4006") => InvalidOrder,
            Symbol("-4007") => InvalidOrder,
            Symbol("-4008") => InvalidOrder,
            Symbol("-4009") => InvalidOrder,
            Symbol("-4010") => InvalidOrder,
            Symbol("-4011") => InvalidOrder,
            Symbol("-4012") => RateLimitExceeded,
            Symbol("-4013") => InvalidOrder,
            Symbol("-4014") => InvalidOrder,
            Symbol("-4015") => InvalidOrder,
            Symbol("-4016") => InvalidOrder,
            Symbol("-4017") => InvalidOrder,
            Symbol("-4018") => InvalidOrder,
            Symbol("-4019") => BadRequest,
            Symbol("-4020") => BadRequest,
            Symbol("-4021") => BadRequest,
            Symbol("-4022") => MarketClosed,
            Symbol("-4023") => InvalidOrder,
            Symbol("-4024") => InvalidOrder,
            Symbol("-4025") => BadRequest,
            Symbol("-4026") => BadRequest,
            Symbol("-4027") => BadRequest,
            Symbol("-4028") => BadRequest,
            Symbol("-4029") => BadRequest,
            Symbol("-4030") => BadRequest,
            Symbol("-4031") => BadRequest,
            Symbol("-4032") => RateLimitExceeded,
            Symbol("-4033") => AccountNotEnabled,
            Symbol("-4044") => BadRequest,
            Symbol("-4045") => RateLimitExceeded,
            Symbol("-4046") => NoChange,
            Symbol("-4047") => OperationRejected,
            Symbol("-4048") => OperationRejected,
            Symbol("-4049") => OperationRejected,
            Symbol("-4050") => InsufficientFunds,
            Symbol("-4051") => InsufficientFunds,
            Symbol("-4052") => NoChange,
            Symbol("-4053") => OperationRejected,
            Symbol("-4054") => OperationRejected,
            Symbol("-4055") => ArgumentsRequired,
            Symbol("-4056") => AuthenticationError,
            Symbol("-4057") => AuthenticationError,
            Symbol("-4058") => InvalidOrder,
            Symbol("-4059") => NoChange,
            Symbol("-4060") => InvalidOrder,
            Symbol("-4061") => InvalidOrder,
            Symbol("-4062") => OperationRejected,
            Symbol("-4063") => BadRequest,
            Symbol("-4064") => BadRequest,
            Symbol("-4065") => BadRequest,
            Symbol("-4066") => BadRequest,
            Symbol("-4067") => OperationRejected,
            Symbol("-4068") => OperationRejected,
            Symbol("-4069") => BadRequest,
            Symbol("-4070") => InvalidOrder,
            Symbol("-4071") => InvalidOrder,
            Symbol("-4072") => NoChange,
            Symbol("-4073") => BadRequest,
            Symbol("-4074") => InvalidOrder,
            Symbol("-4075") => OperationRejected,
            Symbol("-4076") => OperationRejected,
            Symbol("-4077") => RateLimitExceeded,
            Symbol("-4078") => BadRequest,
            Symbol("-4079") => BadRequest,
            Symbol("-4080") => BadRequest,
            Symbol("-4081") => BadRequest,
            Symbol("-4082") => RateLimitExceeded,
            Symbol("-4083") => OperationFailed,
            Symbol("-4084") => NotSupported,
            Symbol("-4085") => BadRequest,
            Symbol("-4086") => BadRequest,
            Symbol("-4087") => PermissionDenied,
            Symbol("-4088") => PermissionDenied,
            Symbol("-4104") => BadSymbol,
            Symbol("-4114") => InvalidOrder,
            Symbol("-4115") => DuplicateOrderId,
            Symbol("-4118") => InsufficientFunds,
            Symbol("-4131") => InvalidOrder,
            Symbol("-4135") => InvalidOrder,
            Symbol("-4137") => InvalidOrder,
            Symbol("-4138") => OperationRejected,
            Symbol("-4139") => InvalidOrder,
            Symbol("-4140") => OperationRejected,
            Symbol("-4141") => MarketClosed,
            Symbol("-4142") => InvalidOrder,
            Symbol("-4144") => BadSymbol,
            Symbol("-4161") => OperationRejected,
            Symbol("-4164") => InvalidOrder,
            Symbol("-4165") => BadRequest,
            Symbol("-4183") => InvalidOrder,
            Symbol("-4184") => InvalidOrder,
            Symbol("-5060") => OperationRejected,
            Symbol("-5076") => OperationRejected,
            Symbol("-4168") => OperationRejected
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function isInverse(self::Aster, type_var, subType=nothing)
    if functions.ccxtruthy(subType == nothing)
            return (type_var == "delivery")
    else
        return subType == "inverse"
    end

end
function isLinear(self::Aster, type_var, subType=nothing)
    if functions.ccxtruthy(subType == nothing)
            return @functions.ccxt_or((type_var == "future"), (type_var == "swap"))
    else
        return subType == "linear"
    end

end
function fetchCurrencies(self::Aster, params=Dict())
    sapiResult = Base.fetch(self.sapiPublicGetV3ExchangeInfo(params));
    sapiRows = self.safeList(sapiResult, "assets", []);
    return self.parseCurrencies(sapiRows)

end
function parseCurrency(self::Aster, rawCurrency)
    currencyId = safeString(rawCurrency, "asset");
    code = self.safeCurrencyCode(currencyId);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => code,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("margin") => self.safeBool(rawCurrency, "marginAvailable"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => nothing,
    Symbol("type") => "crypto"
))

end
function fetchMarkets(self::Aster, params=Dict())
    promises = [self.sapiPublicGetV3ExchangeInfo(params), self.fapiPublicGetV3ExchangeInfo(params)];
    push!(promises, self.signIn());
    results = Base.fetch(asyncmap(Base.fetch, promises));
    sapiResult = self.safeDict(results, 0, Dict{Symbol, Any}());
    sapiRows = self.safeList(sapiResult, "symbols", []);
    fapiResult = self.safeDict(results, 1, Dict{Symbol, Any}());
    fapiRows = self.safeList(fapiResult, "symbols", []);
    fapiRowsFiltered = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fapiRows)))
        market = get(fapiRows, i + 1, nothing);
        if functions.ccxtruthy(safeString(market, "baseAsset"))
                        push!(fapiRowsFiltered, market);
        end
        i += 1
    end
    rows = arrayConcat(sapiRows, fapiRowsFiltered);
    return self.parseMarkets(rows)

end
function parseMarket(self::Aster, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseAsset");
    quoteId = safeString(market, "quoteAsset");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    active = safeString(market, "status") == "TRADING";
    spot = nothing;
    symbol = nothing;
    settle = nothing;
    settleId = nothing;
    swap = nothing;
    linear = nothing;
    inverse = nothing;
    contractSize = nothing;
    contractType = safeString(market, "contractType");
    isContract = contractType != nothing;
    if functions.ccxtruthy(isContract)
        spot = false;
        swap = true;
        settleId = safeString(market, "marginAsset");
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        linear = settle == quote_var;
        inverse = settle == base;
        contractSize = self.safeNumber2(market, "contractSize", "unit", self.parseNumber("1"));
    else
        spot = true;
        swap = false;
        symbol = string(base, "/", quote_var);
    end
    filters = self.safeList(market, "filters", []);
    filtersByType = indexBy(filters, "filterType");
    filterNotional = self.safeDict2(filtersByType, "MIN_NOTIONAL", "NOTIONAL");
    filterPrice = self.safeDict(filtersByType, "PRICE_FILTER");
    filterLotSize = self.safeDict(filtersByType, "LOT_SIZE");
    filterMarketLotSize = self.safeDict(filtersByType, "MARKET_LOT_SIZE", Dict{Symbol, Any}());
    pricePrecision = self.safeNumber(filterPrice, "tickSize");
    if functions.ccxtruthy(pricePrecision == nothing)
        pricePrecision = self.parseNumber(self.parsePrecision(safeString(market, "pricePrecision")));
    end
    amountPrecision = functions.ccxtruthy((filterLotSize != nothing)) ? self.safeNumber(filterLotSize, "stepSize") : self.parseNumber(self.parsePrecision(safeString(market, "quantityPrecision")));
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => functions.ccxtruthy(isContract) ? "swap" : "spot",
    Symbol("spot") => spot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => isContract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => get(get(self.fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
    Symbol("maker") => get(get(self.fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision,
        Symbol("base") => self.parseNumber(self.parsePrecision(safeString(market, "baseAssetPrecision"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(safeString(market, "quotePrecision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filterLotSize, "minQty"),
            Symbol("max") => self.safeNumber(filterLotSize, "maxQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filterPrice, "minPrice"),
            Symbol("max") => self.safeNumber(filterPrice, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber2(filterNotional, "notional", "minNotional"),
            Symbol("max") => nothing
        ),
        Symbol("market") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filterMarketLotSize, "minQty"),
            Symbol("max") => self.safeNumber(filterMarketLotSize, "maxQty")
        )
    ),
    Symbol("created") => safeInteger2(market, "listingTime", "createTime"),
    Symbol("info") => market
))

end
function fetchTime(self::Aster, params=Dict())
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTime", nothing, params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.fapiPublicGetV3Time(params));
    else
        response = Base.fetch(self.sapiPublicGetV3Time(params));
    end
    return safeInteger(response, "serverTime")

end
function parseOHLCV(self::Aster, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Aster, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1500);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    price = safeString(params, "price");
    isMark = (price == "mark");
    isIndex = (price == "index");
    params = omit(params, "price");
    if functions.ccxtruthy(isMark)
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.fapiPublicGetV3MarkPriceKlines(extend(request, params)));
    elseif functions.ccxtruthy(isIndex)
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.fapiPublicGetV3IndexPriceKlines(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiPublicGetV3Klines(extend(request, params)));
        else
            response = Base.fetch(self.sapiPublicGetV3Klines(extend(request, params)));
        end
    end
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function parseTrade(self::Aster, trade, market=nothing)
    id = safeString2(trade, "id", "a");
    marketId = safeString(trade, "symbol");
    marketType = functions.ccxtruthy((ccxt_in("positionSide", trade))) ? "swap" : "spot";
    market = self.safeMarket(marketId, market, nothing, marketType);
    currencyId = safeString2(trade, "commissionAsset", "marginAsset");
    currencyCode = self.safeCurrencyCode(currencyId);
    amountString = safeString2(trade, "qty", "q");
    priceString = safeString2(trade, "price", "p");
    costString = safeString2(trade, "quoteQty", "baseQty");
    timestamp = safeInteger2(trade, "time", "T");
    side = safeStringLower(trade, "side");
    isMaker = self.safeBool(trade, "maker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
        if functions.ccxtruthy(side == nothing)
            isBuyer = self.safeBool(trade, "buyer");
            if functions.ccxtruthy(isBuyer != nothing)
                side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
            end
        end
    end
    isBuyerMaker = self.safeBool2(trade, "isBuyerMaker", "m");
    if functions.ccxtruthy(isBuyerMaker != nothing)
        side = functions.ccxtruthy(isBuyerMaker) ? "sell" : "buy";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.parseNumber(stringAbs(safeString(trade, "commission"))),
        Symbol("currency") => currencyCode
    )
), market)

end
function fetchTrades(self::Aster, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    sinceDefined = since != nothing;
    untilDefined = (ccxt_in("until", params));
    if functions.ccxtruthy(sinceDefined)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(untilDefined)
        request = self.handleUntilOption("endTime", request, params);
    end
    if functions.ccxtruthy(ccxt_in("startTime", request))
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            response = Base.fetch(self.fapiPublicGetV3AggTrades(extend(request, params)));
        else
            response = Base.fetch(self.sapiPublicGetV3AggTrades(extend(request, params)));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            response = Base.fetch(self.fapiPublicGetV3Trades(extend(request, params)));
        else
            response = Base.fetch(self.sapiPublicGetV3Trades(extend(request, params)));
        end
    end
    return self.parseTrades(response, market, since, limit)

end
function fetchMyTrades(self::Aster, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.fapiPrivateGetV3UserTrades(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateGetV3UserTrades(extend(request, params)));
    end
    return self.parseTrades(response, market, since, limit, params)

end
function fetchOrderBook(self::Aster, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = self.findNearestCeiling([5, 10, 20, 50, 100, 500, 1000], limit);
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPublicGetV3Depth(extend(request, params)));
    else
        response = Base.fetch(self.sapiPublicGetV3Depth(extend(request, params)));
    end
    timestamp = safeInteger(response, "T");
    return self.parseOrderBook(response, symbol, timestamp, "bids", "asks")

end
function parseTicker(self::Aster, ticker, market=nothing)
    timestamp = safeInteger(ticker, "closeTime");
    last_var = safeString(ticker, "lastPrice");
    open = safeString(ticker, "openPrice");
    percentage = safeString(ticker, "priceChangePercent");
    quoteVolume = safeString(ticker, "quoteVolume");
    baseVolume = safeString(ticker, "volume");
    high = safeString(ticker, "highPrice");
    low = safeString(ticker, "lowPrice");
    isTickerResponse = (ccxt_in("priceChange", ticker));
    marketType = nothing;
    if functions.ccxtruthy(isTickerResponse)
        marketType = functions.ccxtruthy((ccxt_in("baseAsset", ticker))) ? "spot" : "swap";
    else
        marketType = functions.ccxtruthy((ccxt_in("lastUpdateId", ticker))) ? "swap" : "spot";
    end
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market, nothing, marketType);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bidQty"),
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => safeString(ticker, "askQty"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Aster, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPublicGetV3Ticker24hr(extend(request, params)));
    else
        response = Base.fetch(self.sapiPublicGetV3Ticker24hr(extend(request, params)));
    end
    return self.parseTicker(response, market)

end
function fetchTickers(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    market = self.getMarketFromSymbols(symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.fapiPublicGetV3Ticker24hr(params));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.sapiPublicGetV3Ticker24hr(params));
    end
    return self.parseTickers(response, symbols)

end
function fetchLastPrices(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    market = self.getMarketFromSymbols(symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchLastPrices", market, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.fapiPublicGetV3TickerPrice(params));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.sapiPublicGetV3TickerPrice(params));
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        marketId = safeString(get(response, i + 1, nothing), "symbol");
        safeMarket = self.safeMarket(marketId, nothing, nothing, marketType);
        priceData = extend(self.parseLastPrice(get(response, i + 1, nothing), safeMarket), params);
        push!(results, priceData);
        i += 1
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArray(results, "symbol", symbols)

end
function parseLastPrice(self::Aster, entry, market=nothing)
    timestamp = safeInteger(entry, "time");
    return Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("price") => self.safeNumberOmitZero(entry, "price"),
    Symbol("side") => nothing,
    Symbol("info") => entry
)

end
function fetchBidsAsks(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    market = self.getMarketFromSymbols(symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBidsAsks", market, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.fapiPublicGetV3TickerBookTicker(params));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.sapiPublicGetV3TickerBookTicker(params));
    end
    return self.parseTickers(response, symbols)

end
function parseFundingRate(self::Aster, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    nextFundingTimestamp = safeInteger(contract, "nextFundingTime");
    timestamp = safeInteger(contract, "time");
    interval = safeString(contract, "fundingIntervalHours");
    intervalString = nothing;
    if functions.ccxtruthy(interval != nothing)
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("markPrice") => self.safeNumber(contract, "markPrice"),
    Symbol("indexPrice") => self.safeNumber(contract, "indexPrice"),
    Symbol("interestRate") => self.safeNumber(contract, "interestRate"),
    Symbol("estimatedSettlePrice") => self.safeNumber(contract, "estimatedSettlePrice"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "lastFundingRate"),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => intervalString
)

end
function fetchFundingRate(self::Aster, symbol, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRate() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.fapiPublicGetV3PremiumIndex(extend(request, params)));
    return self.parseFundingRate(response, market)

end
function fetchFundingRates(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.fapiPublicGetV3PremiumIndex(extend(params)));
    return self.parseFundingRates(response, symbols)

end
function fetchFundingIntervals(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
    end
    response = Base.fetch(self.fapiPublicGetV3FundingInfo(params));
    return self.parseFundingRates(response, symbols)

end
function fetchFundingRateHistory(self::Aster, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.fapiPublicGetV3FundingRate(extend(request, params)));
    return self.parseFundingRateHistories(response, market)

end
function parseFundingRateHistory(self::Aster, contract, market=nothing)
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(safeString(contract, "symbol"), nothing, nothing, "swap"),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchBalance(self::Aster, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    response = nothing;
    data = nothing;
    if functions.ccxtruthy(marketType == "swap")
        data = Base.fetch(self.fapiPrivateGetV3Balance(params));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.sapiPrivateGetV3Account(params));
        data = self.safeList(response, "balances", []);
    end
    return self.parseBalance(data)

end
function parseBalance(self::Aster, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString2(balance, "free", "availableBalance");
        account[Symbol("used")] = safeString(balance, "locked");
        account[Symbol("total")] = safeString(balance, "balance");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function setMarginMode(self::Aster, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = uppercase(marginMode);
    if functions.ccxtruthy(marginMode == "CROSS")
        marginMode = "CROSSED";
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "ISOLATED"), (marginMode != "CROSSED")))
        throw(BadRequest(string(self.id, " marginMode must be either isolated or cross")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => marginMode
    );
    response = Base.fetch(self.fapiPrivatePostV3MarginType(extend(request, params)));
    return response

end
function fetchPositionMode(self::Aster, symbol=nothing, params=Dict())
    response = Base.fetch(self.fapiPrivateGetV3PositionSideDual(params));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => self.safeBool(response, "dualSidePosition")
)

end
function setPositionMode(self::Aster, hedged, symbol=nothing, params=Dict())
    strValue = functions.ccxtruthy(hedged) ? "true" : "false";
    request = Dict{Symbol, Any}(
        Symbol("dualSidePosition") => strValue
    );
    return Base.fetch(self.fapiPrivatePostV3PositionSideDual(extend(request, params)))

end
function parseTradingFee(self::Aster, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerCommissionRate"),
    Symbol("taker") => self.safeNumber(fee, "takerCommissionRate"),
    Symbol("percentage") => false,
    Symbol("tierBased") => false
)

end
function fetchTradingFee(self::Aster, symbol, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateGetV3CommissionRate(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateGetV3CommissionRate(extend(request, params)));
    end
    return self.parseTradingFee(response, market)

end
function parseOrderStatus(self::Aster, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("REJECTED") => "canceled",
        Symbol("EXPIRED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Aster, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("STOP") => "limit",
        Symbol("STOP_MARKET") => "market",
        Symbol("TAKE_PROFIT") => "limit",
        Symbol("TAKE_PROFIT_MARKET") => "market",
        Symbol("TRAILING_STOP_MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Aster, order, market=nothing)
    info = order;
    positionSide = safeString(order, "positionSide");
    defaultType = functions.ccxtruthy((positionSide != nothing)) ? "swap" : "spot";
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market, nothing, defaultType);
    side = safeStringLower(order, "side");
    timestamp = safeInteger(order, "time");
    statusId = safeStringUpper(order, "status");
    rawType = safeStringUpper(order, "type");
    stopPriceString = safeString(order, "stopPrice");
    triggerPrice = self.parseNumber(omitZero(stopPriceString));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("type") => self.parseOrderType(rawType),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("average") => safeString(order, "avgPrice"),
    Symbol("cost") => safeString(order, "cumQuote"),
    Symbol("amount") => safeString(order, "origQty"),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("status") => self.parseOrderStatus(statusId),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing,
    Symbol("reduceOnly") => self.safeBool2(order, "reduceOnly", "ro")
), market)

end
function fetchOrder(self::Aster, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "clientOid");
    params = omit(params, ["clientOrderId", "clientOid"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateGetV3Order(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateGetV3Order(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function fetchOpenOrder(self::Aster, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrder() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "clientOid");
    params = omit(params, ["clientOrderId", "clientOid"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.sapiPrivateGetV3OpenOrder(extend(request, params)));
    else
        response = Base.fetch(self.fapiPrivateGetV3OpenOrder(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function fetchOrders(self::Aster, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateGetV3AllOrders(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateGetV3AllOrders(extend(request, params)));
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Aster, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    market = nothing;
    marketType = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(symbol == nothing)
        if functions.ccxtruthy(get(get(self.options, Symbol("fetchOpenOrders"), nothing), Symbol("warnIfNoSymbol"), nothing))
            throw(ExchangeError(string(self.id, " fetchOpenOrders(): WARNING - this method without providing \"symbol\" argument uses 40 times more rate-limit quota. If you acknowledge this warning, set ", self.id, ".options[\"fetchOpenOrders\"][\"warnIfNoSymbol\"] = false to suppress this warning message.")));
        end
    else
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchOpenOrders", market, params);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(marketType, subType))
        response = Base.fetch(self.fapiPrivateGetV3OpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.sapiPrivateGetV3OpenOrders(extend(request, params)));
    end
    return self.parseOrders(response, market, since, limit)

end
function createOrder(self::Aster, symbol, type_var, side, amount, price=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivatePostV3Order(request));
    else
        response = Base.fetch(self.sapiPrivatePostV3Order(request));
    end
    return self.parseOrder(response, market)

end
function createOrders(self::Aster, orders, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    ordersRequests = [];
    orderSymbols = [];
    if functions.ccxtruthy(functions.ccxt_gt(length(orders), 5))
        throw(InvalidOrder(string(self.id, " createOrders() order list max 5 orders")));
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        currentMarket = self.market(marketId);
        push!(orderSymbols, get(currentMarket, Symbol("symbol"), nothing));
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    orderSymbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    market = self.market(get(orderSymbols, 1, nothing));
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " createOrders() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    request = Dict{Symbol, Any}(
        Symbol("batchOrders") => ordersRequests
    );
    response = Base.fetch(self.fapiPrivatePostV3BatchOrders(extend(request, params)));
    return self.parseOrders(response)

end
function createOrderRequest(self::Aster, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    initialUppercaseType = uppercase(type_var);
    isMarketOrder = initialUppercaseType == "MARKET";
    isLimitOrder = initialUppercaseType == "LIMIT";
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    clientOrderId = safeString2(params, "newClientOrderId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("newClientOrderId")] = clientOrderId;
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeString(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeString(params, "takeProfitPrice");
    trailingDelta = safeString(params, "trailingDelta");
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activationPrice");
    trailingPercent = safeStringN(params, ["trailingPercent", "callbackRate", "trailingDelta"]);
    isTrailingPercentOrder = trailingPercent != nothing;
    isStopLoss = @functions.ccxt_or(stopLossPrice != nothing, trailingDelta != nothing);
    isTakeProfit = takeProfitPrice != nothing;
    uppercaseType = initialUppercaseType;
    stopPrice = nothing;
    if functions.ccxtruthy(isTrailingPercentOrder)
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            uppercaseType = "TRAILING_STOP_MARKET";
            request[Symbol("callbackRate")] = trailingPercent;
            if functions.ccxtruthy(trailingTriggerPrice != nothing)
                request[Symbol("activationPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
            end
        end
    elseif functions.ccxtruthy(isStopLoss)
        stopPrice = stopLossPrice;
        if functions.ccxtruthy(isMarketOrder)
            uppercaseType = "STOP_MARKET";
        elseif functions.ccxtruthy(isLimitOrder)
            uppercaseType = "STOP";
        end
    else
        if functions.ccxtruthy(isTakeProfit)
            stopPrice = takeProfitPrice;
            if functions.ccxtruthy(isMarketOrder)
                uppercaseType = "TAKE_PROFIT_MARKET";
            elseif functions.ccxtruthy(isLimitOrder)
                uppercaseType = "TAKE_PROFIT";
            end
        end

    end
    postOnly = self.isPostOnly(isMarketOrder, nothing, params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("timeInForce")] = "GTX";
    end
    closePosition = self.safeBool(params, "closePosition", false);
    timeInForceIsRequired = false;
    priceIsRequired = false;
    triggerPriceIsRequired = false;
    quantityIsRequired = false;
    request[Symbol("type")] = uppercaseType;
    if functions.ccxtruthy(uppercaseType == "MARKET")
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            quoteOrderQty = self.handleOption("createOrder", "quoteOrderQty", true);
            if functions.ccxtruthy(quoteOrderQty)
                quoteOrderQtyNew = safeString2(params, "quoteOrderQty", "cost");
                precision = get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing);
                if functions.ccxtruthy(quoteOrderQtyNew != nothing)
                    request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQtyNew, TRUNCATE, precision, self.precisionMode);
                elseif functions.ccxtruthy(price != nothing)
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteOrderQuantity = stringMul(amountString, priceString);
                    request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQuantity, TRUNCATE, precision, self.precisionMode);
                else
                    quantityIsRequired = true;
                end
            else
                quantityIsRequired = true;
            end
        else
            quantityIsRequired = true;
        end
    elseif functions.ccxtruthy(uppercaseType == "LIMIT")
        timeInForceIsRequired = true;
        quantityIsRequired = true;
        priceIsRequired = true;
    else
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP"), (uppercaseType == "TAKE_PROFIT")))
            quantityIsRequired = true;
            priceIsRequired = true;
            triggerPriceIsRequired = true;
        elseif functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_MARKET"), (uppercaseType == "TAKE_PROFIT_MARKET")))
            if functions.ccxtruthy(!functions.ccxtruthy(closePosition))
                quantityIsRequired = true;
            end
            triggerPriceIsRequired = true;
        else
            if functions.ccxtruthy(uppercaseType == "TRAILING_STOP_MARKET")
                request[Symbol("callbackRate")] = trailingPercent;
                if functions.ccxtruthy(trailingTriggerPrice != nothing)
                    request[Symbol("activationPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
                end
            end

        end

    end
    if functions.ccxtruthy(quantityIsRequired)
        marketAmountPrecision = safeString(get(market, Symbol("precision"), nothing), "amount");
        isPrecisionAvailable = (marketAmountPrecision != nothing);
        if functions.ccxtruthy(isPrecisionAvailable)
            request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        else
            request[Symbol("quantity")] = self.parseToNumeric(amount);
        end
    end
    if functions.ccxtruthy(priceIsRequired)
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        pricePrecision = safeString(get(market, Symbol("precision"), nothing), "price");
        isPricePrecisionAvailable = (pricePrecision != nothing);
        if functions.ccxtruthy(isPricePrecisionAvailable)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        else
            request[Symbol("price")] = self.parseToNumeric(price);
        end
    end
    if functions.ccxtruthy(triggerPriceIsRequired)
        if functions.ccxtruthy(stopPrice == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a stopPrice extra param for a ", type_var, " order")));
        end
        if functions.ccxtruthy(stopPrice != nothing)
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopPrice);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(timeInForceIsRequired, (safeString(params, "timeInForce") == nothing)), (safeString(request, "timeInForce") == nothing)))
        tif = nothing;
        (tif, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce");
        request[Symbol("timeInForce")] = tif;
    end
    requestParams = omit(params, ["newClientOrderId", "clientOrderId", "stopPrice", "triggerPrice", "trailingTriggerPrice", "trailingPercent", "trailingDelta", "stopPrice", "stopLossPrice", "takeProfitPrice"]);
    if functions.ccxtruthy(@functions.ccxt_and(self.safeBool(self.options, "builderFee"), get(market, Symbol("swap"), nothing)))
        request[Symbol("builder")] = safeString(self.options, "builder");
        request[Symbol("feeRate")] = safeString(self.options, "builderRate");
    end
    return extend(request, requestParams)

end
function cancelAllOrders(self::Aster, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateDeleteV3AllOpenOrders(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateDeleteV3AllOpenOrders(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelOrder(self::Aster, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeStringN(params, ["origClientOrderId", "clientOrderId"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["origClientOrderId", "clientOrderId"]);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateDeleteV3Order(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateDeleteV3Order(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function cancelOrders(self::Aster, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderIdList = self.safeList(params, "origClientOrderIdList");
    if functions.ccxtruthy(clientOrderIdList != nothing)
        request[Symbol("origClientOrderIdList")] = clientOrderIdList;
    else
        request[Symbol("orderIdList")] = ids;
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.fapiPrivateDeleteV3BatchOrders(extend(request, params)));
    else
        response = Base.fetch(self.sapiPrivateDeleteV3AllOpenOrders(extend(request, params)));
    end
    return self.parseOrders(response, market)

end
function setLeverage(self::Aster, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " leverage should be between 1 and 125")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    response = Base.fetch(self.fapiPrivatePostV3Leverage(extend(request, params)));
    return response

end
function fetchLeverages(self::Aster, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    response = Base.fetch(self.fapiPrivateGetV3PositionRisk(params));
    return self.parseLeverages(response, symbols, "symbol")

end
function parseLeverage(self::Aster, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    marginMode = safeStringLower(leverage, "marginType");
    side = safeStringLower(leverage, "positionSide");
    longLeverage = nothing;
    shortLeverage = nothing;
    leverageValue = safeInteger(leverage, "leverage");
    if functions.ccxtruthy(@functions.ccxt_or((side == nothing), (side == "both")))
        longLeverage = leverageValue;
        shortLeverage = leverageValue;
    elseif functions.ccxtruthy(side == "long")
        longLeverage = leverageValue;
    else
        if functions.ccxtruthy(side == "short")
            shortLeverage = leverageValue;
        end

    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
function fetchMarginModes(self::Aster, symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    response = Base.fetch(self.fapiPrivateGetV3PositionRisk(params));
    return self.parseMarginModes(response, symbols, "symbol", "swap")

end
function parseMarginMode(self::Aster, marginMode, market=nothing)
    marketId = safeString(marginMode, "symbol");
    market = self.safeMarket(marketId, market, nothing, "swap");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => safeStringLower(marginMode, "marginType")
)

end
function fetchMarginAdjustmentHistory(self::Aster, symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMarginAdjustmentHistory () requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    until = safeInteger(params, "until");
    params = omit(params, "until");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("type")] = functions.ccxtruthy((type_var == "add")) ? 1 : 2;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.fapiPrivateGetV3PositionMarginHistory(extend(request, params)));
    modifications = self.parseMarginModifications(response);
    return self.filterBySymbolSinceLimit(modifications, symbol, since, limit)

end
function parseMarginModification(self::Aster, data, market=nothing)
    rawType = safeInteger(data, "type");
    errorCode = safeString(data, "code");
    marketId = safeString(data, "symbol");
    timestamp = safeInteger(data, "time");
    market = self.safeMarket(marketId, market, nothing, "swap");
    noErrorCode = errorCode == nothing;
    success = errorCode == "200";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => functions.ccxtruthy((rawType == 1)) ? "add" : "reduce",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.safeNumber(data, "amount"),
    Symbol("code") => safeString(data, "asset"),
    Symbol("total") => nothing,
    Symbol("status") => functions.ccxtruthy((@functions.ccxt_or(success, noErrorCode))) ? "ok" : "failed",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function modifyMarginHelper(self::Aster, symbol, amount, addOrReduce, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    amount = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("type") => addOrReduce,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    code = get(market, Symbol("quote"), nothing);
    response = Base.fetch(self.fapiPrivatePostV3PositionMargin(extend(request, params)));
    return extend(self.parseMarginModification(response, market), Dict{Symbol, Any}(
    Symbol("code") => code
))

end
function reduceMargin(self::Aster, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 2, params))

end
function addMargin(self::Aster, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 1, params))

end
function parseIncome(self::Aster, income, market=nothing)
    marketId = safeString(income, "symbol");
    currencyId = safeString(income, "asset");
    timestamp = safeInteger(income, "time");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "tranId"),
    Symbol("amount") => self.safeNumber(income, "income")
)

end
function fetchFundingHistory(self::Aster, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("incomeType") => "FUNDING_FEE"
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = Base.fetch(self.fapiPrivateGetV3Income(extend(request, params)));
    return self.parseIncomes(response, market, since, limit)

end
function parseLedgerEntry(self::Aster, item, currency=nothing)
    amount = safeString(item, "income");
    direction = nothing;
    if functions.ccxtruthy(stringLe(amount, "0"))
        direction = "out";
        amount = stringMul("-1", amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "asset");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(item, "time");
    type_var = safeString(item, "incomeType");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "tranId"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => safeString(item, "tradeId"),
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Aster, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("TRANSFER") => "transfer",
        Symbol("WELCOME_BONUS") => "cashback",
        Symbol("REALIZED_PNL") => "trade",
        Symbol("FUNDING_FEE") => "fee",
        Symbol("COMMISSION") => "commission",
        Symbol("INSURANCE_CLEAR") => "settlement",
        Symbol("MARKET_MERCHANT_RETURN_REWARD") => "cashback"
    );
    return safeString(ledgerType, type_var, type_var)

end
function fetchLedger(self::Aster, code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.fapiPrivateGetV3Income(extend(request, params)));
    return self.parseLedger(response, currency, since, limit)

end
function parsePositionRisk(self::Aster, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market, nothing, "contract");
    symbol = safeString(market, "symbol");
    isolatedMarginString = safeString(position, "isolatedMargin");
    leverageBrackets = self.safeDict(self.options, "leverageBrackets", Dict{Symbol, Any}());
    leverageBracket = self.safeList(leverageBrackets, symbol, []);
    notionalString = safeString2(position, "notional", "notionalValue");
    notionalStringAbs = stringAbs(notionalString);
    maintenanceMarginPercentageString = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverageBracket)))
        bracket = get(leverageBracket, i + 1, nothing);
        if functions.ccxtruthy(stringLt(notionalStringAbs, get(bracket, 1, nothing)))
            break
        end
        maintenanceMarginPercentageString = get(bracket, 2, nothing);
        i += 1
    end
    notional = self.parseNumber(notionalStringAbs);
    contractsAbs = stringAbs(safeString(position, "positionAmt"));
    contracts = self.parseNumber(contractsAbs);
    unrealizedPnlString = safeString(position, "unRealizedProfit");
    unrealizedPnl = self.parseNumber(unrealizedPnlString);
    liquidationPriceString = omitZero(safeString(position, "liquidationPrice"));
    liquidationPrice = self.parseNumber(liquidationPriceString);
    collateralString = nothing;
    marginMode = safeString(position, "marginType");
    if functions.ccxtruthy(@functions.ccxt_and(marginMode == nothing, isolatedMarginString != nothing))
        marginMode = functions.ccxtruthy(stringEq(isolatedMarginString, "0")) ? "cross" : "isolated";
    end
    side = nothing;
    if functions.ccxtruthy(stringGt(notionalString, "0"))
        side = "long";
    elseif functions.ccxtruthy(stringLt(notionalString, "0"))
        side = "short";
    end
    entryPriceString = safeString(position, "entryPrice");
    entryPrice = self.parseNumber(entryPriceString);
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    linear = (ccxt_in("notional", position));
    if functions.ccxtruthy(marginMode == "cross")
        precision = self.safeDict(market, "precision", Dict{Symbol, Any}());
        basePrecisionValue = safeString(precision, "base");
        quotePrecisionValue = safeString2(precision, "quote", "price");
        precisionIsUndefined = @functions.ccxt_and((basePrecisionValue == nothing), (quotePrecisionValue == nothing));
        if functions.ccxtruthy(!functions.ccxtruthy(precisionIsUndefined))
            if functions.ccxtruthy(linear)
                onePlusMaintenanceMarginPercentageString = nothing;
                entryPriceSignString = entryPriceString;
                if functions.ccxtruthy(side == "short")
                    onePlusMaintenanceMarginPercentageString = stringAdd("1", maintenanceMarginPercentageString);
                    entryPriceSignString = stringMul("-1", entryPriceSignString);
                else
                    onePlusMaintenanceMarginPercentageString = stringAdd("-1", maintenanceMarginPercentageString);
                end
                inner = stringMul(liquidationPriceString, onePlusMaintenanceMarginPercentageString);
                leftSide = stringAdd(inner, entryPriceSignString);
                quotePrecision = precisionFromString(safeString2(precision, "quote", "price"));
                if functions.ccxtruthy(quotePrecision != nothing)
                    collateralString = stringDiv(stringMul(leftSide, contractsAbs), "1", quotePrecision);
                end
            else
                onePlusMaintenanceMarginPercentageString = nothing;
                entryPriceSignString = entryPriceString;
                if functions.ccxtruthy(side == "short")
                    onePlusMaintenanceMarginPercentageString = stringSub("1", maintenanceMarginPercentageString);
                else
                    onePlusMaintenanceMarginPercentageString = stringSub("-1", maintenanceMarginPercentageString);
                    entryPriceSignString = stringMul("-1", entryPriceSignString);
                end
                leftSide = stringMul(contractsAbs, contractSizeString);
                rightSide = stringSub(stringDiv("1", entryPriceSignString), stringDiv(onePlusMaintenanceMarginPercentageString, liquidationPriceString));
                basePrecision = precisionFromString(safeString(precision, "base"));
                if functions.ccxtruthy(basePrecision != nothing)
                    collateralString = stringDiv(stringMul(leftSide, rightSide), "1", basePrecision);
                end
            end
        end
    else
        collateralString = safeString(position, "isolatedMargin");
    end
    collateralString = functions.ccxtruthy((collateralString == nothing)) ? "0" : collateralString;
    collateral = self.parseNumber(collateralString);
    markPrice = self.parseNumber(omitZero(safeString(position, "markPrice")));
    timestamp = safeInteger(position, "updateTime");
    if functions.ccxtruthy(timestamp == 0)
        timestamp = nothing;
    end
    maintenanceMarginPercentage = self.parseNumber(maintenanceMarginPercentageString);
    maintenanceMarginString = stringMul(maintenanceMarginPercentageString, notionalStringAbs);
    if functions.ccxtruthy(maintenanceMarginString == nothing)
        maintenanceMarginString = safeString(position, "maintMargin");
    end
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    initialMarginString = nothing;
    initialMarginPercentageString = nothing;
    leverageString = safeString(position, "leverage");
    if functions.ccxtruthy(leverageString != nothing)
        leverage = ccxt_parseInt(leverageString);
        rational = self.isRoundNumber(1000 % leverage);
        initialMarginPercentageString = stringDiv("1", leverageString, 8);
        if functions.ccxtruthy(!functions.ccxtruthy(rational))
            initialMarginPercentageString = stringAdd(initialMarginPercentageString, "1e-8");
        end
        unrounded = stringMul(notionalStringAbs, initialMarginPercentageString);
        initialMarginString = stringDiv(unrounded, "1", 8);
    else
        initialMarginString = safeString(position, "initialMargin");
        unrounded = stringMul(initialMarginString, "1");
        initialMarginPercentageString = stringDiv(unrounded, notionalStringAbs, 8);
    end
    marginRatio = nothing;
    percentage = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(stringEquals(collateralString, "0")))
        marginRatio = self.parseNumber(stringDiv(stringAdd(stringDiv(maintenanceMarginString, collateralString), "5e-5"), "1", 4));
        percentage = self.parseNumber(stringMul(stringDiv(unrealizedPnlString, initialMarginString, 4), "100"));
    end
    positionSide = safeString(position, "positionSide");
    hedged = positionSide != "BOTH";
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("collateral") => collateral,
    Symbol("notional") => notional,
    Symbol("markPrice") => markPrice,
    Symbol("entryPrice") => entryPrice,
    Symbol("timestamp") => timestamp,
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentageString),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("marginRatio") => marginRatio,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("marginMode") => marginMode,
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("percentage") => percentage,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchPositionsRisk(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(symbols)))
            throw(ArgumentsRequired(string(self.id, " fetchPositionsRisk() requires an array argument for symbols")));
        end
    end
    Base.fetch(self.loadMarketsAndSignIn());
    Base.fetch(self.loadLeverageBrackets(false, params));
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.fapiPrivateGetV3PositionRisk(extend(request, params)));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        rawPosition = get(response, i + 1, nothing);
        entryPriceString = safeString(rawPosition, "entryPrice");
        if functions.ccxtruthy(stringGt(entryPriceString, "0"))
                        push!(result, self.parsePositionRisk(get(response, i + 1, nothing)));
        end
        i += 1
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function fetchPositions(self::Aster, symbols=nothing, params=Dict())
    defaultMethod = nothing;
    (defaultMethod, params) = self.handleOptionAndParams(params, "fetchPositions", "method");
    if functions.ccxtruthy(defaultMethod == nothing)
        options = self.safeDict(self.options, "fetchPositions");
        if functions.ccxtruthy(options == nothing)
            defaultMethod = safeString(self.options, "fetchPositions", "positionRisk");
        else
            defaultMethod = "positionRisk";
        end
    end
    if functions.ccxtruthy(defaultMethod == "positionRisk")
            return Base.fetch(self.fetchPositionsRisk(symbols, params))
    elseif functions.ccxtruthy(defaultMethod == "account")
        return Base.fetch(self.fetchAccountPositions(symbols, params))
    else
        throw(NotSupported(string(self.id, ".options[\"fetchPositions\"][\"method\"] or params[\"method\"] = \"", defaultMethod, "\" is invalid, please choose between \"account\" and \"positionRisk\"")));
    end

end
function parseAccountPositions(self::Aster, account, filterClosed=false)
    positions = self.safeList(account, "positions", []);
    assets = self.safeList(account, "assets", []);
    balances = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        entry = get(assets, i + 1, nothing);
        currencyId = safeString(entry, "asset");
        code = self.safeCurrencyCode(currencyId);
        crossWalletBalance = safeString(entry, "crossWalletBalance");
        crossUnPnl = safeString(entry, "crossUnPnl");
        balances[Symbol(code)] = Dict{Symbol, Any}(
            Symbol("crossMargin") => stringAdd(crossWalletBalance, crossUnPnl),
            Symbol("crossWalletBalance") => crossWalletBalance
        );
        i += 1
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        position = get(positions, i + 1, nothing);
        marketId = safeString(position, "symbol");
        market = self.safeMarket(marketId, nothing, nothing, "contract");
        code = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        maintenanceMargin = safeString(position, "maintMargin");
        isPositionOpen = @functions.ccxt_and((maintenanceMargin != "0"), (maintenanceMargin != "0.00000000"));
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(filterClosed), isPositionOpen))
            if functions.ccxtruthy(ccxt_in(code, balances))
                parsed = self.parseAccountPosition(extend(position, Dict{Symbol, Any}(
                    Symbol("crossMargin") => get(get(balances, Symbol(code), nothing), Symbol("crossMargin"), nothing),
                    Symbol("crossWalletBalance") => get(get(balances, Symbol(code), nothing), Symbol("crossWalletBalance"), nothing)
                )), market);
                                push!(result, parsed);
            end
        end
        i += 1
    end
    return result

end
function parseAccountPosition(self::Aster, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market, nothing, "contract");
    symbol = safeString(market, "symbol");
    leverageString = safeString(position, "leverage");
    leverage = functions.ccxtruthy((leverageString != nothing)) ? ccxt_parseInt(leverageString) : nothing;
    initialMarginString = safeString(position, "initialMargin");
    initialMargin = self.parseNumber(initialMarginString);
    initialMarginPercentageString = nothing;
    if functions.ccxtruthy(leverageString != nothing)
        initialMarginPercentageString = stringDiv("1", leverageString, 8);
        rational = self.isRoundNumber(1000 % leverage);
        if functions.ccxtruthy(!functions.ccxtruthy(rational))
            initialMarginPercentageString = stringDiv(stringAdd(initialMarginPercentageString, "1e-8"), "1", 8);
        end
    end
    usdm = (ccxt_in("notional", position));
    maintenanceMarginString = safeString(position, "maintMargin");
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    entryPriceString = safeString(position, "entryPrice");
    entryPrice = self.parseNumber(entryPriceString);
    notionalString = safeString2(position, "notional", "notionalValue");
    notionalStringAbs = stringAbs(notionalString);
    notional = self.parseNumber(notionalStringAbs);
    contractsString = safeString(position, "positionAmt");
    contractsStringAbs = stringAbs(contractsString);
    if functions.ccxtruthy(contractsString == nothing)
        entryNotional = stringMul(stringMul(leverageString, initialMarginString), entryPriceString);
        contractSizeNew = safeString(market, "contractSize");
        contractsString = stringDiv(entryNotional, contractSizeNew);
        contractsStringAbs = stringDiv(stringAdd(contractsString, "0.5"), "1", 0);
    end
    contracts = self.parseNumber(contractsStringAbs);
    leverageBrackets = self.safeDict(self.options, "leverageBrackets", Dict{Symbol, Any}());
    leverageBracket = self.safeList(leverageBrackets, symbol, []);
    maintenanceMarginPercentageString = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverageBracket)))
        bracket = get(leverageBracket, i + 1, nothing);
        if functions.ccxtruthy(stringLt(notionalStringAbs, get(bracket, 1, nothing)))
            break
        end
        maintenanceMarginPercentageString = get(bracket, 2, nothing);
        i += 1
    end
    maintenanceMarginPercentage = self.parseNumber(maintenanceMarginPercentageString);
    unrealizedPnlString = safeString(position, "unrealizedProfit");
    unrealizedPnl = self.parseNumber(unrealizedPnlString);
    timestamp = safeInteger(position, "updateTime");
    if functions.ccxtruthy(timestamp == 0)
        timestamp = nothing;
    end
    isolated = self.safeBool(position, "isolated");
    if functions.ccxtruthy(isolated == nothing)
        isolatedMarginRaw = safeString(position, "isolatedMargin");
        isolated = !functions.ccxtruthy(stringEq(isolatedMarginRaw, "0"));
    end
    marginMode = nothing;
    collateralString = nothing;
    walletBalance = nothing;
    if functions.ccxtruthy(isolated)
        marginMode = "isolated";
        walletBalance = safeString(position, "isolatedWallet");
        collateralString = stringAdd(walletBalance, unrealizedPnlString);
    else
        marginMode = "cross";
        walletBalance = safeString(position, "crossWalletBalance");
        collateralString = safeString(position, "crossMargin");
    end
    collateral = self.parseNumber(collateralString);
    marginRatio = nothing;
    side = nothing;
    percentage = nothing;
    liquidationPriceStringRaw = nothing;
    liquidationPrice = nothing;
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    if functions.ccxtruthy(stringEquals(notionalString, "0"))
        entryPrice = nothing;
    else
        side = functions.ccxtruthy(stringLt(notionalString, "0")) ? "short" : "long";
        marginRatio = self.parseNumber(stringDiv(stringAdd(stringDiv(maintenanceMarginString, collateralString), "5e-5"), "1", 4));
        percentage = self.parseNumber(stringMul(stringDiv(unrealizedPnlString, initialMarginString, 4), "100"));
        if functions.ccxtruthy(usdm)
            onePlusMaintenanceMarginPercentageString = nothing;
            entryPriceSignString = entryPriceString;
            if functions.ccxtruthy(side == "short")
                onePlusMaintenanceMarginPercentageString = stringAdd("1", maintenanceMarginPercentageString);
            else
                onePlusMaintenanceMarginPercentageString = stringAdd("-1", maintenanceMarginPercentageString);
                entryPriceSignString = stringMul("-1", entryPriceSignString);
            end
            leftSide = stringDiv(walletBalance, stringMul(contractsStringAbs, onePlusMaintenanceMarginPercentageString));
            rightSide = stringDiv(entryPriceSignString, onePlusMaintenanceMarginPercentageString);
            liquidationPriceStringRaw = stringAdd(leftSide, rightSide);
        else
            onePlusMaintenanceMarginPercentageString = nothing;
            entryPriceSignString = entryPriceString;
            if functions.ccxtruthy(side == "short")
                onePlusMaintenanceMarginPercentageString = stringSub("1", maintenanceMarginPercentageString);
            else
                onePlusMaintenanceMarginPercentageString = stringSub("-1", maintenanceMarginPercentageString);
                entryPriceSignString = stringMul("-1", entryPriceSignString);
            end
            size_var = stringMul(contractsStringAbs, contractSizeString);
            leftSide = stringMul(size_var, onePlusMaintenanceMarginPercentageString);
            rightSide = stringSub(stringMul(stringDiv("1", entryPriceSignString), size_var), walletBalance);
            liquidationPriceStringRaw = stringDiv(leftSide, rightSide);
        end
        pricePrecision = precisionFromString(safeString(get(market, Symbol("precision"), nothing), "price"));
        pricePrecisionPlusOne = pricePrecision + 1;
        pricePrecisionPlusOneString = string(pricePrecisionPlusOne);
        rounder = Precise(string("5e-", pricePrecisionPlusOneString));
        rounderString = string(rounder);
        liquidationPriceRoundedString = stringAdd(rounderString, liquidationPriceStringRaw);
        truncatedLiquidationPrice = stringDiv(liquidationPriceRoundedString, "1", pricePrecision);
        if functions.ccxtruthy(get(truncatedLiquidationPrice, 1, nothing) == "-")
            truncatedLiquidationPrice = nothing;
        end
        liquidationPrice = self.parseNumber(truncatedLiquidationPrice);
    end
    positionSide = safeString(position, "positionSide");
    hedged = positionSide != "BOTH";
    return Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("initialMargin") => initialMargin,
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentageString),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("entryPrice") => entryPrice,
    Symbol("notional") => notional,
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("marginRatio") => marginRatio,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("markPrice") => nothing,
    Symbol("collateral") => collateral,
    Symbol("marginMode") => marginMode,
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("percentage") => percentage
)

end
function fetchAccountPositions(self::Aster, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(symbols)))
            throw(ArgumentsRequired(string(self.id, " fetchPositions() requires an array argument for symbols")));
        end
    end
    Base.fetch(self.loadMarketsAndSignIn());
    Base.fetch(self.loadLeverageBrackets(false, params));
    response = Base.fetch(self.fapiPrivateGetV4Account(params));
    filterClosed = nothing;
    (filterClosed, params) = self.handleOptionAndParams(params, "fetchAccountPositions", "filterClosed", false);
    result = self.parseAccountPositions(response, filterClosed);
    symbols = self.marketSymbols(symbols);
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function loadLeverageBrackets(self::Aster, reload=false, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    leverageBrackets = self.safeDict(self.options, "leverageBrackets");
    if functions.ccxtruthy(@functions.ccxt_or((leverageBrackets == nothing), (reload)))
        response = Base.fetch(self.fapiPrivateGetV3LeverageBracket(params));
        self.options[Symbol("leverageBrackets")] = self.createSafeDictionary();
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            entry = get(response, i + 1, nothing);
            marketId = safeString(entry, "symbol");
            symbol = self.safeSymbol(marketId, nothing, nothing, "contract");
            brackets = self.safeList(entry, "brackets", []);
            result = [];
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(brackets)))
                bracket = get(brackets, j + 1, nothing);
                floorValue = safeString(bracket, "notionalFloor");
                maintenanceMarginPercentage = safeString(bracket, "maintMarginRatio");
                push!(result, [floorValue, maintenanceMarginPercentage]);
                j += 1
            end
            self.options[Symbol("leverageBrackets")][Symbol(symbol)] = result;
            i += 1
        end

    end
    return get(self.options, Symbol("leverageBrackets"), nothing)

end
function keccakMessage(self::Aster, message)
    return string("0x", hash(message, keccak, "hex"))

end
function signMessage(self::Aster, message, privateKey)
    return self.signHash(self.keccakMessage(message), privateKey[-64 + 1:end])

end
function signWithdrawPayload(self::Aster, withdrawPayload, network)
    chainId = safeInteger(withdrawPayload, "chainId");
    domain = Dict{Symbol, Any}(
        Symbol("chainId") => chainId,
        Symbol("name") => "Aster",
        Symbol("verifyingContract") => safeString(self.options, "zeroAddress"),
        Symbol("version") => "1"
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("Action") => [Dict{Symbol, Any}(
        Symbol("name") => "type",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "destination",
        Symbol("type") => "address"
    ), Dict{Symbol, Any}(
        Symbol("name") => "destination Chain",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "token",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "fee",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint256"
    ), Dict{Symbol, Any}(
        Symbol("name") => "aster chain",
        Symbol("type") => "string"
    )]
    );
    request = Dict{Symbol, Any}(
        Symbol("type") => "Withdraw",
        Symbol("destination") => safeString(withdrawPayload, "receiver"),
        Symbol("destination Chain") => network,
        Symbol("token") => safeString(withdrawPayload, "asset"),
        Symbol("amount") => safeString(withdrawPayload, "amount"),
        Symbol("fee") => safeString(withdrawPayload, "fee"),
        Symbol("nonce") => safeInteger(withdrawPayload, "userNonce"),
        Symbol("aster chain") => "Mainnet"
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, request);
    signature = self.signMessage(msg, self.privateKey);
    return signature

end
function withdraw(self::Aster, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    Base.fetch(self.loadMarketsAndSignIn());
    currency = self.currency(code);
    nonce = milliseconds() * 1000;
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("receiver") => address,
        Symbol("userNonce") => string(nonce)
    );
    chainId = safeInteger(params, "chainId");
    networks = self.safeDict(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network");
    network = safeString(networks, network, network);
    if functions.ccxtruthy(@functions.ccxt_and((chainId == nothing), (network != nothing)))
        chainIds = self.safeDict(self.options, "networksToChainId", Dict{Symbol, Any}());
        chainId = safeInteger(chainIds, network);
    end
    if functions.ccxtruthy(chainId == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw require chainId or network parameter")));
    end
    request[Symbol("chainId")] = chainId;
    fee = safeString(params, "fee");
    if functions.ccxtruthy(fee == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw require fee parameter")));
    end
    request[Symbol("fee")] = fee;
    params = omit(params, ["chainId", "network", "fee"]);
    request[Symbol("amount")] = self.currencyToPrecision(code, amount, network);
    request[Symbol("userSignature")] = self.signWithdrawPayload(request, network);
    response = Base.fetch(self.sapiPrivatePostV3AsterUserWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseTransaction(self::Aster, transaction, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "withdrawId"),
    Symbol("txid") => safeString(transaction, "hash"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("network") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => "withdrawal",
    Symbol("amount") => nothing,
    Symbol("currency") => nothing,
    Symbol("status") => nothing,
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing
)

end
function transfer(self::Aster, code, amount, fromAccount, toAccount, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    type_var = nothing;
    fromId = nothing;
    if functions.ccxtruthy(fromAccount != nothing)
        fromId = uppercase(self.convertTypeToAccount(fromAccount));
    end
    toId = nothing;
    if functions.ccxtruthy(toAccount != nothing)
        toId = uppercase(self.convertTypeToAccount(toAccount));
    end
    if functions.ccxtruthy(@functions.ccxt_and(fromId == "SPOT", toId == "FUTURE"))
        type_var = "SPOT_FUTURE";
    elseif functions.ccxtruthy(@functions.ccxt_and(fromId == "FUTURE", toId == "SPOT"))
        type_var = "FUTURE_SPOT";
    end
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " transfer() requires fromAccount and toAccount parameters to be either SPOT or FUTURE")));
    end
    defaultClientTranId = numberToString(milliseconds());
    clientTranId = safeString(params, "clientTranId", defaultClientTranId);
    request[Symbol("kindType")] = type_var;
    request[Symbol("clientTranId")] = clientTranId;
    response = Base.fetch(self.sapiPrivatePostV3AssetWalletTransfer(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Aster, transfer, currency=nothing)
    currencyId = safeString(transfer, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "tranId"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status"))
)

end
function parseTransferStatus(self::Aster, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok"
    );
    return safeString(statuses, status, status)

end
function hashMessage(self::Aster, binaryMessage)
    binaryMessageLength = self.binaryLength(binaryMessage);
    x19 = self.base16ToBinary("19");
    newline = self.base16ToBinary("0a");
    prefix = binaryConcat(x19, self.encode("Ethereum Signed Message:"), newline, self.encode(numberToString(binaryMessageLength)));
    return string("0x", hash(binaryConcat(prefix, binaryMessage), keccak, "hex"))

end
function signHash(self::Aster, hash, privateKey)
    self.checkRequiredCredentials();
    signature = ecdsa(hash[-64 + 1:end], privateKey[-64 + 1:end], secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing)));
    return string("0x", lpad(r, 64, "0"), lpad(s, 64, "0"), v)

end
function sign(self::Aster, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", path);
    if functions.ccxtruthy(@functions.ccxt_or(api == "fapiPublic", api == "sapiPublic"))
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.rawencode(params));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(api == "fapiPrivate", api == "sapiPrivate"))
        self.checkRequiredCredentials();
        nonce = milliseconds() * 1000;
        zeroAddress = safeString(self.options, "zeroAddress", "0x0000000000000000000000000000000000000000");
        v3ChainId = safeInteger(self.options, "v3ChainId", 1666);
        walletAddress = self.ethGetAddressFromPrivateKey(self.privateKey);
        signerAddress = safeString(self.options, "signerAddress", walletAddress);
        if functions.ccxtruthy(signerAddress == nothing)
            throw(ArgumentsRequired(string(self.id, " requires signerAddress in options when use v3 api")));
        end
        domain = Dict{Symbol, Any}(
            Symbol("name") => "AsterSignTransaction",
            Symbol("version") => "1",
            Symbol("chainId") => v3ChainId,
            Symbol("verifyingContract") => zeroAddress
        );
        messageTypes = Dict{Symbol, Any}(
            Symbol("Message") => [Dict{Symbol, Any}(
            Symbol("name") => "msg",
            Symbol("type") => "string"
        )]
        );
        finalParams = extend(Dict{Symbol, Any}(
            Symbol("nonce") => string(nonce),
            Symbol("user") => walletAddress,
            Symbol("signer") => signerAddress
        ), params);
        paramString = nothing;
        isApproveBuilder = (findfirst("/approveBuilder", path) !== nothing);
        if functions.ccxtruthy(isApproveBuilder)
            messageTypes = Dict{Symbol, Any}(
                Symbol("ApproveBuilder") => [Dict{Symbol, Any}(
    Symbol("name") => "Builder",
    Symbol("type") => "string"
), Dict{Symbol, Any}(
    Symbol("name") => "MaxFeeRate",
    Symbol("type") => "string"
), Dict{Symbol, Any}(
    Symbol("name") => "BuilderName",
    Symbol("type") => "string"
), Dict{Symbol, Any}(
    Symbol("name") => "AsterChain",
    Symbol("type") => "string"
), Dict{Symbol, Any}(
    Symbol("name") => "User",
    Symbol("type") => "string"
), Dict{Symbol, Any}(
    Symbol("name") => "Nonce",
    Symbol("type") => "uint256"
)]
            );

            paramString = self.encodeValuesWithJson(finalParams);
            paramsToEncode = self.capitalizeKeys(finalParams);
        else
            paramString = self.encodeValuesWithJson(finalParams);
            paramsToEncode = Dict{Symbol, Any}(
                Symbol("msg") => paramString
            );
        end
        encodedMessage = self.ethEncodeStructuredData(domain, messageTypes, paramsToEncode);
        signature = self.signMessage(encodedMessage, self.privateKey);
        queryString = string(paramString, "&", "signature=", signature);
        if functions.ccxtruthy(method == "GET")
            url += string("?", queryString);
        else
            headers = Dict{Symbol, Any}();
            headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
            body = queryString;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function encodeValuesWithJson(self::Aster, values)
    encodedString = "";
    keys_var = objectKeys(values);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(values, Symbol(key), nothing);
        isObj = @functions.ccxt_or(functions.ccxt_isArray(value), self.isDictionary(value));
        valueJsonified = functions.ccxtruthy(isObj) ? json(value) : string(value);
        encoded = self.encodeURIComponent(valueJsonified);
        encodedString += string(key, "=", encoded, "&");
        i += 1
    end
    return encodedString[0 + 1:-1]

end
function capitalizeKeys(self::Aster, dict)
    capitalized = Dict{Symbol, Any}();
    keys_var = objectKeys(dict);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(dict, Symbol(key), nothing);
        capitalizedKey = capitalize(key);
        capitalized[Symbol(capitalizedKey)] = value;
        i += 1
    end
    return capitalized

end
function loadMarketsAndSignIn(self::Aster, )
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.signIn()]));

end
function signIn(self::Aster, params=Dict())
    if functions.ccxtruthy(self.isEmptyString(self.privateKey))
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(self.isEmptyString(self.apiKey)), !functions.ccxtruthy(self.isEmptyString(self.secret))))
            throw(NotSupported(string(self.id, "after the latest upgrade (v4.5.52), CCXT now expects the l1 private key to be provided in the credentials.")));
        end
            return false
    end
    if functions.ccxtruthy(functions.ccxt_gt(length(self.privateKey), 66))
        throw(NotSupported(string(self.id, " after the latest update (v4.5.52), CCXT now expects the l1 private key to be provided in the credentials.")));
    end
    Base.fetch(self.initializeClient(params));
    return true

end
function initializeClient(self::Aster, params=Dict())
    builderFee = self.safeBool(params, "builderFee", self.safeBool(self.options, "builderFee", true));
    if functions.ccxtruthy(!functions.ccxtruthy(builderFee))
            return false
    end
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    result = Base.fetch(self.fapiPrivateGetV3Builder());
    approvedBuilders = result;
    len = length(approvedBuilders);
    found = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, len))
        builderInfo = self.safeDict(approvedBuilders, i, Dict{Symbol, Any}());
        builderAccountId = safeString(builderInfo, "builderAddress");
        if functions.ccxtruthy(builderAccountId == safeString(self.options, "builder"))
            found = true;
            break
        end
        i += 1
    end
    if functions.ccxtruthy(!functions.ccxtruthy(found))
        self.options[Symbol("approvedBuilderFee")] = true;
        try
            request = Dict{Symbol, Any}(
                Symbol("builder") => safeString(self.options, "builder"),
                Symbol("builderName") => safeString(self.options, "builderName", "ccxt"),
                Symbol("maxFeeRate") => safeString(self.options, "builderRate"),
                Symbol("signatureChainId") => safeInteger(self.options, "v3ChainId", 1666),
                Symbol("asterChain") => "Mainnet"
            );
            authResponse = Base.fetch(self.fapiPrivatePostV3ApproveBuilder(extend(request, params)));
            codeRes = safeInteger(authResponse, "code");
            if functions.ccxtruthy(codeRes != 200)
                throw(ExchangeError(string("Builder authorization failed, ", json(authResponse))));
            end
        catch e
            self.options[Symbol("approvedBuilderFee")] = false;
            self.options[Symbol("builderFee")] = false;

        end
    end
    return nothing

end
function handleErrors(self::Aster, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "msg");
    if functions.ccxtruthy(@functions.ccxt_and(code != nothing, code != "200"))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Aster, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function fapiPublicGetV1Ping(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ping", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Ping(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ping", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1Time(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/time", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Time(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/time", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1ExchangeInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/exchangeInfo", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3ExchangeInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/exchangeInfo", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1Depth(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/depth", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Depth(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/depth", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function fapiPublicGetV1Trades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/trades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Trades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/trades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1HistoricalTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/historicalTrades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3HistoricalTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/historicalTrades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function fapiPublicGetV1AggTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/aggTrades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3AggTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/aggTrades", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function fapiPublicGetV1Klines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/klines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Klines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/klines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1IndexPriceKlines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/indexPriceKlines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3IndexPriceKlines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/indexPriceKlines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1MarkPriceKlines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/markPriceKlines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3MarkPriceKlines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/markPriceKlines", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1PremiumIndex(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/premiumIndex", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3PremiumIndex(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/premiumIndex", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1FundingRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/fundingRate", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3FundingRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/fundingRate", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1FundingInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/fundingInfo", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3FundingInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/fundingInfo", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1Ticker24hr(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/24hr", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Ticker24hr(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/24hr", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1TickerPrice(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/price", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3TickerPrice(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/price", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1TickerBookTicker(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/bookTicker", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3TickerBookTicker(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/bookTicker", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1AdlQuantile(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/adlQuantile", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV1ForceOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/forceOrders", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPublicGetV3Indexreferences(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/indexreferences", "fapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1PositionSideDual(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/positionSide/dual", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3PositionSideDual(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/positionSide/dual", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function fapiPrivateGetV1MultiAssetsMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/multiAssetsMargin", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3MultiAssetsMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/multiAssetsMargin", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1OpenOrder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/openOrder", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3OpenOrder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/openOrder", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1OpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/openOrders", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3OpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/openOrders", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1AllOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/allOrders", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3AllOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/allOrders", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV2Balance(self::Aster, params=Dict(), context=Dict())
    return request(self, "v2/balance", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Balance(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/balance", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Account(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/account", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1PositionMarginHistory(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/positionMargin/history", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3PositionMarginHistory(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/positionMargin/history", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV2PositionRisk(self::Aster, params=Dict(), context=Dict())
    return request(self, "v2/positionRisk", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3PositionRisk(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/positionRisk", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1UserTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/userTrades", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3UserTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/userTrades", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function fapiPrivateGetV1Income(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/income", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Income(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/income", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1LeverageBracket(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/leverageBracket", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3LeverageBracket(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/leverageBracket", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV1CommissionRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/commissionRate", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3CommissionRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/commissionRate", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3AdlQuantile(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/adlQuantile", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3ForceOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/forceOrders", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Mmp(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/mmp", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3AccountWithJoinMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/accountWithJoinMargin", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV4Account(self::Aster, params=Dict(), context=Dict())
    return request(self, "v4/account", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Agent(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/agent", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateGetV3Builder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/builder", "fapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1PositionSideDual(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/positionSide/dual", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3PositionSideDual(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/positionSide/dual", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1MultiAssetsMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/multiAssetsMargin", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3MultiAssetsMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/multiAssetsMargin", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1OrderTest(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order/test", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3OrderTest(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order/test", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1BatchOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/batchOrders", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3BatchOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/batchOrders", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1AssetWalletTransfer(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/asset/wallet/transfer", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3AssetWalletTransfer(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/asset/wallet/transfer", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1CountdownCancelAll(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/countdownCancelAll", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3CountdownCancelAll(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/countdownCancelAll", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1Leverage(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/leverage", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3Leverage(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/leverage", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1MarginType(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/marginType", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3MarginType(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/marginType", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1PositionMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/positionMargin", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3PositionMargin(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/positionMargin", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3Mmp(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/mmp", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3MmpReset(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/mmpReset", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3Noop(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/noop", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3ApproveAgent(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/approveAgent", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3UpdateAgent(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/updateAgent", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3ApproveBuilder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/approveBuilder", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePostV3UpdateBuilder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/updateBuilder", "fapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePutV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "fapiPrivate", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivatePutV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "fapiPrivate", "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV1AllOpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/allOpenOrders", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3AllOpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/allOpenOrders", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV1BatchOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/batchOrders", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3BatchOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/batchOrders", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3Mmp(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/mmp", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3Agent(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/agent", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function fapiPrivateDeleteV3Builder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/builder", "fapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Ping(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ping", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Time(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/time", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1ExchangeInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/exchangeInfo", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Depth(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/depth", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Trades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/trades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1HistoricalTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/historicalTrades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1AggTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/aggTrades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Klines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/klines", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1Ticker24hr(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/24hr", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1TickerPrice(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/price", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1TickerBookTicker(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/ticker/bookTicker", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV1AsterWithdrawEstimateFee(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/aster/withdraw/estimateFee", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3Ping(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ping", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3Time(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/time", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3ExchangeInfo(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/exchangeInfo", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3Depth(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/depth", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function sapiPublicGetV3Trades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/trades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3HistoricalTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/historicalTrades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function sapiPublicGetV3AggTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/aggTrades", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function sapiPublicGetV3Klines(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/klines", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPublicGetV3Ticker24hr(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/24hr", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 40))
end

function sapiPublicGetV3TickerPrice(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/price", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 2))
end

function sapiPublicGetV3TickerBookTicker(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/ticker/bookTicker", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 2))
end

function sapiPublicGetV3AsterWithdrawEstimateFee(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/aster/withdraw/estimateFee", "sapiPublic", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1CommissionRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/commissionRate", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1OpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/openOrders", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1AllOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/allOrders", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1TransactionHistory(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/transactionHistory", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1Account(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/account", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV1UserTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/userTrades", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV3CommissionRate(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/commissionRate", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 2))
end

function sapiPrivateGetV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV3OpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/openOrders", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateGetV3AllOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/allOrders", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function sapiPrivateGetV3Account(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/account", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function sapiPrivateGetV3UserTrades(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/userTrades", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function sapiPrivateGetV3OpenOrder(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/openOrder", "sapiPrivate", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV1AssetWalletTransfer(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/asset/wallet/transfer", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function sapiPrivatePostV1AssetSendToAddress(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/asset/sendToAddress", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV3AssetWalletTransfer(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/asset/wallet/transfer", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function sapiPrivatePostV3AsterUserWithdraw(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/aster/user-withdraw", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePostV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "sapiPrivate", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivatePutV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "sapiPrivate", "PUT", params, nothing, nothing, Dict())
end

function sapiPrivatePutV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "sapiPrivate", "PUT", params, nothing, nothing, Dict())
end

function sapiPrivateDeleteV1Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/order", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateDeleteV1AllOpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/allOpenOrders", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateDeleteV1ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v1/listenKey", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateDeleteV3AllOpenOrders(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/allOpenOrders", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateDeleteV3Order(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/order", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPrivateDeleteV3ListenKey(self::Aster, params=Dict(), context=Dict())
    return request(self, "v3/listenKey", "sapiPrivate", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Aster(; kwargs...)
    inst = Aster(Exchange(), describe, isInverse, isLinear, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchTime, parseOHLCV, fetchOHLCV, parseTrade, fetchTrades, fetchMyTrades, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, fetchLastPrices, parseLastPrice, fetchBidsAsks, parseFundingRate, fetchFundingRate, fetchFundingRates, fetchFundingIntervals, fetchFundingRateHistory, parseFundingRateHistory, fetchBalance, parseBalance, setMarginMode, fetchPositionMode, setPositionMode, parseTradingFee, fetchTradingFee, parseOrderStatus, parseOrderType, parseOrder, fetchOrder, fetchOpenOrder, fetchOrders, fetchOpenOrders, createOrder, createOrders, createOrderRequest, cancelAllOrders, cancelOrder, cancelOrders, setLeverage, fetchLeverages, parseLeverage, fetchMarginModes, parseMarginMode, fetchMarginAdjustmentHistory, parseMarginModification, modifyMarginHelper, reduceMargin, addMargin, parseIncome, fetchFundingHistory, parseLedgerEntry, parseLedgerEntryType, fetchLedger, parsePositionRisk, fetchPositionsRisk, fetchPositions, parseAccountPositions, parseAccountPosition, fetchAccountPositions, loadLeverageBrackets, keccakMessage, signMessage, signWithdrawPayload, withdraw, parseTransaction, transfer, parseTransfer, parseTransferStatus, hashMessage, signHash, sign, encodeValuesWithJson, capitalizeKeys, loadMarketsAndSignIn, signIn, initializeClient, handleErrors, fapiPublicGetV1Ping, fapiPublicGetV3Ping, fapiPublicGetV1Time, fapiPublicGetV3Time, fapiPublicGetV1ExchangeInfo, fapiPublicGetV3ExchangeInfo, fapiPublicGetV1Depth, fapiPublicGetV3Depth, fapiPublicGetV1Trades, fapiPublicGetV3Trades, fapiPublicGetV1HistoricalTrades, fapiPublicGetV3HistoricalTrades, fapiPublicGetV1AggTrades, fapiPublicGetV3AggTrades, fapiPublicGetV1Klines, fapiPublicGetV3Klines, fapiPublicGetV1IndexPriceKlines, fapiPublicGetV3IndexPriceKlines, fapiPublicGetV1MarkPriceKlines, fapiPublicGetV3MarkPriceKlines, fapiPublicGetV1PremiumIndex, fapiPublicGetV3PremiumIndex, fapiPublicGetV1FundingRate, fapiPublicGetV3FundingRate, fapiPublicGetV1FundingInfo, fapiPublicGetV3FundingInfo, fapiPublicGetV1Ticker24hr, fapiPublicGetV3Ticker24hr, fapiPublicGetV1TickerPrice, fapiPublicGetV3TickerPrice, fapiPublicGetV1TickerBookTicker, fapiPublicGetV3TickerBookTicker, fapiPublicGetV1AdlQuantile, fapiPublicGetV1ForceOrders, fapiPublicGetV3Indexreferences, fapiPrivateGetV1PositionSideDual, fapiPrivateGetV3PositionSideDual, fapiPrivateGetV1MultiAssetsMargin, fapiPrivateGetV3MultiAssetsMargin, fapiPrivateGetV1Order, fapiPrivateGetV3Order, fapiPrivateGetV1OpenOrder, fapiPrivateGetV3OpenOrder, fapiPrivateGetV1OpenOrders, fapiPrivateGetV3OpenOrders, fapiPrivateGetV1AllOrders, fapiPrivateGetV3AllOrders, fapiPrivateGetV2Balance, fapiPrivateGetV3Balance, fapiPrivateGetV3Account, fapiPrivateGetV1PositionMarginHistory, fapiPrivateGetV3PositionMarginHistory, fapiPrivateGetV2PositionRisk, fapiPrivateGetV3PositionRisk, fapiPrivateGetV1UserTrades, fapiPrivateGetV3UserTrades, fapiPrivateGetV1Income, fapiPrivateGetV3Income, fapiPrivateGetV1LeverageBracket, fapiPrivateGetV3LeverageBracket, fapiPrivateGetV1CommissionRate, fapiPrivateGetV3CommissionRate, fapiPrivateGetV3AdlQuantile, fapiPrivateGetV3ForceOrders, fapiPrivateGetV3Mmp, fapiPrivateGetV3AccountWithJoinMargin, fapiPrivateGetV4Account, fapiPrivateGetV3Agent, fapiPrivateGetV3Builder, fapiPrivatePostV1PositionSideDual, fapiPrivatePostV3PositionSideDual, fapiPrivatePostV1MultiAssetsMargin, fapiPrivatePostV3MultiAssetsMargin, fapiPrivatePostV1Order, fapiPrivatePostV3Order, fapiPrivatePostV1OrderTest, fapiPrivatePostV3OrderTest, fapiPrivatePostV1BatchOrders, fapiPrivatePostV3BatchOrders, fapiPrivatePostV1AssetWalletTransfer, fapiPrivatePostV3AssetWalletTransfer, fapiPrivatePostV1CountdownCancelAll, fapiPrivatePostV3CountdownCancelAll, fapiPrivatePostV1Leverage, fapiPrivatePostV3Leverage, fapiPrivatePostV1MarginType, fapiPrivatePostV3MarginType, fapiPrivatePostV1PositionMargin, fapiPrivatePostV3PositionMargin, fapiPrivatePostV1ListenKey, fapiPrivatePostV3ListenKey, fapiPrivatePostV3Mmp, fapiPrivatePostV3MmpReset, fapiPrivatePostV3Noop, fapiPrivatePostV3ApproveAgent, fapiPrivatePostV3UpdateAgent, fapiPrivatePostV3ApproveBuilder, fapiPrivatePostV3UpdateBuilder, fapiPrivatePutV1ListenKey, fapiPrivatePutV3ListenKey, fapiPrivateDeleteV1Order, fapiPrivateDeleteV3Order, fapiPrivateDeleteV1AllOpenOrders, fapiPrivateDeleteV3AllOpenOrders, fapiPrivateDeleteV1BatchOrders, fapiPrivateDeleteV3BatchOrders, fapiPrivateDeleteV3Mmp, fapiPrivateDeleteV1ListenKey, fapiPrivateDeleteV3ListenKey, fapiPrivateDeleteV3Agent, fapiPrivateDeleteV3Builder, sapiPublicGetV1Ping, sapiPublicGetV1Time, sapiPublicGetV1ExchangeInfo, sapiPublicGetV1Depth, sapiPublicGetV1Trades, sapiPublicGetV1HistoricalTrades, sapiPublicGetV1AggTrades, sapiPublicGetV1Klines, sapiPublicGetV1Ticker24hr, sapiPublicGetV1TickerPrice, sapiPublicGetV1TickerBookTicker, sapiPublicGetV1AsterWithdrawEstimateFee, sapiPublicGetV3Ping, sapiPublicGetV3Time, sapiPublicGetV3ExchangeInfo, sapiPublicGetV3Depth, sapiPublicGetV3Trades, sapiPublicGetV3HistoricalTrades, sapiPublicGetV3AggTrades, sapiPublicGetV3Klines, sapiPublicGetV3Ticker24hr, sapiPublicGetV3TickerPrice, sapiPublicGetV3TickerBookTicker, sapiPublicGetV3AsterWithdrawEstimateFee, sapiPrivateGetV1CommissionRate, sapiPrivateGetV1Order, sapiPrivateGetV1OpenOrders, sapiPrivateGetV1AllOrders, sapiPrivateGetV1TransactionHistory, sapiPrivateGetV1Account, sapiPrivateGetV1UserTrades, sapiPrivateGetV3CommissionRate, sapiPrivateGetV3Order, sapiPrivateGetV3OpenOrders, sapiPrivateGetV3AllOrders, sapiPrivateGetV3Account, sapiPrivateGetV3UserTrades, sapiPrivateGetV3OpenOrder, sapiPrivatePostV1Order, sapiPrivatePostV1AssetWalletTransfer, sapiPrivatePostV1AssetSendToAddress, sapiPrivatePostV1ListenKey, sapiPrivatePostV3Order, sapiPrivatePostV3AssetWalletTransfer, sapiPrivatePostV3AsterUserWithdraw, sapiPrivatePostV3ListenKey, sapiPrivatePutV1ListenKey, sapiPrivatePutV3ListenKey, sapiPrivateDeleteV1Order, sapiPrivateDeleteV1AllOpenOrders, sapiPrivateDeleteV1ListenKey, sapiPrivateDeleteV3AllOpenOrders, sapiPrivateDeleteV3Order, sapiPrivateDeleteV3ListenKey)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
