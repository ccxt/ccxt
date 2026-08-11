@kwdef mutable struct Backpack <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseMarketType::Function = parseMarketType
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    createOrderRequest::Function = createOrderRequest
    encodeOrderSide::Function = encodeOrderSide
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrder::Function = fetchOpenOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrders::Function = fetchOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderSide::Function = parseOrderSide
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    nonce::Function = nonce
    sign::Function = sign
    generateBatchPayload::Function = generateBatchPayload
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetApiV1Assets::Function = publicGetApiV1Assets
    publicGetApiV1Collateral::Function = publicGetApiV1Collateral
    publicGetApiV1BorrowLendMarkets::Function = publicGetApiV1BorrowLendMarkets
    publicGetApiV1BorrowLendMarketsHistory::Function = publicGetApiV1BorrowLendMarketsHistory
    publicGetApiV1Markets::Function = publicGetApiV1Markets
    publicGetApiV1Market::Function = publicGetApiV1Market
    publicGetApiV1Ticker::Function = publicGetApiV1Ticker
    publicGetApiV1Tickers::Function = publicGetApiV1Tickers
    publicGetApiV1Depth::Function = publicGetApiV1Depth
    publicGetApiV1Klines::Function = publicGetApiV1Klines
    publicGetApiV1MarkPrices::Function = publicGetApiV1MarkPrices
    publicGetApiV1OpenInterest::Function = publicGetApiV1OpenInterest
    publicGetApiV1FundingRates::Function = publicGetApiV1FundingRates
    publicGetApiV1Status::Function = publicGetApiV1Status
    publicGetApiV1Ping::Function = publicGetApiV1Ping
    publicGetApiV1Time::Function = publicGetApiV1Time
    publicGetApiV1Wallets::Function = publicGetApiV1Wallets
    publicGetApiV1Trades::Function = publicGetApiV1Trades
    publicGetApiV1TradesHistory::Function = publicGetApiV1TradesHistory
    privateGetApiV1Account::Function = privateGetApiV1Account
    privateGetApiV1AccountLimitsBorrow::Function = privateGetApiV1AccountLimitsBorrow
    privateGetApiV1AccountLimitsOrder::Function = privateGetApiV1AccountLimitsOrder
    privateGetApiV1AccountLimitsWithdrawal::Function = privateGetApiV1AccountLimitsWithdrawal
    privateGetApiV1BorrowLendPositions::Function = privateGetApiV1BorrowLendPositions
    privateGetApiV1Capital::Function = privateGetApiV1Capital
    privateGetApiV1CapitalCollateral::Function = privateGetApiV1CapitalCollateral
    privateGetWapiV1CapitalDeposits::Function = privateGetWapiV1CapitalDeposits
    privateGetWapiV1CapitalDepositAddress::Function = privateGetWapiV1CapitalDepositAddress
    privateGetWapiV1CapitalWithdrawals::Function = privateGetWapiV1CapitalWithdrawals
    privateGetApiV1Position::Function = privateGetApiV1Position
    privateGetWapiV1HistoryBorrowLend::Function = privateGetWapiV1HistoryBorrowLend
    privateGetWapiV1HistoryInterest::Function = privateGetWapiV1HistoryInterest
    privateGetWapiV1HistoryBorrowLendPositions::Function = privateGetWapiV1HistoryBorrowLendPositions
    privateGetWapiV1HistoryDust::Function = privateGetWapiV1HistoryDust
    privateGetWapiV1HistoryFills::Function = privateGetWapiV1HistoryFills
    privateGetWapiV1HistoryFunding::Function = privateGetWapiV1HistoryFunding
    privateGetWapiV1HistoryOrders::Function = privateGetWapiV1HistoryOrders
    privateGetWapiV1HistoryRfq::Function = privateGetWapiV1HistoryRfq
    privateGetWapiV1HistoryQuote::Function = privateGetWapiV1HistoryQuote
    privateGetWapiV1HistorySettlement::Function = privateGetWapiV1HistorySettlement
    privateGetWapiV1HistoryStrategies::Function = privateGetWapiV1HistoryStrategies
    privateGetApiV1Order::Function = privateGetApiV1Order
    privateGetApiV1Orders::Function = privateGetApiV1Orders
    privatePostApiV1AccountConvertDust::Function = privatePostApiV1AccountConvertDust
    privatePostApiV1BorrowLend::Function = privatePostApiV1BorrowLend
    privatePostWapiV1CapitalWithdrawals::Function = privatePostWapiV1CapitalWithdrawals
    privatePostApiV1Order::Function = privatePostApiV1Order
    privatePostApiV1Orders::Function = privatePostApiV1Orders
    privatePostApiV1Rfq::Function = privatePostApiV1Rfq
    privatePostApiV1RfqAccept::Function = privatePostApiV1RfqAccept
    privatePostApiV1RfqRefresh::Function = privatePostApiV1RfqRefresh
    privatePostApiV1RfqCancel::Function = privatePostApiV1RfqCancel
    privatePostApiV1RfqQuote::Function = privatePostApiV1RfqQuote
    privateDeleteApiV1Order::Function = privateDeleteApiV1Order
    privateDeleteApiV1Orders::Function = privateDeleteApiV1Orders
    privatePatchApiV1Account::Function = privatePatchApiV1Account

