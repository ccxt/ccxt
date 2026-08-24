@kwdef mutable struct Coinbase <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchAccounts::Function = fetchAccounts
    fetchAccountsV2::Function = fetchAccountsV2
    fetchAccountsV3::Function = fetchAccountsV3
    fetchPortfolios::Function = fetchPortfolios
    parseAccount::Function = parseAccount
    createDepositAddress::Function = createDepositAddress
    fetchMySells::Function = fetchMySells
    fetchMyBuys::Function = fetchMyBuys
    fetchTransactionsWithMethod::Function = fetchTransactionsWithMethod
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDeposits::Function = fetchDeposits
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseTrade::Function = parseTrade
    fetchMarkets::Function = fetchMarkets
    fetchMarketsV2::Function = fetchMarketsV2
    fetchMarketsV3::Function = fetchMarketsV3
    parseSpotMarket::Function = parseSpotMarket
    parseContractMarket::Function = parseContractMarket
    fetchCurrenciesFromCache::Function = fetchCurrenciesFromCache
    fetchCurrencies::Function = fetchCurrencies
    fetchTickers::Function = fetchTickers
    fetchTickersV2::Function = fetchTickersV2
    fetchTickersV3::Function = fetchTickersV3
    fetchTicker::Function = fetchTicker
    fetchTickerV2::Function = fetchTickerV2
    fetchTickerV3::Function = fetchTickerV3
    parseTicker::Function = parseTicker
    parseCustomBalance::Function = parseCustomBalance
    fetchBalance::Function = fetchBalance
    fetchLedger::Function = fetchLedger
    parseLedgerEntryStatus::Function = parseLedgerEntryStatus
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    findAccountId::Function = findAccountId
    prepareAccountRequest::Function = prepareAccountRequest
    prepareAccountRequestWithCurrencyCode::Function = prepareAccountRequestWithCurrencyCode
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    parseTimeInForce::Function = parseTimeInForce
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    editOrder::Function = editOrder
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderBook::Function = fetchOrderBook
    fetchBidsAsks::Function = fetchBidsAsks
    withdraw::Function = withdraw
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    parseDepositAddress::Function = parseDepositAddress
    deposit::Function = deposit
    fetchDeposit::Function = fetchDeposit
    fetchDepositMethodIds::Function = fetchDepositMethodIds
    fetchDepositMethodId::Function = fetchDepositMethodId
    parseDepositMethodIds::Function = parseDepositMethodIds
    parseDepositMethodId::Function = parseDepositMethodId
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTrade::Function = fetchConvertTrade
    parseConversion::Function = parseConversion
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    closePosition::Function = closePosition
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    fetchTradingFees::Function = fetchTradingFees
    fetchPortfolioDetails::Function = fetchPortfolioDetails
    parsePortfolioDetails::Function = parsePortfolioDetails
    createAuthToken::Function = createAuthToken
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    fetchDepositAddresses::Function = fetchDepositAddresses

# Generated REST endpoint fields
    v2PublicGetCurrencies::Function = v2PublicGetCurrencies
    v2PublicGetCurrenciesCrypto::Function = v2PublicGetCurrenciesCrypto
    v2PublicGetTime::Function = v2PublicGetTime
    v2PublicGetExchangeRates::Function = v2PublicGetExchangeRates
    v2PublicGetUsersUserId::Function = v2PublicGetUsersUserId
    v2PublicGetPricesSymbolBuy::Function = v2PublicGetPricesSymbolBuy
    v2PublicGetPricesSymbolSell::Function = v2PublicGetPricesSymbolSell
    v2PublicGetPricesSymbolSpot::Function = v2PublicGetPricesSymbolSpot
    v2PrivateGetAccounts::Function = v2PrivateGetAccounts
    v2PrivateGetAccountsAccountId::Function = v2PrivateGetAccountsAccountId
    v2PrivateGetAccountsAccountIdAddresses::Function = v2PrivateGetAccountsAccountIdAddresses
    v2PrivateGetAccountsAccountIdAddressesAddressId::Function = v2PrivateGetAccountsAccountIdAddressesAddressId
    v2PrivateGetAccountsAccountIdAddressesAddressIdTransactions::Function = v2PrivateGetAccountsAccountIdAddressesAddressIdTransactions
    v2PrivateGetAccountsAccountIdTransactions::Function = v2PrivateGetAccountsAccountIdTransactions
    v2PrivateGetAccountsAccountIdTransactionsTransactionId::Function = v2PrivateGetAccountsAccountIdTransactionsTransactionId
    v2PrivateGetAccountsAccountIdBuys::Function = v2PrivateGetAccountsAccountIdBuys
    v2PrivateGetAccountsAccountIdBuysBuyId::Function = v2PrivateGetAccountsAccountIdBuysBuyId
    v2PrivateGetAccountsAccountIdSells::Function = v2PrivateGetAccountsAccountIdSells
    v2PrivateGetAccountsAccountIdSellsSellId::Function = v2PrivateGetAccountsAccountIdSellsSellId
    v2PrivateGetAccountsAccountIdDeposits::Function = v2PrivateGetAccountsAccountIdDeposits
    v2PrivateGetAccountsAccountIdDepositsDepositId::Function = v2PrivateGetAccountsAccountIdDepositsDepositId
    v2PrivateGetAccountsAccountIdWithdrawals::Function = v2PrivateGetAccountsAccountIdWithdrawals
    v2PrivateGetAccountsAccountIdWithdrawalsWithdrawalId::Function = v2PrivateGetAccountsAccountIdWithdrawalsWithdrawalId
    v2PrivateGetPaymentMethods::Function = v2PrivateGetPaymentMethods
    v2PrivateGetPaymentMethodsPaymentMethodId::Function = v2PrivateGetPaymentMethodsPaymentMethodId
    v2PrivateGetUser::Function = v2PrivateGetUser
    v2PrivateGetUserAuth::Function = v2PrivateGetUserAuth
    v2PrivatePostAccounts::Function = v2PrivatePostAccounts
    v2PrivatePostAccountsAccountIdPrimary::Function = v2PrivatePostAccountsAccountIdPrimary
    v2PrivatePostAccountsAccountIdAddresses::Function = v2PrivatePostAccountsAccountIdAddresses
    v2PrivatePostAccountsAccountIdTransactions::Function = v2PrivatePostAccountsAccountIdTransactions
    v2PrivatePostAccountsAccountIdTransactionsTransactionIdComplete::Function = v2PrivatePostAccountsAccountIdTransactionsTransactionIdComplete
    v2PrivatePostAccountsAccountIdTransactionsTransactionIdResend::Function = v2PrivatePostAccountsAccountIdTransactionsTransactionIdResend
    v2PrivatePostAccountsAccountIdBuys::Function = v2PrivatePostAccountsAccountIdBuys
    v2PrivatePostAccountsAccountIdBuysBuyIdCommit::Function = v2PrivatePostAccountsAccountIdBuysBuyIdCommit
    v2PrivatePostAccountsAccountIdSells::Function = v2PrivatePostAccountsAccountIdSells
    v2PrivatePostAccountsAccountIdSellsSellIdCommit::Function = v2PrivatePostAccountsAccountIdSellsSellIdCommit
    v2PrivatePostAccountsAccountIdDeposits::Function = v2PrivatePostAccountsAccountIdDeposits
    v2PrivatePostAccountsAccountIdDepositsDepositIdCommit::Function = v2PrivatePostAccountsAccountIdDepositsDepositIdCommit
    v2PrivatePostAccountsAccountIdWithdrawals::Function = v2PrivatePostAccountsAccountIdWithdrawals
    v2PrivatePostAccountsAccountIdWithdrawalsWithdrawalIdCommit::Function = v2PrivatePostAccountsAccountIdWithdrawalsWithdrawalIdCommit
    v2PrivatePutAccountsAccountId::Function = v2PrivatePutAccountsAccountId
    v2PrivatePutUser::Function = v2PrivatePutUser
    v2PrivateDeleteAccountsId::Function = v2PrivateDeleteAccountsId
    v2PrivateDeleteAccountsAccountIdTransactionsTransactionId::Function = v2PrivateDeleteAccountsAccountIdTransactionsTransactionId
    v3PublicGetBrokerageTime::Function = v3PublicGetBrokerageTime
    v3PublicGetBrokerageMarketProductBook::Function = v3PublicGetBrokerageMarketProductBook
    v3PublicGetBrokerageMarketProducts::Function = v3PublicGetBrokerageMarketProducts
    v3PublicGetBrokerageMarketProductsProductId::Function = v3PublicGetBrokerageMarketProductsProductId
    v3PublicGetBrokerageMarketProductsProductIdCandles::Function = v3PublicGetBrokerageMarketProductsProductIdCandles
    v3PublicGetBrokerageMarketProductsProductIdTicker::Function = v3PublicGetBrokerageMarketProductsProductIdTicker
    v3PrivateGetBrokerageAccounts::Function = v3PrivateGetBrokerageAccounts
    v3PrivateGetBrokerageAccountsAccountUuid::Function = v3PrivateGetBrokerageAccountsAccountUuid
    v3PrivateGetBrokerageOrdersHistoricalBatch::Function = v3PrivateGetBrokerageOrdersHistoricalBatch
    v3PrivateGetBrokerageOrdersHistoricalFills::Function = v3PrivateGetBrokerageOrdersHistoricalFills
    v3PrivateGetBrokerageOrdersHistoricalOrderId::Function = v3PrivateGetBrokerageOrdersHistoricalOrderId
    v3PrivateGetBrokerageProducts::Function = v3PrivateGetBrokerageProducts
    v3PrivateGetBrokerageProductsProductId::Function = v3PrivateGetBrokerageProductsProductId
    v3PrivateGetBrokerageProductsProductIdCandles::Function = v3PrivateGetBrokerageProductsProductIdCandles
    v3PrivateGetBrokerageProductsProductIdTicker::Function = v3PrivateGetBrokerageProductsProductIdTicker
    v3PrivateGetBrokerageBestBidAsk::Function = v3PrivateGetBrokerageBestBidAsk
    v3PrivateGetBrokerageProductBook::Function = v3PrivateGetBrokerageProductBook
    v3PrivateGetBrokerageTransactionSummary::Function = v3PrivateGetBrokerageTransactionSummary
    v3PrivateGetBrokeragePortfolios::Function = v3PrivateGetBrokeragePortfolios
    v3PrivateGetBrokeragePortfoliosPortfolioUuid::Function = v3PrivateGetBrokeragePortfoliosPortfolioUuid
    v3PrivateGetBrokerageConvertTradeTradeId::Function = v3PrivateGetBrokerageConvertTradeTradeId
    v3PrivateGetBrokerageCfmBalanceSummary::Function = v3PrivateGetBrokerageCfmBalanceSummary
    v3PrivateGetBrokerageCfmPositions::Function = v3PrivateGetBrokerageCfmPositions
    v3PrivateGetBrokerageCfmPositionsProductId::Function = v3PrivateGetBrokerageCfmPositionsProductId
    v3PrivateGetBrokerageCfmSweeps::Function = v3PrivateGetBrokerageCfmSweeps
    v3PrivateGetBrokerageIntxPortfolioPortfolioUuid::Function = v3PrivateGetBrokerageIntxPortfolioPortfolioUuid
    v3PrivateGetBrokerageIntxPositionsPortfolioUuid::Function = v3PrivateGetBrokerageIntxPositionsPortfolioUuid
    v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol::Function = v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol
    v3PrivateGetBrokeragePaymentMethods::Function = v3PrivateGetBrokeragePaymentMethods
    v3PrivateGetBrokeragePaymentMethodsPaymentMethodId::Function = v3PrivateGetBrokeragePaymentMethodsPaymentMethodId
    v3PrivateGetBrokerageKeyPermissions::Function = v3PrivateGetBrokerageKeyPermissions
    v3PrivatePostBrokerageOrders::Function = v3PrivatePostBrokerageOrders
    v3PrivatePostBrokerageOrdersBatchCancel::Function = v3PrivatePostBrokerageOrdersBatchCancel
    v3PrivatePostBrokerageOrdersEdit::Function = v3PrivatePostBrokerageOrdersEdit
    v3PrivatePostBrokerageOrdersEditPreview::Function = v3PrivatePostBrokerageOrdersEditPreview
    v3PrivatePostBrokerageOrdersPreview::Function = v3PrivatePostBrokerageOrdersPreview
    v3PrivatePostBrokeragePortfolios::Function = v3PrivatePostBrokeragePortfolios
    v3PrivatePostBrokeragePortfoliosMoveFunds::Function = v3PrivatePostBrokeragePortfoliosMoveFunds
    v3PrivatePostBrokerageConvertQuote::Function = v3PrivatePostBrokerageConvertQuote
    v3PrivatePostBrokerageConvertTradeTradeId::Function = v3PrivatePostBrokerageConvertTradeTradeId
    v3PrivatePostBrokerageCfmSweepsSchedule::Function = v3PrivatePostBrokerageCfmSweepsSchedule
    v3PrivatePostBrokerageIntxAllocate::Function = v3PrivatePostBrokerageIntxAllocate
    v3PrivatePostBrokerageOrdersClosePosition::Function = v3PrivatePostBrokerageOrdersClosePosition
    v3PrivatePutBrokeragePortfoliosPortfolioUuid::Function = v3PrivatePutBrokeragePortfoliosPortfolioUuid
    v3PrivateDeleteBrokeragePortfoliosPortfolioUuid::Function = v3PrivateDeleteBrokeragePortfoliosPortfolioUuid
    v3PrivateDeleteBrokerageCfmSweeps::Function = v3PrivateDeleteBrokerageCfmSweeps

