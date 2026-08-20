@kwdef mutable struct Paradex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signMessage::Function = signMessage
    getSystemConfig::Function = getSystemConfig
    prepareParadexDomain::Function = prepareParadexDomain
    retrieveAccount::Function = retrieveAccount
    onboarding::Function = onboarding
    authenticateRest::Function = authenticateRest
    parseOrder::Function = parseOrder
    parseTimeInForce::Function = parseTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    scaleNumber::Function = scaleNumber
    createOrderRequest::Function = createOrderRequest
    signOrderRequest::Function = signOrderRequest
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    createOrders::Function = createOrders
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchMyTrades::Function = fetchMyTrades
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    setMarginMode::Function = setMarginMode
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    encodeMarginMode::Function = encodeMarginMode
    setLeverage::Function = setLeverage
    fetchGreeks::Function = fetchGreeks
    fetchAllGreeks::Function = fetchAllGreeks
    parseGreeks::Function = parseGreeks
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetBboMarket::Function = publicGetBboMarket
    publicGetBboMarketInteractive::Function = publicGetBboMarketInteractive
    publicGetFundingData::Function = publicGetFundingData
    publicGetMarkets::Function = publicGetMarkets
    publicGetMarketsHistory::Function = publicGetMarketsHistory
    publicGetMarketsKlines::Function = publicGetMarketsKlines
    publicGetMarketsSettlementPrice::Function = publicGetMarketsSettlementPrice
    publicGetMarketsSummary::Function = publicGetMarketsSummary
    publicGetOrderbookMarket::Function = publicGetOrderbookMarket
    publicGetOrderbookMarketImpactPrice::Function = publicGetOrderbookMarketImpactPrice
    publicGetOrderbookMarketInteractive::Function = publicGetOrderbookMarketInteractive
    publicGetInsurance::Function = publicGetInsurance
    publicGetJwksJson::Function = publicGetJwksJson
    publicGetOnboarding::Function = publicGetOnboarding
    publicGetReferralsConfig::Function = publicGetReferralsConfig
    publicGetStakingConfig::Function = publicGetStakingConfig
    publicGetSystemAnnouncements::Function = publicGetSystemAnnouncements
    publicGetSystemConfig::Function = publicGetSystemConfig
    publicGetSystemPortfolioMarginConfig::Function = publicGetSystemPortfolioMarginConfig
    publicGetSystemState::Function = publicGetSystemState
    publicGetSystemTime::Function = publicGetSystemTime
    publicGetSystemVolumeTiers::Function = publicGetSystemVolumeTiers
    publicGetTrades::Function = publicGetTrades
    publicGetVaults::Function = publicGetVaults
    publicGetVaultsBalance::Function = publicGetVaultsBalance
    publicGetVaultsConfig::Function = publicGetVaultsConfig
    publicGetVaultsHistory::Function = publicGetVaultsHistory
    publicGetVaultsPositions::Function = publicGetVaultsPositions
    publicGetVaultsSummary::Function = publicGetVaultsSummary
    publicGetVaultsTransfers::Function = publicGetVaultsTransfers
    publicGetXpFeeConfig::Function = publicGetXpFeeConfig
    publicGetXpPublicTransfers::Function = publicGetXpPublicTransfers
    publicGetXpTransferTransferId::Function = publicGetXpTransferTransferId
    privateGetAccount::Function = privateGetAccount
    privateGetAccountCompliance::Function = privateGetAccountCompliance
    privateGetAccountHistory::Function = privateGetAccountHistory
    privateGetAccountInfo::Function = privateGetAccountInfo
    privateGetAccountMargin::Function = privateGetAccountMargin
    privateGetAccountProfile::Function = privateGetAccountProfile
    privateGetAccountSettings::Function = privateGetAccountSettings
    privateGetAccountSubaccounts::Function = privateGetAccountSubaccounts
    privateGetAccountSummary::Function = privateGetAccountSummary
    privateGetBalance::Function = privateGetBalance
    privateGetFills::Function = privateGetFills
    privateGetFundingPayments::Function = privateGetFundingPayments
    privateGetPositions::Function = privateGetPositions
    privateGetTradebusts::Function = privateGetTradebusts
    privateGetTransactions::Function = privateGetTransactions
    privateGetAccountKeysSubkeys::Function = privateGetAccountKeysSubkeys
    privateGetAccountKeysSubkeysPublicKey::Function = privateGetAccountKeysSubkeysPublicKey
    privateGetAccountTokens::Function = privateGetAccountTokens
    privateGetAlgoOrders::Function = privateGetAlgoOrders
    privateGetAlgoOrdersHistory::Function = privateGetAlgoOrdersHistory
    privateGetAlgoOrdersAlgoId::Function = privateGetAlgoOrdersAlgoId
    privateGetBlockTrades::Function = privateGetBlockTrades
    privateGetBlockTradesBlockTradeId::Function = privateGetBlockTradesBlockTradeId
    privateGetBlockTradesBlockTradeIdOffers::Function = privateGetBlockTradesBlockTradeIdOffers
    privateGetBlockTradesBlockTradeIdOffersOfferId::Function = privateGetBlockTradesBlockTradeIdOffersOfferId
    privateGetLiquidations::Function = privateGetLiquidations
    privateGetOrders::Function = privateGetOrders
    privateGetOrdersHistory::Function = privateGetOrdersHistory
    privateGetOrdersByClientIdClientId::Function = privateGetOrdersByClientIdClientId
    privateGetOrdersOrderId::Function = privateGetOrdersOrderId
    privateGetReferralsQrCode::Function = privateGetReferralsQrCode
    privateGetReferralsSummary::Function = privateGetReferralsSummary
    privateGetStakingHistory::Function = privateGetStakingHistory
    privateGetStakingSummary::Function = privateGetStakingSummary
    privateGetTransfers::Function = privateGetTransfers
    privateGetVaultsAccountSummary::Function = privateGetVaultsAccountSummary
    privateGetVaultsMine::Function = privateGetVaultsMine
    privateGetXpAccountBalance::Function = privateGetXpAccountBalance
    privateGetXpTransfers::Function = privateGetXpTransfers
    privatePostAccountCompliance::Function = privatePostAccountCompliance
    privatePostAccountMarginMarket::Function = privatePostAccountMarginMarket
    privatePostAccountProfileMarketMaxSlippageMarket::Function = privatePostAccountProfileMarketMaxSlippageMarket
    privatePostAccountProfileNotifications::Function = privatePostAccountProfileNotifications
    privatePostAccountProfileNotificationsLastSeen::Function = privatePostAccountProfileNotificationsLastSeen
    privatePostAccountProfileReferralCode::Function = privatePostAccountProfileReferralCode
    privatePostAccountProfileRefreshInventory::Function = privatePostAccountProfileRefreshInventory
    privatePostAccountProfileSizeCurrencyDisplay::Function = privatePostAccountProfileSizeCurrencyDisplay
    privatePostAccountProfileUsername::Function = privatePostAccountProfileUsername
    privatePostAccountReferrer::Function = privatePostAccountReferrer
    privatePostAccountSettingsTradingValueDisplay::Function = privatePostAccountSettingsTradingValueDisplay
    privatePostAccountKeysSubkeysActivate::Function = privatePostAccountKeysSubkeysActivate
    privatePostAccountKeysSubkeys::Function = privatePostAccountKeysSubkeys
    privatePostAccountTokens::Function = privatePostAccountTokens
    privatePostAlgoOrders::Function = privatePostAlgoOrders
    privatePostAuth::Function = privatePostAuth
    privatePostBlockTrades::Function = privatePostBlockTrades
    privatePostBlockTradesBlockTradeIdExecute::Function = privatePostBlockTradesBlockTradeIdExecute
    privatePostBlockTradesBlockTradeIdOffers::Function = privatePostBlockTradesBlockTradeIdOffers
    privatePostBlockTradesBlockTradeIdOffersOfferIdExecute::Function = privatePostBlockTradesBlockTradeIdOffersOfferIdExecute
    privatePostOnboarding::Function = privatePostOnboarding
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersBatch::Function = privatePostOrdersBatch
    privatePostV2Auth::Function = privatePostV2Auth
    privatePostV2Onboarding::Function = privatePostV2Onboarding
    privatePostVaults::Function = privatePostVaults
    privatePostXpTransfer::Function = privatePostXpTransfer
    privatePutAccountProfile::Function = privatePutAccountProfile
    privatePutAccountKeysSubkeysPublicKey::Function = privatePutAccountKeysSubkeysPublicKey
    privatePutOrdersOrderId::Function = privatePutOrdersOrderId
    privateDeleteAccountKeysSubkeysPublicKey::Function = privateDeleteAccountKeysSubkeysPublicKey
    privateDeleteAccountTokensLookupId::Function = privateDeleteAccountTokensLookupId
    privateDeleteAlgoOrdersAlgoId::Function = privateDeleteAlgoOrdersAlgoId
    privateDeleteBlockTradesBlockTradeId::Function = privateDeleteBlockTradesBlockTradeId
    privateDeleteBlockTradesBlockTradeIdOffersOfferId::Function = privateDeleteBlockTradesBlockTradeIdOffersOfferId
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteOrdersBatch::Function = privateDeleteOrdersBatch
    privateDeleteOrdersByClientIdClientId::Function = privateDeleteOrdersByClientIdClientId
    privateDeleteOrdersOrderId::Function = privateDeleteOrdersOrderId

