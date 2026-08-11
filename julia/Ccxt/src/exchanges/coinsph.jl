@kwdef mutable struct Coinsph <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    parseTrade::Function = parseTrade
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    parseOrder::Function = parseOrder
    parseOrderSide::Function = parseOrderSide
    encodeOrderSide::Function = encodeOrderSide
    parseOrderType::Function = parseOrderType
    encodeOrderType::Function = encodeOrderType
    parseOrderStatus::Function = parseOrderStatus
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    withdraw::Function = withdraw
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    urlEncodeQuery::Function = urlEncodeQuery
    parseArrayParam::Function = parseArrayParam
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOpenapiV1Ping::Function = publicGetOpenapiV1Ping
    publicGetOpenapiV1Time::Function = publicGetOpenapiV1Time
    publicGetOpenapiV1UserIp::Function = publicGetOpenapiV1UserIp
    publicGetOpenapiQuoteV1Ticker24hr::Function = publicGetOpenapiQuoteV1Ticker24hr
    publicGetOpenapiQuoteV1TickerPrice::Function = publicGetOpenapiQuoteV1TickerPrice
    publicGetOpenapiQuoteV1TickerBookTicker::Function = publicGetOpenapiQuoteV1TickerBookTicker
    publicGetOpenapiV1ExchangeInfo::Function = publicGetOpenapiV1ExchangeInfo
    publicGetOpenapiQuoteV1Depth::Function = publicGetOpenapiQuoteV1Depth
    publicGetOpenapiQuoteV1Klines::Function = publicGetOpenapiQuoteV1Klines
    publicGetOpenapiQuoteV1Trades::Function = publicGetOpenapiQuoteV1Trades
    publicGetOpenapiV1Pairs::Function = publicGetOpenapiV1Pairs
    publicGetOpenapiQuoteV1AvgPrice::Function = publicGetOpenapiQuoteV1AvgPrice
    privateGetOpenapiV1CheckSysStatus::Function = privateGetOpenapiV1CheckSysStatus
    privateGetOpenapiWalletV1ConfigGetall::Function = privateGetOpenapiWalletV1ConfigGetall
    privateGetOpenapiWalletV1DepositAddress::Function = privateGetOpenapiWalletV1DepositAddress
    privateGetOpenapiWalletV1DepositHistory::Function = privateGetOpenapiWalletV1DepositHistory
    privateGetOpenapiWalletV1WithdrawHistory::Function = privateGetOpenapiWalletV1WithdrawHistory
    privateGetOpenapiWalletV1WithdrawAddressWhitelist::Function = privateGetOpenapiWalletV1WithdrawAddressWhitelist
    privateGetOpenapiV1Account::Function = privateGetOpenapiV1Account
    privateGetOpenapiV1ApiKeys::Function = privateGetOpenapiV1ApiKeys
    privateGetOpenapiV1OpenOrders::Function = privateGetOpenapiV1OpenOrders
    privateGetOpenapiV1AssetTradeFee::Function = privateGetOpenapiV1AssetTradeFee
    privateGetOpenapiV1Order::Function = privateGetOpenapiV1Order
    privateGetOpenapiV1HistoryOrders::Function = privateGetOpenapiV1HistoryOrders
    privateGetOpenapiV1MyTrades::Function = privateGetOpenapiV1MyTrades
    privateGetOpenapiV1CapitalDepositHistory::Function = privateGetOpenapiV1CapitalDepositHistory
    privateGetOpenapiV1CapitalWithdrawHistory::Function = privateGetOpenapiV1CapitalWithdrawHistory
    privateGetOpenapiV3PaymentRequestGetPaymentRequest::Function = privateGetOpenapiV3PaymentRequestGetPaymentRequest
    privateGetMerchantApiV1GetInvoices::Function = privateGetMerchantApiV1GetInvoices
    privateGetOpenapiAccountV3CryptoAccounts::Function = privateGetOpenapiAccountV3CryptoAccounts
    privateGetOpenapiTransferV3TransfersId::Function = privateGetOpenapiTransferV3TransfersId
    privateGetOpenapiV1SubAccountList::Function = privateGetOpenapiV1SubAccountList
    privateGetOpenapiV1SubAccountAsset::Function = privateGetOpenapiV1SubAccountAsset
    privateGetOpenapiV1SubAccountTransferUniversalTransferHistory::Function = privateGetOpenapiV1SubAccountTransferUniversalTransferHistory
    privateGetOpenapiV1SubAccountTransferSubHistory::Function = privateGetOpenapiV1SubAccountTransferSubHistory
    privateGetOpenapiV1SubAccountApikeyIpRestriction::Function = privateGetOpenapiV1SubAccountApikeyIpRestriction
    privateGetOpenapiV1SubAccountWalletDepositAddress::Function = privateGetOpenapiV1SubAccountWalletDepositAddress
    privateGetOpenapiV1SubAccountWalletDepositHistory::Function = privateGetOpenapiV1SubAccountWalletDepositHistory
    privateGetOpenapiV1FundCollectGetFundRecord::Function = privateGetOpenapiV1FundCollectGetFundRecord
    privateGetOpenapiV1AssetTransactionHistory::Function = privateGetOpenapiV1AssetTransactionHistory
    privatePostOpenapiWalletV1WithdrawApply::Function = privatePostOpenapiWalletV1WithdrawApply
    privatePostOpenapiV1OrderTest::Function = privatePostOpenapiV1OrderTest
    privatePostOpenapiV1Order::Function = privatePostOpenapiV1Order
    privatePostOpenapiV1OrderCancelReplace::Function = privatePostOpenapiV1OrderCancelReplace
    privatePostOpenapiV1CapitalWithdrawApply::Function = privatePostOpenapiV1CapitalWithdrawApply
    privatePostOpenapiV1CapitalDepositApply::Function = privatePostOpenapiV1CapitalDepositApply
    privatePostOpenapiV3PaymentRequestPaymentRequests::Function = privatePostOpenapiV3PaymentRequestPaymentRequests
    privatePostOpenapiV3PaymentRequestDeletePaymentRequest::Function = privatePostOpenapiV3PaymentRequestDeletePaymentRequest
    privatePostOpenapiV3PaymentRequestPaymentRequestReminder::Function = privatePostOpenapiV3PaymentRequestPaymentRequestReminder
    privatePostOpenapiV1UserDataStream::Function = privatePostOpenapiV1UserDataStream
    privatePostMerchantApiV1Invoices::Function = privatePostMerchantApiV1Invoices
    privatePostMerchantApiV1InvoicesCancel::Function = privatePostMerchantApiV1InvoicesCancel
    privatePostOpenapiConvertV1GetSupportedTradingPairs::Function = privatePostOpenapiConvertV1GetSupportedTradingPairs
    privatePostOpenapiConvertV1GetQuote::Function = privatePostOpenapiConvertV1GetQuote
    privatePostOpenapiConvertV1AcceptQuote::Function = privatePostOpenapiConvertV1AcceptQuote
    privatePostOpenapiConvertV1QueryOrderHistory::Function = privatePostOpenapiConvertV1QueryOrderHistory
    privatePostOpenapiOtcTradeV1GetSupportedTradingPairs::Function = privatePostOpenapiOtcTradeV1GetSupportedTradingPairs
    privatePostOpenapiOtcTradeV1CreateRfq::Function = privatePostOpenapiOtcTradeV1CreateRfq
    privatePostOpenapiOtcTradeV1AcceptRfq::Function = privatePostOpenapiOtcTradeV1AcceptRfq
    privatePostOpenapiOtcTradeV1ManualSettle::Function = privatePostOpenapiOtcTradeV1ManualSettle
    privatePostOpenapiOtcTradeV1QueryOrderHistory::Function = privatePostOpenapiOtcTradeV1QueryOrderHistory
    privatePostOpenapiFiatV1SupportChannel::Function = privatePostOpenapiFiatV1SupportChannel
    privatePostOpenapiFiatV1CashOut::Function = privatePostOpenapiFiatV1CashOut
    privatePostOpenapiFiatV1History::Function = privatePostOpenapiFiatV1History
    privatePostOpenapiMigrationV4Sellorder::Function = privatePostOpenapiMigrationV4Sellorder
    privatePostOpenapiMigrationV4ValidateField::Function = privatePostOpenapiMigrationV4ValidateField
    privatePostOpenapiTransferV3Transfers::Function = privatePostOpenapiTransferV3Transfers
    privatePostOpenapiTransferV4Transfers::Function = privatePostOpenapiTransferV4Transfers
    privatePostOpenapiV1SubAccountCreate::Function = privatePostOpenapiV1SubAccountCreate
    privatePostOpenapiV1SubAccountTransferUniversalTransfer::Function = privatePostOpenapiV1SubAccountTransferUniversalTransfer
    privatePostOpenapiV1SubAccountTransferSubToMaster::Function = privatePostOpenapiV1SubAccountTransferSubToMaster
    privatePostOpenapiV1SubAccountApikeyAddIpRestriction::Function = privatePostOpenapiV1SubAccountApikeyAddIpRestriction
    privatePostOpenapiV1SubAccountApikeyDeleteIpRestriction::Function = privatePostOpenapiV1SubAccountApikeyDeleteIpRestriction
    privatePostOpenapiV1FundCollectCollectFromSubAccount::Function = privatePostOpenapiV1FundCollectCollectFromSubAccount
    privatePutOpenapiV1UserDataStream::Function = privatePutOpenapiV1UserDataStream
    privateDeleteOpenapiV1Order::Function = privateDeleteOpenapiV1Order
    privateDeleteOpenapiV1OpenOrders::Function = privateDeleteOpenapiV1OpenOrders
    privateDeleteOpenapiV1UserDataStream::Function = privateDeleteOpenapiV1UserDataStream

