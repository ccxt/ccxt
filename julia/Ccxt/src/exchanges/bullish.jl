@kwdef mutable struct Bullish <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseMarketType::Function = parseMarketType
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    parseTrade::Function = parseTrade
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    safeDeterministicCall::Function = safeDeterministicCall
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchOrders::Function = fetchOrders
    handlePaginationParams::Function = handlePaginationParams
    handleSinceAndUntil::Function = handleSinceAndUntil
    getClosestLimit::Function = getClosestLimit
    fetchOpenOrders::Function = fetchOpenOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchOrder::Function = fetchOrder
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionType::Function = parseTransactionType
    parseTransactionStatus::Function = parseTransactionStatus
    loadAccount::Function = loadAccount
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchBalance::Function = fetchBalance
    parseBalanceForSingleCurrency::Function = parseBalanceForSingleCurrency
    parseBalance::Function = parseBalance
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    parsePositionSide::Function = parsePositionSide
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    fetchBorrowRateHistory::Function = fetchBorrowRateHistory
    parseBorrowRate::Function = parseBorrowRate
    getTimestamp::Function = getTimestamp
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    sign::Function = sign
    signIn::Function = signIn
    handleToken::Function = handleToken
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetV1Nonce::Function = publicGetV1Nonce
    publicGetV1Time::Function = publicGetV1Time
    publicGetV1Assets::Function = publicGetV1Assets
    publicGetV1AssetsSymbol::Function = publicGetV1AssetsSymbol
    publicGetV1Markets::Function = publicGetV1Markets
    publicGetV1MarketsSymbol::Function = publicGetV1MarketsSymbol
    publicGetV1HistoryMarketsSymbol::Function = publicGetV1HistoryMarketsSymbol
    publicGetV1MarketsSymbolOrderbookHybrid::Function = publicGetV1MarketsSymbolOrderbookHybrid
    publicGetV1MarketsSymbolTrades::Function = publicGetV1MarketsSymbolTrades
    publicGetV1MarketsSymbolTick::Function = publicGetV1MarketsSymbolTick
    publicGetV1MarketsSymbolCandle::Function = publicGetV1MarketsSymbolCandle
    publicGetV1HistoryMarketsSymbolTrades::Function = publicGetV1HistoryMarketsSymbolTrades
    publicGetV1HistoryMarketsSymbolFundingRate::Function = publicGetV1HistoryMarketsSymbolFundingRate
    publicGetV1IndexPrices::Function = publicGetV1IndexPrices
    publicGetV1IndexPricesAssetSymbol::Function = publicGetV1IndexPricesAssetSymbol
    publicGetV1ExpiryPricesSymbol::Function = publicGetV1ExpiryPricesSymbol
    publicGetV1OptionLadder::Function = publicGetV1OptionLadder
    publicGetV1OptionLadderSymbol::Function = publicGetV1OptionLadderSymbol
    privateGetV2Orders::Function = privateGetV2Orders
    privateGetV2HistoryOrders::Function = privateGetV2HistoryOrders
    privateGetV2OrdersOrderId::Function = privateGetV2OrdersOrderId
    privateGetV2AmmInstructions::Function = privateGetV2AmmInstructions
    privateGetV2AmmInstructionsInstructionId::Function = privateGetV2AmmInstructionsInstructionId
    privateGetV1WalletsTransactions::Function = privateGetV1WalletsTransactions
    privateGetV1WalletsLimitsSymbol::Function = privateGetV1WalletsLimitsSymbol
    privateGetV1WalletsDepositInstructionsCryptoSymbol::Function = privateGetV1WalletsDepositInstructionsCryptoSymbol
    privateGetV1WalletsWithdrawalInstructionsCryptoSymbol::Function = privateGetV1WalletsWithdrawalInstructionsCryptoSymbol
    privateGetV1WalletsDepositInstructionsFiatSymbol::Function = privateGetV1WalletsDepositInstructionsFiatSymbol
    privateGetV1WalletsWithdrawalInstructionsFiatSymbol::Function = privateGetV1WalletsWithdrawalInstructionsFiatSymbol
    privateGetV1WalletsSelfHostedVerificationAttempts::Function = privateGetV1WalletsSelfHostedVerificationAttempts
    privateGetV1Trades::Function = privateGetV1Trades
    privateGetV1HistoryTrades::Function = privateGetV1HistoryTrades
    privateGetV1TradesTradeId::Function = privateGetV1TradesTradeId
    privateGetV1TradesClientOrderIdClientOrderId::Function = privateGetV1TradesClientOrderIdClientOrderId
    privateGetV1AccountsAsset::Function = privateGetV1AccountsAsset
    privateGetV1AccountsAssetSymbol::Function = privateGetV1AccountsAssetSymbol
    privateGetV1UsersLogout::Function = privateGetV1UsersLogout
    privateGetV1UsersHmacLogin::Function = privateGetV1UsersHmacLogin
    privateGetV1AccountsTradingAccounts::Function = privateGetV1AccountsTradingAccounts
    privateGetV1AccountsTradingAccountsTradingAccountId::Function = privateGetV1AccountsTradingAccountsTradingAccountId
    privateGetV1DerivativesPositions::Function = privateGetV1DerivativesPositions
    privateGetV1HistoryDerivativesSettlement::Function = privateGetV1HistoryDerivativesSettlement
    privateGetV1HistoryTransfer::Function = privateGetV1HistoryTransfer
    privateGetV1HistoryBorrowInterest::Function = privateGetV1HistoryBorrowInterest
    privateGetV2MmpConfiguration::Function = privateGetV2MmpConfiguration
    privateGetV2OtcTrades::Function = privateGetV2OtcTrades
    privateGetV2OtcTradesOtcTradeId::Function = privateGetV2OtcTradesOtcTradeId
    privateGetV2OtcTradesUnconfirmedTrade::Function = privateGetV2OtcTradesUnconfirmedTrade
    privatePostV2Orders::Function = privatePostV2Orders
    privatePostV2Command::Function = privatePostV2Command
    privatePostV2AmmInstructions::Function = privatePostV2AmmInstructions
    privatePostV1WalletsWithdrawal::Function = privatePostV1WalletsWithdrawal
    privatePostV2UsersLogin::Function = privatePostV2UsersLogin
    privatePostV1SimulatePortfolioMargin::Function = privatePostV1SimulatePortfolioMargin
    privatePostV1WalletsSelfHostedInitiate::Function = privatePostV1WalletsSelfHostedInitiate
    privatePostV2MmpConfiguration::Function = privatePostV2MmpConfiguration
    privatePostV2OtcTrades::Function = privatePostV2OtcTrades
    privatePostV2OtcCommand::Function = privatePostV2OtcCommand

