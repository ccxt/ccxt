@kwdef mutable struct Woo <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    parseTokenAndFeeTemp::Function = parseTokenAndFeeTemp
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createTrailingAmountOrder::Function = createTrailingAmountOrder
    createTrailingPercentOrder::Function = createTrailingPercentOrder
    createOrder::Function = createOrder
    encodeMarginMode::Function = encodeMarginMode
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDepositAddress::Function = fetchDepositAddress
    getDedicatedNetworkId::Function = getDedicatedNetworkId
    parseDepositAddress::Function = parseDepositAddress
    getAssetHistoryRows::Function = getAssetHistoryRows
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    getCurrencyFromChaincode::Function = getCurrencyFromChaincode
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    withdraw::Function = withdraw
    repayMargin::Function = repayMargin
    parseMarginLoan::Function = parseMarginLoan
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    parseIncome::Function = parseIncome
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingRate::Function = parseFundingRate
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    setPositionMode::Function = setPositionMode
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTrade::Function = fetchConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchConvertCurrencies::Function = fetchConvertCurrencies
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    defaultNetworkCodeForCurrency::Function = defaultNetworkCodeForCurrency
    setSandboxMode::Function = setSandboxMode

# Generated REST endpoint fields
    v1PubGetHistKline::Function = v1PubGetHistKline
    v1PubGetHistTrades::Function = v1PubGetHistTrades
    v1PublicGetInfo::Function = v1PublicGetInfo
    v1PublicGetInfoSymbol::Function = v1PublicGetInfoSymbol
    v1PublicGetSystemInfo::Function = v1PublicGetSystemInfo
    v1PublicGetMarketTrades::Function = v1PublicGetMarketTrades
    v1PublicGetToken::Function = v1PublicGetToken
    v1PublicGetTokenNetwork::Function = v1PublicGetTokenNetwork
    v1PublicGetFundingRates::Function = v1PublicGetFundingRates
    v1PublicGetFundingRateSymbol::Function = v1PublicGetFundingRateSymbol
    v1PublicGetFundingRateHistory::Function = v1PublicGetFundingRateHistory
    v1PublicGetFutures::Function = v1PublicGetFutures
    v1PublicGetFuturesSymbol::Function = v1PublicGetFuturesSymbol
    v1PublicGetOrderbookSymbol::Function = v1PublicGetOrderbookSymbol
    v1PublicGetKline::Function = v1PublicGetKline
    v1PrivateGetClientToken::Function = v1PrivateGetClientToken
    v1PrivateGetOrderOid::Function = v1PrivateGetOrderOid
    v1PrivateGetClientOrderClientOrderId::Function = v1PrivateGetClientOrderClientOrderId
    v1PrivateGetOrders::Function = v1PrivateGetOrders
    v1PrivateGetClientTradeTid::Function = v1PrivateGetClientTradeTid
    v1PrivateGetOrderOidTrades::Function = v1PrivateGetOrderOidTrades
    v1PrivateGetClientTrades::Function = v1PrivateGetClientTrades
    v1PrivateGetClientHistTrades::Function = v1PrivateGetClientHistTrades
    v1PrivateGetStakingYieldHistory::Function = v1PrivateGetStakingYieldHistory
    v1PrivateGetClientHolding::Function = v1PrivateGetClientHolding
    v1PrivateGetAssetDeposit::Function = v1PrivateGetAssetDeposit
    v1PrivateGetAssetHistory::Function = v1PrivateGetAssetHistory
    v1PrivateGetSubAccountAll::Function = v1PrivateGetSubAccountAll
    v1PrivateGetSubAccountAssets::Function = v1PrivateGetSubAccountAssets
    v1PrivateGetSubAccountAssetDetail::Function = v1PrivateGetSubAccountAssetDetail
    v1PrivateGetSubAccountIpRestriction::Function = v1PrivateGetSubAccountIpRestriction
    v1PrivateGetAssetMainSubTransferHistory::Function = v1PrivateGetAssetMainSubTransferHistory
    v1PrivateGetTokenInterest::Function = v1PrivateGetTokenInterest
    v1PrivateGetTokenInterestToken::Function = v1PrivateGetTokenInterestToken
    v1PrivateGetInterestHistory::Function = v1PrivateGetInterestHistory
    v1PrivateGetInterestRepay::Function = v1PrivateGetInterestRepay
    v1PrivateGetFundingFeeHistory::Function = v1PrivateGetFundingFeeHistory
    v1PrivateGetPositions::Function = v1PrivateGetPositions
    v1PrivateGetPositionSymbol::Function = v1PrivateGetPositionSymbol
    v1PrivateGetClientTransactionHistory::Function = v1PrivateGetClientTransactionHistory
    v1PrivateGetClientFuturesLeverage::Function = v1PrivateGetClientFuturesLeverage
    v1PrivatePostOrder::Function = v1PrivatePostOrder
    v1PrivatePostOrderCancelAllAfter::Function = v1PrivatePostOrderCancelAllAfter
    v1PrivatePostAssetLtv::Function = v1PrivatePostAssetLtv
    v1PrivatePostAssetInternalWithdraw::Function = v1PrivatePostAssetInternalWithdraw
    v1PrivatePostInterestRepay::Function = v1PrivatePostInterestRepay
    v1PrivatePostClientAccountMode::Function = v1PrivatePostClientAccountMode
    v1PrivatePostClientPositionMode::Function = v1PrivatePostClientPositionMode
    v1PrivatePostClientLeverage::Function = v1PrivatePostClientLeverage
    v1PrivatePostClientFuturesLeverage::Function = v1PrivatePostClientFuturesLeverage
    v1PrivatePostClientIsolatedMargin::Function = v1PrivatePostClientIsolatedMargin
    v1PrivateDeleteOrder::Function = v1PrivateDeleteOrder
    v1PrivateDeleteClientOrder::Function = v1PrivateDeleteClientOrder
    v1PrivateDeleteOrders::Function = v1PrivateDeleteOrders
    v1PrivateDeleteAssetWithdraw::Function = v1PrivateDeleteAssetWithdraw
    v2PrivateGetClientHolding::Function = v2PrivateGetClientHolding
    v3PublicGetSystemInfo::Function = v3PublicGetSystemInfo
    v3PublicGetInstruments::Function = v3PublicGetInstruments
    v3PublicGetToken::Function = v3PublicGetToken
    v3PublicGetTokenNetwork::Function = v3PublicGetTokenNetwork
    v3PublicGetTokenInfo::Function = v3PublicGetTokenInfo
    v3PublicGetMarketTrades::Function = v3PublicGetMarketTrades
    v3PublicGetMarketTradesHistory::Function = v3PublicGetMarketTradesHistory
    v3PublicGetOrderbook::Function = v3PublicGetOrderbook
    v3PublicGetKline::Function = v3PublicGetKline
    v3PublicGetKlineHistory::Function = v3PublicGetKlineHistory
    v3PublicGetFutures::Function = v3PublicGetFutures
    v3PublicGetFundingRate::Function = v3PublicGetFundingRate
    v3PublicGetFundingRateHistory::Function = v3PublicGetFundingRateHistory
    v3PublicGetInsuranceFund::Function = v3PublicGetInsuranceFund
    v3PrivateGetTradeOrder::Function = v3PrivateGetTradeOrder
    v3PrivateGetTradeOrders::Function = v3PrivateGetTradeOrders
    v3PrivateGetTradeAlgoOrder::Function = v3PrivateGetTradeAlgoOrder
    v3PrivateGetTradeAlgoOrders::Function = v3PrivateGetTradeAlgoOrders
    v3PrivateGetTradeTransaction::Function = v3PrivateGetTradeTransaction
    v3PrivateGetTradeTransactionHistory::Function = v3PrivateGetTradeTransactionHistory
    v3PrivateGetTradeTradingFee::Function = v3PrivateGetTradeTradingFee
    v3PrivateGetAccountInfo::Function = v3PrivateGetAccountInfo
    v3PrivateGetAccountTokenConfig::Function = v3PrivateGetAccountTokenConfig
    v3PrivateGetAccountSymbolConfig::Function = v3PrivateGetAccountSymbolConfig
    v3PrivateGetAccountSubAccountsAll::Function = v3PrivateGetAccountSubAccountsAll
    v3PrivateGetAccountReferralSummary::Function = v3PrivateGetAccountReferralSummary
    v3PrivateGetAccountReferralRewardHistory::Function = v3PrivateGetAccountReferralRewardHistory
    v3PrivateGetAccountCredentials::Function = v3PrivateGetAccountCredentials
    v3PrivateGetAssetBalances::Function = v3PrivateGetAssetBalances
    v3PrivateGetAssetTokenHistory::Function = v3PrivateGetAssetTokenHistory
    v3PrivateGetAssetTransferHistory::Function = v3PrivateGetAssetTransferHistory
    v3PrivateGetAssetWalletHistory::Function = v3PrivateGetAssetWalletHistory
    v3PrivateGetAssetWalletDeposit::Function = v3PrivateGetAssetWalletDeposit
    v3PrivateGetAssetStakingYieldHistory::Function = v3PrivateGetAssetStakingYieldHistory
    v3PrivateGetFuturesPositions::Function = v3PrivateGetFuturesPositions
    v3PrivateGetFuturesLeverage::Function = v3PrivateGetFuturesLeverage
    v3PrivateGetFuturesDefaultMarginMode::Function = v3PrivateGetFuturesDefaultMarginMode
    v3PrivateGetFuturesFundingFeeHistory::Function = v3PrivateGetFuturesFundingFeeHistory
    v3PrivateGetSpotMarginInterestRate::Function = v3PrivateGetSpotMarginInterestRate
    v3PrivateGetSpotMarginInterestHistory::Function = v3PrivateGetSpotMarginInterestHistory
    v3PrivateGetSpotMarginMaxMargin::Function = v3PrivateGetSpotMarginMaxMargin
    v3PrivateGetAlgoOrderOid::Function = v3PrivateGetAlgoOrderOid
    v3PrivateGetAlgoOrders::Function = v3PrivateGetAlgoOrders
    v3PrivateGetPositions::Function = v3PrivateGetPositions
    v3PrivateGetBuypower::Function = v3PrivateGetBuypower
    v3PrivateGetConvertExchangeInfo::Function = v3PrivateGetConvertExchangeInfo
    v3PrivateGetConvertAssetInfo::Function = v3PrivateGetConvertAssetInfo
    v3PrivateGetConvertRfq::Function = v3PrivateGetConvertRfq
    v3PrivateGetConvertTrade::Function = v3PrivateGetConvertTrade
    v3PrivateGetConvertTrades::Function = v3PrivateGetConvertTrades
    v3PrivatePostTradeOrder::Function = v3PrivatePostTradeOrder
    v3PrivatePostTradeAlgoOrder::Function = v3PrivatePostTradeAlgoOrder
    v3PrivatePostTradeCancelAllAfter::Function = v3PrivatePostTradeCancelAllAfter
    v3PrivatePostAccountTradingMode::Function = v3PrivatePostAccountTradingMode
    v3PrivatePostAccountListenKey::Function = v3PrivatePostAccountListenKey
    v3PrivatePostAssetTransfer::Function = v3PrivatePostAssetTransfer
    v3PrivatePostAssetWalletWithdraw::Function = v3PrivatePostAssetWalletWithdraw
    v3PrivatePostSpotMarginLeverage::Function = v3PrivatePostSpotMarginLeverage
    v3PrivatePostSpotMarginInterestRepay::Function = v3PrivatePostSpotMarginInterestRepay
    v3PrivatePostAlgoOrder::Function = v3PrivatePostAlgoOrder
    v3PrivatePostConvertRft::Function = v3PrivatePostConvertRft
    v3PrivatePutTradeOrder::Function = v3PrivatePutTradeOrder
    v3PrivatePutTradeAlgoOrder::Function = v3PrivatePutTradeAlgoOrder
    v3PrivatePutFuturesLeverage::Function = v3PrivatePutFuturesLeverage
    v3PrivatePutFuturesPositionMode::Function = v3PrivatePutFuturesPositionMode
    v3PrivatePutOrderOid::Function = v3PrivatePutOrderOid
    v3PrivatePutOrderClientClientOrderId::Function = v3PrivatePutOrderClientClientOrderId
    v3PrivatePutAlgoOrderOid::Function = v3PrivatePutAlgoOrderOid
    v3PrivatePutAlgoOrderClientClientOrderId::Function = v3PrivatePutAlgoOrderClientClientOrderId
    v3PrivateDeleteTradeOrder::Function = v3PrivateDeleteTradeOrder
    v3PrivateDeleteTradeOrders::Function = v3PrivateDeleteTradeOrders
    v3PrivateDeleteTradeAlgoOrder::Function = v3PrivateDeleteTradeAlgoOrder
    v3PrivateDeleteTradeAlgoOrders::Function = v3PrivateDeleteTradeAlgoOrders
    v3PrivateDeleteTradeAllOrders::Function = v3PrivateDeleteTradeAllOrders
    v3PrivateDeleteAlgoOrderOrderId::Function = v3PrivateDeleteAlgoOrderOrderId
    v3PrivateDeleteAlgoOrdersPending::Function = v3PrivateDeleteAlgoOrdersPending
    v3PrivateDeleteAlgoOrdersPendingSymbol::Function = v3PrivateDeleteAlgoOrdersPendingSymbol
    v3PrivateDeleteOrdersPending::Function = v3PrivateDeleteOrdersPending

