@kwdef mutable struct Whitebit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    fetchTradingFees::Function = fetchTradingFees
    fetchTradingLimits::Function = fetchTradingLimits
    fetchFundingLimits::Function = fetchFundingLimits
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrder::Function = fetchOrder
    fetchTickers::Function = fetchTickers
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrders::Function = fetchOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    fetchOrderTrades::Function = fetchOrderTrades
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransactions::Function = fetchTransactions
    fetchDepositAddress::Function = fetchDepositAddress
    createDepositAddress::Function = createDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchAccounts::Function = fetchAccounts
    setLeverage::Function = setLeverage
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDeposit::Function = fetchDeposit
    fetchDeposits::Function = fetchDeposits
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchPositionHistory::Function = fetchPositionHistory
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    isFiat::Function = isFiat
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
end
function describe(self::Whitebit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "whitebit",
    Symbol("name") => "WhiteBit",
    Symbol("version") => "v4",
    Symbol("countries") => ["EE"],
    Symbol("rateLimit") => 20,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingLimits") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => true,
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
        Symbol("fetchTradingLimits") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
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
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v1/public",
                Symbol("private") => "https://whitebit.com/api/v1"
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v2/public"
            ),
            Symbol("v4") => Dict{Symbol, Any}(
                Symbol("public") => "https://whitebit.com/api/v4/public",
                Symbol("private") => "https://whitebit.com/api/v4"
            )
        ),
        Symbol("www") => "https://www.whitebit.com",
        Symbol("doc") => "https://github.com/whitebit-exchange/api-docs",
        Symbol("fees") => "https://whitebit.com/fee-schedule",
        Symbol("referral") => "https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("web") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/healthcheck") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("depth/result") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/order_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/executed_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/executed_history/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("depth/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trades/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("v4") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("funding-history/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orderbook/depth/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orderbook/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trades/{market}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("platform/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mining-pool") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("collateral-account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/balance-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/positions/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/positions/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("collateral-account/funding-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/create-new-address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/codes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/codes/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/codes/my") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/codes/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/fiat-deposit-url") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/withdraw-pay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/smart/plans") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/smart/investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/smart/investment/close") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/smart/investments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("main-account/smart/interest-payment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade-account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade-account/executed-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade-account/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade-account/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/stop-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/trigger-market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/bulk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/stock_market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/stop_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/stop_market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/kill-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/kill-switch/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/bulk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/modify") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/conditional-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("oco-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/collateral/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/oco-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/oto-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("profile/websocket_token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/estimate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/confirm") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("convert/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/delete") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/block") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/unblock") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/delete") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/reset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/ip-address/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/ip-address/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/api-key/ip-address/delete") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mining/rewards") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("conditional-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fiatCurrencies") => ["EUR", "USD", "RUB", "UAH"],
        Symbol("nonceWindow") => false,
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("account") => "spot"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "main",
            Symbol("main") => "main",
            Symbol("spot") => "spot",
            Symbol("margin") => "collateral",
            Symbol("trade") => "spot"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(),
        Symbol("defaultType") => "spot",
        Symbol("brokerId") => "ccxt"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => false,
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
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("checkActive") => true,
                Symbol("checkExecuted") => true,
                Symbol("symbolRequired") => false,
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false
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
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            ),
            Symbol("fetchWithdrawals") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
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
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Unauthorized request.") => AuthenticationError,
            Symbol("The market format is invalid.") => BadSymbol,
            Symbol("Market is not available") => BadSymbol,
            Symbol("Invalid payload.") => BadRequest,
            Symbol("Amount must be greater than 0") => InvalidOrder,
            Symbol("Not enough balance.") => InsufficientFunds,
            Symbol("The order id field is required.") => InvalidOrder,
            Symbol("Not enough balance") => InsufficientFunds,
            Symbol("This action is unauthorized.") => PermissionDenied,
            Symbol("This API Key is not authorized to perform this action.") => PermissionDenied,
            Symbol("Unexecuted order was not found.") => OrderNotFound,
            Symbol("The selected from is invalid.") => BadRequest,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("422") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("limit must be less than or equal to") => BadRequest,
            Symbol("The Price should be less than or equal to") => InvalidOrder,
            Symbol("The Price should be greater than or equal to") => InvalidOrder,
            Symbol("This action is unauthorized") => PermissionDenied,
            Symbol("Given amount is less than min amount") => InvalidOrder,
            Symbol("Min amount step") => InvalidOrder,
            Symbol("Total is less than") => InvalidOrder,
            Symbol("fee must be no less than") => InvalidOrder,
            Symbol("Enable your key in API settings") => PermissionDenied,
            Symbol("You don't have such amount for transfer") => InsufficientFunds
        )
    )
))

end
"""
retrieves data on all markets for whitebit
see: https://docs.whitebit.com/public/http-v4/#market-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Whitebit; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    markets = Base.fetch(self.v4PublicGetMarkets());
    return self.parseMarkets(markets)

end
function parseMarket(self::Whitebit, market)
    id = safeString(market, "name");
    baseId = safeString(market, "stock");
    quoteId = safeString(market, "money");
    quoteId = functions.ccxtruthy((quoteId == "PERP")) ? "USDT" : quoteId;
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    active = safeValue(market, "tradesEnabled");
    isCollateral = safeValue(market, "isCollateral");
    typeId = safeString(market, "type");
    settle = nothing;
    settleId = nothing;
    symbol = string(base, "/", quote_var);
    swap = typeId == "futures";
    margin = @functions.ccxt_and(isCollateral, !functions.ccxtruthy(swap));
    contract = false;
    amountPrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "stockPrec")));
    linear = nothing;
    inverse = nothing;
    if functions.ccxtruthy(swap)
        settleId = quoteId;
        settle = self.safeCurrencyCode(settleId);
        symbol = string(symbol, ":", settle);
        type_var = "swap";
        contract = true;
        linear = true;
        inverse = false;
    else
        type_var = "spot";
    end
    takerFeeRate = safeString(market, "takerFee");
    taker = stringDiv(takerFeeRate, "100");
    makerFeeRate = safeString(market, "makerFee");
    maker = stringDiv(makerFeeRate, "100");
    isSpot = !functions.ccxtruthy(swap);
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
    Symbol("spot") => isSpot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.parseNumber(taker),
    Symbol("maker") => self.parseNumber(maker),
    Symbol("contractSize") => functions.ccxtruthy(isSpot) ? nothing : self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "moneyPrec")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minAmount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minTotal"),
            Symbol("max") => self.safeNumber(market, "maxTotal")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
"""
fetches all available currencies on an exchange
see: https://docs.whitebit.com/public/http-v4/#asset-status-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Whitebit; params=Dict())
    response = Base.fetch(self.v4PublicGetAssets(params));
    enhancedArray = self.addKeyInArrayItems(response, "_coin_id");
    return self.parseCurrencies(enhancedArray)

end
function parseCurrency(self::Whitebit, rawCurrency)
    id = safeString(rawCurrency, "_coin_id");
    code = self.safeCurrencyCode(id);
    hasProvider = (ccxt_in("providers", rawCurrency));
    networks = Dict{Symbol, Any}();
    rawNetworks = self.safeDict(rawCurrency, "networks", defaultValue = Dict{Symbol, Any}());
    depositsNetworks = self.safeList(rawNetworks, "deposits", defaultValue = []);
    withdrawsNetworks = self.safeList(rawNetworks, "withdraws", defaultValue = []);
    networkLimits = self.safeDict(rawCurrency, "limits", defaultValue = Dict{Symbol, Any}());
    depositLimits = self.safeDict(networkLimits, "deposit", defaultValue = Dict{Symbol, Any}());
    withdrawLimits = self.safeDict(networkLimits, "withdraw", defaultValue = Dict{Symbol, Any}());
    allNetworks = arrayConcat(depositsNetworks, withdrawsNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(allNetworks)))
        networkId = get(allNetworks, j + 1, nothing);
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        networkDepositLimits = self.safeDict(depositLimits, networkId, defaultValue = Dict{Symbol, Any}());
        networkWithdrawLimits = self.safeDict(withdrawLimits, networkId, defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => inArray(networkId, depositsNetworks),
                Symbol("withdraw") => inArray(networkId, withdrawsNetworks),
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkDepositLimits, "min"),
                        Symbol("max") => self.safeNumber(networkDepositLimits, "max")
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkWithdrawLimits, "min"),
                        Symbol("max") => self.safeNumber(networkWithdrawLimits, "max")
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "can_deposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "can_withdraw"),
    Symbol("fee") => nothing,
    Symbol("networks") => networks,
    Symbol("type") => functions.ccxtruthy(hasProvider) ? "fiat" : "crypto",
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, "currency_precision"))),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min_withdraw"),
            Symbol("max") => self.safeNumber(rawCurrency, "max_withdraw")
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min_deposit"),
            Symbol("max") => self.safeNumber(rawCurrency, "max_deposit")
        )
    )
))

