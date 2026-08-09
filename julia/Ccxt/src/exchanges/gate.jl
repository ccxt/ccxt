@kwdef mutable struct Gate <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    setSandboxMode::Function = setSandboxMode
    loadUnifiedStatus::Function = loadUnifiedStatus
    upgradeUnifiedTradeAccount::Function = upgradeUnifiedTradeAccount
    fetchTime::Function = fetchTime
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    safeMarket::Function = safeMarket
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    fetchFutureMarkets::Function = fetchFutureMarkets
    parseContractMarket::Function = parseContractMarket
    fetchOptionMarkets::Function = fetchOptionMarkets
    fetchOptionUnderlyings::Function = fetchOptionUnderlyings
    prepareRequest::Function = prepareRequest
    spotOrderPrepareRequest::Function = spotOrderPrepareRequest
    multiOrderSpotPrepareRequest::Function = multiOrderSpotPrepareRequest
    getMarginMode::Function = getMarginMode
    getSettlementCurrencies::Function = getSettlementCurrencies
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchNetworkDepositAddress::Function = fetchNetworkDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFees::Function = parseTradingFees
    parseTradingFee::Function = parseTradingFee
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    parseFundingHistory::Function = parseFundingHistory
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    parseBalanceHelper::Function = parseBalanceHelper
    fetchBalance::Function = fetchBalance
    fetchOHLCV::Function = fetchOHLCV
    fetchOptionOHLCV::Function = fetchOptionOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    withdraw::Function = withdraw
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransactionType::Function = parseTransactionType
    parseTransaction::Function = parseTransaction
    createOrder::Function = createOrder
    createOrdersRequest::Function = createOrdersRequest
    createOrders::Function = createOrders
    createOrderRequest::Function = createOrderRequest
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    editOrderRequest::Function = editOrderRequest
    editOrder::Function = editOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrderRequest::Function = fetchOrderRequest
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    prepareOrdersByStatusRequest::Function = prepareOrdersByStatusRequest
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelOrdersForSymbols::Function = cancelOrdersForSymbols
    cancelAllOrders::Function = cancelAllOrders
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    setLeverage::Function = setLeverage
    parsePosition::Function = parsePosition
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchLeverageTiers::Function = fetchLeverageTiers
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseEmulatedLeverageTiers::Function = parseEmulatedLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    repayIsolatedMargin::Function = repayIsolatedMargin
    repayCrossMargin::Function = repayCrossMargin
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    borrowCrossMargin::Function = borrowCrossMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    nonce::Function = nonce
    sign::Function = sign
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    parseOpenInterest::Function = parseOpenInterest
    fetchSettlementHistory::Function = fetchSettlementHistory
    fetchMySettlementHistory::Function = fetchMySettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    setPositionMode::Function = setPositionMode
    fetchUnderlyingAssets::Function = fetchUnderlyingAssets
    fetchLiquidations::Function = fetchLiquidations
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchGreeks::Function = fetchGreeks
    parseGreeks::Function = parseGreeks
    closePosition::Function = closePosition
    fetchLeverage::Function = fetchLeverage
    fetchLeverages::Function = fetchLeverages
    parseLeverage::Function = parseLeverage
    fetchOption::Function = fetchOption
    fetchOptionChain::Function = fetchOptionChain
    parseOption::Function = parseOption
    fetchPositionsHistory::Function = fetchPositionsHistory
    handleErrors::Function = handleErrors
