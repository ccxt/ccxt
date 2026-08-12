@kwdef mutable struct Bitmex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    convertFromRealAmount::Function = convertFromRealAmount
    convertToRealAmount::Function = convertToRealAmount
    amountToPrecision::Function = amountToPrecision
    convertFromRawQuantity::Function = convertFromRawQuantity
    convertFromRawCost::Function = convertFromRawCost
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchLeverages::Function = fetchLeverages
    parseLeverage::Function = parseLeverage
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    withdraw::Function = withdraw
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    setLeverage::Function = setLeverage
    setMarginMode::Function = setMarginMode
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchOpenInterests::Function = fetchOpenInterests
    parseOpenInterest::Function = parseOpenInterest
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    fetchLiquidations::Function = fetchLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    fetchSettlementHistory::Function = fetchSettlementHistory
    parseSettlements::Function = parseSettlements
    parseSettlement::Function = parseSettlement
    closePosition::Function = closePosition
    handleErrors::Function = handleErrors
    nonce::Function = nonce
    sign::Function = sign

# Generated REST endpoint fields
    publicGetAnnouncement::Function = publicGetAnnouncement
    publicGetAnnouncementUrgent::Function = publicGetAnnouncementUrgent
    publicGetChat::Function = publicGetChat
    publicGetChatChannels::Function = publicGetChatChannels
    publicGetChatConnected::Function = publicGetChatConnected
    publicGetChatPinned::Function = publicGetChatPinned
    publicGetFunding::Function = publicGetFunding
    publicGetGuild::Function = publicGetGuild
    publicGetInstrument::Function = publicGetInstrument
    publicGetInstrumentActive::Function = publicGetInstrumentActive
    publicGetInstrumentActiveAndIndices::Function = publicGetInstrumentActiveAndIndices
    publicGetInstrumentActiveIntervals::Function = publicGetInstrumentActiveIntervals
    publicGetInstrumentCompositeIndex::Function = publicGetInstrumentCompositeIndex
    publicGetInstrumentIndices::Function = publicGetInstrumentIndices
    publicGetInstrumentUsdVolume::Function = publicGetInstrumentUsdVolume
    publicGetInsurance::Function = publicGetInsurance
    publicGetLeaderboard::Function = publicGetLeaderboard
    publicGetLiquidation::Function = publicGetLiquidation
    publicGetOrderBookL2::Function = publicGetOrderBookL2
    publicGetPorlNonce::Function = publicGetPorlNonce
    publicGetQuote::Function = publicGetQuote
    publicGetQuoteBucketed::Function = publicGetQuoteBucketed
    publicGetSchema::Function = publicGetSchema
    publicGetSchemaWebsocketHelp::Function = publicGetSchemaWebsocketHelp
    publicGetSettlement::Function = publicGetSettlement
    publicGetStats::Function = publicGetStats
    publicGetStatsHistory::Function = publicGetStatsHistory
    publicGetStatsHistoryUSD::Function = publicGetStatsHistoryUSD
    publicGetTrade::Function = publicGetTrade
    publicGetTradeBucketed::Function = publicGetTradeBucketed
    publicGetWalletAssets::Function = publicGetWalletAssets
    publicGetWalletNetworks::Function = publicGetWalletNetworks
    privateGetAddress::Function = privateGetAddress
    privateGetApiKey::Function = privateGetApiKey
    privateGetExecution::Function = privateGetExecution
    privateGetExecutionTradeHistory::Function = privateGetExecutionTradeHistory
    privateGetGlobalNotification::Function = privateGetGlobalNotification
    privateGetLeaderboardName::Function = privateGetLeaderboardName
    privateGetOrder::Function = privateGetOrder
    privateGetPorlSnapshots::Function = privateGetPorlSnapshots
    privateGetPosition::Function = privateGetPosition
    privateGetUser::Function = privateGetUser
    privateGetUserAffiliateStatus::Function = privateGetUserAffiliateStatus
    privateGetUserCheckReferralCode::Function = privateGetUserCheckReferralCode
    privateGetUserCommission::Function = privateGetUserCommission
    privateGetUserCsa::Function = privateGetUserCsa
    privateGetUserDepositAddress::Function = privateGetUserDepositAddress
    privateGetUserExecutionHistory::Function = privateGetUserExecutionHistory
    privateGetUserGetWalletTransferAccounts::Function = privateGetUserGetWalletTransferAccounts
    privateGetUserMargin::Function = privateGetUserMargin
    privateGetUserQuoteFillRatio::Function = privateGetUserQuoteFillRatio
    privateGetUserQuoteValueRatio::Function = privateGetUserQuoteValueRatio
    privateGetUserStaking::Function = privateGetUserStaking
    privateGetUserStakingInstruments::Function = privateGetUserStakingInstruments
    privateGetUserStakingTiers::Function = privateGetUserStakingTiers
    privateGetUserTradingVolume::Function = privateGetUserTradingVolume
    privateGetUserUnstakingRequests::Function = privateGetUserUnstakingRequests
    privateGetUserWallet::Function = privateGetUserWallet
    privateGetUserWalletHistory::Function = privateGetUserWalletHistory
    privateGetUserWalletSummary::Function = privateGetUserWalletSummary
    privateGetUserAffiliates::Function = privateGetUserAffiliates
    privateGetUserEvent::Function = privateGetUserEvent
    privatePostAddress::Function = privatePostAddress
    privatePostChat::Function = privatePostChat
    privatePostGuild::Function = privatePostGuild
    privatePostGuildArchive::Function = privatePostGuildArchive
    privatePostGuildJoin::Function = privatePostGuildJoin
    privatePostGuildKick::Function = privatePostGuildKick
    privatePostGuildLeave::Function = privatePostGuildLeave
    privatePostGuildSharesTrades::Function = privatePostGuildSharesTrades
    privatePostOrder::Function = privatePostOrder
    privatePostOrderCancelAllAfter::Function = privatePostOrderCancelAllAfter
    privatePostOrderClosePosition::Function = privatePostOrderClosePosition
    privatePostPositionIsolate::Function = privatePostPositionIsolate
    privatePostPositionLeverage::Function = privatePostPositionLeverage
    privatePostPositionRiskLimit::Function = privatePostPositionRiskLimit
    privatePostPositionTransferMargin::Function = privatePostPositionTransferMargin
    privatePostUserAddSubaccount::Function = privatePostUserAddSubaccount
    privatePostUserCancelWithdrawal::Function = privatePostUserCancelWithdrawal
    privatePostUserCommunicationToken::Function = privatePostUserCommunicationToken
    privatePostUserConfirmEmail::Function = privatePostUserConfirmEmail
    privatePostUserConfirmWithdrawal::Function = privatePostUserConfirmWithdrawal
    privatePostUserLogout::Function = privatePostUserLogout
    privatePostUserPreferences::Function = privatePostUserPreferences
    privatePostUserRequestWithdrawal::Function = privatePostUserRequestWithdrawal
    privatePostUserUnstakingRequests::Function = privatePostUserUnstakingRequests
    privatePostUserUpdateSubaccount::Function = privatePostUserUpdateSubaccount
    privatePostUserWalletTransfer::Function = privatePostUserWalletTransfer
    privatePutGuild::Function = privatePutGuild
    privatePutOrder::Function = privatePutOrder
    privateDeleteOrder::Function = privateDeleteOrder
    privateDeleteOrderAll::Function = privateDeleteOrderAll
    privateDeleteUserUnstakingRequests::Function = privateDeleteUserUnstakingRequests