end
function describe(self::Bullish, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bullish",
    Symbol("name") => "Bullish",
    Symbol("countries") => ["DE"],
    Symbol("version") => "v3",
    Symbol("rateLimit") => 20,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("addMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketSellOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("deposit") => false,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => true,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true,
        Symbol("ws") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/68f0686b-84f0-4da9-a751-f7089af3a9ed",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.exchange.bullish.com/trading-api",
            Symbol("private") => "https://api.exchange.bullish.com/trading-api"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.simnext.bullish-test.com/trading-api",
            Symbol("private") => "https://api.simnext.bullish-test.com/trading-api"
        ),
        Symbol("www") => "https://bullish.com/",
        Symbol("referral") => "",
        Symbol("doc") => ["https://api.exchange.bullish.com/docs/api/rest/"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/nonce") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/assets/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/markets/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets/{symbol}/orderbook/hybrid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets/{symbol}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets/{symbol}/tick") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/markets/{symbol}/candle") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/markets/{symbol}/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/markets/{symbol}/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/index-prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/index-prices/{assetSymbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/expiry-prices/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/option-ladder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/option-ladder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v2/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/history/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/amm-instructions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/amm-instructions/{instructionId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/limits/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/deposit-instructions/crypto/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/withdrawal-instructions/crypto/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/deposit-instructions/fiat/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/withdrawal-instructions/fiat/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/self-hosted/verification-attempts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/history/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/trades/{tradeId}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v1/trades/client-order-id/{clientOrderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/accounts/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/accounts/asset/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/users/logout") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/users/hmac/login") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/accounts/trading-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/accounts/trading-accounts/{tradingAccountId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/derivatives-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/derivatives-settlement") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/history/borrow-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/mmp-configuration") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/otc-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/otc-trades/{otcTradeId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/otc-trades/unconfirmed-trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v2/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/command") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/amm-instructions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/users/login") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/simulate-portfolio-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v1/wallets/self-hosted/initiate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/mmp-configuration") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/otc-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v2/otc-command") => Dict{Symbol, Any}(
    Symbol("cost") => 1
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
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("EOS") => "EOS",
            Symbol("ERC20") => "ETH"
        ),
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDC") => "ERC20"
        ),
        Symbol("tradingAccountId") => nothing
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
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
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("symbolRequired") => false,
                Symbol("untilDays") => 90
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchCanceledAndClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 1,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 1,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchCanceledOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 1,
                Symbol("untilDays") => 1,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
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
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("1") => BadRequest,
            Symbol("5") => InvalidOrder,
            Symbol("6") => DuplicateOrderId,
            Symbol("13") => BadRequest,
            Symbol("15") => BadRequest,
            Symbol("18") => BadRequest,
            Symbol("1002") => BadRequest,
            Symbol("2001") => BadRequest,
            Symbol("2002") => BadRequest,
            Symbol("2003") => BadRequest,
            Symbol("2004") => BadRequest,
            Symbol("2005") => ExchangeError,
            Symbol("2006") => BadRequest,
            Symbol("2007") => BadRequest,
            Symbol("2008") => BadRequest,
            Symbol("2009") => BadSymbol,
            Symbol("2010") => AuthenticationError,
            Symbol("2011") => AuthenticationError,
            Symbol("2012") => BadRequest,
            Symbol("2013") => InvalidOrder,
            Symbol("2015") => OperationRejected,
            Symbol("2016") => BadRequest,
            Symbol("2017") => BadRequest,
            Symbol("2018") => BadRequest,
            Symbol("2020") => PermissionDenied,
            Symbol("2021") => OperationRejected,
            Symbol("2029") => InvalidNonce,
            Symbol("2035") => InvalidNonce,
            Symbol("3001") => InsufficientFunds,
            Symbol("3002") => OrderNotFound,
            Symbol("3003") => PermissionDenied,
            Symbol("3004") => InsufficientFunds,
            Symbol("3005") => InsufficientFunds,
            Symbol("3006") => InsufficientFunds,
            Symbol("3007") => DuplicateOrderId,
            Symbol("3031") => BadRequest,
            Symbol("3032") => BadRequest,
            Symbol("3033") => PermissionDenied,
            Symbol("3034") => RateLimitExceeded,
            Symbol("3035") => RateLimitExceeded,
            Symbol("3047") => OperationRejected,
            Symbol("3048") => OperationRejected,
            Symbol("3049") => OperationRejected,
            Symbol("3051") => InsufficientFunds,
            Symbol("3052") => InsufficientFunds,
            Symbol("3063") => BadRequest,
            Symbol("3064") => OrderNotFillable,
            Symbol("3065") => MarketClosed,
            Symbol("3066") => ExchangeError,
            Symbol("3067") => MarketClosed,
            Symbol("6007") => InvalidOrder,
            Symbol("6011") => InvalidOrder,
            Symbol("6012") => InvalidOrder,
            Symbol("6013") => InvalidOrder,
            Symbol("8301") => ExchangeError,
            Symbol("8305") => ExchangeError,
            Symbol("8306") => ExchangeError,
            Symbol("8307") => ExchangeError,
            Symbol("8310") => InvalidAddress,
            Symbol("8311") => BadRequest,
            Symbol("8313") => BadRequest,
            Symbol("8315") => OperationRejected,
            Symbol("8316") => OperationRejected,
            Symbol("8317") => OperationRejected,
            Symbol("8318") => NotSupported,
            Symbol("8319") => NotSupported,
            Symbol("8320") => InvalidAddress,
            Symbol("8322") => BadRequest,
            Symbol("8327") => AuthenticationError,
            Symbol("8329") => ExchangeError,
            Symbol("8331") => InvalidAddress,
            Symbol("8332") => BadRequest,
            Symbol("8333") => BadRequest,
            Symbol("8334") => BadRequest,
            Symbol("8335") => InvalidAddress,
            Symbol("8336") => InvalidAddress,
            Symbol("8399") => ExchangeError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("HttpInvalidParameterException") => BadRequest,
            Symbol("UNAUTHORIZED_COMMAND") => AuthenticationError,
            Symbol("QUERY_FILTER_ERROR") => BadRequest,
            Symbol("INVALID_SYMBOL") => BadSymbol
        )
    )
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Bullish; params=Dict())
    response = Base.fetch(self.publicGetV1Time(params));
    return safeInteger(response, "timestamp")

end
"""
fetches all available currencies on an exchange
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bullish; params=Dict())
    response = Base.fetch(self.publicGetV1Assets(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Bullish, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    name = safeString(rawCurrency, "name");
    precision = safeString(rawCurrency, "precision");
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => name,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => self.safeNumber(rawCurrency, "minFee"),
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = precision)),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("type") => "crypto",
    Symbol("info") => rawCurrency
))

end
"""
retrieves data on all markets for ace
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bullish; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    response = Base.fetch(self.publicGetV1Markets(params));
    return self.parseMarkets(response)