end
function describe(self::Gate, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "gate",
    Symbol("name") => "Gate",
    Symbol("countries") => ["KR"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v4",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/b4fd9d41-eaed-46fe-8a7b-b2677edface0",
        Symbol("doc") => "https://www.gate.com/docs/developers/apiv4/en",
        Symbol("www") => "https://gate.com",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("wallet") => "https://api.gateio.ws/api/v4",
                Symbol("futures") => "https://api.gateio.ws/api/v4",
                Symbol("margin") => "https://api.gateio.ws/api/v4",
                Symbol("delivery") => "https://api.gateio.ws/api/v4",
                Symbol("spot") => "https://api.gateio.ws/api/v4",
                Symbol("options") => "https://api.gateio.ws/api/v4",
                Symbol("sub_accounts") => "https://api.gateio.ws/api/v4",
                Symbol("earn") => "https://api.gateio.ws/api/v4"
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("withdrawals") => "https://api.gateio.ws/api/v4",
                Symbol("wallet") => "https://api.gateio.ws/api/v4",
                Symbol("futures") => "https://api.gateio.ws/api/v4",
                Symbol("margin") => "https://api.gateio.ws/api/v4",
                Symbol("delivery") => "https://api.gateio.ws/api/v4",
                Symbol("spot") => "https://api.gateio.ws/api/v4",
                Symbol("options") => "https://api.gateio.ws/api/v4",
                Symbol("subAccounts") => "https://api.gateio.ws/api/v4",
                Symbol("unified") => "https://api.gateio.ws/api/v4",
                Symbol("rebate") => "https://api.gateio.ws/api/v4",
                Symbol("earn") => "https://api.gateio.ws/api/v4",
                Symbol("account") => "https://api.gateio.ws/api/v4",
                Symbol("loan") => "https://api.gateio.ws/api/v4",
                Symbol("otc") => "https://api.gateio.ws/api/v4"
            )
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("futures") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("delivery") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("options") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("spot") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("wallet") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("margin") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("sub_accounts") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("account") => "https://api-testnet.gateapi.io/api/v4"
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("futures") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("delivery") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("options") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("spot") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("wallet") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("margin") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("sub_accounts") => "https://api-testnet.gateapi.io/api/v4",
                Symbol("account") => "https://api-testnet.gateapi.io/api/v4"
            )
        ),
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.gate.com/share/CCXTGATE",
            Symbol("discount") => 0.2
        )
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => true,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchLiquidations") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMySettlementHistory") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchNetworkDepositAddress") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchUnderlyingAssets") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => true,
        Symbol("repayIsolatedMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("wallet") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currency_chains") => 1
                )
            ),
            Symbol("unified") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencies") => 1,
                    Symbol("history_loan_rate") => 1
                )
            ),
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencies") => 1,
                    Symbol("currencies/{currency}") => 1,
                    Symbol("currency_pairs") => 1,
                    Symbol("currency_pairs/{currency_pair}") => 1,
                    Symbol("tickers") => 1,
                    Symbol("order_book") => 1,
                    Symbol("trades") => 1,
                    Symbol("candlesticks") => 1,
                    Symbol("time") => 1,
                    Symbol("insurance_history") => 1
                )
            ),
            Symbol("margin") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("uni/currency_pairs") => 1,
                    Symbol("uni/currency_pairs/{currency_pair}") => 1,
                    Symbol("loan_margin_tiers") => 1,
                    Symbol("currency_pairs") => 1,
                    Symbol("currency_pairs/{currency_pair}") => 1,
                    Symbol("funding_book") => 1,
                    Symbol("cross/currencies") => 1,
                    Symbol("cross/currencies/{currency}") => 1
                )
            ),
            Symbol("flash_swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currency_pairs") => 1,
                    Symbol("currencies") => 1
                )
            ),
            Symbol("futures") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{settle}/contracts") => 1,
                    Symbol("{settle}/contracts/{contract}") => 1,
                    Symbol("{settle}/order_book") => 1,
                    Symbol("{settle}/trades") => 1,
                    Symbol("{settle}/candlesticks") => 1,
                    Symbol("{settle}/premium_index") => 1,
                    Symbol("{settle}/tickers") => 1,
                    Symbol("{settle}/funding_rate") => 1,
                    Symbol("{settle}/insurance") => 1,
                    Symbol("{settle}/contract_stats") => 1,
                    Symbol("{settle}/index_constituents/{index}") => 1,
                    Symbol("{settle}/liq_orders") => 1,
                    Symbol("{settle}/risk_limit_tiers") => 1
                )
            ),
            Symbol("delivery") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{settle}/contracts") => 1,
                    Symbol("{settle}/contracts/{contract}") => 1,
                    Symbol("{settle}/order_book") => 1,
                    Symbol("{settle}/trades") => 1,
                    Symbol("{settle}/candlesticks") => 1,
                    Symbol("{settle}/tickers") => 1,
                    Symbol("{settle}/insurance") => 1,
                    Symbol("{settle}/risk_limit_tiers") => 1
                )
            ),
            Symbol("options") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("underlyings") => 1,
                    Symbol("expirations") => 1,
                    Symbol("contracts") => 1,
                    Symbol("contracts/{contract}") => 1,
                    Symbol("settlements") => 1,
                    Symbol("settlements/{contract}") => 1,
                    Symbol("order_book") => 1,
                    Symbol("tickers") => 1,
                    Symbol("underlying/tickers/{underlying}") => 1,
                    Symbol("candlesticks") => 1,
                    Symbol("underlying/candlesticks") => 1,
                    Symbol("trades") => 1
                )
            ),
            Symbol("earn") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("uni/currencies") => 1,
                    Symbol("uni/currencies/{currency}") => 1,
                    Symbol("dual/investment_plan") => 1,
                    Symbol("structured/products") => 1
                )
            ),
            Symbol("loan") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("collateral/currencies") => 1,
                    Symbol("multi_collateral/currencies") => 1,
                    Symbol("multi_collateral/ltv") => 1,
                    Symbol("multi_collateral/fixed_rate") => 1,
                    Symbol("multi_collateral/current_rate") => 1
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("withdrawals") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("withdrawals") => 20,
                    Symbol("push") => 1
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("withdrawals/{withdrawal_id}") => 1
                )
            ),
            Symbol("wallet") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("deposit_address") => 1,
                    Symbol("withdrawals") => 1,
                    Symbol("deposits") => 1,
                    Symbol("sub_account_transfers") => 1,
                    Symbol("order_status") => 1,
                    Symbol("withdraw_status") => 1,
                    Symbol("sub_account_balances") => 2.5,
                    Symbol("sub_account_margin_balances") => 2.5,
                    Symbol("sub_account_futures_balances") => 2.5,
                    Symbol("sub_account_cross_margin_balances") => 2.5,
                    Symbol("saved_address") => 1,
                    Symbol("fee") => 1,
                    Symbol("total_balance") => 2.5,
                    Symbol("small_balance") => 1,
                    Symbol("small_balance_history") => 1,
                    Symbol("push") => 1,
                    Symbol("getLowCapExchangeList") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("transfers") => 2.5,
                    Symbol("sub_account_transfers") => 2.5,
                    Symbol("sub_account_to_sub_account") => 2.5,
                    Symbol("small_balance") => 1
                )
            ),
            Symbol("subAccounts") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("sub_accounts") => 2.5,
                    Symbol("sub_accounts/{user_id}") => 2.5,
                    Symbol("sub_accounts/{user_id}/keys") => 2.5,
                    Symbol("sub_accounts/{user_id}/keys/{key}") => 2.5
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("sub_accounts") => 2.5,
                    Symbol("sub_accounts/{user_id}/keys") => 2.5,
                    Symbol("sub_accounts/{user_id}/lock") => 2.5,
                    Symbol("sub_accounts/{user_id}/unlock") => 2.5
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("sub_accounts/{user_id}/keys/{key}") => 2.5
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("sub_accounts/{user_id}/keys/{key}") => 2.5
                )
            ),
            Symbol("unified") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("accounts") => 20 / 15,
                    Symbol("borrowable") => 20 / 15,
                    Symbol("transferable") => 20 / 15,
                    Symbol("transferables") => 20 / 15,
                    Symbol("batch_borrowable") => 20 / 15,
                    Symbol("loans") => 20 / 15,
                    Symbol("loan_records") => 20 / 15,
                    Symbol("interest_records") => 20 / 15,
                    Symbol("risk_units") => 20 / 15,
                    Symbol("unified_mode") => 20 / 15,
                    Symbol("estimate_rate") => 20 / 15,
                    Symbol("currency_discount_tiers") => 20 / 15,
                    Symbol("loan_margin_tiers") => 20 / 15,
                    Symbol("leverage/user_currency_config") => 20 / 15,
                    Symbol("leverage/user_currency_setting") => 20 / 15,
                    Symbol("account_mode") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("loans") => 200 / 15,
                    Symbol("portfolio_calculator") => 20 / 15,
                    Symbol("leverage/user_currency_setting") => 20 / 15,
                    Symbol("collateral_currencies") => 20 / 15,
                    Symbol("account_mode") => 20 / 15
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("unified_mode") => 20 / 15
                )
            ),
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("fee") => 1,
                    Symbol("batch_fee") => 1,
                    Symbol("accounts") => 1,
                    Symbol("account_book") => 1,
                    Symbol("open_orders") => 1,
                    Symbol("orders") => 1,
                    Symbol("orders/{order_id}") => 1,
                    Symbol("my_trades") => 1,
                    Symbol("price_orders") => 1,
                    Symbol("price_orders/{order_id}") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("batch_orders") => 0.4,
                    Symbol("cross_liquidate_orders") => 1,
                    Symbol("orders") => 0.4,
                    Symbol("cancel_batch_orders") => 20 / 75,
                    Symbol("countdown_cancel_all") => 20 / 75,
                    Symbol("amend_batch_orders") => 0.4,
                    Symbol("price_orders") => 0.4
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("orders") => 20 / 75,
                    Symbol("orders/{order_id}") => 20 / 75,
                    Symbol("price_orders") => 20 / 75,
                    Symbol("price_orders/{order_id}") => 20 / 75
                ),
                Symbol("patch") => Dict{Symbol, Any}(
                    Symbol("orders/{order_id}") => 0.4
                )
            ),
            Symbol("margin") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("accounts") => 20 / 15,
                    Symbol("account_book") => 20 / 15,
                    Symbol("funding_accounts") => 20 / 15,
                    Symbol("auto_repay") => 20 / 15,
                    Symbol("transferable") => 20 / 15,
                    Symbol("uni/estimate_rate") => 20 / 15,
                    Symbol("uni/loans") => 20 / 15,
                    Symbol("uni/loan_records") => 20 / 15,
                    Symbol("uni/interest_records") => 20 / 15,
                    Symbol("uni/borrowable") => 20 / 15,
                    Symbol("user/loan_margin_tiers") => 20 / 15,
                    Symbol("user/account") => 20 / 15,
                    Symbol("loans") => 20 / 15,
                    Symbol("loans/{loan_id}") => 20 / 15,
                    Symbol("loans/{loan_id}/repayment") => 20 / 15,
                    Symbol("loan_records") => 20 / 15,
                    Symbol("loan_records/{loan_record_id}") => 20 / 15,
                    Symbol("borrowable") => 20 / 15,
                    Symbol("cross/accounts") => 20 / 15,
                    Symbol("cross/account_book") => 20 / 15,
                    Symbol("cross/loans") => 20 / 15,
                    Symbol("cross/loans/{loan_id}") => 20 / 15,
                    Symbol("cross/repayments") => 20 / 15,
                    Symbol("cross/interest_records") => 20 / 15,
                    Symbol("cross/transferable") => 20 / 15,
                    Symbol("cross/estimate_rate") => 20 / 15,
                    Symbol("cross/borrowable") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("auto_repay") => 20 / 15,
                    Symbol("uni/loans") => 20 / 15,
                    Symbol("leverage/user_market_setting") => 20 / 15,
                    Symbol("loans") => 20 / 15,
                    Symbol("merged_loans") => 20 / 15,
                    Symbol("loans/{loan_id}/repayment") => 20 / 15,
                    Symbol("cross/loans") => 20 / 15,
                    Symbol("cross/repayments") => 20 / 15
                ),
                Symbol("patch") => Dict{Symbol, Any}(
                    Symbol("loans/{loan_id}") => 20 / 15,
                    Symbol("loan_records/{loan_record_id}") => 20 / 15
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("loans/{loan_id}") => 20 / 15
                )
            ),
            Symbol("flash_swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("orders") => 1,
                    Symbol("orders/{order_id}") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("orders") => 1,
                    Symbol("orders/preview") => 1
                )
            ),
            Symbol("futures") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{settle}/accounts") => 1,
                    Symbol("{settle}/account_book") => 1,
                    Symbol("{settle}/positions") => 1,
                    Symbol("{settle}/positions/{contract}") => 1,
                    Symbol("{settle}/get_leverage/{contract}") => 1,
                    Symbol("{settle}/dual_comp/positions/{contract}") => 1,
                    Symbol("{settle}/orders") => 1,
                    Symbol("{settle}/orders_timerange") => 1,
                    Symbol("{settle}/orders/{order_id}") => 1,
                    Symbol("{settle}/my_trades") => 1,
                    Symbol("{settle}/my_trades_timerange") => 1,
                    Symbol("{settle}/position_close") => 1,
                    Symbol("{settle}/liquidates") => 1,
                    Symbol("{settle}/auto_deleverages") => 1,
                    Symbol("{settle}/fee") => 1,
                    Symbol("{settle}/risk_limit_table") => 1,
                    Symbol("{settle}/price_orders") => 1,
                    Symbol("{settle}/price_orders/{order_id}") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("{settle}/positions/{contract}/margin") => 1,
                    Symbol("{settle}/positions/{contract}/leverage") => 1,
                    Symbol("{settle}/positions/{contract}/set_leverage") => 1,
                    Symbol("{settle}/positions/{contract}/risk_limit") => 1,
                    Symbol("{settle}/positions/cross_mode") => 1,
                    Symbol("{settle}/dual_comp/positions/cross_mode") => 1,
                    Symbol("{settle}/dual_mode") => 1,
                    Symbol("{settle}/set_position_mode") => 1,
                    Symbol("{settle}/dual_comp/positions/{contract}/margin") => 1,
                    Symbol("{settle}/dual_comp/positions/{contract}/leverage") => 1,
                    Symbol("{settle}/dual_comp/positions/{contract}/risk_limit") => 1,
                    Symbol("{settle}/orders") => 0.4,
                    Symbol("{settle}/batch_orders") => 0.4,
                    Symbol("{settle}/countdown_cancel_all") => 0.4,
                    Symbol("{settle}/batch_cancel_orders") => 0.4,
                    Symbol("{settle}/batch_amend_orders") => 0.4,
                    Symbol("{settle}/bbo_orders") => 0.4,
                    Symbol("{settle}/price_orders") => 0.4
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("{settle}/orders/{order_id}") => 1,
                    Symbol("{settle}/price_orders/{order_id}") => 1
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("{settle}/orders") => 20 / 75,
                    Symbol("{settle}/orders/{order_id}") => 20 / 75,
                    Symbol("{settle}/price_orders") => 20 / 75,
                    Symbol("{settle}/price_orders/{order_id}") => 20 / 75
                )
            ),
            Symbol("delivery") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{settle}/accounts") => 20 / 15,
                    Symbol("{settle}/account_book") => 20 / 15,
                    Symbol("{settle}/positions") => 20 / 15,
                    Symbol("{settle}/positions/{contract}") => 20 / 15,
                    Symbol("{settle}/orders") => 20 / 15,
                    Symbol("{settle}/orders/{order_id}") => 20 / 15,
                    Symbol("{settle}/my_trades") => 20 / 15,
                    Symbol("{settle}/position_close") => 20 / 15,
                    Symbol("{settle}/liquidates") => 20 / 15,
                    Symbol("{settle}/settlements") => 20 / 15,
                    Symbol("{settle}/price_orders") => 20 / 15,
                    Symbol("{settle}/price_orders/{order_id}") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("{settle}/positions/{contract}/margin") => 20 / 15,
                    Symbol("{settle}/positions/{contract}/leverage") => 20 / 15,
                    Symbol("{settle}/positions/{contract}/risk_limit") => 20 / 15,
                    Symbol("{settle}/orders") => 20 / 15,
                    Symbol("{settle}/price_orders") => 20 / 15
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("{settle}/orders") => 20 / 15,
                    Symbol("{settle}/orders/{order_id}") => 20 / 15,
                    Symbol("{settle}/price_orders") => 20 / 15,
                    Symbol("{settle}/price_orders/{order_id}") => 20 / 15
                )
            ),
            Symbol("options") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("my_settlements") => 20 / 15,
                    Symbol("accounts") => 20 / 15,
                    Symbol("account_book") => 20 / 15,
                    Symbol("positions") => 20 / 15,
                    Symbol("positions/{contract}") => 20 / 15,
                    Symbol("position_close") => 20 / 15,
                    Symbol("orders") => 20 / 15,
                    Symbol("orders/{order_id}") => 20 / 15,
                    Symbol("my_trades") => 20 / 15,
                    Symbol("mmp") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("orders") => 20 / 15,
                    Symbol("countdown_cancel_all") => 20 / 15,
                    Symbol("mmp") => 20 / 15,
                    Symbol("mmp/reset") => 20 / 15
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("orders") => 20 / 15,
                    Symbol("orders/{order_id}") => 20 / 15
                )
            ),
            Symbol("earn") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("uni/lends") => 20 / 15,
                    Symbol("uni/lend_records") => 20 / 15,
                    Symbol("uni/interests/{currency}") => 20 / 15,
                    Symbol("uni/interest_records") => 20 / 15,
                    Symbol("uni/interest_status/{currency}") => 20 / 15,
                    Symbol("uni/chart") => 20 / 15,
                    Symbol("uni/rate") => 20 / 15,
                    Symbol("staking/eth2/rate_records") => 20 / 15,
                    Symbol("dual/orders") => 20 / 15,
                    Symbol("dual/balance") => 20 / 15,
                    Symbol("structured/orders") => 20 / 15,
                    Symbol("staking/coins") => 20 / 15,
                    Symbol("staking/order_list") => 20 / 15,
                    Symbol("staking/award_list") => 20 / 15,
                    Symbol("staking/assets") => 20 / 15,
                    Symbol("uni/currencies") => 20 / 15,
                    Symbol("uni/currencies/{currency}") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("uni/lends") => 20 / 15,
                    Symbol("staking/eth2/swap") => 20 / 15,
                    Symbol("dual/orders") => 20 / 15,
                    Symbol("structured/orders") => 20 / 15,
                    Symbol("staking/swap") => 20 / 15
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("uni/interest_reinvest") => 20 / 15
                ),
                Symbol("patch") => Dict{Symbol, Any}(
                    Symbol("uni/lends") => 20 / 15
                )
            ),
            Symbol("loan") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("collateral/orders") => 20 / 15,
                    Symbol("collateral/orders/{order_id}") => 20 / 15,
                    Symbol("collateral/repay_records") => 20 / 15,
                    Symbol("collateral/collaterals") => 20 / 15,
                    Symbol("collateral/total_amount") => 20 / 15,
                    Symbol("collateral/ltv") => 20 / 15,
                    Symbol("multi_collateral/orders") => 20 / 15,
                    Symbol("multi_collateral/orders/{order_id}") => 20 / 15,
                    Symbol("multi_collateral/repay") => 20 / 15,
                    Symbol("multi_collateral/mortgage") => 20 / 15,
                    Symbol("multi_collateral/currency_quota") => 20 / 15,
                    Symbol("collateral/currencies") => 20 / 15,
                    Symbol("multi_collateral/currencies") => 20 / 15,
                    Symbol("multi_collateral/ltv") => 20 / 15,
                    Symbol("multi_collateral/fixed_rate") => 20 / 15,
                    Symbol("multi_collateral/current_rate") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("collateral/orders") => 20 / 15,
                    Symbol("collateral/repay") => 20 / 15,
                    Symbol("collateral/collaterals") => 20 / 15,
                    Symbol("multi_collateral/orders") => 20 / 15,
                    Symbol("multi_collateral/repay") => 20 / 15,
                    Symbol("multi_collateral/mortgage") => 20 / 15
                )
            ),
            Symbol("account") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("detail") => 20 / 15,
                    Symbol("main_keys") => 20 / 15,
                    Symbol("rate_limit") => 20 / 15,
                    Symbol("stp_groups") => 20 / 15,
                    Symbol("stp_groups/{stp_id}/users") => 20 / 15,
                    Symbol("stp_groups/debit_fee") => 20 / 15,
                    Symbol("debit_fee") => 20 / 15
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("stp_groups") => 20 / 15,
                    Symbol("stp_groups/{stp_id}/users") => 20 / 15,
                    Symbol("debit_fee") => 20 / 15
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("stp_groups/{stp_id}/users") => 20 / 15
                )
            ),
            Symbol("rebate") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("agency/transaction_history") => 20 / 15,
                    Symbol("agency/commission_history") => 20 / 15,
                    Symbol("partner/transaction_history") => 20 / 15,
                    Symbol("partner/commission_history") => 20 / 15,
                    Symbol("partner/sub_list") => 20 / 15,
                    Symbol("broker/commission_history") => 20 / 15,
                    Symbol("broker/transaction_history") => 20 / 15,
                    Symbol("user/info") => 20 / 15,
                    Symbol("user/sub_relation") => 20 / 15
                )
            ),
            Symbol("otc") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("get_user_def_bank") => 1,
                    Symbol("order/list") => 1,
                    Symbol("stable_coin/order/list") => 1,
                    Symbol("order/detail") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("quote") => 1,
                    Symbol("order/create") => 1,
                    Symbol("stable_coin/order/create") => 1,
                    Symbol("order/paid") => 1,
                    Symbol("order/cancel") => 1
                )
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("10s") => "10s",
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("8h") => "8h",
        Symbol("1d") => "1d",
        Symbol("7d") => "7d",
        Symbol("1w") => "7d"
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("ORT") => "XREATORS",
        Symbol("ASS") => "ASSF",
        Symbol("88MPH") => "MPH",
        Symbol("AXIS") => "AXISDEFI",
        Symbol("BIFI") => "BITCOINFILE",
        Symbol("BOX") => "DEFIBOX",
        Symbol("BYN") => "BEYONDFI",
        Symbol("EGG") => "GOOSEFINANCE",
        Symbol("GTC") => "GAMECOM",
        Symbol("GTC_HT") => "GAMECOM_HT",
        Symbol("GTC_BSC") => "GAMECOM_BSC",
        Symbol("HIT") => "HITCHAIN",
        Symbol("MM") => "MILLION",
        Symbol("MPH") => "MORPHER",
        Symbol("POINT") => "GATEPOINT",
        Symbol("RAI") => "RAIREFLEXINDEX",
        Symbol("SBTC") => "SUPERBITCOIN",
        Symbol("TNC") => "TRINITYNETWORKCREDIT",
        Symbol("VAI") => "VAIOT",
        Symbol("TRAC") => "TRACO"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("headers") => Dict{Symbol, Any}(
        Symbol("X-Gate-Channel-Id") => "ccxt"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("sandboxMode") => false,
        Symbol("unifiedAccount") => nothing,
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("expiration") => 86400
        ),
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("BRC20") => "BTCBRC",
            Symbol("ETH") => "ETH",
            Symbol("ERC20") => "ETH",
            Symbol("TRX") => "TRX",
            Symbol("TRC20") => "TRX",
            Symbol("HECO") => "HT",
            Symbol("HRC20") => "HT",
            Symbol("BSC") => "BSC",
            Symbol("BEP20") => "BSC",
            Symbol("SOL") => "SOL",
            Symbol("MATIC") => "MATIC",
            Symbol("OPTIMISM") => "OPETH",
            Symbol("ADA") => "ADA",
            Symbol("AVAXC") => "AVAX_C",
            Symbol("NEAR") => "NEAR",
            Symbol("ARBONE") => "ARBEVM",
            Symbol("BASE") => "BASEEVM",
            Symbol("SUI") => "SUI",
            Symbol("CRONOS") => "CRO",
            Symbol("CRO") => "CRO",
            Symbol("APT") => "APT",
            Symbol("SCROLL") => "SCROLLETH",
            Symbol("TAIKO") => "TAIKOETH",
            Symbol("HYPE") => "HYPE",
            Symbol("ALGO") => "ALGO",
            Symbol("LINEA") => "LINEAETH",
            Symbol("BLAST") => "BLASTETH",
            Symbol("XLM") => "XLM",
            Symbol("RSK") => "RBTC",
            Symbol("TON") => "TON",
            Symbol("MNT") => "MNT",
            Symbol("CELO") => "CELO",
            Symbol("HBAR") => "HBAR",
            Symbol("ZKSERA") => "ZKSERA",
            Symbol("KLAY") => "KLAY",
            Symbol("EOS") => "EOS",
            Symbol("ACA") => "ACA",
            Symbol("XTZ") => "XTZ",
            Symbol("EGLD") => "EGLD",
            Symbol("GLMR") => "GLMR",
            Symbol("AURORA") => "AURORAEVM",
            Symbol("KON") => "KONET",
            Symbol("GATECHAIN") => "GTEVM",
            Symbol("KUSAMA") => "KSMSM",
            Symbol("OKC") => "OKT",
            Symbol("POLKADOT") => "DOTSM",
            Symbol("LUNA") => "LUNC"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("OPETH") => "OP",
            Symbol("ETH") => "ERC20",
            Symbol("ERC20") => "ERC20",
            Symbol("TRX") => "TRC20",
            Symbol("TRC20") => "TRC20",
            Symbol("HT") => "HRC20",
            Symbol("HECO") => "HRC20",
            Symbol("BSC") => "BEP20",
            Symbol("BEP20") => "BEP20",
            Symbol("POLYGON") => "MATIC",
            Symbol("POL") => "MATIC"
        ),
        Symbol("timeInForce") => Dict{Symbol, Any}(
            Symbol("GTC") => "gtc",
            Symbol("IOC") => "ioc",
            Symbol("PO") => "poc",
            Symbol("POC") => "poc",
            Symbol("FOK") => "fok"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "spot",
            Symbol("spot") => "spot",
            Symbol("margin") => "margin",
            Symbol("cross_margin") => "cross_margin",
            Symbol("cross") => "cross_margin",
            Symbol("isolated") => "margin",
            Symbol("swap") => "futures",
            Symbol("future") => "delivery",
            Symbol("futures") => "futures",
            Symbol("delivery") => "delivery",
            Symbol("option") => "options",
            Symbol("options") => "options"
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap", "future", "option"]
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("fetchMarkets") => Dict{Symbol, Any}(
                Symbol("settlementCurrencies") => ["usdt", "btc"]
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("fetchMarkets") => Dict{Symbol, Any}(
                Symbol("settlementCurrencies") => ["usdt"]
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 40
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 30,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("limit") => 100,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("limit") => 100,
                Symbol("untilDays") => 30,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
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
            Symbol("extends") => "spot",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                )
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("untilDays") => nothing
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("untilDays") => nothing,
                Symbol("limit") => 1000
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1999
            )
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("feeSide") => "get",
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("1.5"), self.parseNumber("0.00185")], [self.parseNumber("3"), self.parseNumber("0.00175")], [self.parseNumber("6"), self.parseNumber("0.00165")], [self.parseNumber("12.5"), self.parseNumber("0.00155")], [self.parseNumber("25"), self.parseNumber("0.00145")], [self.parseNumber("75"), self.parseNumber("0.00135")], [self.parseNumber("200"), self.parseNumber("0.00125")], [self.parseNumber("500"), self.parseNumber("0.00115")], [self.parseNumber("1250"), self.parseNumber("0.00105")], [self.parseNumber("2500"), self.parseNumber("0.00095")], [self.parseNumber("3000"), self.parseNumber("0.00085")], [self.parseNumber("6000"), self.parseNumber("0.00075")], [self.parseNumber("11000"), self.parseNumber("0.00065")], [self.parseNumber("20000"), self.parseNumber("0.00055")], [self.parseNumber("40000"), self.parseNumber("0.00055")], [self.parseNumber("75000"), self.parseNumber("0.00055")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("1.5"), self.parseNumber("0.00195")], [self.parseNumber("3"), self.parseNumber("0.00185")], [self.parseNumber("6"), self.parseNumber("0.00175")], [self.parseNumber("12.5"), self.parseNumber("0.00165")], [self.parseNumber("25"), self.parseNumber("0.00155")], [self.parseNumber("75"), self.parseNumber("0.00145")], [self.parseNumber("200"), self.parseNumber("0.00135")], [self.parseNumber("500"), self.parseNumber("0.00125")], [self.parseNumber("1250"), self.parseNumber("0.00115")], [self.parseNumber("2500"), self.parseNumber("0.00105")], [self.parseNumber("3000"), self.parseNumber("0.00095")], [self.parseNumber("6000"), self.parseNumber("0.00085")], [self.parseNumber("11000"), self.parseNumber("0.00075")], [self.parseNumber("20000"), self.parseNumber("0.00065")], [self.parseNumber("40000"), self.parseNumber("0.00065")], [self.parseNumber("75000"), self.parseNumber("0.00065")]]
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("feeSide") => "base",
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0"),
            Symbol("taker") => self.parseNumber("0.0005"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0000")], [self.parseNumber("1.5"), self.parseNumber("-0.00005")], [self.parseNumber("3"), self.parseNumber("-0.00005")], [self.parseNumber("6"), self.parseNumber("-0.00005")], [self.parseNumber("12.5"), self.parseNumber("-0.00005")], [self.parseNumber("25"), self.parseNumber("-0.00005")], [self.parseNumber("75"), self.parseNumber("-0.00005")], [self.parseNumber("200"), self.parseNumber("-0.00005")], [self.parseNumber("500"), self.parseNumber("-0.00005")], [self.parseNumber("1250"), self.parseNumber("-0.00005")], [self.parseNumber("2500"), self.parseNumber("-0.00005")], [self.parseNumber("3000"), self.parseNumber("-0.00008")], [self.parseNumber("6000"), self.parseNumber("-0.01000")], [self.parseNumber("11000"), self.parseNumber("-0.01002")], [self.parseNumber("20000"), self.parseNumber("-0.01005")], [self.parseNumber("40000"), self.parseNumber("-0.02000")], [self.parseNumber("75000"), self.parseNumber("-0.02005")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.00050")], [self.parseNumber("1.5"), self.parseNumber("0.00048")], [self.parseNumber("3"), self.parseNumber("0.00046")], [self.parseNumber("6"), self.parseNumber("0.00044")], [self.parseNumber("12.5"), self.parseNumber("0.00042")], [self.parseNumber("25"), self.parseNumber("0.00040")], [self.parseNumber("75"), self.parseNumber("0.00038")], [self.parseNumber("200"), self.parseNumber("0.00036")], [self.parseNumber("500"), self.parseNumber("0.00034")], [self.parseNumber("1250"), self.parseNumber("0.00032")], [self.parseNumber("2500"), self.parseNumber("0.00030")], [self.parseNumber("3000"), self.parseNumber("0.00030")], [self.parseNumber("6000"), self.parseNumber("0.00030")], [self.parseNumber("11000"), self.parseNumber("0.00030")], [self.parseNumber("20000"), self.parseNumber("0.00030")], [self.parseNumber("40000"), self.parseNumber("0.00030")], [self.parseNumber("75000"), self.parseNumber("0.00030")]]
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("INVALID_PARAM_VALUE") => BadRequest,
            Symbol("INVALID_PROTOCOL") => BadRequest,
            Symbol("INVALID_ARGUMENT") => BadRequest,
            Symbol("INVALID_REQUEST_BODY") => BadRequest,
            Symbol("MISSING_REQUIRED_PARAM") => ArgumentsRequired,
            Symbol("BAD_REQUEST") => BadRequest,
            Symbol("INVALID_CONTENT_TYPE") => BadRequest,
            Symbol("NOT_ACCEPTABLE") => BadRequest,
            Symbol("METHOD_NOT_ALLOWED") => BadRequest,
            Symbol("NOT_FOUND") => ExchangeError,
            Symbol("AUTHENTICATION_FAILED") => AuthenticationError,
            Symbol("INVALID_CREDENTIALS") => AuthenticationError,
            Symbol("INVALID_KEY") => AuthenticationError,
            Symbol("IP_FORBIDDEN") => AuthenticationError,
            Symbol("READ_ONLY") => PermissionDenied,
            Symbol("INVALID_SIGNATURE") => AuthenticationError,
            Symbol("MISSING_REQUIRED_HEADER") => AuthenticationError,
            Symbol("REQUEST_EXPIRED") => AuthenticationError,
            Symbol("ACCOUNT_LOCKED") => AccountSuspended,
            Symbol("FORBIDDEN") => PermissionDenied,
            Symbol("SUB_ACCOUNT_NOT_FOUND") => ExchangeError,
            Symbol("SUB_ACCOUNT_LOCKED") => AccountSuspended,
            Symbol("MARGIN_BALANCE_EXCEPTION") => ExchangeError,
            Symbol("MARGIN_TRANSFER_FAILED") => ExchangeError,
            Symbol("TOO_MUCH_FUTURES_AVAILABLE") => ExchangeError,
            Symbol("FUTURES_BALANCE_NOT_ENOUGH") => InsufficientFunds,
            Symbol("ACCOUNT_EXCEPTION") => ExchangeError,
            Symbol("SUB_ACCOUNT_TRANSFER_FAILED") => ExchangeError,
            Symbol("ADDRESS_NOT_USED") => ExchangeError,
            Symbol("TOO_FAST") => RateLimitExceeded,
            Symbol("WITHDRAWAL_OVER_LIMIT") => ExchangeError,
            Symbol("API_WITHDRAW_DISABLED") => ExchangeNotAvailable,
            Symbol("INVALID_WITHDRAW_ID") => ExchangeError,
            Symbol("INVALID_WITHDRAW_CANCEL_STATUS") => ExchangeError,
            Symbol("INVALID_PRECISION") => InvalidOrder,
            Symbol("INVALID_CURRENCY") => BadSymbol,
            Symbol("INVALID_CURRENCY_PAIR") => BadSymbol,
            Symbol("POC_FILL_IMMEDIATELY") => OrderImmediatelyFillable,
            Symbol("ORDER_NOT_FOUND") => OrderNotFound,
            Symbol("CLIENT_ID_NOT_FOUND") => OrderNotFound,
            Symbol("ORDER_CLOSED") => InvalidOrder,
            Symbol("ORDER_CANCELLED") => InvalidOrder,
            Symbol("QUANTITY_NOT_ENOUGH") => InvalidOrder,
            Symbol("BALANCE_NOT_ENOUGH") => InsufficientFunds,
            Symbol("MARGIN_NOT_SUPPORTED") => InvalidOrder,
            Symbol("MARGIN_BALANCE_NOT_ENOUGH") => InsufficientFunds,
            Symbol("AMOUNT_TOO_LITTLE") => InvalidOrder,
            Symbol("AMOUNT_TOO_MUCH") => InvalidOrder,
            Symbol("REPEATED_CREATION") => InvalidOrder,
            Symbol("LOAN_NOT_FOUND") => OrderNotFound,
            Symbol("LOAN_RECORD_NOT_FOUND") => OrderNotFound,
            Symbol("NO_MATCHED_LOAN") => ExchangeError,
            Symbol("NOT_MERGEABLE") => ExchangeError,
            Symbol("REPAY_TOO_MUCH") => ExchangeError,
            Symbol("TOO_MANY_CURRENCY_PAIRS") => InvalidOrder,
            Symbol("TOO_MANY_ORDERS") => InvalidOrder,
            Symbol("TOO_MANY_REQUESTS") => RateLimitExceeded,
            Symbol("MIXED_ACCOUNT_TYPE") => InvalidOrder,
            Symbol("AUTO_BORROW_TOO_MUCH") => ExchangeError,
            Symbol("TRADE_RESTRICTED") => InsufficientFunds,
            Symbol("USER_NOT_FOUND") => AccountNotEnabled,
            Symbol("CONTRACT_NO_COUNTER") => ExchangeError,
            Symbol("CONTRACT_NOT_FOUND") => BadSymbol,
            Symbol("RISK_LIMIT_EXCEEDED") => ExchangeError,
            Symbol("INSUFFICIENT_AVAILABLE") => InsufficientFunds,
            Symbol("LIQUIDATE_IMMEDIATELY") => InvalidOrder,
            Symbol("LEVERAGE_TOO_HIGH") => InvalidOrder,
            Symbol("LEVERAGE_TOO_LOW") => InvalidOrder,
            Symbol("ORDER_NOT_OWNED") => ExchangeError,
            Symbol("ORDER_FINISHED") => ExchangeError,
            Symbol("POSITION_CROSS_MARGIN") => ExchangeError,
            Symbol("POSITION_IN_LIQUIDATION") => ExchangeError,
            Symbol("POSITION_IN_CLOSE") => ExchangeError,
            Symbol("POSITION_EMPTY") => InvalidOrder,
            Symbol("REMOVE_TOO_MUCH") => ExchangeError,
            Symbol("RISK_LIMIT_NOT_MULTIPLE") => ExchangeError,
            Symbol("RISK_LIMIT_TOO_HIGH") => ExchangeError,
            Symbol("RISK_LIMIT_TOO_lOW") => ExchangeError,
            Symbol("PRICE_TOO_DEVIATED") => InvalidOrder,
            Symbol("SIZE_TOO_LARGE") => InvalidOrder,
            Symbol("SIZE_TOO_SMALL") => InvalidOrder,
            Symbol("PRICE_OVER_LIQUIDATION") => InvalidOrder,
            Symbol("PRICE_OVER_BANKRUPT") => InvalidOrder,
            Symbol("ORDER_POC_IMMEDIATE") => OrderImmediatelyFillable,
            Symbol("INCREASE_POSITION") => InvalidOrder,
            Symbol("CONTRACT_IN_DELISTING") => ExchangeError,
            Symbol("INTERNAL") => ExchangeNotAvailable,
            Symbol("SERVER_ERROR") => ExchangeNotAvailable,
            Symbol("TOO_BUSY") => ExchangeNotAvailable,
            Symbol("CROSS_ACCOUNT_NOT_FOUND") => ExchangeError,
            Symbol("RISK_LIMIT_TOO_LOW") => BadRequest,
            Symbol("AUTO_TRIGGER_PRICE_LESS_LAST") => InvalidOrder,
            Symbol("AUTO_TRIGGER_PRICE_GREATE_LAST") => InvalidOrder,
            Symbol("POSITION_HOLDING") => BadRequest,
            Symbol("USER_LOAN_EXCEEDED") => BadRequest,
            Symbol("NO_CHANGE") => InvalidOrder,
            Symbol("PRICE_THRESHOLD_EXCEEDED") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Your order size") => InvalidOrder
        )
    ),
    Symbol("rollingWindowSize") => 5000
))