end
"""
please use fetchDepositWithdrawFees instead
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: not used by fetchTransactionFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFees(self::Whitebit; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetFee(params));
    currenciesIds = objectKeys(response);
    withdrawFees = Dict{Symbol, Any}();
    depositFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currenciesIds)))
        currency = get(currenciesIds, i + 1, nothing);
        data = self.safeDict(response, currency, defaultValue = Dict{Symbol, Any}());
        code = self.safeCurrencyCode(currency);
        withdraw = safeValue(data, "withdraw", Dict{Symbol, Any}());
        if functions.ccxtruthy(code != nothing)
            withdrawFees[Symbol(code)] = safeString(withdraw, "fixed");
        end
        deposit = safeValue(data, "deposit", Dict{Symbol, Any}());
        if functions.ccxtruthy(code != nothing)
            depositFees[Symbol(code)] = safeString(deposit, "fixed");
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => depositFees,
    Symbol("info") => response
)

end
"""
fetch deposit and withdraw fees
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Whitebit; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetFee(params));
    return self.parseDepositWithdrawFees(response, codes = codes)

end
function parseDepositWithdrawFees(self::Whitebit, response; codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    codes = self.marketCodes(codes = codes);
    currencyIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        entry = get(currencyIds, i + 1, nothing);
        splitEntry = split(entry, " ");
        currencyId = get(splitEntry, 1, nothing);
        feeInfo = get(response, Symbol(entry), nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or((codes == nothing), (inArray(code, codes))))))
            depositWithdrawFee = safeValue(depositWithdrawFees, code);
            if functions.ccxtruthy(depositWithdrawFee == nothing)
                depositWithdrawFees[Symbol(code)] = self.depositWithdrawFee(Dict{Symbol, Any}());
            end
            depositWithdrawFees[Symbol(code)][Symbol("info")][Symbol(entry)] = feeInfo;
            networkId = safeString(splitEntry, 1);
            withdraw = safeValue(feeInfo, "withdraw");
            deposit = safeValue(feeInfo, "deposit");
            withdrawFee = self.safeNumber(withdraw, "fixed");
            depositFee = self.safeNumber(deposit, "fixed");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
            );
            depositResult = Dict{Symbol, Any}(
                Symbol("fee") => depositFee,
                Symbol("percentage") => functions.ccxtruthy((depositFee != nothing)) ? false : nothing
            );
            if functions.ccxtruthy(networkId != nothing)
                networkLength = length(networkId);
                networkId = functions.ccxt_slice(networkId, 1, networkLength - 1);
                networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
                if functions.ccxtruthy(networkCode != nothing)
                    depositWithdrawFees[Symbol(code)][Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                        Symbol("withdraw") => withdrawResult,
                        Symbol("deposit") => depositResult
                    );
                end
            else
                depositWithdrawFees[Symbol(code)][Symbol("withdraw")] = withdrawResult;
                depositWithdrawFees[Symbol(code)][Symbol("deposit")] = depositResult;
            end
        end
        i += 1
    end
    depositWithdrawCodes = objectKeys(depositWithdrawFees);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositWithdrawCodes)))
        code = get(depositWithdrawCodes, i + 1, nothing);
        currency = self.currency(code);
        depositWithdrawFees[Symbol(code)] = self.assignDefaultDepositWithdrawFees(get(depositWithdrawFees, Symbol(code), nothing), currency = currency);
        i += 1
    end
    return depositWithdrawFees

end
"""
fetch the trading fees for multiple markets
see: https://docs.whitebit.com/public/http-v4/#asset-status-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Whitebit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v4PublicGetAssets(params));
    result = Dict{Symbol, Any}();
    symbols = self.symbols;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        market = self.market(symbol);
        fee = safeValue(response, get(market, Symbol("baseId"), nothing), Dict{Symbol, Any}());
        makerFee = safeString(fee, "maker_fee");
        takerFee = safeString(fee, "taker_fee");
        makerFee = stringDiv(makerFee, "100");
        takerFee = stringDiv(takerFee, "100");
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("symbol") => get(market, Symbol("symbol"), nothing),
            Symbol("percentage") => true,
            Symbol("tierBased") => false,
            Symbol("maker") => self.parseNumber(makerFee),
            Symbol("taker") => self.parseNumber(takerFee)
        );
        i += 1
    end
    return result

end
"""
fetch the trading limits for a market
see: https://docs.whitebit.com/public/http-v4/#market-info