end
function describe(self::Paradex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "paradex",
    Symbol("name") => "Paradex",
    Symbol("countries") => [],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 50,
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
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 1,
        Symbol("3m") => 3,
        Symbol("5m") => 5,
        Symbol("15m") => 15,
        Symbol("30m") => 30,
        Symbol("1h") => 60
    ),
    Symbol("hostname") => "paradex.trade",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/84628770-784e-4ec4-a759-ec2fbb2244ea",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v1") => "https://api.prod.{hostname}/v1",
            Symbol("v2") => "https://api.prod.{hostname}/v2"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("v1") => "https://api.testnet.{hostname}/v1",
            Symbol("v2") => "https://api.testnet.{hostname}/v2"
        ),
        Symbol("www") => "https://www.paradex.trade/",
        Symbol("doc") => "https://docs.api.testnet.paradex.trade/",
        Symbol("fees") => "https://docs.paradex.trade/getting-started/trading-fees",
        Symbol("referral") => "https://app.paradex.trade/r/ccxt24"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("bbo/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bbo/{market}/interactive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding/data") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/settlement-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/{market}/impact-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/{market}/interactive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("jwks.json") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("onboarding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("referrals/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/portfolio-margin-config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/state") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("system/volume-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/fee-config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/public-transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/transfer/{transfer_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/compliance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/subaccounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding/payments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradebusts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/keys/subkeys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/keys/subkeys/{public_key}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/tokens") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/orders/{algo_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/offers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/offers/{offer_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("liquidations") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/by_client_id/{client_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("referrals/qr-code") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("referrals/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/account-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults/mine") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/account-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/compliance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/margin/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/market_max_slippage/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/notifications") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/notifications/last_seen") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/referral_code") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/refresh_inventory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/size_currency_display") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/profile/username") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/referrer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/settings/trading_value_display") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/keys/subkeys/activate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/keys/subkeys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/tokens") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("auth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/offers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/offers/{offer_id}/execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("onboarding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/auth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/onboarding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vaults") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xp/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("account/profile") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/keys/subkeys/{public_key}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("account/keys/subkeys/{public_key}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/tokens/{lookup_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/orders/{algo_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block-trades/{block_trade_id}/offers/{offer_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/by_client_id/{client_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0002"),
            Symbol("maker") => self.parseNumber("0.0002")
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0002"),
            Symbol("maker") => self.parseNumber("0.0002")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => true,
        Symbol("privateKey") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("VALIDATION_ERROR") => AuthenticationError,
            Symbol("BINDING_ERROR") => OperationRejected,
            Symbol("INTERNAL_ERROR") => ExchangeError,
            Symbol("NOT_FOUND") => BadRequest,
            Symbol("SERVICE_UNAVAILABLE") => ExchangeError,
            Symbol("INVALID_REQUEST_PARAMETER") => BadRequest,
            Symbol("ORDER_ID_NOT_FOUND") => InvalidOrder,
            Symbol("ORDER_IS_CLOSED") => InvalidOrder,
            Symbol("ORDER_IS_NOT_OPEN_YET") => InvalidOrder,
            Symbol("CLIENT_ORDER_ID_NOT_FOUND") => InvalidOrder,
            Symbol("DUPLICATED_CLIENT_ID") => InvalidOrder,
            Symbol("INVALID_PRICE_PRECISION") => OperationRejected,
            Symbol("INVALID_SYMBOL") => OperationRejected,
            Symbol("INVALID_TOKEN") => OperationRejected,
            Symbol("INVALID_ETHEREUM_ADDRESS") => OperationRejected,
            Symbol("INVALID_ETHEREUM_SIGNATURE") => OperationRejected,
            Symbol("INVALID_STARKNET_ADDRESS") => OperationRejected,
            Symbol("INVALID_STARKNET_SIGNATURE") => OperationRejected,
            Symbol("STARKNET_SIGNATURE_VERIFICATION_FAILED") => AuthenticationError,
            Symbol("BAD_STARKNET_REQUEST") => BadRequest,
            Symbol("ETHEREUM_SIGNER_MISMATCH") => BadRequest,
            Symbol("ETHEREUM_HASH_MISMATCH") => BadRequest,
            Symbol("NOT_ONBOARDED") => BadRequest,
            Symbol("INVALID_TIMESTAMP") => BadRequest,
            Symbol("INVALID_SIGNATURE_EXPIRATION") => AuthenticationError,
            Symbol("ACCOUNT_NOT_FOUND") => AuthenticationError,
            Symbol("INVALID_ORDER_SIGNATURE") => AuthenticationError,
            Symbol("PUBLIC_KEY_INVALID") => BadRequest,
            Symbol("UNAUTHORIZED_ETHEREUM_ADDRESS") => BadRequest,
            Symbol("ETHEREUM_ADDRESS_ALREADY_ONBOARDED") => BadRequest,
            Symbol("MARKET_NOT_FOUND") => BadRequest,
            Symbol("ALLOWLIST_ENTRY_NOT_FOUND") => BadRequest,
            Symbol("USERNAME_IN_USE") => AuthenticationError,
            Symbol("GEO_IP_BLOCK") => PermissionDenied,
            Symbol("ETHEREUM_ADDRESS_BLOCKED") => PermissionDenied,
            Symbol("PROGRAM_NOT_FOUND") => BadRequest,
            Symbol("INVALID_DASHBOARD") => OperationRejected,
            Symbol("MARKET_NOT_OPEN") => BadRequest,
            Symbol("INVALID_REFERRAL_CODE") => OperationRejected,
            Symbol("PARENT_ADDRESS_ALREADY_ONBOARDED") => BadRequest,
            Symbol("INVALID_PARENT_ACCOUNT") => OperationRejected,
            Symbol("INVALID_VAULT_OPERATOR_CHAIN") => OperationRejected,
            Symbol("VAULT_OPERATOR_ALREADY_ONBOARDED") => OperationRejected,
            Symbol("VAULT_NAME_IN_USE") => OperationRejected,
            Symbol("BATCH_SIZE_OUT_OF_RANGE") => OperationRejected,
            Symbol("ISOLATED_MARKET_ACCOUNT_MISMATCH") => OperationRejected,
            Symbol("POINTS_SUMMARY_NOT_FOUND") => OperationRejected,
            Symbol("-32700") => BadRequest,
            Symbol("-32600") => BadRequest,
            Symbol("-32601") => BadRequest,
            Symbol("-32602") => BadRequest,
            Symbol("-32603") => ExchangeError,
            Symbol("100") => BadRequest,
            Symbol("40110") => AuthenticationError,
            Symbol("40111") => AuthenticationError,
            Symbol("40112") => PermissionDenied
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("missing or malformed jwt") => AuthenticationError
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("paradexAccount") => nothing,
        Symbol("broker") => "CCXT"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => nothing,
        Symbol("forSwap") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forSwap"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.paradex.trade/api/prod/system/get-time-unix-milliseconds

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Paradex; params=Dict())
    response = Base.fetch(self.publicGetSystemTime(params));
    return safeInteger(response, "server_time")

end
"""
the latest known information on the availability of the exchange API
see: https://docs.paradex.trade/api/prod/system/get-state

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Paradex; params=Dict())
    response = Base.fetch(self.publicGetSystemState(params));
    status = safeString(response, "status");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "ok")) ? "ok" : "maintenance",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
retrieves data on all markets for paradex
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Paradex; params=Dict())
    response = Base.fetch(self.publicGetMarkets(params));
    data = self.safeList(response, "results");
    return self.parseMarkets(data)

end
function parseMarket(self::Paradex, market)
    assetKind = safeString(market, "asset_kind");
    isOptionPerpetual = (assetKind == "PERP_OPTION");
    isOptionDelivery = (assetKind == "OPTION");
    isOption = @functions.ccxt_or(isOptionPerpetual, isOptionDelivery);
    type_var = functions.ccxtruthy((isOption)) ? "option" : "swap";
    isSwap = (type_var == "swap");
    marketId = safeString(market, "symbol");
    quoteId = safeString(market, "quote_currency");
    baseId = safeString(market, "base_currency");
    quote_var = self.safeCurrencyCode(quoteId);
    base = self.safeCurrencyCode(baseId);
    settleId = safeString(market, "settlement_currency");
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    expiry = safeInteger(market, "expiry_at");
    optionType = safeString(market, "option_type");
    strikePrice = safeString(market, "strike_price");
    takerFee = self.parseNumber("0.0003");
    makerFee = self.parseNumber("-0.00005");
    if functions.ccxtruthy(isOption)
        optionTypeSuffix = functions.ccxtruthy((optionType == "CALL")) ? "C" : "P";
        deliveryValue = functions.ccxtruthy((expiry == 0)) ? "" : string(self.yymmdd(expiry), "-");
        symbol = string(symbol, "-", deliveryValue, strikePrice, "-", optionTypeSuffix);
        makerFee = self.parseNumber("0.0003");
    else
        expiry = nothing;
    end
    expireDatetime = functions.ccxtruthy((expiry == 0)) ? nothing : self.iso8601(expiry);
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => false,
    Symbol("margin") => nothing,
    Symbol("swap") => isSwap,
    Symbol("future") => false,
    Symbol("option") => isOption,
    Symbol("active") => self.safeBool(market, "enableTrading"),
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => takerFee,
    Symbol("maker") => makerFee,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => expireDatetime,
    Symbol("strike") => self.parseNumber(strikePrice),
    Symbol("optionType") => safeStringLower(market, "option_type"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "order_size_increment"),
        Symbol("price") => self.safeNumber(market, "price_tick_size")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.safeNumber(market, "max_order_size")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_notional"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseTradingFee(self::Paradex, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    feeConfig = self.safeDict(fee, "fee_config", defaultValue = Dict{Symbol, Any}());
    apiFee = self.safeDict(feeConfig, "api_fee", defaultValue = Dict{Symbol, Any}());
    makerFee = self.safeDict(apiFee, "maker_fee", defaultValue = Dict{Symbol, Any}());
    takerFee = self.safeDict(apiFee, "taker_fee", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.safeNumber(makerFee, "fee", defaultNumber = self.safeNumber(market, "maker")),
    Symbol("taker") => self.safeNumber(takerFee, "fee", defaultNumber = self.safeNumber(market, "taker")),
    Symbol("percentage") => true,
    Symbol("tierBased") => false
)

end
"""
fetch the trading fees for a market
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Paradex, symbol; params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTradingFee() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarkets(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Paradex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetMarkets(params));
    fees = self.safeList(response, "results", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = fee;
        i += 1
    end
    return result

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.paradex.trade/api/prod/markets/klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "last", "mark", "index", default is "last"

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Paradex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    now = milliseconds();
    duration = self.parseTimeframe(timeframe);
    until = safeInteger2(params, "until", "till", now);
    price = safeString(params, "price");
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price_kind")] = price;
    end
    params = omit(params, ["until", "till", "price"]);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("end_at")] = self.sum(since, duration * (limit + 1) * 1000) - 1;
        else
            request[Symbol("end_at")] = until;
        end
    else
        request[Symbol("end_at")] = until;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("start_at")] = until - duration * (limit + 1) * 1000 + 1;
        else
            request[Symbol("start_at")] = until - duration * 101 * 1000 + 1;
        end
    end
    response = Base.fetch(self.publicGetMarketsKlines(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Paradex, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Paradex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}(
        Symbol("market") => "ALL"
    );
    response = Base.fetch(self.publicGetMarketsSummary(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    return self.parseTickers(data, symbols = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Paradex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsSummary(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    ticker = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
function parseTicker(self::Paradex, ticker; market=nothing)
    percentage = safeString(ticker, "price_change_rate_24h");
    if functions.ccxtruthy(percentage != nothing)
        percentage = stringMul(percentage, "100");
    end
    last_var = safeString(ticker, "last_traded_price");
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(ticker, "created_at");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => safeString(ticker, "volume_24h"),
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.paradex.trade/api/prod/markets/get-orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Paradex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderbookMarket(extend(request, params)));
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("depth")] = limit;
    end
    timestamp = safeInteger(response, "last_updated_at");
    orderbook = self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = timestamp);
    orderbook[Symbol("nonce")] = safeInteger(response, "seq_no");
    return orderbook

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.paradex.trade/api/prod/trades/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Paradex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = min(limit, 1000);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    trades = self.safeList(response, "results", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        trades[i + 1][Symbol("next")] = safeString(response, "next");
        i += 1
    end
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Paradex, trade; market=nothing)
    marketId = safeString(trade, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    id = safeString(trade, "id");
    timestamp = safeInteger(trade, "created_at");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "size");
    side = safeStringLower(trade, "side");
    liability = safeStringLower(trade, "liquidity", "taker");
    isTaker = liability == "taker";
    takerOrMaker = functions.ccxtruthy((isTaker)) ? "taker" : "maker";
    currencyId = safeString(trade, "fee_currency");
    code = self.safeCurrencyCode(currencyId);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => safeString(trade, "fee"),
        Symbol("currency") => code,
        Symbol("rate") => nothing
    )
), market = market)

end
"""
retrieves the open interest of a contract trading pair
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Paradex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsSummary(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    interest = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOpenInterest(interest, market = market)

end
function parseOpenInterest(self::Paradex, interest; market=nothing)
    timestamp = safeInteger(interest, "created_at");
    marketId = safeString(interest, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("openInterestAmount") => safeString(interest, "open_interest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
function hashMessage(self::Paradex, message)
    return string("0x", hash(message, keccak, "hex"))

end
function signHash(self::Paradex, hash, privateKey)
    signature = ecdsa(functions.ccxt_slice(hash, -64), functions.ccxt_slice(privateKey, -64), secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing)));
    return string("0x", lpad(r, 64, "0"), lpad(s, 64, "0"), v)

end
function signMessage(self::Paradex, message, privateKey)
    return self.signHash(self.hashMessage(message), functions.ccxt_slice(privateKey, -64))

end
function getSystemConfig(self::Paradex, )
    cachedConfig = self.safeDict(self.options, "systemConfig");
    if functions.ccxtruthy(cachedConfig != nothing)
            return cachedConfig
    end
    response = Base.fetch(self.publicGetSystemConfig());
    self.options[Symbol("systemConfig")] = response;
    return self.safeDict(self.options, "systemConfig", defaultValue = Dict{Symbol, Any}())

end
function prepareParadexDomain(self::Paradex; l1=false)
    systemConfig = Base.fetch(self.getSystemConfig());
    if functions.ccxtruthy(l1)
        l1D = Dict{Symbol, Any}(
            Symbol("name") => "Paradex",
            Symbol("chainId") => get(systemConfig, Symbol("l1_chain_id"), nothing),
            Symbol("version") => "1"
        );
            return l1D
    end
    domain = Dict{Symbol, Any}(
        Symbol("name") => "Paradex",
        Symbol("chainId") => get(systemConfig, Symbol("starknet_chain_id"), nothing),
        Symbol("version") => 1
    );
    return domain

end
function retrieveAccount(self::Paradex, )
    cachedAccount = self.safeDict(self.options, "paradexAccount");
    if functions.ccxtruthy(cachedAccount != nothing)
            return cachedAccount
    end
    self.checkRequiredCredentials();
    systemConfig = Base.fetch(self.getSystemConfig());
    domain = Base.fetch(self.prepareParadexDomain(l1 = true));
    messageTypes = Dict{Symbol, Any}(
        Symbol("Constant") => [Dict{Symbol, Any}(
        Symbol("name") => "action",
        Symbol("type") => "string"
    )]
    );
    message = Dict{Symbol, Any}(
        Symbol("action") => "STARK Key"
    );
    msg = self.ethEncodeStructuredData(domain, messageTypes, message);
    signature = self.signMessage(msg, self.privateKey);
    account = self.retrieveStarkAccount(signature, get(systemConfig, Symbol("paraclear_account_hash"), nothing), get(systemConfig, Symbol("paraclear_account_proxy_hash"), nothing));
    self.options[Symbol("paradexAccount")] = account;
    return account

end
function onboarding(self::Paradex; params=Dict())
    account = Base.fetch(self.retrieveAccount());
    req = Dict{Symbol, Any}(
        Symbol("action") => "Onboarding"
    );
    domain = Base.fetch(self.prepareParadexDomain());
    messageTypes = Dict{Symbol, Any}(
        Symbol("Constant") => [Dict{Symbol, Any}(
        Symbol("name") => "action",
        Symbol("type") => "felt"
    )]
    );
    msg = self.starknetEncodeStructuredData(domain, messageTypes, req, get(account, Symbol("address"), nothing));
    signature = self.starknetSign(msg, get(account, Symbol("privateKey"), nothing));
    params[Symbol("signature")] = signature;
    params[Symbol("account")] = get(account, Symbol("address"), nothing);
    params[Symbol("public_key")] = get(account, Symbol("publicKey"), nothing);
    response = Base.fetch(self.privatePostOnboarding(params));
    return response

end
function authenticateRest(self::Paradex; params=Dict())
    cachedToken = safeString(self.options, "authToken");
    now = self.nonce();
    if functions.ccxtruthy(cachedToken != nothing)
        cachedExpires = safeInteger(self.options, "expires");
        if functions.ccxtruthy(cachedExpires == nothing)
            throw(ExchangeError(string(self.id, " authenticateRest() missing cachedExpires")));
        end
        if functions.ccxtruthy(functions.ccxt_lt(now, cachedExpires))
                return cachedToken
        end
    end
    account = Base.fetch(self.retrieveAccount());
    expires = now + 180;
    req = Dict{Symbol, Any}(
        Symbol("method") => "POST",
        Symbol("path") => "/v1/auth",
        Symbol("body") => "",
        Symbol("timestamp") => now,
        Symbol("expiration") => expires
    );
    domain = Base.fetch(self.prepareParadexDomain());
    messageTypes = Dict{Symbol, Any}(
        Symbol("Request") => [Dict{Symbol, Any}(
        Symbol("name") => "method",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "path",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "body",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "timestamp",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "expiration",
        Symbol("type") => "felt"
    )]
    );
    msg = self.starknetEncodeStructuredData(domain, messageTypes, req, get(account, Symbol("address"), nothing));
    signature = self.starknetSign(msg, get(account, Symbol("privateKey"), nothing));
    params[Symbol("signature")] = signature;
    params[Symbol("account")] = get(account, Symbol("address"), nothing);
    params[Symbol("timestamp")] = get(req, Symbol("timestamp"), nothing);
    params[Symbol("expiration")] = get(req, Symbol("expiration"), nothing);
    response = Base.fetch(self.privatePostAuth(params));
    token = safeString(response, "jwt_token");
    self.options[Symbol("authToken")] = token;
    self.options[Symbol("expires")] = expires;
    return token

end
function parseOrder(self::Paradex, order; market=nothing)
    timestamp = safeInteger(order, "created_at");
    orderId = safeString(order, "id");
    clientOrderId = omitZero(safeString(order, "client_id"));
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString(order, "price");
    amount = safeString(order, "size");
    orderType = safeString(order, "type");
    cancelReason = safeString(order, "cancel_reason");
    status = safeString(order, "status");
    if functions.ccxtruthy(cancelReason != nothing)
        if functions.ccxtruthy(@functions.ccxt_or(cancelReason == "NOT_ENOUGH_MARGIN", cancelReason == "ORDER_EXCEEDS_POSITION_LIMIT"))
            status = "rejected";
        else
            status = "canceled";
        end
    end
    side = safeStringLower(order, "side");
    average = omitZero(safeString(order, "avg_fill_price"));
    remaining = omitZero(safeString(order, "remaining_size"));
    lastUpdateTimestamp = safeInteger(order, "last_updated_at");
    flags = self.safeList(order, "flags", defaultValue = []);
    reduceOnly = nothing;
    if functions.ccxtruthy(ccxt_in("REDUCE_ONLY", flags))
        reduceOnly = true;
    end
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
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "instruction")),
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString(order, "trigger_price"),
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => nothing,
        Symbol("currency") => nothing
    ),
    Symbol("info") => order
), market = market)

end
function parseTimeInForce(self::Paradex, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("IOC") => "IOC",
        Symbol("GTC") => "GTC",
        Symbol("POST_ONLY") => "PO"
    );
    return safeString(timeInForces, timeInForce)

end
function parseOrderStatus(self::Paradex, status)
    if functions.ccxtruthy(status != nothing)
        statuses = Dict{Symbol, Any}(
            Symbol("NEW") => "open",
            Symbol("UNTRIGGERED") => "open",
            Symbol("OPEN") => "open",
            Symbol("CLOSED") => "closed"
        );
            return safeString(statuses, status, status)
    end
    return status

end
function parseOrderType(self::Paradex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("STOP_LIMIT") => "limit",
        Symbol("STOP_MARKET") => "market"
    );
    return safeStringLower(types, type_var, type_var)

end
function scaleNumber(self::Paradex, num)
    return stringMul(num, "100000000")

end
function createOrderRequest(self::Paradex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    orderType = uppercase(type_var);
    orderSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide,
        Symbol("type") => orderType,
        Symbol("instruction") => "GTC"
    );
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isMarket = orderType == "MARKET";
    isTakeProfitOrder = (takeProfitPrice != nothing);
    isStopLossOrder = (stopLossPrice != nothing);
    isStopOrder = @functions.ccxt_or(@functions.ccxt_or((triggerPrice != nothing), isTakeProfitOrder), isStopLossOrder);
    timeInForce = safeStringUpper(params, "timeInForce");
    postOnly = self.isPostOnly(isMarket, nothing, params = params);
    if functions.ccxtruthy(!functions.ccxtruthy(isMarket))
        if functions.ccxtruthy(postOnly)
            request[Symbol("instruction")] = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("instruction")] = "IOC";
        end
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
    end
    sizeString = "0";
    stopPrice = nothing;
    if functions.ccxtruthy(isStopOrder)
        if functions.ccxtruthy(isMarket)
            if functions.ccxtruthy(isStopLossOrder)
                stopPrice = self.priceToPrecision(symbol, stopLossPrice);
                reduceOnly = true;
                request[Symbol("type")] = "STOP_LOSS_MARKET";
            elseif functions.ccxtruthy(isTakeProfitOrder)
                stopPrice = self.priceToPrecision(symbol, takeProfitPrice);
                reduceOnly = true;
                request[Symbol("type")] = "TAKE_PROFIT_MARKET";
            else
                stopPrice = self.priceToPrecision(symbol, triggerPrice);
                sizeString = self.amountToPrecision(symbol, amount);
                request[Symbol("type")] = "STOP_MARKET";
            end
        else
            if functions.ccxtruthy(isStopLossOrder)
                stopPrice = self.priceToPrecision(symbol, stopLossPrice);
                reduceOnly = true;
                request[Symbol("type")] = "STOP_LOSS_LIMIT";
            elseif functions.ccxtruthy(isTakeProfitOrder)
                stopPrice = self.priceToPrecision(symbol, takeProfitPrice);
                reduceOnly = true;
                request[Symbol("type")] = "TAKE_PROFIT_LIMIT";
            else
                stopPrice = self.priceToPrecision(symbol, triggerPrice);
                sizeString = self.amountToPrecision(symbol, amount);
                request[Symbol("type")] = "STOP_LIMIT";
            end
        end
    else
        sizeString = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(stopPrice != nothing)
        request[Symbol("trigger_price")] = stopPrice;
    end
    request[Symbol("size")] = sizeString;
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("flags")] = ["REDUCE_ONLY"];
    end
    params = omit(params, ["reduceOnly", "reduce_only", "clOrdID", "clientOrderId", "client_order_id", "postOnly", "timeInForce", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    return extend(request, params)

end
function signOrderRequest(self::Paradex, request; modify=false)
    account = Base.fetch(self.retrieveAccount());
    now = self.nonce();
    orderType = safeString(request, "type");
    if functions.ccxtruthy(orderType == nothing)
        throw(ExchangeError(string(self.id, " signOrderRequest() missing orderType")));
    end
    isMarket = (findfirst("MARKET", orderType) !== nothing);
    orderReq = Dict{Symbol, Any}(
        Symbol("timestamp") => now * 1000,
        Symbol("market") => self.stringToBase16(get(request, Symbol("market"), nothing)),
        Symbol("side") => functions.ccxtruthy((get(request, Symbol("side"), nothing) == "BUY")) ? "1" : "2",
        Symbol("orderType") => self.stringToBase16(get(request, Symbol("type"), nothing)),
        Symbol("size") => self.scaleNumber(get(request, Symbol("size"), nothing)),
        Symbol("price") => functions.ccxtruthy((isMarket)) ? "0" : self.scaleNumber(get(request, Symbol("price"), nothing))
    );
    orderFields = [Dict{Symbol, Any}(
        Symbol("name") => "timestamp",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "market",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "side",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "orderType",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "size",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "price",
        Symbol("type") => "felt"
    )];
    messageTypes = Dict{Symbol, Any}();
    if functions.ccxtruthy(modify)
        orderReq[Symbol("id")] = get(request, Symbol("id"), nothing);
                push!(orderFields, Dict{Symbol, Any}(
    Symbol("name") => "id",
    Symbol("type") => "felt"
));
        messageTypes = Dict{Symbol, Any}(
            Symbol("ModifyOrder") => orderFields
        );
    else
        messageTypes = Dict{Symbol, Any}(
            Symbol("Order") => orderFields
        );
    end
    domain = Base.fetch(self.prepareParadexDomain());
    msg = self.starknetEncodeStructuredData(domain, messageTypes, orderReq, get(account, Symbol("address"), nothing));
    signature = self.starknetSign(msg, get(account, Symbol("privateKey"), nothing));
    request[Symbol("signature")] = signature;
    request[Symbol("signature_timestamp")] = get(orderReq, Symbol("timestamp"), nothing);
    return request

end
"""
create a trade order
see: https://docs.paradex.trade/api/prod/orders/new

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Paradex, symbol, type_var, side, amount; price=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    request = Base.fetch(self.signOrderRequest(request));
    response = Base.fetch(self.privatePostOrders(request));
    order = self.parseOrder(response, market = market);
    return order

end
"""
edit an open limit order or TPSL order
see: https://docs.paradex.trade/api/prod/orders/modify

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'limit' or a TPSL order type
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Paradex, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a price argument")));
    end
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    request = omit(request, ["instruction", "client_id", "flags"]);
    request[Symbol("order_id")] = id;
    request[Symbol("id")] = id;
    request = Base.fetch(self.signOrderRequest(request, modify = true));
    response = Base.fetch(self.privatePutOrdersOrderId(request));
    return self.parseOrder(response, market = market)

end
"""
create a list of trade orders
see: https://docs.paradex.trade/api/prod/orders/batch

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Paradex, orders; params=Dict())
    Base.fetch(self.authenticateRest());
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
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        extendedParams = extend(params, orderParams);
        orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = extendedParams);
        orderRequest = Base.fetch(self.signOrderRequest(orderRequest));
        push!(ordersRequests, orderRequest);
        i += 1
    end
    response = Base.fetch(self.privatePostOrdersBatch(ordersRequests));
    responseOrders = self.safeList(response, "orders", defaultValue = []);
    parsedOrders = self.parseOrders(responseOrders);
    errors = self.safeList(response, "errors", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(errors)))
        error = get(errors, i + 1, nothing);
        push!(parsedOrders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => error,
    Symbol("status") => "rejected"
)));
        i += 1
    end
    return parsedOrders

