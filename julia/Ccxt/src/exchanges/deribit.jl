@kwdef mutable struct Deribit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    safeMarket::Function = safeMarket
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    codeFromOptions::Function = codeFromOptions
    fetchStatus::Function = fetchStatus
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFees::Function = fetchTradingFees
    fetchOrderBook::Function = fetchOrderBook
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parsePosition::Function = parsePosition
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchVolatilityHistory::Function = fetchVolatilityHistory
    parseVolatilityHistory::Function = parseVolatilityHistory
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    withdraw::Function = withdraw
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    fetchLiquidations::Function = fetchLiquidations
    addPaginationCursorToResult::Function = addPaginationCursorToResult
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchGreeks::Function = fetchGreeks
    parseGreeks::Function = parseGreeks
    fetchOption::Function = fetchOption
    fetchOptionChain::Function = fetchOptionChain
    parseOption::Function = parseOption
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetAuth::Function = publicGetAuth
    publicGetExchangeToken::Function = publicGetExchangeToken
    publicGetForkToken::Function = publicGetForkToken
    publicGetSetHeartbeat::Function = publicGetSetHeartbeat
    publicGetDisableHeartbeat::Function = publicGetDisableHeartbeat
    publicGetGetTime::Function = publicGetGetTime
    publicGetHello::Function = publicGetHello
    publicGetStatus::Function = publicGetStatus
    publicGetTest::Function = publicGetTest
    publicGetSubscribe::Function = publicGetSubscribe
    publicGetUnsubscribe::Function = publicGetUnsubscribe
    publicGetUnsubscribeAll::Function = publicGetUnsubscribeAll
    publicGetGetAnnouncements::Function = publicGetGetAnnouncements
    publicGetGetBookSummaryByCurrency::Function = publicGetGetBookSummaryByCurrency
    publicGetGetBookSummaryByInstrument::Function = publicGetGetBookSummaryByInstrument
    publicGetGetContractSize::Function = publicGetGetContractSize
    publicGetGetCurrencies::Function = publicGetGetCurrencies
    publicGetGetDeliveryPrices::Function = publicGetGetDeliveryPrices
    publicGetGetFundingChartData::Function = publicGetGetFundingChartData
    publicGetGetFundingRateHistory::Function = publicGetGetFundingRateHistory
    publicGetGetFundingRateValue::Function = publicGetGetFundingRateValue
    publicGetGetHistoricalVolatility::Function = publicGetGetHistoricalVolatility
    publicGetGetIndex::Function = publicGetGetIndex
    publicGetGetIndexPrice::Function = publicGetGetIndexPrice
    publicGetGetIndexPriceNames::Function = publicGetGetIndexPriceNames
    publicGetGetInstrument::Function = publicGetGetInstrument
    publicGetGetInstruments::Function = publicGetGetInstruments
    publicGetGetLastSettlementsByCurrency::Function = publicGetGetLastSettlementsByCurrency
    publicGetGetLastSettlementsByInstrument::Function = publicGetGetLastSettlementsByInstrument
    publicGetGetLastTradesByCurrency::Function = publicGetGetLastTradesByCurrency
    publicGetGetLastTradesByCurrencyAndTime::Function = publicGetGetLastTradesByCurrencyAndTime
    publicGetGetLastTradesByInstrument::Function = publicGetGetLastTradesByInstrument
    publicGetGetLastTradesByInstrumentAndTime::Function = publicGetGetLastTradesByInstrumentAndTime
    publicGetGetMarkPriceHistory::Function = publicGetGetMarkPriceHistory
    publicGetGetOrderBook::Function = publicGetGetOrderBook
    publicGetGetTradeVolumes::Function = publicGetGetTradeVolumes
    publicGetGetTradingviewChartData::Function = publicGetGetTradingviewChartData
    publicGetGetVolatilityIndexData::Function = publicGetGetVolatilityIndexData
    publicGetTicker::Function = publicGetTicker
    privateGetLogout::Function = privateGetLogout
    privateGetEnableCancelOnDisconnect::Function = privateGetEnableCancelOnDisconnect
    privateGetDisableCancelOnDisconnect::Function = privateGetDisableCancelOnDisconnect
    privateGetGetCancelOnDisconnect::Function = privateGetGetCancelOnDisconnect
    privateGetSubscribe::Function = privateGetSubscribe
    privateGetUnsubscribe::Function = privateGetUnsubscribe
    privateGetUnsubscribeAll::Function = privateGetUnsubscribeAll
    privateGetChangeApiKeyName::Function = privateGetChangeApiKeyName
    privateGetChangeScopeInApiKey::Function = privateGetChangeScopeInApiKey
    privateGetChangeSubaccountName::Function = privateGetChangeSubaccountName
    privateGetCreateApiKey::Function = privateGetCreateApiKey
    privateGetCreateSubaccount::Function = privateGetCreateSubaccount
    privateGetDisableApiKey::Function = privateGetDisableApiKey
    privateGetDisableTfaForSubaccount::Function = privateGetDisableTfaForSubaccount
    privateGetEnableAffiliateProgram::Function = privateGetEnableAffiliateProgram
    privateGetEnableApiKey::Function = privateGetEnableApiKey
    privateGetGetAccessLog::Function = privateGetGetAccessLog
    privateGetGetAccountSummary::Function = privateGetGetAccountSummary
    privateGetGetAccountSummaries::Function = privateGetGetAccountSummaries
    privateGetGetAffiliateProgramInfo::Function = privateGetGetAffiliateProgramInfo
    privateGetGetEmailLanguage::Function = privateGetGetEmailLanguage
    privateGetGetNewAnnouncements::Function = privateGetGetNewAnnouncements
    privateGetGetPortfolioMargins::Function = privateGetGetPortfolioMargins
    privateGetGetPosition::Function = privateGetGetPosition
    privateGetGetPositions::Function = privateGetGetPositions
    privateGetGetSubaccounts::Function = privateGetGetSubaccounts
    privateGetGetSubaccountsDetails::Function = privateGetGetSubaccountsDetails
    privateGetGetTransactionLog::Function = privateGetGetTransactionLog
    privateGetListApiKeys::Function = privateGetListApiKeys
    privateGetRemoveApiKey::Function = privateGetRemoveApiKey
    privateGetRemoveSubaccount::Function = privateGetRemoveSubaccount
    privateGetResetApiKey::Function = privateGetResetApiKey
    privateGetSetAnnouncementAsRead::Function = privateGetSetAnnouncementAsRead
    privateGetSetApiKeyAsDefault::Function = privateGetSetApiKeyAsDefault
    privateGetSetEmailForSubaccount::Function = privateGetSetEmailForSubaccount
    privateGetSetEmailLanguage::Function = privateGetSetEmailLanguage
    privateGetSetPasswordForSubaccount::Function = privateGetSetPasswordForSubaccount
    privateGetToggleNotificationsFromSubaccount::Function = privateGetToggleNotificationsFromSubaccount
    privateGetToggleSubaccountLogin::Function = privateGetToggleSubaccountLogin
    privateGetExecuteBlockTrade::Function = privateGetExecuteBlockTrade
    privateGetGetBlockTrade::Function = privateGetGetBlockTrade
    privateGetGetLastBlockTradesByCurrency::Function = privateGetGetLastBlockTradesByCurrency
    privateGetInvalidateBlockTradeSignature::Function = privateGetInvalidateBlockTradeSignature
    privateGetVerifyBlockTrade::Function = privateGetVerifyBlockTrade
    privateGetBuy::Function = privateGetBuy
    privateGetSell::Function = privateGetSell
    privateGetEdit::Function = privateGetEdit
    privateGetEditByLabel::Function = privateGetEditByLabel
    privateGetCancel::Function = privateGetCancel
    privateGetCancelAll::Function = privateGetCancelAll
    privateGetCancelAllByCurrency::Function = privateGetCancelAllByCurrency
    privateGetCancelAllByInstrument::Function = privateGetCancelAllByInstrument
    privateGetCancelByLabel::Function = privateGetCancelByLabel
    privateGetClosePosition::Function = privateGetClosePosition
    privateGetGetMargins::Function = privateGetGetMargins
    privateGetGetMmpConfig::Function = privateGetGetMmpConfig
    privateGetGetOpenOrdersByCurrency::Function = privateGetGetOpenOrdersByCurrency
    privateGetGetOpenOrdersByInstrument::Function = privateGetGetOpenOrdersByInstrument
    privateGetGetOrderHistoryByCurrency::Function = privateGetGetOrderHistoryByCurrency
    privateGetGetOrderHistoryByInstrument::Function = privateGetGetOrderHistoryByInstrument
    privateGetGetOrderMarginByIds::Function = privateGetGetOrderMarginByIds
    privateGetGetOrderState::Function = privateGetGetOrderState
    privateGetGetStopOrderHistory::Function = privateGetGetStopOrderHistory
    privateGetGetTriggerOrderHistory::Function = privateGetGetTriggerOrderHistory
    privateGetGetUserTradesByCurrency::Function = privateGetGetUserTradesByCurrency
    privateGetGetUserTradesByCurrencyAndTime::Function = privateGetGetUserTradesByCurrencyAndTime
    privateGetGetUserTradesByInstrument::Function = privateGetGetUserTradesByInstrument
    privateGetGetUserTradesByInstrumentAndTime::Function = privateGetGetUserTradesByInstrumentAndTime
    privateGetGetUserTradesByOrder::Function = privateGetGetUserTradesByOrder
    privateGetResetMmp::Function = privateGetResetMmp
    privateGetSetMmpConfig::Function = privateGetSetMmpConfig
    privateGetGetSettlementHistoryByInstrument::Function = privateGetGetSettlementHistoryByInstrument
    privateGetGetSettlementHistoryByCurrency::Function = privateGetGetSettlementHistoryByCurrency
    privateGetCancelTransferById::Function = privateGetCancelTransferById
    privateGetCancelWithdrawal::Function = privateGetCancelWithdrawal
    privateGetCreateDepositAddress::Function = privateGetCreateDepositAddress
    privateGetGetCurrentDepositAddress::Function = privateGetGetCurrentDepositAddress
    privateGetGetDeposits::Function = privateGetGetDeposits
    privateGetGetTransfers::Function = privateGetGetTransfers
    privateGetGetWithdrawals::Function = privateGetGetWithdrawals
    privateGetSubmitTransferToSubaccount::Function = privateGetSubmitTransferToSubaccount
    privateGetSubmitTransferToUser::Function = privateGetSubmitTransferToUser
    privateGetWithdraw::Function = privateGetWithdraw