# Arguments
- `symbols`::any: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [trading limits structure]{@link https://docs.ccxt.com/?id=trading-limits-structure}
"""
function fetchTradingLimits(self::Whitebit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    result = Dict{Symbol, Any}();
    markets = self.markets;
    if functions.ccxtruthy(markets == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    marketIds = objectKeys(markets);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = get(markets, Symbol(marketId), nothing);
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(market), !functions.ccxtruthy(get(market, Symbol("symbol"), nothing))))
            i += 1; continue
        end
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbols)
            symbolFound = false;
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(symbols)))
                if functions.ccxtruthy(get(symbols, j + 1, nothing) == symbol)
                    symbolFound = true;
                    break
                end
                j += 1
            end

            if functions.ccxtruthy(!functions.ccxtruthy(symbolFound))
                i += 1; continue
            end
        end
        limits = self.safeDict(market, "limits");
        amountLimits = self.safeDict(limits, "amount");
        priceLimits = self.safeDict(limits, "price");
        costLimits = self.safeDict(limits, "cost");
        hasAmountLimits = @functions.ccxt_and(@functions.ccxt_and(amountLimits, self.safeNumber(amountLimits, "min") != nothing), self.safeNumber(amountLimits, "max") != nothing);
        hasPriceLimits = @functions.ccxt_and(@functions.ccxt_and(priceLimits, self.safeNumber(priceLimits, "min") != nothing), self.safeNumber(priceLimits, "max") != nothing);
        hasCostLimits = @functions.ccxt_and(@functions.ccxt_and(costLimits, self.safeNumber(costLimits, "min") != nothing), self.safeNumber(costLimits, "max") != nothing);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(hasAmountLimits, hasPriceLimits), hasCostLimits))
            result[Symbol(symbol)] = Dict{Symbol, Any}(
                Symbol("info") => market,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(amountLimits, "min"),
                        Symbol("max") => self.safeNumber(amountLimits, "max")
                    ),
                    Symbol("price") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(priceLimits, "min"),
                        Symbol("max") => self.safeNumber(priceLimits, "max")
                    ),
                    Symbol("cost") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(costLimits, "min"),
                        Symbol("max") => self.safeNumber(costLimits, "max")
                    )
                )
            );
        end
        i += 1
    end
    return result

end
"""
fetch the deposit and withdrawal limits for a currency
see: https://docs.whitebit.com/public/http-v4/#asset-status-list
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding limits structure]{@link https://docs.ccxt.com/?id=funding-limits-structure}
"""
function fetchFundingLimits(self::Whitebit; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (currenciesData, feesData) = (Base.fetch(asyncmap(Base.fetch, [self.fetchCurrencies(), self.v4PublicGetFee(params)])));
    result = Dict{Symbol, Any}();
    currencyKeys = objectKeys(currenciesData);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyKeys)))
        code = get(currencyKeys, i + 1, nothing);
        currency = get(currenciesData, Symbol(code), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(currency))
            i += 1; continue
        end
        if functions.ccxtruthy(@functions.ccxt_and(codes != nothing, !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        feeData = nothing;
        feeKeys = objectKeys(feesData);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(feeKeys)))
            feeKey = get(feeKeys, j + 1, nothing);
            fee = self.safeDict(feesData, feeKey);
            if functions.ccxtruthy(@functions.ccxt_and(fee, get(fee, Symbol("ticker"), nothing) == code))
                feeData = fee;
                break
            end
            j += 1
        end
        currencyLimits = self.safeDict(currency, "limits", defaultValue = Dict{Symbol, Any}());
        limits = Dict{Symbol, Any}(
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => get(get(currencyLimits, Symbol("deposit"), nothing), Symbol("min"), nothing),
                Symbol("max") => get(get(currencyLimits, Symbol("deposit"), nothing), Symbol("max"), nothing)
            ),
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => get(get(currencyLimits, Symbol("withdraw"), nothing), Symbol("min"), nothing),
                Symbol("max") => get(get(currencyLimits, Symbol("withdraw"), nothing), Symbol("max"), nothing)
            )
        );
        if functions.ccxtruthy(feeData)
            depositFee = get(feeData, Symbol("deposit"), nothing);
            withdrawFee = get(feeData, Symbol("withdraw"), nothing);
            if functions.ccxtruthy(depositFee)
                depositFeeData = Dict{Symbol, Any}(
                    Symbol("fixed") => self.safeNumber(depositFee, "fixed")
                );
                if functions.ccxtruthy(get(depositFee, Symbol("flex"), nothing))
                    depositFeeData[Symbol("flex")] = Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "min_fee"),
                        Symbol("max") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "max_fee"),
                        Symbol("percent") => self.safeNumber(get(depositFee, Symbol("flex"), nothing), "percent")
                    );
                end
                limits[Symbol("deposit")][Symbol("fee")] = depositFeeData;
            end
            if functions.ccxtruthy(withdrawFee)
                withdrawFeeData = Dict{Symbol, Any}(
                    Symbol("fixed") => self.safeNumber(withdrawFee, "fixed")
                );
                if functions.ccxtruthy(get(withdrawFee, Symbol("flex"), nothing))
                    withdrawFeeData[Symbol("flex")] = Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "min_fee"),
                        Symbol("max") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "max_fee"),
                        Symbol("percent") => self.safeNumber(get(withdrawFee, Symbol("flex"), nothing), "percent")
                    );
                end
                limits[Symbol("withdraw")][Symbol("fee")] = withdrawFeeData;
            end
        end
        if functions.ccxtruthy(get(currency, Symbol("networks"), nothing))
            limits[Symbol("networks")] = get(currency, Symbol("networks"), nothing);
        end
        result[Symbol(code)] = Dict{Symbol, Any}(
            Symbol("info") => currency,
            Symbol("limits") => limits
        );
        i += 1
    end
    return result

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.whitebit.com/public/http-v4/#market-activity

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Whitebit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PublicGetTicker(extend(request, params)));
    ticker = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
function parseTicker(self::Whitebit, ticker; market=nothing)
    marketId = safeString2(ticker, "tradingPairs", "ticker_id");
    market = self.safeMarket(marketId = marketId, market = market);
    last_var = safeStringN(ticker, ["last", "last_price", "lastPrice"]);
    close = safeString(ticker, "close", last_var);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString2(ticker, "bid", "highestBid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString2(ticker, "ask", "lowestAsk"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => close,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "change"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeStringN(ticker, ["base_volume", "volume", "baseVolume24h", "stock_volume"]),
    Symbol("quoteVolume") => safeStringN(ticker, ["quote_volume", "deal", "quoteVolume24h", "money_volume"]),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches information on an order by the id
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.checkActive`::bool, optional: whether to check active orders (default: true)
- `params.checkExecuted`::bool, optional: whether to check executed orders (default: true)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Whitebit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    checkActive = self.safeBool(params, "checkActive", defaultValue = true);
    checkExecuted = self.safeBool(params, "checkExecuted", defaultValue = true);
    params = omit(params, ["checkActive", "checkExecuted"]);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(checkActive)
        try
            response = Base.fetch(self.v4PrivatePostOrders(extend(request, params)));
            orders = toArray(response);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
                order = get(orders, i + 1, nothing);
                orderId = safeString(order, "orderId");
                if functions.ccxtruthy(orderId == id)
                    marketId = safeString(order, "market");
                    marketNew = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
                        return self.parseOrder(order, market = marketNew)
                end
                i += 1
            end
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy((isa(error, OrderNotFound))))
                throw(error);
            end

        end
    end
    if functions.ccxtruthy(checkExecuted)
        try
            response = Base.fetch(self.v4PrivatePostTradeAccountOrderHistory(extend(request, params)));
            marketIds = objectKeys(response);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
                marketId = get(marketIds, i + 1, nothing);
                marketNew = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
                marketOrders = self.safeList(response, marketId, defaultValue = []);
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(marketOrders)))
                    order = get(marketOrders, j + 1, nothing);
                    orderId = safeString(order, "id");
                    if functions.ccxtruthy(orderId == id)
                            return self.parseOrder(order, market = marketNew)
                    end
                    j += 1
                end
                i += 1
            end
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy((isa(error, OrderNotFound))))
                throw(error);
            end

        end
    end
    throw(OrderNotFound(string(self.id, " fetchOrder() order not found: ", id)));

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.whitebit.com/public/http-v4/#market-activity

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - default is 'spot'. If type is 'swap', it will call v4PublicGetFutures
- `params.method`::string, optional: either v2PublicGetTicker or v4PublicGetTicker or v4PublicGetFutures - default is v4PublicGetTicker for spot and mixed markets, and v4PublicGetFutures for swap

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Whitebit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    onlyContractSymbols = true;
    if functions.ccxtruthy(symbols != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            market = self.market(symbol);
            if functions.ccxtruthy(!functions.ccxtruthy((get(market, Symbol("contract"), nothing))))
                onlyContractSymbols = false;
                break
            end
            i += 1
        end

    else
        onlyContractSymbols = false;
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market = nothing, params = params);
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchTickers", "method", defaultValue = method);
    if functions.ccxtruthy(method == nothing)
        if functions.ccxtruthy(@functions.ccxt_or(onlyContractSymbols, (marketType == "swap")))
            method = "v4PublicGetFutures";
        else
            method = "v4PublicGetTicker";
        end
    end
    if functions.ccxtruthy(method == "v4PublicGetTicker")
        response = Base.fetch(self.v4PublicGetTicker(params));
    elseif functions.ccxtruthy(method == "v4PublicGetFutures")
        response = Base.fetch(self.v4PublicGetFutures(params));
    else
        response = Base.fetch(self.v2PublicGetTicker(params));
    end
    resultList = self.safeList(response, "result");
    if functions.ccxtruthy(resultList != nothing)
            return self.parseTickers(resultList, symbols = symbols)
    end
    marketIds = objectKeys(response);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        market = self.safeMarket(marketId = marketId);
        ticker = self.parseTicker(get(response, Symbol(marketId), nothing), market = market);
        symbol = get(ticker, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.whitebit.com/public/http-v4/#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Whitebit, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PublicGetOrderbookMarket(extend(request, params)));
    timestamp = safeTimestamp(response, "timestamp");
    return self.parseOrderBook(response, symbol, timestamp = timestamp)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.whitebit.com/public/http-v4/#recent-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Whitebit, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PublicGetTradesMarket(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchMyTrades(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountExecutedHistory(extend(request, params)));
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return self.parseTrades(response, market = market, since = since, limit = limit)
    else
        results = [];
        keys_var = objectKeys(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            marketId = get(keys_var, i + 1, nothing);
            marketNew = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
            rawTrades = safeValue(response, marketId, []);
            parsed = self.parseTrades(rawTrades, market = marketNew, since = since, limit = limit);
            results = arrayConcat(results, parsed);
            i += 1
        end
        results = sortBy2(results, "timestamp", "id");
        return self.filterBySinceLimit(results, since = since, limit = limit, key = "timestamp")
    end

end
function parseTrade(self::Whitebit, trade; market=nothing)
    market = self.safeMarket(marketId = nothing, market = market);
    timestamp = safeTimestamp2(trade, "time", "trade_timestamp");
    orderId = safeString2(trade, "dealOrderId", "orderId");
    cost = safeString(trade, "deal");
    price = safeString(trade, "price");
    amount = safeString2(trade, "amount", "quote_volume");
    id = safeString2(trade, "id", "tradeID");
    side = safeString2(trade, "type", "side");
    symbol = get(market, Symbol("symbol"), nothing);
    role = safeInteger(trade, "role");
    takerOrMaker = nothing;
    if functions.ccxtruthy(role != nothing)
        takerOrMaker = functions.ccxtruthy((role == 1)) ? "maker" : "taker";
    end
    fee = nothing;
    feeCost = safeString(trade, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => self.safeCurrencyCode(safeString(trade, "feeAsset"))
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => fee
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.whitebit.com/public/http-v1/#kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Whitebit, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        maxLimit = 1440;
        if functions.ccxtruthy(limit == nothing)
            limit = maxLimit;
        end
        limit = min(limit, maxLimit);
        start = self.parseToInt(since / 1000);
        request[Symbol("start")] = start;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1440);
    end
    response = Base.fetch(self.v1PublicGetKline(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOHLCVs(result, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Whitebit, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
"""
the latest known information on the availability of the exchange API
see: https://docs.whitebit.com/public/http-v4/#server-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Whitebit; params=Dict())
    response = Base.fetch(self.v4PublicGetPing(params));
    status = safeString(response, 0);
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "pong")) ? "ok" : status,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.whitebit.com/public/http-v4/#server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Whitebit; params=Dict())
    response = Base.fetch(self.v4PublicGetTime(params));
    return safeIntegerProduct(response, "time", 1000)

end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketOrderWithCost(self::Whitebit, symbol, side, cost; params=Dict())
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", side, 0, price = nothing, params = extend(req, params)))

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
function createMarketBuyOrderWithCost(self::Whitebit, symbol, cost; params=Dict())
    return Base.fetch(self.createMarketOrderWithCost(symbol, "buy", cost, params = params))