end
"""
cancels an open order
see: https://docs.paradex.trade/api/prod/orders/cancel
see: https://docs.paradex.trade/api/prod/orders/cancel-by-client-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Paradex, id; symbol=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
        response = Base.fetch(self.privateDeleteOrdersByClientIdClientId(extend(request, params)));
    else
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.privateDeleteOrdersOrderId(extend(request, params)));
    end
    return self.parseOrder(response)

end
"""
cancel multiple orders
see: https://docs.paradex.trade/api/prod/orders/cancel-batch

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, not used by cancelOrders()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Paradex, ids; symbol=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderIds = self.safeListN(params, ["clOrdIDs", "clientOrderIds", "client_order_ids"]);
    params = omit(params, ["clOrdIDs", "clientOrderIds", "client_order_ids"]);
    hasOrderIds = @functions.ccxt_and((ids != nothing), (functions.ccxt_isArray(ids)));
    hasClientOrderIds = @functions.ccxt_and((clientOrderIds != nothing), (functions.ccxt_isArray(clientOrderIds)));
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(hasOrderIds), !functions.ccxtruthy(hasClientOrderIds)))
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a non-empty ids argument or a non-empty clientOrderIds parameter")));
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(hasOrderIds)
        request[Symbol("order_ids")] = ids;
    end
    if functions.ccxtruthy(hasClientOrderIds)
        request[Symbol("client_order_ids")] = clientOrderIds;
    end
    response = Base.fetch(self.privateDeleteOrdersBatch(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        result = get(results, i + 1, nothing);
        marketId = safeString(result, "market");
        market = self.safeMarket(marketId = marketId);
        status = safeString(result, "status");
        orderStatus = nothing;
        if functions.ccxtruthy(status == "QUEUED_FOR_CANCELLATION")
            orderStatus = "canceled";
        elseif functions.ccxtruthy(status == "ALREADY_CLOSED")
            orderStatus = "closed";
        else
            if functions.ccxtruthy(status == "NOT_FOUND")
                orderStatus = "rejected";
            end

        end
        push!(orders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => result,
    Symbol("id") => safeString(result, "id"),
    Symbol("clientOrderId") => safeString(result, "client_id"),
    Symbol("status") => orderStatus,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing)
), market = market));
        i += 1
    end
    return orders