end
function parseMarket(self::Bullish, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseSymbol");
    quoteId = safeString(market, "quoteSymbol");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    basePrecision = safeString(market, "basePrecision");
    quotePrecision = safeString(market, "quotePrecision");
    amountPrecision = safeString(market, "quantityPrecision");
    pricePrecision = safeString(market, "pricePrecision");
    costPrecision = safeString(market, "costPrecision");
    minQuantityLimit = safeString(market, "minQuantityLimit");
    maxQuantityLimit = safeString(market, "maxQuantityLimit");
    minPriceLimit = safeString(market, "minPriceLimit");
    maxPriceLimit = safeString(market, "maxPriceLimit");
    minCostLimit = safeString(market, "minCostLimit");
    maxCostLimit = safeString(market, "maxCostLimit");
    settleId = safeString(market, "settlementAssetSymbol");
    settle = self.safeCurrencyCode(settleId);
    type_var = self.parseMarketType(type_var = safeString(market, "marketType"), defaultType = "spot");
    spot = false;
    swap = false;
    future = false;
    option = false;
    contract = true;
    linear = nothing;
    inverse = nothing;
    expiryDatetime = nothing;
    contractSize = nothing;
    optionType = nothing;
    strike = nothing;
    margin = false;
    if functions.ccxtruthy(type_var == "spot")
        spot = true;
        contract = false;
        margin = self.safeBool(market, "marginTradingEnabled");
    else
        contractSize = self.safeNumber(market, "contractMultiplier");
        symbol += string(":", settle);
        linear = settle == quote_var;
        inverse = !functions.ccxtruthy(linear);
        if functions.ccxtruthy(type_var == "swap")
            swap = true;
        else
            expiryDatetime = safeString(market, "expiryDatetime");
            idParts = split(id, "-");
            datePart = safeString(idParts, 2);
            dateYmd = functions.ccxt_slice(datePart, 2);
            symbol += string("-", dateYmd);
            if functions.ccxtruthy(type_var == "future")
                future = true;
            elseif functions.ccxtruthy(type_var == "option")
                option = true;
                optionType = safeStringLower(market, "optionType");
                strike = self.parseToNumeric(safeString(market, "optionStrikePrice"));
                symbol += string("-", numberToString(strike), "-", safeString(idParts, 4));
            end
        end
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("baseId") => baseId,
    Symbol("quote") => quote_var,
    Symbol("quoteId") => quoteId,
    Symbol("settle") => settle,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => get(get(self.fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
    Symbol("maker") => get(get(self.fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => self.parse8601(expiryDatetime),
    Symbol("expiryDatetime") => expiryDatetime,
    Symbol("strike") => strike,
    Symbol("optionType") => optionType,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minQuantityLimit),
            Symbol("max") => self.parseNumber(maxQuantityLimit)
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minPriceLimit),
            Symbol("max") => self.parseNumber(maxPriceLimit)
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minCostLimit),
            Symbol("max") => self.parseNumber(maxCostLimit)
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = amountPrecision)),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = pricePrecision)),
        Symbol("cost") => self.parseNumber(self.parsePrecision(precision = costPrecision)),
        Symbol("base") => self.parseNumber(self.parsePrecision(precision = basePrecision)),
        Symbol("quote") => self.parseNumber(self.parsePrecision(precision = quotePrecision))
    ),
    Symbol("active") => self.safeBool(market, "marketEnabled"),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseMarketType(self::Bullish; type_var=nothing, defaultType=nothing)
    types = Dict{Symbol, Any}(
        Symbol("SPOT") => "spot",
        Symbol("PERPETUAL") => "swap",
        Symbol("DATED_FUTURE") => "future",
        Symbol("OPTION") => "option"
    );
    return safeString(types, type_var, defaultType)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/orderbook/hybrid

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (not used by bullish)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bullish, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1MarketsSymbolOrderbookHybrid(extend(request, params)));
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, symbol, timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "priceLevelQuantity")

end
"""
get the list of most recent trades for a particular symbol
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bullish, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
        params = self.handlePaginationParams("fetchTrades", since = since, params = params);
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    params = self.handleSinceAndUntil(since = since, params = params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("_pageSize")] = self.getClosestLimit(limit);
    end
    response = Base.fetch(self.publicGetV1HistoryMarketsSymbolTrades(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.orderId`::string, optional: the order id to fetch trades for
- `params.clientOrderId`::string, optional: the client order id to fetch trades for
- `params.tradingAccountId`::string, optional: the trading account id to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        response = Base.fetch(self.privateGetV1TradesClientOrderIdClientOrderId(extend(request, params)));
    else
        paginate = false;
        (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
        if functions.ccxtruthy(paginate)
            params = self.handlePaginationParams("fetchMyTrades", since = since, params = params);
                return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
        end
        params = self.handleSinceAndUntil(since = since, params = params);
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("_pageSize")] = self.getClosestLimit(limit);
        end
        response = Base.fetch(self.privateGetV1HistoryTrades(extend(request, params)));
    end
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: the client order id to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Bullish, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        params = extend(Dict{Symbol, Any}(
    Symbol("orderId") => id
), params);
    end
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = params))

end
function parseTrade(self::Bullish, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(trade, "createdAtTimestamp");
    price = safeString(trade, "price");
    amount = safeString(trade, "quantity");
    side = safeStringLower(trade, "side");
    isTaker = self.safeBool(trade, "isTaker");
    currency = get(market, Symbol("quote"), nothing);
    code = self.safeCurrencyCode(currency);
    feeCost = self.safeNumber(trade, "quoteFee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    takerOrMaker = nothing;
    if functions.ccxtruthy(isTaker)
        takerOrMaker = "taker";
    else
        takerOrMaker = "maker";
    end
    orderId = safeString(trade, "orderId");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => safeString(trade, "tradeId"),
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bullish, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1MarketsSymbolTick(extend(request, params)));
    return self.parseTicker(response, market = market)

end
function parseTicker(self::Bullish, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(ticker, "createdAtTimestamp");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString2(ticker, "bid", "bestBid"),
    Symbol("bidVolume") => safeString(ticker, "bidVolume"),
    Symbol("ask") => safeString2(ticker, "ask", "bestAsk"),
    Symbol("askVolume") => safeString(ticker, "askVolume"),
    Symbol("vwap") => safeString(ticker, "vwap"),
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => safeString(ticker, "close"),
    Symbol("last") => safeString(ticker, "last"),
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "change"),
    Symbol("percentage") => safeString(ticker, "percentage"),
    Symbol("average") => safeString(ticker, "average"),
    Symbol("baseVolume") => safeString(ticker, "baseVolume"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("info") => ticker
), market = market)

end
function safeDeterministicCall(self::Bullish, method; symbol=nothing, since=nothing, limit=nothing, timeframe=nothing, params=Dict())
    maxRetries = nothing;
    (maxRetries, params) = self.handleOptionAndParams(params, method, "maxRetries", defaultValue = 3);
    errors = 0;
    params = omit(params, "until");
    while functions.ccxtruthy(functions.ccxt_le(errors, maxRetries))
        try
            if functions.ccxtruthy(@functions.ccxt_and(timeframe, method != "fetchFundingRateHistory"))
                    return Base.fetch(getproperty(self, Symbol(method))(symbol, timeframe, since, limit, params))
            else
                return Base.fetch(getproperty(self, Symbol(method))(symbol, since, limit, params))
            end
        catch e
            if functions.ccxtruthy(isa(e, RateLimitExceeded))
                throw(e);
            end
            errors += 1;
            if functions.ccxtruthy(functions.ccxt_gt(errors, maxRetries))
                throw(e);
            end

        end
    end
    return []

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bullish, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("timeBucket") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("_pageSize") => maxLimit
    );
    (request, params) = self.handleUntilOption("createdAtDatetime[lte]", request, params);
    until = safeInteger(request, "createdAtDatetime[lte]");
    duration = self.parseTimeframe(timeframe);
    maxDelta = 1000 * duration * maxLimit;
    startTime = since;
    if functions.ccxtruthy(@functions.ccxt_and(startTime == nothing, until == nothing))
        until = milliseconds();
        startTime = until - maxDelta;
    elseif functions.ccxtruthy(startTime == nothing)
        startTime = until - maxDelta;
    else
        if functions.ccxtruthy(until == nothing)
            until = self.sum(startTime, maxDelta);
        end

    end
    request[Symbol("createdAtDatetime[gte]")] = self.iso8601(startTime);
    request[Symbol("createdAtDatetime[lte]")] = self.iso8601(until);
    response = Base.fetch(self.publicGetV1MarketsSymbolCandle(extend(request, params)));
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Bullish, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "createdAtTimestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical funding rate prices
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
- `limit`::int, optional: the maximum amount of funding rate structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
        params = self.handlePaginationParams("fetchFundingRateHistory", since = since, params = params);
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchFundingRateHistory() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("_pageSize")] = self.getClosestLimit(limit);
    end
    params = self.handleSinceAndUntil(since = since, params = params, sinceKey = "updatedAtDatetime[gte]", untilKey = "updatedAtDatetime[lte]");
    response = Base.fetch(self.publicGetV1HistoryMarketsSymbolFundingRate(extend(request, params)));
    rates = [];
    result = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        datetime = safeString(entry, "updatedAtDatetime");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve (5, 25, 50, 100, default is 25)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order to fetch
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)
- `params.orderId`::string, optional: the id of the order to fetch for
- `params.clientOrderId`::string, optional: the client id of the order to fetch for
- `params.status`::string, optional: filter by order status, 'OPEN', 'CANCELLED', 'CLOSED', 'REJECTED'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    paginate = self.safeBool(params, "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
        params = self.handlePaginationParams("fetchOrders", since = since, params = params);
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 100))
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    params = self.handleSinceAndUntil(since = since, params = params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("_pageSize")] = self.getClosestLimit(limit);
    end
    method = "privateGetV2HistoryOrders";
    (method, params) = self.handleOptionAndParams(params, "fetchOrders", "method", defaultValue = method);
    response = [];
    if functions.ccxtruthy(method == "privateGetV2Orders")
        response = Base.fetch(self.privateGetV2Orders(extend(request, params)));
    elseif functions.ccxtruthy(method == "privateGetV2HistoryOrders")
        response = Base.fetch(self.privateGetV2HistoryOrders(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " fetchOrders() method parameter must be either \"privateGetV2Orders\" or \"privateGetV2HistoryOrders\"")));
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
function handlePaginationParams(self::Bullish, method; since=nothing, params=Dict())
    ninetyDays = 90 * 24 * 60 * 60 * 1000;
    now = milliseconds();
    allowedSince = now - ninetyDays;
    if functions.ccxtruthy(@functions.ccxt_and((since != nothing), (functions.ccxt_lt(since, allowedSince))))
        throw(BadRequest(string(self.id, " ", method, "() only allows fetching entries up to 90 days in the past")));
    end
    params = omit(params, "paginate");
    params = extend(params, Dict{Symbol, Any}(
    Symbol("paginationDirection") => "backward"
));
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until == nothing)
        params = extend(params, Dict{Symbol, Any}(
    Symbol("until") => now
));
    end
    return params

end
function handleSinceAndUntil(self::Bullish; since=nothing, params=Dict(), sinceKey="createdAtDatetime[gte]", untilKey="createdAtDatetime[lte]")
    until = safeInteger(params, "until");
    if functions.ccxtruthy(@functions.ccxt_or((since != nothing), (until != nothing)))
        timeDelta = 7 * 24 * 60 * 60 * 1000;
        if functions.ccxtruthy(since == nothing)
            since = until - timeDelta;
            params = omit(params, "until");
        elseif functions.ccxtruthy(until == nothing)
            until = self.sum(since, timeDelta);
            now = milliseconds();
            if functions.ccxtruthy(functions.ccxt_gt(until, now))
                until = now;
            end
        end
        sinceDate = self.iso8601(since);
        untilDate = self.iso8601(until);
        params[Symbol(sinceKey)] = sinceDate;
        params[Symbol(untilKey)] = untilDate;
    end
    return params

end
function getClosestLimit(self::Bullish, limit)
    pageSize = 5;
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(limit, 5)), (functions.ccxt_lt(limit, 26))))
        pageSize = 25;
    elseif functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(limit, 25)), (functions.ccxt_lt(limit, 51))))
        pageSize = 50;
    else
        if functions.ccxtruthy(functions.ccxt_gt(limit, 50))
            pageSize = 100;
        end

    end
    return pageSize

end
"""
fetch all unfilled currently open orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "OPEN"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple canceled orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "CANCELLED",
        Symbol("method") => "privateGetV2Orders"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple closed orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "CLOSED",
        Symbol("method") => "privateGetV2Orders"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple canceled orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Bullish; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("status") => "CLOSED",
        Symbol("method") => "privateGetV2HistoryOrders"
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on an order made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v2/orders/-orderId-