end
function describe(self::Bitmex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitmex",
    Symbol("name") => "BitMEX",
    Symbol("countries") => ["SC"],
    Symbol("version") => "v1",
    Symbol("userAgent") => nothing,
    Symbol("rateLimit") => 100,
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("addMargin") => nothing,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
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
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDepositsWithdrawals") => "emulated",
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => "emulated",
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => "emulated",
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => "emulated",
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("index") => false,
        Symbol("reduceMargin") => nothing,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => nothing,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("1h") => "1h",
        Symbol("1d") => "1d"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://testnet.bitmex.com",
            Symbol("private") => "https://testnet.bitmex.com"
        ),
        Symbol("logo") => "https://github.com/user-attachments/assets/3360333d-35a6-4503-bbba-92a6bc0c174f",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://www.bitmex.com",
            Symbol("private") => "https://www.bitmex.com"
        ),
        Symbol("www") => "https://www.bitmex.com",
        Symbol("doc") => ["https://www.bitmex.com/app/apiOverview", "https://github.com/BitMEX/api-connectors/tree/master/official-http"],
        Symbol("fees") => "https://www.bitmex.com/app/fees",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.bitmex.com/app/register/NZTR1q",
            Symbol("discount") => 0.1
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("announcement") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("announcement/urgent") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("chat") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("chat/channels") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("chat/connected") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("chat/pinned") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("funding") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/active") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/activeAndIndices") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/activeIntervals") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/compositeIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/indices") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("instrument/usdVolume") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("leaderboard") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("liquidation") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("orderBook/L2") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("porl/nonce") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("quote") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("quote/bucketed") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("schema") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("schema/websocketHelp") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("settlement") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stats") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stats/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stats/historyUSD") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("trade") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("trade/bucketed") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("wallet/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("wallet/networks") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("execution") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("execution/tradeHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("globalNotification") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("leaderboard/name") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("porl/snapshots") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("position") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/affiliateStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/checkReferralCode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/commission") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/csa") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/depositAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/executionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/getWalletTransferAccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/quoteFillRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/quoteValueRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/staking") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/staking/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/staking/tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/tradingVolume") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/unstakingRequests") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/wallet") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/walletHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/walletSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("userAffiliates") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("userEvent") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("chat") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild/archive") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild/join") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild/kick") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild/leave") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("guild/sharesTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancelAllAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("order/closePosition") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("position/isolate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("position/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("position/riskLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("position/transferMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/addSubaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/cancelWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/communicationToken") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/confirmEmail") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/confirmWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/logout") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/preferences") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/requestWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/unstakingRequests") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/updateSubaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/walletTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("guild") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/unstakingRequests") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Invalid API Key.") => AuthenticationError,
            Symbol("This key is disabled.") => PermissionDenied,
            Symbol("Access Denied") => PermissionDenied,
            Symbol("Duplicate clOrdID") => InvalidOrder,
            Symbol("orderQty is invalid") => InvalidOrder,
            Symbol("Invalid price") => InvalidOrder,
            Symbol("Invalid stopPx for ordType") => InvalidOrder,
            Symbol("Account is restricted") => PermissionDenied
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Signature not valid") => AuthenticationError,
            Symbol("overloaded") => ExchangeNotAvailable,
            Symbol("Account has insufficient Available Balance") => InsufficientFunds,
            Symbol("Service unavailable") => ExchangeNotAvailable,
            Symbol("Server Error") => ExchangeError,
            Symbol("Unable to cancel order due to existing state") => InvalidOrder,
            Symbol("We require all new traders to verify") => PermissionDenied
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("recvWindow") => 5000,
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("useOpenTimestamp") => true
        ),
        Symbol("oldPrecision") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "btc",
            Symbol("ERC20") => "eth",
            Symbol("BEP20") => "bsc",
            Symbol("TRC20") => "tron",
            Symbol("AVAXC") => "avax",
            Symbol("NEAR") => "near",
            Symbol("XTZ") => "xtz",
            Symbol("DOT") => "dot",
            Symbol("SOL") => "sol",
            Symbol("ADA") => "ada"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true
                ),
                Symbol("triggerDirection") => true,
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
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 1000000,
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
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 1000000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 1000000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 10000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("index") => false
                )
            )
        ),
        Symbol("derivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("index") => true
                )
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "derivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "derivatives"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "derivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "derivatives"
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("USDt") => "USDT",
        Symbol("XBt") => "BTC",
        Symbol("XBT") => "BTC",
        Symbol("Gwei") => "ETH",
        Symbol("GWEI") => "ETH",
        Symbol("LAMP") => "SOL",
        Symbol("LAMp") => "SOL"
    )
))

end
"""
fetches all available currencies on an exchange
see: https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitmex; params=Dict())
    response = Base.fetch(self.publicGetWalletAssets(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Bitmex, currency)
    asset = safeString(currency, "asset");
    code = self.safeCurrencyCode(asset);
    id = safeString(currency, "currency");
    name = safeString(currency, "name");
    chains = safeValue(currency, "networks", []);
    depositEnabled = false;
    withdrawEnabled = false;
    networks = Dict{Symbol, Any}();
    scale = safeString(currency, "scale");
    precisionString = self.parsePrecision(precision = scale);
    precision = self.parseNumber(precisionString);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "asset");
        network = self.networkIdToCode(networkId = networkId, currencyCode = code);
        withdrawalFeeRaw = safeString(chain, "withdrawalFee");
        withdrawalFee = self.parseNumber(stringMul(withdrawalFeeRaw, precisionString));
        isDepositEnabled = self.safeBool(chain, "depositEnabled", defaultValue = false);
        isWithdrawEnabled = self.safeBool(chain, "withdrawalEnabled", defaultValue = false);
        active = (@functions.ccxt_and(isDepositEnabled, isWithdrawEnabled));
        if functions.ccxtruthy(isDepositEnabled)
            depositEnabled = true;
        end
        if functions.ccxtruthy(isWithdrawEnabled)
            withdrawEnabled = true;
        end
        if functions.ccxtruthy(network != nothing)
            networks[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => network,
                Symbol("active") => active,
                Symbol("deposit") => isDepositEnabled,
                Symbol("withdraw") => isWithdrawEnabled,
                Symbol("fee") => withdrawalFee,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    currencyEnabled = safeValue(currency, "enabled");
    currencyActive = @functions.ccxt_or(currencyEnabled, (@functions.ccxt_or(depositEnabled, withdrawEnabled)));
    minWithdrawalString = safeString(currency, "minWithdrawalAmount");
    minWithdrawal = self.parseNumber(stringMul(minWithdrawalString, precisionString));
    maxWithdrawalString = safeString(currency, "maxWithdrawalAmount");
    maxWithdrawal = self.parseNumber(stringMul(maxWithdrawalString, precisionString));
    minDepositString = safeString(currency, "minDepositAmount");
    minDeposit = self.parseNumber(stringMul(minDepositString, precisionString));
    isCrypto = safeString(currency, "currencyType") == "Crypto";
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => currency,
    Symbol("name") => name,
    Symbol("active") => currencyActive,
    Symbol("deposit") => depositEnabled,
    Symbol("withdraw") => withdrawEnabled,
    Symbol("fee") => nothing,
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => minWithdrawal,
            Symbol("max") => maxWithdrawal
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => minDeposit,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks,
    Symbol("type") => functions.ccxtruthy(isCrypto) ? "crypto" : "other"
))

end
function convertFromRealAmount(self::Bitmex, code, amount)
    currency = self.currency(code);
    precision = safeString(currency, "precision");
    amountString = numberToString(amount);
    finalAmount = stringDiv(amountString, precision);
    return self.parseNumber(finalAmount)

end
function convertToRealAmount(self::Bitmex, code, amount)
    if functions.ccxtruthy(code == nothing)
            return amount
    elseif functions.ccxtruthy(amount == nothing)
        return nothing
    end
    currency = self.currency(code);
    precision = safeString(currency, "precision");
    return stringMul(amount, precision)

end
function amountToPrecision(self::Bitmex, symbol, amount)
    symbol = self.safeSymbol(symbol);
    market = self.market(symbol);
    oldPrecision = safeValue(self.options, "oldPrecision");
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), !functions.ccxtruthy(oldPrecision)))
        amount = self.convertFromRealAmount(get(market, Symbol("base"), nothing), amount);
    end
    return amountToPrecision(self.parent, symbol, amount)

end
function convertFromRawQuantity(self::Bitmex, symbol, rawQuantity; currencySide="base")
    if functions.ccxtruthy(safeValue(self.options, "oldPrecision"))
            return self.parseNumber(rawQuantity)
    end
    symbol = self.safeSymbol(symbol);
    marketExists = inArray(symbol, self.symbols);
    if functions.ccxtruthy(!functions.ccxtruthy(marketExists))
            return self.parseNumber(rawQuantity)
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return self.parseNumber(self.convertToRealAmount(safeString(market, currencySide), rawQuantity))
    end
    return self.parseNumber(rawQuantity)

end
function convertFromRawCost(self::Bitmex, symbol, rawQuantity)
    return self.convertFromRawQuantity(symbol, rawQuantity, currencySide = "quote")

end
"""
retrieves data on all markets for bitmex
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActive

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitmex; params=Dict())
    response = Base.fetch(self.publicGetInstrumentActive(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Bitmex, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "underlying");
    quoteId = safeString(market, "quoteCurrency");
    settleId = safeString(market, "settlCurrency");
    settle = self.safeCurrencyCode(settleId);
    typ = safeString(market, "typ");
    type_var = nothing;
    swap = false;
    spot = false;
    future = false;
    if functions.ccxtruthy(typ == "FFWCSX")
        type_var = "swap";
        swap = true;
    elseif functions.ccxtruthy(typ == "IFXXXP")
        type_var = "spot";
        spot = true;
    else
        if functions.ccxtruthy(@functions.ccxt_or(typ == "FFCCSX", typ == "FFMCSX"))
            type_var = "future";
            future = true;
        elseif functions.ccxtruthy(typ == "FFICSX")
            quoteId = baseId;
            baseId = safeString(market, "rootSymbol");
            type_var = "future";
            future = true;
        else
            if functions.ccxtruthy(typ == "FFSCSX")
                type_var = "swap";
                swap = true;
            end

        end

    end
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    contract = @functions.ccxt_or(swap, future);
    contractSize = nothing;
    isInverse = safeValue(market, "isInverse");
    isQuanto = safeValue(market, "isQuanto");
    linear = functions.ccxtruthy(contract) ? (@functions.ccxt_and(!functions.ccxtruthy(isInverse), !functions.ccxtruthy(isQuanto))) : nothing;
    status = safeString(market, "state");
    active = status == "Open";
    expiry = nothing;
    expiryDatetime = nothing;
    symbol = nothing;
    if functions.ccxtruthy(spot)
        symbol = string(base, "/", quote_var);
    elseif functions.ccxtruthy(contract)
        symbol = string(base, "/", quote_var, ":", settle);
        if functions.ccxtruthy(linear)
            multiplierString = safeString2(market, "underlyingToPositionMultiplier", "underlyingToSettleMultiplier");
            contractSize = stringAbs(stringDiv("1", multiplierString));
        else
            contractSize = stringAbs(safeString(market, "multiplier"));
        end
        expiryDatetime = safeString2(market, "expiry", "closingTimestamp");
        expiry = self.parse8601(expiryDatetime);
        if functions.ccxtruthy(@functions.ccxt_and(expiry != nothing, future))
            symbol = string(symbol, "-", self.yymmdd(expiry));
        end
    else
        symbol = id;
    end
    positionId = safeString2(market, "positionCurrency", "underlying");
    position = self.safeCurrencyCode(positionId);
    positionIsQuote = (position == quote_var);
    maxOrderQty = self.safeNumber(market, "maxOrderQty");
    initMargin = safeString(market, "initMargin", "1");
    maxLeverage = self.parseNumber(stringDiv("1", initMargin));
    if functions.ccxtruthy(spot)
        isInverse = nothing;
        isQuanto = nothing;
        linear = nothing;
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " parseMarket() requires a symbol")));
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => isInverse,
    Symbol("quanto") => isQuanto,
    Symbol("taker") => self.safeNumber(market, "takerFee"),
    Symbol("maker") => self.safeNumber(market, "makerFee"),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => expiryDatetime,
    Symbol("strike") => self.safeNumber(market, "optionStrikePrice"),
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSize"),
        Symbol("price") => self.safeNumber(market, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => functions.ccxtruthy(contract) ? self.parseNumber("1") : nothing,
            Symbol("max") => functions.ccxtruthy(contract) ? maxLeverage : nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => functions.ccxtruthy(positionIsQuote) ? nothing : maxOrderQty
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.safeNumber(market, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => functions.ccxtruthy(positionIsQuote) ? maxOrderQty : nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseBalance(self::Bitmex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        free = safeString(balance, "availableMargin");
        total = safeString(balance, "marginBalance");
        account[Symbol("free")] = self.convertToRealAmount(code, free);
        account[Symbol("total")] = self.convertToRealAmount(code, total);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitmex.com/api/explorer/#!/User/User_getMargin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bitmex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => "all"
    );
    response = Base.fetch(self.privateGetUserMargin(extend(request, params)));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitmex.com/api/explorer/#!/OrderBook/OrderBook_getL2

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitmex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    response = Base.fetch(self.publicGetOrderBookL2(extend(request, params)));
    result = Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("bids") => [],
        Symbol("asks") => [],
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing,
        Symbol("nonce") => nothing
    );
    orders = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        side = functions.ccxtruthy((get(order, Symbol("side"), nothing) == "Sell")) ? "asks" : "bids";
        amount = self.convertFromRawQuantity(symbol, safeString(order, "size"));
        price = self.safeNumber(order, "price");
        if functions.ccxtruthy(price != nothing)
                        push!(get(result, Symbol(side), nothing), [price, amount]);
        end
        i += 1
    end
    result[Symbol("bids")] = sortBy(get(result, Symbol("bids"), nothing), 0, true);
    result[Symbol("asks")] = sortBy(get(result, Symbol("asks"), nothing), 0);
    return result

end
"""
fetches information on an order made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bitmex, id; symbol=nothing, params=Dict())
    filter_var = Dict{Symbol, Any}(
        Symbol("filter") => Dict{Symbol, Any}(
            Symbol("orderID") => id
        )
    );
    response = Base.fetch(self.fetchOrders(symbol = symbol, since = nothing, limit = nothing, params = deepExtend(filter_var, params)));
    numResults = length(response);
    if functions.ccxtruthy(numResults == 1)
            return get(response, 1, nothing)
    end
    throw(OrderNotFound(string(self.id, ": The order ", id, " not found.")));

end
"""
fetches information on multiple orders made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the earliest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = self.iso8601(until);
    end
    request = deepExtend(request, params);
    if functions.ccxtruthy(ccxt_in("filter", request))
        request[Symbol("filter")] = json(get(request, Symbol("filter"), nothing));
    end
    response = Base.fetch(self.privateGetOrder(request));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("filter") => Dict{Symbol, Any}(
            Symbol("open") => true
        )
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = deepExtend(request, params)))