end
function describe(self::Coinbase, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinbase",
    Symbol("name") => "Coinbase Advanced",
    Symbol("countries") => ["US"],
    Symbol("pro") => true,
    Symbol("certified") => false,
    Symbol("rateLimit") => 34,
    Symbol("version") => "v2",
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome"), nothing),
    Symbol("headers") => Dict{Symbol, Any}(
        Symbol("CB-VERSION") => "2018-05-30"
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrder") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("deposit") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => true,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => "emulated",
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDepositMethodId") => true,
        Symbol("fetchDepositMethodIds") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
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
        Symbol("fetchL2OrderBook") => false,
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
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyBuys") => true,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySells") => true,
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
        Symbol("fetchOrdersByStatus") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => "emulated",
        Symbol("fetchTradingFees") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.coinbase.com"
        ),
        Symbol("www") => "https://www.coinbase.com",
        Symbol("doc") => ["https://docs.cdp.coinbase.com/coinbase-app/introduction/welcome", "https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/api-reference"],
        Symbol("fees") => ["https://support.coinbase.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees", "https://www.coinbase.com/advanced-fees"],
        Symbol("referral") => "https://www.coinbase.com/join/58cbe25a355148797479dbd2"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("currencies/crypto") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("exchange-rates") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("users/{user_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("prices/{symbol}/buy") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("prices/{symbol}/sell") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("prices/{symbol}/spot") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/addresses/{address_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/addresses/{address_id}/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions/{transaction_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/buys") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/buys/{buy_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/sells") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/sells/{sell_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/deposits/{deposit_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/withdrawals/{withdrawal_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("payment-methods") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("payment-methods/{payment_method_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("user") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("user/auth") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/primary") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions/{transaction_id}/complete") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions/{transaction_id}/resend") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/buys") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/buys/{buy_id}/commit") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/sells") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/sells/{sell_id}/commit") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/deposits/{deposit_id}/commit") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/withdrawals/{withdrawal_id}/commit") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("accounts/{account_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("user") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("accounts/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
),
                    Symbol("accounts/{account_id}/transactions/{transaction_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 10.6
)
                )
            )
        ),
        Symbol("v3") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("brokerage/time") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/market/product_book") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/market/products") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/market/products/{product_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/market/products/{product_id}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/market/products/{product_id}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 3
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("brokerage/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/accounts/{account_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/historical/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/historical/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/historical/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/products") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/products/{product_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/products/{product_id}/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/products/{product_id}/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/best_bid_ask") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/product_book") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/transaction_summary") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("brokerage/portfolios") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/portfolios/{portfolio_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/convert/trade/{trade_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/balance_summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/positions/{product_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/sweeps") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/intx/portfolio/{portfolio_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/intx/positions/{portfolio_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/intx/positions/{portfolio_uuid}/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/payment_methods") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/payment_methods/{payment_method_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/key_permissions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("brokerage/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/batch_cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/edit_preview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/preview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/portfolios") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/portfolios/move_funds") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/convert/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/convert/trade/{trade_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/sweeps/schedule") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/intx/allocate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/orders/close_position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("brokerage/portfolios/{portfolio_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("brokerage/portfolios/{portfolio_uuid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("brokerage/cfm/sweeps") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.012"),
            Symbol("maker") => self.parseNumber("0.006"),
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.006")], [self.parseNumber("10000"), self.parseNumber("0.004")], [self.parseNumber("50000"), self.parseNumber("0.0025")], [self.parseNumber("100000"), self.parseNumber("0.002")], [self.parseNumber("1000000"), self.parseNumber("0.0018")], [self.parseNumber("15000000"), self.parseNumber("0.0016")], [self.parseNumber("75000000"), self.parseNumber("0.0012")], [self.parseNumber("250000000"), self.parseNumber("0.0008")], [self.parseNumber("400000000"), self.parseNumber("0.0005")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("10000"), self.parseNumber("0.0025")], [self.parseNumber("50000"), self.parseNumber("0.0015")], [self.parseNumber("100000"), self.parseNumber("0.001")], [self.parseNumber("1000000"), self.parseNumber("0.0008")], [self.parseNumber("15000000"), self.parseNumber("0.0006")], [self.parseNumber("75000000"), self.parseNumber("0.0003")], [self.parseNumber("250000000"), self.parseNumber("0.0")], [self.parseNumber("400000000"), self.parseNumber("0.0")]]
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("two_factor_required") => AuthenticationError,
            Symbol("param_required") => ExchangeError,
            Symbol("validation_error") => ExchangeError,
            Symbol("invalid_request") => ExchangeError,
            Symbol("personal_details_required") => AuthenticationError,
            Symbol("identity_verification_required") => AuthenticationError,
            Symbol("jumio_verification_required") => AuthenticationError,
            Symbol("jumio_face_match_verification_required") => AuthenticationError,
            Symbol("unverified_email") => AuthenticationError,
            Symbol("authentication_error") => AuthenticationError,
            Symbol("unauthorized") => AuthenticationError,
            Symbol("invalid_authentication_method") => AuthenticationError,
            Symbol("invalid_token") => AuthenticationError,
            Symbol("revoked_token") => AuthenticationError,
            Symbol("expired_token") => AuthenticationError,
            Symbol("invalid_scope") => AuthenticationError,
            Symbol("not_found") => ExchangeError,
            Symbol("rate_limit_exceeded") => RateLimitExceeded,
            Symbol("resource_exhausted") => RateLimitExceeded,
            Symbol("internal_server_error") => ExchangeError,
            Symbol("UNSUPPORTED_ORDER_CONFIGURATION") => BadRequest,
            Symbol("INSUFFICIENT_FUND") => InsufficientFunds,
            Symbol("PERMISSION_DENIED") => PermissionDenied,
            Symbol("INVALID_ARGUMENT") => BadRequest,
            Symbol("PREVIEW_STOP_PRICE_ABOVE_LAST_TRADE_PRICE") => InvalidOrder,
            Symbol("PREVIEW_INSUFFICIENT_FUND") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Insufficient balance in source account") => InsufficientFunds,
            Symbol("request timestamp expired") => InvalidNonce,
            Symbol("order with this orderID was not found") => OrderNotFound
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "ONE_MINUTE",
        Symbol("5m") => "FIVE_MINUTE",
        Symbol("15m") => "FIFTEEN_MINUTE",
        Symbol("30m") => "THIRTY_MINUTE",
        Symbol("1h") => "ONE_HOUR",
        Symbol("2h") => "TWO_HOUR",
        Symbol("6h") => "SIX_HOUR",
        Symbol("1d") => "ONE_DAY"
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("CGLD") => "CELO"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true,
        Symbol("usePrivate") => false,
        Symbol("brokerId") => "ccxt",
        Symbol("stablePairs") => ["BUSD-USD", "CBETH-ETH", "DAI-USD", "GUSD-USD", "GYEN-USD", "PAX-USD", "PAX-USDT", "USDC-EUR", "USDC-GBP", "USDT-EUR", "USDT-GBP", "USDT-USD", "USDT-USDC", "WBTC-BTC"],
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("expires") => 5000
        ),
        Symbol("accounts") => ["wallet", "fiat"],
        Symbol("v3Accounts") => ["ACCOUNT_TYPE_CRYPTO", "ACCOUNT_TYPE_FIAT"],
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ethereum",
            Symbol("XLM") => "stellar"
        ),
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("advanced") => true,
        Symbol("fetchMarkets") => "fetchMarketsV3",
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fetchTicker") => "fetchTickerV3",
        Symbol("fetchTickers") => "fetchTickersV3",
        Symbol("fetchAccounts") => "fetchAccountsV3",
        Symbol("fetchBalance") => "v2PrivateGetAccounts",
        Symbol("fetchTime") => "v2PublicGetTime",
        Symbol("user_native_currency") => "USD"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => true,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 3000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 10000,
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
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        )
    )
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/time
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: 'v2PublicGetTime' or 'v3PublicGetBrokerageTime' default is 'v2PublicGetTime'

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Coinbase; params=Dict())
    defaultMethod = safeString(self.options, "fetchTime", "v2PublicGetTime");
    method = safeString(params, "method", defaultMethod);
    params = omit(params, "method");
    response = nothing;
    if functions.ccxtruthy(method == "v2PublicGetTime")
        response = Base.fetch(self.v2PublicGetTime(params));
        response = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    else
        response = Base.fetch(self.v3PublicGetBrokerageTime(params));
    end
    return safeTimestamp2(response, "epoch", "epochSeconds")

end
"""
fetch all the accounts associated with a profile
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/accounts/list-accounts
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Coinbase; params=Dict())
    method = safeString(self.options, "fetchAccounts", "fetchAccountsV3");
    if functions.ccxtruthy(method == "fetchAccountsV3")
            return Base.fetch(self.fetchAccountsV3(params = params))
    end
    return Base.fetch(self.fetchAccountsV2(params = params))

end
function fetchAccountsV2(self::Coinbase; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchAccounts", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchAccounts", symbol = nothing, since = nothing, limit = nothing, params = params, cursorReceived = "next_starting_after", cursorSent = "starting_after", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => 100
    );
    response = Base.fetch(self.v2PrivateGetAccounts(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "next_starting_after");
    accounts = self.safeList(response, "data", defaultValue = []);
    len = length(accounts);
    lastIndex = len - 1;
    last_var = self.safeDict(accounts, lastIndex, defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (cursor != "")))
        last_var[Symbol("next_starting_after")] = cursor;
        accounts[lastIndex + 1] = last_var;
    end
    return self.parseAccounts(data, params = params)

end
function fetchAccountsV3(self::Coinbase; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchAccounts", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchAccounts", symbol = nothing, since = nothing, limit = nothing, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 250))
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => 250
    );
    response = Base.fetch(self.v3PrivateGetBrokerageAccounts(extend(request, params)));
    accounts = self.safeList(response, "accounts", defaultValue = []);
    accountsLength = length(accounts);
    cursor = safeString(response, "cursor");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((functions.ccxt_gt(accountsLength, 0)), (cursor != nothing)), (cursor != "")))
        lastIndex = accountsLength - 1;
        last_var = self.safeDict(accounts, lastIndex, defaultValue = Dict{Symbol, Any}());
        last_var[Symbol("cursor")] = cursor;
        accounts[lastIndex + 1] = last_var;
    end
    return self.parseAccounts(accounts, params = params)

end
"""
fetch all the portfolios
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/list-portfolios

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchPortfolios(self::Coinbase; params=Dict())
    response = Base.fetch(self.v3PrivateGetBrokeragePortfolios(params));
    portfolios = self.safeList(response, "portfolios", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(portfolios)))
        portfolio = get(portfolios, i + 1, nothing);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => safeString(portfolio, "uuid"),
    Symbol("type") => safeString(portfolio, "type"),
    Symbol("code") => nothing,
    Symbol("info") => portfolio
));
        i += 1
    end
    return result

end
function parseAccount(self::Coinbase, account)
    active = self.safeBool(account, "active");
    currencyIdV3 = safeString(account, "currency");
    currency = self.safeDict(account, "currency", defaultValue = Dict{Symbol, Any}());
    currencyId = safeString(currency, "code", currencyIdV3);
    typeV3 = safeString(account, "name");
    typeV2 = safeString(account, "type");
    parts = split(typeV3, " ");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(account, "id", "uuid"),
    Symbol("type") => functions.ccxtruthy((active != nothing)) ? safeStringLower(parts, 1) : typeV2,
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("info") => account
)

end
"""
create a currency deposit address
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Coinbase, code; params=Dict())
    accountId = safeString(params, "account_id");
    params = omit(params, "account_id");
    if functions.ccxtruthy(accountId == nothing)
        Base.fetch(self.loadAccounts());
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(self.accounts)))
            account = get(self.accounts, i + 1, nothing);
            if functions.ccxtruthy(@functions.ccxt_and(get(account, Symbol("code"), nothing) == code, get(account, Symbol("type"), nothing) == "wallet"))
                accountId = get(account, Symbol("id"), nothing);
                break
            end
            i += 1
        end

    end
    if functions.ccxtruthy(accountId == nothing)
        throw(ExchangeError(string(self.id, " createDepositAddress() could not find the account with matching currency code ", code, ", specify an `account_id` extra param to target specific wallet")));
    end
    request = Dict{Symbol, Any}(
        Symbol("account_id") => accountId
    );
    response = Base.fetch(self.v2PrivatePostAccountsAccountIdAddresses(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    tag = safeString(data, "destination_tag");
    address = safeString(data, "address");
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("tag") => tag,
    Symbol("address") => address,
    Symbol("network") => nothing,
    Symbol("info") => response
)

end
"""
fetch sells
see: https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/available-apis

# Arguments
- `symbol`::string: not used by fetchMySells ()
- `since`::int, optional: timestamp in ms of the earliest sell, default is undefined
- `limit`::int, optional: max number of sells to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [list of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchMySells(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = self.prepareAccountRequest(limit = limit, params = params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    query = omit(params, ["account_id", "accountId"]);
    sells = Base.fetch(self.v2PrivateGetAccountsAccountIdSells(extend(request, query)));
    sellsData = self.safeList(sells, "data", defaultValue = []);
    return self.parseTrades(sellsData, market = nothing, since = since, limit = limit)

end
"""
fetch buys
see: https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/available-apis

# Arguments
- `symbol`::string: not used by fetchMyBuys ()
- `since`::int, optional: timestamp in ms of the earliest buy, default is undefined
- `limit`::int, optional: max number of buys to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of  [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchMyBuys(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = self.prepareAccountRequest(limit = limit, params = params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    query = omit(params, ["account_id", "accountId"]);
    buys = Base.fetch(self.v2PrivateGetAccountsAccountIdBuys(extend(request, query)));
    buysData = self.safeList(buys, "data", defaultValue = []);
    return self.parseTrades(buysData, market = nothing, since = since, limit = limit)

end
function fetchTransactionsWithMethod(self::Coinbase, method; code=nothing, since=nothing, limit=nothing, params=Dict())
    request = nothing;
    (request, params) = Base.fetch(self.prepareAccountRequestWithCurrencyCode(code = code, limit = limit, params = params));
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseTransactions(get(response, Symbol("data"), nothing), currency = nothing, since = since, limit = limit)

end
"""
Fetch all withdrawals made from an account. Won't return crypto withdrawals. Use fetchLedger for those.
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/withdraw-fiat
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currencyType`::string, optional: "fiat" or "crypto"

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Coinbase; code=nothing, since=nothing, limit=nothing, params=Dict())
    currencyType = nothing;
    (currencyType, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "currencyType");
    if functions.ccxtruthy(currencyType == "crypto")
        results = Base.fetch(self.fetchTransactionsWithMethod("v2PrivateGetAccountsAccountIdTransactions", code = code, since = since, limit = limit, params = params));
            return self.filterByArray(results, "type", values = "withdrawal", indexed = false)
    end
    return Base.fetch(self.fetchTransactionsWithMethod("v2PrivateGetAccountsAccountIdWithdrawals", code = code, since = since, limit = limit, params = params))

end
"""
Fetch all fiat deposits made to an account. Won't return crypto deposits or staking rewards. Use fetchLedger for those.
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currencyType`::string, optional: "fiat" or "crypto"

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Coinbase; code=nothing, since=nothing, limit=nothing, params=Dict())
    currencyType = nothing;
    (currencyType, params) = self.handleOptionAndParams(params, "fetchDeposits", "currencyType");
    if functions.ccxtruthy(currencyType == "crypto")
        results = Base.fetch(self.fetchTransactionsWithMethod("v2PrivateGetAccountsAccountIdTransactions", code = code, since = since, limit = limit, params = params));
            return self.filterByArray(results, "type", values = "deposit", indexed = false)
    end
    return Base.fetch(self.fetchTransactionsWithMethod("v2PrivateGetAccountsAccountIdDeposits", code = code, since = since, limit = limit, params = params))

end
"""
fetch history of deposits and withdrawals
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Coinbase; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    results = Base.fetch(self.fetchTransactionsWithMethod("v2PrivateGetAccountsAccountIdTransactions", code = code, since = since, limit = limit, params = params));
    return self.filterByArray(results, "type", values = ["deposit", "withdrawal"], indexed = false)

end
function parseTransactionStatus(self::Coinbase, status)
    statuses = Dict{Symbol, Any}(
        Symbol("created") => "pending",
        Symbol("completed") => "ok",
        Symbol("canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Coinbase, transaction; currency=nothing)
    transactionType = safeString(transaction, "type");
    amountAndCurrencyObject = nothing;
    feeObject = nothing;
    network = self.safeDict(transaction, "network", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(transactionType == "send")
        amountAndCurrencyObject = self.safeDict(network, "transaction_amount");
        feeObject = self.safeDict(network, "transaction_fee", defaultValue = Dict{Symbol, Any}());
    else
        amountAndCurrencyObject = self.safeDict(transaction, "subtotal");
        feeObject = self.safeDict(transaction, "fee", defaultValue = Dict{Symbol, Any}());
    end
    if functions.ccxtruthy(amountAndCurrencyObject == nothing)
        amountAndCurrencyObject = self.safeDict(transaction, "amount");
    end
    amountString = safeString(amountAndCurrencyObject, "amount");
    amountStringAbs = stringAbs(amountString);
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    if functions.ccxtruthy(status == nothing)
        committed = self.safeBool(transaction, "committed");
        status = functions.ccxtruthy(committed) ? "ok" : "pending";
    end
    id = safeString(transaction, "id");
    currencyId = safeString(amountAndCurrencyObject, "currency");
    feeCurrencyId = safeString(feeObject, "currency");
    datetime = safeString(transaction, "created_at");
    resource = safeString(transaction, "resource");
    type_var = resource;
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(type_var, ["deposit", "withdrawal"])))
        if functions.ccxtruthy(stringGt(amountString, "0"))
            type_var = "deposit";
        elseif functions.ccxtruthy(stringLt(amountString, "0"))
            type_var = "withdrawal";
        end
    end
    toObject = self.safeDict(transaction, "to");
    addressTo = safeString(toObject, "address");
    networkId = safeString(network, "network_name");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => safeString(network, "hash", id),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("address") => addressTo,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amountStringAbs),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => self.parse8601(safeString(transaction, "updated_at")),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(feeObject, "amount"),
        Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
    )
)

end
function parseTrade(self::Coinbase, trade; market=nothing)
    symbol = nothing;
    totalObject = self.safeDict(trade, "total", defaultValue = Dict{Symbol, Any}());
    amountObject = self.safeDict(trade, "amount", defaultValue = Dict{Symbol, Any}());
    subtotalObject = self.safeDict(trade, "subtotal", defaultValue = Dict{Symbol, Any}());
    feeObject = self.safeDict(trade, "fee", defaultValue = Dict{Symbol, Any}());
    marketId = safeString(trade, "product_id");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    else
        baseId = safeString(amountObject, "currency");
        quoteId = safeString(totalObject, "currency");
        if functions.ccxtruthy(@functions.ccxt_and((baseId != nothing), (quoteId != nothing)))
            base = self.safeCurrencyCode(baseId);
            quote_var = self.safeCurrencyCode(quoteId);
            symbol = string(base, "/", quote_var);
        end
    end
    sizeInQuote = self.safeBool(trade, "size_in_quote");
    v3Price = safeString(trade, "price");
    v3Cost = nothing;
    v3Amount = safeString(trade, "size");
    if functions.ccxtruthy(sizeInQuote)
        v3Cost = v3Amount;
        v3Amount = stringDiv(v3Amount, v3Price);
    end
    v3FeeCost = safeString(trade, "commission");
    amountString = safeString(amountObject, "amount", v3Amount);
    costString = safeString(subtotalObject, "amount", v3Cost);
    priceString = nothing;
    cost = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((costString != nothing), (amountString != nothing)))
        priceString = stringDiv(costString, amountString);
    else
        priceString = v3Price;
    end
    if functions.ccxtruthy(@functions.ccxt_and((priceString != nothing), (amountString != nothing)))
        cost = stringMul(priceString, amountString);
    else
        cost = costString;
    end
    feeCurrencyId = safeString(feeObject, "currency");
    feeCost = self.safeNumber(feeObject, "amount", defaultNumber = self.parseNumber(v3FeeCost));
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((feeCurrencyId == nothing), (market != nothing)), (feeCost != nothing)))
        feeCurrencyId = get(market, Symbol("quote"), nothing);
    end
    datetime = safeStringN(trade, ["created_at", "trade_time", "time"]);
    side = safeStringLower2(trade, "resource", "side");
    takerOrMaker = safeStringLower(trade, "liquidity_indicator");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "id", "trade_id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => functions.ccxtruthy((side == "unknown_order_side")) ? nothing : side,
    Symbol("takerOrMaker") => functions.ccxtruthy((takerOrMaker == "unknown_liquidity_indicator")) ? nothing : takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => cost,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => feeCost,
        Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
    )
))

end
"""
retrieves data on all markets for coinbase
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/list-products
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/list-public-products
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/currencies
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: use private endpoint for fetching markets

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Coinbase; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    method = safeString(self.options, "fetchMarkets", "fetchMarketsV3");
    if functions.ccxtruthy(method == "fetchMarketsV3")
            return Base.fetch(self.fetchMarketsV3(params = params))
    end
    return Base.fetch(self.fetchMarketsV2(params = params))

end
function fetchMarketsV2(self::Coinbase; params=Dict())
    response = Base.fetch(self.fetchCurrenciesFromCache(params = params));
    currencies = self.safeDict(response, "currencies", defaultValue = Dict{Symbol, Any}());
    exchangeRates = self.safeDict(response, "exchangeRates", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(currencies, "data", defaultValue = []);
    dataById = indexBy(data, "id");
    rates = self.safeDict(self.safeDict(exchangeRates, "data", defaultValue = Dict{Symbol, Any}()), "rates", defaultValue = Dict{Symbol, Any}());
    baseIds = objectKeys(rates);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(baseIds)))
        baseId = get(baseIds, i + 1, nothing);
        base = self.safeCurrencyCode(baseId);
        type_var = functions.ccxtruthy((ccxt_in(baseId, dataById))) ? "fiat" : "crypto";
        if functions.ccxtruthy(type_var == "crypto")
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(data)))
                quoteCurrency = get(data, j + 1, nothing);
                quoteId = safeString(quoteCurrency, "id");
                quote_var = self.safeCurrencyCode(quoteId);
                push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => string(baseId, "-", quoteId),
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
    Symbol("swap") => true,
    Symbol("future") => true,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => nothing,
        Symbol("price") => nothing
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
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
            Symbol("min") => self.safeNumber(quoteCurrency, "min_size"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => quoteCurrency
)));
                j += 1
            end

        end
        i += 1
    end
    return result