end
"""
create a trade order
see: https://docs.whitebit.com/private/http-trade-v4/#create-limit-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-market-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-buy-stock-market-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-stop-limit-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-stop-market-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *market orders only* the cost of the order in units of the base currency
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: If true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC", "IOC" or "PO"; IOC and PO are limit-order only, not supported for stop orders
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Whitebit, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => side
    );
    cost = nothing;
    (cost, params) = self.handleParamString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((side != "buy"), (type_var != "market")))
            throw(InvalidOrder(string(self.id, " createOrder() cost is only supported for market buy orders")));
        end
        request[Symbol("amount")] = self.costToPrecision(symbol, cost);
    else
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        brokerId = safeString(self.options, "brokerId");
        if functions.ccxtruthy(brokerId != nothing)
            request[Symbol("clientOrderId")] = string(brokerId, uuid16());
        end
    else
        request[Symbol("clientOrderId")] = clientOrderId;
        params = omit(params, ["clientOrderId"]);
    end
    marketType = safeString(market, "type");
    isLimitOrder = type_var == "limit";
    isMarketOrder = type_var == "market";
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "activation_price"]);
    isStopOrder = (triggerPrice != nothing);
    timeInForce = safeStringUpper(params, "timeInForce");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((timeInForce != nothing), (timeInForce != "GTC")), (timeInForce != "IOC")), (timeInForce != "PO")))
        throw(NotSupported(string(self.id, " createOrder() does not support timeInForce ", timeInForce, ", only GTC, IOC and PO are allowed")));
    end
    postOnly = self.isPostOnly(isMarketOrder, false, params = params);
    ioc = (timeInForce == "IOC");
    if functions.ccxtruthy(@functions.ccxt_and(isStopOrder, (@functions.ccxt_or(postOnly, ioc))))
        throw(NotSupported(string(self.id, " createOrder() does not support postOnly or timeInForce IOC for stop orders")));
    end
    if functions.ccxtruthy(@functions.ccxt_and(ioc, !functions.ccxtruthy(isLimitOrder)))
        throw(NotSupported(string(self.id, " createOrder() timeInForce IOC is only supported for limit orders")));
    end
    (marginMode, query) = self.handleMarginModeAndParams("createOrder", params = params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    if functions.ccxtruthy(ioc)
        request[Symbol("ioc")] = true;
    end
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != nothing, marginMode != "cross"))
        throw(NotSupported(string(self.id, " createOrder() is only available for cross margin")));
    end
    params = omit(query, ["postOnly", "triggerPrice", "stopPrice", "timeInForce"]);
    useCollateralEndpoint = @functions.ccxt_or(marginMode != nothing, marketType == "swap");
    if functions.ccxtruthy(isStopOrder)
        request[Symbol("activation_price")] = self.priceToPrecision(symbol, triggerPrice);
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
            response = Base.fetch(self.v4PrivatePostOrderStopLimit(extend(request, params)));
        else
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralTriggerMarket(extend(request, params)));
            else
                response = Base.fetch(self.v4PrivatePostOrderStopMarket(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralLimit(extend(request, params)));
            else
                response = Base.fetch(self.v4PrivatePostOrderNew(extend(request, params)));
            end
        else
            if functions.ccxtruthy(useCollateralEndpoint)
                response = Base.fetch(self.v4PrivatePostOrderCollateralMarket(extend(request, params)));
            else
                if functions.ccxtruthy(cost != nothing)
                    response = Base.fetch(self.v4PrivatePostOrderMarket(extend(request, params)));
                else
                    response = Base.fetch(self.v4PrivatePostOrderStockMarket(extend(request, params)));
                end
            end
        end
    end
    return self.parseOrder(response)

end
"""
edit a trade order
see: https://docs.whitebit.com/private/http-trade-v4/#modify-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Whitebit, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "activationPrice"]);
    isStopOrder = (triggerPrice != nothing);
    if functions.ccxtruthy(isStopOrder)
        request[Symbol("activation_price")] = self.priceToPrecision(symbol, triggerPrice);
    end
    isLimitOrder = type_var == "limit";
    total = self.safeNumber(params, "total");
    if functions.ccxtruthy(total != nothing)
        request[Symbol("total")] = self.amountToPrecision(symbol, total);
    elseif functions.ccxtruthy(amount != nothing)
        if functions.ccxtruthy(isLimitOrder)
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        elseif functions.ccxtruthy(@functions.ccxt_and(type_var == "market", side == "buy"))
            request[Symbol("total")] = self.amountToPrecision(symbol, amount);
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    hasModifiableParam = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((amount != nothing), (price != nothing)), (triggerPrice != nothing)), (total != nothing));
    if functions.ccxtruthy(!functions.ccxtruthy(hasModifiableParam))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires at least one of: amount, price, activationPrice, or total parameters")));
    end
    params = omit(params, ["clientOrderId", "triggerPrice", "stopPrice", "activationPrice", "total"]);
    response = Base.fetch(self.v4PrivatePostOrderModify(extend(request, params)));
    return self.parseOrder(response)

end
"""
cancels an open order
see: https://docs.whitebit.com/private/http-trade-v4/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Whitebit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => ccxt_parseInt(id)
    );
    response = Base.fetch(self.v4PrivatePostOrderCancel(extend(request, params)));
    return self.parseOrder(response)

end
"""
cancel all open orders
see: https://docs.whitebit.com/private/http-trade-v4/#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'spot']
- `params.isMargin`::bool, optional: cancel all margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Whitebit; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    requestType = [];
    if functions.ccxtruthy(type_var == "spot")
        isMargin = nothing;
        (isMargin, params) = self.handleOptionAndParams(params, "cancelAllOrders", "isMargin", defaultValue = false);
        if functions.ccxtruthy(isMargin)
                        push!(requestType, "margin");
        else
            push!(requestType, "spot");
        end
    elseif functions.ccxtruthy(type_var == "swap")
        push!(requestType, "futures");
    else
        throw(NotSupported(string(self.id, " cancelAllOrders() does not support ", type_var, " type")));
    end
    request[Symbol("type")] = requestType;
    response = Base.fetch(self.v4PrivatePostOrderCancelAll(extend(request, params)));
    return self.parseOrders(response, market = market)

