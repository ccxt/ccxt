@kwdef mutable struct Modetrade <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    setSandboxMode::Function = setSandboxMode
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    parseMarket::Function = parseMarket
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    parseTokenAndFeeTemp::Function = parseTokenAndFeeTemp
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseIncome::Function = parseIncome
    fetchFundingHistory::Function = fetchFundingHistory
    fetchTradingFees::Function = fetchTradingFees
    fetchOrderBook::Function = fetchOrderBook
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseOrder::Function = parseOrder
    parseTimeInForce::Function = parseTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    getAssetHistoryRows::Function = getAssetHistoryRows
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchLedger::Function = fetchLedger
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    getWithdrawNonce::Function = getWithdrawNonce
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signMessage::Function = signMessage
    withdraw::Function = withdraw
    parseLeverage::Function = parseLeverage
    fetchLeverage::Function = fetchLeverage
    setLeverage::Function = setLeverage
    parsePosition::Function = parsePosition
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    v1PublicGetPublicVolumeStats::Function = v1PublicGetPublicVolumeStats
    v1PublicGetPublicBrokerName::Function = v1PublicGetPublicBrokerName
    v1PublicGetPublicChainInfoBrokerId::Function = v1PublicGetPublicChainInfoBrokerId
    v1PublicGetPublicSystemInfo::Function = v1PublicGetPublicSystemInfo
    v1PublicGetPublicVaultBalance::Function = v1PublicGetPublicVaultBalance
    v1PublicGetPublicInsurancefund::Function = v1PublicGetPublicInsurancefund
    v1PublicGetPublicChainInfo::Function = v1PublicGetPublicChainInfo
    v1PublicGetFaucetUsdc::Function = v1PublicGetFaucetUsdc
    v1PublicGetPublicAccount::Function = v1PublicGetPublicAccount
    v1PublicGetGetAccount::Function = v1PublicGetGetAccount
    v1PublicGetRegistrationNonce::Function = v1PublicGetRegistrationNonce
    v1PublicGetGetOrderlyKey::Function = v1PublicGetGetOrderlyKey
    v1PublicGetPublicLiquidation::Function = v1PublicGetPublicLiquidation
    v1PublicGetPublicLiquidatedPositions::Function = v1PublicGetPublicLiquidatedPositions
    v1PublicGetPublicConfig::Function = v1PublicGetPublicConfig
    v1PublicGetPublicCampaignRanking::Function = v1PublicGetPublicCampaignRanking
    v1PublicGetPublicCampaignStats::Function = v1PublicGetPublicCampaignStats
    v1PublicGetPublicCampaignUser::Function = v1PublicGetPublicCampaignUser
    v1PublicGetPublicCampaignStatsDetails::Function = v1PublicGetPublicCampaignStatsDetails
    v1PublicGetPublicCampaigns::Function = v1PublicGetPublicCampaigns
    v1PublicGetPublicPointsLeaderboard::Function = v1PublicGetPublicPointsLeaderboard
    v1PublicGetClientPoints::Function = v1PublicGetClientPoints
    v1PublicGetPublicPointsEpoch::Function = v1PublicGetPublicPointsEpoch
    v1PublicGetPublicPointsEpochDates::Function = v1PublicGetPublicPointsEpochDates
    v1PublicGetPublicReferralCheckRefCode::Function = v1PublicGetPublicReferralCheckRefCode
    v1PublicGetPublicReferralVerifyRefCode::Function = v1PublicGetPublicReferralVerifyRefCode
    v1PublicGetReferralAdminInfo::Function = v1PublicGetReferralAdminInfo
    v1PublicGetReferralInfo::Function = v1PublicGetReferralInfo
    v1PublicGetReferralRefereeInfo::Function = v1PublicGetReferralRefereeInfo
    v1PublicGetReferralRefereeRebateSummary::Function = v1PublicGetReferralRefereeRebateSummary
    v1PublicGetReferralRefereeHistory::Function = v1PublicGetReferralRefereeHistory
    v1PublicGetReferralReferralHistory::Function = v1PublicGetReferralReferralHistory
    v1PublicGetReferralRebateSummary::Function = v1PublicGetReferralRebateSummary
    v1PublicGetClientDistributionHistory::Function = v1PublicGetClientDistributionHistory
    v1PublicGetTvConfig::Function = v1PublicGetTvConfig
    v1PublicGetTvHistory::Function = v1PublicGetTvHistory
    v1PublicGetTvSymbolInfo::Function = v1PublicGetTvSymbolInfo
    v1PublicGetPublicFundingRateHistory::Function = v1PublicGetPublicFundingRateHistory
    v1PublicGetPublicFundingRateSymbol::Function = v1PublicGetPublicFundingRateSymbol
    v1PublicGetPublicFundingRates::Function = v1PublicGetPublicFundingRates
    v1PublicGetPublicInfo::Function = v1PublicGetPublicInfo
    v1PublicGetPublicInfoSymbol::Function = v1PublicGetPublicInfoSymbol
    v1PublicGetPublicMarketTrades::Function = v1PublicGetPublicMarketTrades
    v1PublicGetPublicToken::Function = v1PublicGetPublicToken
    v1PublicGetPublicFutures::Function = v1PublicGetPublicFutures
    v1PublicGetPublicFuturesSymbol::Function = v1PublicGetPublicFuturesSymbol
    v1PublicPostRegisterAccount::Function = v1PublicPostRegisterAccount
    v1PrivateGetClientKeyInfo::Function = v1PrivateGetClientKeyInfo
    v1PrivateGetClientOrderlyKeyIpRestriction::Function = v1PrivateGetClientOrderlyKeyIpRestriction
    v1PrivateGetOrderOid::Function = v1PrivateGetOrderOid
    v1PrivateGetClientOrderClientOrderId::Function = v1PrivateGetClientOrderClientOrderId
    v1PrivateGetAlgoOrderOid::Function = v1PrivateGetAlgoOrderOid
    v1PrivateGetAlgoClientOrderClientOrderId::Function = v1PrivateGetAlgoClientOrderClientOrderId
    v1PrivateGetOrders::Function = v1PrivateGetOrders
    v1PrivateGetAlgoOrders::Function = v1PrivateGetAlgoOrders
    v1PrivateGetTradeTid::Function = v1PrivateGetTradeTid
    v1PrivateGetTrades::Function = v1PrivateGetTrades
    v1PrivateGetOrderOidTrades::Function = v1PrivateGetOrderOidTrades
    v1PrivateGetClientLiquidatorLiquidations::Function = v1PrivateGetClientLiquidatorLiquidations
    v1PrivateGetLiquidations::Function = v1PrivateGetLiquidations
    v1PrivateGetAssetHistory::Function = v1PrivateGetAssetHistory
    v1PrivateGetClientHolding::Function = v1PrivateGetClientHolding
    v1PrivateGetWithdrawNonce::Function = v1PrivateGetWithdrawNonce
    v1PrivateGetSettleNonce::Function = v1PrivateGetSettleNonce
    v1PrivateGetPnlSettlementHistory::Function = v1PrivateGetPnlSettlementHistory
    v1PrivateGetVolumeUserDaily::Function = v1PrivateGetVolumeUserDaily
    v1PrivateGetVolumeUserStats::Function = v1PrivateGetVolumeUserStats
    v1PrivateGetClientStatistics::Function = v1PrivateGetClientStatistics
    v1PrivateGetClientInfo::Function = v1PrivateGetClientInfo
    v1PrivateGetClientStatisticsDaily::Function = v1PrivateGetClientStatisticsDaily
    v1PrivateGetPositions::Function = v1PrivateGetPositions
    v1PrivateGetPositionSymbol::Function = v1PrivateGetPositionSymbol
    v1PrivateGetFundingFeeHistory::Function = v1PrivateGetFundingFeeHistory
    v1PrivateGetNotificationInboxNotifications::Function = v1PrivateGetNotificationInboxNotifications
    v1PrivateGetNotificationInboxUnread::Function = v1PrivateGetNotificationInboxUnread
    v1PrivateGetVolumeBrokerDaily::Function = v1PrivateGetVolumeBrokerDaily
    v1PrivateGetBrokerFeeRateDefault::Function = v1PrivateGetBrokerFeeRateDefault
    v1PrivateGetBrokerUserInfo::Function = v1PrivateGetBrokerUserInfo
    v1PrivateGetOrderbookSymbol::Function = v1PrivateGetOrderbookSymbol
    v1PrivateGetKline::Function = v1PrivateGetKline
    v1PrivatePostOrderlyKey::Function = v1PrivatePostOrderlyKey
    v1PrivatePostClientSetOrderlyKeyIpRestriction::Function = v1PrivatePostClientSetOrderlyKeyIpRestriction
    v1PrivatePostClientResetOrderlyKeyIpRestriction::Function = v1PrivatePostClientResetOrderlyKeyIpRestriction
    v1PrivatePostOrder::Function = v1PrivatePostOrder
    v1PrivatePostBatchOrder::Function = v1PrivatePostBatchOrder
    v1PrivatePostAlgoOrder::Function = v1PrivatePostAlgoOrder
    v1PrivatePostLiquidation::Function = v1PrivatePostLiquidation
    v1PrivatePostClaimInsuranceFund::Function = v1PrivatePostClaimInsuranceFund
    v1PrivatePostWithdrawRequest::Function = v1PrivatePostWithdrawRequest
    v1PrivatePostSettlePnl::Function = v1PrivatePostSettlePnl
    v1PrivatePostNotificationInboxMarkRead::Function = v1PrivatePostNotificationInboxMarkRead
    v1PrivatePostNotificationInboxMarkReadAll::Function = v1PrivatePostNotificationInboxMarkReadAll
    v1PrivatePostClientLeverage::Function = v1PrivatePostClientLeverage
    v1PrivatePostClientMaintenanceConfig::Function = v1PrivatePostClientMaintenanceConfig
    v1PrivatePostDelegateSigner::Function = v1PrivatePostDelegateSigner
    v1PrivatePostDelegateOrderlyKey::Function = v1PrivatePostDelegateOrderlyKey
    v1PrivatePostDelegateSettlePnl::Function = v1PrivatePostDelegateSettlePnl
    v1PrivatePostDelegateWithdrawRequest::Function = v1PrivatePostDelegateWithdrawRequest
    v1PrivatePostBrokerFeeRateSet::Function = v1PrivatePostBrokerFeeRateSet
    v1PrivatePostBrokerFeeRateSetDefault::Function = v1PrivatePostBrokerFeeRateSetDefault
    v1PrivatePostBrokerFeeRateDefault::Function = v1PrivatePostBrokerFeeRateDefault
    v1PrivatePostReferralCreate::Function = v1PrivatePostReferralCreate
    v1PrivatePostReferralUpdate::Function = v1PrivatePostReferralUpdate
    v1PrivatePostReferralBind::Function = v1PrivatePostReferralBind
    v1PrivatePostReferralEditSplit::Function = v1PrivatePostReferralEditSplit
    v1PrivatePutOrder::Function = v1PrivatePutOrder
    v1PrivatePutAlgoOrder::Function = v1PrivatePutAlgoOrder
    v1PrivateDeleteOrder::Function = v1PrivateDeleteOrder
    v1PrivateDeleteAlgoOrder::Function = v1PrivateDeleteAlgoOrder
    v1PrivateDeleteClientOrder::Function = v1PrivateDeleteClientOrder
    v1PrivateDeleteAlgoClientOrder::Function = v1PrivateDeleteAlgoClientOrder
    v1PrivateDeleteAlgoOrders::Function = v1PrivateDeleteAlgoOrders
    v1PrivateDeleteOrders::Function = v1PrivateDeleteOrders
    v1PrivateDeleteBatchOrder::Function = v1PrivateDeleteBatchOrder
    v1PrivateDeleteClientBatchOrder::Function = v1PrivateDeleteClientBatchOrder