end
"""
cancel all open orders in a market
see: https://docs.paradex.trade/api/prod/orders/cancel-all

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Paradex; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateDeleteOrders(extend(request, params)));
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
fetches information on an order made by the user
see: https://docs.paradex.trade/api/prod/orders/get
see: https://docs.paradex.trade/api/prod/orders/get-by-client-id

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Paradex, id; symbol=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    params = omit(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
        response = Base.fetch(self.privateGetOrdersByClientIdClientId(extend(request, params)));
    else
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.privateGetOrdersOrderId(extend(request, params)));
    end
    return self.parseOrder(response)

end
"""
fetches information on multiple orders made by the user
see: https://docs.paradex.trade/api/prod/orders/get-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'buy' or 'sell'
- `params.paginate`::bool, optional: set to true if you want to fetch orders with pagination
- `params.until`::int: timestamp in ms of the latest order to fetch

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetOrdersHistory(extend(request, params)));
    orders = self.safeList(response, "results", defaultValue = []);
    paginationCursor = safeString(response, "next");
    ordersLength = length(orders);
    if functions.ccxtruthy(@functions.ccxt_and((paginationCursor != nothing), (functions.ccxt_gt(ordersLength, 0))))
        first_var = get(orders, 1, nothing);
        first_var[Symbol("next")] = paginationCursor;
        orders[1] = first_var;
    end
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://docs.paradex.trade/api/prod/orders/get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    orders = self.safeList(response, "results", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.paradex.trade/api/prod/account/get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Paradex; params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetBalance());
    data = self.safeList(response, "results", defaultValue = []);
    return self.parseBalance(data)

