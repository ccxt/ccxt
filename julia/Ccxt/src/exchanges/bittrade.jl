@kwdef mutable struct Bittrade <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchTradingLimits::Function = fetchTradingLimits
    fetchTradingLimitsById::Function = fetchTradingLimitsById
    parseTradingLimits::Function = parseTradingLimits
    costToPrecision::Function = costToPrecision
    fetchMarkets::Function = fetchMarkets
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchAccounts::Function = fetchAccounts
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrdersByStates::Function = fetchOrdersByStates
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrdersV1::Function = fetchOpenOrdersV1
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrdersV2::Function = fetchOpenOrdersV2
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    parseCancelOrders::Function = parseCancelOrders
    cancelAllOrders::Function = cancelAllOrders
    parseDepositAddress::Function = parseDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    withdraw::Function = withdraw
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    v2PublicGetReferenceCurrencies::Function = v2PublicGetReferenceCurrencies
    v2PublicGetMarketStatus::Function = v2PublicGetMarketStatus
    v2PrivateGetAccountLedger::Function = v2PrivateGetAccountLedger
    v2PrivateGetAccountWithdrawQuota::Function = v2PrivateGetAccountWithdrawQuota
    v2PrivateGetAccountWithdrawAddress::Function = v2PrivateGetAccountWithdrawAddress
    v2PrivateGetAccountDepositAddress::Function = v2PrivateGetAccountDepositAddress
    v2PrivateGetAccountRepayment::Function = v2PrivateGetAccountRepayment
    v2PrivateGetReferenceTransactFeeRate::Function = v2PrivateGetReferenceTransactFeeRate
    v2PrivateGetAccountAssetValuation::Function = v2PrivateGetAccountAssetValuation
    v2PrivateGetPointAccount::Function = v2PrivateGetPointAccount
    v2PrivateGetSubUserUserList::Function = v2PrivateGetSubUserUserList
    v2PrivateGetSubUserUserState::Function = v2PrivateGetSubUserUserState
    v2PrivateGetSubUserAccountList::Function = v2PrivateGetSubUserAccountList
    v2PrivateGetSubUserDepositAddress::Function = v2PrivateGetSubUserDepositAddress
    v2PrivateGetSubUserQueryDeposit::Function = v2PrivateGetSubUserQueryDeposit
    v2PrivateGetUserApiKey::Function = v2PrivateGetUserApiKey
    v2PrivateGetUserUid::Function = v2PrivateGetUserUid
    v2PrivateGetAlgoOrdersOpening::Function = v2PrivateGetAlgoOrdersOpening
    v2PrivateGetAlgoOrdersHistory::Function = v2PrivateGetAlgoOrdersHistory
    v2PrivateGetAlgoOrdersSpecific::Function = v2PrivateGetAlgoOrdersSpecific
    v2PrivateGetC2cOffers::Function = v2PrivateGetC2cOffers
    v2PrivateGetC2cOffer::Function = v2PrivateGetC2cOffer
    v2PrivateGetC2cTransactions::Function = v2PrivateGetC2cTransactions
    v2PrivateGetC2cRepayment::Function = v2PrivateGetC2cRepayment
    v2PrivateGetC2cAccount::Function = v2PrivateGetC2cAccount
    v2PrivateGetEtpReference::Function = v2PrivateGetEtpReference
    v2PrivateGetEtpTransactions::Function = v2PrivateGetEtpTransactions
    v2PrivateGetEtpTransaction::Function = v2PrivateGetEtpTransaction
    v2PrivateGetEtpRebalance::Function = v2PrivateGetEtpRebalance
    v2PrivateGetEtpLimit::Function = v2PrivateGetEtpLimit
    v2PrivatePostAccountTransfer::Function = v2PrivatePostAccountTransfer
    v2PrivatePostAccountRepayment::Function = v2PrivatePostAccountRepayment
    v2PrivatePostPointTransfer::Function = v2PrivatePostPointTransfer
    v2PrivatePostSubUserManagement::Function = v2PrivatePostSubUserManagement
    v2PrivatePostSubUserCreation::Function = v2PrivatePostSubUserCreation
    v2PrivatePostSubUserTradableMarket::Function = v2PrivatePostSubUserTradableMarket
    v2PrivatePostSubUserTransferability::Function = v2PrivatePostSubUserTransferability
    v2PrivatePostSubUserApiKeyGeneration::Function = v2PrivatePostSubUserApiKeyGeneration
    v2PrivatePostSubUserApiKeyModification::Function = v2PrivatePostSubUserApiKeyModification
    v2PrivatePostSubUserApiKeyDeletion::Function = v2PrivatePostSubUserApiKeyDeletion
    v2PrivatePostSubUserDeductMode::Function = v2PrivatePostSubUserDeductMode
    v2PrivatePostAlgoOrders::Function = v2PrivatePostAlgoOrders
    v2PrivatePostAlgoOrdersCancelAllAfter::Function = v2PrivatePostAlgoOrdersCancelAllAfter
    v2PrivatePostAlgoOrdersCancellation::Function = v2PrivatePostAlgoOrdersCancellation
    v2PrivatePostC2cOffer::Function = v2PrivatePostC2cOffer
    v2PrivatePostC2cCancellation::Function = v2PrivatePostC2cCancellation
    v2PrivatePostC2cCancelAll::Function = v2PrivatePostC2cCancelAll
    v2PrivatePostC2cRepayment::Function = v2PrivatePostC2cRepayment
    v2PrivatePostC2cTransfer::Function = v2PrivatePostC2cTransfer
    v2PrivatePostEtpCreation::Function = v2PrivatePostEtpCreation
    v2PrivatePostEtpRedemption::Function = v2PrivatePostEtpRedemption
    v2PrivatePostEtpTransactIdCancel::Function = v2PrivatePostEtpTransactIdCancel
    v2PrivatePostEtpBatchCancel::Function = v2PrivatePostEtpBatchCancel
    marketGetHistoryKline::Function = marketGetHistoryKline
    marketGetDetailMerged::Function = marketGetDetailMerged
    marketGetDepth::Function = marketGetDepth
    marketGetTrade::Function = marketGetTrade
    marketGetHistoryTrade::Function = marketGetHistoryTrade
    marketGetDetail::Function = marketGetDetail
    marketGetTickers::Function = marketGetTickers
    marketGetEtp::Function = marketGetEtp
    publicGetCommonSymbols::Function = publicGetCommonSymbols
    publicGetCommonCurrencys::Function = publicGetCommonCurrencys
    publicGetCommonTimestamp::Function = publicGetCommonTimestamp
    publicGetCommonExchange::Function = publicGetCommonExchange
    publicGetSettingsCurrencys::Function = publicGetSettingsCurrencys
    privateGetAccountAccounts::Function = privateGetAccountAccounts
    privateGetAccountAccountsIdBalance::Function = privateGetAccountAccountsIdBalance
    privateGetAccountAccountsSubUid::Function = privateGetAccountAccountsSubUid
    privateGetAccountHistory::Function = privateGetAccountHistory
    privateGetCrossMarginLoanInfo::Function = privateGetCrossMarginLoanInfo
    privateGetMarginLoanInfo::Function = privateGetMarginLoanInfo
    privateGetFeeFeeRateGet::Function = privateGetFeeFeeRateGet
    privateGetOrderOpenOrders::Function = privateGetOrderOpenOrders
    privateGetOrderOrders::Function = privateGetOrderOrders
    privateGetOrderOrdersId::Function = privateGetOrderOrdersId
    privateGetOrderOrdersIdMatchresults::Function = privateGetOrderOrdersIdMatchresults
    privateGetOrderOrdersGetClientOrder::Function = privateGetOrderOrdersGetClientOrder
    privateGetOrderHistory::Function = privateGetOrderHistory
    privateGetOrderMatchresults::Function = privateGetOrderMatchresults
    privateGetQueryDepositWithdraw::Function = privateGetQueryDepositWithdraw
    privateGetMarginLoanOrders::Function = privateGetMarginLoanOrders
    privateGetMarginAccountsBalance::Function = privateGetMarginAccountsBalance
    privateGetCrossMarginLoanOrders::Function = privateGetCrossMarginLoanOrders
    privateGetCrossMarginAccountsBalance::Function = privateGetCrossMarginAccountsBalance
    privateGetPointsActions::Function = privateGetPointsActions
    privateGetPointsOrders::Function = privateGetPointsOrders
    privateGetSubuserAggregateBalance::Function = privateGetSubuserAggregateBalance
    privateGetStableCoinExchangeRate::Function = privateGetStableCoinExchangeRate
    privateGetStableCoinQuote::Function = privateGetStableCoinQuote
    privatePostAccountTransfer::Function = privatePostAccountTransfer
    privatePostFuturesTransfer::Function = privatePostFuturesTransfer
    privatePostOrderBatchOrders::Function = privatePostOrderBatchOrders
    privatePostOrderOrdersPlace::Function = privatePostOrderOrdersPlace
    privatePostOrderOrdersSubmitCancelClientOrder::Function = privatePostOrderOrdersSubmitCancelClientOrder
    privatePostOrderOrdersBatchCancelOpenOrders::Function = privatePostOrderOrdersBatchCancelOpenOrders
    privatePostOrderOrdersIdSubmitcancel::Function = privatePostOrderOrdersIdSubmitcancel
    privatePostOrderOrdersBatchcancel::Function = privatePostOrderOrdersBatchcancel
    privatePostDwWithdrawApiCreate::Function = privatePostDwWithdrawApiCreate
    privatePostDwWithdrawVirtualIdCancel::Function = privatePostDwWithdrawVirtualIdCancel
    privatePostDwTransferInMargin::Function = privatePostDwTransferInMargin
    privatePostDwTransferOutMargin::Function = privatePostDwTransferOutMargin
    privatePostMarginOrders::Function = privatePostMarginOrders
    privatePostMarginOrdersIdRepay::Function = privatePostMarginOrdersIdRepay
    privatePostCrossMarginTransferIn::Function = privatePostCrossMarginTransferIn
    privatePostCrossMarginTransferOut::Function = privatePostCrossMarginTransferOut
    privatePostCrossMarginOrders::Function = privatePostCrossMarginOrders
    privatePostCrossMarginOrdersIdRepay::Function = privatePostCrossMarginOrdersIdRepay
    privatePostStableCoinExchange::Function = privatePostStableCoinExchange
    privatePostSubuserTransfer::Function = privatePostSubuserTransfer