end
function describe(self::Deribit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "deribit",
    Symbol("name") => "Deribit",
    Symbol("countries") => ["NL"],
    Symbol("version") => "v2",
    Symbol("userAgent") => nothing,
    Symbol("rateLimit") => 50,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => true,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => true,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("sandbox") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("3m") => "3",
        Symbol("5m") => "5",
        Symbol("10m") => "10",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("1h") => "60",
        Symbol("2h") => "120",
        Symbol("3h") => "180",
        Symbol("6h") => "360",
        Symbol("12h") => "720",
        Symbol("1d") => "1D"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://test.deribit.com"
        ),
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://www.deribit.com"
        ),
        Symbol("www") => "https://www.deribit.com",
        Symbol("doc") => ["https://docs.deribit.com/v2", "https://github.com/deribit"],
        Symbol("fees") => "https://www.deribit.com/pages/information/fees",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.deribit.com/reg-1189.4038",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("auth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchange_token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fork_token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("disable_heartbeat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hello") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unsubscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unsubscribe_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_book_summary_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_book_summary_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_contract_size") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_delivery_prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_funding_chart_data") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_funding_rate_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_funding_rate_value") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_historical_volatility") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_index_price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_index_price_names") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_settlements_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_settlements_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_trades_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_trades_by_currency_and_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_trades_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_trades_by_instrument_and_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_mark_price_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_trade_volumes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_tradingview_chart_data") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_volatility_index_data") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("logout") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("enable_cancel_on_disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("disable_cancel_on_disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_cancel_on_disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unsubscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unsubscribe_all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("change_api_key_name") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("change_scope_in_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("change_subaccount_name") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("create_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("create_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("disable_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("disable_tfa_for_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("enable_affiliate_program") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("enable_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_access_log") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_account_summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_account_summaries") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_affiliate_program_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_email_language") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_new_announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_portfolio_margins") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_subaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_subaccounts_details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_transaction_log") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("list_api_keys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("remove_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("remove_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reset_api_key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_announcement_as_read") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_api_key_as_default") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_email_for_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_email_language") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_password_for_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("toggle_notifications_from_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("toggle_subaccount_login") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("execute_block_trade") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("get_block_trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_last_block_trades_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("invalidate_block_trade_signature") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("verify_block_trade") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("buy") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("sell") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("edit") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("edit_by_label") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancel_all_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancel_all_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancel_by_label") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("close_position") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("get_margins") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_mmp_config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_open_orders_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_open_orders_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_history_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_history_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_margin_by_ids") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_order_state") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_stop_order_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_trigger_order_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_user_trades_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_user_trades_by_currency_and_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_user_trades_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_user_trades_by_instrument_and_time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_user_trades_by_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("reset_mmp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("set_mmp_config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_settlement_history_by_instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_settlement_history_by_currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel_transfer_by_id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel_withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("create_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_current_deposit_address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("submit_transfer_to_subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("submit_transfer_to_user") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
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
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("9999") => PermissionDenied,
        Symbol("10000") => AuthenticationError,
        Symbol("10001") => ExchangeError,
        Symbol("10002") => InvalidOrder,
        Symbol("10003") => InvalidOrder,
        Symbol("10004") => OrderNotFound,
        Symbol("10005") => InvalidOrder,
        Symbol("10006") => InvalidOrder,
        Symbol("10007") => InvalidOrder,
        Symbol("10008") => InvalidOrder,
        Symbol("10009") => InsufficientFunds,
        Symbol("10010") => OrderNotFound,
        Symbol("10011") => InvalidOrder,
        Symbol("10012") => InvalidOrder,
        Symbol("10013") => PermissionDenied,
        Symbol("10014") => PermissionDenied,
        Symbol("10015") => PermissionDenied,
        Symbol("10016") => PermissionDenied,
        Symbol("10017") => PermissionDenied,
        Symbol("10018") => PermissionDenied,
        Symbol("10019") => PermissionDenied,
        Symbol("10020") => ExchangeError,
        Symbol("10021") => InvalidOrder,
        Symbol("10022") => InvalidOrder,
        Symbol("10023") => InvalidOrder,
        Symbol("10024") => InvalidOrder,
        Symbol("10025") => InvalidOrder,
        Symbol("10026") => InvalidOrder,
        Symbol("10027") => InvalidOrder,
        Symbol("10028") => DDoSProtection,
        Symbol("10029") => OrderNotFound,
        Symbol("10030") => ExchangeError,
        Symbol("10031") => ExchangeError,
        Symbol("10032") => InvalidOrder,
        Symbol("10033") => NotSupported,
        Symbol("10034") => InvalidOrder,
        Symbol("10035") => InvalidOrder,
        Symbol("10036") => InvalidOrder,
        Symbol("10040") => ExchangeNotAvailable,
        Symbol("10041") => OnMaintenance,
        Symbol("10043") => InvalidOrder,
        Symbol("10044") => InvalidOrder,
        Symbol("10045") => InvalidOrder,
        Symbol("10046") => InvalidOrder,
        Symbol("10047") => DDoSProtection,
        Symbol("10048") => ExchangeError,
        Symbol("11008") => InvalidOrder,
        Symbol("11029") => BadRequest,
        Symbol("11030") => ExchangeError,
        Symbol("11031") => ExchangeError,
        Symbol("11035") => DDoSProtection,
        Symbol("11036") => InvalidOrder,
        Symbol("11037") => BadRequest,
        Symbol("11038") => InvalidOrder,
        Symbol("11039") => InvalidOrder,
        Symbol("11041") => InvalidOrder,
        Symbol("11042") => PermissionDenied,
        Symbol("11043") => BadRequest,
        Symbol("11044") => InvalidOrder,
        Symbol("11045") => BadRequest,
        Symbol("11046") => BadRequest,
        Symbol("11047") => BadRequest,
        Symbol("11048") => ExchangeError,
        Symbol("11049") => BadRequest,
        Symbol("11050") => BadRequest,
        Symbol("11051") => OnMaintenance,
        Symbol("11052") => ExchangeError,
        Symbol("11053") => ExchangeError,
        Symbol("11090") => InvalidAddress,
        Symbol("11091") => InvalidAddress,
        Symbol("11092") => InvalidAddress,
        Symbol("11093") => DDoSProtection,
        Symbol("11094") => ExchangeError,
        Symbol("11095") => ExchangeError,
        Symbol("11096") => ExchangeError,
        Symbol("12000") => AuthenticationError,
        Symbol("12001") => DDoSProtection,
        Symbol("12002") => ExchangeError,
        Symbol("12998") => AuthenticationError,
        Symbol("12003") => AuthenticationError,
        Symbol("12004") => AuthenticationError,
        Symbol("12005") => AuthenticationError,
        Symbol("12100") => ExchangeError,
        Symbol("12999") => AuthenticationError,
        Symbol("13000") => AuthenticationError,
        Symbol("13001") => AuthenticationError,
        Symbol("13002") => PermissionDenied,
        Symbol("13003") => AuthenticationError,
        Symbol("13004") => AuthenticationError,
        Symbol("13005") => AuthenticationError,
        Symbol("13006") => AuthenticationError,
        Symbol("13007") => AuthenticationError,
        Symbol("13008") => ExchangeError,
        Symbol("13009") => AuthenticationError,
        Symbol("13010") => BadRequest,
        Symbol("13011") => BadRequest,
        Symbol("13012") => PermissionDenied,
        Symbol("13013") => BadRequest,
        Symbol("13014") => BadRequest,
        Symbol("13015") => BadRequest,
        Symbol("13016") => BadRequest,
        Symbol("13017") => ExchangeError,
        Symbol("13018") => ExchangeError,
        Symbol("13019") => ExchangeError,
        Symbol("13020") => ExchangeError,
        Symbol("13021") => PermissionDenied,
        Symbol("13025") => ExchangeError,
        Symbol("-32602") => BadRequest,
        Symbol("-32601") => BadRequest,
        Symbol("-32700") => BadRequest,
        Symbol("-32000") => BadRequest,
        Symbol("11054") => InvalidOrder
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("code") => "BTC",
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("code") => "BTC"
        ),
        Symbol("transfer") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetSubmitTransferToSubaccount"
        )
    )
))

end
function createExpiredOptionMarket(self::Deribit, symbol)
    quote_var = "USD";
    settle = nothing;
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    base = nothing;
    expiry = nothing;
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
        expiry = safeString(optionParts, 1);
        if functions.ccxtruthy(findfirst("USDC", symbol) !== nothing)
            base = string(base, "_USDC");
        end
    else
        base = safeString(optionParts, 0);
        expiry = self.convertMarketIdExpireDate(safeString(optionParts, 1));
    end
    if functions.ccxtruthy(findfirst("USDC", symbol) !== nothing)
        quote_var = "USDC";
        settle = "USDC";
    else
        settle = base;
    end
    splitBase = base;
    if functions.ccxtruthy(base == nothing)
        throw(ExchangeError(string(self.id, " createExpiredOptionMarket() missing base")));
    end
    if functions.ccxtruthy(findfirst("_", base) !== nothing)
        splitSymbol = split(base, "_");
        splitBase = safeString(splitSymbol, 0);
    end
    strike = safeString(optionParts, 2);
    optionType = safeString(optionParts, 3);
    datetime = self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    id = string(base, "-", self.convertExpireDateToMarketIdDate(expiry), "-", strike, "-", optionType);
    symbolExpired = string(splitBase, "/", quote_var, ":", settle, "-", expiry, "-", strike, "-", optionType);
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbolExpired,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => quote_var,
    Symbol("settleId") => settle,
    Symbol("active") => false,
    Symbol("type") => "option",
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("spot") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("margin") => false,
    Symbol("contract") => true,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => timestamp,
    Symbol("expiryDatetime") => datetime,
    Symbol("optionType") => functions.ccxtruthy((optionType == "C")) ? "call" : "put",
    Symbol("strike") => self.parseNumber(strike),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => nothing,
        Symbol("price") => nothing
    ),
    Symbol("limits") => Dict{Symbol, Any}(
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
    Symbol("info") => nothing
)