end
function setSandboxMode(self::Gate, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function loadUnifiedStatus(self::Gate, params=Dict())
    unifiedAccount = self.safeBool(self.options, "unifiedAccount");
    if functions.ccxtruthy(unifiedAccount == nothing)
        try
            response = Base.fetch(self.privateAccountGetDetail(params));
            result = self.safeDict(response, "key", Dict{Symbol, Any}());
            self.options[Symbol("unifiedAccount")] = safeInteger(result, "mode") == 2;
        catch e
            self.options[Symbol("unifiedAccount")] = false;

        end
    end
    return get(self.options, Symbol("unifiedAccount"), nothing)

end
function upgradeUnifiedTradeAccount(self::Gate, params=Dict())
    return Base.fetch(self.privateUnifiedPutUnifiedMode(params))

end
function fetchTime(self::Gate, params=Dict())
    response = Base.fetch(self.publicSpotGetTime(params));
    return safeInteger(response, "server_time")

end
function createExpiredOptionMarket(self::Gate, symbol)
    quote_var = "USDT";
    settle = quote_var;
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    marketIdBase = split(symbol, "_");
    base = nothing;
    expiry = safeString(optionParts, 1);
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
    else
        base = safeString(marketIdBase, 0);
        expiry = expiry[2 + 1:8];
    end
    strike = safeString(optionParts, 2);
    optionType = safeString(optionParts, 3);
    datetime = self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    return Dict{Symbol, Any}(
    Symbol("id") => string(base, "_", quote_var, "-", "20", expiry, "-", strike, "-", optionType),
    Symbol("symbol") => string(base, "/", quote_var, ":", settle, "-", expiry, "-", strike, "-", optionType),
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
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => timestamp,
    Symbol("expiryDatetime") => datetime,
    Symbol("optionType") => functions.ccxtruthy((optionType == "C")) ? "call" : "put",
    Symbol("strike") => self.parseNumber(strike),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1"),
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
function safeMarket(self::Gate, marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or((findfirst("-C", marketId) !== nothing), (findfirst("-P", marketId) !== nothing))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId, market, delimiter, marketType)

end
function fetchMarkets(self::Gate, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    if functions.ccxtruthy(self.checkRequiredCredentials(false))
        Base.fetch(self.loadUnifiedStatus());
    end
    rawPromises = [];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    types = self.safeList(fetchMarketsOptions, "types", ["spot", "swap", "future", "option"]);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        marketType = get(types, i + 1, nothing);
        if functions.ccxtruthy(marketType == "spot")
                        push!(rawPromises, self.fetchSpotMarkets(params));
        elseif functions.ccxtruthy(marketType == "swap")
            push!(rawPromises, self.fetchSwapMarkets(params));
        else
            if functions.ccxtruthy(marketType == "future")
                                push!(rawPromises, self.fetchFutureMarkets(params));
            elseif functions.ccxtruthy(marketType == "option")
                push!(rawPromises, self.fetchOptionMarkets(params));
            end

        end
        i += 1
    end
    results = Base.fetch(asyncmap(Base.fetch, rawPromises));
    return self.arraysConcat(results)

end
function fetchSpotMarkets(self::Gate, params=Dict())
    marginPromise = self.publicMarginGetCurrencyPairs(params);
    spotMarketsPromise = self.publicSpotGetCurrencyPairs(params);
    (marginResponse, spotMarketsResponse) = (Base.fetch(asyncmap(Base.fetch, [marginPromise, spotMarketsPromise])));
    marginMarkets = indexBy(marginResponse, "id");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(spotMarketsResponse)))
        spotMarket = get(spotMarketsResponse, i + 1, nothing);
        id = safeString(spotMarket, "id");
        marginMarket = safeValue(marginMarkets, id);
        market = deepExtend(marginMarket, spotMarket);
        (baseId, quoteId) = split(id, "_");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        takerPercent = safeString(market, "fee");
        makerPercent = safeString(market, "maker_fee_rate", takerPercent);
        amountPrecision = self.parseNumber(self.parsePrecision(safeString(market, "amount_precision")));
        tradeStatus = safeString(market, "trade_status");
        leverage = self.safeNumber(market, "leverage");
        margin = leverage != nothing;
        buyStart = safeIntegerProduct(spotMarket, "buy_start", 1000);
        createdTs = functions.ccxtruthy((buyStart != 0)) ? buyStart : nothing;
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
    Symbol("margin") => margin,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (tradeStatus == "tradable"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.parseNumber(stringDiv(takerPercent, "100")),
    Symbol("maker") => self.parseNumber(stringDiv(makerPercent, "100")),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "leverage", 1)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(spotMarket, "min_base_amount", amountPrecision),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_quote_amount"),
            Symbol("max") => functions.ccxtruthy(margin) ? self.safeNumber(market, "max_quote_amount") : nothing
        )
    ),
    Symbol("created") => createdTs,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchSwapMarkets(self::Gate, params=Dict())
    result = [];
    swapSettlementCurrencies = self.getSettlementCurrencies("swap", "fetchMarkets");
    if functions.ccxtruthy(get(self.options, Symbol("sandboxMode"), nothing))
        swapSettlementCurrencies = ["usdt"];
    end
    c = 0
    while functions.ccxtruthy(functions.ccxt_lt(c, length(swapSettlementCurrencies)))
        settleId = get(swapSettlementCurrencies, c + 1, nothing);
        request = Dict{Symbol, Any}(
            Symbol("settle") => settleId
        );
        response = Base.fetch(self.publicFuturesGetSettleContracts(extend(request, params)));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            parsedMarket = self.parseContractMarket(get(response, i + 1, nothing), settleId);
            push!(result, parsedMarket);
            i += 1
        end
        c += 1
    end
    return result

end
function fetchFutureMarkets(self::Gate, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("sandboxMode"), nothing))
            return []
    end
    result = [];
    futureSettlementCurrencies = self.getSettlementCurrencies("future", "fetchMarkets");
    c = 0
    while functions.ccxtruthy(functions.ccxt_lt(c, length(futureSettlementCurrencies)))
        settleId = get(futureSettlementCurrencies, c + 1, nothing);
        request = Dict{Symbol, Any}(
            Symbol("settle") => settleId
        );
        response = Base.fetch(self.publicDeliveryGetSettleContracts(extend(request, params)));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            parsedMarket = self.parseContractMarket(get(response, i + 1, nothing), settleId);
            push!(result, parsedMarket);
            i += 1
        end
        c += 1
    end
    return result

end
function parseContractMarket(self::Gate, market, settleId)
    id = safeString(market, "name");
    parts = split(id, "_");
    baseId = safeString(parts, 0);
    quoteId = safeString(parts, 1);
    date = safeString(parts, 2);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    expiry = safeTimestamp(market, "expire_time");
    symbol = "";
    marketType = "swap";
    if functions.ccxtruthy(date != nothing)
        symbol = string(base, "/", quote_var, ":", settle, "-", self.yymmdd(expiry, ""));
        marketType = "future";
    else
        symbol = string(base, "/", quote_var, ":", settle);
    end
    priceDeviate = safeString(market, "order_price_deviate");
    markPrice = safeString(market, "mark_price");
    minMultiplier = stringSub("1", priceDeviate);
    maxMultiplier = stringAdd("1", priceDeviate);
    minPrice = stringMul(minMultiplier, markPrice);
    maxPrice = stringMul(maxMultiplier, markPrice);
    isLinear = quote_var == settle;
    contractSize = safeString(market, "quanto_multiplier");
    if functions.ccxtruthy(contractSize == "0")
        contractSize = "1";
    end
    return Dict{Symbol, Any}(
    Symbol("id") => id,
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
    Symbol("swap") => marketType == "swap",
    Symbol("future") => marketType == "future",
    Symbol("option") => marketType == "option",
    Symbol("active") => true,
    Symbol("contract") => true,
    Symbol("linear") => isLinear,
    Symbol("inverse") => !functions.ccxtruthy(isLinear),
    Symbol("taker") => self.parseNumber("0.0005"),
    Symbol("maker") => self.parseNumber("0.0002"),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1"),
        Symbol("price") => self.safeNumber(market, "order_price_round")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "leverage_min"),
            Symbol("max") => self.safeNumber(market, "leverage_max")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "order_size_min"),
            Symbol("max") => self.safeNumber(market, "order_size_max")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minPrice),
            Symbol("max") => self.parseNumber(maxPrice)
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeIntegerProduct(market, "create_time", 1000),
    Symbol("info") => market
)

end
function fetchOptionMarkets(self::Gate, params=Dict())
    result = [];
    underlyings = Base.fetch(self.fetchOptionUnderlyings());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(underlyings)))
        underlying = get(underlyings, i + 1, nothing);
        query = extend(Dict{Symbol, Any}(), params);
        query[Symbol("underlying")] = underlying;
        response = Base.fetch(self.publicOptionsGetContracts(query));
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(response)))
            market = get(response, j + 1, nothing);
            id = safeString(market, "name");
            parts = split(underlying, "_");
            baseId = safeString(parts, 0);
            quoteId = safeString(parts, 1);
            base = self.safeCurrencyCode(baseId);
            quote_var = self.safeCurrencyCode(quoteId);
            symbol = string(base, "/", quote_var);
            expiry = safeTimestamp(market, "expiration_time");
            strike = safeString(market, "strike_price");
            isCall = safeValue(market, "is_call");
            optionLetter = functions.ccxtruthy(isCall) ? "C" : "P";
            optionType = functions.ccxtruthy(isCall) ? "call" : "put";
            symbol = string(symbol, ":", quote_var, "-", self.yymmdd(expiry), "-", strike, "-", optionLetter);
            priceDeviate = safeString(market, "order_price_deviate");
            markPrice = safeString(market, "mark_price");
            minMultiplier = stringSub("1", priceDeviate);
            maxMultiplier = stringAdd("1", priceDeviate);
            minPrice = stringMul(minMultiplier, markPrice);
            maxPrice = stringMul(maxMultiplier, markPrice);
            createdTs = safeTimestamp(market, "create_time");
            if functions.ccxtruthy(createdTs == 0)
                createdTs = nothing;
            end
            push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => quoteId,
    Symbol("type") => "option",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("active") => true,
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => self.parseNumber("0.0003"),
    Symbol("maker") => self.parseNumber("0.0003"),
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => self.parseNumber(strike),
    Symbol("optionType") => optionType,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1"),
        Symbol("price") => self.safeNumber(market, "order_price_round")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "order_size_min"),
            Symbol("max") => self.safeNumber(market, "order_size_max")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minPrice),
            Symbol("max") => self.parseNumber(maxPrice)
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => createdTs,
    Symbol("info") => market
));
            j += 1
        end
        i += 1
    end
    return result

end
function fetchOptionUnderlyings(self::Gate, )
    underlyingsResponse = Base.fetch(self.publicOptionsGetUnderlyings());
    underlyings = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(underlyingsResponse)))
        underlying = get(underlyingsResponse, i + 1, nothing);
        name = safeString(underlying, "name");
        if functions.ccxtruthy(name != nothing)
                        push!(underlyings, name);
        end
        i += 1
    end
    return underlyings

end
function prepareRequest(self::Gate, market=nothing, type_var=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            request[Symbol("contract")] = get(market, Symbol("id"), nothing);
            if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("option"), nothing)))
                request[Symbol("settle")] = get(market, Symbol("settleId"), nothing);
            end
        else
            request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
        end
    else
        swap = type_var == "swap";
        future = type_var == "future";
        if functions.ccxtruthy(@functions.ccxt_or(swap, future))
            defaultSettle = functions.ccxtruthy(swap) ? "usdt" : "btc";
            settle = safeStringLower(params, "settle", defaultSettle);
            params = omit(params, "settle");
            request[Symbol("settle")] = settle;
        end
    end
    return [request, params]

end
function spotOrderPrepareRequest(self::Gate, market=nothing, trigger=false, params=Dict())
    (marginMode, query) = self.getMarginMode(trigger, params);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(!functions.ccxtruthy(trigger))
        if functions.ccxtruthy(market == nothing)
            throw(ArgumentsRequired(string(self.id, " spotOrderPrepareRequest() requires a market argument for non-trigger orders")));
        end
        request[Symbol("account")] = marginMode;
        request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    end
    return [request, query]

end
function multiOrderSpotPrepareRequest(self::Gate, market=nothing, trigger=false, params=Dict())
    (marginMode, query) = self.getMarginMode(trigger, params);
    request = Dict{Symbol, Any}(
        Symbol("account") => marginMode
    );
    if functions.ccxtruthy(market != nothing)
        if functions.ccxtruthy(trigger)
            request[Symbol("market")] = get(market, Symbol("id"), nothing);
        else
            request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
        end
    end
    return [request, query]

end
function getMarginMode(self::Gate, trigger, params)
    defaultMarginMode = safeStringLower2(self.options, "defaultMarginMode", "marginMode", "spot");
    marginMode = safeStringLower2(params, "marginMode", "account", defaultMarginMode);
    params = omit(params, ["marginMode", "account"]);
    if functions.ccxtruthy(marginMode == "cross")
        marginMode = "cross_margin";
    elseif functions.ccxtruthy(marginMode == "isolated")
        marginMode = "margin";
    else
        if functions.ccxtruthy(marginMode == "")
            marginMode = "spot";
        end

    end
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(marginMode == "spot")
            marginMode = "normal";
        end
        if functions.ccxtruthy(marginMode == "cross_margin")
            throw(BadRequest(string(self.id, " getMarginMode() does not support trigger orders for cross margin")));
        end
    end
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "getMarginMode", "unifiedAccount");
    if functions.ccxtruthy(isUnifiedAccount)
        marginMode = "unified";
    end
    return [marginMode, params]