end
function describe(self::Bittrade, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bittrade",
    Symbol("name") => "BitTrade",
    Symbol("countries") => ["JP"],
    Symbol("rateLimit") => 100,
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome39"), nothing),
    Symbol("certified") => false,
    Symbol("version") => "v1",
    Symbol("hostname") => "api-cloud.bittrade.co.jp",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingLimits") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "60min",
        Symbol("4h") => "4hour",
        Symbol("1d") => "1day",
        Symbol("1w") => "1week",
        Symbol("1M") => "1mon",
        Symbol("1y") => "1year"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/c5996ed2-0d56-42d8-ac40-7eaf8116dbae",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("market") => "https://{hostname}",
            Symbol("public") => "https://{hostname}",
            Symbol("private") => "https://{hostname}",
            Symbol("v2Public") => "https://{hostname}",
            Symbol("v2Private") => "https://{hostname}"
        ),
        Symbol("www") => "https://www.bittrade.co.jp",
        Symbol("referral") => "https://www.bittrade.co.jp/register/?invite_code=znnq3",
        Symbol("doc") => "https://api-doc.bittrade.co.jp",
        Symbol("fees") => "https://www.bittrade.co.jp/ja-jp/support/fee"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v2Public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("reference/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market-status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2Private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/ledger") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/withdraw/quota") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/withdraw/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/repayment") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("reference/transact-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/asset-valuation") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("point/account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("sub-user/user-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/user-state") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/account-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/query-deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/uid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders/opening") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders/specific") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/offers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/offer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/repayment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("etp/reference") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("etp/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("etp/transaction") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("etp/rebalance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("etp/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/repayment") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("point/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("sub-user/management") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/creation") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/tradable-market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/transferability") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/api-key-generation") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/api-key-modification") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/api-key-deletion") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-user/deduct-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders/cancel-all-after") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo-orders/cancellation") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/offer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/cancellation") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/repayment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("c2c/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("etp/creation") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("etp/redemption") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("etp/{transactId}/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("etp/batch-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 50
)
            )
        ),
        Symbol("market") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("history/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("detail/merged") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("history/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("etp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("common/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("common/currencys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("common/timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("common/exchange") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("settings/currencys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("account/accounts/{id}/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("account/accounts/{sub-uid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cross-margin/loan-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/loan-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fee/fee-rate/get") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders/{id}/matchresults") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders/getClientOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/matchresults") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("query/deposit-withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/loan-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("margin/accounts/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("cross-margin/loan-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cross-margin/accounts/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("points/actions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("points/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subuser/aggregate-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("stable-coin/exchange_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stable-coin/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders/place") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order/orders/submitCancelClientOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order/orders/batchCancelOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("order/orders/{id}/submitcancel") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order/orders/batchcancel") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("dw/withdraw/api/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dw/withdraw-virtual/{id}/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dw/transfer-in/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("dw/transfer-out/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/orders/{id}/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("cross-margin/transfer-in") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cross-margin/transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cross-margin/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cross-margin/orders/{id}/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("stable-coin/exchange") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("subuser/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002")
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 120,
                Symbol("untilDays") => 2,
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
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("contract is restricted of closing positions on API.  Please contact customer service") => OnMaintenance,
            Symbol("maintain") => OnMaintenance
        ),
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("bad-request") => BadRequest,
            Symbol("base-date-limit-error") => BadRequest,
            Symbol("api-not-support-temp-addr") => PermissionDenied,
            Symbol("timeout") => RequestTimeout,
            Symbol("gateway-internal-error") => ExchangeNotAvailable,
            Symbol("account-frozen-balance-insufficient-error") => InsufficientFunds,
            Symbol("invalid-amount") => InvalidOrder,
            Symbol("order-limitorder-amount-min-error") => InvalidOrder,
            Symbol("order-limitorder-amount-max-error") => InvalidOrder,
            Symbol("order-marketorder-amount-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-max-error") => InvalidOrder,
            Symbol("order-holding-limit-failed") => InvalidOrder,
            Symbol("order-orderprice-precision-error") => InvalidOrder,
            Symbol("order-etp-nav-price-max-error") => InvalidOrder,
            Symbol("order-orderstate-error") => OrderNotFound,
            Symbol("order-queryorder-invalid") => OrderNotFound,
            Symbol("order-update-error") => ExchangeNotAvailable,
            Symbol("api-signature-check-failed") => AuthenticationError,
            Symbol("api-signature-not-valid") => AuthenticationError,
            Symbol("base-record-invalid") => OrderNotFound,
            Symbol("base-symbol-trade-disabled") => BadSymbol,
            Symbol("base-symbol-error") => BadSymbol,
            Symbol("system-maintenance") => OnMaintenance,
            Symbol("invalid symbol") => BadSymbol,
            Symbol("symbol trade not open now") => BadSymbol,
            Symbol("invalid-address") => BadRequest,
            Symbol("base-currency-chain-error") => BadRequest,
            Symbol("dw-insufficient-balance") => InsufficientFunds
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultNetwork") => "ERC20",
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ETH") => "erc20",
            Symbol("TRX") => "trc20",
            Symbol("HRC20") => "hrc20",
            Symbol("HECO") => "hrc20",
            Symbol("HT") => "hrc20",
            Symbol("ALGO") => "algo"
        ),
        Symbol("fetchOrdersByStates") => Dict{Symbol, Any}(
            Symbol("method") => "private_get_order_orders"
        ),
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("method") => "fetch_open_orders_v1"
        ),
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => true,
            Symbol("method") => "privatePostOrderOrdersPlace"
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("method") => "publicGetCommonSymbols"
        ),
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetAccountAccountsIdBalance"
        ),
        Symbol("currencyToPrecisionRoundingMode") => TRUNCATE,
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("language") => "en-US"
        ),
        Symbol("broker") => Dict{Symbol, Any}(
            Symbol("id") => "AA03022abc"
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("GET") => "Themis",
        Symbol("GTC") => "Game.com",
        Symbol("HIT") => "HitChain",
        Symbol("PNT") => "Penta",
        Symbol("SBTC") => "Super Bitcoin",
        Symbol("BIFI") => "Bitcoin File"
    )
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Bittrade; params=Dict())
    response = Base.fetch(self.publicGetCommonTimestamp(params));
    return safeInteger(response, "data")