end
function safeMarket(self::Deribit; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or((endswith(marketId, "-C")), (endswith(marketId, "-P")))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, (@functions.ccxt_or((self.markets_by_id == nothing), !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId = marketId, market = market, delimiter = delimiter, marketType = marketType)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.deribit.com/#public-get_time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Deribit; params=Dict())
    response = Base.fetch(self.publicGetGetTime(params));
    return safeInteger(response, "result")

end
"""
fetches all available currencies on an exchange
see: https://docs.deribit.com/#public-get_currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Deribit; params=Dict())
    response = Base.fetch(self.publicGetGetCurrencies(params));
    data = self.safeList(response, "result", defaultValue = []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Deribit, rawCurrency)
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => safeString(rawCurrency, "currency_long"),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("type") => "crypto",
    Symbol("fee") => self.safeNumber(rawCurrency, "withdrawal_fee"),
    Symbol("precision") => nothing,
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
    Symbol("networks") => nothing
))

end
function codeFromOptions(self::Deribit, methodName; params=Dict())
    defaultCode = safeValue(self.options, "code", "BTC");
    options = safeValue(self.options, methodName, Dict{Symbol, Any}());
    code = safeValue(options, "code", defaultCode);
    return safeValue(params, "code", code)

end
"""
the latest known information on the availability of the exchange API
see: https://docs.deribit.com/#public-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Deribit; params=Dict())
    response = Base.fetch(self.publicGetStatus(params));
    result = safeValue(response, "result");
    locked = safeString(result, "locked");
    updateTime = safeIntegerProduct(response, "usIn", 0.001, milliseconds());
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((locked == "false")) ? "ok" : "maintenance",
    Symbol("updated") => updateTime,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetch all the accounts associated with a profile
see: https://docs.deribit.com/#private-get_subaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Deribit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetGetSubaccounts(params));
    result = safeValue(response, "result", []);
    return self.parseAccounts(result)

end
function parseAccount(self::Deribit, account)
    return Dict{Symbol, Any}(
    Symbol("info") => account,
    Symbol("id") => safeString(account, "id"),
    Symbol("type") => safeString(account, "type"),
    Symbol("code") => nothing
)

end
"""
retrieves data on all markets for deribit
see: https://docs.deribit.com/#public-get_currencies
see: https://docs.deribit.com/#public-get_instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Deribit; params=Dict())
    instrumentsResponses = [];
    result = [];
    parsedMarkets = Dict{Symbol, Any}();
    fetchAllMarkets = nothing;
    (fetchAllMarkets, params) = self.handleOptionAndParams(params, "fetchMarkets", "fetchAllMarkets", defaultValue = true);
    if functions.ccxtruthy(fetchAllMarkets)
        instrumentsResponse = Base.fetch(self.publicGetGetInstruments(params));
                push!(instrumentsResponses, instrumentsResponse);
    else
        currenciesResponse = Base.fetch(self.publicGetGetCurrencies(params));
        currenciesResult = safeValue(currenciesResponse, "result", []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currenciesResult)))
            currencyId = safeString(get(currenciesResult, i + 1, nothing), "currency");
            request = Dict{Symbol, Any}(
                Symbol("currency") => currencyId
            );
            instrumentsResponse = Base.fetch(self.publicGetGetInstruments(extend(request, params)));
            push!(instrumentsResponses, instrumentsResponse);
            i += 1
        end
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(instrumentsResponses)))
        instrumentsResult = safeValue(get(instrumentsResponses, i + 1, nothing), "result", []);
        k = 0
        while functions.ccxtruthy(functions.ccxt_lt(k, length(instrumentsResult)))
            market = get(instrumentsResult, k + 1, nothing);
            kind = safeString(market, "kind");
            isSpot = (kind == "spot");
            id = safeString(market, "instrument_name");
            baseId = safeString(market, "base_currency");
            quoteId = safeString(market, "counter_currency");
            settleId = safeString(market, "settlement_currency");
            base = self.safeCurrencyCode(baseId);
            quote_var = self.safeCurrencyCode(quoteId);
            settle = self.safeCurrencyCode(settleId);
            settlementPeriod = safeValue(market, "settlement_period");
            swap = (settlementPeriod == "perpetual");
            if functions.ccxtruthy(kind == nothing)
                throw(ExchangeError(string(self.id, " method() missing kind")));
            end
            future = @functions.ccxt_and(!functions.ccxtruthy(swap), (findfirst("future", kind) !== nothing));
            if functions.ccxtruthy(kind == nothing)
                throw(ExchangeError(string(self.id, " method() missing kind")));
            end
            option = (findfirst("option", kind) !== nothing);
            if functions.ccxtruthy(kind == nothing)
                throw(ExchangeError(string(self.id, " method() missing kind")));
            end
            isComboMarket = findfirst("combo", kind) !== nothing;
            expiry = safeInteger(market, "expiration_timestamp");
            strike = nothing;
            optionType = nothing;
            symbol = id;
            type_var = "swap";
            if functions.ccxtruthy(future)
                type_var = "future";
            elseif functions.ccxtruthy(option)
                type_var = "option";
            else
                if functions.ccxtruthy(isSpot)
                    type_var = "spot";
                end

            end
            inverse = nothing;
            linear = nothing;
            if functions.ccxtruthy(isSpot)
                symbol = string(base, "/", quote_var);
            elseif functions.ccxtruthy(!functions.ccxtruthy(isComboMarket))
                symbol = string(base, "/", quote_var, ":", settle);
                if functions.ccxtruthy(@functions.ccxt_or(option, future))
                    symbol = string(symbol, "-", self.yymmdd(expiry, ""));
                    if functions.ccxtruthy(option)
                        strike = self.safeNumber(market, "strike");
                        optionType = safeString(market, "option_type");
                        letter = functions.ccxtruthy((optionType == "call")) ? "C" : "P";
                        symbol = string(symbol, "-", numberToString(strike), "-", letter);
                    end
                end
                inverse = (quote_var != settle);
                linear = (settle == quote_var);
            end
            parsedMarketValue = safeValue(parsedMarkets, symbol);
            if functions.ccxtruthy(parsedMarketValue)
                k += 1; continue
            end
            if functions.ccxtruthy(symbol != nothing)
                parsedMarkets[Symbol(symbol)] = true;
            end
            minTradeAmount = self.safeNumber(market, "min_trade_amount");
            tickSize = self.safeNumber(market, "tick_size");
            push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("active") => safeValue(market, "is_active"),
    Symbol("contract") => !functions.ccxtruthy(isSpot),
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "taker_commission"),
    Symbol("maker") => self.safeNumber(market, "maker_commission"),
    Symbol("contractSize") => self.safeNumber(market, "contract_size"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => strike,
    Symbol("optionType") => optionType,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => minTradeAmount,
        Symbol("price") => tickSize
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minTradeAmount,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => tickSize,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "creation_timestamp"),
    Symbol("info") => market
));
            k += 1
        end
        i += 1
    end
    return result

end
function parseBalance(self::Deribit, balance)
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    summaries = [];
    if functions.ccxtruthy(ccxt_in("summaries", balance))
        summaries = self.safeList(balance, "summaries", defaultValue = []);
    else
        summaries = [balance];
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(summaries)))
        data = get(summaries, i + 1, nothing);
        currencyId = safeString(data, "currency");
        currencyCode = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(data, "available_funds");
        account[Symbol("used")] = safeString(data, "maintenance_margin");
        account[Symbol("total")] = safeString(data, "equity");
        if functions.ccxtruthy(currencyCode != nothing)
            result[Symbol(currencyCode)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.deribit.com/#private-get_account_summary
see: https://docs.deribit.com/#private-get_account_summaries

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string, optional: unified currency code of the currency for the balance, if defined 'privateGetGetAccountSummary' will be used, otherwise 'privateGetGetAccountSummaries' will be used

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Deribit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeString(params, "code");
    params = omit(params, "code");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        request[Symbol("currency")] = self.currencyId(code);
    end
    response = nothing;
    if functions.ccxtruthy(code == nothing)
        response = Base.fetch(self.privateGetGetAccountSummaries(params));
    else
        response = Base.fetch(self.privateGetGetAccountSummary(extend(request, params)));
    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseBalance(result)

end
"""
create a currency deposit address
see: https://docs.deribit.com/#private-create_deposit_address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Deribit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetCreateDepositAddress(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    address = safeString(result, "address");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => nothing,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.deribit.com/#private-get_current_deposit_address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Deribit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetGetCurrentDepositAddress(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    address = safeString(result, "address");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function parseTicker(self::Deribit, ticker; market=nothing)
    timestamp = safeInteger2(ticker, "timestamp", "creation_timestamp");
    marketId = safeString(ticker, "instrument_name");
    symbol = self.safeSymbol(marketId, market = market);
    last_var = safeString2(ticker, "last_price", "last");
    stats = safeValue(ticker, "stats", ticker);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(stats, "high", "max_price"),
    Symbol("low") => safeString2(stats, "low", "min_price"),
    Symbol("bid") => safeString2(ticker, "best_bid_price", "bid_price"),
    Symbol("bidVolume") => safeString(ticker, "best_bid_amount"),
    Symbol("ask") => safeString2(ticker, "best_ask_price", "ask_price"),
    Symbol("askVolume") => safeString(ticker, "best_ask_amount"),
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => safeString(stats, "volume"),
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.deribit.com/#public-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(result, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.deribit.com/#public-get_book_summary_by_currency

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string, optional: *required* the currency code to fetch the tickers for, eg. 'BTC', 'ETH'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Deribit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    code = safeString2(params, "code", "currency");
    type_var = nothing;
    params = omit(params, ["code"]);
    if functions.ccxtruthy(symbols != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            market = self.market(get(symbols, i + 1, nothing));
            if functions.ccxtruthy(@functions.ccxt_and(code != nothing, code != get(market, Symbol("base"), nothing)))
                throw(BadRequest(string(self.id, " fetchTickers the base currency must be the same for all symbols, this endpoint only supports one base currency at a time. Read more about it here: https://docs.deribit.com/#public-get_book_summary_by_currency")));
            end
            if functions.ccxtruthy(code == nothing)
                code = get(market, Symbol("base"), nothing);
                type_var = get(market, Symbol("type"), nothing);
            end
            i += 1
        end

    end
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTickers requires a currency/code (eg: BTC/ETH/USDT) parameter to fetch tickers for")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var != nothing)
        requestType = nothing;
        if functions.ccxtruthy(type_var == "spot")
            requestType = "spot";
        elseif functions.ccxtruthy(@functions.ccxt_or(type_var == "future", (type_var == "contract")))
            requestType = "future";
        else
            if functions.ccxtruthy(type_var == "option")
                requestType = "option";
            end

        end
        if functions.ccxtruthy(requestType != nothing)
            request[Symbol("kind")] = requestType;
        end
    end
    response = Base.fetch(self.publicGetGetBookSummaryByCurrency(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    tickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        ticker = self.parseTicker(get(result, i + 1, nothing));
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            tickers[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.deribit.com/#public-get_tradingview_chart_data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: whether to paginate the results, set to false by default
- `params.until`::int, optional: the latest time in ms to fetch ohlcv for

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Deribit, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 5000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe);
    now = milliseconds();
    if functions.ccxtruthy(since == nothing)
        if functions.ccxtruthy(limit == nothing)
            limit = 1000;
        end
        request[Symbol("start_timestamp")] = now - (limit - 1) * duration * 1000;
        request[Symbol("end_timestamp")] = now;
    else
        since = max(since - 1, 0);
        request[Symbol("start_timestamp")] = since;
        if functions.ccxtruthy(limit == nothing)
            request[Symbol("end_timestamp")] = now;
        else
            request[Symbol("end_timestamp")] = self.sum(since, limit * duration * 1000);
        end
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("end_timestamp")] = until;
    end
    response = Base.fetch(self.publicGetGetTradingviewChartData(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    ohlcvs = self.convertTradingViewToOHLCV(result, timestamp = "ticks", open = "open", high = "high", low = "low", close = "close", volume = "volume", ms = true);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseTrade(self::Deribit, trade; market=nothing)
    id = safeString(trade, "trade_id");
    marketId = safeString(trade, "instrument_name");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = safeInteger(trade, "timestamp");
    side = safeString(trade, "direction");
    priceString = safeString(trade, "price");
    market = self.safeMarket(marketId = marketId, market = market);
    amount = safeString(trade, "amount");
    cost = stringMul(amount, priceString);
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        cost = stringDiv(amount, priceString);
    end
    liquidity = safeString(trade, "liquidity");
    takerOrMaker = nothing;
    if functions.ccxtruthy(liquidity != nothing)
        takerOrMaker = functions.ccxtruthy((liquidity == "M")) ? "maker" : "taker";
    end
    feeCostString = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "fee_currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("type") => safeString(trade, "order_type"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol.
see: https://docs.deribit.com/#public-get_last_trades_by_instrument
see: https://docs.deribit.com/#public-get_last_trades_by_instrument_and_time

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Deribit, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("include_old") => true
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = min(limit, 1000);
    end
    until = safeInteger2(params, "until", "end_timestamp");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_timestamp")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((since == nothing), !functions.ccxtruthy((ccxt_in("end_timestamp", request)))))
        response = Base.fetch(self.publicGetGetLastTradesByInstrument(extend(request, params)));
    else
        response = Base.fetch(self.publicGetGetLastTradesByInstrumentAndTime(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    trades = self.safeList(result, "trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for multiple markets
see: https://docs.deribit.com/#private-get_account_summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Deribit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = self.codeFromOptions("fetchTradingFees", params = params);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("extended") => true
    );
    response = Base.fetch(self.privateGetGetAccountSummary(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    fees = safeValue(result, "fees", []);
    perpetualFee = Dict{Symbol, Any}();
    futureFee = Dict{Symbol, Any}();
    optionFee = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = get(fees, i + 1, nothing);
        instrumentType = safeString(fee, "instrument_type");
        if functions.ccxtruthy(instrumentType == "future")
            futureFee = Dict{Symbol, Any}(
                Symbol("info") => fee,
                Symbol("maker") => self.safeNumber(fee, "maker_fee"),
                Symbol("taker") => self.safeNumber(fee, "taker_fee")
            );
        elseif functions.ccxtruthy(instrumentType == "perpetual")
            perpetualFee = Dict{Symbol, Any}(
                Symbol("info") => fee,
                Symbol("maker") => self.safeNumber(fee, "maker_fee"),
                Symbol("taker") => self.safeNumber(fee, "taker_fee")
            );
        else
            if functions.ccxtruthy(instrumentType == "option")
                optionFee = Dict{Symbol, Any}(
                    Symbol("info") => fee,
                    Symbol("maker") => self.safeNumber(fee, "maker_fee"),
                    Symbol("taker") => self.safeNumber(fee, "taker_fee")
                );
            end

        end
        i += 1
    end
    parsedFees = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = Dict{Symbol, Any}(
            Symbol("info") => market,
            Symbol("symbol") => symbol,
            Symbol("percentage") => true,
            Symbol("tierBased") => true,
            Symbol("maker") => get(market, Symbol("maker"), nothing),
            Symbol("taker") => get(market, Symbol("taker"), nothing)
        );
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            fee = extend(fee, perpetualFee);
        elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
            fee = extend(fee, futureFee);
        else
            if functions.ccxtruthy(get(market, Symbol("option"), nothing))
                fee = extend(fee, optionFee);
            end

        end
        parsedFees[Symbol(symbol)] = fee;
        i += 1
    end
    return parsedFees

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.deribit.com/#public-get_order_book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Deribit, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetGetOrderBook(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    timestamp = safeInteger(result, "timestamp");
    nonce = safeInteger(result, "change_id");
    orderbook = self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), timestamp = timestamp);
    orderbook[Symbol("nonce")] = nonce;
    return orderbook

end
function parseOrderStatus(self::Deribit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("cancelled") => "canceled",
        Symbol("filled") => "closed",
        Symbol("rejected") => "rejected",
        Symbol("untriggered") => "open"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Deribit, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("good_til_cancelled") => "GTC",
        Symbol("fill_or_kill") => "FOK",
        Symbol("immediate_or_cancel") => "IOC"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrderType(self::Deribit, orderType)
    orderTypes = Dict{Symbol, Any}(
        Symbol("stop_limit") => "limit",
        Symbol("take_limit") => "limit",
        Symbol("stop_market") => "market",
        Symbol("take_market") => "market"
    );
    return safeString(orderTypes, orderType, orderType)

end
function parseOrder(self::Deribit, order; market=nothing)
    marketId = safeString(order, "instrument_name");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(order, "creation_timestamp");
    lastUpdate = safeInteger(order, "last_update_timestamp");
    id = safeString(order, "order_id");
    priceString = safeString(order, "price");
    if functions.ccxtruthy(priceString == "market_price")
        priceString = nothing;
    end
    averageString = safeString(order, "average_price");
    filledString = safeString(order, "filled_amount");
    amount = safeString(order, "amount");
    cost = stringMul(filledString, averageString);
    if functions.ccxtruthy(self.safeBool(market, "inverse"))
        if functions.ccxtruthy(averageString != "0")
            cost = stringDiv(amount, averageString);
        end
    end
    lastTradeTimestamp = nothing;
    if functions.ccxtruthy(filledString != nothing)
        isFilledPositive = stringGt(filledString, "0");
        if functions.ccxtruthy(isFilledPositive)
            lastTradeTimestamp = lastUpdate;
        end
    end
    status = self.parseOrderStatus(safeString(order, "order_state"));
    side = safeStringLower(order, "direction");
    feeCostString = safeString(order, "commission");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostString = stringAbs(feeCostString);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => get(market, Symbol("base"), nothing)
        );
    end
    rawType = safeString(order, "order_type");
    type_var = self.parseOrderType(rawType);
    trades = safeValue(order, "trades");
    timeInForce = self.parseTimeInForce(safeString(order, "time_in_force"));
    postOnly = safeValue(order, "post_only");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("triggerPrice") => safeValue(order, "stop_price"),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => averageString,
    Symbol("filled") => filledString,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => trades
), market = market)

end
"""
fetches information on an order made by the user
see: https://docs.deribit.com/#private-get_order_state

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Deribit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetGetOrderState(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
"""
create a trade order
see: https://docs.deribit.com/#private-buy
see: https://docs.deribit.com/#private-sell

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::string, optional: the trigger type 'index_price', 'mark_price', or 'last_price', default is 'last_price'
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Deribit, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("type") => type_var
    );
    trigger = safeString(params, "trigger", "last_price");
    timeInForce = safeStringUpper(params, "timeInForce");
    reduceOnly = safeValue2(params, "reduceOnly", "reduce_only");
    stopLossPrice = safeValue(params, "stopLossPrice");
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    trailingAmount = safeString2(params, "trailingAmount", "trigger_offset");
    isTrailingAmountOrder = trailingAmount != nothing;
    isStopLimit = type_var == "stop_limit";
    isStopMarket = type_var == "stop_market";
    isTakeLimit = type_var == "take_limit";
    isTakeMarket = type_var == "take_market";
    isStopLossOrder = @functions.ccxt_or(@functions.ccxt_or(isStopLimit, isStopMarket), (stopLossPrice != nothing));
    isTakeProfitOrder = @functions.ccxt_or(@functions.ccxt_or(isTakeLimit, isTakeMarket), (takeProfitPrice != nothing));
    if functions.ccxtruthy(@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder))
        throw(InvalidOrder(string(self.id, " createOrder () only allows one of stopLossPrice or takeProfitPrice to be specified")));
    end
    isStopOrder = @functions.ccxt_or(isStopLossOrder, isTakeProfitOrder);
    isLimitOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "limit"), isStopLimit), isTakeLimit);
    isMarketOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "market"), isStopMarket), isTakeMarket);
    exchangeSpecificPostOnly = safeValue(params, "post_only");
    postOnly = self.isPostOnly(isMarketOrder, exchangeSpecificPostOnly, params = params);
    if functions.ccxtruthy(isLimitOrder)
        request[Symbol("type")] = "limit";
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    else
        request[Symbol("type")] = "market";
    end
    if functions.ccxtruthy(isTrailingAmountOrder)
        request[Symbol("trigger")] = trigger;
        request[Symbol("type")] = "trailing_stop";
        request[Symbol("trigger_offset")] = self.parseToNumeric(trailingAmount);
    elseif functions.ccxtruthy(isStopOrder)
        triggerPrice = functions.ccxtruthy((stopLossPrice != nothing)) ? stopLossPrice : takeProfitPrice;
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("trigger")] = trigger;
        if functions.ccxtruthy(isStopLossOrder)
            if functions.ccxtruthy(isMarketOrder)
                request[Symbol("type")] = "stop_market";
            else
                request[Symbol("type")] = "stop_limit";
            end
        else
            if functions.ccxtruthy(isMarketOrder)
                request[Symbol("type")] = "take_market";
            else
                request[Symbol("type")] = "take_limit";
            end
        end
    end
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduce_only")] = true;
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("post_only")] = true;
        request[Symbol("reject_post_only")] = true;
    end
    if functions.ccxtruthy(timeInForce != nothing)
        if functions.ccxtruthy(timeInForce == "GTC")
            request[Symbol("time_in_force")] = "good_til_cancelled";
        end
        if functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("time_in_force")] = "immediate_or_cancel";
        end
        if functions.ccxtruthy(timeInForce == "FOK")
            request[Symbol("time_in_force")] = "fill_or_kill";
        end
    end
    params = omit(params, ["timeInForce", "stopLossPrice", "takeProfitPrice", "postOnly", "reduceOnly", "trailingAmount"]);
    response = nothing;
    if functions.ccxtruthy(capitalize(side) == "Buy")
        response = Base.fetch(self.privateGetBuy(extend(request, params)));
    else
        response = Base.fetch(self.privateGetSell(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    order = safeValue(result, "order");
    trades = safeValue(result, "trades", []);
    order[Symbol("trades")] = trades;
    return self.parseOrder(order, market = market)

end
"""
edit a trade order
see: https://docs.deribit.com/#private-edit

# Arguments
- `id`::string: edit order id
- `symbol`::string, optional: unified symbol of the market to edit an order in
- `type`::string, optional: 'market' or 'limit'
- `side`::string, optional: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Deribit, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("amount") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    trailingAmount = safeString2(params, "trailingAmount", "trigger_offset");
    isTrailingAmountOrder = trailingAmount != nothing;
    if functions.ccxtruthy(isTrailingAmountOrder)
        request[Symbol("trigger_offset")] = self.parseToNumeric(trailingAmount);
        params = omit(params, "trigger_offset");
    end
    response = Base.fetch(self.privateGetEdit(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    order = safeValue(result, "order");
    trades = safeValue(result, "trades", []);
    order[Symbol("trades")] = trades;
    return self.parseOrder(order)

end
"""
cancels an open order
see: https://docs.deribit.com/#private-cancel

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Deribit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetCancel(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result)

end
"""
cancel all open orders
see: https://docs.deribit.com/#private-cancel_all
see: https://docs.deribit.com/#private-cancel_all_by_instrument

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Deribit; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(symbol == nothing)
        response = Base.fetch(self.privateGetCancelAll(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetCancelAllByInstrument(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
fetch all unfilled currently open orders
see: https://docs.deribit.com/#private-get_open_orders_by_currency
see: https://docs.deribit.com/#private-get_open_orders_by_instrument

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Deribit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    response = nothing;
    if functions.ccxtruthy(symbol == nothing)
        code = self.codeFromOptions("fetchOpenOrders", params = params);
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetGetOpenOrdersByCurrency(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetGetOpenOrdersByInstrument(extend(request, params)));
    end
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.deribit.com/#private-get_order_history_by_currency
see: https://docs.deribit.com/#private-get_order_history_by_instrument

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Deribit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    response = nothing;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    else
        request[Symbol("count")] = 1000;
    end
    if functions.ccxtruthy(symbol == nothing)
        code = self.codeFromOptions("fetchClosedOrders", params = params);
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetGetOrderHistoryByCurrency(extend(request, params)));
    else
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetGetOrderHistoryByInstrument(extend(request, params)));
    end
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://docs.deribit.com/#private-get_user_trades_by_order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Deribit, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetGetUserTradesByOrder(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseTrades(result, market = nothing, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://docs.deribit.com/#private-get_user_trades_by_currency
see: https://docs.deribit.com/#private-get_user_trades_by_currency_and_time
see: https://docs.deribit.com/#private-get_user_trades_by_instrument
see: https://docs.deribit.com/#private-get_user_trades_by_instrument_and_time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Deribit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("include_old") => true
    );
    market = nothing;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(symbol == nothing)
        code = self.codeFromOptions("fetchMyTrades", params = params);
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        if functions.ccxtruthy(since == nothing)
            response = Base.fetch(self.privateGetGetUserTradesByCurrency(extend(request, params)));
        else
            request[Symbol("start_timestamp")] = since;
            response = Base.fetch(self.privateGetGetUserTradesByCurrencyAndTime(extend(request, params)));
        end
    else
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(since == nothing)
            response = Base.fetch(self.privateGetGetUserTradesByInstrument(extend(request, params)));
        else
            request[Symbol("start_timestamp")] = since;
            response = Base.fetch(self.privateGetGetUserTradesByInstrumentAndTime(extend(request, params)));
        end
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    trades = self.safeList(result, "trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch all deposits made to an account
see: https://docs.deribit.com/#private-get_deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Deribit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDeposits() requires a currency code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetDeposits(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch all withdrawals made from an account
see: https://docs.deribit.com/#private-get_withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Deribit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchWithdrawals() requires a currency code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetWithdrawals(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit, params = params)

end
function parseTransactionStatus(self::Deribit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("completed") => "ok",
        Symbol("unconfirmed") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Deribit, transaction; currency=nothing)
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger2(transaction, "created_timestamp", "received_timestamp");
    updated = safeInteger(transaction, "updated_timestamp");
    status = self.parseTransactionStatus(safeString(transaction, "state"));
    address = safeString(transaction, "address");
    feeCost = self.safeNumber(transaction, "fee");
    type_var = "deposit";
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        type_var = "withdrawal";
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "transaction_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("network") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parsePosition(self::Deribit, position; market=nothing)
    contract = safeString(position, "instrument_name");
    market = self.safeMarket(marketId = contract, market = market);
    side = safeString(position, "direction");
    side = functions.ccxtruthy((side == "buy")) ? "long" : "short";
    unrealizedPnl = safeString(position, "floating_profit_loss");
    initialMarginString = safeString(position, "initial_margin");
    notionalString = safeString(position, "size_currency");
    notionalStringAbs = stringAbs(notionalString);
    maintenanceMarginString = safeString(position, "maintenance_margin");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(stringMul(stringDiv(initialMarginString, notionalStringAbs), "100")),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMarginString),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(stringMul(stringDiv(maintenanceMarginString, notionalStringAbs), "100")),
    Symbol("entryPrice") => self.safeNumber(position, "average_price"),
    Symbol("notional") => self.parseNumber(notionalStringAbs),
    Symbol("leverage") => safeInteger(position, "leverage"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealizedPnl),
    Symbol("realizedPnl") => self.safeNumber(position, "realized_profit_loss"),
    Symbol("contracts") => self.safeNumber(position, "size"),
    Symbol("contractSize") => self.safeNumber(position, "contractSize"),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "estimated_liquidation_price"),
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("lastPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("hedged") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
fetch data on a single open contract trade position
see: https://docs.deribit.com/#private-get_position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetGetPosition(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parsePosition(result)

end
"""
fetch all open positions
see: https://docs.deribit.com/#private-get_positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currency`::string, optional: currency code filter for positions
- `params.kind`::string, optional: market type filter for positions 'future', 'option', 'spot', 'future_combo' or 'option_combo'
- `params.subaccount_id`::int, optional: the user id for the subaccount

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Deribit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeString(params, "currency");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        params = omit(params, "currency");
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetGetPositions(extend(request, params)));
    result = self.safeList(response, "result");
    return self.parsePositions(result, symbols = symbols)

end
"""
fetch the historical volatility of an option market based on an underlying asset
see: https://docs.deribit.com/#public-get_historical_volatility

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [volatility history objects]{@link https://docs.ccxt.com/?id=volatility-structure}
"""
function fetchVolatilityHistory(self::Deribit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetHistoricalVolatility(extend(request, params)));
    return self.parseVolatilityHistory(response)

end
function parseVolatilityHistory(self::Deribit, volatility)
    volatilityResult = safeValue(volatility, "result", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(volatilityResult)))
        timestamp = safeInteger(get(volatilityResult, i + 1, nothing), 0);
        volatilityObj = self.safeNumber(get(volatilityResult, i + 1, nothing), 1);
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => volatilityObj,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("volatility") => volatilityObj
));
        i += 1
    end
    return result

