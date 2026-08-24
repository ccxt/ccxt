@kwdef mutable struct Bitmart <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchContractMarkets::Function = fetchContractMarkets
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    getCurrencyIdFromCodeAndNetwork::Function = getCurrencyIdFromCodeAndNetwork
    fetchTransactionFee::Function = fetchTransactionFee
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFee::Function = fetchDepositWithdrawFee
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    customParseBalance::Function = customParseBalance
    parseBalanceHelper::Function = parseBalanceHelper
    fetchBalance::Function = fetchBalance
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    parseOrder::Function = parseOrder
    parseOrderSide::Function = parseOrderSide
    parseOrderStatusByType::Function = parseOrderStatusByType
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    createSwapOrderRequest::Function = createSwapOrderRequest
    createSpotOrderRequest::Function = createSpotOrderRequest
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOrder::Function = fetchOrder
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    withdraw::Function = withdraw
    fetchTransactionsByType::Function = fetchTransactionsByType
    fetchDeposit::Function = fetchDeposit
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawal::Function = fetchWithdrawal
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    repayIsolatedMargin::Function = repayIsolatedMargin
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchIsolatedBorrowRate::Function = fetchIsolatedBorrowRate
    parseIsolatedBorrowRate::Function = parseIsolatedBorrowRate
    fetchIsolatedBorrowRates::Function = fetchIsolatedBorrowRates
    transfer::Function = transfer
    parseTransferStatus::Function = parseTransferStatus
    parseTransferToAccount::Function = parseTransferToAccount
    parseTransferFromAccount::Function = parseTransferFromAccount
    parseTransfer::Function = parseTransfer
    fetchTransfers::Function = fetchTransfers
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    setLeverage::Function = setLeverage
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    editOrder::Function = editOrder
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchTransactionsRequest::Function = fetchTransactionsRequest
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    fetchWithdrawAddresses::Function = fetchWithdrawAddresses
    setPositionMode::Function = setPositionMode
    fetchPositionMode::Function = fetchPositionMode
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetSystemTime::Function = publicGetSystemTime
    publicGetSystemService::Function = publicGetSystemService
    publicGetSpotV1Currencies::Function = publicGetSpotV1Currencies
    publicGetSpotV1Symbols::Function = publicGetSpotV1Symbols
    publicGetSpotV1SymbolsDetails::Function = publicGetSpotV1SymbolsDetails
    publicGetSpotQuotationV3Tickers::Function = publicGetSpotQuotationV3Tickers
    publicGetSpotQuotationV3Ticker::Function = publicGetSpotQuotationV3Ticker
    publicGetSpotQuotationV3LiteKlines::Function = publicGetSpotQuotationV3LiteKlines
    publicGetSpotQuotationV3Klines::Function = publicGetSpotQuotationV3Klines
    publicGetSpotQuotationV3Books::Function = publicGetSpotQuotationV3Books
    publicGetSpotQuotationV3Trades::Function = publicGetSpotQuotationV3Trades
    publicGetSpotV1Ticker::Function = publicGetSpotV1Ticker
    publicGetSpotV2Ticker::Function = publicGetSpotV2Ticker
    publicGetSpotV1TickerDetail::Function = publicGetSpotV1TickerDetail
    publicGetSpotV1Steps::Function = publicGetSpotV1Steps
    publicGetSpotV1SymbolsKline::Function = publicGetSpotV1SymbolsKline
    publicGetSpotV1SymbolsBook::Function = publicGetSpotV1SymbolsBook
    publicGetSpotV1SymbolsTrades::Function = publicGetSpotV1SymbolsTrades
    publicGetContractV1Tickers::Function = publicGetContractV1Tickers
    publicGetContractPublicDetails::Function = publicGetContractPublicDetails
    publicGetContractPublicDepth::Function = publicGetContractPublicDepth
    publicGetContractPublicOpenInterest::Function = publicGetContractPublicOpenInterest
    publicGetContractPublicFundingRate::Function = publicGetContractPublicFundingRate
    publicGetContractPublicFundingRateHistory::Function = publicGetContractPublicFundingRateHistory
    publicGetContractPublicKline::Function = publicGetContractPublicKline
    publicGetAccountV1Currencies::Function = publicGetAccountV1Currencies
    publicGetContractPublicMarkpriceKline::Function = publicGetContractPublicMarkpriceKline
    privateGetAccountSubAccountV1TransferList::Function = privateGetAccountSubAccountV1TransferList
    privateGetAccountSubAccountV1TransferHistory::Function = privateGetAccountSubAccountV1TransferHistory
    privateGetAccountSubAccountMainV1Wallet::Function = privateGetAccountSubAccountMainV1Wallet
    privateGetAccountSubAccountMainV1SubaccountList::Function = privateGetAccountSubAccountMainV1SubaccountList
    privateGetAccountContractSubAccountMainV1Wallet::Function = privateGetAccountContractSubAccountMainV1Wallet
    privateGetAccountContractSubAccountMainV1TransferList::Function = privateGetAccountContractSubAccountMainV1TransferList
    privateGetAccountContractSubAccountV1TransferHistory::Function = privateGetAccountContractSubAccountV1TransferHistory
    privateGetAccountV1Wallet::Function = privateGetAccountV1Wallet
    privateGetAccountV1Currencies::Function = privateGetAccountV1Currencies
    privateGetSpotV1Wallet::Function = privateGetSpotV1Wallet
    privateGetAccountV1DepositAddress::Function = privateGetAccountV1DepositAddress
    privateGetAccountV1WithdrawCharge::Function = privateGetAccountV1WithdrawCharge
    privateGetAccountV2DepositWithdrawHistory::Function = privateGetAccountV2DepositWithdrawHistory
    privateGetAccountV1DepositWithdrawDetail::Function = privateGetAccountV1DepositWithdrawDetail
    privateGetAccountV1WithdrawAddressList::Function = privateGetAccountV1WithdrawAddressList
    privateGetSpotV1OrderDetail::Function = privateGetSpotV1OrderDetail
    privateGetSpotV2Orders::Function = privateGetSpotV2Orders
    privateGetSpotV1Trades::Function = privateGetSpotV1Trades
    privateGetSpotV2Trades::Function = privateGetSpotV2Trades
    privateGetSpotV3Orders::Function = privateGetSpotV3Orders
    privateGetSpotV2OrderDetail::Function = privateGetSpotV2OrderDetail
    privateGetSpotV1MarginIsolatedBorrowRecord::Function = privateGetSpotV1MarginIsolatedBorrowRecord
    privateGetSpotV1MarginIsolatedRepayRecord::Function = privateGetSpotV1MarginIsolatedRepayRecord
    privateGetSpotV1MarginIsolatedPairs::Function = privateGetSpotV1MarginIsolatedPairs
    privateGetSpotV1MarginIsolatedAccount::Function = privateGetSpotV1MarginIsolatedAccount
    privateGetSpotV1TradeFee::Function = privateGetSpotV1TradeFee
    privateGetSpotV1UserFee::Function = privateGetSpotV1UserFee
    privateGetSpotV1BrokerRebate::Function = privateGetSpotV1BrokerRebate
    privateGetContractPrivateAssetsDetail::Function = privateGetContractPrivateAssetsDetail
    privateGetContractPrivateOrder::Function = privateGetContractPrivateOrder
    privateGetContractPrivateOrderHistory::Function = privateGetContractPrivateOrderHistory
    privateGetContractPrivatePosition::Function = privateGetContractPrivatePosition
    privateGetContractPrivatePositionV2::Function = privateGetContractPrivatePositionV2
    privateGetContractPrivateGetOpenOrders::Function = privateGetContractPrivateGetOpenOrders
    privateGetContractPrivateCurrentPlanOrder::Function = privateGetContractPrivateCurrentPlanOrder
    privateGetContractPrivateTrades::Function = privateGetContractPrivateTrades
    privateGetContractPrivatePositionRisk::Function = privateGetContractPrivatePositionRisk
    privateGetContractPrivateAffilateRebateList::Function = privateGetContractPrivateAffilateRebateList
    privateGetContractPrivateAffilateTradeList::Function = privateGetContractPrivateAffilateTradeList
    privateGetContractPrivateTransactionHistory::Function = privateGetContractPrivateTransactionHistory
    privateGetContractPrivateGetPositionMode::Function = privateGetContractPrivateGetPositionMode
    privatePostAccountSubAccountMainV1SubToMain::Function = privatePostAccountSubAccountMainV1SubToMain
    privatePostAccountSubAccountSubV1SubToMain::Function = privatePostAccountSubAccountSubV1SubToMain
    privatePostAccountSubAccountMainV1MainToSub::Function = privatePostAccountSubAccountMainV1MainToSub
    privatePostAccountSubAccountSubV1SubToSub::Function = privatePostAccountSubAccountSubV1SubToSub
    privatePostAccountSubAccountMainV1SubToSub::Function = privatePostAccountSubAccountMainV1SubToSub
    privatePostAccountContractSubAccountMainV1SubToMain::Function = privatePostAccountContractSubAccountMainV1SubToMain
    privatePostAccountContractSubAccountMainV1MainToSub::Function = privatePostAccountContractSubAccountMainV1MainToSub
    privatePostAccountContractSubAccountSubV1SubToMain::Function = privatePostAccountContractSubAccountSubV1SubToMain
    privatePostAccountV1WithdrawApply::Function = privatePostAccountV1WithdrawApply
    privatePostSpotV1SubmitOrder::Function = privatePostSpotV1SubmitOrder
    privatePostSpotV1BatchOrders::Function = privatePostSpotV1BatchOrders
    privatePostSpotV2CancelOrder::Function = privatePostSpotV2CancelOrder
    privatePostSpotV1CancelOrders::Function = privatePostSpotV1CancelOrders
    privatePostSpotV4QueryOrder::Function = privatePostSpotV4QueryOrder
    privatePostSpotV4QueryClientOrder::Function = privatePostSpotV4QueryClientOrder
    privatePostSpotV4QueryOpenOrders::Function = privatePostSpotV4QueryOpenOrders
    privatePostSpotV4QueryHistoryOrders::Function = privatePostSpotV4QueryHistoryOrders
    privatePostSpotV4QueryTrades::Function = privatePostSpotV4QueryTrades
    privatePostSpotV4QueryOrderTrades::Function = privatePostSpotV4QueryOrderTrades
    privatePostSpotV4CancelOrders::Function = privatePostSpotV4CancelOrders
    privatePostSpotV4CancelAll::Function = privatePostSpotV4CancelAll
    privatePostSpotV4BatchOrders::Function = privatePostSpotV4BatchOrders
    privatePostSpotV4AlgoSubmitOrder::Function = privatePostSpotV4AlgoSubmitOrder
    privatePostSpotV4AlgoCancelOrder::Function = privatePostSpotV4AlgoCancelOrder
    privatePostSpotV4AlgoCancelAll::Function = privatePostSpotV4AlgoCancelAll
    privatePostSpotV4QueryAlgoOrder::Function = privatePostSpotV4QueryAlgoOrder
    privatePostSpotV4QueryAlgoClientOrder::Function = privatePostSpotV4QueryAlgoClientOrder
    privatePostSpotV4QueryAlgoOpenOrders::Function = privatePostSpotV4QueryAlgoOpenOrders
    privatePostSpotV4QueryAlgoHistoryOrders::Function = privatePostSpotV4QueryAlgoHistoryOrders
    privatePostSpotV3CancelOrder::Function = privatePostSpotV3CancelOrder
    privatePostSpotV2BatchOrders::Function = privatePostSpotV2BatchOrders
    privatePostSpotV2SubmitOrder::Function = privatePostSpotV2SubmitOrder
    privatePostSpotV1MarginSubmitOrder::Function = privatePostSpotV1MarginSubmitOrder
    privatePostSpotV1MarginIsolatedBorrow::Function = privatePostSpotV1MarginIsolatedBorrow
    privatePostSpotV1MarginIsolatedRepay::Function = privatePostSpotV1MarginIsolatedRepay
    privatePostSpotV1MarginIsolatedTransfer::Function = privatePostSpotV1MarginIsolatedTransfer
    privatePostAccountV1TransferContractList::Function = privatePostAccountV1TransferContractList
    privatePostAccountV1TransferContract::Function = privatePostAccountV1TransferContract
    privatePostContractPrivateSubmitOrder::Function = privatePostContractPrivateSubmitOrder
    privatePostContractPrivateCancelOrder::Function = privatePostContractPrivateCancelOrder
    privatePostContractPrivateCancelOrders::Function = privatePostContractPrivateCancelOrders
    privatePostContractPrivateSubmitPlanOrder::Function = privatePostContractPrivateSubmitPlanOrder
    privatePostContractPrivateCancelPlanOrder::Function = privatePostContractPrivateCancelPlanOrder
    privatePostContractPrivateSubmitLeverage::Function = privatePostContractPrivateSubmitLeverage
    privatePostContractPrivateSubmitTpSlOrder::Function = privatePostContractPrivateSubmitTpSlOrder
    privatePostContractPrivateModifyPlanOrder::Function = privatePostContractPrivateModifyPlanOrder
    privatePostContractPrivateModifyPresetPlanOrder::Function = privatePostContractPrivateModifyPresetPlanOrder
    privatePostContractPrivateModifyLimitOrder::Function = privatePostContractPrivateModifyLimitOrder
    privatePostContractPrivateModifyTpSlOrder::Function = privatePostContractPrivateModifyTpSlOrder
    privatePostContractPrivateSubmitTrailOrder::Function = privatePostContractPrivateSubmitTrailOrder
    privatePostContractPrivateCancelTrailOrder::Function = privatePostContractPrivateCancelTrailOrder
    privatePostContractPrivateSetPositionMode::Function = privatePostContractPrivateSetPositionMode