end
"""
fetches information on multiple orders made by the user (combines open and closed orders)
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (openOrders, closedOrders) = (Base.fetch(asyncmap(Base.fetch, [self.fetchOpenOrders(symbol = symbol, since = since, limit = limit, params = params), self.fetchClosedOrders(symbol = symbol, since = since, limit = limit, params = params)])));
    allOrders = arrayConcat(openOrders, closedOrders);
    sortedOrders = sortBy(allOrders, "timestamp", true);
    if functions.ccxtruthy(@functions.ccxt_and(limit != nothing, functions.ccxt_gt(length(sortedOrders), limit)))
            return functions.ccxt_slice(sortedOrders, 0, limit)
    end
    return sortedOrders

end
"""
dead man's switch, cancel all orders after the given timeout
see: https://docs.whitebit.com/private/http-trade-v4/#sync-kill-switch-timer

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.types`::string, optional: Order types value. Example: "spot", "margin", "futures" or null
- `params.symbol`::string, optional: symbol unified symbol of the market the order was made in

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Whitebit, timeout; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = safeString(params, "symbol");
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrdersAfter() requires a symbol argument in params")));
    end
    market = self.market(symbol);
    params = omit(params, "symbol");
    if functions.ccxtruthy(timeout == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrdersAfter() missing timeout")));
    end
    isBiggerThanZero = (functions.ccxt_gt(timeout, 0));
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(isBiggerThanZero)
        request[Symbol("timeout")] = numberToString(timeout / 1000);
    else
        request[Symbol("timeout")] = "null";
    end
    response = Base.fetch(self.v4PrivatePostOrderKillSwitch(extend(request, params)));
    return response

end
function parseBalance(self::Whitebit, response)
    balanceKeys = objectKeys(response);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balanceKeys)))
        id = get(balanceKeys, i + 1, nothing);
        code = self.safeCurrencyCode(id);
        balance = get(response, Symbol(id), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(balance != nothing, self.isDictionary(balance)))
            account = self.account();
            account[Symbol("free")] = safeString2(balance, "available", "main_balance");
            account[Symbol("used")] = safeString(balance, "freeze");
            account[Symbol("total")] = safeString(balance, "main_balance");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
        else
            account = self.account();
            account[Symbol("total")] = balance;
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.whitebit.com/private/http-main-v4/#main-balance
see: https://docs.whitebit.com/private/http-trade-v4/#trading-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Whitebit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.v4PrivatePostCollateralAccountBalance(params));
    else
        options = safeValue(self.options, "fetchBalance", Dict{Symbol, Any}());
        defaultAccount = safeString(options, "account");
        account = safeString2(params, "account", "type", defaultAccount);
        params = omit(params, ["account", "type"]);
        if functions.ccxtruthy(@functions.ccxt_or(account == "main", account == "funding"))
            response = Base.fetch(self.v4PrivatePostMainAccountBalance(params));
        else
            response = Base.fetch(self.v4PrivatePostTradeAccountBalance(params));
        end
    end
    return self.parseBalance(response)

end
"""
fetch all unfilled currently open orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("status") => "open"
))

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountOrderHistory(extend(request, params)));
    marketIds = objectKeys(response);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        marketNew = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_");
        orders = self.safeList(response, marketId, defaultValue = []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(orders)))
            order = self.parseOrder(get(orders, j + 1, nothing), market = marketNew);
            push!(results, extend(order, Dict{Symbol, Any}(
    Symbol("status") => "closed"
)));
            j += 1
        end
        i += 1
    end
    results = sortBy(results, "timestamp");
    results = self.filterBySymbolSinceLimit(results, symbol = symbol, since = since, limit = limit);
    return results

end
function parseOrderType(self::Whitebit, type_var)
    types = Dict{Symbol, Any}(
        Symbol("limit") => "limit",
        Symbol("market") => "market",
        Symbol("stop market") => "market",
        Symbol("stop limit") => "limit",
        Symbol("stock market") => "market",
        Symbol("margin limit") => "limit",
        Symbol("margin market") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Whitebit, order; market=nothing)
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeString(order, "side");
    filled = safeString(order, "dealStock");
    remaining = safeString(order, "left");
    clientOrderId = safeString(order, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == "")
        clientOrderId = nothing;
    end
    price = safeString(order, "price");
    triggerPrice = self.safeNumber(order, "activation_price");
    orderId = safeString2(order, "orderId", "id");
    type_var = safeString(order, "type");
    orderType = self.parseOrderType(type_var);
    if functions.ccxtruthy(orderType == "market")
        remaining = nothing;
    end
    amount = safeString(order, "amount");
    cost = safeString(order, "dealMoney");
    if functions.ccxtruthy(@functions.ccxt_and((side == "buy"), (@functions.ccxt_or((type_var == "market"), (type_var == "stop market")))))
        amount = filled;
    end
    dealFee = safeString(order, "dealFee");
    fee = nothing;
    if functions.ccxtruthy(dealFee != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(dealFee),
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    end
    timestamp = safeTimestamp2(order, "ctime", "timestamp");
    lastTradeTimestamp = safeTimestamp(order, "ftime");
    postOnly = self.safeBool(order, "postOnly");
    ioc = self.safeBool(order, "ioc");
    timeInForce = nothing;
    if functions.ccxtruthy(ioc)
        timeInForce = "IOC";
    elseif functions.ccxtruthy(postOnly)
        timeInForce = "PO";
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => orderId,
    Symbol("symbol") => symbol,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("type") => orderType,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("average") => nothing,
    Symbol("cost") => cost,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Whitebit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CANCELED") => "canceled",
        Symbol("OPEN") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed"
    );
    return safeStringLower(statuses, status, status)

end
"""
fetch all the trades made from a single order
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-deals

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Whitebit, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => ccxt_parseInt(id)
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostTradeAccountOrder(extend(request, params)));
    data = self.safeList(response, "records", defaultValue = []);
    return self.parseTrades(data, market = market)

end
"""
fetch all withdrawals made from an account
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transactionMethod`::string, optional: transaction method (1=deposit, 2=withdrawal) - automatically set to '2' for withdrawals

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Whitebit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    request[Symbol("transactionMethod")] = "2";
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    return self.parseTransactions(self.safeList(response, "records", defaultValue = []), currency = currency, since = since, limit = limit)

end
"""
fetch history of deposits and withdrawals
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transactions for
- `limit`::int, optional: the maximum number of transactions structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transactionMethod`::string, optional: transaction method (1=deposit, 2=withdrawal) - automatically set to '1' for deposits

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchTransactions(self::Whitebit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = self.parseToInt(since / 1000);
    end
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = self.safeList(response, "records", defaultValue = []);
    return self.parseTransactions(records, currency = currency, since = since, limit = limit)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.whitebit.com/private/http-main-v4/#get-fiat-deposit-address
see: https://docs.whitebit.com/private/http-main-v4/#get-cryptocurrency-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Whitebit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(self.isFiat(code))
        provider = safeString(params, "provider");
        if functions.ccxtruthy(provider == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires a provider when the ticker is fiat")));
        end
        request[Symbol("provider")] = provider;
        amount = self.safeNumber(params, "amount");
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires an amount when the ticker is fiat")));
        end
        request[Symbol("amount")] = amount;
        uniqueId = safeValue(params, "uniqueId");
        if functions.ccxtruthy(uniqueId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires an uniqueId when the ticker is fiat")));
        end
        response = Base.fetch(self.v4PrivatePostMainAccountFiatDepositUrl(extend(request, params)));
    else
        response = Base.fetch(self.v4PrivatePostMainAccountAddress(extend(request, params)));
    end
    url = safeString(response, "url");
    account = safeValue(response, "account", Dict{Symbol, Any}());
    address = safeString(account, "address", url);
    tag = safeString(account, "memo");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
create a currency deposit address
see: https://docs.whitebit.com/private/http-main-v4/#create-new-address-for-deposit

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on
- `params.type`::string, optional: address type, available for specific currencies

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Whitebit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PrivatePostMainAccountCreateNewAddress(extend(request, params)));
    data = self.safeDict(response, "account", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
function parseDepositAddress(self::Whitebit, depositAddress; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
    Symbol("network") => nothing,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
"""
fetch all the accounts associated with a profile
see: https://docs.whitebit.com/private/http-main-v4/#sub-account-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
"""
function fetchAccounts(self::Whitebit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accounts = [];
    subAccounts = Base.fetch(self.v4PrivatePostSubAccountList(params));
    if functions.ccxtruthy(@functions.ccxt_and(subAccounts, functions.ccxt_isArray(subAccounts)))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(subAccounts)))
            subAccount = safeValue(subAccounts, i);
            accountId = safeString(subAccount, "id");
            accountName = safeString(subAccount, "name");
            if functions.ccxtruthy(accountId)
                                push!(accounts, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => "subaccount",
    Symbol("name") => @functions.ccxt_or(accountName, string("SubAccount ", accountId)),
    Symbol("code") => nothing,
    Symbol("info") => subAccount
));
            end
            i += 1
        end

    end
    return accounts

end
"""
set the level of leverage for a market
see: https://docs.whitebit.com/private/http-trade-v4/#change-collateral-account-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Whitebit, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol != nothing)
        throw(NotSupported(string(self.id, " setLeverage() does not allow to set per symbol")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 20))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 20")));
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.v4PrivatePostCollateralAccountLeverage(extend(request, params)))

end
"""
transfer currency internally between wallets on the same account
see: https://docs.whitebit.com/private/http-main-v4/#transfer-between-main-and-trade-balances

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from - main, spot, collateral
- `toAccount`::string: account to transfer to - main, spot, collateral
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Whitebit, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsByType");
    fromAccountId = safeString(accountsByType, fromAccount, fromAccount);
    toAccountId = safeString(accountsByType, toAccount, toAccount);
    amountString = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amountString,
        Symbol("from") => fromAccountId,
        Symbol("to") => toAccountId
    );
    response = Base.fetch(self.v4PrivatePostMainAccountTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
function parseTransfer(self::Whitebit, transfer; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing
)

end
"""
make a withdrawal
see: https://docs.whitebit.com/private/http-main-v4/#create-withdraw-request

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Whitebit, code, amount, address; tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ticker") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    uniqueId = safeValue(params, "uniqueId");
    if functions.ccxtruthy(uniqueId == nothing)
        uniqueId = uuid22();
    end
    request[Symbol("uniqueId")] = uniqueId;
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    if functions.ccxtruthy(self.isFiat(code))
        provider = safeValue(params, "provider");
        if functions.ccxtruthy(provider == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires a provider when the ticker is fiat")));
        end
        request[Symbol("provider")] = provider;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountWithdraw(extend(request, params)));
    return extend(self.parseTransaction(response, currency = currency), Dict{Symbol, Any}(
    Symbol("id") => uniqueId
))

end
function parseTransaction(self::Whitebit, transaction; currency=nothing)
    currency = self.safeCurrency(nothing, currency = currency);
    address = safeString(transaction, "address");
    timestamp = safeTimestamp(transaction, "createdAt");
    currencyId = safeString(transaction, "ticker");
    status = safeString(transaction, "status");
    method = safeString(transaction, "method");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "uniqueId"),
    Symbol("txid") => safeString(transaction, "transactionId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => safeString(transaction, "network"),
    Symbol("addressFrom") => functions.ccxtruthy((method == "1")) ? address : nothing,
    Symbol("address") => address,
    Symbol("addressTo") => functions.ccxtruthy((method == "2")) ? address : nothing,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("type") => functions.ccxtruthy((method == "1")) ? "deposit" : "withdrawal",
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => safeString(transaction, "memo"),
    Symbol("tagTo") => nothing,
    Symbol("comment") => safeString(transaction, "description"),
    Symbol("internal") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(transaction, "fee"),
        Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency)
    ),
    Symbol("info") => transaction
)

