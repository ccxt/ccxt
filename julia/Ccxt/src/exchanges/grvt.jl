@kwdef mutable struct Grvt <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    eipDefinitions::Function = eipDefinitions
    usesPrivateKey::Function = usesPrivateKey
    signIn::Function = signIn
    signInWithApiKey::Function = signInWithApiKey
    signInWithPrivateKey::Function = signInWithPrivateKey
    initializeClient::Function = initializeClient
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    getSubAccountId::Function = getSubAccountId
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    internalFetchTransfers::Function = internalFetchTransfers
    parseTransaction::Function = parseTransaction
    fetchTransfers::Function = fetchTransfers
    filterTransfersByType::Function = filterTransfersByType
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    loadAccountInfos::Function = loadAccountInfos
    withdraw::Function = withdraw
    createOrder::Function = createOrder
    convertToBigIntCustom::Function = convertToBigIntCustom
    eipMessageForOrder::Function = eipMessageForOrder
    fetchMyTrades::Function = fetchMyTrades
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchLeverages::Function = fetchLeverages
    setLeverage::Function = setLeverage
    parseLeverage::Function = parseLeverage
    fetchMarginModes::Function = fetchMarginModes
    parseMarginMode::Function = parseMarginMode
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrder::Function = fetchOrder
    parseOrder::Function = parseOrder
    parseTimeInForce::Function = parseTimeInForce
    timeInForceToInt::Function = timeInForceToInt
    parseOrderStatus::Function = parseOrderStatus
    cancelAllOrders::Function = cancelAllOrders
    cancelOrder::Function = cancelOrder
    eipDomainData::Function = eipDomainData
    feeAmountMultiplier::Function = feeAmountMultiplier
    createSignedRequest::Function = createSignedRequest
    formatSignatureRS::Function = formatSignatureRS
    defaultSignature::Function = defaultSignature
    handleUntilOptionString::Function = handleUntilOptionString
    requestId::Function = requestId
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    privateEdgePostAuthApiKeyLogin::Function = privateEdgePostAuthApiKeyLogin
    privateEdgePostAuthWalletLogin::Function = privateEdgePostAuthWalletLogin
    publicMarketPostFullV1Instrument::Function = publicMarketPostFullV1Instrument
    publicMarketPostFullV1AllInstruments::Function = publicMarketPostFullV1AllInstruments
    publicMarketPostFullV1Instruments::Function = publicMarketPostFullV1Instruments
    publicMarketPostFullV1Currency::Function = publicMarketPostFullV1Currency
    publicMarketPostFullV1MarginRules::Function = publicMarketPostFullV1MarginRules
    publicMarketPostFullV1Mini::Function = publicMarketPostFullV1Mini
    publicMarketPostFullV1Ticker::Function = publicMarketPostFullV1Ticker
    publicMarketPostFullV1Book::Function = publicMarketPostFullV1Book
    publicMarketPostFullV1Trade::Function = publicMarketPostFullV1Trade
    publicMarketPostFullV1TradeHistory::Function = publicMarketPostFullV1TradeHistory
    publicMarketPostFullV1Kline::Function = publicMarketPostFullV1Kline
    publicMarketPostFullV1Funding::Function = publicMarketPostFullV1Funding
    privateTradingPostFullV1CreateOrder::Function = privateTradingPostFullV1CreateOrder
    privateTradingPostFullV1CancelOrder::Function = privateTradingPostFullV1CancelOrder
    privateTradingPostFullV1CancelOnDisconnect::Function = privateTradingPostFullV1CancelOnDisconnect
    privateTradingPostFullV1CancelAllOrders::Function = privateTradingPostFullV1CancelAllOrders
    privateTradingPostFullV1Order::Function = privateTradingPostFullV1Order
    privateTradingPostFullV1OrderHistory::Function = privateTradingPostFullV1OrderHistory
    privateTradingPostFullV1OpenOrders::Function = privateTradingPostFullV1OpenOrders
    privateTradingPostFullV1FillHistory::Function = privateTradingPostFullV1FillHistory
    privateTradingPostFullV1Positions::Function = privateTradingPostFullV1Positions
    privateTradingPostFullV1FundingPaymentHistory::Function = privateTradingPostFullV1FundingPaymentHistory
    privateTradingPostFullV1GetSubAccounts::Function = privateTradingPostFullV1GetSubAccounts
    privateTradingPostFullV1AccountSummary::Function = privateTradingPostFullV1AccountSummary
    privateTradingPostFullV1AccountHistory::Function = privateTradingPostFullV1AccountHistory
    privateTradingPostFullV1AggregatedAccountSummary::Function = privateTradingPostFullV1AggregatedAccountSummary
    privateTradingPostFullV1FundingAccountSummary::Function = privateTradingPostFullV1FundingAccountSummary
    privateTradingPostFullV1Transfer::Function = privateTradingPostFullV1Transfer
    privateTradingPostFullV1DepositHistory::Function = privateTradingPostFullV1DepositHistory
    privateTradingPostFullV1TransferHistory::Function = privateTradingPostFullV1TransferHistory
    privateTradingPostFullV1Withdrawal::Function = privateTradingPostFullV1Withdrawal
    privateTradingPostFullV1WithdrawalHistory::Function = privateTradingPostFullV1WithdrawalHistory
    privateTradingPostFullV1AddPositionMargin::Function = privateTradingPostFullV1AddPositionMargin
    privateTradingPostFullV1GetPositionMarginLimits::Function = privateTradingPostFullV1GetPositionMarginLimits
    privateTradingPostFullV1SetPositionConfig::Function = privateTradingPostFullV1SetPositionConfig
    privateTradingPostFullV1SetInitialLeverage::Function = privateTradingPostFullV1SetInitialLeverage
    privateTradingPostFullV1GetAllInitialLeverage::Function = privateTradingPostFullV1GetAllInitialLeverage
    privateTradingPostFullV1SetDeriskMmRatio::Function = privateTradingPostFullV1SetDeriskMmRatio
    privateTradingPostFullV1VaultBurnTokens::Function = privateTradingPostFullV1VaultBurnTokens
    privateTradingPostFullV1VaultInvest::Function = privateTradingPostFullV1VaultInvest
    privateTradingPostFullV1VaultInvestorSummary::Function = privateTradingPostFullV1VaultInvestorSummary
    privateTradingPostFullV1VaultRedeem::Function = privateTradingPostFullV1VaultRedeem
    privateTradingPostFullV1VaultRedeemCancel::Function = privateTradingPostFullV1VaultRedeemCancel
    privateTradingPostFullV1VaultViewRedemptionQueue::Function = privateTradingPostFullV1VaultViewRedemptionQueue
    privateTradingPostFullV1VaultManagerInvestorHistory::Function = privateTradingPostFullV1VaultManagerInvestorHistory
    privateTradingPostFullV1AuthorizeBuilder::Function = privateTradingPostFullV1AuthorizeBuilder
    privateTradingPostFullV1GetAuthorizedBuilders::Function = privateTradingPostFullV1GetAuthorizedBuilders
    privateTradingPostFullV1BuilderFillHistory::Function = privateTradingPostFullV1BuilderFillHistory