end
"""
fetch a history of internal transfers made on an account
see: https://docs.deribit.com/#private-get_transfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Deribit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a currency code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetTransfers(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    transfers = self.safeList(result, "data", defaultValue = []);
    return self.parseTransfers(transfers, currency = currency, since = since, limit = limit, params = params)

end
"""
transfer currency internally between wallets on the same account
see: https://docs.deribit.com/#private-submit_transfer_to_user
see: https://docs.deribit.com/#private-submit_transfer_to_subaccount

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Deribit, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("destination") => toAccount
    );
    method = safeString(params, "method");
    params = omit(params, "method");
    if functions.ccxtruthy(method == nothing)
        transferOptions = safeValue(self.options, "transfer", Dict{Symbol, Any}());
        method = safeString(transferOptions, "method", "privateGetSubmitTransferToSubaccount");
    end
    response = nothing;
    if functions.ccxtruthy(method == "privateGetSubmitTransferToUser")
        response = Base.fetch(self.privateGetSubmitTransferToUser(extend(request, params)));
    else
        response = Base.fetch(self.privateGetSubmitTransferToSubaccount(extend(request, params)));
    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTransfer(result, currency = currency)

end
function parseTransfer(self::Deribit, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "created_timestamp");
    status = safeString(transfer, "state");
    account = safeString(transfer, "other_side");
    direction = safeString(transfer, "direction");
    currencyId = safeString(transfer, "currency");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "id"),
    Symbol("status") => self.parseTransferStatus(status),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("fromAccount") => functions.ccxtruthy(direction != "payment") ? account : nothing,
    Symbol("toAccount") => functions.ccxtruthy(direction == "payment") ? account : nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseTransferStatus(self::Deribit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("prepared") => "pending",
        Symbol("confirmed") => "ok",
        Symbol("cancelled") => "cancelled",
        Symbol("waiting_for_admin") => "pending"
    );
    return safeString(statuses, status, status)