end
"""
fetches information on multiple closed orders made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = params));
    return self.filterByArray(orders, "status", values = ["closed", "canceled"], indexed = false)

end
"""
fetch all trades made by the user
see: https://www.bitmex.com/api/explorer/#!/Execution/Execution_getTradeHistory

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = min(500, limit);
    end
    until = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = self.iso8601(until);
    end
    request = deepExtend(request, params);
    if functions.ccxtruthy(ccxt_in("filter", request))
        request[Symbol("filter")] = json(get(request, Symbol("filter"), nothing));
    end
    response = Base.fetch(self.privateGetExecutionTradeHistory(request));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
function parseLedgerEntryType(self::Bitmex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("Withdrawal") => "transaction",
        Symbol("RealisedPNL") => "margin",
        Symbol("UnrealisedPNL") => "margin",
        Symbol("Deposit") => "transaction",
        Symbol("Transfer") => "transfer",
        Symbol("AffiliatePayout") => "referral",
        Symbol("SpotTrade") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Bitmex, item; currency=nothing)
    id = safeString(item, "transactID");
    account = safeString(item, "account");
    referenceId = safeString(item, "tx");
    referenceAccount = nothing;
    type_var = self.parseLedgerEntryType(safeString(item, "transactType"));
    currencyId = safeString(item, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amountString = safeString(item, "amount");
    amount = self.convertToRealAmount(code, amountString);
    timestamp = self.parse8601(safeString(item, "transactTime"));
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = 0;
    end
    fee = nothing;
    feeCost = safeString(item, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        feeCost = self.convertToRealAmount(code, feeCost);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("currency") => code
        );
    end
    after = safeString(item, "walletBalance");
    if functions.ccxtruthy(after != nothing)
        after = self.convertToRealAmount(code, after);
    end
    before = self.parseNumber(stringSub(numberToString(after), numberToString(amount)));
    direction = nothing;
    if functions.ccxtruthy(stringLt(amountString, "0"))
        direction = "out";
        amount = self.convertToRealAmount(code, stringAbs(amountString));
    else
        direction = "in";
    end
    status = self.parseTransactionStatus(safeString(item, "transactStatus"));
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => account,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => referenceAccount,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => before,
    Symbol("after") => self.parseNumber(after),
    Symbol("status") => status,
    Symbol("fee") => fee
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Bitmex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetUserWalletHistory(extend(request, params)));
    return self.parseLedger(response, currency = currency, since = since, limit = limit)