end
function describe(self::Backpack, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "backpack",
    Symbol("name") => "Backpack",
    Symbol("countries") => ["JP"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v1",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("cancelWithdraw") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrder") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLossOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledAndClosedOrders") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15") => "15m",
        Symbol("30") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1month"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/7f682234-3eb1-48ab-a5ec-250a3227c985",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.backpack.exchange",
            Symbol("private") => "https://api.backpack.exchange"
        ),
        Symbol("www") => "https://backpack.exchange/",
        Symbol("doc") => "https://docs.backpack.exchange/",
        Symbol("referral") => "https://backpack.exchange/join/ccxt"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/borrowLend/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/borrowLend/markets/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/markPrices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/fundingRates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/wallets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/trades/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/limits/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/limits/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/limits/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/borrowLend/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/capital") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/capital/collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/capital/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/capital/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/borrowLend") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/borrowLend/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/dust") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/settlement") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/history/strategies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("api/v1/account/convertDust") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/borrowLend") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wapi/v1/capital/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/rfq/accept") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/rfq/refresh") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/rfq/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/rfq/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("api/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("patch") => Dict{Symbol, Any}(
                Symbol("api/v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("GTC") => true,
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => Dict{Symbol, Any}(
                    Symbol("EXPIRE_MAKER") => true,
                    Symbol("EXPIRE_TAKER") => true,
                    Symbol("EXPIRE_BOTH") => true,
                    Symbol("NONE") => false
                ),
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("paginate") => false,
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
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
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("instructions") => Dict{Symbol, Any}(
            Symbol("api/v1/account") => Dict{Symbol, Any}(
                Symbol("GET") => "accountQuery",
                Symbol("PATCH") => "accountUpdate"
            ),
            Symbol("api/v1/capital") => Dict{Symbol, Any}(
                Symbol("GET") => "balanceQuery"
            ),
            Symbol("api/v1/account/limits/borrow") => Dict{Symbol, Any}(
                Symbol("GET") => "maxBorrowQuantity"
            ),
            Symbol("api/v1/account/limits/order") => Dict{Symbol, Any}(
                Symbol("GET") => "maxOrderQuantity"
            ),
            Symbol("api/v1/account/limits/withdrawal") => Dict{Symbol, Any}(
                Symbol("GET") => "maxWithdrawalQuantity"
            ),
            Symbol("api/v1/borrowLend/positions") => Dict{Symbol, Any}(
                Symbol("GET") => "borrowLendPositionQuery"
            ),
            Symbol("api/v1/borrowLend") => Dict{Symbol, Any}(
                Symbol("POST") => "borrowLendExecute"
            ),
            Symbol("wapi/v1/history/borrowLend/positions") => Dict{Symbol, Any}(
                Symbol("GET") => "borrowPositionHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/borrowLend") => Dict{Symbol, Any}(
                Symbol("GET") => "borrowHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/dust") => Dict{Symbol, Any}(
                Symbol("GET") => "dustHistoryQueryAll"
            ),
            Symbol("api/v1/capital/collateral") => Dict{Symbol, Any}(
                Symbol("GET") => "collateralQuery"
            ),
            Symbol("wapi/v1/capital/deposit/address") => Dict{Symbol, Any}(
                Symbol("GET") => "depositAddressQuery"
            ),
            Symbol("wapi/v1/capital/deposits") => Dict{Symbol, Any}(
                Symbol("GET") => "depositQueryAll"
            ),
            Symbol("wapi/v1/history/fills") => Dict{Symbol, Any}(
                Symbol("GET") => "fillHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/funding") => Dict{Symbol, Any}(
                Symbol("GET") => "fundingHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/interest") => Dict{Symbol, Any}(
                Symbol("GET") => "interestHistoryQueryAll"
            ),
            Symbol("api/v1/order") => Dict{Symbol, Any}(
                Symbol("GET") => "orderQuery",
                Symbol("POST") => "orderExecute",
                Symbol("DELETE") => "orderCancel"
            ),
            Symbol("api/v1/orders") => Dict{Symbol, Any}(
                Symbol("GET") => "orderQueryAll",
                Symbol("POST") => "orderExecute",
                Symbol("DELETE") => "orderCancelAll"
            ),
            Symbol("wapi/v1/history/orders") => Dict{Symbol, Any}(
                Symbol("GET") => "orderHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/pnl") => Dict{Symbol, Any}(
                Symbol("GET") => "pnlHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/rfq") => Dict{Symbol, Any}(
                Symbol("GET") => "rfqHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/quote") => Dict{Symbol, Any}(
                Symbol("GET") => "quoteHistoryQueryAll"
            ),
            Symbol("wapi/v1/history/settlement") => Dict{Symbol, Any}(
                Symbol("GET") => "settlementHistoryQueryAll"
            ),
            Symbol("api/v1/position") => Dict{Symbol, Any}(
                Symbol("GET") => "positionQuery"
            ),
            Symbol("api/v1/rfq/quote") => Dict{Symbol, Any}(
                Symbol("POST") => "quoteSubmit"
            ),
            Symbol("wapi/v1/history/strategies") => Dict{Symbol, Any}(
                Symbol("GET") => "strategyHistoryQueryAll"
            ),
            Symbol("wapi/v1/capital/withdrawals") => Dict{Symbol, Any}(
                Symbol("GET") => "withdrawalQueryAll",
                Symbol("POST") => "withdraw"
            )
        ),
        Symbol("recvWindow") => 5000,
        Symbol("brokerId") => "",
        Symbol("currencyIdsListForParseMarket") => nothing,
        Symbol("broker") => "",
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("APT") => "Aptos",
            Symbol("ARBITRUM") => "Arbitrum",
            Symbol("AVAX") => "Avalanche",
            Symbol("BASE") => "Base",
            Symbol("BERA") => "Berachain",
            Symbol("BTC") => "Bitcoin",
            Symbol("BCH") => "BitcoinCash",
            Symbol("BSC") => "Bsc",
            Symbol("ADA") => "Cardano",
            Symbol("DOGE") => "Dogecoin",
            Symbol("ECLIPSE") => "Eclipse",
            Symbol("EQUALSMONEY") => "EqualsMoney",
            Symbol("ERC20") => "Ethereum",
            Symbol("HYP") => "Hyperliquid",
            Symbol("LTC") => "Litecoin",
            Symbol("OPTIMISM") => "Optimism",
            Symbol("MATIC") => "Polygon",
            Symbol("SEI") => "Sei",
            Symbol("SUI") => "Sui",
            Symbol("SOL") => "Solana",
            Symbol("STORY") => "Story",
            Symbol("TRC20") => "Tron",
            Symbol("XRP") => "XRP"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("aptos") => "APT",
            Symbol("arbitrum") => "ARBITRUM",
            Symbol("avalanche") => "AVAX",
            Symbol("base") => "BASE",
            Symbol("berachain") => "BERA",
            Symbol("bitcoin") => "BTC",
            Symbol("bitcoincash") => "BCH",
            Symbol("bsc") => "BSC",
            Symbol("cardano") => "ADA",
            Symbol("dogecoin") => "DOGE",
            Symbol("eclipse") => "ECLIPSE",
            Symbol("equalsmoney") => "EQUALSMONEY",
            Symbol("ethereum") => "ERC20",
            Symbol("hyperliquid") => "HYP",
            Symbol("litecoin") => "LTC",
            Symbol("optimism") => "OPTIMISM",
            Symbol("polygon") => "MATIC",
            Symbol("sei") => "SEI",
            Symbol("sui") => "SUI",
            Symbol("solana") => "SOL",
            Symbol("story") => "STORY",
            Symbol("tron") => "TRC20",
            Symbol("xrp") => "XRP"
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("INVALID_CLIENT_REQUEST") => BadRequest,
            Symbol("INVALID_ORDER") => InvalidOrder,
            Symbol("ACCOUNT_LIQUIDATING") => BadRequest,
            Symbol("BORROW_LIMIT") => BadRequest,
            Symbol("BORROW_REQUIRES_LEND_REDEEM") => BadRequest,
            Symbol("FORBIDDEN") => OperationRejected,
            Symbol("INSUFFICIENT_FUNDS") => InsufficientFunds,
            Symbol("INSUFFICIENT_MARGIN") => InsufficientFunds,
            Symbol("INSUFFICIENT_SUPPLY") => InsufficientFunds,
            Symbol("INVALID_ASSET") => BadRequest,
            Symbol("INVALID_MARKET") => BadSymbol,
            Symbol("INVALID_PRICE") => InvalidOrder,
            Symbol("INVALID_POSITION_ID") => BadRequest,
            Symbol("INVALID_QUANTITY") => BadRequest,
            Symbol("INVALID_RANGE") => BadRequest,
            Symbol("INVALID_SIGNATURE") => AuthenticationError,
            Symbol("INVALID_SOURCE") => BadRequest,
            Symbol("INVALID_SYMBOL") => BadSymbol,
            Symbol("INVALID_TWO_FACTOR_CODE") => BadRequest,
            Symbol("LEND_LIMIT") => BadRequest,
            Symbol("LEND_REQUIRES_BORROW_REPAY") => BadRequest,
            Symbol("MAINTENANCE") => ExchangeError,
            Symbol("MAX_LEVERAGE_REACHED") => InsufficientFunds,
            Symbol("NOT_IMPLEMENTED") => OperationFailed,
            Symbol("ORDER_LIMIT") => OperationRejected,
            Symbol("POSITION_LIMIT") => OperationRejected,
            Symbol("PRECONDITION_FAILED") => OperationFailed,
            Symbol("RESOURCE_NOT_FOUND") => ExchangeNotAvailable,
            Symbol("SERVER_ERROR") => NetworkError,
            Symbol("TIMEOUT") => RequestTimeout,
            Symbol("TOO_MANY_REQUESTS") => RateLimitExceeded,
            Symbol("TRADING_PAUSED") => ExchangeNotAvailable,
            Symbol("UNAUTHORIZED") => AuthenticationError
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function fetchCurrencies(self::Backpack, params=Dict())
    response = Base.fetch(self.publicGetApiV1Assets(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Backpack, rawCurrency)
    currencyId = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(currencyId);
    networks = self.safeList(rawCurrency, "tokens", []);
    parsedNetworks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networks)))
        network = get(networks, j + 1, nothing);
        networkId = safeString(network, "blockchain");
        networkIdLowerCase = safeStringLower(network, "blockchain");
        networkCode = self.networkIdToCode(networkIdLowerCase, code);
        if functions.ccxtruthy(networkCode != nothing)
            parsedNetworks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(network, "minimumWithdrawal"),
                        Symbol("max") => self.parseNumber(omitZero(safeString(network, "maximumWithdrawal")))
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(network, "minimumDeposit"),
                        Symbol("max") => nothing
                    )
                ),
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(network, "depositEnabled"),
                Symbol("withdraw") => self.safeBool(network, "withdrawEnabled"),
                Symbol("fee") => self.safeNumber(network, "withdrawalFee"),
                Symbol("precision") => nothing,
                Symbol("info") => network
            );
        end
        j += 1
    end
    active = nothing;
    deposit = nothing;
    withdraw = nothing;
    if functions.ccxtruthy(isEmpty(parsedNetworks))
        active = false;
        deposit = false;
        withdraw = false;
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("type") => "crypto",
    Symbol("name") => safeString(rawCurrency, "displayName"),
    Symbol("active") => active,
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdraw,
    Symbol("fee") => nothing,
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
    Symbol("networks") => parsedNetworks,
    Symbol("info") => rawCurrency
))

