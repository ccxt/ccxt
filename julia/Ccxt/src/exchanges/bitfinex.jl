@kwdef mutable struct Bitfinex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    isFiat::Function = isFiat
    getCurrencyName::Function = getCurrencyName
    amountToPrecision::Function = amountToPrecision
    priceToPrecision::Function = priceToPrecision
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrenciesCustom::Function = parseCurrenciesCustom
    parseCurrencyCustom::Function = parseCurrencyCustom
    fetchBalance::Function = fetchBalance
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    convertDerivativesId::Function = convertDerivativesId
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    parseOrderStatus::Function = parseOrderStatus
    parseOrderFlags::Function = parseOrderFlags
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    fetchOpenOrder::Function = fetchOpenOrder
    fetchClosedOrder::Function = fetchClosedOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchTradingFees::Function = fetchTradingFees
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    withdraw::Function = withdraw
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterest::Function = fetchOpenInterest
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    parseOpenInterest::Function = parseOpenInterest
    fetchLiquidations::Function = fetchLiquidations
    parseLiquidation::Function = parseLiquidation
    setMargin::Function = setMargin
    parseMarginModification::Function = parseMarginModification
    fetchOrder::Function = fetchOrder
    editOrder::Function = editOrder

# Generated REST endpoint fields
    publicGetConfConfig::Function = publicGetConfConfig
    publicGetConfPubActionObject::Function = publicGetConfPubActionObject
    publicGetConfPubActionObjectDetail::Function = publicGetConfPubActionObjectDetail
    publicGetConfPubMapObject::Function = publicGetConfPubMapObject
    publicGetConfPubMapObjectDetail::Function = publicGetConfPubMapObjectDetail
    publicGetConfPubMapCurrencyDetail::Function = publicGetConfPubMapCurrencyDetail
    publicGetConfPubMapCurrencySym::Function = publicGetConfPubMapCurrencySym
    publicGetConfPubMapCurrencyLabel::Function = publicGetConfPubMapCurrencyLabel
    publicGetConfPubMapCurrencyUnit::Function = publicGetConfPubMapCurrencyUnit
    publicGetConfPubMapCurrencyUndl::Function = publicGetConfPubMapCurrencyUndl
    publicGetConfPubMapCurrencyPool::Function = publicGetConfPubMapCurrencyPool
    publicGetConfPubMapCurrencyExplorer::Function = publicGetConfPubMapCurrencyExplorer
    publicGetConfPubMapCurrencyTxFee::Function = publicGetConfPubMapCurrencyTxFee
    publicGetConfPubMapTxMethod::Function = publicGetConfPubMapTxMethod
    publicGetConfPubListObject::Function = publicGetConfPubListObject
    publicGetConfPubListObjectDetail::Function = publicGetConfPubListObjectDetail
    publicGetConfPubListCurrency::Function = publicGetConfPubListCurrency
    publicGetConfPubListPairExchange::Function = publicGetConfPubListPairExchange
    publicGetConfPubListPairMargin::Function = publicGetConfPubListPairMargin
    publicGetConfPubListPairFutures::Function = publicGetConfPubListPairFutures
    publicGetConfPubListCompetitions::Function = publicGetConfPubListCompetitions
    publicGetConfPubInfoObject::Function = publicGetConfPubInfoObject
    publicGetConfPubInfoObjectDetail::Function = publicGetConfPubInfoObjectDetail
    publicGetConfPubInfoPair::Function = publicGetConfPubInfoPair
    publicGetConfPubInfoPairFutures::Function = publicGetConfPubInfoPairFutures
    publicGetConfPubInfoTxStatus::Function = publicGetConfPubInfoTxStatus
    publicGetConfPubFees::Function = publicGetConfPubFees
    publicGetPlatformStatus::Function = publicGetPlatformStatus
    publicGetTickers::Function = publicGetTickers
    publicGetTickerSymbol::Function = publicGetTickerSymbol
    publicGetTickersHist::Function = publicGetTickersHist
    publicGetTradesSymbolHist::Function = publicGetTradesSymbolHist
    publicGetBookSymbolPrecision::Function = publicGetBookSymbolPrecision
    publicGetBookSymbolP0::Function = publicGetBookSymbolP0
    publicGetBookSymbolP1::Function = publicGetBookSymbolP1
    publicGetBookSymbolP2::Function = publicGetBookSymbolP2
    publicGetBookSymbolP3::Function = publicGetBookSymbolP3
    publicGetBookSymbolR0::Function = publicGetBookSymbolR0
    publicGetStats1KeySizeSymbolSideSection::Function = publicGetStats1KeySizeSymbolSideSection
    publicGetStats1KeySizeSymbolSideLast::Function = publicGetStats1KeySizeSymbolSideLast
    publicGetStats1KeySizeSymbolSideHist::Function = publicGetStats1KeySizeSymbolSideHist
    publicGetStats1KeySizeSymbolSection::Function = publicGetStats1KeySizeSymbolSection
    publicGetStats1KeySizeSymbolLast::Function = publicGetStats1KeySizeSymbolLast
    publicGetStats1KeySizeSymbolHist::Function = publicGetStats1KeySizeSymbolHist
    publicGetStats1KeySizeSymbolLongLast::Function = publicGetStats1KeySizeSymbolLongLast
    publicGetStats1KeySizeSymbolLongHist::Function = publicGetStats1KeySizeSymbolLongHist
    publicGetStats1KeySizeSymbolShortLast::Function = publicGetStats1KeySizeSymbolShortLast
    publicGetStats1KeySizeSymbolShortHist::Function = publicGetStats1KeySizeSymbolShortHist
    publicGetCandlesTradeTimeframeSymbolPeriodSection::Function = publicGetCandlesTradeTimeframeSymbolPeriodSection
    publicGetCandlesTradeTimeframeSymbolSection::Function = publicGetCandlesTradeTimeframeSymbolSection
    publicGetCandlesTradeTimeframeSymbolLast::Function = publicGetCandlesTradeTimeframeSymbolLast
    publicGetCandlesTradeTimeframeSymbolHist::Function = publicGetCandlesTradeTimeframeSymbolHist
    publicGetStatusType::Function = publicGetStatusType
    publicGetStatusDeriv::Function = publicGetStatusDeriv
    publicGetStatusDerivSymbolHist::Function = publicGetStatusDerivSymbolHist
    publicGetLiquidationsHist::Function = publicGetLiquidationsHist
    publicGetRankingsKeyTimeframeSymbolSection::Function = publicGetRankingsKeyTimeframeSymbolSection
    publicGetRankingsKeyTimeframeSymbolHist::Function = publicGetRankingsKeyTimeframeSymbolHist
    publicGetPulseHist::Function = publicGetPulseHist
    publicGetPulseProfileNickname::Function = publicGetPulseProfileNickname
    publicGetFundingStatsSymbolHist::Function = publicGetFundingStatsSymbolHist
    publicGetExtVasps::Function = publicGetExtVasps
    publicPostCalcTradeAvg::Function = publicPostCalcTradeAvg
    publicPostCalcFx::Function = publicPostCalcFx
    privatePostAuthRWallets::Function = privatePostAuthRWallets
    privatePostAuthRWalletsHist::Function = privatePostAuthRWalletsHist
    privatePostAuthROrders::Function = privatePostAuthROrders
    privatePostAuthROrdersSymbol::Function = privatePostAuthROrdersSymbol
    privatePostAuthWOrderSubmit::Function = privatePostAuthWOrderSubmit
    privatePostAuthWOrderUpdate::Function = privatePostAuthWOrderUpdate
    privatePostAuthWOrderCancel::Function = privatePostAuthWOrderCancel
    privatePostAuthWOrderMulti::Function = privatePostAuthWOrderMulti
    privatePostAuthWOrderCancelMulti::Function = privatePostAuthWOrderCancelMulti
    privatePostAuthROrdersSymbolHist::Function = privatePostAuthROrdersSymbolHist
    privatePostAuthROrdersHist::Function = privatePostAuthROrdersHist
    privatePostAuthROrderSymbolIdTrades::Function = privatePostAuthROrderSymbolIdTrades
    privatePostAuthRTradesSymbolHist::Function = privatePostAuthRTradesSymbolHist
    privatePostAuthRTradesHist::Function = privatePostAuthRTradesHist
    privatePostAuthRLedgersCurrencyHist::Function = privatePostAuthRLedgersCurrencyHist
    privatePostAuthRLedgersHist::Function = privatePostAuthRLedgersHist
    privatePostAuthRInfoMarginKey::Function = privatePostAuthRInfoMarginKey
    privatePostAuthRInfoMarginBase::Function = privatePostAuthRInfoMarginBase
    privatePostAuthRInfoMarginSymAll::Function = privatePostAuthRInfoMarginSymAll
    privatePostAuthRPositions::Function = privatePostAuthRPositions
    privatePostAuthWPositionClaim::Function = privatePostAuthWPositionClaim
    privatePostAuthWPositionIncrease::Function = privatePostAuthWPositionIncrease
    privatePostAuthRPositionIncreaseInfo::Function = privatePostAuthRPositionIncreaseInfo
    privatePostAuthRPositionsHist::Function = privatePostAuthRPositionsHist
    privatePostAuthRPositionsAudit::Function = privatePostAuthRPositionsAudit
    privatePostAuthRPositionsSnap::Function = privatePostAuthRPositionsSnap
    privatePostAuthWDerivCollateralSet::Function = privatePostAuthWDerivCollateralSet
    privatePostAuthWDerivCollateralLimits::Function = privatePostAuthWDerivCollateralLimits
    privatePostAuthRFundingOffers::Function = privatePostAuthRFundingOffers
    privatePostAuthRFundingOffersSymbol::Function = privatePostAuthRFundingOffersSymbol
    privatePostAuthWFundingOfferSubmit::Function = privatePostAuthWFundingOfferSubmit
    privatePostAuthWFundingOfferCancel::Function = privatePostAuthWFundingOfferCancel
    privatePostAuthWFundingOfferCancelAll::Function = privatePostAuthWFundingOfferCancelAll
    privatePostAuthWFundingClose::Function = privatePostAuthWFundingClose
    privatePostAuthWFundingAuto::Function = privatePostAuthWFundingAuto
    privatePostAuthWFundingKeep::Function = privatePostAuthWFundingKeep
    privatePostAuthRFundingOffersSymbolHist::Function = privatePostAuthRFundingOffersSymbolHist
    privatePostAuthRFundingOffersHist::Function = privatePostAuthRFundingOffersHist
    privatePostAuthRFundingLoans::Function = privatePostAuthRFundingLoans
    privatePostAuthRFundingLoansHist::Function = privatePostAuthRFundingLoansHist
    privatePostAuthRFundingLoansSymbol::Function = privatePostAuthRFundingLoansSymbol
    privatePostAuthRFundingLoansSymbolHist::Function = privatePostAuthRFundingLoansSymbolHist
    privatePostAuthRFundingCredits::Function = privatePostAuthRFundingCredits
    privatePostAuthRFundingCreditsHist::Function = privatePostAuthRFundingCreditsHist
    privatePostAuthRFundingCreditsSymbol::Function = privatePostAuthRFundingCreditsSymbol
    privatePostAuthRFundingCreditsSymbolHist::Function = privatePostAuthRFundingCreditsSymbolHist
    privatePostAuthRFundingTradesSymbolHist::Function = privatePostAuthRFundingTradesSymbolHist
    privatePostAuthRFundingTradesHist::Function = privatePostAuthRFundingTradesHist
    privatePostAuthRInfoFundingKey::Function = privatePostAuthRInfoFundingKey
    privatePostAuthRInfoUser::Function = privatePostAuthRInfoUser
    privatePostAuthRSummary::Function = privatePostAuthRSummary
    privatePostAuthRLoginsHist::Function = privatePostAuthRLoginsHist
    privatePostAuthRPermissions::Function = privatePostAuthRPermissions
    privatePostAuthWToken::Function = privatePostAuthWToken
    privatePostAuthRAuditHist::Function = privatePostAuthRAuditHist
    privatePostAuthWTransfer::Function = privatePostAuthWTransfer
    privatePostAuthWDepositAddress::Function = privatePostAuthWDepositAddress
    privatePostAuthWDepositInvoice::Function = privatePostAuthWDepositInvoice
    privatePostAuthWWithdraw::Function = privatePostAuthWWithdraw
    privatePostAuthRMovementsCurrencyHist::Function = privatePostAuthRMovementsCurrencyHist
    privatePostAuthRMovementsHist::Function = privatePostAuthRMovementsHist
    privatePostAuthRAlerts::Function = privatePostAuthRAlerts
    privatePostAuthWAlertSet::Function = privatePostAuthWAlertSet
    privatePostAuthWAlertPriceSymbolPriceDel::Function = privatePostAuthWAlertPriceSymbolPriceDel
    privatePostAuthWAlertTypeSymbolPriceDel::Function = privatePostAuthWAlertTypeSymbolPriceDel
    privatePostAuthCalcOrderAvail::Function = privatePostAuthCalcOrderAvail
    privatePostAuthWSettingsSet::Function = privatePostAuthWSettingsSet
    privatePostAuthRSettings::Function = privatePostAuthRSettings
    privatePostAuthWSettingsDel::Function = privatePostAuthWSettingsDel
    privatePostAuthRPulseHist::Function = privatePostAuthRPulseHist
    privatePostAuthWPulseAdd::Function = privatePostAuthWPulseAdd
    privatePostAuthWPulseDel::Function = privatePostAuthWPulseDel

