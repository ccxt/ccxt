@kwdef mutable struct Ndax <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    signIn::Function = signIn
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseOrderBook::Function = parseOrderBook
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchAccounts::Function = fetchAccounts
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    fetchMyTrades::Function = fetchMyTrades
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    createDepositAddress::Function = createDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetActivate2FA::Function = publicGetActivate2FA
    publicGetAuthenticate2FA::Function = publicGetAuthenticate2FA
    publicGetAuthenticateUser::Function = publicGetAuthenticateUser
    publicGetEnableXP2FA::Function = publicGetEnableXP2FA
    publicGetGetL2Snapshot::Function = publicGetGetL2Snapshot
    publicGetGetLevel1::Function = publicGetGetLevel1
    publicGetGetValidate2FARequiredEndpoints::Function = publicGetGetValidate2FARequiredEndpoints
    publicGetLogOut::Function = publicGetLogOut
    publicGetGetTickerHistory::Function = publicGetGetTickerHistory
    publicGetGetProduct::Function = publicGetGetProduct
    publicGetGetProducts::Function = publicGetGetProducts
    publicGetGetInstrument::Function = publicGetGetInstrument
    publicGetGetInstruments::Function = publicGetGetInstruments
    publicGetGetEarliestTickTime::Function = publicGetGetEarliestTickTime
    publicGetPing::Function = publicGetPing
    publicGetAssets::Function = publicGetAssets
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetTicker::Function = publicGetTicker
    publicGetSummary::Function = publicGetSummary
    publicGetTrades::Function = publicGetTrades
    publicGetGetLastTrades::Function = publicGetGetLastTrades
    publicGetConfirmWithdraw::Function = publicGetConfirmWithdraw
    publicGetSubscribeLevel1::Function = publicGetSubscribeLevel1
    publicGetSubscribeLevel2::Function = publicGetSubscribeLevel2
    publicGetSubscribeTicker::Function = publicGetSubscribeTicker
    publicGetSubscribeTrades::Function = publicGetSubscribeTrades
    publicGetSubscribeBlockTrades::Function = publicGetSubscribeBlockTrades
    publicGetUnsubscribeBlockTrades::Function = publicGetUnsubscribeBlockTrades
    publicGetUnsubscribeLevel1::Function = publicGetUnsubscribeLevel1
    publicGetUnsubscribeLevel2::Function = publicGetUnsubscribeLevel2
    publicGetUnsubscribeTicker::Function = publicGetUnsubscribeTicker
    publicGetUnsubscribeTrades::Function = publicGetUnsubscribeTrades
    publicGetAuthenticate::Function = publicGetAuthenticate
    privateGetGetUserAccountInfos::Function = privateGetGetUserAccountInfos
    privateGetGetUserAccounts::Function = privateGetGetUserAccounts
    privateGetGetUserAffiliateCount::Function = privateGetGetUserAffiliateCount
    privateGetGetUserAffiliateTag::Function = privateGetGetUserAffiliateTag
    privateGetGetUserConfig::Function = privateGetGetUserConfig
    privateGetGetAllUnredactedUserConfigsForUser::Function = privateGetGetAllUnredactedUserConfigsForUser
    privateGetGetUnredactedUserConfigByKey::Function = privateGetGetUnredactedUserConfigByKey
    privateGetGetUserDevices::Function = privateGetGetUserDevices
    privateGetGetUserReportTickets::Function = privateGetGetUserReportTickets
    privateGetGetUserReportWriterResultRecords::Function = privateGetGetUserReportWriterResultRecords
    privateGetGetAccountInfo::Function = privateGetGetAccountInfo
    privateGetGetAccountPositions::Function = privateGetGetAccountPositions
    privateGetGetAllAccountConfigs::Function = privateGetGetAllAccountConfigs
    privateGetGetTreasuryProductsForAccount::Function = privateGetGetTreasuryProductsForAccount
    privateGetGetAccountTrades::Function = privateGetGetAccountTrades
    privateGetGetAccountTransactions::Function = privateGetGetAccountTransactions
    privateGetGetOpenTradeReports::Function = privateGetGetOpenTradeReports
    privateGetGetAllOpenTradeReports::Function = privateGetGetAllOpenTradeReports
    privateGetGetTradesHistory::Function = privateGetGetTradesHistory
    privateGetGetOpenOrders::Function = privateGetGetOpenOrders
    privateGetGetOpenQuotes::Function = privateGetGetOpenQuotes
    privateGetGetOrderFee::Function = privateGetGetOrderFee
    privateGetGetOrderHistory::Function = privateGetGetOrderHistory
    privateGetGetOrdersHistory::Function = privateGetGetOrdersHistory
    privateGetGetOrderStatus::Function = privateGetGetOrderStatus
    privateGetGetOmsFeeTiers::Function = privateGetGetOmsFeeTiers
    privateGetGetAccountDepositTransactions::Function = privateGetGetAccountDepositTransactions
    privateGetGetAccountWithdrawTransactions::Function = privateGetGetAccountWithdrawTransactions
    privateGetGetAllDepositRequestInfoTemplates::Function = privateGetGetAllDepositRequestInfoTemplates
    privateGetGetDepositInfo::Function = privateGetGetDepositInfo
    privateGetGetDepositRequestInfoTemplate::Function = privateGetGetDepositRequestInfoTemplate
    privateGetGetDeposits::Function = privateGetGetDeposits
    privateGetGetDepositTicket::Function = privateGetGetDepositTicket
    privateGetGetDepositTickets::Function = privateGetGetDepositTickets
    privateGetGetOMSWithdrawFees::Function = privateGetGetOMSWithdrawFees
    privateGetGetWithdrawFee::Function = privateGetGetWithdrawFee
    privateGetGetWithdraws::Function = privateGetGetWithdraws
    privateGetGetWithdrawTemplate::Function = privateGetGetWithdrawTemplate
    privateGetGetWithdrawTemplateTypes::Function = privateGetGetWithdrawTemplateTypes
    privateGetGetWithdrawTicket::Function = privateGetGetWithdrawTicket
    privateGetGetWithdrawTicketAttachment::Function = privateGetGetWithdrawTicketAttachment
    privateGetGetWithdrawTickets::Function = privateGetGetWithdrawTickets
    privateGetGetDepositTicketAttachment::Function = privateGetGetDepositTicketAttachment
    privatePostAddUserAffiliateTag::Function = privatePostAddUserAffiliateTag
    privatePostAddDepositTicketAttachment::Function = privatePostAddDepositTicketAttachment
    privatePostAddWithdrawTicketAttachment::Function = privatePostAddWithdrawTicketAttachment
    privatePostCancelUserReport::Function = privatePostCancelUserReport
    privatePostRegisterNewDevice::Function = privatePostRegisterNewDevice
    privatePostSubscribeAccountEvents::Function = privatePostSubscribeAccountEvents
    privatePostUpdateUserAffiliateTag::Function = privatePostUpdateUserAffiliateTag
    privatePostGenerateTradeActivityReport::Function = privatePostGenerateTradeActivityReport
    privatePostGenerateTransactionActivityReport::Function = privatePostGenerateTransactionActivityReport
    privatePostGenerateTreasuryActivityReport::Function = privatePostGenerateTreasuryActivityReport
    privatePostScheduleTradeActivityReport::Function = privatePostScheduleTradeActivityReport
    privatePostScheduleTransactionActivityReport::Function = privatePostScheduleTransactionActivityReport
    privatePostScheduleTreasuryActivityReport::Function = privatePostScheduleTreasuryActivityReport
    privatePostCancelAllOrders::Function = privatePostCancelAllOrders
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostCancelQuote::Function = privatePostCancelQuote
    privatePostCancelReplaceOrder::Function = privatePostCancelReplaceOrder
    privatePostCreateQuote::Function = privatePostCreateQuote
    privatePostModifyOrder::Function = privatePostModifyOrder
    privatePostSendOrder::Function = privatePostSendOrder
    privatePostSubmitBlockTrade::Function = privatePostSubmitBlockTrade
    privatePostUpdateQuote::Function = privatePostUpdateQuote
    privatePostCancelWithdraw::Function = privatePostCancelWithdraw
    privatePostCreateDepositTicket::Function = privatePostCreateDepositTicket
    privatePostCreateWithdrawTicket::Function = privatePostCreateWithdrawTicket
    privatePostSubmitDepositTicketComment::Function = privatePostSubmitDepositTicketComment
    privatePostSubmitWithdrawTicketComment::Function = privatePostSubmitWithdrawTicketComment
    privatePostGetOrderHistoryByOrderId::Function = privatePostGetOrderHistoryByOrderId