# Arguments
- `id`::string: the order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bullish, id; symbol=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id,
        Symbol("tradingAccountId") => tradingAccountId
    );
    response = Base.fetch(self.privateGetV2OrdersOrderId(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
create a trade order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LIMIT' or 'POST_ONLY'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a custom client order id
- `params.triggerPrice`::float, optional: the price at which a stop order is triggered at
- `params.timeInForce`::string, optional: the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC'
- `params.allowBorrow`::bool, optional: if true, the order will be allowed to borrow assets to fulfill the order (default is false)
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately (default is false)
- `params.traidingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bullish, symbol, type_var, side, amount; price=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("commandType") => "V3CreateOrder",
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("quantity") => self.amountToPrecision(symbol, amount),
        Symbol("tradingAccountId") => tradingAccountId
    );
    isMarketOrder = (@functions.ccxt_or((type_var == "market"), type_var == "MARKET"));
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, type_var == "POST_ONLY", params = params);
    if functions.ccxtruthy(postOnly)
        type_var = "POST_ONLY";
    end
    timeInForce = "GTC";
    (timeInForce, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce", defaultValue = timeInForce);
    params[Symbol("timeInForce")] =     uppercase(timeInForce);
    if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    triggerPrice = safeString(params, "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(isMarketOrder)
            throw(NotSupported(string(self.id, " createOrder() does not support market trigger orders")));
        end
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        type_var = "STOP_LIMIT";
        params = omit(params, "triggerPrice");
    end
    request[Symbol("type")] =     uppercase(type_var);
    response = Base.fetch(self.privatePostV2Orders(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
edit a trade limit order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-amend

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market to create an order in
- `type`::string, optional: 'limit' or 'POST_ONLY'
- `side`::string, optional: not used by bullish editOrder
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately (default is false)
- `params.clientOrderId`::string, optional: a unique identifier for the order, automatically generated if not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Bullish, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("commandType") => "V1AmendOrder",
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("tradingAccountId") => tradingAccountId
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("type")] =         uppercase(type_var);
    end
    postOnly = self.safeBool(params, "postOnly", defaultValue = false);
    if functions.ccxtruthy(postOnly)
        params = omit(params, "postOnly");
        request[Symbol("type")] = "POST_ONLY";
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    response = Base.fetch(self.privatePostV2Command(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations

# Arguments
- `id`::string, optional: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.commandType`::string: the command type, default is 'V3CancelOrder' (mandatory parameter)
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bullish, id; symbol=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("tradingAccountId") => tradingAccountId,
        Symbol("commandType") => safeString(params, "commandType", "V3CancelOrder"),
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privatePostV2Command(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
cancel all open orders in a market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations

# Arguments
- `symbol`::string, optional: alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bullish; symbol=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("commandType")] = "V1CancelAllOrdersByMarket";
    else
        request[Symbol("commandType")] = "V1CancelAllOrders";
    end
    response = Base.fetch(self.privatePostV2Command(extend(request, params)));
    orders = [response];
    return self.parseOrders(orders, market = market)

end
function parseOrder(self::Bullish, order; market=nothing)
    marketId = safeString(order, "symbol");
    if functions.ccxtruthy(market == nothing)
        market = self.safeMarket(marketId = marketId);
    end
    symbol = self.safeSymbol(marketId, market = market);
    id = safeString(order, "orderId");
    timestamp = safeInteger(order, "createdAtTimestamp");
    type_var = safeString(order, "type");
    side = safeStringLower(order, "side");
    price = safeString(order, "price");
    amount = safeString(order, "quantity");
    filled = safeString(order, "quantityFilled");
    status = self.parseOrderStatus(safeString(order, "status"));
    if functions.ccxtruthy(status == "closed")
        statusReason = safeString(order, "statusReason");
        if functions.ccxtruthy(statusReason == "User cancelled")
            status = "canceled";
        end
    end
    timeInForce = safeString(order, "timeInForce");
    stopPrice = safeString(order, "stopPrice");
    cost = safeString(order, "quoteAmount");
    fee = Dict{Symbol, Any}();
    quoteFee = self.safeNumber(order, "quoteFee");
    if functions.ccxtruthy(quoteFee != nothing)
        fee[Symbol("cost")] = quoteFee;
        fee[Symbol("currency")] = get(market, Symbol("quote"), nothing);
    end
    average = safeString(order, "averageFillPrice");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(type_var),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => type_var == "POST_ONLY",
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => stopPrice,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("cost") => cost,
    Symbol("trades") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => order,
    Symbol("average") => average
), market = market)