end
"""
make a withdrawal
see: https://docs.deribit.com/#private-withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Deribit, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(self.twofa != nothing)
        request[Symbol("tfa")] = totp(self.twofa);
    end
    response = Base.fetch(self.privateGetWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseDepositWithdrawFee(self::Deribit, fee; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("withdraw") => Dict{Symbol, Any}(
        Symbol("fee") => self.safeNumber(fee, "withdrawal_fee"),
        Symbol("percentage") => false
    ),
    Symbol("deposit") => Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    ),
    Symbol("networks") => Dict{Symbol, Any}()
)

end
"""
fetch deposit and withdraw fees
see: https://docs.deribit.com/#public-get_currencies

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Deribit; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetGetCurrencies(params));
    data = self.safeList(response, "result", defaultValue = []);
    return self.parseDepositWithdrawFees(data, codes = codes, currencyIdKey = "currency")

end
"""
fetch the current funding rate
see: https://docs.deribit.com/#public-get_funding_rate_value

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.start_timestamp`::int, optional: fetch funding rate starting from this timestamp
- `params.end_timestamp`::int, optional: fetch funding rate ending at this timestamp

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    time = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("start_timestamp") => time - (8 * 60 * 60 * 1000),
        Symbol("end_timestamp") => time
    );
    response = Base.fetch(self.publicGetGetFundingRateValue(extend(request, params)));
    return self.parseFundingRate(response, market = market)

end
"""
fetch the current funding rate
see: https://docs.deribit.com/#public-get_funding_rate_history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding rate history for
- `limit`::int, optional: the maximum number of entries to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: fetch funding rate ending at this timestamp
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRateHistory(self::Deribit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    maxEntriesPerRequest = 744;
    eachItemDuration = "1h";
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = eachItemDuration, params = extend(params, Dict{Symbol, Any}(
    Symbol("isDeribitPaginationCall") => true
)), maxEntriesPerRequest = maxEntriesPerRequest))
    end
    duration = self.parseTimeframe(eachItemDuration) * 1000;
    time = milliseconds();
    month = 30 * 24 * 60 * 60 * 1000;
    if functions.ccxtruthy(since == nothing)
        since = time - month;
    else
        time = since + month;
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("start_timestamp") => since - 1
    );
    until = safeInteger2(params, "until", "end_timestamp");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_timestamp")] = until;
    else
        request[Symbol("end_timestamp")] = time;
    end
    if functions.ccxtruthy(ccxt_in("isDeribitPaginationCall", params))
        params = omit(params, "isDeribitPaginationCall");
        if functions.ccxtruthy(limit == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a limit argument")));
        end
        maxUntil = self.sum(since, limit * duration);
        request[Symbol("end_timestamp")] = min(get(request, Symbol("end_timestamp"), nothing), maxUntil);
    end
    response = Base.fetch(self.publicGetGetFundingRateHistory(extend(request, params)));
    rates = [];
    result = safeValue(response, "result", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        fr = get(result, i + 1, nothing);
        rate = self.parseFundingRate(fr, market = market);
        push!(rates, rate);
        i += 1
    end
    return self.filterBySymbolSinceLimit(rates, symbol = symbol, since = since, limit = limit)

end
function parseFundingRate(self::Deribit, contract; market=nothing)
    timestamp = safeInteger(contract, "timestamp");
    datetime = self.iso8601(timestamp);
    result = self.safeNumber2(contract, "result", "interest_8h");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => self.safeNumber(contract, "index_price"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("fundingRate") => result,
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "8h"
)

end
"""
retrieves the public liquidations of a trading pair
see: https://docs.deribit.com/#public-get_last_settlements_by_currency

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the deribit api endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchLiquidations(self::Deribit, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLiquidations", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "continuation", cursorSent = "continuation", cursorIncrement = nothing))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchLiquidations() does not support ", get(market, Symbol("type"), nothing), " markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("type") => "bankruptcy"
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("search_start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.publicGetGetLastSettlementsByInstrument(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    cursor = safeString(result, "continuation");
    settlements = safeValue(result, "settlements", []);
    settlementsWithCursor = self.addPaginationCursorToResult(cursor, settlements);
    return self.parseLiquidations(settlementsWithCursor, market = market, since = since, limit = limit)

end
function addPaginationCursorToResult(self::Deribit, cursor, data)
    if functions.ccxtruthy(cursor != nothing)
        dataLength = length(data);
        if functions.ccxtruthy(functions.ccxt_gt(dataLength, 0))
            first_var = get(data, 1, nothing);
            last_var = get(data, dataLength - 1 + 1, nothing);
            first_var[Symbol("continuation")] = cursor;
            last_var[Symbol("continuation")] = cursor;
            data[1] = first_var;
            data[dataLength - 1 + 1] = last_var;
        end
    end
    return data

end
"""
retrieves the users liquidated positions
see: https://docs.deribit.com/#private-get_settlement_history_by_instrument

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the deribit api endpoint

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Deribit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyLiquidations() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchMyLiquidations() does not support ", get(market, Symbol("type"), nothing), " markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("type") => "bankruptcy"
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("search_start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetGetSettlementHistoryByInstrument(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    settlements = self.safeList(result, "settlements", defaultValue = []);
    return self.parseLiquidations(settlements, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Deribit, liquidation; market=nothing)
    timestamp = safeInteger(liquidation, "timestamp");
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("price") => nothing,
    Symbol("baseValue") => self.safeNumber(liquidation, "session_bankrupcy"),
    Symbol("quoteValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.deribit.com/#public-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchGreeks(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseGreeks(result, market = market)

end
function parseGreeks(self::Deribit, greeks; market=nothing)
    timestamp = safeInteger(greeks, "timestamp");
    marketId = safeString(greeks, "instrument_name");
    symbol = self.safeSymbol(marketId, market = market);
    stats = safeValue(greeks, "greeks", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("delta") => self.safeNumber(stats, "delta"),
    Symbol("gamma") => self.safeNumber(stats, "gamma"),
    Symbol("theta") => self.safeNumber(stats, "theta"),
    Symbol("vega") => self.safeNumber(stats, "vega"),
    Symbol("rho") => self.safeNumber(stats, "rho"),
    Symbol("bidSize") => self.safeNumber(greeks, "best_bid_amount"),
    Symbol("askSize") => self.safeNumber(greeks, "best_ask_amount"),
    Symbol("bidImpliedVolatility") => self.safeNumber(greeks, "bid_iv"),
    Symbol("askImpliedVolatility") => self.safeNumber(greeks, "ask_iv"),
    Symbol("markImpliedVolatility") => self.safeNumber(greeks, "mark_iv"),
    Symbol("bidPrice") => self.safeNumber(greeks, "best_bid_price"),
    Symbol("askPrice") => self.safeNumber(greeks, "best_ask_price"),
    Symbol("markPrice") => self.safeNumber(greeks, "mark_price"),
    Symbol("lastPrice") => self.safeNumber(greeks, "last_price"),
    Symbol("underlyingPrice") => self.safeNumber(greeks, "underlying_price"),
    Symbol("info") => greeks
)

end
"""
fetches option data that is commonly found in an option chain
see: https://docs.deribit.com/#public-get_book_summary_by_instrument

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
function fetchOption(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetBookSummaryByInstrument(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    chain = self.safeDict(result, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOption(chain, currency = nothing, market = market)

end
"""
fetches data for an underlying asset that is commonly found in an option chain
see: https://docs.deribit.com/#public-get_book_summary_by_currency

# Arguments
- `code`::string: base currency to fetch an option chain for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [option chain structures]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
function fetchOptionChain(self::Deribit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("kind") => "option"
    );
    response = Base.fetch(self.publicGetGetBookSummaryByCurrency(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOptionChain(result, currencyKey = "base_currency", symbolKey = "instrument_name")

end
function parseOption(self::Deribit, chain; currency=nothing, market=nothing)
    marketId = safeString(chain, "instrument_name");
    market = self.safeMarket(marketId = marketId, market = market);
    currencyId = safeString(chain, "base_currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(chain, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => code,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("impliedVolatility") => nothing,
    Symbol("openInterest") => self.safeNumber(chain, "open_interest"),
    Symbol("bidPrice") => self.safeNumber(chain, "bid_price"),
    Symbol("askPrice") => self.safeNumber(chain, "ask_price"),
    Symbol("midPrice") => self.safeNumber(chain, "mid_price"),
    Symbol("markPrice") => self.safeNumber(chain, "mark_price"),
    Symbol("lastPrice") => self.safeNumber(chain, "last"),
    Symbol("underlyingPrice") => self.safeNumber(chain, "underlying_price"),
    Symbol("change") => nothing,
    Symbol("percentage") => self.safeNumber(chain, "price_change"),
    Symbol("baseVolume") => self.safeNumber(chain, "volume"),
    Symbol("quoteVolume") => self.safeNumber(chain, "volume_usd")
)

end
"""
Retrieves the open interest of a symbol
see: https://docs.deribit.com/?shell#public-get_book_summary_by_instrument

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Deribit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetGetBookSummaryByInstrument(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    data = self.safeDict(result, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOpenInterest(data, market = market)

end
function parseOpenInterest(self::Deribit, interest; market=nothing)
    timestamp = safeInteger(interest, "creation_timestamp");
    marketId = safeString(interest, "instrument_name");
    market = self.safeMarket(marketId = marketId, market = market);
    openInterest = self.safeNumber(interest, "open_interest");
    openInterestAmount = nothing;
    openInterestValue = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("option"), nothing), (@functions.ccxt_and(get(market, Symbol("future"), nothing), get(market, Symbol("linear"), nothing)))))
        openInterestAmount = openInterest;
    else
        openInterestValue = openInterest;
    end
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("openInterestAmount") => openInterestAmount,
    Symbol("openInterestValue") => openInterestValue,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
function nonce(self::Deribit, )
    return milliseconds()

end
function sign(self::Deribit, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/", "api/", self.version, "/", api, "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            request += string("?", self.urlencode(params));
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        timestamp = string(milliseconds());
        requestBody = "";
        if functions.ccxtruthy(length(objectKeys(params)))
            request += string("?", self.urlencode(params));
        end
        requestData = string(method, "\n", request, "\n", requestBody, "\n");
        auth = string(timestamp, "\n", nonce, "\n", requestData);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => string("deri-hmac-sha256 id=", self.apiKey, ", ts=", timestamp, ", sig=", signature, ", ", "nonce=", nonce)
        );
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), request);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Deribit, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    error = safeValue(response, "error");
    if functions.ccxtruthy(error != nothing)
        errorCode = safeString(error, "code");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(self.exceptions, errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Deribit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetAuth(self::Deribit, params=Dict(), context=Dict())
    return request(self, "auth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangeToken(self::Deribit, params=Dict(), context=Dict())
    return request(self, "exchange_token"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetForkToken(self::Deribit, params=Dict(), context=Dict())
    return request(self, "fork_token"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSetHeartbeat(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_heartbeat"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDisableHeartbeat(self::Deribit, params=Dict(), context=Dict())
    return request(self, "disable_heartbeat"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetTime(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetHello(self::Deribit, params=Dict(), context=Dict())
    return request(self, "hello"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStatus(self::Deribit, params=Dict(), context=Dict())
    return request(self, "status"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTest(self::Deribit, params=Dict(), context=Dict())
    return request(self, "test"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSubscribe(self::Deribit, params=Dict(), context=Dict())
    return request(self, "subscribe"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribe(self::Deribit, params=Dict(), context=Dict())
    return request(self, "unsubscribe"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUnsubscribeAll(self::Deribit, params=Dict(), context=Dict())
    return request(self, "unsubscribe_all"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetAnnouncements(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_announcements"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetBookSummaryByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_book_summary_by_currency"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetBookSummaryByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_book_summary_by_instrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetContractSize(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_contract_size"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetCurrencies(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetDeliveryPrices(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_delivery_prices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetFundingChartData(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_funding_chart_data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetFundingRateHistory(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_funding_rate_history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetFundingRateValue(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_funding_rate_value"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetHistoricalVolatility(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_historical_volatility"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetIndex(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_index"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetIndexPrice(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_index_price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetIndexPriceNames(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_index_price_names"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_instrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetInstruments(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_instruments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastSettlementsByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_settlements_by_currency"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastSettlementsByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_settlements_by_instrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastTradesByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_trades_by_currency"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastTradesByCurrencyAndTime(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_trades_by_currency_and_time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastTradesByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_trades_by_instrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetLastTradesByInstrumentAndTime(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_trades_by_instrument_and_time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetMarkPriceHistory(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_mark_price_history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetOrderBook(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_order_book"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetTradeVolumes(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_trade_volumes"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetTradingviewChartData(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_tradingview_chart_data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGetVolatilityIndexData(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_volatility_index_data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Deribit, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLogout(self::Deribit, params=Dict(), context=Dict())
    return request(self, "logout"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEnableCancelOnDisconnect(self::Deribit, params=Dict(), context=Dict())
    return request(self, "enable_cancel_on_disconnect"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDisableCancelOnDisconnect(self::Deribit, params=Dict(), context=Dict())
    return request(self, "disable_cancel_on_disconnect"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetCancelOnDisconnect(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_cancel_on_disconnect"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubscribe(self::Deribit, params=Dict(), context=Dict())
    return request(self, "subscribe"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnsubscribe(self::Deribit, params=Dict(), context=Dict())
    return request(self, "unsubscribe"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnsubscribeAll(self::Deribit, params=Dict(), context=Dict())
    return request(self, "unsubscribe_all"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetChangeApiKeyName(self::Deribit, params=Dict(), context=Dict())
    return request(self, "change_api_key_name"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetChangeScopeInApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "change_scope_in_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetChangeSubaccountName(self::Deribit, params=Dict(), context=Dict())
    return request(self, "change_subaccount_name"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCreateApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "create_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCreateSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "create_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDisableApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "disable_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDisableTfaForSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "disable_tfa_for_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEnableAffiliateProgram(self::Deribit, params=Dict(), context=Dict())
    return request(self, "enable_affiliate_program"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEnableApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "enable_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccessLog(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_access_log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountSummary(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_account_summary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAccountSummaries(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_account_summaries"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetAffiliateProgramInfo(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_affiliate_program_info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetEmailLanguage(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_email_language"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetNewAnnouncements(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_new_announcements"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetPortfolioMargins(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_portfolio_margins"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetPosition(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetPositions(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetSubaccounts(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_subaccounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetSubaccountsDetails(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_subaccounts_details"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetTransactionLog(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_transaction_log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetListApiKeys(self::Deribit, params=Dict(), context=Dict())
    return request(self, "list_api_keys"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetRemoveApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "remove_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetRemoveSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "remove_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetResetApiKey(self::Deribit, params=Dict(), context=Dict())
    return request(self, "reset_api_key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetAnnouncementAsRead(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_announcement_as_read"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetApiKeyAsDefault(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_api_key_as_default"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetEmailForSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_email_for_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetEmailLanguage(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_email_language"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetPasswordForSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_password_for_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetToggleNotificationsFromSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "toggle_notifications_from_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetToggleSubaccountLogin(self::Deribit, params=Dict(), context=Dict())
    return request(self, "toggle_subaccount_login"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetExecuteBlockTrade(self::Deribit, params=Dict(), context=Dict())
    return request(self, "execute_block_trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetBlockTrade(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_block_trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetLastBlockTradesByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_last_block_trades_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetInvalidateBlockTradeSignature(self::Deribit, params=Dict(), context=Dict())
    return request(self, "invalidate_block_trade_signature"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetVerifyBlockTrade(self::Deribit, params=Dict(), context=Dict())
    return request(self, "verify_block_trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBuy(self::Deribit, params=Dict(), context=Dict())
    return request(self, "buy"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSell(self::Deribit, params=Dict(), context=Dict())
    return request(self, "sell"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEdit(self::Deribit, params=Dict(), context=Dict())
    return request(self, "edit"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEditByLabel(self::Deribit, params=Dict(), context=Dict())
    return request(self, "edit_by_label"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancel(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelAll(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_all"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelAllByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_all_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelAllByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_all_by_instrument"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelByLabel(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_by_label"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetClosePosition(self::Deribit, params=Dict(), context=Dict())
    return request(self, "close_position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetMargins(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_margins"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetMmpConfig(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_mmp_config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOpenOrdersByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_open_orders_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOpenOrdersByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_open_orders_by_instrument"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderHistoryByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_order_history_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderHistoryByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_order_history_by_instrument"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderMarginByIds(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_order_margin_by_ids"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetOrderState(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_order_state"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetStopOrderHistory(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_stop_order_history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetTriggerOrderHistory(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_trigger_order_history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserTradesByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_user_trades_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserTradesByCurrencyAndTime(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_user_trades_by_currency_and_time"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserTradesByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_user_trades_by_instrument"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserTradesByInstrumentAndTime(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_user_trades_by_instrument_and_time"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetUserTradesByOrder(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_user_trades_by_order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetResetMmp(self::Deribit, params=Dict(), context=Dict())
    return request(self, "reset_mmp"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSetMmpConfig(self::Deribit, params=Dict(), context=Dict())
    return request(self, "set_mmp_config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetSettlementHistoryByInstrument(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_settlement_history_by_instrument"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetSettlementHistoryByCurrency(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_settlement_history_by_currency"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelTransferById(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_transfer_by_id"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCancelWithdrawal(self::Deribit, params=Dict(), context=Dict())
    return request(self, "cancel_withdrawal"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCreateDepositAddress(self::Deribit, params=Dict(), context=Dict())
    return request(self, "create_deposit_address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetCurrentDepositAddress(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_current_deposit_address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetDeposits(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetTransfers(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGetWithdrawals(self::Deribit, params=Dict(), context=Dict())
    return request(self, "get_withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubmitTransferToSubaccount(self::Deribit, params=Dict(), context=Dict())
    return request(self, "submit_transfer_to_subaccount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubmitTransferToUser(self::Deribit, params=Dict(), context=Dict())
    return request(self, "submit_transfer_to_user"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdraw(self::Deribit, params=Dict(), context=Dict())
    return request(self, "withdraw"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Deribit(; kwargs...)
    inst = Deribit(Exchange(), describe, createExpiredOptionMarket, safeMarket, fetchTime, fetchCurrencies, parseCurrency, codeFromOptions, fetchStatus, fetchAccounts, parseAccount, fetchMarkets, parseBalance, fetchBalance, createDepositAddress, fetchDepositAddress, parseTicker, fetchTicker, fetchTickers, fetchOHLCV, parseTrade, fetchTrades, fetchTradingFees, fetchOrderBook, parseOrderStatus, parseTimeInForce, parseOrderType, parseOrder, fetchOrder, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOpenOrders, fetchClosedOrders, fetchOrderTrades, fetchMyTrades, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, parsePosition, fetchPosition, fetchPositions, fetchVolatilityHistory, parseVolatilityHistory, fetchTransfers, transfer, parseTransfer, parseTransferStatus, withdraw, parseDepositWithdrawFee, fetchDepositWithdrawFees, fetchFundingRate, fetchFundingRateHistory, parseFundingRate, fetchLiquidations, addPaginationCursorToResult, fetchMyLiquidations, parseLiquidation, fetchGreeks, parseGreeks, fetchOption, fetchOptionChain, parseOption, fetchOpenInterest, parseOpenInterest, nonce, sign, handleErrors, publicGetAuth, publicGetExchangeToken, publicGetForkToken, publicGetSetHeartbeat, publicGetDisableHeartbeat, publicGetGetTime, publicGetHello, publicGetStatus, publicGetTest, publicGetSubscribe, publicGetUnsubscribe, publicGetUnsubscribeAll, publicGetGetAnnouncements, publicGetGetBookSummaryByCurrency, publicGetGetBookSummaryByInstrument, publicGetGetContractSize, publicGetGetCurrencies, publicGetGetDeliveryPrices, publicGetGetFundingChartData, publicGetGetFundingRateHistory, publicGetGetFundingRateValue, publicGetGetHistoricalVolatility, publicGetGetIndex, publicGetGetIndexPrice, publicGetGetIndexPriceNames, publicGetGetInstrument, publicGetGetInstruments, publicGetGetLastSettlementsByCurrency, publicGetGetLastSettlementsByInstrument, publicGetGetLastTradesByCurrency, publicGetGetLastTradesByCurrencyAndTime, publicGetGetLastTradesByInstrument, publicGetGetLastTradesByInstrumentAndTime, publicGetGetMarkPriceHistory, publicGetGetOrderBook, publicGetGetTradeVolumes, publicGetGetTradingviewChartData, publicGetGetVolatilityIndexData, publicGetTicker, privateGetLogout, privateGetEnableCancelOnDisconnect, privateGetDisableCancelOnDisconnect, privateGetGetCancelOnDisconnect, privateGetSubscribe, privateGetUnsubscribe, privateGetUnsubscribeAll, privateGetChangeApiKeyName, privateGetChangeScopeInApiKey, privateGetChangeSubaccountName, privateGetCreateApiKey, privateGetCreateSubaccount, privateGetDisableApiKey, privateGetDisableTfaForSubaccount, privateGetEnableAffiliateProgram, privateGetEnableApiKey, privateGetGetAccessLog, privateGetGetAccountSummary, privateGetGetAccountSummaries, privateGetGetAffiliateProgramInfo, privateGetGetEmailLanguage, privateGetGetNewAnnouncements, privateGetGetPortfolioMargins, privateGetGetPosition, privateGetGetPositions, privateGetGetSubaccounts, privateGetGetSubaccountsDetails, privateGetGetTransactionLog, privateGetListApiKeys, privateGetRemoveApiKey, privateGetRemoveSubaccount, privateGetResetApiKey, privateGetSetAnnouncementAsRead, privateGetSetApiKeyAsDefault, privateGetSetEmailForSubaccount, privateGetSetEmailLanguage, privateGetSetPasswordForSubaccount, privateGetToggleNotificationsFromSubaccount, privateGetToggleSubaccountLogin, privateGetExecuteBlockTrade, privateGetGetBlockTrade, privateGetGetLastBlockTradesByCurrency, privateGetInvalidateBlockTradeSignature, privateGetVerifyBlockTrade, privateGetBuy, privateGetSell, privateGetEdit, privateGetEditByLabel, privateGetCancel, privateGetCancelAll, privateGetCancelAllByCurrency, privateGetCancelAllByInstrument, privateGetCancelByLabel, privateGetClosePosition, privateGetGetMargins, privateGetGetMmpConfig, privateGetGetOpenOrdersByCurrency, privateGetGetOpenOrdersByInstrument, privateGetGetOrderHistoryByCurrency, privateGetGetOrderHistoryByInstrument, privateGetGetOrderMarginByIds, privateGetGetOrderState, privateGetGetStopOrderHistory, privateGetGetTriggerOrderHistory, privateGetGetUserTradesByCurrency, privateGetGetUserTradesByCurrencyAndTime, privateGetGetUserTradesByInstrument, privateGetGetUserTradesByInstrumentAndTime, privateGetGetUserTradesByOrder, privateGetResetMmp, privateGetSetMmpConfig, privateGetGetSettlementHistoryByInstrument, privateGetGetSettlementHistoryByCurrency, privateGetCancelTransferById, privateGetCancelWithdrawal, privateGetCreateDepositAddress, privateGetGetCurrentDepositAddress, privateGetGetDeposits, privateGetGetTransfers, privateGetGetWithdrawals, privateGetSubmitTransferToSubaccount, privateGetSubmitTransferToUser, privateGetWithdraw)
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
function __ccxt_doc_Deribit_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.deribit.com/#public-get_time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Deribit_fetchTime

function __ccxt_doc_Deribit_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.deribit.com/#public-get_currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Deribit_fetchCurrencies

function __ccxt_doc_Deribit_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://docs.deribit.com/#public-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Deribit_fetchStatus

function __ccxt_doc_Deribit_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://docs.deribit.com/#private-get_subaccounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Deribit_fetchAccounts

function __ccxt_doc_Deribit_fetchMarkets() end
"""
retrieves data on all markets for deribit
see: https://docs.deribit.com/#public-get_currencies
see: https://docs.deribit.com/#public-get_instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Deribit_fetchMarkets

function __ccxt_doc_Deribit_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.deribit.com/#private-get_account_summary
see: https://docs.deribit.com/#private-get_account_summaries

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string, optional: unified currency code of the currency for the balance, if defined 'privateGetGetAccountSummary' will be used, otherwise 'privateGetGetAccountSummaries' will be used

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Deribit_fetchBalance

function __ccxt_doc_Deribit_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.deribit.com/#private-create_deposit_address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Deribit_createDepositAddress

function __ccxt_doc_Deribit_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.deribit.com/#private-get_current_deposit_address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Deribit_fetchDepositAddress

function __ccxt_doc_Deribit_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.deribit.com/#public-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Deribit_fetchTicker

function __ccxt_doc_Deribit_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.deribit.com/#public-get_book_summary_by_currency

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string, optional: *required* the currency code to fetch the tickers for, eg. 'BTC', 'ETH'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Deribit_fetchTickers

function __ccxt_doc_Deribit_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.deribit.com/#public-get_tradingview_chart_data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: whether to paginate the results, set to false by default
- `params.until`::int, optional: the latest time in ms to fetch ohlcv for

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Deribit_fetchOHLCV

function __ccxt_doc_Deribit_fetchTrades() end
"""
get the list of most recent trades for a particular symbol.
see: https://docs.deribit.com/#public-get_last_trades_by_instrument
see: https://docs.deribit.com/#public-get_last_trades_by_instrument_and_time

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Deribit_fetchTrades

function __ccxt_doc_Deribit_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.deribit.com/#private-get_account_summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Deribit_fetchTradingFees

function __ccxt_doc_Deribit_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.deribit.com/#public-get_order_book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Deribit_fetchOrderBook

function __ccxt_doc_Deribit_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.deribit.com/#private-get_order_state

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_fetchOrder

function __ccxt_doc_Deribit_createOrder() end
"""
create a trade order
see: https://docs.deribit.com/#private-buy
see: https://docs.deribit.com/#private-sell

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::string, optional: the trigger type 'index_price', 'mark_price', or 'last_price', default is 'last_price'
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_createOrder

function __ccxt_doc_Deribit_editOrder() end
"""
edit a trade order
see: https://docs.deribit.com/#private-edit

# Arguments
- `id`::string: edit order id
- `symbol`::string, optional: unified symbol of the market to edit an order in
- `type`::string, optional: 'market' or 'limit'
- `side`::string, optional: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_editOrder

function __ccxt_doc_Deribit_cancelOrder() end
"""
cancels an open order
see: https://docs.deribit.com/#private-cancel

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_cancelOrder

function __ccxt_doc_Deribit_cancelAllOrders() end
"""
cancel all open orders
see: https://docs.deribit.com/#private-cancel_all
see: https://docs.deribit.com/#private-cancel_all_by_instrument

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_cancelAllOrders

function __ccxt_doc_Deribit_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.deribit.com/#private-get_open_orders_by_currency
see: https://docs.deribit.com/#private-get_open_orders_by_instrument

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_fetchOpenOrders

function __ccxt_doc_Deribit_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.deribit.com/#private-get_order_history_by_currency
see: https://docs.deribit.com/#private-get_order_history_by_instrument

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Deribit_fetchClosedOrders

function __ccxt_doc_Deribit_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://docs.deribit.com/#private-get_user_trades_by_order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Deribit_fetchOrderTrades

function __ccxt_doc_Deribit_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.deribit.com/#private-get_user_trades_by_currency
see: https://docs.deribit.com/#private-get_user_trades_by_currency_and_time
see: https://docs.deribit.com/#private-get_user_trades_by_instrument
see: https://docs.deribit.com/#private-get_user_trades_by_instrument_and_time

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Deribit_fetchMyTrades

function __ccxt_doc_Deribit_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.deribit.com/#private-get_deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Deribit_fetchDeposits

function __ccxt_doc_Deribit_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.deribit.com/#private-get_withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Deribit_fetchWithdrawals

function __ccxt_doc_Deribit_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://docs.deribit.com/#private-get_position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Deribit_fetchPosition

function __ccxt_doc_Deribit_fetchPositions() end
"""
fetch all open positions
see: https://docs.deribit.com/#private-get_positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currency`::string, optional: currency code filter for positions
- `params.kind`::string, optional: market type filter for positions 'future', 'option', 'spot', 'future_combo' or 'option_combo'
- `params.subaccount_id`::int, optional: the user id for the subaccount

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Deribit_fetchPositions

function __ccxt_doc_Deribit_fetchVolatilityHistory() end
"""
fetch the historical volatility of an option market based on an underlying asset
see: https://docs.deribit.com/#public-get_historical_volatility

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [volatility history objects]{@link https://docs.ccxt.com/?id=volatility-structure}
"""
__ccxt_doc_Deribit_fetchVolatilityHistory

function __ccxt_doc_Deribit_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://docs.deribit.com/#private-get_transfers

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Deribit_fetchTransfers

function __ccxt_doc_Deribit_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://docs.deribit.com/#private-submit_transfer_to_user
see: https://docs.deribit.com/#private-submit_transfer_to_subaccount

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Deribit_transfer

function __ccxt_doc_Deribit_withdraw() end
"""
make a withdrawal
see: https://docs.deribit.com/#private-withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Deribit_withdraw

function __ccxt_doc_Deribit_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://docs.deribit.com/#public-get_currencies

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Deribit_fetchDepositWithdrawFees

function __ccxt_doc_Deribit_fetchFundingRate() end
"""
fetch the current funding rate
see: https://docs.deribit.com/#public-get_funding_rate_value

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.start_timestamp`::int, optional: fetch funding rate starting from this timestamp
- `params.end_timestamp`::int, optional: fetch funding rate ending at this timestamp

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Deribit_fetchFundingRate

function __ccxt_doc_Deribit_fetchFundingRateHistory() end
"""
fetch the current funding rate
see: https://docs.deribit.com/#public-get_funding_rate_history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding rate history for
- `limit`::int, optional: the maximum number of entries to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: fetch funding rate ending at this timestamp
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Deribit_fetchFundingRateHistory

function __ccxt_doc_Deribit_fetchLiquidations() end
"""
retrieves the public liquidations of a trading pair
see: https://docs.deribit.com/#public-get_last_settlements_by_currency

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the deribit api endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Deribit_fetchLiquidations

function __ccxt_doc_Deribit_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://docs.deribit.com/#private-get_settlement_history_by_instrument

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the deribit api endpoint

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Deribit_fetchMyLiquidations

function __ccxt_doc_Deribit_fetchGreeks() end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.deribit.com/#public-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Deribit_fetchGreeks

function __ccxt_doc_Deribit_fetchOption() end
"""
fetches option data that is commonly found in an option chain
see: https://docs.deribit.com/#public-get_book_summary_by_instrument

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
__ccxt_doc_Deribit_fetchOption

function __ccxt_doc_Deribit_fetchOptionChain() end
"""
fetches data for an underlying asset that is commonly found in an option chain
see: https://docs.deribit.com/#public-get_book_summary_by_currency

# Arguments
- `code`::string: base currency to fetch an option chain for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [option chain structures]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
__ccxt_doc_Deribit_fetchOptionChain

function __ccxt_doc_Deribit_fetchOpenInterest() end
"""
Retrieves the open interest of a symbol
see: https://docs.deribit.com/?shell#public-get_book_summary_by_instrument

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Deribit_fetchOpenInterest