end
function describe(self::Bitfinex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitfinex",
    Symbol("name") => "Bitfinex",
    Symbol("countries") => ["VG"],
    Symbol("version") => "v2",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createLimitOrder") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrder") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => "emulated",
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => true,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => nothing,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("3h") => "3h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1D",
        Symbol("1w") => "7D",
        Symbol("2w") => "14D",
        Symbol("1M") => "1M"
    ),
    Symbol("rateLimit") => 250,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/4a8e947f-ab46-481a-a8ae-8b20e9b03178",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v1") => "https://api.bitfinex.com",
            Symbol("public") => "https://api-pub.bitfinex.com",
            Symbol("private") => "https://api.bitfinex.com"
        ),
        Symbol("www") => "https://www.bitfinex.com",
        Symbol("doc") => ["https://docs.bitfinex.com/v2/docs/", "https://github.com/bitfinexcom/bitfinex-api-node"],
        Symbol("fees") => "https://www.bitfinex.com/fees"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("conf/{config}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:{action}:{object}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:{action}:{object}:{detail}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:{object}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:{object}:{detail}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:{detail}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:sym") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:label") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:unit") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:undl") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:pool") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:explorer") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:currency:tx:fee") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:map:tx:method") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:{object}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:{object}:{detail}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:currency") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:pair:exchange") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:pair:margin") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:pair:futures") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:list:competitions") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:info:{object}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:info:{object}:{detail}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:info:pair") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:info:pair:futures") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:info:tx:status") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("conf/pub:fees") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("platform/status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("ticker/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("tickers/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("trades/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("book/{symbol}/{precision}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book/{symbol}/P0") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book/{symbol}/P1") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book/{symbol}/P2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book/{symbol}/P3") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book/{symbol}/R0") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stats1/{key}:{size}:{symbol}:{side}/{section}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:{side}/last") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:{side}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}/{section}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}/last") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:long/last") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:long/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:short/last") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("stats1/{key}:{size}:{symbol}:short/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("candles/trade:{timeframe}:{symbol}:{period}/{section}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("candles/trade:{timeframe}:{symbol}/{section}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("candles/trade:{timeframe}:{symbol}/last") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("candles/trade:{timeframe}:{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("status/{type}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("status/deriv") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("status/deriv/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("liquidations/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 80
),
                Symbol("rankings/{key}:{timeframe}:{symbol}/{section}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("rankings/{key}:{timeframe}:{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("pulse/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("pulse/profile/{nickname}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("funding/stats/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("ext/vasps") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("calc/trade/avg") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("calc/fx") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("auth/r/wallets") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/wallets/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/orders/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/order/submit") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/order/update") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/order/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/order/cancel/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/orders/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/orders/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/order/{symbol}:{id}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/trades/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/trades/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/ledgers/{currency}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/ledgers/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/info/margin/{key}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/info/margin/base") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/info/margin/sym_all") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/position/claim") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/position/increase:") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/position/increase/info") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/positions/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/positions/audit") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/positions/snap") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/deriv/collateral/set") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/deriv/collateral/limits") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/offers") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/offers/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/offer/submit") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/offer/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/offer/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/close") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/auto") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/funding/keep") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/offers/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/offers/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/loans") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/loans/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/loans/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/loans/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/credits") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/credits/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/credits/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/credits/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/trades/{symbol}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/funding/trades/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/info/funding/{key}") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/info/user") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/logins/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/permissions") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/token") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/audit/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 24
),
                Symbol("auth/w/deposit/invoice") => Dict{Symbol, Any}(
    Symbol("cost") => 24
),
                Symbol("auth/w/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 24
),
                Symbol("auth/r/movements/{currency}/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/movements/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/alerts") => Dict{Symbol, Any}(
    Symbol("cost") => 5.34
),
                Symbol("auth/w/alert/set") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/alert/price:{symbol}:{price}/del") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/alert/{type}:{symbol}:{price}/del") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/calc/order/avail") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/settings/set") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/settings/del") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/r/pulse/hist") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
),
                Symbol("auth/w/pulse/add") => Dict{Symbol, Any}(
    Symbol("cost") => 16
),
                Symbol("auth/w/pulse/del") => Dict{Symbol, Any}(
    Symbol("cost") => 2.7
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("percentage") => true,
            Symbol("tierBased") => true,
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("500000"), self.parseNumber("0.002")], [self.parseNumber("1000000"), self.parseNumber("0.002")], [self.parseNumber("2500000"), self.parseNumber("0.002")], [self.parseNumber("5000000"), self.parseNumber("0.002")], [self.parseNumber("7500000"), self.parseNumber("0.002")], [self.parseNumber("10000000"), self.parseNumber("0.0018")], [self.parseNumber("15000000"), self.parseNumber("0.0016")], [self.parseNumber("20000000"), self.parseNumber("0.0014")], [self.parseNumber("25000000"), self.parseNumber("0.0012")], [self.parseNumber("30000000"), self.parseNumber("0.001")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("500000"), self.parseNumber("0.0008")], [self.parseNumber("1000000"), self.parseNumber("0.0006")], [self.parseNumber("2500000"), self.parseNumber("0.0004")], [self.parseNumber("5000000"), self.parseNumber("0.0002")], [self.parseNumber("7500000"), self.parseNumber("0")], [self.parseNumber("10000000"), self.parseNumber("0")], [self.parseNumber("15000000"), self.parseNumber("0")], [self.parseNumber("20000000"), self.parseNumber("0")], [self.parseNumber("25000000"), self.parseNumber("0")], [self.parseNumber("30000000"), self.parseNumber("0")]]
            )
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}()
        )
    ),
    Symbol("precisionMode") => SIGNIFICANT_DIGITS,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchOrderBook") => Dict{Symbol, Any}(
            Symbol("precision") => "R0"
        ),
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("defaultPrecision") => 8
        ),
        Symbol("exchangeTypes") => Dict{Symbol, Any}(
            Symbol("MARKET") => "market",
            Symbol("EXCHANGE MARKET") => "market",
            Symbol("LIMIT") => "limit",
            Symbol("EXCHANGE LIMIT") => "limit",
            Symbol("EXCHANGE STOP") => "market",
            Symbol("EXCHANGE FOK") => "limit",
            Symbol("EXCHANGE STOP LIMIT") => "limit",
            Symbol("EXCHANGE IOC") => "limit"
        ),
        Symbol("orderTypes") => Dict{Symbol, Any}(
            Symbol("market") => "EXCHANGE MARKET",
            Symbol("limit") => "EXCHANGE LIMIT"
        ),
        Symbol("fiat") => Dict{Symbol, Any}(
            Symbol("USD") => "USD",
            Symbol("EUR") => "EUR",
            Symbol("JPY") => "JPY",
            Symbol("GBP") => "GBP",
            Symbol("CHN") => "CHN"
        ),
        Symbol("v2AccountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "exchange",
            Symbol("exchange") => "exchange",
            Symbol("funding") => "funding",
            Symbol("margin") => "margin",
            Symbol("derivatives") => "margin",
            Symbol("future") => "margin",
            Symbol("swap") => "margin"
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("includeFee") => false
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BITCOIN",
            Symbol("LTC") => "LITECOIN",
            Symbol("ERC20") => "ETHEREUM",
            Symbol("OMNI") => "TETHERUSO",
            Symbol("LIQUID") => "TETHERUSL",
            Symbol("TRC20") => "TETHERUSX",
            Symbol("EOS") => "TETHERUSS",
            Symbol("AVAX") => "TETHERUSDTAVAX",
            Symbol("SOL") => "TETHERUSDTSOL",
            Symbol("ALGO") => "TETHERUSDTALG",
            Symbol("BCH") => "TETHERUSDTBCH",
            Symbol("KSM") => "TETHERUSDTKSM",
            Symbol("DVF") => "TETHERUSDTDVF",
            Symbol("OMG") => "TETHERUSDTOMG"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("TETHERUSE") => "ERC20"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => true,
                Symbol("leverage") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 75
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 2500,
                Symbol("daysBack") => nothing,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 10000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("11010") => RateLimitExceeded,
            Symbol("10001") => PermissionDenied,
            Symbol("10020") => BadRequest,
            Symbol("10100") => AuthenticationError,
            Symbol("10114") => InvalidNonce,
            Symbol("20060") => OnMaintenance,
            Symbol("temporarily_unavailable") => ExchangeNotAvailable
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("available balance is only") => InsufficientFunds,
            Symbol("not enough exchange balance") => InsufficientFunds,
            Symbol("Order not found") => OrderNotFound,
            Symbol("symbol: invalid") => BadSymbol
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("UST") => "USDT",
        Symbol("EUTF0") => "EURT",
        Symbol("USTF0") => "USDT",
        Symbol("ALG") => "ALGO",
        Symbol("AMP") => "AMPL",
        Symbol("ATO") => "ATOM",
        Symbol("BCHABC") => "XEC",
        Symbol("BCHN") => "BCH",
        Symbol("DAT") => "DATA",
        Symbol("DOG") => "MDOGE",
        Symbol("DSH") => "DASH",
        Symbol("EDO") => "PNT",
        Symbol("EUS") => "EURS",
        Symbol("EUT") => "EURT",
        Symbol("HTX") => "HT",
        Symbol("IDX") => "ID",
        Symbol("IOT") => "IOTA",
        Symbol("IQX") => "IQ",
        Symbol("LUNA") => "LUNC",
        Symbol("LUNA2") => "LUNA",
        Symbol("MNA") => "MANA",
        Symbol("ORS") => "ORS Group",
        Symbol("PAS") => "PASS",
        Symbol("QSH") => "QASH",
        Symbol("QTM") => "QTUM",
        Symbol("RBT") => "RBTC",
        Symbol("SNG") => "SNGLS",
        Symbol("STJ") => "STORJ",
        Symbol("TERRAUST") => "USTC",
        Symbol("TSD") => "TUSD",
        Symbol("YGG") => "YEED",
        Symbol("YYW") => "YOYOW",
        Symbol("UDC") => "USDC",
        Symbol("VSY") => "VSYS",
        Symbol("WAX") => "WAXP",
        Symbol("XCH") => "XCHF",
        Symbol("ZBT") => "ZB"
    )
))