end
function fetchMarketsV3(self::Coinbase; params=Dict())
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchMarkets", "usePrivate", defaultValue = false);
    spotUnresolvedPromises = [];
    if functions.ccxtruthy(usePrivate)
                push!(spotUnresolvedPromises, self.v3PrivateGetBrokerageProducts(params));
    else
        push!(spotUnresolvedPromises, self.v3PublicGetBrokerageMarketProducts(params));
    end
    if functions.ccxtruthy(self.checkRequiredCredentials(error = false))
                push!(spotUnresolvedPromises, self.v3PrivateGetBrokerageTransactionSummary(params));
    end
    promises = Base.fetch(asyncmap(Base.fetch, spotUnresolvedPromises));
    unresolvedContractPromises = [];
    try
        unresolvedContractPromises = [self.v3PublicGetBrokerageMarketProducts(extend(params, Dict{Symbol, Any}(
    Symbol("product_type") => "FUTURE"
))), self.v3PublicGetBrokerageMarketProducts(extend(params, Dict{Symbol, Any}(
    Symbol("product_type") => "FUTURE",
    Symbol("contract_expiry_type") => "PERPETUAL"
)))];
    catch e
        unresolvedContractPromises = [];

    end
    contractPromises = nothing;
    try
        contractPromises = Base.fetch(asyncmap(Base.fetch, unresolvedContractPromises));
    catch e
        contractPromises = [];

    end
    spot = self.safeDict(promises, 0, defaultValue = Dict{Symbol, Any}());
    fees = self.safeDict(promises, 1, defaultValue = Dict{Symbol, Any}());
    expiringFutures = self.safeDict(contractPromises, 0, defaultValue = Dict{Symbol, Any}());
    perpetualFutures = self.safeDict(contractPromises, 1, defaultValue = Dict{Symbol, Any}());
    expiringFees = self.safeDict(contractPromises, 0, defaultValue = Dict{Symbol, Any}());
    perpetualFees = self.safeDict(contractPromises, 1, defaultValue = Dict{Symbol, Any}());
    feeTier = self.safeDict(fees, "fee_tier", defaultValue = Dict{Symbol, Any}());
    expiringFeeTier = self.safeDict(expiringFees, "fee_tier", defaultValue = Dict{Symbol, Any}());
    perpetualFeeTier = self.safeDict(perpetualFees, "fee_tier", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(spot, "products", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        push!(result, self.parseSpotMarket(get(data, i + 1, nothing), feeTier));
        i += 1
    end
    futureData = self.safeList(expiringFutures, "products", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(futureData)))
        push!(result, self.parseContractMarket(get(futureData, i + 1, nothing), expiringFeeTier));
        i += 1
    end
    perpetualData = self.safeList(perpetualFutures, "products", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(perpetualData)))
        push!(result, self.parseContractMarket(get(perpetualData, i + 1, nothing), perpetualFeeTier));
        i += 1
    end
    newMarkets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        market = get(result, i + 1, nothing);
        info = safeValue(market, "info", Dict{Symbol, Any}());
        realMarketIds = self.safeList(info, "alias_to", defaultValue = []);
        len = length(realMarketIds);
        if functions.ccxtruthy(functions.ccxt_gt(len, 0))
            market[Symbol("alias")] = get(realMarketIds, 1, nothing);
        else
            market[Symbol("alias")] = nothing;
        end
        push!(newMarkets, market);
        i += 1
    end
    return newMarkets

