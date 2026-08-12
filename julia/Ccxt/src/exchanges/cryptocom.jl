@kwdef mutable struct Cryptocom <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    fetchOrders::Function = fetchOrders
    fetchTrades::Function = fetchTrades
    fetchOHLCV::Function = fetchOHLCV
    fetchOrderBook::Function = fetchOrderBook
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrder::Function = fetchOrder
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    createAdvancedOrderRequest::Function = createAdvancedOrderRequest
    editOrder::Function = editOrder
    editOrderRequest::Function = editOrderRequest
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelOrdersForSymbols::Function = cancelOrdersForSymbols
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    parseAddress::Function = parseAddress
    withdraw::Function = withdraw
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTicker::Function = parseTicker
    parseTrade::Function = parseTrade
    parseOHLCV::Function = parseOHLCV
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    parseDepositStatus::Function = parseDepositStatus
    parseWithdrawalStatus::Function = parseWithdrawalStatus
    parseTransaction::Function = parseTransaction
    customHandleMarginModeAndParams::Function = customHandleMarginModeAndParams
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchSettlementHistory::Function = fetchSettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    nonce::Function = nonce
    paramsToString::Function = paramsToString
    closePosition::Function = closePosition
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFees::Function = parseTradingFees
    parseTradingFee::Function = parseTradingFee
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    basePublicGetV1PublicGetAnnouncements::Function = basePublicGetV1PublicGetAnnouncements
    v1PublicGetPublicAuth::Function = v1PublicGetPublicAuth
    v1PublicGetPublicGetInstruments::Function = v1PublicGetPublicGetInstruments
    v1PublicGetPublicGetBook::Function = v1PublicGetPublicGetBook
    v1PublicGetPublicGetCandlestick::Function = v1PublicGetPublicGetCandlestick
    v1PublicGetPublicGetTrades::Function = v1PublicGetPublicGetTrades
    v1PublicGetPublicGetTickers::Function = v1PublicGetPublicGetTickers
    v1PublicGetPublicGetValuations::Function = v1PublicGetPublicGetValuations
    v1PublicGetPublicGetExpiredSettlementPrice::Function = v1PublicGetPublicGetExpiredSettlementPrice
    v1PublicGetPublicGetInsurance::Function = v1PublicGetPublicGetInsurance
    v1PublicGetPublicGetAnnouncements::Function = v1PublicGetPublicGetAnnouncements
    v1PublicGetPublicGetRiskParameters::Function = v1PublicGetPublicGetRiskParameters
    v1PublicPostPublicStakingGetConversionRate::Function = v1PublicPostPublicStakingGetConversionRate
    v1PrivatePostPrivateSetCancelOnDisconnect::Function = v1PrivatePostPrivateSetCancelOnDisconnect
    v1PrivatePostPrivateGetCancelOnDisconnect::Function = v1PrivatePostPrivateGetCancelOnDisconnect
    v1PrivatePostPrivateUserBalance::Function = v1PrivatePostPrivateUserBalance
    v1PrivatePostPrivateUserBalanceHistory::Function = v1PrivatePostPrivateUserBalanceHistory
    v1PrivatePostPrivateGetPositions::Function = v1PrivatePostPrivateGetPositions
    v1PrivatePostPrivateCreateOrder::Function = v1PrivatePostPrivateCreateOrder
    v1PrivatePostPrivateAmendOrder::Function = v1PrivatePostPrivateAmendOrder
    v1PrivatePostPrivateCreateOrderList::Function = v1PrivatePostPrivateCreateOrderList
    v1PrivatePostPrivateCancelOrder::Function = v1PrivatePostPrivateCancelOrder
    v1PrivatePostPrivateCancelOrderList::Function = v1PrivatePostPrivateCancelOrderList
    v1PrivatePostPrivateCancelAllOrders::Function = v1PrivatePostPrivateCancelAllOrders
    v1PrivatePostPrivateClosePosition::Function = v1PrivatePostPrivateClosePosition
    v1PrivatePostPrivateGetOrderHistory::Function = v1PrivatePostPrivateGetOrderHistory
    v1PrivatePostPrivateGetOpenOrders::Function = v1PrivatePostPrivateGetOpenOrders
    v1PrivatePostPrivateGetOrderDetail::Function = v1PrivatePostPrivateGetOrderDetail
    v1PrivatePostPrivateGetTrades::Function = v1PrivatePostPrivateGetTrades
    v1PrivatePostPrivateChangeAccountLeverage::Function = v1PrivatePostPrivateChangeAccountLeverage
    v1PrivatePostPrivateGetTransactions::Function = v1PrivatePostPrivateGetTransactions
    v1PrivatePostPrivateCreateSubaccountTransfer::Function = v1PrivatePostPrivateCreateSubaccountTransfer
    v1PrivatePostPrivateGetSubaccountBalances::Function = v1PrivatePostPrivateGetSubaccountBalances
    v1PrivatePostPrivateGetOrderList::Function = v1PrivatePostPrivateGetOrderList
    v1PrivatePostPrivateCreateWithdrawal::Function = v1PrivatePostPrivateCreateWithdrawal
    v1PrivatePostPrivateGetCurrencyNetworks::Function = v1PrivatePostPrivateGetCurrencyNetworks
    v1PrivatePostPrivateGetDepositAddress::Function = v1PrivatePostPrivateGetDepositAddress
    v1PrivatePostPrivateGetAccounts::Function = v1PrivatePostPrivateGetAccounts
    v1PrivatePostPrivateGetWithdrawalHistory::Function = v1PrivatePostPrivateGetWithdrawalHistory
    v1PrivatePostPrivateGetDepositHistory::Function = v1PrivatePostPrivateGetDepositHistory
    v1PrivatePostPrivateGetFeeRate::Function = v1PrivatePostPrivateGetFeeRate
    v1PrivatePostPrivateGetInstrumentFeeRate::Function = v1PrivatePostPrivateGetInstrumentFeeRate
    v1PrivatePostPrivateFiatFiatDepositInfo::Function = v1PrivatePostPrivateFiatFiatDepositInfo
    v1PrivatePostPrivateFiatFiatDepositHistory::Function = v1PrivatePostPrivateFiatFiatDepositHistory
    v1PrivatePostPrivateFiatFiatWithdrawHistory::Function = v1PrivatePostPrivateFiatFiatWithdrawHistory
    v1PrivatePostPrivateFiatFiatCreateWithdraw::Function = v1PrivatePostPrivateFiatFiatCreateWithdraw
    v1PrivatePostPrivateFiatFiatTransactionQuota::Function = v1PrivatePostPrivateFiatFiatTransactionQuota
    v1PrivatePostPrivateFiatFiatTransactionLimit::Function = v1PrivatePostPrivateFiatFiatTransactionLimit
    v1PrivatePostPrivateFiatFiatGetBankAccounts::Function = v1PrivatePostPrivateFiatFiatGetBankAccounts
    v1PrivatePostPrivateStakingStake::Function = v1PrivatePostPrivateStakingStake
    v1PrivatePostPrivateStakingUnstake::Function = v1PrivatePostPrivateStakingUnstake
    v1PrivatePostPrivateStakingGetStakingPosition::Function = v1PrivatePostPrivateStakingGetStakingPosition
    v1PrivatePostPrivateStakingGetStakingInstruments::Function = v1PrivatePostPrivateStakingGetStakingInstruments
    v1PrivatePostPrivateStakingGetOpenStake::Function = v1PrivatePostPrivateStakingGetOpenStake
    v1PrivatePostPrivateStakingGetStakeHistory::Function = v1PrivatePostPrivateStakingGetStakeHistory
    v1PrivatePostPrivateStakingGetRewardHistory::Function = v1PrivatePostPrivateStakingGetRewardHistory
    v1PrivatePostPrivateStakingConvert::Function = v1PrivatePostPrivateStakingConvert
    v1PrivatePostPrivateStakingGetOpenConvert::Function = v1PrivatePostPrivateStakingGetOpenConvert
    v1PrivatePostPrivateStakingGetConvertHistory::Function = v1PrivatePostPrivateStakingGetConvertHistory
    v1PrivatePostPrivateCreateIsolatedMarginTransfer::Function = v1PrivatePostPrivateCreateIsolatedMarginTransfer
    v1PrivatePostPrivateChangeIsolatedMarginLeverage::Function = v1PrivatePostPrivateChangeIsolatedMarginLeverage
    v2PublicGetPublicAuth::Function = v2PublicGetPublicAuth
    v2PublicGetPublicGetInstruments::Function = v2PublicGetPublicGetInstruments
    v2PublicGetPublicGetBook::Function = v2PublicGetPublicGetBook
    v2PublicGetPublicGetCandlestick::Function = v2PublicGetPublicGetCandlestick
    v2PublicGetPublicGetTicker::Function = v2PublicGetPublicGetTicker
    v2PublicGetPublicGetTrades::Function = v2PublicGetPublicGetTrades
    v2PublicGetPublicMarginGetTransferCurrencies::Function = v2PublicGetPublicMarginGetTransferCurrencies
    v2PublicGetPublicMarginGetLoadCurrenices::Function = v2PublicGetPublicMarginGetLoadCurrenices
    v2PublicGetPublicRespondHeartbeat::Function = v2PublicGetPublicRespondHeartbeat
    v2PrivatePostPrivateSetCancelOnDisconnect::Function = v2PrivatePostPrivateSetCancelOnDisconnect
    v2PrivatePostPrivateGetCancelOnDisconnect::Function = v2PrivatePostPrivateGetCancelOnDisconnect
    v2PrivatePostPrivateCreateWithdrawal::Function = v2PrivatePostPrivateCreateWithdrawal
    v2PrivatePostPrivateGetWithdrawalHistory::Function = v2PrivatePostPrivateGetWithdrawalHistory
    v2PrivatePostPrivateGetCurrencyNetworks::Function = v2PrivatePostPrivateGetCurrencyNetworks
    v2PrivatePostPrivateGetDepositHistory::Function = v2PrivatePostPrivateGetDepositHistory
    v2PrivatePostPrivateGetDepositAddress::Function = v2PrivatePostPrivateGetDepositAddress
    v2PrivatePostPrivateExportCreateExportRequest::Function = v2PrivatePostPrivateExportCreateExportRequest
    v2PrivatePostPrivateExportGetExportRequests::Function = v2PrivatePostPrivateExportGetExportRequests
    v2PrivatePostPrivateExportDownloadExportOutput::Function = v2PrivatePostPrivateExportDownloadExportOutput
    v2PrivatePostPrivateGetAccountSummary::Function = v2PrivatePostPrivateGetAccountSummary
    v2PrivatePostPrivateCreateOrder::Function = v2PrivatePostPrivateCreateOrder
    v2PrivatePostPrivateCancelOrder::Function = v2PrivatePostPrivateCancelOrder
    v2PrivatePostPrivateCancelAllOrders::Function = v2PrivatePostPrivateCancelAllOrders
    v2PrivatePostPrivateCreateOrderList::Function = v2PrivatePostPrivateCreateOrderList
    v2PrivatePostPrivateGetOrderHistory::Function = v2PrivatePostPrivateGetOrderHistory
    v2PrivatePostPrivateGetOpenOrders::Function = v2PrivatePostPrivateGetOpenOrders
    v2PrivatePostPrivateGetOrderDetail::Function = v2PrivatePostPrivateGetOrderDetail
    v2PrivatePostPrivateGetTrades::Function = v2PrivatePostPrivateGetTrades
    v2PrivatePostPrivateGetAccounts::Function = v2PrivatePostPrivateGetAccounts
    v2PrivatePostPrivateGetSubaccountBalances::Function = v2PrivatePostPrivateGetSubaccountBalances
    v2PrivatePostPrivateCreateSubaccountTransfer::Function = v2PrivatePostPrivateCreateSubaccountTransfer
    v2PrivatePostPrivateOtcGetOtcUser::Function = v2PrivatePostPrivateOtcGetOtcUser
    v2PrivatePostPrivateOtcGetInstruments::Function = v2PrivatePostPrivateOtcGetInstruments
    v2PrivatePostPrivateOtcRequestQuote::Function = v2PrivatePostPrivateOtcRequestQuote
    v2PrivatePostPrivateOtcAcceptQuote::Function = v2PrivatePostPrivateOtcAcceptQuote
    v2PrivatePostPrivateOtcGetQuoteHistory::Function = v2PrivatePostPrivateOtcGetQuoteHistory
    v2PrivatePostPrivateOtcGetTradeHistory::Function = v2PrivatePostPrivateOtcGetTradeHistory
    v2PrivatePostPrivateOtcCreateOrder::Function = v2PrivatePostPrivateOtcCreateOrder
    derivativesPublicGetPublicAuth::Function = derivativesPublicGetPublicAuth
    derivativesPublicGetPublicGetInstruments::Function = derivativesPublicGetPublicGetInstruments
    derivativesPublicGetPublicGetBook::Function = derivativesPublicGetPublicGetBook
    derivativesPublicGetPublicGetCandlestick::Function = derivativesPublicGetPublicGetCandlestick
    derivativesPublicGetPublicGetTrades::Function = derivativesPublicGetPublicGetTrades
    derivativesPublicGetPublicGetTickers::Function = derivativesPublicGetPublicGetTickers
    derivativesPublicGetPublicGetValuations::Function = derivativesPublicGetPublicGetValuations
    derivativesPublicGetPublicGetExpiredSettlementPrice::Function = derivativesPublicGetPublicGetExpiredSettlementPrice
    derivativesPublicGetPublicGetInsurance::Function = derivativesPublicGetPublicGetInsurance
    derivativesPrivatePostPrivateSetCancelOnDisconnect::Function = derivativesPrivatePostPrivateSetCancelOnDisconnect
    derivativesPrivatePostPrivateGetCancelOnDisconnect::Function = derivativesPrivatePostPrivateGetCancelOnDisconnect
    derivativesPrivatePostPrivateUserBalance::Function = derivativesPrivatePostPrivateUserBalance
    derivativesPrivatePostPrivateUserBalanceHistory::Function = derivativesPrivatePostPrivateUserBalanceHistory
    derivativesPrivatePostPrivateGetPositions::Function = derivativesPrivatePostPrivateGetPositions
    derivativesPrivatePostPrivateCreateOrder::Function = derivativesPrivatePostPrivateCreateOrder
    derivativesPrivatePostPrivateCreateOrderList::Function = derivativesPrivatePostPrivateCreateOrderList
    derivativesPrivatePostPrivateCancelOrder::Function = derivativesPrivatePostPrivateCancelOrder
    derivativesPrivatePostPrivateCancelOrderList::Function = derivativesPrivatePostPrivateCancelOrderList
    derivativesPrivatePostPrivateCancelAllOrders::Function = derivativesPrivatePostPrivateCancelAllOrders
    derivativesPrivatePostPrivateClosePosition::Function = derivativesPrivatePostPrivateClosePosition
    derivativesPrivatePostPrivateConvertCollateral::Function = derivativesPrivatePostPrivateConvertCollateral
    derivativesPrivatePostPrivateGetOrderHistory::Function = derivativesPrivatePostPrivateGetOrderHistory
    derivativesPrivatePostPrivateGetOpenOrders::Function = derivativesPrivatePostPrivateGetOpenOrders
    derivativesPrivatePostPrivateGetOrderDetail::Function = derivativesPrivatePostPrivateGetOrderDetail
    derivativesPrivatePostPrivateGetTrades::Function = derivativesPrivatePostPrivateGetTrades
    derivativesPrivatePostPrivateChangeAccountLeverage::Function = derivativesPrivatePostPrivateChangeAccountLeverage
    derivativesPrivatePostPrivateGetTransactions::Function = derivativesPrivatePostPrivateGetTransactions
    derivativesPrivatePostPrivateCreateSubaccountTransfer::Function = derivativesPrivatePostPrivateCreateSubaccountTransfer
    derivativesPrivatePostPrivateGetSubaccountBalances::Function = derivativesPrivatePostPrivateGetSubaccountBalances
    derivativesPrivatePostPrivateGetOrderList::Function = derivativesPrivatePostPrivateGetOrderList