end
function getSettlementCurrencies(self::Gate, type_var, method)
    options = safeValue(self.options, type_var, Dict{Symbol, Any}());
    fetchMarketsContractOptions = safeValue(options, method, Dict{Symbol, Any}());
    defaultSettle = functions.ccxtruthy((type_var == "swap")) ? ["usdt"] : ["btc"];
    return safeValue(fetchMarketsContractOptions, "settlementCurrencies", defaultSettle)

end
function fetchCurrencies(self::Gate, params=Dict())
    apiBackup = safeValue(self.urls, "apiBackup");
    if functions.ccxtruthy(apiBackup != nothing)
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.publicSpotGetCurrencies(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Gate, rawCurrency)
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    type_var = functions.ccxtruthy(self.isLeveragedCurrency(currencyId)) ? "leveraged" : "crypto";
    chains = self.safeList(rawCurrency, "chains", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "name");
        networkCode = self.networkIdToCode(networkId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => chain,
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("active") => nothing,
            Symbol("deposit") => !functions.ccxtruthy(self.safeBool(chain, "deposit_disabled")),
            Symbol("withdraw") => !functions.ccxtruthy(self.safeBool(chain, "withdraw_disabled")),
            Symbol("fee") => nothing,
            Symbol("precision") => self.parseNumber("0.0001"),
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            )
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("type") => type_var,
    Symbol("active") => !functions.ccxtruthy(self.safeBool(rawCurrency, "delisted")),
    Symbol("deposit") => !functions.ccxtruthy(self.safeBool(rawCurrency, "deposit_disabled")),
    Symbol("withdraw") => !functions.ccxtruthy(self.safeBool(rawCurrency, "withdraw_disabled")),
    Symbol("fee") => nothing,
    Symbol("networks") => networks,
    Symbol("precision") => self.parseNumber("0.0001"),
    Symbol("info") => rawCurrency
))

end
function fetchFundingRate(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    (request, query) = self.prepareRequest(market, nothing, params);
    response = Base.fetch(self.publicFuturesGetSettleContractsContract(extend(request, query)));
    return self.parseFundingRate(response)

end
function fetchFundingRates(self::Gate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        market = self.market(firstSymbol);
    end
    (request, query) = self.prepareRequest(market, "swap", params);
    response = Base.fetch(self.publicFuturesGetSettleContracts(extend(request, query)));
    return self.parseFundingRates(response, symbols)

end
function parseFundingRate(self::Gate, contract, market=nothing)
    marketId = safeString(contract, "name");
    symbol = self.safeSymbol(marketId, market, "_", "swap");
    markPrice = self.safeNumber(contract, "mark_price");
    indexPrice = self.safeNumber(contract, "index_price");
    interestRate = self.safeNumber(contract, "interest_rate");
    fundingRate = self.safeNumber(contract, "funding_rate");
    fundingTime = safeTimestamp(contract, "funding_next_apply");
    fundingRateIndicative = self.safeNumber(contract, "funding_rate_indicative");
    fundingInterval = stringMul("1000", safeString(contract, "funding_interval"));
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => interestRate,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => fundingRateIndicative,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => self.parseFundingInterval(fundingInterval)
)

end
function parseFundingInterval(self::Gate, interval)
    intervals = Dict{Symbol, Any}(
        Symbol("3600000") => "1h",
        Symbol("14400000") => "4h",
        Symbol("28800000") => "8h",
        Symbol("57600000") => "16h",
        Symbol("86400000") => "24h"
    );
    return safeString(intervals, interval, interval)

end
function fetchNetworkDepositAddress(self::Gate, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateWalletGetDepositAddress(extend(request, params)));
    addresses = safeValue(response, "multichain_addresses");
    currencyId = safeString(response, "currency");
    code = self.safeCurrencyCode(currencyId);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(addresses)))
        entry = get(addresses, i + 1, nothing);
        obtainFailed = safeInteger(entry, "obtain_failed");
        if functions.ccxtruthy(obtainFailed)
            i += 1; continue
        end
        network = safeString(entry, "chain");
        address = safeString(entry, "address");
        tag = safeString(entry, "payment_id");
        result[Symbol(network)] = Dict{Symbol, Any}(
            Symbol("info") => entry,
            Symbol("code") => code,
            Symbol("currency") => code,
            Symbol("address") => address,
            Symbol("tag") => tag
        );
        i += 1
    end
    return result

end
function fetchDepositAddressesByNetwork(self::Gate, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateWalletGetDepositAddress(extend(request, params)));
    chains = safeValue(response, "multichain_addresses", []);
    currencyId = safeString(response, "currency");
    currency = self.safeCurrency(currencyId, currency);
    parsed = self.parseDepositAddresses(chains, nothing, false);
    return indexBy(parsed, "network")

end
function fetchDepositAddress(self::Gate, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    chainsIndexedById = Base.fetch(self.fetchDepositAddressesByNetwork(code, params));
    selectedNetworkIdOrCode = self.selectNetworkCodeFromUnifiedNetworks(code, networkCode, chainsIndexedById);
    return get(chainsIndexedById, selectedNetworkIdOrCode + 1, nothing)

end
function parseDepositAddress(self::Gate, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address);
    code = safeString(currency, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "payment_id"),
    Symbol("network") => self.networkIdToCode(safeString(depositAddress, "chain"), code)
)

end
function fetchTradingFee(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency_pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateWalletGetFee(extend(request, params)));
    return self.parseTradingFee(response, market)

end
function fetchTradingFees(self::Gate, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateWalletGetFee(params));
    return self.parseTradingFees(response)

end
function parseTradingFees(self::Gate, response)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        result[Symbol(symbol)] = self.parseTradingFee(response, market);
        i += 1
    end
    return result

end
function parseTradingFee(self::Gate, info, market=nothing)
    gtDiscount = safeValue(info, "gt_discount");
    taker = functions.ccxtruthy(gtDiscount) ? "gt_taker_fee" : "taker_fee";
    maker = functions.ccxtruthy(gtDiscount) ? "gt_maker_fee" : "maker_fee";
    contract = safeValue(market, "contract");
    takerKey = functions.ccxtruthy(contract) ? "futures_taker_fee" : taker;
    makerKey = functions.ccxtruthy(contract) ? "futures_maker_fee" : maker;
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("maker") => self.safeNumber(info, makerKey),
    Symbol("taker") => self.safeNumber(info, takerKey),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTransactionFees(self::Gate, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateWalletGetWithdrawStatus(params));
    result = Dict{Symbol, Any}();
    withdrawFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        withdrawFees = Dict{Symbol, Any}();
        entry = get(response, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((codes != nothing), !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        withdrawFixOnChains = safeValue(entry, "withdraw_fix_on_chains");
        if functions.ccxtruthy(withdrawFixOnChains == nothing)
            withdrawFees = self.safeNumber(entry, "withdraw_fix");
        else
            networkIds = objectKeys(withdrawFixOnChains);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
                networkId = get(networkIds, j + 1, nothing);
                networkCode = self.networkIdToCode(networkId, code);
                withdrawFees[Symbol(networkCode)] = self.parseNumber(get(withdrawFixOnChains, Symbol(networkId), nothing));
                j += 1
            end
        end
        result[Symbol(code)] = Dict{Symbol, Any}(
            Symbol("withdraw") => withdrawFees,
            Symbol("deposit") => nothing,
            Symbol("info") => entry
        );
        i += 1
    end
    return result

end
function fetchDepositWithdrawFees(self::Gate, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateWalletGetWithdrawStatus(params));
    return self.parseDepositWithdrawFees(response, codes, "currency")

end
function parseDepositWithdrawFee(self::Gate, fee, currency=nothing)
    withdrawFixOnChains = safeValue(fee, "withdraw_fix_on_chains");
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => self.safeNumber(fee, "withdraw_fix"),
            Symbol("percentage") => false
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => self.safeNumber(fee, "deposit"),
            Symbol("percentage") => false
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    if functions.ccxtruthy(withdrawFixOnChains != nothing)
        chainKeys = objectKeys(withdrawFixOnChains);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(chainKeys)))
            chainKey = get(chainKeys, i + 1, nothing);
            currencyId = safeString(fee, "currency");
            code = self.safeCurrencyCode(currencyId, currency);
            networkCode = self.networkIdToCode(chainKey, code);
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("fee") => self.parseNumber(get(withdrawFixOnChains, Symbol(chainKey), nothing)),
                    Symbol("percentage") => false
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                )
            );
            i += 1
        end

    end
    return result

end
function fetchFundingHistory(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchFundingHistory", market, params);
    (request, requestParams) = self.prepareRequest(market, type_var, query);
    request[Symbol("type")] = "fund";
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.privateFuturesGetSettleAccountBook(extend(request, requestParams)));
    elseif functions.ccxtruthy(type_var == "future")
        response = Base.fetch(self.privateDeliveryGetSettleAccountBook(extend(request, requestParams)));
    else
        throw(NotSupported(string(self.id, " fetchFundingHistory() only support swap & future market type")));
    end
    return self.parseFundingHistories(response, symbol, since, limit)

end
function parseFundingHistories(self::Gate, response, symbol, since, limit)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        funding = self.parseFundingHistory(entry);
        push!(result, funding);
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function parseFundingHistory(self::Gate, info, market=nothing)
    timestamp = safeTimestamp(info, "time");
    marketId = safeString(info, "text");
    market = self.safeMarket(marketId, market, "_", "swap");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("code") => safeString(market, "settle"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.safeNumber(info, "change")
)