end
function parseSpotMarket(self::Coinbase, market, feeTier)
    id = safeString(market, "product_id");
    baseId = safeString(market, "base_currency_id");
    quoteId = safeString(market, "quote_currency_id");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    marketType = safeStringLower(market, "product_type");
    tradingDisabled = self.safeBool(market, "trading_disabled");
    stablePairs = self.safeList(self.options, "stablePairs", defaultValue = []);
    defaultTakerFee = self.safeNumber(get(self.fees, Symbol("trading"), nothing), "taker");
    defaultMakerFee = self.safeNumber(get(self.fees, Symbol("trading"), nothing), "maker");
    takerFee = functions.ccxtruthy(inArray(id, stablePairs)) ? 0.00001 : self.safeNumber(feeTier, "taker_fee_rate", defaultNumber = defaultTakerFee);
    makerFee = functions.ccxtruthy(inArray(id, stablePairs)) ? 0 : self.safeNumber(feeTier, "maker_fee_rate", defaultNumber = defaultMakerFee);
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => marketType,
    Symbol("spot") => (marketType == "spot"),
    Symbol("margin") => nothing,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => !functions.ccxtruthy(tradingDisabled),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => takerFee,
    Symbol("maker") => makerFee,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "base_increment"),
        Symbol("price") => self.safeNumber2(market, "price_increment", "quote_increment")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "base_min_size"),
            Symbol("max") => self.safeNumber(market, "base_max_size")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quote_min_size"),
            Symbol("max") => self.safeNumber(market, "quote_max_size")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseContractMarket(self::Coinbase, market, feeTier)
    id = safeString(market, "product_id");
    futureProductDetails = self.safeDict(market, "future_product_details", defaultValue = Dict{Symbol, Any}());
    contractExpiryType = safeString(futureProductDetails, "contract_expiry_type");
    contractSize = self.safeNumber(futureProductDetails, "contract_size");
    contractExpire = safeString(futureProductDetails, "contract_expiry");
    expireTimestamp = self.parse8601(contractExpire);
    expireDateTime = self.iso8601(expireTimestamp);
    isSwap = (contractExpiryType == "PERPETUAL");
    baseId = safeString(futureProductDetails, "contract_root_unit");
    quoteId = safeString(market, "quote_currency_id");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    tradingDisabled = self.safeBool(market, "is_disabled");
    symbol = string(base, "/", quote_var);
    type_var = nothing;
    if functions.ccxtruthy(isSwap)
        type_var = "swap";
        symbol = string(symbol, ":", quote_var);
    else
        type_var = "future";
        symbol = string(symbol, ":", quote_var, "-", self.yymmdd(expireTimestamp));
    end
    takerFeeRate = self.safeNumber(feeTier, "taker_fee_rate");
    makerFeeRate = self.safeNumber(feeTier, "maker_fee_rate");
    taker = functions.ccxtruthy(takerFeeRate) ? takerFeeRate : self.parseNumber("0.06");
    maker = functions.ccxtruthy(makerFeeRate) ? makerFeeRate : self.parseNumber("0.04");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => quoteId,
    Symbol("type") => type_var,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => isSwap,
    Symbol("future") => !functions.ccxtruthy(isSwap),
    Symbol("option") => false,
    Symbol("active") => !functions.ccxtruthy(tradingDisabled),
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expireTimestamp,
    Symbol("expiryDatetime") => expireDateTime,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "base_increment"),
        Symbol("price") => self.safeNumber2(market, "price_increment", "quote_increment")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "base_min_size"),
            Symbol("max") => self.safeNumber(market, "base_max_size")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quote_min_size"),
            Symbol("max") => self.safeNumber(market, "quote_max_size")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchCurrenciesFromCache(self::Coinbase; params=Dict())
    options = self.safeDict(self.options, "fetchCurrencies", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(options, "timestamp");
    expires = safeInteger(options, "expires", 1000);
    now = milliseconds();
    if functions.ccxtruthy(@functions.ccxt_or((timestamp == nothing), (functions.ccxt_gt((now - timestamp), expires))))
        promises = [self.v2PublicGetCurrencies(params), self.v2PublicGetCurrenciesCrypto(params)];
        promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
        fiatResponse = self.safeDict(promisesResult, 0, defaultValue = Dict{Symbol, Any}());
        cryptoResponse = self.safeDict(promisesResult, 1, defaultValue = Dict{Symbol, Any}());
        fiatData = self.safeList(fiatResponse, "data", defaultValue = []);
        cryptoData = self.safeList(cryptoResponse, "data", defaultValue = []);
        exchangeRates = Base.fetch(self.v2PublicGetExchangeRates(params));
        self.options[Symbol("fetchCurrencies")] = extend(options, Dict{Symbol, Any}(
    Symbol("currencies") => arrayConcat(fiatData, cryptoData),
    Symbol("exchangeRates") => exchangeRates,
    Symbol("timestamp") => now
));
    end
    return self.safeDict(self.options, "fetchCurrencies", defaultValue = Dict{Symbol, Any}())

end
"""
fetches all available currencies on an exchange
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/currencies
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Coinbase; params=Dict())
    promises = [self.v2PublicGetCurrencies(params), self.v2PublicGetCurrenciesCrypto(params), self.v2PublicGetExchangeRates(params)];
    promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
    fiatResponse = self.safeDict(promisesResult, 0, defaultValue = Dict{Symbol, Any}());
    cryptoResponse = self.safeDict(promisesResult, 1, defaultValue = Dict{Symbol, Any}());
    ratesResponse = self.safeDict(promisesResult, 2, defaultValue = Dict{Symbol, Any}());
    fiatData = self.safeList(fiatResponse, "data", defaultValue = []);
    cryptoData = self.safeList(cryptoResponse, "data", defaultValue = []);
    ratesData = self.safeDict(ratesResponse, "data", defaultValue = Dict{Symbol, Any}());
    rates = self.safeDict(ratesData, "rates", defaultValue = Dict{Symbol, Any}());
    ratesIds = objectKeys(rates);
    currencies = arrayConcat(fiatData, cryptoData);
    result = Dict{Symbol, Any}();
    networks = Dict{Symbol, Any}();
    networksById = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
        currency = get(currencies, i + 1, nothing);
        assetId = safeString(currency, "asset_id");
        id = safeString2(currency, "id", "code");
        code = self.safeCurrencyCode(id);
        name = safeString(currency, "name");
        if functions.ccxtruthy(code != nothing)
            self.options[Symbol("networks")][Symbol(code)] =             lowercase(name);
        end
        if functions.ccxtruthy(code != nothing)
            self.options[Symbol("networksById")][Symbol(code)] =             lowercase(name);
        end
        type_var = functions.ccxtruthy((assetId != nothing)) ? "crypto" : "fiat";
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => currency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("type") => type_var,
    Symbol("name") => name,
    Symbol("active") => true,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(currency, "min_size"),
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    )
));
        end
        if functions.ccxtruthy(assetId != nothing)
            lowerCaseName = lowercase(name);
            if functions.ccxtruthy(code != nothing)
                networks[Symbol(code)] = lowerCaseName;
            end
            networksById[Symbol(lowerCaseName)] = code;
        end
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ratesIds)))
        currencyId = get(ratesIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_or((code == nothing), !functions.ccxtruthy((ccxt_in(code, result)))))
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => Dict{Symbol, Any}(),
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("type") => "crypto",
    Symbol("networks") => Dict{Symbol, Any}()
));
            end
        end
        i += 1
    end
    self.options[Symbol("networks")] = extend(networks, get(self.options, Symbol("networks"), nothing));
    self.options[Symbol("networksById")] = extend(networksById, get(self.options, Symbol("networksById"), nothing));
    return result

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/list-products
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/list-public-products
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: use private endpoint for fetching tickers

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinbase; symbols=nothing, params=Dict())
    method = safeString(self.options, "fetchTickers", "fetchTickersV3");
    if functions.ccxtruthy(method == "fetchTickersV3")
            return Base.fetch(self.fetchTickersV3(symbols = symbols, params = params))
    end
    return Base.fetch(self.fetchTickersV2(symbols = symbols, params = params))

end
function fetchTickersV2(self::Coinbase; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.v2PublicGetExchangeRates(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    rates = self.safeDict(data, "rates", defaultValue = Dict{Symbol, Any}());
    quoteId = safeString(data, "currency");
    result = Dict{Symbol, Any}();
    baseIds = objectKeys(rates);
    delimiter = "-";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(baseIds)))
        baseId = get(baseIds, i + 1, nothing);
        marketId = string(baseId, delimiter, quoteId);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = delimiter);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTicker(get(rates, Symbol(baseId), nothing), market = market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function fetchTickersV3(self::Coinbase; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        request[Symbol("product_ids")] = self.marketIds(symbols = symbols);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market = self.getMarketFromSymbols(symbols = symbols), params = params, defaultValue = "default");
    if functions.ccxtruthy(@functions.ccxt_and(marketType != nothing, marketType != "default"))
        request[Symbol("product_type")] = functions.ccxtruthy((marketType == "swap")) ? "FUTURE" : "SPOT";
    end
    response = nothing;
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchTickers", "usePrivate", defaultValue = false);
    if functions.ccxtruthy(usePrivate)
        response = Base.fetch(self.v3PrivateGetBrokerageProducts(extend(request, params)));
    else
        response = Base.fetch(self.v3PublicGetBrokerageMarketProducts(extend(request, params)));
    end
    data = self.safeList(response, "products", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "product_id");
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = "-");
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTicker(entry, market = market);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-market-trades
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-market-trades
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/prices

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: whether to use the private endpoint for fetching the ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinbase, symbol; params=Dict())
    method = safeString(self.options, "fetchTicker", "fetchTickerV3");
    if functions.ccxtruthy(method == "fetchTickerV3")
            return Base.fetch(self.fetchTickerV3(symbol, params = params))
    end
    return Base.fetch(self.fetchTickerV2(symbol, params = params))

end
function fetchTickerV2(self::Coinbase, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = extend(Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    ), params);
    spot = Base.fetch(self.v2PublicGetPricesSymbolSpot(request));
    ask = Base.fetch(self.v2PublicGetPricesSymbolBuy(request));
    bid = Base.fetch(self.v2PublicGetPricesSymbolSell(request));
    spotData = self.safeDict(spot, "data", defaultValue = Dict{Symbol, Any}());
    askData = self.safeDict(ask, "data", defaultValue = Dict{Symbol, Any}());
    bidData = self.safeDict(bid, "data", defaultValue = Dict{Symbol, Any}());
    bidAskLast = Dict{Symbol, Any}(
        Symbol("bid") => self.safeNumber(bidData, "amount"),
        Symbol("ask") => self.safeNumber(askData, "amount"),
        Symbol("price") => self.safeNumber(spotData, "amount")
    );
    return self.parseTicker(bidAskLast, market = market)

end
function fetchTickerV3(self::Coinbase, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing),
        Symbol("limit") => 1
    );
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchTicker", "usePrivate", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(usePrivate)
        response = Base.fetch(self.v3PrivateGetBrokerageProductsProductIdTicker(extend(request, params)));
    else
        response = Base.fetch(self.v3PublicGetBrokerageMarketProductsProductIdTicker(extend(request, params)));
    end
    data = self.safeList(response, "trades", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    ticker = self.parseTicker(first_var, market = market);
    ticker[Symbol("bid")] = self.safeNumber(response, "best_bid");
    ticker[Symbol("ask")] = self.safeNumber(response, "best_ask");
    return ticker

end
function parseTicker(self::Coinbase, ticker; market=nothing)
    bid = self.safeNumber(ticker, "bid");
    ask = self.safeNumber(ticker, "ask");
    bidVolume = nothing;
    askVolume = nothing;
    if functions.ccxtruthy((ccxt_in("bids", ticker)))
        bids = self.safeList(ticker, "bids", defaultValue = []);
        asks = self.safeList(ticker, "asks", defaultValue = []);
        firstBid = self.safeDict(bids, 0, defaultValue = Dict{Symbol, Any}());
        firstAsk = self.safeDict(asks, 0, defaultValue = Dict{Symbol, Any}());
        bid = self.safeNumber(firstBid, "price");
        bidVolume = self.safeNumber(firstBid, "size");
        ask = self.safeNumber(firstAsk, "price");
        askVolume = self.safeNumber(firstAsk, "size");
    end
    marketId = safeString(ticker, "product_id");
    market = self.safeMarket(marketId = marketId, market = market);
    last_var = self.safeNumber(ticker, "price");
    datetime = safeString(ticker, "time");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("bid") => bid,
    Symbol("ask") => ask,
    Symbol("last") => last_var,
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bidVolume") => bidVolume,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => self.safeNumber(ticker, "price_percentage_change_24h"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => self.safeNumber(ticker, "volume_24h"),
    Symbol("quoteVolume") => self.safeNumber(ticker, "approximate_quote_24h_volume"),
    Symbol("info") => ticker
), market = market)

end
function parseCustomBalance(self::Coinbase, response; params=Dict())
    balances = self.safeList2(response, "data", "accounts", defaultValue = []);
    accounts = self.safeList(params, "type", defaultValue = get(self.options, Symbol("accounts"), nothing));
    v3Accounts = self.safeList(params, "type", defaultValue = get(self.options, Symbol("v3Accounts"), nothing));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    b = 0
    while functions.ccxtruthy(functions.ccxt_lt(b, length(balances)))
        balance = get(balances, b + 1, nothing);
        type_var = safeString(balance, "type");
        if functions.ccxtruthy(inArray(type_var, accounts))
            value = self.safeDict(balance, "balance");
            if functions.ccxtruthy(value != nothing)
                currencyId = safeString(value, "currency");
                code = self.safeCurrencyCode(currencyId);
                total = safeString(value, "amount");
                free = total;
                account = self.safeDict(result, code);
                if functions.ccxtruthy(account == nothing)
                    account = self.account();
                    account[Symbol("free")] = free;
                    account[Symbol("total")] = total;
                else
                    account[Symbol("free")] = stringAdd(get(account, Symbol("free"), nothing), total);
                    account[Symbol("total")] = stringAdd(get(account, Symbol("total"), nothing), total);
                end
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = account;
                end
            end
        elseif functions.ccxtruthy(inArray(type_var, v3Accounts))
            available = self.safeDict(balance, "available_balance");
            hold = self.safeDict(balance, "hold");
            if functions.ccxtruthy(@functions.ccxt_and(available != nothing, hold != nothing))
                currencyId = safeString(available, "currency");
                code = self.safeCurrencyCode(currencyId);
                used = safeString(hold, "value");
                free = safeString(available, "value");
                total = stringAdd(used, free);
                account = self.safeDict(result, code);
                if functions.ccxtruthy(account == nothing)
                    account = self.account();
                    account[Symbol("free")] = free;
                    account[Symbol("used")] = used;
                    account[Symbol("total")] = total;
                else
                    account[Symbol("free")] = stringAdd(get(account, Symbol("free"), nothing), free);
                    account[Symbol("used")] = stringAdd(get(account, Symbol("used"), nothing), used);
                    account[Symbol("total")] = stringAdd(get(account, Symbol("total"), nothing), total);
                end
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = account;
                end
            end
        end
        b += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/accounts/list-accounts
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/accounts
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/get-futures-balance-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.v3`::bool, optional: default false, set true to use v3 api endpoint
- `params.type`::string, optional: "spot" (default) or "swap" or "future"
- `params.limit`::int, optional: default 250, maximum number of accounts to return

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinbase; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    isV3 = self.safeBool(params, "v3", defaultValue = false);
    params = omit(params, ["v3"]);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    method = safeString(self.options, "fetchBalance", "v3PrivateGetBrokerageAccounts");
    if functions.ccxtruthy(marketType == "future")
        response = Base.fetch(self.v3PrivateGetBrokerageCfmBalanceSummary(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or((isV3), (method == "v3PrivateGetBrokerageAccounts")))
        request[Symbol("limit")] = 250;
        response = Base.fetch(self.v3PrivateGetBrokerageAccounts(extend(request, params)));
    else
        request[Symbol("limit")] = 250;
        response = Base.fetch(self.v2PrivateGetAccounts(extend(request, params)));
    end
    params[Symbol("type")] = marketType;
    return self.parseCustomBalance(response, params = params)

end
"""
Fetch the history of changes, i.e. actions done by the user or operations that altered the balance. Will return staking rewards, and crypto deposits or withdrawals.
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Coinbase; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLedger", symbol = code, since = since, limit = limit, params = params, cursorReceived = "next_starting_after", cursorSent = "starting_after", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = nothing;
    (request, params) = Base.fetch(self.prepareAccountRequestWithCurrencyCode(code = code, limit = limit, params = params));
    response = Base.fetch(self.v2PrivateGetAccountsAccountIdTransactions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    ledger = self.parseLedger(data, currency = currency, since = since, limit = limit);
    len = length(ledger);
    if functions.ccxtruthy(len == 0)
            return ledger
    end
    lastIndex = len - 1;
    last_var = self.safeDict(ledger, lastIndex);
    pagination = self.safeDict(response, "pagination", defaultValue = Dict{Symbol, Any}());
    cursor = safeString(pagination, "next_starting_after");
    if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (cursor != "")))
        last_var[Symbol("info")][Symbol("next_starting_after")] = cursor;
        ledger[lastIndex + 1] = last_var;
    end
    return ledger

end
function parseLedgerEntryStatus(self::Coinbase, status)
    types = Dict{Symbol, Any}(
        Symbol("completed") => "ok"
    );
    return safeString(types, status, status)

end
function parseLedgerEntryType(self::Coinbase, type_var)
    types = Dict{Symbol, Any}(
        Symbol("buy") => "trade",
        Symbol("sell") => "trade",
        Symbol("fiat_deposit") => "transaction",
        Symbol("fiat_withdrawal") => "transaction",
        Symbol("exchange_deposit") => "transaction",
        Symbol("exchange_withdrawal") => "transaction",
        Symbol("send") => "transaction",
        Symbol("pro_deposit") => "transaction",
        Symbol("pro_withdrawal") => "transaction"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Coinbase, item; currency=nothing)
    amountInfo = self.safeDict(item, "amount", defaultValue = Dict{Symbol, Any}());
    amount = safeString(amountInfo, "amount");
    direction = nothing;
    if functions.ccxtruthy(stringLt(amount, "0"))
        direction = "out";
        amount = stringNeg(amount);
    else
        direction = "in";
    end
    currencyId = safeString(amountInfo, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    fee = nothing;
    networkInfo = self.safeDict(item, "network", defaultValue = Dict{Symbol, Any}());
    feeInfo = self.safeDict(networkInfo, "transaction_fee");
    if functions.ccxtruthy(feeInfo != nothing)
        feeCurrencyId = safeString(feeInfo, "currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId, currency = currency);
        feeAmount = self.safeNumber(feeInfo, "amount");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeAmount,
            Symbol("currency") => feeCurrencyCode
        );
    end
    timestamp = self.parse8601(safeString(item, "created_at"));
    id = safeString(item, "id");
    type_var = self.parseLedgerEntryType(safeString(item, "type"));
    status = self.parseLedgerEntryStatus(safeString(item, "status"));
    path = safeString(item, "resource_path");
    accountId = nothing;
    if functions.ccxtruthy(path != nothing)
        parts = split(path, "/");
        numParts = length(parts);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 3))
            accountId = get(parts, 4, nothing);
        end
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => accountId,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee
), currency = currency)

end
function findAccountId(self::Coinbase, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts(reload = false, params = params));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.accounts)))
        account = get(self.accounts, i + 1, nothing);
        if functions.ccxtruthy(get(account, Symbol("code"), nothing) == code)
                return get(account, Symbol("id"), nothing)
        end
        i += 1
    end
    return nothing