end
function isFiat(self::Bitfinex, code)
    return (ccxt_in(code, get(self.options, Symbol("fiat"), nothing)))

end
function getCurrencyName(self::Bitfinex, code)
    if functions.ccxtruthy(ccxt_in(code, get(self.options, Symbol("currencyNames"), nothing)))
            return get(get(self.options, Symbol("currencyNames"), nothing), Symbol(code), nothing)
    end
    throw(NotSupported(string(self.id, " ", code, " not supported for withdrawal")));

end
function amountToPrecision(self::Bitfinex, symbol, amount)
    symbol = self.safeSymbol(symbol);
    market = self.market(symbol);
    return decimalToPrecision(amount, TRUNCATE, get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing), DECIMAL_PLACES)

end
function priceToPrecision(self::Bitfinex, symbol, price)
    symbol = self.safeSymbol(symbol);
    market = self.market(symbol);
    price = decimalToPrecision(price, ROUND, get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing), self.precisionMode);
    return decimalToPrecision(price, TRUNCATE, 8, DECIMAL_PLACES)

end
function fetchStatus(self::Bitfinex, params=Dict())
    response = Base.fetch(self.publicGetPlatformStatus(params));
    statusRaw = safeString(response, 0);
    return Dict{Symbol, Any}(
    Symbol("status") => safeString(Dict{Symbol, Any}(
    Symbol("0") => "maintenance",
    Symbol("1") => "ok"
), statusRaw, statusRaw),
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchMarkets(self::Bitfinex, params=Dict())
    labels = ["pub:info:pair", "pub:info:pair:futures", "pub:list:pair:securities", "pub:list:pair:margin"];
    config = join(labels, ",");
    request = Dict{Symbol, Any}(
        Symbol("config") => config
    );
    response = Base.fetch(self.publicGetConfConfig(extend(request, params)));
    spotMarketsInfo = self.safeList(response, 0, []);
    futuresMarketsInfo = self.safeList(response, 1, []);
    securitiesMarketsIds = self.safeList(response, 2, []);
    marginIds = self.safeList(response, 3, []);
    markets = arrayConcat(spotMarketsInfo, futuresMarketsInfo);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        pairObj = get(markets, i + 1, nothing);
        id = safeStringUpper(pairObj, 0);
        market = safeValue(pairObj, 1, Dict{Symbol, Any}());
        spot = true;
        type_var = nothing;
        if functions.ccxtruthy(findfirst("F0", id) !== nothing)
            spot = false;
            type_var = "swap";
        else
            type_var = "spot";
        end
        swap = type_var == "swap";
        baseId = nothing;
        quoteId = nothing;
        if functions.ccxtruthy(findfirst(":", id) !== nothing)
            parts = split(id, ":");
            baseId = get(parts, 1, nothing);
            quoteId = get(parts, 2, nothing);
        else
            baseId = functions.ccxt_slice(id, 0, 3);
            quoteId = functions.ccxt_slice(id, 3, 6);
        end
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        splitBase = split(base, "F0");
        splitQuote = split(quote_var, "F0");
        base = safeString(splitBase, 0);
        quote_var = safeString(splitQuote, 0);
        symbol = string(base, "/", quote_var);
        settle = nothing;
        settleId = nothing;
        if functions.ccxtruthy(swap)
            settle = quote_var;
            settleId = quote_var;
            symbol = string(symbol, ":", settle);
        end
        minOrderSizeString = safeString(market, 3);
        maxOrderSizeString = safeString(market, 4);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => string("t", id),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("tradfi") => inArray(id, securitiesMarketsIds),
    Symbol("margin") => (@functions.ccxt_and(spot, inArray(id, marginIds))),
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => !functions.ccxtruthy(spot),
    Symbol("linear") => functions.ccxtruthy(swap) ? true : nothing,
    Symbol("inverse") => functions.ccxtruthy(swap) ? false : nothing,
    Symbol("contractSize") => functions.ccxtruthy(swap) ? self.parseNumber("1") : nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => ccxt_parseInt("8"),
        Symbol("price") => ccxt_parseInt("5")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minOrderSizeString),
            Symbol("max") => self.parseNumber(maxOrderSizeString)
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1e-8"),
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
function fetchCurrencies(self::Bitfinex, params=Dict())
    labels = ["pub:list:currency", "pub:map:currency:sym", "pub:map:currency:label", "pub:map:currency:unit", "pub:map:currency:undl", "pub:map:currency:pool", "pub:map:currency:explorer", "pub:map:currency:tx:fee", "pub:map:tx:method", "pub:info:tx:status", "pub:list:currency:margin"];
    config = join(labels, ",");
    request = Dict{Symbol, Any}(
        Symbol("config") => config
    );
    response = Base.fetch(self.publicGetConfConfig(extend(request, params)));
    indexed = Dict{Symbol, Any}(
        Symbol("sym") => indexBy(self.safeList(response, 1, []), 0),
        Symbol("label") => indexBy(self.safeList(response, 2, []), 0),
        Symbol("unit") => indexBy(self.safeList(response, 3, []), 0),
        Symbol("undl") => indexBy(self.safeList(response, 4, []), 0),
        Symbol("pool") => indexBy(self.safeList(response, 5, []), 0),
        Symbol("explorer") => indexBy(self.safeList(response, 6, []), 0),
        Symbol("fees") => indexBy(self.safeList(response, 7, []), 0),
        Symbol("networks") => self.safeList(response, 8, []),
        Symbol("statuses") => indexBy(self.safeList(response, 9, []), 0),
        Symbol("marginables") => self.safeList(response, 10, [])
    );
    indexedNetworks = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(get(indexed, Symbol("networks"), nothing))))
        networkObj = get(get(indexed, Symbol("networks"), nothing), i + 1, nothing);
        networkId = safeString(networkObj, 0);
        valuesList = self.safeList(networkObj, 1);
        networkName = safeString(valuesList, 0);
        networksList = self.safeList(indexedNetworks, networkName, []);
        push!(networksList, networkId);
        indexedNetworks[Symbol(networkName)] = networksList;
        i += 1
    end
    ids = self.safeList(response, 0, []);
    return self.parseCurrenciesCustom(ids, indexed, indexedNetworks)

end
function parseCurrenciesCustom(self::Bitfinex, ids, indexed, indexedNetworks)
    allowedIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        if functions.ccxtruthy(endswith(id, "F0"))
            i += 1; continue
        end
        push!(allowedIds, id);
        i += 1
    end
    result = Dict{Symbol, Any}();
    arr = toArray(allowedIds);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(arr)))
        parsed = self.parseCurrencyCustom(get(arr, i + 1, nothing), indexed, indexedNetworks);
        code = get(parsed, Symbol("code"), nothing);
        result[Symbol(code)] = parsed;
        i += 1
    end
    return result

end
function parseCurrencyCustom(self::Bitfinex, id, indexed, indexedNetworks)
    code = self.safeCurrencyCode(id);
    label = self.safeList(get(indexed, Symbol("label"), nothing), id, []);
    name = safeString(label, 1);
    pool = self.safeList(get(indexed, Symbol("pool"), nothing), id, []);
    rawType = safeString(pool, 1);
    isCryptoCoin = @functions.ccxt_or((rawType != nothing), (ccxt_in(id, get(indexed, Symbol("explorer"), nothing))));
    type_var = functions.ccxtruthy(isCryptoCoin) ? "crypto" : nothing;
    feeValues = self.safeList(get(indexed, Symbol("fees"), nothing), id, []);
    fees = self.safeList(feeValues, 1, []);
    fee = self.safeNumber(fees, 1);
    undl = self.safeList(get(indexed, Symbol("undl"), nothing), id, []);
    defaultCurrencyPrecision = safeString(self.options, "defaultCurrencyPrecision", "8");
    precision = numberToString(self.handleOption("fetchCurrencies", "defaultPrecision", defaultCurrencyPrecision));
    networks = Dict{Symbol, Any}();
    networkIds = self.safeList(indexedNetworks, id, []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
        networkId = safeString(networkIds, j);
        if functions.ccxtruthy(networkId == nothing)
            j += 1; continue
        end
        network = self.networkIdToCode(networkId, code);
        dwStatuses = self.safeList(get(indexed, Symbol("statuses"), nothing), networkId, []);
        if functions.ccxtruthy(network != nothing)
            networks[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => networkId,
                Symbol("id") => lowercase(networkId),
                Symbol("network") => networkId,
                Symbol("active") => nothing,
                Symbol("deposit") => safeInteger(dwStatuses, 1) == 1,
                Symbol("withdraw") => safeInteger(dwStatuses, 2) == 1,
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => [id, label, pool, feeValues, undl],
    Symbol("type") => type_var,
    Symbol("name") => name,
    Symbol("active") => true,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => fee,
    Symbol("precision") => self.parseNumber(precision),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => fee,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks,
    Symbol("margin") => inArray(id, get(indexed, Symbol("marginables"), nothing))
))