end
function parseBalance(self::Paradex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = self.safeDict(response, i, defaultValue = Dict{Symbol, Any}());
        currencyId = safeString(balance, "token");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "size");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch all trades made by the user
see: https://docs.paradex.trade/api/prod/account/list-fills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetFills(extend(request, params)));
    trades = self.safeList(response, "results", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        trades[i + 1][Symbol("next")] = safeString(response, "next");
        i += 1
    end
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch data on an open position
see: https://docs.paradex.trade/api/prod/account/get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Paradex, symbol; params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    positions = Base.fetch(self.fetchPositions(symbols = [get(market, Symbol("symbol"), nothing)], params = params));
    return self.safeDict(positions, 0, defaultValue = Dict{Symbol, Any}())

end
"""
fetch all open positions
see: https://docs.paradex.trade/api/prod/account/get-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Paradex; symbols=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.privateGetPositions());
    data = self.safeList(response, "results", defaultValue = []);
    return self.parsePositions(data, symbols = symbols)

end
function parsePosition(self::Paradex, position; market=nothing)
    marketId = safeString(position, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(position, "side");
    quantity = safeString(position, "size");
    if functions.ccxtruthy(side != "long")
        quantity = stringMul("-1", quantity);
    end
    timestamp = safeInteger(position, "time");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => symbol,
    Symbol("entryPrice") => safeString(position, "average_entry_price"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("collateral") => safeString(position, "cost"),
    Symbol("unrealizedPnl") => safeString(position, "unrealized_pnl"),
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
"""
retrieves the users liquidated positions
see: https://docs.paradex.trade/api/prod/liquidations/get-liquidations

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: timestamp in ms of the latest liquidation

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    else
        request[Symbol("from")] = 1;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (request, params) = self.handleUntilOption("to", request, params);
    response = Base.fetch(self.privateGetLiquidations(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    return self.parseLiquidations(data, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Paradex, liquidation; market=nothing)
    timestamp = safeInteger(liquidation, "created_at");
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("price") => nothing,
    Symbol("side") => nothing,
    Symbol("baseValue") => nothing,
    Symbol("quoteValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
fetch all deposits made to an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Paradex; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchDeposits", symbol = code, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetTransfers(extend(request, params)));
    rows = self.safeList(response, "results", defaultValue = []);
    deposits = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        row = get(rows, i + 1, nothing);
        if functions.ccxtruthy(get(row, Symbol("kind"), nothing) == "DEPOSIT")
                        push!(deposits, row);
        end
        i += 1
    end
    return self.parseTransactions(deposits, currency = nothing, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Paradex; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetTransfers(extend(request, params)));
    rows = self.safeList(response, "results", defaultValue = []);
    deposits = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        row = get(rows, i + 1, nothing);
        if functions.ccxtruthy(get(row, Symbol("kind"), nothing) == "WITHDRAWAL")
                        push!(deposits, row);
        end
        i += 1
    end
    return self.parseTransactions(deposits, currency = nothing, since = since, limit = limit)

end
"""
fetch a history of transfers made on an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Paradex; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTransfers", symbol = code, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetTransfers(extend(request, params)));
    rows = self.safeList(response, "results", defaultValue = []);
    return self.parseTransfers(rows, currency = currency, since = since, limit = limit)

end
function parseTransfer(self::Paradex, transfer; currency=nothing)
    currencyId = safeString(transfer, "token");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transfer, "created_at");
    kind = safeString(transfer, "kind");
    fromAccount = nothing;
    toAccount = nothing;
    if functions.ccxtruthy(kind == "DEPOSIT")
        fromAccount = "external";
        toAccount = "account";
    elseif functions.ccxtruthy(kind == "WITHDRAWAL")
        fromAccount = "account";
        toAccount = "external";
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransactionStatus(safeString(transfer, "status"))
)

end
function parseTransaction(self::Paradex, transaction; currency=nothing)
    id = safeString(transaction, "id");
    address = safeString(transaction, "account");
    txid = safeString(transaction, "txn_hash");
    currencyId = safeString(transaction, "token");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transaction, "created_at");
    updated = safeInteger(transaction, "last_updated_at");
    type_var = safeString(transaction, "kind");
    type_var = functions.ccxtruthy((type_var == "DEPOSIT")) ? "deposit" : "withdrawal";
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    amount = self.safeNumber(transaction, "amount");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing
)

end
function parseTransactionStatus(self::Paradex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "pending",
        Symbol("AVAILABLE") => "pending",
        Symbol("COMPLETED") => "ok",
        Symbol("FAILED") => "failed"
    );
    return safeString(statuses, status, status)

end
"""
fetches the margin mode of a specific symbol
see: https://docs.paradex.trade/api/prod/account/get-account-margin

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Paradex, symbol; params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAccountMargin(extend(request, params)));
    configs = self.safeList(response, "configs");
    return self.parseMarginMode(self.safeDict(configs, 0), market = market)

end
function parseMarginMode(self::Paradex, rawMarginMode; market=nothing)
    marketId = safeString(rawMarginMode, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    marginMode = safeStringLower(rawMarginMode, "margin_type");
    return Dict{Symbol, Any}(
    Symbol("info") => rawMarginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => marginMode
)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.paradex.trade/api/prod/account/upsert-account-margin

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::float, optional: the rate of leverage

# Returns
- response from the exchange
"""
function setMarginMode(self::Paradex, marginMode; symbol=nothing, params=Dict())
    self.checkRequiredArgument("setMarginMode", symbol, "symbol");
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    leverage = 1;
    (leverage, params) = self.handleOptionAndParams(params, "setMarginMode", "leverage", defaultValue = leverage);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage,
        Symbol("margin_type") => self.encodeMarginMode(marginMode)
    );
    return Base.fetch(self.privatePostAccountMarginMarket(extend(request, params)))

end
"""
fetch the set leverage for a market
see: https://docs.paradex.trade/api/prod/account/get-account-margin

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Paradex, symbol; params=Dict())
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAccountMargin(extend(request, params)));
    configs = self.safeList(response, "configs");
    return self.parseLeverage(self.safeDict(configs, 0), market = market)

end
function parseLeverage(self::Paradex, leverage; market=nothing)
    marketId = safeString(leverage, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    marginMode = safeStringLower(leverage, "margin_type");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => safeInteger(leverage, "leverage"),
    Symbol("shortLeverage") => safeInteger(leverage, "leverage")
)

end
function encodeMarginMode(self::Paradex, mode)
    modes = Dict{Symbol, Any}(
        Symbol("cross") => "CROSS",
        Symbol("isolated") => "ISOLATED"
    );
    return safeString(modes, mode, mode)

end
"""
set the level of leverage for a market
see: https://docs.paradex.trade/api/prod/account/upsert-account-margin

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string, optional: unified market symbol (is mandatory for swap markets)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- response from the exchange
"""
function setLeverage(self::Paradex, leverage; symbol=nothing, params=Dict())
    self.checkRequiredArgument("setLeverage", symbol, "symbol");
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params, defaultValue = "cross");
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage,
        Symbol("margin_type") => self.encodeMarginMode(marginMode)
    );
    return Base.fetch(self.privatePostAccountMarginMarket(extend(request, params)))