end
function describe(self::Grvt, )
    rlOthers = 40;
    rlOrders = 20;
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "grvt",
    Symbol("name") => "GRVT",
    Symbol("countries") => ["SG"],
    Symbol("rateLimit") => 10,
    Symbol("certified") => false,
    Symbol("version") => "v1",
    Symbol("dex") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchMarginModes") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("setLeverage") => true,
        Symbol("signIn") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "CI_1_M",
        Symbol("3m") => "CI_3_M",
        Symbol("5m") => "CI_5_M",
        Symbol("15m") => "CI_15_M",
        Symbol("30m") => "CI_30_M",
        Symbol("1h") => "CI_1_H",
        Symbol("2h") => "CI_2_H",
        Symbol("4h") => "CI_4_H",
        Symbol("6h") => "CI_6_H",
        Symbol("8h") => "CI_8_H",
        Symbol("12h") => "CI_12_H",
        Symbol("1d") => "CI_1_D",
        Symbol("3d") => "CI_3_D",
        Symbol("5d") => "CI_5_D",
        Symbol("1w") => "CI_1_W",
        Symbol("2w") => "CI_2_W",
        Symbol("3w") => "CI_3_W",
        Symbol("4w") => "CI_4_W"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/cff0d37c-e594-40cb-88b3-90650ddadc18",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("privateEdge") => "https://edge.grvt.io/",
            Symbol("privateTrading") => "https://trades.grvt.io/",
            Symbol("publicMarket") => "https://market-data.grvt.io/"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("privateEdge") => "https://edge.testnet.grvt.io/",
            Symbol("privateTrading") => "https://trades.testnet.grvt.io/",
            Symbol("publicMarket") => "https://market-data.testnet.grvt.io/"
        ),
        Symbol("www") => "https://grvt.io",
        Symbol("referral") => "https://grvt.io/?ref=WBLS9D1",
        Symbol("doc") => ["https://api-docs.grvt.io/"],
        Symbol("fees") => "https://help.grvt.io/en/articles/9614699-how-does-grvt-s-fee-model-work"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("privateEdge") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("auth/api_key/login") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("auth/wallet/login") => Dict{Symbol, Any}(
    Symbol("cost") => 100
)
            )
        ),
        Symbol("publicMarket") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("full/v1/instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("full/v1/all_instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("full/v1/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("full/v1/currency") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/margin_rules") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/mini") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("full/v1/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("full/v1/book") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/trade_history") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("full/v1/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 12
)
            )
        ),
        Symbol("privateTrading") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("full/v1/create_order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("full/v1/cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("full/v1/cancel_on_disconnect") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/cancel_all_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("full/v1/order") => Dict{Symbol, Any}(
    Symbol("cost") => rlOrders
),
                Symbol("full/v1/order_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOrders
),
                Symbol("full/v1/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => rlOrders
),
                Symbol("full/v1/fill_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOrders
),
                Symbol("full/v1/positions") => Dict{Symbol, Any}(
    Symbol("cost") => rlOrders
),
                Symbol("full/v1/funding_payment_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/get_sub_accounts") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/account_summary") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/account_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/aggregated_account_summary") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/funding_account_summary") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/deposit_history") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/transfer_history") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/withdrawal_history") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("full/v1/add_position_margin") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/get_position_margin_limits") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/set_position_config") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/set_initial_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/get_all_initial_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/set_derisk_mm_ratio") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_burn_tokens") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_invest") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_investor_summary") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_redeem") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_redeem_cancel") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_view_redemption_queue") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/vault_manager_investor_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/authorize_builder") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/get_authorized_builders") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
),
                Symbol("full/v1/builder_fill_history") => Dict{Symbol, Any}(
    Symbol("cost") => rlOthers
)
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("accountId") => nothing,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ARBITRUM") => "42161",
            Symbol("AVAXC") => "43114",
            Symbol("BASE") => "8453",
            Symbol("BSC") => "56",
            Symbol("ETH") => "1",
            Symbol("ERC20") => "1",
            Symbol("OP") => "10",
            Symbol("SOL") => "900",
            Symbol("TRX") => "728126428",
            Symbol("ZKSYNCERA") => "324",
            Symbol("KAIA") => "8217"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("1") => "ERC20"
        ),
        Symbol("builderFee") => true,
        Symbol("builder") => "0x21d2a053495994b1132a38cd1171acec40c6741e",
        Symbol("builderRate") => 0.01
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true,
                    Symbol("median") => true
                ),
                Symbol("triggerDirection") => true,
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
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 1000,
                Symbol("untilDays") => 1000,
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
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => nothing,
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("privateKey") => true,
        Symbol("apiKey") => false,
        Symbol("secret") => false
    ),
    Symbol("quoteJsonNumbers") => false,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("1000") => AuthenticationError,
            Symbol("1001") => PermissionDenied,
            Symbol("1002") => OperationFailed,
            Symbol("1003") => BadRequest,
            Symbol("1004") => OperationRejected,
            Symbol("1005") => OperationFailed,
            Symbol("1006") => RateLimitExceeded,
            Symbol("1008") => PermissionDenied,
            Symbol("1009") => OperationRejected,
            Symbol("1012") => BadRequest,
            Symbol("1400") => PermissionDenied,
            Symbol("2000") => PermissionDenied,
            Symbol("2001") => InvalidNonce,
            Symbol("2002") => BadRequest,
            Symbol("2003") => PermissionDenied,
            Symbol("2004") => InvalidNonce,
            Symbol("2005") => BadRequest,
            Symbol("2006") => BadRequest,
            Symbol("2007") => BadRequest,
            Symbol("2008") => BadRequest,
            Symbol("2010") => InvalidOrder,
            Symbol("2011") => InvalidOrder,
            Symbol("2012") => InvalidOrder,
            Symbol("2020") => InvalidOrder,
            Symbol("2021") => InvalidOrder,
            Symbol("2030") => InvalidOrder,
            Symbol("2031") => InvalidOrder,
            Symbol("2032") => InvalidOrder,
            Symbol("2040") => InvalidOrder,
            Symbol("2041") => InvalidOrder,
            Symbol("2042") => InvalidOrder,
            Symbol("2050") => InvalidOrder,
            Symbol("2051") => InvalidOrder,
            Symbol("2060") => BadSymbol,
            Symbol("2061") => BadSymbol,
            Symbol("2062") => InvalidOrder,
            Symbol("2063") => InvalidOrder,
            Symbol("2064") => InvalidOrder,
            Symbol("2065") => InvalidOrder,
            Symbol("2070") => InvalidOrder,
            Symbol("2080") => InsufficientFunds,
            Symbol("2081") => OperationRejected,
            Symbol("2082") => InvalidOrder,
            Symbol("2083") => OperationRejected,
            Symbol("2090") => RateLimitExceeded,
            Symbol("2100") => BadRequest,
            Symbol("2101") => BadRequest,
            Symbol("2102") => OperationRejected,
            Symbol("2103") => OperationRejected,
            Symbol("2104") => BadRequest,
            Symbol("2105") => BadRequest,
            Symbol("2107") => BadRequest,
            Symbol("2108") => BadRequest,
            Symbol("2110") => InvalidOrder,
            Symbol("2111") => InvalidOrder,
            Symbol("2112") => InvalidOrder,
            Symbol("2113") => InvalidOrder,
            Symbol("2114") => InvalidOrder,
            Symbol("2115") => InvalidOrder,
            Symbol("2116") => InvalidOrder,
            Symbol("2117") => InvalidOrder,
            Symbol("2300") => OperationRejected,
            Symbol("2301") => OperationRejected,
            Symbol("2400") => OperationRejected,
            Symbol("2401") => OperationRejected,
            Symbol("2402") => OperationRejected,
            Symbol("3000") => BadSymbol,
            Symbol("3004") => OperationRejected,
            Symbol("3005") => OperationRejected,
            Symbol("3006") => OperationRejected,
            Symbol("3021") => BadRequest,
            Symbol("3031") => BadRequest,
            Symbol("4000") => InsufficientFunds,
            Symbol("4002") => OperationFailed,
            Symbol("4010") => OperationRejected,
            Symbol("5000") => OperationRejected,
            Symbol("5001") => OperationRejected,
            Symbol("5002") => OperationRejected,
            Symbol("5003") => OperationRejected,
            Symbol("5004") => OperationRejected,
            Symbol("5005") => OperationRejected,
            Symbol("6000") => OperationRejected,
            Symbol("6100") => OperationRejected,
            Symbol("7000") => OperationRejected,
            Symbol("7001") => InsufficientFunds,
            Symbol("7002") => OperationFailed,
            Symbol("7003") => OperationRejected,
            Symbol("7004") => OperationRejected,
            Symbol("7005") => InsufficientFunds,
            Symbol("7006") => OperationFailed,
            Symbol("7007") => PermissionDenied,
            Symbol("7100") => OperationFailed,
            Symbol("7101") => OperationRejected,
            Symbol("7102") => OperationRejected,
            Symbol("7103") => OperationRejected,
            Symbol("7201") => OperationRejected,
            Symbol("7450") => OperationRejected,
            Symbol("7451") => OperationRejected,
            Symbol("7452") => OperationRejected,
            Symbol("7453") => OperationRejected,
            Symbol("7454") => OperationRejected,
            Symbol("7455") => OperationRejected,
            Symbol("7500") => OperationRejected,
            Symbol("7501") => BadRequest,
            Symbol("7502") => OperationRejected,
            Symbol("7503") => OperationRejected,
            Symbol("7504") => OperationRejected
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function eipDefinitions(self::Grvt, )
    return Dict{Symbol, Any}(
    Symbol("EIP712_ORDER_TYPE") => Dict{Symbol, Any}(
        Symbol("Order") => [Dict{Symbol, Any}(
    Symbol("name") => "subAccountID",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "isMarket",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "timeInForce",
    Symbol("type") => "uint8"
), Dict{Symbol, Any}(
    Symbol("name") => "postOnly",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "reduceOnly",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "legs",
    Symbol("type") => "OrderLeg[]"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)],
        Symbol("OrderLeg") => [Dict{Symbol, Any}(
    Symbol("name") => "assetID",
    Symbol("type") => "uint256"
), Dict{Symbol, Any}(
    Symbol("name") => "contractSize",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "limitPrice",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "isBuyingContract",
    Symbol("type") => "bool"
)]
    ),
    Symbol("EIP712_ORDER_WITH_BUILDER_TYPE") => Dict{Symbol, Any}(
        Symbol("OrderWithBuilderFee") => [Dict{Symbol, Any}(
    Symbol("name") => "subAccountID",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "isMarket",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "timeInForce",
    Symbol("type") => "uint8"
), Dict{Symbol, Any}(
    Symbol("name") => "postOnly",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "reduceOnly",
    Symbol("type") => "bool"
), Dict{Symbol, Any}(
    Symbol("name") => "legs",
    Symbol("type") => "OrderLeg[]"
), Dict{Symbol, Any}(
    Symbol("name") => "builder",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "builderFee",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)],
        Symbol("OrderLeg") => [Dict{Symbol, Any}(
    Symbol("name") => "assetID",
    Symbol("type") => "uint256"
), Dict{Symbol, Any}(
    Symbol("name") => "contractSize",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "limitPrice",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "isBuyingContract",
    Symbol("type") => "bool"
)]
    ),
    Symbol("EIP712_TRANSFER_TYPE") => Dict{Symbol, Any}(
        Symbol("Transfer") => [Dict{Symbol, Any}(
    Symbol("name") => "fromAccount",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "fromSubAccount",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "toAccount",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "toSubAccount",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "tokenCurrency",
    Symbol("type") => "uint8"
), Dict{Symbol, Any}(
    Symbol("name") => "numTokens",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)]
    ),
    Symbol("EIP712_WITHDRAWAL_TYPE") => Dict{Symbol, Any}(
        Symbol("Withdrawal") => [Dict{Symbol, Any}(
    Symbol("name") => "fromAccount",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "toEthAddress",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "tokenCurrency",
    Symbol("type") => "uint8"
), Dict{Symbol, Any}(
    Symbol("name") => "numTokens",
    Symbol("type") => "uint64"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)]
    ),
    Symbol("EIP712_BUILDER_APPROVAL_TYPE") => Dict{Symbol, Any}(
        Symbol("AuthorizeBuilder") => [Dict{Symbol, Any}(
    Symbol("name") => "mainAccountID",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "builderAccountID",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "maxFutureFeeRate",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "maxSpotFeeRate",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)]
    ),
    Symbol("EIP712_WALLETLOGIN_TYPE") => Dict{Symbol, Any}(
        Symbol("WalletLogin") => [Dict{Symbol, Any}(
    Symbol("name") => "signer",
    Symbol("type") => "address"
), Dict{Symbol, Any}(
    Symbol("name") => "nonce",
    Symbol("type") => "uint32"
), Dict{Symbol, Any}(
    Symbol("name") => "expiration",
    Symbol("type") => "int64"
)]
    )
)

end
function usesPrivateKey(self::Grvt, )
    privateKeyDefined = @functions.ccxt_and(self.privateKey != nothing, self.privateKey != "");
    apiKeyDefined = @functions.ccxt_and(self.apiKey != nothing, self.apiKey != "");
    if functions.ccxtruthy(@functions.ccxt_and(privateKeyDefined, apiKeyDefined))
        throw(ExchangeError("You should provide either \"privateKey\" or \"apikey & secret\""));
    end
    return privateKeyDefined