end
function fetchTradingLimits(self::Bittrade; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols == nothing)
        symbols = self.symbols;
    end
    if functions.ccxtruthy(symbols == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Base.fetch(self.fetchTradingLimitsById(self.marketId(symbol), params = params));
        i += 1
    end
    return result

end
function fetchTradingLimitsById(self::Bittrade, id; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("symbol") => id
    );
    response = Base.fetch(self.publicGetCommonExchange(extend(request, params)));
    return self.parseTradingLimits(safeValue(response, "data", Dict{Symbol, Any}()))

end
function parseTradingLimits(self::Bittrade, limits; symbol=nothing, params=Dict())
    return Dict{Symbol, Any}(
    Symbol("info") => limits,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(limits, "limit-order-must-greater-than"),
            Symbol("max") => self.safeNumber(limits, "limit-order-must-less-than")
        )
    )
)

end
function costToPrecision(self::Bittrade, symbol, cost)
    return decimalToPrecision(cost, TRUNCATE, get(get(self.market(symbol), Symbol("precision"), nothing), Symbol("cost"), nothing), self.precisionMode)

end
"""
retrieves data on all markets for huobijp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bittrade; params=Dict())
    method = self.handleOption("fetchMarkets", "method", defaultValue = "publicGetCommonSymbols");
    response = Base.fetch(getproperty(self, Symbol(method))(params));
    markets = safeValue(response, "data", []);
    numMarkets = length(markets);
    if functions.ccxtruthy(functions.ccxt_lt(numMarkets, 1))
        throw(NetworkError(string(self.id, " fetchMarkets() returned empty response: ", json(markets))));
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        baseId = safeString(market, "base-currency");
        quoteId = safeString(market, "quote-currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        state = safeString(market, "state");
        leverageRatio = safeString(market, "leverage-ratio", "1");
        superLeverageRatio = safeString(market, "super-margin-leverage-ratio", "1");
        margin = @functions.ccxt_or(stringGt(leverageRatio, "1"), stringGt(superLeverageRatio, "1"));
        fee = functions.ccxtruthy((base == "OMG")) ? self.parseNumber("0") : self.parseNumber("0.002");
        if functions.ccxtruthy(baseId == nothing)
            throw(ExchangeError(string(self.id, " fetchMarkets() missing baseId")));
        end
        if functions.ccxtruthy(quoteId == nothing)
            throw(ExchangeError(string(self.id, " fetchMarkets() missing quoteId")));
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => string(baseId, quoteId),
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => margin,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (state == "online"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => fee,
    Symbol("maker") => fee,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "price-precision"))),
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "amount-precision"))),
        Symbol("cost") => self.parseNumber(self.parsePrecision(precision = safeString(market, "value-precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.parseNumber(leverageRatio),
            Symbol("superMax") => self.parseNumber(superLeverageRatio)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min-order-amt"),
            Symbol("max") => self.safeNumber(market, "max-order-amt")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min-order-value"),
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
function parseTicker(self::Bittrade, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    timestamp = safeInteger(ticker, "ts");
    bid = nothing;
    bidVolume = nothing;
    ask = nothing;
    askVolume = nothing;
    if functions.ccxtruthy(ccxt_in("bid", ticker))
        if functions.ccxtruthy(functions.ccxt_isArray(get(ticker, Symbol("bid"), nothing)))
            bid = safeString(get(ticker, Symbol("bid"), nothing), 0);
            bidVolume = safeString(get(ticker, Symbol("bid"), nothing), 1);
        else
            bid = safeString(ticker, "bid");
            bidVolume = safeString(ticker, "bidSize");
        end
    end
    if functions.ccxtruthy(ccxt_in("ask", ticker))
        if functions.ccxtruthy(functions.ccxt_isArray(get(ticker, Symbol("ask"), nothing)))
            ask = safeString(get(ticker, Symbol("ask"), nothing), 0);
            askVolume = safeString(get(ticker, Symbol("ask"), nothing), 1);
        else
            ask = safeString(ticker, "ask");
            askVolume = safeString(ticker, "askSize");
        end
    end
    open = safeString(ticker, "open");
    close = safeString(ticker, "close");
    baseVolume = safeString(ticker, "amount");
    quoteVolume = safeString(ticker, "vol");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => close,
    Symbol("last") => close,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bittrade, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => "step0"
    );
    response = Base.fetch(self.marketGetDepth(extend(request, params)));
    if functions.ccxtruthy(ccxt_in("tick", response))
        if functions.ccxtruthy(!functions.ccxtruthy(get(response, Symbol("tick"), nothing)))
            throw(BadSymbol(string(self.id, " fetchOrderBook() returned empty response: ", json(response))));
        end
        tick = safeValue(response, "tick");
        timestamp = safeInteger(tick, "ts", safeInteger(response, "ts"));
        result = self.parseOrderBook(tick, symbol, timestamp = timestamp);
        result[Symbol("nonce")] = safeInteger(tick, "version");
            return result
    end
    throw(ExchangeError(string(self.id, " fetchOrderBook() returned unrecognized response: ", json(response))));

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bittrade, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.marketGetDetailMerged(extend(request, params)));
    tick = self.safeDict(response, "tick", defaultValue = Dict{Symbol, Any}());
    ticker = self.parseTicker(tick, market = market);
    timestamp = safeInteger(response, "ts");
    ticker[Symbol("timestamp")] = timestamp;
    ticker[Symbol("datetime")] = self.iso8601(timestamp);
    return ticker

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bittrade; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.marketGetTickers(params));
    tickers = safeValue(response, "data", []);
    timestamp = safeInteger(response, "ts");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        marketId = safeString(get(tickers, i + 1, nothing), "symbol");
        market = self.safeMarket(marketId = marketId);
        symbol = get(market, Symbol("symbol"), nothing);
        ticker = self.parseTicker(get(tickers, i + 1, nothing), market = market);
        ticker[Symbol("timestamp")] = timestamp;
        ticker[Symbol("datetime")] = self.iso8601(timestamp);
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function parseTrade(self::Bittrade, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = safeInteger2(trade, "ts", "created-at");
    order = safeString(trade, "order-id");
    side = safeString(trade, "direction");
    type_var = safeString(trade, "type");
    if functions.ccxtruthy(type_var != nothing)
        typeParts = split(type_var, "-");
        side = get(typeParts, 1, nothing);
        type_var = get(typeParts, 2, nothing);
    end
    takerOrMaker = safeString(trade, "role");
    price = safeString(trade, "price");
    amount = safeString2(trade, "filled-amount", "amount");
    cost = stringMul(price, amount);
    fee = nothing;
    feeCost = safeString(trade, "filled-fees");
    feeCurrency = self.safeCurrencyCode(safeString(trade, "fee-currency"));
    filledPoints = safeString(trade, "filled-points");
    if functions.ccxtruthy(filledPoints != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((feeCost == nothing), (stringEq(feeCost, "0.0"))))
            feeCost = filledPoints;
            feeCurrency = self.safeCurrencyCode(safeString(trade, "fee-deduct-currency"));
        end
    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    tradeId = safeString2(trade, "trade-id", "tradeId");
    id = safeString(trade, "id", tradeId);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("order") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
))

end
"""
fetch all the trades made from a single order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Bittrade, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrderOrdersIdMatchresults(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = nothing, since = since, limit = limit)