end
function describe(self::Modetrade, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "modetrade",
    Symbol("name") => "Mode Trade",
    Symbol("countries") => ["KY"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => false,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
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
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1mon",
        Symbol("1y") => "1y"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/bbde7d00-6e40-404f-8f34-8fb15893eb24",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-evm.orderly.org",
            Symbol("private") => "https://api-evm.orderly.org"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://testnet-api-evm.orderly.org",
            Symbol("private") => "https://testnet-api-evm.orderly.org"
        ),
        Symbol("www") => "https://trade.mode.network",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://trade.mode.network?ref=MODETRADE",
            Symbol("discount") => 0.2
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("public/volume/stats") => 1,
                    Symbol("public/broker/name") => 1,
                    Symbol("public/chain_info/{broker_id}") => 1,
                    Symbol("public/system_info") => 1,
                    Symbol("public/vault_balance") => 1,
                    Symbol("public/insurancefund") => 1,
                    Symbol("public/chain_info") => 1,
                    Symbol("faucet/usdc") => 1,
                    Symbol("public/account") => 1,
                    Symbol("get_account") => 1,
                    Symbol("registration_nonce") => 1,
                    Symbol("get_orderly_key") => 1,
                    Symbol("public/liquidation") => 1,
                    Symbol("public/liquidated_positions") => 1,
                    Symbol("public/config") => 1,
                    Symbol("public/campaign/ranking") => 10,
                    Symbol("public/campaign/stats") => 10,
                    Symbol("public/campaign/user") => 10,
                    Symbol("public/campaign/stats/details") => 10,
                    Symbol("public/campaigns") => 10,
                    Symbol("public/points/leaderboard") => 1,
                    Symbol("client/points") => 1,
                    Symbol("public/points/epoch") => 1,
                    Symbol("public/points/epoch_dates") => 1,
                    Symbol("public/referral/check_ref_code") => 1,
                    Symbol("public/referral/verify_ref_code") => 1,
                    Symbol("referral/admin_info") => 1,
                    Symbol("referral/info") => 1,
                    Symbol("referral/referee_info") => 1,
                    Symbol("referral/referee_rebate_summary") => 1,
                    Symbol("referral/referee_history") => 1,
                    Symbol("referral/referral_history") => 1,
                    Symbol("referral/rebate_summary") => 1,
                    Symbol("client/distribution_history") => 1,
                    Symbol("tv/config") => 1,
                    Symbol("tv/history") => 1,
                    Symbol("tv/symbol_info") => 1,
                    Symbol("public/funding_rate_history") => 1,
                    Symbol("public/funding_rate/{symbol}") => 0.33,
                    Symbol("public/funding_rates") => 1,
                    Symbol("public/info") => 1,
                    Symbol("public/info/{symbol}") => 1,
                    Symbol("public/market_trades") => 1,
                    Symbol("public/token") => 1,
                    Symbol("public/futures") => 1,
                    Symbol("public/futures/{symbol}") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("register_account") => 1
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("client/key_info") => 6,
                    Symbol("client/orderly_key_ip_restriction") => 6,
                    Symbol("order/{oid}") => 1,
                    Symbol("client/order/{client_order_id}") => 1,
                    Symbol("algo/order/{oid}") => 1,
                    Symbol("algo/client/order/{client_order_id}") => 1,
                    Symbol("orders") => 1,
                    Symbol("algo/orders") => 1,
                    Symbol("trade/{tid}") => 1,
                    Symbol("trades") => 1,
                    Symbol("order/{oid}/trades") => 1,
                    Symbol("client/liquidator_liquidations") => 1,
                    Symbol("liquidations") => 1,
                    Symbol("asset/history") => 60,
                    Symbol("client/holding") => 1,
                    Symbol("withdraw_nonce") => 1,
                    Symbol("settle_nonce") => 1,
                    Symbol("pnl_settlement/history") => 1,
                    Symbol("volume/user/daily") => 60,
                    Symbol("volume/user/stats") => 60,
                    Symbol("client/statistics") => 60,
                    Symbol("client/info") => 60,
                    Symbol("client/statistics/daily") => 60,
                    Symbol("positions") => 3.33,
                    Symbol("position/{symbol}") => 3.33,
                    Symbol("funding_fee/history") => 30,
                    Symbol("notification/inbox/notifications") => 60,
                    Symbol("notification/inbox/unread") => 60,
                    Symbol("volume/broker/daily") => 60,
                    Symbol("broker/fee_rate/default") => 10,
                    Symbol("broker/user_info") => 10,
                    Symbol("orderbook/{symbol}") => 1,
                    Symbol("kline") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("orderly_key") => 1,
                    Symbol("client/set_orderly_key_ip_restriction") => 6,
                    Symbol("client/reset_orderly_key_ip_restriction") => 6,
                    Symbol("order") => 1,
                    Symbol("batch-order") => 10,
                    Symbol("algo/order") => 1,
                    Symbol("liquidation") => 1,
                    Symbol("claim_insurance_fund") => 1,
                    Symbol("withdraw_request") => 1,
                    Symbol("settle_pnl") => 1,
                    Symbol("notification/inbox/mark_read") => 60,
                    Symbol("notification/inbox/mark_read_all") => 60,
                    Symbol("client/leverage") => 120,
                    Symbol("client/maintenance_config") => 60,
                    Symbol("delegate_signer") => 10,
                    Symbol("delegate_orderly_key") => 10,
                    Symbol("delegate_settle_pnl") => 10,
                    Symbol("delegate_withdraw_request") => 10,
                    Symbol("broker/fee_rate/set") => 10,
                    Symbol("broker/fee_rate/set_default") => 10,
                    Symbol("broker/fee_rate/default") => 10,
                    Symbol("referral/create") => 10,
                    Symbol("referral/update") => 10,
                    Symbol("referral/bind") => 10,
                    Symbol("referral/edit_split") => 10
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("order") => 1,
                    Symbol("algo/order") => 1
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("order") => 1,
                    Symbol("algo/order") => 1,
                    Symbol("client/order") => 1,
                    Symbol("algo/client/order") => 1,
                    Symbol("algo/orders") => 1,
                    Symbol("orders") => 1,
                    Symbol("batch-order") => 1,
                    Symbol("client/batch-order") => 1
                )
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("accountId") => true,
        Symbol("privateKey") => false
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0002"),
            Symbol("taker") => self.parseNumber("0.0005")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("sandboxMode") => false,
        Symbol("brokerId") => "CCXTMODE",
        Symbol("verifyingContractAddress") => "0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("trailing") => true,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
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
                Symbol("triggerPriceType") => nothing,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => nothing,
                    Symbol("price") => false
                )
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => ExchangeError,
            Symbol("-1001") => AuthenticationError,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => BadRequest,
            Symbol("-1005") => BadRequest,
            Symbol("-1006") => InvalidOrder,
            Symbol("-1007") => BadRequest,
            Symbol("-1008") => InvalidOrder,
            Symbol("-1009") => InsufficientFunds,
            Symbol("-1011") => NetworkError,
            Symbol("-1012") => BadRequest,
            Symbol("-1101") => InsufficientFunds,
            Symbol("-1102") => InvalidOrder,
            Symbol("-1103") => InvalidOrder,
            Symbol("-1104") => InvalidOrder,
            Symbol("-1105") => InvalidOrder,
            Symbol("-1201") => BadRequest,
            Symbol("-1202") => BadRequest,
            Symbol("29") => BadRequest,
            Symbol("9") => AuthenticationError,
            Symbol("3") => AuthenticationError,
            Symbol("2") => BadRequest,
            Symbol("15") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function setSandboxMode(self::Modetrade, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function fetchStatus(self::Modetrade, params=Dict())
    response = Base.fetch(self.v1PublicGetPublicSystemInfo(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    status = safeString(data, "status");
    if functions.ccxtruthy(status == nothing)
        status = "error";
    elseif functions.ccxtruthy(status == "0")
        status = "ok";
    else
        status = "maintenance";
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Modetrade, params=Dict())
    response = Base.fetch(self.v1PublicGetPublicSystemInfo(params));
    return safeInteger(response, "timestamp")

end
function parseMarket(self::Modetrade, market)
    marketId = safeString(market, "symbol", "");
    parts = split(marketId, "_");
    marketType = "swap";
    baseId = safeString(parts, 1);
    quoteId = safeString(parts, 2);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = safeString(parts, 2);
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    return Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => marketType,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "base_tick"),
        Symbol("price") => self.safeNumber(market, "quote_tick")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "base_min"),
            Symbol("max") => self.safeNumber(market, "base_max")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quote_min"),
            Symbol("max") => self.safeNumber(market, "quote_max")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_notional"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "created_time"),
    Symbol("info") => market
)