end
function parseTransactionStatus(self::Whitebit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("1") => "pending",
        Symbol("2") => "pending",
        Symbol("3") => "ok",
        Symbol("4") => "canceled",
        Symbol("5") => "pending",
        Symbol("6") => "pending",
        Symbol("7") => "ok",
        Symbol("9") => "canceled",
        Symbol("10") => "pending",
        Symbol("11") => "pending",
        Symbol("12") => "pending",
        Symbol("13") => "pending",
        Symbol("14") => "pending",
        Symbol("15") => "pending",
        Symbol("16") => "pending",
        Symbol("17") => "pending"
    );
    return safeString(statuses, status, status)

end
"""
fetch information on a deposit
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `id`::string: deposit id
- `code`::string: not used by fetchDeposit ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposit(self::Whitebit, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("transactionMethod") => 1,
        Symbol("uniqueId") => id,
        Symbol("limit") => 1,
        Symbol("offset") => 0
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = safeValue(response, "records", []);
    first_var = self.safeDict(records, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(first_var, currency = currency)

end
"""
fetch all deposits made to an account
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Whitebit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("transactionMethod") => 1,
        Symbol("limit") => 100,
        Symbol("offset") => 0
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = self.safeList(response, "records", defaultValue = []);
    recordsList = [];
    if functions.ccxtruthy(records != nothing)
        recordsList = records;
    end
    return self.parseTransactions(recordsList, currency = currency, since = since, limit = limit)

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `code`::string: unified currency code
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Whitebit; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(extend(request, params)));
    interest = self.parseBorrowInterests(response, market = market);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
function parseBorrowInterest(self::Whitebit, info; market=nothing)
    marketId = safeString(info, "market");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_");
    timestamp = safeTimestamp(info, "modifyDate");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => "USDT",
    Symbol("interest") => self.safeNumber(info, "unrealizedFunding"),
    Symbol("interestRate") => 0.00098,
    Symbol("amountBorrowed") => self.safeNumber(info, "amount"),
    Symbol("marginMode") => "cross",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetch the current funding rate
see: https://docs.whitebit.com/public/http-v4/#available-futures-markets-list

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Whitebit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = self.symbol(symbol);
    response = Base.fetch(self.fetchFundingRates(symbols = [symbol], params = params));
    return safeValue(response, symbol)