end
function describe(self::Bitmart, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitmart",
    Symbol("name") => "BitMart",
    Symbol("countries") => ["US", "CN", "HK", "KR"],
    Symbol("rateLimit") => 33.34,
    Symbol("version") => "v2",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => true,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIsolatedBorrowRate") => true,
        Symbol("fetchIsolatedBorrowRates") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => false,
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
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFee") => true,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawAddresses") => true,
        Symbol("fetchWithdrawAddressesByNetwork") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("hostname") => "bitmart.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/3741e8c0-83a8-4504-ae68-32b00e3c27ee",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api-cloud.{hostname}",
            Symbol("swap") => "https://api-cloud-v2.{hostname}"
        ),
        Symbol("www") => "https://www.bitmart.com/",
        Symbol("doc") => "https://developer-pro.bitmart.com/",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "http://www.bitmart.com/?r=rQCFLh",
            Symbol("discount") => 0.3
        ),
        Symbol("fees") => "https://www.bitmart.com/fee/en"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("uid") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("system/time") => 3,
                Symbol("system/service") => 3,
                Symbol("spot/v1/currencies") => 7.5,
                Symbol("spot/v1/symbols") => 7.5,
                Symbol("spot/v1/symbols/details") => 5,
                Symbol("spot/quotation/v3/tickers") => 6,
                Symbol("spot/quotation/v3/ticker") => 4,
                Symbol("spot/quotation/v3/lite-klines") => 5,
                Symbol("spot/quotation/v3/klines") => 7,
                Symbol("spot/quotation/v3/books") => 4,
                Symbol("spot/quotation/v3/trades") => 4,
                Symbol("spot/v1/ticker") => 5,
                Symbol("spot/v2/ticker") => 30,
                Symbol("spot/v1/ticker_detail") => 5,
                Symbol("spot/v1/steps") => 30,
                Symbol("spot/v1/symbols/kline") => 6,
                Symbol("spot/v1/symbols/book") => 5,
                Symbol("spot/v1/symbols/trades") => 5,
                Symbol("contract/v1/tickers") => 15,
                Symbol("contract/public/details") => 5,
                Symbol("contract/public/depth") => 5,
                Symbol("contract/public/open-interest") => 30,
                Symbol("contract/public/funding-rate") => 30,
                Symbol("contract/public/funding-rate-history") => 30,
                Symbol("contract/public/kline") => 6,
                Symbol("account/v1/currencies") => 30,
                Symbol("contract/public/markprice-kline") => 5
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/sub-account/v1/transfer-list") => 7.5,
                Symbol("account/sub-account/v1/transfer-history") => 7.5,
                Symbol("account/sub-account/main/v1/wallet") => 5,
                Symbol("account/sub-account/main/v1/subaccount-list") => 7.5,
                Symbol("account/contract/sub-account/main/v1/wallet") => 5,
                Symbol("account/contract/sub-account/main/v1/transfer-list") => 7.5,
                Symbol("account/contract/sub-account/v1/transfer-history") => 7.5,
                Symbol("account/v1/wallet") => 5,
                Symbol("account/v1/currencies") => 30,
                Symbol("spot/v1/wallet") => 5,
                Symbol("account/v1/deposit/address") => 30,
                Symbol("account/v1/withdraw/charge") => 32,
                Symbol("account/v2/deposit-withdraw/history") => 7.5,
                Symbol("account/v1/deposit-withdraw/detail") => 7.5,
                Symbol("account/v1/withdraw/address/list") => 30,
                Symbol("spot/v1/order_detail") => 1,
                Symbol("spot/v2/orders") => 5,
                Symbol("spot/v1/trades") => 5,
                Symbol("spot/v2/trades") => 4,
                Symbol("spot/v3/orders") => 5,
                Symbol("spot/v2/order_detail") => 1,
                Symbol("spot/v1/margin/isolated/borrow_record") => 1,
                Symbol("spot/v1/margin/isolated/repay_record") => 1,
                Symbol("spot/v1/margin/isolated/pairs") => 30,
                Symbol("spot/v1/margin/isolated/account") => 5,
                Symbol("spot/v1/trade_fee") => 30,
                Symbol("spot/v1/user_fee") => 30,
                Symbol("spot/v1/broker/rebate") => 1,
                Symbol("contract/private/assets-detail") => 5,
                Symbol("contract/private/order") => 1.2,
                Symbol("contract/private/order-history") => 10,
                Symbol("contract/private/position") => 10,
                Symbol("contract/private/position-v2") => 10,
                Symbol("contract/private/get-open-orders") => 1.2,
                Symbol("contract/private/current-plan-order") => 1.2,
                Symbol("contract/private/trades") => 10,
                Symbol("contract/private/position-risk") => 10,
                Symbol("contract/private/affilate/rebate-list") => 10,
                Symbol("contract/private/affilate/trade-list") => 10,
                Symbol("contract/private/transaction-history") => 10,
                Symbol("contract/private/get-position-mode") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/sub-account/main/v1/sub-to-main") => 30,
                Symbol("account/sub-account/sub/v1/sub-to-main") => 30,
                Symbol("account/sub-account/main/v1/main-to-sub") => 30,
                Symbol("account/sub-account/sub/v1/sub-to-sub") => 30,
                Symbol("account/sub-account/main/v1/sub-to-sub") => 30,
                Symbol("account/contract/sub-account/main/v1/sub-to-main") => 7.5,
                Symbol("account/contract/sub-account/main/v1/main-to-sub") => 7.5,
                Symbol("account/contract/sub-account/sub/v1/sub-to-main") => 7.5,
                Symbol("account/v1/withdraw/apply") => 7.5,
                Symbol("spot/v1/submit_order") => 1,
                Symbol("spot/v1/batch_orders") => 1,
                Symbol("spot/v2/cancel_order") => 1,
                Symbol("spot/v1/cancel_orders") => 15,
                Symbol("spot/v4/query/order") => 1,
                Symbol("spot/v4/query/client-order") => 1,
                Symbol("spot/v4/query/open-orders") => 5,
                Symbol("spot/v4/query/history-orders") => 5,
                Symbol("spot/v4/query/trades") => 5,
                Symbol("spot/v4/query/order-trades") => 5,
                Symbol("spot/v4/cancel_orders") => 3,
                Symbol("spot/v4/cancel_all") => 90,
                Symbol("spot/v4/batch_orders") => 3,
                Symbol("spot/v4/algo/submit_order") => 6,
                Symbol("spot/v4/algo/cancel_order") => 6,
                Symbol("spot/v4/algo/cancel_all") => 12,
                Symbol("spot/v4/query/algo/order") => 1.5,
                Symbol("spot/v4/query/algo/client-order") => 1.5,
                Symbol("spot/v4/query/algo/open-orders") => 3,
                Symbol("spot/v4/query/algo/history-orders") => 3,
                Symbol("spot/v3/cancel_order") => 1,
                Symbol("spot/v2/batch_orders") => 1,
                Symbol("spot/v2/submit_order") => 1,
                Symbol("spot/v1/margin/submit_order") => 1.5,
                Symbol("spot/v1/margin/isolated/borrow") => 30,
                Symbol("spot/v1/margin/isolated/repay") => 30,
                Symbol("spot/v1/margin/isolated/transfer") => 30,
                Symbol("account/v1/transfer-contract-list") => 60,
                Symbol("account/v1/transfer-contract") => 60,
                Symbol("contract/private/submit-order") => 2.5,
                Symbol("contract/private/cancel-order") => 1.5,
                Symbol("contract/private/cancel-orders") => 30,
                Symbol("contract/private/submit-plan-order") => 2.5,
                Symbol("contract/private/cancel-plan-order") => 1.5,
                Symbol("contract/private/submit-leverage") => 2.5,
                Symbol("contract/private/submit-tp-sl-order") => 2.5,
                Symbol("contract/private/modify-plan-order") => 2.5,
                Symbol("contract/private/modify-preset-plan-order") => 2.5,
                Symbol("contract/private/modify-limit-order") => 2.5,
                Symbol("contract/private/modify-tp-sl-order") => 2.5,
                Symbol("contract/private/submit-trail-order") => 2.5,
                Symbol("contract/private/cancel-trail-order") => 1.5,
                Symbol("contract/private/set-position-mode") => 1
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 1,
        Symbol("3m") => 3,
        Symbol("5m") => 5,
        Symbol("15m") => 15,
        Symbol("30m") => 30,
        Symbol("45m") => 45,
        Symbol("1h") => 60,
        Symbol("2h") => 120,
        Symbol("3h") => 180,
        Symbol("4h") => 240,
        Symbol("1d") => 1440,
        Symbol("1w") => 10080,
        Symbol("1M") => 43200
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0040"),
            Symbol("maker") => self.parseNumber("0.0035"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0020")], [self.parseNumber("10"), self.parseNumber("0.18")], [self.parseNumber("50"), self.parseNumber("0.0016")], [self.parseNumber("250"), self.parseNumber("0.0014")], [self.parseNumber("1000"), self.parseNumber("0.0012")], [self.parseNumber("5000"), self.parseNumber("0.0010")], [self.parseNumber("25000"), self.parseNumber("0.0008")], [self.parseNumber("50000"), self.parseNumber("0.0006")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("10"), self.parseNumber("0.0009")], [self.parseNumber("50"), self.parseNumber("0.0008")], [self.parseNumber("250"), self.parseNumber("0.0007")], [self.parseNumber("1000"), self.parseNumber("0.0006")], [self.parseNumber("5000"), self.parseNumber("0.0005")], [self.parseNumber("25000"), self.parseNumber("0.0004")], [self.parseNumber("50000"), self.parseNumber("0.0003")]]
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("30000") => ExchangeError,
            Symbol("30001") => AuthenticationError,
            Symbol("30002") => AuthenticationError,
            Symbol("30003") => AccountSuspended,
            Symbol("30004") => AuthenticationError,
            Symbol("30005") => AuthenticationError,
            Symbol("30006") => AuthenticationError,
            Symbol("30007") => AuthenticationError,
            Symbol("30008") => AuthenticationError,
            Symbol("30010") => PermissionDenied,
            Symbol("30011") => AuthenticationError,
            Symbol("30012") => AuthenticationError,
            Symbol("30013") => RateLimitExceeded,
            Symbol("30014") => ExchangeNotAvailable,
            Symbol("30016") => OnMaintenance,
            Symbol("30017") => RateLimitExceeded,
            Symbol("30018") => BadRequest,
            Symbol("30019") => PermissionDenied,
            Symbol("60000") => BadRequest,
            Symbol("60001") => BadRequest,
            Symbol("60002") => BadRequest,
            Symbol("60003") => ExchangeError,
            Symbol("60004") => ExchangeError,
            Symbol("60005") => ExchangeError,
            Symbol("60006") => ExchangeError,
            Symbol("60007") => InvalidAddress,
            Symbol("60008") => InsufficientFunds,
            Symbol("60009") => ExchangeError,
            Symbol("60010") => ExchangeError,
            Symbol("60011") => InvalidAddress,
            Symbol("60012") => ExchangeError,
            Symbol("60020") => PermissionDenied,
            Symbol("60021") => PermissionDenied,
            Symbol("60022") => PermissionDenied,
            Symbol("60026") => PermissionDenied,
            Symbol("60027") => PermissionDenied,
            Symbol("60028") => AccountSuspended,
            Symbol("60029") => AccountSuspended,
            Symbol("60030") => BadRequest,
            Symbol("60031") => BadRequest,
            Symbol("60050") => ExchangeError,
            Symbol("60051") => ExchangeError,
            Symbol("61001") => InsufficientFunds,
            Symbol("61003") => BadRequest,
            Symbol("61004") => BadRequest,
            Symbol("61005") => BadRequest,
            Symbol("61006") => NotSupported,
            Symbol("61007") => ExchangeError,
            Symbol("61008") => ExchangeError,
            Symbol("70000") => ExchangeError,
            Symbol("70001") => BadRequest,
            Symbol("70002") => BadSymbol,
            Symbol("70003") => NetworkError,
            Symbol("71001") => BadRequest,
            Symbol("71002") => BadRequest,
            Symbol("71003") => BadRequest,
            Symbol("71004") => BadRequest,
            Symbol("71005") => BadRequest,
            Symbol("50000") => BadRequest,
            Symbol("50001") => BadSymbol,
            Symbol("50002") => BadRequest,
            Symbol("50003") => BadRequest,
            Symbol("50004") => BadRequest,
            Symbol("50005") => OrderNotFound,
            Symbol("50006") => InvalidOrder,
            Symbol("50007") => InvalidOrder,
            Symbol("50008") => InvalidOrder,
            Symbol("50009") => InvalidOrder,
            Symbol("50010") => InvalidOrder,
            Symbol("50011") => InvalidOrder,
            Symbol("50012") => InvalidOrder,
            Symbol("50013") => InvalidOrder,
            Symbol("50014") => BadRequest,
            Symbol("50015") => BadRequest,
            Symbol("50016") => BadRequest,
            Symbol("50017") => BadRequest,
            Symbol("50018") => BadRequest,
            Symbol("50019") => ExchangeError,
            Symbol("50020") => InsufficientFunds,
            Symbol("50021") => BadRequest,
            Symbol("50022") => ExchangeNotAvailable,
            Symbol("50023") => BadSymbol,
            Symbol("50024") => BadRequest,
            Symbol("50025") => BadRequest,
            Symbol("50026") => BadRequest,
            Symbol("50027") => BadRequest,
            Symbol("50028") => BadRequest,
            Symbol("50029") => InvalidOrder,
            Symbol("50030") => OrderNotFound,
            Symbol("50031") => OrderNotFound,
            Symbol("50032") => OrderNotFound,
            Symbol("50033") => InvalidOrder,
            Symbol("50034") => InvalidOrder,
            Symbol("50035") => InvalidOrder,
            Symbol("50036") => ExchangeError,
            Symbol("50037") => BadRequest,
            Symbol("50038") => BadRequest,
            Symbol("50039") => BadRequest,
            Symbol("50040") => BadSymbol,
            Symbol("50041") => ExchangeError,
            Symbol("50042") => BadRequest,
            Symbol("51000") => BadSymbol,
            Symbol("51001") => ExchangeError,
            Symbol("51002") => ExchangeError,
            Symbol("51003") => ExchangeError,
            Symbol("51004") => InsufficientFunds,
            Symbol("51005") => InvalidOrder,
            Symbol("51006") => InvalidOrder,
            Symbol("51007") => BadRequest,
            Symbol("51008") => ExchangeError,
            Symbol("51009") => InvalidOrder,
            Symbol("51010") => InvalidOrder,
            Symbol("51011") => InvalidOrder,
            Symbol("51012") => InvalidOrder,
            Symbol("51013") => InvalidOrder,
            Symbol("51014") => InvalidOrder,
            Symbol("51015") => InvalidOrder,
            Symbol("52000") => BadRequest,
            Symbol("52001") => BadRequest,
            Symbol("52002") => BadRequest,
            Symbol("52003") => BadRequest,
            Symbol("52004") => BadRequest,
            Symbol("53000") => AccountSuspended,
            Symbol("53001") => AccountSuspended,
            Symbol("53002") => PermissionDenied,
            Symbol("53003") => PermissionDenied,
            Symbol("53005") => PermissionDenied,
            Symbol("53006") => PermissionDenied,
            Symbol("53007") => PermissionDenied,
            Symbol("53008") => PermissionDenied,
            Symbol("53009") => PermissionDenied,
            Symbol("53010") => PermissionDenied,
            Symbol("57001") => BadRequest,
            Symbol("58001") => BadRequest,
            Symbol("59001") => ExchangeError,
            Symbol("59002") => ExchangeError,
            Symbol("59003") => ExchangeError,
            Symbol("59004") => ExchangeError,
            Symbol("59005") => PermissionDenied,
            Symbol("59006") => ExchangeError,
            Symbol("59007") => ExchangeError,
            Symbol("59008") => ExchangeError,
            Symbol("59009") => ExchangeError,
            Symbol("59010") => InsufficientFunds,
            Symbol("59011") => ExchangeError,
            Symbol("40001") => ExchangeError,
            Symbol("40002") => ExchangeError,
            Symbol("40003") => ExchangeError,
            Symbol("40004") => ExchangeError,
            Symbol("40005") => ExchangeError,
            Symbol("40006") => PermissionDenied,
            Symbol("40007") => BadRequest,
            Symbol("40008") => InvalidNonce,
            Symbol("40009") => BadRequest,
            Symbol("40010") => BadRequest,
            Symbol("40011") => BadRequest,
            Symbol("40012") => ExchangeError,
            Symbol("40013") => ExchangeError,
            Symbol("40014") => BadSymbol,
            Symbol("40015") => BadSymbol,
            Symbol("40016") => InvalidOrder,
            Symbol("40017") => InvalidOrder,
            Symbol("40018") => InvalidOrder,
            Symbol("40019") => ExchangeError,
            Symbol("40020") => InvalidOrder,
            Symbol("40021") => ExchangeError,
            Symbol("40022") => ExchangeError,
            Symbol("40023") => ExchangeError,
            Symbol("40024") => ExchangeError,
            Symbol("40025") => ExchangeError,
            Symbol("40026") => ExchangeError,
            Symbol("40027") => InsufficientFunds,
            Symbol("40028") => PermissionDenied,
            Symbol("40029") => InvalidOrder,
            Symbol("40030") => InvalidOrder,
            Symbol("40031") => InvalidOrder,
            Symbol("40032") => InvalidOrder,
            Symbol("40033") => InvalidOrder,
            Symbol("40034") => BadSymbol,
            Symbol("40035") => OrderNotFound,
            Symbol("40036") => InvalidOrder,
            Symbol("40037") => OrderNotFound,
            Symbol("40038") => BadRequest,
            Symbol("40039") => BadRequest,
            Symbol("40040") => InvalidOrder,
            Symbol("40041") => InvalidOrder,
            Symbol("40042") => InvalidOrder,
            Symbol("40043") => InvalidOrder,
            Symbol("40044") => InvalidOrder,
            Symbol("40045") => InvalidOrder,
            Symbol("40046") => PermissionDenied,
            Symbol("40047") => PermissionDenied,
            Symbol("40048") => InvalidOrder,
            Symbol("40049") => InvalidOrder,
            Symbol("40050") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("You contract account available balance not enough") => InsufficientFunds,
            Symbol("This trading pair does not support API trading") => BadSymbol
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("\$GM") => "GOLDMINER",
        Symbol("\$HERO") => "Step Hero",
        Symbol("\$PAC") => "PAC",
        Symbol("BP") => "BEYOND",
        Symbol("GDT") => "Gorilla Diamond",
        Symbol("GLD") => "Goldario",
        Symbol("MVP") => "MVP Coin",
        Symbol("TRU") => "Truebit"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "TRC20",
            Symbol("BTC") => "BTC",
            Symbol("ETH") => "ERC20"
        ),
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ERC20",
            Symbol("SOL") => "SOL",
            Symbol("BTC") => "BTC",
            Symbol("TRC20") => "TRC20",
            Symbol("OMNI") => "OMNI",
            Symbol("XLM") => "XLM",
            Symbol("EOS") => "EOS",
            Symbol("NEO") => "NEO",
            Symbol("BTM") => "BTM",
            Symbol("BCH") => "BCH",
            Symbol("LTC") => "LTC",
            Symbol("BSV") => "BSV",
            Symbol("XRP") => "XRP",
            Symbol("PLEX") => "PLEX",
            Symbol("XCH") => "XCH",
            Symbol("NEAR") => "NEAR",
            Symbol("FIO") => "FIO",
            Symbol("SCRT") => "SCRT",
            Symbol("IOTX") => "IOTX",
            Symbol("ALGO") => "ALGO",
            Symbol("ATOM") => "ATOM",
            Symbol("DOT") => "DOT",
            Symbol("ADA") => "ADA",
            Symbol("DOGE") => "DOGE",
            Symbol("XYM") => "XYM",
            Symbol("GLMR") => "GLMR",
            Symbol("MOVR") => "MOVR",
            Symbol("ZIL") => "ZIL",
            Symbol("INJ") => "INJ",
            Symbol("KSM") => "KSM",
            Symbol("ZEC") => "ZEC",
            Symbol("NAS") => "NAS",
            Symbol("POLYGON") => "MATIC",
            Symbol("HRC20") => "HECO",
            Symbol("XDC") => "XDC",
            Symbol("ONE") => "ONE",
            Symbol("LAT") => "LAT",
            Symbol("CSPR") => "Casper",
            Symbol("ICP") => "Computer",
            Symbol("XTZ") => "XTZ",
            Symbol("MINA") => "MINA",
            Symbol("BEP20") => "BSC_BNB",
            Symbol("THETA") => "THETA",
            Symbol("AKT") => "AKT",
            Symbol("AR") => "AR",
            Symbol("CELO") => "CELO",
            Symbol("FIL") => "FIL",
            Symbol("NULS") => "NULS",
            Symbol("ETC") => "ETC",
            Symbol("DASH") => "DASH",
            Symbol("DGB") => "DGB",
            Symbol("BEP2") => "BEP2",
            Symbol("GRIN") => "GRIN",
            Symbol("WAVES") => "WAVES",
            Symbol("ABBC") => "ABBC",
            Symbol("ACA") => "ACA",
            Symbol("QTUM") => "QTUM",
            Symbol("PAC") => "PAC",
            Symbol("TLOS") => "TLOS",
            Symbol("KARDIA") => "KardiaChain",
            Symbol("FUSE") => "FUSE",
            Symbol("TRC10") => "TRC10",
            Symbol("FIRO") => "FIRO",
            Symbol("FTM") => "Fantom",
            Symbol("EVER") => "EVER",
            Symbol("KAVA") => "KAVA",
            Symbol("HYDRA") => "HYDRA",
            Symbol("PLCU") => "PLCU",
            Symbol("BRISE") => "BRISE",
            Symbol("OPTIMISM") => "OPTIMISM",
            Symbol("REEF") => "REEF",
            Symbol("SYS") => "SYS",
            Symbol("VITE") => "VITE",
            Symbol("STX") => "STX",
            Symbol("SXP") => "SXP",
            Symbol("BITCI") => "BITCI",
            Symbol("XRD") => "XRD",
            Symbol("ASTR") => "ASTAR",
            Symbol("ZEN") => "HORIZEN",
            Symbol("LTO") => "LTO",
            Symbol("ETHW") => "ETHW",
            Symbol("ETHF") => "ETHF",
            Symbol("IOST") => "IOST",
            Symbol("APT") => "APT",
            Symbol("ONT") => "ONT",
            Symbol("EVMOS") => "EVMOS",
            Symbol("XMR") => "XMR",
            Symbol("OASYS") => "OAS",
            Symbol("OSMO") => "OSMO",
            Symbol("OMAX") => "OMAX Chain",
            Symbol("DESO") => "DESO",
            Symbol("BFIC") => "BFIC",
            Symbol("OHO") => "OHO",
            Symbol("CS") => "CS",
            Symbol("CHEQ") => "CHEQ",
            Symbol("NODL") => "NODL",
            Symbol("NEM") => "XEM",
            Symbol("FRA") => "FRA",
            Symbol("ERGO") => "ERG"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("Ethereum") => "ERC20",
            Symbol("USDT") => "OMNI",
            Symbol("Bitcoin") => "BTC"
        ),
        Symbol("defaultType") => "spot",
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("type") => "spot"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("swap") => "swap"
        ),
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => true
        ),
        Symbol("brokerId") => "CCXTxBitmart000"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
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
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("leverage") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 200,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 99999,
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
                Symbol("limit") => 200,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 200,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => false
                ),
                Symbol("triggerDirection") => true,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => true,
                        Symbol("mark") => true,
                        Symbol("index") => false
                    ),
                    Symbol("price") => false
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("marketBuyByCost") => true
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 99999
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 200,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
function fetchTime(self::Bitmart, params=Dict())
    response = Base.fetch(self.publicGetSystemTime(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return safeInteger(data, "server_time")

end
function fetchStatus(self::Bitmart, params=Dict())
    options = self.safeDict(self.options, "fetchStatus", Dict{Symbol, Any}());
    defaultType = safeString(self.options, "defaultType");
    type_var = safeString(options, "type", defaultType);
    type_var = safeString(params, "type", type_var);
    params = omit(params, "type");
    response = Base.fetch(self.publicGetSystemService(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    services = self.safeList(data, "service", []);
    servicesByType = indexBy(services, "service_type");
    if functions.ccxtruthy(type_var == "swap")
        type_var = "contract";
    end
    service = self.safeDict(servicesByType, type_var);
    status = nothing;
    eta = nothing;
    if functions.ccxtruthy(service != nothing)
        statusCode = safeInteger(service, "status");
        if functions.ccxtruthy(statusCode == 2)
            status = "ok";
        else
            status = "maintenance";
            eta = safeInteger(service, "end_time");
        end
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("eta") => eta,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchSpotMarkets(self::Bitmart, params=Dict())
    response = Base.fetch(self.publicGetSpotV1SymbolsDetails(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    symbols = self.safeList(data, "symbols", []);
    result = [];
    fees = get(self.fees, Symbol("trading"), nothing);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        market = get(symbols, i + 1, nothing);
        id = safeString(market, "symbol");
        numericId = safeInteger(market, "symbol_id");
        baseId = safeString(market, "base_currency");
        quoteId = safeString(market, "quote_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        minBuyCost = safeString(market, "min_buy_amount");
        minSellCost = safeString(market, "min_sell_amount");
        minCost = stringMax(minBuyCost, minSellCost);
        baseMinSize = self.safeNumber(market, "base_min_size");
        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => numericId,
    Symbol("symbol") => symbol,
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
    Symbol("active") => safeStringLower2(market, "status", "trade_status") == "trading",
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("maker") => get(fees, Symbol("maker"), nothing),
    Symbol("taker") => get(fees, Symbol("taker"), nothing),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => baseMinSize,
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "price_max_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => baseMinSize,
            Symbol("max") => self.safeNumber(market, "base_max_size")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minCost),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function fetchContractMarkets(self::Bitmart, params=Dict())
    response = Base.fetch(self.publicGetContractPublicDetails(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    symbols = self.safeList(data, "symbols", []);
    result = [];
    fees = get(self.fees, Symbol("trading"), nothing);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        market = get(symbols, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "base_currency");
        quoteId = safeString(market, "quote_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settleId = "USDT";
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        productType = safeInteger(market, "product_type");
        isSwap = (productType == 1);
        isFutures = (productType == 2);
        expiry = safeInteger(market, "expire_timestamp");
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isFutures), (expiry == 0)))
            expiry = nothing;
        end
        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => nothing,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => functions.ccxtruthy(isSwap) ? "swap" : "future",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => isSwap,
    Symbol("future") => isFutures,
    Symbol("option") => false,
    Symbol("active") => safeStringLower(market, "status") == "trading",
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("contractSize") => self.safeNumber(market, "contract_size"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("maker") => get(fees, Symbol("maker"), nothing),
    Symbol("taker") => get(fees, Symbol("taker"), nothing),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "vol_precision"),
        Symbol("price") => self.safeNumber(market, "price_precision")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_leverage"),
            Symbol("max") => self.safeNumber(market, "max_leverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_volume"),
            Symbol("max") => self.safeNumber(market, "max_volume")
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
    Symbol("created") => safeInteger(market, "open_timestamp"),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function fetchMarkets(self::Bitmart, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    spotPromise = self.fetchSpotMarkets(params);
    contractPromise = self.fetchContractMarkets(params);
    (spot, contract) = (Base.fetch(asyncmap(Base.fetch, [spotPromise, contractPromise])));
    return arrayConcat(spot, contract)

end
function fetchCurrencies(self::Bitmart, params=Dict())
    response = Base.fetch(self.publicGetAccountV1Currencies(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    currencies = self.safeList(data, "currencies", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
        currency = get(currencies, i + 1, nothing);
        fullId = safeString(currency, "currency");
        currencyId = fullId;
        networkId = safeString(currency, "network");
        isNtf = (findfirst("NFT", fullId) !== nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(isNtf))
            parts = split(fullId, "-");
            currencyId = safeString(parts, 0);
            second = safeString(parts, 1);
            if functions.ccxtruthy(second != nothing)
                networkId = uppercase(second);
            end
        end
        currencyCode = self.safeCurrencyCode(currencyId);
        entry = self.safeDict(result, currencyCode);
        if functions.ccxtruthy(entry == nothing)
            entry = Dict{Symbol, Any}(
                Symbol("info") => currency,
                Symbol("id") => currencyId,
                Symbol("code") => currencyCode,
                Symbol("precision") => nothing,
                Symbol("name") => safeString(currency, "name"),
                Symbol("deposit") => nothing,
                Symbol("withdraw") => nothing,
                Symbol("active") => nothing,
                Symbol("networks") => Dict{Symbol, Any}(),
                Symbol("type") => functions.ccxtruthy(isNtf) ? "other" : "crypto"
            );
        end
        networkCode = self.networkIdToCode(networkId, currencyCode);
        withdraw = self.safeBool(currency, "withdraw_enabled");
        deposit = self.safeBool(currency, "deposit_enabled");
        entry[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => currency,
            Symbol("id") => networkId,
            Symbol("code") => networkCode,
            Symbol("withdraw") => withdraw,
            Symbol("deposit") => deposit,
            Symbol("active") => @functions.ccxt_and(withdraw, deposit),
            Symbol("fee") => self.safeNumber(currency, "withdraw_fee"),
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(currency, "withdraw_minsize"),
                    Symbol("max") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            )
        );
        result[Symbol(currencyCode)] = entry;
        i += 1
    end
    keys_var = objectKeys(result);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        currency = get(result, Symbol(key), nothing);
        result[Symbol(key)] = self.safeCurrencyStructure(currency);
        i += 1
    end
    return result

end
function getCurrencyIdFromCodeAndNetwork(self::Bitmart, currencyCode, networkCode)
    if functions.ccxtruthy(networkCode == nothing)
        networkCode = self.defaultNetworkCode(currencyCode);
    end
    currency = self.currency(currencyCode);
    id = get(currency, Symbol("id"), nothing);
    idFromNetwork = nothing;
    networks = self.safeDict(currency, "networks", Dict{Symbol, Any}());
    networkInfo = Dict{Symbol, Any}();
    if functions.ccxtruthy(networkCode == nothing)
        network = self.safeDict(networks, currencyCode);
        if functions.ccxtruthy(network == nothing)
            keys_var = objectKeys(networks);
            len = length(keys_var);
            if functions.ccxtruthy(functions.ccxt_gt(len, 0))
                network = safeValue(networks, get(keys_var, 1, nothing));
            end
        end
        networkInfo = self.safeDict(network, "info", Dict{Symbol, Any}());
        idFromNetwork = safeString(networkInfo, "currency");
    else
        providedOrDefaultNetwork = self.safeDict(networks, networkCode);
        if functions.ccxtruthy(providedOrDefaultNetwork != nothing)
            networkInfo = self.safeDict(providedOrDefaultNetwork, "info", Dict{Symbol, Any}());
            idFromNetwork = safeString(networkInfo, "currency");
        else
            id += string("-", self.networkCodeToId(networkCode, currencyCode));
        end
    end
    return functions.ccxtruthy((idFromNetwork != nothing)) ? idFromNetwork : id

end
function fetchTransactionFee(self::Bitmart, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = nothing;
    (network, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("currency") => self.getCurrencyIdFromCodeAndNetwork(get(currency, Symbol("code"), nothing), network)
    );
    response = Base.fetch(self.privateGetAccountV1WithdrawCharge(extend(request, params)));
    data = get(response, Symbol("data"), nothing);
    withdrawFees = Dict{Symbol, Any}();
    withdrawFees[Symbol(code)] = self.safeNumber(data, "withdraw_fee");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}()
)

end
function parseDepositWithdrawFee(self::Bitmart, fee, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("withdraw") => Dict{Symbol, Any}(
        Symbol("fee") => self.safeNumber(fee, "withdraw_fee"),
        Symbol("percentage") => nothing
    ),
    Symbol("deposit") => Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    ),
    Symbol("networks") => Dict{Symbol, Any}()
)

end
function fetchDepositWithdrawFee(self::Bitmart, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    network = nothing;
    (network, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("currency") => self.getCurrencyIdFromCodeAndNetwork(code, network)
    );
    response = Base.fetch(self.privateGetAccountV1WithdrawCharge(extend(request, params)));
    data = get(response, Symbol("data"), nothing);
    return self.parseDepositWithdrawFee(data)

end
function parseTicker(self::Bitmart, ticker, market=nothing)
    result = self.safeList(ticker, "result", []);
    average = safeString2(ticker, "avg_price", "index_price");
    marketId = safeString2(ticker, "symbol", "contract_symbol");
    timestamp = safeInteger2(ticker, "timestamp", "ts");
    last_var = safeString2(ticker, "last_price", "last");
    percentage = safeString2(ticker, "price_change_percent_24h", "change_24h");
    change = safeString(ticker, "fluctuation");
    high = safeString2(ticker, "high_24h", "high_price");
    low = safeString2(ticker, "low_24h", "low_price");
    bid = safeString2(ticker, "best_bid", "bid_px");
    bidVolume = safeString2(ticker, "best_bid_size", "bid_sz");
    ask = safeString2(ticker, "best_ask", "ask_px");
    askVolume = safeString2(ticker, "best_ask_size", "ask_sz");
    open = safeString(ticker, "open_24h");
    baseVolume = safeStringN(ticker, ["base_volume_24h", "v_24h", "volume_24h"]);
    quoteVolume = safeStringLowerN(ticker, ["quote_volume_24h", "qv_24h", "turnover_24h"]);
    listMarketId = safeString(result, 0);
    if functions.ccxtruthy(listMarketId != nothing)
        marketId = listMarketId;
        timestamp = safeInteger(result, 12);
        high = safeString(result, 5);
        low = safeString(result, 6);
        bid = safeString(result, 8);
        bidVolume = safeString(result, 9);
        ask = safeString(result, 10);
        askVolume = safeString(result, 11);
        open = safeString(result, 4);
        last_var = safeString(result, 1);
        change = safeString(result, 7);
        baseVolume = safeString(result, 2);
        quoteVolume = safeStringLower(result, 3);
    end
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeIntegerProduct(ticker, "s_t", 1000);
    end
    if functions.ccxtruthy(percentage == nothing)
        percentage = stringMul(change, "100");
    end
    if functions.ccxtruthy(quoteVolume == nothing)
        if functions.ccxtruthy(baseVolume == nothing)
            quoteVolume = safeString(ticker, "volume_24h", quoteVolume);
        else
            quoteVolume = baseVolume;
            baseVolume = nothing;
        end
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => average,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicGetContractPublicDetails(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicGetSpotQuotationV3Ticker(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchTicker() does not support ", get(market, Symbol("type"), nothing), " markets, only spot and swap markets are accepted")));
    end
    tickers = [];
    ticker = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        ticker = self.safeDict(response, "data", Dict{Symbol, Any}());
    else
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
        tickers = self.safeList(data, "symbols", []);
        ticker = self.safeDict(tickers, 0, Dict{Symbol, Any}());
    end
    return self.parseTicker(ticker, market)

end
function fetchTickers(self::Bitmart, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    type_var = nothing;
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeString(symbols, 0);
        market = self.market(symbol);
    end
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.publicGetSpotQuotationV3Tickers(params));
    elseif functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.publicGetContractPublicDetails(params));
    else
        throw(NotSupported(string(self.id, " fetchTickers() does not support ", type_var, " markets, only spot and swap markets are accepted")));
    end
    tickers = [];
    if functions.ccxtruthy(type_var == "spot")
        tickers = self.safeList(response, "data", []);
    else
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
        tickers = self.safeList(data, "symbols", []);
    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        ticker = Dict{Symbol, Any}();
        if functions.ccxtruthy(type_var == "spot")
            ticker = self.parseTicker(Dict{Symbol, Any}(
    Symbol("result") => get(tickers, i + 1, nothing)
));
        else
            ticker = self.parseTicker(get(tickers, i + 1, nothing));
        end
        symbol = get(ticker, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function fetchOrderBook(self::Bitmart, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.publicGetSpotQuotationV3Books(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.publicGetContractPublicDepth(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchOrderBook() does not support ", get(market, Symbol("type"), nothing), " markets, only spot and swap markets are accepted")));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = safeInteger2(data, "ts", "timestamp");
    return self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp)

end
function parseTrade(self::Bitmart, trade, market=nothing)
    timestamp = safeIntegerN(trade, ["createTime", "create_time", 1]);
    isPublic = safeString(trade, 0);
    isPublicTrade = (isPublic != nothing);
    amount = nothing;
    cost = nothing;
    type_var = nothing;
    side = nothing;
    if functions.ccxtruthy(isPublicTrade)
        amount = safeString2(trade, "count", 3);
        cost = safeString(trade, "amount");
        side = safeString2(trade, "type", 4);
    else
        amount = safeStringN(trade, ["size", "vol", "fillQty"]);
        cost = safeString(trade, "notional");
        type_var = safeString(trade, "type");
        side = self.parseOrderSide(safeString(trade, "side"));
    end
    marketId = safeString2(trade, "symbol", 0);
    market = self.safeMarket(marketId, market);
    feeCostString = safeString2(trade, "fee", "paid_fees");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "feeCoinName");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        if functions.ccxtruthy(feeCurrencyCode == nothing)
            feeCurrencyCode = functions.ccxtruthy((side == "buy")) ? get(market, Symbol("base"), nothing) : get(market, Symbol("quote"), nothing);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeStringN(trade, ["tradeId", "trade_id", "lastTradeID"]),
    Symbol("order") => safeString2(trade, "orderId", "order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => safeStringN(trade, ["price", "fillPrice", 2]),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("takerOrMaker") => safeStringLower2(trade, "tradeRole", "exec_type"),
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Bitmart, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " fetchTrades() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetSpotQuotationV3Trades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function parseOHLCV(self::Bitmart, ohlcv, market=nothing)
    if functions.ccxtruthy(functions.ccxt_isArray(ohlcv))
            return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]
    else
        return [safeTimestamp2(ohlcv, "timestamp", "ts"), self.safeNumber2(ohlcv, "open_price", "o"), self.safeNumber2(ohlcv, "high_price", "h"), self.safeNumber2(ohlcv, "low_price", "l"), self.safeNumber2(ohlcv, "close_price", "c"), self.safeNumber2(ohlcv, "volume", "v")]
    end

end
function fetchOHLCV(self::Bitmart, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 200))
    end
    market = self.market(symbol);
    duration = self.parseTimeframe(timeframe);
    parsedTimeframe = safeInteger(self.timeframes, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(parsedTimeframe != nothing)
        request[Symbol("step")] = parsedTimeframe;
    else
        request[Symbol("step")] = timeframe;
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        (request, params) = self.handleUntilOption("before", request, params, 0.001);
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("after")] = self.parseToInt((since / 1000)) - 1;
        end
    else
        maxLimit = 500;
        if functions.ccxtruthy(limit == nothing)
            limit = maxLimit;
        end
        limit = min(maxLimit, limit);
        now = self.parseToInt(milliseconds() / 1000);
        if functions.ccxtruthy(since == nothing)
            start = now - limit * duration;
            request[Symbol("start_time")] = start;
            request[Symbol("end_time")] = now;
        else
            start = self.parseToInt((since / 1000)) - 1;
            end_var = self.sum(start, limit * duration);
            request[Symbol("start_time")] = start;
            request[Symbol("end_time")] = min(end_var, now);
        end
        (request, params) = self.handleUntilOption("end_time", request, params, 0.001);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        price = safeString(params, "price");
        if functions.ccxtruthy(price == "mark")
            params = omit(params, "price");
            response = Base.fetch(self.publicGetContractPublicMarkpriceKline(extend(request, params)));
        else
            response = Base.fetch(self.publicGetContractPublicKline(extend(request, params)));
        end
    else
        response = Base.fetch(self.publicGetSpotQuotationV3Klines(extend(request, params)));
    end
    ohlcv = self.safeList(response, "data", []);
    return self.parseOHLCVs(ohlcv, market, timeframe, since, limit)

end
function fetchMyTrades(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    until = safeIntegerN(params, ["until", "endTime", "end_time"]);
    params = omit(params, ["until"]);
    if functions.ccxtruthy(type_var == "spot")
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params);
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("orderMode")] = "iso_margin";
        end
        options = self.safeDict(self.options, "fetchMyTrades", Dict{Symbol, Any}());
        maxLimit = 200;
        defaultLimit = safeInteger(options, "limit", maxLimit);
        if functions.ccxtruthy(limit == nothing)
            limit = defaultLimit;
        end
        request[Symbol("limit")] = min(limit, maxLimit);
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until;
        end
        response = Base.fetch(self.privatePostSpotV4QueryTrades(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = since;
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("end_time")] = until;
        end
        response = Base.fetch(self.privateGetContractPrivateTrades(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchMyTrades() does not support ", type_var, " orders, only spot and swap orders are accepted")));
    end
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchOrderTrades(self::Bitmart, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privatePostSpotV4QueryOrderTrades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, nothing, since, limit)

end
function customParseBalance(self::Bitmart, response, marketType)
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    wallet = nothing;
    if functions.ccxtruthy(marketType == "swap")
        wallet = self.safeList(response, "data", []);
    elseif functions.ccxtruthy(marketType == "margin")
        wallet = self.safeList(data, "symbols", []);
    else
        wallet = self.safeList(data, "wallet", []);
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    if functions.ccxtruthy(marketType == "margin")
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(wallet)))
            entry = get(wallet, i + 1, nothing);
            marketId = safeString(entry, "symbol");
            symbol = self.safeSymbol(marketId, nothing, "_");
            base = self.safeDict(entry, "base", Dict{Symbol, Any}());
            quote_var = self.safeDict(entry, "quote", Dict{Symbol, Any}());
            baseCode = self.safeCurrencyCode(safeString(base, "currency"));
            quoteCode = self.safeCurrencyCode(safeString(quote_var, "currency"));
            subResult = Dict{Symbol, Any}();
            subResult[Symbol(baseCode)] = self.parseBalanceHelper(base);
            subResult[Symbol(quoteCode)] = self.parseBalanceHelper(quote_var);
            result[Symbol(symbol)] = self.safeBalance(subResult);
            i += 1
        end

            return result
    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(wallet)))
            balance = get(wallet, i + 1, nothing);
            currencyId = safeString2(balance, "id", "currency");
            currencyId = safeString(balance, "coin_code", currencyId);
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString2(balance, "available", "available_balance");
            account[Symbol("used")] = safeStringN(balance, ["unAvailable", "frozen", "frozen_balance"]);
            result[Symbol(code)] = account;
            i += 1
        end
        return self.safeBalance(result)
    end

end
function parseBalanceHelper(self::Bitmart, entry)
    account = self.account();
    account[Symbol("used")] = safeString(entry, "frozen");
    account[Symbol("free")] = safeString(entry, "available");
    account[Symbol("total")] = safeString(entry, "total_asset");
    debt = safeString(entry, "borrow_unpaid");
    interest = safeString(entry, "interest_unpaid");
    account[Symbol("debt")] = stringAdd(debt, interest);
    return account

end
function fetchBalance(self::Bitmart, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    marginMode = safeString(params, "marginMode");
    isMargin = self.safeBool(params, "margin", false);
    params = omit(params, ["margin", "marginMode"]);
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, isMargin))
        marketType = "margin";
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetSpotV1Wallet(params));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateGetContractPrivateAssetsDetail(params));
    else
        if functions.ccxtruthy(marketType == "account")
            response = Base.fetch(self.privateGetAccountV1Wallet(params));
        elseif functions.ccxtruthy(marketType == "margin")
            response = Base.fetch(self.privateGetSpotV1MarginIsolatedAccount(params));
        else
            throw(NotSupported(string(self.id, " fetchBalance() does not support ", marketType, " markets, only spot, swap and account and margin markets are accepted")));
        end

    end
    return self.customParseBalance(response, marketType)

end
function parseTradingFee(self::Bitmart, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "maker_fee_rate"),
    Symbol("taker") => self.safeNumber(fee, "taker_fee_rate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " fetchTradingFee() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetSpotV1TradeFee(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTradingFee(data)

end
function parseOrder(self::Bitmart, order, market=nothing)
    id = nothing;
    if functions.ccxtruthy(isa(order, AbstractString))
        id = order;
        order = Dict{Symbol, Any}();
    end
    id = safeString2(order, "order_id", "orderId", id);
    timestamp = safeInteger2(order, "create_time", "createTime");
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market);
    market = self.safeMarket(symbol, market);
    orderType = safeString(market, "type", "spot");
    type_var = safeString(order, "type");
    timeInForce = nothing;
    postOnly = nothing;
    if functions.ccxtruthy(type_var == "limit_maker")
        type_var = "limit";
        postOnly = true;
        timeInForce = "PO";
    end
    if functions.ccxtruthy(type_var == "ioc")
        type_var = "limit";
        timeInForce = "IOC";
    end
    priceString = safeString(order, "price");
    if functions.ccxtruthy(priceString == "market price")
        priceString = nothing;
    end
    trailingActivationPrice = self.safeNumber(order, "activation_price");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString2(order, "client_order_id", "clientOrderId"),
    Symbol("info") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => safeInteger(order, "update_time"),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => self.parseOrderSide(safeString(order, "side")),
    Symbol("price") => omitZero(priceString),
    Symbol("triggerPrice") => trailingActivationPrice,
    Symbol("amount") => omitZero(safeString(order, "size")),
    Symbol("cost") => safeString2(order, "filled_notional", "filledNotional"),
    Symbol("average") => safeStringN(order, ["price_avg", "priceAvg", "deal_avg_price"]),
    Symbol("filled") => safeStringN(order, ["filled_size", "filledSize", "deal_size"]),
    Symbol("remaining") => nothing,
    Symbol("status") => self.parseOrderStatusByType(orderType, safeString2(order, "status", "state")),
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function parseOrderSide(self::Bitmart, side)
    sides = Dict{Symbol, Any}(
        Symbol("1") => "buy",
        Symbol("2") => "buy",
        Symbol("3") => "sell",
        Symbol("4") => "sell"
    );
    return safeString(sides, side, side)

end
function parseOrderStatusByType(self::Bitmart, type_var, status)
    statusesByType = Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("1") => "rejected",
            Symbol("2") => "open",
            Symbol("3") => "rejected",
            Symbol("4") => "open",
            Symbol("5") => "open",
            Symbol("6") => "closed",
            Symbol("7") => "canceled",
            Symbol("8") => "canceled",
            Symbol("new") => "open",
            Symbol("partially_filled") => "open",
            Symbol("filled") => "closed",
            Symbol("partially_canceled") => "canceled"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("1") => "open",
            Symbol("2") => "open",
            Symbol("4") => "closed"
        )
    );
    statuses = self.safeDict(statusesByType, type_var, Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function createMarketBuyOrderWithCost(self::Bitmart, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function createOrder(self::Bitmart, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    result = self.handleMarginModeAndParams("createOrder", params);
    marginMode = safeString(result, 0);
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    isTriggerOrder = triggerPrice != nothing;
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        spotRequest = self.createSpotOrderRequest(symbol, type_var, side, amount, price, params);
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isStopLoss, isTakeProfit), isTriggerOrder))
            response = Base.fetch(self.privatePostSpotV4AlgoSubmitOrder(spotRequest));
        elseif functions.ccxtruthy(marginMode == "isolated")
            response = Base.fetch(self.privatePostSpotV1MarginSubmitOrder(spotRequest));
        else
            response = Base.fetch(self.privatePostSpotV2SubmitOrder(spotRequest));
        end
    else
        swapRequest = self.createSwapOrderRequest(symbol, type_var, side, amount, price, params);
        activationPrice = safeString(swapRequest, "activation_price");
        if functions.ccxtruthy(activationPrice != nothing)
            response = Base.fetch(self.privatePostContractPrivateSubmitTrailOrder(swapRequest));
        elseif functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.privatePostContractPrivateSubmitPlanOrder(swapRequest));
        else
            if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
                response = Base.fetch(self.privatePostContractPrivateSubmitTpSlOrder(swapRequest));
            else
                response = Base.fetch(self.privatePostContractPrivateSubmitOrder(swapRequest));
            end

        end
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    order = self.parseOrder(data, market);
    order[Symbol("type")] = type_var;
    order[Symbol("side")] = side;
    order[Symbol("amount")] = amount;
    order[Symbol("price")] = price;
    return order

end
function createOrders(self::Bitmart, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    market = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        market = self.market(marketId);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            throw(NotSupported(string(self.id, " createOrders() supports spot orders only")));
        end
        if functions.ccxtruthy(symbol == nothing)
            symbol = marketId;
        else
            if functions.ccxtruthy(symbol != marketId)
                throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same symbol")));
            end
        end
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createSpotOrderRequest(marketId, type_var, side, amount, price, orderParams);
        orderRequest = omit(orderRequest, ["symbol"]);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeString(market, "id"),
        Symbol("orderParams") => ordersRequests
    );
    response = Base.fetch(self.privatePostSpotV4BatchOrders(request));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    innderData = self.safeDict(data, "data", Dict{Symbol, Any}());
    orderIds = self.safeList(innderData, "orderIds", []);
    parsedOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderIds)))
        orderId = get(orderIds, i + 1, nothing);
        order = self.safeOrder(Dict{Symbol, Any}(
            Symbol("id") => orderId
        ), market);
        push!(parsedOrders, order);
        i += 1
    end
    return parsedOrders