end
function fetchMarkets(self::Modetrade, params=Dict())
    response = Base.fetch(self.v1PublicGetPublicInfo(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseMarkets(rows)

end
function fetchCurrencies(self::Modetrade, params=Dict())
    response = Base.fetch(self.v1PublicGetPublicToken(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    tokenRows = self.safeList(data, "rows", []);
    return self.parseCurrencies(tokenRows)

end
function parseCurrency(self::Modetrade, rawCurrency)
    currencyId = safeString(rawCurrency, "token");
    networks = self.safeList(rawCurrency, "chain_details", []);
    code = self.safeCurrencyCode(currencyId);
    minPrecision = nothing;
    resultingNetworks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networks)))
        network = get(networks, j + 1, nothing);
        networkId = safeString(network, "chain_id", "");
        precision = self.parsePrecision(safeString(network, "decimals"));
        if functions.ccxtruthy(precision != nothing)
            minPrecision = functions.ccxtruthy((minPrecision == nothing)) ? precision : stringMin(precision, minPrecision);
        end
        resultingNetworks[Symbol(networkId)] = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkId,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            ),
            Symbol("active") => nothing,
            Symbol("deposit") => nothing,
            Symbol("withdraw") => nothing,
            Symbol("fee") => self.safeNumber(network, "withdrawal_fee"),
            Symbol("precision") => self.parseNumber(precision),
            Symbol("info") => network
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("name") => currencyId,
    Symbol("code") => code,
    Symbol("precision") => self.parseNumber(minPrecision),
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("networks") => resultingNetworks,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "minimum_withdraw_amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => rawCurrency
))

end
function parseTokenAndFeeTemp(self::Modetrade, item, feeTokenKey, feeAmountKey)
    feeCost = safeString(item, feeAmountKey);
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(item, feeTokenKey);
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return fee