end
function describe(self::Ndax, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "ndax",
    Symbol("name") => "NDAX",
    Symbol("countries") => ["CA"],
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
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
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
        Symbol("fetchLedger") => true,
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
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchUnderlyingAssets") => false,
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
        Symbol("signIn") => true,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "60",
        Symbol("5m") => "300",
        Symbol("15m") => "900",
        Symbol("30m") => "1800",
        Symbol("1h") => "3600",
        Symbol("2h") => "7200",
        Symbol("4h") => "14400",
        Symbol("6h") => "21600",
        Symbol("12h") => "43200",
        Symbol("1d") => "86400",
        Symbol("1w") => "604800",
        Symbol("1M") => "2419200",
        Symbol("4M") => "9676800"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://ndaxmarginstaging.cdnhop.net:8443/AP",
            Symbol("private") => "https://ndaxmarginstaging.cdnhop.net:8443/AP"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.ndax.io:8443/AP",
            Symbol("private") => "https://api.ndax.io:8443/AP"
        ),
        Symbol("www") => "https://ndax.io",
        Symbol("doc") => ["https://apidoc.ndax.io/"],
        Symbol("fees") => "https://ndax.io/fees",
        Symbol("referral") => "https://one.ndax.io/bfQiSL"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("Activate2FA") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Authenticate2FA") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("AuthenticateUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("EnableXP2FA") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetL2Snapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetLevel1") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetValidate2FARequiredEndpoints") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("LogOut") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTickerHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetProduct") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetProducts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetInstrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetInstruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetEarliestTickTime") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetLastTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ConfirmWithdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeLevel1") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeLevel2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeBlockTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UnsubscribeBlockTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UnsubscribeLevel1") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UnsubscribeLevel2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UnsubscribeTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UnsubscribeTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("Authenticate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("GetUserAccountInfos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserAccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserAffiliateCount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserAffiliateTag") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAllUnredactedUserConfigsForUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUnredactedUserConfigByKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserDevices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserReportTickets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetUserReportWriterResultRecords") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountPositions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAllAccountConfigs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTreasuryProductsForAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountTransactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOpenTradeReports") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAllOpenTradeReports") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetTradesHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOpenQuotes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderFee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrdersHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOmsFeeTiers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountDepositTransactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAccountWithdrawTransactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetAllDepositRequestInfoTemplates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDepositInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDepositRequestInfoTemplate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDeposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDepositTicket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDepositTickets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOMSWithdrawFees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawFee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdraws") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawTemplate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawTemplateTypes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawTicket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawTicketAttachment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetWithdrawTickets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetDepositTicketAttachment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("AddUserAffiliateTag") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("AddDepositTicketAttachment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("AddWithdrawTicketAttachment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelUserReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("RegisterNewDevice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubscribeAccountEvents") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UpdateUserAffiliateTag") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GenerateTradeActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GenerateTransactionActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GenerateTreasuryActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ScheduleTradeActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ScheduleTransactionActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ScheduleTreasuryActivityReport") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelAllOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelReplaceOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CreateQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ModifyOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SendOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubmitBlockTrade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("UpdateQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CancelWithdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CreateDepositTicket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("CreateWithdrawTicket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubmitDepositTicketComment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("SubmitWithdrawTicketComment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("GetOrderHistoryByOrderId") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => false,
                    Symbol("index") => false
                ),
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
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => nothing
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
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.0025")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("uid") => true,
        Symbol("login") => true,
        Symbol("password") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Not_Enough_Funds") => InsufficientFunds,
            Symbol("Server Error") => ExchangeError,
            Symbol("Resource Not Found") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Invalid InstrumentId") => BadSymbol,
            Symbol("This endpoint requires 2FACode along with the payload") => AuthenticationError
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("omsId") => 1,
        Symbol("orderTypes") => Dict{Symbol, Any}(
            Symbol("Market") => 1,
            Symbol("Limit") => 2,
            Symbol("StopMarket") => 3,
            Symbol("StopLimit") => 4,
            Symbol("TrailingStopMarket") => 5,
            Symbol("TrailingStopLimit") => 6,
            Symbol("BlockTrade") => 7,
            Symbol("1") => 1,
            Symbol("2") => 2,
            Symbol("3") => 3,
            Symbol("4") => 4,
            Symbol("5") => 5,
            Symbol("6") => 6,
            Symbol("7") => 7
        )
    )
))