end
function describe(self::Cryptocom, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "cryptocom",
    Symbol("name") => "Crypto.com",
    Symbol("countries") => ["MT"],
    Symbol("version") => "v2",
    Symbol("rateLimit") => 10,
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1D",
        Symbol("1w") => "7D",
        Symbol("2w") => "14D",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("v1") => "https://uat-api.3ona.co/exchange/v1",
            Symbol("v2") => "https://uat-api.3ona.co/v2",
            Symbol("derivatives") => "https://uat-api.3ona.co/v2"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("base") => "https://api.crypto.com",
            Symbol("v1") => "https://api.crypto.com/exchange/v1",
            Symbol("v2") => "https://api.crypto.com/v2",
            Symbol("derivatives") => "https://deriv-api.crypto.com/v1"
        ),
        Symbol("www") => "https://crypto.com/",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://crypto.com/exch/kdacthrnxt",
            Symbol("discount") => 0.75
        ),
        Symbol("doc") => ["https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html", "https://exchange-docs.crypto.com/spot/index.html", "https://exchange-docs.crypto.com/derivatives/index.html"],
        Symbol("fees") => "https://crypto.com/exchange/document/fees-limits"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("base") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v1/public/get-announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("public/auth") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-candlestick") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-valuations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-expired-settlement-price") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-risk-parameters") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("public/staking/get-conversion-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("private/set-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/user-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/user-balance-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/amend-order") => Dict{Symbol, Any}(
    Symbol("cost") => 4 / 3
),
                    Symbol("private/create-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/cancel-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/cancel-all-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/get-open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                    Symbol("private/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/change-account-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-subaccount-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-subaccount-balances") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-currency-networks") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-withdrawal-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/get-instrument-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/fiat/fiat-deposit-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-withdraw-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-create-withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-transaction-quota") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-transaction-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/fiat/fiat-get-bank-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/staking/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/unstake") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-staking-position") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-staking-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-open-stake") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-stake-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-reward-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/convert") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-open-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/staking/get-convert-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("private/create-isolated-margin-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/change-isolated-margin-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
)
                )
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("public/auth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-candlestick") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/margin/get-transfer-currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/margin/get-load-currenices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/respond-heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("private/set-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-withdrawal-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-currency-networks") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/export/create-export-request") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/export/get-export-requests") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/export/download-export-output") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-account-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/cancel-all-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/create-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                    Symbol("private/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/get-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-subaccount-balances") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-subaccount-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/otc/get-otc-user") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/otc/get-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/otc/request-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/otc/accept-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/otc/get-quote-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/otc/get-trade-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/otc/create-order") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
)
                )
            )
        ),
        Symbol("derivatives") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("public/auth") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-candlestick") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-valuations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/get-expired-settlement-price") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("public/get-insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("private/set-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-cancel-on-disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/user-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/user-balance-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/create-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/cancel-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/cancel-all-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                    Symbol("private/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/convert-collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/get-open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                    Symbol("private/get-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("private/change-account-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/create-subaccount-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-subaccount-balances") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                    Symbol("private/get-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("0.0025"),
            Symbol("taker") => self.parseNumber("0.005"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0025")], [self.parseNumber("10000"), self.parseNumber("0.002")], [self.parseNumber("50000"), self.parseNumber("0.0015")], [self.parseNumber("250000"), self.parseNumber("0.001")], [self.parseNumber("500000"), self.parseNumber("0.0008")], [self.parseNumber("2500000"), self.parseNumber("0.00065")], [self.parseNumber("10000000"), self.parseNumber("0")], [self.parseNumber("25000000"), self.parseNumber("0")], [self.parseNumber("100000000"), self.parseNumber("0")], [self.parseNumber("250000000"), self.parseNumber("0")], [self.parseNumber("500000000"), self.parseNumber("0")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.005")], [self.parseNumber("10000"), self.parseNumber("0.004")], [self.parseNumber("50000"), self.parseNumber("0.0025")], [self.parseNumber("250000"), self.parseNumber("0.002")], [self.parseNumber("500000"), self.parseNumber("0.0018")], [self.parseNumber("2500000"), self.parseNumber("0.001")], [self.parseNumber("10000000"), self.parseNumber("0.0005")], [self.parseNumber("25000000"), self.parseNumber("0.0004")], [self.parseNumber("100000000"), self.parseNumber("0.00035")], [self.parseNumber("250000000"), self.parseNumber("0.00031")], [self.parseNumber("500000000"), self.parseNumber("0.00025")]]
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("funding") => "SPOT",
            Symbol("spot") => "SPOT",
            Symbol("margin") => "MARGIN",
            Symbol("derivatives") => "DERIVATIVES",
            Symbol("swap") => "DERIVATIVES",
            Symbol("future") => "DERIVATIVES"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BEP20") => "BSC",
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRON",
            Symbol("ARBITRUM") => "ARB"
        ),
        Symbol("broker") => "CCXT"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
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
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => false,
                Symbol("iceberg") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 1,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 1,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 1,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            )
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("USD_STABLE_COIN") => "USDC"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("213") => InvalidOrder,
            Symbol("219") => InvalidOrder,
            Symbol("306") => InsufficientFunds,
            Symbol("314") => InvalidOrder,
            Symbol("315") => InvalidOrder,
            Symbol("325") => InvalidOrder,
            Symbol("415") => InvalidOrder,
            Symbol("10001") => ExchangeError,
            Symbol("10002") => PermissionDenied,
            Symbol("10003") => PermissionDenied,
            Symbol("10004") => BadRequest,
            Symbol("10005") => PermissionDenied,
            Symbol("10006") => DDoSProtection,
            Symbol("10007") => InvalidNonce,
            Symbol("10008") => BadRequest,
            Symbol("10009") => BadRequest,
            Symbol("20001") => BadRequest,
            Symbol("20002") => InsufficientFunds,
            Symbol("20005") => AccountNotEnabled,
            Symbol("30003") => BadSymbol,
            Symbol("30004") => BadRequest,
            Symbol("30005") => BadRequest,
            Symbol("30006") => InvalidOrder,
            Symbol("30007") => InvalidOrder,
            Symbol("30008") => InvalidOrder,
            Symbol("30009") => InvalidOrder,
            Symbol("30010") => BadRequest,
            Symbol("30013") => InvalidOrder,
            Symbol("30014") => InvalidOrder,
            Symbol("30016") => InvalidOrder,
            Symbol("30017") => InvalidOrder,
            Symbol("30023") => InvalidOrder,
            Symbol("30024") => InvalidOrder,
            Symbol("30025") => InvalidOrder,
            Symbol("40001") => BadRequest,
            Symbol("40002") => BadRequest,
            Symbol("40003") => BadRequest,
            Symbol("40004") => BadRequest,
            Symbol("40005") => BadRequest,
            Symbol("40006") => BadRequest,
            Symbol("40007") => BadRequest,
            Symbol("40101") => AuthenticationError,
            Symbol("40102") => InvalidNonce,
            Symbol("40103") => AuthenticationError,
            Symbol("40104") => AuthenticationError,
            Symbol("40107") => BadRequest,
            Symbol("40401") => OrderNotFound,
            Symbol("40801") => RequestTimeout,
            Symbol("42901") => RateLimitExceeded,
            Symbol("43005") => InvalidOrder,
            Symbol("43003") => InvalidOrder,
            Symbol("43004") => InvalidOrder,
            Symbol("43012") => BadRequest,
            Symbol("50001") => ExchangeError,
            Symbol("9010001") => OnMaintenance
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
"""
fetches all available currencies on an exchange
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Cryptocom; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(error = false)))
            return Dict{Symbol, Any}()
    end
    skipFetchCurrencies = false;
    (skipFetchCurrencies, params) = self.handleOptionAndParams(params, "fetchCurrencies", "skipFetchCurrencies", defaultValue = false);
    if functions.ccxtruthy(skipFetchCurrencies)
            return Dict{Symbol, Any}()
    end
    response = Dict{Symbol, Any}();
    try
        response = Base.fetch(self.v1PrivatePostPrivateGetCurrencyNetworks(params));
    catch e
        erString = self.exceptionMessage(e);
        if functions.ccxtruthy(findfirst("SYS_ERROR", erString) !== nothing)
                return Dict{Symbol, Any}()
        end
        throw(e);

    end
    resultData = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    currencyMap = self.safeDict(resultData, "currency_map", defaultValue = Dict{Symbol, Any}());
    enhancedArray = self.addKeyInArrayItems(currencyMap, "_coin_id");
    return self.parseCurrencies(enhancedArray)

end
function parseCurrency(self::Cryptocom, currency)
    id = safeString(currency, "_coin_id");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    chains = self.safeList(currency, "network_list", defaultValue = []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "network_id");
        network = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(network != nothing)
            networks[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => network,
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(chain, "deposit_enabled", defaultValue = false),
                Symbol("withdraw") => self.safeBool(chain, "withdraw_enabled", defaultValue = false),
                Symbol("fee") => self.safeNumber(chain, "withdrawal_fee"),
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "min_withdrawal_amount"),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => currency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(currency, "full_name"),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("type") => "crypto",
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for cryptocom
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Cryptocom; params=Dict())
    response = Base.fetch(self.v1PublicGetPublicGetInstruments(params));
    resultResponse = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(resultResponse, "data", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        inst_type = safeString(market, "inst_type");
        spot = inst_type == "CCY_PAIR";
        swap = inst_type == "PERPETUAL_SWAP";
        future = inst_type == "FUTURE";
        option = inst_type == "WARRANT";
        baseId = safeString(market, "base_ccy");
        quoteId = safeString(market, "quote_ccy");
        settleId = functions.ccxtruthy(spot) ? nothing : quoteId;
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = functions.ccxtruthy(spot) ? nothing : self.safeCurrencyCode(settleId);
        optionType = safeStringLower(market, "put_call");
        strike = safeString(market, "strike");
        marginBuyEnabled = self.safeBool(market, "margin_buy_enabled");
        marginSellEnabled = self.safeBool(market, "margin_sell_enabled");
        expiryString = omitZero(safeString(market, "expiry_timestamp_ms"));
        expiry = functions.ccxtruthy((expiryString != nothing)) ? ccxt_parseInt(expiryString) : nothing;
        symbol = string(base, "/", quote_var);
        type_var = nothing;
        contract = nothing;
        if functions.ccxtruthy(inst_type == "CCY_PAIR")
            type_var = "spot";
            contract = false;
        elseif functions.ccxtruthy(inst_type == "PERPETUAL_SWAP")
            type_var = "swap";
            symbol = string(symbol, ":", quote_var);
            contract = true;
        else
            if functions.ccxtruthy(inst_type == "FUTURE")
                type_var = "future";
                symbol = string(symbol, ":", quote_var, "-", self.yymmdd(expiry));
                contract = true;
            elseif functions.ccxtruthy(inst_type == "WARRANT")
                type_var = "option";
                symbolOptionType = functions.ccxtruthy((optionType == "call")) ? "C" : "P";
                symbol = string(symbol, ":", quote_var, "-", self.yymmdd(expiry), "-", strike, "-", symbolOptionType);
                contract = true;
            end

        end
        isLinear = functions.ccxtruthy((contract)) ? true : nothing;
        isInverse = functions.ccxtruthy((contract)) ? false : nothing;
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "symbol"),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => (@functions.ccxt_or((marginBuyEnabled), (marginSellEnabled))),
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("active") => self.safeBool(market, "tradable"),
    Symbol("contract") => contract,
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("contractSize") => self.safeNumber(market, "contract_size"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => self.parseNumber(strike),
    Symbol("optionType") => optionType,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(safeString(market, "price_tick_size")),
        Symbol("amount") => self.parseNumber(safeString(market, "qty_tick_size"))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "max_leverage")
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
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers
see: https://exchange-docs.crypto.com/derivatives/index.html#public-get-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Cryptocom; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbol = nothing;
        if functions.ccxtruthy(functions.ccxt_isArray(symbols))
            symbolsLength = length(symbols);
            if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
                throw(BadRequest(string(self.id, " fetchTickers() symbols argument cannot contain more than 1 symbol")));
            end
            symbol = get(symbols, 1, nothing);
        else
            symbol = symbols;
        end
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v1PublicGetPublicGetTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parseTickers(data, symbols = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Cryptocom, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = self.symbol(symbol);
    tickers = Base.fetch(self.fetchTickers(symbols = [symbol], params = params));
    return safeValue(tickers, symbol)

end
"""
fetches information on multiple orders made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, max date range is one day
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100 max 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Cryptocom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_time")] = until;
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetOrderHistory(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "data", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
get a list of the most recent trades for a particular symbol
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch, maximum date range is one day
- `limit`::int, optional: the maximum number of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Cryptocom, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_ts")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_ts")] = until;
    end
    response = Base.fetch(self.v1PublicGetPublicGetTrades(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(result, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-candlestick

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Cryptocom, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 300))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("timeframe") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 300))
            limit = 300;
        end
        request[Symbol("count")] = limit;
    end
    now = microseconds();
    duration = self.parseTimeframe(timeframe);
    until = safeInteger(params, "until", now);
    params = omit(params, ["until"]);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_ts")] = since - duration * 1000;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("end_ts")] = self.sum(since, duration * limit * 1000);
        else
            request[Symbol("end_ts")] = until;
        end
    else
        request[Symbol("end_ts")] = until;
    end
    response = Base.fetch(self.v1PublicGetPublicGetCandlestick(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the number of order book entries to return, max 50
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Cryptocom, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit)
        request[Symbol("depth")] = min(limit, 50);
    end
    response = Base.fetch(self.v1PublicGetPublicGetBook(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    orderBook = safeValue(data, 0);
    timestamp = safeInteger(orderBook, "t");
    return self.parseOrderBook(orderBook, symbol, timestamp = timestamp)

end
function parseBalance(self::Cryptocom, response)
    responseResult = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(responseResult, "data", defaultValue = []);
    positionBalances = safeValue(get(data, 1, nothing), "position_balances", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positionBalances)))
        balance = get(positionBalances, i + 1, nothing);
        currencyId = safeString(balance, "instrument_name");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "quantity");
        account[Symbol("used")] = safeString(balance, "reserved_qty");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-user-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Cryptocom; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivatePostPrivateUserBalance(params));
    return self.parseBalance(response)