end
function parseOrderStatus(self::Bullish, status)
    statuses = Dict{Symbol, Any}(
        Symbol("OPEN") => "open",
        Symbol("CLOSED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("REJECTED") => "rejected"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Bullish, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LMT") => "limit",
        Symbol("MKT") => "market",
        Symbol("POST_ONLY") => "limit",
        Symbol("STOP_LIMIT") => "limit"
    );
    return safeString(types, type_var, type_var)

end
"""
fetch history of deposits and withdrawals
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/transactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Bullish; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("createdAtDatetime[lte]", request, params);
    until = safeInteger(request, "createdAtDatetime[lte]");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("createdAtDatetime[lte]")] = self.iso8601(until);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("createdAtDatetime[gte]")] = self.iso8601(since);
    end
    response = Base.fetch(self.privateGetV1WalletsTransactions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
make a withdrawal
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/wallets/withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::string: the timestamp of the withdrawal request (mandatory)
- `params.nonce`::string: the nonce of the withdrawal request (mandatory)
- `params.network`::string: network for withdraw (mandatory)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bullish, code, amount, address; tag=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("command") => Dict{Symbol, Any}(
            Symbol("commandType") => "V1Withdraw",
            Symbol("destinationId") => address,
            Symbol("symbol") => get(currency, Symbol("id"), nothing),
            Symbol("quantity") => self.currencyToPrecision(code, amount)
        )
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network")] = self.networkCodeToId(networkCode, currencyCode = code);
    else
        throw(ArgumentsRequired(string(self.id, " withdraw() requires a network parameter")));
    end
    response = Base.fetch(self.privatePostV1WalletsWithdrawal(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTransaction(self::Bullish, transaction; currency=nothing)
    id = safeString(transaction, "custodyTransactionId");
    type_var = safeString(transaction, "direction");
    timestamp = self.parse8601(safeString(transaction, "createdAtDateTime"));
    updated = self.parse8601(safeString(transaction, "updatedAtDateTime"));
    network = safeString(transaction, "network");
    transactionDetails = self.safeDict(transaction, "transactionDetails");
    txid = safeString(transactionDetails, "blockchainTxId");
    address = safeString(transactionDetails, "address");
    amount = self.safeNumber(transaction, "quantity");
    currencyId = safeString(transaction, "symbol");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    status = safeString(transaction, "status");
    sources = self.safeList(transactionDetails, "sources", defaultValue = []);
    source = self.safeDict(sources, 0, defaultValue = Dict{Symbol, Any}());
    sourceAddress = safeString(source, "address");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    feeCost = self.safeNumber(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee[Symbol("cost")] = feeCost;
        fee[Symbol("currency")] = code;
    end
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId = network, currencyCode = code),
    Symbol("addressFrom") => sourceAddress,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("amount") => amount,
    Symbol("type") => self.parseTransactionType(type_var),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => updated,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => transaction
)

end
function parseTransactionType(self::Bullish, type_var)
    types = Dict{Symbol, Any}(
        Symbol("DEPOSIT") => "deposit",
        Symbol("WITHDRAW") => "withdrawal"
    );
    return safeString(types, type_var, type_var)

end
function parseTransactionStatus(self::Bullish, status)
    statuses = Dict{Symbol, Any}(
        Symbol("COMPLETE") => "ok",
        Symbol("FAILED") => "failed",
        Symbol("PENDING") => "pending",
        Symbol("CANCELLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
function loadAccount(self::Bullish; params=Dict())
    tradingAccountId = nothing;
    (tradingAccountId, params) = self.handleOptionAndParams(params, "loadAccount", "tradingAccountId");
    if functions.ccxtruthy(tradingAccountId == nothing)
        response = Base.fetch(self.privateGetV1AccountsTradingAccounts(params));
        accounts = toArray(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
            account = get(accounts, i + 1, nothing);
            name = safeString(account, "tradingAccountName");
            if functions.ccxtruthy(name == "Primary Account")
                tradingAccountId = safeString(account, "tradingAccountId");
                break
            end
            i += 1
        end

    end
    if functions.ccxtruthy(tradingAccountId == nothing)
        throw(ArgumentsRequired(string(self.id, " loadAccount() requires a tradingAccountId parameter in options[\"tradingAccountId\"] or params[\"tradingAccountId\"], fetchAccounts() was not able to find the Primary account")));
    end
    self.options[Symbol("tradingAccountId")] = tradingAccountId;
    return tradingAccountId

end
"""
fetch all the accounts associated with a profile
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--trading-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Bullish; params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    response = Base.fetch(self.privateGetV1AccountsTradingAccounts(params));
    return self.parseAccounts(response, params = params)

end
function parseAccount(self::Bullish, account)
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "tradingAccountId"),
    Symbol("type") => nothing,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/deposit-instructions/crypto/-symbol-

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for deposit address

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bullish, code; params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetV1WalletsDepositInstructionsCryptoSymbol(extend(request, params)));
    safeResponse = toArray(response);
    len = length(safeResponse);
    data = self.safeDict(safeResponse, 0, defaultValue = Dict{Symbol, Any}());
    network = nothing;
    (network, params) = self.handleNetworkCodeAndParams(params);
    networkDefinedByUser = network != nothing;
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_gt(len, 1)), (networkDefinedByUser)))
        if functions.ccxtruthy(network == nothing)
            network = self.defaultNetworkCode(code);
        end
        if functions.ccxtruthy(network != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(safeResponse)))
                entry = self.safeDict(safeResponse, i, defaultValue = Dict{Symbol, Any}());
                networkId = safeString(entry, "network");
                networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
                if functions.ccxtruthy(network == networkCode)
                    data = entry;
                    break
                end
                i += 1
            end

            if functions.ccxtruthy(networkDefinedByUser)
                data = Dict{Symbol, Any}();
            end
        end
    end
    return self.parseDepositAddress(data, currency = currency)