end
function fetchOrderBook(self::Gate, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (request, query) = self.prepareRequest(market, get(market, Symbol("type"), nothing), params);
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            limit = min(limit, 1000);
        else
            limit = min(limit, 300);
        end
        request[Symbol("limit")] = limit;
    end
    request[Symbol("with_id")] = true;
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("margin"), nothing)))
        response = Base.fetch(self.publicSpotGetOrderBook(extend(request, query)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.publicFuturesGetSettleOrderBook(extend(request, query)));
    else
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            response = Base.fetch(self.publicDeliveryGetSettleOrderBook(extend(request, query)));
        elseif functions.ccxtruthy(get(market, Symbol("option"), nothing))
            response = Base.fetch(self.publicOptionsGetOrderBook(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchOrderBook() not support this market type")));
        end

    end
    timestamp = safeInteger(response, "current");
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        timestamp = timestamp * 1000;
    end
    priceKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? 0 : "p";
    amountKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? 1 : "s";
    nonce = safeInteger(response, "id");
    result = self.parseOrderBook(response, symbol, timestamp, "bids", "asks", priceKey, amountKey);
    result[Symbol("nonce")] = nonce;
    return result

end
function fetchTicker(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (request, query) = self.prepareRequest(market, nothing, params);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("margin"), nothing)))
        response = Base.fetch(self.publicSpotGetTickers(extend(request, query)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.publicFuturesGetSettleTickers(extend(request, query)));
    else
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            response = Base.fetch(self.publicDeliveryGetSettleTickers(extend(request, query)));
        elseif functions.ccxtruthy(get(market, Symbol("option"), nothing))
            marketId = get(market, Symbol("id"), nothing);
            optionParts = split(marketId, "-");
            request[Symbol("underlying")] = safeString(optionParts, 0);
            response = Base.fetch(self.publicOptionsGetTickers(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchTicker() not support this market type")));
        end

    end
    ticker = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            entry = get(response, i + 1, nothing);
            if functions.ccxtruthy(get(entry, Symbol("name"), nothing) == get(market, Symbol("id"), nothing))
                ticker = entry;
                break
            end
            i += 1
        end

    else
        ticker = safeValue(response, 0);
    end
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Gate, ticker, market=nothing)
    marketId = safeStringN(ticker, ["currency_pair", "contract", "name"]);
    marketType = functions.ccxtruthy((ccxt_in("mark_price", ticker))) ? "contract" : "spot";
    symbol = self.safeSymbol(marketId, market, "_", marketType);
    last_var = safeString2(ticker, "last", "last_price");
    ask = safeStringN(ticker, ["lowest_ask", "a", "ask1_price"]);
    bid = safeStringN(ticker, ["highest_bid", "b", "bid1_price"]);
    high = safeString(ticker, "high_24h");
    low = safeString(ticker, "low_24h");
    bidVolume = safeString2(ticker, "B", "bid1_size");
    askVolume = safeString2(ticker, "A", "ask1_size");
    timestamp = safeInteger(ticker, "t");
    baseVolume = safeString2(ticker, "base_volume", "volume_24h_base");
    if functions.ccxtruthy(baseVolume == "nan")
        baseVolume = "0";
    end
    quoteVolume = safeString2(ticker, "quote_volume", "volume_24h_quote");
    if functions.ccxtruthy(quoteVolume == "nan")
        quoteVolume = "0";
    end
    percentage = safeString(ticker, "change_percentage");
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
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Gate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    first_var = safeString(symbols, 0);
    market = nothing;
    if functions.ccxtruthy(first_var != nothing)
        market = self.market(first_var);
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    (request, requestParams) = self.prepareRequest(nothing, type_var, query);
    request[Symbol("timezone")] = "utc0";
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
        response = Base.fetch(self.publicSpotGetTickers(extend(request, requestParams)));
    elseif functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.publicFuturesGetSettleTickers(extend(request, requestParams)));
    else
        if functions.ccxtruthy(type_var == "future")
            response = Base.fetch(self.publicDeliveryGetSettleTickers(extend(request, requestParams)));
        elseif functions.ccxtruthy(type_var == "option")
            self.checkRequiredArgument("fetchTickers", symbols, "symbols");
            marketId = safeString(market, "id");
            optionParts = split(marketId, "-");
            request[Symbol("underlying")] = safeString(optionParts, 0);
            response = Base.fetch(self.publicOptionsGetTickers(extend(request, requestParams)));
        else
            throw(NotSupported(string(self.id, " fetchTickers() not support this market type, provide symbols or set params[\"defaultType\"] to one from spot/margin/swap/future/option")));
        end

    end
    return self.parseTickers(response, symbols)

end
function parseBalanceHelper(self::Gate, entry)
    account = self.account();
    account[Symbol("used")] = safeString2(entry, "freeze", "locked");
    account[Symbol("free")] = safeString(entry, "available");
    account[Symbol("total")] = safeString(entry, "total");
    if functions.ccxtruthy(ccxt_in("borrowed", entry))
        account[Symbol("debt")] = safeString(entry, "borrowed");
    end
    return account

end
function fetchBalance(self::Gate, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    symbol = safeString(params, "symbol");
    params = omit(params, "symbol");
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "fetchBalance", "unifiedAccount");
    (type_var, query) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    (request, requestParams) = self.prepareRequest(nothing, type_var, query);
    (marginMode, requestQuery) = self.getMarginMode(false, requestParams);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(isUnifiedAccount)
        response = Base.fetch(self.privateUnifiedGetAccounts(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(marginMode == "spot")
            response = Base.fetch(self.privateSpotGetAccounts(extend(request, requestQuery)));
        elseif functions.ccxtruthy(marginMode == "margin")
            response = Base.fetch(self.privateMarginGetAccounts(extend(request, requestQuery)));
        else
            if functions.ccxtruthy(marginMode == "cross_margin")
                response = Base.fetch(self.privateMarginGetCrossAccounts(extend(request, requestQuery)));
            else
                throw(NotSupported(string(self.id, " fetchBalance() not support this marginMode")));
            end

        end
    else
        if functions.ccxtruthy(type_var == "funding")
            response = Base.fetch(self.privateMarginGetFundingAccounts(extend(request, requestQuery)));
        elseif functions.ccxtruthy(type_var == "swap")
            response = Base.fetch(self.privateFuturesGetSettleAccounts(extend(request, requestQuery)));
        else
            if functions.ccxtruthy(type_var == "future")
                response = Base.fetch(self.privateDeliveryGetSettleAccounts(extend(request, requestQuery)));
            elseif functions.ccxtruthy(type_var == "option")
                response = Base.fetch(self.privateOptionsGetAccounts(extend(request, requestQuery)));
            else
                throw(NotSupported(string(self.id, " fetchBalance() not support this market type")));
            end

        end

    end
    contract = (@functions.ccxt_or(@functions.ccxt_or((type_var == "swap"), (type_var == "future")), (type_var == "option")));
    if functions.ccxtruthy(contract)
        response = [response];
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    isolated = @functions.ccxt_and(marginMode == "margin", type_var == "spot");
    data = response;
    if functions.ccxtruthy(ccxt_in("balances", data))
        flatBalances = [];
        balances = safeValue(data, "balances", []);
        keys_var = objectKeys(balances);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            currencyId = get(keys_var, i + 1, nothing);
            content = get(balances, Symbol(currencyId), nothing);
            content[Symbol("currency")] = currencyId;
            push!(flatBalances, content);
            i += 1
        end

        data = flatBalances;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(isolated)
            marketId = safeString(entry, "currency_pair");
            symbolInner = self.safeSymbol(marketId, nothing, "_", "margin");
            base = safeValue(entry, "base", Dict{Symbol, Any}());
            quote_var = safeValue(entry, "quote", Dict{Symbol, Any}());
            baseCode = self.safeCurrencyCode(safeString(base, "currency"));
            quoteCode = self.safeCurrencyCode(safeString(quote_var, "currency"));
            subResult = Dict{Symbol, Any}();
            subResult[Symbol(baseCode)] = self.parseBalanceHelper(base);
            subResult[Symbol(quoteCode)] = self.parseBalanceHelper(quote_var);
            result[Symbol(symbolInner)] = self.safeBalance(subResult);
        else
            code = self.safeCurrencyCode(safeString(entry, "currency"));
            result[Symbol(code)] = self.parseBalanceHelper(entry);
        end
        i += 1
    end
    returnResult = functions.ccxtruthy(isolated) ? result : self.safeBalance(result);
    return returnResult

end
function fetchOHLCV(self::Gate, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1000))
    end
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            return Base.fetch(self.fetchOptionOHLCV(symbol, timeframe, since, limit, params))
    end
    price = safeString(params, "price");
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, nothing, params);
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    maxLimit = functions.ccxtruthy(get(market, Symbol("contract"), nothing)) ? 1999 : 1000;
    limit = functions.ccxtruthy((limit == nothing)) ? maxLimit : min(limit, maxLimit);
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        until = self.parseToInt(until / 1000);
        params = omit(params, "until");
    end
    if functions.ccxtruthy(since != nothing)
        duration = self.parseTimeframe(timeframe);
        request[Symbol("from")] = self.parseToInt(since / 1000);
        distance = (limit - 1) * duration;
        toTimestamp = self.sum(get(request, Symbol("from"), nothing), distance);
        currentTimestamp = seconds();
        to = min(toTimestamp, currentTimestamp);
        if functions.ccxtruthy(until != nothing)
            request[Symbol("to")] = min(to, until);
        else
            request[Symbol("to")] = to;
        end
    else
        if functions.ccxtruthy(until != nothing)
            request[Symbol("to")] = until;
        end
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        isMark = (price == "mark");
        isIndex = (price == "index");
        if functions.ccxtruthy(@functions.ccxt_or(isMark, isIndex))
            request[Symbol("contract")] = string(price, "_", get(market, Symbol("id"), nothing));
            params = omit(params, "price");
        end
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            response = Base.fetch(self.publicDeliveryGetSettleCandlesticks(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            response = Base.fetch(self.publicFuturesGetSettleCandlesticks(extend(request, params)));
        end
    else
        response = Base.fetch(self.publicSpotGetCandlesticks(extend(request, params)));
    end
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function fetchOptionOHLCV(self::Gate, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, nothing, params);
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    response = Base.fetch(self.publicOptionsGetCandlesticks(extend(request, params)));
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function fetchFundingRateHistory(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, nothing, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("to")] = self.parseToInt(until / 1000);
    end
    response = Base.fetch(self.publicFuturesGetSettleFundingRate(extend(request, params)));
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        timestamp = safeTimestamp(entry, "t");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(entry, "r"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseOHLCV(self::Gate, ohlcv, market=nothing)
    if functions.ccxtruthy(functions.ccxt_isArray(ohlcv))
            return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 5), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 6)]
    else
        return [safeTimestamp(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]
    end

end
function fetchTrades(self::Gate, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol, since, limit, params))
    end
    market = self.market(symbol);
    (request, query) = self.prepareRequest(market, nothing, params);
    until = safeInteger2(params, "to", "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("to")] = self.parseToInt(until / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_and(since != nothing, (get(market, Symbol("contract"), nothing))))
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("type"), nothing) == "spot", get(market, Symbol("type"), nothing) == "margin"))
        response = Base.fetch(self.publicSpotGetTrades(extend(request, query)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.publicFuturesGetSettleTrades(extend(request, query)));
    else
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            response = Base.fetch(self.publicDeliveryGetSettleTrades(extend(request, query)));
        elseif functions.ccxtruthy(get(market, Symbol("type"), nothing) == "option")
            response = Base.fetch(self.publicOptionsGetTrades(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchTrades() not support this market type.")));
        end

    end
    return self.parseTrades(response, market, since, limit)

end
function fetchOrderTrades(self::Gate, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.fetchMyTrades(symbol, since, limit, Dict{Symbol, Any}(
        Symbol("order_id") => id
    )));
    return response

end
function fetchMyTrades(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params))
    end
    type_var = nothing;
    marginMode = nothing;
    request = Dict{Symbol, Any}();
    market = functions.ccxtruthy((symbol != nothing)) ? self.market(symbol) : nothing;
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    contract = @functions.ccxt_or(@functions.ccxt_or((type_var == "swap"), (type_var == "future")), (type_var == "option"));
    if functions.ccxtruthy(contract)
        (request, params) = self.prepareRequest(market, type_var, params);
        if functions.ccxtruthy(type_var == "option")
            params = omit(params, "order_id");
        end
    else
        if functions.ccxtruthy(market != nothing)
            request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
        end
        (marginMode, params) = self.getMarginMode(false, params);
        request[Symbol("account")] = marginMode;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("to")] = self.parseToInt(until / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
        response = Base.fetch(self.privateSpotGetMyTrades(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.privateFuturesGetSettleMyTradesTimerange(extend(request, params)));
    else
        if functions.ccxtruthy(type_var == "future")
            response = Base.fetch(self.privateDeliveryGetSettleMyTrades(extend(request, params)));
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsGetMyTrades(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchMyTrades() not support this market type.")));
        end

    end
    return self.parseTrades(response, market, since, limit)

end
function parseTrade(self::Gate, trade, market=nothing)
    id = safeString2(trade, "id", "trade_id");
    timestamp = nothing;
    msString = safeString(trade, "create_time_ms");
    if functions.ccxtruthy(msString != nothing)
        msString = stringMul(msString, "1000");
        msString = msString[0 + 1:13];
        timestamp = self.parseToInt(msString);
    else
        timestamp = safeTimestamp2(trade, "time", "create_time");
    end
    marketId = safeString2(trade, "currency_pair", "contract");
    marketType = functions.ccxtruthy((ccxt_in("contract", trade))) ? "contract" : "spot";
    market = self.safeMarket(marketId, market, "_", marketType);
    amountString = safeString2(trade, "amount", "size");
    priceString = safeString(trade, "price");
    contractSide = functions.ccxtruthy(stringLt(amountString, "0")) ? "sell" : "buy";
    amountString = stringAbs(amountString);
    side = safeString2(trade, "side", "type", contractSide);
    orderId = safeString(trade, "order_id");
    feeAmount = safeString(trade, "fee");
    gtFee = omitZero(safeString(trade, "gt_fee"));
    pointFee = omitZero(safeString(trade, "point_fee"));
    fees = [];
    if functions.ccxtruthy(feeAmount != nothing)
        feeCurrencyId = safeString(trade, "fee_currency");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        if functions.ccxtruthy(feeCurrencyCode == nothing)
            feeCurrencyCode = safeString(market, "settle");
        end
                push!(fees, Dict{Symbol, Any}(
    Symbol("cost") => feeAmount,
    Symbol("currency") => feeCurrencyCode
));
    end
    if functions.ccxtruthy(gtFee != nothing)
                push!(fees, Dict{Symbol, Any}(
    Symbol("cost") => gtFee,
    Symbol("currency") => "GT"
));
    end
    if functions.ccxtruthy(pointFee != nothing)
                push!(fees, Dict{Symbol, Any}(
    Symbol("cost") => pointFee,
    Symbol("currency") => "GATEPOINT"
));
    end
    takerOrMaker = safeString(trade, "role");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing,
    Symbol("fees") => fees
), market)

end
function fetchDeposits(self::Gate, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchDeposits", code, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        start = self.parseToInt(since / 1000);
        request[Symbol("from")] = start;
        request[Symbol("to")] = self.sum(start, 30 * 24 * 60 * 60);
    end
    (request, params) = self.handleUntilOption("to", request, params, 0.001);
    response = Base.fetch(self.privateWalletGetDeposits(extend(request, params)));
    return self.parseTransactions(response, currency)

end
function fetchWithdrawals(self::Gate, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchWithdrawals", code, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        start = self.parseToInt(since / 1000);
        request[Symbol("from")] = start;
        request[Symbol("to")] = self.sum(start, 30 * 24 * 60 * 60);
    end
    (request, params) = self.handleUntilOption("to", request, params, 0.001);
    response = Base.fetch(self.privateWalletGetWithdrawals(extend(request, params)));
    return self.parseTransactions(response, currency)

end
function withdraw(self::Gate, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chain")] = self.networkCodeToId(networkCode, code);
    end
    response = Base.fetch(self.privateWithdrawalsPostWithdrawals(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseTransactionStatus(self::Gate, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PEND") => "pending",
        Symbol("REQUEST") => "pending",
        Symbol("DMOVE") => "pending",
        Symbol("MANUAL") => "pending",
        Symbol("VERIFY") => "pending",
        Symbol("PROCES") => "pending",
        Symbol("EXTPEND") => "pending",
        Symbol("SPLITPEND") => "pending",
        Symbol("CANCEL") => "canceled",
        Symbol("FAIL") => "failed",
        Symbol("INVALID") => "failed",
        Symbol("DONE") => "ok",
        Symbol("BCODE") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransactionType(self::Gate, type_var)
    types = Dict{Symbol, Any}(
        Symbol("d") => "deposit",
        Symbol("w") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function parseTransaction(self::Gate, transaction, currency=nothing)
    id = safeString(transaction, "id");
    type_var = nothing;
    amountString = safeString(transaction, "amount");
    if functions.ccxtruthy(id != nothing)
        if functions.ccxtruthy(get(id, 1, nothing) == "b")
            type_var = functions.ccxtruthy(stringGt(amountString, "0")) ? "deposit" : "withdrawal";
            amountString = stringAbs(amountString);
        else
            type_var = self.parseTransactionType(get(id, 1, nothing));
        end
    end
    feeCostString = safeString2(transaction, "fee", "fee_amount");
    if functions.ccxtruthy(type_var == "withdrawal")
        amountString = stringSub(amountString, feeCostString);
    end
    networkId = safeStringUpper(transaction, "chain");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId);
    txid = safeString(transaction, "txid");
    rawStatus = safeString(transaction, "status");
    status = self.parseTransactionStatus(rawStatus);
    address = safeString(transaction, "address");
    tag = safeString(transaction, "memo");
    timestamp = safeTimestamp(transaction, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("status") => status,
    Symbol("type") => type_var,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(feeCostString)
    )
)

end
function createOrder(self::Gate, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = self.market(symbol);
    trigger = safeValue(params, "trigger");
    triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeValue(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    isStopLossOrder = stopLossPrice != nothing;
    isTakeProfitOrder = takeProfitPrice != nothing;
    isTpsl = @functions.ccxt_or(isStopLossOrder, isTakeProfitOrder);
    nonTriggerOrder = @functions.ccxt_and(!functions.ccxtruthy(isTpsl), (trigger == nothing));
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("margin"), nothing)))
        if functions.ccxtruthy(nonTriggerOrder)
            response = Base.fetch(self.privateSpotPostOrders(orderRequest));
        else
            response = Base.fetch(self.privateSpotPostPriceOrders(orderRequest));
        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(nonTriggerOrder)
            response = Base.fetch(self.privateFuturesPostSettleOrders(orderRequest));
        else
            response = Base.fetch(self.privateFuturesPostSettlePriceOrders(orderRequest));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            if functions.ccxtruthy(nonTriggerOrder)
                response = Base.fetch(self.privateDeliveryPostSettleOrders(orderRequest));
            else
                response = Base.fetch(self.privateDeliveryPostSettlePriceOrders(orderRequest));
            end
        else
            response = Base.fetch(self.privateOptionsPostOrders(orderRequest));
        end

    end
    return self.parseOrder(response, market)

end
function createOrdersRequest(self::Gate, orders, params=Dict())
    ordersRequests = [];
    orderSymbols = [];
    ordersLength = length(orders);
    if functions.ccxtruthy(ordersLength == 0)
        throw(BadRequest(string(self.id, " createOrders() requires at least one order")));
    end
    if functions.ccxtruthy(functions.ccxt_gt(ordersLength, 10))
        throw(BadRequest(string(self.id, " createOrders() accepts a maximum of 10 orders at a time")));
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        push!(orderSymbols, marketId);
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = safeValue(rawOrder, "params", Dict{Symbol, Any}());
        extendedParams = extend(orderParams, params);
        triggerValue = safeValueN(orderParams, ["triggerPrice", "stopPrice", "takeProfitPrice", "stopLossPrice"]);
        if functions.ccxtruthy(triggerValue != nothing)
            throw(NotSupported(string(self.id, " createOrders() does not support advanced order properties (stopPrice, takeProfitPrice, stopLossPrice)")));
        end
        extendedParams[Symbol("textIsRequired")] = true;
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, extendedParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    symbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    market = self.market(get(symbols, 1, nothing));
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("future"), nothing), get(market, Symbol("option"), nothing)))
        throw(NotSupported(string(self.id, " createOrders() does not support futures or options markets")));
    end
    return ordersRequests

end
function createOrders(self::Gate, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    ordersRequests = self.createOrdersRequest(orders, params);
    firstOrder = get(orders, 1, nothing);
    market = self.market(get(firstOrder, Symbol("symbol"), nothing));
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateSpotPostBatchOrders(ordersRequests));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateFuturesPostSettleBatchOrders(ordersRequests));
    end
    return self.parseOrders(response)

end
function createOrderRequest(self::Gate, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    contract = get(market, Symbol("contract"), nothing);
    trigger = safeValue(params, "trigger");
    triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeValue(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    isStopLossOrder = stopLossPrice != nothing;
    isTakeProfitOrder = takeProfitPrice != nothing;
    isTpsl = @functions.ccxt_or(isStopLossOrder, isTakeProfitOrder);
    if functions.ccxtruthy(@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder))
        throw(ExchangeError(string(self.id, " createOrder() stopLossPrice and takeProfitPrice cannot both be defined")));
    end
    reduceOnly = safeValue(params, "reduceOnly");
    exchangeSpecificTimeInForce = safeStringLowerN(params, ["timeInForce", "tif", "time_in_force"]);
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", exchangeSpecificTimeInForce == "poc", params);
    timeInForce = self.handleTimeInForce(params);
    if functions.ccxtruthy(postOnly)
        timeInForce = "poc";
    end
    clientOrderId = safeString2(params, "text", "clientOrderId");
    params = omit(params, ["stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice", "reduceOnly", "timeInForce", "postOnly", "clientOrderId"]);
    isLimitOrder = (type_var == "limit");
    isMarketOrder = (type_var == "market");
    if functions.ccxtruthy(@functions.ccxt_and(isLimitOrder, price == nothing))
        throw(ArgumentsRequired(string(self.id, " createOrder () requires a price argument for ", type_var, " orders")));
    end
    if functions.ccxtruthy(isMarketOrder)
        if functions.ccxtruthy(@functions.ccxt_or((timeInForce == "poc"), (timeInForce == "gtc")))
            throw(ExchangeError(string(self.id, " createOrder () timeInForce for market order can only be \"FOK\" or \"IOC\"")));
        else
            if functions.ccxtruthy(timeInForce == nothing)
                defaultTif = safeString(self.options, "defaultTimeInForce", "IOC");
                exchangeSpecificTif = safeString(get(self.options, Symbol("timeInForce"), nothing), defaultTif, "ioc");
                timeInForce = exchangeSpecificTif;
            end
        end
        if functions.ccxtruthy(contract)
            price = 0;
        end
    end
    if functions.ccxtruthy(contract)
        isClose = safeValue(params, "close");
        if functions.ccxtruthy(isClose)
            amount = 0;
        else
            amountToPrecision = self.amountToPrecision(symbol, amount);
            signedAmount = functions.ccxtruthy((side == "sell")) ? stringNeg(amountToPrecision) : amountToPrecision;
            amount = ccxt_parseInt(signedAmount);
        end
    end
    request = nothing;
    nonTriggerOrder = @functions.ccxt_and(!functions.ccxtruthy(isTpsl), (trigger == nothing));
    if functions.ccxtruthy(nonTriggerOrder)
        if functions.ccxtruthy(contract)
            request = Dict{Symbol, Any}(
                Symbol("contract") => get(market, Symbol("id"), nothing),
                Symbol("size") => amount
            );
            if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("option"), nothing)))
                request[Symbol("settle")] = get(market, Symbol("settleId"), nothing);
            end
            if functions.ccxtruthy(isMarketOrder)
                request[Symbol("price")] = "0";
            else
                request[Symbol("price")] = functions.ccxtruthy((price == 0)) ? "0" : self.priceToPrecision(symbol, price);
            end
            if functions.ccxtruthy(reduceOnly != nothing)
                request[Symbol("reduce_only")] = reduceOnly;
            end
            if functions.ccxtruthy(timeInForce != nothing)
                request[Symbol("tif")] = timeInForce;
            end
        else
            marginMode = nothing;
            (marginMode, params) = self.getMarginMode(false, params);
            request = Dict{Symbol, Any}(
                Symbol("currency_pair") => get(market, Symbol("id"), nothing),
                Symbol("type") => type_var,
                Symbol("account") => marginMode,
                Symbol("side") => side
            );
            if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (side == "buy")))
                quoteAmount = nothing;
                createMarketBuyOrderRequiresPrice = true;
                (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
                cost = self.safeNumber(params, "cost");
                params = omit(params, "cost");
                if functions.ccxtruthy(cost != nothing)
                    quoteAmount = self.costToPrecision(symbol, cost);
                elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                    if functions.ccxtruthy(price == nothing)
                        throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument")));
                    else
                        amountString = numberToString(amount);
                        priceString = numberToString(price);
                        costRequest = stringMul(amountString, priceString);
                        quoteAmount = self.costToPrecision(symbol, costRequest);
                    end
                else
                    quoteAmount = self.costToPrecision(symbol, amount);
                end
                request[Symbol("amount")] = quoteAmount;
            else
                request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
            end
            if functions.ccxtruthy(isLimitOrder)
                request[Symbol("price")] = self.priceToPrecision(symbol, price);
            end
            if functions.ccxtruthy(timeInForce != nothing)
                request[Symbol("time_in_force")] = timeInForce;
            end
        end
        textIsRequired = self.safeBool(params, "textIsRequired", false);
        if functions.ccxtruthy(clientOrderId != nothing)
            if functions.ccxtruthy(functions.ccxt_gt(length(clientOrderId), 28))
                throw(BadRequest(string(self.id, " createOrder () clientOrderId or text param must be up to 28 characters")));
            end
            params = omit(params, "textIsRequired");
            if functions.ccxtruthy(get(clientOrderId, 1, nothing) != "t")
                clientOrderId = string("t-", clientOrderId);
            end
            request[Symbol("text")] = clientOrderId;
        else
            if functions.ccxtruthy(textIsRequired)
                request[Symbol("text")] = string("t-", uuid16());
            end
        end
    else
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            throw(NotSupported(string(self.id, " createOrder() conditional option orders are not supported")));
        end
        if functions.ccxtruthy(contract)
            request = Dict{Symbol, Any}(
                Symbol("initial") => Dict{Symbol, Any}(
                    Symbol("contract") => get(market, Symbol("id"), nothing),
                    Symbol("size") => amount
                ),
                Symbol("settle") => get(market, Symbol("settleId"), nothing)
            );
            if functions.ccxtruthy(type_var == "market")
                request[Symbol("initial")][Symbol("price")] = "0";
            else
                request[Symbol("initial")][Symbol("price")] = functions.ccxtruthy((price == 0)) ? "0" : self.priceToPrecision(symbol, price);
            end
            if functions.ccxtruthy(trigger == nothing)
                rule = nothing;
                triggerOrderPrice = nothing;
                if functions.ccxtruthy(isStopLossOrder)
                    rule = functions.ccxtruthy((side == "buy")) ? 1 : 2;
                    triggerOrderPrice = self.priceToPrecision(symbol, stopLossPrice);
                elseif functions.ccxtruthy(isTakeProfitOrder)
                    rule = functions.ccxtruthy((side == "buy")) ? 2 : 1;
                    triggerOrderPrice = self.priceToPrecision(symbol, takeProfitPrice);
                end
                priceType = safeInteger(params, "price_type", 0);
                if functions.ccxtruthy(@functions.ccxt_or(functions.ccxt_lt(priceType, 0), functions.ccxt_gt(priceType, 2)))
                    throw(BadRequest(string(self.id, " createOrder () price_type should be 0 latest deal price, 1 mark price, 2 index price")));
                end
                params = omit(params, ["price_type"]);
                request[Symbol("trigger")] = Dict{Symbol, Any}(
                    Symbol("price_type") => priceType,
                    Symbol("price") => self.priceToPrecision(symbol, triggerOrderPrice),
                    Symbol("rule") => rule
                );
            end
            if functions.ccxtruthy(reduceOnly != nothing)
                request[Symbol("initial")][Symbol("reduce_only")] = reduceOnly;
            end
            if functions.ccxtruthy(timeInForce != nothing)
                request[Symbol("initial")][Symbol("tif")] = timeInForce;
            end
            if functions.ccxtruthy(clientOrderId != nothing)
                request[Symbol("initial")][Symbol("text")] = clientOrderId;
            end
        else
            options = safeValue(self.options, "createOrder", Dict{Symbol, Any}());
            marginMode = nothing;
            (marginMode, params) = self.getMarginMode(true, params);
            if functions.ccxtruthy(timeInForce == nothing)
                timeInForce = "gtc";
            end
            request = Dict{Symbol, Any}(
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("type") => type_var,
                    Symbol("side") => side,
                    Symbol("price") => self.priceToPrecision(symbol, price),
                    Symbol("amount") => self.amountToPrecision(symbol, amount),
                    Symbol("account") => marginMode,
                    Symbol("time_in_force") => timeInForce
                ),
                Symbol("market") => get(market, Symbol("id"), nothing)
            );
            if functions.ccxtruthy(trigger == nothing)
                defaultExpiration = safeInteger(options, "expiration");
                expiration = safeInteger(params, "expiration", defaultExpiration);
                rule = nothing;
                triggerOrderPrice = nothing;
                if functions.ccxtruthy(isStopLossOrder)
                    rule = functions.ccxtruthy((side == "buy")) ? ">=" : "<=";
                    triggerOrderPrice = self.priceToPrecision(symbol, stopLossPrice);
                elseif functions.ccxtruthy(isTakeProfitOrder)
                    rule = functions.ccxtruthy((side == "buy")) ? "<=" : ">=";
                    triggerOrderPrice = self.priceToPrecision(symbol, takeProfitPrice);
                end
                request[Symbol("trigger")] = Dict{Symbol, Any}(
                    Symbol("price") => self.priceToPrecision(symbol, triggerOrderPrice),
                    Symbol("rule") => rule,
                    Symbol("expiration") => expiration
                );
                if functions.ccxtruthy(clientOrderId != nothing)
                    request[Symbol("trigger")][Symbol("text")] = clientOrderId;
                end
            end
        end
    end
    return extend(request, params)