end
function createSwapOrderRequest(self::Bitmart, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    if functions.ccxtruthy(isStopLoss)
        type_var = "stop_loss";
    elseif functions.ccxtruthy(isTakeProfit)
        type_var = "take_profit";
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("size")] = ccxt_parseInt(self.amountToPrecision(symbol, amount));
    end
    timeInForce = safeString(params, "timeInForce");
    mode = safeInteger(params, "mode");
    isMarketOrder = type_var == "market";
    postOnly = nothing;
    reduceOnly = self.safeBool(params, "reduceOnly");
    isExchangeSpecificPo = (mode == 4);
    (postOnly, params) = self.handlePostOnly(isMarketOrder, isExchangeSpecificPo, params);
    ioc = (@functions.ccxt_or((timeInForce == "IOC"), (mode == 3)));
    isLimitOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "limit"), postOnly), ioc);
    if functions.ccxtruthy(timeInForce == "GTC")
        request[Symbol("mode")] = 1;
    elseif functions.ccxtruthy(timeInForce == "FOK")
        request[Symbol("mode")] = 2;
    else
        if functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("mode")] = 3;
        end

    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("mode")] = 4;
    end
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    isTriggerOrder = triggerPrice != nothing;
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activation_price", numberToString(price));
    trailingPercent = safeString2(params, "trailingPercent", "callback_rate");
    isTrailingPercentOrder = trailingPercent != nothing;
    if functions.ccxtruthy(isLimitOrder)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(@functions.ccxt_or(type_var == "trailing", isTrailingPercentOrder))
        type_var = "trailing";
        request[Symbol("callback_rate")] = trailingPercent;
        request[Symbol("activation_price")] = self.priceToPrecision(symbol, trailingTriggerPrice);
        request[Symbol("activation_price_type")] = safeInteger(params, "activation_price_type", 1);
    end
    if functions.ccxtruthy(isTriggerOrder)
        if functions.ccxtruthy(@functions.ccxt_or(isLimitOrder, price != nothing))
            request[Symbol("executive_price")] = self.priceToPrecision(symbol, price);
        end
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("price_type")] = safeInteger(params, "price_type", 1);
        if functions.ccxtruthy(side == "buy")
            if functions.ccxtruthy(reduceOnly)
                request[Symbol("price_way")] = 2;
            else
                request[Symbol("price_way")] = 1;
            end
        elseif functions.ccxtruthy(side == "sell")
            if functions.ccxtruthy(reduceOnly)
                request[Symbol("price_way")] = 1;
            else
                request[Symbol("price_way")] = 2;
            end
        end
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params, "cross");
    if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        reduceOnly = true;
        request[Symbol("price_type")] = safeInteger(params, "price_type", 1);
        if functions.ccxtruthy(price != nothing)
            request[Symbol("executive_price")] = self.priceToPrecision(symbol, price);
        end
        marketOrLimitStr = functions.ccxtruthy(isLimitOrder) ? "limit" : "market";
        request[Symbol("category")] = safeString(params, "category", marketOrLimitStr);
        if functions.ccxtruthy(isStopLoss)
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, stopLossPrice);
        else
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, takeProfitPrice);
        end
    else
        request[Symbol("open_type")] = marginMode;
    end
    if functions.ccxtruthy(side == "buy")
        if functions.ccxtruthy(reduceOnly)
            request[Symbol("side")] = 2;
        else
            request[Symbol("side")] = 1;
        end
    elseif functions.ccxtruthy(side == "sell")
        if functions.ccxtruthy(reduceOnly)
            request[Symbol("side")] = 3;
        else
            request[Symbol("side")] = 4;
        end
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("client_order_id")] = clientOrderId;
    end
    leverage = safeInteger(params, "leverage");
    params = omit(params, ["timeInForce", "postOnly", "reduceOnly", "leverage", "trailingTriggerPrice", "trailingPercent", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice"]);
    if functions.ccxtruthy(leverage != nothing)
        request[Symbol("leverage")] = numberToString(leverage);
    elseif functions.ccxtruthy(isTriggerOrder)
        request[Symbol("leverage")] = "1";
    end
    if functions.ccxtruthy(type_var != "trailing")
        request[Symbol("type")] = type_var;
    end
    return extend(request, params)

end
function createSpotOrderRequest(self::Bitmart, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    isTriggerOrder = triggerPrice != nothing;
    isAlgoOrder = @functions.ccxt_or(@functions.ccxt_or(isStopLoss, isTakeProfit), isTriggerOrder);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => side
    );
    timeInForce = safeString(params, "timeInForce");
    if functions.ccxtruthy(timeInForce == "FOK")
        throw(InvalidOrder(string(self.id, " createOrder() only accepts timeInForce parameter values of IOC or PO")));
    end
    mode = safeInteger(params, "mode");
    isMarketOrder = type_var == "market";
    postOnly = nothing;
    isExchangeSpecificPo = @functions.ccxt_or((type_var == "limit_maker"), (mode == 4));
    (postOnly, params) = self.handlePostOnly(isMarketOrder, isExchangeSpecificPo, params);
    params = omit(params, ["timeInForce", "postOnly"]);
    ioc = (@functions.ccxt_or((timeInForce == "IOC"), (type_var == "ioc")));
    isLimitOrder = @functions.ccxt_or(@functions.ccxt_or((type_var == "limit"), postOnly), ioc);
    if functions.ccxtruthy(isAlgoOrder)
        if functions.ccxtruthy(isTriggerOrder)
            request[Symbol("type")] = "trigger";
        else
            request[Symbol("type")] = "tp/sl";
        end
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("trigger_type")] = "limit";
        else
            request[Symbol("trigger_type")] = "market";
        end
        if functions.ccxtruthy(isStopLoss)
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, stopLossPrice);
        elseif functions.ccxtruthy(isTakeProfit)
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, takeProfitPrice);
        else
            if functions.ccxtruthy(isTriggerOrder)
                request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
            end

        end
    else
        request[Symbol("type")] = type_var;
    end
    if functions.ccxtruthy(isLimitOrder)
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(isMarketOrder)
        if functions.ccxtruthy(side == "buy")
            notional = safeString2(params, "cost", "notional");
            params = omit(params, "cost");
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(@functions.ccxt_and((price == nothing), (notional == nothing)))
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice to false in options[\"createOrder\"] or in params and pass the cost to spend in the amount argument or in the \"notional\" extra parameter (the exchange-specific behaviour)")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    notional = stringMul(amountString, priceString);
                end
            else
                notional = functions.ccxtruthy((notional == nothing)) ? numberToString(amount) : notional;
            end
            request[Symbol("notional")] = decimalToPrecision(notional, TRUNCATE, get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing), self.precisionMode);
        elseif functions.ccxtruthy(side == "sell")
            request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("type")] = "limit_maker";
    end
    if functions.ccxtruthy(ioc)
        request[Symbol("type")] = "ioc";
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("client_order_id")] = clientOrderId;
    end
    return extend(request, params)