end
"""
fetch history of deposits and withdrawals
see: https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Bitmex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("currency") => "all"
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    response = Base.fetch(self.privateGetUserWalletHistory(extend(request, params)));
    transactions = self.filterByArray(response, "transactType", values = ["Withdrawal", "Deposit"], indexed = false);
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)

end
function parseTransactionStatus(self::Bitmex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Confirmed") => "pending",
        Symbol("Canceled") => "canceled",
        Symbol("Completed") => "ok",
        Symbol("Pending") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitmex, transaction; currency=nothing)
    currencyId = safeString(transaction, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    transactTime = self.parse8601(safeString(transaction, "transactTime"));
    timestamp = self.parse8601(safeString(transaction, "timestamp"));
    type_var = safeStringLower(transaction, "transactType");
    address = nothing;
    addressFrom = nothing;
    addressTo = nothing;
    if functions.ccxtruthy(type_var == "withdrawal")
        address = safeString(transaction, "address");
        addressFrom = safeString(transaction, "tx");
        addressTo = address;
    elseif functions.ccxtruthy(type_var == "deposit")
        addressTo = safeString(transaction, "address");
        addressFrom = safeString(transaction, "tx");
    end
    amountString = safeString(transaction, "amount");
    amountStringAbs = stringAbs(amountString);
    amount = self.convertToRealAmount(get(currency, Symbol("code"), nothing), amountStringAbs);
    feeCostString = safeString(transaction, "fee");
    feeCost = self.convertToRealAmount(get(currency, Symbol("code"), nothing), feeCostString);
    status = safeString(transaction, "transactStatus");
    if functions.ccxtruthy(status != nothing)
        status = self.parseTransactionStatus(status);
    end
    code = get(currency, Symbol("code"), nothing);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "transactID"),
    Symbol("txid") => safeString(transaction, "tx"),
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = safeString(transaction, "network"), currencyCode = code),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("status") => status,
    Symbol("timestamp") => transactTime,
    Symbol("datetime") => self.iso8601(transactTime),
    Symbol("address") => address,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => timestamp,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("code"), nothing),
        Symbol("cost") => self.parseNumber(feeCost),
        Symbol("rate") => nothing
    )
)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bitmex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetInstrument(extend(request, params)));
    ticker = safeValue(response, 0);
    if functions.ccxtruthy(ticker == nothing)
        throw(BadSymbol(string(self.id, " fetchTicker() symbol ", symbol, " not found")));
    end
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetInstrumentActiveAndIndices(params));
    result = Dict{Symbol, Any}();
    rawTickers = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawTickers)))
        ticker = self.parseTicker(get(rawTickers, i + 1, nothing));
        symbol = safeString(ticker, "symbol");
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function parseTicker(self::Bitmex, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = self.parse8601(safeString(ticker, "timestamp"));
    open = safeString(ticker, "prevPrice24h");
    last_var = safeString(ticker, "lastPrice");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "highPrice"),
    Symbol("low") => safeString(ticker, "lowPrice"),
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => safeString(ticker, "vwap"),
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "homeNotional24h"),
    Symbol("quoteVolume") => safeString(ticker, "foreignNotional24h"),
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("info") => ticker
), market = market)

end
function parseOHLCV(self::Bitmex, ohlcv; market=nothing)
    marketId = safeString(ohlcv, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    volume = self.convertFromRawQuantity(get(market, Symbol("symbol"), nothing), safeString(ohlcv, "volume"));
    return [self.parse8601(safeString(ohlcv, "timestamp")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), volume]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitmex.com/api/explorer/#!/Trade/Trade_getBucketed

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitmex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("binSize") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("partial") => true
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = self.iso8601(until);
    end
    duration = self.parseTimeframe(timeframe) * 1000;
    useOpenTimestamp = nothing;
    (useOpenTimestamp, params) = self.handleOptionAndParams(params, "fetchOHLCV", "useOpenTimestamp", defaultValue = true);
    if functions.ccxtruthy(since != nothing)
        timestamp = since;
        if functions.ccxtruthy(useOpenTimestamp)
            timestamp = self.sum(timestamp, duration);
        end
        startTime = self.iso8601(timestamp);
        request[Symbol("startTime")] = startTime;
    else
        request[Symbol("reverse")] = true;
    end
    response = Base.fetch(self.publicGetTradeBucketed(extend(request, params)));
    result = self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit);
    if functions.ccxtruthy(useOpenTimestamp)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
            result[i + 1][1] = self.parseToInt(get(get(result, i + 1, nothing), 1, nothing)) - duration;
            i += 1
        end

    end
    return result

end
function parseTrade(self::Bitmex, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = self.parse8601(safeString(trade, "timestamp"));
    priceString = safeString2(trade, "avgPx", "price");
    amountString = self.convertFromRawQuantity(symbol, safeString2(trade, "size", "lastQty"));
    execCost = numberToString(self.convertFromRawCost(symbol, safeString(trade, "execCost")));
    id = safeString(trade, "trdMatchID");
    order = safeString(trade, "orderID");
    side = safeStringLower(trade, "side");
    fee = nothing;
    feeCostString = numberToString(self.convertFromRawCost(symbol, safeString(trade, "execComm")));
    if functions.ccxtruthy(feeCostString != nothing)
        currencyId = safeString2(trade, "settlCurrency", "currency");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => self.safeCurrencyCode(currencyId),
            Symbol("rate") => safeString(trade, "commission")
        );
    end
    execType = safeString(trade, "execType");
    takerOrMaker = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(feeCostString != nothing, execType == "Trade"))
        takerOrMaker = functions.ccxtruthy(stringLt(feeCostString, "0")) ? "maker" : "taker";
    end
    type_var = safeStringLower(trade, "ordType");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => order,
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("cost") => stringAbs(execCost),
    Symbol("amount") => amountString,
    Symbol("fee") => fee
), market = market)

end
function parseOrderStatus(self::Bitmex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("New") => "open",
        Symbol("PartiallyFilled") => "open",
        Symbol("Filled") => "closed",
        Symbol("DoneForDay") => "open",
        Symbol("Canceled") => "canceled",
        Symbol("PendingCancel") => "open",
        Symbol("PendingNew") => "open",
        Symbol("Rejected") => "rejected",
        Symbol("Expired") => "expired",
        Symbol("Stopped") => "open",
        Symbol("Untriggered") => "open",
        Symbol("Triggered") => "open"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Bitmex, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("Day") => "Day",
        Symbol("GoodTillCancel") => "GTC",
        Symbol("ImmediateOrCancel") => "IOC",
        Symbol("FillOrKill") => "FOK"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrder(self::Bitmex, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    qty = safeString(order, "orderQty");
    cost = nothing;
    amount = nothing;
    isInverse = false;
    if functions.ccxtruthy(marketId == nothing)
        defaultSubType = safeString(self.options, "defaultSubType", "linear");
        isInverse = (defaultSubType == "inverse");
    else
        isInverse = self.safeBool(market, "inverse", defaultValue = false);
    end
    if functions.ccxtruthy(isInverse)
        cost = self.convertFromRawQuantity(symbol, qty);
    else
        amount = self.convertFromRawQuantity(symbol, qty);
    end
    average = safeString(order, "avgPx");
    filled = nothing;
    cumQty = numberToString(self.convertFromRawQuantity(symbol, safeString(order, "cumQty")));
    if functions.ccxtruthy(isInverse)
        filled = stringDiv(cumQty, average);
    else
        filled = cumQty;
    end
    execInst = safeString(order, "execInst", "");
    postOnly = nothing;
    reduceOnly = nothing;
    if functions.ccxtruthy(functions.ccxt_gt(length(execInst), 0))
        postOnly = (findfirst("ParticipateDoNotInitiate", execInst) !== nothing);
        reduceOnly = (@functions.ccxt_or((findfirst("ReduceOnly", execInst) !== nothing), (findfirst("Close", execInst) !== nothing)));
    end
    timestamp = self.parse8601(safeString(order, "timestamp"));
    triggerPrice = self.safeNumber(order, "stopPx");
    remaining = safeString(order, "leavesQty");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "orderID"),
    Symbol("clientOrderId") => safeString(order, "clOrdID"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => self.parse8601(safeString(order, "transactTime")),
    Symbol("symbol") => symbol,
    Symbol("type") => safeStringLower(order, "ordType"),
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "timeInForce")),
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => self.convertFromRawQuantity(symbol, remaining),
    Symbol("status") => self.parseOrderStatus(safeString(order, "ordStatus")),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitmex.com/api/explorer/#!/Trade/Trade_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bitmex, symbol; since=nothing, limit=nothing, params=Dict())
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
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = self.iso8601(since);
    else
        request[Symbol("reverse")] = true;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = min(limit, 1000);
    end
    until = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = self.iso8601(until);
    end
    response = Base.fetch(self.publicGetTrade(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
create a trade order
see: https://www.bitmex.com/api/explorer/#!/Order/Order_new

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::object, optional: the price at which a trigger order is triggered at
- `params.triggerDirection`::object, optional: the direction whenever the trigger happens with relation to price - 'ascending' or 'descending'
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
function createOrder(self::Bitmex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderType = capitalize(type_var);
    capitalizeOrderType = orderType;
    reduceOnly = safeValue(params, "reduceOnly");
    if functions.ccxtruthy(reduceOnly != nothing)
        if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(get(market, Symbol("swap"), nothing))), (!functions.ccxtruthy(get(market, Symbol("future"), nothing)))))
            throw(InvalidOrder(string(self.id, " createOrder() does not support reduceOnly for ", get(market, Symbol("type"), nothing), " orders, reduceOnly orders are supported for swap and future markets only")));
        end
    end
    postOnly = self.safeBool(params, "postOnly");
    params = omit(params, ["reduceOnly", "postOnly"]);
    brokerId = safeString(self.options, "brokerId", "CCXT");
    qty = self.parseToInt(self.amountToPrecision(symbol, amount));
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => capitalize(side),
        Symbol("orderQty") => qty,
        Symbol("ordType") => capitalizeOrderType,
        Symbol("text") => brokerId
    );
    execInstructions = [];
    if functions.ccxtruthy(reduceOnly)
                push!(execInstructions, "ReduceOnly");
    end
    if functions.ccxtruthy(postOnly)
                push!(execInstructions, "ParticipateDoNotInitiate");
    end
    execInstLength = length(execInstructions);
    if functions.ccxtruthy(functions.ccxt_gt(execInstLength, 0))
        request[Symbol("execInst")] =         join(execInstructions, ",");
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPx", "stopPrice"]);
    trailingAmount = safeString2(params, "trailingAmount", "pegOffsetValue");
    isTriggerOrder = triggerPrice != nothing;
    isTrailingAmountOrder = trailingAmount != nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isTriggerOrder, isTrailingAmountOrder))
        triggerDirection = safeString(params, "triggerDirection");
        triggerAbove = (@functions.ccxt_or((triggerDirection == "ascending"), (triggerDirection == "above")));
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "limit"), (type_var == "market")))
            self.checkRequiredArgument("createOrder", triggerDirection, "triggerDirection", options = ["above", "below"]);
        end
        if functions.ccxtruthy(type_var == "limit")
            if functions.ccxtruthy(side == "buy")
                orderType = functions.ccxtruthy(triggerAbove) ? "StopLimit" : "LimitIfTouched";
            else
                orderType = functions.ccxtruthy(triggerAbove) ? "LimitIfTouched" : "StopLimit";
            end
        elseif functions.ccxtruthy(type_var == "market")
            if functions.ccxtruthy(side == "buy")
                orderType = functions.ccxtruthy(triggerAbove) ? "Stop" : "MarketIfTouched";
            else
                orderType = functions.ccxtruthy(triggerAbove) ? "MarketIfTouched" : "Stop";
            end
        end
        if functions.ccxtruthy(isTrailingAmountOrder)
            isStopSellOrder = @functions.ccxt_and((side == "sell"), (@functions.ccxt_or((orderType == "Stop"), (orderType == "StopLimit"))));
            isBuyIfTouchedOrder = @functions.ccxt_and((side == "buy"), (@functions.ccxt_or((orderType == "MarketIfTouched"), (orderType == "LimitIfTouched"))));
            if functions.ccxtruthy(@functions.ccxt_or(isStopSellOrder, isBuyIfTouchedOrder))
                trailingAmount = string("-", trailingAmount);
            end
            request[Symbol("pegOffsetValue")] = self.parseToNumeric(trailingAmount);
            request[Symbol("pegPriceType")] = "TrailingStopPeg";
        else
            if functions.ccxtruthy(triggerPrice == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice parameter for the ", orderType, " order type")));
            end
            request[Symbol("stopPx")] = self.parseToNumeric(self.priceToPrecision(symbol, triggerPrice));
        end
        request[Symbol("ordType")] = orderType;
        params = omit(params, ["triggerPrice", "stopPrice", "stopPx", "triggerDirection", "trailingAmount"]);
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((orderType == "Limit"), (orderType == "StopLimit")), (orderType == "LimitIfTouched")))
        request[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, price));
    end
    clientOrderId = safeString2(params, "clOrdID", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdID")] = clientOrderId;
        params = omit(params, ["clOrdID", "clientOrderId"]);
    end
    response = Base.fetch(self.privatePostOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
function editOrder(self::Bitmex, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    trailingAmount = safeString2(params, "trailingAmount", "pegOffsetValue");
    isTrailingAmountOrder = trailingAmount != nothing;
    if functions.ccxtruthy(isTrailingAmountOrder)
        triggerDirection = safeString(params, "triggerDirection");
        triggerAbove = (@functions.ccxt_or((triggerDirection == "ascending"), (triggerDirection == "above")));
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "limit"), (type_var == "market")))
            self.checkRequiredArgument("editOrder", triggerDirection, "triggerDirection", options = ["above", "below"]);
        end
        orderType = nothing;
        if functions.ccxtruthy(type_var == "limit")
            if functions.ccxtruthy(side == "buy")
                orderType = functions.ccxtruthy(triggerAbove) ? "StopLimit" : "LimitIfTouched";
            else
                orderType = functions.ccxtruthy(triggerAbove) ? "LimitIfTouched" : "StopLimit";
            end
        elseif functions.ccxtruthy(type_var == "market")
            if functions.ccxtruthy(side == "buy")
                orderType = functions.ccxtruthy(triggerAbove) ? "Stop" : "MarketIfTouched";
            else
                orderType = functions.ccxtruthy(triggerAbove) ? "MarketIfTouched" : "Stop";
            end
        end
        isStopSellOrder = @functions.ccxt_and((side == "sell"), (@functions.ccxt_or((orderType == "Stop"), (orderType == "StopLimit"))));
        isBuyIfTouchedOrder = @functions.ccxt_and((side == "buy"), (@functions.ccxt_or((orderType == "MarketIfTouched"), (orderType == "LimitIfTouched"))));
        if functions.ccxtruthy(@functions.ccxt_or(isStopSellOrder, isBuyIfTouchedOrder))
            trailingAmount = string("-", trailingAmount);
        end
        request[Symbol("pegOffsetValue")] = self.parseToNumeric(trailingAmount);
        params = omit(params, ["triggerDirection", "trailingAmount"]);
    end
    origClOrdID = safeString2(params, "origClOrdID", "clientOrderId");
    if functions.ccxtruthy(origClOrdID != nothing)
        request[Symbol("origClOrdID")] = origClOrdID;
        clientOrderId = safeString(params, "clOrdID", "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clOrdID")] = clientOrderId;
        end
        params = omit(params, ["origClOrdID", "clOrdID", "clientOrderId"]);
    else
        request[Symbol("orderID")] = id;
    end
    if functions.ccxtruthy(amount != nothing)
        qty = self.parseToInt(self.amountToPrecision(symbol, amount));
        request[Symbol("orderQty")] = qty;
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = price;
    end
    brokerId = safeString(self.options, "brokerId", "CCXT");
    request[Symbol("text")] = brokerId;
    response = Base.fetch(self.privatePutOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
cancels an open order
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancel

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bitmex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeValue2(params, "clOrdID", "clientOrderId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderID")] = id;
    else
        request[Symbol("clOrdID")] = clientOrderId;
        params = omit(params, ["clOrdID", "clientOrderId"]);
    end
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    order = safeValue(response, 0, Dict{Symbol, Any}());
    error = safeString(order, "error");
    if functions.ccxtruthy(error != nothing)
        if functions.ccxtruthy(findfirst("Unable to cancel order due to existing state", error) !== nothing)
            throw(OrderNotFound(string(self.id, " cancelOrder() failed: ", error)));
        end
    end
    return self.parseOrder(order)

end
"""
cancel multiple orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bitmex, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeValue2(params, "clOrdID", "clientOrderId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderID")] = ids;
    else
        request[Symbol("clOrdID")] = clientOrderId;
        params = omit(params, ["clOrdID", "clientOrderId"]);
    end
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.parseOrders(response)