end
function createMarketBuyOrderWithCost(self::Gate, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("createMarketBuyOrderRequiresPrice") => false
));
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function editOrderRequest(self::Gate, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("editOrder", market, params);
    account = self.convertTypeToAccount(marketType);
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "editOrder", "unifiedAccount");
    if functions.ccxtruthy(isUnifiedAccount)
        account = "unified";
    end
    isLimitOrder = (type_var == "limit");
    if functions.ccxtruthy(account == "spot")
        if functions.ccxtruthy(!functions.ccxtruthy(isLimitOrder))
            throw(InvalidOrder(string(self.id, " editOrder() does not support ", type_var, " orders for ", marketType, " markets")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => string(id),
        Symbol("currency_pair") => get(market, Symbol("id"), nothing),
        Symbol("account") => account
    );
    if functions.ccxtruthy(amount != nothing)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        else
            if functions.ccxtruthy(side == "sell")
                request[Symbol("size")] = self.parseToNumeric(stringNeg(self.amountToPrecision(symbol, amount)));
            else
                request[Symbol("size")] = self.parseToNumeric(self.amountToPrecision(symbol, amount));
            end
        end
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        request[Symbol("settle")] = get(market, Symbol("settleId"), nothing);
    end
    return extend(request, params)

end
function editOrder(self::Gate, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = self.market(symbol);
    extendedRequest = self.editOrderRequest(id, symbol, type_var, side, amount, price, params);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateSpotPatchOrdersOrderId(extendedRequest));
    else
        response = Base.fetch(self.privateFuturesPutSettleOrdersOrderId(extendedRequest));
    end
    return self.parseOrder(response, market)

end
function parseOrderStatus(self::Gate, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("_new") => "open",
        Symbol("filled") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("liquidated") => "closed",
        Symbol("ioc") => "canceled",
        Symbol("failed") => "canceled",
        Symbol("expired") => "canceled",
        Symbol("finished") => "closed",
        Symbol("finish") => "closed",
        Symbol("succeeded") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Gate, order, market=nothing)
    succeeded = self.safeBool(order, "succeeded", true);
    if functions.ccxtruthy(!functions.ccxtruthy(succeeded))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("clientOrderId") => safeString(order, "text"),
    Symbol("info") => order,
    Symbol("status") => "rejected",
    Symbol("id") => safeString(order, "id")
))
    end
    put = safeValue2(order, "put", "initial", Dict{Symbol, Any}());
    trigger = safeValue(order, "trigger", Dict{Symbol, Any}());
    contract = safeString(put, "contract");
    type_var = safeString(put, "type");
    timeInForce = safeStringUpper2(put, "time_in_force", "tif");
    amount = safeString2(put, "amount", "size");
    side = safeString(put, "side");
    price = safeString(put, "price");
    contract = safeString(order, "contract", contract);
    type_var = safeString(order, "type", type_var);
    timeInForce = safeStringUpper2(order, "time_in_force", "tif", timeInForce);
    if functions.ccxtruthy(timeInForce == "POC")
        timeInForce = "PO";
    end
    postOnly = (timeInForce == "PO");
    amount = safeString2(order, "amount", "size", amount);
    side = safeString(order, "side", side);
    price = safeString(order, "price", price);
    remainingString = safeString(order, "left");
    cost = safeString(order, "filled_total");
    triggerPrice = self.safeNumber(trigger, "price");
    average = self.safeNumber2(order, "avg_deal_price", "fill_price");
    if functions.ccxtruthy(triggerPrice)
        remainingString = amount;
        cost = "0";
    end
    if functions.ccxtruthy(contract)
        isMarketOrder = @functions.ccxt_and(stringEquals(price, "0"), (timeInForce == "IOC"));
        type_var = functions.ccxtruthy(isMarketOrder) ? "market" : "limit";
        side = functions.ccxtruthy(stringGt(amount, "0")) ? "buy" : "sell";
    end
    rawStatus = safeStringN(order, ["finish_as", "status", "open"]);
    timestampStr = safeString(order, "create_time_ms");
    if functions.ccxtruthy(timestampStr == nothing)
        timestampStr = safeString2(order, "create_time", "ctime");
        if functions.ccxtruthy(timestampStr != nothing)
            if functions.ccxtruthy(@functions.ccxt_or(length(timestampStr) == 10, findfirst(".", timestampStr) !== nothing))
                timestampStr = stringMul(timestampStr, "1000");
            elseif functions.ccxtruthy(length(timestampStr) == 16)
                timestampStr = stringDiv(timestampStr, "1000");
            end
        end
    end
    lastTradeTimestampStr = safeString(order, "update_time_ms");
    if functions.ccxtruthy(lastTradeTimestampStr == nothing)
        lastTradeTimestampStr = safeString2(order, "update_time", "finish_time");
        if functions.ccxtruthy(lastTradeTimestampStr != nothing)
            if functions.ccxtruthy(@functions.ccxt_or(length(lastTradeTimestampStr) == 10, findfirst(".", lastTradeTimestampStr) !== nothing))
                lastTradeTimestampStr = stringMul(lastTradeTimestampStr, "1000");
            elseif functions.ccxtruthy(length(lastTradeTimestampStr) == 16)
                lastTradeTimestampStr = stringDiv(lastTradeTimestampStr, "1000");
            end
        end
    end
    marketType = "contract";
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("currency_pair", order)), (ccxt_in("market", order))))
        marketType = "spot";
    end
    exchangeSymbol = safeString2(order, "currency_pair", "market", contract);
    symbol = self.safeSymbol(exchangeSymbol, market, "_", marketType);
    fees = [];
    gtFee = safeString(order, "gt_fee");
    if functions.ccxtruthy(gtFee != nothing)
                push!(fees, Dict{Symbol, Any}(
    Symbol("currency") => "GT",
    Symbol("cost") => gtFee
));
    end
    fee = safeString(order, "fee");
    if functions.ccxtruthy(fee != nothing)
                push!(fees, Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(safeString(order, "fee_currency")),
    Symbol("cost") => fee
));
    end
    rebate = safeString(order, "rebated_fee");
    if functions.ccxtruthy(rebate != nothing)
                push!(fees, Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(safeString(order, "rebated_fee_currency")),
    Symbol("cost") => stringNeg(rebate)
));
    end
    numFeeCurrencies = length(fees);
    multipleFeeCurrencies = functions.ccxt_gt(numFeeCurrencies, 1);
    status = self.parseOrderStatus(rawStatus);
    remaining = stringAbs(remainingString);
    account = safeString(order, "account");
    if functions.ccxtruthy(@functions.ccxt_or((account == "spot"), (account == "unified")))
        averageString = safeString(order, "avg_deal_price");
        average = self.parseNumber(averageString);
        if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (side == "buy")))
            remaining = stringDiv(remainingString, averageString);
            price = nothing;
            cost = amount;
            amount = stringDiv(amount, averageString);
        end
    end
    timestamp = nothing;
    lastTradeTimestamp = nothing;
    if functions.ccxtruthy(timestampStr != nothing)
        timestamp = self.parseToInt(timestampStr);
    end
    if functions.ccxtruthy(lastTradeTimestampStr != nothing)
        lastTradeTimestamp = self.parseToInt(lastTradeTimestampStr);
    end
    initial = self.safeDict(order, "initial", Dict{Symbol, Any}());
    reduceOnlyInitial = self.safeBool(initial, "is_reduce_only");
    reduceOnly = self.safeBool(order, "is_reduce_only", reduceOnlyInitial);
    clientOrderId = safeString(order, "text");
    if functions.ccxtruthy(clientOrderId == nothing)
        if functions.ccxtruthy(ccxt_in("initial", order))
            clientOrderId = safeString(get(order, Symbol("initial"), nothing), "text");
        elseif functions.ccxtruthy(ccxt_in("trigger", order))
            clientOrderId = safeString(get(order, Symbol("trigger"), nothing), "text");
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "id"),
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("average") => average,
    Symbol("amount") => stringAbs(amount),
    Symbol("cost") => stringAbs(cost),
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("fee") => functions.ccxtruthy(multipleFeeCurrencies) ? nothing : safeValue(fees, 0),
    Symbol("fees") => functions.ccxtruthy(multipleFeeCurrencies) ? fees : [],
    Symbol("trades") => nothing,
    Symbol("info") => order
), market)

end
function fetchOrderRequest(self::Gate, id, symbol=nothing, params=Dict())
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    trigger = self.safeBoolN(params, ["trigger", "is_stop_order", "stop"], false);
    params = omit(params, ["is_stop_order", "stop", "trigger"]);
    clientOrderId = safeString2(params, "text", "clientOrderId");
    orderId = id;
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, ["text", "clientOrderId"]);
        if functions.ccxtruthy(get(clientOrderId, 1, nothing) != "t")
            clientOrderId = string("t-", clientOrderId);
        end
        orderId = clientOrderId;
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchOrder", market, params);
    contract = @functions.ccxt_or(@functions.ccxt_or((type_var == "swap"), (type_var == "future")), (type_var == "option"));
    (request, requestParams) = functions.ccxtruthy(contract) ? self.prepareRequest(market, type_var, query) : self.spotOrderPrepareRequest(market, trigger, query);
    request[Symbol("order_id")] =     string(orderId);
    return [request, requestParams]

end
function fetchOrder(self::Gate, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    result = self.handleMarketTypeAndParams("fetchOrder", market, params);
    type_var = safeString(result, 0);
    trigger = self.safeBoolN(params, ["trigger", "is_stop_order", "stop"], false);
    (request, requestParams) = self.fetchOrderRequest(id, symbol, params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateSpotGetPriceOrdersOrderId(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateSpotGetOrdersOrderId(extend(request, requestParams)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateFuturesGetSettlePriceOrdersOrderId(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateFuturesGetSettleOrdersOrderId(extend(request, requestParams)));
        end
    else
        if functions.ccxtruthy(type_var == "future")
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.privateDeliveryGetSettlePriceOrdersOrderId(extend(request, requestParams)));
            else
                response = Base.fetch(self.privateDeliveryGetSettleOrdersOrderId(extend(request, requestParams)));
            end
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsGetOrdersOrderId(extend(request, requestParams)));
        else
            throw(NotSupported(string(self.id, " fetchOrder() not support this market type")));
        end

    end
    return self.parseOrder(response, market)

end
function fetchOpenOrders(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("open", symbol, since, limit, params))

end
function fetchClosedOrders(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    until = safeInteger(params, "until");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    res = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    type_var = safeString(res, 0);
    useHistorical = false;
    (useHistorical, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "historical", false);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(useHistorical), (@functions.ccxt_or((@functions.ccxt_and(since == nothing, until == nothing)), (type_var != "swap")))))
            return Base.fetch(self.fetchOrdersByStatus("finished", symbol, since, limit, params))
    end
    params = omit(params, "type");
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, type_var, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("to")] = self.parseToInt(until / 1000);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateFuturesGetSettleOrdersTimerange(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function prepareOrdersByStatusRequest(self::Gate, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    trigger = nothing;
    (trigger, params) = self.handleParamBool2(params, "trigger", "stop");
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrdersByStatus", market, params);
    spot = @functions.ccxt_or((type_var == "spot"), (type_var == "margin"));
    request = Dict{Symbol, Any}();
    (request, params) = functions.ccxtruthy(spot) ? self.multiOrderSpotPrepareRequest(market, trigger, params) : self.prepareRequest(market, type_var, params);
    if functions.ccxtruthy(@functions.ccxt_and(spot, trigger))
        request = omit(request, "account");
    end
    if functions.ccxtruthy(status == "closed")
        status = "finished";
    end
    request[Symbol("status")] = status;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(spot)
        if functions.ccxtruthy(since != nothing)
            request[Symbol("from")] = self.parseToInt(since / 1000);
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            params = omit(params, "until");
            request[Symbol("to")] = self.parseToInt(until / 1000);
        end
    end
    (lastId, finalParams) = self.handleParamString2(params, "lastId", "last_id");
    if functions.ccxtruthy(lastId != nothing)
        request[Symbol("last_id")] = lastId;
    end
    return [request, finalParams]

end
function fetchOrdersByStatus(self::Gate, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    trigger = self.safeBool2(params, "trigger", "stop");
    res = self.handleMarketTypeAndParams("fetchOrdersByStatus", market, params);
    type_var = safeString(res, 0);
    (request, requestParams) = self.prepareOrdersByStatusRequest(status, symbol, since, limit, params);
    spot = @functions.ccxt_or((type_var == "spot"), (type_var == "margin"));
    openStatus = (status == "open");
    openSpotOrders = @functions.ccxt_and(@functions.ccxt_and(spot, openStatus), !functions.ccxtruthy(trigger));
    if functions.ccxtruthy(spot)
        if functions.ccxtruthy(!functions.ccxtruthy(trigger))
            if functions.ccxtruthy(openStatus)
                response = Base.fetch(self.privateSpotGetOpenOrders(extend(request, requestParams)));
            else
                response = Base.fetch(self.privateSpotGetOrders(extend(request, requestParams)));
            end
        else
            response = Base.fetch(self.privateSpotGetPriceOrders(extend(request, requestParams)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateFuturesGetSettlePriceOrders(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateFuturesGetSettleOrders(extend(request, requestParams)));
        end
    else
        if functions.ccxtruthy(type_var == "future")
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.privateDeliveryGetSettlePriceOrders(extend(request, requestParams)));
            else
                response = Base.fetch(self.privateDeliveryGetSettleOrders(extend(request, requestParams)));
            end
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsGetOrders(extend(request, requestParams)));
        else
            throw(NotSupported(string(self.id, " fetchOrders() not support this market type")));
        end

    end
    result = response;
    if functions.ccxtruthy(openSpotOrders)
        result = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            ordersInner = safeValue(get(response, i + 1, nothing), "orders");
            result = arrayConcat(result, ordersInner);
            i += 1
        end

    end
    orders = self.parseOrders(result, market, since, limit);
    return self.filterBySymbolSinceLimit(orders, symbol, since, limit)

end
function cancelOrder(self::Gate, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    trigger = self.safeBoolN(params, ["is_stop_order", "stop", "trigger"], false);
    params = omit(params, ["is_stop_order", "stop", "trigger"]);
    (type_var, query) = self.handleMarketTypeAndParams("cancelOrder", market, params);
    (request, requestParams) = functions.ccxtruthy((@functions.ccxt_or(type_var == "spot", type_var == "margin"))) ? self.spotOrderPrepareRequest(market, trigger, query) : self.prepareRequest(market, type_var, query);
    request[Symbol("order_id")] = id;
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateSpotDeletePriceOrdersOrderId(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateSpotDeleteOrdersOrderId(extend(request, requestParams)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateFuturesDeleteSettlePriceOrdersOrderId(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateFuturesDeleteSettleOrdersOrderId(extend(request, requestParams)));
        end
    else
        if functions.ccxtruthy(type_var == "future")
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.privateDeliveryDeleteSettlePriceOrdersOrderId(extend(request, requestParams)));
            else
                response = Base.fetch(self.privateDeliveryDeleteSettleOrdersOrderId(extend(request, requestParams)));
            end
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsDeleteOrdersOrderId(extend(request, requestParams)));
        else
            throw(NotSupported(string(self.id, " cancelOrder() not support this market type")));
        end

    end
    return self.parseOrder(response, market)

end
function cancelOrders(self::Gate, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    defaultSettle = functions.ccxtruthy((market == nothing)) ? "usdt" : get(market, Symbol("settle"), nothing);
    settle = safeStringLower(params, "settle", defaultSettle);
    (type_var, params) = self.handleMarketTypeAndParams("cancelOrders", market, params);
    isSpot = (type_var == "spot");
    if functions.ccxtruthy(@functions.ccxt_and(isSpot, (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " cancelOrders requires a symbol argument for spot markets")));
    end
    if functions.ccxtruthy(isSpot)
        ordersRequests = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            id = get(ids, i + 1, nothing);
            orderItem = Dict{Symbol, Any}(
                Symbol("id") => id,
                Symbol("symbol") => symbol
            );
            push!(ordersRequests, orderItem);
            i += 1
        end

            return Base.fetch(self.cancelOrdersForSymbols(ordersRequests, params))
    end
    request = Dict{Symbol, Any}(
        Symbol("settle") => settle
    );
    finalList = [request];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(finalList, get(ids, i + 1, nothing));
        i += 1
    end
    response = Base.fetch(self.privateFuturesPostSettleBatchCancelOrders(finalList));
    return self.parseOrders(response)

end
function cancelOrdersForSymbols(self::Gate, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        symbol = safeString(order, "symbol");
        market = self.market(symbol);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            throw(NotSupported(string(self.id, " cancelOrdersForSymbols() supports only spot markets")));
        end
        id = safeString(order, "id");
        orderItem = Dict{Symbol, Any}(
            Symbol("id") => id,
            Symbol("currency_pair") => get(market, Symbol("id"), nothing)
        );
        push!(ordersRequests, orderItem);
        i += 1
    end
    response = Base.fetch(self.privateSpotPostCancelBatchOrders(ordersRequests));
    return self.parseOrders(response)

end
function cancelAllOrders(self::Gate, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    (type_var, query) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    (request, requestParams) = functions.ccxtruthy((type_var == "spot")) ? self.multiOrderSpotPrepareRequest(market, trigger, query) : self.prepareRequest(market, type_var, query);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateSpotDeletePriceOrders(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateSpotDeleteOrders(extend(request, requestParams)));
        end
    elseif functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateFuturesDeleteSettlePriceOrders(extend(request, requestParams)));
        else
            response = Base.fetch(self.privateFuturesDeleteSettleOrders(extend(request, requestParams)));
        end
    else
        if functions.ccxtruthy(type_var == "future")
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.privateDeliveryDeleteSettlePriceOrders(extend(request, requestParams)));
            else
                response = Base.fetch(self.privateDeliveryDeleteSettleOrders(extend(request, requestParams)));
            end
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsDeleteOrders(extend(request, requestParams)));
        else
            throw(NotSupported(string(self.id, " cancelAllOrders() not support this market type")));
        end

    end
    return self.parseOrders(response, market)

end
function transfer(self::Gate, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    fromId = self.convertTypeToAccount(fromAccount);
    toId = self.convertTypeToAccount(toAccount);
    truncated = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => truncated
    );
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(fromId, get(self.options, Symbol("accountsByType"), nothing)))))
        request[Symbol("from")] = "margin";
        request[Symbol("currency_pair")] = fromId;
    else
        request[Symbol("from")] = fromId;
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(toId, get(self.options, Symbol("accountsByType"), nothing)))))
        request[Symbol("to")] = "margin";
        request[Symbol("currency_pair")] = toId;
    else
        request[Symbol("to")] = toId;
    end
    if functions.ccxtruthy(@functions.ccxt_or(fromId == "margin", toId == "margin"))
        symbol = safeString2(params, "symbol", "currency_pair");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " transfer requires params[\"symbol\"] for isolated margin transfers")));
        end
        market = self.market(symbol);
        request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
        params = omit(params, "symbol");
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((toId == "futures"), (toId == "delivery")), (fromId == "futures")), (fromId == "delivery")))
        request[Symbol("settle")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateWalletPostTransfers(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Gate, transfer, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "tx_id"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing,
    Symbol("info") => transfer
)

end
function setLeverage(self::Gate, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 0)), (functions.ccxt_gt(leverage, 100))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 100")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (request, query) = self.prepareRequest(market, nothing, params);
    defaultMarginMode = safeString2(self.options, "marginMode", "defaultMarginMode");
    crossLeverageLimit = safeString(query, "cross_leverage_limit");
    marginMode = safeString(query, "marginMode", defaultMarginMode);
    stringifiedMargin = numberToString(leverage);
    if functions.ccxtruthy(crossLeverageLimit != nothing)
        marginMode = "cross";
        stringifiedMargin = crossLeverageLimit;
    end
    if functions.ccxtruthy(@functions.ccxt_or(marginMode == "cross", marginMode == "cross_margin"))
        request[Symbol("cross_leverage_limit")] = stringifiedMargin;
        request[Symbol("leverage")] = "0";
    else
        request[Symbol("leverage")] = stringifiedMargin;
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateFuturesPostSettlePositionsContractLeverage(extend(request, query)));
    elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
        response = Base.fetch(self.privateDeliveryPostSettlePositionsContractLeverage(extend(request, query)));
    else
        throw(NotSupported(string(self.id, " setLeverage() not support this market type")));
    end
    return response