end
"""
the latest known information on the availability of the exchange API
see: https://apidoc.ndax.io/#ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Ndax; params=Dict())
    response = Base.fetch(self.publicGetPing(params));
    message = safeString(response, "msg");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((message == "PONG")) ? "ok" : "error",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
sign in, must be called prior to using other authenticated methods
see: https://apidoc.ndax.io/#authenticate2fa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
function signIn(self::Ndax; params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(@functions.ccxt_or(self.login == nothing, self.password == nothing))
        throw(AuthenticationError(string(self.id, " signIn() requires exchange.login, exchange.password")));
    end
    request = Dict{Symbol, Any}(
        Symbol("grant_type") => "client_credentials"
    );
    response = Base.fetch(self.publicGetAuthenticate(extend(request, params)));
    sessionToken = safeString(response, "SessionToken");
    if functions.ccxtruthy(sessionToken != nothing)
        self.options[Symbol("sessionToken")] = sessionToken;
            return response
    end
    pending2faToken = safeString(response, "Pending2FaToken");
    if functions.ccxtruthy(pending2faToken != nothing)
        if functions.ccxtruthy(self.twofa == nothing)
            throw(AuthenticationError(string(self.id, " signIn() requires exchange.twofa credentials")));
        end
        self.options[Symbol("pending2faToken")] = pending2faToken;
        request = Dict{Symbol, Any}(
            Symbol("Code") => totp(self.twofa)
        );
        responseInner = Base.fetch(self.publicGetAuthenticate2FA(extend(request, params)));
        sessionToken = safeString(responseInner, "SessionToken");
        self.options[Symbol("sessionToken")] = sessionToken;
            return responseInner
    end
    return response

end
"""
fetches all available currencies on an exchange
see: https://apidoc.ndax.io/#getproducts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Ndax; params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId
    );
    response = Base.fetch(self.publicGetGetProducts(extend(request, params)));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Ndax, rawCurrency)
    id = safeString(rawCurrency, "ProductId");
    code = self.safeCurrencyCode(safeString(rawCurrency, "Product"));
    ProductType = safeString(rawCurrency, "ProductType");
    type_var = functions.ccxtruthy((ProductType == "NationalCurrency")) ? "fiat" : "crypto";
    if functions.ccxtruthy(ProductType == "Unknown")
        type_var = "other";
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => safeString(rawCurrency, "ProductFullName"),
    Symbol("code") => code,
    Symbol("type") => type_var,
    Symbol("precision") => self.safeNumber(rawCurrency, "TickSize"),
    Symbol("info") => rawCurrency,
    Symbol("active") => !functions.ccxtruthy(self.safeBool(rawCurrency, "IsDisabled")),
    Symbol("deposit") => self.safeBool(rawCurrency, "DepositEnabled"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "WithdrawEnabled"),
    Symbol("fee") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("margin") => self.safeBool(rawCurrency, "MarginEnabled")
))