end
function cancelOrder(self::Bitmart, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOrderId", "client_order_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
    else
        request[Symbol("order_id")] =         string(id);
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
    trailing = self.safeBool(params, "trailing");
    params = omit(params, ["clientOrderId", "stop", "trigger", "trailing", "stopLossTakeProfit"]);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(@functions.ccxt_or(trigger, stopLossTakeProfit))
            if functions.ccxtruthy(stopLossTakeProfit)
                request[Symbol("type")] = "tp/sl";
            elseif functions.ccxtruthy(trigger)
                request[Symbol("type")] = "trigger";
            end
            response = Base.fetch(self.privatePostSpotV4AlgoCancelOrder(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSpotV3CancelOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privatePostContractPrivateCancelPlanOrder(extend(request, params)));
        elseif functions.ccxtruthy(trailing)
            response = Base.fetch(self.privatePostContractPrivateCancelTrailOrder(extend(request, params)));
        else
            response = Base.fetch(self.privatePostContractPrivateCancelOrder(extend(request, params)));
        end
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))
    end
    data = safeValue(response, "data");
    if functions.ccxtruthy(data)
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id
), market)
    end
    succeeded = safeValue(data, "succeed");
    if functions.ccxtruthy(succeeded != nothing)
        id2 = safeString(succeeded, 0);
        if functions.ccxtruthy(id2 == nothing)
            throw(InvalidOrder(string(self.id, " cancelOrder() failed to cancel ", symbol, " order id ", id2)));
        end
    else
        result = safeValue(data, "result");
        if functions.ccxtruthy(!functions.ccxtruthy(result))
            throw(InvalidOrder(string(self.id, " cancelOrder() ", symbol, " order id ", id, " is filled or canceled")));
        end
    end
    order = self.safeOrder(Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("symbol") => get(market, Symbol("symbol"), nothing),
        Symbol("info") => Dict{Symbol, Any}()
    ), market);
    return order