end
"""
sign in, must be called prior to using other authenticated methods
see: https://api-docs.grvt.io/#authentication

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
function signIn(self::Grvt; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(self.privateKey == nothing, self.privateKey == ""))
        throw(PermissionDenied("Private key is required for this operation. If you used joined GRVT through email registration instead of Web3 wallet, then read: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-grvt-exchange-in-ccxt"));
    end
    Base.fetch(self.signInWithPrivateKey(params = params));
    Base.fetch(self.initializeClient(params = params));
    Base.fetch(self.loadAccountInfos());
    return true

end
function signInWithApiKey(self::Grvt; params=Dict())
    now = milliseconds();
    expires = safeInteger(self.options, "signInExpiration", 0);
    if functions.ccxtruthy(@functions.ccxt_and(expires != nothing, functions.ccxt_gt(expires, now + 10000)))
            return Dict{Symbol, Any}()
    end
    request = Dict{Symbol, Any}(
        Symbol("api_key") => self.apiKey
    );
    response = Base.fetch(self.privateEdgePostAuthApiKeyLogin(extend(request, params)));
    self.options[Symbol("signInExpiration")] = now + 86400000;
    return response

end
function signInWithPrivateKey(self::Grvt; params=Dict())
    self.checkRequiredCredentials();
    now = milliseconds();
    expires = safeInteger(self.options, "signInExpiration", 0);
    if functions.ccxtruthy(@functions.ccxt_and(expires != nothing, functions.ccxt_gt(expires, now + 10000)))
            return Dict{Symbol, Any}()
    end
    walletAddress = self.ethGetAddressFromPrivateKey(self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("address") => walletAddress,
        Symbol("signature") => self.defaultSignature()
    );
    request = self.createSignedRequest(request, "EIP712_WALLETLOGIN_TYPE");
    response = Base.fetch(self.privateEdgePostAuthWalletLogin(extend(request, params)));
    self.options[Symbol("signInExpiration")] = now + 86400000;
    return response

end
function initializeClient(self::Grvt; params=Dict())
    builderFee = self.safeBool(params, "builderFee", defaultValue = self.safeBool(self.options, "builderFee", defaultValue = true));
    if functions.ccxtruthy(!functions.ccxtruthy(builderFee))
            return false
    end
    approvedBuilderFee = self.safeBool(self.options, "approvedBuilderFee", defaultValue = false);
    if functions.ccxtruthy(approvedBuilderFee)
            return true
    end
    results = Base.fetch(asyncmap(Base.fetch, [self.privateTradingPostFullV1GetAuthorizedBuilders(), self.loadAccountInfos()]));
    currentBuilders = get(results, 1, nothing);
    approvedBuilder = self.safeList(currentBuilders, "results", defaultValue = []);
    len = length(approvedBuilder);
    found = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, len))
        builderInfo = self.safeDict(approvedBuilder, i, defaultValue = Dict{Symbol, Any}());
        builderAccountId = safeString(builderInfo, "builder_account_id");
        if functions.ccxtruthy(builderAccountId == safeString(self.options, "builder"))
            found = true;
            break
        end
        i += 1
    end
    if functions.ccxtruthy(found)
        self.options[Symbol("approvedBuilderFee")] = true;
    else
        try
            defaultFromAccountId = safeString(self.options, "userMainAccountId");
            request = Dict{Symbol, Any}(
                Symbol("main_account_id") => defaultFromAccountId,
                Symbol("builder_account_id") => safeString(self.options, "builder"),
                Symbol("max_futures_fee_rate") => safeString(self.options, "builderRate"),
                Symbol("max_spot_fee_rate") => safeString(self.options, "builderRate"),
                Symbol("signature") => self.defaultSignature()
            );
            request = self.createSignedRequest(request, "EIP712_BUILDER_APPROVAL_TYPE");
            authResponse = Base.fetch(self.privateTradingPostFullV1AuthorizeBuilder(extend(request, params)));
            authResult = self.safeDict(authResponse, "result");
            ack = self.safeBool(authResult, "ack");
            if functions.ccxtruthy(!functions.ccxtruthy(ack))
                throw(ExchangeError(string("Builder authorization failed, ", json(authResponse))));
            end
            self.options[Symbol("approvedBuilderFee")] = true;
        catch e
            self.options[Symbol("builderFee")] = false;

        end
    end
    return nothing

end
"""
retrieves data on all markets
see: https://api-docs.grvt.io/market_data_api/#get-instrument-prod

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Grvt; params=Dict())
    marketsPromise = self.publicMarketPostFullV1AllInstruments(params);
    promises = [marketsPromise];
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(self.isEmptyString(self.apiKey)), !functions.ccxtruthy(self.isEmptyString(self.privateKey))))
                push!(promises, self.signIn());
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    response = get(results, 1, nothing);
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseMarkets(result)

end
function parseMarket(self::Grvt, market)
    marketId = safeString(market, "instrument");
    baseId = safeString(market, "base");
    quoteId = safeString(market, "quote");
    settleId = quoteId;
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    type_var = nothing;
    typeRaw = safeString(market, "kind");
    if functions.ccxtruthy(typeRaw == "PERPETUAL")
        type_var = "swap";
    end
    isSpot = (type_var == "spot");
    isSwap = (type_var == "swap");
    isFuture = (type_var == "future");
    isContract = @functions.ccxt_or(isSwap, isFuture);
    return Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => isSwap,
    Symbol("future") => isFuture,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => isContract,
    Symbol("linear") => functions.ccxtruthy(isSwap) ? true : nothing,
    Symbol("inverse") => functions.ccxtruthy(isSwap) ? false : nothing,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "min_size"),
        Symbol("price") => self.safeNumber(market, "tick_size"),
        Symbol("base") => self.parseNumber(self.parsePrecision(precision = safeString(market, "base_decimals"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quote_decimals")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_size"),
            Symbol("max") => self.safeNumber(market, "max_position_size")
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
    Symbol("created") => safeIntegerProduct(market, "create_time", 0.000001),
    Symbol("info") => market
)

end
"""
fetches all available currencies on an exchange
see: https://api-docs.grvt.io/market_data_api/#get-currency-response

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Grvt; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("") => ""
    );
    response = Base.fetch(self.publicMarketPostFullV1Currency(request));
    responseResult = self.safeList(response, "result", defaultValue = []);
    return self.parseCurrencies(responseResult)

end
function parseCurrency(self::Grvt, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, "balance_decimals"))),
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
    Symbol("type") => "crypto",
    Symbol("networks") => nothing,
    Symbol("numericId") => safeInteger(rawCurrency, "id")
))

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.grvt.io/market_data_api/#ticker_1

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Grvt, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => self.marketId(symbol)
    );
    response = Base.fetch(self.publicMarketPostFullV1Ticker(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(result, market = market)

end
function parseTicker(self::Grvt, ticker; market=nothing)
    marketId = safeString(ticker, "instrument");
    timestamp = safeIntegerProduct(ticker, "event_time", 0.000001);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("open") => safeString(ticker, "open_price"),
    Symbol("high") => safeString(ticker, "high_price"),
    Symbol("low") => safeString(ticker, "low_price"),
    Symbol("last") => safeString(ticker, "last_price"),
    Symbol("bid") => safeString(ticker, "best_bid_price"),
    Symbol("bidVolume") => safeString(ticker, "best_bid_size"),
    Symbol("ask") => safeString(ticker, "best_ask_price"),
    Symbol("askVolume") => safeString(ticker, "best_ask_size"),
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("baseVolume") => safeString(ticker, "buy_volume_24h_b"),
    Symbol("quoteVolume") => safeString(ticker, "buy_volume_24h_q"),
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("vwap") => nothing,
    Symbol("average") => nothing,
    Symbol("previousClose") => nothing
))

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.grvt.io/market_data_api/#orderbook-levels

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.loc`::string, optional: crypto location, default: us

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Grvt, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument") => self.marketId(symbol)
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    if functions.ccxtruthy(functions.ccxt_le(limit, 500))
        request[Symbol("depth")] = self.findNearestCeiling([10, 50, 100, 500], limit);
    end
    response = Base.fetch(self.publicMarketPostFullV1Book(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    timestamp = self.parse8601(safeString(result, "event_time"));
    marketId = safeString(result, "instrument");
    return self.parseOrderBook(result, self.safeSymbol(marketId), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = "price", amountKey = "size")

end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.grvt.io/market_data_api/#trade_1

# Arguments
- `symbol`::string: unified symbol of the market
- `since`::int, optional: timestamp in ms of the earliest item to fetch
- `limit`::int, optional: the maximum amount of items to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Grvt, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1TradeHistory(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseTrades(result, market = market, since = since, limit = limit)

end
function parseTrade(self::Grvt, trade; market=nothing)
    marketId = safeString(trade, "instrument");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeIntegerProduct(trade, "event_time", 0.000001);
    takerOrMaker = nothing;
    isTakerBuyer = self.safeBool(trade, "is_taker_buyer");
    side = nothing;
    if functions.ccxtruthy(isTakerBuyer != nothing)
        side = functions.ccxtruthy(isTakerBuyer) ? "buy" : "sell";
        takerOrMaker = "taker";
    else
        takerOrMaker = functions.ccxtruthy(self.safeBool(trade, "is_taker")) ? "taker" : "maker";
        side = functions.ccxtruthy(self.safeBool(trade, "is_buyer")) ? "buy" : "sell";
    end
    fee = nothing;
    feeString = safeString(trade, "fee");
    if functions.ccxtruthy(feeString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeString),
            Symbol("currency") => get(market, Symbol("quote"), nothing),
            Symbol("rate") => self.safeNumber(trade, "fee_rate")
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString(trade, "trade_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "size"),
    Symbol("cost") => nothing,
    Symbol("fee") => fee,
    Symbol("order") => safeString(trade, "order_id")
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.grvt.io/market_data_api/#candlestick_1

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest item to fetch
- `limit`::int, optional: the maximum amount of items to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Grvt, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    maxLimit = 1000;
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    priceTypeMap = Dict{Symbol, Any}(
        Symbol("last") => "TRADE",
        Symbol("mark") => "MARK",
        Symbol("index") => "INDEX"
    );
    selectedPriceType = safeString(params, "priceType", "last");
    request[Symbol("type")] = safeString(priceTypeMap, selectedPriceType);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1Kline(extend(request, params)));
    candles = self.safeList(response, "result", defaultValue = []);
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Grvt, ohlcv; market=nothing)
    return [safeIntegerProduct(ohlcv, "open_time", 0.000001), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume_b")]

end
"""
fetches historical funding rate prices
see: https://api-docs.grvt.io/market_data_api/#funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Grvt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.publicMarketPostFullV1Funding(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseFundingRateHistories(result, market = market)

end
function parseFundingRateHistory(self::Grvt, rawItem; market=nothing)
    marketId = safeString(rawItem, "instrument");
    ts = safeIntegerProduct(rawItem, "funding_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => rawItem,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("fundingRate") => self.safeNumber(rawItem, "funding_rate"),
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts)
)