end
"""
retrieves data on all markets for ndax
see: https://apidoc.ndax.io/#getinstruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Ndax; params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId
    );
    response = Base.fetch(self.publicGetGetInstruments(extend(request, params)));
    return self.parseMarkets(response)

end
function parseMarket(self::Ndax, market)
    id = safeString(market, "InstrumentId");
    baseId = safeString(market, "Product1");
    quoteId = safeString(market, "Product2");
    base = self.safeCurrencyCode(safeString(market, "Product1Symbol"));
    quote_var = self.safeCurrencyCode(safeString(market, "Product2Symbol"));
    sessionStatus = safeString(market, "SessionStatus");
    isDisable = safeValue(market, "IsDisable");
    sessionRunning = (sessionStatus == "Running");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("active") => (@functions.ccxt_and(sessionRunning, !functions.ccxtruthy(isDisable))),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "QuantityIncrement"),
        Symbol("price") => self.safeNumber(market, "PriceIncrement")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "MinimumQuantity"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "MinimumPrice"),
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseOrderBook(self::Ndax, orderbook, symbol; timestamp=nothing, bidsKey="bids", asksKey="asks", priceKey=6, amountKey=8, countOrIdKey=2)
    nonce = nothing;
    result = Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("bids") => [],
        Symbol("asks") => [],
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing,
        Symbol("nonce") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderbook)))
        level = get(orderbook, i + 1, nothing);
        if functions.ccxtruthy(timestamp == nothing)
            timestamp = safeInteger(level, 2);
        else
            newTimestamp = safeInteger(level, 2);
            if functions.ccxtruthy(newTimestamp != nothing)
                timestamp = max(timestamp, newTimestamp);
            end
        end
        if functions.ccxtruthy(nonce == nothing)
            nonce = safeInteger(level, 0);
        else
            newNonce = safeInteger(level, 0);
            if functions.ccxtruthy(newNonce != nothing)
                nonce = max(nonce, newNonce);
            end
        end
        bidask = self.parseOrderBookBidAsk(level, priceKey = priceKey, amountKey = amountKey);
        levelSide = safeInteger(level, 9);
        side = functions.ccxtruthy(levelSide) ? asksKey : bidsKey;
        push!(get(result, Symbol(side), nothing), bidask);
        i += 1
    end
    result[Symbol("bids")] = sortBy(get(result, Symbol("bids"), nothing), 0, true);
    result[Symbol("asks")] = sortBy(get(result, Symbol("asks"), nothing), 0);
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    result[Symbol("nonce")] = nonce;
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidoc.ndax.io/#getl2snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Ndax, symbol; limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    limit = functions.ccxtruthy((limit == nothing)) ? 100 : limit;
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("InstrumentId") => get(market, Symbol("id"), nothing),
        Symbol("Depth") => limit
    );
    response = Base.fetch(self.publicGetGetL2Snapshot(extend(request, params)));
    return self.parseOrderBook(response, symbol)

end
function parseTicker(self::Ndax, ticker; market=nothing)
    timestamp = safeInteger(ticker, "TimeStamp");
    marketId = safeString(ticker, "InstrumentId");
    if functions.ccxtruthy(marketId == nothing)
        marketId = safeString(ticker, "trading_pairs");
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = self.safeSymbol(marketId, market = market);
    last_var = safeString2(ticker, "LastTradedPx", "last_price");
    percentage = safeString2(ticker, "Rolling24HrPxChangePercent", "price_change_percent_24h");
    change = safeString(ticker, "Rolling24HrPxChange");
    open = safeString(ticker, "SessionOpen");
    baseVolume = safeString2(ticker, "Rolling24HrVolume", "base_volume");
    quoteVolume = safeString2(ticker, "Rolling24HrNotional", "quote_volume");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "SessionHigh", "highest_price_24h"),
    Symbol("low") => safeString2(ticker, "SessionLow", "lowest_price_24h"),
    Symbol("bid") => safeString2(ticker, "BestBid", "highest_bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString2(ticker, "BestOffer", "lowest_ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidoc.ndax.io/#cmc-summary

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Ndax; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetSummary(params));
    tickers = self.parseTickers(response);
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidoc.ndax.io/#getlevel1

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Ndax, symbol; params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("InstrumentId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetLevel1(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function parseOHLCV(self::Ndax, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidoc.ndax.io/#gettickerhistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Ndax, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("InstrumentId") => get(market, Symbol("id"), nothing),
        Symbol("Interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe);
    now = milliseconds();
    if functions.ccxtruthy(since == nothing)
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("FromDate")] = self.ymdhms(now - duration * limit * 1000);
            request[Symbol("ToDate")] = self.ymdhms(now);
        end
    else
        request[Symbol("FromDate")] = self.ymdhms(since);
        if functions.ccxtruthy(limit == nothing)
            request[Symbol("ToDate")] = self.ymdhms(now);
        else
            request[Symbol("ToDate")] = self.ymdhms(self.sum(since, duration * limit * 1000));
        end
    end
    response = Base.fetch(self.publicGetGetTickerHistory(extend(request, params)));
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseTrade(self::Ndax, trade; market=nothing)
    priceString = nothing;
    amountString = nothing;
    costString = nothing;
    timestamp = nothing;
    id = nothing;
    marketId = nothing;
    side = nothing;
    orderId = nothing;
    takerOrMaker = nothing;
    fee = Dict{Symbol, Any}();
    type_var = nothing;
    if functions.ccxtruthy(functions.ccxt_isArray(trade))
        priceString = safeString(trade, 3);
        amountString = safeString(trade, 2);
        timestamp = safeInteger(trade, 6);
        id = safeString(trade, 0);
        marketId = safeString(trade, 1);
        takerSide = safeValue(trade, 8);
        side = functions.ccxtruthy(takerSide) ? "sell" : "buy";
        orderId = safeString(trade, 4);
    else
        timestamp = safeInteger2(trade, "TradeTimeMS", "ReceiveTime");
        id = safeString(trade, "TradeId");
        orderId = safeString2(trade, "OrderId", "OrigOrderId");
        marketId = safeString2(trade, "InstrumentId", "Instrument");
        priceString = safeString(trade, "Price");
        amountString = safeString(trade, "Quantity");
        costString = safeString2(trade, "Value", "GrossValueExecuted");
        takerOrMaker = safeStringLower(trade, "MakerTaker");
        side = safeStringLower(trade, "Side");
        type_var = safeStringLower(trade, "OrderType");
        feeCostString = safeString(trade, "Fee");
        if functions.ccxtruthy(feeCostString != nothing)
            feeCurrencyId = safeString(trade, "FeeProductId");
            feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
            fee = Dict{Symbol, Any}(
                Symbol("cost") => feeCostString,
                Symbol("currency") => feeCurrencyCode
            );
        end
    end
    symbol = self.safeSymbol(marketId, market = market);
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
function fetchTrades(self::Ndax, symbol; since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("InstrumentId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("Count")] = limit;
    end
    response = Base.fetch(self.publicGetGetLastTrades(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all the accounts associated with a profile
see: https://apidoc.ndax.io/#getuseraccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Ndax; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.login))
        throw(AuthenticationError(string(self.id, " fetchAccounts() requires exchange.login email credential")));
    end
    omsId = safeInteger(self.options, "omsId", 1);
    self.checkRequiredCredentials();
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("UserId") => self.uid,
        Symbol("UserName") => self.login
    );
    response = Base.fetch(self.privateGetGetUserAccounts(extend(request, params)));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        accountId = safeString(response, i);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => nothing,
    Symbol("currency") => nothing,
    Symbol("info") => accountId
));
        i += 1
    end
    return result

end
function parseBalance(self::Ndax, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "ProductId");
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((currencyId != nothing), (self.currencies_by_id != nothing)), (ccxt_in(currencyId, self.currencies_by_id))))
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("total")] = safeString(balance, "Amount");
            account[Symbol("used")] = safeString(balance, "Hold");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidoc.ndax.io/#getaccountpositions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Ndax; params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId");
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    if functions.ccxtruthy(accountId == nothing)
        accountId = self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing));
    end
    params = omit(params, ["accountId", "AccountId"]);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    response = Base.fetch(self.privateGetGetAccountPositions(extend(request, params)));
    return self.parseBalance(response)

end
function parseLedgerEntryType(self::Ndax, type_var)
    types = Dict{Symbol, Any}(
        Symbol("Trade") => "trade",
        Symbol("Deposit") => "transaction",
        Symbol("Withdraw") => "transaction",
        Symbol("Transfer") => "transfer",
        Symbol("OrderHold") => "trade",
        Symbol("WithdrawHold") => "transaction",
        Symbol("DepositHold") => "transaction",
        Symbol("MarginHold") => "trade",
        Symbol("ManualHold") => "trade",
        Symbol("ManualEntry") => "trade",
        Symbol("MarginAcquisition") => "trade",
        Symbol("MarginRelinquish") => "trade",
        Symbol("MarginQuoteHold") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Ndax, item; currency=nothing)
    currencyId = safeString(item, "ProductId");
    currency = self.safeCurrency(currencyId, currency = currency);
    credit = safeString(item, "CR");
    debit = safeString(item, "DR");
    amount = nothing;
    direction = nothing;
    if functions.ccxtruthy(stringLt(credit, "0"))
        amount = credit;
        direction = "in";
    elseif functions.ccxtruthy(stringLt(debit, "0"))
        amount = debit;
        direction = "out";
    end
    before = nothing;
    after = safeString(item, "Balance");
    if functions.ccxtruthy(direction == "out")
        before = stringAdd(after, amount);
    elseif functions.ccxtruthy(direction == "in")
        before = stringMax("0", stringSub(after, amount));
    end
    timestamp = safeInteger(item, "TimeStamp");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "TransactionId"),
    Symbol("direction") => direction,
    Symbol("account") => safeString(item, "AccountId"),
    Symbol("referenceId") => safeString(item, "ReferenceId"),
    Symbol("referenceAccount") => safeString(item, "Counterparty"),
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "ReferenceType")),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => self.parseNumber(before),
    Symbol("after") => self.parseNumber(after),
    Symbol("status") => "ok",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => nothing
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://apidoc.ndax.io/#getaccounttransactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Ndax; code=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("Depth")] = limit;
    end
    response = Base.fetch(self.privateGetGetAccountTransactions(extend(request, params)));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    return self.parseLedger(response, currency = currency, since = since, limit = limit)

end
function parseOrderStatus(self::Ndax, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Accepted") => "open",
        Symbol("Rejected") => "rejected",
        Symbol("Working") => "open",
        Symbol("Canceled") => "canceled",
        Symbol("Expired") => "expired",
        Symbol("FullyExecuted") => "closed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrder(self::Ndax, order; market=nothing)
    timestamp = safeInteger(order, "ReceiveTime");
    marketId = safeString(order, "Instrument");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString2(order, "ReplacementOrderId", "OrderId"),
    Symbol("clientOrderId") => safeString2(order, "ReplacementClOrdId", "ClientOrderId"),
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => safeInteger(order, "LastUpdatedTime"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "OrderState")),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("type") => safeStringLower(order, "OrderType"),
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => safeStringLower(order, "Side"),
    Symbol("price") => safeString(order, "Price"),
    Symbol("triggerPrice") => self.parseNumber(omitZero(safeString(order, "StopPrice"))),
    Symbol("cost") => safeString(order, "GrossValueExecuted"),
    Symbol("amount") => safeString(order, "OrigQuantity"),
    Symbol("filled") => safeString(order, "QuantityExecuted"),
    Symbol("average") => safeString(order, "AvgPrice"),
    Symbol("remaining") => nothing,
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market = market)

end
"""
create a trade order
see: https://apidoc.ndax.io/#sendorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order would be triggered
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Ndax, symbol, type_var, side, amount; price=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    clientOrderId = safeInteger2(params, "ClientOrderId", "clientOrderId");
    orderType = safeInteger(get(self.options, Symbol("orderTypes"), nothing), capitalize(type_var));
    triggerPrice = safeString(params, "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(type_var == "market")
            orderType = 3;
        elseif functions.ccxtruthy(type_var == "limit")
            orderType = 4;
        end
    end
    params = omit(params, ["accountId", "AccountId", "clientOrderId", "ClientOrderId", "triggerPrice"]);
    market = self.market(symbol);
    orderSide = functions.ccxtruthy((side == "buy")) ? 0 : 1;
    amountString = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("InstrumentId") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("TimeInForce") => 1,
        Symbol("Side") => orderSide,
        Symbol("Quantity") => functions.ccxtruthy((amountString == nothing)) ? nothing : ccxt_toNumber(amountString),
        Symbol("OrderType") => orderType
    );
    if functions.ccxtruthy(price != nothing)
        limitPriceString = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(limitPriceString == nothing)
            limitPriceString = "0";
        end
        request[Symbol("LimitPrice")] = ccxt_toNumber(limitPriceString);
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("ClientOrderId")] = clientOrderId;
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("StopPrice")] = triggerPrice;
    end
    response = Base.fetch(self.privatePostSendOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order and places a new order
see: https://apidoc.ndax.io/#cancelreplaceorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Ndax, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    clientOrderId = safeInteger2(params, "ClientOrderId", "clientOrderId");
    params = omit(params, ["accountId", "AccountId", "clientOrderId", "ClientOrderId"]);
    market = self.market(symbol);
    orderSide = functions.ccxtruthy((side == "buy")) ? 0 : 1;
    amountString = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("OrderIdToReplace") => ccxt_parseInt(id),
        Symbol("InstrumentId") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("TimeInForce") => 1,
        Symbol("Side") => orderSide,
        Symbol("Quantity") => functions.ccxtruthy((amountString == nothing)) ? nothing : ccxt_toNumber(amountString),
        Symbol("OrderType") => safeInteger(get(self.options, Symbol("orderTypes"), nothing), capitalize(type_var))
    );
    if functions.ccxtruthy(price != nothing)
        limitPriceString = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(limitPriceString == nothing)
            limitPriceString = "0";
        end
        request[Symbol("LimitPrice")] = ccxt_toNumber(limitPriceString);
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("ClientOrderId")] = clientOrderId;
    end
    response = Base.fetch(self.privatePostCancelReplaceOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
fetch all trades made by the user
see: https://apidoc.ndax.io/#gettradeshistory

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Ndax; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("InstrumentId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("StartTimeStamp")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("Depth")] = limit;
    end
    response = Base.fetch(self.privateGetGetTradesHistory(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
cancel all open orders
see: https://apidoc.ndax.io/#cancelallorders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Ndax; symbol=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("IntrumentId")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostCancelAllOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
cancels an open order
see: https://apidoc.ndax.io/#cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Ndax, id; symbol=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId
    );
    clientOrderId = safeInteger2(params, "clientOrderId", "ClOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("ClOrderId")] = clientOrderId;
    else
        request[Symbol("OrderId")] = ccxt_parseInt(id);
    end
    params = omit(params, ["clientOrderId", "ClOrderId"]);
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    order = self.parseOrder(response, market = market);
    return extend(order, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId
))

end
"""
fetch all unfilled currently open orders
see: https://apidoc.ndax.io/#getopenorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Ndax; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    response = Base.fetch(self.privateGetGetOpenOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://apidoc.ndax.io/#getorderhistory

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Ndax; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("InstrumentId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("StartTimeStamp")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("Depth")] = limit;
    end
    response = Base.fetch(self.privateGetGetOrdersHistory(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://apidoc.ndax.io/#getorderstatus

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Ndax, id; symbol=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("OrderId") => ccxt_parseInt(id)
    );
    response = Base.fetch(self.privateGetGetOrderStatus(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
fetch all the trades made from a single order
see: https://apidoc.ndax.io/#getorderhistorybyorderid

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Ndax, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("OMSId") => self.parseToInt(omsId),
        Symbol("OrderId") => ccxt_parseInt(id)
    );
    response = Base.fetch(self.privatePostGetOrderHistoryByOrderId(extend(request, params)));
    grouped = groupBy(response, "ChangeReason");
    trades = self.safeList(grouped, "Trade", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch the deposit address for a currency associated with this account

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Ndax, code; params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("ProductId") => get(currency, Symbol("id"), nothing),
        Symbol("GenerateNewKey") => false
    );
    response = Base.fetch(self.privateGetGetDepositInfo(extend(request, params)));
    return self.parseDepositAddress(response, currency = currency)

end
function parseDepositAddress(self::Ndax, depositAddress; currency=nothing)
    depositInfoString = safeString(depositAddress, "DepositInfo", "[]");
    depositInfo = functions.ccxt_json_parse(depositInfoString);
    depositInfoLength = length(depositInfo);
    lastString = safeString(depositInfo, depositInfoLength - 1, "");
    parts = split(lastString, "?memo=");
    address = safeString(parts, 0);
    tag = safeString(parts, 1);
    code = nothing;
    if functions.ccxtruthy(currency != nothing)
        code = get(currency, Symbol("code"), nothing);
    end
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
create a currency deposit address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Ndax, code; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("GenerateNewKey") => true
    );
    return Base.fetch(self.fetchDepositAddress(code, params = extend(request, params)))

end
"""
fetch all deposits made to an account
see: https://apidoc.ndax.io/#getdeposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: not used by ndax fetchDeposits
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Ndax; code=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    response = Base.fetch(self.privateGetGetDeposits(extend(request, params)));
    if functions.ccxtruthy(isa(response, AbstractString))
            return self.parseTransactions(functions.ccxt_json_parse(response), currency = currency, since = since, limit = limit)
    end
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://apidoc.ndax.io/#getwithdraws

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Ndax; code=nothing, since=nothing, limit=nothing, params=Dict())
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId
    );
    response = Base.fetch(self.privateGetGetWithdraws(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
function parseTransactionStatusByType(self::Ndax; status=nothing, type_var=nothing)
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("New") => "pending",
            Symbol("AdminProcessing") => "pending",
            Symbol("Accepted") => "pending",
            Symbol("Rejected") => "rejected",
            Symbol("SystemProcessing") => "pending",
            Symbol("FullyProcessed") => "ok",
            Symbol("Failed") => "failed",
            Symbol("Pending") => "pending",
            Symbol("Confirmed") => "pending",
            Symbol("AmlProcessing") => "pending",
            Symbol("AmlAccepted") => "pending",
            Symbol("AmlRejected") => "rejected",
            Symbol("AmlFailed") => "failed",
            Symbol("LimitsAccepted") => "pending",
            Symbol("LimitsRejected") => "rejected"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("New") => "pending",
            Symbol("AdminProcessing") => "pending",
            Symbol("Accepted") => "pending",
            Symbol("Rejected") => "rejected",
            Symbol("SystemProcessing") => "pending",
            Symbol("FullyProcessed") => "ok",
            Symbol("Failed") => "failed",
            Symbol("Pending") => "pending",
            Symbol("Pending2Fa") => "pending",
            Symbol("AutoAccepted") => "pending",
            Symbol("Delayed") => "pending",
            Symbol("UserCanceled") => "canceled",
            Symbol("AdminCanceled") => "canceled",
            Symbol("AmlProcessing") => "pending",
            Symbol("AmlAccepted") => "pending",
            Symbol("AmlRejected") => "rejected",
            Symbol("AmlFailed") => "failed",
            Symbol("LimitsAccepted") => "pending",
            Symbol("LimitsRejected") => "rejected",
            Symbol("Submitted") => "pending",
            Symbol("Confirmed") => "pending",
            Symbol("ManuallyConfirmed") => "pending",
            Symbol("Confirmed2Fa") => "pending"
        )
    );
    statuses = functions.ccxtruthy((type_var == nothing)) ? Dict{Symbol, Any}() : safeValue(statusesByType, type_var, Dict{Symbol, Any}());
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseTransaction(self::Ndax, transaction; currency=nothing)
    id = nothing;
    currencyId = safeString(transaction, "ProductId");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    type_var = nothing;
    if functions.ccxtruthy(ccxt_in("DepositId", transaction))
        id = safeString(transaction, "DepositId");
        type_var = "deposit";
    elseif functions.ccxtruthy(ccxt_in("WithdrawId", transaction))
        id = safeString(transaction, "WithdrawId");
        type_var = "withdrawal";
    end
    templateForm = self.parseJson(safeValue2(transaction, "TemplateForm", "DepositInfo"));
    updated = safeInteger(transaction, "LastUpdateTimeStamp");
    if functions.ccxtruthy(templateForm != nothing)
        updated = safeInteger(templateForm, "LastUpdated", updated);
    end
    address = safeString2(templateForm, "ExternalAddress", "ToAddress");
    timestamp = safeInteger(templateForm, "TimeSubmitted");
    feeCost = self.safeNumber(transaction, "FeeAmount");
    transactionStatus = safeString(transaction, "TicketStatus");
    fee = Dict{Symbol, Any}();
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => safeString2(templateForm, "TxId", "TXId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => safeString(templateForm, "FromAddress"),
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "Amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatusByType(status = transactionStatus, type_var = type_var),
    Symbol("updated") => updated,
    Symbol("fee") => fee,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("network") => nothing
)

end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Ndax, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    sessionToken = safeString(self.options, "sessionToken");
    if functions.ccxtruthy(sessionToken == nothing)
        throw(AuthenticationError(string(self.id, " call signIn() method to obtain a session token")));
    end
    if functions.ccxtruthy(self.twofa == nothing)
        throw(AuthenticationError(string(self.id, " withdraw() requires exchange.twofa credentials")));
    end
    self.checkAddress(address = address);
    omsId = safeInteger(self.options, "omsId", 1);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    defaultAccountId = safeInteger2(self.options, "accountId", "AccountId", self.parseToInt(get(get(self.accounts, 1, nothing), Symbol("id"), nothing)));
    accountId = safeInteger2(params, "accountId", "AccountId", defaultAccountId);
    params = omit(params, ["accountId", "AccountId"]);
    currency = self.currency(code);
    withdrawTemplateTypesRequest = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("ProductId") => get(currency, Symbol("id"), nothing)
    );
    withdrawTemplateTypesResponse = Base.fetch(self.privateGetGetWithdrawTemplateTypes(withdrawTemplateTypesRequest));
    templateTypes = safeValue(withdrawTemplateTypesResponse, "TemplateTypes", []);
    firstTemplateType = safeValue(templateTypes, 0);
    if functions.ccxtruthy(firstTemplateType == nothing)
        throw(ExchangeError(string(self.id, " withdraw() could not find a withdraw template type for ", get(currency, Symbol("code"), nothing))));
    end
    templateName = safeString(firstTemplateType, "TemplateName");
    withdrawTemplateRequest = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("ProductId") => get(currency, Symbol("id"), nothing),
        Symbol("TemplateType") => templateName,
        Symbol("AccountProviderId") => get(firstTemplateType, Symbol("AccountProviderId"), nothing)
    );
    withdrawTemplateResponse = Base.fetch(self.privateGetGetWithdrawTemplate(withdrawTemplateRequest));
    template = safeString(withdrawTemplateResponse, "Template");
    if functions.ccxtruthy(template == nothing)
        throw(ExchangeError(string(self.id, " withdraw() could not find a withdraw template for ", get(currency, Symbol("code"), nothing))));
    end
    withdrawTemplate = functions.ccxt_json_parse(template);
    withdrawTemplate[Symbol("ExternalAddress")] = address;
    if functions.ccxtruthy(tag != nothing)
        if functions.ccxtruthy(ccxt_in("Memo", withdrawTemplate))
            withdrawTemplate[Symbol("Memo")] = tag;
        end
    end
    withdrawPayload = Dict{Symbol, Any}(
        Symbol("omsId") => omsId,
        Symbol("AccountId") => accountId,
        Symbol("ProductId") => get(currency, Symbol("id"), nothing),
        Symbol("TemplateForm") => json(withdrawTemplate),
        Symbol("TemplateType") => templateName
    );
    withdrawRequest = Dict{Symbol, Any}(
        Symbol("TfaType") => "Google",
        Symbol("TFaCode") => totp(self.twofa),
        Symbol("Payload") => json(withdrawPayload)
    );
    response = Base.fetch(self.privatePostCreateWithdrawTicket(deepExtend(withdrawRequest, params)));
    return self.parseTransaction(response, currency = currency)