end
function cancelOrders(self::Bitmart, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " cancelOrders() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    clientOrderIds = self.safeList(params, "clientOrderIds");
    params = omit(params, ["clientOrderIds"]);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(clientOrderIds != nothing)
        request[Symbol("clientOrderIds")] = clientOrderIds;
    else
        request[Symbol("orderIds")] = ids;
    end
    response = Base.fetch(self.privatePostSpotV4CancelOrders(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    allOrders = [];
    successIds = self.safeList(data, "successIds", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(successIds)))
        id = get(successIds, i + 1, nothing);
        push!(allOrders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => "canceled"
), market));
        i += 1
    end
    failIds = self.safeList(data, "failIds", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(failIds)))
        id = get(failIds, i + 1, nothing);
        push!(allOrders, self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => "failed"
), market));
        i += 1
    end
    return allOrders

end
function cancelAllOrders(self::Bitmart, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    if functions.ccxtruthy(type_var == "spot")
        trigger = self.safeBool2(params, "stop", "trigger");
        stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
        params = omit(params, ["stop", "trigger", "stopLossTakeProfit"]);
        if functions.ccxtruthy(@functions.ccxt_or(trigger, stopLossTakeProfit))
            if functions.ccxtruthy(stopLossTakeProfit)
                request[Symbol("type")] = "tp/sl";
            elseif functions.ccxtruthy(trigger)
                request[Symbol("type")] = "trigger";
            end
            response = Base.fetch(self.privatePostSpotV4AlgoCancelAll(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSpotV4CancelAll(extend(request, params)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
        end
        response = Base.fetch(self.privatePostContractPrivateCancelOrders(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrdersByStatus(self::Bitmart, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrdersByStatus() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " fetchOrdersByStatus() does not support ", get(market, Symbol("type"), nothing), " orders, only spot orders are accepted")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("offset") => 1,
        Symbol("N") => 100
    );
    if functions.ccxtruthy(status == "open")
        request[Symbol("status")] = 9;
    elseif functions.ccxtruthy(status == "closed")
        request[Symbol("status")] = 6;
    else
        if functions.ccxtruthy(status == "canceled")
            request[Symbol("status")] = 8;
        else
            request[Symbol("status")] = status;
        end

    end
    response = Base.fetch(self.privateGetSpotV3Orders(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    isTrigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
    params = omit(params, ["stop", "trigger", "stopLossTakeProfit"]);
    if functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = min(limit, 200);
        end
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params);
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("orderMode")] = "iso_margin";
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        until = safeInteger2(params, "until", "endTime");
        if functions.ccxtruthy(until != nothing)
            params = omit(params, ["endTime"]);
            request[Symbol("endTime")] = until;
        end
        if functions.ccxtruthy(@functions.ccxt_or(isTrigger, stopLossTakeProfit))
            if functions.ccxtruthy(isTrigger)
                request[Symbol("orderMode")] = "trigger";
            elseif functions.ccxtruthy(stopLossTakeProfit)
                request[Symbol("orderMode")] = "tp/sl";
            end
            response = Base.fetch(self.privatePostSpotV4QueryAlgoOpenOrders(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSpotV4QueryOpenOrders(extend(request, params)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = min(limit, 100);
        end
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privateGetContractPrivateCurrentPlanOrder(extend(request, params)));
        else
            trailing = self.safeBool(params, "trailing", false);
            orderType = safeString(params, "orderType");
            params = omit(params, ["orderType", "trailing"]);
            if functions.ccxtruthy(trailing)
                orderType = "trailing";
            end
            if functions.ccxtruthy(orderType != nothing)
                request[Symbol("type")] = orderType;
            end
            response = Base.fetch(self.privateGetContractPrivateGetOpenOrders(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " fetchOpenOrders() does not support ", type_var, " orders, only spot and swap orders are accepted")));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrders(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    if functions.ccxtruthy(type_var != "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
        end
    end
    if functions.ccxtruthy(since != nothing)
        startTimeKey = functions.ccxtruthy((type_var == "spot")) ? "startTime" : "start_time";
        request[Symbol(startTimeKey)] = since;
    end
    endTimeKey = functions.ccxtruthy((type_var == "spot")) ? "endTime" : "end_time";
    until = safeInteger2(params, "until", endTimeKey);
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol(endTimeKey)] = until;
    end
    isTrigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
    params = omit(params, ["stop", "trigger", "stopLossTakeProfit"]);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchClosedOrders", params);
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("orderMode")] = "iso_margin";
        end
        if functions.ccxtruthy(@functions.ccxt_or(isTrigger, stopLossTakeProfit))
            if functions.ccxtruthy(isTrigger)
                request[Symbol("orderMode")] = "trigger";
            elseif functions.ccxtruthy(stopLossTakeProfit)
                request[Symbol("orderMode")] = "tp/sl";
            end
            response = Base.fetch(self.privatePostSpotV4QueryAlgoHistoryOrders(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSpotV4QueryHistoryOrders(extend(request, params)));
        end
    else
        response = Base.fetch(self.privateGetContractPrivateOrderHistory(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchCanceledOrders(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("canceled", symbol, since, limit, params))

end
function fetchOrder(self::Bitmart, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    market = nothing;
    response = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrder", market, params);
    if functions.ccxtruthy(type_var == "spot")
        clientOrderId = safeString(params, "clientOrderId");
        trigger = self.safeBool2(params, "stop", "trigger");
        params = omit(params, ["stop", "trigger"]);
        if functions.ccxtruthy(!functions.ccxtruthy(clientOrderId))
            request[Symbol("orderId")] = id;
        end
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(clientOrderId != nothing)
                response = Base.fetch(self.privatePostSpotV4QueryAlgoClientOrder(extend(request, params)));
            else
                response = Base.fetch(self.privatePostSpotV4QueryAlgoOrder(extend(request, params)));
            end
        else
            if functions.ccxtruthy(clientOrderId != nothing)
                response = Base.fetch(self.privatePostSpotV4QueryClientOrder(extend(request, params)));
            else
                response = Base.fetch(self.privatePostSpotV4QueryOrder(extend(request, params)));
            end
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
        end
        trailing = self.safeBool(params, "trailing", false);
        orderType = safeString(params, "orderType");
        params = omit(params, ["orderType", "trailing"]);
        if functions.ccxtruthy(trailing)
            orderType = "trailing";
        end
        if functions.ccxtruthy(orderType != nothing)
            request[Symbol("type")] = orderType;
        end
        request[Symbol("symbol")] = safeString(market, "id");
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.privateGetContractPrivateOrder(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function fetchDepositAddress(self::Bitmart, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = nothing;
    (network, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("currency") => self.getCurrencyIdFromCodeAndNetwork(code, network)
    );
    response = Base.fetch(self.privateGetAccountV1DepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency)

end
function parseDepositAddress(self::Bitmart, depositAddress, currency=nothing)
    currencyId = safeString(depositAddress, "currency");
    network = safeString2(depositAddress, "chain", "network");
    if functions.ccxtruthy(findfirst("NFT", currencyId) === nothing)
        parts = split(currencyId, "-");
        currencyId = safeString(parts, 0);
        secondPart = safeString(parts, 1);
        if functions.ccxtruthy(secondPart != nothing)
            network = secondPart;
        end
    end
    address = safeString(depositAddress, "address");
    currency = self.safeCurrency(currencyId, currency);
    code = safeString(currency, "code");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(network, code),
    Symbol("address") => address,
    Symbol("tag") => safeString2(depositAddress, "address_memo", "memo")
)

end
function withdraw(self::Bitmart, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = nothing;
    (network, params) = self.handleNetworkCodeAndParams(params);
    request = Dict{Symbol, Any}(
        Symbol("currency") => self.getCurrencyIdFromCodeAndNetwork(code, network),
        Symbol("amount") => amount,
        Symbol("destination") => "To Digital Address",
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("address_memo")] = tag;
    end
    response = Base.fetch(self.privatePostAccountV1WithdrawApply(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transaction = self.parseTransaction(data, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("code") => code,
    Symbol("address") => address,
    Symbol("tag") => tag
))

end
function fetchTransactionsByType(self::Bitmart, type_var, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 1000;
    end
    request = Dict{Symbol, Any}(
        Symbol("operation_type") => type_var,
        Symbol("N") => limit
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.privateGetAccountV2DepositWithdrawHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    records = self.safeList(data, "records", []);
    return self.parseTransactions(records, currency, since, limit)

end
function fetchDeposit(self::Bitmart, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetAccountV1DepositWithdrawDetail(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    record = self.safeDict(data, "record", Dict{Symbol, Any}());
    return self.parseTransaction(record)

end
function fetchDeposits(self::Bitmart, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsByType("deposit", code, since, limit, params))

end
function fetchWithdrawal(self::Bitmart, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateGetAccountV1DepositWithdrawDetail(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    record = self.safeDict(data, "record", Dict{Symbol, Any}());
    return self.parseTransaction(record)

end
function fetchWithdrawals(self::Bitmart, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsByType("withdraw", code, since, limit, params))

end
function parseTransactionStatus(self::Bitmart, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "pending",
        Symbol("2") => "pending",
        Symbol("3") => "ok",
        Symbol("4") => "canceled",
        Symbol("5") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitmart, transaction, currency=nothing)
    id = nothing;
    withdrawId = safeString(transaction, "withdraw_id");
    depositId = safeString(transaction, "deposit_id");
    type_var = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((withdrawId != nothing), (withdrawId != "")))
        type_var = "withdraw";
        id = withdrawId;
    elseif functions.ccxtruthy(@functions.ccxt_and((depositId != nothing), (depositId != "")))
        type_var = "deposit";
        id = depositId;
    end
    amount = self.safeNumber(transaction, "arrival_amount");
    timestamp = safeInteger(transaction, "apply_time");
    currencyId = safeString(transaction, "currency");
    networkId = nothing;
    if functions.ccxtruthy(currencyId != nothing)
        if functions.ccxtruthy(findfirst("NFT", currencyId) === nothing)
            parts = split(currencyId, "-");
            currencyId = safeString(parts, 0);
            networkId = safeString(parts, 1);
        end
    end
    code = self.safeCurrencyCode(currencyId, currency);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    txid = safeString(transaction, "tx_id");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "address_memo");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("status") => status,
    Symbol("type") => type_var,
    Symbol("updated") => nothing,
    Symbol("txid") => txid,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("timestamp") => functions.ccxtruthy((timestamp != 0)) ? timestamp : nothing,
    Symbol("datetime") => functions.ccxtruthy((timestamp != 0)) ? self.iso8601(timestamp) : nothing,
    Symbol("fee") => fee
)

end
function repayIsolatedMargin(self::Bitmart, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostSpotV1MarginIsolatedRepay(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function borrowIsolatedMargin(self::Bitmart, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostSpotV1MarginIsolatedBorrow(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function parseMarginLoan(self::Bitmart, info, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(info, "borrow_id", "repay_id"),
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("symbol") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function fetchIsolatedBorrowRate(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetSpotV1MarginIsolatedPairs(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    symbols = self.safeList(data, "symbols", []);
    borrowRate = self.safeDict(symbols, 0, []);
    return self.parseIsolatedBorrowRate(borrowRate, market)

end
function parseIsolatedBorrowRate(self::Bitmart, info, market=nothing)
    marketId = safeString(info, "symbol");
    symbol = self.safeSymbol(marketId, market);
    baseData = self.safeDict(info, "base", Dict{Symbol, Any}());
    quoteData = self.safeDict(info, "quote", Dict{Symbol, Any}());
    baseId = safeString(baseData, "currency");
    quoteId = safeString(quoteData, "currency");
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("base") => self.safeCurrencyCode(baseId),
    Symbol("baseRate") => self.safeNumber(baseData, "hourly_interest"),
    Symbol("quote") => self.safeCurrencyCode(quoteId),
    Symbol("quoteRate") => self.safeNumber(quoteData, "hourly_interest"),
    Symbol("period") => 3600000,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function fetchIsolatedBorrowRates(self::Bitmart, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetSpotV1MarginIsolatedPairs(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    symbols = self.safeList(data, "symbols", []);
    return self.parseIsolatedBorrowRates(symbols)

end
function transfer(self::Bitmart, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    amountToPrecision = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amountToPrecision,
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    fromId = self.convertTypeToAccount(fromAccount);
    toId = self.convertTypeToAccount(toAccount);
    if functions.ccxtruthy(fromAccount == "spot")
        if functions.ccxtruthy(toAccount == "margin")
            request[Symbol("side")] = "in";
            request[Symbol("symbol")] = toId;
        elseif functions.ccxtruthy(toAccount == "swap")
            request[Symbol("type")] = "spot_to_contract";
        end
    elseif functions.ccxtruthy(toAccount == "spot")
        if functions.ccxtruthy(fromAccount == "margin")
            request[Symbol("side")] = "out";
            request[Symbol("symbol")] = fromId;
        elseif functions.ccxtruthy(fromAccount == "swap")
            request[Symbol("type")] = "contract_to_spot";
        end
    else
        throw(ArgumentsRequired(string(self.id, " transfer() requires either fromAccount or toAccount to be spot")));
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((fromAccount == "margin"), (toAccount == "margin")))
        response = Base.fetch(self.privatePostSpotV1MarginIsolatedTransfer(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or((fromAccount == "swap"), (toAccount == "swap")))
        response = Base.fetch(self.privatePostAccountV1TransferContract(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return extend(self.parseTransfer(data, currency), Dict{Symbol, Any}(
    Symbol("status") => self.parseTransferStatus(safeString2(response, "code", "message"))
))

end
function parseTransferStatus(self::Bitmart, status)
    statuses = Dict{Symbol, Any}(
        Symbol("1000") => "ok",
        Symbol("OK") => "ok",
        Symbol("FINISHED") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransferToAccount(self::Bitmart, type_var)
    types = Dict{Symbol, Any}(
        Symbol("contract_to_spot") => "spot",
        Symbol("spot_to_contract") => "swap"
    );
    return safeString(types, type_var, type_var)

end
function parseTransferFromAccount(self::Bitmart, type_var)
    types = Dict{Symbol, Any}(
        Symbol("contract_to_spot") => "swap",
        Symbol("spot_to_contract") => "spot"
    );
    return safeString(types, type_var, type_var)

end
function parseTransfer(self::Bitmart, transfer, currency=nothing)
    currencyId = safeString(transfer, "currency");
    timestamp = safeInteger(transfer, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "transfer_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => self.parseTransferFromAccount(safeString(transfer, "type")),
    Symbol("toAccount") => self.parseTransferToAccount(safeString(transfer, "type")),
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "state"))
)

end
function fetchTransfers(self::Bitmart, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 10;
    end
    pageNumber = safeInteger(params, "page", 1);
    request = Dict{Symbol, Any}(
        Symbol("page") => pageNumber,
        Symbol("limit") => limit
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("time_start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "time_end", until);
    params = omit(params, ["until"]);
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("time_end")] = endTime;
    end
    response = Base.fetch(self.privatePostAccountV1TransferContractList(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    records = self.safeList(data, "records", []);
    return self.parseTransfers(records, currency, since, limit)

end
function fetchBorrowInterest(self::Bitmart, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchBorrowInterest() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("N")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    response = Base.fetch(self.privateGetSpotV1MarginIsolatedBorrowRecord(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    rows = self.safeList(data, "records", []);
    interest = self.parseBorrowInterests(rows, market);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Bitmart, info, market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(info, "create_time");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "currency")),
    Symbol("interest") => self.safeNumber(info, "interest_amount"),
    Symbol("interestRate") => self.safeNumber(info, "hourly_interest"),
    Symbol("amountBorrowed") => self.safeNumber(info, "borrow_amount"),
    Symbol("marginMode") => "isolated",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchOpenInterest(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetContractPublicOpenInterest(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOpenInterest(data, market)

end
function parseOpenInterest(self::Bitmart, interest, market=nothing)
    timestamp = safeInteger(interest, "timestamp");
    id = safeString(interest, "symbol");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(id, market),
    Symbol("openInterestAmount") => self.safeNumber(interest, "open_interest"),
    Symbol("openInterestValue") => self.safeNumber(interest, "open_interest_value"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function setLeverage(self::Bitmart, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params);
    self.checkRequiredArgument("setLeverage", marginMode, "marginMode", ["isolated", "cross"]);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " setLeverage() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => string(leverage),
        Symbol("open_type") => marginMode
    );
    return Base.fetch(self.privatePostContractPrivateSubmitLeverage(extend(request, params)))

end
function fetchFundingRate(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetContractPublicFundingRate(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseFundingRate(data, market)

end
function fetchFundingRateHistory(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
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
    response = Base.fetch(self.publicGetContractPublicFundingRateHistory(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    result = self.safeList(data, "list", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        symbolInner = self.safeSymbol(marketId, market, "-", "swap");
        timestamp = safeInteger(entry, "funding_time");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseFundingRate(self::Bitmart, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    timestamp = safeInteger2(contract, "timestamp", "ts");
    fundingTimestamp = safeInteger2(contract, "funding_time", "fundingTime");
    nextFundingTimestamp = safeInteger(contract, "nextFundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber2(contract, "expected_rate", "fundingRate"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => self.safeNumber(contract, "nextFundingRate"),
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => self.safeNumber(contract, "rate_value"),
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function fetchPosition(self::Bitmart, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetContractPrivatePosition(extend(request, params)));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parsePosition(first_var, market)

end
function fetchPositions(self::Bitmart, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    symbolsLength = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        first_var = safeString(symbols, 0);
        market = self.market(first_var);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbolsLength == 1)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    response = Base.fetch(self.privateGetContractPrivatePositionV2(extend(request, params)));
    positions = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        push!(result, self.parsePosition(get(positions, i + 1, nothing)));
        i += 1
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function parsePosition(self::Bitmart, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(position, "timestamp");
    side = safeInteger(position, "position_type");
    maintenanceMargin = safeString(position, "maintenance_margin");
    notional = safeString(position, "current_value");
    collateral = safeString(position, "position_cross");
    maintenanceMarginPercentage = stringDiv(maintenanceMargin, notional);
    marginRatio = stringDiv(maintenanceMargin, collateral);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("hedged") => nothing,
    Symbol("side") => functions.ccxtruthy((side == 1)) ? "long" : "short",
    Symbol("contracts") => self.safeNumber(position, "current_amount"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("lastPrice") => nothing,
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("collateral") => self.parseNumber(collateral),
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMargin),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(maintenanceMarginPercentage),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_value"),
    Symbol("realizedPnl") => self.safeNumber(position, "realized_value"),
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing,
    Symbol("marginRatio") => self.parseNumber(marginRatio),
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchMyLiquidations(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyLiquidations() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " fetchMyLiquidations() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.privateGetContractPrivateOrderHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        checkLiquidation = safeString(entry, "type");
        if functions.ccxtruthy(checkLiquidation == "liquidate")
                        push!(result, entry);
        end
        i += 1
    end
    return self.parseLiquidations(result, market, since, limit)

end
function parseLiquidation(self::Bitmart, liquidation, market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger(liquidation, "update_time");
    contractsString = safeString(liquidation, "deal_size");
    contractSizeString = safeString(market, "contractSize");
    priceString = safeString(liquidation, "deal_avg_price");
    baseValueString = stringMul(contractsString, contractSizeString);
    quoteValueString = stringMul(baseValueString, priceString);
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("contracts") => self.parseNumber(contractsString),
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("price") => self.parseNumber(priceString),
    Symbol("baseValue") => self.parseNumber(baseValueString),
    Symbol("quoteValue") => self.parseNumber(quoteValueString),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function editOrder(self::Bitmart, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " editOrder() does not support ", get(market, Symbol("type"), nothing), " markets, only swap markets are supported")));
    end
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    stopLoss = self.safeDict(params, "stopLoss", Dict{Symbol, Any}());
    takeProfit = self.safeDict(params, "takeProfit", Dict{Symbol, Any}());
    presetStopLoss = safeString(stopLoss, "triggerPrice");
    presetTakeProfit = safeString(takeProfit, "triggerPrice");
    isTriggerOrder = triggerPrice != nothing;
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    isPresetStopLoss = presetStopLoss != nothing;
    isPresetTakeProfit = presetTakeProfit != nothing;
    isLimitOrder = (type_var == "limit");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("client_order_id")] = clientOrderId;
    end
    if functions.ccxtruthy(id != nothing)
        request[Symbol("order_id")] = id;
    end
    params = omit(params, ["triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice", "stopLoss", "takeProfit"]);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isTriggerOrder, isStopLoss), isTakeProfit))
        request[Symbol("price_type")] = safeInteger(params, "price_type", 1);
        if functions.ccxtruthy(price != nothing)
            request[Symbol("executive_price")] = self.priceToPrecision(symbol, price);
        end
    end
    if functions.ccxtruthy(isTriggerOrder)
        request[Symbol("type")] = type_var;
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        response = Base.fetch(self.privatePostContractPrivateModifyPlanOrder(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        request[Symbol("category")] = type_var;
        if functions.ccxtruthy(isStopLoss)
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, stopLossPrice);
        else
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, takeProfitPrice);
        end
        response = Base.fetch(self.privatePostContractPrivateModifyTpSlOrder(extend(request, params)));
    else
        if functions.ccxtruthy(@functions.ccxt_or(isPresetStopLoss, isPresetTakeProfit))
            if functions.ccxtruthy(isPresetStopLoss)
                request[Symbol("preset_stop_loss_price_type")] = safeInteger(params, "price_type", 1);
                request[Symbol("preset_stop_loss_price")] = self.priceToPrecision(symbol, presetStopLoss);
            else
                request[Symbol("preset_take_profit_price_type")] = safeInteger(params, "price_type", 1);
                request[Symbol("preset_take_profit_price")] = self.priceToPrecision(symbol, presetTakeProfit);
            end
            response = Base.fetch(self.privatePostContractPrivateModifyPresetPlanOrder(extend(request, params)));
        elseif functions.ccxtruthy(isLimitOrder)
            request[Symbol("order_id")] = self.parseToInt(id);
            if functions.ccxtruthy(amount != nothing)
                request[Symbol("size")] = self.amountToPrecision(symbol, amount);
            end
            if functions.ccxtruthy(price != nothing)
                request[Symbol("price")] = self.priceToPrecision(symbol, price);
            end
            response = Base.fetch(self.privatePostContractPrivateModifyLimitOrder(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " editOrder() only supports limit, trigger, stop loss and take profit orders")));
        end

    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function fetchLedger(self::Bitmart, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("end_time", request, params);
    transactionsRequest = self.fetchTransactionsRequest(0, nothing, since, limit, params);
    response = Base.fetch(self.privateGetContractPrivateTransactionHistory(transactionsRequest));
    data = self.safeList(response, "data", []);
    return self.parseLedger(data, currency, since, limit)

end
function parseLedgerEntry(self::Bitmart, item, currency=nothing)
    amount = safeString(item, "amount");
    direction = nothing;
    if functions.ccxtruthy(stringLe(amount, "0"))
        direction = "out";
        amount = stringMul("-1", amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "asset");
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(item, "time");
    type_var = safeString(item, "type");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "tran_id"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => safeString(item, "tradeId"),
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Bitmart, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("Commission Fee") => "fee",
        Symbol("Funding Fee") => "fee",
        Symbol("Realized PNL") => "trade",
        Symbol("Transfer") => "transfer",
        Symbol("Liquidation Clearance") => "settlement"
    );
    return safeString(ledgerType, type_var, type_var)

end
function fetchTransactionsRequest(self::Bitmart, flowType=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(flowType != nothing)
        request[Symbol("flow_type")] = flowType;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    return extend(request, params)

end
function fetchFundingHistory(self::Bitmart, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("end_time", request, params);
    transactionsRequest = self.fetchTransactionsRequest(3, symbol, since, limit, params);
    response = Base.fetch(self.privateGetContractPrivateTransactionHistory(transactionsRequest));
    data = self.safeList(response, "data", []);
    return self.parseFundingHistories(data, market, since, limit)

end
function parseFundingHistory(self::Bitmart, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    currencyId = safeString(contract, "asset");
    timestamp = safeInteger(contract, "time");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(contract, "tran_id"),
    Symbol("amount") => self.safeNumber(contract, "amount")
)

end
function parseFundingHistories(self::Bitmart, contracts, market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contracts)))
        contract = get(contracts, i + 1, nothing);
        push!(result, self.parseFundingHistory(contract, market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since, limit)

end
function fetchWithdrawAddresses(self::Bitmart, code, note=nothing, networkCode=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    codes = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        code = get(currency, Symbol("code"), nothing);
        codes = [code];
    end
    response = Base.fetch(self.privateGetAccountV1WithdrawAddressList(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    list = self.safeList(data, "list", []);
    allAddresses = self.parseDepositAddresses(list, codes, false);
    addresses = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allAddresses)))
        address = get(allAddresses, i + 1, nothing);
        noteMatch = @functions.ccxt_or((note == nothing), (get(address, Symbol("note"), nothing) == note));
        networkMatch = @functions.ccxt_or((networkCode == nothing), (get(address, Symbol("network"), nothing) == networkCode));
        if functions.ccxtruthy(@functions.ccxt_and(noteMatch, networkMatch))
                        push!(addresses, address);
        end
        i += 1
    end
    return addresses

end
function setPositionMode(self::Bitmart, hedged, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionMode = nothing;
    if functions.ccxtruthy(hedged)
        positionMode = "hedge_mode";
    else
        positionMode = "one_way_mode";
    end
    request = Dict{Symbol, Any}(
        Symbol("position_mode") => positionMode
    );
    return Base.fetch(self.privatePostContractPrivateSetPositionMode(extend(request, params)))

end
function fetchPositionMode(self::Bitmart, symbol=nothing, params=Dict())
    response = Base.fetch(self.privateGetContractPrivateGetPositionMode(params));
    data = self.safeDict(response, "data");
    positionMode = safeString(data, "position_mode");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => (positionMode == "hedge_mode")
)

end
function nonce(self::Bitmart, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Bitmart, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    parts = split(path, "/");
    category = safeString(parts, 0, "spot");
    market = functions.ccxtruthy((@functions.ccxt_or(category == "spot", category == "account"))) ? "spot" : "swap";
    baseUrl = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(market), nothing));
    url = string(baseUrl, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    queryString = "";
    getOrDelete = @functions.ccxt_or((method == "GET"), (method == "DELETE"));
    if functions.ccxtruthy(getOrDelete)
        if functions.ccxtruthy(length(objectKeys(query)))
            queryString = self.urlencode(query);
            url += string("?", queryString);
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(self.nonce());
        brokerId = safeString(self.options, "brokerId", "CCXTxBitmart000");
        headers = Dict{Symbol, Any}(
            Symbol("X-BM-KEY") => self.apiKey,
            Symbol("X-BM-TIMESTAMP") => timestamp,
            Symbol("X-BM-BROKER-ID") => brokerId,
            Symbol("Content-Type") => "application/json"
        );
        if functions.ccxtruthy(!functions.ccxtruthy(getOrDelete))
            body = json(query);
            queryString = body;
        end
        auth = string(timestamp, "#", self.uid, "#", queryString);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        headers[Symbol("X-BM-SIGN")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitmart, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    message = safeString(response, "message");
    messageLower = lowercase(message);
    isErrorMessage = @functions.ccxt_and(@functions.ccxt_and((message != nothing), (messageLower != "ok")), (messageLower != "success"));
    errorCode = safeString(response, "code");
    isErrorCode = @functions.ccxt_and((errorCode != nothing), (errorCode != "1000"));
    if functions.ccxtruthy(@functions.ccxt_or(isErrorCode, isErrorMessage))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitmart, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetSystemTime(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "system/time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function publicGetSystemService(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "system/service", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function publicGetSpotV1Currencies(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/currencies", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function publicGetSpotV1Symbols(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function publicGetSpotV1SymbolsDetails(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/symbols/details", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetSpotQuotationV3Tickers(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function publicGetSpotQuotationV3Ticker(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicGetSpotQuotationV3LiteKlines(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/lite-klines", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetSpotQuotationV3Klines(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/klines", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7))
end

function publicGetSpotQuotationV3Books(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/books", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicGetSpotQuotationV3Trades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/quotation/v3/trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function publicGetSpotV1Ticker(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetSpotV2Ticker(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetSpotV1TickerDetail(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/ticker_detail", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetSpotV1Steps(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/steps", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetSpotV1SymbolsKline(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/symbols/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function publicGetSpotV1SymbolsBook(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/symbols/book", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetSpotV1SymbolsTrades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/symbols/trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetContractV1Tickers(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/v1/tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 15))
end

function publicGetContractPublicDetails(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/details", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetContractPublicDepth(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/depth", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetContractPublicOpenInterest(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/open-interest", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetContractPublicFundingRate(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/funding-rate", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetContractPublicFundingRateHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/funding-rate-history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetContractPublicKline(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function publicGetAccountV1Currencies(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/currencies", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function publicGetContractPublicMarkpriceKline(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/public/markprice-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountSubAccountV1TransferList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/v1/transfer-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountSubAccountV1TransferHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/v1/transfer-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountSubAccountMainV1Wallet(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/main/v1/wallet", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountSubAccountMainV1SubaccountList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/main/v1/subaccount-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountContractSubAccountMainV1Wallet(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/main/v1/wallet", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountContractSubAccountMainV1TransferList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/main/v1/transfer-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountContractSubAccountV1TransferHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/v1/transfer-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountV1Wallet(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/wallet", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountV1Currencies(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/currencies", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetSpotV1Wallet(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetAccountV1DepositAddress(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/deposit/address", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetAccountV1WithdrawCharge(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/withdraw/charge", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 32))
end

function privateGetAccountV2DepositWithdrawHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v2/deposit-withdraw/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountV1DepositWithdrawDetail(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/deposit-withdraw/detail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privateGetAccountV1WithdrawAddressList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/withdraw/address/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetSpotV1OrderDetail(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/order_detail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotV2Orders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetSpotV1Trades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetSpotV2Trades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privateGetSpotV3Orders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v3/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetSpotV2OrderDetail(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/order_detail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotV1MarginIsolatedBorrowRecord(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/borrow_record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotV1MarginIsolatedRepayRecord(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/repay_record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSpotV1MarginIsolatedPairs(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/pairs", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetSpotV1MarginIsolatedAccount(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetSpotV1TradeFee(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade_fee", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetSpotV1UserFee(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/user_fee", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetSpotV1BrokerRebate(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/broker/rebate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractPrivateAssetsDetail(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/assets-detail", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetContractPrivateOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1.2))
end

function privateGetContractPrivateOrderHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/order-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivatePosition(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/position", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivatePositionV2(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/position-v2", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivateGetOpenOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/get-open-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1.2))
end

function privateGetContractPrivateCurrentPlanOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/current-plan-order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1.2))
end

function privateGetContractPrivateTrades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivatePositionRisk(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/position-risk", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivateAffilateRebateList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/affilate/rebate-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivateAffilateTradeList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/affilate/trade-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivateTransactionHistory(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/transaction-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractPrivateGetPositionMode(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/get-position-mode", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountSubAccountMainV1SubToMain(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/main/v1/sub-to-main", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountSubAccountSubV1SubToMain(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/sub/v1/sub-to-main", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountSubAccountMainV1MainToSub(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/main/v1/main-to-sub", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountSubAccountSubV1SubToSub(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/sub/v1/sub-to-sub", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountSubAccountMainV1SubToSub(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/sub-account/main/v1/sub-to-sub", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountContractSubAccountMainV1SubToMain(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/main/v1/sub-to-main", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privatePostAccountContractSubAccountMainV1MainToSub(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/main/v1/main-to-sub", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privatePostAccountContractSubAccountSubV1SubToMain(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/contract/sub-account/sub/v1/sub-to-main", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privatePostAccountV1WithdrawApply(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/withdraw/apply", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 7.5))
end

function privatePostSpotV1SubmitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/submit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV1BatchOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/batch_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV2CancelOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/cancel_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV1CancelOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/cancel_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 15))
end

function privatePostSpotV4QueryOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV4QueryClientOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/client-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV4QueryOpenOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/open-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotV4QueryHistoryOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/history-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotV4QueryTrades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/trades", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotV4QueryOrderTrades(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/order-trades", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotV4CancelOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/cancel_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privatePostSpotV4CancelAll(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/cancel_all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 90))
end

function privatePostSpotV4BatchOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/batch_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privatePostSpotV4AlgoSubmitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/algo/submit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function privatePostSpotV4AlgoCancelOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/algo/cancel_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 6))
end

function privatePostSpotV4AlgoCancelAll(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/algo/cancel_all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 12))
end

function privatePostSpotV4QueryAlgoOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/algo/order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostSpotV4QueryAlgoClientOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/algo/client-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostSpotV4QueryAlgoOpenOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/algo/open-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privatePostSpotV4QueryAlgoHistoryOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v4/query/algo/history-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privatePostSpotV3CancelOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v3/cancel_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV2BatchOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/batch_orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV2SubmitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v2/submit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSpotV1MarginSubmitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/submit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostSpotV1MarginIsolatedBorrow(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/borrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostSpotV1MarginIsolatedRepay(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostSpotV1MarginIsolatedTransfer(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "spot/v1/margin/isolated/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostAccountV1TransferContractList(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/transfer-contract-list", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function privatePostAccountV1TransferContract(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "account/v1/transfer-contract", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 60))
end

function privatePostContractPrivateSubmitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/submit-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateCancelOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/cancel-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostContractPrivateCancelOrders(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/cancel-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostContractPrivateSubmitPlanOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/submit-plan-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateCancelPlanOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/cancel-plan-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostContractPrivateSubmitLeverage(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/submit-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateSubmitTpSlOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/submit-tp-sl-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateModifyPlanOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/modify-plan-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateModifyPresetPlanOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/modify-preset-plan-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateModifyLimitOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/modify-limit-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateModifyTpSlOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/modify-tp-sl-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateSubmitTrailOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/submit-trail-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractPrivateCancelTrailOrder(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/cancel-trail-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1.5))
end

function privatePostContractPrivateSetPositionMode(self::Bitmart, params=Dict(), context=Dict())
    return request(self, "contract/private/set-position-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Bitmart(; kwargs...)
    inst = Bitmart(Exchange(), describe, fetchTime, fetchStatus, fetchSpotMarkets, fetchContractMarkets, fetchMarkets, fetchCurrencies, getCurrencyIdFromCodeAndNetwork, fetchTransactionFee, parseDepositWithdrawFee, fetchDepositWithdrawFee, parseTicker, fetchTicker, fetchTickers, fetchOrderBook, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, fetchMyTrades, fetchOrderTrades, customParseBalance, parseBalanceHelper, fetchBalance, parseTradingFee, fetchTradingFee, parseOrder, parseOrderSide, parseOrderStatusByType, createMarketBuyOrderWithCost, createOrder, createOrders, createSwapOrderRequest, createSpotOrderRequest, cancelOrder, cancelOrders, cancelAllOrders, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrder, fetchDepositAddress, parseDepositAddress, withdraw, fetchTransactionsByType, fetchDeposit, fetchDeposits, fetchWithdrawal, fetchWithdrawals, parseTransactionStatus, parseTransaction, repayIsolatedMargin, borrowIsolatedMargin, parseMarginLoan, fetchIsolatedBorrowRate, parseIsolatedBorrowRate, fetchIsolatedBorrowRates, transfer, parseTransferStatus, parseTransferToAccount, parseTransferFromAccount, parseTransfer, fetchTransfers, fetchBorrowInterest, parseBorrowInterest, fetchOpenInterest, parseOpenInterest, setLeverage, fetchFundingRate, fetchFundingRateHistory, parseFundingRate, fetchPosition, fetchPositions, parsePosition, fetchMyLiquidations, parseLiquidation, editOrder, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchTransactionsRequest, fetchFundingHistory, parseFundingHistory, parseFundingHistories, fetchWithdrawAddresses, setPositionMode, fetchPositionMode, nonce, sign, handleErrors, publicGetSystemTime, publicGetSystemService, publicGetSpotV1Currencies, publicGetSpotV1Symbols, publicGetSpotV1SymbolsDetails, publicGetSpotQuotationV3Tickers, publicGetSpotQuotationV3Ticker, publicGetSpotQuotationV3LiteKlines, publicGetSpotQuotationV3Klines, publicGetSpotQuotationV3Books, publicGetSpotQuotationV3Trades, publicGetSpotV1Ticker, publicGetSpotV2Ticker, publicGetSpotV1TickerDetail, publicGetSpotV1Steps, publicGetSpotV1SymbolsKline, publicGetSpotV1SymbolsBook, publicGetSpotV1SymbolsTrades, publicGetContractV1Tickers, publicGetContractPublicDetails, publicGetContractPublicDepth, publicGetContractPublicOpenInterest, publicGetContractPublicFundingRate, publicGetContractPublicFundingRateHistory, publicGetContractPublicKline, publicGetAccountV1Currencies, publicGetContractPublicMarkpriceKline, privateGetAccountSubAccountV1TransferList, privateGetAccountSubAccountV1TransferHistory, privateGetAccountSubAccountMainV1Wallet, privateGetAccountSubAccountMainV1SubaccountList, privateGetAccountContractSubAccountMainV1Wallet, privateGetAccountContractSubAccountMainV1TransferList, privateGetAccountContractSubAccountV1TransferHistory, privateGetAccountV1Wallet, privateGetAccountV1Currencies, privateGetSpotV1Wallet, privateGetAccountV1DepositAddress, privateGetAccountV1WithdrawCharge, privateGetAccountV2DepositWithdrawHistory, privateGetAccountV1DepositWithdrawDetail, privateGetAccountV1WithdrawAddressList, privateGetSpotV1OrderDetail, privateGetSpotV2Orders, privateGetSpotV1Trades, privateGetSpotV2Trades, privateGetSpotV3Orders, privateGetSpotV2OrderDetail, privateGetSpotV1MarginIsolatedBorrowRecord, privateGetSpotV1MarginIsolatedRepayRecord, privateGetSpotV1MarginIsolatedPairs, privateGetSpotV1MarginIsolatedAccount, privateGetSpotV1TradeFee, privateGetSpotV1UserFee, privateGetSpotV1BrokerRebate, privateGetContractPrivateAssetsDetail, privateGetContractPrivateOrder, privateGetContractPrivateOrderHistory, privateGetContractPrivatePosition, privateGetContractPrivatePositionV2, privateGetContractPrivateGetOpenOrders, privateGetContractPrivateCurrentPlanOrder, privateGetContractPrivateTrades, privateGetContractPrivatePositionRisk, privateGetContractPrivateAffilateRebateList, privateGetContractPrivateAffilateTradeList, privateGetContractPrivateTransactionHistory, privateGetContractPrivateGetPositionMode, privatePostAccountSubAccountMainV1SubToMain, privatePostAccountSubAccountSubV1SubToMain, privatePostAccountSubAccountMainV1MainToSub, privatePostAccountSubAccountSubV1SubToSub, privatePostAccountSubAccountMainV1SubToSub, privatePostAccountContractSubAccountMainV1SubToMain, privatePostAccountContractSubAccountMainV1MainToSub, privatePostAccountContractSubAccountSubV1SubToMain, privatePostAccountV1WithdrawApply, privatePostSpotV1SubmitOrder, privatePostSpotV1BatchOrders, privatePostSpotV2CancelOrder, privatePostSpotV1CancelOrders, privatePostSpotV4QueryOrder, privatePostSpotV4QueryClientOrder, privatePostSpotV4QueryOpenOrders, privatePostSpotV4QueryHistoryOrders, privatePostSpotV4QueryTrades, privatePostSpotV4QueryOrderTrades, privatePostSpotV4CancelOrders, privatePostSpotV4CancelAll, privatePostSpotV4BatchOrders, privatePostSpotV4AlgoSubmitOrder, privatePostSpotV4AlgoCancelOrder, privatePostSpotV4AlgoCancelAll, privatePostSpotV4QueryAlgoOrder, privatePostSpotV4QueryAlgoClientOrder, privatePostSpotV4QueryAlgoOpenOrders, privatePostSpotV4QueryAlgoHistoryOrders, privatePostSpotV3CancelOrder, privatePostSpotV2BatchOrders, privatePostSpotV2SubmitOrder, privatePostSpotV1MarginSubmitOrder, privatePostSpotV1MarginIsolatedBorrow, privatePostSpotV1MarginIsolatedRepay, privatePostSpotV1MarginIsolatedTransfer, privatePostAccountV1TransferContractList, privatePostAccountV1TransferContract, privatePostContractPrivateSubmitOrder, privatePostContractPrivateCancelOrder, privatePostContractPrivateCancelOrders, privatePostContractPrivateSubmitPlanOrder, privatePostContractPrivateCancelPlanOrder, privatePostContractPrivateSubmitLeverage, privatePostContractPrivateSubmitTpSlOrder, privatePostContractPrivateModifyPlanOrder, privatePostContractPrivateModifyPresetPlanOrder, privatePostContractPrivateModifyLimitOrder, privatePostContractPrivateModifyTpSlOrder, privatePostContractPrivateSubmitTrailOrder, privatePostContractPrivateCancelTrailOrder, privatePostContractPrivateSetPositionMode)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