end
function getSubAccountId(self::Grvt, params)
    subAccountId = nothing;
    (subAccountId, params) = self.handleOptionAndParams(params, "getSubAccountId", "accountId");
    if functions.ccxtruthy(subAccountId == nothing)
        throw(ArgumentsRequired(string(self.id, " you should set \"accountId\" in options or params, which can be found in the grvt dashboard, under Api-Keys page")));
    end
    return string(subAccountId)

end
"""
query for account info
see: https://api-docs.grvt.io/trading_api/#sub-account-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Grvt; params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1AccountSummary(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseBalance(result)

end
function parseBalance(self::Grvt, response)
    timestamp = safeIntegerProduct(response, "event_time", 0.000001);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    spotBalances = self.safeList(response, "spot_balances", defaultValue = []);
    availableBalance = safeString(response, "available_balance");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(spotBalances)))
        balance = get(spotBalances, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "balance");
        account[Symbol("free")] = availableBalance;
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch all deposits made to an account
see: https://api-docs.grvt.io/trading_api/#transfer

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Grvt; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = [get(currency, Symbol("code"), nothing)];
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    useTransfersEndpoint = self.safeBool(self.options, "useTransfersEndpointForDepositsWithdrawals", defaultValue = true);
    if functions.ccxtruthy(useTransfersEndpoint)
        transfers = Base.fetch(self.internalFetchTransfers(extend(request, params), currency = currency, since = since, limit = limit));
        filteredResults = self.filterTransfersByType(transfers, "deposit", onlyMainAccount = true);
        transactions = self.getListFromObjectValues(get(filteredResults, 1, nothing), "info");
            return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)
    else
        response = Base.fetch(self.privateTradingPostFullV1DepositHistory(extend(request, params)));
        result = self.safeList(response, "result", defaultValue = []);
        return self.parseTransactions(result, currency = currency, since = since, limit = limit)
    end

end
"""
fetch all withdrawals made from an account
see: https://api-docs.grvt.io/trading_api/#withdrawal-history

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Grvt; code=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code == nothing)
        request[Symbol("currency")] = nothing;
    else
        currency = self.currency(code);
        request[Symbol("currency")] = [get(currency, Symbol("code"), nothing)];
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    useTransfersEndpoint = self.safeBool(self.options, "useTransfersEndpointForDepositsWithdrawals", defaultValue = true);
    if functions.ccxtruthy(useTransfersEndpoint)
        transfers = Base.fetch(self.internalFetchTransfers(extend(request, params), currency = currency, since = since, limit = limit));
        filteredResults = self.filterTransfersByType(transfers, "withdrawal", onlyMainAccount = true);
        transactions = self.getListFromObjectValues(get(filteredResults, 1, nothing), "info");
            return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)
    else
        response = Base.fetch(self.privateTradingPostFullV1WithdrawalHistory(extend(request, params)));
        result = self.safeList(response, "result", defaultValue = []);
        return self.parseTransactions(result, currency = currency, since = since, limit = limit)
    end

end
function internalFetchTransfers(self::Grvt, req; currency=nothing, since=nothing, limit=nothing)
    response = Base.fetch(self.privateTradingPostFullV1TransferHistory(req));
    rows = self.safeList(response, "result", defaultValue = []);
    transfers = self.parseTransfers(rows, currency = currency, since = since, limit = limit);
    return transfers

end
function parseTransaction(self::Grvt, transaction; currency=nothing)
    direction = nothing;
    txId = nothing;
    networkCode = nothing;
    addressFrom = safeString(transaction, "from_account_id");
    addressTo = safeString(transaction, "to_account_id");
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    if functions.ccxtruthy(ccxt_in("transfer_metadata", transaction))
        metaData = omitZero(safeString(transaction, "transfer_metadata"));
        if functions.ccxtruthy(metaData != nothing)
            parsedMeta = self.parseJson(metaData);
            direction = safeStringLower(parsedMeta, "direction");
            txId = safeString(parsedMeta, "provider_tx_id");
            networkCode = self.networkIdToCode(networkId = safeString(parsedMeta, "chainid"), currencyCode = code);
            if functions.ccxtruthy(direction == "withdrawal")
                addressTo = safeString(parsedMeta, "endpoint");
            elseif functions.ccxtruthy(direction == "deposit")
                addressFrom = safeString(parsedMeta, "endpoint");
            end
        end
    end
    timestamp = safeIntegerProduct2(transaction, "event_time", "initiated_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => nothing,
    Symbol("txid") => txId,
    Symbol("type") => direction,
    Symbol("currency") => code,
    Symbol("network") => networkCode,
    Symbol("amount") => self.safeNumber(transaction, "num_tokens"),
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => nothing
)

end
"""
fetch a history of internal transfers made on an account
see: https://api-docs.grvt.io/trading_api/#transfer-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: whether to paginate the results (default false)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Grvt; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}();
    currency = self.currency(code);
    maxLimit = 1000;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = nothing, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1TransferHistory(extend(request, params)));
    rows = self.safeList(response, "result", defaultValue = []);
    transfers = self.parseTransfers(rows, currency = currency, since = since, limit = limit);
    filteredResults = self.filterTransfersByType(transfers, "internal", onlyMainAccount = false);
    return get(filteredResults, 2, nothing)

end
function filterTransfersByType(self::Grvt, transfers, transferType; onlyMainAccount=true)
    matchedResults = [];
    nonMatchedResults = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transfers)))
        transfer = get(transfers, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(@functions.ccxt_and(onlyMainAccount, get(transfer, Symbol("fromAccount"), nothing) == "0"), get(transfer, Symbol("toAccount"), nothing) == "0")), (@functions.ccxt_and(!functions.ccxtruthy(onlyMainAccount), (@functions.ccxt_or(get(transfer, Symbol("fromAccount"), nothing) != "0", get(transfer, Symbol("toAccount"), nothing) != "0"))))))
            metadata = safeString(get(transfer, Symbol("info"), nothing), "transfer_metadata");
            parsedMetadata = self.parseJson(metadata);
            direction = safeString(parsedMetadata, "direction");
            if functions.ccxtruthy(direction == transferType)
                                push!(matchedResults, transfer);
            else
                push!(nonMatchedResults, transfer);
            end
        end
        i += 1
    end
    return [matchedResults, nonMatchedResults]

end
"""
transfer currency internally between wallets on the same account
see: https://api-docs.grvt.io/trading_api/#transfer_1

# Arguments
- `code`::string: unified currency codeåå
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Grvt, code, amount, fromAccount, toAccount; params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    currency = self.currency(code);
    defaultFromAccountId = safeString(self.options, "userMainAccountId");
    if functions.ccxtruthy(@functions.ccxt_and(inArray(fromAccount, ["trading", "funding"]), inArray(toAccount, ["trading", "funding"])))
        tradingAccountId = nothing;
        (tradingAccountId, params) = self.handleOptionAndParams(params, "transfer", "tradingAccountId");
        fundingAccountId = nothing;
        (fundingAccountId, params) = self.handleOptionAndParams(params, "transfer", "fundingAccountId");
        if functions.ccxtruthy(@functions.ccxt_or(tradingAccountId == nothing, fundingAccountId == nothing))
            throw(ArgumentsRequired(string(self.id, " transfer(): you should set (in the options or params) \"tradingAccountId\" and \"fundingAccountId\" (you can use \"0\" as a main funding account id)")));
        end
        fromAccount = functions.ccxtruthy((fromAccount == "trading")) ? tradingAccountId : fundingAccountId;
        toAccount = functions.ccxtruthy((toAccount == "trading")) ? tradingAccountId : fundingAccountId;
    end
    request = Dict{Symbol, Any}(
        Symbol("from_account_id") => safeString(params, "from_account_id", defaultFromAccountId),
        Symbol("from_sub_account_id") => safeString(params, "from_sub_account_id", fromAccount),
        Symbol("to_account_id") => safeString(params, "to_account_id", defaultFromAccountId),
        Symbol("to_sub_account_id") => safeString(params, "to_sub_account_id", toAccount),
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("num_tokens") => self.currencyToPrecision(code, amount),
        Symbol("signature") => self.defaultSignature(),
        Symbol("transfer_type") => "STANDARD",
        Symbol("transfer_metadata") => nothing
    );
    request = self.createSignedRequest(request, "EIP712_TRANSFER_TYPE", currencyObj = currency);
    response = nothing;
    try
        response = Base.fetch(self.privateTradingPostFullV1Transfer(extend(request, params)));
    catch e
        msg = self.exceptionMessage(error);
        isFromFundingAccount = fromAccount == "funding";
        if functions.ccxtruthy(@functions.ccxt_and(isFromFundingAccount, ccxt_indexOf("You are not authorized", msg)))
            throw(PermissionDenied(string(self.id, " transfer() failed. Ensure you use funding api-keys when trying to transfer from Funding accounts: ", msg)));
        end
        throw(error);

    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTransfer(result, currency = currency)