end
"""
fetch all trades made by the user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start-time")] = since;
    end
    response = Base.fetch(self.privateGetOrderMatchresults(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

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
function fetchTrades(self::Bittrade, symbol; since=nothing, limit=1000, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 2000);
    end
    response = Base.fetch(self.marketGetHistoryTrade(extend(request, params)));
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        trades = safeValue(get(data, i + 1, nothing), "data", []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(trades)))
            trade = self.parseTrade(get(trades, j + 1, nothing), market = market);
            push!(result, trade);
            j += 1
        end
        i += 1
    end
    result = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(result, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
function parseOHLCV(self::Bittrade, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "id"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "amount")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bittrade, symbol; timeframe="1m", since=nothing, limit=1000, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 2000);
    end
    response = Base.fetch(self.marketGetHistoryKline(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetch all the accounts associated with a profile

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Bittrade; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountAccounts(params));
    return self.safeList(response, "data", defaultValue = [])

end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bittrade; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("language") => self.handleOption("fetchCurrencies", "language", defaultValue = "en-US")
    );
    response = Base.fetch(self.publicGetSettingsCurrencys(extend(request, params)));
    currencies = safeValue(response, "data", []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Bittrade, currency)
    id = safeValue(currency, "name");
    code = self.safeCurrencyCode(id);
    depositEnabled = safeValue(currency, "deposit-enabled");
    withdrawEnabled = safeValue(currency, "withdraw-enabled");
    countryDisabled = safeValue(currency, "country-disabled");
    visible = self.safeBool(currency, "visible", defaultValue = false);
    state = safeString(currency, "state");
    active = @functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(visible, depositEnabled), withdrawEnabled), (state == "online")), !functions.ccxtruthy(countryDisabled));
    name = safeString(currency, "display-name");
    precision = self.parseNumber(self.parsePrecision(precision = safeString(currency, "withdraw-precision")));
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("type") => "crypto",
    Symbol("name") => name,
    Symbol("active") => active,
    Symbol("deposit") => depositEnabled,
    Symbol("withdraw") => withdrawEnabled,
    Symbol("fee") => nothing,
    Symbol("precision") => precision,
    Symbol("networks") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => precision,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(currency, "deposit-min-amount"),
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(currency, "withdraw-min-amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => currency
))

end
function parseBalance(self::Bittrade, response)
    balances = safeValue(get(response, Symbol("data"), nothing), "list", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = nothing;
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (ccxt_in(code, result))))
            account = get(result, Symbol(code), nothing);
        else
            account = self.account();
        end
        if functions.ccxtruthy(account == nothing)
            throw(ExchangeError(string(self.id, " parseBalance() could not resolve account")));
        end
        if functions.ccxtruthy(get(balance, Symbol("type"), nothing) == "trade")
            account[Symbol("free")] = safeString(balance, "balance");
        end
        if functions.ccxtruthy(account == nothing)
            throw(ExchangeError(string(self.id, " parseBalance() could not resolve account")));
        end
        if functions.ccxtruthy(get(balance, Symbol("type"), nothing) == "frozen")
            account[Symbol("used")] = safeString(balance, "balance");
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bittrade; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    method = self.handleOption("fetchBalance", "method", defaultValue = "privateGetAccountAccountsIdBalance");
    request = Dict{Symbol, Any}(
        Symbol("id") => get(get(self.accounts, 1, nothing), Symbol("id"), nothing)
    );
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseBalance(response)

end
function fetchOrdersByStates(self::Bittrade, states; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("states") => states
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    method = self.handleOption("fetchOrdersByStates", "method", defaultValue = "private_get_order_orders");
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseOrders(get(response, Symbol("data"), nothing), market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bittrade, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetOrderOrdersId(extend(request, params)));
    order = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order)

end
"""
fetches information on multiple orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStates("pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all unfilled currently open orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    method = self.handleOption("fetchOpenOrders", "method", defaultValue = "fetch_open_orders_v1");
    return Base.fetch(getproperty(self, Symbol(method))(symbol, since, limit, params))

end
function fetchOpenOrdersV1(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrdersV1() requires a symbol argument")));
    end
    return Base.fetch(self.fetchOrdersByStates("pre-submitted,submitted,partial-filled", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStates("filled,partial-canceled,canceled", symbol = symbol, since = since, limit = limit, params = params))

end
function fetchOpenOrdersV2(self::Bittrade; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    accountId = safeString(params, "account-id");
    if functions.ccxtruthy(accountId == nothing)
        Base.fetch(self.loadAccounts());
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(self.accounts)))
            account = get(self.accounts, i + 1, nothing);
            if functions.ccxtruthy(get(account, Symbol("type"), nothing) == "spot")
                accountId = safeString(account, "id");
                if functions.ccxtruthy(accountId != nothing)
                    break
                end
            end
            i += 1
        end

    end
    request[Symbol("account-id")] = accountId;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    omitted = omit(params, "account-id");
    response = Base.fetch(self.privateGetOrderOpenOrders(extend(request, omitted)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
function parseOrderStatus(self::Bittrade, status)
    statuses = Dict{Symbol, Any}(
        Symbol("partial-filled") => "open",
        Symbol("partial-canceled") => "canceled",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("submitted") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bittrade, order; market=nothing)
    id = safeString(order, "id");
    side = nothing;
    type_var = nothing;
    status = nothing;
    if functions.ccxtruthy(ccxt_in("type", order))
        orderType = split(get(order, Symbol("type"), nothing), "-");
        side = get(orderType, 1, nothing);
        type_var = get(orderType, 2, nothing);
        status = self.parseOrderStatus(safeString(order, "state"));
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(order, "created-at");
    clientOrderId = safeString(order, "client-order-id");
    amount = safeString(order, "amount");
    filled = safeString2(order, "filled-amount", "field-amount");
    price = safeString(order, "price");
    cost = safeString2(order, "filled-cash-amount", "field-cash-amount");
    feeCost = safeString2(order, "filled-fees", "field-fees");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrency = functions.ccxtruthy((side == "sell")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("average") => nothing,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Bittrade, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
"""
create a trade order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bittrade, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("account-id") => get(get(self.accounts, 1, nothing), Symbol("id"), nothing),
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => string(side, "-", type_var)
    );
    clientOrderId = safeString2(params, "clientOrderId", "client-order-id");
    if functions.ccxtruthy(clientOrderId == nothing)
        broker = safeValue(self.options, "broker", Dict{Symbol, Any}());
        brokerId = safeString(broker, "id");
        request[Symbol("client-order-id")] = string(brokerId, uuid());
    else
        request[Symbol("client-order-id")] = clientOrderId;
    end
    params = omit(params, ["clientOrderId", "client-order-id"]);
    if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (side == "buy")))
        quoteAmount = nothing;
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
        cost = self.safeNumber(params, "cost");
        params = omit(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            quoteAmount = self.amountToPrecision(symbol, cost);
        elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
            if functions.ccxtruthy(price == nothing)
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                quoteAmount = self.amountToPrecision(symbol, stringMul(amountString, priceString));
            end
        else
            quoteAmount = self.amountToPrecision(symbol, amount);
        end
        request[Symbol("amount")] = quoteAmount;
    else
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(type_var == "limit", type_var == "ioc"), type_var == "limit-maker"), type_var == "stop-limit"), type_var == "stop-limit-fok"))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    method = get(self.options, Symbol("createOrderMethod"), nothing);
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    id = safeString(response, "data");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("clientOrderId") => nothing,
    Symbol("average") => nothing
), market = market)

end
"""
cancels an open order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bittrade, id; symbol=nothing, params=Dict())
    response = Base.fetch(self.privatePostOrderOrdersIdSubmitcancel(Dict{Symbol, Any}(
        Symbol("id") => id
    )));
    return extend(self.parseOrder(response), Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => "canceled"
))

end
"""
cancel multiple orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bittrade, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderIds = safeValue2(params, "clientOrderIds", "client-order-ids");
    params = omit(params, ["clientOrderIds", "client-order-ids"]);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderIds == nothing)
        request[Symbol("order-ids")] = ids;
    else
        request[Symbol("client-order-ids")] = clientOrderIds;
    end
    response = Base.fetch(self.privatePostOrderOrdersBatchcancel(extend(request, params)));
    return self.parseCancelOrders(response)

end
function parseCancelOrders(self::Bittrade, orders)
    successes = safeString(orders, "successes");
    success = nothing;
    if functions.ccxtruthy(successes != nothing)
        success = split(successes, ",");
    else
        success = self.safeList(orders, "success", defaultValue = []);
    end
    failed = self.safeList2(orders, "errors", "failed", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(success)))
        order = get(success, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => order,
    Symbol("status") => "canceled"
)));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(failed)))
        order = get(failed, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "order-id", "order_id"),
    Symbol("status") => "failed",
    Symbol("clientOrderId") => safeString(order, "client-order-id")
)));
        i += 1
    end
    return result

end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bittrade; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostOrderOrdersBatchCancelOpenOrders(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data
))]

end
function parseDepositAddress(self::Bittrade, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    tag = safeString(depositAddress, "addressTag");
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    code = self.safeCurrencyCode(currencyId, currency = currency);
    networkId = safeString(depositAddress, "chain");
    networks = safeValue(currency, "networks", Dict{Symbol, Any}());
    networksById = indexBy(networks, "id");
    networkValue = safeValue(networksById, networkId, networkId);
    network = safeString(networkValue, "network");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => tag,
    Symbol("network") => network,
    Symbol("info") => depositAddress
)

end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bittrade; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "deposit",
        Symbol("from") => 0
    );
    if functions.ccxtruthy(currency != nothing)
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.privateGetQueryDepositWithdraw(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bittrade; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "withdraw",
        Symbol("from") => 0
    );
    if functions.ccxtruthy(currency != nothing)
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.privateGetQueryDepositWithdraw(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Bittrade, transaction; currency=nothing)
    timestamp = safeInteger(transaction, "created-at");
    code = self.safeCurrencyCode(safeString(transaction, "currency"));
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
    end
    feeCost = safeString(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        feeCost = stringAbs(feeCost);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "id", "data"),
    Symbol("txid") => safeString(transaction, "tx-hash"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => safeStringUpper(transaction, "chain"),
    Symbol("address") => safeString(transaction, "address"),
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => safeString(transaction, "address-tag"),
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "state")),
    Symbol("updated") => safeInteger(transaction, "updated-at"),
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(feeCost),
        Symbol("rate") => nothing
    )
)

end
function parseTransactionStatus(self::Bittrade, status)
    statuses = Dict{Symbol, Any}(
        Symbol("unknown") => "failed",
        Symbol("confirming") => "pending",
        Symbol("confirmed") => "ok",
        Symbol("safe") => "ok",
        Symbol("orphan") => "failed",
        Symbol("submitted") => "pending",
        Symbol("canceled") => "canceled",
        Symbol("reexamine") => "pending",
        Symbol("reject") => "failed",
        Symbol("pass") => "pending",
        Symbol("wallet-reject") => "failed",
        Symbol("confirm-error") => "failed",
        Symbol("repealed") => "failed",
        Symbol("wallet-transfer") => "pending",
        Symbol("pre-transfer") => "pending"
    );
    return safeString(statuses, status, status)

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
function withdraw(self::Bittrade, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("address") => address,
        Symbol("amount") => amount,
        Symbol("currency") => lowercase(get(currency, Symbol("id"), nothing))
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addr-tag")] = tag;
    end
    networks = safeValue(self.options, "networks", Dict{Symbol, Any}());
    network = safeStringUpper(params, "network");
    network = safeStringLower(networks, network, network);
    if functions.ccxtruthy(network != nothing)
        if functions.ccxtruthy(network == "erc20")
            request[Symbol("chain")] = string(get(currency, Symbol("id"), nothing), network);
        else
            request[Symbol("chain")] = string(network, get(currency, Symbol("id"), nothing));
        end
        params = omit(params, "network");
    end
    response = Base.fetch(self.privatePostDwWithdrawApiCreate(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function sign(self::Bittrade, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = "/";
    if functions.ccxtruthy(api == "market")
        url += api;
    elseif functions.ccxtruthy(@functions.ccxt_or((api == "public"), (api == "private")))
        url += self.version;
    else
        if functions.ccxtruthy(@functions.ccxt_or((api == "v2Public"), (api == "v2Private")))
            url += "v2";
        end

    end
    url += string("/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(@functions.ccxt_or(api == "private", api == "v2Private"))
        self.checkRequiredCredentials();
        timestamp = self.ymdhms(milliseconds(), "T");
        request = Dict{Symbol, Any}(
            Symbol("SignatureMethod") => "HmacSHA256",
            Symbol("SignatureVersion") => "2",
            Symbol("AccessKeyId") => self.apiKey,
            Symbol("Timestamp") => timestamp
        );
        if functions.ccxtruthy(method != "POST")
            request = extend(request, query);
        end
        requestSorted = keysort(request);
        auth = self.urlencode(requestSorted);
        content = [method, self.hostname, url, auth];
        payload = join(content, "\n");
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
        auth += string("&", self.urlencode(Dict{Symbol, Any}(
    Symbol("Signature") => signature
)));
        url += string("?", auth);
        if functions.ccxtruthy(method == "POST")
            body = json(query);
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json"
            );
        else
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/x-www-form-urlencoded"
            );
        end
    else
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    end
    url = string(self.implodeParams(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), Dict{Symbol, Any}(
    Symbol("hostname") => self.hostname
)), url);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bittrade, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("status", response))
        status = safeString(response, "status");
        if functions.ccxtruthy(status == "error")
            code = safeString(response, "err-code");
            feedback = string(self.id, " ", body);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
            message = safeString(response, "err-msg");
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bittrade, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v2PublicGetReferenceCurrencies(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "reference/currencies"; api="v2Public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetMarketStatus(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "market-status"; api="v2Public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountLedger(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/ledger"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountWithdrawQuota(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/withdraw/quota"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountWithdrawAddress(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/withdraw/address"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountDepositAddress(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/deposit/address"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountRepayment(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/repayment"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferenceTransactFeeRate(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "reference/transact-fee-rate"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountAssetValuation(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/asset-valuation"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetPointAccount(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "point/account"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSubUserUserList(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/user-list"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSubUserUserState(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/user-state"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSubUserAccountList(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/account-list"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSubUserDepositAddress(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/deposit-address"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSubUserQueryDeposit(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/query-deposit"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetUserApiKey(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "user/api-key"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetUserUid(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "user/uid"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAlgoOrdersOpening(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders/opening"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAlgoOrdersHistory(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders/history"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAlgoOrdersSpecific(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders/specific"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetC2cOffers(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/offers"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetC2cOffer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/offer"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetC2cTransactions(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/transactions"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetC2cRepayment(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/repayment"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetC2cAccount(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/account"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetEtpReference(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/reference"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetEtpTransactions(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/transactions"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetEtpTransaction(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/transaction"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetEtpRebalance(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/rebalance"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetEtpLimit(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/limit"; api="v2Private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/transfer"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountRepayment(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/repayment"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostPointTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "point/transfer"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserManagement(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/management"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserCreation(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/creation"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserTradableMarket(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/tradable-market"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserTransferability(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/transferability"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserApiKeyGeneration(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-generation"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserApiKeyModification(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-modification"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserApiKeyDeletion(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-deletion"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSubUserDeductMode(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "sub-user/deduct-mode"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAlgoOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAlgoOrdersCancelAllAfter(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders/cancel-all-after"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAlgoOrdersCancellation(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "algo-orders/cancellation"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostC2cOffer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/offer"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostC2cCancellation(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/cancellation"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostC2cCancelAll(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/cancel-all"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostC2cRepayment(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/repayment"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostC2cTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "c2c/transfer"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostEtpCreation(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/creation"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostEtpRedemption(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/redemption"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostEtpTransactIdCancel(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/{transactId}/cancel"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostEtpBatchCancel(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp/batch-cancel"; api="v2Private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetHistoryKline(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "history/kline"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetDetailMerged(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "detail/merged"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetDepth(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "depth"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetTrade(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "trade"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetHistoryTrade(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "history/trade"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetDetail(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "detail"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetTickers(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "tickers"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetEtp(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "etp"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCommonSymbols(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "common/symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCommonCurrencys(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "common/currencys"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCommonTimestamp(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "common/timestamp"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCommonExchange(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "common/exchange"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSettingsCurrencys(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "settings/currencys"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountAccounts(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountAccountsIdBalance(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/accounts/{id}/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountAccountsSubUid(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/accounts/{sub-uid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountHistory(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCrossMarginLoanInfo(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/loan-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginLoanInfo(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "margin/loan-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFeeFeeRateGet(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "fee/fee-rate/get"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOpenOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOrdersId(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOrdersIdMatchresults(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}/matchresults"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderOrdersGetClientOrder(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/getClientOrder"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderHistory(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderMatchresults(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/matchresults"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetQueryDepositWithdraw(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "query/deposit-withdraw"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginLoanOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "margin/loan-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginAccountsBalance(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "margin/accounts/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCrossMarginLoanOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/loan-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCrossMarginAccountsBalance(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/accounts/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPointsActions(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "points/actions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPointsOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "points/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubuserAggregateBalance(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "subuser/aggregate-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStableCoinExchangeRate(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "stable-coin/exchange_rate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStableCoinQuote(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "stable-coin/quote"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "account/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "futures/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderBatchOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/batch-orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOrdersPlace(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/place"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOrdersSubmitCancelClientOrder(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/submitCancelClientOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOrdersBatchCancelOpenOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/batchCancelOpenOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOrdersIdSubmitcancel(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}/submitcancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOrdersBatchcancel(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "order/orders/batchcancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDwWithdrawApiCreate(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "dw/withdraw/api/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDwWithdrawVirtualIdCancel(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "dw/withdraw-virtual/{id}/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDwTransferInMargin(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "dw/transfer-in/margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDwTransferOutMargin(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "dw/transfer-out/margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "margin/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginOrdersIdRepay(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "margin/orders/{id}/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrossMarginTransferIn(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/transfer-in"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrossMarginTransferOut(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/transfer-out"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrossMarginOrders(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrossMarginOrdersIdRepay(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "cross-margin/orders/{id}/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStableCoinExchange(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "stable-coin/exchange"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubuserTransfer(self::Bittrade, params=Dict(), context=Dict())
    return request(self, "subuser/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bittrade(; kwargs...)
    inst = Bittrade(Exchange(), describe, fetchTime, fetchTradingLimits, fetchTradingLimitsById, parseTradingLimits, costToPrecision, fetchMarkets, parseTicker, fetchOrderBook, fetchTicker, fetchTickers, parseTrade, fetchOrderTrades, fetchMyTrades, fetchTrades, parseOHLCV, fetchOHLCV, fetchAccounts, fetchCurrencies, parseCurrency, parseBalance, fetchBalance, fetchOrdersByStates, fetchOrder, fetchOrders, fetchOpenOrders, fetchOpenOrdersV1, fetchClosedOrders, fetchOpenOrdersV2, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createOrder, cancelOrder, cancelOrders, parseCancelOrders, cancelAllOrders, parseDepositAddress, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, withdraw, sign, handleErrors, v2PublicGetReferenceCurrencies, v2PublicGetMarketStatus, v2PrivateGetAccountLedger, v2PrivateGetAccountWithdrawQuota, v2PrivateGetAccountWithdrawAddress, v2PrivateGetAccountDepositAddress, v2PrivateGetAccountRepayment, v2PrivateGetReferenceTransactFeeRate, v2PrivateGetAccountAssetValuation, v2PrivateGetPointAccount, v2PrivateGetSubUserUserList, v2PrivateGetSubUserUserState, v2PrivateGetSubUserAccountList, v2PrivateGetSubUserDepositAddress, v2PrivateGetSubUserQueryDeposit, v2PrivateGetUserApiKey, v2PrivateGetUserUid, v2PrivateGetAlgoOrdersOpening, v2PrivateGetAlgoOrdersHistory, v2PrivateGetAlgoOrdersSpecific, v2PrivateGetC2cOffers, v2PrivateGetC2cOffer, v2PrivateGetC2cTransactions, v2PrivateGetC2cRepayment, v2PrivateGetC2cAccount, v2PrivateGetEtpReference, v2PrivateGetEtpTransactions, v2PrivateGetEtpTransaction, v2PrivateGetEtpRebalance, v2PrivateGetEtpLimit, v2PrivatePostAccountTransfer, v2PrivatePostAccountRepayment, v2PrivatePostPointTransfer, v2PrivatePostSubUserManagement, v2PrivatePostSubUserCreation, v2PrivatePostSubUserTradableMarket, v2PrivatePostSubUserTransferability, v2PrivatePostSubUserApiKeyGeneration, v2PrivatePostSubUserApiKeyModification, v2PrivatePostSubUserApiKeyDeletion, v2PrivatePostSubUserDeductMode, v2PrivatePostAlgoOrders, v2PrivatePostAlgoOrdersCancelAllAfter, v2PrivatePostAlgoOrdersCancellation, v2PrivatePostC2cOffer, v2PrivatePostC2cCancellation, v2PrivatePostC2cCancelAll, v2PrivatePostC2cRepayment, v2PrivatePostC2cTransfer, v2PrivatePostEtpCreation, v2PrivatePostEtpRedemption, v2PrivatePostEtpTransactIdCancel, v2PrivatePostEtpBatchCancel, marketGetHistoryKline, marketGetDetailMerged, marketGetDepth, marketGetTrade, marketGetHistoryTrade, marketGetDetail, marketGetTickers, marketGetEtp, publicGetCommonSymbols, publicGetCommonCurrencys, publicGetCommonTimestamp, publicGetCommonExchange, publicGetSettingsCurrencys, privateGetAccountAccounts, privateGetAccountAccountsIdBalance, privateGetAccountAccountsSubUid, privateGetAccountHistory, privateGetCrossMarginLoanInfo, privateGetMarginLoanInfo, privateGetFeeFeeRateGet, privateGetOrderOpenOrders, privateGetOrderOrders, privateGetOrderOrdersId, privateGetOrderOrdersIdMatchresults, privateGetOrderOrdersGetClientOrder, privateGetOrderHistory, privateGetOrderMatchresults, privateGetQueryDepositWithdraw, privateGetMarginLoanOrders, privateGetMarginAccountsBalance, privateGetCrossMarginLoanOrders, privateGetCrossMarginAccountsBalance, privateGetPointsActions, privateGetPointsOrders, privateGetSubuserAggregateBalance, privateGetStableCoinExchangeRate, privateGetStableCoinQuote, privatePostAccountTransfer, privatePostFuturesTransfer, privatePostOrderBatchOrders, privatePostOrderOrdersPlace, privatePostOrderOrdersSubmitCancelClientOrder, privatePostOrderOrdersBatchCancelOpenOrders, privatePostOrderOrdersIdSubmitcancel, privatePostOrderOrdersBatchcancel, privatePostDwWithdrawApiCreate, privatePostDwWithdrawVirtualIdCancel, privatePostDwTransferInMargin, privatePostDwTransferOutMargin, privatePostMarginOrders, privatePostMarginOrdersIdRepay, privatePostCrossMarginTransferIn, privatePostCrossMarginTransferOut, privatePostCrossMarginOrders, privatePostCrossMarginOrdersIdRepay, privatePostStableCoinExchange, privatePostSubuserTransfer)
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
function __ccxt_doc_Bittrade_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Bittrade_fetchTime

function __ccxt_doc_Bittrade_fetchMarkets() end
"""
retrieves data on all markets for huobijp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bittrade_fetchMarkets

function __ccxt_doc_Bittrade_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bittrade_fetchOrderBook

function __ccxt_doc_Bittrade_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bittrade_fetchTicker

function __ccxt_doc_Bittrade_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bittrade_fetchTickers

function __ccxt_doc_Bittrade_fetchOrderTrades() end
"""
fetch all the trades made from a single order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bittrade_fetchOrderTrades

function __ccxt_doc_Bittrade_fetchMyTrades() end
"""
fetch all trades made by the user

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bittrade_fetchMyTrades

function __ccxt_doc_Bittrade_fetchTrades() end
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
__ccxt_doc_Bittrade_fetchTrades

function __ccxt_doc_Bittrade_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bittrade_fetchOHLCV

function __ccxt_doc_Bittrade_fetchAccounts() end
"""
fetch all the accounts associated with a profile

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Bittrade_fetchAccounts

function __ccxt_doc_Bittrade_fetchCurrencies() end
"""
fetches all available currencies on an exchange

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bittrade_fetchCurrencies

function __ccxt_doc_Bittrade_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bittrade_fetchBalance

function __ccxt_doc_Bittrade_fetchOrder() end
"""
fetches information on an order made by the user

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_fetchOrder

function __ccxt_doc_Bittrade_fetchOrders() end
"""
fetches information on multiple orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_fetchOrders

function __ccxt_doc_Bittrade_fetchOpenOrders() end
"""
fetch all unfilled currently open orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_fetchOpenOrders

function __ccxt_doc_Bittrade_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_fetchClosedOrders

function __ccxt_doc_Bittrade_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_createMarketBuyOrderWithCost

function __ccxt_doc_Bittrade_createOrder() end
"""
create a trade order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_createOrder

function __ccxt_doc_Bittrade_cancelOrder() end
"""
cancels an open order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_cancelOrder

function __ccxt_doc_Bittrade_cancelOrders() end
"""
cancel multiple orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_cancelOrders

function __ccxt_doc_Bittrade_cancelAllOrders() end
"""
cancel all open orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bittrade_cancelAllOrders

function __ccxt_doc_Bittrade_fetchDeposits() end
"""
fetch all deposits made to an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bittrade_fetchDeposits

function __ccxt_doc_Bittrade_fetchWithdrawals() end
"""
fetch all withdrawals made from an account

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bittrade_fetchWithdrawals

function __ccxt_doc_Bittrade_withdraw() end
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
__ccxt_doc_Bittrade_withdraw