end
function nonce(self::Ndax, )
    return milliseconds()

end
function sign(self::Ndax, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(path == "Authenticate")
            auth = string(self.login, ":", self.password);
            auth64 = self.stringToBase64(auth);
            headers = Dict{Symbol, Any}(
                Symbol("Authorization") => string("Basic ", auth64)
            );
        elseif functions.ccxtruthy(path == "Authenticate2FA")
            pending2faToken = safeString(self.options, "pending2faToken");
            if functions.ccxtruthy(pending2faToken != nothing)
                headers = Dict{Symbol, Any}(
                    Symbol("Pending2FaToken") => pending2faToken
                );
                query = omit(query, "pending2faToken");
            end
        end
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        sessionToken = safeString(self.options, "sessionToken");
        if functions.ccxtruthy(sessionToken == nothing)
            nonce = string(self.nonce());
            auth = string(nonce, self.uid, self.apiKey);
            signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
            headers = Dict{Symbol, Any}(
                Symbol("Nonce") => nonce,
                Symbol("APIKey") => self.apiKey,
                Symbol("Signature") => signature,
                Symbol("UserId") => self.uid
            );
        else
            headers = Dict{Symbol, Any}(
                Symbol("APToken") => sessionToken
            );
        end
        if functions.ccxtruthy(method == "POST")
            headers[Symbol("Content-Type")] = "application/json";
            body = json(query);
        else
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Ndax, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(code == 404)
        throw(AuthenticationError(string(self.id, " ", body)));
    end
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    message = safeString(response, "errormsg");
    if functions.ccxtruthy(@functions.ccxt_and((message != nothing), (message != "")))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Ndax, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetActivate2FA(self::Ndax, params=Dict(), context=Dict())
    return request(self, "Activate2FA"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAuthenticate2FA(self::Ndax, params=Dict(), context=Dict())
    return request(self, "Authenticate2FA"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAuthenticateUser(self::Ndax, params=Dict(), context=Dict())
    return request(self, "AuthenticateUser"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetEnableXP2FA(self::Ndax, params=Dict(), context=Dict())
    return request(self, "EnableXP2FA"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetL2Snapshot(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetL2Snapshot"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLevel1(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetLevel1"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetValidate2FARequiredEndpoints(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetValidate2FARequiredEndpoints"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetLogOut(self::Ndax, params=Dict(), context=Dict())
    return request(self, "LogOut"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetTickerHistory(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetTickerHistory"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetProduct(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetProduct"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetProducts(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetProducts"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetInstrument(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetInstrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetInstruments(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetInstruments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetEarliestTickTime(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetEarliestTickTime"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPing(self::Ndax, params=Dict(), context=Dict())
    return request(self, "Ping"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAssets(self::Ndax, params=Dict(), context=Dict())
    return request(self, "assets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbook(self::Ndax, params=Dict(), context=Dict())
    return request(self, "orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSummary(self::Ndax, params=Dict(), context=Dict())
    return request(self, "summary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetLastTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetConfirmWithdraw(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ConfirmWithdraw"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribeLevel1(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeLevel1"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribeLevel2(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeLevel2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribeTicker(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribeTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribeBlockTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeBlockTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeBlockTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UnsubscribeBlockTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeLevel1(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UnsubscribeLevel1"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeLevel2(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UnsubscribeLevel2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeTicker(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UnsubscribeTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UnsubscribeTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAuthenticate(self::Ndax, params=Dict(), context=Dict())
    return request(self, "Authenticate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserAccountInfos(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserAccountInfos"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserAccounts(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserAccounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserAffiliateCount(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserAffiliateCount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserAffiliateTag(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserAffiliateTag"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserConfig(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserConfig"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAllUnredactedUserConfigsForUser(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAllUnredactedUserConfigsForUser"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUnredactedUserConfigByKey(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUnredactedUserConfigByKey"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserDevices(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserDevices"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserReportTickets(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserReportTickets"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserReportWriterResultRecords(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetUserReportWriterResultRecords"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountInfo(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountInfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountPositions(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountPositions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAllAccountConfigs(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAllAccountConfigs"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetTreasuryProductsForAccount(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetTreasuryProductsForAccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountTrades(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountTrades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountTransactions(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountTransactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOpenTradeReports(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOpenTradeReports"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAllOpenTradeReports(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAllOpenTradeReports"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetTradesHistory(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetTradesHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOpenOrders(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOpenOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOpenQuotes(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOpenQuotes"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderFee(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOrderFee"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderHistory(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOrderHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrdersHistory(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOrdersHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderStatus(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOrderStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOmsFeeTiers(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOmsFeeTiers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountDepositTransactions(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountDepositTransactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountWithdrawTransactions(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAccountWithdrawTransactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAllDepositRequestInfoTemplates(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetAllDepositRequestInfoTemplates"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDepositInfo(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDepositInfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDepositRequestInfoTemplate(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDepositRequestInfoTemplate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDeposits(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDeposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDepositTicket(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDepositTicket"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDepositTickets(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDepositTickets"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOMSWithdrawFees(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOMSWithdrawFees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawFee(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawFee"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdraws(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdraws"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawTemplate(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawTemplate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawTemplateTypes(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawTemplateTypes"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawTicket(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawTicket"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawTicketAttachment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawTicketAttachment"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawTickets(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetWithdrawTickets"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDepositTicketAttachment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetDepositTicketAttachment"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAddUserAffiliateTag(self::Ndax, params=Dict(), context=Dict())
    return request(self, "AddUserAffiliateTag"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAddDepositTicketAttachment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "AddDepositTicketAttachment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAddWithdrawTicketAttachment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "AddWithdrawTicketAttachment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelUserReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelUserReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRegisterNewDevice(self::Ndax, params=Dict(), context=Dict())
    return request(self, "RegisterNewDevice"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubscribeAccountEvents(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubscribeAccountEvents"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUpdateUserAffiliateTag(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UpdateUserAffiliateTag"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGenerateTradeActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GenerateTradeActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGenerateTransactionActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GenerateTransactionActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGenerateTreasuryActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GenerateTreasuryActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostScheduleTradeActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ScheduleTradeActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostScheduleTransactionActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ScheduleTransactionActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostScheduleTreasuryActivityReport(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ScheduleTreasuryActivityReport"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelAllOrders(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelAllOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelQuote(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelQuote"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelReplaceOrder(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelReplaceOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCreateQuote(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CreateQuote"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostModifyOrder(self::Ndax, params=Dict(), context=Dict())
    return request(self, "ModifyOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSendOrder(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SendOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubmitBlockTrade(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubmitBlockTrade"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUpdateQuote(self::Ndax, params=Dict(), context=Dict())
    return request(self, "UpdateQuote"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelWithdraw(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CancelWithdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCreateDepositTicket(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CreateDepositTicket"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCreateWithdrawTicket(self::Ndax, params=Dict(), context=Dict())
    return request(self, "CreateWithdrawTicket"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubmitDepositTicketComment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubmitDepositTicketComment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubmitWithdrawTicketComment(self::Ndax, params=Dict(), context=Dict())
    return request(self, "SubmitWithdrawTicketComment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetOrderHistoryByOrderId(self::Ndax, params=Dict(), context=Dict())
    return request(self, "GetOrderHistoryByOrderId"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Ndax(; kwargs...)
    inst = Ndax(Exchange(), describe, fetchStatus, signIn, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseOrderBook, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseOHLCV, fetchOHLCV, parseTrade, fetchTrades, fetchAccounts, parseBalance, fetchBalance, parseLedgerEntryType, parseLedgerEntry, fetchLedger, parseOrderStatus, parseOrder, createOrder, editOrder, fetchMyTrades, cancelAllOrders, cancelOrder, fetchOpenOrders, fetchOrders, fetchOrder, fetchOrderTrades, fetchDepositAddress, parseDepositAddress, createDepositAddress, fetchDeposits, fetchWithdrawals, parseTransactionStatusByType, parseTransaction, withdraw, nonce, sign, handleErrors, publicGetActivate2FA, publicGetAuthenticate2FA, publicGetAuthenticateUser, publicGetEnableXP2FA, publicGetGetL2Snapshot, publicGetGetLevel1, publicGetGetValidate2FARequiredEndpoints, publicGetLogOut, publicGetGetTickerHistory, publicGetGetProduct, publicGetGetProducts, publicGetGetInstrument, publicGetGetInstruments, publicGetGetEarliestTickTime, publicGetPing, publicGetAssets, publicGetOrderbook, publicGetTicker, publicGetSummary, publicGetTrades, publicGetGetLastTrades, publicGetConfirmWithdraw, publicGetSubscribeLevel1, publicGetSubscribeLevel2, publicGetSubscribeTicker, publicGetSubscribeTrades, publicGetSubscribeBlockTrades, publicGetUnsubscribeBlockTrades, publicGetUnsubscribeLevel1, publicGetUnsubscribeLevel2, publicGetUnsubscribeTicker, publicGetUnsubscribeTrades, publicGetAuthenticate, privateGetGetUserAccountInfos, privateGetGetUserAccounts, privateGetGetUserAffiliateCount, privateGetGetUserAffiliateTag, privateGetGetUserConfig, privateGetGetAllUnredactedUserConfigsForUser, privateGetGetUnredactedUserConfigByKey, privateGetGetUserDevices, privateGetGetUserReportTickets, privateGetGetUserReportWriterResultRecords, privateGetGetAccountInfo, privateGetGetAccountPositions, privateGetGetAllAccountConfigs, privateGetGetTreasuryProductsForAccount, privateGetGetAccountTrades, privateGetGetAccountTransactions, privateGetGetOpenTradeReports, privateGetGetAllOpenTradeReports, privateGetGetTradesHistory, privateGetGetOpenOrders, privateGetGetOpenQuotes, privateGetGetOrderFee, privateGetGetOrderHistory, privateGetGetOrdersHistory, privateGetGetOrderStatus, privateGetGetOmsFeeTiers, privateGetGetAccountDepositTransactions, privateGetGetAccountWithdrawTransactions, privateGetGetAllDepositRequestInfoTemplates, privateGetGetDepositInfo, privateGetGetDepositRequestInfoTemplate, privateGetGetDeposits, privateGetGetDepositTicket, privateGetGetDepositTickets, privateGetGetOMSWithdrawFees, privateGetGetWithdrawFee, privateGetGetWithdraws, privateGetGetWithdrawTemplate, privateGetGetWithdrawTemplateTypes, privateGetGetWithdrawTicket, privateGetGetWithdrawTicketAttachment, privateGetGetWithdrawTickets, privateGetGetDepositTicketAttachment, privatePostAddUserAffiliateTag, privatePostAddDepositTicketAttachment, privatePostAddWithdrawTicketAttachment, privatePostCancelUserReport, privatePostRegisterNewDevice, privatePostSubscribeAccountEvents, privatePostUpdateUserAffiliateTag, privatePostGenerateTradeActivityReport, privatePostGenerateTransactionActivityReport, privatePostGenerateTreasuryActivityReport, privatePostScheduleTradeActivityReport, privatePostScheduleTransactionActivityReport, privatePostScheduleTreasuryActivityReport, privatePostCancelAllOrders, privatePostCancelOrder, privatePostCancelQuote, privatePostCancelReplaceOrder, privatePostCreateQuote, privatePostModifyOrder, privatePostSendOrder, privatePostSubmitBlockTrade, privatePostUpdateQuote, privatePostCancelWithdraw, privatePostCreateDepositTicket, privatePostCreateWithdrawTicket, privatePostSubmitDepositTicketComment, privatePostSubmitWithdrawTicketComment, privatePostGetOrderHistoryByOrderId)
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
function __ccxt_doc_Ndax_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://apidoc.ndax.io/#ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Ndax_fetchStatus

function __ccxt_doc_Ndax_signIn() end
"""
sign in, must be called prior to using other authenticated methods
see: https://apidoc.ndax.io/#authenticate2fa

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
__ccxt_doc_Ndax_signIn

function __ccxt_doc_Ndax_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://apidoc.ndax.io/#getproducts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Ndax_fetchCurrencies

function __ccxt_doc_Ndax_fetchMarkets() end
"""
retrieves data on all markets for ndax
see: https://apidoc.ndax.io/#getinstruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Ndax_fetchMarkets

function __ccxt_doc_Ndax_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidoc.ndax.io/#getl2snapshot

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Ndax_fetchOrderBook

function __ccxt_doc_Ndax_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidoc.ndax.io/#cmc-summary

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Ndax_fetchTickers

function __ccxt_doc_Ndax_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidoc.ndax.io/#getlevel1

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Ndax_fetchTicker

function __ccxt_doc_Ndax_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://apidoc.ndax.io/#gettickerhistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Ndax_fetchOHLCV

function __ccxt_doc_Ndax_fetchTrades() end
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
__ccxt_doc_Ndax_fetchTrades

function __ccxt_doc_Ndax_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://apidoc.ndax.io/#getuseraccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Ndax_fetchAccounts

function __ccxt_doc_Ndax_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidoc.ndax.io/#getaccountpositions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Ndax_fetchBalance

function __ccxt_doc_Ndax_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://apidoc.ndax.io/#getaccounttransactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Ndax_fetchLedger

function __ccxt_doc_Ndax_createOrder() end
"""
create a trade order
see: https://apidoc.ndax.io/#sendorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order would be triggered
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_createOrder

function __ccxt_doc_Ndax_editOrder() end
"""
cancels an open order and places a new order
see: https://apidoc.ndax.io/#cancelreplaceorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_editOrder

function __ccxt_doc_Ndax_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://apidoc.ndax.io/#gettradeshistory

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Ndax_fetchMyTrades

function __ccxt_doc_Ndax_cancelAllOrders() end
"""
cancel all open orders
see: https://apidoc.ndax.io/#cancelallorders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_cancelAllOrders

function __ccxt_doc_Ndax_cancelOrder() end
"""
cancels an open order
see: https://apidoc.ndax.io/#cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_cancelOrder

function __ccxt_doc_Ndax_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://apidoc.ndax.io/#getopenorders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_fetchOpenOrders

function __ccxt_doc_Ndax_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://apidoc.ndax.io/#getorderhistory

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_fetchOrders

function __ccxt_doc_Ndax_fetchOrder() end
"""
fetches information on an order made by the user
see: https://apidoc.ndax.io/#getorderstatus

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Ndax_fetchOrder

function __ccxt_doc_Ndax_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://apidoc.ndax.io/#getorderhistorybyorderid

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Ndax_fetchOrderTrades

function __ccxt_doc_Ndax_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Ndax_fetchDepositAddress

function __ccxt_doc_Ndax_createDepositAddress() end
"""
create a currency deposit address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Ndax_createDepositAddress

function __ccxt_doc_Ndax_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://apidoc.ndax.io/#getdeposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: not used by ndax fetchDeposits
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Ndax_fetchDeposits

function __ccxt_doc_Ndax_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://apidoc.ndax.io/#getwithdraws

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Ndax_fetchWithdrawals

function __ccxt_doc_Ndax_withdraw() end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Ndax_withdraw