end
function parsePosition(self::Gate, position, market=nothing)
    contract = safeString(position, "contract");
    market = self.safeMarket(contract, market, "_", "contract");
    size_var = safeString2(position, "size", "accum_size");
    side = safeString(position, "side");
    if functions.ccxtruthy(side == nothing)
        if functions.ccxtruthy(stringGt(size_var, "0"))
            side = "long";
        elseif functions.ccxtruthy(stringLt(size_var, "0"))
            side = "short";
        end
    end
    notional = safeString(position, "value");
    leverage = safeString(position, "leverage");
    marginMode = nothing;
    if functions.ccxtruthy(leverage != nothing)
        if functions.ccxtruthy(leverage == "0")
            marginMode = "cross";
        else
            marginMode = "isolated";
        end
    end
    marginBalance = safeString(position, "margin");
    initialMarginString = omitZero(safeString(position, "initial_margin"));
    maintenanceMarginString = omitZero(safeString(position, "maintenance_margin"));
    unrealisedPnl = safeString(position, "unrealised_pnl");
    collateral = marginBalance;
    if functions.ccxtruthy(@functions.ccxt_and((marginBalance != nothing), (unrealisedPnl != nothing)))
        collateral = stringAdd(marginBalance, unrealisedPnl);
    end
    timestamp = safeTimestamp2(position, "open_time", "first_open_time");
    if functions.ccxtruthy(timestamp == 0)
        timestamp = nothing;
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeTimestamp2(position, "update_time", "time"),
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(stringDiv(initialMarginString, notional)),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMarginString),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(stringDiv(maintenanceMarginString, notional)),
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("realizedPnl") => self.safeNumber2(position, "realised_pnl", "pnl"),
    Symbol("contracts") => self.parseNumber(stringAbs(size_var)),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liq_price"),
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("lastPrice") => nothing,
    Symbol("collateral") => self.parseNumber(collateral),
    Symbol("marginMode") => marginMode,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchPosition(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchPosition() supports contract markets only")));
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, get(market, Symbol("type"), nothing), params);
    extendedRequest = extend(request, params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateFuturesGetSettlePositionsContract(extendedRequest));
    elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
        response = Base.fetch(self.privateDeliveryGetSettlePositionsContract(extendedRequest));
    else
        if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "option")
            response = Base.fetch(self.privateOptionsGetPositionsContract(extendedRequest));
        end

    end
    return self.parsePosition(response, market)

end
function fetchPositions(self::Gate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            market = self.market(get(symbols, 1, nothing));
        end
    end
    type_var = nothing;
    request = Dict{Symbol, Any}();
    (type_var, params) = self.handleMarketTypeAndParams("fetchPositions", market, params);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == nothing), (type_var == "spot")))
        type_var = "swap";
    end
    if functions.ccxtruthy(type_var == "option")
        if functions.ccxtruthy(symbols != nothing)
            marketId = safeString(market, "id");
            optionParts = split(marketId, "-");
            request[Symbol("underlying")] = safeString(optionParts, 0);
        end
    else
        (request, params) = self.prepareRequest(nothing, type_var, params);
    end
    response = nothing;
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.privateFuturesGetSettlePositions(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "future")
        response = Base.fetch(self.privateDeliveryGetSettlePositions(extend(request, params)));
    else
        if functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.privateOptionsGetPositions(extend(request, params)));
        end

    end
    return self.parsePositions(response, symbols)

end
function fetchLeverageTiers(self::Gate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchLeverageTiers", nothing, params);
    (request, requestParams) = self.prepareRequest(nothing, type_var, query);
    if functions.ccxtruthy(@functions.ccxt_and(type_var != "future", type_var != "swap"))
        throw(BadRequest(string(self.id, " fetchLeverageTiers only supports swap and future")));
    end
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.publicFuturesGetSettleContracts(extend(request, requestParams)));
    elseif functions.ccxtruthy(type_var == "future")
        response = Base.fetch(self.publicDeliveryGetSettleContracts(extend(request, requestParams)));
    else
        throw(NotSupported(string(self.id, " fetchLeverageTiers() not support this market type")));
    end
    return self.parseLeverageTiers(response, symbols, "name")

end
function fetchMarketLeverageTiers(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (type_var, query) = self.handleMarketTypeAndParams("fetchMarketLeverageTiers", market, params);
    (request, requestParams) = self.prepareRequest(market, type_var, query);
    if functions.ccxtruthy(@functions.ccxt_and(type_var != "future", type_var != "swap"))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers only supports swap and future")));
    end
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.publicFuturesGetSettleRiskLimitTiers(extend(request, requestParams)));
    else
        response = Base.fetch(self.publicDeliveryGetSettleRiskLimitTiers(extend(request, requestParams)));
    end
    return self.parseMarketLeverageTiers(response, market)

end
function parseEmulatedLeverageTiers(self::Gate, info, market=nothing)
    marketId = safeString(info, "name");
    maintenanceMarginUnit = safeString(info, "maintenance_rate");
    leverageMax = safeString(info, "leverage_max");
    riskLimitStep = safeString(info, "risk_limit_step");
    riskLimitMax = safeString(info, "risk_limit_max");
    initialMarginUnit = stringDiv("1", leverageMax);
    maintenanceMarginRate = maintenanceMarginUnit;
    initialMarginRatio = initialMarginUnit;
    floor_var = "0";
    tiers = [];
    while functions.ccxtruthy(stringLt(floor_var, riskLimitMax))
        cap = stringAdd(floor_var, riskLimitStep);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.parseNumber(stringDiv(cap, riskLimitStep)),
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("currency") => safeString(market, "settle"),
    Symbol("minNotional") => self.parseNumber(floor_var),
    Symbol("maxNotional") => self.parseNumber(cap),
    Symbol("maintenanceMarginRate") => self.parseNumber(maintenanceMarginRate),
    Symbol("maxLeverage") => self.parseNumber(stringDiv("1", initialMarginRatio)),
    Symbol("info") => info
));
        maintenanceMarginRate = stringAdd(maintenanceMarginRate, maintenanceMarginUnit);
        initialMarginRatio = stringAdd(initialMarginRatio, initialMarginUnit);
        floor_var = cap;
    end
    return tiers

end
function parseMarketLeverageTiers(self::Gate, info, market=nothing)
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(info)))
            return self.parseEmulatedLeverageTiers(info, market)
    end
    minNotional = 0;
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        item = get(info, i + 1, nothing);
        maxNotional = self.safeNumber(item, "risk_limit");
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("currency") => safeString(market, "base"),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => maxNotional,
    Symbol("maintenanceMarginRate") => self.safeNumber(item, "maintenance_rate"),
    Symbol("maxLeverage") => self.safeNumber(item, "leverage_max"),
    Symbol("info") => item
));
        minNotional = maxNotional;
        i += 1
    end
    return tiers

end
function repayIsolatedMargin(self::Gate, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => uppercase(get(currency, Symbol("id"), nothing)),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    market = self.market(symbol);
    request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    request[Symbol("type")] = "repay";
    response = Base.fetch(self.privateMarginPostUniLoans(extend(request, params)));
    return self.parseMarginLoan(response, currency)

end
function repayCrossMargin(self::Gate, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => uppercase(get(currency, Symbol("id"), nothing)),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "repayCrossMargin", "unifiedAccount");
    if functions.ccxtruthy(isUnifiedAccount)
        request[Symbol("type")] = "repay";
        response = Base.fetch(self.privateUnifiedPostLoans(extend(request, params)));
    else
        response = Base.fetch(self.privateMarginPostCrossRepayments(extend(request, params)));
        response = self.safeDict(response, 0);
    end
    return self.parseMarginLoan(response, currency)

end
function borrowIsolatedMargin(self::Gate, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => uppercase(get(currency, Symbol("id"), nothing)),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    market = self.market(symbol);
    request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
    request[Symbol("type")] = "borrow";
    response = Base.fetch(self.privateMarginPostUniLoans(extend(request, params)));
    return self.parseMarginLoan(response, currency)

end
function borrowCrossMargin(self::Gate, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => uppercase(get(currency, Symbol("id"), nothing)),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "borrowCrossMargin", "unifiedAccount");
    if functions.ccxtruthy(isUnifiedAccount)
        request[Symbol("type")] = "borrow";
        response = Base.fetch(self.privateUnifiedPostLoans(extend(request, params)));
    else
        response = Base.fetch(self.privateMarginPostCrossLoans(extend(request, params)));
    end
    return self.parseMarginLoan(response, currency)

end
function parseMarginLoan(self::Gate, info, currency=nothing)
    marginMode = safeString2(self.options, "defaultMarginMode", "marginMode", "cross");
    timestamp = safeInteger(info, "create_time");
    if functions.ccxtruthy(marginMode == "isolated")
        timestamp = safeTimestamp(info, "create_time");
    end
    currencyId = safeString(info, "currency");
    marketId = safeString(info, "currency_pair");
    return Dict{Symbol, Any}(
    Symbol("id") => safeInteger(info, "id"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(info, "amount"),
    Symbol("symbol") => self.safeSymbol(marketId, nothing, "_", "margin"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function fetchBorrowInterest(self::Gate, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadUnifiedStatus());
    isUnifiedAccount = false;
    (isUnifiedAccount, params) = self.handleOptionAndParams(params, "fetchBorrowInterest", "unifiedAccount");
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("to", request, params);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBorrowInterest", params, "cross");
    if functions.ccxtruthy(isUnifiedAccount)
        response = Base.fetch(self.privateUnifiedGetInterestRecords(extend(request, params)));
    elseif functions.ccxtruthy(marginMode == "isolated")
        if functions.ccxtruthy(market != nothing)
            request[Symbol("currency_pair")] = get(market, Symbol("id"), nothing);
        end
        response = Base.fetch(self.privateMarginGetUniInterestRecords(extend(request, params)));
    else
        if functions.ccxtruthy(marginMode == "cross")
            response = Base.fetch(self.privateMarginGetCrossInterestRecords(extend(request, params)));
        end

    end
    interest = self.parseBorrowInterests(response, market);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Gate, info, market=nothing)
    marketId = safeString(info, "currency_pair");
    market = self.safeMarket(marketId, market);
    marginMode = functions.ccxtruthy((marketId != nothing)) ? "isolated" : "cross";
    timestamp = safeInteger(info, "create_time");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "currency")),
    Symbol("interest") => self.safeNumber(info, "interest"),
    Symbol("interestRate") => self.safeNumber(info, "actual_rate"),
    Symbol("amountBorrowed") => nothing,
    Symbol("marginMode") => marginMode,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function nonce(self::Gate, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Gate, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    authentication = get(api, 1, nothing);
    type_var = get(api, 2, nothing);
    query = omit(params, self.extractParams(path));
    containsSettle = findfirst("settle", path) !== nothing;
    if functions.ccxtruthy(@functions.ccxt_and(containsSettle, endswith(path, "batch_cancel_orders")))
        settle = self.safeDict(params, 0);
        path = self.implodeParams(path, settle);
        newParams = [];
        anyParams = params;
        i = 1
        while functions.ccxtruthy(functions.ccxt_lt(i, length(anyParams)))
            push!(newParams, get(params, i + 1, nothing));
            i += 1
        end

        params = newParams;
        query = newParams;
    elseif functions.ccxtruthy(functions.ccxt_isArray(params))
        first_var = safeValue(params, 0, Dict{Symbol, Any}());
        path = self.implodeParams(path, first_var);
    else
        path = self.implodeParams(path, params);
    end
    endPart = functions.ccxtruthy((path == "")) ? "" : (string("/", path));
    entirePath = string("/", type_var, endPart);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "subAccounts"), (type_var == "withdrawals")))
        entirePath = endPart;
    end
    url = get(get(get(self.urls, Symbol("api"), nothing), Symbol(authentication), nothing), Symbol(type_var), nothing);
    if functions.ccxtruthy(url == nothing)
        throw(NotSupported(string(self.id, " does not have a testnet for the ", type_var, " market type.")));
    end
    url += entirePath;
    if functions.ccxtruthy(authentication == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        queryString = "";
        rawQueryString = "";
        requiresURLEncoding = false;
        if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((type_var == "futures"), (type_var == "delivery"))), method == "POST"))
            pathParts = split(path, "/");
            secondPart = safeString(pathParts, 1, "");
            requiresURLEncoding = @functions.ccxt_or((findfirst("dual", secondPart) !== nothing),             (findfirst("positions", secondPart) !== nothing));
        end
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((method == "GET"), (method == "DELETE")), requiresURLEncoding), (method == "PATCH")))
            if functions.ccxtruthy(length(objectKeys(query)))
                rawQueryString = self.rawencode(query);
                queryString = self.urlencode(query);
                if functions.ccxtruthy(@functions.ccxt_and(findfirst("currencies=", queryString) !== nothing, findfirst("%2C", queryString) !== nothing))
                    queryString = replace(queryString, "%2C" => ",");
                end
                url += string("?", queryString);
            end
            if functions.ccxtruthy(method == "PATCH")
                body = json(query);
            end
        else
            urlQueryParams = safeValue(query, "query", Dict{Symbol, Any}());
            if functions.ccxtruthy(length(objectKeys(urlQueryParams)))
                queryString = self.urlencode(urlQueryParams);
                url += string("?", queryString);
            end
            query = omit(query, "query");
            body = json(query);
        end
        bodyPayload = functions.ccxtruthy((body == nothing)) ? "" : body;
        bodySignature = hash(self.encode(bodyPayload), sha512);
        nonce = self.nonce();
        timestamp = self.parseToInt(nonce / 1000);
        timestampString = string(timestamp);
        signaturePath = string("/api/", self.version, entirePath);
        payloadArray = [uppercase(method), signaturePath, rawQueryString, bodySignature, timestampString];
        payload = join(payloadArray, "\n");
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha512);
        headers = Dict{Symbol, Any}(
            Symbol("KEY") => self.apiKey,
            Symbol("Timestamp") => timestampString,
            Symbol("SIGN") => signature,
            Symbol("Content-Type") => "application/json"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function modifyMarginHelper(self::Gate, symbol, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (request, query) = self.prepareRequest(market, nothing, params);
    request[Symbol("change")] = numberToString(amount);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateFuturesPostSettlePositionsContractMargin(extend(request, query)));
    elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
        response = Base.fetch(self.privateDeliveryPostSettlePositionsContractMargin(extend(request, query)));
    else
        throw(NotSupported(string(self.id, " modifyMarginHelper() not support this market type")));
    end
    return self.parseMarginModification(response, market)

end
function parseMarginModification(self::Gate, data, market=nothing)
    contract = safeString(data, "contract");
    market = self.safeMarket(contract, market, "_", "contract");
    total = self.safeNumber(data, "margin");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => total,
    Symbol("code") => safeValue(market, "quote"),
    Symbol("status") => "ok",
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function reduceMargin(self::Gate, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, -amount, params))