end
function parseDepositAddress(self::Bullish, depositAddress; currency=nothing)
    id = safeString(depositAddress, "symbol");
    network = safeString(depositAddress, "network");
    code = self.safeCurrencyCode(id, currency = currency);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = network, currencyCode = code),
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => nothing
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset/-symbol-

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)
- `params.code`::string, optional: unified currency code, default is undefined

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bullish; params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    response = nothing;
    code = safeString(params, "code");
    if functions.ccxtruthy(code != nothing)
        request[Symbol("symbol")] = get(self.currency(code), Symbol("id"), nothing);
        response = Base.fetch(self.privateGetV1AccountsAssetSymbol(extend(request, params)));
            return self.parseBalanceForSingleCurrency(response, code)
    else
        response = Base.fetch(self.privateGetV1AccountsAsset(extend(request, params)));
        return self.parseBalance(response)
    end

end
function parseBalanceForSingleCurrency(self::Bullish, response, code)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    account = self.account();
    account[Symbol("free")] = safeString(response, "availableQuantity");
    account[Symbol("used")] = safeString(response, "lockedQuantity");
    result[Symbol(code)] = account;
    return self.safeBalance(result)

end
function parseBalance(self::Bullish, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        symbol = safeString(balance, "assetSymbol");
        code = self.safeCurrencyCode(symbol);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "availableQuantity");
        account[Symbol("used")] = safeString(balance, "lockedQuantity");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch all open positions
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/derivatives-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Bullish; symbols=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    response = Base.fetch(self.privateGetV1DerivativesPositions(extend(request, params)));
    results = self.parsePositions(response, symbols = symbols);
    return self.filterByArrayPositions(results, "symbol", values = symbols, indexed = false)

end
function parsePosition(self::Bullish, position; market=nothing)
    market = self.safeMarket(marketId = safeString(position, "symbol"), market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(position, "createdAtTimestamp");
    side = safeString(position, "side");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updatedAtTimestamp"),
    Symbol("hedged") => nothing,
    Symbol("side") => self.parsePositionSide(side),
    Symbol("contracts") => self.safeNumber(position, "quantity"),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("notional") => self.safeNumber(position, "notional"),
    Symbol("leverage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function parsePositionSide(self::Bullish, side)
    sides = Dict{Symbol, Any}(
        Symbol("BUY") => "long",
        Symbol("SELL") => "short"
    );
    return safeString(sides, side, side)

end
"""
fetch a history of internal transfers made on an account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/transfer

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int: the latest time in ms to fetch transfers for (default time now)
- `params.tradingAccountId`::string: the trading account id

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Bullish; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
        params = self.handlePaginationParams("fetchTransfers", since = since, params = params);
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("tradingAccountId") => tradingAccountId
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("assetSymbol")] = get(currency, Symbol("id"), nothing);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(@functions.ccxt_and((since == nothing), (until == nothing)))
        now = milliseconds();
        params = extend(params, Dict{Symbol, Any}(
    Symbol("until") => now
));
    end
    params = self.handleSinceAndUntil(since = since, params = params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("_pageSize")] = self.getClosestLimit(limit);
    end
    response = Base.fetch(self.privateGetV1HistoryTransfer(extend(request, params)));
    return self.parseTransfers(response, currency = currency, since = since, limit = limit)

end
"""
transfer currency internally between wallets on the same account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/command-commandType-V1TransferAsset

# Arguments
- `code`::string: unified currency codeåå
- `amount`::float: amount to transfer
- `fromAccount`::string: account ID to transfer from
- `toAccount`::string: account ID to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bullish, code, amount, fromAccount, toAccount; params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("commandType") => "V2TransferAsset",
        Symbol("assetSymbol") => get(currency, Symbol("id"), nothing),
        Symbol("quantity") => self.currencyToPrecision(code, amount),
        Symbol("fromTradingAccountId") => fromAccount,
        Symbol("toTradingAccountId") => toAccount
    );
    response = Base.fetch(self.privatePostV2Command(extend(request, params)));
    transferOptions = self.safeDict(self.options, "transfer", defaultValue = Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", defaultValue = true);
    transfer = self.parseTransfer(response, currency = currency);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("amount")] = amount;
        transfer[Symbol("currency")] = code;
    end
    return transfer

end
function parseTransfer(self::Bullish, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "createdAtTimestamp");
    currencyId = safeString(transfer, "assetSymbol");
    status = safeString(transfer, "status");
    if functions.ccxtruthy(status == nothing)
        status = safeString(transfer, "message");
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "requestId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(transfer, "quantity"),
    Symbol("fromAccount") => safeString(transfer, "fromTradingAccountId"),
    Symbol("toAccount") => safeString(transfer, "toTradingAccountId"),
    Symbol("status") => self.parseTransferStatus(status),
    Symbol("info") => transfer
)

end
function parseTransferStatus(self::Bullish, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CLOSED") => "ok",
        Symbol("OPEN") => "pending",
        Symbol("REJECTED") => "failed",
        Symbol("Command acknowledged - TransferAsset") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/borrow-interest

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int: the latest time in ms to fetch entries for
- `params.tradingAccountId`::string: the trading account id

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchBorrowRateHistory(self::Bullish, code; since=nothing, limit=nothing, params=Dict())
    Base.fetch(asyncmap(Base.fetch, [self.loadMarkets(), self.handleToken()]));
    tradingAccountId = Base.fetch(self.loadAccount(params = params));
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("assetSymbol") => get(currency, Symbol("id"), nothing),
        Symbol("tradingAccountId") => tradingAccountId
    );
    now = milliseconds();
    startTimestamp = since;
    (request, params) = self.handleUntilOption("createdAtDatetime[lte]", request, params);
    until = safeInteger(request, "createdAtDatetime[lte]");
    if functions.ccxtruthy(startTimestamp == nothing)
        startTimestamp = now - 1000 * 60 * 60 * 24 * 90;
    end
    if functions.ccxtruthy(until == nothing)
        until = now;
    end
    request[Symbol("createdAtDatetime[gte]")] = self.iso8601(startTimestamp);
    request[Symbol("createdAtDatetime[lte]")] = self.iso8601(until);
    response = Base.fetch(self.privateGetV1HistoryBorrowInterest(extend(request, params)));
    return self.parseBorrowRateHistory(response, code, since, limit)