end
function describe(self::Woo, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "woo",
    Symbol("name") => "WOO X",
    Symbol("countries") => ["KY"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("hostname") => "woox.io",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrder") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => true,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
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
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => false,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
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
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("pub") => "https://api-pub.woox.io",
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("pub") => "https://api-pub.staging.woox.io",
            Symbol("public") => "https://api.staging.woox.io",
            Symbol("private") => "https://api.staging.woox.io"
        ),
        Symbol("www") => "https://woox.io/",
        Symbol("doc") => ["https://docs.woox.io/"],
        Symbol("fees") => ["https://support.woox.io/hc/en-001/articles/4404611795353--Trading-Fees"],
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://woox.io/register?ref=DIJT0CNL",
            Symbol("discount") => 0.35
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("pub") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("hist/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("hist/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                )
            ),
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("info/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("system_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("token_network") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("funding_rates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("funding_rate/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("funding_rate_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orderbook/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("client/token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/order/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/trade/{tid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/{oid}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/hist_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("staking/yield_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/holding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("asset/history") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("sub_account/all") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("sub_account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("sub_account/asset_detail") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("sub_account/ip_restriction") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("asset/main_sub_transfer_history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("token_interest") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("token_interest/{token}") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("interest/history") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("interest/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("funding_fee/history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("position/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("client/transaction_history") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("client/futures_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 60
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/cancel_all_after") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("asset/internal_withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("interest/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("client/account_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                    Symbol("client/position_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("client/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                    Symbol("client/futures_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("client/isolated_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 30
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("client/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 120
)
                )
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("client/holding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("v3") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("systemInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("tokenNetwork") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("tokenInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("marketTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("marketTradesHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("klineHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("fundingRateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("insuranceFund") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/algoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/transaction") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/transactionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("trade/tradingFee") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("account/tokenConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/symbolConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/subAccounts/all") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("account/referral/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("account/referral/rewardHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("account/credentials") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("asset/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/token/history") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("asset/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("asset/wallet/history") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("asset/wallet/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("asset/staking/yieldHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("futures/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("futures/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("futures/defaultMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("futures/fundingFee/history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("spotMargin/interestRate") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("spotMargin/interestHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("spotMargin/maxMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("algo/order/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("algo/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("buypower") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/assetInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("convert/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trade/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("trade/cancelAllAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/tradingMode") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                    Symbol("account/listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                    Symbol("asset/wallet/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("spotMargin/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                    Symbol("spotMargin/interestRepay") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("algo/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("convert/rft") => Dict{Symbol, Any}(
    Symbol("cost") => 60
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trade/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("futures/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                    Symbol("futures/positionMode") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                    Symbol("order/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/client/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("algo/order/{oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("algo/order/client/{client_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/algoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("algo/order/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("algo/orders/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("algo/orders/pending/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
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
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("sandboxMode") => false,
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("network-aliases-for-tokens") => Dict{Symbol, Any}(
            Symbol("HT") => "ERC20",
            Symbol("OMG") => "ERC20",
            Symbol("UATOM") => "ATOM",
            Symbol("ZRX") => "ZRX"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRX") => "TRX",
            Symbol("TRC20") => "TRX",
            Symbol("ERC20") => "ETH",
            Symbol("BEP20") => "BSC",
            Symbol("ARBITRUM") => "Arbitrum"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("TRX") => "TRC20",
            Symbol("TRON") => "TRC20"
        ),
        Symbol("defaultNetworkCodeForCurrencies") => Dict{Symbol, Any}(),
        Symbol("transfer") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("brokerId") => "bc830de7-50f3-460b-9ee0-f430f83f9dad"
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
                    Symbol("index") => false
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
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 10000,
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
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forSwap") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("hedged") => true
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
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => OperationFailed,
            Symbol("-1001") => AuthenticationError,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => BadRequest,
            Symbol("-1005") => BadRequest,
            Symbol("-1006") => BadRequest,
            Symbol("-1007") => BadRequest,
            Symbol("-1008") => InvalidOrder,
            Symbol("-1009") => BadRequest,
            Symbol("-1012") => BadRequest,
            Symbol("-1101") => InvalidOrder,
            Symbol("-1102") => InvalidOrder,
            Symbol("-1103") => InvalidOrder,
            Symbol("-1104") => InvalidOrder,
            Symbol("-1105") => InvalidOrder,
            Symbol("317136") => InvalidOrder,
            Symbol("317137") => InvalidOrder,
            Symbol("317138") => InvalidOrder,
            Symbol("317139") => InvalidOrder,
            Symbol("317140") => InvalidOrder,
            Symbol("317141") => InvalidOrder,
            Symbol("317142") => InvalidOrder,
            Symbol("317143") => InvalidOrder,
            Symbol("317144") => InvalidOrder,
            Symbol("317145") => InvalidOrder,
            Symbol("317146") => InvalidOrder,
            Symbol("317147") => InvalidOrder,
            Symbol("317148") => BadRequest,
            Symbol("317149") => OrderNotFound,
            Symbol("317150") => InvalidOrder,
            Symbol("317151") => InvalidOrder,
            Symbol("317152") => OrderNotFound,
            Symbol("317153") => OrderNotFound,
            Symbol("317154") => OperationFailed,
            Symbol("317155") => BadSymbol,
            Symbol("317156") => BadSymbol,
            Symbol("317157") => InvalidOrder,
            Symbol("317158") => InvalidOrder,
            Symbol("317159") => BadSymbol,
            Symbol("317160") => InvalidOrder,
            Symbol("317161") => InvalidOrder,
            Symbol("317162") => BadRequest,
            Symbol("317163") => InvalidOrder,
            Symbol("317164") => InvalidOrder,
            Symbol("317165") => InvalidOrder,
            Symbol("317166") => InvalidOrder,
            Symbol("317167") => InvalidOrder,
            Symbol("317168") => OperationFailed,
            Symbol("317169") => InvalidOrder,
            Symbol("317170") => InvalidOrder,
            Symbol("317171") => BadRequest,
            Symbol("317172") => BadRequest,
            Symbol("317173") => BadRequest,
            Symbol("317174") => InvalidOrder,
            Symbol("317176") => InvalidOrder,
            Symbol("317177") => InvalidOrder,
            Symbol("317178") => BadRequest,
            Symbol("317179") => BadRequest,
            Symbol("317184") => OrderNotFound,
            Symbol("317206") => InvalidOrder,
            Symbol("317207") => InsufficientFunds,
            Symbol("302001") => ExchangeError,
            Symbol("302002") => ExchangeError,
            Symbol("302003") => BadRequest,
            Symbol("302004") => BadRequest,
            Symbol("302005") => ExchangeError,
            Symbol("302101") => BadSymbol,
            Symbol("302102") => InsufficientFunds,
            Symbol("302103") => InsufficientFunds,
            Symbol("302104") => InsufficientFunds,
            Symbol("302109") => OperationFailed,
            Symbol("302110") => ExchangeError,
            Symbol("302111") => InvalidOrder,
            Symbol("302112") => InvalidOrder,
            Symbol("302113") => InvalidOrder,
            Symbol("302114") => InvalidOrder,
            Symbol("302115") => InvalidOrder,
            Symbol("302117") => DuplicateOrderId,
            Symbol("302118") => InsufficientFunds,
            Symbol("302119") => InsufficientFunds,
            Symbol("302120") => InvalidOrder,
            Symbol("302121") => InvalidOrder,
            Symbol("302122") => InvalidOrder,
            Symbol("302123") => ExchangeError,
            Symbol("302125") => InvalidOrder,
            Symbol("302126") => InvalidOrder,
            Symbol("302127") => InvalidOrder,
            Symbol("302128") => InsufficientFunds,
            Symbol("302129") => OrderNotFound,
            Symbol("302130") => InvalidOrder,
            Symbol("302131") => InvalidOrder,
            Symbol("302132") => InvalidOrder,
            Symbol("302133") => InvalidOrder,
            Symbol("302134") => BadRequest,
            Symbol("302135") => BadRequest,
            Symbol("302136") => BadRequest,
            Symbol("302137") => InvalidOrder,
            Symbol("302138") => InvalidOrder,
            Symbol("302140") => InvalidOrder,
            Symbol("302141") => InvalidOrder,
            Symbol("302142") => InvalidOrder,
            Symbol("302143") => ExchangeError,
            Symbol("302144") => InvalidOrder,
            Symbol("302145") => InsufficientFunds,
            Symbol("302147") => InvalidOrder,
            Symbol("302148") => InvalidOrder,
            Symbol("302149") => InvalidOrder,
            Symbol("302150") => InvalidOrder,
            Symbol("302151") => InvalidOrder,
            Symbol("302152") => InvalidOrder,
            Symbol("302154") => InsufficientFunds,
            Symbol("302155") => InsufficientFunds,
            Symbol("302156") => InvalidOrder,
            Symbol("302157") => InsufficientFunds,
            Symbol("302159") => RequestTimeout,
            Symbol("302160") => InvalidOrder,
            Symbol("302162") => InvalidOrder,
            Symbol("302163") => InvalidOrder,
            Symbol("302164") => InvalidOrder,
            Symbol("302165") => ExchangeError,
            Symbol("302166") => InvalidOrder,
            Symbol("302167") => InvalidOrder,
            Symbol("302168") => InvalidOrder,
            Symbol("302169") => InsufficientFunds,
            Symbol("302170") => InsufficientFunds,
            Symbol("302171") => InvalidOrder,
            Symbol("302172") => InvalidOrder,
            Symbol("302177") => InvalidOrder,
            Symbol("302178") => InvalidOrder,
            Symbol("302185") => InvalidOrder,
            Symbol("302186") => InvalidOrder,
            Symbol("302188") => InvalidOrder,
            Symbol("302189") => InvalidOrder,
            Symbol("302190") => InvalidOrder,
            Symbol("302191") => InvalidOrder,
            Symbol("302192") => InvalidOrder,
            Symbol("302193") => InsufficientFunds,
            Symbol("302194") => InvalidOrder,
            Symbol("302195") => InvalidOrder,
            Symbol("302196") => InvalidOrder,
            Symbol("302197") => InvalidOrder,
            Symbol("302198") => InvalidOrder,
            Symbol("302199") => InvalidOrder,
            Symbol("302301") => InsufficientFunds,
            Symbol("302303") => InvalidOrder,
            Symbol("302305") => InsufficientFunds,
            Symbol("302306") => BadRequest,
            Symbol("302307") => AccountSuspended,
            Symbol("302308") => InvalidOrder,
            Symbol("302309") => InvalidOrder,
            Symbol("302310") => InsufficientFunds,
            Symbol("302311") => ExchangeError,
            Symbol("302312") => ExchangeError,
            Symbol("302313") => ExchangeError,
            Symbol("302314") => InvalidOrder,
            Symbol("302999") => ExchangeError,
            Symbol("311001") => ExchangeError,
            Symbol("311002") => ExchangeError,
            Symbol("311004") => ExchangeError,
            Symbol("311999") => OperationFailed
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Can not place") => ExchangeError,
            Symbol("maintenance") => OnMaintenance,
            Symbol("symbol must not be blank") => BadRequest,
            Symbol("The token is not supported") => BadRequest,
            Symbol("Your order and symbol are not valid or already canceled") => BadRequest,
            Symbol("Insufficient WOO. Please enable margin trading for leverage trading") => BadRequest
        )
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function fetchStatus(self::Woo, params=Dict())
    response = Base.fetch(self.v3PublicGetSystemInfo(params));
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
function fetchTime(self::Woo, params=Dict())
    response = Base.fetch(self.v3PublicGetSystemInfo(params));
    return safeInteger(response, "timestamp")

end
function fetchMarkets(self::Woo, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    response = Base.fetch(self.v3PublicGetInstruments(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseMarkets(rows)

end
function parseMarket(self::Woo, market)
    marketId = safeString(market, "symbol", "");
    parts = split(marketId, "_");
    first_var = safeString(parts, 0);
    marketType = nothing;
    spot = false;
    swap = false;
    if functions.ccxtruthy(first_var == "SPOT")
        spot = true;
        marketType = "spot";
    elseif functions.ccxtruthy(first_var == "PERP")
        swap = true;
        marketType = "swap";
    end
    baseId = safeString(parts, 1);
    quoteId = safeString(parts, 2);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = nothing;
    settle = nothing;
    symbol = string(base, "/", quote_var);
    contractSize = nothing;
    linear = nothing;
    inverse = nothing;
    margin = true;
    contract = swap;
    if functions.ccxtruthy(contract)
        margin = false;
        settleId = safeString(parts, 2);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        contractSize = self.parseNumber("1");
        linear = true;
        inverse = false;
    end
    active = safeString(market, "status") == "TRADING";
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => marketType,
    Symbol("spot") => spot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "baseTick"),
        Symbol("price") => self.safeNumber(market, "quoteTick")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "baseMin"),
            Symbol("max") => self.safeNumber(market, "baseMax")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteMin"),
            Symbol("max") => self.safeNumber(market, "quoteMax")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minNotional"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchTrades(self::Woo, symbol, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.v3PublicGetMarketTrades(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseTrades(rows, market, since, limit)

end
function parseTrade(self::Woo, trade, market=nothing)
    isFromFetchOrder = (ccxt_in("id", trade));
    timestampString = safeString2(trade, "executed_timestamp", "executedTimestamp");
    timestamp = nothing;
    if functions.ccxtruthy(timestampString != nothing)
        if functions.ccxtruthy(findfirst(".", timestampString) !== nothing)
            timestamp = safeTimestamp2(trade, "executed_timestamp", "executedTimestamp");
        else
            timestamp = safeInteger(trade, "executedTimestamp");
        end
    end
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString2(trade, "executed_price", "executedPrice");
    amount = safeString2(trade, "executed_quantity", "executedQuantity");
    order_id = safeString2(trade, "order_id", "orderId");
    fee = self.parseTokenAndFeeTemp(trade, ["fee_asset", "feeAsset"], ["fee"]);
    feeCost = safeString(fee, "cost");
    if functions.ccxtruthy(@functions.ccxt_and((fee != nothing), (feeCost != nothing)))
        fee[Symbol("cost")] = feeCost;
    end
    cost = stringMul(price, amount);
    side = safeStringLower(trade, "side");
    id = safeString(trade, "id");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isFromFetchOrder)
        isMaker = safeString2(trade, "is_maker", "isMaker") == "1";
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
function parseTokenAndFeeTemp(self::Woo, item, feeTokenKeys, feeAmountKeys)
    feeCost = safeStringN(item, feeAmountKeys);
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeStringN(item, feeTokenKeys);
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return fee

end
function parseTradingFee(self::Woo, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.parseNumber(stringDiv(safeString(fee, "makerFee"), "100")),
    Symbol("taker") => self.parseNumber(stringDiv(safeString(fee, "takerFee"), "100")),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Woo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v3PrivateGetTradeTradingFee(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTradingFee(data, market)

end
function fetchTradingFees(self::Woo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetAccountInfo(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    maker = safeString(data, "makerFeeRate");
    taker = safeString(data, "takerFeeRate");
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    if functions.ccxtruthy(symbols == nothing)
            return result
    end
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
    return result

end
function fetchCurrencies(self::Woo, params=Dict())
    result = Dict{Symbol, Any}();
    tokenResponsePromise = self.v1PublicGetToken(params);
    tokenNetworkResponsePromise = self.v1PublicGetTokenNetwork(params);
    (tokenResponse, tokenNetworkResponse) = (Base.fetch(asyncmap(Base.fetch, [tokenResponsePromise, tokenNetworkResponsePromise])));
    tokenRows = self.safeList(tokenResponse, "rows", []);
    tokenNetworkRows = self.safeList(tokenNetworkResponse, "rows", []);
    networksById = groupBy(tokenNetworkRows, "token");
    tokensById = groupBy(tokenRows, "balance_token");
    currencyIds = objectKeys(tokensById);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        id = get(currencyIds, i + 1, nothing);
        customCurrency = Dict{Symbol, Any}(
            Symbol("_coin_id") => id,
            Symbol("_tokens_by_id") => get(tokensById, Symbol(id), nothing),
            Symbol("_networks_by_id") => get(networksById, Symbol(id), nothing)
        );
        parsed = self.parseCurrency(customCurrency);
        code = safeString(parsed, "code");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = parsed;
        end
        i += 1
    end
    return result

end
function parseCurrency(self::Woo, rawCurrency)
    currencyId = safeString(rawCurrency, "_coin_id");
    code = self.safeCurrencyCode(currencyId);
    tokensByNetworkId = indexBy(get(rawCurrency, Symbol("_tokens_by_id"), nothing), "network");
    chainsByNetworkId = indexBy(get(rawCurrency, Symbol("_networks_by_id"), nothing), "network");
    keys_var = objectKeys(chainsByNetworkId);
    resultingNetworks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(keys_var)))
        networkId = get(keys_var, j + 1, nothing);
        tokenEntry = self.safeDict(tokensByNetworkId, networkId, Dict{Symbol, Any}());
        networkEntry = self.safeDict(chainsByNetworkId, networkId, Dict{Symbol, Any}());
        networkCode = self.networkIdToCode(networkId, code);
        specialNetworkId = safeString(tokenEntry, "token");
        if functions.ccxtruthy(networkCode != nothing)
            resultingNetworks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("currencyNetworkId") => specialNetworkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => safeString(networkEntry, "allow_deposit") == "1",
                Symbol("withdraw") => safeString(networkEntry, "allow_withdraw") == "1",
                Symbol("fee") => self.safeNumber(networkEntry, "withdrawal_fee"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(tokenEntry, "decimals"))),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkEntry, "minimum_withdrawal"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                ),
                Symbol("info") => Dict{Symbol, Any}(
                    Symbol("network") => networkEntry,
                    Symbol("token") => tokenEntry
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("name") => nothing,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("networks") => resultingNetworks,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("type") => "crypto",
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => rawCurrency
))

end
function createMarketBuyOrderWithCost(self::Woo, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, 1, params))

end
function createMarketSellOrderWithCost(self::Woo, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() supports spot orders only")));
    end
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, 1, params))

end
function createTrailingAmountOrder(self::Woo, symbol, type_var, side, amount, price=nothing, trailingAmount=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingAmount == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingAmountOrder() requires a trailingAmount argument")));
    end
    if functions.ccxtruthy(trailingTriggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingAmountOrder() requires a trailingTriggerPrice argument")));
    end
    params[Symbol("trailingAmount")] = trailingAmount;
    params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    return Base.fetch(self.createOrder(symbol, type_var, side, amount, price, params))

end
function createTrailingPercentOrder(self::Woo, symbol, type_var, side, amount, price=nothing, trailingPercent=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingPercent == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrder() requires a trailingPercent argument")));
    end
    if functions.ccxtruthy(trailingTriggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrder() requires a trailingTriggerPrice argument")));
    end
    params[Symbol("trailingPercent")] = trailingPercent;
    params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    return Base.fetch(self.createOrder(symbol, type_var, side, amount, price, params))

end
function createOrder(self::Woo, symbol, type_var, side, amount, price=nothing, params=Dict())
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    params = omit(params, ["reduceOnly", "reduce_only"]);
    orderType = uppercase(type_var);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
    if functions.ccxtruthy(marginMode != nothing)
        request[Symbol("marginMode")] = self.encodeMarginMode(marginMode);
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    algoType = safeString(params, "algoType");
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activatedPrice", numberToString(price));
    trailingAmount = safeString2(params, "trailingAmount", "callbackValue");
    trailingPercent = safeString2(params, "trailingPercent", "callbackRate");
    isTrailingAmountOrder = trailingAmount != nothing;
    isTrailingPercentOrder = trailingPercent != nothing;
    isTrailing = @functions.ccxt_or(isTrailingAmountOrder, isTrailingPercentOrder);
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTrailing, triggerPrice != nothing), hasStopLoss), hasTakeProfit), (safeValue(params, "childOrders") != nothing));
    isMarket = orderType == "MARKET";
    timeInForce = safeStringLower(params, "timeInForce");
    postOnly = self.isPostOnly(isMarket, nothing, params);
    clientOrderIdKey = functions.ccxtruthy(isConditional) ? "clientAlgoOrderId" : "clientOrderId";
    request[Symbol("type")] = orderType;
    if functions.ccxtruthy(!functions.ccxtruthy(isConditional))
        if functions.ccxtruthy(postOnly)
            request[Symbol("type")] = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "fok")
            request[Symbol("type")] = "FOK";
        else
            if functions.ccxtruthy(timeInForce == "ioc")
                request[Symbol("type")] = "IOC";
            end

        end
    end
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduceOnly")] = reduceOnly;
    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isMarket), price != nothing))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(@functions.ccxt_and(isMarket, !functions.ccxtruthy(isConditional)))
        cost = safeStringN(params, ["cost", "order_amount", "orderAmount"]);
        params = omit(params, ["cost", "order_amount", "orderAmount"]);
        isPriceProvided = price != nothing;
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), (@functions.ccxt_or(isPriceProvided, (cost != nothing)))))
            quoteAmount = nothing;
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = self.costToPrecision(symbol, cost);
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                costRequest = stringMul(amountString, priceString);
                quoteAmount = self.costToPrecision(symbol, costRequest);
            end
            request[Symbol("amount")] = quoteAmount;
        else
            request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        end
    elseif functions.ccxtruthy(algoType != "POSITIONAL_TP_SL")
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    clientOrderId = safeStringN(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol(clientOrderIdKey)] = clientOrderId;
    end
    if functions.ccxtruthy(isTrailing)
        if functions.ccxtruthy(trailingTriggerPrice == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a trailingTriggerPrice parameter for trailing orders")));
        end
        request[Symbol("activatedPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
        request[Symbol("algoType")] = "TRAILING_STOP";
        if functions.ccxtruthy(isTrailingAmountOrder)
            request[Symbol("callbackValue")] = trailingAmount;
        elseif functions.ccxtruthy(isTrailingPercentOrder)
            convertedTrailingPercent = stringDiv(trailingPercent, "100");
            request[Symbol("callbackRate")] = convertedTrailingPercent;
        end
    elseif functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(algoType != "TRAILING_STOP")
            request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
            request[Symbol("algoType")] = "STOP";
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            request[Symbol("algoType")] = "BRACKET";
            outterOrder = Dict{Symbol, Any}(
                Symbol("symbol") => get(market, Symbol("id"), nothing),
                Symbol("reduceOnly") => false,
                Symbol("algoType") => "POSITIONAL_TP_SL",
                Symbol("childOrders") => []
            );
            childOrders = get(outterOrder, Symbol("childOrders"), nothing);
            closeSide = functions.ccxtruthy((orderSide == "BUY")) ? "SELL" : "BUY";
            if functions.ccxtruthy(hasStopLoss)
                stopLossPrice = safeString(stopLoss, "triggerPrice", stopLoss);
                stopLossOrder = Dict{Symbol, Any}(
                    Symbol("side") => closeSide,
                    Symbol("algoType") => "STOP_LOSS",
                    Symbol("triggerPrice") => self.priceToPrecision(symbol, stopLossPrice),
                    Symbol("type") => "CLOSE_POSITION",
                    Symbol("reduceOnly") => true
                );
                                push!(childOrders, stopLossOrder);
            end
            if functions.ccxtruthy(hasTakeProfit)
                takeProfitPrice = safeString(takeProfit, "triggerPrice", takeProfit);
                takeProfitOrder = Dict{Symbol, Any}(
                    Symbol("side") => closeSide,
                    Symbol("algoType") => "TAKE_PROFIT",
                    Symbol("triggerPrice") => self.priceToPrecision(symbol, takeProfitPrice),
                    Symbol("type") => "CLOSE_POSITION",
                    Symbol("reduceOnly") => true
                );
                                push!(childOrders, takeProfitOrder);
            end
            request[Symbol("childOrders")] = [outterOrder];
        end

    end
    params = omit(params, ["clOrdID", "clientOrderId", "client_order_id", "postOnly", "timeInForce", "stopPrice", "triggerPrice", "stopLoss", "takeProfit", "trailingPercent", "trailingAmount", "trailingTriggerPrice"]);
    response = nothing;
    if functions.ccxtruthy(isConditional)
        response = Base.fetch(self.v3PrivatePostTradeAlgoOrder(extend(request, params)));
    else
        response = Base.fetch(self.v3PrivatePostTradeOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    data = self.safeDict(self.safeList(data, "rows"), 0, data);
    data[Symbol("timestamp")] = safeString(response, "timestamp");
    return self.parseOrder(data, market)

end
function encodeMarginMode(self::Woo, mode)
    modes = Dict{Symbol, Any}(
        Symbol("cross") => "CROSS",
        Symbol("isolated") => "ISOLATED"
    );
    return safeString(modes, mode, mode)

end
function editOrder(self::Woo, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    clientOrderIdUnified = safeString2(params, "clOrdID", "clientOrderId");
    clientOrderIdExchangeSpecific = safeString(params, "client_order_id", clientOrderIdUnified);
    isByClientOrder = clientOrderIdExchangeSpecific != nothing;
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "takeProfitPrice", "stopLossPrice"]);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    end
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activatedPrice", numberToString(price));
    trailingAmount = safeString2(params, "trailingAmount", "callbackValue");
    trailingPercent = safeString2(params, "trailingPercent", "callbackRate");
    isTrailingAmountOrder = trailingAmount != nothing;
    isTrailingPercentOrder = trailingPercent != nothing;
    isTrailing = @functions.ccxt_or(isTrailingAmountOrder, isTrailingPercentOrder);
    if functions.ccxtruthy(isTrailing)
        if functions.ccxtruthy(trailingTriggerPrice != nothing)
            request[Symbol("activatedPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
        end
        if functions.ccxtruthy(isTrailingAmountOrder)
            request[Symbol("callbackValue")] = trailingAmount;
        elseif functions.ccxtruthy(isTrailingPercentOrder)
            convertedTrailingPercent = stringDiv(trailingPercent, "100");
            request[Symbol("callbackRate")] = convertedTrailingPercent;
        end
    end
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    params = omit(params, ["clOrdID", "clientOrderId", "client_order_id", "stopPrice", "triggerPrice", "takeProfitPrice", "stopLossPrice", "trailingTriggerPrice", "trailingAmount", "trailingPercent", "trigger", "stop"]);
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTrigger, isTrailing), (triggerPrice != nothing)), (safeValue(params, "childOrders") != nothing));
    response = nothing;
    if functions.ccxtruthy(isConditional)
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("clientAlgoOrderId")] = clientOrderIdExchangeSpecific;
        else
            request[Symbol("algoOrderId")] = id;
        end
        response = Base.fetch(self.v3PrivatePutTradeAlgoOrder(extend(request, params)));
    else
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("clientOrderId")] = clientOrderIdExchangeSpecific;
        else
            request[Symbol("orderId")] = id;
        end
        response = Base.fetch(self.v3PrivatePutTradeOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    order = extend(response, data);
    if functions.ccxtruthy(isByClientOrder)
        order[Symbol("clientOrderId")] = clientOrderIdExchangeSpecific;
    else
        order[Symbol("orderId")] = id;
    end
    return self.parseOrder(order, market)

end
function cancelOrder(self::Woo, id, symbol=nothing, params=Dict())
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    params = omit(params, ["trigger", "stop"]);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTrigger), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    clientOrderIdUnified = safeString2(params, "clOrdID", "clientOrderId");
    clientOrderIdExchangeSpecific = safeString(params, "client_order_id", clientOrderIdUnified);
    params = omit(params, ["clOrdID", "clientOrderId", "client_order_id"]);
    isByClientOrder = clientOrderIdExchangeSpecific != nothing;
    response = nothing;
    if functions.ccxtruthy(isTrigger)
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("clientAlgoOrderId")] = clientOrderIdExchangeSpecific;
        else
            request[Symbol("algoOrderId")] = id;
        end
        response = Base.fetch(self.v3PrivateDeleteTradeAlgoOrder(extend(request, params)));
    else
        request[Symbol("symbol")] = safeString(market, "id");
        if functions.ccxtruthy(isByClientOrder)
            request[Symbol("clientOrderId")] = clientOrderIdExchangeSpecific;
        else
            request[Symbol("orderId")] = id;
        end
        response = Base.fetch(self.v3PrivateDeleteTradeOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    data[Symbol("timestamp")] = safeString(response, "timestamp");
    if functions.ccxtruthy(isByClientOrder)
        data[Symbol("clientOrderId")] = clientOrderIdExchangeSpecific;
    else
        data[Symbol("orderId")] = id;
    end
    return self.parseOrder(data, market)

end
function cancelAllOrders(self::Woo, symbol=nothing, params=Dict())
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
        response = Base.fetch(self.v3PrivateDeleteTradeAlgoOrders(params));
    else
        response = Base.fetch(self.v3PrivateDeleteTradeOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data
))]

end
function cancelAllOrdersAfter(self::Woo, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("triggerAfter") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? min(timeout, 900000) : 0
    );
    response = Base.fetch(self.v3PrivatePostTradeCancelAllAfter(extend(request, params)));
    return response

end
function fetchOrder(self::Woo, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clOrdID", "clientOrderId");
    response = nothing;
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientAlgoOrderId")] = id;
        else
            request[Symbol("algoOrderId")] = id;
        end
        response = Base.fetch(self.v3PrivateGetTradeAlgoOrder(extend(request, params)));
    else
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOrderId")] = clientOrderId;
        else
            request[Symbol("orderId")] = id;
        end
        response = Base.fetch(self.v3PrivateGetTradeOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function fetchOrders(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchOrders", symbol, since, limit, params, "page", 500))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 500);
    end
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = Base.fetch(self.v3PrivateGetTradeAlgoOrders(extend(request, params)));
    else
        response = Base.fetch(self.v3PrivateGetTradeOrders(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "rows", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "INCOMPLETE"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function fetchClosedOrders(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "COMPLETED"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function parseTimeInForce(self::Woo, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("ioc") => "IOC",
        Symbol("fok") => "FOK",
        Symbol("post_only") => "PO"
    );
    return safeString(timeInForces, timeInForce)

end
function parseOrder(self::Woo, order, market=nothing)
    timestamp = nothing;
    timestrampString = safeString(order, "createdTime");
    if functions.ccxtruthy(timestrampString != nothing)
        if functions.ccxtruthy(findfirst(".", timestrampString) !== nothing)
            timestamp = safeTimestamp(order, "createdTime");
        else
            timestamp = safeInteger(order, "createdTime");
        end
    end
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(order, "timestamp");
    end
    orderId = safeString2(order, "orderId", "algoOrderId");
    clientOrderId = omitZero(safeString2(order, "clientOrderId", "clientAlgoOrderId"));
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    price = safeString(order, "price");
    amount = safeString(order, "quantity");
    cost = safeString(order, "amount");
    orderType = safeStringLower(order, "type");
    status = safeValue2(order, "status", "algoStatus");
    side = safeStringLower(order, "side");
    filled = safeString2(order, "executed", "totalExecutedQuantity");
    average = omitZero(safeString(order, "averageExecutedPrice"));
    fee = self.safeNumber(order, "totalFee");
    feeCurrency = safeString(order, "feeAsset");
    triggerPrice = self.safeNumber(order, "triggerPrice");
    lastUpdateTimestampString = safeString(order, "updatedTime");
    lastUpdateTimestamp = nothing;
    if functions.ccxtruthy(lastUpdateTimestampString != nothing)
        if functions.ccxtruthy(findfirst(".", lastUpdateTimestampString) !== nothing)
            lastUpdateTimestamp = safeTimestamp(order, "updatedTime");
        else
            lastUpdateTimestamp = safeInteger(order, "updatedTime");
        end
    end
    postOnly = nothing;
    if functions.ccxtruthy(orderType != nothing)
        postOnly = (orderType == "post_only");
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
    Symbol("type") => orderType,
    Symbol("timeInForce") => self.parseTimeInForce(orderType),
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("cost") => cost,
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => fee,
        Symbol("currency") => feeCurrency
    ),
    Symbol("info") => order
), market)

end
function parseOrderStatus(self::Woo, status)
    if functions.ccxtruthy(status != nothing)
        statuses = Dict{Symbol, Any}(
            Symbol("NEW") => "open",
            Symbol("FILLED") => "closed",
            Symbol("EDIT_SENT") => "open",
            Symbol("CANCEL_SENT") => "canceled",
            Symbol("CANCEL_ALL_SENT") => "canceled",
            Symbol("CANCELLED") => "canceled",
            Symbol("PARTIAL_FILLED") => "open",
            Symbol("REJECTED") => "rejected",
            Symbol("INCOMPLETE") => "open",
            Symbol("COMPLETED") => "closed"
        );
            return safeString(statuses, status, status)
    end
    return status

end
function fetchOrderBook(self::Woo, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("maxLevel")] = limit;
    end
    response = Base.fetch(self.v3PublicGetOrderbook(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(data, symbol, timestamp, "bids", "asks", "price", "quantity")

end
function fetchOHLCV(self::Woo, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since - 1;
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("before")] = until;
    end
    response = Base.fetch(self.v3PublicGetKlineHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseOHLCVs(rows, market, timeframe, since, limit)

end
function parseOHLCV(self::Woo, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "startTimestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchOrderTrades(self::Woo, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    trades = self.safeList(response, "rows", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchMyTrades(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v3PrivateGetTradeTransactionHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    trades = self.safeList(data, "rows", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchAccounts(self::Woo, params=Dict())
    mainAccountPromise = self.v3PrivateGetAccountInfo(params);
    subAccountPromise = self.v3PrivateGetAccountSubAccountsAll(params);
    (mainAccountResponse, subAccountResponse) = (Base.fetch(asyncmap(Base.fetch, [mainAccountPromise, subAccountPromise])));
    mainData = self.safeDict(mainAccountResponse, "data", Dict{Symbol, Any}());
    mainRows = [mainData];
    subData = self.safeDict(subAccountResponse, "data", Dict{Symbol, Any}());
    subRows = self.safeList(subData, "rows", []);
    rows = arrayConcat(mainRows, subRows);
    return self.parseAccounts(rows, params)

end
function parseAccount(self::Woo, account)
    return Dict{Symbol, Any}(
    Symbol("info") => account,
    Symbol("id") => safeString(account, "applicationId"),
    Symbol("name") => safeStringN(account, ["name", "account", "alias"]),
    Symbol("code") => nothing,
    Symbol("type") => safeStringLower(account, "accountType", "subaccount")
)

end
function fetchBalance(self::Woo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetAssetBalances(params));
    data = self.safeDict(response, "data");
    return self.parseBalance(data)

end
function parseBalance(self::Woo, response)
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
        account[Symbol("free")] = safeString(balance, "availableBalance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchDepositAddress(self::Woo, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("token") => get(currency, Symbol("id"), nothing),
        Symbol("network") => self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.v3PrivateGetAssetWalletDeposit(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositAddress(extend(data, Dict{Symbol, Any}(
    Symbol("network") => safeString(request, "network")
)), currency)

end
function getDedicatedNetworkId(self::Woo, currency, params)
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkCode = self.networkIdToCode(networkCode, get(currency, Symbol("code"), nothing));
    networkEntry = functions.ccxtruthy((networkCode == nothing)) ? nothing : self.safeDict(get(currency, Symbol("networks"), nothing), networkCode);
    if functions.ccxtruthy(networkEntry == nothing)
        supportedNetworks = objectKeys(get(currency, Symbol("networks"), nothing));
        throw(BadRequest(string(self.id, "  can not determine a network code, please provide unified \"network\" param, one from the following: ", json(supportedNetworks))));
    end
    currentyNetworkId = safeString(networkEntry, "currencyNetworkId");
    return [currentyNetworkId, params]

end
function parseDepositAddress(self::Woo, depositEntry, currency=nothing)
    address = safeString(depositEntry, "address");
    self.checkAddress(address);
    networkId = safeString(depositEntry, "network");
    return Dict{Symbol, Any}(
    Symbol("info") => depositEntry,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("network") => self.networkIdToCode(networkId, safeString(currency, "code")),
    Symbol("address") => address,
    Symbol("tag") => safeString(depositEntry, "extra")
)

end
function getAssetHistoryRows(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("token")] = get(currency, Symbol("id"), nothing);
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network")] = self.networkCodeToId(networkCode, safeString(currency, "code"));
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 1000);
    end
    transactionType = safeString(params, "type");
    params = omit(params, "type");
    if functions.ccxtruthy(transactionType != nothing)
        request[Symbol("type")] = transactionType;
    end
    response = Base.fetch(self.v3PrivateGetAssetWalletHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return [currency, self.safeList(data, "rows", [])]

end
function fetchLedger(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    currencyRows = Base.fetch(self.getAssetHistoryRows(code, since, limit, params));
    currency = safeValue(currencyRows, 0);
    rows = self.safeList(currencyRows, 1);
    return self.parseLedger(rows, currency, since, limit, params)

end
function parseLedgerEntry(self::Woo, item, currency=nothing)
    networkizedCode = safeString(item, "token");
    code = self.safeCurrencyCode(networkizedCode, currency);
    currency = self.safeCurrency(code, currency);
    amount = self.safeNumber(item, "amount");
    side = safeString(item, "tokenSide");
    direction = functions.ccxtruthy((side == "DEPOSIT")) ? "in" : "out";
    timestamp = safeTimestamp(item, "createdTime");
    fee = self.parseTokenAndFeeTemp(item, ["feeToken"], ["feeAmount"]);
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("currency") => code,
    Symbol("account") => safeString(item, "account"),
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => safeString(item, "txId"),
    Symbol("status") => self.parseTransactionStatus(safeString(item, "status")),
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("direction") => direction,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("fee") => fee
), currency)

end
function parseLedgerEntryType(self::Woo, type_var)
    types = Dict{Symbol, Any}(
        Symbol("BALANCE") => "transaction",
        Symbol("COLLATERAL") => "transfer"
    );
    return safeString(types, type_var, type_var)

end
function getCurrencyFromChaincode(self::Woo, networkizedCode, currency)
    if functions.ccxtruthy(currency != nothing)
            return currency
    else
        parts = split(networkizedCode, "_");
        partsLength = length(parts);
        firstPart = safeString(parts, 0);
        currencyId = safeString(parts, 1, firstPart);
        if functions.ccxtruthy(functions.ccxt_gt(partsLength, 2))
            currencyId += string("_", safeString(parts, 2));
        end
        currency = self.safeCurrency(currencyId);
    end
    return currency

end
function fetchDeposits(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("tokenSide") => "DEPOSIT"
    );
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, extend(request, params)))

end
function fetchWithdrawals(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("tokenSide") => "WITHDRAW"
    );
    return Base.fetch(self.fetchDepositsWithdrawals(code, since, limit, extend(request, params)))

end
function fetchDepositsWithdrawals(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "BALANCE"
    );
    currencyRows = Base.fetch(self.getAssetHistoryRows(code, since, limit, extend(request, params)));
    currency = safeValue(currencyRows, 0);
    rows = self.safeList(currencyRows, 1, []);
    return self.parseTransactions(rows, currency, since, limit, params)

end
function parseTransaction(self::Woo, transaction, currency=nothing)
    networkizedCode = safeString(transaction, "token");
    currencyDefined = self.getCurrencyFromChaincode(networkizedCode, currency);
    code = get(currencyDefined, Symbol("code"), nothing);
    movementDirection = safeStringLowerN(transaction, ["token_side", "tokenSide", "type"]);
    if functions.ccxtruthy(movementDirection == "withdraw")
        movementDirection = "withdrawal";
    end
    fee = self.parseTokenAndFeeTemp(transaction, ["fee_token", "feeToken"], ["fee_amount", "feeAmount"]);
    addressTo = safeStringN(transaction, ["target_address", "targetAddress", "addressTo"]);
    addressFrom = safeString2(transaction, "source_address", "sourceAddress");
    timestamp = safeTimestampN(transaction, ["created_time", "createdTime"], safeInteger(transaction, "timestamp"));
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeStringN(transaction, ["id", "withdraw_id", "withdrawId"]),
    Symbol("txid") => safeString2(transaction, "tx_id", "txId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => safeString2(transaction, "extra", "tag"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => movementDirection,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => safeTimestamp2(transaction, "updated_time", "updatedTime"),
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee,
    Symbol("network") => self.networkIdToCode(safeString(transaction, "network"), code)
)

end
function parseTransactionStatus(self::Woo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "pending",
        Symbol("CONFIRMING") => "pending",
        Symbol("PROCESSING") => "pending",
        Symbol("COMPLETED") => "ok",
        Symbol("CANCELED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function transfer(self::Woo, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("token") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.parseToNumeric(amount),
        Symbol("from") => Dict{Symbol, Any}(
            Symbol("applicationId") => fromAccount
        ),
        Symbol("to") => Dict{Symbol, Any}(
            Symbol("applicationId") => toAccount
        )
    );
    response = Base.fetch(self.v3PrivatePostAssetTransfer(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    data[Symbol("timestamp")] = safeInteger(response, "timestamp");
    data[Symbol("token")] = get(currency, Symbol("id"), nothing);
    data[Symbol("status")] = "ok";
    transfer = self.parseTransfer(data, currency);
    transferOptions = self.safeDict(self.options, "transfer", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("amount")] = amount;
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
    end
    return transfer

end
function fetchTransfers(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.v3PrivateGetAssetTransferHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseTransfers(rows, currency, since, limit, params)

end
function parseTransfer(self::Woo, transfer, currency=nothing)
    code = self.safeCurrencyCode(safeString(transfer, "token"), currency);
    timestamp = safeTimestamp2(transfer, "createdTime", "timestamp");
    success = self.safeBool(transfer, "success");
    status = nothing;
    if functions.ccxtruthy(success != nothing)
        status = functions.ccxtruthy(success) ? "ok" : "failed";
    end
    fromAccount = self.safeDict(transfer, "from", Dict{Symbol, Any}());
    toAccount = self.safeDict(transfer, "to", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeString(fromAccount, "applicationId"),
    Symbol("toAccount") => safeString(toAccount, "applicationId"),
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status", status)),
    Symbol("info") => transfer
)

end
function parseTransferStatus(self::Woo, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "pending",
        Symbol("CONFIRMING") => "pending",
        Symbol("PROCESSING") => "pending",
        Symbol("COMPLETED") => "ok",
        Symbol("CANCELED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function withdraw(self::Woo, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("extra")] = tag;
    end
    network = safeString(params, "network");
    if functions.ccxtruthy(network == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw() requires a network parameter for ", code)));
    end
    params = omit(params, "network");
    request[Symbol("token")] = get(currency, Symbol("id"), nothing);
    request[Symbol("network")] = self.networkCodeToId(network, get(currency, Symbol("code"), nothing));
    response = Base.fetch(self.v3PrivatePostAssetWalletWithdraw(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transactionData = extend(data, Dict{Symbol, Any}(
        Symbol("id") => safeString(data, "withdrawId"),
        Symbol("timestamp") => safeInteger(response, "timestamp"),
        Symbol("currency") => code,
        Symbol("amount") => amount,
        Symbol("addressTo") => address,
        Symbol("tag") => tag,
        Symbol("network") => network,
        Symbol("type") => "withdrawal",
        Symbol("status") => "pending"
    ));
    return self.parseTransaction(transactionData, currency)

end
function repayMargin(self::Woo, code, amount, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("token") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.v1PrivatePostInterestRepay(extend(request, params)));
    transaction = self.parseMarginLoan(response, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function parseMarginLoan(self::Woo, info, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("symbol") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function nonce(self::Woo, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Woo, path, section="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    version = get(section, 1, nothing);
    access = get(section, 2, nothing);
    pathWithParams = self.implodeParams(path, params);
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(access), nothing));
    url += string("/", version, "/");
    params = omit(params, self.extractParams(path));
    params = keysort(params);
    if functions.ccxtruthy(access == "public")
        url += string(access, "/", pathWithParams);
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    elseif functions.ccxtruthy(access == "pub")
        url += pathWithParams;
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        self.checkRequiredCredentials();
        if functions.ccxtruthy(@functions.ccxt_and(method == "POST", (@functions.ccxt_or(path == "trade/algoOrder", path == "trade/order"))))
            isSandboxMode = self.safeBool(self.options, "sandboxMode", false);
            if functions.ccxtruthy(!functions.ccxtruthy(isSandboxMode))
                applicationId = "bc830de7-50f3-460b-9ee0-f430f83f9dad";
                brokerId = safeString(self.options, "brokerId", applicationId);
                isTrigger = findfirst("algo", path) !== nothing;
                if functions.ccxtruthy(isTrigger)
                    params[Symbol("brokerId")] = brokerId;
                else
                    params[Symbol("broker_id")] = brokerId;
                end
            end
            params = keysort(params);
        end
        auth = "";
        ts = string(self.nonce());
        url += pathWithParams;
        headers = Dict{Symbol, Any}(
            Symbol("x-api-key") => self.apiKey,
            Symbol("x-api-timestamp") => ts
        );
        if functions.ccxtruthy(version == "v3")
            auth = string(ts, method, "/", version, "/", pathWithParams);
            if functions.ccxtruthy(@functions.ccxt_or(method == "POST", method == "PUT"))
                body = json(params);
                auth += body;
                headers[Symbol("content-type")] = "application/json";
            else
                if functions.ccxtruthy(length(objectKeys(params)))
                    query = self.urlencode(params);
                    url += string("?", query);
                    auth += string("?", query);
                end
            end
        else
            auth = self.urlencode(params);
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(method == "POST", method == "PUT"), method == "DELETE"))
                body = auth;
            else
                if functions.ccxtruthy(length(objectKeys(params)))
                    url += string("?", auth);
                end
            end
            auth += string("|", ts);
            headers[Symbol("content-type")] = "application/x-www-form-urlencoded";
        end
        headers[Symbol("x-api-signature")] = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Woo, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    success = self.safeBool(response, "success");
    errorCode = safeString(response, "code");
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        feedback = string(self.id, " ", json(response));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    end
    return nothing

end
function parseIncome(self::Woo, income, market=nothing)
    marketId = safeString(income, "symbol");
    symbol = self.safeSymbol(marketId, market);
    amount = safeString(income, "fundingFee");
    code = self.safeCurrencyCode("USD");
    id = safeString(income, "id");
    timestamp = safeInteger(income, "updatedTime");
    rate = self.safeNumber(income, "fundingRate");
    paymentType = safeString(income, "paymentType");
    amount = functions.ccxtruthy((paymentType == "Pay")) ? stringNeg(amount) : amount;
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => id,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("rate") => rate
)

end
function fetchFundingHistory(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 500);
    end
    response = Base.fetch(self.v3PrivateGetFuturesFundingFeeHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseIncomes(rows, market, since, limit)

end
function parseFundingRate(self::Woo, fundingRate, market=nothing)
    symbol = safeString(fundingRate, "symbol");
    market = self.market(symbol);
    nextFundingTimestamp = safeInteger2(fundingRate, "nextFundingTime", "fundingTs");
    estFundingRateTimestamp = safeInteger(fundingRate, "estFundingRateTimestamp");
    lastFundingRateTimestamp = safeInteger(fundingRate, "lastFundingRateTimestamp");
    intervalString = safeString(fundingRate, "estFundingIntervalHours");
    interval = nothing;
    if functions.ccxtruthy(intervalString != nothing)
        interval = string(intervalString, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => fundingRate,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.parseNumber("0"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => estFundingRateTimestamp,
    Symbol("datetime") => self.iso8601(estFundingRateTimestamp),
    Symbol("fundingRate") => self.safeNumber2(fundingRate, "estFundingRate", "fundingRate"),
    Symbol("fundingTimestamp") => nextFundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => self.safeNumber(fundingRate, "lastFundingRate"),
    Symbol("previousFundingTimestamp") => lastFundingRateTimestamp,
    Symbol("previousFundingDatetime") => self.iso8601(lastFundingRateTimestamp),
    Symbol("interval") => interval
)

end
function fetchFundingInterval(self::Woo, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function fetchFundingRate(self::Woo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v3PublicGetFundingRate(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    first_var = self.safeDict(rows, 0, Dict{Symbol, Any}());
    return self.parseFundingRate(first_var, market)

end
function fetchFundingRates(self::Woo, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.v3PublicGetFundingRate(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseFundingRates(rows, symbols)

end
function fetchFundingRateHistory(self::Woo, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingRateHistory", symbol, since, limit, params, "page", 25))
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.v3PublicGetFundingRateHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        entry = get(rows, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        timestamp = safeInteger(entry, "fundingRateTimestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(marketId),
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function setPositionMode(self::Woo, hedged, symbol=nothing, params=Dict())
    hedgeMode = nothing;
    if functions.ccxtruthy(hedged)
        hedgeMode = "HEDGE_MODE";
    else
        hedgeMode = "ONE_WAY";
    end
    request = Dict{Symbol, Any}(
        Symbol("positionMode") => hedgeMode
    );
    response = Base.fetch(self.v3PrivatePutFuturesPositionMode(extend(request, params)));
    return response

end
function fetchLeverage(self::Woo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.v3PrivateGetAccountInfo(params));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchLeverage", params, "cross");
        request[Symbol("marginMode")] = self.encodeMarginMode(marginMode);
        response = Base.fetch(self.v3PrivateGetFuturesLeverage(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchLeverage() is not supported for ", get(market, Symbol("type"), nothing), " markets")));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Woo, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    market = self.safeMarket(marketId, market);
    marginMode = safeStringLower(leverage, "marginMode");
    spotLeverage = safeInteger(leverage, "leverage");
    if functions.ccxtruthy(spotLeverage == 0)
        spotLeverage = nothing;
    end
    longLeverage = spotLeverage;
    shortLeverage = spotLeverage;
    details = self.safeList(leverage, "details", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
        position = self.safeDict(details, i, Dict{Symbol, Any}());
        positionLeverage = safeInteger(position, "leverage");
        side = safeString(position, "positionSide");
        if functions.ccxtruthy(side == "BOTH")
            longLeverage = positionLeverage;
            shortLeverage = positionLeverage;
        elseif functions.ccxtruthy(side == "LONG")
            longLeverage = positionLeverage;
        else
            if functions.ccxtruthy(side == "SHORT")
                shortLeverage = positionLeverage;
            end

        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
function setLeverage(self::Woo, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(@functions.ccxt_or((symbol == nothing), self.safeBool(market, "spot")))
            return Base.fetch(self.v3PrivatePostSpotMarginLeverage(extend(request, params)))
    elseif functions.ccxtruthy(self.safeBool(market, "swap"))
        request[Symbol("symbol")] = safeString(market, "id");
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params, "cross");
        request[Symbol("marginMode")] = self.encodeMarginMode(marginMode);
        return Base.fetch(self.v3PrivatePutFuturesLeverage(extend(request, params)))
    else
        throw(NotSupported(string(self.id, " fetchLeverage() is not supported for ", safeString(market, "type"), " markets")));
    end

end
function addMargin(self::Woo, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "ADD", params))

end
function reduceMargin(self::Woo, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "REDUCE", params))

end
function modifyMarginHelper(self::Woo, symbol, amount, type_var, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("adjust_token") => "USDT",
        Symbol("adjust_amount") => amount,
        Symbol("action") => type_var
    );
    return Base.fetch(self.v1PrivatePostClientIsolatedMargin(extend(request, params)))

end
function fetchPosition(self::Woo, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v3PrivateGetFuturesPositions(extend(request, params)));
    result = self.safeDict(response, "data", Dict{Symbol, Any}());
    positions = self.safeList(result, "positions", []);
    first_var = self.safeDict(positions, 0, Dict{Symbol, Any}());
    return self.parsePosition(first_var, market)

end
function fetchPositions(self::Woo, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.v3PrivateGetFuturesPositions(extend(request, params)));
    result = self.safeDict(response, "data", Dict{Symbol, Any}());
    positions = self.safeList(result, "positions", []);
    return self.parsePositions(positions, symbols)

end
function parsePosition(self::Woo, position, market=nothing)
    contract = safeString(position, "symbol");
    market = self.safeMarket(contract, market);
    size_var = safeString(position, "holding");
    side = nothing;
    if functions.ccxtruthy(stringGt(size_var, "0"))
        side = "long";
    else
        side = "short";
    end
    contractSize = safeString(market, "contractSize");
    markPrice = safeString2(position, "markPrice", "mark_price");
    timestampString = safeString(position, "timestamp");
    timestamp = nothing;
    if functions.ccxtruthy(timestampString != nothing)
        if functions.ccxtruthy(findfirst(".", timestampString) !== nothing)
            timestamp = safeTimestamp(position, "timestamp");
        else
            timestamp = safeInteger(position, "timestamp");
        end
    end
    entryPrice = safeString2(position, "averageOpenPrice", "average_open_price");
    priceDifference = stringSub(markPrice, entryPrice);
    unrealisedPnl = stringMul(priceDifference, size_var);
    size_var = stringAbs(size_var);
    notional = stringMul(size_var, markPrice);
    positionSide = safeString(position, "positionSide");
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
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber2(position, "estLiqPrice", "est_liq_price"),
    Symbol("markPrice") => self.parseNumber(markPrice),
    Symbol("lastPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginMode") => safeStringLower2(position, "marginMode", "margin_mode"),
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("hedged") => positionSide != "BOTH",
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchConvertQuote(self::Woo, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("sellToken") => uppercase(fromCode),
        Symbol("buyToken") => uppercase(toCode),
        Symbol("sellQuantity") => numberToString(amount)
    );
    response = Base.fetch(self.v3PrivateGetConvertRfq(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "sellToken", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(data, "buyToken", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(data, fromCurrency, toCurrency)

end
function createConvertTrade(self::Woo, id, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("quoteId") => id
    );
    response = Base.fetch(self.v3PrivatePostConvertRft(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseConversion(data)

end
function fetchConvertTrade(self::Woo, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("quoteId") => id
    );
    response = Base.fetch(self.v3PrivateGetConvertTrade(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "sellAsset");
    toCurrencyId = safeString(data, "buyAsset");
    fromCurrency = nothing;
    toCurrency = nothing;
    if functions.ccxtruthy(fromCurrencyId != nothing)
        fromCurrency = self.currency(fromCurrencyId);
    end
    if functions.ccxtruthy(toCurrencyId != nothing)
        toCurrency = self.currency(toCurrencyId);
    end
    return self.parseConversion(data, fromCurrency, toCurrency)

end
function fetchConvertTradeHistory(self::Woo, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.v3PrivateGetConvertTrades(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "tradeVos", []);
    return self.parseConversions(rows, code, "sellAsset", "buyAsset", since, limit)

end
function parseConversion(self::Woo, conversion, fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeInteger2(conversion, "expireTimestamp", "createdTime");
    fromCurr = safeString2(conversion, "sellToken", "buyAsset");
    fromCode = self.safeCurrencyCode(fromCurr, fromCurrency);
    to = safeString2(conversion, "buyToken", "sellAsset");
    toCode = self.safeCurrencyCode(to, toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(conversion, "quoteId"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber2(conversion, "sellQuantity", "sellAmount"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber2(conversion, "buyQuantity", "buyAmount"),
    Symbol("price") => self.safeNumber(conversion, "buyPrice"),
    Symbol("fee") => nothing
)

end
function fetchConvertCurrencies(self::Woo, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetConvertAssetInfo(params));
    result = Dict{Symbol, Any}();
    data = self.safeList(response, "rows", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        id = safeString(entry, "token");
        code = self.safeCurrencyCode(id);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("info") => entry,
                Symbol("id") => id,
                Symbol("code") => code,
                Symbol("networks") => nothing,
                Symbol("type") => nothing,
                Symbol("name") => nothing,
                Symbol("active") => nothing,
                Symbol("deposit") => nothing,
                Symbol("withdraw") => nothing,
                Symbol("fee") => nothing,
                Symbol("precision") => self.safeNumber(entry, "tick"),
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
                Symbol("created") => safeTimestamp(entry, "createdTime")
            );
        end
        i += 1
    end
    return result

end
function fetchPositionsADLRank(self::Woo, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.v3PrivateGetFuturesPositions(extend(request, params)));
    result = self.safeDict(response, "data", Dict{Symbol, Any}());
    positions = self.safeList(result, "positions", []);
    return self.parseADLRanks(positions, symbols)

end
function parseADLRank(self::Woo, info, market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = safeInteger(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("rank") => self.safeNumber(info, "adlQuantile"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function defaultNetworkCodeForCurrency(self::Woo, code)
    currencyItem = self.currency(code);
    networks = get(currencyItem, Symbol("networks"), nothing);
    networkKeys = objectKeys(networks);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(networkKeys)))
        network = get(networkKeys, i + 1, nothing);
        if functions.ccxtruthy(network == "ETH")
                return network
        end
        i += 1
    end
    return safeValue(networkKeys, 0)

end
function setSandboxMode(self::Woo, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Woo, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PubGetHistKline(self::Woo, params=Dict(), context=Dict())
    return request(self, "hist/kline", ["v1", "pub"], "GET", params, nothing, nothing, Dict())
end

function v1PubGetHistTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "hist/trades", ["v1", "pub"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "info", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetInfoSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "info/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetSystemInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "system_info", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetMarketTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "market_trades", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetToken(self::Woo, params=Dict(), context=Dict())
    return request(self, "token", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetTokenNetwork(self::Woo, params=Dict(), context=Dict())
    return request(self, "token_network", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetFundingRates(self::Woo, params=Dict(), context=Dict())
    return request(self, "funding_rates", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetFundingRateSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "funding_rate/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetFundingRateHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "funding_rate_history", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetFutures(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetFuturesSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetOrderbookSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "orderbook/{symbol}", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PublicGetKline(self::Woo, params=Dict(), context=Dict())
    return request(self, "kline", ["v1", "public"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientToken(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/token", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetOrderOid(self::Woo, params=Dict(), context=Dict())
    return request(self, "order/{oid}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientOrderClientOrderId(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/order/{client_order_id}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientTradeTid(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/trade/{tid}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetOrderOidTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "order/{oid}/trades", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/trades", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientHistTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/hist_trades", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetStakingYieldHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "staking/yield_history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientHolding(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/holding", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetAssetDeposit(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/deposit", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetAssetHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetSubAccountAll(self::Woo, params=Dict(), context=Dict())
    return request(self, "sub_account/all", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetSubAccountAssets(self::Woo, params=Dict(), context=Dict())
    return request(self, "sub_account/assets", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetSubAccountAssetDetail(self::Woo, params=Dict(), context=Dict())
    return request(self, "sub_account/asset_detail", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetSubAccountIpRestriction(self::Woo, params=Dict(), context=Dict())
    return request(self, "sub_account/ip_restriction", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetAssetMainSubTransferHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/main_sub_transfer_history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetTokenInterest(self::Woo, params=Dict(), context=Dict())
    return request(self, "token_interest", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetTokenInterestToken(self::Woo, params=Dict(), context=Dict())
    return request(self, "token_interest/{token}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetInterestHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "interest/history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetInterestRepay(self::Woo, params=Dict(), context=Dict())
    return request(self, "interest/repay", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetFundingFeeHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "funding_fee/history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPositions(self::Woo, params=Dict(), context=Dict())
    return request(self, "positions", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetPositionSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "position/{symbol}", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientTransactionHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/transaction_history", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivateGetClientFuturesLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/futures_leverage", ["v1", "private"], "GET", params, nothing, nothing, Dict())
end

function v1PrivatePostOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "order", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostOrderCancelAllAfter(self::Woo, params=Dict(), context=Dict())
    return request(self, "order/cancel_all_after", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostAssetLtv(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/ltv", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostAssetInternalWithdraw(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/internal_withdraw", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostInterestRepay(self::Woo, params=Dict(), context=Dict())
    return request(self, "interest/repay", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostClientAccountMode(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/account_mode", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostClientPositionMode(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/position_mode", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostClientLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/leverage", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostClientFuturesLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/futures_leverage", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivatePostClientIsolatedMargin(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/isolated_margin", ["v1", "private"], "POST", params, nothing, nothing, Dict())
end

function v1PrivateDeleteOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v1PrivateDeleteClientOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/order", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v1PrivateDeleteOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "orders", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v1PrivateDeleteAssetWithdraw(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/withdraw", ["v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v2PrivateGetClientHolding(self::Woo, params=Dict(), context=Dict())
    return request(self, "client/holding", ["v2", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetSystemInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "systemInfo", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetInstruments(self::Woo, params=Dict(), context=Dict())
    return request(self, "instruments", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetToken(self::Woo, params=Dict(), context=Dict())
    return request(self, "token", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetTokenNetwork(self::Woo, params=Dict(), context=Dict())
    return request(self, "tokenNetwork", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetTokenInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "tokenInfo", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetMarketTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "marketTrades", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetMarketTradesHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "marketTradesHistory", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetOrderbook(self::Woo, params=Dict(), context=Dict())
    return request(self, "orderbook", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetKline(self::Woo, params=Dict(), context=Dict())
    return request(self, "kline", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetKlineHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "klineHistory", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetFutures(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetFundingRate(self::Woo, params=Dict(), context=Dict())
    return request(self, "fundingRate", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetFundingRateHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "fundingRateHistory", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PublicGetInsuranceFund(self::Woo, params=Dict(), context=Dict())
    return request(self, "insuranceFund", ["v3", "public"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/order", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/orders", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeAlgoOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrder", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeAlgoOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrders", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeTransaction(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/transaction", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeTransactionHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/transactionHistory", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetTradeTradingFee(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/tradingFee", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/info", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountTokenConfig(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/tokenConfig", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountSymbolConfig(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/symbolConfig", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountSubAccountsAll(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/subAccounts/all", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountReferralSummary(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/referral/summary", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountReferralRewardHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/referral/rewardHistory", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAccountCredentials(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/credentials", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetBalances(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/balances", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetTokenHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/token/history", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetTransferHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/transfer/history", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetWalletHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/wallet/history", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetWalletDeposit(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/wallet/deposit", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAssetStakingYieldHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/staking/yieldHistory", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetFuturesPositions(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/positions", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetFuturesLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/leverage", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetFuturesDefaultMarginMode(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/defaultMarginMode", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetFuturesFundingFeeHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/fundingFee/history", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetSpotMarginInterestRate(self::Woo, params=Dict(), context=Dict())
    return request(self, "spotMargin/interestRate", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetSpotMarginInterestHistory(self::Woo, params=Dict(), context=Dict())
    return request(self, "spotMargin/interestHistory", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetSpotMarginMaxMargin(self::Woo, params=Dict(), context=Dict())
    return request(self, "spotMargin/maxMargin", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAlgoOrderOid(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/order/{oid}", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetAlgoOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/orders", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetPositions(self::Woo, params=Dict(), context=Dict())
    return request(self, "positions", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetBuypower(self::Woo, params=Dict(), context=Dict())
    return request(self, "buypower", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetConvertExchangeInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/exchangeInfo", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetConvertAssetInfo(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/assetInfo", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetConvertRfq(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/rfq", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetConvertTrade(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/trade", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivateGetConvertTrades(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/trades", ["v3", "private"], "GET", params, nothing, nothing, Dict())
end

function v3PrivatePostTradeOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/order", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostTradeAlgoOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrder", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostTradeCancelAllAfter(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/cancelAllAfter", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostAccountTradingMode(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/tradingMode", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostAccountListenKey(self::Woo, params=Dict(), context=Dict())
    return request(self, "account/listenKey", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostAssetTransfer(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/transfer", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostAssetWalletWithdraw(self::Woo, params=Dict(), context=Dict())
    return request(self, "asset/wallet/withdraw", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostSpotMarginLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "spotMargin/leverage", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostSpotMarginInterestRepay(self::Woo, params=Dict(), context=Dict())
    return request(self, "spotMargin/interestRepay", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostAlgoOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/order", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePostConvertRft(self::Woo, params=Dict(), context=Dict())
    return request(self, "convert/rft", ["v3", "private"], "POST", params, nothing, nothing, Dict())
end

function v3PrivatePutTradeOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/order", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutTradeAlgoOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrder", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutFuturesLeverage(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/leverage", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutFuturesPositionMode(self::Woo, params=Dict(), context=Dict())
    return request(self, "futures/positionMode", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutOrderOid(self::Woo, params=Dict(), context=Dict())
    return request(self, "order/{oid}", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutOrderClientClientOrderId(self::Woo, params=Dict(), context=Dict())
    return request(self, "order/client/{client_order_id}", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutAlgoOrderOid(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/order/{oid}", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivatePutAlgoOrderClientClientOrderId(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/order/client/{client_order_id}", ["v3", "private"], "PUT", params, nothing, nothing, Dict())
end

function v3PrivateDeleteTradeOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/order", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteTradeOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/orders", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteTradeAlgoOrder(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrder", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteTradeAlgoOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/algoOrders", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteTradeAllOrders(self::Woo, params=Dict(), context=Dict())
    return request(self, "trade/allOrders", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteAlgoOrderOrderId(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/order/{order_id}", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteAlgoOrdersPending(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/orders/pending", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteAlgoOrdersPendingSymbol(self::Woo, params=Dict(), context=Dict())
    return request(self, "algo/orders/pending/{symbol}", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function v3PrivateDeleteOrdersPending(self::Woo, params=Dict(), context=Dict())
    return request(self, "orders/pending", ["v3", "private"], "DELETE", params, nothing, nothing, Dict())
end

function Woo(; kwargs...)
    inst = Woo(Exchange(), describe, fetchStatus, fetchTime, fetchMarkets, parseMarket, fetchTrades, parseTrade, parseTokenAndFeeTemp, parseTradingFee, fetchTradingFee, fetchTradingFees, fetchCurrencies, parseCurrency, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createTrailingAmountOrder, createTrailingPercentOrder, createOrder, encodeMarginMode, editOrder, cancelOrder, cancelAllOrders, cancelAllOrdersAfter, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, parseTimeInForce, parseOrder, parseOrderStatus, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchOrderTrades, fetchMyTrades, fetchAccounts, parseAccount, fetchBalance, parseBalance, fetchDepositAddress, getDedicatedNetworkId, parseDepositAddress, getAssetHistoryRows, fetchLedger, parseLedgerEntry, parseLedgerEntryType, getCurrencyFromChaincode, fetchDeposits, fetchWithdrawals, fetchDepositsWithdrawals, parseTransaction, parseTransactionStatus, transfer, fetchTransfers, parseTransfer, parseTransferStatus, withdraw, repayMargin, parseMarginLoan, nonce, sign, handleErrors, parseIncome, fetchFundingHistory, parseFundingRate, fetchFundingInterval, fetchFundingRate, fetchFundingRates, fetchFundingRateHistory, setPositionMode, fetchLeverage, parseLeverage, setLeverage, addMargin, reduceMargin, modifyMarginHelper, fetchPosition, fetchPositions, parsePosition, fetchConvertQuote, createConvertTrade, fetchConvertTrade, fetchConvertTradeHistory, parseConversion, fetchConvertCurrencies, fetchPositionsADLRank, parseADLRank, defaultNetworkCodeForCurrency, setSandboxMode, v1PubGetHistKline, v1PubGetHistTrades, v1PublicGetInfo, v1PublicGetInfoSymbol, v1PublicGetSystemInfo, v1PublicGetMarketTrades, v1PublicGetToken, v1PublicGetTokenNetwork, v1PublicGetFundingRates, v1PublicGetFundingRateSymbol, v1PublicGetFundingRateHistory, v1PublicGetFutures, v1PublicGetFuturesSymbol, v1PublicGetOrderbookSymbol, v1PublicGetKline, v1PrivateGetClientToken, v1PrivateGetOrderOid, v1PrivateGetClientOrderClientOrderId, v1PrivateGetOrders, v1PrivateGetClientTradeTid, v1PrivateGetOrderOidTrades, v1PrivateGetClientTrades, v1PrivateGetClientHistTrades, v1PrivateGetStakingYieldHistory, v1PrivateGetClientHolding, v1PrivateGetAssetDeposit, v1PrivateGetAssetHistory, v1PrivateGetSubAccountAll, v1PrivateGetSubAccountAssets, v1PrivateGetSubAccountAssetDetail, v1PrivateGetSubAccountIpRestriction, v1PrivateGetAssetMainSubTransferHistory, v1PrivateGetTokenInterest, v1PrivateGetTokenInterestToken, v1PrivateGetInterestHistory, v1PrivateGetInterestRepay, v1PrivateGetFundingFeeHistory, v1PrivateGetPositions, v1PrivateGetPositionSymbol, v1PrivateGetClientTransactionHistory, v1PrivateGetClientFuturesLeverage, v1PrivatePostOrder, v1PrivatePostOrderCancelAllAfter, v1PrivatePostAssetLtv, v1PrivatePostAssetInternalWithdraw, v1PrivatePostInterestRepay, v1PrivatePostClientAccountMode, v1PrivatePostClientPositionMode, v1PrivatePostClientLeverage, v1PrivatePostClientFuturesLeverage, v1PrivatePostClientIsolatedMargin, v1PrivateDeleteOrder, v1PrivateDeleteClientOrder, v1PrivateDeleteOrders, v1PrivateDeleteAssetWithdraw, v2PrivateGetClientHolding, v3PublicGetSystemInfo, v3PublicGetInstruments, v3PublicGetToken, v3PublicGetTokenNetwork, v3PublicGetTokenInfo, v3PublicGetMarketTrades, v3PublicGetMarketTradesHistory, v3PublicGetOrderbook, v3PublicGetKline, v3PublicGetKlineHistory, v3PublicGetFutures, v3PublicGetFundingRate, v3PublicGetFundingRateHistory, v3PublicGetInsuranceFund, v3PrivateGetTradeOrder, v3PrivateGetTradeOrders, v3PrivateGetTradeAlgoOrder, v3PrivateGetTradeAlgoOrders, v3PrivateGetTradeTransaction, v3PrivateGetTradeTransactionHistory, v3PrivateGetTradeTradingFee, v3PrivateGetAccountInfo, v3PrivateGetAccountTokenConfig, v3PrivateGetAccountSymbolConfig, v3PrivateGetAccountSubAccountsAll, v3PrivateGetAccountReferralSummary, v3PrivateGetAccountReferralRewardHistory, v3PrivateGetAccountCredentials, v3PrivateGetAssetBalances, v3PrivateGetAssetTokenHistory, v3PrivateGetAssetTransferHistory, v3PrivateGetAssetWalletHistory, v3PrivateGetAssetWalletDeposit, v3PrivateGetAssetStakingYieldHistory, v3PrivateGetFuturesPositions, v3PrivateGetFuturesLeverage, v3PrivateGetFuturesDefaultMarginMode, v3PrivateGetFuturesFundingFeeHistory, v3PrivateGetSpotMarginInterestRate, v3PrivateGetSpotMarginInterestHistory, v3PrivateGetSpotMarginMaxMargin, v3PrivateGetAlgoOrderOid, v3PrivateGetAlgoOrders, v3PrivateGetPositions, v3PrivateGetBuypower, v3PrivateGetConvertExchangeInfo, v3PrivateGetConvertAssetInfo, v3PrivateGetConvertRfq, v3PrivateGetConvertTrade, v3PrivateGetConvertTrades, v3PrivatePostTradeOrder, v3PrivatePostTradeAlgoOrder, v3PrivatePostTradeCancelAllAfter, v3PrivatePostAccountTradingMode, v3PrivatePostAccountListenKey, v3PrivatePostAssetTransfer, v3PrivatePostAssetWalletWithdraw, v3PrivatePostSpotMarginLeverage, v3PrivatePostSpotMarginInterestRepay, v3PrivatePostAlgoOrder, v3PrivatePostConvertRft, v3PrivatePutTradeOrder, v3PrivatePutTradeAlgoOrder, v3PrivatePutFuturesLeverage, v3PrivatePutFuturesPositionMode, v3PrivatePutOrderOid, v3PrivatePutOrderClientClientOrderId, v3PrivatePutAlgoOrderOid, v3PrivatePutAlgoOrderClientClientOrderId, v3PrivateDeleteTradeOrder, v3PrivateDeleteTradeOrders, v3PrivateDeleteTradeAlgoOrder, v3PrivateDeleteTradeAlgoOrders, v3PrivateDeleteTradeAllOrders, v3PrivateDeleteAlgoOrderOrderId, v3PrivateDeleteAlgoOrdersPending, v3PrivateDeleteAlgoOrdersPendingSymbol, v3PrivateDeleteOrdersPending)
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