end
function describe(self::Coinsph, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinsph",
    Symbol("name") => "Coins.ph",
    Symbol("countries") => ["PH"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 50,
    Symbol("certified") => false,
    Symbol("pro") => false,
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
        Symbol("cancelOrders") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("deposit") => true,
        Symbol("editOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => nothing,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
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
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => false,
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
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
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
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => nothing,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true,
        Symbol("ws") => false
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
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/225719995-48ab2026-4ddb-496c-9da7-0d7566617c9b.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.pro.coins.ph",
            Symbol("private") => "https://api.pro.coins.ph"
        ),
        Symbol("www") => "https://coins.ph/",
        Symbol("doc") => ["https://coins-docs.github.io/rest-api"],
        Symbol("fees") => "https://support.coins.ph/hc/en-us/sections/4407198694681-Limits-Fees",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.coins.ph/en-ph/register?invite_code=1371062463303277512&broker=9001",
            Symbol("discount") => 0.2
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("openapi/v1/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/user/ip") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/quote/v1/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbolAndNoSymbols") => 40,
    Symbol("byNumberOfSymbols") => [[101, 40], [21, 20], [0, 1]]
),
                Symbol("openapi/quote/v1/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("openapi/quote/v1/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("openapi/v1/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/quote/v1/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[101, 5], [0, 1]]
),
                Symbol("openapi/quote/v1/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/quote/v1/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/quote/v1/avgPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("openapi/v1/check-sys-status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/wallet/v1/config/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/wallet/v1/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/wallet/v1/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/wallet/v1/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/wallet/v1/withdraw/address-whitelist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/api-keys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3,
    Symbol("noSymbol") => 40
),
                Symbol("openapi/v1/asset/tradeFee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("openapi/v1/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10,
    Symbol("noSymbol") => 40
),
                Symbol("openapi/v1/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/capital/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v3/payment-request/get-payment-request") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("merchant-api/v1/get-invoices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/account/v3/crypto-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/transfer/v3/transfers/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/sub-account/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/sub-account/transfer/universal-transfer-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/sub-account/transfer/sub-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/sub-account/apikey/ip-restriction") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openapi/v1/sub-account/wallet/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/sub-account/wallet/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/fund-collect/get-fund-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/asset/transaction/history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("openapi/wallet/v1/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 600
),
                Symbol("openapi/v1/order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/order/cancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/capital/deposit/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v3/payment-request/payment-requests") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v3/payment-request/delete-payment-request") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v3/payment-request/payment-request-reminder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("merchant-api/v1/invoices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("merchant-api/v1/invoices-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/convert/v1/get-supported-trading-pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/convert/v1/get-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/convert/v1/accept-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/convert/v1/query-order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/otc-trade/v1/get-supported-trading-pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/otc-trade/v1/create-rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/otc-trade/v1/accept-rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/otc-trade/v1/manual-settle") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/otc-trade/v1/query-order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/fiat/v1/support-channel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/fiat/v1/cash-out") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/fiat/v1/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/migration/v4/sellorder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/migration/v4/validate-field") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/transfer/v3/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/transfer/v4/transfers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/sub-account/create") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("openapi/v1/sub-account/transfer/universal-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("openapi/v1/sub-account/transfer/sub-to-master") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("openapi/v1/sub-account/apikey/add-ip-restriction") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("openapi/v1/sub-account/apikey/delete-ip-restriction") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("openapi/v1/fund-collect/collect-from-sub-account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("openapi/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("openapi/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openapi/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0025"),
            Symbol("taker") => self.parseNumber("0.003"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.003")], [self.parseNumber("500000"), self.parseNumber("0.0027")], [self.parseNumber("1000000"), self.parseNumber("0.0024")], [self.parseNumber("2500000"), self.parseNumber("0.002")], [self.parseNumber("5000000"), self.parseNumber("0.0018")], [self.parseNumber("10000000"), self.parseNumber("0.0015")], [self.parseNumber("100000000"), self.parseNumber("0.0012")], [self.parseNumber("500000000"), self.parseNumber("0.0009")], [self.parseNumber("1000000000"), self.parseNumber("0.0007")], [self.parseNumber("2500000000"), self.parseNumber("0.0005")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0025")], [self.parseNumber("500000"), self.parseNumber("0.0022")], [self.parseNumber("1000000"), self.parseNumber("0.0018")], [self.parseNumber("2500000"), self.parseNumber("0.0015")], [self.parseNumber("5000000"), self.parseNumber("0.0012")], [self.parseNumber("10000000"), self.parseNumber("0.001")], [self.parseNumber("100000000"), self.parseNumber("0.0008")], [self.parseNumber("500000000"), self.parseNumber("0.0007")], [self.parseNumber("1000000000"), self.parseNumber("0.0006")], [self.parseNumber("2500000000"), self.parseNumber("0.0005")]]
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("warning") => false
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("warning") => false
        ),
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("timeInForce") => "GTC",
            Symbol("newOrderRespType") => Dict{Symbol, Any}(
                Symbol("market") => "FULL",
                Symbol("limit") => "FULL"
            )
        ),
        Symbol("fetchTicker") => Dict{Symbol, Any}(
            Symbol("method") => "publicGetOpenapiQuoteV1Ticker24hr"
        ),
        Symbol("fetchTickers") => Dict{Symbol, Any}(
            Symbol("method") => "publicGetOpenapiQuoteV1Ticker24hr"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRX",
            Symbol("ERC20") => "ETH",
            Symbol("BEP20") => "BSC",
            Symbol("ARBITRUM") => "ARBITRUM"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            ),
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
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
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
                Symbol("limit") => 1000,
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
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => BadRequest,
            Symbol("-1001") => BadRequest,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => InvalidOrder,
            Symbol("-1006") => BadResponse,
            Symbol("-1007") => BadResponse,
            Symbol("-1014") => InvalidOrder,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => NotSupported,
            Symbol("-1020") => NotSupported,
            Symbol("-1021") => BadRequest,
            Symbol("-1022") => BadRequest,
            Symbol("-1023") => AuthenticationError,
            Symbol("-1024") => BadRequest,
            Symbol("-1025") => BadRequest,
            Symbol("-1030") => ExchangeError,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => BadRequest,
            Symbol("-1106") => BadRequest,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => BadResponse,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => InvalidOrder,
            Symbol("-1116") => InvalidOrder,
            Symbol("-1117") => InvalidOrder,
            Symbol("-1118") => InvalidOrder,
            Symbol("-1119") => InvalidOrder,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1122") => InvalidOrder,
            Symbol("-1125") => BadRequest,
            Symbol("-1127") => BadRequest,
            Symbol("-1128") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1131") => InsufficientFunds,
            Symbol("-1132") => InvalidOrder,
            Symbol("-1133") => InvalidOrder,
            Symbol("-1134") => InvalidOrder,
            Symbol("-1135") => InvalidOrder,
            Symbol("-1136") => InvalidOrder,
            Symbol("-1137") => InvalidOrder,
            Symbol("-1138") => InvalidOrder,
            Symbol("-1139") => InvalidOrder,
            Symbol("-1140") => InvalidOrder,
            Symbol("-1141") => DuplicateOrderId,
            Symbol("-1142") => InvalidOrder,
            Symbol("-1143") => OrderNotFound,
            Symbol("-1144") => InvalidOrder,
            Symbol("-1145") => InvalidOrder,
            Symbol("-1146") => InvalidOrder,
            Symbol("-1147") => InvalidOrder,
            Symbol("-1148") => InvalidOrder,
            Symbol("-1149") => InvalidOrder,
            Symbol("-1150") => InvalidOrder,
            Symbol("-1151") => BadSymbol,
            Symbol("-1152") => NotSupported,
            Symbol("-1153") => AuthenticationError,
            Symbol("-1154") => BadRequest,
            Symbol("-1155") => BadRequest,
            Symbol("-1156") => InvalidOrder,
            Symbol("-1157") => BadSymbol,
            Symbol("-1158") => InvalidOrder,
            Symbol("-1159") => InvalidOrder,
            Symbol("-1160") => BadRequest,
            Symbol("-1161") => BadRequest,
            Symbol("-2010") => InvalidOrder,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2011") => BadRequest,
            Symbol("-2014") => BadRequest,
            Symbol("-2015") => AuthenticationError,
            Symbol("-2016") => BadResponse,
            Symbol("-3126") => InvalidOrder,
            Symbol("-3127") => InvalidOrder,
            Symbol("-4001") => BadRequest,
            Symbol("-100011") => BadSymbol,
            Symbol("-100012") => BadSymbol,
            Symbol("-30008") => InsufficientFunds,
            Symbol("-30036") => InsufficientFunds,
            Symbol("403") => ExchangeNotAvailable
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Unknown order sent") => OrderNotFound,
            Symbol("Duplicate order sent") => DuplicateOrderId,
            Symbol("Market is closed") => BadSymbol,
            Symbol("Account has insufficient balance for requested action") => InsufficientFunds,
            Symbol("Market orders are not supported for this symbol") => BadSymbol,
            Symbol("Iceberg orders are not supported for this symbol") => BadSymbol,
            Symbol("Stop loss orders are not supported for this symbol") => BadSymbol,
            Symbol("Stop loss limit orders are not supported for this symbol") => BadSymbol,
            Symbol("Take profit orders are not supported for this symbol") => BadSymbol,
            Symbol("Take profit limit orders are not supported for this symbol") => BadSymbol,
            Symbol("Price* QTY is zero or less") => BadRequest,
            Symbol("IcebergQty exceeds QTY") => BadRequest,
            Symbol("This action disabled is on this account") => PermissionDenied,
            Symbol("Unsupported order combination") => InvalidOrder,
            Symbol("Order would trigger immediately") => InvalidOrder,
            Symbol("Cancel order is invalid. Check origClOrdId and orderId") => InvalidOrder,
            Symbol("Order would immediately match and take") => OrderImmediatelyFillable,
            Symbol("PRICE_FILTER") => InvalidOrder,
            Symbol("LOT_SIZE") => InvalidOrder,
            Symbol("MIN_NOTIONAL") => InvalidOrder,
            Symbol("MAX_NUM_ORDERS") => InvalidOrder,
            Symbol("MAX_ALGO_ORDERS") => InvalidOrder,
            Symbol("BROKER_MAX_NUM_ORDERS") => InvalidOrder,
            Symbol("BROKER_MAX_ALGO_ORDERS") => InvalidOrder,
            Symbol("ICEBERG_PARTS") => BadRequest
        )
    )
))