end
function fetchBalance(self::Bitfinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountsByType = safeValue(self.options, "v2AccountsByType", Dict{Symbol, Any}());
    requestedType = safeString(params, "type", "exchange");
    accountType = safeString(accountsByType, requestedType, requestedType);
    if functions.ccxtruthy(accountType == nothing)
        keys_var = objectKeys(accountsByType);
        throw(ExchangeError(string(self.id, " fetchBalance() type parameter must be one of ", join(keys_var, ", "))));
    end
    isDerivative = requestedType == "derivatives";
    query = omit(params, "type");
    response = Base.fetch(self.privatePostAuthRWallets(query));
    balances = toArray(response);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        account = self.account();
        interest = safeString(balance, 3);
        if functions.ccxtruthy(interest != "0")
            account[Symbol("debt")] = interest;
        end
        type_var = safeString(balance, 0);
        currencyId = safeStringLower(balance, 1, "");
        start = length(currencyId) - 2;
        isDerivativeCode = functions.ccxt_slice(currencyId, start) == "f0";
        derivativeCondition = (@functions.ccxt_or(!functions.ccxtruthy(isDerivative), isDerivativeCode));
        if functions.ccxtruthy(@functions.ccxt_and((accountType == type_var), derivativeCondition))
            code = self.safeCurrencyCode(currencyId);
            account[Symbol("total")] = safeString(balance, 2);
            account[Symbol("free")] = safeString(balance, 4);
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
        end
        i += 1
    end
    return self.safeBalance(result)

end
function transfer(self::Bitfinex, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountsByType = safeValue(self.options, "v2AccountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount);
    if functions.ccxtruthy(fromId == nothing)
        keys_var = objectKeys(accountsByType);
        throw(ArgumentsRequired(string(self.id, " transfer() fromAccount must be one of ", join(keys_var, ", "))));
    end
    toId = safeString(accountsByType, toAccount);
    if functions.ccxtruthy(toId == nothing)
        keys_var = objectKeys(accountsByType);
        throw(ArgumentsRequired(string(self.id, " transfer() toAccount must be one of ", join(keys_var, ", "))));
    end
    currency = self.currency(code);
    fromCurrencyId = self.convertDerivativesId(currency, fromAccount);
    toCurrencyId = self.convertDerivativesId(currency, toAccount);
    requestedAmount = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("amount") => requestedAmount,
        Symbol("currency") => fromCurrencyId,
        Symbol("currency_to") => toCurrencyId,
        Symbol("from") => fromId,
        Symbol("to") => toId
    );
    response = Base.fetch(self.privatePostAuthWTransfer(extend(request, params)));
    error = safeString(response, 0);
    if functions.ccxtruthy(error == "error")
        message = safeString(response, 2, "");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, string(self.id, " ", message));
        throw(ExchangeError(string(self.id, " ", message)));
    end
    return self.parseTransfer(Dict{Symbol, Any}(
    Symbol("result") => response
), currency)

end
function parseTransfer(self::Bitfinex, transfer, currency=nothing)
    result = self.safeList(transfer, "result");
    timestamp = safeInteger(result, 0);
    info = safeValue(result, 4);
    fromAccount = safeString(info, 1);
    toAccount = safeString(info, 2);
    currencyId = safeString(info, 5);
    status = safeString(result, 6);
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("status") => self.parseTransferStatus(status),
    Symbol("amount") => self.safeNumber(info, 7),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("info") => result
)

end
function parseTransferStatus(self::Bitfinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok",
        Symbol("ERROR") => "failed",
        Symbol("FAILURE") => "failed"
    );
    return safeString(statuses, status, status)

end
function convertDerivativesId(self::Bitfinex, currency, type_var)
    info = safeValue(currency, "info");
    transferId = safeString(info, 0);
    underlying = safeValue(info, 4, []);
    currencyId = nothing;
    if functions.ccxtruthy(type_var == "derivatives")
        currencyId = safeString(underlying, 0, transferId);
        start = length(currencyId) - 2;
        isDerivativeCode = functions.ccxt_slice(currencyId, start) == "F0";
        if functions.ccxtruthy(!functions.ccxtruthy(isDerivativeCode))
            currencyId = string(currencyId, "F0");
        end
    elseif functions.ccxtruthy(type_var != "margin")
        currencyId = safeString(underlying, 1, transferId);
    else
        currencyId = transferId;
    end
    return currencyId

end
function fetchOrderBook(self::Bitfinex, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    precision = self.handleOption("fetchOrderBook", "precision", "R0");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("precision") => precision
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("len")] = limit;
    end
    fullRequest = extend(request, params);
    orderbook = Base.fetch(self.publicGetBookSymbolPrecision(fullRequest));
    timestamp = milliseconds();
    result = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("symbol"), nothing),
        Symbol("bids") => [],
        Symbol("asks") => [],
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp),
        Symbol("nonce") => nothing
    );
    priceIndex = functions.ccxtruthy((get(fullRequest, Symbol("precision"), nothing) == "R0")) ? 1 : 0;
    orders = toArray(orderbook);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        price = self.safeNumber(order, priceIndex);
        signedAmount = safeString(order, 2);
        amount = stringAbs(signedAmount);
        side = functions.ccxtruthy(stringGt(signedAmount, "0")) ? "bids" : "asks";
        push!(get(result, Symbol(side), nothing), [price, self.parseNumber(amount)]);
        i += 1
    end
    result[Symbol("bids")] = sortBy(get(result, Symbol("bids"), nothing), 0, true);
    result[Symbol("asks")] = sortBy(get(result, Symbol("asks"), nothing), 0);
    return result

end
function parseTicker(self::Bitfinex, ticker, market=nothing)
    len = length(ticker);
    firstValue = self.safeNumber(ticker, 0);
    isFetchTicker = firstValue != nothing;
    symbol = nothing;
    minusIndex = 0;
    if functions.ccxtruthy(isFetchTicker)
        minusIndex = 1;
    else
        marketId = safeString(ticker, 0);
        market = self.safeMarket(marketId, market);
    end
    isFundingCurrency = functions.ccxt_ge(len, 17);
    symbol = self.safeSymbol(nothing, market);
    last_var = nothing;
    bid = nothing;
    ask = nothing;
    change = nothing;
    percentage = nothing;
    volume = nothing;
    high = nothing;
    low = nothing;
    if functions.ccxtruthy(isFundingCurrency)
        last_var = safeString(ticker, 10 - minusIndex);
        bid = safeString(ticker, 2 - minusIndex);
        ask = safeString(ticker, 5 - minusIndex);
        change = safeString(ticker, 8 - minusIndex);
        percentage = safeString(ticker, 9 - minusIndex);
        volume = safeString(ticker, 11 - minusIndex);
        high = safeString(ticker, 12 - minusIndex);
        low = safeString(ticker, 13 - minusIndex);
    else
        last_var = safeString(ticker, 7 - minusIndex);
        bid = safeString(ticker, 1 - minusIndex);
        ask = safeString(ticker, 3 - minusIndex);
        change = safeString(ticker, 5 - minusIndex);
        percentage = safeString(ticker, 6 - minusIndex);
        percentage = stringMul(percentage, "100");
        volume = safeString(ticker, 8 - minusIndex);
        high = safeString(ticker, 9 - minusIndex);
        low = safeString(ticker, 10 - minusIndex);
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => bid,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => ask,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => volume,
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Bitfinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        ids = self.marketIds(symbols);
        request[Symbol("symbols")] =         join(ids, ",");
    else
        request[Symbol("symbols")] = "ALL";
    end
    tickers = Base.fetch(self.publicGetTickers(extend(request, params)));
    return self.parseTickers(tickers, symbols)

end
function fetchTicker(self::Bitfinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    ticker = Base.fetch(self.publicGetTickerSymbol(extend(request, params)));
    return self.parseTicker(ticker, market)

end
function parseTrade(self::Bitfinex, trade, market=nothing)
    tradeList = self.safeList(trade, "result", []);
    tradeLength = length(tradeList);
    isPrivate = (functions.ccxt_gt(tradeLength, 5));
    id = safeString(tradeList, 0);
    amountIndex = functions.ccxtruthy(isPrivate) ? 4 : 2;
    side = nothing;
    amountString = safeString(tradeList, amountIndex);
    priceIndex = functions.ccxtruthy(isPrivate) ? 5 : 3;
    priceString = safeString(tradeList, priceIndex);
    if functions.ccxtruthy(get(amountString, 1, nothing) == "-")
        side = "sell";
        amountString = stringAbs(amountString);
    else
        side = "buy";
    end
    orderId = nothing;
    takerOrMaker = nothing;
    type_var = nothing;
    fee = nothing;
    symbol = self.safeSymbol(nothing, market);
    timestampIndex = functions.ccxtruthy(isPrivate) ? 2 : 1;
    timestamp = safeInteger(tradeList, timestampIndex);
    if functions.ccxtruthy(isPrivate)
        marketId = get(tradeList, 2, nothing);
        symbol = self.safeSymbol(marketId);
        orderId = safeString(tradeList, 3);
        maker = safeInteger(tradeList, 8);
        takerOrMaker = functions.ccxtruthy((maker == 1)) ? "maker" : "taker";
        feeCostString = safeString(tradeList, 9);
        feeCostString = stringNeg(feeCostString);
        feeCurrencyId = safeString(tradeList, 10);
        feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrency
        );
        orderType = get(tradeList, 7, nothing);
        type_var = safeString(get(self.options, Symbol("exchangeTypes"), nothing), orderType);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("side") => side,
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => tradeList
), market)

end
function fetchTrades(self::Bitfinex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol, since, limit, params, 10000))
    end
    market = self.market(symbol);
    sort_var = "-1";
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
        sort_var = "1";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 10000);
    end
    request[Symbol("sort")] = sort_var;
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetTradesSymbolHist(extend(request, params)));
    rawTrades = toArray(response);
    trades = sortBy(rawTrades, 1);
    tradesList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        push!(tradesList, Dict{Symbol, Any}(
    Symbol("result") => get(trades, i + 1, nothing)
));
        i += 1
    end
    return self.parseTrades(tradesList, market, nothing, limit)

end
function fetchOHLCV(self::Bitfinex, symbol, timeframe="1m", since=nothing, limit=100, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 10000))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 10000;
    else
        limit = min(limit, 10000);
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("timeframe") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
        request[Symbol("sort")] = 1;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetCandlesTradeTimeframeSymbolHist(extend(request, params)));
    return self.parseOHLCVs(toArray(response), market, timeframe, since, limit)