end
"""
fetch the funding rate for multiple markets
see: https://docs.whitebit.com/public/http-v4/#available-futures-markets-list

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Whitebit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.v4PublicGetFutures(params));
    data = self.safeList(response, "result", defaultValue = []);
    return self.parseFundingRates(data, symbols = symbols)

end
function parseFundingRate(self::Whitebit, contract; market=nothing)
    marketId = safeString(contract, "ticker_id");
    symbol = self.safeSymbol(marketId, market = market);
    markPrice = self.safeNumber(contract, "markPrice");
    indexPrice = self.safeNumber(contract, "indexPrice");
    interestRate = self.safeNumber(contract, "interestRate");
    fundingRate = self.safeNumber(contract, "funding_rate");
    fundingTime = safeInteger(contract, "next_funding_rate_timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => interestRate,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.whitebit.com/private/http-trade-v4/#funding-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch funding history for

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = since;
    end
    (request, params) = self.handleUntilOption("endDate", request, params);
    response = Base.fetch(self.v4PrivatePostCollateralAccountFundingHistory(request));
    data = self.safeList(response, "records", defaultValue = []);
    return self.parseFundingHistories(data, market = market, since = since, limit = limit)

end
function parseFundingHistory(self::Whitebit, contract; market=nothing)
    marketId = safeString(contract, "market");
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("code") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.safeNumber(contract, "fundingAmount")
)

end
function parseFundingHistories(self::Whitebit, contracts; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contracts)))
        contract = get(contracts, i + 1, nothing);
        push!(result, self.parseFundingHistory(contract, market = market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since = since, limit = limit)

end
"""
fetch history of deposits and withdrawals
see: https://github.com/whitebit-exchange/api-docs/blob/main/pages/private/http-main-v4.md#get-depositwithdraw-history

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.transactionMethod`::float, optional: Method. Example: 1 to display deposits / 2 to display withdraws. Do not send this parameter in order to receive both deposits and withdraws.
- `params.address`::string, optional: Can be used for filtering transactions by specific address or memo.
- `params.addresses`::array, optional: Can be used for filtering transactions by specific addresses or memos (max: 20).
- `params.uniqueId`::string, optional: Can be used for filtering transactions by specific unique id
- `params.offset`::int, optional: If you want the request to return entries starting from a particular line, you can use OFFSET clause to tell it where it should start. Default: 0, Min: 0, Max: 10000
- `params.status`::array, optional: Can be used for filtering transactions by status codes. Caution: You must use this parameter with appropriate transactionMethod and use valid status codes for this method. You can find them below. Example: "status": [3,7]

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Whitebit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ticker")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PrivatePostMainAccountHistory(extend(request, params)));
    records = self.safeList(response, "records");
    recordsList = [];
    if functions.ccxtruthy(records != nothing)
        recordsList = records;
    end
    return self.parseTransactions(recordsList, currency = currency, since = since, limit = limit)

end
"""
fetch a quote for converting from one currency to another
see: https://docs.whitebit.com/private/http-trade-v4/#convert-estimate

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertQuote(self::Whitebit, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    request = Dict{Symbol, Any}(
        Symbol("from") => fromCode,
        Symbol("to") => toCode,
        Symbol("amount") => numberToString(amount),
        Symbol("direction") => "from"
    );
    response = Base.fetch(self.v4PrivatePostConvertEstimate(extend(request, params)));
    return self.parseConversion(response, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
convert from one currency to another
see: https://docs.whitebit.com/private/http-trade-v4/#convert-confirm

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function createConvertTrade(self::Whitebit, id, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    request = Dict{Symbol, Any}(
        Symbol("quoteId") => id
    );
    response = Base.fetch(self.v4PrivatePostConvertConfirm(extend(request, params)));
    return self.parseConversion(response, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
fetch the users history of conversion trades
see: https://docs.whitebit.com/private/http-trade-v4/#convert-history

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve, default 20, max 200
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::string, optional: the end time in ms
- `params.fromTicker`::string, optional: the currency that you sold and converted from
- `params.toTicker`::string, optional: the currency that you bought and converted into
- `params.quoteId`::string, optional: the quote id of the conversion

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTradeHistory(self::Whitebit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        request[Symbol("fromTicker")] = code;
    end
    if functions.ccxtruthy(since != nothing)
        start = self.parseToInt(since / 1000);
        request[Symbol("from")] = numberToString(start);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("to", request, params, multiplier = 0.001);
    response = Base.fetch(self.v4PrivatePostConvertHistory(extend(request, params)));
    rows = self.safeList(response, "records", defaultValue = []);
    return self.parseConversions(rows, code = code, fromCurrencyKey = "fromCurrency", toCurrencyKey = "toCurrency", since = since, limit = limit)

end
function parseConversion(self::Whitebit, conversion; fromCurrency=nothing, toCurrency=nothing)
    path = self.safeList(conversion, "path", defaultValue = []);
    first_var = self.safeDict(path, 0, defaultValue = Dict{Symbol, Any}());
    fromPath = safeString(first_var, "from");
    toPath = safeString(first_var, "to");
    timestamp = safeTimestamp2(conversion, "date", "expireAt");
    fromCoin = safeString(conversion, "from", fromPath);
    fromCode = self.safeCurrencyCode(fromCoin, currency = fromCurrency);
    toCoin = safeString(conversion, "to", toPath);
    toCode = self.safeCurrencyCode(toCoin, currency = toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(conversion, "id"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber2(conversion, "give", "finalGive"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber2(conversion, "receive", "finalReceive"),
    Symbol("price") => self.safeNumber(conversion, "rate"),
    Symbol("fee") => nothing
)

end
"""
fetches historical positions
see: https://docs.whitebit.com/private/http-trade-v4/#positions-history

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::int, optional: the id of the requested position

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionHistory(self::Whitebit, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = since;
    end
    (request, params) = self.handleUntilOption("endDate", request, params);
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsHistory(extend(request, params)));
    positions = self.parsePositions(response);
    return self.filterBySymbolSinceLimit(positions, symbol = symbol, since = since, limit = limit)

end
"""
fetch all open positions
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Whitebit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(params));
    return self.parsePositions(response, symbols = symbols)

end
"""
fetch data on a single open contract trade position
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Whitebit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v4PrivatePostCollateralAccountPositionsOpen(extend(request, params)));
    data = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parsePosition(data, market = market)

end
function parsePosition(self::Whitebit, position; market=nothing)
    marketId = safeString(position, "market");
    timestamp = safeTimestamp(position, "openDate");
    tpsl = self.safeDict(position, "tpsl", defaultValue = Dict{Symbol, Any}());
    orderDetail = self.safeDict(position, "orderDetail", defaultValue = Dict{Symbol, Any}());
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "positionId"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("notional") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("entryPrice") => self.safeNumber(position, "basePrice"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "pnl"),
    Symbol("realizedPnl") => self.safeNumber(orderDetail, "realizedPnl"),
    Symbol("percentage") => self.safeNumber(position, "pnlPercent"),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => nothing,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeTimestamp(position, "modifyDate"),
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => self.safeNumber(position, "margin"),
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => self.safeNumber(tpsl, "stopLoss"),
    Symbol("takeProfitPrice") => self.safeNumber(tpsl, "takeProfit")
))

end
function isFiat(self::Whitebit, currency)
    fiatCurrencies = safeValue(self.options, "fiatCurrencies", []);
    return inArray(currency, fiatCurrencies)

end
"""
fetches historical funding rate prices
see: https://docs.whitebit.com/api-reference/market-data/funding-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch (default 100, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Whitebit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params, maxEntriesPerRequest = maxLimit))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startDate")] = round(since / 1000);
    end
    (request, params) = self.handleUntilOption("until_timestamp", request, params, multiplier = 0.001);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v4PublicGetFundingHistoryMarket(extend(request, params)));
    return self.parseFundingRateHistories(response, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Whitebit, info; market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeTimestamp(info, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(info, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function nonce(self::Whitebit, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Whitebit, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    version = safeValue(api, 0);
    accessibility = safeValue(api, 1);
    if functions.ccxtruthy(headers == nothing)
        headers = Dict{Symbol, Any}();
    end
    headers[Symbol("User-Agent")] = string("ccxt/", self.id, "-", self.version);
    pathWithParams = string("/", self.implodeParams(path, params));
    url = string(get(get(get(self.urls, Symbol("api"), nothing), Symbol(version), nothing), Symbol(accessibility), nothing), pathWithParams);
    if functions.ccxtruthy(accessibility == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(accessibility == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        secret = self.encode(self.secret);
        request = string("/", "api", "/", version, pathWithParams);
        (nonceWindow, requestParams) = self.handleOptionAndParams(params, "sign", "nonceWindow", defaultValue = false);
        body = json(extend(Dict{Symbol, Any}(
    Symbol("request") => request,
    Symbol("nonce") => nonce,
    Symbol("nonceWindow") => nonceWindow
), requestParams));
        payload = self.stringToBase64(body);
        signature = self.hmac(self.encode(payload), secret, sha512);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("X-TXC-APIKEY") => self.apiKey,
            Symbol("X-TXC-PAYLOAD") => payload,
            Symbol("X-TXC-SIGNATURE") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Whitebit, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 418), (code == 429)))
        throw(DDoSProtection(string(self.id, " ", code, " ", reason, " ", body)));
    end
    if functions.ccxtruthy(code == 404)
        throw(ExchangeError(string(self.id, " ", code, " endpoint not found")));
    end
    if functions.ccxtruthy(response != nothing)
        status = safeString(response, "status");
        errors = safeValue(response, "errors");
        message = safeString(response, "message");
        codeNew = safeInteger(response, "code");
        hasErrorStatus = @functions.ccxt_and(@functions.ccxt_and(status != nothing, status != "200"), errors != nothing);
        if functions.ccxtruthy(@functions.ccxt_or(hasErrorStatus, codeNew != nothing))
            feedback = string(self.id, " ", body);
            errorInfo = message;
            if functions.ccxtruthy(hasErrorStatus)
                errorInfo = status;
            else
                errorObject = self.safeDict(response, "errors", defaultValue = Dict{Symbol, Any}());
                errorKeys = objectKeys(errorObject);
                errorsLength = length(errorKeys);
                if functions.ccxtruthy(functions.ccxt_gt(errorsLength, 0))
                    errorKey = get(errorKeys, 1, nothing);
                    errorMessageArray = safeValue(errorObject, errorKey, []);
                    errorMessageLength = length(errorMessageArray);
                    errorInfo = functions.ccxtruthy((functions.ccxt_gt(errorMessageLength, 0))) ? get(errorMessageArray, 1, nothing) : body;
                end
            end
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorInfo, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            throw(ExchangeError(feedback));
        end
        success = self.safeBool(response, "success", defaultValue = true);
        if functions.ccxtruthy(!functions.ccxtruthy(success))
            errMsg = self.safeDict(response, "message", defaultValue = Dict{Symbol, Any}());
            errKeys = objectKeys(errMsg);
            errKeysLength = length(errKeys);
            errorInfo = body;
            if functions.ccxtruthy(functions.ccxt_gt(errKeysLength, 0))
                errorKey = get(errKeys, 1, nothing);
                errorMessageArray = self.safeList(errMsg, errorKey, defaultValue = []);
                errorMessageLength = length(errorMessageArray);
                errorInfo = functions.ccxtruthy((functions.ccxt_gt(errorMessageLength, 0))) ? get(errorMessageArray, 1, nothing) : body;
            end
            feedback = string(self.id, " ", body);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorInfo, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            throw(ExchangeError(feedback));
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Whitebit, name::Symbol) = ccxt_getproperty(self, name)

function Whitebit(; kwargs...)
    inst = Whitebit(Exchange(), describe, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFees, fetchTradingFees, fetchTradingLimits, fetchFundingLimits, fetchTicker, parseTicker, fetchOrder, fetchTickers, fetchOrderBook, fetchTrades, fetchMyTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchStatus, fetchTime, createMarketOrderWithCost, createMarketBuyOrderWithCost, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOrders, cancelAllOrdersAfter, parseBalance, fetchBalance, fetchOpenOrders, fetchClosedOrders, parseOrderType, parseOrder, parseOrderStatus, fetchOrderTrades, fetchWithdrawals, fetchTransactions, fetchDepositAddress, createDepositAddress, parseDepositAddress, fetchAccounts, setLeverage, transfer, parseTransfer, withdraw, parseTransaction, parseTransactionStatus, fetchDeposit, fetchDeposits, fetchBorrowInterest, parseBorrowInterest, fetchFundingRate, fetchFundingRates, parseFundingRate, fetchFundingHistory, parseFundingHistory, parseFundingHistories, fetchDepositsWithdrawals, fetchConvertQuote, createConvertTrade, fetchConvertTradeHistory, parseConversion, fetchPositionHistory, fetchPositions, fetchPosition, parsePosition, isFiat, fetchFundingRateHistory, parseFundingRateHistory, nonce, sign, handleErrors)
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
function __ccxt_doc_Whitebit_fetchMarkets() end
"""
retrieves data on all markets for whitebit
see: https://docs.whitebit.com/public/http-v4/#market-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Whitebit_fetchMarkets

function __ccxt_doc_Whitebit_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.whitebit.com/public/http-v4/#asset-status-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Whitebit_fetchCurrencies

function __ccxt_doc_Whitebit_fetchTransactionFees() end
"""
please use fetchDepositWithdrawFees instead
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: not used by fetchTransactionFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Whitebit_fetchTransactionFees

function __ccxt_doc_Whitebit_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Whitebit_fetchDepositWithdrawFees

function __ccxt_doc_Whitebit_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.whitebit.com/public/http-v4/#asset-status-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Whitebit_fetchTradingFees

function __ccxt_doc_Whitebit_fetchTradingLimits() end
"""
fetch the trading limits for a market
see: https://docs.whitebit.com/public/http-v4/#market-info

# Arguments
- `symbols`::any: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [trading limits structure]{@link https://docs.ccxt.com/?id=trading-limits-structure}
"""
__ccxt_doc_Whitebit_fetchTradingLimits

function __ccxt_doc_Whitebit_fetchFundingLimits() end
"""
fetch the deposit and withdrawal limits for a currency
see: https://docs.whitebit.com/public/http-v4/#asset-status-list
see: https://docs.whitebit.com/public/http-v4/#fee

# Arguments
- `codes`::any: unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding limits structure]{@link https://docs.ccxt.com/?id=funding-limits-structure}
"""
__ccxt_doc_Whitebit_fetchFundingLimits

function __ccxt_doc_Whitebit_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.whitebit.com/public/http-v4/#market-activity

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Whitebit_fetchTicker

function __ccxt_doc_Whitebit_fetchOrder() end
"""
fetches information on an order by the id
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.checkActive`::bool, optional: whether to check active orders (default: true)
- `params.checkExecuted`::bool, optional: whether to check executed orders (default: true)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_fetchOrder