end
function prepareAccountRequest(self::Coinbase; limit=nothing, params=Dict())
    accountId = safeString2(params, "account_id", "accountId");
    if functions.ccxtruthy(accountId == nothing)
        throw(ArgumentsRequired(string(self.id, " prepareAccountRequest() method requires an account_id (or accountId) parameter")));
    end
    request = Dict{Symbol, Any}(
        Symbol("account_id") => accountId
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return request

end
function prepareAccountRequestWithCurrencyCode(self::Coinbase; code=nothing, limit=nothing, params=Dict())
    accountId = safeString2(params, "account_id", "accountId");
    params = omit(params, ["account_id", "accountId"]);
    if functions.ccxtruthy(accountId == nothing)
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " prepareAccountRequestWithCurrencyCode() method requires an account_id (or accountId) parameter OR a currency code argument")));
        end
        accountId = Base.fetch(self.findAccountId(code, params = params));
        if functions.ccxtruthy(accountId == nothing)
            throw(ExchangeError(string(self.id, " prepareAccountRequestWithCurrencyCode() could not find account id for ", code, ". You might try to generate the deposit address in the website for that coin first.")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("account_id") => accountId
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return [request, params]

end
"""
create a market buy order by providing the symbol and cost
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Coinbase, symbol, cost; params=Dict())
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
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: price to trigger stop orders
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.postOnly`::bool, optional: true or false
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'GTD' or 'PO', 'FOK'
- `params.stop_direction`::string, optional: 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from
- `params.end_time`::string, optional: '2023-05-25T17:01:05.092Z' for 'GTD' orders
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount
- `params.preview`::bool, optional: default to false, wether to use the test/preview endpoint or not
- `params.leverage`::float, optional: default to 1, the leverage to use for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.retail_portfolio_id`::string, optional: portfolio uid
- `params.is_max`::bool, optional: Used in conjunction with tradable_balance to indicate the user wants to use their entire tradable balance
- `params.tradable_balance`::string, optional: amount of tradable balance
- `params.reduceOnly`::float, optional: set to true for closing a position or use closePosition

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Coinbase, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    id = safeString(self.options, "brokerId", "ccxt");
    request = Dict{Symbol, Any}(
        Symbol("client_order_id") => string(id, "-", uuid()),
        Symbol("product_id") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    reduceOnly = self.safeBool(params, "reduceOnly");
    if functions.ccxtruthy(reduceOnly)
        params = omit(params, "reduceOnly");
        params[Symbol("amount")] = amount;
            return Base.fetch(self.closePosition(symbol, side = side, params = params))
    end
    triggerPrice = self.safeNumberN(params, ["stopPrice", "stop_price", "triggerPrice"]);
    stopLossPrice = self.safeNumber(params, "stopLossPrice");
    takeProfitPrice = self.safeNumber(params, "takeProfitPrice");
    isStop = triggerPrice != nothing;
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    timeInForce = safeString(params, "timeInForce");
    postOnly = functions.ccxtruthy((timeInForce == "PO")) ? true : self.safeBool2(params, "postOnly", "post_only", defaultValue = false);
    endTime = safeString(params, "end_time");
    stopDirection = safeString(params, "stop_direction");
    if functions.ccxtruthy(type_var == "limit")
        if functions.ccxtruthy(isStop)
            if functions.ccxtruthy(stopDirection == nothing)
                stopDirection = functions.ccxtruthy((side == "buy")) ? "STOP_DIRECTION_STOP_DOWN" : "STOP_DIRECTION_STOP_UP";
            end
            if functions.ccxtruthy(@functions.ccxt_or((timeInForce == "GTD"), (endTime != nothing)))
                if functions.ccxtruthy(endTime == nothing)
                    throw(ExchangeError(string(self.id, " createOrder() requires an end_time parameter for a GTD order")));
                end
                request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                    Symbol("stop_limit_stop_limit_gtd") => Dict{Symbol, Any}(
                        Symbol("base_size") => self.amountToPrecision(symbol, amount),
                        Symbol("limit_price") => self.priceToPrecision(symbol, price),
                        Symbol("stop_price") => self.priceToPrecision(symbol, triggerPrice),
                        Symbol("stop_direction") => stopDirection,
                        Symbol("end_time") => endTime
                    )
                );
            else
                request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                    Symbol("stop_limit_stop_limit_gtc") => Dict{Symbol, Any}(
                        Symbol("base_size") => self.amountToPrecision(symbol, amount),
                        Symbol("limit_price") => self.priceToPrecision(symbol, price),
                        Symbol("stop_price") => self.priceToPrecision(symbol, triggerPrice),
                        Symbol("stop_direction") => stopDirection
                    )
                );
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
            tpslPrice = nothing;
            if functions.ccxtruthy(isStopLoss)
                if functions.ccxtruthy(stopDirection == nothing)
                    stopDirection = functions.ccxtruthy((side == "buy")) ? "STOP_DIRECTION_STOP_UP" : "STOP_DIRECTION_STOP_DOWN";
                end
                tpslPrice = self.priceToPrecision(symbol, stopLossPrice);
            else
                if functions.ccxtruthy(stopDirection == nothing)
                    stopDirection = functions.ccxtruthy((side == "buy")) ? "STOP_DIRECTION_STOP_DOWN" : "STOP_DIRECTION_STOP_UP";
                end
                tpslPrice = self.priceToPrecision(symbol, takeProfitPrice);
            end
            request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                Symbol("stop_limit_stop_limit_gtc") => Dict{Symbol, Any}(
                    Symbol("base_size") => self.amountToPrecision(symbol, amount),
                    Symbol("limit_price") => self.priceToPrecision(symbol, price),
                    Symbol("stop_price") => tpslPrice,
                    Symbol("stop_direction") => stopDirection
                )
            );
        else
            if functions.ccxtruthy(@functions.ccxt_or((timeInForce == "GTD"), (endTime != nothing)))
                if functions.ccxtruthy(endTime == nothing)
                    throw(ExchangeError(string(self.id, " createOrder() requires an end_time parameter for a GTD order")));
                end
                request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                    Symbol("limit_limit_gtd") => Dict{Symbol, Any}(
                        Symbol("base_size") => self.amountToPrecision(symbol, amount),
                        Symbol("limit_price") => self.priceToPrecision(symbol, price),
                        Symbol("end_time") => endTime,
                        Symbol("post_only") => postOnly
                    )
                );
            elseif functions.ccxtruthy(timeInForce == "IOC")
                request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                    Symbol("sor_limit_ioc") => Dict{Symbol, Any}(
                        Symbol("base_size") => self.amountToPrecision(symbol, amount),
                        Symbol("limit_price") => self.priceToPrecision(symbol, price)
                    )
                );
            else
                if functions.ccxtruthy(timeInForce == "FOK")
                    request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                        Symbol("limit_limit_fok") => Dict{Symbol, Any}(
                            Symbol("base_size") => self.amountToPrecision(symbol, amount),
                            Symbol("limit_price") => self.priceToPrecision(symbol, price)
                        )
                    );
                else
                    request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                        Symbol("limit_limit_gtc") => Dict{Symbol, Any}(
                            Symbol("base_size") => self.amountToPrecision(symbol, amount),
                            Symbol("limit_price") => self.priceToPrecision(symbol, price),
                            Symbol("post_only") => postOnly
                        )
                    );
                end

            end
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isStop, isStopLoss), isTakeProfit))
            throw(NotSupported(string(self.id, " createOrder() only stop limit orders are supported")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), (side == "buy")))
            total = nothing;
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                total = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costRequest = stringMul(amountString, priceString);
                    total = self.costToPrecision(symbol, costRequest);
                end
            else
                total = self.costToPrecision(symbol, amount);
            end
            request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                Symbol("market_market_ioc") => Dict{Symbol, Any}(
                    Symbol("quote_size") => total
                )
            );
        else
            request[Symbol("order_configuration")] = Dict{Symbol, Any}(
                Symbol("market_market_ioc") => Dict{Symbol, Any}(
                    Symbol("base_size") => self.amountToPrecision(symbol, amount)
                )
            );
        end
    end
    marginMode = safeString(params, "marginMode");
    if functions.ccxtruthy(marginMode != nothing)
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("margin_type")] = "ISOLATED";
        elseif functions.ccxtruthy(marginMode == "cross")
            request[Symbol("margin_type")] = "CROSS";
        end
    end
    params = omit(params, ["timeInForce", "triggerPrice", "stopLossPrice", "takeProfitPrice", "stopPrice", "stop_price", "stopDirection", "stop_direction", "clientOrderId", "postOnly", "post_only", "end_time", "marginMode"]);
    preview = self.safeBool2(params, "preview", "test", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(preview)
        params = omit(params, ["preview", "test"]);
        request = omit(request, "client_order_id");
        response = Base.fetch(self.v3PrivatePostBrokerageOrdersPreview(extend(request, params)));
    else
        response = Base.fetch(self.v3PrivatePostBrokerageOrders(extend(request, params)));
    end
    success = self.safeBool(response, "success");
    if functions.ccxtruthy(success != true)
        errorResponse = self.safeDict(response, "error_response");
        errorTitle = safeString(errorResponse, "error");
        errorMessage = safeString(errorResponse, "message");
        if functions.ccxtruthy(errorResponse != nothing)
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorTitle, errorMessage);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorTitle, errorMessage);
            throw(ExchangeError(                errorMessage));
        end
    end
    data = self.safeDict(response, "success_response", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function parseOrder(self::Coinbase, order; market=nothing)
    marketId = safeString(order, "product_id");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    if functions.ccxtruthy(symbol != nothing)
        market = self.safeMarket(marketId = symbol, market = market);
    end
    orderConfiguration = self.safeDict(order, "order_configuration", defaultValue = Dict{Symbol, Any}());
    limitGTC = self.safeDict(orderConfiguration, "limit_limit_gtc");
    limitGTD = self.safeDict(orderConfiguration, "limit_limit_gtd");
    limitIOC = self.safeDict(orderConfiguration, "sor_limit_ioc");
    stopLimitGTC = self.safeDict(orderConfiguration, "stop_limit_stop_limit_gtc");
    stopLimitGTD = self.safeDict(orderConfiguration, "stop_limit_stop_limit_gtd");
    marketIOC = self.safeDict(orderConfiguration, "market_market_ioc");
    isLimit = (@functions.ccxt_or(@functions.ccxt_or((limitGTC != nothing), (limitGTD != nothing)), (limitIOC != nothing)));
    isStop = (@functions.ccxt_or((stopLimitGTC != nothing), (stopLimitGTD != nothing)));
    price = nothing;
    amount = nothing;
    postOnly = nothing;
    triggerPrice = nothing;
    if functions.ccxtruthy(isLimit)
        target = nothing;
        if functions.ccxtruthy(limitGTC != nothing)
            target = limitGTC;
        elseif functions.ccxtruthy(limitGTD != nothing)
            target = limitGTD;
        else
            target = limitIOC;
        end
        price = safeString(target, "limit_price");
        amount = safeString(target, "base_size");
        postOnly = self.safeBool(target, "post_only");
    elseif functions.ccxtruthy(isStop)
        stopTarget = functions.ccxtruthy((stopLimitGTC != nothing)) ? stopLimitGTC : stopLimitGTD;
        price = safeString(stopTarget, "limit_price");
        amount = safeString(stopTarget, "base_size");
        postOnly = self.safeBool(stopTarget, "post_only");
        triggerPrice = safeString(stopTarget, "stop_price");
    else
        amount = safeString(marketIOC, "base_size");
    end
    datetime = safeString(order, "created_time");
    totalFees = safeString(order, "total_fees");
    currencyFee = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((totalFees != nothing), (market != nothing)))
        currencyFee = get(market, Symbol("quote"), nothing);
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(safeString(order, "order_type")),
    Symbol("timeInForce") => self.parseTimeInForce(safeString(order, "time_in_force")),
    Symbol("postOnly") => postOnly,
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("filled") => safeString(order, "filled_size"),
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => safeString(order, "average_filled_price"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => safeString(order, "total_fees"),
        Symbol("currency") => currencyFee
    ),
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Coinbase, status)
    statuses = Dict{Symbol, Any}(
        Symbol("OPEN") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("EXPIRED") => "canceled",
        Symbol("FAILED") => "canceled",
        Symbol("UNKNOWN_ORDER_STATUS") => nothing
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Coinbase, type_var)
    if functions.ccxtruthy(type_var == "UNKNOWN_ORDER_TYPE")
            return nothing
    end
    types = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("STOP") => "limit",
        Symbol("STOP_LIMIT") => "limit"
    );
    return safeString(types, type_var, type_var)

end
function parseTimeInForce(self::Coinbase, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GOOD_UNTIL_CANCELLED") => "GTC",
        Symbol("GOOD_UNTIL_DATE_TIME") => "GTD",
        Symbol("IMMEDIATE_OR_CANCEL") => "IOC",
        Symbol("FILL_OR_KILL") => "FOK",
        Symbol("UNKNOWN_TIME_IN_FORCE") => nothing
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
"""
cancels an open order
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/cancel-orders

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinbase, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.cancelOrders([id], symbol = symbol, params = params));
    return self.safeDict(orders, 0, defaultValue = Dict{Symbol, Any}())

end
"""
cancel multiple orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/cancel-orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Coinbase, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_ids") => ids
    );
    response = Base.fetch(self.v3PrivatePostBrokerageOrdersBatchCancel(extend(request, params)));
    orders = self.safeList(response, "results", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        success = self.safeBool(get(orders, i + 1, nothing), "success");
        if functions.ccxtruthy(success != true)
            throw(BadRequest(string(self.id, " cancelOrders() has failed, check your arguments and parameters")));
        end
        i += 1
    end
    return self.parseOrders(orders, market = market)

end
"""
edit a trade order
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/edit-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.preview`::bool, optional: default to false, wether to use the test/preview endpoint or not

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Coinbase, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    preview = self.safeBool2(params, "preview", "test", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(preview)
        params = omit(params, ["preview", "test"]);
        response = Base.fetch(self.v3PrivatePostBrokerageOrdersEditPreview(extend(request, params)));
    else
        response = Base.fetch(self.v3PrivatePostBrokerageOrdersEdit(extend(request, params)));
    end
    return self.parseOrder(response, market = market)

end
"""
fetches information on an order made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/get-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol that the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Coinbase, id; symbol=nothing, params=Dict())
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
    response = Base.fetch(self.v3PrivateGetBrokerageOrdersHistoricalOrderId(extend(request, params)));
    order = self.safeDict(response, "order", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
"""
fetches information on multiple orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol that the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Coinbase; symbol=nothing, since=nothing, limit=100, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 1000))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("product_id")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_date")] = self.iso8601(until);
    end
    response = Base.fetch(self.v3PrivateGetBrokerageOrdersHistoricalBatch(extend(request, params)));
    orders = self.safeList(response, "orders", defaultValue = []);
    first_var = self.safeDict(orders, 0, defaultValue = Dict{Symbol, Any}());
    cursor = safeString(response, "cursor");
    if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (cursor != "")))
        first_var[Symbol("cursor")] = cursor;
        orders[1] = first_var;
    end
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
function fetchOrdersByStatus(self::Coinbase, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_status") => status
    );
    if functions.ccxtruthy(market != nothing)
        request[Symbol("product_id")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request[Symbol("limit")] = limit;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_date")] = self.iso8601(until);
    end
    response = Base.fetch(self.v3PrivateGetBrokerageOrdersHistoricalBatch(extend(request, params)));
    orders = self.safeList(response, "orders", defaultValue = []);
    first_var = self.safeDict(orders, 0, defaultValue = Dict{Symbol, Any}());
    cursor = safeString(response, "cursor");
    if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (cursor != "")))
        first_var[Symbol("cursor")] = cursor;
        orders[1] = first_var;
    end
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on all currently open orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    return Base.fetch(self.fetchOrdersByStatus("OPEN", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of closed order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchClosedOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 1000))
    end
    return Base.fetch(self.fetchOrdersByStatus("FILLED", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple canceled orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of canceled order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("CANCELLED", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-product-candles
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, not used by coinbase
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the candles

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Coinbase, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 300;
    limit = functions.ccxtruthy((limit == nothing)) ? maxLimit : min(limit, maxLimit);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit - 1))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing),
        Symbol("granularity") => safeString(self.timeframes, timeframe, timeframe)
    );
    until = safeInteger2(params, "until", "end");
    params = omit(params, ["until"]);
    duration = self.parseTimeframe(timeframe);
    requestedDuration = limit * duration;
    sinceString = nothing;
    if functions.ccxtruthy(since != nothing)
        sinceString = numberToString(self.parseToInt(since / 1000));
    else
        now = string(seconds());
        sinceString = stringSub(now, string(requestedDuration));
    end
    request[Symbol("start")] = sinceString;
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end")] = numberToString(self.parseToInt(until / 1000));
    else
        request[Symbol("end")] = stringAdd(sinceString, string(requestedDuration));
    end
    response = nothing;
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "usePrivate", defaultValue = false);
    if functions.ccxtruthy(usePrivate)
        response = Base.fetch(self.v3PrivateGetBrokerageProductsProductIdCandles(extend(request, params)));
    else
        response = Base.fetch(self.v3PublicGetBrokerageMarketProductsProductIdCandles(extend(request, params)));
    end
    candles = self.safeList(response, "candles", defaultValue = []);
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Coinbase, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "start"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-market-trades
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-market-trades

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: not used by coinbase fetchTrades
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the trades

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Coinbase, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = numberToString(self.parseToInt(since / 1000));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchTrades", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end")] = numberToString(self.parseToInt(until / 1000));
    elseif functions.ccxtruthy(since != nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTrades() requires a `until` parameter when you use `since` argument")));
    end
    response = nothing;
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchTrades", "usePrivate", defaultValue = false);
    if functions.ccxtruthy(usePrivate)
        response = Base.fetch(self.v3PrivateGetBrokerageProductsProductIdTicker(extend(request, params)));
    else
        response = Base.fetch(self.v3PublicGetBrokerageMarketProductsProductIdTicker(extend(request, params)));
    end
    trades = self.safeList(response, "trades", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-fills

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinbase; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 250))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("product_id")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_sequence_timestamp")] = self.iso8601(since);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("end_sequence_timestamp")] = self.iso8601(until);
    end
    response = Base.fetch(self.v3PrivateGetBrokerageOrdersHistoricalFills(extend(request, params)));
    trades = self.safeList(response, "fills", defaultValue = []);
    first_var = self.safeDict(trades, 0, defaultValue = Dict{Symbol, Any}());
    cursor = safeString(response, "cursor");
    if functions.ccxtruthy(@functions.ccxt_and((cursor != nothing), (cursor != "")))
        first_var[Symbol("cursor")] = cursor;
        trades[1] = first_var;
    end
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-product-book
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the order book

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Coinbase, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    usePrivate = false;
    (usePrivate, params) = self.handleOptionAndParams(params, "fetchOrderBook", "usePrivate", defaultValue = false);
    if functions.ccxtruthy(usePrivate)
        response = Base.fetch(self.v3PrivateGetBrokerageProductBook(extend(request, params)));
    else
        response = Base.fetch(self.v3PublicGetBrokerageMarketProductBook(extend(request, params)));
    end
    data = self.safeDict(response, "pricebook", defaultValue = Dict{Symbol, Any}());
    time = safeString(data, "time");
    timestamp = self.parse8601(time);
    return self.parseOrderBook(data, symbol, timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "size")

end
"""
fetches the bid and ask price and volume for multiple markets
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-best-bid-ask

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchBidsAsks(self::Coinbase; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        request[Symbol("product_ids")] = self.marketIds(symbols = symbols);
    end
    response = Base.fetch(self.v3PrivateGetBrokerageBestBidAsk(extend(request, params)));
    tickers = self.safeList(response, "pricebooks", defaultValue = []);
    return self.parseTickers(tickers, symbols = symbols)

end
"""
make a withdrawal
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/send-crypto

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: an optional tag for the withdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the cryptocurrency network to use for the withdrawal using the lowercase name like bitcoin, ethereum, solana, etc.
- `params.travel_rule_data`::object, optional: some regions require travel rule information for crypto withdrawals, see the exchange docs for details https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/travel-rule

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Coinbase, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("type") => "send",
        Symbol("to") => address,
        Symbol("amount") => numberToString(amount),
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    accountId = safeString2(params, "account_id", "accountId");
    params = omit(params, ["account_id", "accountId"]);
    if functions.ccxtruthy(accountId == nothing)
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires an account_id (or accountId) parameter OR a currency code argument")));
        end
        accountId = Base.fetch(self.findAccountId(code, params = params));
        if functions.ccxtruthy(accountId == nothing)
            throw(ExchangeError(string(self.id, " withdraw() could not find account id for ", code)));
        end
        request[Symbol("account_id")] = accountId;
    else
        request[Symbol("account_id")] = accountId;
    end
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("destination_tag")] = tag;
    end
    response = Base.fetch(self.v2PrivatePostAccountsAccountIdTransactions(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(data, currency = currency)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddressesByNetwork(self::Coinbase, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = nothing;
    (request, params) = Base.fetch(self.prepareAccountRequestWithCurrencyCode(code = get(currency, Symbol("code"), nothing), limit = nothing, params = params));
    response = Base.fetch(self.v2PrivateGetAccountsAccountIdAddresses(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    addressStructures = self.parseDepositAddresses(data, codes = nothing, indexed = false);
    return indexBy(addressStructures, "network")

end
function parseDepositAddress(self::Coinbase, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address = address);
    networkId = safeString(depositAddress, "network");
    code = self.safeCurrencyCode(nothing, currency = currency);
    addressLabel = safeString(depositAddress, "address_label");
    currencyId = nothing;
    if functions.ccxtruthy(addressLabel != nothing)
        splitAddressLabel = split(addressLabel, " ");
        currencyId = safeString(splitAddressLabel, 0);
    else
        currencyId = safeString(depositAddress, "currency");
    end
    addressInfo = self.safeDict(depositAddress, "address_info");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => safeString(addressInfo, "destination_tag")
)

end
"""
make a deposit
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to deposit
- `id`::string: the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: the id of the account to deposit into

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function deposit(self::Coinbase, code, amount, id; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountId = safeString2(params, "account_id", "accountId");
    params = omit(params, ["account_id", "accountId"]);
    if functions.ccxtruthy(accountId == nothing)
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " deposit() requires an account_id (or accountId) parameter OR a currency code argument")));
        end
        accountId = Base.fetch(self.findAccountId(code, params = params));
        if functions.ccxtruthy(accountId == nothing)
            throw(ExchangeError(string(self.id, " deposit() could not find account id for ", code)));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("account_id") => accountId,
        Symbol("amount") => numberToString(amount),
        Symbol("currency") => uppercase(code),
        Symbol("payment_method") => id,
        Symbol("commit") => true
    );
    response = Base.fetch(self.v2PrivatePostAccountsAccountIdDeposits(extend(request, params)));
    data = self.safeDict2(response, "data", "transfer", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(data)

end
"""
fetch information on a deposit, fiat only, for crypto transactions use fetchLedger
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat

# Arguments
- `id`::string: deposit id
- `code`::string, optional: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: the id of the account that the funds were deposited into

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Coinbase, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountId = safeString2(params, "account_id", "accountId");
    params = omit(params, ["account_id", "accountId"]);
    if functions.ccxtruthy(accountId == nothing)
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDeposit() requires an account_id (or accountId) parameter OR a currency code argument")));
        end
        accountId = Base.fetch(self.findAccountId(code, params = params));
        if functions.ccxtruthy(accountId == nothing)
            throw(ExchangeError(string(self.id, " fetchDeposit() could not find account id for ", code)));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("account_id") => accountId,
        Symbol("deposit_id") => id
    );
    response = Base.fetch(self.v2PrivateGetAccountsAccountIdDepositsDepositId(extend(request, params)));
    data = self.safeDict2(response, "data", "transfer", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(data)

end
"""
fetch the deposit id for a fiat currency associated with this account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/payment-methods/list-payment-methods

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [deposit id structures]{@link https://docs.ccxt.com/?id=deposit-id-structure}
"""
function fetchDepositMethodIds(self::Coinbase; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v3PrivateGetBrokeragePaymentMethods(params));
    result = self.safeList(response, "payment_methods", defaultValue = []);
    return self.parseDepositMethodIds(result)

end
"""
fetch the deposit id for a fiat currency associated with this account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/payment-methods/get-payment-method

# Arguments
- `id`::string: the deposit payment method id
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [deposit id structure]{@link https://docs.ccxt.com/?id=deposit-id-structure}
"""
function fetchDepositMethodId(self::Coinbase, id; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("payment_method_id") => id
    );
    response = Base.fetch(self.v3PrivateGetBrokeragePaymentMethodsPaymentMethodId(extend(request, params)));
    result = self.safeDict(response, "payment_method", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositMethodId(result)

end
function parseDepositMethodIds(self::Coinbase, ids; params=Dict())
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = extend(self.parseDepositMethodId(get(ids, i + 1, nothing)), params);
        push!(result, id);
        i += 1
    end
    return result

end
function parseDepositMethodId(self::Coinbase, depositId)
    return Dict{Symbol, Any}(
    Symbol("info") => depositId,
    Symbol("id") => safeString(depositId, "id"),
    Symbol("currency") => safeString(depositId, "currency"),
    Symbol("verified") => self.safeBool(depositId, "verified"),
    Symbol("tag") => safeString(depositId, "name")
)

end
"""
fetch a quote for converting from one currency to another
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/create-convert-quote

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_incentive_metadata`::object, optional: an object to fill in user incentive data
- `params.trade_incentive_metadata.user_incentive_id`::string, optional: the id of the incentive
- `params.trade_incentive_metadata.code_val`::string, optional: the code value of the incentive

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertQuote(self::Coinbase, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("from_account") => fromCode,
        Symbol("to_account") => toCode,
        Symbol("amount") => numberToString(amount)
    );
    response = Base.fetch(self.v3PrivatePostBrokerageConvertQuote(extend(request, params)));
    data = self.safeDict(response, "trade", defaultValue = Dict{Symbol, Any}());
    return self.parseConversion(data)

end
"""
convert from one currency to another
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/commit-convert-trade

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function createConvertTrade(self::Coinbase, id, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("trade_id") => id,
        Symbol("from_account") => fromCode,
        Symbol("to_account") => toCode
    );
    response = Base.fetch(self.v3PrivatePostBrokerageConvertTradeTradeId(extend(request, params)));
    data = self.safeDict(response, "trade", defaultValue = Dict{Symbol, Any}());
    return self.parseConversion(data)

end
"""
fetch the data for a conversion trade
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/get-convert-trade

# Arguments
- `id`::string: the id of the trade that you want to commit
- `code`::string: the unified currency code that was converted from
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.toCode`::strng: the unified currency code that was converted into

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTrade(self::Coinbase, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchConvertTrade() requires a code argument")));
    end
    toCode = safeString(params, "toCode");
    if functions.ccxtruthy(toCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchConvertTrade() requires a toCode parameter")));
    end
    params = omit(params, "toCode");
    request = Dict{Symbol, Any}(
        Symbol("trade_id") => id,
        Symbol("from_account") => code,
        Symbol("to_account") => toCode
    );
    response = Base.fetch(self.v3PrivateGetBrokerageConvertTradeTradeId(extend(request, params)));
    data = self.safeDict(response, "trade", defaultValue = Dict{Symbol, Any}());
    return self.parseConversion(data)

end
function parseConversion(self::Coinbase, conversion; fromCurrency=nothing, toCurrency=nothing)
    fromCoin = safeString(conversion, "source_currency");
    fromCode = self.safeCurrencyCode(fromCoin, currency = fromCurrency);
    to = safeString(conversion, "target_currency");
    toCode = self.safeCurrencyCode(to, currency = toCurrency);
    fromAmountStructure = self.safeDict(conversion, "user_entered_amount");
    feeStructure = self.safeDict(conversion, "total_fee");
    feeAmountStructure = self.safeDict(feeStructure, "amount");
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("id") => safeString(conversion, "id"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber(fromAmountStructure, "value"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => nothing,
    Symbol("price") => nothing,
    Symbol("fee") => self.safeNumber(feeAmountStructure, "value")
)

end
"""
transfer currency internally between portfolios of the same account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/move-portfolios-funds

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: the portfolio uuid to transfer funds from
- `toAccount`::string: the portfolio uuid to transfer funds to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Coinbase, code, amount, fromAccount, toAccount; params=Dict())
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("funds") => Dict{Symbol, Any}(
            Symbol("value") => self.currencyToPrecision(code, amount),
            Symbol("currency") => get(currency, Symbol("id"), nothing)
        ),
        Symbol("source_portfolio_uuid") => fromAccount,
        Symbol("target_portfolio_uuid") => toAccount
    );
    response = Base.fetch(self.v3PrivatePostBrokeragePortfoliosMoveFunds(extend(request, params)));
    transfer = self.parseTransfer(response, currency = currency);
    transfer[Symbol("amount")] = amount;
    transfer[Symbol("status")] = "ok";
    return transfer

end
function parseTransfer(self::Coinbase, transfer; currency=nothing)
    currencyCode = self.safeCurrencyCode(nothing, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => currencyCode,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => safeString(transfer, "source_portfolio_uuid"),
    Symbol("toAccount") => safeString(transfer, "target_portfolio_uuid"),
    Symbol("status") => nothing
)

end
"""
*futures only* closes open positions for a market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by coinbase
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string: *mandatory* the client order id of the position to close
- `params.size`::float, optional: the size of the position to close, optional

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Coinbase, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "client_order_id", "clientOrderId");
    params = omit(params, "clientOrderId");
    request = Dict{Symbol, Any}(
        Symbol("product_id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(clientOrderId == nothing)
        throw(ArgumentsRequired(string(self.id, " closePosition() requires a clientOrderId parameter")));
    end
    request[Symbol("client_order_id")] = clientOrderId;
    response = Base.fetch(self.v3PrivatePostBrokerageOrdersClosePosition(extend(request, params)));
    order = self.safeDict(response, "success_response", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order)

end
"""
fetch all open positions
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/list-futures-positions
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/international-derivatives/list-perpetuals-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolio`::string, optional: the portfolio UUID to fetch positions for

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Coinbase; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        market = self.market(get(symbols, 1, nothing));
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchPositions", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(type_var == "future")
        response = Base.fetch(self.v3PrivateGetBrokerageCfmPositions(params));
    else
        portfolio = nothing;
        (portfolio, params) = self.handleOptionAndParams(params, "fetchPositions", "portfolio");
        if functions.ccxtruthy(portfolio == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchPositions() requires a \"portfolio\" value in params (eg: dbcb91e7-2bc9-515), or set as exchange.options[\"portfolio\"]. You can get a list of portfolios with fetchPortfolios()")));
        end
        request = Dict{Symbol, Any}(
            Symbol("portfolio_uuid") => portfolio
        );
        response = Base.fetch(self.v3PrivateGetBrokerageIntxPositionsPortfolioUuid(extend(request, params)));
    end
    positions = self.safeList(response, "positions", defaultValue = []);
    return self.parsePositions(positions, symbols = symbols)