end
"""
cancel all open orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAll

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bitmex; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateDeleteOrderAll(extend(request, params)));
    return self.parseOrders(response, market = market)

end
"""
dead man's switch, cancel all orders after the given timeout
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAllAfter

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Bitmex, timeout; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(timeout == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrdersAfter() missing timeout")));
    end
    request = Dict{Symbol, Any}(
        Symbol("timeout") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? self.parseToInt(timeout / 1000) : 0
    );
    response = Base.fetch(self.privatePostOrderCancelAllAfter(extend(request, params)));
    return response

end
"""
fetch the set leverage for all contract markets
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    leverages = Base.fetch(self.fetchPositions(symbols = symbols, params = params));
    return self.parseLeverages(leverages, symbols = symbols, symbolKey = "symbol")

end
function parseLeverage(self::Bitmex, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => safeStringLower(leverage, "marginMode"),
    Symbol("longLeverage") => safeInteger(leverage, "leverage"),
    Symbol("shortLeverage") => safeInteger(leverage, "leverage")
)

end
"""
fetch all open positions
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetPosition(params));
    results = self.parsePositions(response, symbols = symbols);
    return self.filterByArrayPositions(results, "symbol", values = symbols, indexed = false)

end
function parsePosition(self::Bitmex, position; market=nothing)
    market = self.safeMarket(marketId = safeString(position, "symbol"), market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    datetime = safeString(position, "timestamp");
    crossMargin = safeValue(position, "crossMargin");
    marginMode = functions.ccxtruthy((crossMargin)) ? "cross" : "isolated";
    notionalString = stringAbs(safeString2(position, "foreignNotional", "homeNotional"));
    settleCurrencyCode = safeString(market, "settle");
    maintenanceMargin = self.convertToRealAmount(settleCurrencyCode, safeString(position, "maintMargin"));
    unrealisedPnl = self.convertToRealAmount(settleCurrencyCode, safeString(position, "unrealisedPnl"));
    contracts = self.parseNumber(stringAbs(safeString(position, "currentQty")));
    contractSize = self.safeNumber(market, "contractSize");
    side = nothing;
    homeNotional = safeString(position, "homeNotional");
    if functions.ccxtruthy(homeNotional != nothing)
        if functions.ccxtruthy(get(homeNotional, 1, nothing) == "-")
            side = "short";
        else
            side = "long";
        end
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "account"),
    Symbol("symbol") => symbol,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("hedged") => nothing,
    Symbol("side") => side,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("entryPrice") => self.safeNumber(position, "avgEntryPrice"),
    Symbol("markPrice") => self.safeNumber(position, "markPrice"),
    Symbol("lastPrice") => nothing,
    Symbol("notional") => self.parseNumber(notionalString),
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "initMargin"),
    Symbol("initialMarginPercentage") => self.safeNumber(position, "initMarginReq"),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => self.safeNumber(position, "maintMarginReq"),
    Symbol("unrealizedPnl") => unrealisedPnl,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("marginMode") => marginMode,
    Symbol("marginRatio") => nothing,
    Symbol("percentage") => self.safeNumber(position, "unrealisedPnlPcnt"),
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
make a withdrawal
see: https://www.bitmex.com/api/explorer/#!/User/User_requestWithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bitmex, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    qty = self.convertFromRealAmount(code, amount);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => qty,
        Symbol("address") => address,
        Symbol("network") => self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing))
    );
    if functions.ccxtruthy(self.twofa != nothing)
        request[Symbol("otpToken")] = totp(self.twofa);
    end
    response = Base.fetch(self.privatePostUserRequestWithdrawal(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
"""
fetch the funding rate for multiple markets
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetInstrumentActiveAndIndices(params));
    filteredResponse = [];
    rawItems = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawItems)))
        item = get(rawItems, i + 1, nothing);
        marketId = safeString(item, "symbol");
        market = self.safeMarket(marketId = marketId);
        swap = self.safeBool(market, "swap", defaultValue = false);
        if functions.ccxtruthy(swap)
                        push!(filteredResponse, item);
        end
        i += 1
    end
    symbols = self.marketSymbols(symbols = symbols);
    result = self.parseFundingRates(filteredResponse);
    return self.filterByArray(result, "symbol", values = symbols)

end
function parseFundingRate(self::Bitmex, contract; market=nothing)
    datetime = safeString(contract, "timestamp");
    marketId = safeString(contract, "symbol");
    fundingDatetime = safeString(contract, "fundingTimestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("markPrice") => self.safeNumber(contract, "markPrice"),
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => self.safeNumber(contract, "indicativeSettlePrice"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => self.parse8601(fundingDatetime),
    Symbol("fundingDatetime") => fundingDatetime,
    Symbol("nextFundingRate") => self.safeNumber(contract, "indicativeFundingRate"),
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
"""
Fetches the history of funding rates
see: https://www.bitmex.com/api/explorer/#!/Funding/Funding_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for ending date filter
- `params.reverse`::bool, optional: if true, will sort results newest first
- `params.start`::int, optional: starting point for results
- `params.columns`::string, optional: array of column names to fetch in info, if omitted, will return all columns
- `params.filter`::string, optional: generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the [timestamp docs]{@link https://www.bitmex.com/app/restAPI#Timestamp-Filters} for more details

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(ccxt_in(symbol, self.currencies))
        code = self.currency(symbol);
        request[Symbol("symbol")] = get(code, Symbol("id"), nothing);
    elseif functions.ccxtruthy(symbol != nothing)
        splitSymbol = split(symbol, ":");
        splitSymbolLength = length(splitSymbol);
        timeframes = ["nearest", "daily", "weekly", "monthly", "quarterly", "biquarterly", "perpetual"];
        if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(splitSymbolLength, 1)), inArray(get(splitSymbol, 2, nothing), timeframes)))
            code = self.currency(get(splitSymbol, 1, nothing));
            symbol = string(get(code, Symbol("id"), nothing), ":", get(splitSymbol, 2, nothing));
            request[Symbol("symbol")] = symbol;
        else
            market = self.market(symbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = self.iso8601(until);
    end
    if functions.ccxtruthy(@functions.ccxt_and((since == nothing), (until == nothing)))
        request[Symbol("reverse")] = true;
    end
    response = Base.fetch(self.publicGetFunding(extend(request, params)));
    return self.parseFundingRateHistories(response, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Bitmex, info; market=nothing)
    marketId = safeString(info, "symbol");
    datetime = safeString(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("fundingRate") => self.safeNumber(info, "fundingRate"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
"""
set the level of leverage for a market
see: https://www.bitmex.com/api/explorer/#!/Position/Position_updateLeverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Bitmex, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 0.01)), (functions.ccxt_gt(leverage, 100))))
        throw(BadRequest(string(self.id, " leverage should be between 0.01 and 100")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("type"), nothing) != "swap", get(market, Symbol("type"), nothing) != "future"))
        throw(BadSymbol(string(self.id, " setLeverage() supports future and swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.privatePostPositionLeverage(extend(request, params)))

end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.bitmex.com/api/explorer/#!/Position/Position_isolateMargin

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Bitmex, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "isolated", marginMode != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("type"), nothing) != "swap"), (get(market, Symbol("type"), nothing) != "future")))
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap and future contracts only")));
    end
    enabled = functions.ccxtruthy((marginMode == "cross")) ? false : true;
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("enabled") => enabled
    );
    return Base.fetch(self.privatePostPositionIsolate(extend(request, params)))

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitmex.com/api/explorer/#!/User/User_getDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bitmex, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress requires params[\"network\"]")));
    end
    currency = self.currency(code);
    params = omit(params, "network");
    parsedNetwork = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("network") => parsedNetwork
    );
    response = Base.fetch(self.privateGetUserDepositAddress(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => networkCode,
    Symbol("address") => replace(replace(response, "\"" => ""), "\"" => ""),
    Symbol("tag") => nothing
)

end
function parseDepositWithdrawFee(self::Bitmex, fee; currency=nothing)
    networks = safeValue(fee, "networks", []);
    networksLength = length(networks);
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
    if functions.ccxtruthy(networksLength != 0)
        scale = safeString(fee, "scale");
        precision = self.parsePrecision(precision = scale);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, networksLength))
            network = get(networks, i + 1, nothing);
            networkId = safeString(network, "asset");
            currencyCode = safeString(currency, "code");
            networkCode = self.networkIdToCode(networkId = networkId, currencyCode = currencyCode);
            withdrawalFeeId = safeString(network, "withdrawalFee");
            withdrawalFee = self.parseNumber(stringMul(withdrawalFeeId, precision));
            if functions.ccxtruthy(networkCode != nothing)
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => withdrawalFee,
                        Symbol("percentage") => false
                    )
                );
            end
            if functions.ccxtruthy(networksLength == 1)
                result[Symbol("withdraw")][Symbol("fee")] = withdrawalFee;
                result[Symbol("withdraw")][Symbol("percentage")] = false;
            end
            i += 1
        end

    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bitmex; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    assets = Base.fetch(self.publicGetWalletAssets(params));
    return self.parseDepositWithdrawFees(assets, codes = codes, currencyIdKey = "asset")

end
"""
Retrieves the open interest for a list of symbols
see: https://docs.bitmex.com/api-explorer/get-stats

# Arguments
- `symbols`::array, optional: a list of unified CCXT market symbols
- `params`::object, optional: exchange specific parameters

# Returns
- a list of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterests(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    response = Base.fetch(self.publicGetStats(extend(request, params)));
    symbols = self.marketSymbols(symbols = symbols);
    return self.parseOpenInterests(response, symbols = symbols)

end
function parseOpenInterest(self::Bitmex, interest; market=nothing)
    quoteId = safeString(interest, "currency");
    baseId = safeString(interest, "rootSymbol");
    quoteSymbol = self.safeCurrencyCode(quoteId);
    baseSymbol = self.safeCurrencyCode(baseId);
    symbol = baseSymbol;
    if functions.ccxtruthy(quoteSymbol != nothing)
        symbol = string(baseSymbol, "/", quoteSymbol, ":", quoteSymbol);
    end
    openInterest = self.safeNumber(interest, "openInterest");
    openValue = self.safeNumber(interest, "openValue");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("info") => interest,
    Symbol("symbol") => symbol,
    Symbol("baseVolume") => openInterest,
    Symbol("quoteVolume") => openValue,
    Symbol("openInterestAmount") => openInterest,
    Symbol("openInterestValue") => openValue,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
), market = market)

end
function calculateRateLimiterCost(self::Bitmex, api, method, path, params; config=Dict())
    isAuthenticated = self.checkRequiredCredentials(error = false);
    cost = safeValue(config, "cost", 1);
    if functions.ccxtruthy(cost != 1)
        if functions.ccxtruthy(isAuthenticated)
                return cost
        else
            return 20
        end
    end
    return cost

end
"""
retrieves the public liquidations of a trading pair
see: https://www.bitmex.com/api/explorer/#!/Liquidation/Liquidation_get

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bitmex api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchLiquidations(self::Bitmex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLiquidations", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.publicGetLiquidation(extend(request, params)));
    return self.parseLiquidations(toArray(response), market = market, since = since, limit = limit)

end
function parseLiquidation(self::Bitmex, liquidation; market=nothing)
    marketId = safeString(liquidation, "symbol");
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("price") => self.safeNumber(liquidation, "price"),
    Symbol("side") => safeStringLower(liquidation, "side"),
    Symbol("baseValue") => nothing,
    Symbol("quoteValue") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
))

end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchPositionsADLRank(self::Bitmex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    response = Base.fetch(self.privateGetPosition(params));
    return self.parseADLRanks(response, symbols = symbols)

end
function parseADLRank(self::Bitmex, info; market=nothing)
    marketId = safeString(info, "symbol");
    datetime = safeString(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("rank") => safeInteger(info, "deleveragePercentile"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
"""
fetches historical settlement records
see: https://docs.bitmex.com/api-explorer/get-settlements

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.until`::int, optional: timestamp in ms EXCHANGE SPECIFIC PARAMETERS
- `params.filter`::string, optional: generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the timestamp docs for more details, default value = {}
- `params.columns`::string, optional: array of column names to fetch, if omitted, will return all columns, note that this method will always return item keys, even when not specified, so you may receive more columns that you expect
- `params.start`::int, optional: possible values are >= 0 starting point for results, default value = 0
- `params.reverse`::bool, optional: if true, will sort results newest first, default value = false

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
function fetchSettlementHistory(self::Bitmex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("startTime")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    until = safeString(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = self.iso8601(since);
        params = omit(params, "until");
    end
    response = Base.fetch(self.publicGetSettlement(extend(request, params)));
    return self.parseSettlements(response, market = market, since = since, limit = limit)

end
function parseSettlements(self::Bitmex, settlements; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market = market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseSettlement(self::Bitmex, settlement; market=nothing)
    datetime = safeString(settlement, "timestamp");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("price") => self.safeNumber(settlement, "settledPrice"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
)

end
"""
closes open positions for a market
see: https://docs.bitmex.com/api-explorer/order-new
see: https://docs.bitmex.com/api-explorer/order-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: the buy or sell side of the closing order, if the position is long set the side to sell, reduceOnly is implied
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Bitmex, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => capitalize(side),
        Symbol("execInst") => "Close"
    );
    response = Base.fetch(self.privatePostOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
function handleErrors(self::Bitmex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(code == 429)
        throw(DDoSProtection(string(self.id, " ", body)));
    end
    if functions.ccxtruthy(functions.ccxt_ge(code, 400))
        error = safeValue(response, "error", Dict{Symbol, Any}());
        message = safeString(error, "message");
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        if functions.ccxtruthy(code == 400)
            throw(BadRequest(feedback));
        end
        throw(ExchangeError(feedback));
    end
    return nothing

end
function nonce(self::Bitmex, )
    return milliseconds()

end
function sign(self::Bitmex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = string("/api/", self.version, "/", path);
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(params)))
            query += string("?", self.urlencode(params));
        end
    else
        format = safeString(params, "_format");
        if functions.ccxtruthy(format != nothing)
            query += string("?", self.urlencode(Dict{Symbol, Any}(
    Symbol("_format") => format
)));
            params = omit(params, "_format");
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), query);
    isAuthenticated = self.checkRequiredCredentials(error = false);
    if functions.ccxtruthy(@functions.ccxt_or(api == "private", (@functions.ccxt_and(api == "public", isAuthenticated))))
        self.checkRequiredCredentials();
        auth = string(method, query);
        apiExpires = safeInteger(self.options, "api-expires");
        expires = safeIntegerProduct(self.options, "recvWindow", 0.001, apiExpires);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("api-key") => self.apiKey
        );
        expires = self.sum(seconds(), expires);
        if functions.ccxtruthy(expires == nothing)
            throw(ExchangeError(string(self.id, " sign() missing expires")));
        end
        stringExpires = string(expires);
        auth += stringExpires;
        headers[Symbol("api-expires")] = stringExpires;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(method == "POST", method == "PUT"), method == "DELETE"))
            if functions.ccxtruthy(length(objectKeys(params)))
                body = json(params);
                auth += body;
            end
        end
        headers[Symbol("api-signature")] = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitmex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetAnnouncement(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "announcement"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAnnouncementUrgent(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "announcement/urgent"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChat(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "chat"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChatChannels(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "chat/channels"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChatConnected(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "chat/connected"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChatPinned(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "chat/pinned"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFunding(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "funding"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetGuild(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrument(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentActive(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/active"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentActiveAndIndices(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/activeAndIndices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentActiveIntervals(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/activeIntervals"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentCompositeIndex(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/compositeIndex"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentIndices(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/indices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInstrumentUsdVolume(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "instrument/usdVolume"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInsurance(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "insurance"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetLeaderboard(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "leaderboard"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetLiquidation(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "liquidation"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBookL2(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "orderBook/L2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPorlNonce(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "porl/nonce"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuote(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "quote"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteBucketed(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "quote/bucketed"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSchema(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "schema"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSchemaWebsocketHelp(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "schema/websocketHelp"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSettlement(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "settlement"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStats(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "stats"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStatsHistory(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "stats/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStatsHistoryUSD(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "stats/historyUSD"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrade(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "trade"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradeBucketed(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "trade/bucketed"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetWalletAssets(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "wallet/assets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetWalletNetworks(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "wallet/networks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAddress(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiKey(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "apiKey"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetExecution(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "execution"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetExecutionTradeHistory(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "execution/tradeHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetGlobalNotification(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "globalNotification"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLeaderboardName(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "leaderboard/name"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrder(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPorlSnapshots(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "porl/snapshots"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPosition(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUser(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserAffiliateStatus(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/affiliateStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserCheckReferralCode(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/checkReferralCode"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserCommission(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/commission"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserCsa(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/csa"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserDepositAddress(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/depositAddress"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserExecutionHistory(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/executionHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserGetWalletTransferAccounts(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/getWalletTransferAccounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserMargin(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/margin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserQuoteFillRatio(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/quoteFillRatio"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserQuoteValueRatio(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/quoteValueRatio"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserStaking(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/staking"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserStakingInstruments(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/staking/instruments"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserStakingTiers(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/staking/tiers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserTradingVolume(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/tradingVolume"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserUnstakingRequests(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/unstakingRequests"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserWallet(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/wallet"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserWalletHistory(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/walletHistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserWalletSummary(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/walletSummary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserAffiliates(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "userAffiliates"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserEvent(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "userEvent"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAddress(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "address"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostChat(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "chat"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuild(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuildArchive(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild/archive"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuildJoin(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild/join"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuildKick(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild/kick"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuildLeave(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild/leave"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGuildSharesTrades(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild/sharesTrades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrder(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCancelAllAfter(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order/cancelAllAfter"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderClosePosition(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order/closePosition"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionIsolate(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "position/isolate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionLeverage(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "position/leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionRiskLimit(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "position/riskLimit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionTransferMargin(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "position/transferMargin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserAddSubaccount(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/addSubaccount"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserCancelWithdrawal(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/cancelWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserCommunicationToken(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/communicationToken"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserConfirmEmail(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/confirmEmail"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserConfirmWithdrawal(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/confirmWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserLogout(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/logout"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserPreferences(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/preferences"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserRequestWithdrawal(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/requestWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserUnstakingRequests(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/unstakingRequests"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserUpdateSubaccount(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/updateSubaccount"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserWalletTransfer(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/walletTransfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutGuild(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "guild"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutOrder(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrder(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrderAll(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "order/all"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteUserUnstakingRequests(self::Bitmex, params=Dict(), context=Dict())
    return request(self, "user/unstakingRequests"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitmex(; kwargs...)
    inst = Bitmex(Exchange(), describe, fetchCurrencies, parseCurrency, convertFromRealAmount, convertToRealAmount, amountToPrecision, convertFromRawQuantity, convertFromRawCost, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBook, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchMyTrades, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchDepositsWithdrawals, parseTransactionStatus, parseTransaction, fetchTicker, fetchTickers, parseTicker, parseOHLCV, fetchOHLCV, parseTrade, parseOrderStatus, parseTimeInForce, parseOrder, fetchTrades, createOrder, editOrder, cancelOrder, cancelOrders, cancelAllOrders, cancelAllOrdersAfter, fetchLeverages, parseLeverage, fetchPositions, parsePosition, withdraw, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, setLeverage, setMarginMode, fetchDepositAddress, parseDepositWithdrawFee, fetchDepositWithdrawFees, fetchOpenInterests, parseOpenInterest, calculateRateLimiterCost, fetchLiquidations, parseLiquidation, fetchPositionsADLRank, parseADLRank, fetchSettlementHistory, parseSettlements, parseSettlement, closePosition, handleErrors, nonce, sign, publicGetAnnouncement, publicGetAnnouncementUrgent, publicGetChat, publicGetChatChannels, publicGetChatConnected, publicGetChatPinned, publicGetFunding, publicGetGuild, publicGetInstrument, publicGetInstrumentActive, publicGetInstrumentActiveAndIndices, publicGetInstrumentActiveIntervals, publicGetInstrumentCompositeIndex, publicGetInstrumentIndices, publicGetInstrumentUsdVolume, publicGetInsurance, publicGetLeaderboard, publicGetLiquidation, publicGetOrderBookL2, publicGetPorlNonce, publicGetQuote, publicGetQuoteBucketed, publicGetSchema, publicGetSchemaWebsocketHelp, publicGetSettlement, publicGetStats, publicGetStatsHistory, publicGetStatsHistoryUSD, publicGetTrade, publicGetTradeBucketed, publicGetWalletAssets, publicGetWalletNetworks, privateGetAddress, privateGetApiKey, privateGetExecution, privateGetExecutionTradeHistory, privateGetGlobalNotification, privateGetLeaderboardName, privateGetOrder, privateGetPorlSnapshots, privateGetPosition, privateGetUser, privateGetUserAffiliateStatus, privateGetUserCheckReferralCode, privateGetUserCommission, privateGetUserCsa, privateGetUserDepositAddress, privateGetUserExecutionHistory, privateGetUserGetWalletTransferAccounts, privateGetUserMargin, privateGetUserQuoteFillRatio, privateGetUserQuoteValueRatio, privateGetUserStaking, privateGetUserStakingInstruments, privateGetUserStakingTiers, privateGetUserTradingVolume, privateGetUserUnstakingRequests, privateGetUserWallet, privateGetUserWalletHistory, privateGetUserWalletSummary, privateGetUserAffiliates, privateGetUserEvent, privatePostAddress, privatePostChat, privatePostGuild, privatePostGuildArchive, privatePostGuildJoin, privatePostGuildKick, privatePostGuildLeave, privatePostGuildSharesTrades, privatePostOrder, privatePostOrderCancelAllAfter, privatePostOrderClosePosition, privatePostPositionIsolate, privatePostPositionLeverage, privatePostPositionRiskLimit, privatePostPositionTransferMargin, privatePostUserAddSubaccount, privatePostUserCancelWithdrawal, privatePostUserCommunicationToken, privatePostUserConfirmEmail, privatePostUserConfirmWithdrawal, privatePostUserLogout, privatePostUserPreferences, privatePostUserRequestWithdrawal, privatePostUserUnstakingRequests, privatePostUserUpdateSubaccount, privatePostUserWalletTransfer, privatePutGuild, privatePutOrder, privateDeleteOrder, privateDeleteOrderAll, privateDeleteUserUnstakingRequests)
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
function __ccxt_doc_Bitmex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitmex_fetchCurrencies

function __ccxt_doc_Bitmex_fetchMarkets() end
"""
retrieves data on all markets for bitmex
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActive

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitmex_fetchMarkets

function __ccxt_doc_Bitmex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitmex.com/api/explorer/#!/User/User_getMargin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bitmex_fetchBalance

function __ccxt_doc_Bitmex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitmex.com/api/explorer/#!/OrderBook/OrderBook_getL2

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitmex_fetchOrderBook

function __ccxt_doc_Bitmex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_fetchOrder

function __ccxt_doc_Bitmex_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the earliest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_fetchOrders

function __ccxt_doc_Bitmex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_fetchOpenOrders

function __ccxt_doc_Bitmex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_fetchClosedOrders

function __ccxt_doc_Bitmex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.bitmex.com/api/explorer/#!/Execution/Execution_getTradeHistory

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitmex_fetchMyTrades

function __ccxt_doc_Bitmex_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Bitmex_fetchLedger

function __ccxt_doc_Bitmex_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitmex_fetchDepositsWithdrawals

function __ccxt_doc_Bitmex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitmex_fetchTicker

function __ccxt_doc_Bitmex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitmex_fetchTickers

function __ccxt_doc_Bitmex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitmex.com/api/explorer/#!/Trade/Trade_getBucketed

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitmex_fetchOHLCV

function __ccxt_doc_Bitmex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitmex.com/api/explorer/#!/Trade/Trade_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bitmex_fetchTrades

function __ccxt_doc_Bitmex_createOrder() end
"""
create a trade order
see: https://www.bitmex.com/api/explorer/#!/Order/Order_new

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::object, optional: the price at which a trigger order is triggered at
- `params.triggerDirection`::object, optional: the direction whenever the trigger happens with relation to price - 'ascending' or 'descending'
- `params.trailingAmount`::float, optional: the quote amount to trail away from the current market price

# Returns
- an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
"""
__ccxt_doc_Bitmex_createOrder

function __ccxt_doc_Bitmex_cancelOrder() end
"""
cancels an open order
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancel

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_cancelOrder

function __ccxt_doc_Bitmex_cancelOrders() end
"""
cancel multiple orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_cancelOrders

function __ccxt_doc_Bitmex_cancelAllOrders() end
"""
cancel all open orders
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAll

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_cancelAllOrders

function __ccxt_doc_Bitmex_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout
see: https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAllAfter

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the api result
"""
__ccxt_doc_Bitmex_cancelAllOrdersAfter

function __ccxt_doc_Bitmex_fetchLeverages() end
"""
fetch the set leverage for all contract markets
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Bitmex_fetchLeverages

function __ccxt_doc_Bitmex_fetchPositions() end
"""
fetch all open positions
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bitmex_fetchPositions

function __ccxt_doc_Bitmex_withdraw() end
"""
make a withdrawal
see: https://www.bitmex.com/api/explorer/#!/User/User_requestWithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitmex_withdraw

function __ccxt_doc_Bitmex_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Bitmex_fetchFundingRates

function __ccxt_doc_Bitmex_fetchFundingRateHistory() end
"""
Fetches the history of funding rates
see: https://www.bitmex.com/api/explorer/#!/Funding/Funding_get

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for ending date filter
- `params.reverse`::bool, optional: if true, will sort results newest first
- `params.start`::int, optional: starting point for results
- `params.columns`::string, optional: array of column names to fetch in info, if omitted, will return all columns
- `params.filter`::string, optional: generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the [timestamp docs]{@link https://www.bitmex.com/app/restAPI#Timestamp-Filters} for more details

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bitmex_fetchFundingRateHistory

function __ccxt_doc_Bitmex_setLeverage() end
"""
set the level of leverage for a market
see: https://www.bitmex.com/api/explorer/#!/Position/Position_updateLeverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bitmex_setLeverage

function __ccxt_doc_Bitmex_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.bitmex.com/api/explorer/#!/Position/Position_isolateMargin

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bitmex_setMarginMode

function __ccxt_doc_Bitmex_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitmex.com/api/explorer/#!/User/User_getDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bitmex_fetchDepositAddress

function __ccxt_doc_Bitmex_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitmex_fetchDepositWithdrawFees

function __ccxt_doc_Bitmex_fetchOpenInterests() end
"""
Retrieves the open interest for a list of symbols
see: https://docs.bitmex.com/api-explorer/get-stats

# Arguments
- `symbols`::array, optional: a list of unified CCXT market symbols
- `params`::object, optional: exchange specific parameters

# Returns
- a list of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Bitmex_fetchOpenInterests

function __ccxt_doc_Bitmex_fetchLiquidations() end
"""
retrieves the public liquidations of a trading pair
see: https://www.bitmex.com/api/explorer/#!/Liquidation/Liquidation_get

# Arguments
- `symbol`::string: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bitmex api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Bitmex_fetchLiquidations

function __ccxt_doc_Bitmex_fetchPositionsADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://www.bitmex.com/api/explorer/#!/Position/Position_get

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Bitmex_fetchPositionsADLRank

function __ccxt_doc_Bitmex_fetchSettlementHistory() end
"""
fetches historical settlement records
see: https://docs.bitmex.com/api-explorer/get-settlements

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.until`::int, optional: timestamp in ms EXCHANGE SPECIFIC PARAMETERS
- `params.filter`::string, optional: generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the timestamp docs for more details, default value = {}
- `params.columns`::string, optional: array of column names to fetch, if omitted, will return all columns, note that this method will always return item keys, even when not specified, so you may receive more columns that you expect
- `params.start`::int, optional: possible values are >= 0 starting point for results, default value = 0
- `params.reverse`::bool, optional: if true, will sort results newest first, default value = false

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
__ccxt_doc_Bitmex_fetchSettlementHistory

function __ccxt_doc_Bitmex_closePosition() end
"""
closes open positions for a market
see: https://docs.bitmex.com/api-explorer/order-new
see: https://docs.bitmex.com/api-explorer/order-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: the buy or sell side of the closing order, if the position is long set the side to sell, reduceOnly is implied
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitmex_closePosition