end
function parseOHLCV(self::Bitfinex, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
function parseOrderStatus(self::Bitfinex, status)
    if functions.ccxtruthy(status == nothing)
            return status
    end
    parts = split(status, " ");
    state = safeString(parts, 0);
    statuses = Dict{Symbol, Any}(
        Symbol("ACTIVE") => "open",
        Symbol("PARTIALLY") => "open",
        Symbol("EXECUTED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("INSUFFICIENT") => "canceled",
        Symbol("POSTONLY CANCELED") => "canceled",
        Symbol("RSN_DUST") => "rejected",
        Symbol("RSN_PAUSE") => "rejected",
        Symbol("IOC CANCELED") => "canceled",
        Symbol("FILLORKILL CANCELED") => "canceled"
    );
    return safeString(statuses, state, status)

end
function parseOrderFlags(self::Bitfinex, flags)
    flagValues = Dict{Symbol, Any}(
        Symbol("1024") => ["reduceOnly"],
        Symbol("4096") => ["postOnly"],
        Symbol("5120") => ["reduceOnly", "postOnly"]
    );
    return safeValue(flagValues, flags, nothing)

end
function parseTimeInForce(self::Bitfinex, orderType)
    orderTypes = Dict{Symbol, Any}(
        Symbol("EXCHANGE IOC") => "IOC",
        Symbol("EXCHANGE FOK") => "FOK",
        Symbol("IOC") => "IOC",
        Symbol("FOK") => "FOK"
    );
    return safeString(orderTypes, orderType, "GTC")

end
function parseOrder(self::Bitfinex, order, market=nothing)
    orderList = self.safeList(order, "result");
    id = safeString(orderList, 0);
    marketId = safeString(orderList, 3);
    symbol = self.safeSymbol(marketId);
    timestamp = safeInteger(orderList, 5);
    remaining = stringAbs(safeString(orderList, 6));
    signedAmount = safeString(orderList, 7);
    amount = stringAbs(signedAmount);
    side = functions.ccxtruthy(stringLt(signedAmount, "0")) ? "sell" : "buy";
    orderType = safeString(orderList, 8);
    type_var = safeString(safeValue(self.options, "exchangeTypes"), orderType);
    timeInForce = self.parseTimeInForce(orderType);
    rawFlags = safeString(orderList, 12);
    flags = self.parseOrderFlags(rawFlags);
    postOnly = false;
    if functions.ccxtruthy(flags != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(flags)))
            if functions.ccxtruthy(get(flags, i + 1, nothing) == "postOnly")
                postOnly = true;
            end
            i += 1
        end

    end
    price = safeString(orderList, 16);
    triggerPrice = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((orderType == "EXCHANGE STOP"), (orderType == "EXCHANGE STOP LIMIT")))
        price = nothing;
        triggerPrice = safeString(orderList, 16);
        if functions.ccxtruthy(orderType == "EXCHANGE STOP LIMIT")
            price = safeString(orderList, 19);
        end
    end
    status = nothing;
    statusString = safeString(orderList, 13);
    if functions.ccxtruthy(statusString != nothing)
        parts = split(statusString, " @ ");
        status = self.parseOrderStatus(safeString(parts, 0));
    end
    average = safeString(orderList, 17);
    clientOrderId = safeString(orderList, 2);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => orderList,
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
    Symbol("cost") => nothing,
    Symbol("average") => average,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function createOrderRequest(self::Bitfinex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    amountString = self.amountToPrecision(symbol, amount);
    amountString = functions.ccxtruthy((side == "buy")) ? amountString : stringNeg(amountString);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amountString
    );
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    trailingAmount = safeString(params, "trailingAmount");
    timeInForce = safeString(params, "timeInForce");
    postOnlyParam = self.safeBool(params, "postOnly", false);
    reduceOnly = self.safeBool(params, "reduceOnly", false);
    clientOrderId = safeValue2(params, "cid", "clientOrderId");
    orderType = uppercase(type_var);
    if functions.ccxtruthy(trailingAmount != nothing)
        orderType = "TRAILING STOP";
        request[Symbol("price_trailing")] = trailingAmount;
    elseif functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, triggerPrice);
        if functions.ccxtruthy(type_var == "limit")
            orderType = "STOP LIMIT";
            request[Symbol("price_aux_limit")] = self.priceToPrecision(symbol, price);
        else
            orderType = "STOP";
        end
    end
    ioc = (timeInForce == "IOC");
    fok = (timeInForce == "FOK");
    postOnly = (@functions.ccxt_or(postOnlyParam, (timeInForce == "PO")));
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(ioc, fok)), (price == nothing)))
        throw(InvalidOrder(string(self.id, " createOrder() requires a price argument with IOC and FOK orders")));
    end
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(ioc, fok)), (type_var == "market")))
        throw(InvalidOrder(string(self.id, " createOrder() does not allow market IOC and FOK orders")));
    end
    if functions.ccxtruthy(@functions.ccxt_and((type_var != "market"), (triggerPrice == nothing)))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(ioc)
        orderType = "IOC";
    elseif functions.ccxtruthy(fok)
        orderType = "FOK";
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), (marginMode == nothing)))
        orderType = string("EXCHANGE ", orderType);
    end
    request[Symbol("type")] = orderType;
    flags = 0;
    if functions.ccxtruthy(postOnly)
        flags = self.sum(flags, 4096);
    end
    if functions.ccxtruthy(reduceOnly)
        flags = self.sum(flags, 1024);
    end
    if functions.ccxtruthy(flags != 0)
        request[Symbol("flags")] = flags;
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cid")] = clientOrderId;
    end
    params = omit(params, ["triggerPrice", "stopPrice", "timeInForce", "postOnly", "reduceOnly", "trailingAmount", "clientOrderId"]);
    return extend(request, params)