end
function fetchMarkets(self::Backpack, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    response = Base.fetch(self.publicGetApiV1Markets(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Backpack, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseSymbol");
    quoteId = safeString(market, "quoteSymbol");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    filters = self.safeDict(market, "filters", Dict{Symbol, Any}());
    priceFilter = self.safeDict(filters, "price", Dict{Symbol, Any}());
    maxPrice = self.safeNumber(priceFilter, "maxPrice");
    minPrice = self.safeNumber(priceFilter, "minPrice");
    pricePrecision = self.safeNumber(priceFilter, "tickSize");
    quantityFilter = self.safeDict(filters, "quantity", Dict{Symbol, Any}());
    maxQuantity = self.safeNumber(quantityFilter, "maxQuantity");
    minQuantity = self.safeNumber(quantityFilter, "minQuantity");
    amountPrecision = self.safeNumber(quantityFilter, "stepSize");
    type_var = nothing;
    typeOfMarket = self.parseMarketType(safeString(market, "marketType"));
    linear = nothing;
    inverse = nothing;
    settle = nothing;
    settleId = nothing;
    contractSize = nothing;
    if functions.ccxtruthy(typeOfMarket == "spot")
        type_var = "spot";
    elseif functions.ccxtruthy(typeOfMarket == "swap")
        type_var = "swap";
        linear = true;
        inverse = false;
        settleId = safeString(market, "quoteSymbol");
        settle = self.safeCurrencyCode(settleId);
        symbol += string(":", settle);
        contractSize = 1;
    end
    orderBookState = safeString(market, "orderBookState");
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => type_var == "spot",
    Symbol("margin") => type_var == "spot",
    Symbol("swap") => type_var == "swap",
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => orderBookState == "Open",
    Symbol("contract") => type_var != "spot",
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => nothing,
    Symbol("maker") => nothing,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minQuantity,
            Symbol("max") => maxQuantity
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => minPrice,
            Symbol("max") => maxPrice
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => self.parse8601(safeString(market, "createdAt")),
    Symbol("info") => market
))

end
function parseMarketType(self::Backpack, type_var)
    types = Dict{Symbol, Any}(
        Symbol("SPOT") => "spot",
        Symbol("PERP") => "swap"
    );
    return safeString(types, type_var, type_var)

end
function fetchTickers(self::Backpack, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.publicGetApiV1Tickers(extend(request, params)));
    tickers = self.parseTickers(response);
    return self.filterByArrayTickers(tickers, "symbol", symbols)

end
function fetchTicker(self::Backpack, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiV1Ticker(extend(request, params)));
    return self.parseTicker(response, market)

end
function parseTicker(self::Backpack, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = self.safeSymbol(marketId, market);
    open = safeString(ticker, "firstPrice");
    last_var = safeString(ticker, "lastPrice");
    high = safeString(ticker, "high");
    low = safeString(ticker, "low");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = safeString(ticker, "quoteVolume");
    percentage = nothing;
    percentageNumber = safeFloat(ticker, "priceChangePercent");
    if functions.ccxtruthy(percentageNumber != nothing)
        percentage = stringMul(safeString(ticker, "priceChangePercent"), "100");
    end
    change = safeString(ticker, "priceChange");
    parsedTicker = self.safeTicker(Dict{Symbol, Any}(
        Symbol("symbol") => symbol,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing,
        Symbol("high") => high,
        Symbol("low") => low,
        Symbol("bid") => nothing,
        Symbol("bidVolume") => nothing,
        Symbol("ask") => nothing,
        Symbol("askVolume") => nothing,
        Symbol("vwap") => nothing,
        Symbol("open") => open,
        Symbol("close") => last_var,
        Symbol("last") => last_var,
        Symbol("previousClose") => nothing,
        Symbol("change") => change,
        Symbol("percentage") => percentage,
        Symbol("average") => nothing,
        Symbol("baseVolume") => baseVolume,
        Symbol("quoteVolume") => quoteVolume,
        Symbol("markPrice") => nothing,
        Symbol("indexPrice") => nothing,
        Symbol("info") => ticker
    ), market);
    return parsedTicker

end
function fetchOrderBook(self::Backpack, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiV1Depth(extend(request, params)));
    microseconds = safeInteger(response, "timestamp");
    if functions.ccxtruthy(microseconds == nothing)
        throw(ExchangeError(string(self.id, " fetchOrderBook() missing microseconds")));
    end
    timestamp = self.parseToInt(microseconds / 1000);
    orderbook = self.parseOrderBook(response, symbol, timestamp);
    orderbook[Symbol("nonce")] = safeInteger(response, "lastUpdateId");
    return orderbook

end
function fetchOHLCV(self::Backpack, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    interval = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval
    );
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchOHLCV", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = self.parseToInt(until / 1000);
    end
    defaultLimit = 100;
    if functions.ccxtruthy(since == nothing)
        if functions.ccxtruthy(limit == nothing)
            limit = defaultLimit;
        end
        duration = self.parseTimeframe(timeframe);
        endTime = functions.ccxtruthy(until) ? self.parseToInt(until / 1000) : seconds();
        startTime = endTime - (limit * duration);
        request[Symbol("startTime")] = startTime;
    else
        request[Symbol("startTime")] = self.parseToInt(since / 1000);
    end
    price = safeString(params, "price");
    if functions.ccxtruthy(price != nothing)
        request[Symbol("priceType")] = capitalize(price);
        params = omit(params, "price");
    end
    response = Base.fetch(self.publicGetApiV1Klines(extend(request, params)));
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Backpack, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, "start")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchFundingRate(self::Backpack, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(BadRequest(string(self.id, " fetchFundingRate() symbol does not support market ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiV1MarkPrices(extend(request, params)));
    data = self.safeDict(response, 0, Dict{Symbol, Any}());
    return self.parseFundingRate(data, market)

end
function parseFundingRate(self::Backpack, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = self.safeSymbol(marketId, market);
    nextFundingTimestamp = safeInteger(contract, "nextFundingTimestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => self.safeNumber(contract, "markPrice"),
    Symbol("indexPrice") => self.safeNumber(contract, "indexPrice"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "1h"
)

end
function fetchOpenInterest(self::Backpack, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(BadRequest(string(self.id, " fetchOpenInterest() symbol does not support market ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiV1OpenInterest(extend(request, params)));
    interest = self.safeDict(response, 0, Dict{Symbol, Any}());
    return self.parseOpenInterest(interest, market)

end
function parseOpenInterest(self::Backpack, interest, market=nothing)
    timestamp = safeInteger(interest, "timestamp");
    openInterest = self.safeNumber(interest, "openInterest");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => nothing,
    Symbol("openInterestValue") => openInterest,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function fetchFundingRateHistory(self::Backpack, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = Base.fetch(self.publicGetApiV1FundingRates(extend(request, params)));
    rates = [];
    rawRates = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawRates)))
        rate = get(rawRates, i + 1, nothing);
        datetime = safeString(rate, "intervalEndTimestamp");
        timestamp = self.parse8601(datetime);
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => rate,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(rate, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function fetchTrades(self::Backpack, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = nothing;
    offset = safeInteger(params, "offset");
    if functions.ccxtruthy(offset != nothing)
        response = Base.fetch(self.publicGetApiV1TradesHistory(extend(request, params)));
    else
        response = Base.fetch(self.publicGetApiV1Trades(extend(request, params)));
    end
    responseList = toArray(response);
    return self.parseTrades(responseList, market, since, limit)

end
function fetchMyTrades(self::Backpack, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("to")] = until;
    end
    fillType = safeString(params, "fillType");
    if functions.ccxtruthy(fillType == nothing)
        request[Symbol("fillType")] = "User";
    end
    response = Base.fetch(self.privateGetWapiV1HistoryFills(extend(request, params)));
    responseList = toArray(response);
    return self.parseTrades(responseList, market, since, limit)

end
function parseTrade(self::Backpack, trade, market=nothing)
    id = safeString2(trade, "id", "tradeId");
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    price = safeString(trade, "price");
    amount = safeString(trade, "quantity");
    isBuyerMaker = self.safeBool(trade, "isBuyerMaker");
    side = self.parseOrderSide(safeString(trade, "side"));
    isMaker = self.safeBool(trade, "isMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    elseif functions.ccxtruthy(isBuyerMaker != nothing)
        takerOrMaker = "taker";
        side = functions.ccxtruthy(isBuyerMaker) ? "sell" : "buy";
    end
    orderId = safeString(trade, "orderId");
    fee = nothing;
    feeAmount = safeString(trade, "fee");
    timestamp = safeInteger(trade, "timestamp");
    if functions.ccxtruthy(feeAmount != nothing)
        datetime = safeString(trade, "timestamp");
        timestamp = self.parse8601(datetime);
    end
    feeSymbol = self.safeCurrencyCode(safeString(trade, "feeSymbol"));
    if functions.ccxtruthy(feeAmount != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeAmount,
            Symbol("currency") => feeSymbol,
            Symbol("rate") => nothing
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchStatus(self::Backpack, params=Dict())
    response = Base.fetch(self.publicGetApiV1Status(params));
    status = safeString(response, "status");
    if functions.ccxtruthy(status == nothing)
        throw(ExchangeError(string(self.id, " fetchStatus() missing status")));
    end
    return Dict{Symbol, Any}(
    Symbol("status") => lowercase(status),
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Backpack, params=Dict())
    response = Base.fetch(self.publicGetApiV1Time(params));
    return safeInteger(response, 0, milliseconds())

end
function fetchBalance(self::Backpack, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetApiV1Capital(params));
    return self.parseBalance(response)

end
function parseBalance(self::Backpack, response)
    balanceKeys = objectKeys(response);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balanceKeys)))
        id = get(balanceKeys, i + 1, nothing);
        code = self.safeCurrencyCode(id);
        balance = get(response, Symbol(id), nothing);
        account = self.account();
        locked = safeString(balance, "locked");
        staked = safeString(balance, "staked");
        used = stringAdd(locked, staked);
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = used;
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchDeposits(self::Backpack, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchDeposits", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.privateGetWapiV1CapitalDeposits(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawals(self::Backpack, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("to")] = until;
    end
    response = Base.fetch(self.privateGetWapiV1CapitalWithdrawals(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function withdraw(self::Backpack, code, amount, address, tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("quantity") => numberToString(amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("clientId")] = tag;
    end
    (networkCode, query) = self.handleNetworkCodeAndParams(params);
    networkId = self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing));
    if functions.ccxtruthy(networkId == nothing)
        throw(BadRequest(string(self.id, " withdraw() requires a network parameter")));
    end
    request[Symbol("blockchain")] = networkId;
    response = Base.fetch(self.privatePostWapiV1CapitalWithdrawals(extend(request, query)));
    return self.parseTransaction(response, currency)

end
function parseTransaction(self::Backpack, transaction, currency=nothing)
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    id = safeString(transaction, "id");
    txid = safeString(transaction, "transactionHash");
    coin = safeString(transaction, "symbol");
    code = self.safeCurrencyCode(coin, currency);
    timestamp = self.parse8601(safeString(transaction, "createdAt"));
    amount = self.safeNumber(transaction, "quantity");
    networkId = safeStringLower2(transaction, "source", "blockchain");
    network = self.networkIdToCode(networkId, code);
    addressTo = safeString(transaction, "toAddress");
    addressFrom = safeString(transaction, "fromAddress");
    tag = safeString(transaction, "platformMemo");
    feeCost = self.safeNumber(transaction, "fee");
    internal = self.safeBool(transaction, "isInternal", false);
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => network,
    Symbol("address") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("internal") => internal,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Backpack, status)
    statuses = Dict{Symbol, Any}(
        Symbol("cancelled") => "cancelled",
        Symbol("confirmed") => "ok",
        Symbol("declined") => "declined",
        Symbol("expired") => "expired",
        Symbol("initiated") => "initiated",
        Symbol("pending") => "pending",
        Symbol("refunded") => "refunded",
        Symbol("information required") => "pending"
    );
    return safeString(statuses, status, status)

end
function fetchDepositAddress(self::Backpack, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires a network parameter, see https://docs.ccxt.com/?id=network-codes")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("blockchain") => self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.privateGetWapiV1CapitalDepositAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency)

end
function parseDepositAddress(self::Backpack, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => nothing
)

end
function createOrder(self::Backpack, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    response = Base.fetch(self.privatePostApiV1Order(orderRequest));
    return self.parseOrder(response, market)

end
function createOrders(self::Backpack, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = self.safeNumber(rawOrder, "amount");
        price = self.safeNumber(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        extendedParams = extend(orderParams, params);
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, extendedParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    response = Base.fetch(self.privatePostApiV1Orders(ordersRequests));
    return self.parseOrders(response)

end
function createOrderRequest(self::Backpack, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => self.encodeOrderSide(side),
        Symbol("orderType") => capitalize(type_var)
    );
    triggerPrice = safeString(params, "triggerPrice");
    isTriggerOrder = triggerPrice != nothing;
    quantityKey = functions.ccxtruthy(isTriggerOrder) ? "triggerQuantity" : "quantity";
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol(quantityKey)] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(type_var == "market")
        cost = safeString2(params, "cost", "quoteQuantity");
        if functions.ccxtruthy(cost != nothing)
            request[Symbol("quoteQuantity")] = self.costToPrecision(symbol, cost);
            params = omit(params, ["cost", "quoteQuantity"]);
        else
            request[Symbol(quantityKey)] = self.amountToPrecision(symbol, amount);
        end
    end
    if functions.ccxtruthy(isTriggerOrder)
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
        params = omit(params, "triggerPrice");
    end
    clientOrderId = safeInteger(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientId")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(type_var == "market", false, params);
    if functions.ccxtruthy(postOnly)
        params[Symbol("postOnly")] = true;
    end
    takeProfit = self.safeDict(params, "takeProfit");
    if functions.ccxtruthy(takeProfit != nothing)
        takeProfitTriggerPrice = safeString(takeProfit, "triggerPrice");
        if functions.ccxtruthy(takeProfitTriggerPrice != nothing)
            request[Symbol("takeProfitTriggerPrice")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
        end
        takeProfitPrice = safeString(takeProfit, "price");
        if functions.ccxtruthy(takeProfitPrice != nothing)
            request[Symbol("takeProfitLimitPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
        end
        params = omit(params, "takeProfit");
    end
    stopLoss = self.safeDict(params, "stopLoss");
    if functions.ccxtruthy(stopLoss != nothing)
        stopLossTriggerPrice = safeString(stopLoss, "triggerPrice");
        if functions.ccxtruthy(stopLossTriggerPrice != nothing)
            request[Symbol("stopLossTriggerPrice")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
        end
        stopLossPrice = safeString(stopLoss, "price");
        if functions.ccxtruthy(stopLossPrice != nothing)
            request[Symbol("stopLossLimitPrice")] = self.priceToPrecision(symbol, stopLossPrice);
        end
        params = omit(params, "stopLoss");
    end
    selfTradePrevention = nothing;
    (selfTradePrevention, params) = self.handleOptionAndParams(params, "createOrder", "selfTradePrevention");
    if functions.ccxtruthy(selfTradePrevention != nothing)
        if functions.ccxtruthy(selfTradePrevention == "EXPIRE_MAKER")
            request[Symbol("selfTradePrevention")] = "RejectMaker";
        elseif functions.ccxtruthy(selfTradePrevention == "EXPIRE_TAKER")
            request[Symbol("selfTradePrevention")] = "RejectTaker";
        else
            if functions.ccxtruthy(selfTradePrevention == "EXPIRE_BOTH")
                request[Symbol("selfTradePrevention")] = "RejectBoth";
            end

        end
    end
    return extend(request, params)

end
function encodeOrderSide(self::Backpack, side)
    sides = Dict{Symbol, Any}(
        Symbol("buy") => "Bid",
        Symbol("sell") => "Ask"
    );
    return safeString(sides, side, side)

end
function fetchOpenOrders(self::Backpack, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetApiV1Orders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrder(self::Backpack, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateGetApiV1Order(extend(request, params)));
    return self.parseOrder(response)

end
function cancelOrder(self::Backpack, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateDeleteApiV1Order(extend(request, params)));
    return self.parseOrder(response)

end
function cancelAllOrders(self::Backpack, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateDeleteApiV1Orders(extend(request, params)));
    return self.parseOrders(response, market)

end
function fetchOrders(self::Backpack, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWapiV1HistoryOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function parseOrder(self::Backpack, order, market=nothing)
    timestamp = safeInteger(order, "createdAt");
    timestamp2 = self.parse8601(safeString(order, "createdAt"));
    if functions.ccxtruthy(timestamp2 != nothing)
        timestamp = timestamp2;
    end
    id = safeString(order, "id");
    clientOrderId = safeString(order, "clientId");
    symbol = self.safeSymbol(safeString(order, "symbol"), market);
    type_var = safeStringLower(order, "orderType");
    timeInForce = safeString(order, "timeInForce");
    side = self.parseOrderSide(safeString(order, "side"));
    amount = safeString2(order, "quantity", "triggerQuantity");
    price = safeString(order, "price");
    cost = safeString(order, "executedQuoteQuantity");
    status = self.parseOrderStatus(safeString(order, "status"));
    triggerPrice = safeString(order, "triggerPrice");
    filled = safeString(order, "executedQuantity");
    reduceOnly = self.safeBool(order, "reduceOnly");
    postOnly = self.safeBool(order, "postOnly");
    stopLossPrice = safeString2(order, "stopLossLimitPrice", "stopLossTriggerPrice");
    takeProfitPrice = safeString2(order, "takeProfitLimitPrice", "takeProfitTriggerPrice");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => nothing,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => nothing
), market)

end
function parseOrderStatus(self::Backpack, status)
    statuses = Dict{Symbol, Any}(
        Symbol("New") => "open",
        Symbol("Filled") => "closed",
        Symbol("Cancelled") => "canceled",
        Symbol("Expired") => "canceled",
        Symbol("PartiallyFilled") => "open",
        Symbol("TriggerPending") => "open",
        Symbol("TriggerFailed") => "rejected"
    );
    return safeString(statuses, status, status)

end
function parseOrderSide(self::Backpack, side)
    sides = Dict{Symbol, Any}(
        Symbol("Bid") => "buy",
        Symbol("Ask") => "sell"
    );
    return safeString(sides, side, side)

end
function fetchPositions(self::Backpack, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetApiV1Position(params));
    positions = self.parsePositions(response);
    if functions.ccxtruthy(isEmpty(symbols))
            return positions
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArrayPositions(positions, "symbol", symbols, false)

end
function parsePosition(self::Backpack, position, market=nothing)
    id = safeString(position, "positionId");
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    entryPrice = safeString(position, "entryPrice");
    markPrice = safeString(position, "markPrice");
    netCost = safeString(position, "netCost");
    hedged = false;
    side = "long";
    if functions.ccxtruthy(stringLt(netCost, "0"))
        side = "short";
    end
    if functions.ccxtruthy(netCost == nothing)
        hedged = nothing;
        side = nothing;
    end
    unrealizedPnl = safeString(position, "pnlUnrealized");
    realizedPnl = safeString(position, "pnlRealized");
    liquidationPrice = safeString(position, "estLiquidationPrice");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => self.parse8601(safeString(position, "timestamp")),
    Symbol("datetime") => self.iso8601(self.parse8601(safeString(position, "timestamp"))),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("hedged") => hedged,
    Symbol("side") => side,
    Symbol("contracts") => safeString(position, "netExposureQuantity"),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => entryPrice,
    Symbol("markPrice") => markPrice,
    Symbol("lastPrice") => nothing,
    Symbol("notional") => stringAbs(netCost),
    Symbol("leverage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => safeString(position, "imf"),
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => safeString(position, "mmf"),
    Symbol("realizedPnl") => realizedPnl,
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("marginMode") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchFundingHistory(self::Backpack, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetWapiV1HistoryFunding(extend(request, params)));
    return self.parseIncomes(response, market, since, limit)

end
function parseIncome(self::Backpack, income, market=nothing)
    marketId = safeString(income, "symbol");
    symbol = self.safeSymbol(marketId, market);
    amount = self.safeNumber(income, "quantity");
    id = safeString(income, "userId");
    timestamp = self.parse8601(safeString(income, "intervalEndTimestamp"));
    rate = self.safeNumber(income, "fundingRate");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => id,
    Symbol("amount") => amount,
    Symbol("rate") => rate
)

end
function nonce(self::Backpack, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Backpack, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = string("/", path);
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    sortedParams = functions.ccxtruthy(functions.ccxt_isArray(params)) ? params : keysort(params);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        ts = string(self.nonce());
        recvWindow = safeString2(self.options, "recvWindow", "X-Window", "5000");
        optionInstructions = self.safeDict(self.options, "instructions", Dict{Symbol, Any}());
        optionPathInstructions = self.safeDict(optionInstructions, path, Dict{Symbol, Any}());
        instruction = safeString(optionPathInstructions, method, "");
        payload = "";
        if functions.ccxtruthy(@functions.ccxt_and((path == "api/v1/orders"), (method == "POST")))
            payload = self.generateBatchPayload(sortedParams, ts, recvWindow, instruction);
        else
            queryString = self.urlencode(sortedParams);
            if functions.ccxtruthy(functions.ccxt_gt(length(queryString), 0))
                queryString += "&";
            end
            payload = string("instruction=", instruction, "&", queryString, "timestamp=", ts, "&window=", recvWindow);
        end
        secretBytes = self.base64ToBinary(self.secret);
        seed = self.arraySlice(secretBytes, 0, 32);
        signature = eddsa(self.encode(payload), seed, ed25519);
        headers = Dict{Symbol, Any}(
            Symbol("X-Timestamp") => ts,
            Symbol("X-Window") => recvWindow,
            Symbol("X-API-Key") => self.apiKey,
            Symbol("X-Signature") => signature,
            Symbol("X-Broker-Id") => "1400"
        );
        if functions.ccxtruthy(method != "GET")
            body = json(sortedParams);
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    if functions.ccxtruthy(method == "GET")
        query = self.urlencode(sortedParams);
        if functions.ccxtruthy(length(query) != 0)
            endpoint += string("?", query);
        end
    end
    url += endpoint;
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function generateBatchPayload(self::Backpack, params, ts, recvWindow, instruction)
    payload = "";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(params)))
        order = self.safeDict(params, i, Dict{Symbol, Any}());
        sortedOrder = keysort(order);
        orderQuery = self.urlencode(sortedOrder);
        payload += string("instruction=", instruction, "&", orderQuery, "&");
        if functions.ccxtruthy(i == (length(params) - 1))
            payload += string("timestamp=", ts, "&window=", recvWindow);
        end
        i += 1
    end
    return payload

end
function handleErrors(self::Backpack, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeString(response, "code");
    message = safeString(response, "message");
    if functions.ccxtruthy(errorCode != nothing)
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Backpack, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetApiV1Assets(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/assets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Collateral(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/collateral", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1BorrowLendMarkets(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/borrowLend/markets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1BorrowLendMarketsHistory(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/borrowLend/markets/history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Markets(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/markets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Market(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/market", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Ticker(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Tickers(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Depth(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Klines(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/klines", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1MarkPrices(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/markPrices", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1OpenInterest(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/openInterest", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1FundingRates(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/fundingRates", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Status(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/status", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Ping(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/ping", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Time(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Wallets(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/wallets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1Trades(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetApiV1TradesHistory(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/trades/history", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Account(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountLimitsBorrow(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account/limits/borrow", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountLimitsOrder(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account/limits/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountLimitsWithdrawal(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account/limits/withdrawal", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1BorrowLendPositions(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/borrowLend/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Capital(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/capital", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1CapitalCollateral(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/capital/collateral", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1CapitalDeposits(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/capital/deposits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1CapitalDepositAddress(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/capital/deposit/address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1CapitalWithdrawals(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/capital/withdrawals", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Position(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/position", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryBorrowLend(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/borrowLend", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryInterest(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/interest", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryBorrowLendPositions(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/borrowLend/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryDust(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/dust", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryFills(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/fills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryFunding(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/funding", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryOrders(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryRfq(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/rfq", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryQuote(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/quote", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistorySettlement(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/settlement", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetWapiV1HistoryStrategies(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/history/strategies", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Order(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Orders(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostApiV1AccountConvertDust(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account/convertDust", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1BorrowLend(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/borrowLend", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWapiV1CapitalWithdrawals(self::Backpack, params=Dict(), context=Dict())
    return request(self, "wapi/v1/capital/withdrawals", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1Order(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1Orders(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1Rfq(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1RfqAccept(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/rfq/accept", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1RfqRefresh(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/rfq/refresh", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1RfqCancel(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/rfq/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1RfqQuote(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/rfq/quote", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteApiV1Order(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1Orders(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/orders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privatePatchApiV1Account(self::Backpack, params=Dict(), context=Dict())
    return request(self, "api/v1/account", "private", "PATCH", params, nothing, nothing, Dict())
end

function Backpack(; kwargs...)
    inst = Backpack(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseMarketType, fetchTickers, fetchTicker, parseTicker, fetchOrderBook, fetchOHLCV, parseOHLCV, fetchFundingRate, parseFundingRate, fetchOpenInterest, parseOpenInterest, fetchFundingRateHistory, fetchTrades, fetchMyTrades, parseTrade, fetchStatus, fetchTime, fetchBalance, parseBalance, fetchDeposits, fetchWithdrawals, withdraw, parseTransaction, parseTransactionStatus, fetchDepositAddress, parseDepositAddress, createOrder, createOrders, createOrderRequest, encodeOrderSide, fetchOpenOrders, fetchOpenOrder, cancelOrder, cancelAllOrders, fetchOrders, parseOrder, parseOrderStatus, parseOrderSide, fetchPositions, parsePosition, fetchFundingHistory, parseIncome, nonce, sign, generateBatchPayload, handleErrors, publicGetApiV1Assets, publicGetApiV1Collateral, publicGetApiV1BorrowLendMarkets, publicGetApiV1BorrowLendMarketsHistory, publicGetApiV1Markets, publicGetApiV1Market, publicGetApiV1Ticker, publicGetApiV1Tickers, publicGetApiV1Depth, publicGetApiV1Klines, publicGetApiV1MarkPrices, publicGetApiV1OpenInterest, publicGetApiV1FundingRates, publicGetApiV1Status, publicGetApiV1Ping, publicGetApiV1Time, publicGetApiV1Wallets, publicGetApiV1Trades, publicGetApiV1TradesHistory, privateGetApiV1Account, privateGetApiV1AccountLimitsBorrow, privateGetApiV1AccountLimitsOrder, privateGetApiV1AccountLimitsWithdrawal, privateGetApiV1BorrowLendPositions, privateGetApiV1Capital, privateGetApiV1CapitalCollateral, privateGetWapiV1CapitalDeposits, privateGetWapiV1CapitalDepositAddress, privateGetWapiV1CapitalWithdrawals, privateGetApiV1Position, privateGetWapiV1HistoryBorrowLend, privateGetWapiV1HistoryInterest, privateGetWapiV1HistoryBorrowLendPositions, privateGetWapiV1HistoryDust, privateGetWapiV1HistoryFills, privateGetWapiV1HistoryFunding, privateGetWapiV1HistoryOrders, privateGetWapiV1HistoryRfq, privateGetWapiV1HistoryQuote, privateGetWapiV1HistorySettlement, privateGetWapiV1HistoryStrategies, privateGetApiV1Order, privateGetApiV1Orders, privatePostApiV1AccountConvertDust, privatePostApiV1BorrowLend, privatePostWapiV1CapitalWithdrawals, privatePostApiV1Order, privatePostApiV1Orders, privatePostApiV1Rfq, privatePostApiV1RfqAccept, privatePostApiV1RfqRefresh, privatePostApiV1RfqCancel, privatePostApiV1RfqQuote, privateDeleteApiV1Order, privateDeleteApiV1Orders, privatePatchApiV1Account)
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