end
"""
fetches information on an order made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-detail

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Cryptocom, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.v1PrivatePostPrivateGetOrderDetail(extend(request, params)));
    order = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
function createOrderRequest(self::Cryptocom, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")), (uppercaseType == "TAKE_PROFIT_LIMIT")))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    broker = safeString(self.options, "broker", "CCXT");
    request[Symbol("broker_id")] = broker;
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("createOrder", market = market, params = params);
    (marginMode, params) = self.customHandleMarginModeAndParams("createOrder", params = params);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "margin"), (marginMode != nothing)))
        request[Symbol("spot_margin")] = "MARGIN";
    elseif functions.ccxtruthy(marketType == "spot")
        request[Symbol("spot_margin")] = "SPOT";
    end
    timeInForce = safeStringUpper2(params, "timeInForce", "time_in_force");
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(timeInForce == "GTC")
            request[Symbol("time_in_force")] = "GOOD_TILL_CANCEL";
        elseif functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("time_in_force")] = "IMMEDIATE_OR_CANCEL";
        else
            if functions.ccxtruthy(timeInForce == "FOK")
                request[Symbol("time_in_force")] = "FILL_OR_KILL";
            else
                request[Symbol("time_in_force")] = timeInForce;
            end

        end
    end
    postOnly = self.safeBool(params, "postOnly", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_or((postOnly), (timeInForce == "PO")))
        request[Symbol("exec_inst")] = ["POST_ONLY"];
        request[Symbol("time_in_force")] = "GOOD_TILL_CANCEL";
    end
    triggerPrice = safeStringN(params, ["stopPrice", "triggerPrice", "ref_price"]);
    stopLossPrice = self.safeNumber(params, "stopLossPrice");
    takeProfitPrice = self.safeNumber(params, "takeProfitPrice");
    isTrigger = (triggerPrice != nothing);
    isStopLossTrigger = (stopLossPrice != nothing);
    isTakeProfitTrigger = (takeProfitPrice != nothing);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("ref_price")] = self.priceToPrecision(symbol, triggerPrice);
        priceString = numberToString(price);
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")), (uppercaseType == "TAKE_PROFIT_LIMIT")))
            if functions.ccxtruthy(side == "buy")
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
                else
                    request[Symbol("type")] = "STOP_LIMIT";
                end
            else
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "STOP_LIMIT";
                else
                    request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
                end
            end
        else
            if functions.ccxtruthy(side == "buy")
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "TAKE_PROFIT";
                else
                    request[Symbol("type")] = "STOP_LOSS";
                end
            else
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "STOP_LOSS";
                else
                    request[Symbol("type")] = "TAKE_PROFIT";
                end
            end
        end
    elseif functions.ccxtruthy(isStopLossTrigger)
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")))
            request[Symbol("type")] = "STOP_LIMIT";
        else
            request[Symbol("type")] = "STOP_LOSS";
        end
        request[Symbol("ref_price")] = self.priceToPrecision(symbol, stopLossPrice);
    else
        if functions.ccxtruthy(isTakeProfitTrigger)
            if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "TAKE_PROFIT_LIMIT")))
                request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
            else
                request[Symbol("type")] = "TAKE_PROFIT";
            end
            request[Symbol("ref_price")] = self.priceToPrecision(symbol, takeProfitPrice);
        else
            request[Symbol("type")] = uppercaseType;
        end

    end
    params = omit(params, ["postOnly", "clientOrderId", "timeInForce", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    return extend(request, params)

end
"""
create a trade order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market', 'limit', 'stop_loss', 'stop_limit', 'take_profit', 'take_profit_limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK' or 'PO'
- `params.ref_price_type`::string, optional: 'MARK_PRICE', 'INDEX_PRICE', 'LAST_PRICE' which trigger price type to use, default is MARK_PRICE
- `params.triggerPrice`::float, optional: price to trigger a trigger order
- `params.stopLossPrice`::float, optional: price to trigger a stop-loss trigger order
- `params.takeProfitPrice`::float, optional: price to trigger a take-profit trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Cryptocom, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = Base.fetch(self.v1PrivatePostPrivateCreateOrder(request));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
"""
create a list of trade orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-list
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-oco

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Cryptocom, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.createAdvancedOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    contigency = safeString(params, "contingency_type", "LIST");
    request = Dict{Symbol, Any}(
        Symbol("contingency_type") => contigency,
        Symbol("order_list") => ordersRequests
    );
    response = Base.fetch(self.v1PrivatePostPrivateCreateOrderList(extend(request, params)));
    result = safeValue(response, "result", []);
    listId = safeString(result, "list_id");
    if functions.ccxtruthy(listId != nothing)
        ocoOrders = [Dict{Symbol, Any}(
            Symbol("order_id") => listId
        )];
            return self.parseOrders(ocoOrders)
    end
    return self.parseOrders(result)

end
function createAdvancedOrderRequest(self::Cryptocom, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    uppercaseType = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")), (uppercaseType == "TAKE_PROFIT_LIMIT")))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    broker = safeString(self.options, "broker", "CCXT");
    request[Symbol("broker_id")] = broker;
    timeInForce = safeStringUpper2(params, "timeInForce", "time_in_force");
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(timeInForce == "GTC")
            request[Symbol("time_in_force")] = "GOOD_TILL_CANCEL";
        elseif functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("time_in_force")] = "IMMEDIATE_OR_CANCEL";
        else
            if functions.ccxtruthy(timeInForce == "FOK")
                request[Symbol("time_in_force")] = "FILL_OR_KILL";
            else
                request[Symbol("time_in_force")] = timeInForce;
            end

        end
    end
    postOnly = self.safeBool(params, "postOnly", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_or((postOnly), (timeInForce == "PO")))
        request[Symbol("exec_inst")] = ["POST_ONLY"];
        request[Symbol("time_in_force")] = "GOOD_TILL_CANCEL";
    end
    triggerPrice = safeStringN(params, ["stopPrice", "triggerPrice", "ref_price"]);
    stopLossPrice = self.safeNumber(params, "stopLossPrice");
    takeProfitPrice = self.safeNumber(params, "takeProfitPrice");
    isTrigger = (triggerPrice != nothing);
    isStopLossTrigger = (stopLossPrice != nothing);
    isTakeProfitTrigger = (takeProfitPrice != nothing);
    if functions.ccxtruthy(isTrigger)
        priceString = numberToString(price);
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")), (uppercaseType == "TAKE_PROFIT_LIMIT")))
            if functions.ccxtruthy(side == "buy")
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
                else
                    request[Symbol("type")] = "STOP_LIMIT";
                end
            else
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "STOP_LIMIT";
                else
                    request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
                end
            end
        else
            if functions.ccxtruthy(side == "buy")
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "TAKE_PROFIT";
                else
                    request[Symbol("type")] = "STOP_LOSS";
                end
            else
                if functions.ccxtruthy(stringLt(priceString, triggerPrice))
                    request[Symbol("type")] = "STOP_LOSS";
                else
                    request[Symbol("type")] = "TAKE_PROFIT";
                end
            end
        end
    elseif functions.ccxtruthy(isStopLossTrigger)
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "STOP_LIMIT")))
            request[Symbol("type")] = "STOP_LIMIT";
        else
            request[Symbol("type")] = "STOP_LOSS";
        end
    else
        if functions.ccxtruthy(isTakeProfitTrigger)
            if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "LIMIT"), (uppercaseType == "TAKE_PROFIT_LIMIT")))
                request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
            else
                request[Symbol("type")] = "TAKE_PROFIT";
            end
        else
            request[Symbol("type")] = uppercaseType;
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and((side == "buy"), (@functions.ccxt_or(@functions.ccxt_or((uppercaseType == "MARKET"), (uppercaseType == "STOP_LOSS")), (uppercaseType == "TAKE_PROFIT")))))
        quoteAmount = nothing;
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
        cost = self.safeNumber2(params, "cost", "notional");
        params = omit(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            quoteAmount = self.costToPrecision(symbol, cost);
        elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
            if functions.ccxtruthy(price == nothing)
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument")));
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                costRequest = stringMul(amountString, priceString);
                quoteAmount = self.costToPrecision(symbol, costRequest);
            end
        else
            quoteAmount = self.costToPrecision(symbol, amount);
        end
        request[Symbol("notional")] = quoteAmount;
    else
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    params = omit(params, ["postOnly", "clientOrderId", "timeInForce", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    return extend(request, params)

end
"""
edit a trade order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-amend-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol of the order to edit
- `type`::string, optional: not used by cryptocom editOrder
- `side`::string, optional: not used by cryptocom editOrder
- `amount`::float: (mandatory) how much of the currency you want to trade in units of the base currency
- `price`::float: (mandatory) the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: the original client order id of the order to edit, required if id is not provided

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Cryptocom, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = self.editOrderRequest(id, symbol, amount, price = price, params = params);
    response = Base.fetch(self.v1PrivatePostPrivateAmendOrder(request));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function editOrderRequest(self::Cryptocom, id, symbol, amount; price=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(id != nothing)
        request[Symbol("order_id")] = id;
    else
        originalClientOrderId = safeString2(params, "orig_client_oid", "clientOrderId");
        if functions.ccxtruthy(originalClientOrderId == nothing)
            throw(ArgumentsRequired(string(self.id, " editOrder() requires an id argument or orig_client_oid parameter")));
        else
            request[Symbol("orig_client_oid")] = originalClientOrderId;
            params = omit(params, ["orig_client_oid", "clientOrderId"]);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or((amount == nothing), (price == nothing)))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires both amount and price arguments. If you do not want to change the amount or price, you should pass the original values")));
    end
    request[Symbol("new_quantity")] = self.amountToPrecision(symbol, amount);
    request[Symbol("new_price")] = self.priceToPrecision(symbol, price);
    return extend(request, params)