end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchGreeks(self::Paradex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketsSummary(extend(request, params)));
    data = self.safeList(response, "results", defaultValue = []);
    greeks = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseGreeks(greeks, market = market)

end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchAllGreeks(self::Paradex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    request = Dict{Symbol, Any}(
        Symbol("market") => "ALL"
    );
    response = Base.fetch(self.publicGetMarketsSummary(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    return self.parseAllGreeks(results, symbols = symbols)

end
function parseGreeks(self::Paradex, greeks; market=nothing)
    marketId = safeString(greeks, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "option");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(greeks, "created_at");
    greeksData = self.safeDict(greeks, "greeks", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("delta") => self.safeNumber(greeksData, "delta"),
    Symbol("gamma") => self.safeNumber(greeksData, "gamma"),
    Symbol("theta") => nothing,
    Symbol("vega") => self.safeNumber(greeksData, "vega"),
    Symbol("rho") => self.safeNumber(greeksData, "rho"),
    Symbol("vanna") => self.safeNumber(greeksData, "vanna"),
    Symbol("volga") => self.safeNumber(greeksData, "volga"),
    Symbol("bidSize") => nothing,
    Symbol("askSize") => nothing,
    Symbol("bidImpliedVolatility") => self.safeNumber(greeks, "bid_iv"),
    Symbol("askImpliedVolatility") => self.safeNumber(greeks, "ask_iv"),
    Symbol("markImpliedVolatility") => self.safeNumber(greeks, "mark_iv"),
    Symbol("bidPrice") => self.safeNumber(greeks, "bid"),
    Symbol("askPrice") => self.safeNumber(greeks, "ask"),
    Symbol("markPrice") => self.safeNumber(greeks, "mark_price"),
    Symbol("lastPrice") => self.safeNumber(greeks, "last_traded_price"),
    Symbol("underlyingPrice") => self.safeNumber(greeks, "underlying_price"),
    Symbol("info") => greeks
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.paradex.trade/api/prod/account/get-funding

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cursor`::string, optional: returns the next paginated page
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    Base.fetch(self.authenticateRest());
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "next", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = min(limit, 5000);
    else
        request[Symbol("page_size")] = 100;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    (request, params) = self.handleUntilOption("end_at", request, params);
    response = Base.fetch(self.privateGetFundingPayments(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    return self.parseIncomes(results, market = market, since = since, limit = limit)

end
function parseIncome(self::Paradex, income; market=nothing)
    marketId = safeString(income, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(income, "created_at");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("code") => get(market, Symbol("settle"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "id"),
    Symbol("amount") => self.safeNumber(income, "payment")
)

end
"""
fetches historical funding rate prices
see: https://docs.paradex.trade/api/prod/markets/get-funding-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate structures
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Paradex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = min(limit, 5000);
    else
        request[Symbol("page_size")] = 1000;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_at")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("end_at")] = until;
    end
    response = Base.fetch(self.publicGetFundingData(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        rate = get(results, i + 1, nothing);
        timestamp = safeInteger(rate, "created_at");
        datetime = self.iso8601(timestamp);
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => rate,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(rate, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
function sign(self::Paradex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    version = self.version;
    if functions.ccxtruthy(findfirst("v2/", path) !== nothing)
        version = "v2";
        path = replace(path, "v2/" => "");
    end
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(version), nothing)), "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        headers = Dict{Symbol, Any}(
            Symbol("Accept") => "application/json",
            Symbol("PARADEX-PARTNER") => safeString(self.options, "broker", "CCXT")
        );
        if functions.ccxtruthy(path == "auth")
            headers[Symbol("PARADEX-STARKNET-ACCOUNT")] = get(query, Symbol("account"), nothing);
            headers[Symbol("PARADEX-STARKNET-SIGNATURE")] = get(query, Symbol("signature"), nothing);
            headers[Symbol("PARADEX-TIMESTAMP")] =             string(get(query, Symbol("timestamp"), nothing));
            headers[Symbol("PARADEX-SIGNATURE-EXPIRATION")] =             string(get(query, Symbol("expiration"), nothing));
        elseif functions.ccxtruthy(path == "onboarding")
            headers[Symbol("PARADEX-ETHEREUM-ACCOUNT")] = self.walletAddress;
            headers[Symbol("PARADEX-STARKNET-ACCOUNT")] = get(query, Symbol("account"), nothing);
            headers[Symbol("PARADEX-STARKNET-SIGNATURE")] = get(query, Symbol("signature"), nothing);
            headers[Symbol("PARADEX-TIMESTAMP")] =             string(self.nonce());
            headers[Symbol("Content-Type")] = "application/json";
            body = json(Dict{Symbol, Any}(
    Symbol("public_key") => get(query, Symbol("public_key"), nothing)
));
        else
            token = get(self.options, Symbol("authToken"), nothing);
            headers[Symbol("Authorization")] = string("Bearer ", token);
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((method == "POST"), (method == "PUT")), (@functions.ccxt_and((method == "DELETE"), (path == "orders/batch")))))
                headers[Symbol("Content-Type")] = "application/json";
                body = json(query);
            else
                url = string(url, "?", self.urlencode(query));
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
function handleErrors(self::Paradex, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    errorCode = safeString(response, "error");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Paradex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetBboMarket(self::Paradex, params=Dict(), context=Dict())
    return request(self, "bbo/{market}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetBboMarketInteractive(self::Paradex, params=Dict(), context=Dict())
    return request(self, "bbo/{market}/interactive"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFundingData(self::Paradex, params=Dict(), context=Dict())
    return request(self, "funding/data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarkets(self::Paradex, params=Dict(), context=Dict())
    return request(self, "markets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "markets/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsKlines(self::Paradex, params=Dict(), context=Dict())
    return request(self, "markets/klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSettlementPrice(self::Paradex, params=Dict(), context=Dict())
    return request(self, "markets/settlement-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketsSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "markets/summary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookMarket(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orderbook/{market}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookMarketImpactPrice(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orderbook/{market}/impact-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbookMarketInteractive(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orderbook/{market}/interactive"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetInsurance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "insurance"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetJwksJson(self::Paradex, params=Dict(), context=Dict())
    return request(self, "jwks.json"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOnboarding(self::Paradex, params=Dict(), context=Dict())
    return request(self, "onboarding"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetReferralsConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "referrals/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStakingConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "staking/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemAnnouncements(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/announcements"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemPortfolioMarginConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/portfolio-margin-config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemState(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/state"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemTime(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSystemVolumeTiers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "system/volume-tiers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Paradex, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaults(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsBalance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/balance"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsPositions(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/positions"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/summary"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetVaultsTransfers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/transfers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetXpFeeConfig(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/fee-config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetXpPublicTransfers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/public-transfers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetXpTransferTransferId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/transfer/{transfer_id}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccount(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountCompliance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/compliance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountInfo(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountMargin(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/margin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountProfile(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountSettings(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/settings"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountSubaccounts(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/subaccounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/summary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBalance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFills(self::Paradex, params=Dict(), context=Dict())
    return request(self, "fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFundingPayments(self::Paradex, params=Dict(), context=Dict())
    return request(self, "funding/payments"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPositions(self::Paradex, params=Dict(), context=Dict())
    return request(self, "positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradebusts(self::Paradex, params=Dict(), context=Dict())
    return request(self, "tradebusts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransactions(self::Paradex, params=Dict(), context=Dict())
    return request(self, "transactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountKeysSubkeys(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountKeysSubkeysPublicKey(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys/{public_key}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountTokens(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/tokens"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAlgoOrders(self::Paradex, params=Dict(), context=Dict())
    return request(self, "algo/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAlgoOrdersHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "algo/orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAlgoOrdersAlgoId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "algo/orders/{algo_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBlockTrades(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBlockTradesBlockTradeId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBlockTradesBlockTradeIdOffers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/offers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBlockTradesBlockTradeIdOffersOfferId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/offers/{offer_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLiquidations(self::Paradex, params=Dict(), context=Dict())
    return request(self, "liquidations"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersByClientIdClientId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/by_client_id/{client_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOrderId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/{order_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetReferralsQrCode(self::Paradex, params=Dict(), context=Dict())
    return request(self, "referrals/qr-code"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetReferralsSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "referrals/summary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStakingHistory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "staking/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStakingSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "staking/summary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransfers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetVaultsAccountSummary(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/account-summary"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetVaultsMine(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults/mine"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetXpAccountBalance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/account-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetXpTransfers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/transfers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountCompliance(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/compliance"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountMarginMarket(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/margin/{market}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileMarketMaxSlippageMarket(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/market_max_slippage/{market}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileNotifications(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/notifications"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileNotificationsLastSeen(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/notifications/last_seen"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileReferralCode(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/referral_code"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileRefreshInventory(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/refresh_inventory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileSizeCurrencyDisplay(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/size_currency_display"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountProfileUsername(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile/username"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountReferrer(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/referrer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountSettingsTradingValueDisplay(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/settings/trading_value_display"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountKeysSubkeysActivate(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys/activate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountKeysSubkeys(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountTokens(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/tokens"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAlgoOrders(self::Paradex, params=Dict(), context=Dict())
    return request(self, "algo/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAuth(self::Paradex, params=Dict(), context=Dict())
    return request(self, "auth"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlockTrades(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlockTradesBlockTradeIdExecute(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlockTradesBlockTradeIdOffers(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/offers"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlockTradesBlockTradeIdOffersOfferIdExecute(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/offers/{offer_id}/execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOnboarding(self::Paradex, params=Dict(), context=Dict())
    return request(self, "onboarding"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersBatch(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2Auth(self::Paradex, params=Dict(), context=Dict())
    return request(self, "v2/auth"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2Onboarding(self::Paradex, params=Dict(), context=Dict())
    return request(self, "v2/onboarding"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVaults(self::Paradex, params=Dict(), context=Dict())
    return request(self, "vaults"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostXpTransfer(self::Paradex, params=Dict(), context=Dict())
    return request(self, "xp/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutAccountProfile(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/profile"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutAccountKeysSubkeysPublicKey(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys/{public_key}"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutOrdersOrderId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/{order_id}"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteAccountKeysSubkeysPublicKey(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/keys/subkeys/{public_key}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteAccountTokensLookupId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "account/tokens/{lookup_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteAlgoOrdersAlgoId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "algo/orders/{algo_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteBlockTradesBlockTradeId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteBlockTradesBlockTradeIdOffersOfferId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "block-trades/{block_trade_id}/offers/{offer_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersBatch(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/batch"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersByClientIdClientId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/by_client_id/{client_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersOrderId(self::Paradex, params=Dict(), context=Dict())
    return request(self, "orders/{order_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Paradex(; kwargs...)
    inst = Paradex(Exchange(), describe, fetchTime, fetchStatus, fetchMarkets, parseMarket, parseTradingFee, fetchTradingFee, fetchTradingFees, fetchOHLCV, parseOHLCV, fetchTickers, fetchTicker, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchOpenInterest, parseOpenInterest, hashMessage, signHash, signMessage, getSystemConfig, prepareParadexDomain, retrieveAccount, onboarding, authenticateRest, parseOrder, parseTimeInForce, parseOrderStatus, parseOrderType, scaleNumber, createOrderRequest, signOrderRequest, createOrder, editOrder, createOrders, cancelOrder, cancelOrders, cancelAllOrders, fetchOrder, fetchOrders, fetchOpenOrders, fetchBalance, parseBalance, fetchMyTrades, fetchPosition, fetchPositions, parsePosition, fetchMyLiquidations, parseLiquidation, fetchDeposits, fetchWithdrawals, fetchTransfers, parseTransfer, parseTransaction, parseTransactionStatus, fetchMarginMode, parseMarginMode, setMarginMode, fetchLeverage, parseLeverage, encodeMarginMode, setLeverage, fetchGreeks, fetchAllGreeks, parseGreeks, fetchFundingHistory, parseIncome, fetchFundingRateHistory, sign, handleErrors, publicGetBboMarket, publicGetBboMarketInteractive, publicGetFundingData, publicGetMarkets, publicGetMarketsHistory, publicGetMarketsKlines, publicGetMarketsSettlementPrice, publicGetMarketsSummary, publicGetOrderbookMarket, publicGetOrderbookMarketImpactPrice, publicGetOrderbookMarketInteractive, publicGetInsurance, publicGetJwksJson, publicGetOnboarding, publicGetReferralsConfig, publicGetStakingConfig, publicGetSystemAnnouncements, publicGetSystemConfig, publicGetSystemPortfolioMarginConfig, publicGetSystemState, publicGetSystemTime, publicGetSystemVolumeTiers, publicGetTrades, publicGetVaults, publicGetVaultsBalance, publicGetVaultsConfig, publicGetVaultsHistory, publicGetVaultsPositions, publicGetVaultsSummary, publicGetVaultsTransfers, publicGetXpFeeConfig, publicGetXpPublicTransfers, publicGetXpTransferTransferId, privateGetAccount, privateGetAccountCompliance, privateGetAccountHistory, privateGetAccountInfo, privateGetAccountMargin, privateGetAccountProfile, privateGetAccountSettings, privateGetAccountSubaccounts, privateGetAccountSummary, privateGetBalance, privateGetFills, privateGetFundingPayments, privateGetPositions, privateGetTradebusts, privateGetTransactions, privateGetAccountKeysSubkeys, privateGetAccountKeysSubkeysPublicKey, privateGetAccountTokens, privateGetAlgoOrders, privateGetAlgoOrdersHistory, privateGetAlgoOrdersAlgoId, privateGetBlockTrades, privateGetBlockTradesBlockTradeId, privateGetBlockTradesBlockTradeIdOffers, privateGetBlockTradesBlockTradeIdOffersOfferId, privateGetLiquidations, privateGetOrders, privateGetOrdersHistory, privateGetOrdersByClientIdClientId, privateGetOrdersOrderId, privateGetReferralsQrCode, privateGetReferralsSummary, privateGetStakingHistory, privateGetStakingSummary, privateGetTransfers, privateGetVaultsAccountSummary, privateGetVaultsMine, privateGetXpAccountBalance, privateGetXpTransfers, privatePostAccountCompliance, privatePostAccountMarginMarket, privatePostAccountProfileMarketMaxSlippageMarket, privatePostAccountProfileNotifications, privatePostAccountProfileNotificationsLastSeen, privatePostAccountProfileReferralCode, privatePostAccountProfileRefreshInventory, privatePostAccountProfileSizeCurrencyDisplay, privatePostAccountProfileUsername, privatePostAccountReferrer, privatePostAccountSettingsTradingValueDisplay, privatePostAccountKeysSubkeysActivate, privatePostAccountKeysSubkeys, privatePostAccountTokens, privatePostAlgoOrders, privatePostAuth, privatePostBlockTrades, privatePostBlockTradesBlockTradeIdExecute, privatePostBlockTradesBlockTradeIdOffers, privatePostBlockTradesBlockTradeIdOffersOfferIdExecute, privatePostOnboarding, privatePostOrders, privatePostOrdersBatch, privatePostV2Auth, privatePostV2Onboarding, privatePostVaults, privatePostXpTransfer, privatePutAccountProfile, privatePutAccountKeysSubkeysPublicKey, privatePutOrdersOrderId, privateDeleteAccountKeysSubkeysPublicKey, privateDeleteAccountTokensLookupId, privateDeleteAlgoOrdersAlgoId, privateDeleteBlockTradesBlockTradeId, privateDeleteBlockTradesBlockTradeIdOffersOfferId, privateDeleteOrders, privateDeleteOrdersBatch, privateDeleteOrdersByClientIdClientId, privateDeleteOrdersOrderId)
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
function __ccxt_doc_Paradex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.paradex.trade/api/prod/system/get-time-unix-milliseconds

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Paradex_fetchTime

function __ccxt_doc_Paradex_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://docs.paradex.trade/api/prod/system/get-state

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Paradex_fetchStatus

function __ccxt_doc_Paradex_fetchMarkets() end
"""
retrieves data on all markets for paradex
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Paradex_fetchMarkets

function __ccxt_doc_Paradex_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Paradex_fetchTradingFee

function __ccxt_doc_Paradex_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.paradex.trade/api/prod/markets/get-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Paradex_fetchTradingFees

function __ccxt_doc_Paradex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.paradex.trade/api/prod/markets/klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "last", "mark", "index", default is "last"

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Paradex_fetchOHLCV

function __ccxt_doc_Paradex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Paradex_fetchTickers

function __ccxt_doc_Paradex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Paradex_fetchTicker

function __ccxt_doc_Paradex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.paradex.trade/api/prod/markets/get-orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Paradex_fetchOrderBook

function __ccxt_doc_Paradex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.paradex.trade/api/prod/trades/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Paradex_fetchTrades

function __ccxt_doc_Paradex_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Paradex_fetchOpenInterest

function __ccxt_doc_Paradex_createOrder() end
"""
create a trade order
see: https://docs.paradex.trade/api/prod/orders/new

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_createOrder

function __ccxt_doc_Paradex_editOrder() end
"""
edit an open limit order or TPSL order
see: https://docs.paradex.trade/api/prod/orders/modify

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'limit' or a TPSL order type
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_editOrder

function __ccxt_doc_Paradex_createOrders() end
"""
create a list of trade orders
see: https://docs.paradex.trade/api/prod/orders/batch

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_createOrders

function __ccxt_doc_Paradex_cancelOrder() end
"""
cancels an open order
see: https://docs.paradex.trade/api/prod/orders/cancel
see: https://docs.paradex.trade/api/prod/orders/cancel-by-client-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_cancelOrder

function __ccxt_doc_Paradex_cancelOrders() end
"""
cancel multiple orders
see: https://docs.paradex.trade/api/prod/orders/cancel-batch

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, not used by cancelOrders()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_cancelOrders

function __ccxt_doc_Paradex_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://docs.paradex.trade/api/prod/orders/cancel-all

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_cancelAllOrders

function __ccxt_doc_Paradex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.paradex.trade/api/prod/orders/get
see: https://docs.paradex.trade/api/prod/orders/get-by-client-id

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_fetchOrder

function __ccxt_doc_Paradex_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.paradex.trade/api/prod/orders/get-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'buy' or 'sell'
- `params.paginate`::bool, optional: set to true if you want to fetch orders with pagination
- `params.until`::int: timestamp in ms of the latest order to fetch

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_fetchOrders

function __ccxt_doc_Paradex_fetchOpenOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.paradex.trade/api/prod/orders/get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Paradex_fetchOpenOrders

function __ccxt_doc_Paradex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.paradex.trade/api/prod/account/get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Paradex_fetchBalance

function __ccxt_doc_Paradex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.paradex.trade/api/prod/account/list-fills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Paradex_fetchMyTrades

function __ccxt_doc_Paradex_fetchPosition() end
"""
fetch data on an open position
see: https://docs.paradex.trade/api/prod/account/get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Paradex_fetchPosition

function __ccxt_doc_Paradex_fetchPositions() end
"""
fetch all open positions
see: https://docs.paradex.trade/api/prod/account/get-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Paradex_fetchPositions

function __ccxt_doc_Paradex_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://docs.paradex.trade/api/prod/liquidations/get-liquidations

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: timestamp in ms of the latest liquidation

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Paradex_fetchMyLiquidations

function __ccxt_doc_Paradex_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Paradex_fetchDeposits

function __ccxt_doc_Paradex_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Paradex_fetchWithdrawals

function __ccxt_doc_Paradex_fetchTransfers() end
"""
fetch a history of transfers made on an account
see: https://docs.paradex.trade/api/prod/transfers/get

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Paradex_fetchTransfers

function __ccxt_doc_Paradex_fetchMarginMode() end
"""
fetches the margin mode of a specific symbol
see: https://docs.paradex.trade/api/prod/account/get-account-margin

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Paradex_fetchMarginMode

function __ccxt_doc_Paradex_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.paradex.trade/api/prod/account/upsert-account-margin

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::float, optional: the rate of leverage

# Returns
- response from the exchange
"""
__ccxt_doc_Paradex_setMarginMode

function __ccxt_doc_Paradex_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://docs.paradex.trade/api/prod/account/get-account-margin

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Paradex_fetchLeverage

function __ccxt_doc_Paradex_setLeverage() end
"""
set the level of leverage for a market
see: https://docs.paradex.trade/api/prod/account/upsert-account-margin

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string, optional: unified market symbol (is mandatory for swap markets)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- response from the exchange
"""
__ccxt_doc_Paradex_setLeverage

function __ccxt_doc_Paradex_fetchGreeks() end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Paradex_fetchGreeks

function __ccxt_doc_Paradex_fetchAllGreeks() end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://docs.paradex.trade/api/prod/markets/get-markets-summary

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Paradex_fetchAllGreeks

function __ccxt_doc_Paradex_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.paradex.trade/api/prod/account/get-funding

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cursor`::string, optional: returns the next paginated page
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Paradex_fetchFundingHistory

function __ccxt_doc_Paradex_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://docs.paradex.trade/api/prod/markets/get-funding-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate structures
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Paradex_fetchFundingRateHistory