function __ccxt_doc_Whitebit_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.whitebit.com/public/http-v4/#market-activity

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - default is 'spot'. If type is 'swap', it will call v4PublicGetFutures
- `params.method`::string, optional: either v2PublicGetTicker or v4PublicGetTicker or v4PublicGetFutures - default is v4PublicGetTicker for spot and mixed markets, and v4PublicGetFutures for swap

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Whitebit_fetchTickers

function __ccxt_doc_Whitebit_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.whitebit.com/public/http-v4/#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Whitebit_fetchOrderBook

function __ccxt_doc_Whitebit_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.whitebit.com/public/http-v4/#recent-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Whitebit_fetchTrades

function __ccxt_doc_Whitebit_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Whitebit_fetchMyTrades

function __ccxt_doc_Whitebit_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.whitebit.com/public/http-v1/#kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Whitebit_fetchOHLCV

function __ccxt_doc_Whitebit_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://docs.whitebit.com/public/http-v4/#server-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Whitebit_fetchStatus

function __ccxt_doc_Whitebit_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.whitebit.com/public/http-v4/#server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Whitebit_fetchTime

function __ccxt_doc_Whitebit_createMarketOrderWithCost() end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_createMarketOrderWithCost

function __ccxt_doc_Whitebit_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_createMarketBuyOrderWithCost

function __ccxt_doc_Whitebit_createOrder() end
"""
create a trade order
see: https://docs.whitebit.com/private/http-trade-v4/#create-limit-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-market-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-buy-stock-market-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-stop-limit-order
see: https://docs.whitebit.com/private/http-trade-v4/#create-stop-market-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *market orders only* the cost of the order in units of the base currency
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: If true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC", "IOC" or "PO"; IOC and PO are limit-order only, not supported for stop orders
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_createOrder

function __ccxt_doc_Whitebit_editOrder() end
"""
edit a trade order
see: https://docs.whitebit.com/private/http-trade-v4/#modify-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_editOrder

function __ccxt_doc_Whitebit_cancelOrder() end
"""
cancels an open order
see: https://docs.whitebit.com/private/http-trade-v4/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_cancelOrder

function __ccxt_doc_Whitebit_cancelAllOrders() end
"""
cancel all open orders
see: https://docs.whitebit.com/private/http-trade-v4/#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'spot']
- `params.isMargin`::bool, optional: cancel all margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_cancelAllOrders

function __ccxt_doc_Whitebit_fetchOrders() end
"""
fetches information on multiple orders made by the user (combines open and closed orders)
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_fetchOrders

function __ccxt_doc_Whitebit_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout
see: https://docs.whitebit.com/private/http-trade-v4/#sync-kill-switch-timer

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.types`::string, optional: Order types value. Example: "spot", "margin", "futures" or null
- `params.symbol`::string, optional: symbol unified symbol of the market the order was made in

# Returns
- the api result
"""
__ccxt_doc_Whitebit_cancelAllOrdersAfter

function __ccxt_doc_Whitebit_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.whitebit.com/private/http-main-v4/#main-balance
see: https://docs.whitebit.com/private/http-trade-v4/#trading-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Whitebit_fetchBalance

function __ccxt_doc_Whitebit_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_fetchOpenOrders

function __ccxt_doc_Whitebit_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Whitebit_fetchClosedOrders

function __ccxt_doc_Whitebit_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-deals

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Whitebit_fetchOrderTrades

function __ccxt_doc_Whitebit_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transactionMethod`::string, optional: transaction method (1=deposit, 2=withdrawal) - automatically set to '2' for withdrawals

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_fetchWithdrawals

function __ccxt_doc_Whitebit_fetchTransactions() end
"""
fetch history of deposits and withdrawals
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch transactions for
- `limit`::int, optional: the maximum number of transactions structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transactionMethod`::string, optional: transaction method (1=deposit, 2=withdrawal) - automatically set to '1' for deposits

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_fetchTransactions

function __ccxt_doc_Whitebit_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.whitebit.com/private/http-main-v4/#get-fiat-deposit-address
see: https://docs.whitebit.com/private/http-main-v4/#get-cryptocurrency-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Whitebit_fetchDepositAddress

function __ccxt_doc_Whitebit_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.whitebit.com/private/http-main-v4/#create-new-address-for-deposit

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on
- `params.type`::string, optional: address type, available for specific currencies

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Whitebit_createDepositAddress

function __ccxt_doc_Whitebit_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://docs.whitebit.com/private/http-main-v4/#sub-account-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
"""
__ccxt_doc_Whitebit_fetchAccounts

function __ccxt_doc_Whitebit_setLeverage() end
"""
set the level of leverage for a market
see: https://docs.whitebit.com/private/http-trade-v4/#change-collateral-account-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Whitebit_setLeverage

function __ccxt_doc_Whitebit_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://docs.whitebit.com/private/http-main-v4/#transfer-between-main-and-trade-balances

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from - main, spot, collateral
- `toAccount`::string: account to transfer to - main, spot, collateral
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Whitebit_transfer

function __ccxt_doc_Whitebit_withdraw() end
"""
make a withdrawal
see: https://docs.whitebit.com/private/http-main-v4/#create-withdraw-request

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_withdraw

function __ccxt_doc_Whitebit_fetchDeposit() end
"""
fetch information on a deposit
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `id`::string: deposit id
- `code`::string: not used by fetchDeposit ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_fetchDeposit

function __ccxt_doc_Whitebit_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_fetchDeposits

function __ccxt_doc_Whitebit_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `code`::string: unified currency code
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Whitebit_fetchBorrowInterest

function __ccxt_doc_Whitebit_fetchFundingRate() end
"""
fetch the current funding rate
see: https://docs.whitebit.com/public/http-v4/#available-futures-markets-list

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Whitebit_fetchFundingRate

function __ccxt_doc_Whitebit_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://docs.whitebit.com/public/http-v4/#available-futures-markets-list

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Whitebit_fetchFundingRates

function __ccxt_doc_Whitebit_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.whitebit.com/private/http-trade-v4/#funding-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch funding history for

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Whitebit_fetchFundingHistory

function __ccxt_doc_Whitebit_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://github.com/whitebit-exchange/api-docs/blob/main/pages/private/http-main-v4.md#get-depositwithdraw-history

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.transactionMethod`::float, optional: Method. Example: 1 to display deposits / 2 to display withdraws. Do not send this parameter in order to receive both deposits and withdraws.
- `params.address`::string, optional: Can be used for filtering transactions by specific address or memo.
- `params.addresses`::array, optional: Can be used for filtering transactions by specific addresses or memos (max: 20).
- `params.uniqueId`::string, optional: Can be used for filtering transactions by specific unique id
- `params.offset`::int, optional: If you want the request to return entries starting from a particular line, you can use OFFSET clause to tell it where it should start. Default: 0, Min: 0, Max: 10000
- `params.status`::array, optional: Can be used for filtering transactions by status codes. Caution: You must use this parameter with appropriate transactionMethod and use valid status codes for this method. You can find them below. Example: "status": [3,7]

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Whitebit_fetchDepositsWithdrawals

function __ccxt_doc_Whitebit_fetchConvertQuote() end
"""
fetch a quote for converting from one currency to another
see: https://docs.whitebit.com/private/http-trade-v4/#convert-estimate

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Whitebit_fetchConvertQuote

function __ccxt_doc_Whitebit_createConvertTrade() end
"""
convert from one currency to another
see: https://docs.whitebit.com/private/http-trade-v4/#convert-confirm

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Whitebit_createConvertTrade

function __ccxt_doc_Whitebit_fetchConvertTradeHistory() end
"""
fetch the users history of conversion trades
see: https://docs.whitebit.com/private/http-trade-v4/#convert-history

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve, default 20, max 200
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::string, optional: the end time in ms
- `params.fromTicker`::string, optional: the currency that you sold and converted from
- `params.toTicker`::string, optional: the currency that you bought and converted into
- `params.quoteId`::string, optional: the quote id of the conversion

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Whitebit_fetchConvertTradeHistory

function __ccxt_doc_Whitebit_fetchPositionHistory() end
"""
fetches historical positions
see: https://docs.whitebit.com/private/http-trade-v4/#positions-history

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::int, optional: the id of the requested position

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Whitebit_fetchPositionHistory

function __ccxt_doc_Whitebit_fetchPositions() end
"""
fetch all open positions
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Whitebit_fetchPositions

function __ccxt_doc_Whitebit_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://docs.whitebit.com/private/http-trade-v4/#open-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Whitebit_fetchPosition

function __ccxt_doc_Whitebit_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://docs.whitebit.com/api-reference/market-data/funding-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch (default 100, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Whitebit_fetchFundingRateHistory