end
function parseTrade(self::Modetrade, trade, market=nothing)
    isFromFetchOrder = (ccxt_in("id", trade));
    timestamp = safeInteger(trade, "executed_timestamp");
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString(trade, "executed_price");
    amount = safeString(trade, "executed_quantity");
    order_id = safeString(trade, "order_id");
    fee = self.parseTokenAndFeeTemp(trade, "fee_asset", "fee");
    feeCost = safeString(fee, "cost");
    if functions.ccxtruthy(@functions.ccxt_and((feeCost != nothing), (fee != nothing)))
        fee[Symbol("cost")] = feeCost;
    end
    cost = stringMul(price, amount);
    side = safeStringLower(trade, "side");
    id = safeString(trade, "id");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isFromFetchOrder)
        isMaker = safeString(trade, "is_maker") == "1";
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("order") => order_id,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("type") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchTrades(self::Modetrade, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v1PublicGetPublicMarketTrades(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseTrades(rows, market, since, limit)

end
function parseFundingRate(self::Modetrade, fundingRate, market=nothing)
    symbol = safeString(fundingRate, "symbol");
    market = functions.ccxtruthy((symbol == nothing)) ? market : self.market(symbol);
    nextFundingTimestamp = safeInteger(fundingRate, "next_funding_time");
    estFundingRateTimestamp = safeInteger(fundingRate, "est_funding_rate_timestamp");
    lastFundingRateTimestamp = safeInteger(fundingRate, "last_funding_rate_timestamp");
    fundingTimeString = safeString(fundingRate, "last_funding_rate_timestamp");
    nextFundingTimeString = safeString(fundingRate, "next_funding_time");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    fundingSymbol = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("symbol"), nothing) : nothing;
    return Dict{Symbol, Any}(
    Symbol("info") => fundingRate,
    Symbol("symbol") => fundingSymbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.parseNumber("0"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => estFundingRateTimestamp,
    Symbol("datetime") => self.iso8601(estFundingRateTimestamp),
    Symbol("fundingRate") => self.safeNumber(fundingRate, "est_funding_rate"),
    Symbol("fundingTimestamp") => nextFundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => self.safeNumber(fundingRate, "last_funding_rate"),
    Symbol("previousFundingTimestamp") => lastFundingRateTimestamp,
    Symbol("previousFundingDatetime") => self.iso8601(lastFundingRateTimestamp),
    Symbol("interval") => self.parseFundingInterval(millisecondsInterval)
)

end
function parseFundingInterval(self::Modetrade, interval)
    intervals = Dict{Symbol, Any}(
        Symbol("3600000") => "1h",
        Symbol("14400000") => "4h",
        Symbol("28800000") => "8h",
        Symbol("57600000") => "16h",
        Symbol("86400000") => "24h"
    );
    return safeString(intervals, interval, interval)

end
function fetchFundingInterval(self::Modetrade, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function fetchFundingRate(self::Modetrade, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetPublicFundingRateSymbol(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseFundingRate(data, market)

end
function fetchFundingRates(self::Modetrade, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.v1PublicGetPublicFundingRates(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseFundingRates(rows, symbols)

end
function fetchFundingRateHistory(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingRateHistory", symbol, since, limit, params, "page", 25))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_t")] = since;
    end
    (request, params) = self.handleUntilOption("end_t", request, params, 0.001);
    response = Base.fetch(self.v1PublicGetPublicFundingRateHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    result = self.safeList(data, "rows", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        timestamp = safeInteger(entry, "funding_rate_timestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId),
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function parseIncome(self::Modetrade, income, market=nothing)
    marketId = safeString(income, "symbol");
    symbol = self.safeSymbol(marketId, market);
    amount = safeString(income, "funding_fee");
    code = self.safeCurrencyCode("USDC");
    timestamp = safeInteger(income, "updated_time");
    rate = self.safeNumber(income, "funding_rate");
    paymentType = safeString(income, "payment_type");
    amount = functions.ccxtruthy((paymentType == "Pay")) ? stringNeg(amount) : amount;
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("rate") => rate
)

end
function fetchFundingHistory(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingHistory", symbol, since, limit, params, "page", 500))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_t")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end_t")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 500);
    end
    response = Base.fetch(self.v1PrivateGetFundingFeeHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseIncomes(rows, market, since, limit)

end
function fetchTradingFees(self::Modetrade, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivateGetClientInfo(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    maker = safeString(data, "futures_maker_fee_rate");
    taker = safeString(data, "futures_taker_fee_rate");
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    if functions.ccxtruthy(symbols != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            result[Symbol(symbol)] = Dict{Symbol, Any}(
                Symbol("info") => response,
                Symbol("symbol") => symbol,
                Symbol("maker") => self.parseNumber(stringDiv(maker, "10000")),
                Symbol("taker") => self.parseNumber(stringDiv(taker, "10000")),
                Symbol("percentage") => true,
                Symbol("tierBased") => true
            );
            i += 1
        end

    end
    return result

end
function fetchOrderBook(self::Modetrade, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        limit = min(limit, 1000);
        request[Symbol("max_level")] = limit;
    end
    response = Base.fetch(self.v1PrivateGetOrderbookSymbol(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = safeInteger(data, "timestamp");
    return self.parseOrderBook(data, symbol, timestamp, "bids", "asks", "price", "quantity")

end
function parseOHLCV(self::Modetrade, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "start_timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchOHLCV(self::Modetrade, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = Base.fetch(self.v1PrivateGetKline(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseOHLCVs(rows, market, timeframe, since, limit)

end
function parseOrder(self::Modetrade, order, market=nothing)
    timestamp = safeIntegerN(order, ["timestamp", "created_time", "createdTime"]);
    orderId = safeStringN(order, ["order_id", "orderId", "algoOrderId"]);
    clientOrderId = omitZero(safeString2(order, "client_order_id", "clientOrderId"));
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString2(order, "order_price", "price");
    amount = safeString2(order, "order_quantity", "quantity");
    cost = safeString2(order, "order_amount", "amount");
    orderType = safeStringLower2(order, "order_type", "type");
    status = safeValue2(order, "status", "algoStatus");
    success = self.safeBool(order, "success");
    if functions.ccxtruthy(success != nothing)
        status = functions.ccxtruthy((success)) ? "NEW" : "REJECTED";
    end
    side = safeStringLower(order, "side");
    filled = omitZero(safeValue2(order, "executed", "totalExecutedQuantity"));
    average = omitZero(safeString2(order, "average_executed_price", "averageExecutedPrice"));
    remaining = stringSub(cost, filled);
    fee = safeValue2(order, "total_fee", "totalFee");
    feeCurrency = safeString2(order, "fee_asset", "feeAsset");
    transactions = safeValue(order, "Transactions");
    triggerPrice = self.safeNumber(order, "triggerPrice");
    takeProfitPrice = nothing;
    stopLossPrice = nothing;
    childOrders = safeValue(order, "childOrders");
    if functions.ccxtruthy(childOrders != nothing)
        first_var = safeValue(childOrders, 0);
        innerChildOrders = safeValue(first_var, "childOrders", []);
        innerChildOrdersLength = length(innerChildOrders);
        if functions.ccxtruthy(functions.ccxt_gt(innerChildOrdersLength, 0))
            takeProfitOrder = safeValue(innerChildOrders, 0);
            stopLossOrder = safeValue(innerChildOrders, 1);
            takeProfitPrice = self.safeNumber(takeProfitOrder, "triggerPrice");
            stopLossPrice = self.safeNumber(stopLossOrder, "triggerPrice");
        end
    end
    lastUpdateTimestamp = safeInteger2(order, "updatedTime", "updated_time");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(orderType),
    Symbol("timeInForce") => self.parseTimeInForce(orderType),
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool(order, "reduce_only"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("cost") => cost,
    Symbol("trades") => transactions,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => fee,
        Symbol("currency") => feeCurrency
    ),
    Symbol("info") => order
), market)

end
function parseTimeInForce(self::Modetrade, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("ioc") => "IOC",
        Symbol("fok") => "FOK",
        Symbol("post_only") => "PO"
    );
    if functions.ccxtruthy(timeInForce == nothing)
            return nothing
    end
    return safeString(timeInForces, timeInForce)

end
function parseOrderStatus(self::Modetrade, status)
    if functions.ccxtruthy(status != nothing)
        statuses = Dict{Symbol, Any}(
            Symbol("NEW") => "open",
            Symbol("FILLED") => "closed",
            Symbol("CANCEL_SENT") => "canceled",
            Symbol("CANCEL_ALL_SENT") => "canceled",
            Symbol("CANCELLED") => "canceled",
            Symbol("PARTIAL_FILLED") => "open",
            Symbol("REJECTED") => "rejected",
            Symbol("INCOMPLETE") => "open",
            Symbol("COMPLETED") => "closed"
        );
        if functions.ccxtruthy(status == nothing)
                return nothing
        end
            return safeString(statuses, status, status)
    end
    return status

end
function parseOrderType(self::Modetrade, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("POST_ONLY") => "limit"
    );
    if functions.ccxtruthy(type_var == nothing)
            return nothing
    end
    return safeStringLower(types, type_var, type_var)

end
function createOrderRequest(self::Modetrade, symbol, type_var, side, amount, price=nothing, params=Dict())
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    orderType = uppercase(type_var);
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    orderSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide
    );
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    algoType = safeString(params, "algoType");
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(triggerPrice != nothing, hasStopLoss), hasTakeProfit), (safeValue(params, "childOrders") != nothing));
    isMarket = orderType == "MARKET";
    timeInForce = safeStringLower(params, "timeInForce");
    postOnly = self.isPostOnly(isMarket, nothing, params);
    orderQtyKey = functions.ccxtruthy(isConditional) ? "quantity" : "order_quantity";
    priceKey = functions.ccxtruthy(isConditional) ? "price" : "order_price";
    typeKey = functions.ccxtruthy(isConditional) ? "type" : "order_type";
    request[Symbol(typeKey)] = orderType;
    if functions.ccxtruthy(!functions.ccxtruthy(isConditional))
        if functions.ccxtruthy(postOnly)
            request[Symbol("order_type")] = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "fok")
            request[Symbol("order_type")] = "FOK";
        else
            if functions.ccxtruthy(timeInForce == "ioc")
                request[Symbol("order_type")] = "IOC";
            end

        end
    end
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduce_only")] = reduceOnly;
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol(priceKey)] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(@functions.ccxt_and(isMarket, !functions.ccxtruthy(isConditional)))
        request[Symbol(orderQtyKey)] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(algoType != "POSITIONAL_TP_SL")
        request[Symbol(orderQtyKey)] = self.amountToPrecision(symbol, amount);
    end
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("algo_type")] = "STOP";
    elseif functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        request[Symbol("algo_type")] = "TP_SL";
        outterOrder = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing),
            Symbol("reduce_only") => false,
            Symbol("algo_type") => "POSITIONAL_TP_SL",
            Symbol("child_orders") => []
        );
        childOrders = get(outterOrder, Symbol("child_orders"), nothing);
        closeSide = functions.ccxtruthy((orderSide == "BUY")) ? "SELL" : "BUY";
        if functions.ccxtruthy(hasStopLoss)
            stopLossPrice = self.safeNumber2(stopLoss, "triggerPrice", "price", stopLoss);
            stopLossOrder = Dict{Symbol, Any}(
                Symbol("side") => closeSide,
                Symbol("algo_type") => "TP_SL",
                Symbol("trigger_price") => self.priceToPrecision(symbol, stopLossPrice),
                Symbol("type") => "LIMIT",
                Symbol("reduce_only") => true
            );
                        push!(childOrders, stopLossOrder);
        end
        if functions.ccxtruthy(hasTakeProfit)
            takeProfitPrice = self.safeNumber2(takeProfit, "triggerPrice", "price", takeProfit);
            takeProfitOrder = Dict{Symbol, Any}(
                Symbol("side") => closeSide,
                Symbol("algo_type") => "TP_SL",
                Symbol("trigger_price") => self.priceToPrecision(symbol, takeProfitPrice),
                Symbol("type") => "LIMIT",
                Symbol("reduce_only") => true
            );
                        push!(outterOrder, takeProfitOrder);
        end
        request[Symbol("child_orders")] = [outterOrder];
    end
    params = omit(params, ["reduceOnly", "reduce_only", "clOrdID", "clientOrderId", "client_order_id", "postOnly", "timeInForce", "stopPrice", "triggerPrice", "stopLoss", "takeProfit"]);
    return extend(request, params)

end
function createOrder(self::Modetrade, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(triggerPrice != nothing, stopLoss != nothing), takeProfit != nothing), (safeValue(params, "childOrders") != nothing));
    response = nothing;
    if functions.ccxtruthy(isConditional)
        response = Base.fetch(self.v1PrivatePostAlgoOrder(request));
    else
        response = Base.fetch(self.v1PrivatePostOrder(request));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    data[Symbol("timestamp")] = safeInteger(response, "timestamp");
    order = self.parseOrder(data, market);
    order[Symbol("type")] = type_var;
    return order

end
function createOrders(self::Modetrade, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(marketId == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrders() requires a symbol for each order")));
        end
        type_var = safeString(rawOrder, "type", "");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        triggerPrice = safeString2(orderParams, "triggerPrice", "stopPrice");
        stopLoss = safeValue(orderParams, "stopLoss");
        takeProfit = safeValue(orderParams, "takeProfit");
        isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(triggerPrice != nothing, stopLoss != nothing), takeProfit != nothing), (safeValue(orderParams, "childOrders") != nothing));
        if functions.ccxtruthy(isConditional)
            throw(NotSupported(string(self.id, " createOrders() only support non-stop order")));
        end
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("orders") => ordersRequests
    );
    response = Base.fetch(self.v1PrivatePostBatchOrder(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseOrders(rows)

end
function editOrder(self::Modetrade, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "takeProfitPrice", "stopLossPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    end
    isConditional = @functions.ccxt_or((triggerPrice != nothing), (safeValue(params, "childOrders") != nothing));
    orderQtyKey = functions.ccxtruthy(isConditional) ? "quantity" : "order_quantity";
    priceKey = functions.ccxtruthy(isConditional) ? "price" : "order_price";
    if functions.ccxtruthy(price != nothing)
        request[Symbol(priceKey)] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol(orderQtyKey)] = self.amountToPrecision(symbol, amount);
    end
    params = omit(params, ["stopPrice", "triggerPrice", "takeProfitPrice", "stopLossPrice", "trailingTriggerPrice", "trailingAmount", "trailingPercent"]);
    response = nothing;
    if functions.ccxtruthy(isConditional)
        response = Base.fetch(self.v1PrivatePutAlgoOrder(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(side != nothing)
            request[Symbol("side")] =             uppercase(side);
        end
        orderType = uppercase(type_var);
        timeInForce = safeStringLower(params, "timeInForce");
        isMarket = orderType == "MARKET";
        postOnly = self.isPostOnly(isMarket, nothing, params);
        if functions.ccxtruthy(postOnly)
            request[Symbol("order_type")] = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "fok")
            request[Symbol("order_type")] = "FOK";
        else
            if functions.ccxtruthy(timeInForce == "ioc")
                request[Symbol("order_type")] = "IOC";
            else
                request[Symbol("order_type")] = orderType;
            end

        end
        clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
        params = omit(params, ["clOrdID", "clientOrderId", "client_order_id", "postOnly", "timeInForce"]);
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("client_order_id")] = clientOrderId;
        end
        response = Base.fetch(self.v1PrivatePutOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    data[Symbol("timestamp")] = safeInteger(response, "timestamp");
    return self.parseOrder(data, market)

end
function cancelOrder(self::Modetrade, id, symbol=nothing, params=Dict())
    trigger = self.safeBool2(params, "stop", "trigger", false);
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(trigger), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id")
    );
    clientOrderIdUnified = safeString2(params, "clOrdID", "clientOrderId");
    clientOrderIdExchangeSpecific = safeString(params, "client_order_id", clientOrderIdUnified);
    isByClientOrder = clientOrderIdExchangeSpecific != nothing;
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("client_order_id")] = clientOrderIdExchangeSpecific;
            params = omit(params, ["clOrdID", "clientOrderId", "client_order_id"]);
            response = Base.fetch(self.v1PrivateDeleteAlgoClientOrder(extend(request, params)));
        else
            request[Symbol("order_id")] = id;
            response = Base.fetch(self.v1PrivateDeleteAlgoOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("client_order_id")] = clientOrderIdExchangeSpecific;
            params = omit(params, ["clOrdID", "clientOrderId", "client_order_id"]);
            response = Base.fetch(self.v1PrivateDeleteClientOrder(extend(request, params)));
        else
            request[Symbol("order_id")] = id;
            response = Base.fetch(self.v1PrivateDeleteOrder(extend(request, params)));
        end
    end
    extendParams = Dict{Symbol, Any}(
        Symbol("symbol") => symbol
    );
    if functions.ccxtruthy(isByClientOrder)
        extendParams[Symbol("client_order_id")] = clientOrderIdExchangeSpecific;
    else
        extendParams[Symbol("id")] = id;
    end
    if functions.ccxtruthy(trigger)
            return extend(self.parseOrder(response), extendParams)
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return extend(self.parseOrder(data), extendParams)

end
function cancelOrders(self::Modetrade, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderIds = self.safeListN(params, ["clOrdIDs", "clientOrderIds", "client_order_ids"]);
    params = omit(params, ["clOrdIDs", "clientOrderIds", "client_order_ids"]);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(clientOrderIds)
        request[Symbol("client_order_ids")] =         join(clientOrderIds, ",");
        response = Base.fetch(self.v1PrivateDeleteClientBatchOrder(extend(request, params)));
    else
        request[Symbol("order_ids")] =         join(ids, ",");
        response = Base.fetch(self.v1PrivateDeleteBatchOrder(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelAllOrders(self::Modetrade, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = Base.fetch(self.v1PrivateDeleteAlgoOrders(extend(request, params)));
    else
        response = Base.fetch(self.v1PrivateDeleteOrders(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrder(self::Modetrade, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    trigger = self.safeBool2(params, "stop", "trigger", false);
    request = Dict{Symbol, Any}();
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    params = omit(params, ["stop", "trigger", "clOrdID", "clientOrderId", "client_order_id"]);
    response = nothing;
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(clientOrderId)
            request[Symbol("client_order_id")] = clientOrderId;
            response = Base.fetch(self.v1PrivateGetAlgoClientOrderClientOrderId(extend(request, params)));
        else
            request[Symbol("oid")] = id;
            response = Base.fetch(self.v1PrivateGetAlgoOrderOid(extend(request, params)));
        end
    else
        if functions.ccxtruthy(clientOrderId)
            request[Symbol("client_order_id")] = clientOrderId;
            response = Base.fetch(self.v1PrivateGetClientOrderClientOrderId(extend(request, params)));
        else
            request[Symbol("oid")] = id;
            response = Base.fetch(self.v1PrivateGetOrderOid(extend(request, params)));
        end
    end
    orders = self.safeDict(response, "data", response);
    return self.parseOrder(orders, market)

end
function fetchOrders(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    isTrigger = self.safeBool2(params, "stop", "trigger", false);
    maxLimit = functions.ccxtruthy((isTrigger)) ? 100 : 500;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchOrders", symbol, since, limit, params, "page", maxLimit))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_t")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    else
        request[Symbol("size")] = maxLimit;
    end
    if functions.ccxtruthy(isTrigger)
        request[Symbol("algo_type")] = "STOP";
    end
    (request, params) = self.handleUntilOption("end_t", request, params);
    response = nothing;
    if functions.ccxtruthy(isTrigger)
        response = Base.fetch(self.v1PrivateGetAlgoOrders(extend(request, params)));
    else
        response = Base.fetch(self.v1PrivateGetOrders(extend(request, params)));
    end
    data = safeValue(response, "data", response);
    orders = self.safeList(data, "rows", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "INCOMPLETE"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function fetchClosedOrders(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "COMPLETED"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function fetchOrderTrades(self::Modetrade, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("oid") => id
    );
    response = Base.fetch(self.v1PrivateGetOrderOidTrades(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "rows", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchMyTrades(self::Modetrade, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchMyTrades", symbol, since, limit, params, "page", 500))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_t")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    else
        request[Symbol("size")] = 500;
    end
    (request, params) = self.handleUntilOption("end_t", request, params);
    response = Base.fetch(self.v1PrivateGetTrades(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "rows", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function parseBalance(self::Modetrade, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "holding", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        code = self.safeCurrencyCode(safeString(balance, "token"));
        account = self.account();
        account[Symbol("total")] = safeString(balance, "holding");
        account[Symbol("used")] = safeString(balance, "frozen");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Modetrade, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivateGetClientHolding(params));
    data = self.safeDict(response, "data");
    return self.parseBalance(data)

end
function getAssetHistoryRows(self::Modetrade, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("balance_token")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_t")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    transactionType = safeString(params, "type");
    params = omit(params, "type");
    if functions.ccxtruthy(transactionType != nothing)
        request[Symbol("type")] = transactionType;
    end
    response = Base.fetch(self.v1PrivateGetAssetHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return [currency, self.safeList(data, "rows", [])]

end
function parseLedgerEntry(self::Modetrade, item, currency=nothing)
    currencyId = safeString(item, "token");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    amount = self.safeNumber(item, "amount");
    side = safeString(item, "token_side");
    direction = functions.ccxtruthy((side == "DEPOSIT")) ? "in" : "out";
    timestamp = safeInteger(item, "created_time");
    fee = self.parseTokenAndFeeTemp(item, "fee_token", "fee_amount");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("id") => safeString(item, "id"),
    Symbol("currency") => code,
    Symbol("account") => safeString(item, "account"),
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => safeString(item, "tx_id"),
    Symbol("status") => self.parseTransactionStatus(safeString(item, "status")),
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("fee") => fee,
    Symbol("direction") => direction,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("info") => item
), currency)

end
function parseLedgerEntryType(self::Modetrade, type_var)
    types = Dict{Symbol, Any}(
        Symbol("BALANCE") => "transaction",
        Symbol("COLLATERAL") => "transfer"
    );
    return safeString(types, type_var, type_var)

end
function fetchLedger(self::Modetrade, code=nothing, since=nothing, limit=nothing, params=Dict())
    currencyRows = Base.fetch(self.getAssetHistoryRows(code, since, limit, params));
    currency = safeValue(currencyRows, 0);
    rows = self.safeList(currencyRows, 1);
    return self.parseLedger(rows, currency, since, limit, params)

end
function parseTransaction(self::Modetrade, transaction, currency=nothing)
    code = safeString(transaction, "token");
    movementDirection = safeStringLower(transaction, "token_side");
    if functions.ccxtruthy(movementDirection == "withdraw")
        movementDirection = "withdrawal";
    end
    fee = self.parseTokenAndFeeTemp(transaction, "fee_token", "fee_amount");
    addressTo = safeString(transaction, "target_address");
    addressFrom = safeString(transaction, "source_address");
    timestamp = safeInteger(transaction, "created_time");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "id", "withdraw_id"),
    Symbol("txid") => safeString(transaction, "tx_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => safeString(transaction, "extra"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => movementDirection,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => safeInteger(transaction, "updated_time"),
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee,
    Symbol("network") => nothing
)

end
function parseTransactionStatus(self::Modetrade, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "pending",
        Symbol("CONFIRMING") => "pending",
        Symbol("PROCESSING") => "pending",
        Symbol("COMPLETED") => "ok",
        Symbol("CANCELED") => "canceled"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function fetchDeposits(self::Modetrade, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("side") => "DEPOSIT"
    );
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, extend(request, params)))

end
function fetchWithdrawals(self::Modetrade, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("side") => "WITHDRAW"
    );
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, extend(request, params)))

end
function fetchDepositsWithdrawals(self::Modetrade, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    currencyRows = Base.fetch(self.getAssetHistoryRows(code, since, limit, extend(request, params)));
    currency = safeValue(currencyRows, 0);
    rows = self.safeList(currencyRows, 1, []);
    return self.parseTransactions(rows, currency, since, limit, params)

end
function getWithdrawNonce(self::Modetrade, params=Dict())
    response = Base.fetch(self.v1PrivateGetWithdrawNonce(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.safeNumber(data, "withdraw_nonce")

end
function hashMessage(self::Modetrade, message)
    return string("0x", hash(message, keccak, "hex"))

end
function signHash(self::Modetrade, hash, privateKey)
    signature = ecdsa(hash[-64 + 1:end], privateKey[-64 + 1:end], secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing)));
    return string("0x", lpad(r, 64, "0"), lpad(s, 64, "0"), v)

end
function signMessage(self::Modetrade, message, privateKey)
    return self.signHash(self.hashMessage(message), privateKey[-64 + 1:end])

end
function withdraw(self::Modetrade, code, amount, address, tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    if functions.ccxtruthy(code != nothing)
        code = uppercase(code);
        if functions.ccxtruthy(code != "USDC")
            throw(NotSupported(string(self.id, " withdraw() only support USDC")));
        end
    end
    currency = self.currency(code);
    verifyingContractAddress = safeString(self.options, "verifyingContractAddress");
    chainId = safeString(params, "chainId");
    currencyNetworks = self.safeDict(currency, "networks", Dict{Symbol, Any}());
    coinNetwork = functions.ccxtruthy((chainId == nothing)) ? Dict{Symbol, Any}() : self.safeDict(currencyNetworks, chainId, Dict{Symbol, Any}());
    coinNetworkId = self.safeNumber(coinNetwork, "id");
    if functions.ccxtruthy(coinNetworkId == nothing)
        throw(BadRequest(string(self.id, " withdraw() require chainId parameter")));
    end
    withdrawNonce = Base.fetch(self.getWithdrawNonce(params));
    nonce = self.nonce();
    domain = Dict{Symbol, Any}(
        Symbol("chainId") => chainId,
        Symbol("name") => "Orderly",
        Symbol("verifyingContract") => verifyingContractAddress,
        Symbol("version") => "1"
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("Withdraw") => [Dict{Symbol, Any}(
        Symbol("name") => "brokerId",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "chainId",
        Symbol("type") => "uint256"
    ), Dict{Symbol, Any}(
        Symbol("name") => "receiver",
        Symbol("type") => "address"
    ), Dict{Symbol, Any}(
        Symbol("name") => "token",
        Symbol("type") => "string"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "uint256"
    ), Dict{Symbol, Any}(
        Symbol("name") => "withdrawNonce",
        Symbol("type") => "uint64"
    ), Dict{Symbol, Any}(
        Symbol("name") => "timestamp",
        Symbol("type") => "uint64"
    )]
    );
    withdrawRequest = Dict{Symbol, Any}(
        Symbol("brokerId") => safeString(self.options, "keyBrokerId", "mode"),
        Symbol("chainId") => self.parseToInt(chainId),
        Symbol("receiver") => address,
        Symbol("token") => code,
        Symbol("amount") => string(amount),
        Symbol("withdrawNonce") => withdrawNonce,
        Symbol("timestamp") => nonce
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, withdrawRequest);
    signature = self.signMessage(msg, self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("signature") => signature,
        Symbol("userAddress") => address,
        Symbol("verifyingContract") => verifyingContractAddress,
        Symbol("message") => withdrawRequest
    );
    params = omit(params, "chainId");
    response = Base.fetch(self.v1PrivatePostWithdrawRequest(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransaction(data, currency)

end
function parseLeverage(self::Modetrade, leverage, market=nothing)
    leverageValue = safeInteger(leverage, "max_leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function fetchLeverage(self::Modetrade, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Base.fetch(self.v1PrivateGetClientInfo(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function setLeverage(self::Modetrade, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isMinLeverage = functions.ccxt_lt(leverage, 1);
    isMaxLeverage = functions.ccxt_gt(leverage, 50);
    if functions.ccxtruthy(@functions.ccxt_or(isMinLeverage, isMaxLeverage))
        throw(BadRequest(string(self.id, " leverage should be between 1 and 50")));
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.v1PrivatePostClientLeverage(extend(request, params)))

end
function parsePosition(self::Modetrade, position, market=nothing)
    contract = safeString(position, "symbol");
    market = self.safeMarket(contract, market);
    size_var = safeString(position, "position_qty");
    side = nothing;
    if functions.ccxtruthy(stringGt(size_var, "0"))
        side = "long";
    else
        side = "short";
    end
    contractSize = safeString(market, "contractSize");
    markPrice = safeString(position, "mark_price");
    timestamp = safeInteger(position, "timestamp");
    entryPrice = safeString(position, "average_open_price");
    unrealisedPnl = safeString(position, "unsettled_pnl");
    size_var = stringAbs(size_var);
    notional = stringMul(size_var, markPrice);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("entryPrice") => self.parseNumber(entryPrice),
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => nothing,
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "est_liq_price"),
    Symbol("markPrice") => self.parseNumber(markPrice),
    Symbol("lastPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginMode") => "cross",
    Symbol("marginType") => nothing,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("hedged") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchPosition(self::Modetrade, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPosition() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PrivateGetPositionSymbol(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parsePosition(data, market)

end
function fetchPositions(self::Modetrade, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PrivateGetPositions(params));
    result = self.safeDict(response, "data", Dict{Symbol, Any}());
    positions = self.safeList(result, "rows", []);
    return self.parsePositions(positions, symbols)

end
function nonce(self::Modetrade, )
    return milliseconds()

end
function sign(self::Modetrade, path, section="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    version = get(section, 1, nothing);
    access = get(section, 2, nothing);
    pathWithParams = self.implodeParams(path, params);
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(access), nothing), "/", version, "/");
    params = omit(params, self.extractParams(path));
    params = keysort(params);
    if functions.ccxtruthy(access == "public")
        url += pathWithParams;
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        self.checkRequiredCredentials();
        isPostOrPut = @functions.ccxt_or(method == "POST", method == "PUT");
        isOrder = @functions.ccxt_or(@functions.ccxt_or(path == "algo/order", path == "order"), path == "batch-order");
        if functions.ccxtruthy(@functions.ccxt_and(isPostOrPut, isOrder))
            isSandboxMode = self.safeBool(self.options, "sandboxMode", false);
            if functions.ccxtruthy(!functions.ccxtruthy(isSandboxMode))
                brokerId = safeString(self.options, "brokerId", "CCXTMODE");
                if functions.ccxtruthy(path == "batch-order")
                    ordersList = self.safeList(params, "orders", []);
                    i = 0
                    while functions.ccxtruthy(functions.ccxt_lt(i, length(ordersList)))
                        params[Symbol("orders")][i + 1][Symbol("order_tag")] = brokerId;
                        i += 1
                    end

                else
                    params[Symbol("order_tag")] = brokerId;
                end
            end
            params = keysort(params);
        end
        auth = "";
        ts = string(self.nonce());
        url += pathWithParams;
        apiKey = self.apiKey;
        if functions.ccxtruthy(findfirst("ed25519:", apiKey) === nothing)
            apiKey = string("ed25519:", apiKey);
        end
        headers = Dict{Symbol, Any}(
            Symbol("orderly-account-id") => self.accountId,
            Symbol("orderly-key") => apiKey,
            Symbol("orderly-timestamp") => ts
        );
        auth = string(ts, method, "/", version, "/", pathWithParams);
        if functions.ccxtruthy(@functions.ccxt_or(method == "POST", method == "PUT"))
            body = json(params);
            auth += body;
            headers[Symbol("content-type")] = "application/json";
        else
            if functions.ccxtruthy(length(objectKeys(params)))
                url += string("?", self.urlencode(params));
                auth += string("?", self.rawencode(params));
            end
            headers[Symbol("content-type")] = "application/x-www-form-urlencoded";
            if functions.ccxtruthy(method == "DELETE")
                body = "";
            end
        end
        secret = self.secret;
        if functions.ccxtruthy(findfirst("ed25519:", secret) !== nothing)
            parts = split(secret, "ed25519:");
            secret = get(parts, 2, nothing);
        end
        signature = eddsa(self.encode(auth), self.base58ToBinary(secret), ed25519);
        headers[Symbol("orderly-signature")] = self.urlencodeBase64(self.base64ToBinary(signature));
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Modetrade, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    success = self.safeBool(response, "success");
    errorCode = safeString(response, "code");
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        feedback = string(self.id, " ", json(response));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Modetrade, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetPublicVolumeStats(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/volume/stats", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicBrokerName(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/broker/name", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicChainInfoBrokerId(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/chain_info/{broker_id}", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicSystemInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/system_info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicVaultBalance(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/vault_balance", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicInsurancefund(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/insurancefund", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicChainInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/chain_info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetFaucetUsdc(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "faucet/usdc", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicAccount(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/account", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetGetAccount(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "get_account", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetRegistrationNonce(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "registration_nonce", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetGetOrderlyKey(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "get_orderly_key", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicLiquidation(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/liquidation", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicLiquidatedPositions(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/liquidated_positions", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicConfig(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/config", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicCampaignRanking(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/campaign/ranking", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PublicGetPublicCampaignStats(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/campaign/stats", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PublicGetPublicCampaignUser(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/campaign/user", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PublicGetPublicCampaignStatsDetails(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/campaign/stats/details", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PublicGetPublicCampaigns(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/campaigns", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PublicGetPublicPointsLeaderboard(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/points/leaderboard", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetClientPoints(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/points", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicPointsEpoch(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/points/epoch", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicPointsEpochDates(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/points/epoch_dates", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicReferralCheckRefCode(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/referral/check_ref_code", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicReferralVerifyRefCode(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/referral/verify_ref_code", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralAdminInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/admin_info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralRefereeInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/referee_info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralRefereeRebateSummary(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/referee_rebate_summary", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralRefereeHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/referee_history", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralReferralHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/referral_history", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetReferralRebateSummary(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/rebate_summary", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetClientDistributionHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/distribution_history", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetTvConfig(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "tv/config", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetTvHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "tv/history", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetTvSymbolInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "tv/symbol_info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicFundingRateHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/funding_rate_history", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicFundingRateSymbol(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/funding_rate/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.33))
end

function v1PublicGetPublicFundingRates(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/funding_rates", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicInfoSymbol(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/info/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicMarketTrades(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/market_trades", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicToken(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/token", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicFutures(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/futures", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetPublicFuturesSymbol(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "public/futures/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicPostRegisterAccount(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "register_account", ["v1", "public"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetClientKeyInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/key_info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v1PrivateGetClientOrderlyKeyIpRestriction(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/orderly_key_ip_restriction", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v1PrivateGetOrderOid(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "order/{oid}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetClientOrderClientOrderId(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/order/{client_order_id}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetAlgoOrderOid(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/order/{oid}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetAlgoClientOrderClientOrderId(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/client/order/{client_order_id}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetOrders(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetAlgoOrders(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/orders", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetTradeTid(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "trade/{tid}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetTrades(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "trades", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetOrderOidTrades(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "order/{oid}/trades", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetClientLiquidatorLiquidations(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/liquidator_liquidations", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetLiquidations(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "liquidations", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetAssetHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "asset/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetClientHolding(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/holding", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetWithdrawNonce(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "withdraw_nonce", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetSettleNonce(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "settle_nonce", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetPnlSettlementHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "pnl_settlement/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetVolumeUserDaily(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "volume/user/daily", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetVolumeUserStats(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "volume/user/stats", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetClientStatistics(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/statistics", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetClientInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetClientStatisticsDaily(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/statistics/daily", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetPositions(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "positions", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function v1PrivateGetPositionSymbol(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "position/{symbol}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function v1PrivateGetFundingFeeHistory(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "funding_fee/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function v1PrivateGetNotificationInboxNotifications(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "notification/inbox/notifications", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetNotificationInboxUnread(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "notification/inbox/unread", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetVolumeBrokerDaily(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "volume/broker/daily", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivateGetBrokerFeeRateDefault(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "broker/fee_rate/default", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivateGetBrokerUserInfo(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "broker/user_info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivateGetOrderbookSymbol(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "orderbook/{symbol}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetKline(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "kline", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostOrderlyKey(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "orderly_key", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostClientSetOrderlyKeyIpRestriction(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/set_orderly_key_ip_restriction", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v1PrivatePostClientResetOrderlyKeyIpRestriction(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/reset_orderly_key_ip_restriction", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function v1PrivatePostOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "order", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostBatchOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "batch-order", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostAlgoOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/order", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostLiquidation(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "liquidation", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostClaimInsuranceFund(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "claim_insurance_fund", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostWithdrawRequest(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "withdraw_request", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostSettlePnl(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "settle_pnl", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostNotificationInboxMarkRead(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "notification/inbox/mark_read", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivatePostNotificationInboxMarkReadAll(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "notification/inbox/mark_read_all", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivatePostClientLeverage(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/leverage", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 120))
end

function v1PrivatePostClientMaintenanceConfig(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/maintenance_config", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function v1PrivatePostDelegateSigner(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "delegate_signer", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostDelegateOrderlyKey(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "delegate_orderly_key", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostDelegateSettlePnl(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "delegate_settle_pnl", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostDelegateWithdrawRequest(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "delegate_withdraw_request", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostBrokerFeeRateSet(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "broker/fee_rate/set", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostBrokerFeeRateSetDefault(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "broker/fee_rate/set_default", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostBrokerFeeRateDefault(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "broker/fee_rate/default", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostReferralCreate(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/create", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostReferralUpdate(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/update", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostReferralBind(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/bind", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePostReferralEditSplit(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "referral/edit_split", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v1PrivatePutOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "order", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePutAlgoOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/order", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteAlgoOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteClientOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteAlgoClientOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/client/order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteAlgoOrders(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "algo/orders", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteOrders(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteBatchOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "batch-order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateDeleteClientBatchOrder(self::Modetrade, params=Dict(), context=Dict())
    return request(self, "client/batch-order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Modetrade(; kwargs...)
    inst = Modetrade(Exchange(), describe, setSandboxMode, fetchStatus, fetchTime, parseMarket, fetchMarkets, fetchCurrencies, parseCurrency, parseTokenAndFeeTemp, parseTrade, fetchTrades, parseFundingRate, parseFundingInterval, fetchFundingInterval, fetchFundingRate, fetchFundingRates, fetchFundingRateHistory, parseIncome, fetchFundingHistory, fetchTradingFees, fetchOrderBook, parseOHLCV, fetchOHLCV, parseOrder, parseTimeInForce, parseOrderStatus, parseOrderType, createOrderRequest, createOrder, createOrders, editOrder, cancelOrder, cancelOrders, cancelAllOrders, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchOrderTrades, fetchMyTrades, parseBalance, fetchBalance, getAssetHistoryRows, parseLedgerEntry, parseLedgerEntryType, fetchLedger, parseTransaction, parseTransactionStatus, fetchDeposits, fetchWithdrawals, fetchDepositsWithdrawals, getWithdrawNonce, hashMessage, signHash, signMessage, withdraw, parseLeverage, fetchLeverage, setLeverage, parsePosition, fetchPosition, fetchPositions, nonce, sign, handleErrors, v1PublicGetPublicVolumeStats, v1PublicGetPublicBrokerName, v1PublicGetPublicChainInfoBrokerId, v1PublicGetPublicSystemInfo, v1PublicGetPublicVaultBalance, v1PublicGetPublicInsurancefund, v1PublicGetPublicChainInfo, v1PublicGetFaucetUsdc, v1PublicGetPublicAccount, v1PublicGetGetAccount, v1PublicGetRegistrationNonce, v1PublicGetGetOrderlyKey, v1PublicGetPublicLiquidation, v1PublicGetPublicLiquidatedPositions, v1PublicGetPublicConfig, v1PublicGetPublicCampaignRanking, v1PublicGetPublicCampaignStats, v1PublicGetPublicCampaignUser, v1PublicGetPublicCampaignStatsDetails, v1PublicGetPublicCampaigns, v1PublicGetPublicPointsLeaderboard, v1PublicGetClientPoints, v1PublicGetPublicPointsEpoch, v1PublicGetPublicPointsEpochDates, v1PublicGetPublicReferralCheckRefCode, v1PublicGetPublicReferralVerifyRefCode, v1PublicGetReferralAdminInfo, v1PublicGetReferralInfo, v1PublicGetReferralRefereeInfo, v1PublicGetReferralRefereeRebateSummary, v1PublicGetReferralRefereeHistory, v1PublicGetReferralReferralHistory, v1PublicGetReferralRebateSummary, v1PublicGetClientDistributionHistory, v1PublicGetTvConfig, v1PublicGetTvHistory, v1PublicGetTvSymbolInfo, v1PublicGetPublicFundingRateHistory, v1PublicGetPublicFundingRateSymbol, v1PublicGetPublicFundingRates, v1PublicGetPublicInfo, v1PublicGetPublicInfoSymbol, v1PublicGetPublicMarketTrades, v1PublicGetPublicToken, v1PublicGetPublicFutures, v1PublicGetPublicFuturesSymbol, v1PublicPostRegisterAccount, v1PrivateGetClientKeyInfo, v1PrivateGetClientOrderlyKeyIpRestriction, v1PrivateGetOrderOid, v1PrivateGetClientOrderClientOrderId, v1PrivateGetAlgoOrderOid, v1PrivateGetAlgoClientOrderClientOrderId, v1PrivateGetOrders, v1PrivateGetAlgoOrders, v1PrivateGetTradeTid, v1PrivateGetTrades, v1PrivateGetOrderOidTrades, v1PrivateGetClientLiquidatorLiquidations, v1PrivateGetLiquidations, v1PrivateGetAssetHistory, v1PrivateGetClientHolding, v1PrivateGetWithdrawNonce, v1PrivateGetSettleNonce, v1PrivateGetPnlSettlementHistory, v1PrivateGetVolumeUserDaily, v1PrivateGetVolumeUserStats, v1PrivateGetClientStatistics, v1PrivateGetClientInfo, v1PrivateGetClientStatisticsDaily, v1PrivateGetPositions, v1PrivateGetPositionSymbol, v1PrivateGetFundingFeeHistory, v1PrivateGetNotificationInboxNotifications, v1PrivateGetNotificationInboxUnread, v1PrivateGetVolumeBrokerDaily, v1PrivateGetBrokerFeeRateDefault, v1PrivateGetBrokerUserInfo, v1PrivateGetOrderbookSymbol, v1PrivateGetKline, v1PrivatePostOrderlyKey, v1PrivatePostClientSetOrderlyKeyIpRestriction, v1PrivatePostClientResetOrderlyKeyIpRestriction, v1PrivatePostOrder, v1PrivatePostBatchOrder, v1PrivatePostAlgoOrder, v1PrivatePostLiquidation, v1PrivatePostClaimInsuranceFund, v1PrivatePostWithdrawRequest, v1PrivatePostSettlePnl, v1PrivatePostNotificationInboxMarkRead, v1PrivatePostNotificationInboxMarkReadAll, v1PrivatePostClientLeverage, v1PrivatePostClientMaintenanceConfig, v1PrivatePostDelegateSigner, v1PrivatePostDelegateOrderlyKey, v1PrivatePostDelegateSettlePnl, v1PrivatePostDelegateWithdrawRequest, v1PrivatePostBrokerFeeRateSet, v1PrivatePostBrokerFeeRateSetDefault, v1PrivatePostBrokerFeeRateDefault, v1PrivatePostReferralCreate, v1PrivatePostReferralUpdate, v1PrivatePostReferralBind, v1PrivatePostReferralEditSplit, v1PrivatePutOrder, v1PrivatePutAlgoOrder, v1PrivateDeleteOrder, v1PrivateDeleteAlgoOrder, v1PrivateDeleteClientOrder, v1PrivateDeleteAlgoClientOrder, v1PrivateDeleteAlgoOrders, v1PrivateDeleteOrders, v1PrivateDeleteBatchOrder, v1PrivateDeleteClientBatchOrder)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