end
function parseBorrowRate(self::Bullish, info; currency=nothing)
    timestamp = safeInteger(info, "createdAtTimestamp");
    currencyId = safeString(info, "assetSymbol");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => self.safeNumber(info, "borrowedQuantity"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function getTimestamp(self::Bullish, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
"""
fetches the open interest of a specific market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick

# Arguments
- `symbol`::string: unified symbol of the market to fetch the open interest for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchOpenInterest(self::Bullish, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1MarketsSymbolTick(extend(request, params)));
    return self.parseOpenInterest(response, market = market)

end
function parseOpenInterest(self::Bullish, interest; market=nothing)
    openInterest = safeString(interest, "openInterest");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("info") => interest,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => openInterest,
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => safeString(interest, "createdAtTimestamp"),
    Symbol("datetime") => safeString(interest, "createdAtDatetime"),
    Symbol("baseVolume") => openInterest,
    Symbol("quoteVolume") => nothing
), market = market)

end
function sign(self::Bullish, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = omit(params, self.extractParams(path));
    endpoint = string("/", self.implodeParams(path, params));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), endpoint);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(microseconds());
        timestamp = string(self.getTimestamp());
        if functions.ccxtruthy(method == "GET")
            payload = string(timestamp, nonce, method, "/trading-api/", path);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "hex");
            headers = Dict{Symbol, Any}(
                Symbol("BX-TIMESTAMP") => timestamp,
                Symbol("BX-NONCE") => nonce,
                Symbol("BX-SIGNATURE") => signature
            );
        elseif functions.ccxtruthy(method == "POST")
            body = json(params);
            payload = string(timestamp, nonce, method, "/trading-api/", path, body);
            digest = hash(self.encode(payload), sha256, "hex");
            signature = self.hmac(self.encode(digest), self.encode(self.secret), sha256, "hex");
            headers = Dict{Symbol, Any}(
                Symbol("BX-TIMESTAMP") => timestamp,
                Symbol("BX-NONCE") => nonce,
                Symbol("BX-SIGNATURE") => signature,
                Symbol("Content-Type") => "application/json"
            );
            headers[Symbol("Content-Type")] = "application/json";
            rateLimitToken = safeString(request, "rateLimitToken");
            if functions.ccxtruthy(rateLimitToken != nothing)
                headers[Symbol("BX-RATE-LIMIT-TOKEN")] = rateLimitToken;
            end
        end
        if functions.ccxtruthy(path == "v1/users/hmac/login")
            headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
            headers[Symbol("BX-PUBLIC-KEY")] = self.apiKey;
        else
            token = self.token;
            if functions.ccxtruthy((token == nothing))
                throw(AuthenticationError(string(self.id, " requires a token, please call signIn() first")));
            end
            headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
            headers[Symbol("Authorization")] = string("Bearer ", token);
        end
    end
    if functions.ccxtruthy(method == "GET")
        query = self.urlencode(request);
        if functions.ccxtruthy(length(query))
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
"""
sign in, must be called prior to using other authenticated methods
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--add-authenticated-request-header

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
function signIn(self::Bullish; params=Dict())
    response = Base.fetch(self.privateGetV1UsersHmacLogin(params));
    token = safeString(response, "token");
    authorizer = safeString(response, "authorizer");
    self.options[Symbol("authorizer")] = authorizer;
    self.token = token;
    self.options[Symbol("tokenExpires")] = self.sum(milliseconds(), 1000 * 60 * 60 * 24);
    return token

end
function handleToken(self::Bullish; params=Dict())
    now = milliseconds();
    token = self.token;
    tokenExpires = safeInteger(self.options, "tokenExpires");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((token == nothing), (tokenExpires == nothing)), (functions.ccxt_gt(now, tokenExpires))))
            return Base.fetch(self.signIn())
    else
        return self.token
    end