end
"""
cancel all open orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the orders to cancel
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- Returns exchange raw message{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Cryptocom; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v1PrivatePostPrivateCancelAllOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
cancels an open order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order

# Arguments
- `id`::string: the order id of the order to cancel
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Cryptocom, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.v1PrivatePostPrivateCancelOrder(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
"""
cancel multiple orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Cryptocom, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        order = Dict{Symbol, Any}(
            Symbol("instrument_name") => get(market, Symbol("id"), nothing),
            Symbol("order_id") => string(id)
        );
        push!(orderRequests, order);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("contingency_type") => "LIST",
        Symbol("order_list") => orderRequests
    );
    response = Base.fetch(self.v1PrivatePostPrivateCancelOrderList(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = market, since = nothing, limit = nothing, params = params)

end
"""
cancel multiple orders for multiple symbols
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list

# Arguments
- `orders`::array: each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrdersForSymbols(self::Cryptocom, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orderRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        id = safeString(order, "id");
        symbol = safeString(order, "symbol");
        market = self.market(symbol);
        orderItem = Dict{Symbol, Any}(
            Symbol("instrument_name") => get(market, Symbol("id"), nothing),
            Symbol("order_id") => string(id)
        );
        push!(orderRequests, orderItem);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("contingency_type") => "LIST",
        Symbol("order_list") => orderRequests
    );
    response = Base.fetch(self.v1PrivatePostPrivateCancelOrderList(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = nothing, since = nothing, limit = nothing, params = params)

end
"""
fetch all unfilled currently open orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Cryptocom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetOpenOrders(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "data", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for, maximum date range is one day
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Cryptocom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_time")] = until;
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetTrades(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(result, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseAddress(self::Cryptocom, addressString)
    address = nothing;
    tag = nothing;
    rawTag = nothing;
    if functions.ccxtruthy(findfirst("?", addressString) !== nothing)
        (address, rawTag) =         split(addressString, "?");
        splitted = split(rawTag, "=");
        tag = get(splitted, 2, nothing);
    else
        address = addressString;
    end
    return [address, tag]

end
"""
make a withdrawal
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Cryptocom, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("address_tag")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkId = self.networkCodeToId(networkCode, currencyCode = code);
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("network_id")] = networkId;
    end
    response = Base.fetch(self.v1PrivatePostPrivateCreateWithdrawal(extend(request, params)));
    result = self.safeDict(response, "result");
    return self.parseTransaction(result, currency = currency)

end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
function fetchDepositAddressesByNetwork(self::Cryptocom, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.safeCurrency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivatePostPrivateGetDepositAddress(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    addresses = self.safeList(data, "deposit_address_list", defaultValue = []);
    addressesLength = length(addresses);
    if functions.ccxtruthy(addressesLength == 0)
        throw(ExchangeError(string(self.id, " fetchDepositAddressesByNetwork() generating address...")));
    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, addressesLength))
        value = self.safeDict(addresses, i);
        addressString = safeString(value, "address");
        currencyId = safeString(value, "currency");
        responseCode = self.safeCurrencyCode(currencyId);
        (address, tag) = self.parseAddress(addressString);
        self.checkAddress(address = address);
        networkId = safeString(value, "network");
        network = self.networkIdToCode(networkId = networkId, currencyCode = responseCode);
        if functions.ccxtruthy(network != nothing)
            result[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => value,
                Symbol("currency") => responseCode,
                Symbol("network") => network,
                Symbol("address") => address,
                Symbol("tag") => tag
            );
        end
        i += 1
    end
    return result

end
"""
fetch the deposit address for a currency associated with this account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Cryptocom, code; params=Dict())
    network = safeStringUpper(params, "network");
    params = omit(params, ["network"]);
    depositAddressesRaw = Base.fetch(self.fetchDepositAddressesByNetwork(code, params = params));
    depositAddresses = depositAddressesRaw;
    if functions.ccxtruthy(ccxt_in(network, depositAddresses))
            return get(depositAddresses, Symbol(network), nothing)
    end
    keys_var = objectKeys(depositAddresses);
    return get(depositAddresses, Symbol(get(keys_var, 1, nothing)), nothing)

end
"""
fetch all deposits made to an account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Cryptocom; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_ts")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_ts")] = until;
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetDepositHistory(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    depositList = self.safeList(data, "deposit_list", defaultValue = []);
    return self.parseTransactions(depositList, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-withdrawal-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Cryptocom; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_ts")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_ts")] = until;
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetWithdrawalHistory(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    withdrawalList = self.safeList(data, "withdrawal_list", defaultValue = []);
    return self.parseTransactions(withdrawalList, currency = currency, since = since, limit = limit)

end
function parseTicker(self::Cryptocom, ticker; market=nothing)
    timestamp = safeInteger(ticker, "t");
    marketId = safeString(ticker, "i");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    last_var = safeString(ticker, "a");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => self.safeNumber(ticker, "h"),
    Symbol("low") => self.safeNumber(ticker, "l"),
    Symbol("bid") => self.safeNumber(ticker, "b"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => self.safeNumber(ticker, "k"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "c"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "v"),
    Symbol("quoteVolume") => functions.ccxtruthy((get(market, Symbol("quote"), nothing) == "USD")) ? safeString(ticker, "vv") : nothing,
    Symbol("info") => ticker
), market = market)

end
function parseTrade(self::Cryptocom, trade; market=nothing)
    timestamp = safeInteger2(trade, "t", "create_time");
    marketId = safeString2(trade, "i", "instrument_name");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    feeCurrency = safeString(trade, "fee_instrument_name");
    feeCostString = safeString(trade, "fees");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "d", "trade_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("side") => safeStringLower2(trade, "s", "side"),
    Symbol("takerOrMaker") => safeStringLower(trade, "taker_side"),
    Symbol("price") => self.safeNumber2(trade, "p", "traded_price"),
    Symbol("amount") => self.safeNumber2(trade, "q", "traded_quantity"),
    Symbol("cost") => nothing,
    Symbol("type") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(feeCurrency),
        Symbol("cost") => self.parseNumber(stringNeg(feeCostString))
    )
), market = market)

end
function parseOHLCV(self::Cryptocom, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
function parseOrderStatus(self::Cryptocom, status)
    statuses = Dict{Symbol, Any}(
        Symbol("ACTIVE") => "open",
        Symbol("CANCELED") => "canceled",
        Symbol("FILLED") => "closed",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Cryptocom, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GOOD_TILL_CANCEL") => "GTC",
        Symbol("IMMEDIATE_OR_CANCEL") => "IOC",
        Symbol("FILL_OR_KILL") => "FOK"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrder(self::Cryptocom, order; market=nothing)
    code = safeInteger(order, "code");
    if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (code != 0)))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => safeString(order, "client_oid"),
    Symbol("info") => order,
    Symbol("status") => "rejected"
))
    end
    created = safeInteger(order, "create_time");
    marketId = safeString(order, "instrument_name");
    symbol = self.safeSymbol(marketId, market = market);
    execInst = safeValue(order, "exec_inst");
    postOnly = nothing;
    if functions.ccxtruthy(execInst != nothing)
        postOnly = false;
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(execInst)))
            inst = get(execInst, i + 1, nothing);
            if functions.ccxtruthy(inst == "POST_ONLY")
                postOnly = true;
                break
            end
            i += 1
        end

    end
    feeCurrency = safeString(order, "fee_instrument_name");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => safeString(order, "client_oid"),
    Symbol("timestamp") => created,
    Symbol("datetime") => self.iso8601(created),
    Symbol("lastTradeTimestamp") => safeInteger(order, "update_time"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("symbol") => symbol,
    Symbol("type") => safeStringLower(order, "order_type"),
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "time_in_force")),
    Symbol("postOnly") => postOnly,
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => self.safeNumber(order, "limit_price"),
    Symbol("amount") => self.safeNumber(order, "quantity"),
    Symbol("filled") => self.safeNumber(order, "cumulative_quantity"),
    Symbol("remaining") => nothing,
    Symbol("average") => self.safeNumber(order, "avg_price"),
    Symbol("cost") => self.safeNumber(order, "cumulative_value"),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(feeCurrency),
        Symbol("cost") => self.safeNumber(order, "cumulative_fee")
    ),
    Symbol("trades") => []
), market = market)

end
function parseDepositStatus(self::Cryptocom, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "ok",
        Symbol("2") => "failed",
        Symbol("3") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseWithdrawalStatus(self::Cryptocom, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "pending",
        Symbol("2") => "failed",
        Symbol("3") => "pending",
        Symbol("4") => "failed",
        Symbol("5") => "ok",
        Symbol("6") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Cryptocom, transaction; currency=nothing)
    type_var = nothing;
    rawStatus = safeString(transaction, "status");
    status = nothing;
    if functions.ccxtruthy(ccxt_in("client_wid", transaction))
        type_var = "withdrawal";
        status = self.parseWithdrawalStatus(rawStatus);
    else
        type_var = "deposit";
        status = self.parseDepositStatus(rawStatus);
    end
    addressString = safeString(transaction, "address");
    (address, tag) = self.parseAddress(addressString);
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transaction, "create_time");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "txid"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => safeInteger(transaction, "update_time"),
    Symbol("internal") => nothing,
    Symbol("comment") => safeString(transaction, "client_wid"),
    Symbol("fee") => fee
)

end
function customHandleMarginModeAndParams(self::Cryptocom, methodName; params=Dict())
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", defaultValue = false);
    params = omit(params, "margin");
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams(methodName, params = params);
    if functions.ccxtruthy(marginMode != nothing)
        if functions.ccxtruthy(marginMode != "cross")
            throw(NotSupported(string(self.id, " only cross margin is supported")));
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or((defaultType == "margin"), (isMargin)))
            marginMode = "cross";
        end
    end
    return [marginMode, params]

end
function parseDepositWithdrawFee(self::Cryptocom, fee; currency=nothing)
    networkList = self.safeList(fee, "network_list", defaultValue = []);
    networkListLength = length(networkList);
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    if functions.ccxtruthy(networkList != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, networkListLength))
            networkInfo = get(networkList, i + 1, nothing);
            networkId = safeString(networkInfo, "network_id");
            currencyCode = safeString(currency, "code");
            networkCode = self.networkIdToCode(networkId = networkId, currencyCode = currencyCode);
            if functions.ccxtruthy(networkCode != nothing)
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => self.safeNumber(networkInfo, "withdrawal_fee"),
                        Symbol("percentage") => false
                    )
                );
            end
            if functions.ccxtruthy(networkListLength == 1)
                result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(networkInfo, "withdrawal_fee");
                result[Symbol("withdraw")][Symbol("percentage")] = false;
            end
            i += 1
        end

    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Cryptocom; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetCurrencyNetworks(params));
    data = safeValue(response, "result");
    currencyMap = self.safeList(data, "currency_map");
    return self.parseDepositWithdrawFees(currencyMap, codes = codes, currencyIdKey = "full_name")

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-transactions

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Cryptocom; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_time")] = until;
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetTransactions(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    ledger = self.safeList(result, "data", defaultValue = []);
    return self.parseLedger(ledger, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Cryptocom, item; currency=nothing)
    timestamp = safeInteger(item, "event_timestamp_ms");
    currencyId = safeString(item, "instrument_name");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amount = safeString(item, "transaction_qty");
    direction = nothing;
    if functions.ccxtruthy(stringLt(amount, "0"))
        direction = "out";
        amount = stringAbs(amount);
    else
        direction = "in";
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "order_id"),
    Symbol("direction") => direction,
    Symbol("account") => safeString(item, "account_id"),
    Symbol("referenceId") => safeString(item, "trade_id"),
    Symbol("referenceAccount") => safeString(item, "trade_match_id"),
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "journal_type")),
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing
    )
), currency = currency)

end
function parseLedgerEntryType(self::Cryptocom, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("TRADING") => "trade",
        Symbol("TRADE_FEE") => "fee",
        Symbol("WITHDRAW_FEE") => "fee",
        Symbol("WITHDRAW") => "withdrawal",
        Symbol("DEPOSIT") => "deposit",
        Symbol("ROLLBACK_WITHDRAW") => "rollback",
        Symbol("ROLLBACK_DEPOSIT") => "rollback",
        Symbol("FUNDING") => "fee",
        Symbol("REALIZED_PNL") => "trade",
        Symbol("INSURANCE_FUND") => "insurance",
        Symbol("SOCIALIZED_LOSS") => "trade",
        Symbol("LIQUIDATION_FEE") => "fee",
        Symbol("SESSION_RESET") => "reset",
        Symbol("ADJUSTMENT") => "adjustment",
        Symbol("SESSION_SETTLE") => "settlement",
        Symbol("UNCOVERED_LOSS") => "trade",
        Symbol("ADMIN_ADJUSTMENT") => "adjustment",
        Symbol("DELIST") => "delist",
        Symbol("SETTLEMENT_FEE") => "fee",
        Symbol("AUTO_CONVERSION") => "conversion",
        Symbol("MANUAL_CONVERSION") => "conversion"
    );
    return safeString(ledgerType, type_var, type_var)

end
"""
fetch all the accounts associated with a profile
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Cryptocom; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetAccounts(params));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    masterAccount = self.safeDict(result, "master_account", defaultValue = Dict{Symbol, Any}());
    accounts = self.safeList(result, "sub_account_list", defaultValue = []);
    push!(accounts, masterAccount);
    return self.parseAccounts(accounts, params = params)

end
function parseAccount(self::Cryptocom, account)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "uuid"),
    Symbol("type") => safeString(account, "label"),
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
fetches historical settlement records
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-expired-settlement-price

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::int, optional: 'future', 'option'

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
function fetchSettlementHistory(self::Cryptocom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchSettlementHistory", market = market, params = params);
    self.checkRequiredArgument("fetchSettlementHistory", type_var, "type", options = ["future", "option", "WARRANT", "FUTURE"]);
    if functions.ccxtruthy(type_var == "option")
        type_var = "WARRANT";
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_type") => uppercase(type_var)
    );
    response = Base.fetch(self.v1PublicGetPublicGetExpiredSettlementPrice(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseSettlement(self::Cryptocom, settlement, market)
    timestamp = safeInteger(settlement, "x");
    marketId = safeString(settlement, "i");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("price") => self.safeNumber(settlement, "v"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseSettlements(self::Cryptocom, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        i += 1
    end
    return result

end
"""
fetches historical funding rates
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRate(self::Cryptocom, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("valuation_type") => "estimated_funding_rate",
        Symbol("count") => 1
    );
    response = Base.fetch(self.v1PublicGetPublicGetValuations(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    entry = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(entry, market = market)

end
function parseFundingRate(self::Cryptocom, contract; market=nothing)
    timestamp = safeInteger(contract, "t");
    fundingTimestamp = nothing;
    if functions.ccxtruthy(timestamp != nothing)
        fundingTimestamp = ceil(timestamp / 3600000) * 3600000;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "v"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "1h"
)

end
"""
fetches historical funding rates
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures] to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Cryptocom; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("valuation_type") => "funding_hist"
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_ts")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_ts")] = until;
    end
    response = Base.fetch(self.v1PublicGetPublicGetValuations(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    marketId = safeString(result, "instrument_name");
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeInteger(entry, "t");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("fundingRate") => self.safeNumber(entry, "v"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
"""
fetch data on a single open contract trade position
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Cryptocom, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivatePostPrivateGetPositions(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parsePosition(self.safeDict(data, 0), market = market)

end
"""
fetch all open positions
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Cryptocom; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = nothing;
        if functions.ccxtruthy(functions.ccxt_isArray(symbols))
            symbolsLength = length(symbols);
            if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
                throw(BadRequest(string(self.id, " fetchPositions() symbols argument cannot contain more than 1 symbol")));
            end
            symbol = get(symbols, 1, nothing);
        else
            symbol = symbols;
        end
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetPositions(extend(request, params)));
    responseResult = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    positions = self.safeList(responseResult, "data", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        marketId = safeString(entry, "instrument_name");
        marketInner = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "contract");
        push!(result, self.parsePosition(entry, market = marketInner));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = nothing, indexed = false)

end
function parsePosition(self::Cryptocom, position; market=nothing)
    marketId = safeString(position, "instrument_name");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract");
    timestamp = safeInteger(position, "update_timestamp_ms");
    amount = safeString(position, "quantity");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("side") => functions.ccxtruthy(stringGt(amount, "0")) ? "buy" : "sell",
    Symbol("contracts") => stringAbs(amount),
    Symbol("contractSize") => get(market, Symbol("contractSize"), nothing),
    Symbol("entryPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("leverage") => nothing,
    Symbol("collateral") => self.safeNumber(position, "open_pos_cost"),
    Symbol("initialMargin") => self.safeNumber(position, "cost"),
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => self.safeNumber(position, "open_position_pnl"),
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function nonce(self::Cryptocom, )
    return milliseconds()

end
function paramsToString(self::Cryptocom, object, level)
    maxLevel = 3;
    if functions.ccxtruthy(functions.ccxt_ge(level, maxLevel))
            return string(object)
    end
    if functions.ccxtruthy(isa(object, AbstractString))
            return object
    end
    returnString = "";
    paramsKeys = nothing;
    if functions.ccxtruthy(functions.ccxt_isArray(object))
        paramsKeys = object;
    else
        objectKeys = Ccxt.objectKeys(object);
        paramsKeys = sort(objectKeys);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(paramsKeys)))
        key = get(paramsKeys, i + 1, nothing);
        returnString += key;
        value = get(object, Symbol(key), nothing);
        if functions.ccxtruthy(value == "undefined")
            returnString += "null";
        elseif functions.ccxtruthy(functions.ccxt_isArray(value))
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(value)))
                returnString += self.paramsToString(get(value, j + 1, nothing), level + 1);
                j += 1
            end
        else
            returnString += string(value);
        end
        i += 1
    end
    return returnString