end
function fetchCurrencies(self::Coinsph, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(false)))
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.privateGetOpenapiWalletV1ConfigGetall(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Coinsph, rawCurrency)
    id = safeString(rawCurrency, "coin");
    code = self.safeCurrencyCode(id);
    isFiat = self.safeBool(rawCurrency, "isLegalMoney");
    networkList = self.safeList(rawCurrency, "networkList", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkItem = get(networkList, j + 1, nothing);
        network = safeString(networkItem, "network");
        networkCode = self.networkIdToCode(network, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => networkItem,
                Symbol("id") => network,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(networkItem, "depositEnable"),
                Symbol("withdraw") => self.safeBool(networkItem, "withdrawEnable"),
                Symbol("fee") => self.safeNumber(networkItem, "withdrawFee"),
                Symbol("precision") => self.safeNumber(networkItem, "withdrawIntegerMultiple"),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkItem, "withdrawMin"),
                        Symbol("max") => self.safeNumber(networkItem, "withdrawMax")
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
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("code") => code,
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(rawCurrency, "transferPrecision"))),
    Symbol("info") => rawCurrency,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "depositAllEnable"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "withdrawAllEnable"),
    Symbol("networks") => networks,
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("limits") => Dict{Symbol, Any}()
))

end
function calculateRateLimiterCost(self::Coinsph, api, method, path, params, config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noSymbol", config)), !functions.ccxtruthy((ccxt_in("symbol", params)))))
            return get(config, Symbol("noSymbol"), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((ccxt_in("noSymbolAndNoSymbols", config)), !functions.ccxtruthy((ccxt_in("symbol", params)))), !functions.ccxtruthy((ccxt_in("symbols", params)))))
        return get(config, Symbol("noSymbolAndNoSymbols"), nothing)
    else
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byNumberOfSymbols", config)), (ccxt_in("symbols", params))))
            symbols = get(params, Symbol("symbols"), nothing);
            symbolsAmount = length(symbols);
            byNumberOfSymbols = self.safeList(config, "byNumberOfSymbols", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(byNumberOfSymbols)))
                entry = get(byNumberOfSymbols, i + 1, nothing);
                if functions.ccxtruthy(functions.ccxt_ge(symbolsAmount, get(entry, 1, nothing)))
                        return get(entry, 2, nothing)
                end
                i += 1
            end

        elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byLimit", config)), (ccxt_in("limit", params))))
            limit = get(params, Symbol("limit"), nothing);
            byLimit = self.safeList(config, "byLimit", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(byLimit)))
                entry = get(byLimit, i + 1, nothing);
                if functions.ccxtruthy(functions.ccxt_ge(limit, get(entry, 1, nothing)))
                        return get(entry, 2, nothing)
                end
                i += 1
            end
        end

    end
    return safeValue(config, "cost", 1)