end
function createOrder(self::Bitfinex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    response = Base.fetch(self.privatePostAuthWOrderSubmit(request));
    status = safeString(response, 6);
    if functions.ccxtruthy(status != "SUCCESS")
        errorCode = safeString(response, 5);
        errorText = safeString(response, 7);
        throw(ExchangeError(string(self.id, " ", status, ": ", errorText, " (#", errorCode, ")")));
    end
    orders = self.safeList(response, 4, []);
    order = self.safeList(orders, 0);
    newOrder = Dict{Symbol, Any}(
        Symbol("result") => order
    );
    return self.parseOrder(newOrder, market)

end
function createOrders(self::Bitfinex, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        symbol = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = self.safeNumber(rawOrder, "amount");
        price = self.safeNumber(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, orderParams);
        push!(ordersRequests, ["on", orderRequest]);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("ops") => ordersRequests
    );
    response = Base.fetch(self.privatePostAuthWOrderMulti(request));
    results = [];
    data = self.safeList(response, 4, []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        individualOrder = get(entry, 5, nothing);
        push!(results, Dict{Symbol, Any}(
    Symbol("result") => get(individualOrder, 1, nothing)
));
        i += 1
    end
    return self.parseOrders(results)

end
function cancelAllOrders(self::Bitfinex, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("all") => 1
    );
    response = Base.fetch(self.privatePostAuthWOrderCancelMulti(extend(request, params)));
    orders = self.safeList(response, 4, []);
    ordersList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        push!(ordersList, Dict{Symbol, Any}(
    Symbol("result") => get(orders, i + 1, nothing)
));
        i += 1
    end
    return self.parseOrders(ordersList)

end
function cancelOrder(self::Bitfinex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    cid = safeValue2(params, "cid", "clientOrderId");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(cid != nothing)
        cidDate = safeValue(params, "cidDate");
        if functions.ccxtruthy(cidDate == nothing)
            throw(InvalidOrder(string(self.id, " canceling an order by clientOrderId ('cid') requires both 'cid' and 'cid_date' ('YYYY-MM-DD')")));
        end
        request = Dict{Symbol, Any}(
            Symbol("cid") => cid,
            Symbol("cid_date") => cidDate
        );
        params = omit(params, ["cid", "clientOrderId"]);
    else
        request = Dict{Symbol, Any}(
            Symbol("id") => ccxt_parseInt(id)
        );
    end
    response = Base.fetch(self.privatePostAuthWOrderCancel(extend(request, params)));
    order = safeValue(response, 4);
    newOrder = Dict{Symbol, Any}(
        Symbol("result") => order
    );
    return self.parseOrder(newOrder, market)

end
function cancelOrders(self::Bitfinex, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    numericIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(numericIds, self.parseToNumeric(get(ids, i + 1, nothing)));
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => numericIds
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privatePostAuthWOrderCancelMulti(extend(request, params)));
    orders = self.safeList(response, 4, []);
    ordersList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        push!(ordersList, Dict{Symbol, Any}(
    Symbol("result") => get(orders, i + 1, nothing)
));
        i += 1
    end
    return self.parseOrders(ordersList, market)

end
function fetchOpenOrder(self::Bitfinex, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("id") => [ccxt_parseInt(id)]
    );
    orders = Base.fetch(self.fetchOpenOrders(symbol, nothing, nothing, extend(request, params)));
    order = safeValue(orders, 0);
    if functions.ccxtruthy(order == nothing)
        throw(OrderNotFound(string(self.id, " order ", id, " not found")));
    end
    return order

end
function fetchClosedOrder(self::Bitfinex, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("id") => [ccxt_parseInt(id)]
    );
    orders = Base.fetch(self.fetchClosedOrders(symbol, nothing, nothing, extend(request, params)));
    order = safeValue(orders, 0);
    if functions.ccxtruthy(order == nothing)
        throw(OrderNotFound(string(self.id, " order ", id, " not found")));
    end
    return order

end
function fetchOpenOrders(self::Bitfinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol == nothing)
        response = Base.fetch(self.privatePostAuthROrders(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostAuthROrdersSymbol(extend(request, params)));
    end
    ordersList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        push!(ordersList, Dict{Symbol, Any}(
    Symbol("result") => get(response, i + 1, nothing)
));
        i += 1
    end
    return self.parseOrders(ordersList, market, since, limit)

end
function fetchClosedOrders(self::Bitfinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchClosedOrders", symbol, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    market = nothing;
    if functions.ccxtruthy(symbol == nothing)
        response = Base.fetch(self.privatePostAuthROrdersHist(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostAuthROrdersSymbolHist(extend(request, params)));
    end
    ordersList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        push!(ordersList, Dict{Symbol, Any}(
    Symbol("result") => get(response, i + 1, nothing)
));
        i += 1
    end
    return self.parseOrders(ordersList, market, since, limit)

end
function fetchOrderTrades(self::Bitfinex, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderId = ccxt_parseInt(id);
    request = Dict{Symbol, Any}(
        Symbol("id") => orderId,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostAuthROrderSymbolIdTrades(extend(request, params)));
    rawTrades = toArray(response);
    tradesList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawTrades)))
        push!(tradesList, Dict{Symbol, Any}(
    Symbol("result") => get(rawTrades, i + 1, nothing)
));
        i += 1
    end
    return self.parseTrades(tradesList, market, since, limit)

end
function fetchMyTrades(self::Bitfinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("end") => milliseconds()
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostAuthRTradesSymbolHist(extend(request, params)));
    else
        response = Base.fetch(self.privatePostAuthRTradesHist(extend(request, params)));
    end
    tradesList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        push!(tradesList, Dict{Symbol, Any}(
    Symbol("result") => get(response, i + 1, nothing)
));
        i += 1
    end
    return self.parseTrades(tradesList, market, since, limit)

end
function createDepositAddress(self::Bitfinex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("op_renew") => 1
    );
    return Base.fetch(self.fetchDepositAddress(code, extend(request, params)))

end
function fetchDepositAddress(self::Bitfinex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = safeString(params, "network", code);
    currencyNetworks = safeValue(currency, "networks", Dict{Symbol, Any}());
    currencyNetwork = safeValue(currencyNetworks, network);
    networkId = safeString(currencyNetwork, "id");
    if functions.ccxtruthy(networkId == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() could not find a network for '", code, "'. You can specify it by providing the 'network' value inside params")));
    end
    wallet = safeString(params, "wallet", "exchange");
    params = omit(params, "network", "wallet");
    request = Dict{Symbol, Any}(
        Symbol("method") => networkId,
        Symbol("wallet") => wallet,
        Symbol("op_renew") => 0
    );
    response = Base.fetch(self.privatePostAuthWDepositAddress(extend(request, params)));
    result = safeValue(response, 4, []);
    poolAddress = safeString(result, 5);
    address = functions.ccxtruthy((poolAddress == nothing)) ? safeString(result, 4) : poolAddress;
    tag = functions.ccxtruthy((poolAddress == nothing)) ? nothing : safeString(result, 4);
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => tag,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
function parseTransactionStatus(self::Bitfinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok",
        Symbol("COMPLETED") => "ok",
        Symbol("ERROR") => "failed",
        Symbol("FAILURE") => "failed",
        Symbol("CANCELED") => "canceled",
        Symbol("PENDING APPROVAL") => "pending",
        Symbol("PENDING") => "pending",
        Symbol("PENDING REVIEW") => "pending",
        Symbol("PENDING CANCELLATION") => "pending",
        Symbol("SENDING") => "pending",
        Symbol("USER APPROVED") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitfinex, transaction, currency=nothing)
    transactionLength = length(transaction);
    timestamp = nothing;
    updated = nothing;
    code = nothing;
    amount = nothing;
    id = nothing;
    status = nothing;
    tag = nothing;
    type_var = nothing;
    feeCost = nothing;
    txid = nothing;
    addressTo = nothing;
    network = nothing;
    comment = nothing;
    if functions.ccxtruthy(transactionLength == 8)
        data = safeValue(transaction, 4, []);
        timestamp = safeInteger(transaction, 0);
        if functions.ccxtruthy(currency != nothing)
            code = get(currency, Symbol("code"), nothing);
        end
        feeCost = safeString(data, 8);
        if functions.ccxtruthy(feeCost != nothing)
            feeCost = stringAbs(feeCost);
        end
        amount = self.safeNumber(data, 5);
        id = safeInteger(data, 0);
        status = "ok";
        if functions.ccxtruthy(id == 0)
            id = nothing;
            status = "failed";
        end
        tag = safeString(data, 3);
        type_var = "withdrawal";
        networkId = safeString(data, 2);
        network = self.networkIdToCode(uppercase(networkId), code);
    elseif functions.ccxtruthy(transactionLength == 22)
        id = safeString(transaction, 0);
        currencyId = safeString(transaction, 1);
        code = self.safeCurrencyCode(currencyId, currency);
        networkId = safeString(transaction, 2);
        network = self.networkIdToCode(networkId, code);
        timestamp = safeInteger(transaction, 5);
        updated = safeInteger(transaction, 6);
        status = self.parseTransactionStatus(safeString(transaction, 9));
        signedAmount = safeString(transaction, 12);
        amount = stringAbs(signedAmount);
        if functions.ccxtruthy(signedAmount != nothing)
            if functions.ccxtruthy(stringLt(signedAmount, "0"))
                type_var = "withdrawal";
            else
                type_var = "deposit";
            end
        end
        feeCost = safeString(transaction, 13);
        if functions.ccxtruthy(feeCost != nothing)
            feeCost = stringAbs(feeCost);
        end
        addressTo = safeString(transaction, 16);
        txid = safeString(transaction, 20);
        comment = safeString(transaction, 21);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => network,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("status") => status,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => addressTo,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("updated") => updated,
    Symbol("comment") => comment,
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(feeCost),
        Symbol("rate") => nothing
    )
)

end
function fetchTradingFees(self::Bitfinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostAuthRSummary(params));
    result = Dict{Symbol, Any}();
    fiat = safeValue(self.options, "fiat", Dict{Symbol, Any}());
    feeData = safeValue(response, 4, []);
    makerData = safeValue(feeData, 0, []);
    takerData = safeValue(feeData, 1, []);
    makerFee = self.safeNumber(makerData, 0);
    makerFeeFiat = self.safeNumber(makerData, 2);
    makerFeeDeriv = self.safeNumber(makerData, 5);
    takerFee = self.safeNumber(takerData, 0);
    takerFeeFiat = self.safeNumber(takerData, 2);
    takerFeeDeriv = self.safeNumber(takerData, 5);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        if functions.ccxtruthy(ccxt_in(get(market, Symbol("quote"), nothing), fiat))
            fee[Symbol("maker")] = makerFeeFiat;
            fee[Symbol("taker")] = takerFeeFiat;
        elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            fee[Symbol("maker")] = makerFeeDeriv;
            fee[Symbol("taker")] = takerFeeDeriv;
        else
            fee[Symbol("maker")] = makerFee;
            fee[Symbol("taker")] = takerFee;
        end
        result[Symbol(symbol)] = fee;
        i += 1
    end
    return result

end
function fetchDepositsWithdrawals(self::Bitfinex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        currencyMovements = Base.fetch(self.privatePostAuthRMovementsCurrencyHist(extend(request, params)));
        response = toArray(currencyMovements);
    else
        movements = Base.fetch(self.privatePostAuthRMovementsHist(extend(request, params)));
        response = toArray(movements);
    end
    return self.parseTransactions(response, currency, since, limit)

end
function withdraw(self::Bitfinex, code, amount, address, tag=nothing, params=Dict())
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = safeString(params, "network", code);
    params = omit(params, "network");
    currencyNetworks = safeValue(currency, "networks", Dict{Symbol, Any}());
    currencyNetwork = safeValue(currencyNetworks, network);
    networkId = safeString(currencyNetwork, "id");
    if functions.ccxtruthy(networkId == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw() could not find a network for '", code, "'. You can specify it by providing the 'network' value inside params")));
    end
    wallet = safeString(params, "wallet", "exchange");
    params = omit(params, "network", "wallet");
    request = Dict{Symbol, Any}(
        Symbol("method") => networkId,
        Symbol("wallet") => wallet,
        Symbol("amount") => numberToString(amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("payment_id")] = tag;
    end
    withdrawOptions = safeValue(self.options, "withdraw", Dict{Symbol, Any}());
    includeFee = self.safeBool(withdrawOptions, "includeFee", false);
    if functions.ccxtruthy(includeFee)
        request[Symbol("fee_deduct")] = 1;
    end
    response = Base.fetch(self.privatePostAuthWWithdraw(extend(request, params)));
    statusMessage = safeString(response, 0);
    if functions.ccxtruthy(statusMessage == "error")
        feedback = string(self.id, " ", response);
        message = safeString(response, 2, "");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    text = safeString(response, 7);
    if functions.ccxtruthy(text != "success")
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), text, text);
    end
    return self.parseTransaction(response, currency)

end
function fetchPositions(self::Bitfinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.privatePostAuthRPositions(params));
    rawPositions = toArray(response);
    positionsList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawPositions)))
        push!(positionsList, Dict{Symbol, Any}(
    Symbol("result") => get(rawPositions, i + 1, nothing)
));
        i += 1
    end
    return self.parsePositions(positionsList, symbols)

end
function parsePosition(self::Bitfinex, position, market=nothing)
    positionList = self.safeList(position, "result");
    marketId = safeString(positionList, 0);
    amount = safeString(positionList, 2);
    timestamp = safeInteger(positionList, 12);
    meta = safeString(positionList, 19);
    tradePrice = safeString(meta, "trade_price");
    tradeAmount = safeString(meta, "trade_amount");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => positionList,
    Symbol("id") => safeString(positionList, 11),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("notional") => self.parseNumber(amount),
    Symbol("marginMode") => "isolated",
    Symbol("liquidationPrice") => self.safeNumber(positionList, 8),
    Symbol("entryPrice") => self.safeNumber(positionList, 3),
    Symbol("unrealizedPnl") => self.safeNumber(positionList, 6),
    Symbol("percentage") => self.safeNumber(positionList, 7),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => functions.ccxtruthy(stringGt(amount, "0")) ? "long" : "short",
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(positionList, 13),
    Symbol("maintenanceMargin") => self.safeNumber(positionList, 18),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => self.safeNumber(positionList, 17),
    Symbol("initialMargin") => self.parseNumber(stringMul(tradeAmount, tradePrice)),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(positionList, 9),
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function nonce(self::Bitfinex, )
    return milliseconds()

end
function sign(self::Bitfinex, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "v1")
        request = string(api, request);
    else
        request = string(self.version, request);
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", request);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        body = json(query);
        auth = string("/api/", request, nonce, body);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha384);
        headers = Dict{Symbol, Any}(
            Symbol("bfx-nonce") => nonce,
            Symbol("bfx-apikey") => self.apiKey,
            Symbol("bfx-signature") => signature,
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
function handleErrors(self::Bitfinex, statusCode, statusText, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(response)))
            message = safeString2(response, "message", "error");
            feedback = string(self.id, " ", body);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
            throw(ExchangeError(string(self.id, " ", body)));
        end
    elseif functions.ccxtruthy(response == "")
        throw(ExchangeError(string(self.id, " returned empty response")));
    end
    if functions.ccxtruthy(statusCode == 429)
        throw(RateLimitExceeded(string(self.id, " ", body)));
    end
    if functions.ccxtruthy(statusCode == 500)
        errorCode = safeString(response, 1, "");
        errorText = safeString(response, 2, "");
        feedback = string(self.id, " ", errorText);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorText, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorText, feedback);
        throw(ExchangeError(string(self.id, " ", errorText, " (#", errorCode, ")")));
    end
    return response

end
function parseLedgerEntryType(self::Bitfinex, type_var)
    if functions.ccxtruthy(type_var == nothing)
            return nothing
    elseif functions.ccxtruthy(@functions.ccxt_or(findfirst("fee", type_var) !== nothing, findfirst("charged", type_var) !== nothing))
        return "fee"
    else
        if functions.ccxtruthy(findfirst("rebate", type_var) !== nothing)
                return "rebate"
        elseif functions.ccxtruthy(@functions.ccxt_or(findfirst("deposit", type_var) !== nothing, findfirst("withdrawal", type_var) !== nothing))
            return "transaction"
        else
            if functions.ccxtruthy(findfirst("transfer", type_var) !== nothing)
                    return "transfer"
            elseif functions.ccxtruthy(findfirst("payment", type_var) !== nothing)
                return "payout"
            else
                if functions.ccxtruthy(@functions.ccxt_or(findfirst("exchange", type_var) !== nothing, findfirst("position", type_var) !== nothing))
                        return "trade"
                else
                    return type_var
                end

            end

        end

    end