end
"""
closes open positions for a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by cryptocom.closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.type`::string, optional: LIMIT or MARKET
- `params.price`::float, optional: for limit orders only

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closePosition(self::Cryptocom, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("type") => "MARKET"
    );
    type_var = safeStringUpper(params, "type");
    price = safeString(params, "price");
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("type")] = type_var;
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
    end
    response = Base.fetch(self.v1PrivatePostPrivateClosePosition(extend(request, params)));
    result = self.safeDict(response, "result");
    return self.parseOrder(result, market = market)

end
"""
fetch the trading fees for a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-instrument-fee-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Cryptocom, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivatePostPrivateGetInstrumentFeeRate(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFee(data, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-fee-rate

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Cryptocom; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivatePostPrivateGetFeeRate(params));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFees(result)

end
function parseTradingFees(self::Cryptocom, response)
    result = Dict{Symbol, Any}();
    result[Symbol("info")] = response;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        isSwap = get(market, Symbol("swap"), nothing);
        takerFeeKey = functions.ccxtruthy(isSwap) ? "effective_deriv_taker_rate_bps" : "effective_spot_taker_rate_bps";
        makerFeeKey = functions.ccxtruthy(isSwap) ? "effective_deriv_maker_rate_bps" : "effective_spot_maker_rate_bps";
        tradingFee = Dict{Symbol, Any}(
            Symbol("info") => response,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.parseNumber(stringDiv(safeString(response, makerFeeKey), "10000")),
            Symbol("taker") => self.parseNumber(stringDiv(safeString(response, takerFeeKey), "10000")),
            Symbol("percentage") => nothing,
            Symbol("tierBased") => nothing
        );
        result[Symbol(symbol)] = tradingFee;
        i += 1
    end
    return result

end
function parseTradingFee(self::Cryptocom, fee; market=nothing)
    marketId = safeString(fee, "instrument_name");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.parseNumber(stringDiv(safeString(fee, "effective_maker_rate_bps"), "10000")),
    Symbol("taker") => self.parseNumber(stringDiv(safeString(fee, "effective_taker_rate_bps"), "10000")),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function sign(self::Cryptocom, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    type_var = safeString(api, 0);
    access = safeString(api, 1);
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(type_var), nothing), "/", path);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(access == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        requestParams = extend(Dict{Symbol, Any}(), params);
        paramsKeys = objectKeys(requestParams);
        strSortKey = self.paramsToString(requestParams, 0);
        payload = string(path, nonce, self.apiKey, strSortKey, nonce);
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256);
        paramsKeysLength = length(paramsKeys);
        body = json(Dict{Symbol, Any}(
    Symbol("id") => nonce,
    Symbol("method") => path,
    Symbol("params") => params,
    Symbol("api_key") => self.apiKey,
    Symbol("sig") => signature,
    Symbol("nonce") => nonce
));
        if functions.ccxtruthy(paramsKeysLength == 0)
            paramsString = "{}";
            arrayString = "[]";
            body = replace(body, arrayString => paramsString);
        end
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
function handleErrors(self::Cryptocom, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    errorCode = safeString(response, "code");
    if functions.ccxtruthy(errorCode != "0")
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(string(self.id, " ", body)));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Cryptocom, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function basePublicGetV1PublicGetAnnouncements(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "v1/public/get-announcements"; api=["base", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicAuth(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/auth"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetInstruments(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-instruments"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetBook(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-book"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetCandlestick(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-candlestick"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-trades"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetTickers(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-tickers"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetValuations(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-valuations"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetExpiredSettlementPrice(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-expired-settlement-price"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetInsurance(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-insurance"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetAnnouncements(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-announcements"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetPublicGetRiskParameters(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-risk-parameters"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicPostPublicStakingGetConversionRate(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/staking/get-conversion-rate"; api=["v1", "public"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateSetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/set-cancel-on-disconnect"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-cancel-on-disconnect"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateUserBalance(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/user-balance"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateUserBalanceHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/user-balance-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetPositions(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-positions"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCreateOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateAmendOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/amend-order"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCreateOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order-list"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCancelOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-order"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCancelOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-order-list"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCancelAllOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-all-orders"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateClosePosition(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/close-position"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetOrderHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetOpenOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-open-orders"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetOrderDetail(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-detail"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-trades"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateChangeAccountLeverage(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/change-account-leverage"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetTransactions(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-transactions"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCreateSubaccountTransfer(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-subaccount-transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetSubaccountBalances(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-subaccount-balances"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-list"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCreateWithdrawal(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-withdrawal"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetCurrencyNetworks(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-currency-networks"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetDepositAddress(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-deposit-address"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetAccounts(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-accounts"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetWithdrawalHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-withdrawal-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetDepositHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-deposit-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetFeeRate(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-fee-rate"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateGetInstrumentFeeRate(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-instrument-fee-rate"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatDepositInfo(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-deposit-info"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatDepositHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-deposit-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatWithdrawHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-withdraw-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatCreateWithdraw(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-create-withdraw"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatTransactionQuota(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-transaction-quota"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatTransactionLimit(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-transaction-limit"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateFiatFiatGetBankAccounts(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/fiat/fiat-get-bank-accounts"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingStake(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/stake"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingUnstake(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/unstake"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetStakingPosition(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-staking-position"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetStakingInstruments(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-staking-instruments"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetOpenStake(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-open-stake"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetStakeHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-stake-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetRewardHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-reward-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingConvert(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/convert"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetOpenConvert(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-open-convert"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateStakingGetConvertHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/staking/get-convert-history"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateCreateIsolatedMarginTransfer(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-isolated-margin-transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostPrivateChangeIsolatedMarginLeverage(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/change-isolated-margin-leverage"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicAuth(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/auth"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicGetInstruments(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-instruments"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicGetBook(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-book"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicGetCandlestick(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-candlestick"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicGetTicker(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-ticker"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-trades"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicMarginGetTransferCurrencies(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/margin/get-transfer-currencies"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicMarginGetLoadCurrenices(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/margin/get-load-currenices"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPublicRespondHeartbeat(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/respond-heartbeat"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateSetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/set-cancel-on-disconnect"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-cancel-on-disconnect"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCreateWithdrawal(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-withdrawal"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetWithdrawalHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-withdrawal-history"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetCurrencyNetworks(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-currency-networks"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetDepositHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-deposit-history"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetDepositAddress(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-deposit-address"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateExportCreateExportRequest(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/export/create-export-request"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateExportGetExportRequests(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/export/get-export-requests"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateExportDownloadExportOutput(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/export/download-export-output"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetAccountSummary(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-account-summary"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCreateOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCancelOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCancelAllOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-all-orders"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCreateOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order-list"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetOrderHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-history"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetOpenOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-open-orders"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetOrderDetail(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-detail"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-trades"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetAccounts(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-accounts"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateGetSubaccountBalances(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-subaccount-balances"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateCreateSubaccountTransfer(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-subaccount-transfer"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcGetOtcUser(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/get-otc-user"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcGetInstruments(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/get-instruments"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcRequestQuote(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/request-quote"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcAcceptQuote(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/accept-quote"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcGetQuoteHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/get-quote-history"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcGetTradeHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/get-trade-history"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPrivateOtcCreateOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/otc/create-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicAuth(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/auth"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetInstruments(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-instruments"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetBook(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-book"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetCandlestick(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-candlestick"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-trades"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetTickers(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-tickers"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetValuations(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-valuations"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetExpiredSettlementPrice(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-expired-settlement-price"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPublicGetPublicGetInsurance(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "public/get-insurance"; api=["derivatives", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateSetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/set-cancel-on-disconnect"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetCancelOnDisconnect(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-cancel-on-disconnect"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateUserBalance(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/user-balance"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateUserBalanceHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/user-balance-history"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetPositions(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-positions"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCreateOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCreateOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-order-list"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCancelOrder(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-order"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCancelOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-order-list"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCancelAllOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/cancel-all-orders"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateClosePosition(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/close-position"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateConvertCollateral(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/convert-collateral"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetOrderHistory(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-history"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetOpenOrders(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-open-orders"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetOrderDetail(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-detail"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetTrades(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-trades"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateChangeAccountLeverage(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/change-account-leverage"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetTransactions(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-transactions"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateCreateSubaccountTransfer(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/create-subaccount-transfer"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetSubaccountBalances(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-subaccount-balances"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function derivativesPrivatePostPrivateGetOrderList(self::Cryptocom, params=Dict(), context=Dict())
    return request(self, "private/get-order-list"; api=["derivatives", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Cryptocom(; kwargs...)
    inst = Cryptocom(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchTickers, fetchTicker, fetchOrders, fetchTrades, fetchOHLCV, fetchOrderBook, parseBalance, fetchBalance, fetchOrder, createOrderRequest, createOrder, createOrders, createAdvancedOrderRequest, editOrder, editOrderRequest, cancelAllOrders, cancelOrder, cancelOrders, cancelOrdersForSymbols, fetchOpenOrders, fetchMyTrades, parseAddress, withdraw, fetchDepositAddressesByNetwork, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTicker, parseTrade, parseOHLCV, parseOrderStatus, parseTimeInForce, parseOrder, parseDepositStatus, parseWithdrawalStatus, parseTransaction, customHandleMarginModeAndParams, parseDepositWithdrawFee, fetchDepositWithdrawFees, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchAccounts, parseAccount, fetchSettlementHistory, parseSettlement, parseSettlements, fetchFundingRate, parseFundingRate, fetchFundingRateHistory, fetchPosition, fetchPositions, parsePosition, nonce, paramsToString, closePosition, fetchTradingFee, fetchTradingFees, parseTradingFees, parseTradingFee, sign, handleErrors, basePublicGetV1PublicGetAnnouncements, v1PublicGetPublicAuth, v1PublicGetPublicGetInstruments, v1PublicGetPublicGetBook, v1PublicGetPublicGetCandlestick, v1PublicGetPublicGetTrades, v1PublicGetPublicGetTickers, v1PublicGetPublicGetValuations, v1PublicGetPublicGetExpiredSettlementPrice, v1PublicGetPublicGetInsurance, v1PublicGetPublicGetAnnouncements, v1PublicGetPublicGetRiskParameters, v1PublicPostPublicStakingGetConversionRate, v1PrivatePostPrivateSetCancelOnDisconnect, v1PrivatePostPrivateGetCancelOnDisconnect, v1PrivatePostPrivateUserBalance, v1PrivatePostPrivateUserBalanceHistory, v1PrivatePostPrivateGetPositions, v1PrivatePostPrivateCreateOrder, v1PrivatePostPrivateAmendOrder, v1PrivatePostPrivateCreateOrderList, v1PrivatePostPrivateCancelOrder, v1PrivatePostPrivateCancelOrderList, v1PrivatePostPrivateCancelAllOrders, v1PrivatePostPrivateClosePosition, v1PrivatePostPrivateGetOrderHistory, v1PrivatePostPrivateGetOpenOrders, v1PrivatePostPrivateGetOrderDetail, v1PrivatePostPrivateGetTrades, v1PrivatePostPrivateChangeAccountLeverage, v1PrivatePostPrivateGetTransactions, v1PrivatePostPrivateCreateSubaccountTransfer, v1PrivatePostPrivateGetSubaccountBalances, v1PrivatePostPrivateGetOrderList, v1PrivatePostPrivateCreateWithdrawal, v1PrivatePostPrivateGetCurrencyNetworks, v1PrivatePostPrivateGetDepositAddress, v1PrivatePostPrivateGetAccounts, v1PrivatePostPrivateGetWithdrawalHistory, v1PrivatePostPrivateGetDepositHistory, v1PrivatePostPrivateGetFeeRate, v1PrivatePostPrivateGetInstrumentFeeRate, v1PrivatePostPrivateFiatFiatDepositInfo, v1PrivatePostPrivateFiatFiatDepositHistory, v1PrivatePostPrivateFiatFiatWithdrawHistory, v1PrivatePostPrivateFiatFiatCreateWithdraw, v1PrivatePostPrivateFiatFiatTransactionQuota, v1PrivatePostPrivateFiatFiatTransactionLimit, v1PrivatePostPrivateFiatFiatGetBankAccounts, v1PrivatePostPrivateStakingStake, v1PrivatePostPrivateStakingUnstake, v1PrivatePostPrivateStakingGetStakingPosition, v1PrivatePostPrivateStakingGetStakingInstruments, v1PrivatePostPrivateStakingGetOpenStake, v1PrivatePostPrivateStakingGetStakeHistory, v1PrivatePostPrivateStakingGetRewardHistory, v1PrivatePostPrivateStakingConvert, v1PrivatePostPrivateStakingGetOpenConvert, v1PrivatePostPrivateStakingGetConvertHistory, v1PrivatePostPrivateCreateIsolatedMarginTransfer, v1PrivatePostPrivateChangeIsolatedMarginLeverage, v2PublicGetPublicAuth, v2PublicGetPublicGetInstruments, v2PublicGetPublicGetBook, v2PublicGetPublicGetCandlestick, v2PublicGetPublicGetTicker, v2PublicGetPublicGetTrades, v2PublicGetPublicMarginGetTransferCurrencies, v2PublicGetPublicMarginGetLoadCurrenices, v2PublicGetPublicRespondHeartbeat, v2PrivatePostPrivateSetCancelOnDisconnect, v2PrivatePostPrivateGetCancelOnDisconnect, v2PrivatePostPrivateCreateWithdrawal, v2PrivatePostPrivateGetWithdrawalHistory, v2PrivatePostPrivateGetCurrencyNetworks, v2PrivatePostPrivateGetDepositHistory, v2PrivatePostPrivateGetDepositAddress, v2PrivatePostPrivateExportCreateExportRequest, v2PrivatePostPrivateExportGetExportRequests, v2PrivatePostPrivateExportDownloadExportOutput, v2PrivatePostPrivateGetAccountSummary, v2PrivatePostPrivateCreateOrder, v2PrivatePostPrivateCancelOrder, v2PrivatePostPrivateCancelAllOrders, v2PrivatePostPrivateCreateOrderList, v2PrivatePostPrivateGetOrderHistory, v2PrivatePostPrivateGetOpenOrders, v2PrivatePostPrivateGetOrderDetail, v2PrivatePostPrivateGetTrades, v2PrivatePostPrivateGetAccounts, v2PrivatePostPrivateGetSubaccountBalances, v2PrivatePostPrivateCreateSubaccountTransfer, v2PrivatePostPrivateOtcGetOtcUser, v2PrivatePostPrivateOtcGetInstruments, v2PrivatePostPrivateOtcRequestQuote, v2PrivatePostPrivateOtcAcceptQuote, v2PrivatePostPrivateOtcGetQuoteHistory, v2PrivatePostPrivateOtcGetTradeHistory, v2PrivatePostPrivateOtcCreateOrder, derivativesPublicGetPublicAuth, derivativesPublicGetPublicGetInstruments, derivativesPublicGetPublicGetBook, derivativesPublicGetPublicGetCandlestick, derivativesPublicGetPublicGetTrades, derivativesPublicGetPublicGetTickers, derivativesPublicGetPublicGetValuations, derivativesPublicGetPublicGetExpiredSettlementPrice, derivativesPublicGetPublicGetInsurance, derivativesPrivatePostPrivateSetCancelOnDisconnect, derivativesPrivatePostPrivateGetCancelOnDisconnect, derivativesPrivatePostPrivateUserBalance, derivativesPrivatePostPrivateUserBalanceHistory, derivativesPrivatePostPrivateGetPositions, derivativesPrivatePostPrivateCreateOrder, derivativesPrivatePostPrivateCreateOrderList, derivativesPrivatePostPrivateCancelOrder, derivativesPrivatePostPrivateCancelOrderList, derivativesPrivatePostPrivateCancelAllOrders, derivativesPrivatePostPrivateClosePosition, derivativesPrivatePostPrivateConvertCollateral, derivativesPrivatePostPrivateGetOrderHistory, derivativesPrivatePostPrivateGetOpenOrders, derivativesPrivatePostPrivateGetOrderDetail, derivativesPrivatePostPrivateGetTrades, derivativesPrivatePostPrivateChangeAccountLeverage, derivativesPrivatePostPrivateGetTransactions, derivativesPrivatePostPrivateCreateSubaccountTransfer, derivativesPrivatePostPrivateGetSubaccountBalances, derivativesPrivatePostPrivateGetOrderList)
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
function __ccxt_doc_Cryptocom_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Cryptocom_fetchCurrencies

function __ccxt_doc_Cryptocom_fetchMarkets() end
"""
retrieves data on all markets for cryptocom
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Cryptocom_fetchMarkets

function __ccxt_doc_Cryptocom_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers
see: https://exchange-docs.crypto.com/derivatives/index.html#public-get-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Cryptocom_fetchTickers

function __ccxt_doc_Cryptocom_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Cryptocom_fetchTicker

function __ccxt_doc_Cryptocom_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, max date range is one day
- `limit`::int, optional: the maximum number of order structures to retrieve, default 100 max 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_fetchOrders

function __ccxt_doc_Cryptocom_fetchTrades() end
"""
get a list of the most recent trades for a particular symbol
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch, maximum date range is one day
- `limit`::int, optional: the maximum number of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Cryptocom_fetchTrades

function __ccxt_doc_Cryptocom_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-candlestick

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Cryptocom_fetchOHLCV

function __ccxt_doc_Cryptocom_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the number of order book entries to return, max 50
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Cryptocom_fetchOrderBook

function __ccxt_doc_Cryptocom_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-user-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Cryptocom_fetchBalance

function __ccxt_doc_Cryptocom_fetchOrder() end
"""
fetches information on an order made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-detail

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_fetchOrder

function __ccxt_doc_Cryptocom_createOrder() end
"""
create a trade order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market', 'limit', 'stop_loss', 'stop_limit', 'take_profit', 'take_profit_limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK' or 'PO'
- `params.ref_price_type`::string, optional: 'MARK_PRICE', 'INDEX_PRICE', 'LAST_PRICE' which trigger price type to use, default is MARK_PRICE
- `params.triggerPrice`::float, optional: price to trigger a trigger order
- `params.stopLossPrice`::float, optional: price to trigger a stop-loss trigger order
- `params.takeProfitPrice`::float, optional: price to trigger a take-profit trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_createOrder

function __ccxt_doc_Cryptocom_createOrders() end
"""
create a list of trade orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-list
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-oco

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_createOrders

function __ccxt_doc_Cryptocom_editOrder() end
"""
edit a trade order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-amend-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol of the order to edit
- `type`::string, optional: not used by cryptocom editOrder
- `side`::string, optional: not used by cryptocom editOrder
- `amount`::float: (mandatory) how much of the currency you want to trade in units of the base currency
- `price`::float: (mandatory) the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: the original client order id of the order to edit, required if id is not provided

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_editOrder

function __ccxt_doc_Cryptocom_cancelAllOrders() end
"""
cancel all open orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the orders to cancel
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- Returns exchange raw message{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_cancelAllOrders

function __ccxt_doc_Cryptocom_cancelOrder() end
"""
cancels an open order
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order

# Arguments
- `id`::string: the order id of the order to cancel
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_cancelOrder

function __ccxt_doc_Cryptocom_cancelOrders() end
"""
cancel multiple orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_cancelOrders

function __ccxt_doc_Cryptocom_cancelOrdersForSymbols() end
"""
cancel multiple orders for multiple symbols
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list

# Arguments
- `orders`::array: each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_cancelOrdersForSymbols

function __ccxt_doc_Cryptocom_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Cryptocom_fetchOpenOrders

function __ccxt_doc_Cryptocom_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for, maximum date range is one day
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Cryptocom_fetchMyTrades

function __ccxt_doc_Cryptocom_withdraw() end
"""
make a withdrawal
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Cryptocom_withdraw

function __ccxt_doc_Cryptocom_fetchDepositAddressesByNetwork() end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
__ccxt_doc_Cryptocom_fetchDepositAddressesByNetwork

function __ccxt_doc_Cryptocom_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Cryptocom_fetchDepositAddress

function __ccxt_doc_Cryptocom_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Cryptocom_fetchDeposits

function __ccxt_doc_Cryptocom_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-withdrawal-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Cryptocom_fetchWithdrawals

function __ccxt_doc_Cryptocom_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Cryptocom_fetchDepositWithdrawFees

function __ccxt_doc_Cryptocom_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-transactions

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Cryptocom_fetchLedger

function __ccxt_doc_Cryptocom_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Cryptocom_fetchAccounts

function __ccxt_doc_Cryptocom_fetchSettlementHistory() end
"""
fetches historical settlement records
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-expired-settlement-price

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::int, optional: 'future', 'option'

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
__ccxt_doc_Cryptocom_fetchSettlementHistory

function __ccxt_doc_Cryptocom_fetchFundingRate() end
"""
fetches historical funding rates
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Cryptocom_fetchFundingRate

function __ccxt_doc_Cryptocom_fetchFundingRateHistory() end
"""
fetches historical funding rates
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures] to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Cryptocom_fetchFundingRateHistory

function __ccxt_doc_Cryptocom_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Cryptocom_fetchPosition

function __ccxt_doc_Cryptocom_fetchPositions() end
"""
fetch all open positions
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Cryptocom_fetchPositions

function __ccxt_doc_Cryptocom_closePosition() end
"""
closes open positions for a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by cryptocom.closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.type`::string, optional: LIMIT or MARKET
- `params.price`::float, optional: for limit orders only

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Cryptocom_closePosition

function __ccxt_doc_Cryptocom_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-instrument-fee-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Cryptocom_fetchTradingFee

function __ccxt_doc_Cryptocom_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-fee-rate

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Cryptocom_fetchTradingFees