end
function fetchStatus(self::Coinsph, params=Dict())
    response = Base.fetch(self.publicGetOpenapiV1Ping(params));
    return Dict{Symbol, Any}(
    Symbol("status") => "ok",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Coinsph, params=Dict())
    response = Base.fetch(self.publicGetOpenapiV1Time(params));
    return safeInteger(response, "serverTime")

end
function fetchMarkets(self::Coinsph, params=Dict())
    response = Base.fetch(self.publicGetOpenapiV1ExchangeInfo(params));
    markets = self.safeList(response, "symbols", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseAsset");
        quoteId = safeString(market, "quoteAsset");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        limits = indexBy(self.safeList(market, "filters", []), "filterType");
        amountLimits = safeValue(limits, "LOT_SIZE", Dict{Symbol, Any}());
        priceLimits = safeValue(limits, "PRICE_FILTER", Dict{Symbol, Any}());
        costLimits = safeValue(limits, "NOTIONAL", Dict{Symbol, Any}());
        push!(result, Dict{Symbol, Any}(
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
    Symbol("active") => safeStringLower(market, "status") == "trading",
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => nothing,
    Symbol("maker") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(safeString(amountLimits, "stepSize")),
        Symbol("price") => self.parseNumber(safeString(priceLimits, "tickSize"))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(safeString(amountLimits, "minQty")),
            Symbol("max") => self.parseNumber(safeString(amountLimits, "maxQty"))
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(safeString(priceLimits, "minPrice")),
            Symbol("max") => self.parseNumber(safeString(priceLimits, "maxPrice"))
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(safeString(costLimits, "minNotional")),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    self.setMarkets(result);
    return result

end
function fetchTickers(self::Coinsph, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        ids = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            market = self.market(get(symbols, i + 1, nothing));
            id = get(market, Symbol("id"), nothing);
            push!(ids, id);
            i += 1
        end

        request[Symbol("symbols")] = ids;
    end
    defaultMethod = "publicGetOpenapiQuoteV1Ticker24hr";
    options = self.safeDict(self.options, "fetchTickers", Dict{Symbol, Any}());
    method = safeString(options, "method", defaultMethod);
    tickers = [];
    if functions.ccxtruthy(method == "publicGetOpenapiQuoteV1TickerPrice")
        tickers = Base.fetch(self.publicGetOpenapiQuoteV1TickerPrice(extend(request, params)));
    elseif functions.ccxtruthy(method == "publicGetOpenapiQuoteV1TickerBookTicker")
        tickers = Base.fetch(self.publicGetOpenapiQuoteV1TickerBookTicker(extend(request, params)));
    else
        tickers = Base.fetch(self.publicGetOpenapiQuoteV1Ticker24hr(extend(request, params)));
    end
    return self.parseTickers(tickers, symbols, params)

end
function fetchTicker(self::Coinsph, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    defaultMethod = "publicGetOpenapiQuoteV1Ticker24hr";
    options = self.safeDict(self.options, "fetchTicker", Dict{Symbol, Any}());
    method = safeString(options, "method", defaultMethod);
    ticker = Dict{Symbol, Any}();
    if functions.ccxtruthy(method == "publicGetOpenapiQuoteV1TickerPrice")
        ticker = Base.fetch(self.publicGetOpenapiQuoteV1TickerPrice(extend(request, params)));
    elseif functions.ccxtruthy(method == "publicGetOpenapiQuoteV1TickerBookTicker")
        ticker = Base.fetch(self.publicGetOpenapiQuoteV1TickerBookTicker(extend(request, params)));
    else
        ticker = Base.fetch(self.publicGetOpenapiQuoteV1Ticker24hr(extend(request, params)));
    end
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Coinsph, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(ticker, "closeTime");
    bid = safeString(ticker, "bidPrice");
    ask = safeString(ticker, "askPrice");
    bidVolume = safeString(ticker, "bidQty");
    askVolume = safeString(ticker, "askQty");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = safeString(ticker, "quoteVolume");
    open = safeString(ticker, "openPrice");
    high = safeString(ticker, "highPrice");
    low = safeString(ticker, "lowPrice");
    prevClose = safeString(ticker, "prevClosePrice");
    vwap = safeString(ticker, "weightedAvgPrice");
    changeValue = safeString(ticker, "priceChange");
    changePcnt = safeString(ticker, "priceChangePercent");
    changePcnt = stringMul(changePcnt, "100");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("open") => open,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("close") => safeString2(ticker, "lastPrice", "price"),
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => vwap,
    Symbol("previousClose") => prevClose,
    Symbol("change") => changeValue,
    Symbol("percentage") => changePcnt,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchOrderBook(self::Coinsph, symbol, limit=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetOpenapiQuoteV1Depth(extend(request, params)));
    orderbook = self.parseOrderBook(response, symbol);
    orderbook[Symbol("nonce")] = safeInteger(response, "lastUpdateId");
    return orderbook

end
function fetchOHLCV(self::Coinsph, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    interval = safeString(self.timeframes, timeframe);
    until = safeInteger(params, "until");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 1000;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until;
        else
            duration = self.parseTimeframe(timeframe) * 1000;
            endTimeByLimit = self.sum(since, duration * (limit - 1));
            now = milliseconds();
            request[Symbol("endTime")] = min(endTimeByLimit, now);
        end
    elseif functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        duration = self.parseTimeframe(timeframe) * 1000;
        request[Symbol("startTime")] = until - (duration * (limit - 1));
    end
    request[Symbol("limit")] = limit;
    params = omit(params, "until");
    response = Base.fetch(self.publicGetOpenapiQuoteV1Klines(extend(request, params)));
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Coinsph, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchTrades(self::Coinsph, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("limit")] = 1000;
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
    end
    response = Base.fetch(self.publicGetOpenapiQuoteV1Trades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchMyTrades(self::Coinsph, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        request[Symbol("limit")] = 1000;
    elseif functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenapiV1MyTrades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchOrderTrades(self::Coinsph, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a symbol argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    return Base.fetch(self.fetchMyTrades(symbol, since, limit, extend(request, params)))

end
function parseTrade(self::Coinsph, trade, market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    id = safeString2(trade, "id", "tradeId");
    orderId = safeString(trade, "orderId");
    timestamp = safeInteger(trade, "time");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "qty");
    type_var = nothing;
    fee = Dict{Symbol, Any}();
    feeCost = safeString(trade, "commission");
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrencyId = safeString(trade, "commissionAsset");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
        );
    end
    isBuyer = self.safeBool2(trade, "isBuyer", "isBuyerMaker");
    side = nothing;
    if functions.ccxtruthy(isBuyer != nothing)
        side = functions.ccxtruthy((isBuyer)) ? "buy" : "sell";
    end
    isMaker = safeString(trade, "isMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy((isMaker == "true")) ? "maker" : "taker";
    end
    costString = nothing;
    if functions.ccxtruthy(orderId != nothing)
        costString = safeString(trade, "quoteQty");
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchBalance(self::Coinsph, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetOpenapiV1Account(params));
    return self.parseBalance(response)

end
function parseBalance(self::Coinsph, response)
    balances = self.safeList(response, "balances", []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString(balance, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(balance, "free");
        account[Symbol("used")] = safeString(balance, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function createOrder(self::Coinsph, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    testOrder = self.safeBool(params, "test", false);
    params = omit(params, "test");
    orderType = safeString(params, "type", type_var);
    orderType = self.encodeOrderType(orderType);
    params = omit(params, "type");
    orderSide = self.encodeOrderSide(side);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => orderType,
        Symbol("side") => orderSide
    );
    options = safeValue(self.options, "createOrder", Dict{Symbol, Any}());
    newOrderRespType = safeValue(options, "newOrderRespType", Dict{Symbol, Any}());
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(orderType == "LIMIT", orderType == "STOP_LOSS_LIMIT"), orderType == "TAKE_PROFIT_LIMIT"), orderType == "LIMIT_MAKER"))
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        newOrderRespType = safeString(newOrderRespType, "limit", "FULL");
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        if functions.ccxtruthy(orderType != "LIMIT_MAKER")
            request[Symbol("timeInForce")] = safeString(options, "timeInForce", "GTC");
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(orderType == "MARKET", orderType == "STOP_LOSS"), orderType == "TAKE_PROFIT"))
        newOrderRespType = safeString(newOrderRespType, "market", "FULL");
        if functions.ccxtruthy(orderSide == "SELL")
            request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        elseif functions.ccxtruthy(orderSide == "BUY")
            quoteAmount = nothing;
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            cost = self.safeNumber2(params, "cost", "quoteOrderQty");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costRequest = stringMul(amountString, priceString);
                    quoteAmount = self.costToPrecision(symbol, costRequest);
                end
            else
                quoteAmount = self.costToPrecision(symbol, amount);
            end
            request[Symbol("quoteOrderQty")] = quoteAmount;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(orderType == "STOP_LOSS", orderType == "STOP_LOSS_LIMIT"), orderType == "TAKE_PROFIT"), orderType == "TAKE_PROFIT_LIMIT"))
        triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(InvalidOrder(string(self.id, " createOrder () requires a triggerPrice or stopPrice param for stop_loss, take_profit, stop_loss_limit, and take_profit_limit orders")));
        end
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
    end
    request[Symbol("newOrderRespType")] = newOrderRespType;
    params = omit(params, "price", "stopPrice", "triggerPrice", "quantity", "quoteOrderQty");
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(testOrder)
        response = Base.fetch(self.privatePostOpenapiV1OrderTest(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOpenapiV1Order(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function fetchOrder(self::Coinsph, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeValue2(params, "origClientOrderId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["clientOrderId", "origClientOrderId"]);
    response = Base.fetch(self.privateGetOpenapiV1Order(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOpenOrders(self::Coinsph, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOpenapiV1OpenOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchClosedOrders(self::Coinsph, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        request[Symbol("limit")] = 1000;
    elseif functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenapiV1HistoryOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function cancelOrder(self::Coinsph, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeValue2(params, "origClientOrderId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["clientOrderId", "origClientOrderId"]);
    response = Base.fetch(self.privateDeleteOpenapiV1Order(extend(request, params)));
    return self.parseOrder(response)

end
function cancelAllOrders(self::Coinsph, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateDeleteOpenapiV1OpenOrders(extend(request, params)));
    return self.parseOrders(response, market)

end
function parseOrder(self::Coinsph, order, market=nothing)
    id = safeString(order, "orderId");
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger2(order, "time", "transactTime");
    trades = safeValue(order, "fills");
    triggerPrice = safeString(order, "stopPrice");
    if functions.ccxtruthy(stringEq(triggerPrice, "0"))
        triggerPrice = nothing;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(safeString(order, "type")),
    Symbol("timeInForce") => self.parseOrderTimeInForce(safeString(order, "timeInForce")),
    Symbol("side") => self.parseOrderSide(safeString(order, "side")),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("average") => nothing,
    Symbol("amount") => safeString(order, "origQty"),
    Symbol("cost") => safeString(order, "cummulativeQuoteQty"),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("trades") => trades,
    Symbol("info") => order
), market)

end
function parseOrderSide(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("BUY") => "buy",
        Symbol("SELL") => "sell"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function encodeOrderSide(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("buy") => "BUY",
        Symbol("sell") => "SELL"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrderType(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("LIMIT_MAKER") => "limit",
        Symbol("STOP_LOSS") => "market",
        Symbol("STOP_LOSS_LIMIT") => "limit",
        Symbol("TAKE_PROFIT") => "market",
        Symbol("TAKE_PROFIT_LIMIT") => "limit"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function encodeOrderType(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("market") => "MARKET",
        Symbol("limit") => "LIMIT",
        Symbol("limit_maker") => "LIMIT_MAKER",
        Symbol("stop_loss") => "STOP_LOSS",
        Symbol("stop_loss_limit") => "STOP_LOSS_LIMIT",
        Symbol("take_profit") => "TAKE_PROFIT",
        Symbol("take_profit_limit") => "TAKE_PROFIT_LIMIT"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrderStatus(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("PARTIALLY_CANCELED") => "canceled",
        Symbol("REJECTED") => "rejected"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrderTimeInForce(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("GTC") => "GTC",
        Symbol("FOK") => "FOK",
        Symbol("IOC") => "IOC"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function fetchTradingFee(self::Coinsph, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetOpenapiV1AssetTradeFee(extend(request, params)));
    tradingFee = self.safeDict(response, 0, Dict{Symbol, Any}());
    return self.parseTradingFee(tradingFee, market)

end
function fetchTradingFees(self::Coinsph, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetOpenapiV1AssetTradeFee(params));
    result = Dict{Symbol, Any}();
    fees = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = fee;
        end
        i += 1
    end
    return result

end
function parseTradingFee(self::Coinsph, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerCommission"),
    Symbol("taker") => self.safeNumber(fee, "takerCommission"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function withdraw(self::Coinsph, code, amount, address, tag=nothing, params=Dict())
    options = safeValue(self.options, "withdraw");
    warning = self.safeBool(options, "warning", true);
    if functions.ccxtruthy(warning)
        throw(InvalidAddress(string(self.id, " withdraw() makes a withdrawals only to coins_ph account, add .options['withdraw']['warning'] = false to make a withdrawal to your coins_ph account")));
    end
    networkCode = safeString(params, "network");
    networkId = functions.ccxtruthy((networkCode == nothing)) ? nothing : self.networkCodeToId(networkCode, code);
    if functions.ccxtruthy(networkId == nothing)
        throw(BadRequest(string(self.id, " withdraw() require network parameter")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount),
        Symbol("network") => networkId,
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("withdrawOrderId")] = tag;
    end
    params = omit(params, "network");
    response = Base.fetch(self.privatePostOpenapiWalletV1WithdrawApply(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function fetchDeposits(self::Coinsph, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenapiWalletV1DepositHistory(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawals(self::Coinsph, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOpenapiWalletV1WithdrawHistory(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function parseTransaction(self::Coinsph, transaction, currency=nothing)
    id = safeString(transaction, "id");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "addressTag");
    if functions.ccxtruthy(tag != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(tag), 1))
            tag = nothing;
        end
    end
    txid = safeString(transaction, "txId");
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = nothing;
    timestamp = safeInteger2(transaction, "insertTime", "applyTime");
    updated = nothing;
    type_var = nothing;
    withdrawOrderId = safeString(transaction, "withdrawOrderId");
    depositOrderId = safeString(transaction, "depositOrderId");
    if functions.ccxtruthy(withdrawOrderId != nothing)
        type_var = "withdrawal";
    elseif functions.ccxtruthy(depositOrderId != nothing)
        type_var = "deposit";
    end
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    amount = self.safeNumber(transaction, "amount");
    feeCost = self.safeNumber(transaction, "transactionFee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    network = safeString(transaction, "network");
    internal = network == "Internal";
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => network,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("internal") => internal,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Coinsph, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "ok",
        Symbol("2") => "failed",
        Symbol("3") => "pending"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function fetchDepositAddress(self::Coinsph, code, params=Dict())
    networkCode = safeString(params, "network");
    networkId = functions.ccxtruthy((networkCode == nothing)) ? nothing : self.networkCodeToId(networkCode, code);
    if functions.ccxtruthy(networkId == nothing)
        throw(BadRequest(string(self.id, " fetchDepositAddress() require network parameter")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("network") => networkId
    );
    params = omit(params, "network");
    response = Base.fetch(self.privateGetOpenapiWalletV1DepositAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency)

end
function parseDepositAddress(self::Coinsph, depositAddress, currency=nothing)
    currencyId = safeString(depositAddress, "coin");
    parsedCurrency = self.safeCurrencyCode(currencyId, currency);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => parsedCurrency,
    Symbol("network") => nothing,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "addressTag")
)

end
function urlEncodeQuery(self::Coinsph, query=Dict())
    encodedArrayParams = "";
    keys_var = objectKeys(query);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(functions.ccxt_isArray(get(query, Symbol(key), nothing)))
            if functions.ccxtruthy(i != 0)
                encodedArrayParams += "&";
            end
            innerArray = get(query, Symbol(key), nothing);
            query = omit(query, key);
            encodedArrayParam = self.parseArrayParam(innerArray, key);
            encodedArrayParams += encodedArrayParam;
        end
        i += 1
    end
    encodedQuery = self.urlencode(query);
    if functions.ccxtruthy(length(encodedQuery) != 0)
            return string(encodedQuery, "&", encodedArrayParams)
    else
        return encodedArrayParams
    end

end
function parseArrayParam(self::Coinsph, array, key)
    stringifiedArray = json(array);
    stringifiedArray = replace(stringifiedArray, "[" => "%5B");
    stringifiedArray = replace(stringifiedArray, "]" => "%5D");
    urlEncodedParam = string(key, "=", stringifiedArray);
    return urlEncodedParam

end
function sign(self::Coinsph, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    query = omit(params, self.extractParams(path));
    endpoint = self.implodeParams(path, params);
    url = string(url, "/", endpoint);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        query[Symbol("timestamp")] = milliseconds();
        recvWindow = safeInteger(query, "recvWindow");
        if functions.ccxtruthy(recvWindow == nothing)
            defaultRecvWindow = safeInteger(self.options, "recvWindow");
            if functions.ccxtruthy(defaultRecvWindow != nothing)
                query[Symbol("recvWindow")] = defaultRecvWindow;
            end
        end
        query = self.urlEncodeQuery(query);
        signature = self.hmac(self.encode(query), self.encode(self.secret), sha256);
        url = string(url, "?", query, "&signature=", signature);
        headers = Dict{Symbol, Any}(
            Symbol("X-COINS-APIKEY") => self.apiKey
        );
    else
        query = self.urlEncodeQuery(query);
        if functions.ccxtruthy(length(query) != 0)
            url += string("?", query);
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinsph, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    responseCode = safeString(response, "code");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((responseCode != nothing), (responseCode != "200")), (responseCode != "0")))
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), responseCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinsph, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOpenapiV1Ping(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/ping", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiV1Time(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiV1UserIp(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/user/ip", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1Ticker24hr(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/ticker/24hr", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1TickerPrice(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/ticker/price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1TickerBookTicker(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/ticker/bookTicker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiV1ExchangeInfo(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/exchangeInfo", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1Depth(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1Klines(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/klines", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1Trades(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiV1Pairs(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/pairs", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOpenapiQuoteV1AvgPrice(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/quote/v1/avgPrice", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1CheckSysStatus(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/check-sys-status", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiWalletV1ConfigGetall(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/config/getall", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiWalletV1DepositAddress(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/deposit/address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiWalletV1DepositHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/deposit/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiWalletV1WithdrawHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/withdraw/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiWalletV1WithdrawAddressWhitelist(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/withdraw/address-whitelist", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1Account(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1ApiKeys(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/api-keys", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1OpenOrders(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/openOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1AssetTradeFee(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/asset/tradeFee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1Order(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1HistoryOrders(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/historyOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1MyTrades(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/myTrades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1CapitalDepositHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/capital/deposit/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1CapitalWithdrawHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/capital/withdraw/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV3PaymentRequestGetPaymentRequest(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v3/payment-request/get-payment-request", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMerchantApiV1GetInvoices(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "merchant-api/v1/get-invoices", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiAccountV3CryptoAccounts(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/account/v3/crypto-accounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiTransferV3TransfersId(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/transfer/v3/transfers/{id}", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountList(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountAsset(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/asset", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountTransferUniversalTransferHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/transfer/universal-transfer-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountTransferSubHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/transfer/sub-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountApikeyIpRestriction(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/apikey/ip-restriction", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountWalletDepositAddress(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/wallet/deposit/address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1SubAccountWalletDepositHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/wallet/deposit/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1FundCollectGetFundRecord(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/fund-collect/get-fund-record", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenapiV1AssetTransactionHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/asset/transaction/history", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostOpenapiWalletV1WithdrawApply(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/wallet/v1/withdraw/apply", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1OrderTest(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/order/test", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1Order(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1OrderCancelReplace(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/order/cancelReplace", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1CapitalWithdrawApply(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/capital/withdraw/apply", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1CapitalDepositApply(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/capital/deposit/apply", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV3PaymentRequestPaymentRequests(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v3/payment-request/payment-requests", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV3PaymentRequestDeletePaymentRequest(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v3/payment-request/delete-payment-request", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV3PaymentRequestPaymentRequestReminder(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v3/payment-request/payment-request-reminder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1UserDataStream(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/userDataStream", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMerchantApiV1Invoices(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "merchant-api/v1/invoices", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostMerchantApiV1InvoicesCancel(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "merchant-api/v1/invoices-cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiConvertV1GetSupportedTradingPairs(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/convert/v1/get-supported-trading-pairs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiConvertV1GetQuote(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/convert/v1/get-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiConvertV1AcceptQuote(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/convert/v1/accept-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiConvertV1QueryOrderHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/convert/v1/query-order-history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiOtcTradeV1GetSupportedTradingPairs(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/otc-trade/v1/get-supported-trading-pairs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiOtcTradeV1CreateRfq(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/otc-trade/v1/create-rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiOtcTradeV1AcceptRfq(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/otc-trade/v1/accept-rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiOtcTradeV1ManualSettle(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/otc-trade/v1/manual-settle", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiOtcTradeV1QueryOrderHistory(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/otc-trade/v1/query-order-history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiFiatV1SupportChannel(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/fiat/v1/support-channel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiFiatV1CashOut(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/fiat/v1/cash-out", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiFiatV1History(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/fiat/v1/history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiMigrationV4Sellorder(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/migration/v4/sellorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiMigrationV4ValidateField(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/migration/v4/validate-field", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiTransferV3Transfers(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/transfer/v3/transfers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiTransferV4Transfers(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/transfer/v4/transfers", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1SubAccountCreate(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1SubAccountTransferUniversalTransfer(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/transfer/universal-transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1SubAccountTransferSubToMaster(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/transfer/sub-to-master", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1SubAccountApikeyAddIpRestriction(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/apikey/add-ip-restriction", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1SubAccountApikeyDeleteIpRestriction(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/sub-account/apikey/delete-ip-restriction", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOpenapiV1FundCollectCollectFromSubAccount(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/fund-collect/collect-from-sub-account", "private", "POST", params, nothing, nothing, Dict())
end

function privatePutOpenapiV1UserDataStream(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/userDataStream", "private", "PUT", params, nothing, nothing, Dict())
end

function privateDeleteOpenapiV1Order(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOpenapiV1OpenOrders(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/openOrders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOpenapiV1UserDataStream(self::Coinsph, params=Dict(), context=Dict())
    return request(self, "openapi/v1/userDataStream", "private", "DELETE", params, nothing, nothing, Dict())
end

function Coinsph(; kwargs...)
    inst = Coinsph(Exchange(), describe, fetchCurrencies, parseCurrency, calculateRateLimiterCost, fetchStatus, fetchTime, fetchMarkets, fetchTickers, fetchTicker, parseTicker, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchTrades, fetchMyTrades, fetchOrderTrades, parseTrade, fetchBalance, parseBalance, createOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders, cancelOrder, cancelAllOrders, parseOrder, parseOrderSide, encodeOrderSide, parseOrderType, encodeOrderType, parseOrderStatus, parseOrderTimeInForce, fetchTradingFee, fetchTradingFees, parseTradingFee, withdraw, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, fetchDepositAddress, parseDepositAddress, urlEncodeQuery, parseArrayParam, sign, handleErrors, publicGetOpenapiV1Ping, publicGetOpenapiV1Time, publicGetOpenapiV1UserIp, publicGetOpenapiQuoteV1Ticker24hr, publicGetOpenapiQuoteV1TickerPrice, publicGetOpenapiQuoteV1TickerBookTicker, publicGetOpenapiV1ExchangeInfo, publicGetOpenapiQuoteV1Depth, publicGetOpenapiQuoteV1Klines, publicGetOpenapiQuoteV1Trades, publicGetOpenapiV1Pairs, publicGetOpenapiQuoteV1AvgPrice, privateGetOpenapiV1CheckSysStatus, privateGetOpenapiWalletV1ConfigGetall, privateGetOpenapiWalletV1DepositAddress, privateGetOpenapiWalletV1DepositHistory, privateGetOpenapiWalletV1WithdrawHistory, privateGetOpenapiWalletV1WithdrawAddressWhitelist, privateGetOpenapiV1Account, privateGetOpenapiV1ApiKeys, privateGetOpenapiV1OpenOrders, privateGetOpenapiV1AssetTradeFee, privateGetOpenapiV1Order, privateGetOpenapiV1HistoryOrders, privateGetOpenapiV1MyTrades, privateGetOpenapiV1CapitalDepositHistory, privateGetOpenapiV1CapitalWithdrawHistory, privateGetOpenapiV3PaymentRequestGetPaymentRequest, privateGetMerchantApiV1GetInvoices, privateGetOpenapiAccountV3CryptoAccounts, privateGetOpenapiTransferV3TransfersId, privateGetOpenapiV1SubAccountList, privateGetOpenapiV1SubAccountAsset, privateGetOpenapiV1SubAccountTransferUniversalTransferHistory, privateGetOpenapiV1SubAccountTransferSubHistory, privateGetOpenapiV1SubAccountApikeyIpRestriction, privateGetOpenapiV1SubAccountWalletDepositAddress, privateGetOpenapiV1SubAccountWalletDepositHistory, privateGetOpenapiV1FundCollectGetFundRecord, privateGetOpenapiV1AssetTransactionHistory, privatePostOpenapiWalletV1WithdrawApply, privatePostOpenapiV1OrderTest, privatePostOpenapiV1Order, privatePostOpenapiV1OrderCancelReplace, privatePostOpenapiV1CapitalWithdrawApply, privatePostOpenapiV1CapitalDepositApply, privatePostOpenapiV3PaymentRequestPaymentRequests, privatePostOpenapiV3PaymentRequestDeletePaymentRequest, privatePostOpenapiV3PaymentRequestPaymentRequestReminder, privatePostOpenapiV1UserDataStream, privatePostMerchantApiV1Invoices, privatePostMerchantApiV1InvoicesCancel, privatePostOpenapiConvertV1GetSupportedTradingPairs, privatePostOpenapiConvertV1GetQuote, privatePostOpenapiConvertV1AcceptQuote, privatePostOpenapiConvertV1QueryOrderHistory, privatePostOpenapiOtcTradeV1GetSupportedTradingPairs, privatePostOpenapiOtcTradeV1CreateRfq, privatePostOpenapiOtcTradeV1AcceptRfq, privatePostOpenapiOtcTradeV1ManualSettle, privatePostOpenapiOtcTradeV1QueryOrderHistory, privatePostOpenapiFiatV1SupportChannel, privatePostOpenapiFiatV1CashOut, privatePostOpenapiFiatV1History, privatePostOpenapiMigrationV4Sellorder, privatePostOpenapiMigrationV4ValidateField, privatePostOpenapiTransferV3Transfers, privatePostOpenapiTransferV4Transfers, privatePostOpenapiV1SubAccountCreate, privatePostOpenapiV1SubAccountTransferUniversalTransfer, privatePostOpenapiV1SubAccountTransferSubToMaster, privatePostOpenapiV1SubAccountApikeyAddIpRestriction, privatePostOpenapiV1SubAccountApikeyDeleteIpRestriction, privatePostOpenapiV1FundCollectCollectFromSubAccount, privatePutOpenapiV1UserDataStream, privateDeleteOpenapiV1Order, privateDeleteOpenapiV1OpenOrders, privateDeleteOpenapiV1UserDataStream)
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