end
function parseLedgerEntry(self::Bitfinex, item, currency=nothing)
    itemList = self.safeList(item, "result", []);
    type_var = nothing;
    id = safeString(itemList, 0);
    currencyId = safeString(itemList, 1);
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(itemList, 3);
    amount = self.safeNumber(itemList, 5);
    after = self.safeNumber(itemList, 6);
    description = safeString(itemList, 8);
    if functions.ccxtruthy(description != nothing)
        parts = split(description, " @ ");
        first_var = safeStringLower(parts, 0);
        type_var = self.parseLedgerEntryType(first_var);
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("direction") => nothing,
    Symbol("account") => nothing,
    Symbol("referenceId") => id,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => after,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function fetchLedger(self::Bitfinex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", code, since, limit, params, 2500))
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostAuthRLedgersCurrencyHist(extend(request, params)));
    else
        response = Base.fetch(self.privatePostAuthRLedgersHist(extend(request, params)));
    end
    ledgerObjects = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        item = get(response, i + 1, nothing);
        push!(ledgerObjects, Dict{Symbol, Any}(
    Symbol("result") => item
));
        i += 1
    end
    return self.parseLedger(ledgerObjects, currency, since, limit)

end
function fetchFundingRates(self::Bitfinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRates() requires a symbols argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketIds = self.marketIds(symbols);
    request = Dict{Symbol, Any}(
        Symbol("keys") => join(marketIds, ",")
    );
    response = Base.fetch(self.publicGetStatusDeriv(extend(request, params)));
    return self.parseFundingRates(response, symbols)

end
function fetchFundingRateHistory(self::Bitfinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, 5000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetStatusDerivSymbolHist(extend(request, params)));
    rawRatesData = toArray(response);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawRatesData)))
        fr = get(rawRatesData, i + 1, nothing);
        rate = self.parseFundingRateHistory(fr, market);
        push!(rates, rate);
        i += 1
    end
    reversedArray = [];
    rawRates = self.filterBySymbolSinceLimit(rates, symbol, since, limit);
    ratesLength = length(rawRates);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, ratesLength))
        index = ratesLength - i - 1;
        valueAtIndex = get(rawRates, index + 1, nothing);
        push!(reversedArray, valueAtIndex);
        i += 1
    end
    return reversedArray

end
function parseFundingRate(self::Bitfinex, contract, market=nothing)
    marketId = safeString(contract, 0);
    timestamp = safeInteger(contract, 1);
    nextFundingTimestamp = safeInteger(contract, 8);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("markPrice") => self.safeNumber(contract, 15),
    Symbol("indexPrice") => self.safeNumber(contract, 3),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, 12),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => self.safeNumber(contract, 9),
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function parseFundingRateHistory(self::Bitfinex, contract, market=nothing)
    timestamp = safeInteger(contract, 0);
    nextFundingTimestamp = safeInteger(contract, 7);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("markPrice") => self.safeNumber(contract, 14),
    Symbol("indexPrice") => self.safeNumber(contract, 2),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, 11),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => self.safeNumber(contract, 8),
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing
)

end
function fetchOpenInterests(self::Bitfinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    marketIds = ["ALL"];
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols);
    end
    request = Dict{Symbol, Any}(
        Symbol("keys") => join(marketIds, ",")
    );
    response = Base.fetch(self.publicGetStatusDeriv(extend(request, params)));
    return self.parseOpenInterests(response, symbols)

end
function fetchOpenInterest(self::Bitfinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("keys") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetStatusDeriv(extend(request, params)));
    oi = self.safeList(response, 0);
    return self.parseOpenInterest(oi, market)

end
function fetchOpenInterestHistory(self::Bitfinex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenInterestHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOpenInterestHistory", symbol, since, limit, "8h", params, 5000))
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
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetStatusDerivSymbolHist(extend(request, params)));
    return self.parseOpenInterestsHistory(response, market, since, limit)