end
function addMargin(self::Gate, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, params))

end
function fetchOpenInterestHistory(self::Gate, symbol, timeframe="5m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenInterestHistory", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOpenInterestHistory", symbol, since, limit, timeframe, params, 100))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("contract") => get(market, Symbol("id"), nothing),
        Symbol("settle") => get(market, Symbol("settleId"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    response = Base.fetch(self.publicFuturesGetSettleContractStats(extend(request, params)));
    return self.parseOpenInterestsHistory(response, market, since, limit)

end
function parseOpenInterest(self::Gate, interest, market=nothing)
    timestamp = safeTimestamp(interest, "time");
    return Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => self.safeNumber(interest, "open_interest"),
    Symbol("openInterestValue") => self.safeNumber(interest, "open_interest_usd"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
)

end
function fetchSettlementHistory(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchSettlementHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchSettlementHistory", market, params);
    if functions.ccxtruthy(type_var != "option")
        throw(NotSupported(string(self.id, " fetchSettlementHistory() supports option markets only")));
    end
    marketId = get(market, Symbol("id"), nothing);
    optionParts = split(marketId, "-");
    request = Dict{Symbol, Any}(
        Symbol("underlying") => safeString(optionParts, 0)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicOptionsGetSettlements(extend(request, params)));
    settlements = self.parseSettlements(response, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function fetchMySettlementHistory(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMySettlementHistory", market, params);
    isOption = type_var == "option";
    isFuture = type_var == "future";
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isOption), !functions.ccxtruthy(isFuture)))
        throw(NotSupported(string(self.id, " fetchMySettlementHistory() supports option and future markets only")));
    end
    (request, query) = self.prepareRequest(market, type_var, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(isFuture)
        response = Base.fetch(self.privateDeliveryGetSettleSettlements(extend(request, query)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("from")] = since;
        end
        if functions.ccxtruthy(market == nothing)
            underlying = safeString(params, "underlying");
            if functions.ccxtruthy(underlying == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchMySettlementHistory() requires a symbol argument or an underlying parameter in params")));
            end
        else
            marketId = get(market, Symbol("id"), nothing);
            optionParts = split(marketId, "-");
            request[Symbol("underlying")] = safeString(optionParts, 0);
        end
        response = Base.fetch(self.privateOptionsGetMySettlements(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    data = safeValue(result, "list", []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function parseSettlement(self::Gate, settlement, market)
    timestamp = safeTimestamp(settlement, "time");
    marketId = safeString(settlement, "contract");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("price") => self.safeNumber(settlement, "settle_price"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseSettlements(self::Gate, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        i += 1
    end
    return result

end
function fetchLedger(self::Gate, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", code, since, limit, params))
    end
    type_var = nothing;
    currency = nothing;
    response = nothing;
    request = Dict{Symbol, Any}();
    (type_var, params) = self.handleMarketTypeAndParams("fetchLedger", nothing, params);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "spot"), (type_var == "margin")))
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "swap"), (type_var == "future")))
        defaultSettle = functions.ccxtruthy((type_var == "swap")) ? "usdt" : "btc";
        settle = safeStringLower(params, "settle", defaultSettle);
        params = omit(params, "settle");
        request[Symbol("settle")] = settle;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("to", request, params);
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.privateSpotGetAccountBook(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "margin")
        response = Base.fetch(self.privateMarginGetAccountBook(extend(request, params)));
    else
        if functions.ccxtruthy(type_var == "swap")
            response = Base.fetch(self.privateFuturesGetSettleAccountBook(extend(request, params)));
        elseif functions.ccxtruthy(type_var == "future")
            response = Base.fetch(self.privateDeliveryGetSettleAccountBook(extend(request, params)));
        else
            if functions.ccxtruthy(type_var == "option")
                response = Base.fetch(self.privateOptionsGetAccountBook(extend(request, params)));
            end

        end

    end
    return self.parseLedger(response, currency, since, limit)

end
function parseLedgerEntry(self::Gate, item, currency=nothing)
    direction = nothing;
    amount = safeString(item, "change");
    if functions.ccxtruthy(stringLt(amount, "0"))
        direction = "out";
        amount = stringAbs(amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "currency");
    currency = self.safeCurrency(currencyId, currency);
    type_var = safeString(item, "type");
    rawTimestamp = safeString(item, "time");
    timestamp = nothing;
    if functions.ccxtruthy(functions.ccxt_gt(length(rawTimestamp), 10))
        timestamp = ccxt_parseInt(rawTimestamp);
    else
        timestamp = ccxt_parseInt(rawTimestamp) * 1000;
    end
    balanceString = safeString(item, "balance");
    changeString = safeString(item, "change");
    before = self.parseNumber(stringSub(balanceString, changeString));
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => before,
    Symbol("after") => self.safeNumber(item, "balance"),
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerEntryType(self::Gate, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("sub_account_transfer") => "transfer",
        Symbol("margin_in") => "transfer",
        Symbol("margin_out") => "transfer",
        Symbol("margin_funding_in") => "transfer",
        Symbol("margin_funding_out") => "transfer",
        Symbol("cross_margin_in") => "transfer",
        Symbol("cross_margin_out") => "transfer",
        Symbol("copy_trading_in") => "transfer",
        Symbol("copy_trading_out") => "transfer",
        Symbol("quant_in") => "transfer",
        Symbol("quant_out") => "transfer",
        Symbol("futures_in") => "transfer",
        Symbol("futures_out") => "transfer",
        Symbol("delivery_in") => "transfer",
        Symbol("delivery_out") => "transfer",
        Symbol("new_order") => "trade",
        Symbol("order_fill") => "trade",
        Symbol("referral_fee") => "rebate",
        Symbol("order_fee") => "fee",
        Symbol("interest") => "interest",
        Symbol("lend") => "loan",
        Symbol("redeem") => "loan",
        Symbol("profit") => "interest",
        Symbol("flash_swap_buy") => "trade",
        Symbol("flash_swap_sell") => "trade",
        Symbol("unknown") => "unknown",
        Symbol("set") => "settlement",
        Symbol("prem") => "trade",
        Symbol("point_refr") => "rebate",
        Symbol("point_fee") => "fee",
        Symbol("point_dnw") => "deposit/withdraw",
        Symbol("fund") => "fee",
        Symbol("refr") => "rebate",
        Symbol("fee") => "fee",
        Symbol("pnl") => "trade",
        Symbol("dnw") => "deposit/withdraw"
    );
    return safeString(ledgerType, type_var, type_var)

end
function setPositionMode(self::Gate, hedged, symbol=nothing, params=Dict())
    market = functions.ccxtruthy((symbol != nothing)) ? self.market(symbol) : nothing;
    (request, query) = self.prepareRequest(market, "swap", params);
    request[Symbol("dual_mode")] = hedged;
    return Base.fetch(self.privateFuturesPostSettleDualMode(extend(request, query)))

end
function fetchUnderlyingAssets(self::Gate, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchUnderlyingAssets", nothing, params);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == nothing), (marketType == "spot")))
        marketType = "option";
    end
    if functions.ccxtruthy(marketType != "option")
        throw(NotSupported(string(self.id, " fetchUnderlyingAssets() supports option markets only")));
    end
    response = Base.fetch(self.publicOptionsGetUnderlyings(params));
    underlyings = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        underlying = get(response, i + 1, nothing);
        name = safeString(underlying, "name");
        if functions.ccxtruthy(name != nothing)
                        push!(underlyings, name);
        end
        i += 1
    end
    return underlyings

end
function fetchLiquidations(self::Gate, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " fetchLiquidations() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("settle") => get(market, Symbol("settleId"), nothing),
        Symbol("contract") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("to", request, params);
    response = Base.fetch(self.publicFuturesGetSettleLiqOrders(extend(request, params)));
    return self.parseLiquidations(response, market, since, limit)

end
function fetchMyLiquidations(self::Gate, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyLiquidations() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("contract") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_or((get(market, Symbol("swap"), nothing)), (get(market, Symbol("future"), nothing))))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        request[Symbol("settle")] = get(market, Symbol("settleId"), nothing);
    elseif functions.ccxtruthy(get(market, Symbol("option"), nothing))
        marketId = get(market, Symbol("id"), nothing);
        optionParts = split(marketId, "-");
        request[Symbol("underlying")] = safeString(optionParts, 0);
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateFuturesGetSettleLiquidates(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
        response = Base.fetch(self.privateDeliveryGetSettleLiquidates(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            response = Base.fetch(self.privateOptionsGetPositionClose(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchMyLiquidations() does not support ", get(market, Symbol("type"), nothing), " orders")));
        end

    end
    return self.parseLiquidations(response, market, since, limit)

end
function parseLiquidation(self::Gate, liquidation, market=nothing)
    marketId = safeString(liquidation, "contract");
    timestamp = safeTimestamp(liquidation, "time");
    size_var = safeString2(liquidation, "size", "settle_size");
    left = safeString(liquidation, "left", "0");
    contractsString = stringAbs(stringSub(size_var, left));
    contractSizeString = safeString(market, "contractSize");
    priceString = safeString2(liquidation, "liq_price", "fill_price");
    baseValueString = stringMul(contractsString, contractSizeString);
    quoteValueString = safeString(liquidation, "pnl");
    if functions.ccxtruthy(quoteValueString == nothing)
        quoteValueString = stringMul(baseValueString, priceString);
    end
    optPos = safeStringLower(liquidation, "side");
    side = nothing;
    if functions.ccxtruthy(optPos == "long")
        side = "buy";
    elseif functions.ccxtruthy(optPos == "short")
        side = "sell";
    else
        if functions.ccxtruthy(size_var != nothing)
            if functions.ccxtruthy(stringGt(size_var, "0"))
                side = "buy";
            elseif functions.ccxtruthy(stringLt(size_var, "0"))
                side = "sell";
            end
        end
    end
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("contracts") => self.parseNumber(contractsString),
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("price") => self.parseNumber(priceString),
    Symbol("side") => side,
    Symbol("baseValue") => self.parseNumber(baseValueString),
    Symbol("quoteValue") => self.parseNumber(stringAbs(quoteValueString)),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function fetchGreeks(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("underlying") => get(get(market, Symbol("info"), nothing), Symbol("underlying"), nothing)
    );
    response = Base.fetch(self.publicOptionsGetTickers(extend(request, params)));
    marketId = get(market, Symbol("id"), nothing);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        entryMarketId = safeString(entry, "name");
        if functions.ccxtruthy(entryMarketId == marketId)
                return self.parseGreeks(entry, market)
        end
        i += 1
    end
    return nothing

end
function parseGreeks(self::Gate, greeks, market=nothing)
    marketId = safeString(greeks, "name");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("delta") => self.parseNumber(self.safeNumber(greeks, "delta")),
    Symbol("gamma") => self.parseNumber(self.safeNumber(greeks, "gamma")),
    Symbol("theta") => self.parseNumber(self.safeNumber(greeks, "theta")),
    Symbol("vega") => self.parseNumber(self.safeNumber(greeks, "vega")),
    Symbol("rho") => nothing,
    Symbol("bidSize") => self.parseNumber(self.safeNumber(greeks, "bid1_size")),
    Symbol("askSize") => self.parseNumber(self.safeNumber(greeks, "ask1_size")),
    Symbol("bidImpliedVolatility") => self.parseNumber(self.safeNumber(greeks, "bid_iv")),
    Symbol("askImpliedVolatility") => self.parseNumber(self.safeNumber(greeks, "ask_iv")),
    Symbol("markImpliedVolatility") => self.parseNumber(self.safeNumber(greeks, "mark_iv")),
    Symbol("bidPrice") => self.parseNumber(self.safeNumber(greeks, "bid1_price")),
    Symbol("askPrice") => self.parseNumber(self.safeNumber(greeks, "ask1_price")),
    Symbol("markPrice") => self.parseNumber(self.safeNumber(greeks, "mark_price")),
    Symbol("lastPrice") => self.parseNumber(self.safeNumber(greeks, "last_price")),
    Symbol("underlyingPrice") => self.parseNumber(get(get(market, Symbol("info"), nothing), Symbol("underlying_price"), nothing)),
    Symbol("info") => greeks
)

end
function closePosition(self::Gate, symbol, side=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("close") => true
    );
    params = extend(request, params);
    if functions.ccxtruthy(side == nothing)
        side = "";
    end
    return Base.fetch(self.createOrder(symbol, "market", side, 0, nothing, params))

end
function fetchLeverage(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    isUnified = self.safeBool(params, "unified");
    params = omit(params, "unified");
    if functions.ccxtruthy(self.safeBool(market, "spot"))
        request[Symbol("currency_pair")] = safeString(market, "id");
        if functions.ccxtruthy(isUnified)
            response = Base.fetch(self.publicMarginGetUniCurrencyPairsCurrencyPair(extend(request, params)));
        else
            response = Base.fetch(self.publicMarginGetCurrencyPairsCurrencyPair(extend(request, params)));
        end
    elseif functions.ccxtruthy(isUnified)
        response = Base.fetch(self.privateUnifiedGetAccounts(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchLeverage() does not support ", safeString(market, "type"), " markets")));
    end
    return self.parseLeverage(response, market)

end
function fetchLeverages(self::Gate, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    isUnified = self.safeBool(params, "unified");
    params = omit(params, "unified");
    marketIdRequest = "id";
    if functions.ccxtruthy(isUnified)
        marketIdRequest = "currency_pair";
        response = Base.fetch(self.publicMarginGetUniCurrencyPairs(params));
    else
        response = Base.fetch(self.publicMarginGetCurrencyPairs(params));
    end
    return self.parseLeverages(response, symbols, marketIdRequest, "spot")

end
function parseLeverage(self::Gate, leverage, market=nothing)
    marketId = safeString2(leverage, "currency_pair", "id");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market, "_", "spot"),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function fetchOption(self::Gate, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("contract") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicOptionsGetContractsContract(extend(request, params)));
    return self.parseOption(response, nothing, market)

end
function fetchOptionChain(self::Gate, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("underlying") => string(get(currency, Symbol("code"), nothing), "_USDT")
    );
    response = Base.fetch(self.publicOptionsGetContracts(extend(request, params)));
    return self.parseOptionChain(response, nothing, "name")

end
function parseOption(self::Gate, chain, currency=nothing, market=nothing)
    marketId = safeString(chain, "name");
    market = self.safeMarket(marketId, market);
    timestamp = safeTimestamp(chain, "create_time");
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("impliedVolatility") => nothing,
    Symbol("openInterest") => nothing,
    Symbol("bidPrice") => self.parseNumber(self.safeNumber(chain, "bid1_price")),
    Symbol("askPrice") => self.parseNumber(self.safeNumber(chain, "ask1_price")),
    Symbol("midPrice") => nothing,
    Symbol("markPrice") => self.parseNumber(self.safeNumber(chain, "mark_price")),
    Symbol("lastPrice") => self.parseNumber(self.safeNumber(chain, "last_price")),
    Symbol("underlyingPrice") => self.parseNumber(self.safeNumber(chain, "underlying_price")),
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => nothing
)

end
function fetchPositionsHistory(self::Gate, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
        end
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositionsHistory", market, params, "swap");
    until = safeInteger(params, "until");
    params = omit(params, "until");
    request = Dict{Symbol, Any}();
    (request, params) = self.prepareRequest(market, marketType, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("to")] = self.parseToInt(until / 1000);
    end
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateFuturesGetSettlePositionClose(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "future")
        response = Base.fetch(self.privateDeliveryGetSettlePositionClose(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchPositionsHistory() does not support markets of type ", marketType)));
    end
    return self.parsePositions(response, symbols, params)

end
function handleErrors(self::Gate, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    label = safeString(response, "label");
    if functions.ccxtruthy(label != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), label, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Gate, name::Symbol) = ccxt_getproperty(self, name)

function Gate(; kwargs...)
    inst = Gate(Exchange(), describe, setSandboxMode, loadUnifiedStatus, upgradeUnifiedTradeAccount, fetchTime, createExpiredOptionMarket, safeMarket, fetchMarkets, fetchSpotMarkets, fetchSwapMarkets, fetchFutureMarkets, parseContractMarket, fetchOptionMarkets, fetchOptionUnderlyings, prepareRequest, spotOrderPrepareRequest, multiOrderSpotPrepareRequest, getMarginMode, getSettlementCurrencies, fetchCurrencies, parseCurrency, fetchFundingRate, fetchFundingRates, parseFundingRate, parseFundingInterval, fetchNetworkDepositAddress, fetchDepositAddressesByNetwork, fetchDepositAddress, parseDepositAddress, fetchTradingFee, fetchTradingFees, parseTradingFees, parseTradingFee, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchFundingHistory, parseFundingHistories, parseFundingHistory, fetchOrderBook, fetchTicker, parseTicker, fetchTickers, parseBalanceHelper, fetchBalance, fetchOHLCV, fetchOptionOHLCV, fetchFundingRateHistory, parseOHLCV, fetchTrades, fetchOrderTrades, fetchMyTrades, parseTrade, fetchDeposits, fetchWithdrawals, withdraw, parseTransactionStatus, parseTransactionType, parseTransaction, createOrder, createOrdersRequest, createOrders, createOrderRequest, createMarketBuyOrderWithCost, editOrderRequest, editOrder, parseOrderStatus, parseOrder, fetchOrderRequest, fetchOrder, fetchOpenOrders, fetchClosedOrders, prepareOrdersByStatusRequest, fetchOrdersByStatus, cancelOrder, cancelOrders, cancelOrdersForSymbols, cancelAllOrders, transfer, parseTransfer, setLeverage, parsePosition, fetchPosition, fetchPositions, fetchLeverageTiers, fetchMarketLeverageTiers, parseEmulatedLeverageTiers, parseMarketLeverageTiers, repayIsolatedMargin, repayCrossMargin, borrowIsolatedMargin, borrowCrossMargin, parseMarginLoan, fetchBorrowInterest, parseBorrowInterest, nonce, sign, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchOpenInterestHistory, parseOpenInterest, fetchSettlementHistory, fetchMySettlementHistory, parseSettlement, parseSettlements, fetchLedger, parseLedgerEntry, parseLedgerEntryType, setPositionMode, fetchUnderlyingAssets, fetchLiquidations, fetchMyLiquidations, parseLiquidation, fetchGreeks, parseGreeks, closePosition, fetchLeverage, fetchLeverages, parseLeverage, fetchOption, fetchOptionChain, parseOption, fetchPositionsHistory, handleErrors)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