end
"""
fetch data on a single open contract trade position
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/international-derivatives/get-perpetuals-position
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/get-futures-position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.product_id`::string, optional: *futures only* the product id of the position to fetch, required for futures markets only
- `params.portfolio`::string, optional: *perpetual/swaps only* the portfolio UUID to fetch the position for, required for perpetual/swaps markets only

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Coinbase, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        productId = safeString(market, "product_id");
        if functions.ccxtruthy(productId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchPosition() requires a \"product_id\" in params")));
        end
        futureRequest = Dict{Symbol, Any}(
            Symbol("product_id") => productId
        );
        response = Base.fetch(self.v3PrivateGetBrokerageCfmPositionsProductId(extend(futureRequest, params)));
    else
        portfolio = nothing;
        (portfolio, params) = self.handleOptionAndParams(params, "fetchPositions", "portfolio");
        if functions.ccxtruthy(portfolio == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchPosition() requires a \"portfolio\" value in params (eg: dbcb91e7-2bc9-515), or set as exchange.options[\"portfolio\"]. You can get a list of portfolios with fetchPortfolios()")));
        end
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing),
            Symbol("portfolio_uuid") => portfolio
        );
        response = Base.fetch(self.v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol(extend(request, params)));
    end
    position = self.safeDict(response, "position", defaultValue = Dict{Symbol, Any}());
    return self.parsePosition(position, market = market)

end
function parsePosition(self::Coinbase, position; market=nothing)
    marketId = safeString(position, "symbol", "");
    market = self.safeMarket(marketId = marketId, market = market);
    rawMargin = safeString(position, "margin_type");
    marginMode = nothing;
    if functions.ccxtruthy(rawMargin != nothing)
        marginMode = functions.ccxtruthy((rawMargin == "MARGIN_TYPE_CROSS")) ? "cross" : "isolated";
    end
    notionalObject = self.safeDict(position, "position_notional", defaultValue = Dict{Symbol, Any}());
    positionSide = safeString(position, "position_side");
    side = functions.ccxtruthy((positionSide == "POSITION_SIDE_LONG")) ? "long" : "short";
    unrealizedPNLObject = self.safeDict(position, "unrealized_pnl", defaultValue = Dict{Symbol, Any}());
    liquidationPriceObject = self.safeDict(position, "liquidation_price", defaultValue = Dict{Symbol, Any}());
    liquidationPrice = self.safeNumber(liquidationPriceObject, "value");
    vwapObject = self.safeDict(position, "vwap", defaultValue = Dict{Symbol, Any}());
    summaryObject = self.safeDict(position, "portfolio_summary", defaultValue = Dict{Symbol, Any}());
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "product_id"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("notional") => self.safeNumber(notionalObject, "value"),
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("entryPrice") => self.safeNumber(vwapObject, "value"),
    Symbol("unrealizedPnl") => self.safeNumber(unrealizedPNLObject, "value"),
    Symbol("realizedPnl") => nothing,
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.safeNumber(position, "net_size"),
    Symbol("contractSize") => get(market, Symbol("contractSize"), nothing),
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => side,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => self.safeNumber(summaryObject, "collateral"),
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
fetch the trading fees for multiple markets
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/fees/get-transaction-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap'

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Coinbase; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTradingFees", market = nothing, params = params);
    isSpot = (type_var == "spot");
    productType = functions.ccxtruthy(isSpot) ? "SPOT" : "FUTURE";
    request = Dict{Symbol, Any}(
        Symbol("product_type") => productType
    );
    response = Base.fetch(self.v3PrivateGetBrokerageTransactionSummary(extend(request, params)));
    data = self.safeDict(response, "fee_tier", defaultValue = Dict{Symbol, Any}());
    taker_fee = self.safeNumber(data, "taker_fee_rate");
    maker_fee = self.safeNumber(data, "maker_fee_rate");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(isSpot, get(market, Symbol("spot"), nothing))), (@functions.ccxt_and(!functions.ccxtruthy(isSpot), !functions.ccxtruthy(get(market, Symbol("spot"), nothing))))))
            result[Symbol(symbol)] = Dict{Symbol, Any}(
                Symbol("info") => response,
                Symbol("symbol") => symbol,
                Symbol("maker") => maker_fee,
                Symbol("taker") => taker_fee,
                Symbol("percentage") => true
            );
        end
        i += 1
    end
    return result

end
"""
Fetch details for a specific portfolio by UUID
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/get-portfolio-breakdown

# Arguments
- `portfolioUuid`::string: The unique identifier of the portfolio to fetch
- `params`::object, optional: Extra parameters specific to the exchange API endpoint