end
function handleErrors(self::Bullish, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "errorCode");
    type_var = safeString(response, "type");
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(@functions.ccxt_and(code != nothing, code != "0"), code != "1001")), (@functions.ccxt_and(type_var != nothing, type_var == "HttpInvalidParameterException"))))
        message = "";
        errorCodeName = safeString(response, "errorCodeName");
        if functions.ccxtruthy(errorCodeName != nothing)
            message = errorCodeName;
        else
            message = type_var;
        end
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bullish, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetV1Nonce(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/nonce"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Time(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Assets(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/assets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1AssetsSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/assets/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1Markets(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1MarketsSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1HistoryMarketsSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/markets/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1MarketsSymbolOrderbookHybrid(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets/{symbol}/orderbook/hybrid"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1MarketsSymbolTrades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets/{symbol}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1MarketsSymbolTick(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets/{symbol}/tick"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1MarketsSymbolCandle(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/markets/{symbol}/candle"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1HistoryMarketsSymbolTrades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/markets/{symbol}/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1HistoryMarketsSymbolFundingRate(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/markets/{symbol}/funding-rate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1IndexPrices(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/index-prices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1IndexPricesAssetSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/index-prices/{assetSymbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1ExpiryPricesSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/expiry-prices/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1OptionLadder(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/option-ladder"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV1OptionLadderSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/option-ladder/{symbol}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2Orders(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2HistoryOrders(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/history/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2OrdersOrderId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/orders/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2AmmInstructions(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/amm-instructions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2AmmInstructionsInstructionId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/amm-instructions/{instructionId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsTransactions(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/transactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsLimitsSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/limits/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsDepositInstructionsCryptoSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/deposit-instructions/crypto/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsWithdrawalInstructionsCryptoSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/withdrawal-instructions/crypto/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsDepositInstructionsFiatSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/deposit-instructions/fiat/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsWithdrawalInstructionsFiatSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/withdrawal-instructions/fiat/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1WalletsSelfHostedVerificationAttempts(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/self-hosted/verification-attempts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1Trades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1HistoryTrades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1TradesTradeId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/trades/{tradeId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1TradesClientOrderIdClientOrderId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/trades/client-order-id/{clientOrderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1AccountsAsset(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/accounts/asset"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1AccountsAssetSymbol(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/accounts/asset/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1UsersLogout(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/users/logout"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1UsersHmacLogin(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/users/hmac/login"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1AccountsTradingAccounts(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/accounts/trading-accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1AccountsTradingAccountsTradingAccountId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/accounts/trading-accounts/{tradingAccountId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1DerivativesPositions(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/derivatives-positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1HistoryDerivativesSettlement(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/derivatives-settlement"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1HistoryTransfer(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/transfer"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV1HistoryBorrowInterest(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/history/borrow-interest"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2MmpConfiguration(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/mmp-configuration"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2OtcTrades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/otc-trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2OtcTradesOtcTradeId(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/otc-trades/{otcTradeId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2OtcTradesUnconfirmedTrade(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/otc-trades/unconfirmed-trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2Orders(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2Command(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/command"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2AmmInstructions(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/amm-instructions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1WalletsWithdrawal(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2UsersLogin(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/users/login"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1SimulatePortfolioMargin(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/simulate-portfolio-margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV1WalletsSelfHostedInitiate(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v1/wallets/self-hosted/initiate"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2MmpConfiguration(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/mmp-configuration"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2OtcTrades(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/otc-trades"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV2OtcCommand(self::Bullish, params=Dict(), context=Dict())
    return request(self, "v2/otc-command"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bullish(; kwargs...)
    inst = Bullish(Exchange(), describe, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseMarketType, fetchOrderBook, fetchTrades, fetchMyTrades, fetchOrderTrades, parseTrade, fetchTicker, parseTicker, safeDeterministicCall, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, fetchOrders, handlePaginationParams, handleSinceAndUntil, getClosestLimit, fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders, fetchCanceledAndClosedOrders, fetchOrder, createOrder, editOrder, cancelOrder, cancelAllOrders, parseOrder, parseOrderStatus, parseOrderType, fetchDepositsWithdrawals, withdraw, parseTransaction, parseTransactionType, parseTransactionStatus, loadAccount, fetchAccounts, parseAccount, fetchDepositAddress, parseDepositAddress, fetchBalance, parseBalanceForSingleCurrency, parseBalance, fetchPositions, parsePosition, parsePositionSide, fetchTransfers, transfer, parseTransfer, parseTransferStatus, fetchBorrowRateHistory, parseBorrowRate, getTimestamp, fetchOpenInterest, parseOpenInterest, sign, signIn, handleToken, handleErrors, publicGetV1Nonce, publicGetV1Time, publicGetV1Assets, publicGetV1AssetsSymbol, publicGetV1Markets, publicGetV1MarketsSymbol, publicGetV1HistoryMarketsSymbol, publicGetV1MarketsSymbolOrderbookHybrid, publicGetV1MarketsSymbolTrades, publicGetV1MarketsSymbolTick, publicGetV1MarketsSymbolCandle, publicGetV1HistoryMarketsSymbolTrades, publicGetV1HistoryMarketsSymbolFundingRate, publicGetV1IndexPrices, publicGetV1IndexPricesAssetSymbol, publicGetV1ExpiryPricesSymbol, publicGetV1OptionLadder, publicGetV1OptionLadderSymbol, privateGetV2Orders, privateGetV2HistoryOrders, privateGetV2OrdersOrderId, privateGetV2AmmInstructions, privateGetV2AmmInstructionsInstructionId, privateGetV1WalletsTransactions, privateGetV1WalletsLimitsSymbol, privateGetV1WalletsDepositInstructionsCryptoSymbol, privateGetV1WalletsWithdrawalInstructionsCryptoSymbol, privateGetV1WalletsDepositInstructionsFiatSymbol, privateGetV1WalletsWithdrawalInstructionsFiatSymbol, privateGetV1WalletsSelfHostedVerificationAttempts, privateGetV1Trades, privateGetV1HistoryTrades, privateGetV1TradesTradeId, privateGetV1TradesClientOrderIdClientOrderId, privateGetV1AccountsAsset, privateGetV1AccountsAssetSymbol, privateGetV1UsersLogout, privateGetV1UsersHmacLogin, privateGetV1AccountsTradingAccounts, privateGetV1AccountsTradingAccountsTradingAccountId, privateGetV1DerivativesPositions, privateGetV1HistoryDerivativesSettlement, privateGetV1HistoryTransfer, privateGetV1HistoryBorrowInterest, privateGetV2MmpConfiguration, privateGetV2OtcTrades, privateGetV2OtcTradesOtcTradeId, privateGetV2OtcTradesUnconfirmedTrade, privatePostV2Orders, privatePostV2Command, privatePostV2AmmInstructions, privatePostV1WalletsWithdrawal, privatePostV2UsersLogin, privatePostV1SimulatePortfolioMargin, privatePostV1WalletsSelfHostedInitiate, privatePostV2MmpConfiguration, privatePostV2OtcTrades, privatePostV2OtcCommand)
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
function __ccxt_doc_Bullish_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Bullish_fetchTime

function __ccxt_doc_Bullish_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bullish_fetchCurrencies

function __ccxt_doc_Bullish_fetchMarkets() end
"""
retrieves data on all markets for ace
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bullish_fetchMarkets

function __ccxt_doc_Bullish_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/orderbook/hybrid

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (not used by bullish)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bullish_fetchOrderBook

function __ccxt_doc_Bullish_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trade to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bullish_fetchTrades

function __ccxt_doc_Bullish_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.orderId`::string, optional: the order id to fetch trades for
- `params.clientOrderId`::string, optional: the client order id to fetch trades for
- `params.tradingAccountId`::string, optional: the trading account id to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bullish_fetchMyTrades

function __ccxt_doc_Bullish_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: the client order id to fetch trades for

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bullish_fetchOrderTrades

function __ccxt_doc_Bullish_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bullish_fetchTicker

function __ccxt_doc_Bullish_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest entry
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bullish_fetchOHLCV

function __ccxt_doc_Bullish_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
- `limit`::int, optional: the maximum amount of funding rate structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bullish_fetchFundingRateHistory

function __ccxt_doc_Bullish_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve (5, 25, 50, 100, default is 25)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest order to fetch
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)
- `params.orderId`::string, optional: the id of the order to fetch for
- `params.clientOrderId`::string, optional: the client id of the order to fetch for
- `params.status`::string, optional: filter by order status, 'OPEN', 'CANCELLED', 'CLOSED', 'REJECTED'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchOrders

function __ccxt_doc_Bullish_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchOpenOrders

function __ccxt_doc_Bullish_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchCanceledOrders

function __ccxt_doc_Bullish_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchClosedOrders

function __ccxt_doc_Bullish_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchCanceledAndClosedOrders

function __ccxt_doc_Bullish_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v2/orders/-orderId-

# Arguments
- `id`::string: the order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_fetchOrder

function __ccxt_doc_Bullish_createOrder() end
"""
create a trade order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LIMIT' or 'POST_ONLY'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a custom client order id
- `params.triggerPrice`::float, optional: the price at which a stop order is triggered at
- `params.timeInForce`::string, optional: the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC'
- `params.allowBorrow`::bool, optional: if true, the order will be allowed to borrow assets to fulfill the order (default is false)
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately (default is false)
- `params.traidingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_createOrder

function __ccxt_doc_Bullish_editOrder() end
"""
edit a trade limit order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-amend

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market to create an order in
- `type`::string, optional: 'limit' or 'POST_ONLY'
- `side`::string, optional: not used by bullish editOrder
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately (default is false)
- `params.clientOrderId`::string, optional: a unique identifier for the order, automatically generated if not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_editOrder

function __ccxt_doc_Bullish_cancelOrder() end
"""
cancels an open order
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations

# Arguments
- `id`::string, optional: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.commandType`::string: the command type, default is 'V3CancelOrder' (mandatory parameter)
- `params.traidingAccountId`::string, optional: the trading account id (mandatory parameter)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_cancelOrder

function __ccxt_doc_Bullish_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations

# Arguments
- `symbol`::string, optional: alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.traidingAccountId`::string: the trading account id (mandatory parameter)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bullish_cancelAllOrders

function __ccxt_doc_Bullish_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/transactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bullish_fetchDepositsWithdrawals

function __ccxt_doc_Bullish_withdraw() end
"""
make a withdrawal
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/wallets/withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::string: the timestamp of the withdrawal request (mandatory)
- `params.nonce`::string: the nonce of the withdrawal request (mandatory)
- `params.network`::string: network for withdraw (mandatory)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bullish_withdraw

function __ccxt_doc_Bullish_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--trading-accounts

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Bullish_fetchAccounts

function __ccxt_doc_Bullish_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/deposit-instructions/crypto/-symbol-

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for deposit address

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bullish_fetchDepositAddress

function __ccxt_doc_Bullish_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset/-symbol-

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id (mandatory parameter)
- `params.code`::string, optional: unified currency code, default is undefined

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bullish_fetchBalance

function __ccxt_doc_Bullish_fetchPositions() end
"""
fetch all open positions
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/derivatives-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.tradingAccountId`::string: the trading account id

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bullish_fetchPositions

function __ccxt_doc_Bullish_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/transfer

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int: the latest time in ms to fetch transfers for (default time now)
- `params.tradingAccountId`::string: the trading account id

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bullish_fetchTransfers

function __ccxt_doc_Bullish_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/command-commandType-V1TransferAsset

# Arguments
- `code`::string: unified currency codeåå
- `amount`::float: amount to transfer
- `fromAccount`::string: account ID to transfer from
- `toAccount`::string: account ID to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bullish_transfer

function __ccxt_doc_Bullish_fetchBorrowRateHistory() end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/borrow-interest

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int: the latest time in ms to fetch entries for
- `params.tradingAccountId`::string: the trading account id

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Bullish_fetchBorrowRateHistory

function __ccxt_doc_Bullish_fetchOpenInterest() end
"""
fetches the open interest of a specific market
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick

# Arguments
- `symbol`::string: unified symbol of the market to fetch the open interest for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bullish_fetchOpenInterest

function __ccxt_doc_Bullish_signIn() end
"""
sign in, must be called prior to using other authenticated methods
see: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--add-authenticated-request-header

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
__ccxt_doc_Bullish_signIn