end
function parseTransfer(self::Grvt, transfer; currency=nothing)
    currencyId = safeString(transfer, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeIntegerProduct(transfer, "event_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "tx_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeString(transfer, "from_sub_account_id"),
    Symbol("toAccount") => safeString(transfer, "to_sub_account_id"),
    Symbol("status") => nothing
)

end
function loadAccountInfos(self::Grvt, )
    if functions.ccxtruthy(safeString(self.options, "userMainAccountId") != nothing)
            return false
    end
    promises = [];
    push!(promises, self.privateTradingPostFullV1AggregatedAccountSummary());
    accountIsUndefined = safeString(self.options, "accountId") == nothing;
    if functions.ccxtruthy(accountIsUndefined)
                push!(promises, self.privateTradingPostFullV1GetSubAccounts());
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    result1 = self.safeDict(get(responses, 1, nothing), "result", defaultValue = Dict{Symbol, Any}());
    mainAccountId = safeString(result1, "main_account_id");
    self.options[Symbol("userMainAccountId")] = mainAccountId;
    if functions.ccxtruthy(accountIsUndefined)
        subAccountIds = self.safeList(get(responses, 2, nothing), "sub_account_ids", defaultValue = []);
        len = length(subAccountIds);
        if functions.ccxtruthy(functions.ccxt_lt(len, 1))
            throw(ArgumentsRequired(string(self.id, " loadAccountInfos(): no sub accounts found, you might need to create an api-key in GRVT website")));
        end
        if functions.ccxtruthy(functions.ccxt_gt(len, 1))
            throw(ArgumentsRequired(string(self.id, " loadAccountInfos(): multiple sub accounts found, please set the exchange.options[\"accountId\"] to your preferred sub_account_id from this list: ", json(subAccountIds))));
        end
        subAccountId = safeString(subAccountIds, 0);
        self.options[Symbol("accountId")] = subAccountId;
    end
    return true

end
"""
make a withdrawal
see: https://api-docs.grvt.io/trading_api/#withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string: the network to withdraw on (mandatory)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Grvt, code, amount, address; tag=nothing, params=Dict())
    self.checkAddress(address = address);
    Base.fetch(self.loadMarketsAndSignIn());
    defaultFromAccountId = safeString(self.options, "userMainAccountId");
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("to_eth_address") => address,
        Symbol("from_account_id") => defaultFromAccountId,
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("num_tokens") => self.currencyToPrecision(code, amount),
        Symbol("signature") => self.defaultSignature()
    );
    (networkCode, query) = self.handleNetworkCodeAndParams(params);
    networkId = self.networkCodeToId(networkCode, currencyCode = code);
    if functions.ccxtruthy(networkId == nothing)
        throw(BadRequest(string(self.id, " withdraw() requires a network parameter")));
    end
    request[Symbol("signature")][Symbol("chain_id")] = networkId;
    request = self.createSignedRequest(request, "EIP712_WITHDRAWAL_TYPE", currencyObj = currency);
    response = Base.fetch(self.privateTradingPostFullV1Withdrawal(extend(request, query)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(result, currency = currency)

end
"""
create a trade order
see: https://api-docs.grvt.io/trading_api/#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Grvt, symbol, type_var, side, amount; price=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    orderLeg = Dict{Symbol, Any}(
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("size") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(price != nothing)
        orderLeg[Symbol("limit_price")] = self.priceToPrecision(symbol, price);
    else
        orderLeg[Symbol("limit_price")] = nothing;
    end
    if functions.ccxtruthy(side == "sell")
        orderLeg[Symbol("is_buying_asset")] = false;
    elseif functions.ccxtruthy(side == "buy")
        orderLeg[Symbol("is_buying_asset")] = true;
    else
        throw(InvalidOrder(string(self.id, " createOrder(): order side must be either \"buy\" or \"sell\"")));
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        clientOrderId = string(self.nonce(), "000", self.requestId());
    end
    params = omit(params, ["clientOrderId"]);
    isMarketOrder = (type_var == "market");
    subAccountId = self.getSubAccountId(params);
    isReduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    orderRequest = Dict{Symbol, Any}(
        Symbol("sub_account_id") => subAccountId,
        Symbol("time_in_force") => nothing,
        Symbol("legs") => [orderLeg],
        Symbol("signature") => self.defaultSignature(),
        Symbol("metadata") => Dict{Symbol, Any}(
            Symbol("client_order_id") => clientOrderId
        ),
        Symbol("is_market") => isMarketOrder,
        Symbol("post_only") => false,
        Symbol("reduce_only") => isReduceOnly
    );
    timeInForce = safeStringUpper(params, "timeInForce", "GOOD_TILL_TIME");
    postOnly = self.isPostOnly(isMarketOrder, nothing, params = params);
    if functions.ccxtruthy(postOnly)
        orderRequest[Symbol("post_only")] = true;
    end
    if functions.ccxtruthy(timeInForce == nothing)
        timeInForce = "GOOD_TILL_TIME";
    else
        tifMap = Dict{Symbol, Any}(
            Symbol("GTC") => "GOOD_TILL_TIME",
            Symbol("FOK") => "FILL_OR_KILL",
            Symbol("IOC") => "IMMEDIATE_OR_CANCEL"
        );
        timeInForce = safeString(tifMap, timeInForce, timeInForce);
    end
    orderRequest[Symbol("time_in_force")] = timeInForce;
    if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        if functions.ccxtruthy(postOnly)
            timeInForce = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "ioc")
            timeInForce = "IMMEDIATE_OR_CANCEL";
        end
    end
    params = omit(params, ["reduceOnly", "postOnly", "timeInForce"]);
    triggerPrice = nothing;
    stopLossPrice = nothing;
    takeProfitPrice = nothing;
    (triggerPrice, stopLossPrice, takeProfitPrice, params) = self.handleTriggerPricesAndParams(symbol, params);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(triggerPrice != nothing, stopLossPrice != nothing), takeProfitPrice != nothing))
        selectedPrice = nothing;
        if functions.ccxtruthy(triggerPrice != nothing)
            selectedPrice = triggerPrice;
        elseif functions.ccxtruthy(stopLossPrice != nothing)
            selectedPrice = stopLossPrice;
        else
            if functions.ccxtruthy(takeProfitPrice != nothing)
                selectedPrice = takeProfitPrice;
            end

        end
        selectedType = nothing;
        isBuy = (side == "buy");
        if functions.ccxtruthy(stopLossPrice != nothing)
            selectedType = functions.ccxtruthy(isBuy) ? "STOP_LOSS" : "TAKE_PROFIT";
        elseif functions.ccxtruthy(takeProfitPrice != nothing)
            selectedType = functions.ccxtruthy(isBuy) ? "TAKE_PROFIT" : "STOP_LOSS";
        else
            triggerDirection = safeString(params, "triggerDirection");
            if functions.ccxtruthy(triggerDirection == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerDirection parameter when triggerPrice is specified, must be \"ascending\" or \"descending\"")));
            end
            if functions.ccxtruthy(triggerDirection != nothing)
                if functions.ccxtruthy(triggerDirection == "ascending")
                    selectedType = functions.ccxtruthy(isBuy) ? "STOP_LOSS" : "TAKE_PROFIT";
                elseif functions.ccxtruthy(triggerDirection == "descending")
                    selectedType = functions.ccxtruthy(isBuy) ? "TAKE_PROFIT" : "STOP_LOSS";
                end
            end
        end
        triggerPriceType = safeStringUpper(params, "triggerPriceType", "LAST");
        orderRequest[Symbol("metadata")][Symbol("trigger")] = Dict{Symbol, Any}(
            Symbol("trigger_type") => selectedType,
            Symbol("tpsl") => Dict{Symbol, Any}(
                Symbol("trigger_by") => triggerPriceType,
                Symbol("trigger_price") => selectedPrice,
                Symbol("close_position") => self.safeBool(params, "closePosition", defaultValue = false)
            )
        );
        params = omit(params, ["triggerDirection", "triggerPriceType", "closePosition"]);
    end
    eipType = "EIP712_ORDER_TYPE";
    builderFee = self.safeBool(params, "builderFee", defaultValue = self.safeBool(self.options, "builderFee", defaultValue = true));
    if functions.ccxtruthy(builderFee)
        eipType = "EIP712_ORDER_WITH_BUILDER_TYPE";
        orderRequest[Symbol("builder")] = safeString(self.options, "builder");
        orderRequest[Symbol("builder_fee")] = safeString(self.options, "builderRate");
    end
    params = omit(params, ["builderFee"]);
    signedOrderRequest = self.createSignedRequest(orderRequest, eipType);
    request = Dict{Symbol, Any}(
        Symbol("order") => signedOrderRequest
    );
    response = Base.fetch(self.privateTradingPostFullV1CreateOrder(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function convertToBigIntCustom(self::Grvt, x)
    return ccxt_parseInt(x)

end
function eipMessageForOrder(self::Grvt, order, structureType)
    priceMultiplier = "1000000000";
    orderLegs = self.safeList(order, "legs", defaultValue = []);
    legs = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderLegs)))
        leg = get(orderLegs, i + 1, nothing);
        market = self.market(get(leg, Symbol("instrument"), nothing));
        bigInt10 = self.convertToBigIntCustom("10");
        precisionValue = precisionFromString(safeString(get(market, Symbol("precision"), nothing), "base"));
        precisionValueStr = string(precisionValue);
        sizeMultiplier = pow(bigInt10, self.convertToBigIntCustom(precisionValueStr));
        size_var = get(leg, Symbol("size"), nothing);
        sizeParts = split(size_var, ".");
        sizeDec = safeString(sizeParts, 1, "");
        sizeDecLength = length(sizeDec) + 0;
        sizeDecLengthStr = string(sizeDecLength);
        sizeInteger = self.convertToBigIntCustom(replace(size_var, "." => "")) * sizeMultiplier / (pow(bigInt10, self.convertToBigIntCustom(sizeDecLengthStr)));
        legOrder = Dict{Symbol, Any}(
            Symbol("assetID") => get(get(market, Symbol("info"), nothing), Symbol("instrument_hash"), nothing),
            Symbol("contractSize") => self.parseToInt(sizeInteger),
            Symbol("isBuyingContract") => get(leg, Symbol("is_buying_asset"), nothing)
        );
        limitPrice = safeString(leg, "limit_price");
        if functions.ccxtruthy(omitZero(limitPrice) != nothing)
            price = get(leg, Symbol("limit_price"), nothing);
            limitParts = split(price, ".");
            limitDec = safeString(limitParts, 1, "");
            limitDecLength = length(limitDec) + 0;
            limitDecLengthStr = string(limitDecLength);
            powerNum = functions.ccxtruthy((limitDecLengthStr == "0")) ? 0 : self.convertToBigIntCustom(limitDecLengthStr);
            priceInteger = (self.convertToBigIntCustom(replace(price, "." => "")) * self.convertToBigIntCustom(priceMultiplier) / (pow(bigInt10, powerNum)));
            legOrder[Symbol("limitPrice")] = self.parseToInt(priceInteger);
        else
            legOrder[Symbol("limitPrice")] = 0;
        end
        push!(legs, legOrder);
        i += 1
    end
    returnValue = Dict{Symbol, Any}(
        Symbol("subAccountID") => get(order, Symbol("sub_account_id"), nothing),
        Symbol("isMarket") => get(order, Symbol("is_market"), nothing),
        Symbol("timeInForce") => self.timeInForceToInt(get(order, Symbol("time_in_force"), nothing)),
        Symbol("postOnly") => get(order, Symbol("post_only"), nothing),
        Symbol("reduceOnly") => get(order, Symbol("reduce_only"), nothing),
        Symbol("legs") => legs,
        Symbol("nonce") => get(get(order, Symbol("signature"), nothing), Symbol("nonce"), nothing),
        Symbol("expiration") => get(get(order, Symbol("signature"), nothing), Symbol("expiration"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_and(structureType == "EIP712_ORDER_WITH_BUILDER_TYPE", self.safeBool(self.options, "builderFee", defaultValue = true)))
        returnValue[Symbol("builder")] = get(order, Symbol("builder"), nothing);
        returnValue[Symbol("builderFee")] = self.parseToInt(self.convertToBigIntCustom(self.feeAmountMultiplier()) * ccxt_toNumber(get(order, Symbol("builder_fee"), nothing)));
    end
    return returnValue

end
"""
fetch all trades made by the user
see: https://api-docs.grvt.io/trading_api/#fill-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Grvt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("base")] = [];
                push!(get(request, Symbol("base"), nothing), get(market, Symbol("baseId"), nothing));
        request[Symbol("quote")] = [];
                push!(get(request, Symbol("quote"), nothing), get(market, Symbol("quoteId"), nothing));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1FillHistory(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseTrades(result, market = nothing, since = since, limit = limit)

end
"""
fetch all open positions
see: https://api-docs.grvt.io/trading_api/#positions-request

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Grvt; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        request[Symbol("base")] = [];
        request[Symbol("quote")] = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            market = self.market(symbol);
            if functions.ccxtruthy(get(market, Symbol("contract"), nothing) != true)
                throw(BadRequest(string(self.id, " fetchPositions() supports contract markets only")));
            end
            push!(get(request, Symbol("base"), nothing), get(market, Symbol("baseId"), nothing));
            push!(get(request, Symbol("quote"), nothing), get(market, Symbol("quoteId"), nothing));
            i += 1
        end

    end
    response = Base.fetch(self.privateTradingPostFullV1Positions(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parsePositions(result, symbols = symbols)

end
function parsePosition(self::Grvt, position; market=nothing)
    marketId = safeString(position, "instrument");
    timestamp = safeIntegerProduct(position, "event_time", 0.000001);
    sizeRaw = safeString(position, "size");
    isLong = (stringGe(sizeRaw, "0"));
    side = functions.ccxtruthy(isLong) ? "long" : "short";
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("notional") => self.parseNumber(stringAbs(safeString(position, "notional"))),
    Symbol("marginMode") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "est_liquidation_price"),
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_pnl"),
    Symbol("realizedPnl") => self.safeNumber(position, "realized_pnl"),
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.parseNumber(stringAbs(sizeRaw)),
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("lastPrice") => nothing,
    Symbol("side") => side,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "lastUpdateTime"),
    Symbol("maintenanceMargin") => self.safeNumber(position, "maintenanceMargin"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "initialMargin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
fetch the set leverage for all contract markets
see: https://api-docs.grvt.io/trading_api/#get-all-initial-leverage

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Grvt; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1GetAllInitialLeverage(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    return self.parseLeverages(results, symbols = symbols)

end
"""
set the level of leverage for a market
see: https://api-docs.grvt.io/trading_api/#set-initial-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Grvt, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    Base.fetch(self.loadMarketsAndSignIn());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params),
        Symbol("instrument") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => numberToString(leverage)
    );
    response = Base.fetch(self.privateTradingPostFullV1SetInitialLeverage(extend(request, params)));
    return self.parseLeverage(response, market = market)

end
function parseLeverage(self::Grvt, leverage; market=nothing)
    marketId = safeString(leverage, "instrument");
    leverageValue = self.safeNumber(leverage, "leverage");
    marginType = safeStringLower(leverage, "margin_type");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => marginType,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
fetches margin mode of the user
see: https://api-docs.grvt.io/trading_api/#get-all-initial-leverage

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginModes(self::Grvt; symbols=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1GetAllInitialLeverage(extend(request, params)));
    results = self.safeList(response, "results", defaultValue = []);
    return self.parseLeverages(results, symbols = symbols)

end
function parseMarginMode(self::Grvt, marginMode; market=nothing)
    marketId = safeString(marginMode, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => safeStringLower(marginMode, "margin_type")
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://api-docs.grvt.io/trading_api/#funding-payment-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Grvt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 1000))
    end
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("base")] = [];
                push!(get(request, Symbol("base"), nothing), get(market, Symbol("baseId"), nothing));
        request[Symbol("quote")] = [];
                push!(get(request, Symbol("quote"), nothing), get(market, Symbol("quoteId"), nothing));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1FundingPaymentHistory(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseIncomes(result, market = market, since = since, limit = limit)

end
function parseIncome(self::Grvt, income; market=nothing)
    marketId = safeString(income, "instrument");
    currencyId = safeString(income, "currency");
    timestamp = safeIntegerProduct(income, "event_time", 0.000001);
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "tx_id"),
    Symbol("amount") => self.safeNumber(income, "amount")
)

end
"""
fetches information on multiple orders made by the user
see: https://api-docs.grvt.io/trading_api/#order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Grvt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    subAccountId = self.getSubAccountId(params);
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => subAccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("base")] = [];
                push!(get(request, Symbol("base"), nothing), get(market, Symbol("baseId"), nothing));
        request[Symbol("quote")] = [];
                push!(get(request, Symbol("quote"), nothing), get(market, Symbol("quoteId"), nothing));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    (request, params) = self.handleUntilOptionString("end_time", request, params, multiplier = 1000000);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = numberToString(since * 1000000);
    end
    response = Base.fetch(self.privateTradingPostFullV1OrderHistory(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://api-docs.grvt.io/trading_api/#open-orders

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Grvt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    response = Base.fetch(self.privateTradingPostFullV1OpenOrders(extend(request, params)));
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = nothing, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://api-docs.grvt.io/trading_api/#get-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Grvt, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    subAccountId = self.getSubAccountId(params);
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => subAccountId
    );
    clientOrderId = safeString2(params, "clientOrderId", "client_order_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId", "client_order_id");
        request[Symbol("client_order_id")] = clientOrderId;
    else
        request[Symbol("order_id")] = id;
    end
    response = Base.fetch(self.privateTradingPostFullV1Order(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function parseOrder(self::Grvt, order; market=nothing)
    if functions.ccxtruthy(ccxt_in("ack", order))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => nothing
))
    end
    isMarket = self.safeBool(order, "is_market");
    orderType = functions.ccxtruthy(isMarket) ? "market" : "limit";
    isPostOnly = self.safeBool(order, "post_only");
    isReduceOnly = self.safeBool(order, "reduce_only");
    timeInForceRaw = safeString(order, "time_in_force");
    timeInForce = functions.ccxtruthy(isPostOnly) ? "PO" : self.parseTimeInForce(timeInForceRaw);
    size_var = nothing;
    side = nothing;
    price = nothing;
    filled = nothing;
    avgPrice = nothing;
    legs = self.safeList(order, "legs", defaultValue = []);
    metadata = self.safeDict(order, "metadata", defaultValue = Dict{Symbol, Any}());
    stateObj = self.safeDict(order, "state", defaultValue = Dict{Symbol, Any}());
    filledAmounts = self.safeList(stateObj, "traded_size", defaultValue = []);
    avgPrices = self.safeList(stateObj, "avg_fill_price", defaultValue = []);
    primaryOrderIndex = 0;
    firstLeg = self.safeDict(legs, primaryOrderIndex);
    if functions.ccxtruthy(firstLeg != nothing)
        marketId = safeString(firstLeg, "instrument");
        market = self.safeMarket(marketId = marketId, market = market);
        size_var = safeString(firstLeg, "size");
        side = functions.ccxtruthy(self.safeBool(firstLeg, "is_buying_asset")) ? "buy" : "sell";
        price = safeString(firstLeg, "limit_price");
        filled = safeString(filledAmounts, primaryOrderIndex);
        avgPrice = safeString(avgPrices, primaryOrderIndex);
    end
    timestamp = safeIntegerProduct(metadata, "create_time", 0.000001);
    legsLength = length(legs);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("isMultiLeg") => (functions.ccxt_gt(legsLength, 1)),
    Symbol("id") => safeString(order, "order_id"),
    Symbol("clientOrderId") => safeString(metadata, "client_order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimeStamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeIntegerProduct(stateObj, "update_time", 0.000001),
    Symbol("status") => self.parseOrderStatus(safeString(stateObj, "status")),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => orderType,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => isPostOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => avgPrice,
    Symbol("amount") => size_var,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fees") => nothing,
    Symbol("reduceOnly") => isReduceOnly,
    Symbol("info") => order
), market = market)

end
function parseTimeInForce(self::Grvt, type_var)
    types = Dict{Symbol, Any}(
        Symbol("GOOD_TILL_TIME") => "GTC",
        Symbol("IMMEDIATE_OR_CANCEL") => "IOC",
        Symbol("FILL_OR_KILL") => "FOK",
        Symbol("ALL_OR_NONE") => "ALL_OR_NONE",
        Symbol("RETAIL_PRICE_IMPROVEMENT") => "RETAIL_PRICE_IMPROVEMENT"
    );
    return safeStringUpper(types, type_var, type_var)

end
function timeInForceToInt(self::Grvt, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GOOD_TILL_TIME") => 1,
        Symbol("ALL_OR_NONE") => 2,
        Symbol("IMMEDIATE_OR_CANCEL") => 3,
        Symbol("FILL_OR_KILL") => 4,
        Symbol("RETAIL_PRICE_IMPROVEMENT") => 5
    );
    return safeInteger(timeInForces, timeInForce, 0)

end
function parseOrderStatus(self::Grvt, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING") => "pending",
        Symbol("OPEN") => "open",
        Symbol("FILLED") => "closed",
        Symbol("REJECTED") => "rejected",
        Symbol("CANCELLED") => "canceled"
    );
    return safeString(statuses, status, status)

end
"""
cancel all open orders in a market
see: https://api-docs.grvt.io/trading_api/#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Grvt; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => self.getSubAccountId(params)
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("base")] = [];
                push!(get(request, Symbol("base"), nothing), get(market, Symbol("baseId"), nothing));
        request[Symbol("quote")] = [];
                push!(get(request, Symbol("quote"), nothing), get(market, Symbol("quoteId"), nothing));
    end
    response = Base.fetch(self.privateTradingPostFullV1CancelAllOrders(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrders([result])

end
"""
cancels an open order
see: https://api-docs.grvt.io/trading_api/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Grvt, id; symbol=nothing, params=Dict())
    Base.fetch(self.loadMarketsAndSignIn());
    subAccoubntId = self.getSubAccountId(params);
    request = Dict{Symbol, Any}(
        Symbol("sub_account_id") => subAccoubntId
    );
    clientOrderId = safeString2(params, "clientOrderId", "client_order_id");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, "clientOrderId");
        request[Symbol("client_order_id")] = clientOrderId;
    else
        request[Symbol("order_id")] = id;
    end
    response = Base.fetch(self.privateTradingPostFullV1CancelOrder(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result)

end
function eipDomainData(self::Grvt, )
    return Dict{Symbol, Any}(
    Symbol("name") => "GRVT Exchange",
    Symbol("version") => "0",
    Symbol("chainId") => functions.ccxtruthy(self.isSandboxModeEnabled) ? 326 : 325
)

end
function feeAmountMultiplier(self::Grvt, )
    return self.convertToBigIntCustom("10000")

end
function createSignedRequest(self::Grvt, request, structureType; currencyObj=nothing, signerAddress=nothing)
    messageData = nothing;
    if functions.ccxtruthy(structureType == "EIP712_TRANSFER_TYPE")
        amountMultiplier = self.convertToBigIntCustom("1000000");
        amountInt = get(request, Symbol("num_tokens"), nothing) * amountMultiplier;
        if functions.ccxtruthy(currencyObj == nothing)
            throw(ExchangeError(string(self.id, " createSignedRequest() missing currencyObj")));
        end
        messageData = Dict{Symbol, Any}(
            Symbol("fromAccount") => get(request, Symbol("from_account_id"), nothing),
            Symbol("fromSubAccount") => get(request, Symbol("from_sub_account_id"), nothing),
            Symbol("toAccount") => get(request, Symbol("to_account_id"), nothing),
            Symbol("toSubAccount") => get(request, Symbol("to_sub_account_id"), nothing),
            Symbol("tokenCurrency") => get(currencyObj, Symbol("numericId"), nothing),
            Symbol("numTokens") => self.parseToInt(amountInt),
            Symbol("nonce") => get(get(request, Symbol("signature"), nothing), Symbol("nonce"), nothing),
            Symbol("expiration") => get(get(request, Symbol("signature"), nothing), Symbol("expiration"), nothing)
        );
    elseif functions.ccxtruthy(structureType == "EIP712_WITHDRAWAL_TYPE")
        amountMultiplier = self.convertToBigIntCustom("1000000");
        if functions.ccxtruthy(currencyObj == nothing)
            throw(ExchangeError(string(self.id, " createSignedRequest() missing currencyObj")));
        end
        messageData = Dict{Symbol, Any}(
            Symbol("fromAccount") => get(request, Symbol("from_account_id"), nothing),
            Symbol("toEthAddress") => get(request, Symbol("to_eth_address"), nothing),
            Symbol("tokenCurrency") => get(currencyObj, Symbol("numericId"), nothing),
            Symbol("numTokens") => self.parseToInt(get(request, Symbol("num_tokens"), nothing) * amountMultiplier),
            Symbol("nonce") => get(get(request, Symbol("signature"), nothing), Symbol("nonce"), nothing),
            Symbol("expiration") => get(get(request, Symbol("signature"), nothing), Symbol("expiration"), nothing)
        );
    else
        if functions.ccxtruthy(@functions.ccxt_or(structureType == "EIP712_ORDER_TYPE", structureType == "EIP712_ORDER_WITH_BUILDER_TYPE"))
            messageData = self.eipMessageForOrder(request, structureType);
        elseif functions.ccxtruthy(structureType == "EIP712_BUILDER_APPROVAL_TYPE")
            amountMultiplier = self.convertToBigIntCustom(self.feeAmountMultiplier());
            messageData = Dict{Symbol, Any}(
                Symbol("mainAccountID") => get(request, Symbol("main_account_id"), nothing),
                Symbol("builderAccountID") => get(request, Symbol("builder_account_id"), nothing),
                Symbol("maxFutureFeeRate") => self.parseToInt(ccxt_toNumber(get(request, Symbol("max_futures_fee_rate"), nothing)) * amountMultiplier),
                Symbol("maxSpotFeeRate") => self.parseToInt(ccxt_toNumber(get(request, Symbol("max_spot_fee_rate"), nothing)) * amountMultiplier),
                Symbol("nonce") => get(get(request, Symbol("signature"), nothing), Symbol("nonce"), nothing),
                Symbol("expiration") => get(get(request, Symbol("signature"), nothing), Symbol("expiration"), nothing)
            );
        else
            if functions.ccxtruthy(structureType == "EIP712_WALLETLOGIN_TYPE")
                messageData = Dict{Symbol, Any}(
                    Symbol("signer") => get(request, Symbol("address"), nothing),
                    Symbol("nonce") => get(get(request, Symbol("signature"), nothing), Symbol("nonce"), nothing),
                    Symbol("expiration") => get(get(request, Symbol("signature"), nothing), Symbol("expiration"), nothing)
                );
            end

        end

    end
    domainData = self.eipDomainData();
    definitions = self.eipDefinitions();
    ethEncodedMessage = self.ethEncodeStructuredData(domainData, get(definitions, Symbol(structureType), nothing), messageData);
    ethEncodedMessageHashed = string("0x", hash(ethEncodedMessage, keccak, "hex"));
    usesPrivKey = self.usesPrivateKey();
    secretOrPrivkey = functions.ccxtruthy(usesPrivKey) ? self.privateKey : self.secret;
    privateKeyWithoutZero = self.remove0xPrefix(secretOrPrivkey);
    signature = ecdsa(self.remove0xPrefix(ethEncodedMessageHashed), privateKeyWithoutZero, secp256k1, nothing);
    request[Symbol("signature")][Symbol("r")] = self.formatSignatureRS(get(signature, Symbol("r"), nothing));
    request[Symbol("signature")][Symbol("s")] = self.formatSignatureRS(get(signature, Symbol("s"), nothing));
    request[Symbol("signature")][Symbol("v")] = self.sum(27, get(signature, Symbol("v"), nothing));
    request[Symbol("signature")][Symbol("signer")] = functions.ccxtruthy((signerAddress == nothing)) ? self.ethGetAddressFromPrivateKey(string("0x", privateKeyWithoutZero)) : signerAddress;
    return request

end
function formatSignatureRS(self::Grvt, value)
    padded = lpad(value, 64, "0");
    if functions.ccxtruthy(startswith(padded, "0x"))
            return padded
    else
        return string("0x", padded)
    end

end
function defaultSignature(self::Grvt, )
    expiration = milliseconds() * 1000000 + 1000000 * safeInteger(self.options, "expirationSeconds", 30) * 1000;
    return Dict{Symbol, Any}(
    Symbol("signer") => "",
    Symbol("r") => "",
    Symbol("s") => "",
    Symbol("v") => 0,
    Symbol("expiration") => string(expiration),
    Symbol("nonce") => self.nonce(),
    Symbol("chain_id") => functions.ccxtruthy(self.isSandboxModeEnabled) ? "326" : "325"
)

end
function handleUntilOptionString(self::Grvt, key, request, params; multiplier=1)
    until = safeInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol(key)] = numberToString(self.parseToInt(until * multiplier));
        params = omit(params, ["until", "till"]);
    end
    return [request, params]

end
function requestId(self::Grvt, )
    requestId = self.sum(safeInteger(self.options, "requestId", 0), 1);
    self.options[Symbol("requestId")] = requestId;
    return requestId

end
function sign(self::Grvt, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing) + path;
    queryString = "";
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            queryString = self.urlencode(query);
            url += string("?", queryString);
        end
    elseif functions.ccxtruthy(method == "POST")
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json"
        );
        paramsKeys = objectKeys(params);
        paramsKeysLength = length(paramsKeys);
        if functions.ccxtruthy(paramsKeysLength == 0)
            body = "{}";
        else
            body = json(params);
        end
    end
    isPrivate = startswith(api, "private");
    if functions.ccxtruthy(isPrivate)
        self.checkRequiredCredentials();
        if functions.ccxtruthy(queryString != "")
            path = string(path, "?", queryString);
        end
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json"
        );
        if functions.ccxtruthy(@functions.ccxt_or(endswith(path, "auth/api_key/login"), endswith(path, "auth/wallet/login")))
            headers[Symbol("Cookie")] = "rm=true;";
        else
            accountId = safeString(self.options, "AuthAccountId");
            cookieValue = safeString(self.options, "AuthCookieValue");
            if functions.ccxtruthy(@functions.ccxt_or(cookieValue == nothing, accountId == nothing))
                throw(AuthenticationError(string(self.id, " : at first, you need to authenticate with exchange using signIn() method.")));
            end
            headers[Symbol("Cookie")] = cookieValue;
            headers[Symbol("X-Grvt-Account-Id")] = accountId;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Grvt, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or(endswith(url, "auth/api_key/login"), endswith(url, "auth/wallet/login")))
        accountId = safeString2(headers, "X-Grvt-Account-Id", "x-grvt-account-id");
        self.options[Symbol("AuthAccountId")] = accountId;
        cookie = safeString2(headers, "Set-Cookie", "set-cookie");
        if functions.ccxtruthy(cookie != nothing)
            cookieValue = get(split(cookie, ";"), 1, nothing);
            self.options[Symbol("AuthCookieValue")] = cookieValue;
        end
        if functions.ccxtruthy(@functions.ccxt_or(get(self.options, Symbol("AuthCookieValue"), nothing) == nothing, get(self.options, Symbol("AuthAccountId"), nothing) == nothing))
            throw(AuthenticationError(string(self.id, " signIn() failed to receive auth-cookie or account-id")));
        end
    else
        errorCode = safeString(response, "code");
        if functions.ccxtruthy(errorCode != nothing)
            feedback = string(self.id, " ", body);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
            throw(ExchangeError(feedback));
        else
            message = safeString(response, "message");
            if functions.ccxtruthy(message != nothing)
                feedback = string(self.id, " ", body);
                self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
                throw(ExchangeError(feedback));
            else
                status = safeString(response, "status");
                if functions.ccxtruthy(@functions.ccxt_and(status != nothing, status != "success"))
                    feedback = string(self.id, " ", body);
                    throw(ExchangeError(feedback));
                end
            end
        end
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Grvt, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function privateEdgePostAuthApiKeyLogin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "auth/api_key/login"; api="privateEdge", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEdgePostAuthWalletLogin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "auth/wallet/login"; api="privateEdge", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Instrument(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/instrument"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1AllInstruments(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/all_instruments"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Instruments(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/instruments"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Currency(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/currency"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1MarginRules(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/margin_rules"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Mini(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/mini"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Ticker(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/ticker"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Book(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/book"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Trade(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/trade"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1TradeHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/trade_history"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Kline(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/kline"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarketPostFullV1Funding(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding"; api="publicMarket", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1CreateOrder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/create_order"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1CancelOrder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_order"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1CancelOnDisconnect(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_on_disconnect"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1CancelAllOrders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/cancel_all_orders"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1Order(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/order"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1OrderHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/order_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1OpenOrders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/open_orders"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1FillHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/fill_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1Positions(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/positions"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1FundingPaymentHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding_payment_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1GetSubAccounts(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_sub_accounts"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1AccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/account_summary"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1AccountHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/account_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1AggregatedAccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/aggregated_account_summary"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1FundingAccountSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/funding_account_summary"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1Transfer(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/transfer"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1DepositHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/deposit_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1TransferHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/transfer_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1Withdrawal(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/withdrawal"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1WithdrawalHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/withdrawal_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1AddPositionMargin(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/add_position_margin"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1GetPositionMarginLimits(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_position_margin_limits"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1SetPositionConfig(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_position_config"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1SetInitialLeverage(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_initial_leverage"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1GetAllInitialLeverage(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_all_initial_leverage"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1SetDeriskMmRatio(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/set_derisk_mm_ratio"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultBurnTokens(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_burn_tokens"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultInvest(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_invest"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultInvestorSummary(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_investor_summary"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultRedeem(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_redeem"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultRedeemCancel(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_redeem_cancel"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultViewRedemptionQueue(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_view_redemption_queue"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1VaultManagerInvestorHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/vault_manager_investor_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1AuthorizeBuilder(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/authorize_builder"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1GetAuthorizedBuilders(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/get_authorized_builders"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTradingPostFullV1BuilderFillHistory(self::Grvt, params=Dict(), context=Dict())
    return request(self, "full/v1/builder_fill_history"; api="privateTrading", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Grvt(; kwargs...)
    inst = Grvt(Exchange(), describe, eipDefinitions, usesPrivateKey, signIn, signInWithApiKey, signInWithPrivateKey, initializeClient, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchTicker, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchFundingRateHistory, parseFundingRateHistory, getSubAccountId, fetchBalance, parseBalance, fetchDeposits, fetchWithdrawals, internalFetchTransfers, parseTransaction, fetchTransfers, filterTransfersByType, transfer, parseTransfer, loadAccountInfos, withdraw, createOrder, convertToBigIntCustom, eipMessageForOrder, fetchMyTrades, fetchPositions, parsePosition, fetchLeverages, setLeverage, parseLeverage, fetchMarginModes, parseMarginMode, fetchFundingHistory, parseIncome, fetchOrders, fetchOpenOrders, fetchOrder, parseOrder, parseTimeInForce, timeInForceToInt, parseOrderStatus, cancelAllOrders, cancelOrder, eipDomainData, feeAmountMultiplier, createSignedRequest, formatSignatureRS, defaultSignature, handleUntilOptionString, requestId, sign, handleErrors, privateEdgePostAuthApiKeyLogin, privateEdgePostAuthWalletLogin, publicMarketPostFullV1Instrument, publicMarketPostFullV1AllInstruments, publicMarketPostFullV1Instruments, publicMarketPostFullV1Currency, publicMarketPostFullV1MarginRules, publicMarketPostFullV1Mini, publicMarketPostFullV1Ticker, publicMarketPostFullV1Book, publicMarketPostFullV1Trade, publicMarketPostFullV1TradeHistory, publicMarketPostFullV1Kline, publicMarketPostFullV1Funding, privateTradingPostFullV1CreateOrder, privateTradingPostFullV1CancelOrder, privateTradingPostFullV1CancelOnDisconnect, privateTradingPostFullV1CancelAllOrders, privateTradingPostFullV1Order, privateTradingPostFullV1OrderHistory, privateTradingPostFullV1OpenOrders, privateTradingPostFullV1FillHistory, privateTradingPostFullV1Positions, privateTradingPostFullV1FundingPaymentHistory, privateTradingPostFullV1GetSubAccounts, privateTradingPostFullV1AccountSummary, privateTradingPostFullV1AccountHistory, privateTradingPostFullV1AggregatedAccountSummary, privateTradingPostFullV1FundingAccountSummary, privateTradingPostFullV1Transfer, privateTradingPostFullV1DepositHistory, privateTradingPostFullV1TransferHistory, privateTradingPostFullV1Withdrawal, privateTradingPostFullV1WithdrawalHistory, privateTradingPostFullV1AddPositionMargin, privateTradingPostFullV1GetPositionMarginLimits, privateTradingPostFullV1SetPositionConfig, privateTradingPostFullV1SetInitialLeverage, privateTradingPostFullV1GetAllInitialLeverage, privateTradingPostFullV1SetDeriskMmRatio, privateTradingPostFullV1VaultBurnTokens, privateTradingPostFullV1VaultInvest, privateTradingPostFullV1VaultInvestorSummary, privateTradingPostFullV1VaultRedeem, privateTradingPostFullV1VaultRedeemCancel, privateTradingPostFullV1VaultViewRedemptionQueue, privateTradingPostFullV1VaultManagerInvestorHistory, privateTradingPostFullV1AuthorizeBuilder, privateTradingPostFullV1GetAuthorizedBuilders, privateTradingPostFullV1BuilderFillHistory)
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
function __ccxt_doc_Grvt_signIn() end
"""
sign in, must be called prior to using other authenticated methods
see: https://api-docs.grvt.io/#authentication

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from exchange
"""
__ccxt_doc_Grvt_signIn

function __ccxt_doc_Grvt_fetchMarkets() end
"""
retrieves data on all markets
see: https://api-docs.grvt.io/market_data_api/#get-instrument-prod

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Grvt_fetchMarkets

function __ccxt_doc_Grvt_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://api-docs.grvt.io/market_data_api/#get-currency-response

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Grvt_fetchCurrencies

function __ccxt_doc_Grvt_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://api-docs.grvt.io/market_data_api/#ticker_1

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Grvt_fetchTicker

function __ccxt_doc_Grvt_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://api-docs.grvt.io/market_data_api/#orderbook-levels

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.loc`::string, optional: crypto location, default: us

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Grvt_fetchOrderBook

function __ccxt_doc_Grvt_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://api-docs.grvt.io/market_data_api/#trade_1

# Arguments
- `symbol`::string: unified symbol of the market
- `since`::int, optional: timestamp in ms of the earliest item to fetch
- `limit`::int, optional: the maximum amount of items to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Grvt_fetchTrades

function __ccxt_doc_Grvt_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://api-docs.grvt.io/market_data_api/#candlestick_1

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest item to fetch
- `limit`::int, optional: the maximum amount of items to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is the current time
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Grvt_fetchOHLCV

function __ccxt_doc_Grvt_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://api-docs.grvt.io/market_data_api/#funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Grvt_fetchFundingRateHistory

function __ccxt_doc_Grvt_fetchBalance() end
"""
query for account info
see: https://api-docs.grvt.io/trading_api/#sub-account-summary

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Grvt_fetchBalance

function __ccxt_doc_Grvt_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://api-docs.grvt.io/trading_api/#transfer

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Grvt_fetchDeposits

function __ccxt_doc_Grvt_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://api-docs.grvt.io/trading_api/#withdrawal-history

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Grvt_fetchWithdrawals

function __ccxt_doc_Grvt_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://api-docs.grvt.io/trading_api/#transfer-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: whether to paginate the results (default false)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Grvt_fetchTransfers

function __ccxt_doc_Grvt_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://api-docs.grvt.io/trading_api/#transfer_1

# Arguments
- `code`::string: unified currency codeåå
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Grvt_transfer

function __ccxt_doc_Grvt_withdraw() end
"""
make a withdrawal
see: https://api-docs.grvt.io/trading_api/#withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string: the network to withdraw on (mandatory)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Grvt_withdraw

function __ccxt_doc_Grvt_createOrder() end
"""
create a trade order
see: https://api-docs.grvt.io/trading_api/#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price a take profit order is triggered at
- `params.timeInForce`::string, optional: "GTC", "IOC", or "POST_ONLY"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: Ensures that the executed order does not flip the opened position.
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_createOrder

function __ccxt_doc_Grvt_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://api-docs.grvt.io/trading_api/#fill-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Grvt_fetchMyTrades

function __ccxt_doc_Grvt_fetchPositions() end
"""
fetch all open positions
see: https://api-docs.grvt.io/trading_api/#positions-request

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Grvt_fetchPositions

function __ccxt_doc_Grvt_fetchLeverages() end
"""
fetch the set leverage for all contract markets
see: https://api-docs.grvt.io/trading_api/#get-all-initial-leverage

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Grvt_fetchLeverages

function __ccxt_doc_Grvt_setLeverage() end
"""
set the level of leverage for a market
see: https://api-docs.grvt.io/trading_api/#set-initial-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Grvt_setLeverage

function __ccxt_doc_Grvt_fetchMarginModes() end
"""
fetches margin mode of the user
see: https://api-docs.grvt.io/trading_api/#get-all-initial-leverage

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Grvt_fetchMarginModes

function __ccxt_doc_Grvt_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://api-docs.grvt.io/trading_api/#funding-payment-history

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Grvt_fetchFundingHistory

function __ccxt_doc_Grvt_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://api-docs.grvt.io/trading_api/#order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest item

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_fetchOrders

function __ccxt_doc_Grvt_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://api-docs.grvt.io/trading_api/#open-orders

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_fetchOpenOrders

function __ccxt_doc_Grvt_fetchOrder() end
"""
fetches information on an order made by the user
see: https://api-docs.grvt.io/trading_api/#get-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_fetchOrder

function __ccxt_doc_Grvt_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://api-docs.grvt.io/trading_api/#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_cancelAllOrders

function __ccxt_doc_Grvt_cancelOrder() end
"""
cancels an open order
see: https://api-docs.grvt.io/trading_api/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Grvt_cancelOrder