# Returns
- An account structure <https://docs.ccxt.com/?id=account-structure>
"""
function fetchPortfolioDetails(self::Coinbase, portfolioUuid; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("portfolio_uuid") => portfolioUuid
    );
    response = Base.fetch(self.v3PrivateGetBrokeragePortfoliosPortfolioUuid(extend(request, params)));
    result = self.parsePortfolioDetails(response);
    return result

end
function parsePortfolioDetails(self::Coinbase, portfolioData)
    breakdown = get(portfolioData, Symbol("breakdown"), nothing);
    portfolioInfo = self.safeDict(breakdown, "portfolio", defaultValue = Dict{Symbol, Any}());
    portfolioName = safeString(portfolioInfo, "name", "Unknown");
    portfolioUuid = safeString(portfolioInfo, "uuid", "");
    spotPositions = self.safeList(breakdown, "spot_positions", defaultValue = []);
    parsedPositions = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(spotPositions)))
        position = get(spotPositions, i + 1, nothing);
        currencyCode = safeString(position, "asset", "Unknown");
        availableBalanceStr = safeString(position, "available_to_trade_fiat", "0");
        availableBalance = self.parseNumber(availableBalanceStr);
        totalBalanceFiatStr = safeString(position, "total_balance_fiat", "0");
        totalBalanceFiat = self.parseNumber(totalBalanceFiatStr);
        holdAmount = totalBalanceFiat - availableBalance;
        costBasisDict = self.safeDict(position, "cost_basis", defaultValue = Dict{Symbol, Any}());
        costBasisStr = safeString(costBasisDict, "value", "0");
        averageEntryPriceDict = self.safeDict(position, "average_entry_price", defaultValue = Dict{Symbol, Any}());
        averageEntryPriceStr = safeString(averageEntryPriceDict, "value", "0");
        positionData = Dict{Symbol, Any}(
            Symbol("currency") => currencyCode,
            Symbol("available_balance") => availableBalance,
            Symbol("hold_amount") => functions.ccxtruthy(functions.ccxt_gt(holdAmount, 0)) ? holdAmount : 0,
            Symbol("wallet_name") => portfolioName,
            Symbol("account_id") => portfolioUuid,
            Symbol("account_uuid") => safeString(position, "account_uuid", ""),
            Symbol("total_balance_fiat") => totalBalanceFiat,
            Symbol("total_balance_crypto") => self.parseNumber(safeString(position, "total_balance_crypto", "0")),
            Symbol("available_to_trade_fiat") => self.parseNumber(safeString(position, "available_to_trade_fiat", "0")),
            Symbol("available_to_trade_crypto") => self.parseNumber(safeString(position, "available_to_trade_crypto", "0")),
            Symbol("available_to_transfer_fiat") => self.parseNumber(safeString(position, "available_to_transfer_fiat", "0")),
            Symbol("available_to_transfer_crypto") => self.parseNumber(safeString(position, "available_to_trade_crypto", "0")),
            Symbol("allocation") => self.parseNumber(safeString(position, "allocation", "0")),
            Symbol("cost_basis") => self.parseNumber(costBasisStr),
            Symbol("cost_basis_currency") => safeString(costBasisDict, "currency", "USD"),
            Symbol("is_cash") => self.safeBool(position, "is_cash", defaultValue = false),
            Symbol("average_entry_price") => self.parseNumber(averageEntryPriceStr),
            Symbol("average_entry_price_currency") => safeString(averageEntryPriceDict, "currency", "USD"),
            Symbol("asset_uuid") => safeString(position, "asset_uuid", ""),
            Symbol("unrealized_pnl") => self.parseNumber(safeString(position, "unrealized_pnl", "0")),
            Symbol("asset_color") => safeString(position, "asset_color", ""),
            Symbol("account_type") => safeString(position, "account_type", "")
        );
        push!(parsedPositions, positionData);
        i += 1
    end
    return parsedPositions

end
function createAuthToken(self::Coinbase, seconds; method=nothing, url=nothing, useEddsa=false)
    uri = nothing;
    if functions.ccxtruthy(url != nothing)
        uri = string(method, " ", replace(url, "https://" => ""));
        quesPos = ccxt_indexOf("?", uri);
        if functions.ccxtruthy(functions.ccxt_gt(quesPos, 0))
            uri = functions.ccxt_slice(uri, 0, quesPos);
        end
    end
    nonce = self.randomBytes(16);
    aud = functions.ccxtruthy(useEddsa) ? "cdp_service" : "retail_rest_api_proxy";
    iss = functions.ccxtruthy(useEddsa) ? "cdp" : "coinbase-cloud";
    request = Dict{Symbol, Any}(
        Symbol("aud") => [aud],
        Symbol("iss") => iss,
        Symbol("nbf") => seconds,
        Symbol("exp") => seconds + 120,
        Symbol("sub") => self.apiKey,
        Symbol("iat") => seconds
    );
    if functions.ccxtruthy(uri != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(useEddsa))
            request[Symbol("uri")] = uri;
        else
            request[Symbol("uris")] = [uri];
        end
    end
    if functions.ccxtruthy(useEddsa)
        byteArray = self.base64ToBinary(self.secret);
        seed = self.arraySlice(byteArray, 0, second = 32);
            return jwt(request, seed, sha256, false, Dict{Symbol, Any}(
    Symbol("kid") => self.apiKey,
    Symbol("nonce") => nonce,
    Symbol("alg") => "EdDSA"
))
    else
        return jwt(request, self.encode(self.secret), sha256, false, Dict{Symbol, Any}(
    Symbol("kid") => self.apiKey,
    Symbol("nonce") => nonce,
    Symbol("alg") => "ES256"
))
    end

end
function nonce(self::Coinbase, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Coinbase, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    version = get(api, 1, nothing);
    signed = get(api, 2, nothing) == "private";
    isV3 = version == "v3";
    pathPart = functions.ccxtruthy((isV3)) ? "api/v3" : "v2";
    fullPath = string("/", pathPart, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    savedPath = fullPath;
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            fullPath += string("?", self.urlencodeWithArrayRepeat(query));
        end
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), fullPath);
    if functions.ccxtruthy(signed)
        authorization = safeString(self.headers, "Authorization");
        authorizationString = nothing;
        if functions.ccxtruthy(authorization != nothing)
            authorizationString = authorization;
        elseif functions.ccxtruthy(@functions.ccxt_and(self.token, !functions.ccxtruthy(self.checkRequiredCredentials(error = false))))
            authorizationString = string("Bearer ", self.token);
        else
            self.checkRequiredCredentials();
            seconds = Ccxt.seconds();
            payload = "";
            if functions.ccxtruthy(method != "GET")
                if functions.ccxtruthy(length(objectKeys(query)))
                    body = json(query);
                    payload = body;
                end
            else
                if functions.ccxtruthy(!functions.ccxtruthy(isV3))
                    if functions.ccxtruthy(length(objectKeys(query)))
                        payload += string("?", self.urlencode(query));
                    end
                end
            end
            isCloudAPiKey = @functions.ccxt_or((findfirst("organizations/", self.apiKey) !== nothing), (startswith(self.secret, "-----BEGIN")));
            isV2CloudAPiKey = @functions.ccxt_or(@functions.ccxt_or(length(self.secret) == 88, self.safeBool(self.options, "v2CloudAPiKey", defaultValue = false)), endswith(self.secret, "="));
            if functions.ccxtruthy(@functions.ccxt_or(isCloudAPiKey, isV2CloudAPiKey))
                if functions.ccxtruthy(@functions.ccxt_and(isCloudAPiKey, startswith(self.apiKey, "-----BEGIN")))
                    throw(ArgumentsRequired(string(self.id, " apiKey should contain the name (eg: organizations/3b910e93....) and not the public key")));
                end
                token = self.createAuthToken(seconds, method = method, url = url, useEddsa = isV2CloudAPiKey);
                authorizationString = string("Bearer ", token);
            else
                nonce = self.nonce();
                timestamp = self.parseToInt(nonce / 1000);
                timestampString = string(timestamp);
                auth = string(timestampString, method, savedPath, payload);
                signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
                headers = Dict{Symbol, Any}(
                    Symbol("CB-ACCESS-KEY") => self.apiKey,
                    Symbol("CB-ACCESS-SIGN") => signature,
                    Symbol("CB-ACCESS-TIMESTAMP") => timestampString,
                    Symbol("Content-Type") => "application/json"
                );
            end
        end
        if functions.ccxtruthy(authorizationString != nothing)
            headers = Dict{Symbol, Any}(
                Symbol("Authorization") => authorizationString,
                Symbol("Content-Type") => "application/json"
            );
            if functions.ccxtruthy(method != "GET")
                if functions.ccxtruthy(length(objectKeys(query)))
                    body = json(query);
                end
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
function handleErrors(self::Coinbase, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    errorCode = safeString(response, "error");
    if functions.ccxtruthy(errorCode != nothing)
        errorMessage = safeString2(response, "error_description", "error");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessage, feedback);
        throw(ExchangeError(feedback));
    end
    errorResponse = self.safeDict(response, "error_response");
    if functions.ccxtruthy(errorResponse != nothing)
        errorMessageInner = safeString2(errorResponse, "preview_failure_reason", "preview_failure_reason");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorMessageInner, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessageInner, feedback);
        throw(ExchangeError(feedback));
    end
    errors = self.safeList(response, "errors");
    if functions.ccxtruthy(errors != nothing)
        if functions.ccxtruthy(functions.ccxt_isArray(errors))
            numErrors = length(errors);
            if functions.ccxtruthy(functions.ccxt_gt(numErrors, 0))
                errorCode = safeString(get(errors, 1, nothing), "id");
                errorMessage = safeString(get(errors, 1, nothing), "message");
                if functions.ccxtruthy(errorCode != nothing)
                    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
                    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessage, feedback);
                    throw(ExchangeError(feedback));
                end
            end
        end
    end
    advancedTrade = get(self.options, Symbol("advanced"), nothing);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((ccxt_in("data", response))), (!functions.ccxtruthy(advancedTrade))))
        throw(ExchangeError(string(self.id, " failed due to a malformed response ", json(response))));
    end
    return nothing

end
"""
fetch deposit addresses for multiple currencies (when available)
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `codes`::array, optional: list of unified currency codes, default is undefined (all currencies)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account ID to fetch deposit addresses for

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by currency code
"""
function fetchDepositAddresses(self::Coinbase; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = self.prepareAccountRequest(limit = nothing, params = params);
    response = Base.fetch(self.v2PrivateGetAccountsAccountIdAddresses(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseDepositAddresses(data, codes = codes, indexed = false, params = Dict{Symbol, Any}())

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinbase, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v2PublicGetCurrencies(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "currencies"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetCurrenciesCrypto(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "currencies/crypto"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetTime(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "time"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetExchangeRates(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "exchange-rates"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetUsersUserId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "users/{user_id}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPricesSymbolBuy(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "prices/{symbol}/buy"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPricesSymbolSell(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "prices/{symbol}/sell"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPricesSymbolSpot(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "prices/{symbol}/spot"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccounts(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdAddresses(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/addresses"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdAddressesAddressId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/addresses/{address_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdAddressesAddressIdTransactions(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/addresses/{address_id}/transactions"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdTransactions(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdTransactionsTransactionId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions/{transaction_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdBuys(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/buys"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdBuysBuyId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/buys/{buy_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdSells(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/sells"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdSellsSellId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/sells/{sell_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdDeposits(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/deposits"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdDepositsDepositId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/deposits/{deposit_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdWithdrawals(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/withdrawals"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountsAccountIdWithdrawalsWithdrawalId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/withdrawals/{withdrawal_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetPaymentMethods(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "payment-methods"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetPaymentMethodsPaymentMethodId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "payment-methods/{payment_method_id}"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetUser(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "user"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetUserAuth(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "user/auth"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccounts(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdPrimary(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/primary"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdAddresses(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/addresses"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdTransactions(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdTransactionsTransactionIdComplete(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions/{transaction_id}/complete"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdTransactionsTransactionIdResend(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions/{transaction_id}/resend"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdBuys(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/buys"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdBuysBuyIdCommit(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/buys/{buy_id}/commit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdSells(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/sells"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdSellsSellIdCommit(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/sells/{sell_id}/commit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdDeposits(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/deposits"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdDepositsDepositIdCommit(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/deposits/{deposit_id}/commit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdWithdrawals(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/withdrawals"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountsAccountIdWithdrawalsWithdrawalIdCommit(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/withdrawals/{withdrawal_id}/commit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePutAccountsAccountId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}"; api=["v2", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePutUser(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "user"; api=["v2", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateDeleteAccountsId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{id}"; api=["v2", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateDeleteAccountsAccountIdTransactionsTransactionId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "accounts/{account_id}/transactions/{transaction_id}"; api=["v2", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageTime(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/time"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageMarketProductBook(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/market/product_book"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageMarketProducts(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/market/products"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageMarketProductsProductId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/market/products/{product_id}"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageMarketProductsProductIdCandles(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/market/products/{product_id}/candles"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PublicGetBrokerageMarketProductsProductIdTicker(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/market/products/{product_id}/ticker"; api=["v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageAccounts(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/accounts"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageAccountsAccountUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/accounts/{account_uuid}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageOrdersHistoricalBatch(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/historical/batch"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageOrdersHistoricalFills(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/historical/fills"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageOrdersHistoricalOrderId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/historical/{order_id}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageProducts(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/products"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageProductsProductId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/products/{product_id}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageProductsProductIdCandles(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/products/{product_id}/candles"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageProductsProductIdTicker(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/products/{product_id}/ticker"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageBestBidAsk(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/best_bid_ask"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageProductBook(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/product_book"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageTransactionSummary(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/transaction_summary"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokeragePortfolios(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokeragePortfoliosPortfolioUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios/{portfolio_uuid}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageConvertTradeTradeId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/convert/trade/{trade_id}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageCfmBalanceSummary(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/balance_summary"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageCfmPositions(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/positions"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageCfmPositionsProductId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/positions/{product_id}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageCfmSweeps(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/sweeps"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageIntxPortfolioPortfolioUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/intx/portfolio/{portfolio_uuid}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageIntxPositionsPortfolioUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/intx/positions/{portfolio_uuid}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/intx/positions/{portfolio_uuid}/{symbol}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokeragePaymentMethods(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/payment_methods"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokeragePaymentMethodsPaymentMethodId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/payment_methods/{payment_method_id}"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateGetBrokerageKeyPermissions(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/key_permissions"; api=["v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrders(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrdersBatchCancel(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/batch_cancel"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrdersEdit(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/edit"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrdersEditPreview(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/edit_preview"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrdersPreview(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/preview"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokeragePortfolios(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokeragePortfoliosMoveFunds(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios/move_funds"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageConvertQuote(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/convert/quote"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageConvertTradeTradeId(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/convert/trade/{trade_id}"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageCfmSweepsSchedule(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/sweeps/schedule"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageIntxAllocate(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/intx/allocate"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePostBrokerageOrdersClosePosition(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/orders/close_position"; api=["v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivatePutBrokeragePortfoliosPortfolioUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios/{portfolio_uuid}"; api=["v3", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateDeleteBrokeragePortfoliosPortfolioUuid(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/portfolios/{portfolio_uuid}"; api=["v3", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v3PrivateDeleteBrokerageCfmSweeps(self::Coinbase, params=Dict(), context=Dict())
    return request(self, "brokerage/cfm/sweeps"; api=["v3", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinbase(; kwargs...)
    inst = Coinbase(Exchange(), describe, fetchTime, fetchAccounts, fetchAccountsV2, fetchAccountsV3, fetchPortfolios, parseAccount, createDepositAddress, fetchMySells, fetchMyBuys, fetchTransactionsWithMethod, fetchWithdrawals, fetchDeposits, fetchDepositsWithdrawals, parseTransactionStatus, parseTransaction, parseTrade, fetchMarkets, fetchMarketsV2, fetchMarketsV3, parseSpotMarket, parseContractMarket, fetchCurrenciesFromCache, fetchCurrencies, fetchTickers, fetchTickersV2, fetchTickersV3, fetchTicker, fetchTickerV2, fetchTickerV3, parseTicker, parseCustomBalance, fetchBalance, fetchLedger, parseLedgerEntryStatus, parseLedgerEntryType, parseLedgerEntry, findAccountId, prepareAccountRequest, prepareAccountRequestWithCurrencyCode, createMarketBuyOrderWithCost, createOrder, parseOrder, parseOrderStatus, parseOrderType, parseTimeInForce, cancelOrder, cancelOrders, editOrder, fetchOrder, fetchOrders, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOHLCV, parseOHLCV, fetchTrades, fetchMyTrades, fetchOrderBook, fetchBidsAsks, withdraw, fetchDepositAddressesByNetwork, parseDepositAddress, deposit, fetchDeposit, fetchDepositMethodIds, fetchDepositMethodId, parseDepositMethodIds, parseDepositMethodId, fetchConvertQuote, createConvertTrade, fetchConvertTrade, parseConversion, transfer, parseTransfer, closePosition, fetchPositions, fetchPosition, parsePosition, fetchTradingFees, fetchPortfolioDetails, parsePortfolioDetails, createAuthToken, nonce, sign, handleErrors, fetchDepositAddresses, v2PublicGetCurrencies, v2PublicGetCurrenciesCrypto, v2PublicGetTime, v2PublicGetExchangeRates, v2PublicGetUsersUserId, v2PublicGetPricesSymbolBuy, v2PublicGetPricesSymbolSell, v2PublicGetPricesSymbolSpot, v2PrivateGetAccounts, v2PrivateGetAccountsAccountId, v2PrivateGetAccountsAccountIdAddresses, v2PrivateGetAccountsAccountIdAddressesAddressId, v2PrivateGetAccountsAccountIdAddressesAddressIdTransactions, v2PrivateGetAccountsAccountIdTransactions, v2PrivateGetAccountsAccountIdTransactionsTransactionId, v2PrivateGetAccountsAccountIdBuys, v2PrivateGetAccountsAccountIdBuysBuyId, v2PrivateGetAccountsAccountIdSells, v2PrivateGetAccountsAccountIdSellsSellId, v2PrivateGetAccountsAccountIdDeposits, v2PrivateGetAccountsAccountIdDepositsDepositId, v2PrivateGetAccountsAccountIdWithdrawals, v2PrivateGetAccountsAccountIdWithdrawalsWithdrawalId, v2PrivateGetPaymentMethods, v2PrivateGetPaymentMethodsPaymentMethodId, v2PrivateGetUser, v2PrivateGetUserAuth, v2PrivatePostAccounts, v2PrivatePostAccountsAccountIdPrimary, v2PrivatePostAccountsAccountIdAddresses, v2PrivatePostAccountsAccountIdTransactions, v2PrivatePostAccountsAccountIdTransactionsTransactionIdComplete, v2PrivatePostAccountsAccountIdTransactionsTransactionIdResend, v2PrivatePostAccountsAccountIdBuys, v2PrivatePostAccountsAccountIdBuysBuyIdCommit, v2PrivatePostAccountsAccountIdSells, v2PrivatePostAccountsAccountIdSellsSellIdCommit, v2PrivatePostAccountsAccountIdDeposits, v2PrivatePostAccountsAccountIdDepositsDepositIdCommit, v2PrivatePostAccountsAccountIdWithdrawals, v2PrivatePostAccountsAccountIdWithdrawalsWithdrawalIdCommit, v2PrivatePutAccountsAccountId, v2PrivatePutUser, v2PrivateDeleteAccountsId, v2PrivateDeleteAccountsAccountIdTransactionsTransactionId, v3PublicGetBrokerageTime, v3PublicGetBrokerageMarketProductBook, v3PublicGetBrokerageMarketProducts, v3PublicGetBrokerageMarketProductsProductId, v3PublicGetBrokerageMarketProductsProductIdCandles, v3PublicGetBrokerageMarketProductsProductIdTicker, v3PrivateGetBrokerageAccounts, v3PrivateGetBrokerageAccountsAccountUuid, v3PrivateGetBrokerageOrdersHistoricalBatch, v3PrivateGetBrokerageOrdersHistoricalFills, v3PrivateGetBrokerageOrdersHistoricalOrderId, v3PrivateGetBrokerageProducts, v3PrivateGetBrokerageProductsProductId, v3PrivateGetBrokerageProductsProductIdCandles, v3PrivateGetBrokerageProductsProductIdTicker, v3PrivateGetBrokerageBestBidAsk, v3PrivateGetBrokerageProductBook, v3PrivateGetBrokerageTransactionSummary, v3PrivateGetBrokeragePortfolios, v3PrivateGetBrokeragePortfoliosPortfolioUuid, v3PrivateGetBrokerageConvertTradeTradeId, v3PrivateGetBrokerageCfmBalanceSummary, v3PrivateGetBrokerageCfmPositions, v3PrivateGetBrokerageCfmPositionsProductId, v3PrivateGetBrokerageCfmSweeps, v3PrivateGetBrokerageIntxPortfolioPortfolioUuid, v3PrivateGetBrokerageIntxPositionsPortfolioUuid, v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol, v3PrivateGetBrokeragePaymentMethods, v3PrivateGetBrokeragePaymentMethodsPaymentMethodId, v3PrivateGetBrokerageKeyPermissions, v3PrivatePostBrokerageOrders, v3PrivatePostBrokerageOrdersBatchCancel, v3PrivatePostBrokerageOrdersEdit, v3PrivatePostBrokerageOrdersEditPreview, v3PrivatePostBrokerageOrdersPreview, v3PrivatePostBrokeragePortfolios, v3PrivatePostBrokeragePortfoliosMoveFunds, v3PrivatePostBrokerageConvertQuote, v3PrivatePostBrokerageConvertTradeTradeId, v3PrivatePostBrokerageCfmSweepsSchedule, v3PrivatePostBrokerageIntxAllocate, v3PrivatePostBrokerageOrdersClosePosition, v3PrivatePutBrokeragePortfoliosPortfolioUuid, v3PrivateDeleteBrokeragePortfoliosPortfolioUuid, v3PrivateDeleteBrokerageCfmSweeps)
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
function __ccxt_doc_Coinbase_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/time
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: 'v2PublicGetTime' or 'v3PublicGetBrokerageTime' default is 'v2PublicGetTime'

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Coinbase_fetchTime

function __ccxt_doc_Coinbase_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/accounts/list-accounts
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Coinbase_fetchAccounts

function __ccxt_doc_Coinbase_fetchPortfolios() end
"""
fetch all the portfolios
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/list-portfolios

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Coinbase_fetchPortfolios