end
function parseOpenInterest(self::Bitfinex, interest, market=nothing)
    interestLength = length(interest);
    openInterestIndex = functions.ccxtruthy((interestLength == 23)) ? 17 : 18;
    timestamp = safeInteger(interest, 1);
    marketId = safeString(interest, 0);
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("openInterestAmount") => self.safeNumber(interest, openInterestIndex),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function fetchLiquidations(self::Bitfinex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchLiquidations", symbol, since, limit, "8h", params, 500))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.publicGetLiquidationsHist(extend(request, params)));
    return self.parseLiquidations(toArray(response), market, since, limit)

end
function parseLiquidation(self::Bitfinex, liquidation, market=nothing)
    entry = get(liquidation, 1, nothing);
    timestamp = safeInteger(entry, 2);
    marketId = safeString(entry, 4);
    contracts = stringAbs(safeString(entry, 5));
    contractSize = safeString(market, "contractSize");
    baseValue = stringMul(contracts, contractSize);
    price = safeString(entry, 11);
    sideFlag = safeInteger(entry, 8);
    side = functions.ccxtruthy((sideFlag == 1)) ? "buy" : "sell";
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("contracts") => self.parseNumber(contracts),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("price") => self.parseNumber(price),
    Symbol("side") => side,
    Symbol("baseValue") => self.parseNumber(baseValue),
    Symbol("quoteValue") => self.parseNumber(stringMul(baseValue, price)),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function setMargin(self::Bitfinex, symbol, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " setMargin() only support swap markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("collateral") => self.parseToNumeric(amount)
    );
    response = Base.fetch(self.privatePostAuthWDerivCollateralSet(extend(request, params)));
    data = safeValue(response, 0);
    return self.parseMarginModification(data, market)

end
function parseMarginModification(self::Bitfinex, data, market=nothing)
    marginStatusRaw = get(data, 1, nothing);
    marginStatus = functions.ccxtruthy((marginStatusRaw == 1)) ? "ok" : "failed";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => nothing,
    Symbol("status") => marginStatus,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function fetchOrder(self::Bitfinex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => [self.parseToNumeric(id)]
    );
    market = nothing;
    if functions.ccxtruthy(symbol == nothing)
        response = Base.fetch(self.privatePostAuthROrders(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostAuthROrdersSymbol(extend(request, params)));
    end
    order = self.safeList(response, 0);
    newOrder = Dict{Symbol, Any}(
        Symbol("result") => order
    );
    return self.parseOrder(newOrder, market)

end
function editOrder(self::Bitfinex, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => self.parseToNumeric(id)
    );
    if functions.ccxtruthy(amount != nothing)
        amountString = self.amountToPrecision(symbol, amount);
        amountString = functions.ccxtruthy((side == "buy")) ? amountString : stringNeg(amountString);
        request[Symbol("amount")] = amountString;
    end
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    trailingAmount = safeString(params, "trailingAmount");
    timeInForce = safeString(params, "timeInForce");
    postOnlyParam = self.safeBool(params, "postOnly", false);
    reduceOnly = self.safeBool(params, "reduceOnly", false);
    clientOrderId = safeInteger2(params, "cid", "clientOrderId");
    if functions.ccxtruthy(trailingAmount != nothing)
        request[Symbol("price_trailing")] = trailingAmount;
    elseif functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, triggerPrice);
        if functions.ccxtruthy(type_var == "limit")
            request[Symbol("price_aux_limit")] = self.priceToPrecision(symbol, price);
        end
    end
    postOnly = (@functions.ccxt_or(postOnlyParam, (timeInForce == "PO")));
    if functions.ccxtruthy(@functions.ccxt_and((type_var != "market"), (triggerPrice == nothing)))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    flags = 0;
    if functions.ccxtruthy(postOnly)
        flags = self.sum(flags, 4096);
    end
    if functions.ccxtruthy(reduceOnly)
        flags = self.sum(flags, 1024);
    end
    if functions.ccxtruthy(flags != 0)
        request[Symbol("flags")] = flags;
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cid")] = clientOrderId;
    end
    leverage = safeInteger2(params, "leverage", "lev");
    if functions.ccxtruthy(leverage != nothing)
        request[Symbol("lev")] = leverage;
    end
    params = omit(params, ["triggerPrice", "stopPrice", "timeInForce", "postOnly", "reduceOnly", "trailingAmount", "clientOrderId", "leverage"]);
    response = Base.fetch(self.privatePostAuthWOrderUpdate(extend(request, params)));
    status = safeString(response, 6);
    if functions.ccxtruthy(status != "SUCCESS")
        errorCode = safeString(response, 5);
        errorText = safeString(response, 7);
        throw(ExchangeError(string(self.id, " ", status, ": ", errorText, " (#", errorCode, ")")));
    end
    order = self.safeList(response, 4, []);
    newOrder = Dict{Symbol, Any}(
        Symbol("result") => order
    );
    return self.parseOrder(newOrder, market)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitfinex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetConfConfig(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/{config}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubActionObject(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:{action}:{object}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubActionObjectDetail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:{action}:{object}:{detail}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapObject(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:{object}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapObjectDetail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:{object}:{detail}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyDetail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:{detail}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencySym(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:sym", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyLabel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:label", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyUnit(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:unit", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyUndl(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:undl", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyPool(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:pool", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyExplorer(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:explorer", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapCurrencyTxFee(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:currency:tx:fee", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubMapTxMethod(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:map:tx:method", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListObject(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:{object}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListObjectDetail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:{object}:{detail}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListCurrency(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:currency", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListPairExchange(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:pair:exchange", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListPairMargin(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:pair:margin", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListPairFutures(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:pair:futures", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubListCompetitions(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:list:competitions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubInfoObject(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:info:{object}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubInfoObjectDetail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:info:{object}:{detail}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubInfoPair(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:info:pair", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubInfoPairFutures(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:info:pair:futures", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubInfoTxStatus(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:info:tx:status", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetConfPubFees(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "conf/pub:fees", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPlatformStatus(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "platform/status", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerSymbol(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "ticker/{symbol}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickersHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "tickers/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradesSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "trades/{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolPrecision(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/{precision}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolP0(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/P0", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolP1(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/P1", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolP2(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/P2", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolP3(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/P3", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetBookSymbolR0(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "book/{symbol}/R0", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolSideSection(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:{side}/{section}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolSideLast(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:{side}/last", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolSideHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:{side}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolSection(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}/{section}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolLast(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}/last", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolLongLast(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:long/last", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolLongHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:long/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolShortLast(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:short/last", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStats1KeySizeSymbolShortHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "stats1/{key}:{size}:{symbol}:short/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesTradeTimeframeSymbolPeriodSection(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "candles/trade:{timeframe}:{symbol}:{period}/{section}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesTradeTimeframeSymbolSection(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "candles/trade:{timeframe}:{symbol}/{section}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesTradeTimeframeSymbolLast(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "candles/trade:{timeframe}:{symbol}/last", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCandlesTradeTimeframeSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "candles/trade:{timeframe}:{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStatusType(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "status/{type}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStatusDeriv(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "status/deriv", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetStatusDerivSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "status/deriv/{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetLiquidationsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "liquidations/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRankingsKeyTimeframeSymbolSection(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "rankings/{key}:{timeframe}:{symbol}/{section}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRankingsKeyTimeframeSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "rankings/{key}:{timeframe}:{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPulseHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "pulse/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPulseProfileNickname(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "pulse/profile/{nickname}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFundingStatsSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "funding/stats/{symbol}/hist", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetExtVasps(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "ext/vasps", "public", "GET", params, nothing, nothing, Dict())
end

function publicPostCalcTradeAvg(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "calc/trade/avg", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostCalcFx(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "calc/fx", "public", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRWallets(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/wallets", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRWalletsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/wallets/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthROrders(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthROrdersSymbol(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/orders/{symbol}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWOrderSubmit(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/order/submit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWOrderUpdate(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/order/update", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWOrderCancel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/order/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWOrderMulti(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/order/multi", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWOrderCancelMulti(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/order/cancel/multi", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthROrdersSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/orders/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthROrdersHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/orders/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthROrderSymbolIdTrades(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/order/{symbol}:{id}/trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRTradesSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/trades/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRTradesHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/trades/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRLedgersCurrencyHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/ledgers/{currency}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRLedgersHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/ledgers/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRInfoMarginKey(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/info/margin/{key}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRInfoMarginBase(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/info/margin/base", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRInfoMarginSymAll(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/info/margin/sym_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPositions(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/positions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWPositionClaim(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/position/claim", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWPositionIncrease(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/position/increase:", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPositionIncreaseInfo(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/position/increase/info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPositionsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/positions/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPositionsAudit(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/positions/audit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPositionsSnap(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/positions/snap", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWDerivCollateralSet(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/deriv/collateral/set", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWDerivCollateralLimits(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/deriv/collateral/limits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingOffers(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/offers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingOffersSymbol(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/offers/{symbol}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingOfferSubmit(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/offer/submit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingOfferCancel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/offer/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingOfferCancelAll(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/offer/cancel/all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingClose(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/close", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingAuto(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/auto", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWFundingKeep(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/funding/keep", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingOffersSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/offers/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingOffersHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/offers/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingLoans(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/loans", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingLoansHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/loans/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingLoansSymbol(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/loans/{symbol}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingLoansSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/loans/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingCredits(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/credits", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingCreditsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/credits/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingCreditsSymbol(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/credits/{symbol}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingCreditsSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/credits/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingTradesSymbolHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/trades/{symbol}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRFundingTradesHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/funding/trades/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRInfoFundingKey(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/info/funding/{key}", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRInfoUser(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/info/user", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRSummary(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/summary", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRLoginsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/logins/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPermissions(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/permissions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWToken(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/token", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRAuditHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/audit/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWTransfer(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWDepositAddress(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/deposit/address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWDepositInvoice(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/deposit/invoice", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWWithdraw(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRMovementsCurrencyHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/movements/{currency}/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRMovementsHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/movements/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRAlerts(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/alerts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWAlertSet(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/alert/set", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWAlertPriceSymbolPriceDel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/alert/price:{symbol}:{price}/del", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWAlertTypeSymbolPriceDel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/alert/{type}:{symbol}:{price}/del", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthCalcOrderAvail(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/calc/order/avail", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWSettingsSet(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/settings/set", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRSettings(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/settings", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWSettingsDel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/settings/del", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthRPulseHist(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/r/pulse/hist", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWPulseAdd(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/pulse/add", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAuthWPulseDel(self::Bitfinex, params=Dict(), context=Dict())
    return request(self, "auth/w/pulse/del", "private", "POST", params, nothing, nothing, Dict())
end

function Bitfinex(; kwargs...)
    inst = Bitfinex(Exchange(), describe, isFiat, getCurrencyName, amountToPrecision, priceToPrecision, fetchStatus, fetchMarkets, fetchCurrencies, parseCurrenciesCustom, parseCurrencyCustom, fetchBalance, transfer, parseTransfer, parseTransferStatus, convertDerivativesId, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchTrades, fetchOHLCV, parseOHLCV, parseOrderStatus, parseOrderFlags, parseTimeInForce, parseOrder, createOrderRequest, createOrder, createOrders, cancelAllOrders, cancelOrder, cancelOrders, fetchOpenOrder, fetchClosedOrder, fetchOpenOrders, fetchClosedOrders, fetchOrderTrades, fetchMyTrades, createDepositAddress, fetchDepositAddress, parseTransactionStatus, parseTransaction, fetchTradingFees, fetchDepositsWithdrawals, withdraw, fetchPositions, parsePosition, nonce, sign, handleErrors, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchFundingRates, fetchFundingRateHistory, parseFundingRate, parseFundingRateHistory, fetchOpenInterests, fetchOpenInterest, fetchOpenInterestHistory, parseOpenInterest, fetchLiquidations, parseLiquidation, setMargin, parseMarginModification, fetchOrder, editOrder, publicGetConfConfig, publicGetConfPubActionObject, publicGetConfPubActionObjectDetail, publicGetConfPubMapObject, publicGetConfPubMapObjectDetail, publicGetConfPubMapCurrencyDetail, publicGetConfPubMapCurrencySym, publicGetConfPubMapCurrencyLabel, publicGetConfPubMapCurrencyUnit, publicGetConfPubMapCurrencyUndl, publicGetConfPubMapCurrencyPool, publicGetConfPubMapCurrencyExplorer, publicGetConfPubMapCurrencyTxFee, publicGetConfPubMapTxMethod, publicGetConfPubListObject, publicGetConfPubListObjectDetail, publicGetConfPubListCurrency, publicGetConfPubListPairExchange, publicGetConfPubListPairMargin, publicGetConfPubListPairFutures, publicGetConfPubListCompetitions, publicGetConfPubInfoObject, publicGetConfPubInfoObjectDetail, publicGetConfPubInfoPair, publicGetConfPubInfoPairFutures, publicGetConfPubInfoTxStatus, publicGetConfPubFees, publicGetPlatformStatus, publicGetTickers, publicGetTickerSymbol, publicGetTickersHist, publicGetTradesSymbolHist, publicGetBookSymbolPrecision, publicGetBookSymbolP0, publicGetBookSymbolP1, publicGetBookSymbolP2, publicGetBookSymbolP3, publicGetBookSymbolR0, publicGetStats1KeySizeSymbolSideSection, publicGetStats1KeySizeSymbolSideLast, publicGetStats1KeySizeSymbolSideHist, publicGetStats1KeySizeSymbolSection, publicGetStats1KeySizeSymbolLast, publicGetStats1KeySizeSymbolHist, publicGetStats1KeySizeSymbolLongLast, publicGetStats1KeySizeSymbolLongHist, publicGetStats1KeySizeSymbolShortLast, publicGetStats1KeySizeSymbolShortHist, publicGetCandlesTradeTimeframeSymbolPeriodSection, publicGetCandlesTradeTimeframeSymbolSection, publicGetCandlesTradeTimeframeSymbolLast, publicGetCandlesTradeTimeframeSymbolHist, publicGetStatusType, publicGetStatusDeriv, publicGetStatusDerivSymbolHist, publicGetLiquidationsHist, publicGetRankingsKeyTimeframeSymbolSection, publicGetRankingsKeyTimeframeSymbolHist, publicGetPulseHist, publicGetPulseProfileNickname, publicGetFundingStatsSymbolHist, publicGetExtVasps, publicPostCalcTradeAvg, publicPostCalcFx, privatePostAuthRWallets, privatePostAuthRWalletsHist, privatePostAuthROrders, privatePostAuthROrdersSymbol, privatePostAuthWOrderSubmit, privatePostAuthWOrderUpdate, privatePostAuthWOrderCancel, privatePostAuthWOrderMulti, privatePostAuthWOrderCancelMulti, privatePostAuthROrdersSymbolHist, privatePostAuthROrdersHist, privatePostAuthROrderSymbolIdTrades, privatePostAuthRTradesSymbolHist, privatePostAuthRTradesHist, privatePostAuthRLedgersCurrencyHist, privatePostAuthRLedgersHist, privatePostAuthRInfoMarginKey, privatePostAuthRInfoMarginBase, privatePostAuthRInfoMarginSymAll, privatePostAuthRPositions, privatePostAuthWPositionClaim, privatePostAuthWPositionIncrease, privatePostAuthRPositionIncreaseInfo, privatePostAuthRPositionsHist, privatePostAuthRPositionsAudit, privatePostAuthRPositionsSnap, privatePostAuthWDerivCollateralSet, privatePostAuthWDerivCollateralLimits, privatePostAuthRFundingOffers, privatePostAuthRFundingOffersSymbol, privatePostAuthWFundingOfferSubmit, privatePostAuthWFundingOfferCancel, privatePostAuthWFundingOfferCancelAll, privatePostAuthWFundingClose, privatePostAuthWFundingAuto, privatePostAuthWFundingKeep, privatePostAuthRFundingOffersSymbolHist, privatePostAuthRFundingOffersHist, privatePostAuthRFundingLoans, privatePostAuthRFundingLoansHist, privatePostAuthRFundingLoansSymbol, privatePostAuthRFundingLoansSymbolHist, privatePostAuthRFundingCredits, privatePostAuthRFundingCreditsHist, privatePostAuthRFundingCreditsSymbol, privatePostAuthRFundingCreditsSymbolHist, privatePostAuthRFundingTradesSymbolHist, privatePostAuthRFundingTradesHist, privatePostAuthRInfoFundingKey, privatePostAuthRInfoUser, privatePostAuthRSummary, privatePostAuthRLoginsHist, privatePostAuthRPermissions, privatePostAuthWToken, privatePostAuthRAuditHist, privatePostAuthWTransfer, privatePostAuthWDepositAddress, privatePostAuthWDepositInvoice, privatePostAuthWWithdraw, privatePostAuthRMovementsCurrencyHist, privatePostAuthRMovementsHist, privatePostAuthRAlerts, privatePostAuthWAlertSet, privatePostAuthWAlertPriceSymbolPriceDel, privatePostAuthWAlertTypeSymbolPriceDel, privatePostAuthCalcOrderAvail, privatePostAuthWSettingsSet, privatePostAuthRSettings, privatePostAuthWSettingsDel, privatePostAuthRPulseHist, privatePostAuthWPulseAdd, privatePostAuthWPulseDel)
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