function __ccxt_doc_Coinbase_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinbase_createDepositAddress

function __ccxt_doc_Coinbase_fetchMySells() end
"""
fetch sells
see: https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/available-apis

# Arguments
- `symbol`::string: not used by fetchMySells ()
- `since`::int, optional: timestamp in ms of the earliest sell, default is undefined
- `limit`::int, optional: max number of sells to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [list of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchMySells

function __ccxt_doc_Coinbase_fetchMyBuys() end
"""
fetch buys
see: https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/available-apis

# Arguments
- `symbol`::string: not used by fetchMyBuys ()
- `since`::int, optional: timestamp in ms of the earliest buy, default is undefined
- `limit`::int, optional: max number of buys to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of  [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchMyBuys

function __ccxt_doc_Coinbase_fetchWithdrawals() end
"""
Fetch all withdrawals made from an account. Won't return crypto withdrawals. Use fetchLedger for those.
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/withdraw-fiat
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currencyType`::string, optional: "fiat" or "crypto"

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_fetchWithdrawals

function __ccxt_doc_Coinbase_fetchDeposits() end
"""
Fetch all fiat deposits made to an account. Won't return crypto deposits or staking rewards. Use fetchLedger for those.
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.currencyType`::string, optional: "fiat" or "crypto"

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_fetchDeposits

function __ccxt_doc_Coinbase_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_fetchDepositsWithdrawals

function __ccxt_doc_Coinbase_fetchMarkets() end
"""
retrieves data on all markets for coinbase
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/list-products
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/list-public-products
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/currencies
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: use private endpoint for fetching markets

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Coinbase_fetchMarkets

function __ccxt_doc_Coinbase_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/currencies
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Coinbase_fetchCurrencies

function __ccxt_doc_Coinbase_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/list-products
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/list-public-products
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/exchange-rates

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: use private endpoint for fetching tickers

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbase_fetchTickers

function __ccxt_doc_Coinbase_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-market-trades
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-market-trades
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/prices

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: whether to use the private endpoint for fetching the ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbase_fetchTicker

function __ccxt_doc_Coinbase_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/accounts/list-accounts
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/accounts
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/get-futures-balance-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.v3`::bool, optional: default false, set true to use v3 api endpoint
- `params.type`::string, optional: "spot" (default) or "swap" or "future"
- `params.limit`::int, optional: default 250, maximum number of accounts to return

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinbase_fetchBalance

function __ccxt_doc_Coinbase_fetchLedger() end
"""
Fetch the history of changes, i.e. actions done by the user or operations that altered the balance. Will return staking rewards, and crypto deposits or withdrawals.
see: https://docs.cdp.coinbase.com/coinbase-app/track-apis/transactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Coinbase_fetchLedger

function __ccxt_doc_Coinbase_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_createMarketBuyOrderWithCost

function __ccxt_doc_Coinbase_createOrder() end
"""
create a trade order
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopPrice`::float, optional: price to trigger stop orders
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.postOnly`::bool, optional: true or false
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'GTD' or 'PO', 'FOK'
- `params.stop_direction`::string, optional: 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from
- `params.end_time`::string, optional: '2023-05-25T17:01:05.092Z' for 'GTD' orders
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount
- `params.preview`::bool, optional: default to false, wether to use the test/preview endpoint or not
- `params.leverage`::float, optional: default to 1, the leverage to use for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.retail_portfolio_id`::string, optional: portfolio uid
- `params.is_max`::bool, optional: Used in conjunction with tradable_balance to indicate the user wants to use their entire tradable balance
- `params.tradable_balance`::string, optional: amount of tradable balance
- `params.reduceOnly`::float, optional: set to true for closing a position or use closePosition

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_createOrder

function __ccxt_doc_Coinbase_cancelOrder() end
"""
cancels an open order
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/cancel-orders

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_cancelOrder

function __ccxt_doc_Coinbase_cancelOrders() end
"""
cancel multiple orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/cancel-orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_cancelOrders

function __ccxt_doc_Coinbase_editOrder() end
"""
edit a trade order
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/edit-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.preview`::bool, optional: default to false, wether to use the test/preview endpoint or not

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_editOrder

function __ccxt_doc_Coinbase_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/get-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified market symbol that the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchOrder

function __ccxt_doc_Coinbase_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol that the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchOrders

function __ccxt_doc_Coinbase_fetchOpenOrders() end
"""
fetches information on all currently open orders
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchOpenOrders

function __ccxt_doc_Coinbase_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of closed order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch trades for

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchClosedOrders

function __ccxt_doc_Coinbase_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-orders

# Arguments
- `symbol`::string: unified market symbol of the orders
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of canceled order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_fetchCanceledOrders

function __ccxt_doc_Coinbase_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-product-candles
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-candles

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch, not used by coinbase
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the candles

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Coinbase_fetchOHLCV

function __ccxt_doc_Coinbase_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-market-trades
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-market-trades

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: not used by coinbase fetchTrades
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the trades

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Coinbase_fetchTrades

function __ccxt_doc_Coinbase_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/list-fills

# Arguments
- `symbol`::string: unified market symbol of the trades
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: the maximum number of trade structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinbase_fetchMyTrades

function __ccxt_doc_Coinbase_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-product-book
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.usePrivate`::bool, optional: default false, when true will use the private endpoint to fetch the order book

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Coinbase_fetchOrderBook

function __ccxt_doc_Coinbase_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/products/get-best-bid-ask

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinbase_fetchBidsAsks

function __ccxt_doc_Coinbase_withdraw() end
"""
make a withdrawal
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/send-crypto

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: an optional tag for the withdrawal
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the cryptocurrency network to use for the withdrawal using the lowercase name like bitcoin, ethereum, solana, etc.
- `params.travel_rule_data`::object, optional: some regions require travel rule information for crypto withdrawals, see the exchange docs for details https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/travel-rule

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_withdraw

function __ccxt_doc_Coinbase_fetchDepositAddressesByNetwork() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinbase_fetchDepositAddressesByNetwork

function __ccxt_doc_Coinbase_deposit() end
"""
make a deposit
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to deposit
- `id`::string: the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: the id of the account to deposit into

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_deposit

function __ccxt_doc_Coinbase_fetchDeposit() end
"""
fetch information on a deposit, fiat only, for crypto transactions use fetchLedger
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/deposit-fiat

# Arguments
- `id`::string: deposit id
- `code`::string, optional: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: the id of the account that the funds were deposited into

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinbase_fetchDeposit

function __ccxt_doc_Coinbase_fetchDepositMethodIds() end
"""
fetch the deposit id for a fiat currency associated with this account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/payment-methods/list-payment-methods

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [deposit id structures]{@link https://docs.ccxt.com/?id=deposit-id-structure}
"""
__ccxt_doc_Coinbase_fetchDepositMethodIds

function __ccxt_doc_Coinbase_fetchDepositMethodId() end
"""
fetch the deposit id for a fiat currency associated with this account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/payment-methods/get-payment-method

# Arguments
- `id`::string: the deposit payment method id
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [deposit id structure]{@link https://docs.ccxt.com/?id=deposit-id-structure}
"""
__ccxt_doc_Coinbase_fetchDepositMethodId

function __ccxt_doc_Coinbase_fetchConvertQuote() end
"""
fetch a quote for converting from one currency to another
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/create-convert-quote

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_incentive_metadata`::object, optional: an object to fill in user incentive data
- `params.trade_incentive_metadata.user_incentive_id`::string, optional: the id of the incentive
- `params.trade_incentive_metadata.code_val`::string, optional: the code value of the incentive

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Coinbase_fetchConvertQuote

function __ccxt_doc_Coinbase_createConvertTrade() end
"""
convert from one currency to another
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/commit-convert-trade

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Coinbase_createConvertTrade

function __ccxt_doc_Coinbase_fetchConvertTrade() end
"""
fetch the data for a conversion trade
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/convert/get-convert-trade

# Arguments
- `id`::string: the id of the trade that you want to commit
- `code`::string: the unified currency code that was converted from
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.toCode`::strng: the unified currency code that was converted into

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Coinbase_fetchConvertTrade

function __ccxt_doc_Coinbase_transfer() end
"""
transfer currency internally between portfolios of the same account
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/move-portfolios-funds

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: the portfolio uuid to transfer funds from
- `toAccount`::string: the portfolio uuid to transfer funds to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Coinbase_transfer

function __ccxt_doc_Coinbase_closePosition() end
"""
*futures only* closes open positions for a market
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/orders/close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by coinbase
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string: *mandatory* the client order id of the position to close
- `params.size`::float, optional: the size of the position to close, optional

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinbase_closePosition

function __ccxt_doc_Coinbase_fetchPositions() end
"""
fetch all open positions
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/list-futures-positions
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/international-derivatives/list-perpetuals-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolio`::string, optional: the portfolio UUID to fetch positions for

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinbase_fetchPositions

function __ccxt_doc_Coinbase_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/international-derivatives/get-perpetuals-position
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/us-derivatives/get-futures-position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.product_id`::string, optional: *futures only* the product id of the position to fetch, required for futures markets only
- `params.portfolio`::string, optional: *perpetual/swaps only* the portfolio UUID to fetch the position for, required for perpetual/swaps markets only

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinbase_fetchPosition

function __ccxt_doc_Coinbase_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/fees/get-transaction-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap'

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Coinbase_fetchTradingFees

function __ccxt_doc_Coinbase_fetchPortfolioDetails() end
"""
Fetch details for a specific portfolio by UUID
see: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/portfolios/get-portfolio-breakdown

# Arguments
- `portfolioUuid`::string: The unique identifier of the portfolio to fetch
- `params`::object, optional: Extra parameters specific to the exchange API endpoint

# Returns
- An account structure <https://docs.ccxt.com/?id=account-structure>
"""
__ccxt_doc_Coinbase_fetchPortfolioDetails

function __ccxt_doc_Coinbase_fetchDepositAddresses() end
"""
fetch deposit addresses for multiple currencies (when available)
see: https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/onchain-addresses

# Arguments
- `codes`::array, optional: list of unified currency codes, default is undefined (all currencies)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account ID to fetch deposit addresses for

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by currency code
"""
__ccxt_doc_Coinbase_fetchDepositAddresses
